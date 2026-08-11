import EventDetails from "./EventDetails"
import RsvpForm from "./RsvpForm"

// Event details + map, then the RSVP form. The birthday headline lives in <Hero>.
export default function RsvpCard() {
    return (
        <div className="panel">
            <EventDetails />
            <hr className="divider" />
            <h2 className="section-heading">RSVP</h2>
            <RsvpForm />
        </div>
    )
}
