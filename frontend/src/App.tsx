import { BrowserRouter, Routes, Route, NavLink, Link } from "react-router-dom";
import Landing from './pages/Landing'
import Message from './pages/Message'
import Browse from './pages/Browse'
import Record from './pages/Record'
import Confirm from './pages/Confirm'
import Admin from './pages/Admin'
import Rsvp from './pages/Rsvp'
import ReportBug from './pages/ReportBug'

export default function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <NavLink to="/" end className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>Home</NavLink>
        <div className="nav-tabs">
          <NavLink to="/message" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>Leave a message</NavLink>
          <NavLink to="/rsvp" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>Event & RSVP</NavLink>
          <NavLink to="/browse" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>Browse messages</NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/message" element={<Message />} />
        <Route path="/rsvp" element={<Rsvp />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/record" element={<Record />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/report-bug" element={<ReportBug />} />
      </Routes>

      <footer className="site-footer">
        <p className="footer-contact">
          Questions? Reach out to John Sipes (
          <a href="tel:+17575100156">757-510-0156</a>,{' '}
          <a href="mailto:johnsipes@verizon.net">johnsipes@verizon.net</a>)
        </p>
        <Link to="/report-bug">🐞 Report a bug</Link>
      </footer>
    </BrowserRouter>
  )
}
