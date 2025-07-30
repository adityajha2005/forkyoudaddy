import React from 'react';
import { getTagColor, getCategoryName } from '../constants/tags';

interface TagDisplayProps {
  tags?: string[];
  category?: string;
  maxTags?: number;
  showCategory?: boolean;
  className?: string;
}

const TagDisplay: React.FC<TagDisplayProps> = ({
  tags = [],
  category,
  maxTags = 5,
  showCategory = true,
  className = ''
}) => {
  const displayTags = tags.slice(0, maxTags);
  const hasMoreTags = tags.length > maxTags;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Category Display */}
      {showCategory && category && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Category:</span>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
            {getCategoryName(category)}
          </span>
        </div>
      )}

      {/* Tags Display */}
      {displayTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {displayTags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
            >
              #{tag}
            </span>
          ))}
          {hasMoreTags && (
            <span className="text-xs text-gray-500 px-2 py-1">
              +{tags.length - maxTags} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TagDisplay; 