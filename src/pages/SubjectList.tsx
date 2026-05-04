import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, ArrowLeft, BookOpen, FlaskConical, 
  Globe, History, Languages, Calculator, ChevronRight,
  Sparkles, List
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../lib/dataService';
import { Subject, Chapter } from '../types';

export default function SubjectList() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (classId) {
        const data = await dataService.getSubjects(classId);
        setSubjects(data);
      }
      setLoading(false);
    };
    fetchSubjects();
  }, [classId]);

  const handleSelectSubject = async (subject: Subject) => {
    if (selectedSubjectId === subject.id) {
       setSelectedSubjectId(null);
       return;
    }
    setSelectedSubjectId(subject.id);
    const data = await dataService.getChapters(subject.id);
    setChapters(data);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FlaskConical': return FlaskConical;
      case 'Calculator': return Calculator;
      case 'Globe': return Globe;
      case 'History': return History;
      case 'Languages': return Languages;
      default: return BookOpen;
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 text-slate-800 font-sans pb-20">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 h-24">
        <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 transition-all border border-slate-100 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-2xl font-display font-black tracking-tight italic text-slate-900 leading-none mb-1">
                Class {classId?.replace('class', '')} <span className="text-emerald-600">Curriculum</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Select a discipline to begin</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <GraduationCap className="text-white w-6 h-6" />
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
             Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-[32px] border border-slate-100 animate-pulse" />
             ))
          ) : (
            subjects.map((subject, idx) => {
              const IconComp = getIcon(subject.icon);
              const isSelected = selectedSubjectId === subject.id;
              
              return (
                <div key={subject.id} className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`group bg-white border rounded-[40px] p-8 transition-all cursor-pointer relative overflow-hidden ${isSelected ? 'border-emerald-500 shadow-2xl shadow-emerald-100 ring-4 ring-emerald-50' : 'border-slate-100 hover:shadow-xl'}`}
                    onClick={() => handleSelectSubject(subject)}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-8">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-black/5 group-hover:scale-110 transition-transform duration-500 ${subject.color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                          <IconComp size={36} />
                        </div>
                        <div>
                          <h3 className="text-3xl font-display font-black italic tracking-tight mb-2 text-slate-900">{subject.name}</h3>
                          <div className="flex items-center gap-3">
                             <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <List size={12} /> Chapter-wise Grid
                             </div>
                             <div className="w-1 h-1 bg-slate-200 rounded-full" />
                             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Curriculum</span>
                          </div>
                        </div>
                      </div>
                      <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white rotate-90' : 'bg-slate-50 border-slate-50 text-slate-300 group-hover:border-emerald-500 group-hover:text-emerald-600'}`}>
                        <ChevronRight size={28} />
                      </div>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {isSelected && (
                       <motion.div
                         initial={{ opacity: 0, height: 0 }}
                         animate={{ opacity: 1, height: 'auto' }}
                         exit={{ opacity: 0, height: 0 }}
                         className="overflow-hidden space-y-3 pl-12 pr-4"
                       >
                          {chapters.length > 0 ? (
                            chapters.map((chap, cidx) => (
                               <motion.div
                                 key={chap.id}
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 transition={{ delay: cidx * 0.05 }}
                                 onClick={() => navigate(`/chapter/${chap.id}`)}
                                 className="bg-white/80 p-6 rounded-[32px] border border-white flex items-center justify-between group/chap cursor-pointer hover:bg-emerald-600 hover:text-white transition-all shadow-sm hover:shadow-xl hover:-translate-y-1"
                               >
                                  <div className="flex items-center gap-5">
                                     <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-xs text-slate-400 group-hover/chap:bg-emerald-700 group-hover/chap:text-white transition-colors">
                                        {cidx + 1 < 10 ? `0${cidx + 1}` : cidx + 1}
                                     </div>
                                     <span className="font-bold tracking-tight text-lg italic">{chap.title}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover/chap:opacity-100">Study Session</span>
                                     <ChevronRight size={18} className="group-hover/chap:translate-x-2 transition-transform" />
                                  </div>
                               </motion.div>
                            ))
                          ) : (
                            <div className="p-10 bg-white/40 border-2 border-dashed border-white rounded-[32px] text-center">
                               <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Deploying Chapters Soon...</p>
                            </div>
                          )}
                       </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Floating Status */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-8 py-4 rounded-[24px] shadow-2xl border border-white flex items-center gap-6 z-50">
         <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class {classId?.replace('class', '')} Synchronized</span>
         </div>
         <div className="h-6 w-px bg-slate-200"></div>
         <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">SEBA BOARD CALIBRATION</span>
         </div>
      </div>
    </div>
  );
}
