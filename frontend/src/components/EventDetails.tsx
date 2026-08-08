import { EVENT, MAP_EMBED_URL, MAP_LINK_URL } from "../event"

export default function EventDetails() {
    return (
        <div className="event-details">
            <div className="event-row"><span className="event-icon">📅</span>
                <div><strong>{EVENT.date}</strong><br /><span className="muted">{EVENT.time}</span></div>
            </div>
            <div className="event-row"><span className="event-icon">📍</span>
                <div>
                    <strong>{EVENT.venue}</strong><br />
                    <a href={MAP_LINK_URL} target="_blank" rel="noopener noreferrer">{EVENT.address}</a>
                </div>
            </div>
            <iframe
                className="event-map"
                title="Event location map"
                src={MAP_EMBED_URL}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            />
            <a className="btn-outline" href={MAP_LINK_URL} target="_blank" rel="noopener noreferrer">
                Open in Google Maps ↗
            </a>
        </div>
    )
}
