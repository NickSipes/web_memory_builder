import { useState } from "react";
import { getPresignedUrl, createSubmission } from "../api";

type UploadStatus = 'idle' | 'uploading' | 'saving' | 'done' | 'error'

interface UploadState {
    status: UploadStatus
    progress: number // 0-100, for the file currently uploading
    index: number    // which file we're on (0-based), for batch progress
    total: number    // how many files in this submission
    error: string | null
}

interface SubmitMediaArgs {
    name: string
    relation: string
    blobs: Blob[]     // one File each (uploaded) or a single captured Blob (camera)
    note?: string     // optional written note that rides along with the media
}

const IDLE: UploadState = { status: 'idle', progress: 0, index: 0, total: 0, error: null }

export function useUpload() {
    const [state, setState] = useState<UploadState>(IDLE)

    // Video and photo take the same path; only the type + defaults differ.
    // Multiple files → one S3 upload + one submission each, uploaded in order.
    // The note (if any) rides along with every file.
    async function submitMedia(type: 'video' | 'photo', { name, relation, blobs, note }: SubmitMediaArgs): Promise<boolean> {
        try {
            for (let i = 0; i < blobs.length; i++) {
                const blob = blobs[i]
                setState({ status: 'uploading', progress: 0, index: i, total: blobs.length, error: null })
                const f = blob as File
                const contentType = blob.type || (type === 'video' ? 'video/webm' : 'image/jpeg')
                // filename extension must match the actual format (a recorded MP4
                // saved as .webm won't open in most players)
                const ext = type === 'video'
                    ? (contentType.includes('mp4') ? 'mp4' : 'webm')
                    : (contentType.includes('png') ? 'png' : 'jpg')
                const filename = f.name || (type === 'video' ? `recording.${ext}` : `photo.${ext}`)

                const { presigned_url, s3_key } = await getPresignedUrl(filename, contentType)
                await uploadToS3(presigned_url, blob, contentType, (progress) => {
                    setState(prev => ({ ...prev, progress }))
                })

                setState(prev => ({ ...prev, status: 'saving' }))
                await createSubmission({ name, relation, type, s3_key, content: note?.trim() || undefined })
            }
            setState({ status: 'done', progress: 100, index: blobs.length, total: blobs.length, error: null })
            return true
        } catch (err) {
            setState(prev => ({ ...prev, status: 'error', error: (err as Error).message }))
            return false
        }
    }

    const submitVideo = (args: SubmitMediaArgs) => submitMedia('video', args)
    const submitPhoto = (args: SubmitMediaArgs) => submitMedia('photo', args)

    // A written note on its own — no upload, straight to Postgres.
    async function submitNote({ name, relation, note }: { name: string; relation: string; note: string }): Promise<boolean> {
        setState({ ...IDLE, status: 'saving' })
        try {
            await createSubmission({ name, relation, type: 'note', content: note.trim() })
            setState({ ...IDLE, status: 'done', progress: 100 })
            return true
        } catch (err) {
            setState({ ...IDLE, status: 'error', error: (err as Error).message })
            return false
        }
    }

    return { ...state, submitVideo, submitPhoto, submitNote }
}

// Kept outside the hook since it isn't stateful
function uploadToS3(
    url: string,
    blob: Blob,
    contentType: string,
    onProgress: (pct: number) => void
): Promise<void> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', url)
        xhr.setRequestHeader('Content-Type', contentType)

        // Fires periodically as bytes are transferred
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                onProgress(Math.round((e.loaded / e.total) * 100))
            }
        }

        xhr.onload = () => {
            xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error(`S3 upload failed: ${xhr.status} -- ${xhr.responseText}`))
        }

        xhr.onerror = () => reject(new Error('Network error during upload'))

        xhr.send(blob)
    })
}
