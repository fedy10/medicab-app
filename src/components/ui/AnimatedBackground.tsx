import { motion } from 'motion/react';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Subtle gradient meshes - positioned at corners */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full blur-3xl opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(96, 165, 250, 0.4) 0%, rgba(96, 165, 250, 0) 70%)',
          top: '-400px',
          left: '-400px',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full blur-3xl opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.35) 0%, rgba(167, 139, 250, 0) 70%)',
          bottom: '-350px',
          right: '-350px',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.35, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Modern geometric shapes - top right area */}
      <div className="absolute top-20 right-20">
        <motion.div
          className="w-32 h-32 border-2 border-blue-300/20 rounded-2xl"
          animate={{
            rotate: [0, 90, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <div className="absolute top-40 right-60">
        <motion.div
          className="w-24 h-24 border-2 border-purple-300/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Bottom left geometric elements */}
      <div className="absolute bottom-32 left-32">
        <motion.div
          className="w-28 h-28 border-2 border-indigo-300/20"
          style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
          animate={{
            rotate: [0, 360],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Floating particles - distributed across the screen */}
      {[...Array(12)].map((_, i) => {
        const positions = [
          { top: '10%', left: '15%' },
          { top: '20%', right: '25%' },
          { top: '35%', left: '8%' },
          { top: '45%', right: '12%' },
          { top: '60%', left: '20%' },
          { top: '70%', right: '30%' },
          { top: '15%', left: '50%' },
          { top: '80%', left: '45%' },
          { top: '25%', right: '45%' },
          { top: '55%', left: '70%' },
          { top: '75%', right: '15%' },
          { top: '40%', left: '85%' },
        ];

        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
            style={positions[i]}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        );
      })}

      {/* Hexagon grid pattern - center right */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2">
        <motion.svg
          width="120"
          height="140"
          viewBox="0 0 120 140"
          fill="none"
          animate={{
            opacity: [0.1, 0.2, 0.1],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <path
            d="M60 10 L90 30 L90 70 L60 90 L30 70 L30 30 Z"
            stroke="url(#gradient1)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M60 30 L80 42 L80 66 L60 78 L40 66 L40 42 Z"
            stroke="url(#gradient2)"
            strokeWidth="2"
            fill="none"
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>

      {/* DNA helix pattern - left center */}
      <div className="absolute top-1/3 left-10">
        <motion.svg
          width="80"
          height="200"
          viewBox="0 0 80 200"
          fill="none"
          animate={{
            opacity: [0.15, 0.25, 0.15],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {[...Array(10)].map((_, i) => (
            <motion.circle
              key={i}
              cx={40 + Math.sin(i * 0.8) * 20}
              cy={20 + i * 18}
              r="3"
              fill={i % 2 === 0 ? '#60a5fa' : '#a78bfa'}
              opacity="0.3"
              animate={{
                cx: [
                  40 + Math.sin(i * 0.8) * 20,
                  40 + Math.sin(i * 0.8 + Math.PI) * 20,
                  40 + Math.sin(i * 0.8) * 20,
                ],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.svg>
      </div>

      {/* Wave pattern - bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg width="100%" height="100" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <motion.path
            d="M0,50 Q300,20 600,50 T1200,50 L1200,100 L0,100 Z"
            fill="url(#waveGradient)"
            opacity="0.1"
            animate={{
              d: [
                'M0,50 Q300,20 600,50 T1200,50 L1200,100 L0,100 Z',
                'M0,50 Q300,80 600,50 T1200,50 L1200,100 L0,100 Z',
                'M0,50 Q300,20 600,50 T1200,50 L1200,100 L0,100 Z',
              ],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Plus medical symbols - subtle and modern */}
      <div className="absolute top-1/4 right-1/4">
        <motion.svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <rect x="16" y="8" width="8" height="24" rx="2" fill="#60a5fa" opacity="0.3" />
          <rect x="8" y="16" width="24" height="8" rx="2" fill="#a78bfa" opacity="0.3" />
        </motion.svg>
      </div>

      <div className="absolute bottom-1/4 left-1/3">
        <motion.svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          animate={{
            rotate: [360, 180, 0],
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.22, 0.15],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <rect x="12" y="6" width="6" height="18" rx="1.5" fill="#818cf8" opacity="0.3" />
          <rect x="6" y="12" width="18" height="6" rx="1.5" fill="#c084fc" opacity="0.3" />
        </motion.svg>
      </div>

      {/* Grid dots pattern - top left corner */}
      <div className="absolute top-24 left-24">
        <svg width="100" height="100" viewBox="0 0 100 100">
          {[...Array(5)].map((_, i) =>
            [...Array(5)].map((_, j) => (
              <motion.circle
                key={`${i}-${j}`}
                cx={10 + j * 20}
                cy={10 + i * 20}
                r="2"
                fill="#a78bfa"
                opacity="0.2"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: (i + j) * 0.1,
                  ease: 'easeInOut',
                }}
              />
            ))
          )}
        </svg>
      </div>
    </div>
  );
}
