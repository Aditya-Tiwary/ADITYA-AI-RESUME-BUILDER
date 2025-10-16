import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import HamburgerMenu from "./components/HamburgerMenu";
import { Link } from "wouter";


const animationStyles = `
@keyframes gradientShift {
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}

@keyframes shimmer {
  0% { background-position: 100% 0% }
  50% { background-position: 0% 100% }
  100% { background-position: 100% 0% }
}

@keyframes gradient {
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8 }
  50% { transform: scale(1.05); opacity: 1 }
  100% { transform: scale(1); opacity: 0.8 }
}

@keyframes float {
  0% { transform: translateY(0px) }
  50% { transform: translateY(-10px) }
  100% { transform: translateY(0px) }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-3000 {
  animation-delay: 3s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.animation-delay-5000 {
  animation-delay: 5s;
}

.animate-blob {
  animation: blob 10s infinite;
}

.animate-float {
  animation: float 5s ease-in-out infinite;
}

.template-card {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.template-card:hover {
  transform: translateY(-8px);
}

.shine-effect {
  position: relative;
  overflow: hidden;
}

.shine-effect::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    to bottom right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(30deg);
  transition: transform 0.5s;
  pointer-events: none;
}

.shine-effect:hover::after {
  transform: rotate(30deg) translate(100%, 100%);
}

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.neon-glow {
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.6),
              0 0 30px rgba(249, 115, 22, 0.4),
              0 0 45px rgba(249, 115, 22, 0.2);
  transition: box-shadow 0.3s ease;
}

.neon-glow:hover {
  box-shadow: 0 0 25px rgba(249, 115, 22, 0.8),
              0 0 50px rgba(249, 115, 22, 0.6),
              0 0 75px rgba(249, 115, 22, 0.4);
}

.glassmorphism {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.button-hover-effect {
  transition: all 0.3s ease;
}

.button-hover-effect:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(249, 115, 22, 0.5);
}

.template-shine {
  position: relative;
  overflow: hidden;
}

.template-shine::after {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: linear-gradient(
    to bottom right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(30deg);
  animation: shineEffect 6s infinite linear;
  pointer-events: none;
}

@keyframes shineEffect {
  0% { transform: rotate(30deg) translate(-100%, -100%); }
  100% { transform: rotate(30deg) translate(100%, 100%); }
}

.card-3d-effect {
  transition: transform 0.5s ease;
  transform-style: preserve-3d;
}

.card-3d-effect:hover {
  transform: perspective(1000px) rotateX(5deg) rotateY(5deg);
}
`;


