import React, { useState } from 'react';
import { generateContentSuggestions, generateImageFromPrompt, generateMemeFromPrompt, categorizeContent } from '../services/aiService';

const AITestPage: React.FC = () => {
  const [prompt, setPrompt] = useState('A cyberpunk cat meme');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testTextGeneration = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateContentSuggestions(prompt, 'text');
      setResults({ type: 'text', data: result });
    } catch (err) {
      setError(`Text generation failed: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testImageGeneration = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateImageFromPrompt(prompt);
      setResults({ type: 'image', data: result });
    } catch (err) {
      setError(`Image generation failed: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testMemeGeneration = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateMemeFromPrompt(prompt);
      setResults({ type: 'meme', data: result });
    } catch (err) {
      setError(`Meme generation failed: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCategorization = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const categories = await categorizeContent(prompt);
      setResults({ type: 'categorization', data: categories });
    } catch (err) {
      setError(`Categorization failed: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">🤖 AI Integration Test</h1>
          
          {/* Environment Check */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Hugging Face API Key:</span>
                <span className={`ml-2 ${import.meta.env.VITE_HUGGINGFACE_API_KEY ? 'text-green-600' : 'text-red-600'}`}>
                  {import.meta.env.VITE_HUGGINGFACE_API_KEY ? '✅ Loaded' : '❌ Not found'}
                </span>
              </div>
              <div>
                <span className="font-medium">OpenAI API Key:</span>
                <span className="ml-2 text-gray-400">
                  Not needed (Hugging Face only)
                </span>
              </div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Prompt:
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a prompt to test..."
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={testTextGeneration}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {isLoading ? '⏳ Testing...' : '📝 Test Text Generation'}
              </button>

              <button
                onClick={testImageGeneration}
                disabled={isLoading}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {isLoading ? '⏳ Testing...' : '🎨 Test Image Generation'}
              </button>

              <button
                onClick={testMemeGeneration}
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {isLoading ? '⏳ Testing...' : '😂 Test Meme Generation'}
              </button>

              <button
                onClick={testCategorization}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {isLoading ? '⏳ Testing...' : '🏷️ Test Categorization'}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-medium mb-2">❌ Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">
                {results.type === 'text' && '📝 Text Generation Result'}
                {results.type === 'image' && '🎨 Image Generation Result'}
                {results.type === 'meme' && '😂 Meme Generation Result'}
                {results.type === 'categorization' && '🏷️ Categorization Result'}
              </h3>

              {results.type === 'text' && (
                <div>
                  <h4 className="font-medium mb-2">Suggestions:</h4>
                  {results.data.suggestions?.map((suggestion: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 rounded mb-3">
                      <h5 className="font-medium">{suggestion.title}</h5>
                      <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                      <p className="text-sm">{suggestion.content}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {suggestion.tags?.map((tag: string, tagIndex: number) => (
                          <span key={tagIndex} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.type === 'image' && (
                <div>
                  {results.data.success ? (
                    <div>
                      <h4 className="font-medium mb-2">Generated Image:</h4>
                      <img 
                        src={results.data.imageUrl} 
                        alt="AI Generated" 
                        className="max-w-md rounded-lg border border-gray-300"
                      />
                    </div>
                  ) : (
                    <p className="text-red-600">{results.data.error}</p>
                  )}
                </div>
              )}

              {results.type === 'meme' && (
                <div>
                  {results.data.success ? (
                    <div>
                      <h4 className="font-medium mb-2">Generated Meme:</h4>
                      <img 
                        src={results.data.imageUrl} 
                        alt="AI Generated Meme" 
                        className="max-w-md rounded-lg border border-orange-300"
                      />
                      <p className="text-sm text-gray-600 mt-2">Generated with FLUX.1-dev + Meme LoRA</p>
                    </div>
                  ) : (
                    <p className="text-red-600">{results.data.error}</p>
                  )}
                </div>
              )}

              {results.type === 'categorization' && (
                <div>
                  <h4 className="font-medium mb-2">Categories:</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.data.map((category: string, index: number) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-yellow-800 font-medium mb-2">💡 Instructions</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Make sure your API keys are set in the .env file</li>
              <li>• Try different prompts to test various scenarios</li>
              <li>• Check the browser console for detailed error messages</li>
              <li>• Image generation may take a few seconds</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITestPage; 