import { useEffect, useState } from "react"
import { getSubmissions } from "../api"
import type { Submission } from "../types"
import VideoCard from "../components/VideoCard"
import PhotoCard from "../components/PhotoCard"
import NoteCard from "../components/NoteCard"

type TypeFilter = 'all' | 'video' | 'photo' | 'note'

export default function Browse() {
    const [submissions, setSubmissions] = useState<Submission[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
    const [relationFilter, setRelationFilter] = useState('all')

    useEffect(() => {
        getSubmissions()
            .then(setSubmissions)
            .catch((err) => setError((err as Error).message))
    }, [])

    if (error) return <p className="error">Couldn't load messages: {error}</p>
    if (submissions === null) return <p className="empty">Loading…</p>
    if (submissions.length === 0) return <p className="empty">No messages yet — be the first!</p>

    // relation options come from what's actually been submitted
    const relations = Array.from(new Set(submissions.map((s) => s.relation))).sort()

    const shown = submissions.filter((s) =>
        (typeFilter === 'all' || s.type === typeFilter) &&
        (relationFilter === 'all' || s.relation === relationFilter)
    )
    const videos = shown.filter((s) => s.type === 'video')
    const photos = shown.filter((s) => s.type === 'photo')
    const notes = shown.filter((s) => s.type === 'note')

    return (
        <div>
            <div className="stat-row">
                <div className="stat-chip"><span className="stat-num">{videos.length}</span> videos</div>
                <div className="stat-chip"><span className="stat-num">{photos.length}</span> photos</div>
                <div className="stat-chip"><span className="stat-num">{notes.length}</span> notes</div>
            </div>

            <div className="filter-bar">
                <select aria-label="Filter by type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}>
                    <option value="all">All types</option>
                    <option value="video">Videos</option>
                    <option value="photo">Photos</option>
                    <option value="note">Notes</option>
                </select>
                <select aria-label="Filter by relation" value={relationFilter} onChange={(e) => setRelationFilter(e.target.value)}>
                    <option value="all">All relations</option>
                    {relations.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            {shown.length === 0 && <p className="empty">No messages match these filters.</p>}

            {videos.length > 0 && (
                <section className="grid">
                    {videos.map((s) => <VideoCard key={s.id} submission={s} />)}
                </section>
            )}
            {photos.length > 0 && (
                <section className="grid">
                    {photos.map((s) => <PhotoCard key={s.id} submission={s} />)}
                </section>
            )}
            {notes.length > 0 && (
                <section className="grid">
                    {notes.map((s) => <NoteCard key={s.id} submission={s} />)}
                </section>
            )}
        </div>
    )
}
