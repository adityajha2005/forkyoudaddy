import React, { useState, useEffect } from 'react';
import { CATEGORIES, POPULAR_TAGS, getTagColor, getCategoryName } from '../constants/tags';

interface TagSelectorProps {
  selectedTags: string[];
  selectedCategory: string;
  onTagsChange: (tags: string[]) => void;
  onCategoryChange: (category: string) => void;
  maxTags?: number;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  selectedCategory,
  onTagsChange,
  onCategoryChange,
  maxTags = 10
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [customTag, setCustomTag] = useState('');

  // Filter tags based on search term
  const filteredTags = POPULAR_TAGS.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.includes(tag)
  ).slice(0, 20);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleCustomTagAdd = () => {
    const trimmedTag = customTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (trimmedTag && !selectedTags.includes(trimmedTag) && selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, trimmedTag]);
      setCustomTag('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomTagAdd();
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📂 Category
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`p-3 text-left rounded-lg border transition-all ${
                selectedCategory === category.id
                  ? 'border-pepe-green bg-pepe-green/10 text-pepe-green'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="font-medium">{category.name}</div>
              <div className="text-xs text-gray-500 mt-1">{category.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tags Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🏷️ Tags ({selectedTags.length}/{maxTags})
        </label>
        
        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag)}`}
              >
                #{tag}
                <button
                  onClick={() => handleTagRemove(tag)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tag Search and Add */}
        <div className="relative">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search or add custom tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowTagSuggestions(true)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pepe-green focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Custom tag..."
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pepe-green focus:border-transparent"
            />
            <button
              onClick={handleCustomTagAdd}
              disabled={!customTag.trim() || selectedTags.length >= maxTags}
              className="px-4 py-2 bg-pepe-green text-white rounded-lg hover:bg-pepe-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {/* Tag Suggestions */}
          {showTagSuggestions && (searchTerm || filteredTags.length > 0) && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredTags.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">Popular Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {filteredTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          handleTagToggle(tag);
                          setSearchTerm('');
                        }}
                        className={`px-2 py-1 rounded text-sm ${getTagColor(tag)} hover:opacity-80`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Popular Tags Quick Add */}
        <div className="mt-3">
          <div className="text-xs font-medium text-gray-500 mb-2">Quick Add Popular Tags</div>
          <div className="flex flex-wrap gap-1">
            {POPULAR_TAGS.slice(0, 20).map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                disabled={selectedTags.includes(tag) || selectedTags.length >= maxTags}
                className={`px-2 py-1 rounded text-xs ${getTagColor(tag)} hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagSelector; 