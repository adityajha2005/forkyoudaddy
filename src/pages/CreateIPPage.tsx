import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { registerIP } from '../services/campOrigin';
import { uploadToIPFS, uploadFileToIPFS } from '../services/ipfs';
import { addIP } from '../services/ipService';

interface CreateIPForm {
  title: string;
  description: string;
  contentType: 'text' | 'image';
  license: string;
  content: string;
  file?: File;
}

const CreateIPPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateIPForm>({
    title: '',
    description: '',
    contentType: 'text',
    license: 'MIT',
    content: ''
  });

  const licenseOptions = [
    { value: 'MIT', label: 'MIT License' },
    { value: 'CC0', label: 'Creative Commons Zero' },
    { value: 'CC-BY', label: 'Creative Commons Attribution' },
    { value: 'CC-BY-SA', label: 'Creative Commons Attribution-ShareAlike' },
    { value: 'CC-BY-NC', label: 'Creative Commons Attribution-NonCommercial' },
    { value: 'CC-BY-NC-SA', label: 'Creative Commons Attribution-NonCommercial-ShareAlike' }
  ];

  const handleInputChange = (field: keyof CreateIPForm, value: string | File) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file,
        contentType: 'image'
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.title || !formData.description || (!formData.content && !formData.file)) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if user is connected to wallet first
    if (!window.ethereum?.selectedAddress) {
      alert('Please connect your wallet first to create an IP.');
      return;
    }

    setIsSubmitting(true);

    try {
      let ipfsResult;
      
      // Upload content to IPFS
      if (formData.contentType === 'image' && formData.file) {
        ipfsResult = await uploadFileToIPFS(formData.file);
      } else {
        ipfsResult = await uploadToIPFS(formData.content);
      }

      if (!ipfsResult.success) {
        throw new Error(ipfsResult.error || 'IPFS upload failed');
      }

      // Register IP onchain via Camp Origin SDK
      const result = await registerIP({
        title: formData.title,
        description: formData.description,
        content: formData.content,
        license: formData.license,
        contentURI: ipfsResult.url
      });

      if (result.success) {
        // Save IP to localStorage for Explore page
        await addIP({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          contentType: formData.contentType,
          license: formData.license,
          author: window.ethereum?.selectedAddress || 'Unknown',
          cid: ipfsResult.cid,
          contentURI: ipfsResult.url
        });

        alert('IP registered successfully!');
        navigate('/explore'); // Redirect to explore page
      } else {
        throw new Error('Failed to register IP onchain');
      }

    } catch (error) {
      console.error('Error creating IP:', error);
      alert(`Failed to create IP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-black mb-4">
              CREATE NEW IP
            </h1>
            <p className="text-lg text-gray-600">
              Register your original content onchain and make it remixable! 🚀
            </p>
          </div>

          {/* Form */}
          <div className="bg-white border-2 border-black rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your IP title..."
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
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none font-medium"
                  placeholder="Describe your IP..."
                  required
                />
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  CONTENT TYPE *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="text"
                      checked={formData.contentType === 'text'}
                      onChange={(e) => handleInputChange('contentType', e.target.value)}
                      className="mr-2"
                    />
                    <span className="font-medium">Text</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="image"
                      checked={formData.contentType === 'image'}
                      onChange={(e) => handleInputChange('contentType', e.target.value)}
                      className="mr-2"
                    />
                    <span className="font-medium">Image</span>
                  </label>
                </div>
              </div>

              {/* Content */}
              {formData.contentType === 'text' ? (
                <div>
                  <label htmlFor="content" className="block text-sm font-bold text-gray-700 mb-2">
                    CONTENT *
                  </label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none font-medium"
                    placeholder="Enter your content here..."
                    required
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="file" className="block text-sm font-bold text-gray-700 mb-2">
                    UPLOAD IMAGE *
                  </label>
                  <input
                    type="file"
                    id="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none font-medium"
                    required
                  />
                  {formData.file && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(formData.file)} 
                        alt="Preview" 
                        className="max-w-xs rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              )}

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
                  {licenseOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-pepe-green hover:bg-green-600 disabled:bg-gray-400 text-black font-bold py-4 px-8 rounded-lg border-2 border-black transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '🔄 REGISTERING IP...' : '🚀 REGISTER IP'}
                </button>
              </div>
            </form>
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-800 mb-3">ℹ️ How it works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>Your content gets uploaded to IPFS (decentralized storage)</li>
              <li>IP gets registered onchain via Camp Network</li>
              <li>Others can discover and remix your IP</li>
              <li>You maintain attribution and ownership</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateIPPage; 