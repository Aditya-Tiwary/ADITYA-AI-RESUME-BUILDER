import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { AuthContext } from "./context/AuthContext";
import { resumeService } from "./services/resumeService";

const gradientAnimationStyles = `
@keyframes gradientShift {
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement("style");
  styleElement.innerHTML = gradientAnimationStyles;
  if (!document.head.querySelector('style[data-gradient-animations]')) {
    styleElement.setAttribute('data-gradient-animations', 'true');
    document.head.appendChild(styleElement);
  }
}

const ViewIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const ResumeCardSkeleton = () => (
  <div 
    className="relative rounded-3xl shadow-xl border border-white/30 p-6 animate-pulse overflow-hidden backdrop-blur-sm"
    style={{
      background: "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.95) 100%)"
    }}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-amber-100/40 via-rose-100/40 via-blue-100/40 to-transparent"></div>
    
    <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-amber-200/30 to-orange-300/20 rounded-full blur-lg animate-pulse"></div>
    <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-rose-200/30 to-pink-300/20 rounded-full blur-lg animate-pulse animation-delay-2000"></div>
    
    <div className="flex justify-between items-start mb-6">
      <div className="flex-1">
        <div className="h-8 bg-gradient-to-r from-amber-200/60 via-rose-200/60 to-blue-200/60 rounded-xl w-3/4 mb-3 animate-pulse"></div>
        <div className="h-5 bg-gradient-to-r from-gray-200/80 to-gray-300/80 rounded-lg w-1/2 animate-pulse"></div>
      </div>
      <div className="flex flex-col items-end space-y-2">
        <div className="h-4 w-4 bg-gradient-to-r from-blue-300/80 to-indigo-400/80 rounded-full animate-pulse"></div>
        <div className="h-6 w-20 bg-gradient-to-r from-gray-200/80 to-gray-300/80 rounded-full animate-pulse"></div>
      </div>
    </div>
    
    <div className="space-y-3 mb-6">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-blue-400/60 rounded-full animate-pulse"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200/80 to-gray-300/80 rounded-full w-full animate-pulse"></div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-400/60 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200/80 to-gray-300/80 rounded-full w-2/3 animate-pulse animation-delay-2000"></div>
      </div>
    </div>
    
    <div className="flex justify-between items-center">
      <div className="h-4 bg-gradient-to-r from-gray-200/80 to-gray-300/80 rounded-full w-32 animate-pulse"></div>
      <div className="flex space-x-3">
        <div className="h-12 w-12 bg-gradient-to-r from-amber-300/60 to-orange-400/60 rounded-xl animate-pulse"></div>
        <div className="h-12 w-12 bg-gradient-to-r from-rose-300/60 to-pink-400/60 rounded-xl animate-pulse animation-delay-2000"></div>
      </div>
    </div>
  </div>
);

const ResumeDashboard = () => {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingResume, setEditingResume] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [copyLoading, setCopyLoading] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
      return;
    }
    
    fetchResumes();
  }, [isAuthenticated, setLocation]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedResumes = await resumeService.getResumes();
      setResumes(fetchedResumes);
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError(err.message || 'Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    try {
      setDeleteLoading(resumeId);
      await resumeService.deleteResume(resumeId);
      
      setResumes(prevResumes => 
        prevResumes.filter(resume => resume._id !== resumeId)
      );
      
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting resume:', err);
      setError(err.message || 'Failed to delete resume');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleViewResume = (resume) => {
    setLocation(`/templates/${resume.template.replace('template', '')}?resumeId=${resume._id}`);
  };

  const handleEditTitle = (resume) => {
    setEditingResume(resume._id);
    setEditingTitle(resume.title);
  };

  const handleSaveTitle = async () => {
    if (!editingTitle.trim()) {
      setError('Resume title cannot be empty');
      return;
    }

    try {
      const resumeToUpdate = resumes.find(r => r._id === editingResume);
      await resumeService.updateResume(
        editingResume, 
        resumeToUpdate,
        editingTitle.trim(),
        resumeToUpdate.template,
        resumeToUpdate.theme
      );

      setResumes(prevResumes =>
        prevResumes.map(resume =>
          resume._id === editingResume
            ? { ...resume, title: editingTitle.trim() }
            : resume
        )
      );

      setEditingResume(null);
      setEditingTitle('');
      setError(null);
    } catch (err) {
      console.error('Error updating resume title:', err);
      setError(err.message || 'Failed to update resume title');
    }
  };

  const handleCancelEdit = () => {
    setEditingResume(null);
    setEditingTitle('');
  };

  const handleCopyResume = async (resume) => {
    try {
      setCopyLoading(resume._id);
      setError(null);
      
      const duplicatedResume = await resumeService.duplicateResume(resume._id);
      
      setResumes(prevResumes => [duplicatedResume.resume, ...prevResumes]);
      
    } catch (err) {
      console.error('Error copying resume:', err);
      setError(err.message || 'Failed to copy resume');
    } finally {
      setCopyLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTemplateDisplayName = (template) => {
    const templateMap = {
      'template1': 'Classic',
      'template2': 'Creative',
      'template3': 'Modern'
    };
    return templateMap[template] || template;
  };

  const getThemeColor = (theme, template = null) => {
    const getColorStyle = (colorValue) => ({ backgroundColor: colorValue });
    
    if (template && theme === 'red') {
      const templateSpecificColors = {
        'template2': '#dc2626',
        'template3': '#ec4899'
      };
      if (templateSpecificColors[template]) {
        return getColorStyle(templateSpecificColors[template]);
      }
    }
    
    const themeColors = {
      'blue': '#3b82f6',
      'red': '#dc2626',      
      'green': '#059669',    
      'purple': '#7c3aed',
      'orange': '#ea580c',
      'teal': '#0891b2'
    };
    
    const colorValue = themeColors[theme] || '#6b7280';
    return getColorStyle(colorValue);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #c4b5e7 0%, #9f9dd4 50%, #ada4e2 100%)",
        backgroundSize: "400% 400%",
        animation: "gradient 8s ease infinite"
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >


      <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/40 to-purple-50/30 shadow-xl border-b border-blue-100/60">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-transparent to-purple-400/10 animate-pulse"></div>
        </div>
        
        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-6">
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="relative"
            >
              <div className="relative mb-3">
                <h1 className="text-3xl md:text-4xl font-bold mb-1 text-left leading-tight relative z-10">
                  <span
                    className="animated-gradient-text"
                    style={{
                      backgroundImage: "linear-gradient(135deg, #ff6b35, #ff8f65, #ff9a56, #ff6b35)",
                      backgroundSize: "300% auto",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      animation: "gradientShift 4s ease infinite"
                    }}
                  >
                    My Resumes
                  </span>
                </h1>
                
                <motion.div 
                  className="h-1 rounded-full"
                  style={{ 
                    width: '80px',
                    background: "linear-gradient(135deg, #ff6b35, #ff8f65)"
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: '80px' }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                />
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative"
              >
                <div className="inline-flex items-center px-5 py-2.5 rounded-2xl text-sm font-medium text-slate-700 relative overflow-hidden backdrop-blur-sm border border-white/60 shadow-lg"
                     style={{
                       background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)",
                       boxShadow: "0 8px 32px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.8)"
                     }}>
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center mr-3"
                    style={{ background: "linear-gradient(135deg, #00bcd4, #00acc1)" }}
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="relative z-10">Manage and view your saved resumes</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-4 lg:mt-0 flex justify-center lg:justify-end relative"
            >
              <Link href="/templates">
                <button 
                  className="inline-flex items-center px-6 py-3 font-bold text-base text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #00bcd4 0%, #00acc1 50%, #0097a7 100%)",
                    border: "2px solid rgba(255,255,255,0.4)"
                  }}
                >
                  <div className="flex items-center">
                    <div className="mr-3 transform hover:rotate-90 transition-transform duration-300">
                      <PlusIcon />
                    </div>
                    <span className="font-bold">Create New Resume</span>
                  </div>
                </button>
              </Link>
            </motion.div>
          </motion.header>
        </div>
      </div>

      <div className="relative mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {error && (
          <motion.div
            className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-2xl p-6 mb-8 shadow-lg backdrop-blur-sm"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button
                  onClick={fetchResumes}
                  className="inline-flex items-center mt-3 px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors duration-200"
                >
                  Try again
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ResumeCardSkeleton />
              </motion.div>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <motion.div
            className="text-center py-24 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", damping: 20 }}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-96 h-96 bg-gradient-to-r from-purple-200/20 via-purple-300/15 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            </div>
            
            <div className="relative">
              <div className="relative mx-auto w-40 h-40 mb-10">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-200/40 to-purple-300/30 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 bg-gradient-to-br from-purple-100/50 to-purple-200/40 rounded-full animate-pulse animation-delay-2000"></div>
                <div className="absolute inset-4 bg-gradient-to-br from-purple-50/60 to-purple-100/50 rounded-full animate-pulse animation-delay-4000"></div>
                <div className="absolute inset-6 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-purple-200/30">
                  <svg className="w-20 h-20 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-4xl font-black text-gray-900 mb-4">
                  No resumes yet
                </h3>
                <p className="text-gray-700 text-xl max-w-lg mx-auto leading-relaxed bg-white/70 backdrop-blur-sm px-6 py-4 rounded-2xl">
                  Get started by creating your first resume. Choose from our professional templates and build your perfect resume.
                </p>
                

              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence>
              {resumes.map((resume, index) => (
                <motion.div
                  key={resume._id}
                  className="group relative rounded-3xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-sm"
                  style={{
                    background: "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.95) 100%)"
                  }}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.9 }}
                  transition={{ 
                    delay: index * 0.1, 
                    type: "spring", 
                    damping: 20,
                    stiffness: 300 
                  }}
                  whileHover={{ 
                    y: -12,
                    scale: 1.02,
                    transition: { duration: 0.4, type: "spring", damping: 15 }
                  }}
                  layout
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-rose-100/20 to-blue-100/30"></div>
                  </div>
                  
                  <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-amber-200/20 to-orange-300/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-rose-200/20 to-pink-300/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <div className="relative p-8 border-b border-gray-100/50">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1 min-w-0">
                        {editingResume === resume._id ? (
                          <div className="mb-2 -ml-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                className="text-xl font-bold text-gray-900 bg-white border-2 border-blue-300 rounded-lg px-3 py-1 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveTitle();
                                  } else if (e.key === 'Escape') {
                                    handleCancelEdit();
                                  }
                                }}
                              />
                              <motion.button
                                onClick={handleSaveTitle}
                                className="px-2 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Save (Enter)"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </motion.button>
                              <motion.button
                                onClick={handleCancelEdit}
                                className="px-2 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Cancel (Escape)"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </motion.button>
                            </div>
                          </div>
                        ) : (
                          <h3 
                            className="text-2xl font-bold text-gray-900 truncate mb-2 group-hover:text-blue-700 transition-colors duration-300 cursor-pointer hover:bg-blue-50 rounded px-2 py-1 -mx-2"
                            onClick={() => handleEditTitle(resume)}
                            title="Click to rename"
                          >
                            {resume.title}
                          </h3>
                        )}
                        <p className="text-lg text-gray-600 truncate font-medium">
                          {resume.name || 'Untitled Resume'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        <div className="flex items-center space-x-2">
                          <span className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white" style={getThemeColor(resume.theme, resume.template)}></span>
                        </div>
                        <span className="text-xs text-gray-500 font-semibold px-2 py-1 bg-gray-100 rounded-full">
                          {getTemplateDisplayName(resume.template)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {resume.role && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full" style={getThemeColor(resume.theme, resume.template)}></div>
                          <p className="text-gray-700 truncate font-medium">{resume.role}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative p-6 pt-4">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500 font-medium">
                        Updated {formatDate(resume.lastModified)}
                      </div>
                      
                      <div className="flex space-x-3">
                        <motion.button
                          onClick={() => handleViewResume(resume)}
                          className="px-4 py-4 text-white rounded-xl transition-all duration-300 border-2 border-teal-300/50 hover:border-teal-400 hover:shadow-lg"
                          title="Edit Resume"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            background: "linear-gradient(135deg, #00A090 0%, #059669 100%)"
                          }}
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>

                        <motion.button
                          onClick={() => handleCopyResume(resume)}
                          disabled={copyLoading === resume._id}
                          className="px-4 py-4 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-300/50 hover:border-blue-400 hover:shadow-lg"
                          title="Create a Copy"
                          whileHover={{ scale: copyLoading === resume._id ? 1 : 1.1 }}
                          whileTap={{ scale: copyLoading === resume._id ? 1 : 0.95 }}
                          style={{
                            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                          }}
                        >
                          {copyLoading === resume._id ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </motion.button>
                        <motion.button
                          onClick={() => setShowDeleteConfirm(resume._id)}
                          disabled={deleteLoading === resume._id}
                          className="px-4 py-4 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-300/50 hover:border-red-400 hover:shadow-lg"
                          title="Delete Resume"
                          whileHover={{ scale: deleteLoading === resume._id ? 1 : 1.1 }}
                          whileTap={{ scale: deleteLoading === resume._id ? 1 : 0.95 }}
                          style={{
                            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                          }}
                        >
                          {deleteLoading === resume._id ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/20"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <div className="text-red-600">
                    <DeleteIcon />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Resume</h3>
                  <p className="text-sm text-gray-500">This action is permanent</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-8 leading-relaxed">
                Are you sure you want to delete this resume? This action cannot be undone and all your work will be lost.
              </p>
              
              <div className="flex space-x-4">
                <motion.button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 text-gray-600 bg-white hover:bg-gray-50 rounded-2xl font-medium transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={() => handleDeleteResume(showDeleteConfirm)}
                  disabled={deleteLoading === showDeleteConfirm}
                  className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-2xl font-medium transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: deleteLoading === showDeleteConfirm ? 1 : 1.02 }}
                  whileTap={{ scale: deleteLoading === showDeleteConfirm ? 1 : 0.98 }}
                >
                  {deleteLoading === showDeleteConfirm ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete Forever'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ResumeDashboard;