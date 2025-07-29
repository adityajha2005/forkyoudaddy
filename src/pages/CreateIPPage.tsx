import React from 'react';
import Navbar from '../components/Navbar';
import CreateIPPageComponent from '../components/CreateIPPage';
import Footer from '../components/Footer';

const CreateIPPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <CreateIPPageComponent />
      <Footer />
    </div>
  );
};

export default CreateIPPage; 