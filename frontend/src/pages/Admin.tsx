import { useState } from "react"
import type { Submission, Rsvp, BugReport } from "../types"
import { getAllSubmissions, approveSubmission, deleteSubmission, getRsvps, deleteRsvp, getBugReports, deleteBugReport } from "../api"
import { downloadZip } from "../lib/download"
import { downloadRsvpCsv } from "../lib/download"

// Media preview so the admin can review before approving.
function Preview({ s }: { s: Submission }) {
    return (
        <>
            {s.type === 'photo' && s.playback_url && <div className="admin-media"><img src={s.playback_url} alt={`From ${s.name}`} /></div>}
            {s.type === 'video' && s.playback_url && <div className="admin-media"><video src={s.playback_url} controls /></div>}
            {s.content && <p className="note-text">"{s.content}"</p>}
        </>
    )
}

export default function Admin() {
    const [creds, setCreds] = useState<string | null>(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [subs, setSubs] = useState<Submission[]>([])
    const [error, setError] = useState<string | null>(null)
    const [confirmId, setConfirmId] = useState<number | null>(null)
    const [selected, setSelected] = useState<Set<number>>(new Set())
    const [downloading, setDownloading] = useState(false)
    const [rsvps, setRsvps] = useState<Rsvp[]>([])
    const [bugs, setBugs] = useState<BugReport[]>([])

    async function load(c: string) {
        const [s, r, b] = await Promise.all([getAllSubmissions(c), getRsvps(c), getBugReports(c)])
        setSubs(s)
        setRsvps(r)
        setBugs(b)
    }

    async function handleDeleteBug(id: number) {
        if (!creds) return
        setError(null)
        try {
            await deleteBugReport(id, creds)
            await load(creds)
        } catch (e) {
            setError(`Couldn't remove report: ${(e as Error).message}`)
        }
    }

    async function handleDeleteRsvp(id: number) {
        if (!creds) return
        setError(null)
        try {
            await deleteRsvp(id, creds)
            await load(creds)
        } catch (e) {
            setError(`Couldn't remove RSVP: ${(e as Error).message}`)
        }
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
        setError(null)
        try {
            await approveSubmission(id, creds)
            await load(creds)
        } catch (e) {
            setError(`Couldn't approve: ${(e as Error).message}`)
        }
    }

    async function handleDelete(id: number) {
        if (!creds) return
        setError(null)
        try {
            await deleteSubmission(id, creds)
            setConfirmId(null)
            setSelected((prev) => { const n = new Set(prev); n.delete(id); return n })
            await load(creds)
        } catch (e) {
            setError(`Couldn't remove: ${(e as Error).message}`)
        }
    }

    function toggleSelect(id: number) {
        setSelected((prev) => {
            const n = new Set(prev)
            n.has(id) ? n.delete(id) : n.add(id)
            return n
        })
    }

    async function handleDownload() {
        const items = subs.filter((s) => selected.has(s.id))
        setDownloading(true)
        try {
            await downloadZip(items)
        } catch (e) {
            setError(`Download failed: ${(e as Error).message}`)
        } finally {
            setDownloading(false)
        }
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
    const mediaItems = subs.filter((s) => s.s3_key)
    const allSelected = mediaItems.length > 0 && mediaItems.every((s) => selected.has(s.id))

    function toggleAll() {
        setSelected(allSelected ? new Set() : new Set(mediaItems.map((s) => s.id)))
    }

    const itemProps = { confirmId, setConfirmId, onApprove: handleApprove, onDelete: handleDelete, selected, onToggleSelect: toggleSelect }

    return (
        <div>
            {mediaItems.length > 0 && (
                <div className="download-bar">
                    <label className="dl-check">
                        <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                        Select all media ({mediaItems.length})
                    </label>
                    <button className="btn-outline" style={{ width: 'auto' }} disabled={selected.size === 0 || downloading} onClick={handleDownload}>
                        {downloading ? 'Preparing…' : `⬇ Download selected (${selected.size})`}
                    </button>
                </div>
            )}
            {error && <p className="error">{error}</p>}

            <div className="section-label">Pending review ({pending.length})</div>
            {pending.length === 0 && <p className="empty">Nothing waiting — all caught up.</p>}
            {pending.map((s) => <AdminItem key={s.id} s={s} {...itemProps} />)}

            {approved.length > 0 && <>
                <div className="section-label" style={{ marginTop: 28 }}>Approved ({approved.length})</div>
                {approved.map((s) => <AdminItem key={s.id} s={s} {...itemProps} />)}
            </>}

            <RsvpSection rsvps={rsvps} onDelete={handleDeleteRsvp} />
            <BugSection bugs={bugs} onDelete={handleDeleteBug} />
        </div>
    )
}

function BugSection({ bugs, onDelete }: { bugs: BugReport[]; onDelete: (id: number) => void }) {
    const [confirmId, setConfirmId] = useState<number | null>(null)
    return (
        <div style={{ marginTop: 36 }}>
            <div className="section-label">Bug reports ({bugs.length})</div>
            {bugs.length === 0 && <p className="empty">No bug reports.</p>}
            {bugs.map((b) => (
                <div key={b.id} className="admin-item">
                    <div className="admin-head">
                        <div className="admin-who">
                            <strong>{b.name || 'Anonymous'}</strong>
                            <span className="muted"> · {new Date(b.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{b.description}</p>
                    <div className="admin-actions">
                        {confirmId === b.id ? (
                            <>
                                <span className="muted" style={{ alignSelf: 'center', fontSize: 13 }}>Remove this report?</span>
                                <button className="btn-danger" onClick={() => { onDelete(b.id); setConfirmId(null) }}>Yes, remove</button>
                                <button className="btn-ghost" onClick={() => setConfirmId(null)}>Cancel</button>
                            </>
                        ) : (
                            <button className="btn-danger" onClick={() => setConfirmId(b.id)}>🗑 Remove</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

function RsvpSection({ rsvps, onDelete }: { rsvps: Rsvp[]; onDelete: (id: number) => void }) {
    const [confirmId, setConfirmId] = useState<number | null>(null)
    // total headcount = each attending person plus the extra guests they bring
    const headcount = rsvps.filter((r) => r.attending).reduce((sum, r) => sum + 1 + r.guests, 0)
    return (
        <div style={{ marginTop: 36 }}>
            <div className="download-bar">
                <span><strong>{headcount}</strong> attending · {rsvps.length} RSVP{rsvps.length === 1 ? '' : 's'}</span>
                {rsvps.length > 0 && (
                    <button className="btn-outline" style={{ width: 'auto' }} onClick={() => downloadRsvpCsv(rsvps)}>⬇ Download RSVP list (CSV)</button>
                )}
            </div>
            {rsvps.length === 0 && <p className="empty">No RSVPs yet.</p>}
            {rsvps.map((r) => (
                <div key={r.id} className="admin-item">
                    <div className="admin-head">
                        <div className="admin-who">
                            <strong>{r.name}</strong>{r.attending && r.guests > 0 && <span className="muted"> +{r.guests}</span>}
                            {r.contact
                                ? <> · <a href={contactHref(r.contact)}>{r.contact}</a></>
                                : <span className="muted"> · no contact</span>}
                        </div>
                        <span className={`badge ${r.attending ? 'badge-approved' : 'badge-pending'}`}>{r.attending ? `Party of ${r.guests + 1}` : 'Not attending'}</span>
                    </div>
                    {r.dietary.length > 0 && <p className="muted" style={{ fontSize: 13 }}>Dietary: {r.dietary.join(', ')}</p>}
                    <div className="admin-actions">
                        {confirmId === r.id ? (
                            <>
                                <span className="muted" style={{ alignSelf: 'center', fontSize: 13 }}>Remove this RSVP?</span>
                                <button className="btn-danger" onClick={() => { onDelete(r.id); setConfirmId(null) }}>Yes, remove</button>
                                <button className="btn-ghost" onClick={() => setConfirmId(null)}>Cancel</button>
                            </>
                        ) : (
                            <button className="btn-danger" onClick={() => setConfirmId(r.id)}>🗑 Remove</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

// mailto: / tel: link if the contact looks like an email or phone
function contactHref(contact: string): string {
    if (contact.includes('@')) return `mailto:${contact}`
    const digits = contact.replace(/[^0-9+]/g, '')
    return digits.length >= 7 ? `tel:${digits}` : '#'
}

function AdminItem({ s, confirmId, setConfirmId, onApprove, onDelete, selected, onToggleSelect }: {
    s: Submission
    confirmId: number | null
    setConfirmId: (id: number | null) => void
    onApprove: (id: number) => void
    onDelete: (id: number) => void
    selected: Set<number>
    onToggleSelect: (id: number) => void
}) {
    const confirming = confirmId === s.id
    const hasMedia = !!s.s3_key
    return (
        <div className="admin-item">
            <div className="admin-head">
                <div className="admin-who">
                    {hasMedia && (
                        <input type="checkbox" aria-label={`Select ${s.name}`} checked={selected.has(s.id)}
                            onChange={() => onToggleSelect(s.id)} style={{ width: 'auto', marginRight: 8, verticalAlign: 'middle' }} />
                    )}
                    <strong>{s.name}</strong> · {s.relation} <span className="muted">({s.type})</span>
                </div>
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
