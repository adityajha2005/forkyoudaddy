import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitFork, Eye, Clock } from 'lucide-react';
import Tooltip from './Tooltip';

interface ExploreCardProps {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  remixCount: number;
  license: string;
  type: string;
  image: string;
  createdAt?: string;
  isOwner?: boolean;
}

const ExploreCard: React.FC<ExploreCardProps> = ({
  title,
  subtitle,
  author,
  remixCount,
  license,
  type,
  image,
  id,
  isOwner,
  createdAt
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleRemix = () => {
    navigate(`/remix/${id}`);
  };

  const handleView = () => {
    navigate(`/ip/${id}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div 
      className="group bg-meme-white border-2 border-black rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Overlay on hover */}
        <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          <Tooltip content={`Type: ${type}`} position="right">
            <span className="bg-pepe-green text-black px-3 py-1 rounded-full text-xs font-bold border-2 border-black shadow-lg">
              {type}
            </span>
          </Tooltip>
          {isOwner && (
            <Tooltip content="You created this IP" position="right">
              <span className="bg-dank-yellow text-black px-3 py-1 rounded-full text-xs font-bold border-2 border-black shadow-lg">
                👤 YOURS
              </span>
            </Tooltip>
          )}
        </div>

        {/* Quick actions on hover */}
        <div className={`absolute top-3 right-3 flex space-x-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
          <Tooltip content="View details" position="left">
            <button 
              onClick={(e) => { e.stopPropagation(); handleView(); }}
              className="bg-black/80 text-white p-2 rounded-full hover:bg-black transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
      
      <div className="p-6">
        {/* Title and subtitle */}
        <div className="mb-4">
          <h3 className="font-black text-xl text-black mb-2 group-hover:text-pepe-green transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {subtitle}
          </p>
        </div>
        
        {/* Author and stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Tooltip content={`Created by ${author}`} position="top">
              <div className="w-8 h-8 bg-gradient-to-br from-pepe-green to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {author.slice(2, 4)}
              </div>
            </Tooltip>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                {author}
              </p>
              {createdAt && (
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(createdAt)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <Tooltip content={`${remixCount} remixes`} position="top">
              <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                <GitFork className="w-3 h-3" />
                <span className="font-bold">{remixCount}</span>
              </div>
            </Tooltip>
            <Tooltip content={`License: ${license}`} position="top">
              <span className="bg-gray-100 px-2 py-1 rounded-full font-medium">
                {license}
              </span>
            </Tooltip>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-3">
          <Tooltip content="Create a remix of this IP" position="top">
            <button 
              onClick={handleRemix}
              className="flex-1 bg-pepe-green hover:bg-green-600 text-black font-bold py-3 px-4 rounded-lg border-2 border-black transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <span>🍴</span>
              <span>REMIX</span>
            </button>
          </Tooltip>
          <Tooltip content="View full details" position="top">
            <button 
              onClick={handleView}
              className="bg-dank-yellow hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg border-2 border-black transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center"
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default ExploreCard;