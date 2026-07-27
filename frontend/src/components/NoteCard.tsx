import type { Submission } from "../types"

export default function NoteCard({ submission }: { submission: Submission }) {
    return (
        <div className="note-card">
            <div className="note-from">{submission.name} · {submission.relation}</div>
            <div className="note-text">"{submission.content}"</div>
        </div>
    )
}
