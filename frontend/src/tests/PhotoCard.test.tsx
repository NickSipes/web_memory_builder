import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PhotoCard from '../components/PhotoCard'
import type { Submission } from '../types'

const photo: Submission = {
    id: 1, name: 'Cara', relation: 'Granddaughter', type: 'photo',
    s3_key: 'submissions/x/pic.jpg', content: null, created_at: '',
    approved: true, playback_url: 'https://s3.example.com/signed.jpg',
}

describe('PhotoCard', () => {
    it('renders the image from playback_url', () => {
        render(<PhotoCard submission={photo} />)
        expect(screen.getByRole('img')).toHaveAttribute('src', photo.playback_url)
    })

    it('renders submitter name and relation', () => {
        render(<PhotoCard submission={photo} />)
        expect(screen.getByText('Cara')).toBeInTheDocument()
        expect(screen.getByText(/Granddaughter/)).toBeInTheDocument()
    })
})
