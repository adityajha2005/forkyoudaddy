import React, { useState } from 'react';
import LicensePurchaseFlow from './LicensePurchaseFlow';
import { getLicenseById, calculateLicensePrice } from '../services/licensingService';
import { useAuth } from '@campnetwork/origin/react';
import ErrorBoundary from './ErrorBoundary';

interface LicensePurchaseButtonProps {
  ipId: string;
  ipTitle: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const LicensePurchaseButton: React.FC<LicensePurchaseButtonProps> = ({
  ipId,
  ipTitle,
  className = '',
  variant = 'primary',
  size = 'md'
}) => {
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState('personal');
  const auth = useAuth(); // Get Origin SDK auth instance (may be undefined if not available)

  const license = getLicenseById(selectedLicense);
  const price = license ? calculateLicensePrice(license) : 0;

  const getButtonClasses = () => {
    const baseClasses = 'font-bold rounded-lg border-2 border-black transition-all duration-200 transform hover:scale-105 shadow-lg';
    
    const variantClasses = {
      primary: 'bg-pepe-green hover:bg-green-600 text-black',
      secondary: 'bg-dank-yellow hover:bg-yellow-500 text-black',
      outline: 'bg-transparent hover:bg-gray-100 text-gray-900 border-gray-300'
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  };

  const handlePurchaseSuccess = (purchase: any) => {
    
    // You can add additional success handling here
    //比如更新UI状态，显示成功消息等
  };

  return (
    <ErrorBoundary>
      <button
        onClick={() => setShowPurchaseFlow(true)}
        className={getButtonClasses()}
      >
        💰 Purchase License
        {price > 0 && (
          <span className="ml-2 text-xs opacity-75">
            ({price.toFixed(3)} CAMP)
          </span>
        )}
      </button>

      {showPurchaseFlow && (
        <LicensePurchaseFlow
          ipId={ipId}
          onClose={() => setShowPurchaseFlow(false)}
          onSuccess={handlePurchaseSuccess}
          auth={auth}
        />
      )}
    </ErrorBoundary>
  );
};

export default LicensePurchaseButton; 