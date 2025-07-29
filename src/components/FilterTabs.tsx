import React from 'react';

export interface FilterOption {
  key: string;
  label: string;
  icon: string;
}

interface FilterTabsProps {
  options: FilterOption[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  className?: string;
}

const FilterTabs: React.FC<FilterTabsProps> = ({
  options,
  activeFilter,
  onFilterChange,
  className = ""
}) => {
  return (
    <div className={`flex justify-center mb-8 ${className}`}>
      <div className="bg-gray-100 rounded-lg p-1 border-2 border-black">
        {options.map((option) => (
          <button
            key={option.key}
            onClick={() => onFilterChange(option.key)}
            className={`px-6 py-3 rounded-md font-bold transition-all duration-200 ${
              activeFilter === option.key
                ? 'bg-pepe-green text-black shadow-lg'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            {option.icon} {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterTabs; 