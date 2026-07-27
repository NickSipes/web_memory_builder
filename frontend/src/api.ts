import type { Submission, PresignedResponse, SubmissionCreate } from './types'

// Prod points at the deployed API via VITE_API_URL; in dev this is unset and
// Vite proxies /api to localhost:8000 (see vite.config.ts)
const BASE = import.meta.env.VITE_API_URL ?? '/api'

export async function getSubmissions(): Promise<Submission[]> {
    const res = await fetch(`${BASE}/submissions`)
    if (!res.ok) throw new Error(`Failed to fetch submissions: ${res.status}`)
    return res.json()
}

export async function createSubmission(data: SubmissionCreate): Promise<Submission> {
    const res = await fetch(`${BASE}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Failed to create submission: ${res.status}`)
    return res.json()   
}

export async function getPresignedUrl(filename: string, contentType: string = 'video/webm'): Promise<PresignedResponse> {
    const res = await fetch(`${BASE}/upload/presigned`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content_type: contentType }),
    })
    if (!res.ok) throw new Error(`Failed to get presigned URL: ${res.status}`)
    return res.json()
}

// --- Admin (HTTP Basic) ---------------------------------------------------
// `creds` is the base64 of "user:pass"; the admin page holds it in memory.
export async function getAllSubmissions(creds: string): Promise<Submission[]> {
    const res = await fetch(`${BASE}/admin/submissions`, {
        headers: { Authorization: `Basic ${creds}` },
    })
    if (res.status === 401) throw new Error('Unauthorized')
    if (!res.ok) throw new Error(`Failed to fetch submissions: ${res.status}`)
    return res.json()
}

export async function approveSubmission(id: number, creds: string): Promise<Submission> {
    const res = await fetch(`${BASE}/admin/submissions/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Basic ${creds}` },
    })
    if (!res.ok) throw new Error(`Failed to approve: ${res.status}`)
    return res.json()
}

// Rejects a pending submission or deletes an existing one (also removes its S3 object).
export async function deleteSubmission(id: number, creds: string): Promise<void> {
    const res = await fetch(`${BASE}/admin/submissions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Basic ${creds}` },
    })
    if (!res.ok) throw new Error(`Failed to delete: ${res.status}`)
}