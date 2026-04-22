export default function LiquidWrapper({ children }) {
    return (
        <div
            className="min-h-screen text-slate-800 font-sans relative overflow-hidden flex flex-col transition-colors duration-1000"
            // light-blue-to-white radial fade
            style={{ background: 'radial-gradient(circle at center, #d8f0ff 0%, #ffffff 85%)' }}
        >
            <style>{`
          @keyframes liquidFloat {
            0%, 100% { transform: translate(0px, 0px) rotate(-5deg) scale(1); }
            25% { transform: translate(40px, -20px) rotate(2deg) scale(1.05); }
            50% { transform: translate(10px, -50px) rotate(-4deg) scale(0.95); }
            75% { transform: translate(-30px, -15px) rotate(3deg) scale(1.02); }
          }
      `}</style>

            <div className="relative z-10 flex-1 flex flex-col h-full">
                {children}
            </div>
        </div>
    );
}