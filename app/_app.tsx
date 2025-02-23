// pages/_app.tsx
import type { AppProps } from "next/app";
import { AnimatePresence, motion } from "motion/react";
import "../styles/globals.css";

const App = ({ Component, pageProps, router }: AppProps) => {
  const pageVariants = {
    initial: { opacity: 0, x: -50, y: 20 },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: 50, y: -20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.75,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={router.route}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        <Component {...pageProps} />
      </motion.div>
    </AnimatePresence>
  );
};

export default App;