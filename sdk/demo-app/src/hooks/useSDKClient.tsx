import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { DotPassportClient } from '@dotpassport/sdk';

interface SDKClientContextType {
  client: DotPassportClient | null;
  apiKey: string;
  setApiKey: (key: string) => void;
  address: string;
  setAddress: (addr: string) => void;
}

const SDKClientContext = createContext<SDKClientContextType | undefined>(undefined);

export const SDKClientProvider = ({ children }: { children: ReactNode }) => {
  const [apiKey, setApiKeyState] = useState<string>(() => {
    return localStorage.getItem('dotpassport_api_key') || '';
  });

  const [address, setAddressState] = useState<string>(() => {
    return localStorage.getItem('dotpassport_address') || '12aoZXwbUzsv3z5HF5HCrtEwBJYCeKne6rYsxFEKDZ86Wdv8';
  });

  const [client, setClient] = useState<DotPassportClient | null>(null);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem('dotpassport_api_key', key);
  };

  const setAddress = (addr: string) => {
    setAddressState(addr);
    localStorage.setItem('dotpassport_address', addr);
  };

  useEffect(() => {
    if (apiKey) {
      try {
        const newClient = new DotPassportClient({
          apiKey,
          baseUrl: 'http://localhost:4000'
        });
        setClient(newClient);
      } catch (error) {
        console.error('Failed to create DotPassport client:', error);
        setClient(null);
      }
    } else {
      setClient(null);
    }
  }, [apiKey]);

  return (
    <SDKClientContext.Provider value={{ client, apiKey, setApiKey, address, setAddress }}>
      {children}
    </SDKClientContext.Provider>
  );
};

export const useSDKClient = () => {
  const context = useContext(SDKClientContext);
  if (context === undefined) {
    throw new Error('useSDKClient must be used within SDKClientProvider');
  }
  return context;
};
