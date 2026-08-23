import { EVENT, MAP_EMBED_URL, MAP_LINK_URL } from "../event"

export default function EventDetails() {
    return (
        <div className="event-details">
            <div className="surprise-note">
                🤫 <strong>It's a surprise!</strong> Please keep it a secret. Arrive by{' '}
                <strong>{EVENT.arrival}</strong> so everyone is seated before Jerry arrives at 5:00 PM.
            </div>

            <div className="event-row"><span className="event-icon">📅</span>
                <div><strong>{EVENT.date}</strong><br /><span className="muted">Arrive {EVENT.arrival} · party {EVENT.time}</span></div>
            </div>
            <div className="event-row"><span className="event-icon">📍</span>
                <div>
                    <strong>{EVENT.venue}</strong><br />
                    <a href={MAP_LINK_URL} target="_blank" rel="noopener noreferrer">{EVENT.address}</a>
                </div>
            </div>
            <div className="event-row"><span className="event-icon">🍽️</span>
                <div><span className="muted">Food will be provided.</span></div>
            </div>

            <iframe
                className="event-map"
                title="Event location map"
                src={MAP_EMBED_URL}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            />
        </div>
    )
}
