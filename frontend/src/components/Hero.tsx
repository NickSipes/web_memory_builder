import { EVENT } from "../event"

// The single page header: whose birthday it is, and the two things you can do.
export default function Hero() {
    return (
        <div className="hero">
            <div className="hero-label">{EVENT.shortDate} · {EVENT.city}</div>
            <h1 className="hero-title">{EVENT.title}</h1>
        </div>
    )
}
