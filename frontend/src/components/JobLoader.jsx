import React from 'react'

const JobLoader = ({ text = 'Processing...' }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-12 shadow-2xl max-w-sm w-full mx-4">
        <div className="relative h-32 flex items-center justify-center mb-8">
          {/* Animated Books/Files Stack */}
          <div className="relative w-24 h-24">
            {/* First Book */}
            <div
              className="absolute w-20 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg shadow-lg transform"
              style={{
                left: '2px',
                top: '4px',
                animation: 'slideBook1 1.5s ease-in-out infinite',
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-2xl">📘</span>
              </div>
            </div>

            {/* Second Book */}
            <div
              className="absolute w-20 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg shadow-lg transform"
              style={{
                left: '12px',
                top: '8px',
                animation: 'slideBook2 1.5s ease-in-out infinite',
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-2xl">📗</span>
              </div>
            </div>

            {/* Third Book */}
            <div
              className="absolute w-20 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-lg transform"
              style={{
                left: '22px',
                top: '12px',
                animation: 'slideBook3 1.5s ease-in-out infinite',
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-2xl">📙</span>
              </div>
            </div>

            {/* Briefcase */}
            <div
              className="absolute w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded flex items-center justify-center shadow-lg"
              style={{
                right: '0',
                bottom: '4px',
                animation: 'rotateBriefcase 2s linear infinite',
              }}
            >
              <span className="text-white text-lg">💼</span>
            </div>
          </div>
        </div>

        {/* Text and Progress */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-2">{text}</h3>
          <p className="text-sm text-slate-600 mb-6">
            Finding the perfect match...
          </p>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-4">
            <div
              className="w-2 h-2 bg-sky-500 rounded-full"
              style={{ animation: 'bounce1 1.4s ease-in-out infinite' }}
            ></div>
            <div
              className="w-2 h-2 bg-emerald-500 rounded-full"
              style={{ animation: 'bounce2 1.4s ease-in-out infinite' }}
            ></div>
            <div
              className="w-2 h-2 bg-purple-500 rounded-full"
              style={{ animation: 'bounce3 1.4s ease-in-out infinite' }}
            ></div>
          </div>

          {/* Timer */}
          <p className="text-xs text-slate-500">Just a moment...</p>
        </div>

        {/* Animated lines (resume representation) */}
        <div className="mt-6 space-y-2">
          <div
            className="h-1 bg-gradient-to-r from-sky-300 to-transparent rounded"
            style={{ animation: 'shimmer 2s ease-in-out infinite' }}
          ></div>
          <div
            className="h-1 bg-gradient-to-r from-emerald-300 to-transparent rounded"
            style={{ animation: 'shimmer 2s ease-in-out 0.3s infinite' }}
          ></div>
          <div
            className="h-1 bg-gradient-to-r from-purple-300 to-transparent rounded"
            style={{ animation: 'shimmer 2s ease-in-out 0.6s infinite' }}
          ></div>
        </div>

        <style>{`
          @keyframes slideBook1 {
            0%, 100% { transform: translateY(0px) rotateZ(-5deg); }
            50% { transform: translateY(-12px) rotateZ(0deg); }
          }
          @keyframes slideBook2 {
            0%, 100% { transform: translateY(0px) rotateZ(0deg); }
            50% { transform: translateY(-16px) rotateZ(5deg); }
          }
          @keyframes slideBook3 {
            0%, 100% { transform: translateY(0px) rotateZ(5deg); }
            50% { transform: translateY(-12px) rotateZ(0deg); }
          }
          @keyframes rotateBriefcase {
            0%, 100% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(20deg) scale(1.1); }
          }
          @keyframes bounce1 {
            0%, 100% { transform: translateY(0px); opacity: 0.4; }
            50% { transform: translateY(-8px); opacity: 1; }
          }
          @keyframes bounce2 {
            0%, 100% { transform: translateY(0px); opacity: 0.4; }
            50% { transform: translateY(-8px); opacity: 1; }
          }
          @keyframes bounce3 {
            0%, 100% { transform: translateY(0px); opacity: 0.4; }
            50% { transform: translateY(-8px); opacity: 1; }
          }
          @keyframes shimmer {
            0%, 100% { backgroundPosition: 200% center; }
            50% { backgroundPosition: 0% center; }
          }
        `}</style>
      </div>
    </div>
  )
}

export default JobLoader
