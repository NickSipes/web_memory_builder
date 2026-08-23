import { EVENT } from "../event"

// The single page header: whose birthday it is, and the two things you can do.
export default function Hero() {
    return (
        <div className="hero">
            <div className="hero-label">{EVENT.shortDate} · {EVENT.city}</div>
            <h1 className="hero-title">{EVENT.title}</h1>
            <p className="hero-subtitle">
                It's a surprise! RSVP for the party, and leave a video, photo, or note
                we'll play for him during the celebration.
            </p>
        </div>
    )
}
