import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, BookOpen, ShieldCheck, User, Sparkles, ChevronRight, CheckCircle2, Database, Zap, BrainCircuit, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserProfile, UserRole, SubscriptionStatus } from '../types';

import { APP_NAME, PLATFORM_TAGLINE, COPYRIGHT } from '../constants';

export default function LandingPage() {
  const { signIn, signUp, signInWithGoogle, user, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const [showAuth, setShowAuth] = React.useState(false);
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loadingGoogle, setLoadingGoogle] = React.useState(false);
  const [showAdminLogin, setShowAdminLogin] = React.useState(false);
  const [adminId, setAdminId] = React.useState('');
  const [adminPass, setAdminPass] = React.useState('');
  const [error, setError] = React.useState('');
  const [authError, setAuthError] = React.useState('');
  const [verificationRequired, setVerificationRequired] = React.useState(false);
  const [pendingEmail, setPendingEmail] = React.useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isRegistering) {
        await signUp(email, password);
        setPendingEmail(email);
        setVerificationRequired(true);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      if (err.message === 'VERIFICATION_REQUIRED') {
        setPendingEmail(email);
        setVerificationRequired(true);
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError('Email or password is incorrect');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('User already exists. Please sign in');
      } else {
        setAuthError(err.message || 'Authentication failed');
      }
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError('');
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || 'Google authentication failed');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId === 'p936543773' && adminPass === '9365437723') {
      const adminUser: UserProfile = {
        uid: 'admin_fixed',
        name: 'Pankaj Sir',
        email: 'p9365437723@gmail.com',
        role: UserRole.ADMIN,
        subscriptionStatus: SubscriptionStatus.PREMIUM,
        createdAt: new Date(),
      };
      localStorage.setItem('demo_user', JSON.stringify(adminUser));
      window.location.reload(); 
    } else {
      setError('Invalid Credentials');
    }
  };

  React.useEffect(() => {
    if (user) {
      if (user.role === UserRole.ADMIN) navigate('/admin');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden relative font-sans selection:bg-emerald-500 selection:text-white">
      {/* High-End Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-900/10 blur-[160px] rounded-full animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-900/10 blur-[140px] rounded-full" />
         <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>

      <nav className="relative z-50 flex justify-between items-center px-10 py-10 max-w-7xl mx-auto backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-900/50 rotate-3 group cursor-pointer hover:rotate-0 transition-transform">
             <GraduationCap className="text-white w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-display font-black tracking-tighter italic text-white leading-none">{APP_NAME}</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">{PLATFORM_TAGLINE}</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-10">
           {['Syllabus', 'Pricing', 'Results'].map(item => (
             <a key={item} href="#" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-emerald-400 transition-colors">{item}</a>
           ))}
           <button 
             onClick={() => setShowAuth(true)}
             className="px-8 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl active:scale-95"
           >
              Enter Grid
           </button>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center pt-32 pb-40 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] border border-emerald-500/10 mb-12 shadow-inner">
            <Zap size={14} className="fill-emerald-400" /> Authorized SEBA Center 2024
          </div>
          
          <h1 className="text-6xl md:text-9xl font-display font-black mb-10 tracking-tight leading-[0.85] max-w-6xl balance group">
             STUDY <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-emerald-200 to-teal-400 italic">SMARTER</span> <br /> 
             NOT HARDER.
          </h1>
          
          <p className="text-slate-400 text-lg md:text-2xl max-w-3xl mb-20 leading-relaxed font-medium italic">
            Board-exam specialized learning grid for Class 9 & 10. <br />
            <span className="text-emerald-500/80">Digital notes + Strategy guides = Academic dominance.</span>
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => setShowAuth(true)}
              className="group relative px-12 py-6 bg-emerald-600 rounded-[28px] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-900/40"
            >
               <div className="relative z-10 flex items-center gap-4 text-white font-black uppercase tracking-widest text-sm">
                  Launch Learning Grid <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
               </div>
               <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
              onClick={() => setShowAdminLogin(true)}
              className="px-12 py-6 bg-white/5 border border-white/5 hover:bg-white/10 rounded-[28px] text-slate-400 font-black uppercase tracking-widest text-sm transition-all flex items-center gap-3"
            >
               <ShieldCheck size={20} /> Staff Portal
            </button>
          </div>
        </motion.div>

        {/* Feature Grid Mini */}
        <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
           {[ 
             { title: 'SEBA MAP', desc: 'Syllabus perfectly synchronized with board updates.', icon: Zap },
             { title: 'ELITE NOTES', desc: 'Summaries designed for 95%+ visual learners.', icon: Sparkles },
             { title: 'SMART QUIZ', desc: 'AI-assisted adaptive board preparation.', icon: BrainCircuit }
           ].map((f, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 + (i*0.2) }}
               className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] text-left hover:bg-white/[0.04] transition-all group"
             >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                   <f.icon size={24} />
                </div>
                <h4 className="text-xl font-display font-black italic tracking-tight mb-3 uppercase tracking-widest text-emerald-100">{f.title}</h4>
                <p className="text-slate-500 text-sm font-bold leading-relaxed">{f.desc}</p>
             </motion.div>
           ))}
        </div>

