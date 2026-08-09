import EventDetails from "./EventDetails"
import RsvpForm from "./RsvpForm"
import { EVENT } from "../event"

// One tile: the invitation/event details up top, then the RSVP form below.
export default function EventAndRsvp() {
    return (
        <div className="panel">
            <div className="hero-label">You're invited</div>
            <h1 className="hero-title">{EVENT.title}</h1>
            <EventDetails />

            <hr className="divider" />

            <h2 className="section-heading">RSVP</h2>
            <p className="muted" style={{ marginBottom: 16 }}>Let us know if you can join us.</p>
            <RsvpForm />
        </div>
    )
}
