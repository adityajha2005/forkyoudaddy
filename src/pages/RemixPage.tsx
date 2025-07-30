import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { forkIP } from '../services/campOrigin';
import { uploadToIPFS, uploadFileToIPFS } from '../services/ipfs';
import { addIP } from '../services/ipService';

interface IP {
  id: string;
  title: string;
  description: string;
  content: string;
  contentType: 'text' | 'image';
  license: string;
  author: string;
  createdAt: string;
  remixCount: number;
  cid: string;
  contentURI: string;
}

interface RemixForm {
  title: string;
  description: string;
  content: string;
  license: string;
  file?: File;
}

const RemixPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [originalIP, setOriginalIP] = useState<IP | null>(null);
  const [mode, setMode] = useState<'remix' | 'view'>('remix');
  const [formData, setFormData] = useState<RemixForm>({
    title: '',
    description: '',
    content: '',
    license: 'MIT'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get IP data from navigation state
  useEffect(() => {
    if (location.state?.originalIP) {
      const ip = location.state.originalIP as IP;
      setOriginalIP(ip);
      setMode(location.state.mode || 'remix');
      
      // Prefill form for remix mode
      if (location.state.mode === 'remix') {
        setFormData({
          title: `Remix: ${ip.title}`,
          description: `A remix of "${ip.title}"`,
          content: ip.content,
          license: ip.license
        });
      }
    } else {
      // No IP data, redirect to explore
      navigate('/explore');
    }
  }, [location.state, navigate]);

  const handleInputChange = (field: keyof RemixForm, value: string | File) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleInputChange('file', file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!originalIP) {
      alert('No original IP found');
      return;
    }

    if (!formData.title || !formData.description) {
      alert('Please fill in title and description');
      return;
    }
    
    // For image content, either file or content is acceptable
    if (originalIP.contentType === 'image' && !formData.file && !formData.content) {
      // For image IPs, if no new file is uploaded, we'll use the original image
      console.log('Using original image for remix');
    } else if (originalIP.contentType === 'text' && !formData.content) {
      alert('Please provide content for text IP');
      return;
    }

    setIsSubmitting(true);

    try {
      let ipfsResult;
      
      // Upload content to IPFS
      if (formData.file) {
        ipfsResult = await uploadFileToIPFS(formData.file);
      } else if (originalIP.contentType === 'image') {
        // For image content without a new file, upload the original image content
        const imageBlob = await fetch(originalIP.content).then(r => r.blob());
        const imageFile = new File([imageBlob], 'image.png', { type: 'image/png' });
        ipfsResult = await uploadFileToIPFS(imageFile);
      } else {
        ipfsResult = await uploadToIPFS(formData.content);
      }

      if (!ipfsResult.success) {
        throw new Error(ipfsResult.error || 'IPFS upload failed');
      }

      // Fork IP via Camp Origin SDK
      const result = await forkIP(originalIP.id, {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        license: formData.license
      });

      if (result.success) {
        // Also add to local storage for graph visualization
        // For image content, use the original image content if no new file is provided
        let contentToStore = formData.content;
        if (originalIP.contentType === 'image' && !formData.file) {
          // If forking an image but no new file is provided, use the original image content
          contentToStore = originalIP.content;
        }
        
        await addIP({
          title: formData.title,
          description: formData.description,
          content: contentToStore,
          contentType: originalIP.contentType,
          license: formData.license,
          author: 'Current User', // This would come from wallet
          cid: ipfsResult.cid,
          contentURI: ipfsResult.url
        }, originalIP.id);

        alert('IP forked successfully!');
        navigate('/explore'); // Redirect to explore page
      } else {
        throw new Error('Failed to fork IP onchain');
      }

    } catch (error) {
      console.error('Error forking IP:', error);
      alert(`Failed to fork IP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!originalIP) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pepe-green mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading IP...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-black mb-4">
              {mode === 'remix' ? '🍴 REMIX IP' : '👁️ VIEW IP'}
            </h1>
            <p className="text-lg text-gray-600">
              {mode === 'remix' 
                ? 'Create your own version of this IP!' 
                : 'View the original IP details'
              }
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Original IP Card */}
            <div className="bg-white border-2 border-black rounded-lg shadow-lg overflow-hidden">
              <h2 className="text-2xl font-bold text-black p-6 border-b-2 border-gray-200">Original IP</h2>
              
              {mode === 'view' && originalIP.contentType === 'image' ? (
                // View mode with image layout
                <div className="flex">
                  {/* Left side - Details */}
                  <div className="w-1/2 p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                        {originalIP.title}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                        {originalIP.description}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">License</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                          {originalIP.license}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Author</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                          <a 
                            href={`https://explorer.campnetwork.xyz/address/${originalIP.author}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline break-all"
                          >
                            {originalIP.author}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Remix Count</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                          🍴 {originalIP.remixCount}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Created</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                          {new Date(originalIP.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">IPFS Hash</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                        <a 
                          href={`https://ipfs.io/ipfs/${originalIP.cid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all font-mono text-sm"
                        >
                          {originalIP.cid}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Full height image */}
                  <div className="w-1/2 bg-gray-100">
                    <img 
                      src={originalIP.content}
                      alt={originalIP.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to IPFS if Supabase content fails
                        e.currentTarget.src = `https://ipfs.io/ipfs/${originalIP.cid}`;
                      }}
                    />
                  </div>
                </div>
              ) : (
                // Default layout for remix mode or text content
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                      {originalIP.title}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                      {originalIP.description}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Content</label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                      {originalIP.contentType === 'image' ? (
                        <div>
                          <img 
                            src={originalIP.content}
                            alt={originalIP.title}
                            className="w-full h-48 object-cover rounded border border-gray-300"
                            onError={(e) => {
                              // Fallback to IPFS if Supabase content fails
                              e.currentTarget.src = `https://ipfs.io/ipfs/${originalIP.cid}`;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="font-mono text-sm">
                          {originalIP.content}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">License</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                        {originalIP.license}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Author</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                        <a 
                          href={`https://explorer.campnetwork.xyz/address/${originalIP.author}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {originalIP.author}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Remix Count</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                        🍴 {originalIP.remixCount}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Created</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                        {new Date(originalIP.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">IPFS Hash</label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                      <a 
                        href={`https://ipfs.io/ipfs/${originalIP.cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline break-all font-mono text-sm"
                      >
                        {originalIP.cid}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Remix Form (only show in remix mode) */}
            {mode === 'remix' && (
              <div className="bg-white border-2 border-black rounded-lg shadow-lg p-6 mt-8">
                <h2 className="text-2xl font-bold text-black mb-4">Your Remix</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
                      TITLE *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none font-medium"
                      placeholder="Enter your remix title..."
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
                      DESCRIPTION *
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none font-medium"
                      placeholder="Describe your remix..."
                      required
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label htmlFor="content" className="block text-sm font-bold text-gray-700 mb-2">
                      CONTENT *
                    </label>
                    {originalIP.contentType === 'image' ? (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-2">
                            Upload New Image (Optional)
                          </label>
                          <input
                            type="file"
                            id="imageFile"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none font-medium"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Leave empty to keep the original image
                          </p>
                        </div>
                        <div>
                          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                            Description/Notes
                          </label>
                          <textarea
                            id="content"
                            value={formData.content}
                            onChange={(e) => handleInputChange('content', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none font-medium"
                            placeholder="Add notes about your remix..."
                          />
                        </div>
                      </div>
                    ) : (
                      <textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none font-medium"
                        placeholder="Your remixed content..."
                        required
                      />
                    )}
                  </div>

                  {/* License */}
                  <div>
                    <label htmlFor="license" className="block text-sm font-bold text-gray-700 mb-2">
                      LICENSE *
                    </label>
                    <select
                      id="license"
                      value={formData.license}
                      onChange={(e) => handleInputChange('license', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none font-medium"
                      required
                    >
                      <option value="MIT">MIT</option>
                      <option value="CC-BY-SA">CC-BY-SA</option>
                      <option value="CC-BY">CC-BY</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-pepe-green hover:bg-green-600 disabled:bg-gray-400 text-black font-bold py-3 px-6 rounded-lg border-2 border-black transition-colors duration-200"
                    >
                      {isSubmitting ? '🍴 FORKING...' : '🍴 FORK IP'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/explore')}
              className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-6 rounded-lg border-2 border-black transition-colors duration-200"
            >
              ← BACK TO EXPLORE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemixPage; 