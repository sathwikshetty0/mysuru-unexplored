import React, { useEffect, useState } from 'react';

const Loader = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 4500); // 4.5 seconds to appreciate the premium animation

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f8f9fa] flex-col overflow-hidden transition-opacity duration-1000">
      <div className="relative flex flex-col items-center">

        {/* Logo Text */}
        <div className="flex items-baseline space-x-3 z-10 scale-110 sm:scale-125">
          <h1 className="text-5xl font-serif text-black tracking-tight opacity-0 animate-fade-in-up"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Mysuru
          </h1>
          <h1 className="text-5xl font-bold text-[#D4AF37] tracking-tight opacity-0 animate-fade-in-up-delay">
            marga
          </h1>
        </div>


        {/* Progress bar or subtle indicator */}
        <div className="mt-20 w-40 h-[1.5px] bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#D4AF37] animate-loading-progress shadow-[0_0_10px_#D4AF37]"></div>
        </div>

        <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-gray-400 opacity-0 animate-fade-in-slow">
          Exploring Hidden Treasures
        </p>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(15px);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 0.6; }
        }
        @keyframes loading-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s forwards;
        }
        .animate-fade-in-up-delay {
          animation: fade-in-up 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.8s forwards;
        }
        .animate-fade-in-slow {
          animation: fade-in 2s ease-out 1.5s forwards;
        }
        .animate-loading-progress {
          animation: loading-progress 4.5s cubic-bezier(0.1, 0, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Loader;
