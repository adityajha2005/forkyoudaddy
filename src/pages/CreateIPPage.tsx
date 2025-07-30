import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TagSelector from '../components/TagSelector';
import { addIP } from '../services/ipService';
import { registerIP } from '../services/campOrigin';
import { uploadToIPFS, uploadFileToIPFS } from '../services/ipfs';
import { generateContentSuggestions, generateImageFromPrompt, generateMemeFromPrompt } from '../services/aiService';

interface CreateIPForm {
  title: string;
  description: string;
  contentType: 'text' | 'image';
  license: string;
  content: string;
  file?: File;
  tags: string[];
  category: string;
}

interface AISuggestion {
  title: string;
  description: string;
  content: string;
  tags: string[];
  confidence: number;
}

const CreateIPPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [formData, setFormData] = useState<CreateIPForm>({
    title: '',
    description: '',
    contentType: 'text',
    license: 'MIT',
    content: '',
    tags: [],
    category: ''
  });

  const licenseOptions = [
    { value: 'MIT', label: 'MIT License' },
    { value: 'CC0', label: 'Creative Commons Zero' },
    { value: 'CC-BY', label: 'Creative Commons Attribution' },
    { value: 'CC-BY-SA', label: 'Creative Commons Attribution-ShareAlike' },
    { value: 'CC-BY-NC', label: 'Creative Commons Attribution-NonCommercial' },
    { value: 'CC-BY-NC-SA', label: 'Creative Commons Attribution-NonCommercial-ShareAlike' }
  ];

  const handleInputChange = (field: keyof CreateIPForm, value: string | File | string[]) => {
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

  // AI Integration Functions
  const generateAISuggestions = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a prompt for AI suggestions');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const result = await generateContentSuggestions(aiPrompt, formData.contentType);
      if (result.success && result.suggestions.length > 0) {
        setAiSuggestions(result.suggestions);
        setShowAIPanel(true);
      } else {
        alert('No AI suggestions generated. Please try a different prompt.');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('AI generation failed. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const generateAIImage = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a prompt for image generation');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const result = await generateImageFromPrompt(aiPrompt);
      if (result.success && result.imageUrl) {
        // Convert blob URL to file
        const response = await fetch(result.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'ai-generated-image.png', { type: 'image/png' });
        
        setFormData(prev => ({
          ...prev,
          file,
          contentType: 'image'
        }));
        
        alert('AI-generated image added to your form!');
      } else {
        alert('Image generation failed. Please try again.');
      }
    } catch (error) {
      console.error('Image generation failed:', error);
      alert('Image generation failed. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const generateAIMeme = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a prompt for meme generation');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const result = await generateMemeFromPrompt(aiPrompt);
      if (result.success && result.imageUrl) {
        // Convert blob URL to file
        const response = await fetch(result.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'ai-generated-meme.png', { type: 'image/png' });
        
        setFormData(prev => ({
          ...prev,
          file,
          contentType: 'image'
        }));
        
        alert('AI-generated meme added to your form!');
      } else {
        alert('Meme generation failed. Please try again.');
      }
    } catch (error) {
      console.error('Meme generation failed:', error);
      alert('Meme generation failed. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const applyAISuggestion = (suggestion: AISuggestion, autoSubmit: boolean = false) => {
    setFormData(prev => ({
      ...prev,
      title: suggestion.title.replace('AI Suggestion: ', ''),
      description: suggestion.description,
      content: suggestion.content,
      tags: [...prev.tags, ...suggestion.tags.filter(tag => !prev.tags.includes(tag))]
    }));
    setShowAIPanel(false);
    
    if (autoSubmit) {
      // Auto-submit after a short delay to ensure form is updated
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        }
      }, 100);
      alert('AI suggestion applied and submitting automatically! 🚀');
    } else {
      alert('AI suggestion applied to your form! Click "CREATE IP" to submit.');
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
          contentURI: ipfsResult.url,
          tags: formData.tags,
          category: formData.category,
          tokenId: result.data?.tokenId?.toString() || null,
          transactionHash: result.data?.transactionHash || null
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

          {/* AI Assistant Panel */}
          <div className="mb-8 bg-meme-white border-2 border-black rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h3 className="text-2xl font-black text-black">🤖 AI CONTENT ASSISTANT</h3>
                <span className="bg-pepe-green text-black px-3 py-1 rounded-full text-sm font-bold border-2 border-black">
                  BETA
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAIPanel(!showAIPanel)}
                className="bg-dank-yellow hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg border-2 border-black transition-all duration-200 transform hover:scale-105"
              >
                {showAIPanel ? '🔽 HIDE' : '🔼 SHOW'}
              </button>
            </div>
            
            {showAIPanel && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-black mb-3">
                    🤔 AI PROMPT:
                  </label>
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:border-pepe-green focus:outline-none font-bold text-lg"
                    placeholder="Describe what you want to create..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <button
                    type="button"
                    onClick={generateAISuggestions}
                    disabled={isGeneratingAI}
                    className="bg-blue-400 hover:bg-blue-500 disabled:bg-gray-400 text-black font-bold py-3 px-4 rounded-lg border-2 border-black transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {isGeneratingAI ? '🔄 GENERATING...' : '💡 GET SUGGESTIONS'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={generateAIImage}
                    disabled={isGeneratingAI}
                    className="bg-pepe-green hover:bg-green-600 disabled:bg-gray-400 text-black font-bold py-3 px-4 rounded-lg border-2 border-black transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {isGeneratingAI ? '🔄 GENERATING...' : '🎨 GENERATE IMAGE'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={generateAIMeme}
                    disabled={isGeneratingAI}
                    className="bg-dank-yellow hover:bg-yellow-500 disabled:bg-gray-400 text-black font-bold py-3 px-4 rounded-lg border-2 border-black transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {isGeneratingAI ? '🔄 GENERATING...' : '😂 GENERATE MEME'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={async () => {
                      if (aiPrompt.trim()) {
                        await generateAISuggestions();
                        if (aiSuggestions.length > 0) {
                          applyAISuggestion(aiSuggestions[0], true);
                        }
                      } else {
                        alert('Please enter a prompt first!');
                      }
                    }}
                    disabled={isGeneratingAI}
                    className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg border-2 border-black transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {isGeneratingAI ? '🔄 CREATING...' : '🚀 CREATE & SUBMIT'}
                  </button>
                </div>

                {/* AI Suggestions */}
                {aiSuggestions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-black text-black mb-4 text-lg">🤖 AI SUGGESTIONS:</h4>
                    <div className="space-y-4">
                      {aiSuggestions.map((suggestion, index) => (
                        <div key={index} className="bg-white border-2 border-black rounded-lg p-4 shadow-lg">
                          <h5 className="font-black text-black text-lg mb-2">{suggestion.title}</h5>
                          <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                          <p className="text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded border">{suggestion.content}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {suggestion.tags.map((tag, tagIndex) => (
                                <span key={tagIndex} className="bg-pepe-green text-black text-xs px-3 py-1 rounded-full font-bold border border-black">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => applyAISuggestion(suggestion, false)}
                                className="bg-pepe-green hover:bg-green-600 text-black font-bold py-2 px-4 rounded-lg border-2 border-black transition-all duration-200 transform hover:scale-105"
                              >
                                APPLY
                              </button>
                              <button
                                type="button"
                                onClick={() => applyAISuggestion(suggestion, true)}
                                className="bg-dank-yellow hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg border-2 border-black transition-all duration-200 transform hover:scale-105"
                              >
                                APPLY & SUBMIT 🚀
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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
                  
                  {/* AI Generated File Indicator */}
                  {formData.file && formData.file.name.includes('ai-generated') && (
                    <div className="mb-3 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">🤖</span>
                        <span className="text-sm font-medium text-green-800">
                          AI-Generated Image: {formData.file.name}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    id="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pepe-green focus:outline-none font-medium"
                    required={!formData.file}
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

              {/* Tags and Categories */}
              <div>
                <TagSelector
                  selectedTags={formData.tags}
                  selectedCategory={formData.category}
                  onTagsChange={(tags) => handleInputChange('tags', tags)}
                  onCategoryChange={(category) => handleInputChange('category', category)}
                  maxTags={10}
                />
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