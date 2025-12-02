import React, { createContext, useContext, ReactNode } from 'react';

interface VeyConfig {
  apiKey?: string;
  apiEndpoint?: string;
}

const VeyContext = createContext<VeyConfig | null>(null);

export function VeyProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: VeyConfig;
}) {
  return <VeyContext.Provider value={config}>{children}</VeyContext.Provider>;
}

export function useVeyContext() {
  const context = useContext(VeyContext);
  if (!context) {
    throw new Error('useVeyContext must be used within VeyProvider');
  }
  return context;
}
