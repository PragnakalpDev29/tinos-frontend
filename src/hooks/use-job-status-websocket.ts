'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// SECURITY: Production-safe logger — suppresses info logs in production
const logger = {
  log: (...args: any[]) => process.env.NODE_ENV === 'development' && console.log(...args),
  warn: (...args: any[]) => process.env.NODE_ENV === 'development' && console.warn(...args),
  error: (...args: any[]) => console.error(...args), // Always log errors
}

interface JobStatusUpdate {
  job_id: string
  status: 'SUBMITTED' | 'PENDING' | 'RUNNABLE' | 'STARTING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'
  updated_at: string
}

interface UseJobStatusWebSocketOptions {
  onStatusUpdate?: (update: JobStatusUpdate) => void
  autoConnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useJobStatusWebSocket({
  onStatusUpdate,
  autoConnect = true,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
}: UseJobStatusWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsHost = process.env.NEXT_PUBLIC_WS_HOST || 'localhost:8000'
      const wsUrl = `${wsProtocol}//${wsHost}/ws/jobs/status/`

      logger.log('Connecting to WebSocket:', wsUrl)

      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        logger.log('WebSocket connected')
        setIsConnected(true)
        setConnectionError(null)
        reconnectAttemptsRef.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as JobStatusUpdate
          logger.log('Received job status update:', data)
          if (onStatusUpdate) onStatusUpdate(data)
        } catch (error) {
          logger.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        setConnectionError('WebSocket connection error')
      }

      ws.onclose = (event) => {
        logger.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        wsRef.current = null

        // Attempt to reconnect if not a normal closure and within retry limits
        if (
          event.code !== 1000 &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current += 1
          logger.log(
            `Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionError('Max reconnection attempts reached')
        }
      }

      wsRef.current = ws
    } catch (error) {
      logger.error('Error creating WebSocket connection:', error)
      setConnectionError('Failed to create WebSocket connection')
    }
  }, [onStatusUpdate, reconnectInterval, maxReconnectAttempts])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnecting')
      wsRef.current = null
    }

    setIsConnected(false)
  }, [])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      logger.warn('WebSocket is not connected. Cannot send message.')
    }
  }, [])

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    sendMessage,
  }
}
