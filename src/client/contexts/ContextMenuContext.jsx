import React, { createContext, useContext, useState } from 'react';

const ContextMenuContext = createContext();

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
};

export const ContextMenuProvider = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const openContextMenu = (menuData) => {
    setActiveMenu(menuData);
  };

  const closeContextMenu = () => {
    setActiveMenu(null);
  };

  return (
    <ContextMenuContext.Provider 
      value={{ 
        activeMenu, 
        openContextMenu, 
        closeContextMenu 
      }}
    >
      {children}
    </ContextMenuContext.Provider>
  );
};