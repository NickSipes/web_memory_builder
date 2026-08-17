import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useUpload } from '../hooks/useUpload'
import * as api from '../api'

vi.mock('../api', () => ({
    getPresignedUrl: vi.fn(),
    createSubmission: vi.fn(),
}))
const mockPresign = vi.mocked(api.getPresignedUrl)
const mockCreate = vi.mocked(api.createSubmission)

describe('useUpload', () => {
    beforeEach(() => {
        mockPresign.mockReset()
        mockCreate.mockReset()
        mockPresign.mockResolvedValue({ presigned_url: 'https://s3/put', s3_key: 'k', content_type: 'video/webm' })
        mockCreate.mockResolvedValue({} as never)
        stubXhr(200)
    })

    it('initial state is idle with no error', () => {
        const { result } = renderHook(() => useUpload())
        expect(result.current.status).toBe('idle')
        expect(result.current.error).toBeNull()
    })

    it('submitVideo presigns then saves a video submission', async () => {
        const { result } = renderHook(() => useUpload())
        await act(async () => {
            await result.current.submitVideo({ name: 'A', relation: 'Son', blob: new Blob(['x']) })
        })
        expect(mockPresign).toHaveBeenCalled()
        expect(mockCreate).toHaveBeenCalledWith({ name: 'A', relation: 'Son', type: 'video', s3_key: 'k', content: undefined })
        await waitFor(() => expect(result.current.status).toBe('done'))
    })

    it('submitPhoto includes the optional note as content', async () => {
        const { result } = renderHook(() => useUpload())
        await act(async () => {
            await result.current.submitPhoto({ name: 'A', relation: 'Son', blob: new Blob(['x']), note: '  hi there ' })
        })
        expect(mockCreate).toHaveBeenCalledWith({ name: 'A', relation: 'Son', type: 'photo', s3_key: 'k', content: 'hi there' })
    })

    it('omits content when the note is blank', async () => {
        const { result } = renderHook(() => useUpload())
        await act(async () => {
            await result.current.submitVideo({ name: 'A', relation: 'Son', blob: new Blob(['x']), note: '   ' })
        })
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ content: undefined }))
    })

    it('submitNote saves a note-only submission (no S3)', async () => {
        const { result } = renderHook(() => useUpload())
        await act(async () => {
            await result.current.submitNote({ name: 'A', relation: 'Son', note: '  just a note ' })
        })
        expect(mockPresign).not.toHaveBeenCalled()
        expect(mockCreate).toHaveBeenCalledWith({ name: 'A', relation: 'Son', type: 'note', content: 'just a note' })
    })

    it('returns false and sets error on API failure', async () => {
        mockCreate.mockRejectedValue(new Error('boom'))
        const { result } = renderHook(() => useUpload())
        let ret = true
        await act(async () => {
            ret = await result.current.submitPhoto({ name: 'A', relation: 'Son', blob: new Blob(['x']) })
        })
        expect(ret).toBe(false)
        await waitFor(() => expect(result.current.status).toBe('error'))
        expect(result.current.error).toBe('boom')
    })
})

// Minimal XMLHttpRequest stand-in — fires load immediately with the given status
function stubXhr(status: number) {
    class FakeXhr {
        status = status
        upload = { onprogress: null as unknown }
        onload: (() => void) | null = null
        onerror: (() => void) | null = null
        open() {}
        setRequestHeader() {}
        send() { this.onload?.() }
    }
    vi.stubGlobal('XMLHttpRequest', FakeXhr)
}
