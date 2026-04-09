import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LiquidWrapper from '../components/LiquidWrapper';

export default function BillingLogin() {
    const [patientLoginMode, setPatientLoginMode] = useState(false);
    const [loginInput, setLoginInput] = useState('');
    const navigate = useNavigate();

    const handleAdminLogin = () => navigate('/admin-billing');
    const handlePatientLogin = (e) => {
        e.preventDefault();
        navigate('/patient-billing', { state: { patientId: loginInput.toUpperCase() } });
    };

    return (
        <LiquidWrapper>
            <div className="flex-1 flex items-center justify-center p-4">
                {/* Frosted White Glass Panel */}
                <div className="bg-white/60 backdrop-blur-2xl p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white max-w-md w-full text-center">
                    <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
                        <span className="text-[#2fb8ff]">☤</span> Medicare
                    </h1>
                    <p className="text-slate-500 font-medium mb-10 uppercase tracking-widest text-xs">System Access Portal</p>

                    {!patientLoginMode ? (
                        <div className="space-y-4 animate-fade-in">
                            <button onClick={handleAdminLogin} className="w-full bg-[#2fb8ff] hover:bg-[#0ea5e9] text-white py-4 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(47,184,255,0.39)]">
                                Login as Administrator
                            </button>
                            <button onClick={() => setPatientLoginMode(true)} className="w-full bg-white/80 border border-slate-200 hover:border-[#2fb8ff] hover:bg-sky-50 text-slate-700 py-4 rounded-xl font-bold transition-all shadow-sm">
                                Patient Portal Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handlePatientLogin} className="space-y-5 animate-fade-in">
                            <p className="text-sm text-[#2fb8ff] font-bold uppercase tracking-wider mb-2">Enter your Patient ID</p>
                            <input
                                type="text" placeholder="e.g. PAT001" required
                                value={loginInput} onChange={(e) => setLoginInput(e.target.value)}
                                className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-4 text-slate-800 focus:border-[#2fb8ff] focus:ring-4 focus:ring-[#2fb8ff]/10 outline-none text-center text-xl tracking-widest uppercase font-mono shadow-sm transition-all"
                            />
                            <button type="submit" className="w-full bg-[#2fb8ff] hover:bg-[#0ea5e9] text-white py-4 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(47,184,255,0.39)]">
                                Access My Records
                            </button>
                            <button type="button" onClick={() => setPatientLoginMode(false)} className="text-slate-400 hover:text-slate-700 font-medium text-sm mt-4 transition-colors">
                                ← Back to Options
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </LiquidWrapper>
    );
}