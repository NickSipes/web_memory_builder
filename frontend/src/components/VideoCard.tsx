import { useState } from "react"
import type { Submission } from "../types"

// Play-button placeholder until clicked, then swaps in the real <video>.
export default function VideoCard({ submission }: { submission: Submission }) {
    const [playing, setPlaying] = useState(false)

    return (
        <div className="media-card">
            <div className="media-thumb">
                {playing && submission.playback_url ? (
                    <video src={submission.playback_url} controls autoPlay />
                ) : (
                    <button className="play-btn" onClick={() => setPlaying(true)} aria-label="Play video">
                        <span className="play-icon"><span className="play-tri" /></span>
                    </button>
                )}
            </div>
            <div className="card-foot">
                <strong>{submission.name}</strong> <span className="muted">· {submission.relation}</span>
            </div>
        </div>
    )
}
