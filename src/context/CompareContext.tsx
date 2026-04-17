import React, { createContext, useContext, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { useCompareComponent } from '@screens/BottomTab/ranking/rankingScreen/useCompareComponent';
import CompareModals from '@screens/BottomTab/ranking/rankingScreen/CompareModals';

type CompareContextType = ReturnType<typeof useCompareComponent>;

const CompareContext = createContext<CompareContextType | null>(null);

export const CompareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const compareHook = useCompareComponent(token);

  return (
    <CompareContext.Provider value={compareHook}>
       {children}
       <CompareModals token={token} useCompareHook={compareHook} />
    </CompareContext.Provider>
  );
};

export const useCompareContext = (): CompareContextType => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompareContext must be used within a CompareProvider');
  }
  return context;
};
