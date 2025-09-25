import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Camera, Video, ArrowLeft } from 'lucide-react';
import InjuryRiskPredictor from './InjuryRiskPredictor';
import VideoAnalysis from './VideoAnalysis';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5" />
            <h1 className="text-xl font-bold text-gray-800">AI Injury Risk Predictor</h1>
          </Link>

          <div className="flex space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === '/'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Live Camera</span>
            </Link>

            <Link
              to="/video"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === '/video'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video Analysis</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<InjuryRiskPredictor />} />
          <Route path="/video" element={<VideoAnalysis />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;