import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import RelationSelect from "../components/RelationSelect"
import EventAndRsvp from "../components/EventAndRsvp"

export default function Landing() {
    const [name, setName] = useState<string>("")
    const [relation, setRelation] = useState<string>("")
    const navigate = useNavigate()

    const canContinue = name.trim().length > 0 && relation.length > 0

    function handleContinue() {
        if (!canContinue) return
        navigate('/record', { state: { name: name.trim(), relation } })
    }

    return (
        <div className="page-stack">
            <div className="panel">
            <h1 className="hero-title">Leave a message<br />for Jerry Sipes</h1>
            <p className="hero-subtitle">Record a short video or share a few photos to celebrate his 80th birthday.</p>

            <ul className="how-list">
                <li><span>🎥</span> All videos will be compiled into one keepsake film we'll play at his party.</li>
                <li><span>🖼️</span> Photos become a slideshow shown at the celebration.</li>
                <li><span>🎁</span> After the party, Jerry gets full access to this website and everything in it.</li>
            </ul>

            <label htmlFor="name-input">Your name</label>
            <input
                id="name-input"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <label htmlFor="relation-select">Your relation to Jerry</label>
            <RelationSelect value={relation} onChange={setRelation} />

            <button className="btn" onClick={handleContinue} disabled={!canContinue}>
                Continue →
            </button>

            <div className="confetti-row">
                {['#E8C97A', '#C9963A', '#E8C97A', '#C9963A', '#E8C97A'].map((c, i) => (
                    <div key={i} className="confetti-dot" style={{ background: c }} />
                ))}
            </div>

            </div>

            <EventAndRsvp />

            <Link to="/admin" className="admin-fab">Admin</Link>
        </div>
    )
}
