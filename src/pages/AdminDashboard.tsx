import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Settings, Users, BookOpen, 
  Trash2, Edit, Save, PlusCircle,
  LayoutDashboard, LogOut, CheckCircle, Database,
  ChevronRight, ChevronDown, FileText, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../lib/dataService';
import { Class, Subject, Chapter, SiteSettings } from '../types';

import { APP_NAME } from '../constants';

export default function AdminDashboard() {
  const { user, signOut, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'content' | 'users' | 'settings'>('content');
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ upiId: 'p9365437723@okaxis', subscriptionPrice: 100 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
    fetchSettings();
  }, []);

  const fetchClasses = async () => {
    const data = await dataService.getClasses();
    setClasses(data);
    setLoading(false);
  };

  const fetchSettings = async () => {
    const data = await dataService.getSettings();
    setSiteSettings(data);
  };

  const handleAddClass = async () => {
    const name = prompt("Class Name (e.g. 9 or 10):");
    if (!name) return;
    await dataService.addClass(`Class ${name}`);
    fetchClasses();
  };

  const handleSelectClass = async (id: string) => {
    if (selectedClassId === id) {
      setSelectedClassId(null);
      setSubjects([]);
      return;
    }
    setSelectedClassId(id);
    const subs = await dataService.getSubjects(id);
    setSubjects(subs);
  };

  const handleAddSubject = async (classId: string) => {
    const name = prompt("Subject Name (e.g. Science, Maths):");
    if (!name) return;
    await dataService.addSubject(classId, { 
      classId, 
      name, 
      icon: 'BookOpen', 
      color: 'emerald' 
    });
    const subs = await dataService.getSubjects(classId);
    setSubjects(subs);
  };

  const handleSelectSubject = async (id: string) => {
    if (selectedSubjectId === id) {
      setSelectedSubjectId(null);
      setChapters([]);
      return;
    }
    setSelectedSubjectId(id);
    const chaps = await dataService.getChapters(id);
    setChapters(chaps);
  };

  const handleAddChapter = async (subjectId: string) => {
    const title = prompt("Chapter Title:");
    if (!title) return;
    const newChapter: Chapter = {
      id: Date.now().toString(),
      subjectId,
      title,
      content: {
        notes: "Chapter notes here...",
        questions: [],
        quiz: [],
        dates: [],
        summary: "",
        keywords: []
      }
    };
    await dataService.saveChapter(newChapter);
    const chaps = await dataService.getChapters(subjectId);
    setChapters(chaps);
  };

  const handleUpdateSettings = async () => {
    await dataService.updateSettings(siteSettings);
    alert("Settings saved!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 text-emerald-900">
        <Sparkles className="animate-spin mr-2" /> Loading Admin Hub...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans flex">
      {/* Sidebar - Professional Polish Style */}
      <aside className="w-80 bg-gradient-to-b from-[#051c14] to-[#0a3022] text-white hidden lg:flex flex-col p-8 sticky top-0 h-screen shadow-2xl">
        <div className="flex items-center space-x-4 mb-14 px-2">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 rotate-3">
            <LayoutDashboard className="text-white w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black tracking-tight italic"> Hub Admin </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">{APP_NAME}</p>
          </div>
        </div>

        <nav className="flex-grow space-y-3">
          {[
            { id: 'content', icon: BookOpen, label: 'Content System' },
            { id: 'users', icon: Users, label: 'User Director' },
            { id: 'settings', icon: Settings, label: 'Global Setup' },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all group ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 translate-x-2' : 'text-emerald-100/40 hover:text-white hover:bg-white/5'}`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'text-white' : 'group-hover:scale-110 transition-transform'} /> 
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <div className="flex items-center gap-4 mb-8 p-4 bg-white/5 rounded-[24px] border border-white/5">
            <div className="w-12 h-12 bg-emerald-400/20 rounded-full flex items-center justify-center border border-emerald-400/20">
               <span className="font-black text-emerald-400 text-lg italic">PS</span>
            </div>
            <div className="overflow-hidden">
               <p className="text-sm font-black truncate">Pankaj Sir</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">System Master</p>
            </div>
          </div>
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-3 p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest"
          >
            <LogOut size={16} /> Sign Out Hub
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-grow p-10 lg:p-16 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'content' && (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                   <h1 className="text-5xl font-display font-black tracking-tight text-slate-900 italic mb-2">Content Orchestration</h1>
                   <p className="text-slate-400 font-bold tracking-wide uppercase text-[10px]">Structure your educational empire</p>
                </div>
                <button 
                  onClick={handleAddClass}
                  className="flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-200 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
                >
                  <Plus size={20} /> Deploy New Class
                </button>
              </div>

              {isDemoMode && (
                <div className="mb-10 p-6 bg-emerald-950 text-emerald-100 rounded-[32px] flex items-center gap-5 border-l-8 border-emerald-500 shadow-2xl">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center shrink-0">
                    <Database className="text-emerald-400" size={24} />
                  </div>
                  <div>
                    <p className="font-black italic text-lg">Simulation Mode Active</p>
                    <p className="text-sm text-emerald-400/80 font-medium tracking-tight">Changes will persist in local browser storage only. Production database is disconnected.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-8">
                {classes.map(cls => (
                  <div key={cls.id} className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-10 pb-8 border-b border-slate-50">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center font-black text-3xl text-emerald-600 italic">
                            {cls.name.split(' ')[1] || cls.name}
                         </div>
                         <div>
                            <h3 className="text-3xl font-display font-black italic tracking-tight">{cls.name}</h3>
                            <p className="text-xs font-bold text-slate-400">Main Educational Stream</p>
                         </div>
                      </div>
                      <div className="flex gap-3">
                        <button className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all flex items-center justify-center">
                           <Edit size={20} />
                        </button>
                        <button className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center">
                           <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4 px-2">
                         <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Subject Catalog</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedClassId === cls.id ? (
                          subjects.map(sub => (
                            <div key={sub.id} className="group">
                              <div 
                                onClick={() => handleSelectSubject(sub.id)}
                                className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${selectedSubjectId === sub.id ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
                              >
                                <div className="flex items-center gap-4">
                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${sub.color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                                      <BookOpen size={20} />
                                   </div>
                                   <span className="font-bold text-slate-700">{sub.name}</span>
                                </div>
                                {selectedSubjectId === sub.id ? <ChevronDown size={20} className="text-emerald-500" /> : <ChevronRight size={20} className="text-slate-300" />}
                              </div>
                              
                              <AnimatePresence>
                                {selectedSubjectId === sub.id && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-2 ml-10 space-y-2"
                                  >
                                    {chapters.map(chap => (
                                      <div key={chap.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group/chap">
                                         <div className="flex items-center gap-3">
                                            <FileText size={16} className="text-slate-300" />
                                            <span className="text-sm font-semibold text-slate-600">{chap.title}</span>
                                         </div>
                                         <div className="flex gap-2 opacity-0 group-hover/chap:opacity-100 transition-opacity">
                                            <button className="p-2 text-slate-400 hover:text-emerald-600"><Edit size={14} /></button>
                                            <button className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={14} /></button>
                                         </div>
                                      </div>
                                    ))}
                                    <button 
                                      onClick={() => handleAddChapter(sub.id)}
                                      className="w-full p-3 border-2 border-dashed border-slate-100 rounded-2xl text-xs font-black uppercase text-slate-300 hover:text-emerald-500 hover:border-emerald-200 transition-all flex items-center justify-center gap-2"
                                    >
                                       <Plus size={14} /> New Chapter
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))
                        ) : null}

                        {selectedClassId !== cls.id && (
                          <button 
                            onClick={() => handleSelectClass(cls.id)}
                            className="w-full col-span-2 p-10 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[32px] text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-600 transition-all"
                          >
                             Explore Contents of {cls.name}
                          </button>
                        )}
                        
                        {selectedClassId === cls.id && (
                          <button 
                            onClick={() => handleAddSubject(cls.id)}
                            className="p-6 border-2 border-dashed border-slate-100 rounded-3xl text-slate-300 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                          >
                             <PlusCircle size={20} /> Add Subject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl"
            >
              <h1 className="text-5xl font-display font-black tracking-tight text-slate-900 italic mb-12">Platform Control</h1>
              <div className="bg-white border border-slate-100 rounded-[48px] p-12 shadow-sm space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Access Fee (INR)</label>
                    <div className="relative">
                       <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                       <input 
                         type="number" 
                         value={siteSettings.subscriptionPrice}
                         onChange={(e) => setSiteSettings({...siteSettings, subscriptionPrice: Number(e.target.value)})}
                         className="w-full bg-slate-50 border border-slate-100 pl-12 p-6 rounded-[24px] font-black text-3xl text-emerald-600 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                       />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Revenue Endpoint (UPI)</label>
                    <input 
                      type="text" 
                      value={siteSettings.upiId}
                      onChange={(e) => setSiteSettings({...siteSettings, upiId: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 p-6 rounded-[24px] font-bold text-xl text-slate-700 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                      placeholder="vpa@upi"
                    />
                  </div>
                </div>
                
                <div className="p-8 bg-emerald-50 rounded-[32px] border border-emerald-100 flex items-start gap-6">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/10">
                      <CheckCircle className="text-emerald-500" size={28} />
                   </div>
                   <div>
                      <h4 className="font-black text-emerald-900 text-lg italic mb-1">Global Consistency</h4>
                      <p className="text-emerald-700/70 text-sm font-medium leading-relaxed">Adjusting these values will instantly reflect across all student dashboards and payment portals.</p>
                   </div>
                </div>

                <button 
                  onClick={handleUpdateSettings}
                  className="w-full bg-[#051c14] text-white p-7 rounded-[24px] font-black italic text-xl shadow-2xl shadow-emerald-950/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
                >
                  <Save size={24} className="group-hover:rotate-12 transition-transform" /> Sync Application State
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div 
               key="users"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white border border-slate-100 rounded-[48px] overflow-hidden shadow-sm"
            >
               <div className="p-12 border-b border-slate-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-display font-black italic tracking-tight">Student Directory</h2>
                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] mt-2">Managing the future of Assam</p>
                  </div>
                  <div className="flex gap-3">
                     <div className="px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Active Students</span>
                        <span className="text-2xl font-black italic text-slate-800">1,204</span>
                     </div>
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-[#051c14] text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">
                      <tr>
                        <th className="px-12 py-6">Identity</th>
                        <th className="px-12 py-6">Engagement</th>
                        <th className="px-12 py-6">Status</th>
                        <th className="px-12 py-6 text-right">Access Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[ 
                        { name: 'Amit Kumar', email: 'amit@example.com', plan: 'Premium', join: '12 May, 2024' },
                        { name: 'Sumi Das', email: 'sumi@edu.com', plan: 'Free', join: '20 May, 2024' },
                        { name: 'Rahul Bora', email: 'rahul@assam.in', plan: 'Premium', join: '22 May, 2024' }
                      ].map((u, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-12 py-8">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-black italic border border-emerald-100">
                                   {u.name[0]}
                                </div>
                                <div>
                                   <p className="font-black italic text-lg leading-tight">{u.name}</p>
                                   <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-12 py-8">
                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Signed up</p>
                             <p className="font-bold text-slate-700">{u.join}</p>
                          </td>
                          <td className="px-12 py-8">
                            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${u.plan === 'Premium' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                               {u.plan} Hub
                            </span>
                          </td>
                          <td className="px-12 py-8 text-right">
                            <button className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline px-6 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
                               Modify Access
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

