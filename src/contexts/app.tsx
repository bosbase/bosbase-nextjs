"use client";

import { createContext, useContext, type ReactNode } from "react";

interface AppContextType {
  // Add your app context properties here as needed
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  // Add your context value logic here
  const value: AppContextType = {};

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}

