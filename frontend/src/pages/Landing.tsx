import { Link } from "react-router-dom"
import Hero from "../components/Hero"

// A simple hub: set the occasion, then point people at the two things to do.
export default function Landing() {
    return (
        <div className="page-stack">
            <Hero />

            <div className="choice">
                <Link to="/message" className="choice-btn">
                    <span className="choice-icon">🎥</span>
                    <span className="choice-label">Leave a message for Jerry</span>
                    <span className="choice-sub">Record or upload a video, photo, or note</span>
                </Link>
                <Link to="/rsvp" className="choice-btn">
                    <span className="choice-icon">📅</span>
                    <span className="choice-label">Event details &amp; RSVP</span>
                    <span className="choice-sub">When &amp; where, and let us know you're coming</span>
                </Link>
                <Link to="/browse" className="choice-btn">
                    <span className="choice-icon">🎬</span>
                    <span className="choice-label">Browse messages</span>
                    <span className="choice-sub">See the videos, photos, and notes so far</span>
                </Link>
            </div>

            <Link to="/admin" className="admin-fab">Admin</Link>
        </div>
    )
}
