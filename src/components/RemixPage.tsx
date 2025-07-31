import React, { useState, useEffect } from 'react';

interface OriginalIP {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  remixCount: number;
  license: string;
  type: string;
  image: string;
  content: string;
  description: string;
}

interface RemixFormData {
  title: string;
  description: string;
  license: string;
  content: string;
}

const RemixPage = () => {
  const [originalIP, setOriginalIP] = useState<OriginalIP | null>(null);
  const [formData, setFormData] = useState<RemixFormData>({
    title: '',
    description: '',
    license: 'CC0',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const licenseOptions = [
    { value: 'CC0', label: 'CC0 - Public Domain' },
    { value: 'MIT', label: 'MIT License' },
    { value: 'CC BY', label: 'CC BY - Attribution' },
    { value: 'PUBLIC', label: 'Public Domain' }
  ];

  // Mock original IP data - will be fetched by IP ID
  useEffect(() => {
    // TODO: Fetch original IP by ID from URL params
    const mockOriginalIP: OriginalIP = {
      id: "1",
      title: "AI PROMPT #1",
      subtitle: "Space Cats Adventure",
      author: "0xc4f3...8d92",
      remixCount: 42,
      license: "CC0",
      type: "AI PROMPT",
      image: "https://images.pexels.com/photos/2194261/pexels-photo-2194261.jpeg?auto=compress&cs=tinysrgb&w=400",
      content: "Create a space adventure featuring cats as the main characters. The scene should be set in a futuristic space station with neon lights and floating platforms.",
      description: "A creative prompt for generating space-themed cat adventures"
    };

    setOriginalIP(mockOriginalIP);
    
    // Prefill form with original content
    setFormData({
      title: `Remix: ${mockOriginalIP.title}`,
      description: mockOriginalIP.description,
      license: mockOriginalIP.license,
      content: mockOriginalIP.content
    });
  }, []);

  const handleInputChange = (field: keyof RemixFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement actual IPFS upload and Origin SDK forkIP()
      
      
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Navigate to explore page or show success message
      
      
    } catch (error) {
      console.error('Error remixing IP:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!originalIP) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading original IP...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-black text-black mb-4">
          REMIX <span className="text-pepe-green">IP</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Fork existing IP with attribution. Create your own version while respecting the original creator.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Original IP Card */}
        <div className="bg-meme-white border-2 border-black rounded-lg p-6">
          <h2 className="text-2xl font-black text-black mb-4">ORIGINAL IP</h2>
          
          <div className="space-y-4">
            <div>
              <img 
                src={originalIP.image} 
                alt={originalIP.title}
                className="w-full h-48 object-cover rounded-lg border-2 border-black"
              />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-black mb-2">{originalIP.title}</h3>
              <p className="text-gray-600 mb-3">{originalIP.subtitle}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>By: {originalIP.author}</span>
                <span>🍴 {originalIP.remixCount} remixes</span>
              </div>
              
              <div className="bg-pepe-green text-black px-3 py-1 rounded text-xs font-bold border border-black inline-block mb-4">
                {originalIP.type}
              </div>
              
              <div className="bg-gray-100 px-3 py-1 rounded text-xs inline-block">
                License: {originalIP.license}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-black mb-2">Original Content:</h4>
              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded border">
                {originalIP.content}
              </p>
            </div>
          </div>
        </div>

        {/* Remix Form */}
        <div className="bg-meme-white border-2 border-black rounded-lg p-6">
          <h2 className="text-2xl font-black text-black mb-4">YOUR REMIX</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-black mb-2">
                TITLE *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 border-2 border-black rounded-lg bg-white focus:outline-none focus:border-pepe-green transition-colors"
                placeholder="Enter your remix title..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-black mb-2">
                DESCRIPTION *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 border-2 border-black rounded-lg bg-white focus:outline-none focus:border-pepe-green transition-colors resize-none"
                rows={3}
                placeholder="Describe your remix..."
                required
              />
            </div>

            {/* License */}
            <div>
              <label htmlFor="license" className="block text-sm font-bold text-black mb-2">
                LICENSE *
              </label>
              <select
                id="license"
                value={formData.license}
                onChange={(e) => handleInputChange('license', e.target.value)}
                className="w-full px-4 py-3 border-2 border-black rounded-lg bg-white focus:outline-none focus:border-pepe-green transition-colors"
                required
              >
                {licenseOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-bold text-black mb-2">
                YOUR REMIXED CONTENT *
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="w-full px-4 py-3 border-2 border-black rounded-lg bg-white focus:outline-none focus:border-pepe-green transition-colors resize-none"
                rows={6}
                placeholder="Create your remixed version..."
                required
              />
            </div>

            {/* Attribution Notice */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-yellow-600 mr-3">⚠️</div>
                <div>
                  <h4 className="font-bold text-yellow-800 mb-1">Attribution Required</h4>
                  <p className="text-yellow-700 text-sm">
                    This remix will be linked to the original IP by {originalIP.author}. 
                    Proper attribution will be maintained onchain.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-pepe-green hover:bg-green-600 disabled:bg-gray-400 text-black font-bold px-8 py-4 rounded-lg border-2 border-black transition-all duration-200"
              >
                {isSubmitting ? '⏳ REMIXING...' : '🍴 CREATE REMIX'}
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="bg-meme-white hover:bg-gray-50 text-black font-bold px-8 py-4 rounded-lg border-2 border-black transition-all duration-200"
              >
                ↩️ CANCEL
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RemixPage; 