import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Travel from './pages/Travel';
import Accomodations from './pages/Accomodations';
import Event from './pages/Event';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/event">Event Schedule</Link></li>
            <li><Link to="/travel">Travel</Link></li>
            <li><Link to="/accomodations">Accomodations</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event" element={<Event />} />
          <Route path="/travel" element={<Travel />} />
          <Route path="/accomodations" element={<Accomodations />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;