<AnimatePresence>
          {(showAuth || verificationRequired) && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[#051c14] border border-emerald-900/50 p-16 rounded-[64px] w-full max-w-xl shadow-[0_64px_128px_-16px_rgba(0,0,0,1)] relative"
              >
                <button 
                  onClick={() => {
                    setShowAuth(false);
                    setVerificationRequired(false);
                  }}
                  className="absolute top-12 right-12 text-emerald-500/50 hover:text-white transition-colors p-2"
                >
                  <ArrowLeft size={32} />
                </button>
                
                {verificationRequired ? (
                  <div className="text-center py-10">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                       <CheckCircle2 size={48} className="text-emerald-500" />
                    </div>
                    <h2 className="text-4xl font-display font-black mb-6 text-emerald-100 italic tracking-tighter leading-tight">Verification Pending</h2>
                    <p className="text-emerald-500/60 font-black uppercase text-[10px] tracking-[0.4em] mb-10">Security Checkpoint</p>
                    
                    <p className="text-lg text-emerald-100/80 mb-12 italic font-medium leading-relaxed">
                      We have sent you a verification email to <span className="text-emerald-400 font-black">{pendingEmail}</span>. Please verify it and log in.
                    </p>
                    
                    <button 
                      onClick={() => {
                        setVerificationRequired(false);
                        setShowAuth(true);
                        setIsRegistering(false);
                      }}
                      className="w-full py-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black italic text-xl transition-all shadow-3xl shadow-emerald-950 active:scale-[0.97] group"
                    >
                      Return to Login <ChevronRight className="inline-block ml-3 group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-14 text-left">
                       <h2 className="text-5xl font-display font-black mb-4 text-emerald-100 italic tracking-tighter">
                         {isRegistering ? 'Join the Grid' : 'Hub Entrance'}
                       </h2>
                       <p className="text-emerald-500/60 font-black uppercase text-[10px] tracking-[0.4em]">
                         {isRegistering ? 'Create your Excellence Account' : 'Authorized Personnel Only'}
                       </p>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-8">
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.3em] ml-2">Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-black/40 border border-emerald-900/50 p-7 rounded-3xl focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none text-emerald-100 font-bold text-xl placeholder:text-emerald-900"
                          placeholder="student@seba.hub"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.3em] ml-2">Access Key</label>
                        <input 
                          type="password" 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-black/40 border border-emerald-900/50 p-7 rounded-3xl focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none text-emerald-100 font-bold text-xl placeholder:text-emerald-900"
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <AnimatePresence>
                        {authError && (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-rose-500/10 text-rose-400 p-4 rounded-2xl border border-rose-500/20 text-xs font-black uppercase tracking-widest text-center"
                          >
                             {authError}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-6">
                        <button className="w-full py-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black italic text-xl transition-all shadow-3xl shadow-emerald-950 active:scale-[0.97] group">
                          {isRegistering ? 'Initialize Account' : 'Decrypt Knowledge'} <ChevronRight className="inline-block ml-3 group-hover:translate-x-2 transition-transform" />
                        </button>
                        
                        <div className="relative flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-emerald-900/30"></div></div>
                          <span className="relative bg-[#051c14] px-4 text-[10px] font-black text-emerald-500/40 uppercase tracking-[.3em]">Neural Bridge</span>
                        </div>

                        <button 
                          type="button"
                          onClick={handleGoogleAuth}
                          disabled={loadingGoogle}
                          className="w-full py-6 bg-white text-black rounded-3xl font-black text-lg transition-all shadow-3xl hover:bg-slate-100 flex items-center justify-center gap-4 active:scale-[0.97] disabled:opacity-50"
                        >
                          {loadingGoogle ? (
                            <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <svg width="24" height="24" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                              Continue with Google
                            </>
                          )}
                        </button>
                        
                        <button 
                          type="button"
                          onClick={() => setIsRegistering(!isRegistering)}
                          className="w-full text-emerald-500/60 hover:text-emerald-400 transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                          {isRegistering ? 'Already in the grid? Sign In' : 'New here? Join the Excellence Archive'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAdminLogin && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[#051c14] border border-emerald-900/50 p-16 rounded-[64px] w-full max-w-xl shadow-[0_64px_128px_-16px_rgba(0,0,0,1)] relative"
              >
                <button 
                  onClick={() => setShowAdminLogin(false)}
                  className="absolute top-12 right-12 text-emerald-500/50 hover:text-white transition-colors p-2"
                >
                  <ArrowLeft size={32} />
                </button>
                
                <div className="mb-14 text-left">
                   <h2 className="text-5xl font-display font-black mb-4 text-emerald-100 italic tracking-tighter">System Entry</h2>
                   <p className="text-emerald-500/60 font-black uppercase text-[10px] tracking-[0.4em]">Administrative Clearance Required</p>
                </div>

                <form onSubmit={handleAdminAuth} className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.3em] ml-2">Operator ID</label>
                    <input 
                      type="text" 
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      className="w-full bg-black/40 border border-emerald-900/50 p-7 rounded-3xl focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none text-emerald-100 font-bold text-xl placeholder:text-emerald-900"
                      placeholder="HUB-ID-XXXX"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.3em] ml-2">Clearance Key</label>
                    <input 
                      type="password" 
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      className="w-full bg-black/40 border border-emerald-900/50 p-7 rounded-3xl focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none text-emerald-100 font-bold text-xl placeholder:text-emerald-900"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-rose-500/10 text-rose-400 p-4 rounded-2xl border border-rose-500/20 text-xs font-black uppercase tracking-widest text-center"
                      >
                         {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button className="w-full py-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black italic text-xl transition-all shadow-3xl shadow-emerald-950 mt-6 active:scale-[0.97] group">
                    Begin Authorization <ChevronRight className="inline-block ml-3 group-hover:translate-x-2 transition-transform" />
                  </button>
                </form>
                
                <div className="mt-12 pt-12 border-t border-emerald-900/30 flex justify-between items-center opacity-40">
                   <div className="flex gap-4">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Secured Node 01</span>
                   </div>
                   <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">{APP_NAME} Protocol v4.0</span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {isDemoMode && (
          <div className="mt-20 flex items-center gap-3 px-6 py-2.5 bg-emerald-950/20 border border-emerald-900/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 backdrop-blur-sm">
            <Database size={14} /> Instance: Local Simulation Active
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 border-t border-white/5 bg-black/20 py-20 px-10">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex flex-col items-center md:items-start gap-4">
               <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center">
                     <GraduationCap className="text-white w-4 h-4" />
                  </div>
                  <h4 className="text-xl font-display font-black tracking-tight italic">{APP_NAME}</h4>
               </div>
               <p className="text-slate-500 text-xs font-bold font-sans">{COPYRIGHT}</p>
            </div>
            <div className="flex gap-12">
               <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Systems</span>
                  <a href="#" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Admin Dashboard</a>
                  <a href="#" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Student Grid</a>
               </div>
               <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Legal</span>
                  <a href="#" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Privacy Node</a>
                  <a href="#" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Usage Terms</a>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
