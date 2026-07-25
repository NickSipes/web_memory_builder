import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import Browse from '../pages/Browse'
import type { Submission } from '../types'

// Mock the network, not the api module — this drives the real getSubmissions()
// so its own error path is exercised. (Also sidesteps a vitest-4 bug where a
// vi.fn() returning a rejected promise trips the runner in non-first tests.)
function mockFetch(body: unknown, ok = true) {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
        ok, status: ok ? 200 : 500, json: () => Promise.resolve(body),
    })))
}

const data: Submission[] = [
    { id: 1, name: 'Alice', relation: 'Daughter', type: 'video', s3_key: 'k', content: null, created_at: '', approved: true, playback_url: 'https://s3/x' },
    { id: 2, name: 'Bob', relation: 'Son', type: 'note', s3_key: null, content: 'Hi', created_at: '', approved: true, playback_url: null },
    { id: 3, name: 'Cara', relation: 'Granddaughter', type: 'photo', s3_key: 'p', content: null, created_at: '', approved: true, playback_url: 'https://s3/pic.jpg' },
]

describe('Browse', () => {
    beforeEach(() => vi.unstubAllGlobals())
    afterEach(cleanup)

    it('shows loading state on mount', () => {
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
        render(<Browse />)
        expect(screen.getByText('Loading…')).toBeInTheDocument()
    })

    it('renders video and note cards after fetch resolves', async () => {
        mockFetch(data)
        render(<Browse />)
        await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())
        expect(screen.getByRole('button', { name: 'Play video' })).toBeInTheDocument()
        expect(screen.getByText('"Hi"')).toBeInTheDocument()
        expect(screen.getByRole('img')).toHaveAttribute('src', 'https://s3/pic.jpg')
    })

    it('shows empty state when submissions array is empty', async () => {
        mockFetch([])
        render(<Browse />)
        await waitFor(() =>
            expect(screen.getByText('No messages yet — be the first!')).toBeInTheDocument())
    })

    it('shows error message when fetch fails', async () => {
        mockFetch(null, false)
        render(<Browse />)
        await waitFor(() => expect(screen.getByText(/Couldn't load messages/)).toBeInTheDocument())
    })

    it('displays correct video and note counts', async () => {
        mockFetch(data)
        render(<Browse />)
        await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())
        const row = document.querySelector('.stat-row')!.textContent
        expect(row).toContain('1 videos')
        expect(row).toContain('1 photos')
        expect(row).toContain('1 notes')
    })
})
