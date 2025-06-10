'use client';
import { useState } from 'react';
import AuthForm from '@/components/Auth/AuthForm';
import { motion } from 'framer-motion';

const AuthenticationCard = () => {
  const [currentLanguage, setCurrentLanguage] = useState('English');

  const handleLanguageToggle = () => {
    setCurrentLanguage((prev) => (prev === 'English' ? 'Français' : 'English'));
  };

  return (
    <div className="min-h-screen bg-auth-gradient flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="flex flex-col md:flex-row rounded-xl overflow-hidden bg-kindle-card auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          layout
          layoutId="auth-card"
        >
          {/* Left side - Auth form */}
          <motion.div
            className="w-full md:w-1/2 p-8 flex flex-col auth-card-left"
            layout
            layoutId="auth-card-left"
          >
            <div className="flex justify-between items-center mb-12 hidden">
              <motion.div
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.2,
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                }}
              >
                <div className="w-8 h-8 rounded-full bg-kindle-accent glow-effect flex items-center justify-center animate-pulse-glow">
                  <span className="text-white font-bold">K</span>
                </div>
                <span className="ml-2 text-white font-bold text-xl">
                  Perplexica
                </span>
              </motion.div>

              <motion.button
                onClick={handleLanguageToggle}
                className="text-sm px-4 py-1 rounded-full border border-gray-800 bg-black/30 text-white hover:bg-black/50 transition-colors"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.3,
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {currentLanguage}
              </motion.button>
            </div>

            <motion.div
              className="flex-grow flex items-center justify-center"
              layout
              layoutId="auth-form-container"
            >
              <AuthForm />
            </motion.div>
          </motion.div>

          {/* Right side - Stats and graphic */}
          <div className="w-full md:w-1/2 bg-black/40 p-8 hidden md:flex flex-col justify-center items-center">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5,
                type: 'spring',
                stiffness: 100,
                damping: 15,
              }}
            >
              <h2 className="text-4xl font-bold text-white">
                Behold <span className="text-gray-400">the power of</span> AI
              </h2>
              <h2 className="text-4xl font-bold text-white mt-2">
                Imagine <span className="text-gray-400">infinite</span>{' '}
                possibilities
              </h2>
            </motion.div>

            <motion.div
              className="w-64 h-64 relative"
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                delay: 0.7,
                type: 'spring',
                stiffness: 100,
                damping: 15,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-32 h-32 bg-black/60 border border-kindle-accent/30 rounded relative rotate-45 glow-effect"
                  animate={{
                    rotate: [45, 47, 45, 43, 45],
                    scale: [1, 1.02, 1, 0.98, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: 'easeInOut',
                  }}
                >
                  {/* Dots at corners */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-white/80"></div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white/80"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-white/80"></div>
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-white/80"></div>
                </motion.div>
              </div>

              {/* Orbital circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-48 h-48 border border-kindle-accent/30 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 20,
                    ease: 'linear',
                  }}
                >
                  <motion.div
                    className="w-3 h-3 bg-kindle-accent rounded-full absolute right-0 transform translate-x-1/2"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                    }}
                  ></motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthenticationCard;
