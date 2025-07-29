import React from 'react';
import Navbar from '../components/Navbar';
import ExplorePageComponent from '../components/ExplorePage';
import Footer from '../components/Footer';

const ExplorePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ExplorePageComponent />
      <Footer />
    </div>
  );
};

export default ExplorePage; 