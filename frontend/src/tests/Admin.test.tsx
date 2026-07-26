import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Admin from '../pages/Admin'
import type { Submission } from '../types'

// Stateful fetch mock: rejects bad Basic auth, serves an in-memory queue,
// flips approved on approve, drops on delete. Mocking fetch (not the api
// module) keeps the real admin api functions under test and avoids a vitest-4
// bug where a vi.fn() returning a rejected promise trips the runner.
let queue: Submission[]
const NOTE: Submission = { id: 1, name: 'Bob', relation: 'Son', type: 'note', s3_key: null, content: 'Hi', created_at: '', approved: false, playback_url: null }
const VIDEO: Submission = { id: 2, name: 'Nick', relation: 'Grandchild', type: 'video', s3_key: 'submissions/x/rec.webm', content: null, created_at: '', approved: true, playback_url: 'https://s3/x' }

function installFetch(initial: Submission[] = [NOTE]) {
    queue = initial.map((x) => ({ ...x }))
    vi.stubGlobal('fetch', vi.fn((url: string, opts?: RequestInit) => {
        const auth = (opts?.headers as Record<string, string>)?.Authorization
        if (auth !== `Basic ${btoa('admin:katienick')}`) {
            return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve(null) })
        }
        const m = /\/admin\/submissions\/(\d+)\/approve$/.exec(url)
        if (m) {
            const s = queue.find((q) => q.id === Number(m[1]))!
            s.approved = true
            return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(s) })
        }
        const d = opts?.method === 'DELETE' ? /\/admin\/submissions\/(\d+)$/.exec(url) : null
        if (d) {
            queue = queue.filter((q) => q.id !== Number(d[1]))
            return Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve(null) })
        }
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(queue.map((q) => ({ ...q }))) })
    }))
}

async function login(user = 'admin', pass = 'katienick') {
    await userEvent.type(screen.getByPlaceholderText('Username'), user)
    await userEvent.type(screen.getByPlaceholderText('Password'), pass)
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
}

describe('Admin', () => {
    beforeEach(() => installFetch())
    afterEach(() => { vi.unstubAllGlobals(); cleanup() })

    it('rejects a bad password', async () => {
        render(<Admin />)
        await login('admin', 'nope')
        await waitFor(() => expect(screen.getByText('Invalid login')).toBeInTheDocument())
    })

    it('lists pending submissions after login', async () => {
        render(<Admin />)
        await login()
        await waitFor(() => expect(screen.getByText(/Pending review \(1\)/)).toBeInTheDocument())
        expect(screen.getByText('Bob')).toBeInTheDocument()
    })

    it('approving removes it from the pending list', async () => {
        render(<Admin />)
        await login()
        await waitFor(() => expect(screen.getByRole('button', { name: /Approve/ })).toBeInTheDocument())
        await userEvent.click(screen.getByRole('button', { name: /Approve/ }))
        await waitFor(() => expect(screen.getByText(/Pending review \(0\)/)).toBeInTheDocument())
    })

    it('rejecting needs a confirm click, then removes the entry', async () => {
        render(<Admin />)
        await login()
        await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument())
        await userEvent.click(screen.getByRole('button', { name: /Reject/ }))
        expect(screen.getByText('Bob')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: /Yes, reject/ }))
        await waitFor(() => expect(screen.getByText(/Pending review \(0\)/)).toBeInTheDocument())
        expect(screen.queryByText('Bob')).toBeNull()
    })
})

describe('Admin download / selection', () => {
    beforeEach(() => installFetch([VIDEO]))
    afterEach(() => { vi.unstubAllGlobals(); cleanup() })

    it('shows a select checkbox on media items and a download bar', async () => {
        render(<Admin />)
        await login()
        await waitFor(() => expect(screen.getByText(/Select all media \(1\)/)).toBeInTheDocument())
        expect(screen.getByRole('checkbox', { name: 'Select Nick' })).toBeInTheDocument()
    })

    it('selecting an item updates the download button count', async () => {
        render(<Admin />)
        await login()
        await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Select Nick' })).toBeInTheDocument())
        const download = screen.getByRole('button', { name: /Download selected/ })
        expect(download).toBeDisabled()
        await userEvent.click(screen.getByRole('checkbox', { name: 'Select Nick' }))
        expect(screen.getByRole('button', { name: /Download selected \(1\)/ })).toBeEnabled()
    })
})
