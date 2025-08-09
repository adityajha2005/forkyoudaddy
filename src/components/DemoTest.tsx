import React, { useState, useEffect } from 'react';
import { setupDemoData, setupDemoWallet, clearDemoData, isDemoMode, testDemoData, getDemoAnalytics, getTrendingIPs, getTopEarningIPs } from '../utils/demoSetup';

const DemoTest: React.FC = () => {
  const [demoStatus, setDemoStatus] = useState<string>('Checking...');
  const [demoData, setDemoData] = useState<any>(null);
  const [liveRevenue, setLiveRevenue] = useState<number>(5.2);
  const [liveRemixes, setLiveRemixes] = useState<number>(479);
  const [liveUsers, setLiveUsers] = useState<number>(1250);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    checkDemoStatus();
    
    // Live counters for demo effect
    const revenueInterval = setInterval(() => {
      setLiveRevenue(prev => prev + (Math.random() * 0.01));
    }, 3000);
    
    const remixInterval = setInterval(() => {
      setLiveRemixes(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 5000);
    
    const userInterval = setInterval(() => {
      setLiveUsers(prev => prev + Math.floor(Math.random() * 2) + 1);
    }, 8000);

    return () => {
      clearInterval(revenueInterval);
      clearInterval(remixInterval);
      clearInterval(userInterval);
    };
  }, []);

  const checkDemoStatus = () => {
    const isDemo = isDemoMode();
    setDemoStatus(isDemo ? '✅ Demo Mode Active' : '❌ Demo Mode Inactive');
    
    if (isDemo) {
      const testData = testDemoData();
      setDemoData(testData);
    }
  };

  const handleSetupDemo = () => {
    try {
      setupDemoData();
      setupDemoWallet();
      checkDemoStatus();
      alert('🎉 Demo data setup complete! Check console for details.');
    } catch (error) {
      alert('❌ Error setting up demo data: ' + error);
    }
  };

  const handleClearDemo = () => {
    try {
      clearDemoData();
      setDemoData(null);
      checkDemoStatus();
      alert('🧹 Demo data cleared!');
    } catch (error) {
      alert('❌ Error clearing demo data: ' + error);
    }
  };

  const handleTestDemo = () => {
    const testData = testDemoData();
    setDemoData(testData);
    console.log('🧪 Demo test results:', testData);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed top-4 left-4 z-50 bg-pepe-green hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg border-2 border-black shadow-lg transition-all duration-200"
      >
        🧪 Show Demo Panel
      </button>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50 max-w-md">
      <div className="bg-white border-2 border-black rounded-lg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-black">🧪 Demo Test Panel</h3>
          <button
            onClick={toggleVisibility}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Status */}
          <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-lg">
            <div className="flex items-center justify-between">
              <strong className="text-green-800">Status:</strong>
              <span className={`font-bold ${demoStatus.includes('Active') ? 'text-green-600' : 'text-red-600'}`}>
                {demoStatus}
              </span>
            </div>
          </div>

          {/* Live Counters */}
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-bold">💰 Live Revenue:</span>
                <span className="text-blue-600 font-black text-lg">{liveRevenue.toFixed(3)} ETH</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-purple-800 font-bold">🍴 Live Remixes:</span>
                <span className="text-purple-600 font-black text-lg">{liveRemixes.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-orange-800 font-bold">👥 Live Users:</span>
                <span className="text-orange-600 font-black text-lg">{liveUsers.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleSetupDemo}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-4 py-3 rounded-lg border-2 border-black transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🚀 Setup Demo Data
            </button>
            
            <button
              onClick={handleClearDemo}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold px-4 py-3 rounded-lg border-2 border-black transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🧹 Clear Demo Data
            </button>
            
            <button
              onClick={handleTestDemo}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-4 py-3 rounded-lg border-2 border-black transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🧪 Test Demo Data
            </button>
          </div>

          {/* Demo Data Display */}
          {demoData && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg p-4">
              <h4 className="font-bold text-lg mb-3 text-gray-800">📊 Demo Data Summary:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-2 rounded border">
                  <div className="font-bold text-green-600">IPs: {demoData.ips?.length || 0}</div>
                </div>
                <div className="bg-white p-2 rounded border">
                  <div className="font-bold text-blue-600">Users: {demoData.users?.length || 0}</div>
                </div>
                <div className="bg-white p-2 rounded border">
                  <div className="font-bold text-purple-600">Licenses: {demoData.licenses?.length || 0}</div>
                </div>
                <div className="bg-white p-2 rounded border">
                  <div className="font-bold text-orange-600">Revenue: {demoData.analytics?.totalRevenue || '0 ETH'}</div>
                </div>
              </div>
              
              {demoData.ips && demoData.ips.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-bold mb-2 text-gray-800">🔥 Trending IPs:</h5>
                  <div className="space-y-2">
                    {demoData.ips.slice(0, 3).map((ip: any) => (
                      <div key={ip.id} className="bg-white p-3 rounded border border-gray-200">
                        <div className="font-bold text-sm text-gray-800">{ip.title}</div>
                        <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                          <span>🍴 {ip.remixCount} remixes</span>
                          <span>💰 {ip.revenue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg p-4">
            <h4 className="font-bold text-yellow-800 mb-2">⚡ Quick Stats:</h4>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>• Total Revenue: 5.2 ETH</div>
              <div>• Total Remixes: 479</div>
              <div>• Trending IPs: 8</div>
              <div>• Active Users: 1,250</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded border">
            <p className="font-bold mb-2">📋 Demo Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Setup Demo Data" to populate the app</li>
              <li>Navigate to /explore to see trending IPs</li>
              <li>Check /dashboard for impressive analytics</li>
              <li>Use "Test Demo Data" to verify setup</li>
              <li>Watch live counters update automatically</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoTest; 