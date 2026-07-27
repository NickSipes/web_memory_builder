import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VideoCard from '../components/VideoCard'
import type { Submission } from '../types'

const video: Submission = {
    id: 1, name: 'Alice', relation: 'Daughter', type: 'video',
    s3_key: 'submissions/x/recording.webm', content: null,
    created_at: '', playback_url: 'https://s3.example.com/signed',
}

describe('VideoCard', () => {
    it('shows the video thumbnail with a play overlay before interaction', () => {
        const { container } = render(<VideoCard submission={video} />)
        expect(screen.getByRole('button', { name: 'Play video' })).toBeInTheDocument()
        // thumbnail frame is the video element with the #t media fragment
        expect(container.querySelector('video')?.getAttribute('src')).toContain(video.playback_url!)
    })

    it('hides the play overlay after clicking play', async () => {
        const { container } = render(<VideoCard submission={video} />)
        await userEvent.click(screen.getByRole('button', { name: 'Play video' }))
        expect(screen.queryByRole('button', { name: 'Play video' })).toBeNull()
        expect(container.querySelector('video')).toBeInTheDocument()
    })

    it('renders submitter name and relation', () => {
        render(<VideoCard submission={video} />)
        expect(screen.getByText('Alice')).toBeInTheDocument()
        expect(screen.getByText(/Daughter/)).toBeInTheDocument()
    })
})
