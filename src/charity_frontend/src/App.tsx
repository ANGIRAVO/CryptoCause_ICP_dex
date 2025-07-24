import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import DashboardPage from './pages/DashboardPage';
import NFTsPage from './pages/NFTsPage';
import { ToastContainer } from './components/ToastContainer';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="/create-campaign" element={<CreateCampaignPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/nfts" element={<NFTsPage />} />
        </Routes>
      </main>
      
      <Footer />
      <ToastContainer />
    </div>
  );
}

export default App; 