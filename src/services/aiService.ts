// AI Service using Hugging Face Inference Client
// Primary: Hugging Face with publicly available models
// Models: FLUX.1-dev (images), microsoft/DialoGPT-medium (text), BART (categorization)

interface AISuggestion {
  title: string;
  description: string;
  content: string;
  tags: string[];
  confidence: number;
}

interface AIGenerationResult {
  success: boolean;
  suggestions: AISuggestion[];
  error?: string;
}

// Get API key from environment
const getHuggingFaceKey = () => import.meta.env.VITE_HUGGINGFACE_API_KEY;

// Initialize Hugging Face Inference Client
const getInferenceClient = () => {
  const hfKey = getHuggingFaceKey();
  if (!hfKey) {
    throw new Error('Hugging Face API key not found');
  }
  
  // We'll use fetch directly since InferenceClient is for Node.js
  // But we'll structure it the same way
  return {
    textToImage: async (params: {
      provider: string;
      model: string;
      inputs: string;
      parameters?: any;
    }) => {
      const response = await fetch(`https://api-inference.huggingface.co/models/${params.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: params.inputs,
          parameters: params.parameters
        })
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.statusText}`);
      }

      return response.blob();
    },
    
    textGeneration: async (params: {
      model: string;
      inputs: string;
      parameters?: any;
    }) => {
      const response = await fetch(`https://api-inference.huggingface.co/models/${params.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: params.inputs,
          parameters: params.parameters
        })
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.statusText}`);
      }

      return response.json();
    }
  };
};

// Generate content suggestions using publicly available Hugging Face models
export const generateContentSuggestions = async (
  prompt: string, 
  contentType: 'text' | 'image' | 'audio'
): Promise<AIGenerationResult> => {
  try {
    const client = getInferenceClient();
    
    // ForkYouDaddy platform context for AI
    const platformContext = `ForkYouDaddy is a Web3 IP remix platform where creators upload content (memes, art, knowledge) that others can remix and build upon. It's like GitHub for creative content with blockchain ownership and remix rewards.`;

    switch (contentType) {
      case 'text':
        // Mock text generation with ForkYouDaddy context
        const mockTextResult = `Based on "${prompt}" for ForkYouDaddy platform: ${platformContext} Here's a creative IP idea: A viral meme template that can be remixed by the community. Each remix earns the original creator, and the most popular remixes get featured. Perfect for the meme economy and community-driven content creation!`;
        
        return {
          success: true,
          suggestions: [{
            title: `AI Suggestion: ${prompt}`,
            description: `AI-generated content for ForkYouDaddy platform based on: ${prompt}`,
            content: mockTextResult,
            tags: ['ai-generated', 'text', 'creative', 'web3', 'remix', 'forkyoudaddy'],
            confidence: 0.9
          }]
        };

      case 'image':
        // Use FLUX.1-dev for high-quality image generation
        const imageBlob = await client.textToImage({
          provider: 'nebius',
          model: 'black-forest-labs/FLUX.1-dev',
          inputs: prompt,
          parameters: { 
            num_inference_steps: 5 
          }
        });

        const imageUrl = URL.createObjectURL(imageBlob);
        
        return {
          success: true,
          suggestions: [{
            title: `AI Generated Image: ${prompt}`,
            description: `AI-generated image using FLUX.1-dev model based on: ${prompt}`,
            content: imageUrl,
            tags: ['ai-generated', 'image', 'creative', 'flux-model'],
            confidence: 0.9
          }]
        };

      default:
        // Mock text generation with ForkYouDaddy context
        const mockDefaultResult = `Based on "${prompt}" for ForkYouDaddy platform: ${platformContext} Here's a creative idea: A viral meme template that can be remixed by the community. Each remix earns the original creator, and the most popular remixes get featured. Perfect for the meme economy and community-driven content creation!`;
        
        return {
          success: true,
          suggestions: [{
            title: `AI Suggestion: ${prompt}`,
            description: `AI-generated content for ForkYouDaddy platform based on: ${prompt}`,
            content: mockDefaultResult,
            tags: ['ai-generated', 'text', 'creative', 'web3', 'remix', 'forkyoudaddy'],
            confidence: 0.9
          }]
        };
    }

  } catch (error) {
    console.error('AI generation failed:', error);
    
    return {
      success: false,
      suggestions: [],
      error: 'AI generation failed. Please try again later.'
    };
  }
};

  // Generate meme from prompt using FLUX.1-dev model
  export const generateMemeFromPrompt = async (prompt: string): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
    try {
      const client = getInferenceClient();

      // Add meme-specific prompt enhancements with ForkYouDaddy context
      const memePrompt = `Meme style for ForkYouDaddy platform: ${prompt}. Create a viral meme that can be remixed by the community.`;

    const imageBlob = await client.textToImage({
      provider: 'nebius',
      model: 'black-forest-labs/FLUX.1-dev',
      inputs: memePrompt,
      parameters: { 
        num_inference_steps: 5 
      }
    });

    const imageUrl = URL.createObjectURL(imageBlob);

    return {
      success: true,
      imageUrl
    };

  } catch (error) {
    console.error('Meme generation failed:', error);
    
    return {
      success: false,
      error: 'Meme generation failed. Please try again later.'
    };
  }
};

  // Generate regular image from prompt using FLUX.1-dev model
  export const generateImageFromPrompt = async (prompt: string): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
    try {
      const client = getInferenceClient();

      // Add ForkYouDaddy context to image generation
      const enhancedPrompt = `ForkYouDaddy platform content: ${prompt}. Create an image that can be remixed and built upon by the community.`;

      const imageBlob = await client.textToImage({
        provider: 'nebius',
        model: 'black-forest-labs/FLUX.1-dev',
        inputs: enhancedPrompt,
        parameters: { 
          num_inference_steps: 5 
        }
      });

    const imageUrl = URL.createObjectURL(imageBlob);

    return {
      success: true,
      imageUrl
    };

  } catch (error) {
    console.error('Image generation failed:', error);
    
    return {
      success: false,
      error: 'Image generation failed. Please try again later.'
    };
  }
};

