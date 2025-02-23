"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

interface TransitionWrapperProps {
  children: React.ReactNode;
}

const TransitionWrapper = ({ children }: TransitionWrapperProps) => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [showTransition, setShowTransition] = useState(false);

  // Show the page loader on initial load for 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // When the pathname changes, show the blue overlay transition
  useEffect(() => {
    setShowTransition(true);
    const timer = setTimeout(() => {
      setShowTransition(false);
    }, 750);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* Initial Page Loader */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          >
            {/* A simple CSS spinner */}
            <div className="loader" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Transition Overlay */}
      <AnimatePresence>
        {showTransition && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75 }}
            className="fixed inset-0 z-40 bg-blue-500"
          />
        )}
      </AnimatePresence>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default TransitionWrapper;
