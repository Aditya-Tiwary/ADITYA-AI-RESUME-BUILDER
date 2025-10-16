import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useContextMenu } from '../contexts/ContextMenuContext';

const ContextMenu = ({ 
  children, 
  sectionType, 
  onAdd, 
  onRemove, 
  canRemove = true, 
  addText = "Add", 
  removeText = "Remove" 
}) => {
  const { activeMenu, openContextMenu, closeContextMenu } = useContextMenu();
  const contextMenuRef = useRef(null);
  const componentId = useRef(Math.random().toString(36));

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const resumeContainer = e.target.closest('.resume-container') || e.target.closest('[data-resume-container]') || document.querySelector('.resume-container');
    
    if (!resumeContainer) {
      openContextMenu({
        id: componentId.current,
        x: e.clientX,
        y: e.clientY,
        sectionType,
        onAdd,
        onRemove,
        canRemove,
        addText,
        removeText,
        positioning: 'fixed'
      });
      return;
    }
    
    const containerRect = resumeContainer.getBoundingClientRect();
    const menuWidth = 160;
    const menuHeight = canRemove ? 80 : 40;
    
    let x = e.clientX - containerRect.left;
    let y = e.clientY - containerRect.top;
    
    if (x + menuWidth > containerRect.width) {
      x = containerRect.width - menuWidth - 8;
    }
    if (x < 8) {
      x = 8;
    }
    
    if (y + menuHeight > containerRect.height) {
      y = containerRect.height - menuHeight - 8;
    }
    if (y < 8) {
      y = 8;
    }
    
    openContextMenu({
      id: componentId.current,
      x,
      y,
      sectionType,
      onAdd,
      onRemove,
      canRemove,
      addText,
      removeText,
      positioning: 'absolute',
      containerElement: resumeContainer
    });
  };

  const handleClick = () => {
    closeContextMenu();
  };

  const handleMenuAction = (action) => {
    action();
    closeContextMenu();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        closeContextMenu();
      }
    };

    const handleScroll = () => {
      closeContextMenu();
    };

    const handleContextMenuGlobal = (e) => {
      if (!e.target.closest('[data-context-menu]')) {
        closeContextMenu();
      }
    };

    if (activeMenu) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('scroll', handleScroll);
      document.addEventListener('contextmenu', handleContextMenuGlobal);
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('contextmenu', handleContextMenuGlobal);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeMenu, closeContextMenu]);

  const isActiveMenu = activeMenu && activeMenu.id === componentId.current;

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        onClick={handleClick}
        className="relative"
        data-context-menu
      >
        {children}
      </div>
      
      {isActiveMenu && (
        <>
          {activeMenu.positioning === 'absolute' && activeMenu.containerElement ? (
            createPortal(
              <div
                ref={contextMenuRef}
                className="absolute z-[99999] print-hide animate-in fade-in-0 zoom-in-95 duration-200"
                style={{
                  left: activeMenu.x,
                  top: activeMenu.y,
                }}
              >
                <div className="bg-white border border-gray-300 rounded-lg shadow-lg py-1 min-w-[160px] overflow-hidden">
                  <button
                    onClick={() => handleMenuAction(activeMenu.onAdd)}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                  >
                    <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>
                      {activeMenu.addText} {activeMenu.sectionType}
                    </span>
                  </button>

                  {activeMenu.canRemove && (
                    <div className="mx-1 border-t border-gray-200"></div>
                  )}
                  
                  {activeMenu.canRemove && (
                    <button
                      onClick={() => handleMenuAction(activeMenu.onRemove)}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <svg className="w-4 h-4 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>
                        {activeMenu.removeText} {activeMenu.sectionType}
                      </span>
                    </button>
                  )}
                </div>
              </div>,
              activeMenu.containerElement
            )
          ) : (
            <div
              ref={contextMenuRef}
              className="fixed z-[99999] print-hide animate-in fade-in-0 zoom-in-95 duration-200"
              style={{
                left: activeMenu.x,
                top: activeMenu.y,
              }}
            >
              <div className="bg-white border border-gray-300 rounded-lg shadow-lg py-1 min-w-[160px] overflow-hidden">
                <button
                  onClick={() => handleMenuAction(activeMenu.onAdd)}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                >
                  <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>
                    {activeMenu.addText} {activeMenu.sectionType}
                  </span>
                </button>

                {activeMenu.canRemove && (
                  <div className="mx-1 border-t border-gray-200"></div>
                )}
                
                {activeMenu.canRemove && (
                  <button
                    onClick={() => handleMenuAction(activeMenu.onRemove)}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <svg className="w-4 h-4 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>
                      {activeMenu.removeText} {activeMenu.sectionType}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ContextMenu;