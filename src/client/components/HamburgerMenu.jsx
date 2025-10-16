import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { useAuth } from '../context/AuthContext';

const HamburgerMenu = ({
  handleDownload,
  handleShare,
  handleColorPicker,
  handleSaveResume,
  branding,
  handleBrandingToggle,
  setShowAIModal,
  setShowLoginModal,
  setShowSignupModal,
  isAuthenticated,
  resumeTitle,
  currentResumeId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  
  useEffect(() => {
    console.log('🔧 HamburgerMenu mounted - branding value:', branding);
    console.log('🔧 HamburgerMenu - resumeTitle:', resumeTitle);
    console.log('🔧 HamburgerMenu - currentResumeId:', currentResumeId);
  }, [branding, resumeTitle, currentResumeId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('[data-hamburger-menu]')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getUserInitial = () => {
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user?.username) return user.username.charAt(0).toUpperCase();
    return 'U';
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleMenuItemClick = (action) => {
    action();
    setIsOpen(false);
  };

  return (
    <>
      <div 
        className="fixed z-50 xl:hidden" 
        style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 9999 }}
        data-hamburger-menu
      >
        <button
          onClick={toggleMenu}
          className="w-12 h-12 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center hover:bg-opacity-100 transition-all duration-200 border border-gray-200"
          aria-label="Menu"
        >
          <motion.div
            animate={isOpen ? "open" : "closed"}
            className="w-6 h-6 flex flex-col justify-center items-center"
          >
            <motion.span
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: 45, y: 6 }
              }}
              className="w-6 h-0.5 bg-gray-700 block absolute"
              style={{ transformOrigin: 'center' }}
            />
            <motion.span
              variants={{
                closed: { opacity: 1 },
                open: { opacity: 0 }
              }}
              className="w-6 h-0.5 bg-gray-700 block absolute"
              style={{ y: 6 }}
            />
            <motion.span
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: -45, y: 6 }
              }}
              className="w-6 h-0.5 bg-gray-700 block absolute"
              style={{ y: 12, transformOrigin: 'center' }}
            />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 w-80 h-full bg-white shadow-2xl border-r border-gray-200 overflow-y-auto"
              style={{ zIndex: 9998 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {isAuthenticated ? (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                        {getUserInitial()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user?.firstName || user?.username}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    
                    {resumeTitle && currentResumeId && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-800">{resumeTitle}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Current Resume
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-3">Sign in to save your resumes</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleMenuItemClick(() => setShowLoginModal(true))}
                        className="flex-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => handleMenuItemClick(() => setShowSignupModal(true))}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Tools</h3>
                  <div className="space-y-1">
                    <Link href="/templates">
                      <button
                        onClick={() => setIsOpen(false)}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Resume
                      </button>
                    </Link>

                    <button
                      onClick={() => {
                        setShowAIModal(true);
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI Assistant
                    </button>

                    <button
                      onClick={() => handleMenuItemClick(handleDownload)}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Download PDF
                    </button>

                    <button
                      onClick={() => handleMenuItemClick(handleShare)}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      Share
                    </button>

                    <button
                      onClick={() => handleMenuItemClick(handleColorPicker)}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z" />
                      </svg>
                      Color Theme
                    </button>

                    {isAuthenticated && (
                      <button
                        onClick={() => handleMenuItemClick(handleSaveResume)}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Save Resume
                      </button>
                    )}

                    <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-700">Branding</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={branding}
                          onChange={(e) => {
                            console.log('🔧 Toggle clicked - current branding:', branding);
                            console.log('🔧 Toggle clicked - checkbox checked:', e.target.checked);
                            handleBrandingToggle(e);
                          }}
                          className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-all duration-300 ease-in-out relative ${branding ? 'bg-blue-500' : 'bg-gray-300'}`}>
                          <div 
                            className="absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all duration-300 ease-in-out shadow-sm"
                            style={{
                              transform: branding ? 'translateX(20px)' : 'translateX(2px)'
                            }}
                          ></div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {isAuthenticated && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Account</h3>
                    <div className="space-y-1">
                      <Link href="/dashboard">
                        <button
                          onClick={() => setIsOpen(false)}
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          My Resumes
                        </button>
                      </Link>
                      <button
                        onClick={() => handleMenuItemClick(logout)}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              style={{ zIndex: 9997 }}
              onClick={() => setIsOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default HamburgerMenu;