const TemplateSelection = ({ setActiveStep }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [showResumeEditor, setShowResumeEditor] = useState(false);
  const [showModernEditor, setShowModernEditor] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  const getUserInitial = () => {
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    } else if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = animationStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const templates = [
    {
      id: 1,
      name: "Classic",
      preview: "/assets/classic-resume.png",
      description: "Timeless elegance for traditional industries",
      features: ["Clean layout", "Easy to scan", "ATS-friendly"],
      color: "from-amber-500 to-orange-600",
      shadowColor: "rgba(245, 158, 11, 0.5)",
    },
    {
      id: 2,
      name: "Creative",
      preview: "/assets/creative-resume.png",
      description: "Stand out with unique flair and personality",
      features: ["Unique design", "Visual elements", "Modern approach"],
      color: "from-rose-500 to-pink-600",
      shadowColor: "rgba(244, 63, 94, 0.5)",
    },
    {
      id: 3,
      name: "Modern",
      preview: "/assets/modern-resume.png",
      description: "Clean, contemporary design for the digital age",
      features: ["Professional", "Minimalist", "Tech-friendly"],
      color: "from-blue-500 to-indigo-600",
      shadowColor: "rgba(59, 130, 246, 0.5)",
    },
  ];

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplate(templateId);
    if (setActiveStep) {
      setActiveStep(2);
    }
  };

  const handleContinue = () => {
    if (selectedTemplate === 1) {
      window.location.href = "/templates/1";
    } else if (selectedTemplate === 2) {
      window.location.href = "/templates/2";
    } else if (selectedTemplate === 3) {
      window.location.href = "/templates/3";
    } else {
      alert(
        `The ${
          templates.find((t) => t.id === selectedTemplate)?.name
        } template is currently under development. Please try the Classic template.`,
      );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const templateVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (showResumeEditor || showModernEditor) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: "linear-gradient(135deg, #111827, #1f2937)" }}
      >
        <div className="p-8 rounded-xl bg-white/10 backdrop-blur-md flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-lg text-white">Preparing your template...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden relative w-full"
      style={{
        background: "linear-gradient(90deg, #c4b5e7, #9f9dd4, #ada4e2)",
        backgroundSize: "100% 100%",
        position: "relative",
        top: 0,
        left: 0,
      }}
    >

      <div
        className="fixed z-50 xl:hidden"
        style={{ position: "fixed", top: "1rem", left: "1rem", zIndex: 9999 }}
        data-hamburger-menu
      >
        <button
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          className="w-12 h-12 bg-white bg-opacity-30 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center hover:bg-opacity-40 transition-all duration-200 border border-white border-opacity-20"
          aria-label="Menu"
        >
          <motion.div
            animate={showUserDropdown ? "open" : "closed"}
            className="w-6 h-6 flex flex-col justify-center items-center"
          >
            <motion.span
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: 45, y: 6 },
              }}
              className="w-6 h-0.5 bg-gray-700 block absolute"
              style={{ transformOrigin: "center" }}
            />
            <motion.span
              variants={{
                closed: { opacity: 1 },
                open: { opacity: 0 },
              }}
              className="w-6 h-0.5 bg-gray-700 block absolute"
              style={{ y: 6 }}
            />
            <motion.span
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: -45, y: 6 },
              }}
              className="w-6 h-0.5 bg-gray-700 block absolute"
              style={{ y: 12, transformOrigin: "center" }}
            />
          </motion.div>
        </button>


        <AnimatePresence>
          {showUserDropdown && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 w-80 h-full bg-white bg-opacity-95 backdrop-blur-md shadow-2xl border-r border-gray-200 overflow-y-auto"
              style={{ zIndex: 9998 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                  <button
                    onClick={() => setShowUserDropdown(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>


                {!isAuthenticated ? (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-3">
                      Sign in to save your resumes
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setShowLoginModal(true);
                          setShowUserDropdown(false);
                        }}
                        className="flex-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setShowSignupModal(true);
                          setShowUserDropdown(false);
                        }}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                        {getUserInitial()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user?.firstName || user?.username}
                        </p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Link href="/dashboard">
                        <button
                          onClick={() => setShowUserDropdown(false)}
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                        >
                          <svg
                            className="w-5 h-5 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          My Resumes
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                      >
                        <svg
                          className="w-5 h-5 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
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
          {showUserDropdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              style={{ zIndex: 9997 }}
              onClick={() => setShowUserDropdown(false)}
            />
          )}
        </AnimatePresence>
      </div>
      <div className="fixed right-0 top-1/4 w-24 h-24 md:w-32 md:h-32 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="fixed left-20 bottom-1/3 w-36 h-36 md:w-48 md:h-48 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="fixed left-1/2 top-1/2 w-24 h-24 md:w-40 md:h-40 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-7xl mx-auto px-4 py-6 relative z-10 flex flex-col items-center justify-center min-h-screen"
      >
        <motion.header
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-5xl mb-8 text-center"
        >
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span
                className="animated-gradient-text"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #FF5500, #FF9500, #FF5500)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "inline-block",
                  animation: "gradientShift 3s ease infinite",
                }}
              >
                Design Your Career
              </span>{" "}
              <span
                className="animated-gradient-text"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #009688, #00E5CA, #009688)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "inline-block",
                  animation: "gradientShift 3s ease infinite 0.5s",
                }}
              >
                Future
              </span>
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Select a template to showcase your skills and experience
            </p>
          </div>
        </motion.header>


        {isAuthenticated ? (
          <div className="fixed top-6 right-6 z-50">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              {getUserInitial()}
            </button>


            {showUserDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50"
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName || user?.username}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                
                <Link href="/dashboard">
                  <button
                    onClick={() => setShowUserDropdown(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    My Resume
                  </button>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="fixed top-6 right-6 z-50 xl:flex space-x-2 hidden">
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg font-medium hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm border border-white border-opacity-30"
            >
              Login
            </button>
            <button
              onClick={() => setShowSignupModal(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-all duration-200 shadow-lg"
            >
              Sign Up
            </button>
          </div>
        )}

        <motion.div
          className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {templates.map((template) => {
            const isSelected = selectedTemplate === template.id;

            return (
              <motion.div
                key={template.id}
                variants={templateVariants}
                className={`relative template-card template-shine`}
                onClick={() => handleSelectTemplate(template.id)}
                animate={
                  isSelected
                    ? {
                        y: -12,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                        },
                      }
                    : {}
                }
                whileHover={{
                  y: isSelected ? -16 : -8,
                  boxShadow: isSelected
                    ? "0 25px 35px rgba(0, 0, 0, 0.15)"
                    : "0 20px 30px rgba(0, 0, 0, 0.12)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={`relative h-full rounded-xl overflow-hidden ${
                    isSelected
                      ? "ring-4 ring-[#FF6B00]"
                      : "border-2 border-gray-300"
                  }`}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    boxShadow: isSelected
                      ? `0 12px 30px -5px rgba(255, 107, 0, 0.7),
                         0 4px 12px -2px rgba(255, 107, 0, 0.6),
                         0 0 0 2px white,
                         0 0 0 4px rgba(255, 107, 0, 0.5)`
                      : "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div
                    style={{
                      padding: "1rem",
                      position: "relative",
                      overflow: "hidden",
                      backgroundSize: "200% 200%",
                      animation: "gradientShift 3s ease infinite",
                      backgroundImage:
                        template.id === 1
                          ? "linear-gradient(45deg, #FF5500, #FF9500, #FF7000, #FF5500)"
                          : template.id === 2
                            ? "linear-gradient(45deg, #DC2626, #EF4444, #F87171, #DC2626)"
                            : template.id === 3
                              ? "linear-gradient(45deg, #0EA5E9, #38BDF8, #7DD3FC, #0EA5E9)"
                              : "linear-gradient(45deg, #FF5500, #FF9500, #FF7000, #FF5500)",
                    }}
                  >
                    <div className="relative z-10">
                      {isSelected ? (
                        <motion.h3
                          className="text-2xl font-bold flex items-center"
                          initial={{ scale: 1 }}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                          <span className="relative">
                            <span className="text-white font-extrabold drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                              {template.id === 3
                                ? "Modern"
                                : template.name}
                            </span>
                          </span>
                        </motion.h3>
                      ) : (
                        <h3 className="text-xl font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                          {template.id === 3 ? "Modern" : template.name}
                        </h3>
                      )}
                      <p className="text-white text-sm mt-1 font-medium bg-black/50 px-2 py-1 rounded inline-block">
                        {template.description}
                      </p>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-white/10"></div>
                    <div className="absolute -right-5 -bottom-5 w-16 h-16 rounded-full bg-white/10"></div>
                    {isSelected && (
                      <motion.div
                        className="absolute -left-3 -top-3 w-16 h-16 opacity-40"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.4 }}
                        transition={{ delay: 0.3 }}
                      >
                        <svg
                          viewBox="0 0 200 200"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill="#FFFFFF"
                            d="M46.5,-70.8C59,-61.9,67.3,-47.2,72.5,-31.4C77.7,-15.6,79.9,1.3,77.1,17.8C74.2,34.3,66.4,50.5,53.9,59.9C41.4,69.2,24.1,71.6,7.2,73C-9.8,74.4,-26.3,74.7,-38.8,67.6C-51.3,60.5,-59.8,46,-64.9,31C-70,16,-71.7,0.6,-69,-14.1C-66.4,-28.8,-59.3,-42.6,-48,-53.9C-36.8,-65.3,-21.2,-74.1,-3.6,-69.5C13.9,-64.9,33.9,-49.8,46.5,-70.8Z"
                            transform="translate(100 100)"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </div>

                  <div className="relative p-3 flex justify-center items-center bg-gray-100">
                    <div
                      className="relative rounded-lg overflow-hidden shadow-md w-full"
                      style={{
                        height: "200px",
                      }}
                    >
                      <img
                        src={
                          template.preview
                        }
                        alt={`${template.name} template preview`}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>

                  <div className="p-3 border-t border-gray-200">
                    <ul className="flex flex-wrap gap-2 justify-center">
                      {template.features.map((feature, idx) => {
                        const tagColors = {
                          1: [
                            "bg-white text-orange-600 border border-orange-300",
                            "bg-white text-amber-600 border border-amber-300",
                            "bg-white text-yellow-600 border border-yellow-300",
                          ],
                          2: [
                            "bg-white text-rose-600 border border-rose-300",
                            "bg-white text-pink-600 border border-pink-300",
                            "bg-white text-fuchsia-600 border border-fuchsia-300",
                          ],
                          3: [
                            "bg-white text-blue-600 border border-blue-300",
                            "bg-white text-indigo-600 border border-indigo-300",
                            "bg-white text-sky-600 border border-sky-300",
                          ],
                        };

                        const selectedColors = {
                          1: [
                            "bg-white text-orange-700 border-2 border-orange-400",
                            "bg-white text-amber-700 border-2 border-amber-400",
                            "bg-white text-yellow-700 border-2 border-yellow-400",
                          ],
                          2: [
                            "bg-white text-rose-700 border-2 border-rose-400",
                            "bg-white text-pink-700 border-2 border-pink-400",
                            "bg-white text-fuchsia-700 border-2 border-fuchsia-400",
                          ],
                          3: [
                            "bg-white text-teal-700 border-2 border-teal-400",
                            "bg-white text-emerald-700 border-2 border-emerald-400",
                            "bg-white text-green-700 border-2 border-green-400",
                          ],
                        };

                        const colorClass = isSelected
                          ? selectedColors[template.id][idx % 3]
                          : tagColors[template.id][idx % 3];

                        return (
                          <motion.li
                            key={idx}
                            className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${colorClass}`}
                            whileHover={{ y: -2, scale: 1.05 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 10,
                            }}
                          >
                            {isSelected ? (
                              <span className="flex items-center">
                                <span className="mr-1">•</span> {feature}
                              </span>
                            ) : (
                              feature
                            )}
                          </motion.li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="p-3">
                    <button
                      className={`w-full py-3 rounded-lg font-medium transition-all duration-300`}
                      style={{
                        backgroundColor: "#FF5500",
                        color: "white",
                        fontWeight: isSelected ? "bold" : "normal",
                        border: "2px solid #C2410C",
                        boxShadow: isSelected
                          ? "0 8px 20px rgba(255, 107, 0, 0.7)"
                          : "0 6px 15px rgba(255, 107, 0, 0.5)",
                      }}
                    >
                      {isSelected ? (
                        <span className="flex items-center justify-center">
                          <span className="bg-orange-600 text-white px-4 py-1 rounded-md font-bold">
                            Selected Template
                          </span>
                        </span>
                      ) : (
                        <span className="text-white font-semibold">
                          Select Template
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="absolute -top-3 -right-3 bg-gradient-to-br from-[#FF5500] to-[#FF9500] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-10 border-2 border-black"
                    style={{
                      boxShadow:
                        "0 4px 12px rgba(255, 112, 0, 0.6), 0 0 0 4px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      viewBox="0 0 20 20"
                      fill="#FFFFFF"
                      stroke="#000000"
                      strokeWidth="0.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {selectedTemplate && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
            }}
            className="text-center mt-2 mb-6"
          >
            <motion.button
              onClick={
                handleContinue
              }
              className="px-8 py-3 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 text-center btn-shine relative overflow-hidden border-2 border-teal-600"
              style={{
                background:
                  "linear-gradient(to right, #0D9488, #14B8A6)",
                backgroundSize:
                  "200% 200%",
                boxShadow:
                  "0 8px 20px rgba(20, 184, 166, 0.6)",
              }}
              whileHover={{
                scale: 1.03,
                boxShadow:
                  "0 10px 25px rgba(20, 184, 166, 0.8)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative flex items-center justify-center">
                <span>
                  Continue with{" "}
                  {templates.find((t) => t.id === selectedTemplate)?.name}
                </span>
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  ></path>
                </svg>
              </span>
            </motion.button>
          </motion.div>
        )}
      </motion.div>


      {showLoginModal && (
        <Login
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {showSignupModal && (
        <Signup
          onSwitchToLogin={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
          onClose={() => setShowSignupModal(false)}
        />
      )}
    </div>
  );
};

export default TemplateSelection;
