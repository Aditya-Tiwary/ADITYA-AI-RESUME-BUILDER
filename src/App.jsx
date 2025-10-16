import React, { useState, useEffect, lazy, Suspense } from "react";
import { Route, Switch, Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider } from "./client/context/AuthContext";
import { ContextMenuProvider } from "./client/contexts/ContextMenuContext";
import ErrorBoundary from "./client/components/ErrorBoundary";

const HomePage = lazy(() => import("./client/HomePage"));
const ResumeTemplate1 = lazy(() => import("./client/templates/Template1"));
const ResumeTemplate2 = lazy(() => import("./client/templates/Template2"));
const ResumeTemplate3 = lazy(() => import("./client/templates/Template3"));
const TemplateSelection = lazy(() => import("./client/TemplateSelection"));
const ResumeDashboard = lazy(() => import("./client/ResumeDashboard"));

const LoadingFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-t-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
    </div>
  </div>
);

const App = () => {
  const [location] = useLocation();
  const [isServerRunning, setIsServerRunning] = useState(false);

  useEffect(() => {
    setIsServerRunning(true);

    const handleUnhandledRejection = (event) => {
      console.warn('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const ServerWarning = () => {
    return null;
  };

  return (
    <>
      <ServerWarning />

      <ErrorBoundary>
        <ContextMenuProvider>
          <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <AnimatePresence mode="wait">
              <Switch location={location} key={location}>
            <Route path="/" component={HomePage} />
            <Route path="/dashboard" component={ResumeDashboard} />
            <Route path="/templates/1" component={ResumeTemplate1} />
            <Route path="/templates/2" component={ResumeTemplate2} />
            <Route path="/templates/3" component={ResumeTemplate3} />
            <Route path="/templates" component={TemplateSelection} />

            <Route>
              <motion.div
                className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  Page Not Found
                </h1>
                <p className="text-gray-600 mb-8">
                  The page you're looking for doesn't exist.
                </p>
                <Link href="/">
                  <a className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300">
                    Return to Home
                  </a>
                </Link>
              </motion.div>
            </Route>
            </Switch>
          </AnimatePresence>
        </Suspense>
          </AuthProvider>
        </ContextMenuProvider>
      </ErrorBoundary>
    </>
  );
};

export default App;
