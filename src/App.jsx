import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Travel from './pages/Travel';
import Rsvp from './pages/RSVPPage.jsx';
import Engagement from './pages/Engagement';
import Details from './pages/Details';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/travel">Travel</NavLink></li>
            <li><NavLink to="/rsvp">RSVP</NavLink></li>
            <li><NavLink to="/details">Details</NavLink></li>
            <li><NavLink to="/engagement">Our Engagement</NavLink></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/travel" element={<Travel />} />
          <Route path="/rsvp" element={<Rsvp />} />
          <Route path="/details" element={<Details />} />
          <Route path="/engagement" element={<Engagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;