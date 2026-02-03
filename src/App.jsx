import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Travel from './pages/Travel';
import Event from './pages/Event';
import Rsvp from './pages/Rsvp.jsx';
import Engagement from './pages/Engagement';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/event">Schedule</NavLink></li>
            <li><NavLink to="/travel">Travel</NavLink></li>
            <li><NavLink to="/rsvp">RSVP</NavLink></li>
            <li><NavLink to="/engagement">Our Engagement</NavLink></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event" element={<Event />} />
          <Route path="/travel" element={<Travel />} />
          <Route path="/rsvp" element={<Rsvp />} />
          <Route path="/engagement" element={<Engagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;