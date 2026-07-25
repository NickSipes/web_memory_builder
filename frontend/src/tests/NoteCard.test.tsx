import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import NoteCard from '../components/NoteCard'
import type { Submission } from '../types'

const note: Submission = {
    id: 1, name: 'Bob', relation: 'Son', type: 'note',
    s3_key: null, content: 'Happy birthday Grandpa!', created_at: '', playback_url: null,
}

describe('NoteCard', () => {
    it('renders note content in quotes', () => {
        render(<NoteCard submission={note} />)
        expect(screen.getByText('"Happy birthday Grandpa!"')).toBeInTheDocument()
    })

    it('renders submitter name and relation', () => {
        render(<NoteCard submission={note} />)
        expect(screen.getByText(/Bob/)).toBeInTheDocument()
        expect(screen.getByText(/Son/)).toBeInTheDocument()
    })
})
