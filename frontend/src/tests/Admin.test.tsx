import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Admin from '../pages/Admin'
import type { Submission } from '../types'

// Stateful fetch mock: rejects bad Basic auth, serves an in-memory queue,
// flips approved on the approve POST. Mocking fetch (not the api module) keeps
// the real admin api functions under test and avoids the vitest-4 reject bug.
let queue: Submission[]
function installFetch() {
    queue = [
        { id: 1, name: 'Bob', relation: 'Son', type: 'note', s3_key: null, content: 'Hi', created_at: '', approved: false, playback_url: null },
    ]
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
        // fresh copy each call, like real JSON — otherwise React sees the same ref
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(queue.map((q) => ({ ...q }))) })
    }))
}

async function login(user = 'admin', pass = 'katienick') {
    await userEvent.type(screen.getByPlaceholderText('Username'), user)
    await userEvent.type(screen.getByPlaceholderText('Password'), pass)
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
}

describe('Admin', () => {
    beforeEach(installFetch)
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
        // first click only arms the confirm — nothing deleted yet
        await userEvent.click(screen.getByRole('button', { name: /Reject/ }))
        expect(screen.getByText('Bob')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: /Yes, reject/ }))
        await waitFor(() => expect(screen.getByText(/Pending review \(0\)/)).toBeInTheDocument())
        expect(screen.queryByText('Bob')).toBeNull()
    })
})
