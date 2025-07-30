import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ExploreSection from './components/ExploreSection';
import HowItWorks from './components/HowItWorks';
import RemixGraph from './components/RemixGraph';
import Footer from './components/Footer';
import ExplorePage from './pages/ExplorePage';
import CreateIPPage from './pages/CreateIPPage';
import RemixPage from './pages/RemixPage';
import RemixGraphPage from './pages/RemixGraphPage';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-meme-white via-gray-50 via-pepe-green/5 to-dank-yellow/10">
        <Routes>
          {/* Home Page */}
          <Route path="/" element={
            <>
              <Navbar />
              <Hero />
              <ExploreSection />
              <HowItWorks />
              <RemixGraph />
              <Footer />
            </>
          } />
          
          {/* Explore Page */}
          <Route path="/explore" element={<ExplorePage />} />
          
          {/* Create IP Page */}
          <Route path="/create" element={<CreateIPPage />} />
          
          {/* Remix Graph Page */}
          <Route path="/graph" element={<RemixGraphPage />} />
          
          {/* Remix Page */}
          <Route path="/remix" element={<RemixPage />} />
          
          {/* User Dashboard */}
          <Route path="/dashboard" element={<UserDashboard />} />
          
          {/* IP Details Page (for future use) */}
          <Route path="/ip/:id" element={<RemixPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;