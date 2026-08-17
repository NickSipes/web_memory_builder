import { useState } from "react"
import { createRsvp } from "../api"
import { DIETARY_OPTIONS } from "../event"

export default function RsvpForm() {
    const [name, setName] = useState('')
    const [contact, setContact] = useState('')
    const [attending, setAttending] = useState(true)
    const [guests, setGuests] = useState(0)
    const [dietary, setDietary] = useState<Set<string>>(new Set())
    const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
    const [error, setError] = useState<string | null>(null)

    function toggleDiet(opt: string) {
        setDietary((prev) => {
            const n = new Set(prev)
            n.has(opt) ? n.delete(opt) : n.add(opt)
            return n
        })
    }

    const canSend = name.trim() && status !== 'sending'   // contact is optional

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!canSend) return
        setStatus('sending')
        setError(null)
        try {
            await createRsvp({
                name: name.trim(),
                contact: contact.trim(),
                attending,
                guests: attending ? guests : 0,
                dietary: attending ? [...dietary] : [],
            })
            setStatus('done')
        } catch (err) {
            setStatus('error')
            setError((err as Error).message)
        }
    }

    if (status === 'done') {
        return (
            <div className="rsvp-thanks">
                <div style={{ fontSize: 40 }}>🎉</div>
                <p><strong>Thank you, {name.trim()}!</strong></p>
                <p className="muted">{attending
                    ? `We can't wait to celebrate with ${guests > 0 ? `all ${guests + 1} of you` : 'you'}.`
                    : "Sorry you can't make it — thanks for letting us know."}</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="rsvp-name">Full name</label>
            <input id="rsvp-name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />

            <label htmlFor="rsvp-contact">Email or phone (optional)</label>
            <input id="rsvp-contact" type="text" placeholder="Email or phone" value={contact} onChange={(e) => setContact(e.target.value)} />

            <label>Will you attend?</label>
            <div className="toggle">
                <button type="button" className={`toggle-opt${attending ? ' active' : ''}`} onClick={() => setAttending(true)}>Yes, I'll be there</button>
                <button type="button" className={`toggle-opt${!attending ? ' active' : ''}`} onClick={() => setAttending(false)}>Can't make it</button>
            </div>

            {attending && (
                <label htmlFor="rsvp-guests">Additional guests you're bringing</label>
            )}
            {attending && (
                <select id="rsvp-guests" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                    {Array.from({ length: 11 }, (_, n) => (
                        <option key={n} value={n}>{n === 0 ? 'Just me' : `+${n} guest${n === 1 ? '' : 's'}`}</option>
                    ))}
                </select>
            )}

            {attending && (
                <fieldset className="diet-set">
                    <legend>Dietary restrictions (optional)</legend>
                    {DIETARY_OPTIONS.map((opt) => (
                        <label key={opt} className="diet-opt">
                            <input type="checkbox" checked={dietary.has(opt)} onChange={() => toggleDiet(opt)} />
                            {opt}
                        </label>
                    ))}
                </fieldset>
            )}

            {error && <p className="error">Error: {error}</p>}
            <button className="btn" type="submit" disabled={!canSend}>
                {status === 'sending' ? 'Sending…' : 'Send RSVP'}
            </button>
        </form>
    )
}
