import React, { useState } from 'react';

interface CreateIPFormData {
  title: string;
  description: string;
  contentType: 'text' | 'image';
  license: string;
  content: string;
}

const CreateIPPage = () => {
  const [formData, setFormData] = useState<CreateIPFormData>({
    title: '',
    description: '',
    contentType: 'text',
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

  const handleInputChange = (field: keyof CreateIPFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement actual IPFS upload and Origin SDK registration
      
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Navigate to explore page or show success message
      
      
    } catch (error) {
      console.error('Error creating IP:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-black text-black mb-4">
          CREATE <span className="text-pepe-green">IP</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Register your original idea as onchain IP. Upload to IPFS and register with Camp Origin SDK.
        </p>
      </div>

      {/* Form */}
      <div className="bg-meme-white border-2 border-black rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Enter your IP title..."
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
              placeholder="Describe your IP..."
              required
            />
          </div>

          {/* Content Type */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              CONTENT TYPE *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contentType"
                  value="text"
                  checked={formData.contentType === 'text'}
                  onChange={(e) => handleInputChange('contentType', e.target.value)}
                  className="mr-2"
                />
                <span className="font-medium">📝 TEXT</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contentType"
                  value="image"
                  checked={formData.contentType === 'image'}
                  onChange={(e) => handleInputChange('contentType', e.target.value)}
                  className="mr-2"
                />
                <span className="font-medium">🖼️ IMAGE</span>
              </label>
            </div>
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
              CONTENT *
            </label>
            {formData.contentType === 'text' ? (
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="w-full px-4 py-3 border-2 border-black rounded-lg bg-white focus:outline-none focus:border-pepe-green transition-colors resize-none"
                rows={6}
                placeholder="Enter your content here..."
                required
              />
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">📁</div>
                <p className="text-gray-600 mb-4">
                  Drag and drop your image here, or click to browse
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // TODO: Handle file upload
              
                    }
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-pepe-green hover:bg-green-600 text-black font-bold px-6 py-3 rounded-lg border-2 border-black transition-all duration-200 cursor-pointer"
                >
                  📁 CHOOSE FILE
                </label>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-pepe-green hover:bg-green-600 disabled:bg-gray-400 text-black font-bold px-8 py-4 rounded-lg border-2 border-black transition-all duration-200"
            >
              {isSubmitting ? '⏳ UPLOADING...' : '🚀 CREATE IP'}
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
  );
};

export default CreateIPPage; 