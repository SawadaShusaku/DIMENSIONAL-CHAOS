import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Library from './Library';

export default function App() {
  return (
    <Router>
      <nav className="global-nav">
        <Link to="/" className="nav-link">CHAOS SCENE</Link>
        <Link to="/library" className="nav-link">MODEL LIBRARY</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </Router>
  );
}
