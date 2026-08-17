import { BrowserRouter, Routes, Route, NavLink, Link } from "react-router-dom";
import Landing from './pages/Landing'
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
        <NavLink to="/" className="nav-brand">Jerry Sipes' 80th 🎂</NavLink>
        <div className="nav-tabs">
          <NavLink to="/" end className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>Leave a message</NavLink>
          <NavLink to="/rsvp" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>RSVP</NavLink>
          <NavLink to="/browse" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>Browse messages</NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/rsvp" element={<Rsvp />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/record" element={<Record />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/report-bug" element={<ReportBug />} />
      </Routes>

      <footer className="site-footer">
        <Link to="/report-bug">🐞 Report a bug</Link>
      </footer>
    </BrowserRouter>
  )
}
