import { useState } from "react"
import { createBugReport } from "../api"

export default function ReportBug() {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
    const [error, setError] = useState<string | null>(null)

    const canSend = description.trim().length > 0 && status !== 'sending'

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!canSend) return
        setStatus('sending')
        setError(null)
        try {
            await createBugReport({ name: name.trim() || undefined, description: description.trim() })
            setStatus('done')
        } catch (err) {
            setStatus('error')
            setError((err as Error).message)
        }
    }

    if (status === 'done') {
        return (
            <div className="panel" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40 }}>🐞</div>
                <p><strong>Thanks for the report!</strong></p>
                <p className="muted">We'll take a look and get it fixed.</p>
            </div>
        )
    }

    return (
        <form className="panel" onSubmit={handleSubmit}>
            <h2 className="section-heading">Report a bug</h2>
            <p className="muted" style={{ marginBottom: 16 }}>
                Notice something not working? Describe it below and we'll fix it.
            </p>

            <label htmlFor="bug-name">Your name (optional)</label>
            <input id="bug-name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />

            <label htmlFor="bug-desc">What went wrong?</label>
            <textarea id="bug-desc" rows={6} placeholder="Describe the bug — what you were doing and what happened…"
                value={description} onChange={(e) => setDescription(e.target.value)} />

            {error && <p className="error">Error: {error}</p>}
            <button className="btn" type="submit" disabled={!canSend}>
                {status === 'sending' ? 'Sending…' : 'Send report'}
            </button>
        </form>
    )
}