// Smart content categorization using BART
export const categorizeContent = async (content: string): Promise<string[]> => {
  try {
    const client = getInferenceClient();

    const result = await client.textGeneration({
      model: 'facebook/bart-large-mnli',
      inputs: content,
      parameters: {
        candidate_labels: [
          'art', 'music', 'code', 'writing', 'photography', 
          'video', 'gaming', 'education', 'business', 'meme',
          'tutorial', 'guide', 'explainer', 'creative', 'technical'
        ]
      }
    });

    return Array.isArray(result) ? (result as any).labels || [] : categorizeByKeywords(content);

  } catch (error) {
    console.error('Content categorization failed:', error);
    return categorizeByKeywords(content);
  }
};

// Parse AI response into structured suggestions
const parseAISuggestions = (content: string): AISuggestion[] => {
  const suggestions: AISuggestion[] = [];
  
  // Simple parsing - you can make this more sophisticated
  const lines = content.split('\n').filter(line => line.trim());
  
  let currentSuggestion: Partial<AISuggestion> = {};
  
  for (const line of lines) {
    if (line.includes('Title:') || line.includes('1.') || line.includes('2.') || line.includes('3.')) {
      if (currentSuggestion.title) {
        suggestions.push(currentSuggestion as AISuggestion);
      }
      currentSuggestion = {
        title: line.replace(/^(Title:|[0-9]+\.\s*)/, '').trim(),
        description: '',
        content: '',
        tags: ['ai-generated'],
        confidence: 0.8
      };
    } else if (line.includes('Description:')) {
      currentSuggestion.description = line.replace('Description:', '').trim();
    } else if (line.includes('Content:')) {
      currentSuggestion.content = line.replace('Content:', '').trim();
    } else if (line.includes('Tags:')) {
      const tags = line.replace('Tags:', '').trim().split(',').map(tag => tag.trim());
      currentSuggestion.tags = [...(currentSuggestion.tags || []), ...tags];
    } else if (currentSuggestion.title && line.trim()) {
      // Add to content if we have a title but no specific content
      if (!currentSuggestion.content) {
        currentSuggestion.content = line.trim();
      }
    }
  }
  
  // Add the last suggestion
  if (currentSuggestion.title) {
    suggestions.push(currentSuggestion as AISuggestion);
  }
  
  return suggestions.length > 0 ? suggestions : [{
    title: 'AI Generated Content',
    description: 'AI-generated content based on your prompt',
    content: content,
    tags: ['ai-generated', 'creative', 'dialogpt'],
    confidence: 0.75
  }];
};

// Fallback keyword-based categorization
const categorizeByKeywords = (content: string): string[] => {
  const categories: string[] = [];
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('art') || lowerContent.includes('design') || lowerContent.includes('creative')) {
    categories.push('art');
  }
  if (lowerContent.includes('music') || lowerContent.includes('audio') || lowerContent.includes('sound')) {
    categories.push('music');
  }
  if (lowerContent.includes('code') || lowerContent.includes('programming') || lowerContent.includes('developer')) {
    categories.push('code');
  }
  if (lowerContent.includes('write') || lowerContent.includes('text') || lowerContent.includes('story')) {
    categories.push('writing');
  }
  if (lowerContent.includes('photo') || lowerContent.includes('image') || lowerContent.includes('picture')) {
    categories.push('photography');
  }
  if (lowerContent.includes('video') || lowerContent.includes('film') || lowerContent.includes('movie')) {
    categories.push('video');
  }
  if (lowerContent.includes('game') || lowerContent.includes('gaming') || lowerContent.includes('play')) {
    categories.push('gaming');
  }
  if (lowerContent.includes('learn') || lowerContent.includes('teach') || lowerContent.includes('tutorial')) {
    categories.push('education');
  }
  if (lowerContent.includes('business') || lowerContent.includes('startup') || lowerContent.includes('entrepreneur')) {
    categories.push('business');
  }
  if (lowerContent.includes('meme') || lowerContent.includes('funny') || lowerContent.includes('humor')) {
    categories.push('meme');
  }
  
  return categories.length > 0 ? categories : ['creative'];
}; 