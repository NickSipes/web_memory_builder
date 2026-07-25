import { useNavigate } from "react-router-dom"

export default function Confirm() {
    const navigate = useNavigate()
    return (
        <div className="panel confirm">
            <div className="confirm-circle"><div className="confirm-check">🎂</div></div>
            <div className="confirm-title">Jerry will love this.</div>
            <p className="confirm-sub">Your message has been saved.<br />He'll see it on his birthday.</p>
            <div className="btn-row">
                <button className="btn-outline" onClick={() => navigate('/')}>Add another message</button>
                <button className="btn" onClick={() => navigate('/browse')}>Browse all messages</button>
            </div>
        </div>
    )
}
