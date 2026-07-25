import { useState } from "react";
import { getPresignedUrl, createSubmission } from "../api";

type UploadStatus = 'idle' | 'uploading' | 'saving' | 'done' | 'error'

interface UploadState {
    status: UploadStatus
    progress: number // 0-100, status for uploading
    error: string | null
}

interface SubmitVideoArgs {
    name: string
    relation: string
    blob: Blob
}

interface SubmitPhotoArgs {
    name: string
    relation: string
    file: File
}

interface SubmitNoteArgs {
    name: string
    relation: string
    content: string
}

export function useUpload() {
    const [state, setState] = useState<UploadState>({
        status: 'idle',
        progress: 0,
        error: null,
    })

    async function submitVideo({ name, relation, blob }: SubmitVideoArgs): Promise<boolean> {
        setState({ status: 'uploading', progress: 0, error: null })

        try {
            // Ask FastAPI for a signed S3 URL
            const { presigned_url, s3_key, content_type } = await getPresignedUrl('recording.webm')

            // PUT the blob directly to S3
            await uploadToS3(presigned_url, blob, content_type, (progress) => {
                setState(prev => ({...prev, progress}))
            })

            // Save the metadata to Postgres
            setState(prev => ({ ...prev, status: 'saving' }))
            await createSubmission({ name, relation, type: 'video', s3_key})

            setState({ status: 'done', progress: 100, error: null})
            return true
        } catch (err) {
            setState({ status: 'error', progress: 0, error: (err as Error).message})
            return false
        }
    }

    async function submitPhoto({ name, relation, file }: SubmitPhotoArgs): Promise<boolean> {
        // Same two-step upload as video; content_type comes from the picked file
        setState({ status: 'uploading', progress: 0, error: null })

        try {
            const { presigned_url, s3_key, content_type } = await getPresignedUrl(file.name, file.type)

            await uploadToS3(presigned_url, file, content_type, (progress) => {
                setState(prev => ({ ...prev, progress }))
            })

            setState(prev => ({ ...prev, status: 'saving' }))
            await createSubmission({ name, relation, type: 'photo', s3_key })

            setState({ status: 'done', progress: 100, error: null })
            return true
        } catch (err) {
            setState({ status: 'error', progress: 0, error: (err as Error).message })
            return false
        }
    }

    async function submitNote({ name, relation, content }: SubmitNoteArgs): Promise<boolean> {
        // Skips S3, text goes straight to Postgres
        setState({ status: 'saving', progress: 0, error: null})

        try {
            await createSubmission({ name, relation, type: 'note', content})
            setState({ status: 'done', progress: 100, error: null})
            return true
        } catch (err) {
            setState({ status: 'error', progress: 0, error: (err as Error).message})
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