import EventDetails from "./EventDetails"
import RsvpForm from "./RsvpForm"
import { EVENT } from "../event"

// Event info + RSVP, shared by the landing page and the dedicated /rsvp page.
export default function EventAndRsvp() {
    return (
        <>
            <div className="panel">
                <div className="hero-label">You're invited</div>
                <h1 className="hero-title">{EVENT.title}</h1>
                <EventDetails />
            </div>

            <div className="panel">
                <h2 className="section-heading">RSVP</h2>
                <p className="muted" style={{ marginBottom: 16 }}>Please let us know if you can join us.</p>
                <RsvpForm />
            </div>
        </>
    )
}
