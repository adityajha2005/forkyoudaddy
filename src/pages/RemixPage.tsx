import React from 'react';
import Navbar from '../components/Navbar';
import RemixPageComponent from '../components/RemixPage';
import Footer from '../components/Footer';

const RemixPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <RemixPageComponent />
      <Footer />
    </div>
  );
};

export default RemixPage; 