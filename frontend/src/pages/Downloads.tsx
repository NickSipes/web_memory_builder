import { BASE } from "../api"

// Public page: two big buttons that hit the backend /download/* redirects,
// which 307 to a short-lived presigned S3 GET.
export default function Downloads() {
    return (
        <div className="page-stack">
            <div className="hero">
                <h1 className="hero-title">Jerry's 80th — Downloads</h1>
                <p className="hero-subtitle">Grab the keepsakes from the party.</p>
            </div>

            <div className="choice">
                <a className="choice-btn" href={`${BASE}/download/pictures`}>
                    <span className="choice-icon">🖼️</span>
                    <span className="choice-label">Download Pictures</span>
                    <span className="choice-sub">The birthday slideshow (PowerPoint)</span>
                </a>
                <a className="choice-btn" href={`${BASE}/download/video`}>
                    <span className="choice-icon">🎬</span>
                    <span className="choice-label">Download Video</span>
                    <span className="choice-sub">The full birthday video with music</span>
                </a>
            </div>
        </div>
    )
}
