import React from 'react';
import { Wallet, Upload, Globe, GitFork } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Connect Wallet",
      description: "Link your Web3 wallet to start creating and remixing content",
      icon: <Wallet className="w-8 h-8" />
    },
    {
      number: "02", 
      title: "Upload or Remix",
      description: "Create original content or fork existing IP from the platform",
      icon: <Upload className="w-8 h-8" />
    },
    {
      number: "03",
      title: "Register Onchain",
      description: "Use Origin SDK to mint your creation with proper attribution",
      icon: <Globe className="w-8 h-8" />
    },
    {
      number: "04",
      title: "Watch it Fork",
      description: "See your ideas spread and evolve across the creator network",
      icon: <GitFork className="w-8 h-8" />
    }
  ];

  return (
    <div className="border-t-2 border-black py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
            HOW IT <span className="text-pepe-green">WORKS</span>
          </h2>
          <p className="text-lg text-gray-500">
            From idea to onchain IP in 4 simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-pepe-green border-2 border-black w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-6">
                {step.icon}
              </div>
              <div className="text-3xl font-black text-black mb-2">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-black mb-3">
                {step.title}
              </h3>
              <p className="text-gray-500 text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;