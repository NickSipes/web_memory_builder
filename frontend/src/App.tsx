import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Landing from './pages/Landing'
import Browse from './pages/Browse'
import Record from './pages/Record'
import Confirm from './pages/Confirm'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <NavLink to="/" className="nav-brand">For Jerry 🎂</NavLink>
        <div className="nav-tabs">
          <NavLink to="/" end className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>Leave a message</NavLink>
          <NavLink to="/browse" className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>Browse messages</NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/record" element={<Record />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
