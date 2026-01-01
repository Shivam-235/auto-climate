import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import './EnvizioLoader.css';
import EnvizioLogo from './EnvizioLogo';

export default function EnvizioLoader({ onComplete }) {
  const [stage, setStage] = useState('rising');

  useEffect(() => {
    const riseTimer = setTimeout(() => {
      setStage('displaying');
    }, 1500);

    const displayTimer = setTimeout(() => {
      setStage('splitting');
    }, 3000);

    const completeTimer = setTimeout(() => {
      setStage('complete');
      if (onComplete) onComplete();
    }, 4000);

    return () => {
      clearTimeout(riseTimer);
      clearTimeout(displayTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (stage === 'complete') return null;

  return (
    <AnimatePresence>
      <div className="envizio-loader">
        <motion.div
          className="logo-container"
          initial={{ y: '100vh', opacity: 0 }}
          animate={
            stage === 'rising' || stage === 'displaying'
              ? { y: 0, opacity: 1 }
              : { y: 0, opacity: 1 }
          }
          transition={{ duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <motion.div
            className="envizio-logo-wrapper"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <EnvizioLogo size={80} className="envizio-loader-logo" />
          </motion.div>
          <motion.h1
            className="envizio-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === 'displaying' || stage === 'splitting' ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            Envizio
          </motion.h1>
        </motion.div>

        <motion.div
          className="curtain curtain-left"
          initial={{ x: 0 }}
          animate={stage === 'splitting' ? { x: '-100%' } : { x: 0 }}
          transition={{ duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
        />
        <motion.div
          className="curtain curtain-right"
          initial={{ x: 0 }}
          animate={stage === 'splitting' ? { x: '100%' } : { x: 0 }}
          transition={{ duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
        />
      </div>
    </AnimatePresence>
  );
}
