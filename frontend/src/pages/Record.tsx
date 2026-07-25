import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import VideoRecorder from "../components/VideoRecorder";
import { useUpload } from "../hooks/useUpload";

export default function Record() {
    const location = useLocation()
    const navigate = useNavigate()
    const { name, relation } = location.state ?? {}

    const [mode, setMode] = useState<'video' | 'photo' | 'note'>('video')
    const [note, setNote] = useState<string>('')
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
    const [photo, setPhoto] = useState<File | null>(null)

    const { status, progress, error, submitVideo, submitPhoto, submitNote } = useUpload()

    if (!name) return <Navigate to="/" replace />

    const isSubmitting = status == 'uploading' || status == 'saving'

    const canSubmit = !isSubmitting && (
        mode == 'video' ? videoBlob !== null
        : mode == 'photo' ? photo !== null
        : note.trim().length > 0
    )

    async function handleSubmit() {
        let success = false
        if (mode === 'video' && videoBlob) {
            success = await submitVideo({ name, relation, blob: videoBlob })
        } else if (mode === 'photo' && photo) {
            success = await submitPhoto({ name, relation, file: photo })
        } else if (mode === 'note') {
            success = await submitNote({ name, relation, content: note })
        }
        if (success) navigate('/confirm')
    }

    return (
        <div className="panel">
            <div className="chip">👤 {name} · {relation}</div>

            <div className="toggle">
                <button className={`toggle-opt${mode === 'video' ? ' active' : ''}`} onClick={() => setMode('video')}>📹 Video</button>
                <button className={`toggle-opt${mode === 'photo' ? ' active' : ''}`} onClick={() => setMode('photo')}>🖼 Photo</button>
                <button className={`toggle-opt${mode === 'note' ? ' active' : ''}`} onClick={() => setMode('note')}>✍️ Note</button>
            </div>

            {mode === 'video' && (
                <VideoRecorder onVideoReady={(blob) => setVideoBlob(blob)} />
            )}

            {mode === 'photo' && (
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                    />
                    {photo && <p className="status">Selected: {photo.name}</p>}
                </div>
            )}

            {mode === 'note' && (
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write your message to Jerry..."
                    rows={6}
                />
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
