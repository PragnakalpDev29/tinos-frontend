# API Request Examples

This file contains practical examples of using Axios for client components and Fetch for server components.

## 📋 Table of Contents

1. [Client Component Examples (Axios)](#client-component-examples-axios)
2. [Server Component Examples (Fetch)](#server-component-examples-fetch)
3. [Service Layer Examples](#service-layer-examples)
4. [Real-World Use Cases](#real-world-use-cases)

---

## Client Component Examples (Axios)

### Example 1: Form Submission with Axios

```typescript
// components/features/dashboard/job-submission-form.tsx
'use client'

import { useState } from 'react'
import { axiosPost } from '@/lib/api/axios-client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { handleApiError } from '@/lib/api/error-handler'
import toast from 'react-hot-toast'

interface JobFormData {
  s3_rna_bam: string
  s3_deg_bam: string
  s3_output_bucket: string
}

export function JobSubmissionForm() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<JobFormData>({
    s3_rna_bam: '',
    s3_deg_bam: '',
    s3_output_bucket: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axiosPost(
        API_ENDPOINTS.JOBS.SUBMIT_PREPROCESSING,
        formData
      )
      
      toast.success(`Job submitted! ID: ${response.jobId}`)
      
      // Reset form
      setFormData({
        s3_rna_bam: '',
        s3_deg_bam: '',
        s3_output_bucket: '',
      })
    } catch (error) {
      handleApiError(error, true) // Shows toast automatically
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.s3_rna_bam}
        onChange={(e) => setFormData({ ...formData, s3_rna_bam: e.target.value })}
        placeholder="S3 RNA BAM path"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Job'}
      </button>
    </form>
  )
}
```

### Example 2: Real-time Data with SWR + Axios

```typescript
// components/features/dashboard/jobs-list.tsx
'use client'

import useSWR from 'swr'
import { axiosFetcher } from '@/lib/api/axios-client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

interface Job {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: string
}

export function JobsList() {
  const { data: jobs, error, isLoading, mutate } = useSWR<Job[]>(
    API_ENDPOINTS.JOBS.LIST,
    axiosFetcher,
    {
      refreshInterval: 10000, // Poll every 10 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  if (isLoading) return <JobsSkeleton />
  if (error) return <div>Failed to load jobs</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Your Jobs</h2>
        <button onClick={() => mutate()}>Refresh</button>
      </div>
      
      <div className="space-y-2">
        {jobs?.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}
```

### Example 3: Axios with NextAuth Session

```typescript
// components/features/dashboard/user-profile.tsx
'use client'

import { useEffect, useState } from 'react'
import useAxiosAuth from '@/lib/api/axios-auth'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

interface UserProfile {
  id: string
  email: string
  name: string
  role: string
}

export function UserProfile() {
  const { axiosAuth } = useAxiosAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Automatically includes session token
        const response = await axiosAuth.get(API_ENDPOINTS.AUTH.PROFILE)
        setProfile(response.data)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [axiosAuth])

  if (loading) return <div>Loading profile...</div>
  if (!profile) return <div>No profile found</div>

  return (
    <div>
      <h2>{profile.name}</h2>
      <p>{profile.email}</p>
      <span>{profile.role}</span>
    </div>
  )
}
```

### Example 4: File Upload with Progress

```typescript
// components/features/dashboard/file-upload.tsx
'use client'

import { useState } from 'react'
import { axiosClient } from '@/lib/api/axios-client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export function FileUpload() {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file: File) => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axiosClient.post(
        API_ENDPOINTS.FILES.UPLOAD,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            )
            setProgress(percentCompleted)
          },
        }
      )
      
      console.log('Upload complete:', response.data)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div>
      <input
        type="file"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && (
        <div>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <span>{progress}%</span>
        </div>
      )}
    </div>
  )
}
```

---

## Server Component Examples (Fetch)

### Example 1: Basic Server Component Data Fetching

```typescript
// app/jobs/page.tsx (Server Component - no 'use client')

import { fetchServer } from '@/lib/api/fetch-server'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

interface Job {
  id: string
  name: string
  status: string
}

async function getJobs(): Promise<Job[]> {
  return fetchServer<Job[]>(API_ENDPOINTS.JOBS.LIST)
}

export default async function JobsPage() {
  const jobs = await getJobs()
  
  return (
    <div>
      <h1>All Jobs</h1>
      <div className="grid gap-4">
        {jobs.map(job => (
          <div key={job.id} className="border p-4 rounded">
            <h3>{job.name}</h3>
            <span>{job.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Example 2: Parallel Data Fetching

```typescript
// app/dashboard/page.tsx

import { fetchServer } from '@/lib/api/fetch-server'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

async function getUser() {
  return fetchServer('/api/user/')
}

async function getJobs() {
  return fetchServer(API_ENDPOINTS.JOBS.LIST)
}

async function getAnalytics() {
  return fetchServer('/api/analytics/')
}

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [user, jobs, analytics] = await Promise.all([
    getUser(),
    getJobs(),
    getAnalytics(),
  ])
  
  return (
    <div>
      <UserHeader user={user} />
      <JobsSection jobs={jobs} />
      <AnalyticsSection analytics={analytics} />
    </div>
  )
}
```

### Example 3: ISR (Incremental Static Regeneration)

```typescript
// app/blog/page.tsx

import { fetchISR } from '@/lib/api/fetch-server'

interface BlogPost {
  id: string
  title: string
  content: string
  publishedAt: string
}

async function getBlogPosts(): Promise<BlogPost[]> {
  // Revalidate every 60 seconds
  return fetchISR<BlogPost[]>('/api/posts/', 60)
}

export default async function BlogPage() {
  const posts = await getBlogPosts()
  
  return (
    <div>
      <h1>Blog</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <time>{post.publishedAt}</time>
        </article>
      ))}
    </div>
  )
}
```

### Example 4: Tag-Based Revalidation

```typescript
// app/products/[id]/page.tsx

