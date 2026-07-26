import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import RelationSelect from "../components/RelationSelect"

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
        <div className="panel">
            <div className="hero-label">80th Birthday Celebration</div>
            <h1 className="hero-title">Leave a message<br />for Grandpa Jerry</h1>
            <p className="hero-subtitle">Your message will be part of a video he'll treasure forever.</p>

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

            <Link to="/admin" className="admin-fab">Admin</Link>
        </div>
    )
}
