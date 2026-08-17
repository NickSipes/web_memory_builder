import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import VideoRecorder from "../components/VideoRecorder";
import PhotoCapture from "../components/PhotoCapture";
import { useUpload } from "../hooks/useUpload";

type Mode = 'record-video' | 'take-photo' | 'upload-video' | 'upload-photo' | 'write-note'
const MODES: { id: Mode; label: string }[] = [
    { id: 'record-video', label: '📹 Record video' },
    { id: 'take-photo', label: '📸 Take photo' },
    { id: 'upload-video', label: '⬆️ Upload video' },
    { id: 'upload-photo', label: '🖼 Upload photo' },
    { id: 'write-note', label: '✍️ Write a note' },
]

export default function Record() {
    const location = useLocation()
    const navigate = useNavigate()
    const { name, relation } = location.state ?? {}

    const [mode, setMode] = useState<Mode>('record-video')
    const [media, setMedia] = useState<Blob | null>(null)
    const [note, setNote] = useState('')

    const { status, progress, error, submitVideo, submitPhoto, submitNote } = useUpload()

    if (!name) return <Navigate to="/" replace />

    const kind = mode.includes('photo') ? 'photo' : 'video'
    const isSubmitting = status === 'uploading' || status === 'saving'
    const canSubmit = !isSubmitting && (mode === 'write-note' ? note.trim().length > 0 : media !== null)

    function chooseMode(m: Mode) {
        setMode(m)
        setMedia(null)   // discard any pending media when switching methods
    }

    async function handleSubmit() {
        let ok = false
        if (mode === 'write-note') {
            ok = await submitNote({ name, relation, note })
        } else if (media) {
            const args = { name, relation, blob: media, note }
            ok = kind === 'photo' ? await submitPhoto(args) : await submitVideo(args)
        }
        if (ok) navigate('/confirm')
    }

    return (
        <div className="panel">
            <div className="chip">👤 {name} · {relation}</div>

            <div className="mode-grid">
                {MODES.map((m) => (
                    <button key={m.id} className={`mode-btn${mode === m.id ? ' active' : ''}`} onClick={() => chooseMode(m.id)}>
                        {m.label}
                    </button>
                ))}
            </div>

            {mode === 'write-note' ? (
                <>
                    <label htmlFor="note">Your message to Jerry</label>
                    <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)}
                        placeholder="Write your message to Jerry…" rows={6} />
                </>
            ) : (
                <>
                    {mode === 'record-video' && <VideoRecorder onVideoReady={setMedia} />}
                    {mode === 'take-photo' && <PhotoCapture onPhotoReady={setMedia} />}
                    {mode === 'upload-video' && (
                        <div>
                            <input type="file" accept="video/*" onChange={(e) => setMedia(e.target.files?.[0] ?? null)} />
                            {media && <p className="status">Selected: {(media as File).name}</p>}
                        </div>
                    )}
                    {mode === 'upload-photo' && (
                        <div>
                            <input type="file" accept="image/*" onChange={(e) => setMedia(e.target.files?.[0] ?? null)} />
                            {media && <p className="status">Selected: {(media as File).name}</p>}
                        </div>
                    )}

                    <label htmlFor="note" style={{ marginTop: 16 }}>Add a note (optional)</label>
                    <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)}
                        placeholder="Write a message to Jerry…" rows={3} />
                </>
            )}

            {status === 'uploading' && <p className="status">Uploading… {progress}%</p>}
            {status === 'saving' && <p className="status">Saving your message…</p>}
            {error && <p className="error">Error: {error}</p>}

            <button className="btn" onClick={handleSubmit} disabled={!canSubmit}>
                {isSubmitting ? 'Sending…' : 'Save & send →'}
            </button>
        </div>
    )
}
