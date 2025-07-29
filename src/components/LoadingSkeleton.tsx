import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'text' | 'button';
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'card', 
  className = "" 
}) => {
  if (type === 'card') {
    return (
      <div className={`bg-meme-white border-2 border-black rounded-lg overflow-hidden animate-pulse ${className}`}>
        <div className="w-full h-48 bg-gray-200"></div>
        <div className="p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-6 bg-gray-200 rounded w-12"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
            <div className="w-12 h-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (type === 'button') {
    return (
      <div className={`h-12 bg-gray-200 rounded-lg animate-pulse ${className}`}></div>
    );
  }

  return null;
};

export default LoadingSkeleton; 