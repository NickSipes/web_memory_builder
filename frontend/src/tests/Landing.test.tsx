import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Landing from '../pages/Landing'

function setup() {
    render(<MemoryRouter><Landing /></MemoryRouter>)
}

describe('Landing', () => {
    it('shows the occasion', () => {
        setup()
        expect(screen.getByRole('heading', { name: "Jerry Sipes' Surprise 80th Birthday Party" })).toBeInTheDocument()
    })

    it('offers the three actions, linking to the right pages', () => {
        setup()
        expect(screen.getByRole('link', { name: /Leave a message for Jerry/ })).toHaveAttribute('href', '/message')
        expect(screen.getByRole('link', { name: /Event details & RSVP/ })).toHaveAttribute('href', '/rsvp')
        expect(screen.getByRole('link', { name: /Browse messages/ })).toHaveAttribute('href', '/browse')
    })
})
