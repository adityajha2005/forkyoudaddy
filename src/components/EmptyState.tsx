import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = ""
}) => {
  return (
    <div className={`text-center py-16 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-700 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="bg-pepe-green hover:bg-green-600 text-black font-bold px-8 py-4 rounded-lg border-2 border-black transition-all duration-200"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState; 