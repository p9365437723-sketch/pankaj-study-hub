import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Settings, Users, BookOpen, 
  Trash2, Edit, Save, PlusCircle,
  LayoutDashboard, LogOut, CheckCircle, Database, ShieldCheck,
  ChevronRight, ChevronDown, FileText, Sparkles, Image as ImageIcon,
  Search, Filter, UserX, UserCheck, CreditCard, Activity,
  ArrowUpRight, ArrowDownRight, IndianRupee, Clock, X, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../lib/dataService';
import { Class, Subject, Chapter, SiteSettings, UserProfile, UserRole } from '../types';
import { db } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  doc, 
  deleteDoc, 
  where,
  addDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';

import { APP_NAME } from '../constants';

export default function AdminDashboard() {
  const { user, signOut, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'users' | 'settings'>('dashboard');
  
  // Content State
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  
  // User Management State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'premium' | 'free' | 'blocked'>('all');
  
  // Site Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<'class' | 'subject' | 'chapter' | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  // Real-time Listeners
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    // Settings
    const settingsUnsub = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) setSiteSettings(snap.data() as SiteSettings);
    });

    // Users
    const usersUnsub = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => d.data() as UserProfile));
    });

    // Classes
    const classesUnsub = onSnapshot(collection(db, 'classes'), (snap) => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Class)));
      setLoading(false);
    });

    return () => {
      settingsUnsub();
      usersUnsub();
      classesUnsub();
    };
  }, []);

  // Subject Fetcher
  useEffect(() => {
    if (!selectedClassId || !db) {
      setSubjects([]);
      return;
    }
    const q = query(collection(db, 'subjects'), where('classId', '==', selectedClassId));
    const unsub = onSnapshot(q, (snap) => {
      setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Subject)));
    });
    return unsub;
  }, [selectedClassId]);

  // Chapter Fetcher
  useEffect(() => {
    if (!selectedSubjectId || !db) {
      setChapters([]);
      return;
    }
    const q = query(collection(db, 'chapters'), where('subjectId', '==', selectedSubjectId), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setChapters(snap.docs.map(d => ({ id: d.id, ...d.data() } as Chapter)));
    });
    return unsub;
  }, [selectedSubjectId]);

  // CMS Actions
  const handleCMSAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    const isEdit = !!formData.id;
    console.log(`Command detected: CMS ${isEdit ? 'UPDATE' : 'DEPLOY'} ${modalType}`, isEdit ? formData.id : 'NEW');
    setModalLoading(true);
    try {
      if (modalType === 'class') {
        if (isEdit) {
          await updateDoc(doc(db, 'classes', formData.id), { name: formData.name });
        } else {
          await addDoc(collection(db, 'classes'), { name: formData.name, createdAt: serverTimestamp() });
        }
      } else if (modalType === 'subject' && selectedClassId) {
        if (isEdit) {
          await updateDoc(doc(db, 'subjects', formData.id), { name: formData.name });
        } else {
          await addDoc(collection(db, 'subjects'), { 
            name: formData.name, 
            classId: selectedClassId, 
            icon: 'BookOpen', 
            color: 'emerald',
            createdAt: serverTimestamp() 
          });
        }
      } else if (modalType === 'chapter' && selectedSubjectId) {
        if (isEdit) {
          await updateDoc(doc(db, 'chapters', formData.id), {
            title: formData.title,
            isFree: formData.isFree || false
          });
        } else {
          await addDoc(collection(db, 'chapters'), {
            title: formData.title,
            subjectId: selectedSubjectId,
            classId: selectedClassId,
            createdAt: serverTimestamp(),
            isFree: formData.isFree || false,
            content: {
              notes: formData.notes || "",
              questions: [],
              quiz: [],
              summary: "",
              keywords: [],
            }
          });
        }
      }
      console.log(`CMS action success: ${modalType}`);
      setModalType(null);
      setFormData({});
    } catch (err: any) {
      console.error(`CMS action failed:`, err);
      alert(`SYSTEM ERROR: Deployment failed. ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const deleteEntity = async (coll: string, id: string) => {
    console.log(`Command detected: DELETE ${coll}/${id}`);
    if (!db || !window.confirm('PROTOCOL WARNING: Are you sure you wish to dissolve this data node? This is irreversible.')) return;
    try {
      setModalLoading(true);
      await deleteDoc(doc(db, coll, id));
      console.log(`Dissolve successful: ${coll}/${id}`);
    } catch (err: any) {
      console.error(`Dissolve failed:`, err);
      alert(`SYSTEM ERROR: Dissolve failed. ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    console.log(`Command detected: DELETE USER ${userId}`);
    if (!db || !window.confirm('PROTOCOL WARNING: Delete this user identity from the network? This is irreversible.')) return;
    try {
      setModalLoading(true);
      await deleteDoc(doc(db, 'users', userId));
      console.log(`Identity dissolution successful: ${userId}`);
    } catch (err: any) {
      console.error(`Identity dissolution failed:`, err);
      alert(`SYSTEM ERROR: Dissolution failed. ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const saveChapterContent = async () => {
    console.log("Command detected: SYNC CHAPTER CONTENT", editingChapter?.id);
    if (!db || !editingChapter) return;
    setModalLoading(true);
    try {
      await updateDoc(doc(db, 'chapters', editingChapter.id), {
        content: editingChapter.content,
        title: editingChapter.title,
        updatedAt: serverTimestamp()
      });
      console.log("Hub sync successful:", editingChapter.id);
      alert('Chapter synchronized with hub successfully!');
      setEditingChapter(null);
    } catch (err: any) {
      console.error("Hub sync failed:", err);
      alert(`SYNC ERROR: Hub re-calibration failed. ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  // User Control Actions
  const toggleBlockUser = async (userId: string, currentStatus: boolean) => {
    console.log(`Command detected: TOGGLE BLOCK ${userId} (Current: ${currentStatus})`);
    if (!db) return;
    try {
      await updateDoc(doc(db, 'users', userId), { isBlocked: !currentStatus });
      console.log(`Network status re-calibrated for node: ${userId}`);
    } catch (err: any) {
      console.error(`Re-calibration failed:`, err);
      alert(`SYSTEM ERROR: Failed to re-calibrate node status. ${err.message}`);
    }
  };

  const updateGlobalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Command detected: SYNC GLOBAL SETTINGS");
    if (!db) return;
    try {
      await updateDoc(doc(db, 'settings', 'global'), siteSettings);
      console.log("Global sync successful");
      alert('Settings updated successfully!');
    } catch (err: any) {
      console.error("Global sync failed:", err);
      alert(`SYSTEM ERROR: Settings sync failed. ${err.message}`);
    }
  };

  const handleEditEntity = (type: 'class' | 'subject' | 'chapter', data: any) => {
    console.log(`Command detected: PREPARE EDIT ${type}`, data.id);
    setFormData({
      id: data.id,
      name: data.name,
      title: data.title,
      notes: data.content?.notes || "",
      isFree: data.isFree || false
    });
    setModalType(type);
  };

  // Analytics Helpers
  const blockedUsersCount = users.filter(u => u.isBlocked).length;

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' ? true :
      filterStatus === 'blocked' ? u.isBlocked : true;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
           <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
           <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Command Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex">
      {/* Sidebar */}
      <aside className="w-80 bg-[#020617] text-white hidden lg:flex flex-col p-8 sticky top-0 h-screen shadow-2xl border-r border-white/5">
        <div className="flex items-center space-x-4 mb-14 px-2">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 rotate-3 transition-transform hover:rotate-0">
            <LayoutDashboard className="text-white w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black tracking-tight italic"> Hub Command </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">{APP_NAME}</p>
          </div>
        </div>

        <nav className="flex-grow space-y-2">
          {[
            { id: 'dashboard', icon: Activity, label: 'Control Center' },
            { id: 'users', icon: Users, label: 'User Network' },
            { id: 'content', icon: Database, label: 'Content Lab' },
            { id: 'settings', icon: Settings, label: 'Systems Config' },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl font-bold transition-all group ${activeTab === item.id ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-emerald-400' : 'group-hover:scale-110 transition-transform'} /> 
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-3 p-5 bg-rose-500/10 text-rose-500 rounded-3xl hover:bg-rose-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest"
          >
            <LogOut size={16} /> Termination
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-grow p-10 lg:p-16 h-screen overflow-y-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
               key="dashboard"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
            >
               <header className="mb-14">
                  <h1 className="text-5xl font-display font-black italic tracking-tight mb-2">Systems Status</h1>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Real-time operational overview</p>
               </header>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {[
                    { label: 'Network Users', val: users.length, detail: '+12 today', icon: Users, color: 'blue' },
                    { label: 'Blocked Nodes', val: blockedUsersCount, detail: 'Restricted', icon: UserX, color: 'rose' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-xl transition-all h-60 flex flex-col justify-between group">
                       <div className={`w-14 h-14 bg-${stat.color}-50 text-${stat.color}-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <stat.icon size={28} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                          <p className="text-4xl font-display font-black italic tracking-tighter">{stat.val}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white rounded-[48px] border border-slate-100 p-10 shadow-sm">
                     <h3 className="text-2xl font-display font-black italic tracking-tight mb-8">Recent Traffic</h3>
                     <div className="space-y-6">
                        {users.slice(0, 5).map((u, i) => (
                          <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black italic text-slate-400 shadow-inner">
                                   {u.name[0]}
                                </div>
                                <div>
                                   <p className="font-black italic leading-tight">{u.name}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.email}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-emerald-600 block">Student</p>
                                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Active Now</p>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="bg-[#051c14] rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl">
                     <h3 className="text-2xl font-display font-black italic tracking-tight mb-6">Security Bridge</h3>
                     <p className="text-emerald-100/40 text-sm font-medium mb-8 leading-relaxed">Ensure all student profiles are linked to verified educational identities to maintain platform integrity.</p>
                     <div className="space-y-4">
                        <div className="p-6 bg-emerald-900/30 rounded-3xl border border-emerald-800/20 flex items-center gap-4">
                           <ShieldCheck className="text-emerald-400" />
                           <span className="text-xs font-black uppercase tracking-widest">Encryption: Active</span>
                        </div>
                        <div className="p-6 bg-emerald-900/30 rounded-3xl border border-emerald-800/20 flex items-center gap-4">
                           <Clock className="text-emerald-400" />
                           <span className="text-xs font-black uppercase tracking-widest">Sync: Real-time</span>
                        </div>
                     </div>
                     <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div 
               key="users"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="h-full flex flex-col"
            >
               <header className="mb-14 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div>
                    <h1 className="text-5xl font-display font-black italic tracking-tight mb-2">Network Nodes</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Managing the educational grid</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                           type="text"
                           placeholder="Search identity..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="bg-white border border-slate-100 pl-16 pr-8 py-5 rounded-3xl font-bold w-80 shadow-sm focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
                        />
                     </div>
                     <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="bg-white border border-slate-100 px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-sm appearance-none cursor-pointer outline-none"
                     >
                        <option value="all">Everywhere</option>
                        <option value="blocked">Restricted</option>
                     </select>
                  </div>
               </header>

               <div className="bg-white border border-slate-100 rounded-[64px] shadow-sm flex-grow overflow-hidden flex flex-col">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
                          <tr>
                             <th className="px-12 py-8">User Identity</th>
                             <th className="px-12 py-8">Infrastructure</th>
                             <th className="px-12 py-8">Deployment</th>
                             <th className="px-12 py-8 text-right">System Override</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50 italic">
                          {filteredUsers.map((u, i) => (
                             <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-12 py-10">
                                   <div className="flex items-center gap-6">
                                      <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner border border-slate-100">
                                         {u.photoURL ? <img src={u.photoURL} alt={u.name} className="w-full h-full object-cover rounded-2xl" /> : u.name[0]}
                                      </div>
                                      <div>
                                         <p className="text-xl font-black italic tracking-tight group-hover:text-emerald-600 transition-colors">{u.name}</p>
                                         <p className="text-xs font-bold text-slate-400 tracking-wide uppercase">{u.email}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-12 py-10">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Provider Path</p>
                                   <p className="font-bold text-slate-700 capitalize">{u.provider || 'direct'}</p>
                                </td>
                                <td className="px-12 py-10">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Last Sync</p>
                                   <p className="font-bold text-slate-700">
                                      {u.lastLogin ? new Date(u.lastLogin.seconds * 1000).toLocaleDateString() : 'Unknown'}
                                   </p>
                                </td>
                                <td className="px-12 py-10 text-right">
                                   <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                         onClick={() => toggleBlockUser(u.uid, !!u.isBlocked)}
                                         className={`p-4 rounded-2xl transition-all shadow-sm ${u.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white'}`}
                                         title={u.isBlocked ? 'Unblock Node' : 'Block Node'}
                                      >
                                         {u.isBlocked ? <UserCheck size={18} /> : <UserX size={18} />}
                                      </button>
                                      <button 
                                         onClick={() => deleteUser(u.uid)}
                                         className="p-4 bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm"
                                         title="Dissolve Node"
                                      >
                                         <Trash2 size={18} />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div 
               key="content"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
            >
               {editingChapter ? (
                  <div className="space-y-12 pb-20">
                     <header className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <button 
                             onClick={() => setEditingChapter(null)}
                             className="w-14 h-14 bg-white border border-slate-100 rounded-3xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                           >
                              <ArrowLeft size={24} />
                           </button>
                           <div>
                              <h1 className="text-4xl font-display font-black italic tracking-tight">{editingChapter.title}</h1>
                              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Resource Extraction Node</p>
                           </div>
                        </div>
                        <button 
                          onClick={saveChapterContent}
                          disabled={modalLoading}
                          className="bg-slate-950 text-white px-10 py-5 rounded-[32px] font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-black transition-all flex items-center gap-4 active:scale-95 disabled:opacity-50"
                        >
                           {modalLoading ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
                           Finalize Sync
                        </button>
                     </header>

                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left Wing: Notes & Summary */}
                        <div className="lg:col-span-8 space-y-12">
                           <section className="bg-white rounded-[64px] border border-slate-100 p-12 shadow-sm">
                              <h3 className="text-2xl font-display font-black italic mb-8">Base Knowledge (Notes)</h3>
                              <textarea 
                                value={editingChapter.content.notes}
                                onChange={(e) => setEditingChapter({
                                  ...editingChapter,
                                  content: { ...editingChapter.content, notes: e.target.value }
                                })}
                                className="w-full bg-slate-50 border border-slate-100 p-8 rounded-[40px] font-medium text-lg min-h-[400px] outline-none focus:ring-8 focus:ring-emerald-500/5 transition-all resize-none"
                                placeholder="Input chapter architecture here..."
                              />
                           </section>
                           
                           <section className="bg-white rounded-[64px] border border-slate-100 p-12 shadow-sm">
                              <h3 className="text-2xl font-display font-black italic mb-8">Strategic Summary</h3>
                              <textarea 
                                value={editingChapter.content.summary}
                                onChange={(e) => setEditingChapter({
                                  ...editingChapter,
                                  content: { ...editingChapter.content, summary: e.target.value }
                                })}
                                className="w-full bg-slate-50 border border-slate-100 p-8 rounded-[40px] font-medium text-lg min-h-[200px] outline-none focus:ring-8 focus:ring-emerald-500/5 transition-all resize-none"
                                placeholder="Condensed knowledge node..."
                              />
                           </section>
                        </div>

                        {/* Right Wing: Questions & Quiz */}
                        <div className="lg:col-span-4 space-y-12">
                           <section className="bg-emerald-950 rounded-[56px] p-10 text-white shadow-2xl">
                              <div className="flex items-center justify-between mb-8">
                                 <h3 className="text-2xl font-display font-black italic">Challenge Grid</h3>
                                 <button 
                                   onClick={() => {
                                     const newQ = { q: '', a: '', m: 1 };
                                     setEditingChapter({
                                       ...editingChapter,
                                       content: { ...editingChapter.content, questions: [...editingChapter.content.questions, newQ] }
                                     });
                                   }}
                                   className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center hover:scale-110 shadow-lg shadow-emerald-500/20 transition-all"
                                 >
                                    <Plus size={20} />
                                 </button>
                              </div>
                              
                              <div className="space-y-6">
                                 {editingChapter.content.questions.map((q, idx) => (
                                   <div key={idx} className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                                      <div className="flex items-center justify-between">
                                         <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em]">Query node {idx + 1}</span>
                                         <select 
                                           value={q.m}
                                           onChange={(e) => {
                                             const newQs = [...editingChapter.content.questions];
                                             newQs[idx].m = Number(e.target.value);
                                             setEditingChapter({ ...editingChapter, content: { ...editingChapter.content, questions: newQs }});
                                           }}
                                           className="bg-black text-white text-[10px] font-bold p-2 rounded-xl outline-none"
                                         >
                                            <option value={1}>1 Mark</option>
                                            <option value={2}>2 Marks</option>
                                            <option value={3}>3 Marks</option>
                                            <option value={5}>5 Marks</option>
                                         </select>
                                      </div>
                                      <input 
                                         value={q.q}
                                         onChange={(e) => {
                                           const newQs = [...editingChapter.content.questions];
                                           newQs[idx].q = e.target.value;
                                           setEditingChapter({ ...editingChapter, content: { ...editingChapter.content, questions: newQs }});
                                         }}
                                         placeholder="Question text..."
                                         className="w-full bg-black/30 border border-white/5 rounded-2xl p-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                                      />
                                      <textarea 
                                         value={q.a}
                                         onChange={(e) => {
                                           const newQs = [...editingChapter.content.questions];
                                           newQs[idx].a = e.target.value;
                                           setEditingChapter({ ...editingChapter, content: { ...editingChapter.content, questions: newQs }});
                                         }}
                                         placeholder="Solution path..."
                                         className="w-full bg-black/30 border border-white/5 rounded-2xl p-4 text-xs font-medium focus:border-emerald-500 outline-none transition-all h-24 resize-none"
                                      />
                                      <button 
                                        onClick={() => {
                                          const newQs = editingChapter.content.questions.filter((_, i) => i !== idx);
                                          setEditingChapter({ ...editingChapter, content: { ...editingChapter.content, questions: newQs }});
                                        }}
                                        className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-400 transition-colors"
                                      >
                                         Dissolve Node
                                      </button>
                                   </div>
                                 ))}
                              </div>
                           </section>

                           <section className="bg-[#020617] rounded-[56px] p-10 text-white shadow-2xl border border-white/5">
                              <div className="flex items-center justify-between mb-8">
                                 <h3 className="text-2xl font-display font-black italic">Speed Trials (Quiz)</h3>
                                 <button 
                                   onClick={() => {
                                     const newQ = { question: '', options: ['', '', '', ''], answer: 0 };
                                     setEditingChapter({
                                       ...editingChapter,
                                       content: { ...editingChapter.content, quiz: [...editingChapter.content.quiz, newQ] }
                                     });
                                   }}
                                   className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center hover:scale-110 shadow-lg shadow-indigo-500/20 transition-all"
                                 >
                                    <Plus size={20} />
                                 </button>
                              </div>

                              <div className="space-y-8">
                                 {editingChapter.content.quiz.map((q, qIdx) => (
                                   <div key={qIdx} className="p-8 bg-white/5 rounded-3xl space-y-6 border border-white/5">
                                      <input 
                                         value={q.question}
                                         onChange={(e) => {
                                           const newQuiz = [...editingChapter.content.quiz];
                                           newQuiz[qIdx].question = e.target.value;
                                           setEditingChapter({ ...editingChapter, content: { ...editingChapter.content, quiz: newQuiz }});
                                         }}
                                         placeholder="Quiz stimulus..."
                                         className="w-full bg-black/30 border border-white/5 rounded-2xl p-5 text-sm font-black italic outline-none focus:border-indigo-400 transition-all"
                                      />
                                      <div className="grid grid-cols-2 gap-4">
                                         {q.options.map((opt, oIdx) => (
                                           <div key={oIdx} className="relative">
                                              <input 
                                                 value={opt}
                                                 onChange={(e) => {
                                                   const newQuiz = [...editingChapter.content.quiz];
                                                   newQuiz[qIdx].options[oIdx] = e.target.value;
                                                   setEditingChapter({ ...editingChapter, content: { ...editingChapter.content, quiz: newQuiz }});
                                                 }}
                                                 placeholder={`Option ${oIdx + 1}`}
                                                 className={`w-full bg-black/40 border p-4 rounded-xl text-[10px] font-bold outline-none transition-all ${q.answer === oIdx ? 'border-emerald-500 text-emerald-400' : 'border-white/5 text-slate-400'}`}
                                              />
                                              <button 
                                                type="button"
                                                onClick={() => {
                                                  const newQuiz = [...editingChapter.content.quiz];
                                                  newQuiz[qIdx].answer = oIdx;
                                                  setEditingChapter({ ...editingChapter, content: { ...editingChapter.content, quiz: newQuiz }});
                                                }}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all ${q.answer === oIdx ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}
                                              />
                                           </div>
                                         ))}
                                      </div>
                                      <button 
                                        onClick={() => {
                                          const newQuiz = editingChapter.content.quiz.filter((_, i) => i !== qIdx);
                                          setEditingChapter({ ...editingChapter, content: { ...editingChapter.content, quiz: newQuiz }});
                                        }}
                                        className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-400 transition-colors"
                                      >
                                         Erase Trial
                                      </button>
                                   </div>
                                 ))}
                              </div>
                           </section>
                           
                           <div className="p-8 bg-blue-50 rounded-[48px] border border-blue-100">
                             <div className="flex items-center gap-4 mb-4">
                                <Activity className="text-blue-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-900">Architecture Insights</span>
                             </div>
                             <p className="text-[10px] font-bold text-blue-700/70 leading-relaxed uppercase tracking-wide">Structured questions should follow Bloom's Taxonomy. Quizzes are strictly for rapid identity recall.</p>
                           </div>
                        </div>
                     </div>
                  </div>
               ) : (
                  <>
               <header className="mb-14 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div>
                    <h1 className="text-5xl font-display font-black italic tracking-tight mb-2">Content Orchestration</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Building the educational infrastructure</p>
                  </div>
                  <button 
                    onClick={() => setModalType('class')}
                    className="bg-emerald-600 text-white px-10 py-5 rounded-[32px] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-emerald-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                  >
                    <Plus size={20} /> Deploy New Class
                  </button>
               </header>

               <div className="grid grid-cols-1 gap-12">
                  {classes.map(cls => (
                    <div key={cls.id} className="bg-white rounded-[64px] border border-slate-100 p-12 shadow-sm hover:shadow-2xl transition-all">
                       <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-50">
                          <div className="flex items-center gap-8">
                             <div className="w-20 h-20 bg-emerald-50 rounded-[40px] flex items-center justify-center font-black text-4xl text-emerald-600 italic shadow-inner border border-emerald-100">
                                {cls.name.split(' ')[1] || 'NC'}
                             </div>
                             <div>
                                <h3 className="text-4xl font-display font-black italic tracking-tight">{cls.name}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronized Syllabus</p>
                             </div>
                          </div>
                          <div className="flex gap-4">
                             <button 
                               onClick={() => handleEditEntity('class', cls)}
                               className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-3xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                             >
                                <Edit size={24} />
                             </button>
                             <button 
                               onClick={() => deleteEntity('classes', cls.id)}
                               className="w-14 h-14 bg-rose-50 text-rose-500 rounded-3xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                             >
                                <Trash2 size={24} />
                             </button>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {subjects.filter(s => s.classId === cls.id).map(sub => (
                            <div key={sub.id} className="p-8 bg-slate-50 rounded-[48px] border border-transparent hover:border-emerald-200 transition-all">
                               <div className="flex items-center justify-between mb-8">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-600">
                                        <BookOpen size={24} />
                                     </div>
                                     <span className="font-black italic text-xl">{sub.name}</span>
                                  </div>
                                   <div className="flex items-center gap-3">
                                      <button 
                                        onClick={() => handleEditEntity('subject', sub)}
                                        className="text-slate-300 hover:text-emerald-500 transition-colors"
                                      >
                                         <Edit size={18} />
                                      </button>
                                      <button 
                                        onClick={() => deleteEntity('subjects', sub.id)}
                                        className="text-slate-300 hover:text-rose-500 transition-colors"
                                      >
                                         <Trash2 size={18} />
                                      </button>
                                   </div>
                               </div>

                               <div className="space-y-3 mb-8">
                                  {chapters.filter(c => c.subjectId === sub.id).map(chap => (
                                    <div key={chap.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 group">
                                       <span className="text-sm font-bold text-slate-600">{chap.title}</span>
                                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button 
                                            onClick={() => setEditingChapter(chap)}
                                            className="text-slate-300 hover:text-emerald-500"
                                          >
                                            <Edit size={14} />
                                          </button>
                                          <button 
                                            onClick={() => deleteEntity('chapters', chap.id)}
                                            className="text-slate-300 hover:text-rose-500"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                       </div>
                                    </div>
                                  ))}
                               </div>

                               <button 
                                 onClick={() => {
                                   setSelectedClassId(cls.id);
                                   setSelectedSubjectId(sub.id);
                                   setModalType('chapter');
                                 }}
                                 className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-[10px] font-black uppercase text-slate-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                               >
                                  <Plus size={14} /> New Chapter
                               </button>
                            </div>
                          ))}
                          <button 
                             onClick={() => {
                               setSelectedClassId(cls.id);
                               setModalType('subject');
                             }}
                             className="p-10 border-4 border-dashed border-slate-100 rounded-[48px] text-slate-300 font-black uppercase text-[10px] tracking-widest hover:bg-white hover:border-emerald-200 hover:text-emerald-400 transition-all flex flex-col items-center justify-center gap-4"
                          >
                             <PlusCircle size={40} /> Add Subject Node
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
               </>
               )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
               key="settings"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="max-w-4xl"
            >
               <header className="mb-14">
                  <h1 className="text-5xl font-display font-black italic tracking-tight mb-2">Systems Config</h1>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Adjust global platform parameters</p>
               </header>

               <form onSubmit={updateGlobalSettings} className="bg-white border border-slate-100 rounded-[64px] p-16 shadow-sm space-y-12">
                  <div className="space-y-4">
                     <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 ml-4">Global Network Notice (Live Broadcast)</label>
                     <textarea 
                        value={siteSettings.globalNotice || ''}
                        onChange={(e) => setSiteSettings({...siteSettings, globalNotice: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 p-8 rounded-[40px] font-bold text-xl text-slate-700 focus:ring-8 focus:ring-emerald-500/5 transition-all outline-none resize-none"
                        rows={3}
                        placeholder="Broadcast a message to all active nodes..."
                     />
                  </div>

                  <div className="p-10 bg-emerald-50 rounded-[48px] border border-emerald-100 flex items-center gap-8">
                     <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shrink-0 shadow-xl shadow-emerald-500/10">
                        <Save className="text-emerald-500" size={32} />
                     </div>
                     <div>
                        <h4 className="text-2xl font-display font-black italic text-emerald-900 mb-2">Protocol Integrity</h4>
                        <p className="text-emerald-700/60 font-medium leading-relaxed">Updating these parameters will instantly recalibrate the entire platform network for all active nodes.</p>
                     </div>
                  </div>

                  <button className="w-full py-10 bg-slate-950 text-white rounded-[32px] font-black italic text-2xl shadow-3xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-6 group">
                     Sync Global State <ChevronRight className="group-hover:translate-x-3 transition-transform" />
                  </button>
               </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Modals */}
      <AnimatePresence>
         {modalType && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-2xl">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 30 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 30 }}
                 className="bg-white rounded-[64px] w-full max-w-2xl p-16 shadow-3xl relative overflow-hidden"
              >
                 <button onClick={() => setModalType(null)} className="absolute top-12 right-12 text-slate-300 hover:text-slate-900 transition-colors">
                    <X size={32} />
                 </button>

                 <div className="mb-12">
                    <h2 className="text-4xl font-display font-black italic tracking-tight mb-2">
                       {modalType === 'class' && (formData.id ? 'Reconfigure Class Node' : 'Deploy Class Node')}
                       {modalType === 'subject' && (formData.id ? 'Re-index Subject Node' : 'Index Subject Node')}
                       {modalType === 'chapter' && (formData.id ? 'Modify Chapter Header' : 'Inject Chapter Data')}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Accessing Content Infrastructure</p>
                 </div>

                 <form onSubmit={handleCMSAction} className="space-y-8">
                    <div className="space-y-4">
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Identifier</label>
                       <input 
                          required
                          value={modalType === 'chapter' ? (formData.title || '') : (formData.name || '')}
                          onChange={(e) => setFormData({...formData, [modalType === 'chapter' ? 'title' : 'name']: e.target.value})}
                          placeholder="..."
                          className="w-full bg-slate-50 border border-slate-100 p-8 rounded-[32px] font-bold text-xl outline-none focus:ring-8 focus:ring-emerald-500/5 transition-all"
                       />
                    </div>

                    {modalType === 'chapter' && (
                       <>
                          <div className="space-y-4">
                             <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Knowledge Repository (Notes)</label>
                             <textarea 
                                rows={4}
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 p-8 rounded-[40px] font-medium text-lg outline-none focus:ring-8 focus:ring-emerald-500/5 transition-all resize-none"
                             />
                          </div>
                          <div className="flex items-center gap-4 p-8 bg-emerald-50 rounded-[32px] border border-emerald-100">
                             <input 
                                type="checkbox"
                                checked={formData.isFree || false}
                                onChange={(e) => setFormData({...formData, isFree: e.target.checked})}
                                id="isFree"
                                className="w-6 h-6 rounded-lg text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                             />
                             <label htmlFor="isFree" className="text-sm font-black italic uppercase tracking-widest text-emerald-900 cursor-pointer">Open Access Protocol (Free Chapter)</label>
                          </div>
                       </>
                    )}

                    <div className="flex gap-6 pt-6">
                       <button 
                          type="button"
                          onClick={() => setModalType(null)}
                          className="flex-1 py-8 border-2 border-slate-100 rounded-[32px] font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                       >
                          Override System
                       </button>
                       <button 
                          disabled={modalLoading}
                          className="flex-2 py-8 bg-slate-950 text-white rounded-[32px] font-black uppercase text-xs tracking-widest hover:bg-black transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                       >
                          {modalLoading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Execute Hub Signal <ChevronRight size={18} /></>}
                       </button>
                    </div>
                 </form>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}

