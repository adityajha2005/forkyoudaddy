// IPFS service using Pinata API
// Get your Pinata API key from: https://app.pinata.cloud/

interface IPFSUploadResult {
  cid: string;
  url: string;
  success: boolean;
  error?: string;
}

// Get Pinata API key from environment
const getPinataApiKey = () => {
  // Try JWT token first (more reliable), then API key
  const jwtToken = import.meta.env.VITE_PINATA_JWT_TOKEN;
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  
  console.log('Using JWT token for Pinata authentication');
  return jwtToken;
};

// Upload content to IPFS via Pinata
export const uploadToIPFS = async (content: string, filename: string = 'content.txt'): Promise<IPFSUploadResult> => {
  try {
    const apiKey = getPinataApiKey();
    if (!apiKey) {
      throw new Error('Pinata API key not found. Add VITE_PINATA_API_KEY to your .env file');
    }

    // Create file from content
    const file = new File([content], filename, { type: 'text/plain' });
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata
    const metadata = {
      name: filename,
      keyvalues: {
        contentType: 'text',
        timestamp: new Date().toISOString()
      }
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    // Upload to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Pinata API Error:', errorData);
      throw new Error(`Pinata upload failed: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('IPFS upload successful:', result);
    
    return {
      cid: result.IpfsHash,
      url: `ipfs://${result.IpfsHash}`,
      success: true
    };
  } catch (error) {
    console.error('IPFS upload failed:', error);
    return {
      cid: '',
      url: '',
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

// Upload file to IPFS via Pinata
export const uploadFileToIPFS = async (file: File): Promise<IPFSUploadResult> => {
  try {
    const apiKey = getPinataApiKey();
    if (!apiKey) {
      throw new Error('Pinata API key not found. Add VITE_PINATA_API_KEY to your .env file');
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata
    const metadata = {
      name: file.name,
      keyvalues: {
        contentType: file.type,
        size: file.size.toString(),
        timestamp: new Date().toISOString()
      }
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    // Upload to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Pinata API Error:', errorData);
      throw new Error(`Pinata upload failed: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('IPFS file upload successful:', result);
    
    return {
      cid: result.IpfsHash,
      url: `ipfs://${result.IpfsHash}`,
      success: true
    };
  } catch (error) {
    console.error('IPFS file upload failed:', error);
    return {
      cid: '',
      url: '',
      success: false,
      error: error instanceof Error ? error.message : 'File upload failed'
    };
  }
};

// Get IPFS gateway URL
export const getIPFSGatewayURL = (cid: string): string => {
  return `https://ipfs.io/ipfs/${cid}`;
};

// Validate IPFS CID
export const isValidCID = (cid: string): boolean => {
  // Basic CID validation
  return cid.startsWith('Qm') || cid.startsWith('bafy') && cid.length > 40;
}; 