import { useEffect, useState } from "react"
import { getSubmissions } from "../api"
import type { Submission } from "../types"
import VideoCard from "../components/VideoCard"
import PhotoCard from "../components/PhotoCard"
import NoteCard from "../components/NoteCard"

export default function Browse() {
    const [submissions, setSubmissions] = useState<Submission[] | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getSubmissions()
            .then(setSubmissions)
            .catch((err) => setError((err as Error).message))
    }, [])

    if (error) return <p className="error">Couldn't load messages: {error}</p>
    if (submissions === null) return <p className="empty">Loading…</p>
    if (submissions.length === 0) return <p className="empty">No messages yet — be the first!</p>

    const videos = submissions.filter((s) => s.type === 'video')
    const photos = submissions.filter((s) => s.type === 'photo')
    const notes = submissions.filter((s) => s.type === 'note')

    return (
        <div>
            <div className="stat-row">
                <div className="stat-chip"><span className="stat-num">{videos.length}</span> videos</div>
                <div className="stat-chip"><span className="stat-num">{photos.length}</span> photos</div>
                <div className="stat-chip"><span className="stat-num">{notes.length}</span> notes</div>
            </div>

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
