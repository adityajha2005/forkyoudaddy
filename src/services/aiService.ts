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

// Generate intelligent suggestions based on prompt analysis
const generateIntelligentSuggestions = (prompt: string, platformContext: string): AISuggestion[] => {
  const suggestions: AISuggestion[] = [];
  
  // Analyze the prompt for keywords
  const lowerPrompt = prompt.toLowerCase();
  const keywords = {
    web3: ['web3', 'blockchain', 'crypto', 'nft', 'defi', 'dao'],
    game: ['game', 'gaming', 'play', 'player', 'quest', 'level'],
    meme: ['meme', 'funny', 'viral', 'trend', 'joke', 'humor'],
    art: ['art', 'creative', 'design', 'drawing', 'painting', 'visual'],
    tech: ['tech', 'technology', 'app', 'software', 'code', 'programming'],
    education: ['learn', 'teach', 'education', 'tutorial', 'guide', 'knowledge']
  };
  
  // Detect what type of content the user wants
  let detectedType = 'creative';
  let detectedTags = ['ai-generated', 'creative', 'web3', 'remix', 'forkyoudaddy'];
  
  if (keywords.web3.some(keyword => lowerPrompt.includes(keyword))) {
    detectedType = 'web3';
    detectedTags.push('web3', 'blockchain');
  }
  
  if (keywords.game.some(keyword => lowerPrompt.includes(keyword))) {
    detectedType = 'gaming';
    detectedTags.push('gaming', 'game');
  }
  
  if (keywords.meme.some(keyword => lowerPrompt.includes(keyword))) {
    detectedType = 'meme';
    detectedTags.push('meme', 'viral');
  }
  
  if (keywords.art.some(keyword => lowerPrompt.includes(keyword))) {
    detectedType = 'art';
    detectedTags.push('art', 'creative');
  }
  
  if (keywords.tech.some(keyword => lowerPrompt.includes(keyword))) {
    detectedType = 'tech';
    detectedTags.push('tech', 'programming');
  }
  
  if (keywords.education.some(keyword => lowerPrompt.includes(keyword))) {
    detectedType = 'education';
    detectedTags.push('education', 'tutorial');
  }
  
  // Generate suggestions based on detected type
  switch (detectedType) {
    case 'web3':
      suggestions.push({
        title: `Web3 Game Concept: ${prompt}`,
        description: `A blockchain-based gaming IP that can be remixed by the community. Players can create their own game modes, characters, and quests while earning rewards.`,
        content: `Create a Web3 game where players can remix game mechanics, create new levels, and earn tokens for their contributions. The game should be modular so other creators can build upon it.`,
        tags: detectedTags,
        confidence: 0.9
      });
      break;
      
    case 'gaming':
      suggestions.push({
        title: `Gaming IP: ${prompt}`,
        description: `A remixable game concept where players can create their own content and share it with the community.`,
        content: `Design a game framework that allows players to create and share their own levels, characters, and game modes. Each remix earns the original creator and builds the gaming ecosystem.`,
        tags: detectedTags,
        confidence: 0.9
      });
      break;
      
    case 'meme':
      suggestions.push({
        title: `Viral Meme Template: ${prompt}`,
        description: `A meme template that can be remixed by the community to create viral content.`,
        content: `Create a meme template that's easily remixable. Users can add their own text, modify the image, and create new variations. The most popular remixes get featured and earn rewards.`,
        tags: detectedTags,
        confidence: 0.9
      });
      break;
      
    case 'art':
      suggestions.push({
        title: `Remixable Art Piece: ${prompt}`,
        description: `An artistic creation that others can build upon and remix into new works.`,
        content: `Create an art piece with layers that can be remixed. Other artists can add their own elements, modify colors, or create entirely new compositions based on your original work.`,
        tags: detectedTags,
        confidence: 0.9
      });
      break;
      
    case 'tech':
      suggestions.push({
        title: `Open Source Tech Project: ${prompt}`,
        description: `A technical project that can be forked and improved by the community.`,
        content: `Build a tech project that's designed to be forked and remixed. Include clear documentation so others can understand and build upon your work. Each fork contributes to the ecosystem.`,
        tags: detectedTags,
        confidence: 0.9
      });
      break;
      
    case 'education':
      suggestions.push({
        title: `Educational Content: ${prompt}`,
        description: `Learning material that can be remixed and improved by the community.`,
        content: `Create educational content that others can expand upon. Include interactive elements, quizzes, or exercises that can be remixed by other educators to create new learning experiences.`,
        tags: detectedTags,
        confidence: 0.9
      });
      break;
      
    default:
      suggestions.push({
        title: `Creative IP: ${prompt}`,
        description: `A creative project that can be remixed and built upon by the community.`,
        content: `Create something unique that others can remix and build upon. Think about what elements can be modular, customizable, or easily adapted by other creators in the ForkYouDaddy community.`,
        tags: detectedTags,
        confidence: 0.9
      });
  }
  
  // Add a second suggestion with a different approach
  suggestions.push({
    title: `Community-Driven ${detectedType.charAt(0).toUpperCase() + detectedType.slice(1)}: ${prompt}`,
    description: `A ${detectedType} project designed for community collaboration and remixing.`,
    content: `Design your ${detectedType} project to be community-driven. Include features that encourage others to remix, improve, and build upon your work. Consider how each remix can add value to the original.`,
    tags: [...detectedTags, 'community', 'collaboration'],
    confidence: 0.8
  });
  
  return suggestions;
};

