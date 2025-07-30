// Tag and Category Constants for ForkYouDaddy

export const CATEGORIES = [
  { id: 'art', name: '🎨 Art & Design', description: 'Visual arts, graphics, and design work' },
  { id: 'music', name: '🎵 Music & Audio', description: 'Music, sound effects, and audio content' },
  { id: 'code', name: '💻 Code & Tech', description: 'Software, scripts, and technical content' },
  { id: 'writing', name: '📝 Writing & Text', description: 'Articles, stories, and written content' },
  { id: 'photography', name: '📸 Photography', description: 'Photos and visual content' },
  { id: 'video', name: '🎬 Video & Film', description: 'Video content and animations' },
  { id: 'gaming', name: '🎮 Gaming', description: 'Game assets, concepts, and gaming content' },
  { id: 'education', name: '📚 Education', description: 'Educational content and tutorials' },
  { id: 'business', name: '💼 Business', description: 'Business ideas and concepts' },
  { id: 'other', name: '🔧 Other', description: 'Miscellaneous content' }
];

export const POPULAR_TAGS = [
  // Art & Design
  'abstract', 'minimalist', 'vintage', 'modern', 'retro', 'geometric', 'organic', 'digital-art',
  'illustration', 'logo', 'branding', 'typography', 'color-palette', 'texture', 'pattern',
  
  // Music & Audio
  'ambient', 'electronic', 'rock', 'jazz', 'hip-hop', 'sound-effect', 'melody',
  'rhythm', 'beat', 'acoustic', 'synthesizer', 'drum', 'bass', 'guitar', 'piano',
  
  // Code & Tech
  'javascript', 'react', 'python', 'web3', 'blockchain', 'ai', 'machine-learning', 'api',
  'frontend', 'backend', 'database', 'algorithm', 'data-structure', 'framework', 'library',
  
  // Writing & Text
  'poetry', 'story', 'article', 'tutorial', 'guide', 'documentation', 'creative-writing',
  'technical-writing', 'blog', 'newsletter', 'script', 'dialogue', 'narrative',
  
  // Photography
  'landscape', 'portrait', 'street', 'nature', 'urban', 'black-white', 'color', 'macro',
  'architecture', 'travel', 'fashion', 'product', 'event', 'wedding', 'wildlife',
  
  // Video & Film
  'animation', 'short-film', 'documentary', 'music-video', 'tutorial', 'commercial',
  'cinematic', 'vlog', 'live-stream', 'podcast', 'interview', 'presentation',
  
  // Gaming
  'game-asset', 'character', 'environment', 'ui-design', 'game-mechanic', 'level-design',
  'pixel-art', '3d-model', 'animation', 'sound-design', 'game-concept', 'board-game',
  
  // Education
  'tutorial', 'course', 'workshop', 'lecture', 'presentation', 'infographic', 'diagram',
  'mind-map', 'quiz', 'exercise', 'case-study', 'research', 'analysis',
  
  // Business
  'startup', 'product', 'service', 'marketing', 'strategy', 'business-plan', 'pitch',
  'market-research', 'customer', 'revenue', 'growth', 'innovation', 'disruption',
  
  // General
  'trending', 'viral', 'popular', 'new', 'featured', 'award-winning', 'community',
  'collaboration', 'open-source', 'free', 'premium', 'exclusive', 'limited-edition'
];

export const TAG_COLORS = {
  // Art & Design
  'abstract': 'bg-purple-100 text-purple-800',
  'minimalist': 'bg-gray-100 text-gray-800',
  'vintage': 'bg-amber-100 text-amber-800',
  'modern': 'bg-blue-100 text-blue-800',
  'retro': 'bg-pink-100 text-pink-800',
  'geometric': 'bg-indigo-100 text-indigo-800',
  'digital-art': 'bg-cyan-100 text-cyan-800',
  'illustration': 'bg-orange-100 text-orange-800',
  
  // Music & Audio
  'ambient': 'bg-teal-100 text-teal-800',
  'electronic': 'bg-purple-100 text-purple-800',
  'rock': 'bg-red-100 text-red-800',
  'jazz': 'bg-yellow-100 text-yellow-800',
  'sound-effect': 'bg-green-100 text-green-800',
  'melody': 'bg-pink-100 text-pink-800',
  
  // Code & Tech
  'javascript': 'bg-yellow-100 text-yellow-800',
  'react': 'bg-blue-100 text-blue-800',
  'python': 'bg-green-100 text-green-800',
  'web3': 'bg-purple-100 text-purple-800',
  'blockchain': 'bg-indigo-100 text-indigo-800',
  'ai': 'bg-cyan-100 text-cyan-800',
  
  // Writing & Text
  'poetry': 'bg-pink-100 text-pink-800',
  'story': 'bg-orange-100 text-orange-800',
  'tutorial': 'bg-blue-100 text-blue-800',
  'creative-writing': 'bg-purple-100 text-purple-800',
  
  // Photography
  'landscape': 'bg-green-100 text-green-800',
  'portrait': 'bg-pink-100 text-pink-800',
  'nature': 'bg-emerald-100 text-emerald-800',
  'black-white': 'bg-gray-100 text-gray-800',
  
  // Video & Film
  'animation': 'bg-cyan-100 text-cyan-800',
  'short-film': 'bg-red-100 text-red-800',
  'cinematic': 'bg-indigo-100 text-indigo-800',
  
  // Gaming
  'game-asset': 'bg-purple-100 text-purple-800',
  'character': 'bg-orange-100 text-orange-800',
  'pixel-art': 'bg-green-100 text-green-800',
  
  // Education
//   'tutorial': 'bg-blue-100 text-blue-800',
  'course': 'bg-green-100 text-green-800',
  'workshop': 'bg-orange-100 text-orange-800',
  
  // Business
  'startup': 'bg-green-100 text-green-800',
  'product': 'bg-blue-100 text-blue-800',
  'marketing': 'bg-purple-100 text-purple-800',
  
  // General
  'trending': 'bg-red-100 text-red-800',
  'viral': 'bg-pink-100 text-pink-800',
  'popular': 'bg-yellow-100 text-yellow-800',
  'new': 'bg-green-100 text-green-800',
  'featured': 'bg-purple-100 text-purple-800',
  'community': 'bg-blue-100 text-blue-800',
  'open-source': 'bg-green-100 text-green-800'
};

// Default color for tags not in the mapping
export const DEFAULT_TAG_COLOR = 'bg-gray-100 text-gray-800';

export const getTagColor = (tag: string): string => {
  return TAG_COLORS[tag as keyof typeof TAG_COLORS] || DEFAULT_TAG_COLOR;
};

export const getCategoryById = (id: string) => {
  return CATEGORIES.find(cat => cat.id === id);
};

export const getCategoryName = (id: string): string => {
  const category = getCategoryById(id);
  return category ? category.name : '🔧 Other';
}; 