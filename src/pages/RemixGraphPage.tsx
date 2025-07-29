import React from 'react';
import Navbar from '../components/Navbar';
import RemixGraph from '../components/RemixGraph';
import Footer from '../components/Footer';

const RemixGraphPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <RemixGraph />
      <Footer />
    </div>
  );
};

export default RemixGraphPage; 