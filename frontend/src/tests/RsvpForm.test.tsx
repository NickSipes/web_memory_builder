import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RsvpForm from '../components/RsvpForm'

// Mock the network so the real createRsvp runs (fetch-mock pattern, like Browse)
let lastBody: Record<string, unknown> | null
function installFetch(ok = true) {
    lastBody = null
    vi.stubGlobal('fetch', vi.fn((_url: string, opts?: RequestInit) => {
        lastBody = JSON.parse(opts!.body as string)
        return Promise.resolve({ ok, status: ok ? 200 : 500, json: () => Promise.resolve({ id: 1 }) })
    }))
}

describe('RsvpForm', () => {
    beforeEach(() => installFetch())
    afterEach(() => { vi.unstubAllGlobals(); cleanup() })

    it('disables send until name and contact are filled', async () => {
        render(<RsvpForm />)
        expect(screen.getByRole('button', { name: /Send RSVP/ })).toBeDisabled()
        await userEvent.type(screen.getByLabelText('Full name'), 'Aunt May')
        await userEvent.type(screen.getByLabelText('Email or phone'), 'may@example.com')
        expect(screen.getByRole('button', { name: /Send RSVP/ })).toBeEnabled()
    })

    it('submits name, contact, attending, and dietary choices', async () => {
        render(<RsvpForm />)
        await userEvent.type(screen.getByLabelText('Full name'), 'Aunt May')
        await userEvent.type(screen.getByLabelText('Email or phone'), '555-1234')
        await userEvent.click(screen.getByLabelText('Nut allergy'))
        await userEvent.click(screen.getByRole('button', { name: /Send RSVP/ }))
        await waitFor(() => expect(screen.getByText(/Thank you, Aunt May/)).toBeInTheDocument())
        expect(lastBody).toEqual({ name: 'Aunt May', contact: '555-1234', attending: true, dietary: ['Nut allergy'] })
    })

    it('drops dietary choices when not attending', async () => {
        render(<RsvpForm />)
        await userEvent.type(screen.getByLabelText('Full name'), 'Bob')
        await userEvent.type(screen.getByLabelText('Email or phone'), 'bob@x.com')
        await userEvent.click(screen.getByRole('button', { name: /Can't make it/ }))
        await userEvent.click(screen.getByRole('button', { name: /Send RSVP/ }))
        await waitFor(() => expect(screen.getByText(/Thank you, Bob/)).toBeInTheDocument())
        expect(lastBody).toEqual({ name: 'Bob', contact: 'bob@x.com', attending: false, dietary: [] })
    })
})
