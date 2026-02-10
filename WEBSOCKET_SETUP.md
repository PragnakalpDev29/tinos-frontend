# WebSocket Setup Guide

## Overview
The application uses WebSocket connections for real-time job status updates. When a preprocessing job is submitted and processed, the status changes (SUBMITTED → PENDING → RUNNABLE → STARTING → RUNNING → SUCCEEDED/FAILED) are automatically pushed to the frontend without requiring page refreshes.

## Frontend Implementation

### Components with WebSocket Integration

1. **Dashboard** (`/dashboard`)
   - Displays all jobs in a table
   - Real-time status updates for all jobs
   - Connection status indicator (Live Updates / Offline)

2. **Job Details Page** (`/dashboard/jobs/[id]`)
   - Shows detailed information for a specific job
   - Real-time status updates for the current job
   - Connection status indicator

### WebSocket Hook

The `useJobStatusWebSocket` hook (`src/hooks/use-job-status-websocket.ts`) provides:

- **Auto-connect**: Automatically connects on component mount
- **Auto-reconnect**: Attempts to reconnect up to 5 times with 3-second intervals
- **Error handling**: Tracks connection errors and status
- **Message handling**: Parses and forwards job status updates

### Configuration

Set the WebSocket host in your environment variables:

```bash
# .env.local
NEXT_PUBLIC_WS_HOST=localhost:8000
```

For production:
```bash
NEXT_PUBLIC_WS_HOST=your-backend-domain.com
```

## Backend Requirements (Django)

### WebSocket Endpoint

The frontend expects a WebSocket endpoint at:
```
ws://your-host/ws/jobs/status/
```

### Message Format

The backend should send JSON messages in this format:

```json
{
  "job_id": "18049344-df6d-4bdc-a3f3-fba65bf4e42b",
  "status": "RUNNING",
  "updated_at": "2026-01-01 13:45:54.859904+05:30"
}
```

### Status Values

Valid status values:
- `SUBMITTED`
- `PENDING`
- `RUNNABLE`
- `STARTING`
- `RUNNING`
- `SUCCEEDED`
- `FAILED`

### Django Channels Setup

1. Install Django Channels:
```bash
pip install channels channels-redis
```

2. Update `settings.py`:
```python
INSTALLED_APPS = [
    # ...
    'channels',
]

ASGI_APPLICATION = 'your_project.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}
```

3. Create WebSocket Consumer (`job_submitter/consumers.py`):
```python
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class JobStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add(
            "job_status_updates",
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            "job_status_updates",
            self.channel_name
        )

    async def job_status_update(self, event):
        await self.send(text_data=json.dumps({
            'job_id': event['job_id'],
            'status': event['status'],
            'updated_at': event['updated_at'],
        }))
```

4. Create routing (`job_submitter/routing.py`):
```python
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/jobs/status/$', consumers.JobStatusConsumer.as_asgi()),
]
```

5. Update `asgi.py`:
```python
import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from job_submitter import routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            routing.websocket_urlpatterns
        )
    ),
})
```

6. Send status updates from your job processing code:
```python
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def update_job_status(job_id, status, updated_at):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "job_status_updates",
        {
            "type": "job_status_update",
            "job_id": job_id,
            "status": status,
            "updated_at": updated_at,
        }
    )
```

## Testing

### Manual Testing

1. Start your Django backend with WebSocket support
2. Start the Next.js frontend: `npm run dev`
3. Navigate to `/dashboard`
4. Check for "Live Updates" indicator (green = connected)
5. Submit a new job or trigger a status change
6. Watch the status update in real-time without refresh

### Connection States

- **Connected**: Green "Live Updates" badge with WiFi icon
- **Disconnected**: Gray "Offline" badge with WiFi-off icon
- **Error**: Error message displayed next to status indicator

## Troubleshooting

### WebSocket not connecting

1. Check `NEXT_PUBLIC_WS_HOST` environment variable
2. Verify Django Channels is running
3. Check browser console for WebSocket errors
4. Ensure Redis is running (if using Redis channel layer)

### Status updates not appearing

1. Verify message format matches expected structure
2. Check that `job_id` matches exactly
3. Ensure backend is sending to correct channel group
4. Check browser console for parsing errors

### Frequent disconnections

1. Increase `maxReconnectAttempts` in hook configuration
2. Check network stability
3. Verify WebSocket server timeout settings
4. Check for firewall/proxy issues blocking WebSocket connections