import { fetchWithTags } from '@/lib/api/fetch-server'

interface Product {
  id: string
  name: string
  price: number
  description: string
}

async function getProduct(id: string): Promise<Product> {
  // Tag for on-demand revalidation
  return fetchWithTags<Product>(
    `/api/products/${id}`,
    [`product-${id}`, 'products']
  )
}

export default async function ProductPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const product = await getProduct(params.id)
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>${product.price}</p>
      <p>{product.description}</p>
    </div>
  )
}

// Webhook to revalidate specific product
// POST /api/revalidate
// { "tag": "product-123" }
```

### Example 5: Streaming with Suspense

```typescript
// app/dashboard/page.tsx

import { Suspense } from 'react'
import { fetchServer } from '@/lib/api/fetch-server'

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Fast component shows first */}
      <Suspense fallback={<UserSkeleton />}>
        <UserSection />
      </Suspense>
      
      {/* Medium speed component */}
      <Suspense fallback={<JobsSkeleton />}>
        <JobsSection />
      </Suspense>
      
      {/* Slow component doesn't block others */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsSection />
      </Suspense>
    </div>
  )
}

async function UserSection() {
  const user = await fetchServer('/api/user/')
  return <div>Welcome, {user.name}!</div>
}

async function JobsSection() {
  const jobs = await fetchServer('/api/jobs/')
  return <div>You have {jobs.length} jobs</div>
}

async function AnalyticsSection() {
  const analytics = await fetchServer('/api/analytics/')
  return <div>Analytics: {analytics.totalViews} views</div>
}
```

---

## Service Layer Examples

### Job Service with Axios (Client)

```typescript
// lib/services/job.service.ts
'use client'

import { axiosGet, axiosPost, axiosDelete } from '@/lib/api/axios-client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export interface PreprocessingJobDto {
  s3_rna_bam: string
  s3_deg_bam: string
  s3_output_bucket: string
}

