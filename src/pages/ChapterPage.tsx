import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, FileText, HelpCircle, Layout, List, Calendar, Info, 
  CheckCircle2, Lock, Sparkles, Bookmark, Share2, ClipboardList,
  ChevronRight, BrainCircuit
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../lib/dataService';
import { Chapter, SubscriptionStatus } from '../types';

import { APP_NAME } from '../constants';

const TABS = [
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'questions', label: 'Q&A', icon: HelpCircle },
  { id: 'quiz', label: 'Quiz', icon: Sparkles },
  { id: 'dates', label: 'Dates', icon: Calendar },
  { id: 'summary', label: 'Summary', icon: Layout },
  { id: 'keywords', label: 'Keywords', icon: List },
];

export default function ChapterPage() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notes');
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapter = async () => {
      if (chapterId) {
        const data = await dataService.getChapter(chapterId);
        setChapter(data);
      }
      setLoading(false);
    };
    fetchChapter();
  }, [chapterId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 text-emerald-900">
        <BrainCircuit className="animate-pulse mr-3" size={32} />
        <span className="font-black italic text-xl">Loading Session...</span>
      </div>
    );
  }

  if (!chapter) {
    return <div className="p-20 text-center font-bold text-slate-400">Chapter not found in the grid.</div>;
  }

  const isPremiumLocked = user?.subscriptionStatus === SubscriptionStatus.FREE && chapterId?.includes('premium'); 

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans pb-32">
      {/* Top Professional Header */}
      <header className="h-24 border-b border-slate-100 px-8 flex items-center justify-between bg-white/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-slate-100 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-2xl font-display font-black tracking-tight text-slate-900 italic leading-none mb-1">{chapter.title}</h2>
            <nav className="flex gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 items-center">
              <span>NCERT Grid</span> 
              <div className="w-1 h-1 bg-slate-200 rounded-full" />
              <span className="text-emerald-600">Chapter Analysis</span>
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex bg-emerald-950 text-emerald-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] items-center gap-3 border border-emerald-900 shadow-xl shadow-emerald-900/10">
            <Sparkles size={14} />
            Focus Mode Active
          </div>
          <button className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-emerald-600 transition-colors border border-slate-100">
            <Bookmark size={22} />
          </button>
          <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-emerald-500 to-teal-400 border-2 border-white shadow-lg overflow-hidden shrink-0">
             <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-emerald-600 text-sm italic">
                {user?.name.substring(0, 2).toUpperCase()}
             </div>
          </div>
        </div>
      </header>

      {/* Tab Interaction Grid */}
      <div className="px-8 mt-10 mb-8 max-w-[1600px] mx-auto">
        <div className="bg-slate-50 p-2 rounded-[32px] inline-flex flex-wrap gap-1 border border-slate-100 shadow-inner">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-3.5 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 ${
                activeTab === tab.id 
                ? 'bg-white text-emerald-700 shadow-xl shadow-slate-200 ring-1 ring-slate-200' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="max-w-[1600px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3">
           {isPremiumLocked ? (
              <div className="min-h-[600px] w-full bg-slate-900 rounded-[56px] flex flex-col items-center justify-center p-16 text-center shadow-3xl shadow-emerald-950/20">
                 <div className="w-32 h-32 bg-emerald-500/10 rounded-full shadow-inner flex items-center justify-center mb-10 border border-emerald-500/10">
                    <Lock size={48} className="text-emerald-400" />
                 </div>
                 <h2 className="text-5xl font-display font-black mb-6 italic tracking-tight text-white">Grid Access Restricted</h2>
                 <p className="text-emerald-100/40 max-w-sm mb-12 text-lg font-medium leading-relaxed italic">The following knowledge set is part of the Premium Hub expansion.</p>
                 <button className="bg-emerald-500 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all hover:bg-emerald-400">
                    Unlock Premium Grid — ₹100
                 </button>
              </div>
           ) : (
             <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                 className="space-y-12"
               >
                 {activeTab === 'notes' && (
                    <div className="bg-white rounded-[56px] border border-slate-100 p-16 shadow-sm relative overflow-hidden">
                       <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-10">
                             <div className="w-1 h-8 bg-emerald-500 rounded-full" />
                             <h3 className="text-4xl font-display font-black text-slate-900 italic tracking-tight">Core Curriculum Analysis</h3>
                          </div>
                          <div className="prose prose-emerald max-w-none text-slate-600 leading-relaxed font-medium text-xl italic">
                             <p className="whitespace-pre-wrap mb-12 bg-emerald-50/30 p-10 rounded-[40px] border border-emerald-50 leading-loose">
                               {chapter.content.notes}
                             </p>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
                                <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl">
                                   <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-4">Pro Insight</span>
                                   <p className="text-xl font-bold italic leading-snug">
                                      Focus on structural diagrams for this section to maximize board scores.
                                   </p>
                                </div>
                                <div className="bg-emerald-600 p-10 rounded-[40px] text-white shadow-2xl">
                                   <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-4">Exam Alert</span>
                                   <p className="text-xl font-bold italic leading-snug">
                                      High probability of being asked in the 3-mark section this year.
                                   </p>
                                </div>
                             </div>
                          </div>
                       </div>
                       
                       {/* Decorative grid pattern */}
                       <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none">
                          <Layout className="w-full h-full" />
                       </div>
                    </div>
                 )}

                 {activeTab === 'questions' && (
                    <div className="space-y-8">
                       {chapter.content.questions.map((q, i) => (
                         <div key={i} className="bg-white border border-slate-100 p-10 rounded-[48px] shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1 group">
                            <div className="flex flex-col md:flex-row gap-10">
                               <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-700">
                                  <span className="text-2xl font-black italic">0{i+1}</span>
                               </div>
                               <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-6">
                                     <span className="px-5 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100 tracking-[0.2em]">{q.m || 1} Mark Calibration</span>
                                  </div>
                                  <p className="text-3xl font-display font-black text-slate-900 mb-10 leading-tight italic tracking-tight">{q.q}</p>
                                  <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100/50 relative overflow-hidden">
                                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 block">Standardized Solution</span>
                                     <p className="text-slate-600 font-bold italic text-lg leading-relaxed relative z-10">{q.a}</p>
                                     <CheckCircle2 className="absolute -bottom-6 -right-6 text-emerald-500 opacity-5" size={120} />
                                  </div>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 )}

                 {activeTab === 'quiz' && (
                    <div className="bg-[#051c14] p-20 rounded-[64px] text-white shadow-3xl relative overflow-hidden border border-emerald-900">
                       <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-12">
                             <Sparkles className="text-emerald-400" />
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Interactive Knowledge Deck</span>
                          </div>
                          
                          {chapter.content.quiz && chapter.content.quiz.map((q, i) => (
                             <div key={i} className="max-w-3xl">
                                <h3 className="text-5xl font-display font-black mb-14 italic leading-[1.1] tracking-tight">{q.question}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                   {q.options.map((opt, idx) => (
                                     <button
                                       key={idx}
                                       onClick={() => {
                                          setSelectedQuizAnswer(idx);
                                          setShowQuizResult(true);
                                       }}
                                       className={`p-8 rounded-[32px] border-2 text-left font-black transition-all active:scale-95 group ${
                                          showQuizResult 
                                            ? idx === q.answer 
                                              ? 'bg-emerald-600 border-emerald-400 shadow-2xl shadow-emerald-500/20' 
                                              : selectedQuizAnswer === idx 
                                                ? 'bg-rose-500 border-rose-400 opacity-80' 
                                                : 'bg-white/5 border-white/10 opacity-20 scale-95'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                       }`}
                                     >
                                        <div className="flex items-center justify-between uppercase text-xs tracking-widest h-full">
                                           <span>{opt}</span>
                                           {showQuizResult && idx === q.answer && <CheckCircle2 size={32} className="shrink-0" />}
                                        </div>
                                     </button>
                                   ))}
                                </div>
                             </div>
                          ))}
                       </div>
                       
                       {/* Background design */}
                       <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-emerald-500 rounded-full blur-3xl" />
                       </div>
                    </div>
                 )}
               </motion.div>
             </AnimatePresence>
           )}
        </div>

        {/* Right Sidebar - Strategic Assets */}
        <aside className="space-y-10">
           <div className="bg-white border border-slate-100 rounded-[48px] p-12 shadow-sm flex flex-col gap-10">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                 <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Quick References</h4>
              </div>
              <div className="space-y-8">
                 {chapter.content.keywords && chapter.content.keywords.length > 0 ? chapter.content.keywords.map((kw, i) => (
                    <div key={i} className="flex items-start gap-6 group cursor-default">
                       <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all text-xl italic shadow-inner">
                          {kw.word.substring(0, 1)}
                       </div>
                       <div>
                          <p className="font-black text-slate-900 mb-1 italic">{kw.word}</p>
                          <p className="text-xs text-slate-400 font-bold leading-relaxed">{kw.definition}</p>
                       </div>
                    </div>
                 )) : (
                    <p className="text-[10px] font-black uppercase text-slate-300 italic">No indexed keywords</p>
                 )}
              </div>
              <button className="w-full py-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all flex items-center justify-center gap-3">
                 <Bookmark size={14} /> Add Personal Clip
              </button>
           </div>
           
           <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden group cursor-pointer active:scale-95 transition-all">
              <div className="relative z-10">
                 <Sparkles className="mb-6 text-emerald-300" size={32} />
                 <h4 className="text-2xl font-display font-black italic mb-2 tracking-tight">Board Exam Prep</h4>
                 <p className="text-emerald-100/60 text-xs font-bold leading-relaxed mb-10">Launch the strategic analysis for this chapter now.</p>
                 <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-200 group-hover:gap-5 transition-all">
                    System Hub <ChevronRight size={14} />
                 </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
           </div>
        </aside>
      </main>

      {/* Floating Tactical Bar */}
      <div className="fixed bottom-8 left-8 right-8 flex justify-center z-[100] pointer-events-none">
         <div className="bg-[#051c14] text-white px-10 py-5 rounded-[28px] shadow-3xl border border-emerald-900 flex items-center gap-10 pointer-events-auto shadow-[0_30px_60px_rgba(5,28,20,0.4)]">
            <div className="flex gap-4 items-center">
               <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse" />
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Grid Connection Stable</span>
            </div>
            <div className="h-4 w-px bg-emerald-900" />
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] font-display italic">{APP_NAME}</span>
            </div>
            <div className="h-4 w-px bg-emerald-900" />
            <div className="flex gap-5">
               <button className="text-emerald-400 hover:text-white transition-colors"><Share2 size={18} /></button>
               <button className="text-emerald-400 hover:text-white transition-colors"><ClipboardList size={18} /></button>
            </div>
         </div>
      </div>
    </div>
  );
}
