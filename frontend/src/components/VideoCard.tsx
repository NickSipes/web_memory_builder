import { useRef, useState } from "react"
import type { Submission } from "../types"

// Shows the video's first frame as a thumbnail (the `#t=0.1` media fragment
// tells the browser to render that frame), with a play overlay until clicked.
export default function VideoCard({ submission }: { submission: Submission }) {
    const ref = useRef<HTMLVideoElement>(null)
    const [playing, setPlaying] = useState(false)

    function play() {
        setPlaying(true)
        // guard: jsdom has no real media element, and browsers may reject autoplay
        try { ref.current?.play()?.catch(() => {}) } catch { /* ignore */ }
    }

    return (
        <div className="media-card">
            <div className="media-thumb">
                {submission.playback_url && (
                    <video
                        ref={ref}
                        src={`${submission.playback_url}#t=0.1`}
                        preload="metadata"
                        playsInline
                        controls={playing}
                        muted={!playing}
                    />
                )}
                {!playing && (
                    <button className="play-btn" onClick={play} aria-label="Play video">
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
