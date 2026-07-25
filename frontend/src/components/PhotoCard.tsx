import type { Submission } from "../types"

export default function PhotoCard({ submission }: { submission: Submission }) {
    return (
        <div className="media-card">
            <div className="media-thumb">
                {submission.playback_url && (
                    <img src={submission.playback_url} alt={`From ${submission.name}`} />
                )}
            </div>
            <div className="card-foot">
                <strong>{submission.name}</strong> <span className="muted">· {submission.relation}</span>
            </div>
        </div>
    )
}
