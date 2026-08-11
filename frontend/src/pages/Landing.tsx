import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import RelationSelect from "../components/RelationSelect"
import Hero from "../components/Hero"
import RsvpCard from "../components/RsvpCard"

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
            <Hero />

            <div className="panel">
                <h2 className="section-heading">Leave a message</h2>
                <p className="muted" style={{ marginBottom: 16 }}>
                    Record a video or share photos. We'll play them for Jerry at the party,
                    and he gets the whole collection afterward.
                </p>

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
            </div>

            <RsvpCard />

            <Link to="/admin" className="admin-fab">Admin</Link>
        </div>
    )
}
