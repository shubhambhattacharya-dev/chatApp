import { useState, useEffect, useRef } from 'react';

const AuthImagePattern = ({ 
  title = "Welcome Back", 
  subtitle = "Sign in to your account to continue your journey",
  variant = "default", // "default", "minimal", "geometric", "floating", "morphing", "glass"
  theme = "primary", // "primary", "dark", "ocean", "sunset", "forest"
  interactive = true,
  enableSound = false,
  particlesCount = 25,
  animationSpeed = "normal" // "slow", "normal", "fast"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeShape, setActiveShape] = useState(null);
  const audioContextRef = useRef(null);

  // Animation speeds
  const animationSpeeds = {
    slow: "duration-1000",
    normal: "duration-500", 
    fast: "duration-300"
  };

  // Themes configuration
  const themes = {
    primary: {
      bg: "from-primary/5 via-base-200 to-primary/10",
      shapes: ["bg-primary/25", "bg-secondary/20", "bg-accent/25"],
      text: "from-primary to-secondary"
    },
    dark: {
      bg: "from-gray-900 via-base-300 to-gray-800", 
      shapes: ["bg-white/20", "bg-gray-400/20", "bg-gray-300/20"],
      text: "from-white to-gray-300"
    },
    ocean: {
      bg: "from-blue-500/5 via-cyan-500/5 to-teal-500/5",
      shapes: ["bg-blue-400/25", "bg-cyan-400/20", "bg-teal-400/25"],
      text: "from-blue-400 to-cyan-400"
    },
    sunset: {
      bg: "from-orange-500/5 via-red-500/5 to-purple-500/5",
      shapes: ["bg-orange-400/25", "bg-red-400/20", "bg-purple-400/25"],
      text: "from-orange-400 to-purple-400"
    },
    forest: {
      bg: "from-green-500/5 via-emerald-500/5 to-lime-500/5",
      shapes: ["bg-green-400/25", "bg-emerald-400/20", "bg-lime-400/25"],
      text: "from-green-400 to-lime-400"
    }
  };

  const currentTheme = themes[theme] || themes.primary;

  useEffect(() => {
    setIsVisible(true);
    
    // Initialize audio context if sound is enabled
    if (enableSound && typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [enableSound]);

  // Sound effect for interactions
  const playHoverSound = (frequency = 440) => {
    if (!enableSound || !audioContextRef.current) return;
    
    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.3);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.3);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  // Shape variants
  const getShapeVariant = (index) => {
    const baseClass = "transition-all backdrop-blur-md border border-white/20";
    
    const variants = {
      default: `${baseClass} ${
        [
          "rounded-2xl bg-primary/25 shadow-lg",
          "rounded-full bg-secondary/20 shadow-md", 
          "rounded-3xl bg-accent/25 shadow-lg",
          "rounded-2xl rotate-12 bg-primary/20 shadow-md",
          "rounded-full bg-secondary/15 shadow-lg",
          "rounded-2xl -rotate-12 bg-accent/20 shadow-md",
          "rounded-3xl bg-primary/15 shadow-lg",
          "rounded-2xl rotate-6 bg-secondary/10 shadow-md",
          "rounded-full bg-accent/15 shadow-lg"
        ][index % 9]
      }`,
      
      minimal: `${baseClass} rounded-lg ${
        ["bg-primary/20", "bg-secondary/15", "bg-accent/20"][index % 3]
      } opacity-70`,
      
      geometric: `${baseClass} ${
        [
          "rounded-none bg-gradient-to-br from-white/30 to-white/10 rotate-0",
          "rounded-full bg-gradient-to-br from-white/25 to-white/5",
          "rounded-none bg-gradient-to-tl from-white/30 to-white/10 rotate-45",
          "rounded-lg bg-gradient-to-br from-white/25 to-white/5 rotate-12",
          "rounded-full bg-gradient-to-tl from-white/30 to-white/10", 
          "rounded-none bg-gradient-to-br from-white/25 to-white/5 rotate-90",
          "rounded-sm bg-gradient-to-tl from-white/30 to-white/10 rotate-45",
          "rounded-full bg-gradient-to-br from-white/25 to-white/5",
          "rounded-none bg-gradient-to-tl from-white/30 to-white/10 rotate-12"
        ][index % 9]
      }`,
      
      floating: `${baseClass} rounded-2xl ${
        ["bg-primary/25", "bg-secondary/20", "bg-accent/25"][index % 3]
      } shadow-2xl backdrop-blur-lg`,
      
      morphing: `${baseClass} ${animationSpeeds[animationSpeed]} ${
        ["bg-primary/25", "bg-secondary/20", "bg-accent/25"][index % 3]
      } ${
        [
          "rounded-2xl hover:rounded-full",
          "rounded-full hover:rounded-none",
          "rounded-3xl hover:rounded-lg", 
          "rounded-2xl hover:rounded-3xl",
          "rounded-full hover:rounded-2xl",
          "rounded-lg hover:rounded-full",
          "rounded-3xl hover:rounded-none",
          "rounded-2xl hover:rounded-lg",
          "rounded-full hover:rounded-3xl"
        ][index % 9]
      }`,
      
      glass: `${baseClass} rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl ${
        ["bg-gradient-to-br from-primary/30 to-white/5", "bg-gradient-to-br from-secondary/25 to-white/5", "bg-gradient-to-br from-accent/30 to-white/5"][index % 3]
      }`
    };

    return variants[variant] || variants.default;
  };

  // Handle shape interactions
  const handleShapeInteraction = (index, type = 'hover') => {
    if (!interactive) return;

    if (type === 'click') {
      setActiveShape(activeShape === index ? null : index);
      playHoverSound(300 + (index * 50));
    } else {
      setHoveredIndex(index);
      playHoverSound(500 + (index * 30));
    }
  };

  return (
    <div className={`flex items-center justify-center bg-gradient-to-br ${currentTheme.bg} p-12 relative overflow-hidden min-h-screen`}>
      
      {/* Advanced Background Elements */}
      <div className="absolute inset-0">
        {/* Animated Orbs */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-r from-primary to-secondary rounded-full animate-orbital-1"></div>
          <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-gradient-to-r from-accent to-primary rounded-full animate-orbital-2"></div>
          <div className="absolute top-1/2 right-1/3 w-28 h-28 bg-gradient-to-r from-secondary to-accent rounded-full animate-orbital-3"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-[length:50px_50px] bg-grid-white"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(particlesCount)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 20}s`,
                opacity: 0.1 + Math.random() * 0.3
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className={`max-w-md text-center relative z-10 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
      }`}>
        
        {/* Interactive Pattern Grid */}
        <div className="grid grid-cols-3 gap-4 mb-12 transform transition-transform duration-500 hover:scale-105">
          {[...Array(9)].map((_, i) => (
            <button
              key={i}
              onMouseEnter={() => handleShapeInteraction(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleShapeInteraction(i, 'click')}
              className={`
                aspect-square transition-all ${animationSpeeds[animationSpeed]} cursor-pointer
                ${getShapeVariant(i)}
                ${interactive ? 'hover:shadow-2xl hover:scale-125 hover:z-20' : ''}
                ${hoveredIndex === i ? 'scale-125 z-20 shadow-2xl' : ''}
                ${activeShape === i ? 'ring-4 ring-white/50 scale-150 z-30' : ''}
                group relative overflow-hidden
              `}
              style={{
                animationDelay: `${i * 0.1}s`,
                transitionDelay: `${i * 0.03}s`,
                filter: hoveredIndex !== null && hoveredIndex !== i ? 'blur(1px) grayscale(30%)' : 'none',
              }}
            >
              {/* Inner Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Ripple Effect */}
              {activeShape === i && (
                <div className="absolute inset-0 rounded-inherit animate-ripple bg-white/30"></div>
              )}
            </button>
          ))}
        </div>

        {/* Text Content */}
        <div className="space-y-6 mb-8">
          <div className="relative inline-block">
            <h2 className={`text-5xl font-bold text-white mb-3 relative`}>
              <span className="relative z-10">{title}</span>
              <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-lg opacity-0 animate-pulse-slow"></div>
            </h2>
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-current to-transparent"></div>
          </div>
          
          <p className="text-base-content/80 text-lg leading-relaxed px-6 font-light">
            {subtitle}
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${interactive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-base-content/60">{interactive ? 'Interactive' : 'Static'}</span>
          </div>
          <div className="w-px h-4 bg-base-content/20"></div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[0, 1, 2].map(i => (
                <div 
                  key={i}
                  className="w-1 h-1 rounded-full bg-current opacity-40 animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
            <span className="text-sm text-base-content/60">Ready</span>
          </div>
        </div>

        {/* Theme Indicator */}
        <div className="flex justify-center space-x-3 mb-6">
          {Object.keys(themes).map((themeKey) => (
            <div
              key={themeKey}
              className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                theme === themeKey ? 'scale-125 ring-2 ring-white' : 'opacity-40 hover:opacity-70'
              }`}
              style={{
                background: `linear-gradient(45deg, ${themes[themeKey].shapes[0]}, ${themes[themeKey].shapes[1]})`
              }}
              title={`${themeKey} theme`}
            />
          ))}
        </div>

        {/* Interactive Hint */}
        {interactive && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-60 animate-bounce-slow">
            <div className="flex items-center space-x-2 text-sm text-base-content/50">
              <span>Try interacting with shapes</span>
              <div className="w-4 h-4 border-2 border-base-content/30 rounded-full animate-spin-slow"></div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx="true">{`
        @keyframes orbital-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(20px, -15px) rotate(90deg) scale(1.1); }
          50% { transform: translate(0, -30px) rotate(180deg) scale(1.2); }
          75% { transform: translate(-20px, -15px) rotate(270deg) scale(1.1); }
        }
        @keyframes orbital-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          33% { transform: translate(-25px, 10px) rotate(120deg) scale(1.15); }
          66% { transform: translate(15px, 20px) rotate(240deg) scale(1.05); }
        }
        @keyframes orbital-3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(10px, -20px) rotate(180deg) scale(1.1); }
        }
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-orbital-1 { animation: orbital-1 20s ease-in-out infinite; }
        .animate-orbital-2 { animation: orbital-2 25s ease-in-out infinite; }
        .animate-orbital-3 { animation: orbital-3 30s ease-in-out infinite; }
        .animate-ripple { animation: ripple 1s ease-out; }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .bg-grid-white { 
          background-image: linear-gradient(to right, white 1px, transparent 1px), 
                           linear-gradient(to bottom, white 1px, transparent 1px); 
        }
      `}</style>
    </div>
  );
};

export default AuthImagePattern;