export interface JobResponse {
  jobId: string
  jobName: string
  status: string
}

export const jobService = {
  submitPreprocessingJob: async (data: PreprocessingJobDto): Promise<JobResponse> => {
    return axiosPost<JobResponse>(
      API_ENDPOINTS.JOBS.SUBMIT_PREPROCESSING,
      data
    )
  },

  getJobById: async (id: string): Promise<JobResponse> => {
    return axiosGet<JobResponse>(`${API_ENDPOINTS.JOBS.LIST}/${id}`)
  },

  deleteJob: async (id: string): Promise<void> => {
    return axiosDelete<void>(`${API_ENDPOINTS.JOBS.LIST}/${id}`)
  },

  getAllJobs: async (): Promise<JobResponse[]> => {
    return axiosGet<JobResponse[]>(API_ENDPOINTS.JOBS.LIST)
  },
}
```

### Job Service with Fetch (Server)

```typescript
// lib/services/job-server.service.ts

import { fetchServer, postServer, deleteServer } from '@/lib/api/fetch-server'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export interface PreprocessingJobDto {
  s3_rna_bam: string
  s3_deg_bam: string
  s3_output_bucket: string
}

export interface JobResponse {
  jobId: string
  jobName: string
  status: string
}

export const jobServerService = {
  submitPreprocessingJob: async (data: PreprocessingJobDto): Promise<JobResponse> => {
    return postServer<JobResponse>(
      API_ENDPOINTS.JOBS.SUBMIT_PREPROCESSING,
      data
    )
  },

  getJobById: async (id: string): Promise<JobResponse> => {
    return fetchServer<JobResponse>(`${API_ENDPOINTS.JOBS.LIST}/${id}`)
  },

  deleteJob: async (id: string): Promise<void> => {
    return deleteServer<void>(`${API_ENDPOINTS.JOBS.LIST}/${id}`)
  },

  getAllJobs: async (): Promise<JobResponse[]> => {
    return fetchServer<JobResponse[]>(API_ENDPOINTS.JOBS.LIST)
  },
}
```

---

## Real-World Use Cases

### Use Case 1: Job Submission Flow

```typescript
// Client Component: Form submission
// components/features/dashboard/preprocessing-job-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { jobService } from '@/lib/services/job.service'
import { handleApiError } from '@/lib/api/error-handler'
import toast from 'react-hot-toast'

export function PreprocessingJobForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    
    try {
      const result = await jobService.submitPreprocessingJob({
        s3_rna_bam: formData.get('s3_rna_bam') as string,
        s3_deg_bam: formData.get('s3_deg_bam') as string,
        s3_output_bucket: formData.get('s3_output_bucket') as string,
      })
      
      toast.success(`Job submitted successfully! ID: ${result.jobId}`)
      router.push(`/dashboard/jobs/${result.jobId}`)
    } catch (error) {
      handleApiError(error, true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Job'}
      </button>
    </form>
  )
}
```

```typescript
// Server Component: Display job details
// app/dashboard/jobs/[id]/page.tsx

import { jobServerService } from '@/lib/services/job-server.service'

export default async function JobDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const job = await jobServerService.getJobById(params.id)
  
  return (
    <div>
      <h1>Job: {job.jobName}</h1>
      <p>ID: {job.jobId}</p>
      <p>Status: {job.status}</p>
    </div>
  )
}
```

### Use Case 2: Authentication Flow

```typescript
// Client Component: Login form
// components/features/auth/login-form.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { handleApiError } from '@/lib/api/error-handler'

export function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      router.push('/dashboard')
    } catch (error) {
      handleApiError(error, true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

---

## 🎯 Summary

- **Client Components (`'use client'`)**: Use `axiosClient` from `axios-client.ts`
- **Server Components**: Use `fetchServer` from `fetch-server.ts`
- **Real-time Data**: Use `axiosFetcher` with SWR
- **NextAuth Integration**: Use `useAxiosAuth` hook
- **Service Layer**: Create separate service files for organized API calls
