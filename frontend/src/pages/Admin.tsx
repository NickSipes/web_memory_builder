import { useState } from "react"
import type { Submission } from "../types"
import { getAllSubmissions, approveSubmission, deleteSubmission } from "../api"

// Media preview so the admin can review before approving.
function Preview({ s }: { s: Submission }) {
    if (s.type === 'note') return <p className="note-text">"{s.content}"</p>
    if (!s.playback_url) return null
    if (s.type === 'photo') {
        return <div className="admin-media"><img src={s.playback_url} alt={`From ${s.name}`} /></div>
    }
    return <div className="admin-media"><video src={s.playback_url} controls /></div>
}

export default function Admin() {
    const [creds, setCreds] = useState<string | null>(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [subs, setSubs] = useState<Submission[]>([])
    const [error, setError] = useState<string | null>(null)
    const [confirmId, setConfirmId] = useState<number | null>(null)

    async function load(c: string) {
        setSubs(await getAllSubmissions(c))
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        const c = btoa(`${username}:${password}`)
        try {
            await load(c)
            setCreds(c)
        } catch {
            setError('Invalid login')
        }
    }

    async function handleApprove(id: number) {
        if (!creds) return
        await approveSubmission(id, creds)
        await load(creds)
    }

    async function handleDelete(id: number) {
        if (!creds) return
        await deleteSubmission(id, creds)
        setConfirmId(null)
        await load(creds)
    }

    if (!creds) {
        return (
            <form className="panel" onSubmit={handleLogin} style={{ maxWidth: 340 }}>
                <h2 className="hero-title" style={{ fontSize: 24 }}>Admin login</h2>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button className="btn" type="submit">Log in</button>
                {error && <p className="error">{error}</p>}
            </form>
        )
    }

    const pending = subs.filter((s) => !s.approved)
    const approved = subs.filter((s) => s.approved)

    return (
        <div>
            <div className="section-label">Pending review ({pending.length})</div>
            {pending.length === 0 && <p className="empty">Nothing waiting — all caught up.</p>}
            {pending.map((s) => (
                <AdminItem key={s.id} s={s} confirmId={confirmId} setConfirmId={setConfirmId}
                    onApprove={handleApprove} onDelete={handleDelete} />
            ))}

            {approved.length > 0 && <>
                <div className="section-label" style={{ marginTop: 28 }}>Approved ({approved.length})</div>
                {approved.map((s) => (
                    <AdminItem key={s.id} s={s} confirmId={confirmId} setConfirmId={setConfirmId}
                        onApprove={handleApprove} onDelete={handleDelete} />
                ))}
            </>}
        </div>
    )
}

function AdminItem({ s, confirmId, setConfirmId, onApprove, onDelete }: {
    s: Submission
    confirmId: number | null
    setConfirmId: (id: number | null) => void
    onApprove: (id: number) => void
    onDelete: (id: number) => void
}) {
    const confirming = confirmId === s.id
    return (
        <div className="admin-item">
            <div className="admin-head">
                <div className="admin-who"><strong>{s.name}</strong> · {s.relation} <span className="muted">({s.type})</span></div>
                <span className={`badge ${s.approved ? 'badge-approved' : 'badge-pending'}`}>{s.approved ? 'Approved' : 'Pending'}</span>
            </div>

            <Preview s={s} />

            <div className="admin-actions">
                {!s.approved && !confirming && (
                    <button className="btn-ghost" style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }} onClick={() => onApprove(s.id)}>✓ Approve</button>
                )}
                {confirming ? (
                    <>
                        <span className="muted" style={{ alignSelf: 'center', fontSize: 13 }}>
                            {s.approved ? 'Delete this entry?' : 'Reject this?'}
                        </span>
                        <button className="btn-danger" onClick={() => onDelete(s.id)}>Yes, {s.approved ? 'delete' : 'reject'}</button>
                        <button className="btn-ghost" onClick={() => setConfirmId(null)}>Cancel</button>
                    </>
                ) : (
                    <button className="btn-danger" onClick={() => setConfirmId(s.id)}>
                        {s.approved ? '🗑 Delete' : '✕ Reject'}
                    </button>
                )}
            </div>
        </div>
    )
}
