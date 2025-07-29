import React from 'react';

const RemixGraph = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="bg-meme-white border-2 border-black rounded-lg p-12 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-black mb-6">
          LIVE REMIX <span className="text-pepe-green">GRAPH</span>
        </h2>
        <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
          Trace remix lineage in a beautiful graph view. See how ideas evolve, fork, and spread across the creative network.
        </p>
        
        {/* Placeholder Graph Visualization */}
        <div className="bg-gray-50 border-2 border-black rounded-lg p-8 mb-8 min-h-[300px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-600 text-lg font-bold">
              Interactive remix graph visualization
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Coming soon...
            </p>
          </div>
        </div>
        
        <button className="bg-pepe-green hover:bg-green-600 text-black font-bold px-8 py-4 rounded-lg border-2 border-black transition-all duration-200">
          🚀 OPEN REMIX GRAPH
        </button>
      </div>
    </div>
  );
};

export default RemixGraph;