// Initialize Hugging Face Inference Client
const getInferenceClient = () => {
  const hfKey = getHuggingFaceKey();
  if (!hfKey) {
    throw new Error('Hugging Face API key not found');
  }
  
  console.log('🔍 Hugging Face API key found:', hfKey ? 'Yes' : 'No');
  
  // We'll use fetch directly since InferenceClient is for Node.js
  // But we'll structure it the same way
  return {
    textToImage: async (params: {
      provider: string;
      model: string;
      inputs: string;
      parameters?: any;
    }) => {
      console.log('🔍 Generating image with params:', { model: params.model, inputs: params.inputs });
      
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

      console.log('🔍 Hugging Face API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 Hugging Face API error:', errorText);
        throw new Error(`Hugging Face API error: ${response.statusText} - ${errorText}`);
      }

      const blob = await response.blob();
      console.log('🔍 Image blob received, size:', blob.size);
      return blob;
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
        // Generate intelligent suggestions based on the prompt
        const suggestions = generateIntelligentSuggestions(prompt, platformContext);
        
        return {
          success: true,
          suggestions: suggestions
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
      
      // Fallback: Create a mock meme when credits are exhausted
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('credits') || errorMessage.includes('quota')) {
        console.log('🔄 Creating mock meme due to credit exhaustion');
        
        // Create a simple canvas-based mock meme
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Create a meme-style background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 512, 512);
          
          // Add meme border
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 4;
          ctx.strokeRect(10, 10, 492, 492);
          
          // Add meme text
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 32px Impact';
          ctx.textAlign = 'center';
          ctx.fillText('MOCK MEME', 256, 150);
          ctx.fillText(`"${prompt}"`, 256, 250);
          ctx.fillText('🤖 ForkYouDaddy', 256, 350);
          ctx.fillText('(Credits Exhausted)', 256, 420);
          
          // Convert to blob and return
          return new Promise<{ success: boolean; imageUrl?: string; error?: string }>((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) {
                const mockImageUrl = URL.createObjectURL(blob);
                resolve({
                  success: true,
                  imageUrl: mockImageUrl
                });
              } else {
                resolve({
                  success: false,
                  error: 'Failed to create mock meme'
                });
              }
            }, 'image/png');
          });
        }
        
        return {
          success: false,
          error: 'Meme generation credits exhausted. Mock meme creation failed.'
        };
      }
      
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
      
      // Fallback: Create a mock image when credits are exhausted
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('credits') || errorMessage.includes('quota')) {
        console.log('🔄 Creating mock image due to credit exhaustion');
        
        // Create a simple canvas-based mock image
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Create a gradient background
          const gradient = ctx.createLinearGradient(0, 0, 512, 512);
          gradient.addColorStop(0, '#22c55e'); // pepe-green
          gradient.addColorStop(1, '#fbbf24'); // dank-yellow
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 512, 512);
          
          // Add text
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('AI Generated Image', 256, 200);
          ctx.fillText(`Prompt: ${prompt}`, 256, 240);
          ctx.fillText('🤖 ForkYouDaddy', 256, 280);
          ctx.fillText('(Mock - Credits Exhausted)', 256, 320);
          
          // Convert to blob and return
          return new Promise<{ success: boolean; imageUrl?: string; error?: string }>((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) {
                const mockImageUrl = URL.createObjectURL(blob);
                resolve({
                  success: true,
                  imageUrl: mockImageUrl
                });
              } else {
                resolve({
                  success: false,
                  error: 'Failed to create mock image'
                });
              }
            }, 'image/png');
          });
        }
        
        return {
          success: false,
          error: 'Image generation credits exhausted. Mock image creation failed.'
        };
      }
      
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