import React, { useState } from 'react';
import { generateContentSuggestions, generateImageFromPrompt, categorizeContent } from '../services/aiService';

interface AISuggestion {
  title: string;
  description: string;
  content: string;
  tags: string[];
  confidence: number;
}

interface AISuggestionPanelProps {
  onSuggestionApplied: (suggestion: AISuggestion) => void;
  contentType: 'text' | 'image' | 'audio';
  currentPrompt?: string;
}

const AISuggestionPanel: React.FC<AISuggestionPanelProps> = ({
  onSuggestionApplied,
  contentType,
  currentPrompt = ''
}) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState(currentPrompt);
  const [error, setError] = useState<string | null>(null);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const generateSuggestions = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateContentSuggestions(prompt, contentType);
      
      if (result.success) {
        setSuggestions(result.suggestions);
      } else {
        setError(result.error || 'Failed to generate suggestions');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      setError('AI generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateImageFromPrompt(prompt);
      
      if (result.success && result.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
        setShowImageGenerator(false);
      } else {
        setError(result.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      setError('Image generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const applySuggestion = (suggestion: AISuggestion) => {
    onSuggestionApplied(suggestion);
    setSuggestions([]); // Clear suggestions after applying
  };

  const applyGeneratedImage = () => {
    if (generatedImageUrl) {
      const imageSuggestion: AISuggestion = {
        title: `AI Generated Image: ${prompt}`,
        description: `AI-generated image based on: ${prompt}`,
        content: generatedImageUrl,
        tags: ['ai-generated', 'image', 'creative'],
        confidence: 0.8
      };
      onSuggestionApplied(imageSuggestion);
      setGeneratedImageUrl(null);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          🤖 AI Content Assistant
          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            FREE
          </span>
        </h3>
        <button
          onClick={() => setShowImageGenerator(!showImageGenerator)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {showImageGenerator ? 'Hide' : 'Show'} Image Generator
        </button>
      </div>

      {/* Prompt Input */}
      <div className="mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Describe what you want to create (e.g., "A cyberpunk cat meme" or "Web3 tutorial for beginners")`}
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={generateSuggestions}
          disabled={isGenerating || !prompt.trim()}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:cursor-not-allowed flex items-center"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              💡 Generate Ideas
            </>
          )}
        </button>

        {showImageGenerator && (
          <button
            onClick={generateImage}
            disabled={isGenerating || !prompt.trim()}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:cursor-not-allowed flex items-center"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                🎨 Generate Image
              </>
            )}
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Generated Image Display */}
      {generatedImageUrl && (
        <div className="mb-4 p-4 bg-white border-2 border-purple-200 rounded-lg">
          <h4 className="font-bold mb-2">🎨 Generated Image</h4>
          <img 
            src={generatedImageUrl} 
            alt="AI Generated" 
            className="w-full max-w-md rounded-lg border border-gray-300"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={applyGeneratedImage}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-bold"
            >
              ✅ Use This Image
            </button>
            <button
              onClick={() => setGeneratedImageUrl(null)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
            >
              ❌ Discard
            </button>
          </div>
        </div>
      )}

      {/* Suggestions Display */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-gray-800">💡 AI Suggestions</h4>
          {suggestions.map((suggestion, index) => (
            <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-bold text-gray-800">{suggestion.title}</h5>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {Math.round(suggestion.confidence * 100)}% confidence
                </span>
              </div>
              
              {suggestion.description && (
                <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
              )}
              
              {suggestion.content && (
                <div className="bg-gray-50 rounded p-2 mb-3">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{suggestion.content}</p>
                </div>
              )}
              
              {suggestion.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {suggestion.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => applySuggestion(suggestion)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-bold"
                >
                  ✅ Use This
                </button>
                <button
                  onClick={() => setSuggestions(suggestions.filter((_, i) => i !== index))}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  ❌ Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
        <div className="text-sm text-blue-800">
          <p className="font-bold mb-1">🤖 Powered by Free AI APIs:</p>
          <ul className="text-xs space-y-1">
            <li>• Hugging Face (Text & Image Generation)</li>
            <li>• OpenAI GPT-3.5 (Fallback Text Generation)</li>
            <li>• Smart Content Categorization</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AISuggestionPanel; 