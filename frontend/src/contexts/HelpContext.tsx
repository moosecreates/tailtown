/**
 * Help Context
 * Provides page-specific help content throughout the application
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { PageHelpContent } from '../types/help';
import HelpModal from '../components/help/HelpModal';

interface HelpContextType {
  openHelp: (articleId?: string) => void;
  closeHelp: () => void;
  setPageContent: (content: PageHelpContent) => void;
  pageContent: PageHelpContent | undefined;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within HelpProvider');
  }
  return context;
};

interface HelpProviderProps {
  children: React.ReactNode;
}

export const HelpProvider: React.FC<HelpProviderProps> = ({ children }) => {
  const [helpOpen, setHelpOpen] = useState(false);
  const [pageContent, setPageContent] = useState<PageHelpContent | undefined>();
  const [initialArticleId, setInitialArticleId] = useState<string | undefined>();

  const openHelp = useCallback((articleId?: string) => {
    setInitialArticleId(articleId);
    setHelpOpen(true);
  }, []);

  const closeHelp = useCallback(() => {
    setHelpOpen(false);
    setInitialArticleId(undefined);
  }, []);

  return (
    <HelpContext.Provider
      value={{
        openHelp,
        closeHelp,
        setPageContent,
        pageContent
      }}
    >
      {children}
      <HelpModal
        open={helpOpen}
        onClose={closeHelp}
        pageContent={pageContent}
        initialArticleId={initialArticleId}
      />
    </HelpContext.Provider>
  );
};
