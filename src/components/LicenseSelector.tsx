import React, { useState } from 'react';
import { getAllLicenses, calculateLicensePrice, type License } from '../services/licensingService';

interface LicenseSelectorProps {
  selectedLicense?: string;
  onLicenseChange: (licenseId: string) => void;
  showPricing?: boolean;
  className?: string;
}

const LicenseSelector: React.FC<LicenseSelectorProps> = ({
  selectedLicense = 'personal',
  onLicenseChange,
  showPricing = true,
  className = ''
}) => {
  const [expandedLicense, setExpandedLicense] = useState<string | null>(null);
  const licenses = getAllLicenses();

  const handleLicenseSelect = (licenseId: string) => {
    onLicenseChange(licenseId);
    setExpandedLicense(expandedLicense === licenseId ? null : licenseId);
  };

  const formatPrice = (price: number): string => {
    return `${price.toFixed(3)} CAMP`;
  };

  const formatDuration = (duration: number): string => {
    if (duration === 0) return 'Perpetual';
    if (duration === 365) return '1 Year';
    if (duration === 30) return '1 Month';
    return `${duration} days`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose License Type</h3>
        <p className="text-sm text-gray-600">
          Select the appropriate license for your IP or purchase
        </p>
      </div>

      <div className="grid gap-4">
        {licenses.map((license) => {
          const isSelected = selectedLicense === license.id;
          const isExpanded = expandedLicense === license.id;
          const totalPrice = calculateLicensePrice(license);

          return (
            <div
              key={license.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-pepe-green bg-pepe-green/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleLicenseSelect(license.id)}
            >
              {/* License Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{license.name}</h4>
                    {isSelected && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pepe-green text-white">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{license.description}</p>
                </div>
                
                {showPricing && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatPrice(totalPrice)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDuration(license.duration)}
                    </div>
                  </div>
                )}
              </div>

              {/* License Details (Expandable) */}
              {isExpanded && (
                <div className="mt-4 space-y-4 animate-fadeIn">
                  {/* Usage Type */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Usage Rights</h5>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        license.usage === 'personal' 
                          ? 'bg-blue-100 text-blue-800'
                          : license.usage === 'commercial'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {license.usage.charAt(0).toUpperCase() + license.usage.slice(1)}
                      </span>
                      {license.territory && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {license.territory}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Benefits</h5>
                    <ul className="space-y-1">
                      {license.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 bg-pepe-green rounded-full"></span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Restrictions */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Restrictions</h5>
                    <ul className="space-y-1">
                      {license.restrictions.map((restriction, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          {restriction}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Revenue Share */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Revenue Distribution</h5>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Creator:</span>
                        <span className="font-medium text-green-600">{license.revenueShare}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Platform:</span>
                        <span className="font-medium text-gray-600">{100 - license.revenueShare}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Usage Limits */}
                  {license.maxUsage && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Usage Limits</h5>
                      <div className="text-sm text-gray-600">
                        Maximum {license.maxUsage} usage{license.maxUsage > 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Expand/Collapse Button */}
              <button
                className={`mt-3 text-sm font-medium transition-colors ${
                  isExpanded ? 'text-pepe-green' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedLicense(isExpanded ? null : license.id);
                }}
              >
                {isExpanded ? 'Show less' : 'Show details'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Pricing Summary */}
      {showPricing && selectedLicense && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Total Cost</h4>
              <p className="text-sm text-gray-600">Including platform fees</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                {formatPrice(calculateLicensePrice(getAllLicenses().find(l => l.id === selectedLicense)!))}
              </div>
              <div className="text-xs text-gray-500">
                Platform fee: 5%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseSelector; 