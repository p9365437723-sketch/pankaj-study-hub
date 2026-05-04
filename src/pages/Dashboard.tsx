import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, ArrowRight, Sparkles, BookOpen, Clock, 
  ChevronRight, LogOut, Bookmark, FileText, Users, 
  FolderPlus, FilePlus, Plus, Trash2, Folder, 
  X, ShieldCheck, Database, Search, HardDrive
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../lib/dataService';
import { 
  Class, SubscriptionStatus, 
  Folder as FolderType, UserFile, UserNote, TeamMember 
} from '../types';
import { db } from '../lib/firebase';
import { 
  collection, addDoc, onSnapshot, query, 
  where, orderBy, serverTimestamp, deleteDoc, doc 
} from 'firebase/firestore';

import { APP_NAME } from '../constants';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Firestore Data State
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<UserFile[]>([]);
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);

  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Modal States
  const [activeModal, setActiveModal] = useState<'folder' | 'file' | 'note' | 'member' | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form States
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formFolderId, setFormFolderId] = useState('');
  const [formSize, setFormSize] = useState('');

  const isPremium = user?.subscriptionStatus === SubscriptionStatus.PREMIUM;

  useEffect(() => {
    const fetchClasses = async () => {
      const data = await dataService.getClasses();
      setClasses(data);
      setLoadingClasses(false);
    };
    fetchClasses();
  }, []);

  // Real-time Firestore Listeners
  useEffect(() => {
    if (!user || !db) return;

    const userPath = `users/${user.uid}`;

    // Listeners
    const foldersUnsub = onSnapshot(
      query(collection(db, `${userPath}/folders`), orderBy('createdAt', 'desc')),
      (snap) => {
        setFolders(snap.docs.map(d => ({ id: d.id, ...d.data() } as FolderType)));
      }
    );

    const filesUnsub = onSnapshot(
      query(collection(db, `${userPath}/files`), orderBy('createdAt', 'desc')),
      (snap) => {
        setFiles(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserFile)));
        setLoadingFiles(false);
      }
    );

    const notesUnsub = onSnapshot(
      query(collection(db, `${userPath}/notes`), orderBy('createdAt', 'desc')),
      (snap) => {
        setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserNote)));
        setLoadingNotes(false);
      }
    );

    const membersUnsub = onSnapshot(
      query(collection(db, `${userPath}/teamMembers`), orderBy('createdAt', 'desc')),
      (snap) => {
        setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() } as TeamMember)));
        setLoadingMembers(false);
      }
    );

    return () => {
      foldersUnsub();
      filesUnsub();
      notesUnsub();
      membersUnsub();
    };
  }, [user]);

  // Firestore Actions
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !formName) return;
    setModalLoading(true);
    try {
      await addDoc(collection(db, `users/${user.uid}/folders`), {
        name: formName,
        createdAt: serverTimestamp()
      });
      setActiveModal(null);
      setFormName('');
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !formName || !formSize) return;
    setModalLoading(true);
    try {
      await addDoc(collection(db, `users/${user.uid}/files`), {
        name: formName,
        folderId: formFolderId || null,
        size: formSize,
        createdAt: serverTimestamp()
      });
      setActiveModal(null);
      setFormName('');
      setFormSize('');
      setFormFolderId('');
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !formTitle) return;
    setModalLoading(true);
    try {
      await addDoc(collection(db, `users/${user.uid}/notes`), {
        title: formTitle,
        content: formContent,
        createdAt: serverTimestamp()
      });
      setActiveModal(null);
      setFormTitle('');
      setFormContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !formName) return;
    setModalLoading(true);
    try {
      await addDoc(collection(db, `users/${user.uid}/teamMembers`), {
        name: formName,
        role: formRole || 'Contributor',
        createdAt: serverTimestamp()
      });
      setActiveModal(null);
      setFormName('');
      setFormRole('');
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/${collectionName}`, id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-40">
      {/* Dynamic Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 h-24">
        <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
             <div className="w-14 h-14 bg-emerald-600 rounded-[20px] flex items-center justify-center shadow-xl shadow-emerald-200 rotate-3 transition-transform hover:rotate-0">
                <GraduationCap className="text-white w-8 h-8" />
             </div>
             <div>
                <h1 className="text-2xl font-display font-black tracking-tight italic text-slate-900 leading-none mb-1">{APP_NAME}</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">The Ultimate Learning Grid</p>
             </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden md:block text-right">
                <p className="text-sm font-black italic">{user?.name}</p>
                <div className="flex items-center justify-end gap-1.5">
                   <span className={`w-1.5 h-1.5 rounded-full ${isPremium ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></span>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isPremium ? 'Elite Premium' : 'Free Tier'}</p>
                </div>
             </div>
             <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-emerald-500 to-teal-400 border-2 border-white shadow-lg shrink-0 overflow-hidden">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-emerald-600 text-sm italic overflow-hidden">
                   {user?.photoURL ? (
                      <img src={user.photoURL} alt={user?.name} className="w-full h-full object-cover" />
                   ) : (
                      user?.name.substring(0, 2).toUpperCase()
                   )}
                </div>
             </div>
             <button 
               onClick={() => signOut()}
               className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-rose-50 transition-all text-slate-400 hover:text-rose-500"
             >
                <LogOut size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Analytics Bar */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
           {[
             { label: 'Storage Used', value: '4.2GB', detail: 'of 10GB', color: 'emerald' },
             { label: 'Active Files', value: files.length, detail: 'items', color: 'blue' },
             { label: 'Shared Notes', value: notes.length, detail: 'saved', color: 'amber' },
             { label: 'Team Pulse', value: members.length, detail: 'members', color: 'rose' }
           ].map((stat, i) => (
             <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between h-40">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <div>
                   <p className="text-3xl font-display font-black italic tracking-tighter">{stat.value}</p>
                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{stat.detail}</p>
                </div>
             </div>
           ))}
        </section>

        {/* Welcome Section */}
        <section className="mb-20">
           <div className="bg-emerald-950 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                 <div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800/30 rounded-full text-xs font-black uppercase tracking-widest text-emerald-400 mb-6 border border-emerald-800/50">
                       <Sparkles size={14} /> System Online
                    </span>
                    <h2 className="text-5xl font-display font-black leading-[1.1] mb-6 italic tracking-tight">
                       Ready to dominate your Board Exams?
                    </h2>
                    <p className="text-emerald-100/60 text-lg font-medium leading-relaxed max-w-md mb-10">
                       Access high-speed notes and interactive assessments tailored for Assam SEBA syllabus.
                    </p>
                    <div className="flex gap-4">
                       {!isPremium && (
                         <button className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2">
                            Upgrade to Premium <ArrowRight size={18} />
                         </button>
                       )}
                       <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">
                          Curriculum Info
                       </button>
                    </div>
                 </div>
                 
                 <div className="hidden lg:grid grid-cols-2 gap-6">
                    <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 flex flex-col justify-between h-48 backdrop-blur-sm">
                       <BookOpen className="text-emerald-400" size={32} />
                       <div>
                          <p className="text-2xl font-black italic tracking-tight">120+</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Chapters Ready</p>
                       </div>
                    </div>
                    <div className="bg-emerald-500/10 p-6 rounded-[32px] border border-emerald-500/20 flex flex-col justify-between h-48 mt-8 backdrop-blur-sm">
                       <Clock className="text-emerald-400" size={32} />
                       <div>
                          <p className="text-2xl font-black italic tracking-tight">2.5k</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Quiz Sessions</p>
                       </div>
                    </div>
                 </div>
              </div>
              
              {/* Background Orbs */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />
           </div>
        </section>

        {/* Class Selection */}
        <section className="mb-24">
           <div className="flex items-center justify-between mb-10 px-4">
              <h3 className="text-3xl font-display font-black tracking-tight italic">Choose Your Stream</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Synchronized Curriculum</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {loadingClasses ? (
                Array(2).fill(0).map((_, i) => (
                  <div key={i} className="h-80 bg-white/50 border border-slate-100 rounded-[48px] animate-pulse" />
                ))
              ) : (
                classes.map((cls, idx) => (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => navigate(`/class/${cls.id}/subjects`)}
                    className="group bg-white rounded-[48px] border border-slate-100 p-12 flex flex-col justify-between h-[400px] relative overflow-hidden shadow-sm hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2 border-b-8 border-b-transparent hover:border-b-emerald-500"
                  >
                     <div className="relative z-10">
                        <div className="w-20 h-20 bg-emerald-50 rounded-[32px] flex items-center justify-center font-black text-5xl text-emerald-600 italic mb-10 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500 shadow-inner">
                           {cls.name.split(' ')[1] || (idx === 0 ? '9' : '10')}
                        </div>
                        <h4 className="text-5xl font-display font-black italic tracking-tight mb-4">{cls.name}</h4>
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest flex items-center gap-3">
                           <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                           NCERT ASSAM SYLLABUS
                        </p>
                     </div>
                     
                     <div className="flex items-center justify-between relative z-10 pt-8 border-t border-slate-50">
                        <div className="flex gap-3">
                           <span className="px-5 py-2.5 bg-slate-50 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">6 Subjects</span>
                           <span className="px-5 py-2.5 bg-slate-50 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">Digital Solutions</span>
                        </div>
                        <div className="w-14 h-14 rounded-full border-2 border-slate-50 flex items-center justify-center text-slate-200 group-hover:border-emerald-500 group-hover:text-emerald-600 group-hover:translate-x-3 transition-all duration-500">
                           <ChevronRight size={28} />
                        </div>
                     </div>
                     
                     {/* Decorative background element */}
                     <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                        <GraduationCap size={160} />
                     </div>
                  </motion.div>
                ))
              )}
           </div>
        </section>

        {/* My Files Section */}
        <section className="mb-24">
           <div className="flex items-center justify-between mb-10 px-4">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <Database size={20} />
                 </div>
                 <h3 className="text-3xl font-display font-black tracking-tight italic">My Files</h3>
              </div>
              <div className="flex gap-3">
                 <button 
                   onClick={() => setActiveModal('folder')}
                   className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                 >
                    <FolderPlus size={16} /> New Folder
                 </button>
                 <button 
                   onClick={() => setActiveModal('file')}
                   className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                 >
                    <FilePlus size={16} /> Add File
                 </button>
              </div>
           </div>

           <div className="bg-white border border-slate-100 rounded-[48px] p-8 shadow-sm">
              {loadingFiles && files.length === 0 ? (
                <div className="py-20 text-center animate-pulse">
                   <div className="w-16 h-16 bg-slate-50 rounded-full mx-auto mb-4" />
                   <div className="h-4 w-32 bg-slate-50 mx-auto rounded-full" />
                </div>
              ) : files.length === 0 && folders.length === 0 ? (
                <div className="py-32 text-center">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
                      <HardDrive size={32} />
                   </div>
                   <h4 className="text-2xl font-display font-black italic text-slate-900 mb-2">No files initialized</h4>
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mx-auto max-w-xs">Start building your secure digital archive by adding folders or files.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
                   {folders.map(folder => (
                     <div key={folder.id} className="group relative bg-slate-50 p-6 rounded-3xl border border-transparent hover:border-blue-200 transition-all cursor-pointer">
                        <Folder className="text-blue-500 mb-4" size={32} fill="currentColor" fillOpacity={0.1} />
                        <p className="text-sm font-black truncate">{folder.name}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Folder</p>
                        <button 
                          onClick={() => handleDelete('folders', folder.id)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                           <Trash2 size={12} />
                        </button>
                     </div>
                   ))}
                   {files.map(file => (
                     <div key={file.id} className="group relative bg-white p-6 rounded-3xl border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer">
                        <FileText className="text-emerald-500 mb-4" size={32} />
                        <p className="text-sm font-black truncate">{file.name}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{file.size}</p>
                        <button 
                          onClick={() => handleDelete('files', file.id)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                           <Trash2 size={12} />
                        </button>
                     </div>
                   ))}
                </div>
              )}
           </div>
        </section>

        {/* My Notes Section */}
        <section className="mb-24">
           <div className="flex items-center justify-between mb-10 px-4">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                    <BookOpen size={20} />
                 </div>
                 <h3 className="text-3xl font-display font-black tracking-tight italic">My Notes</h3>
              </div>
              <button 
                onClick={() => setActiveModal('note')}
                className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-amber-500 hover:text-amber-600 transition-all shadow-sm"
              >
                 <Plus size={16} /> New Note
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {loadingNotes && notes.length === 0 ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-64 bg-white rounded-[40px] border border-slate-100 animate-pulse" />
                ))
              ) : notes.length === 0 ? (
                <div className="col-span-full bg-white border border-slate-100 rounded-[48px] p-20 text-center shadow-sm">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                      <FileText size={32} />
                   </div>
                   <h4 className="text-2xl font-display font-black italic text-slate-900 mb-2">No active notes</h4>
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mx-auto max-w-xs">Your personal brain-dump area is ready for your first entry.</p>
                </div>
              ) : (
                notes.map(note => (
                  <motion.div 
                    key={note.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer h-72 flex flex-col justify-between"
                  >
                     <div>
                        <h5 className="text-xl font-display font-black italic tracking-tight mb-4 group-hover:text-amber-600 transition-colors">{note.title}</h5>
                        <p className="text-slate-500 text-sm font-medium line-clamp-3 italic leading-relaxed">{note.content || 'No content provided...'}</p>
                     </div>
                     <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Updated recently</p>
                        <button 
                          onClick={() => handleDelete('notes', note.id)}
                          className="w-10 h-10 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </motion.div>
                ))
              )}
           </div>
        </section>

        {/* Team Members Section */}
        <section>
           <div className="flex items-center justify-between mb-10 px-4">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                    <Users size={20} />
                 </div>
                 <h3 className="text-3xl font-display font-black tracking-tight italic">Team Members</h3>
              </div>
              <button 
                onClick={() => setActiveModal('member')}
                className="flex items-center gap-2 px-8 py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-200"
              >
                 <Plus size={16} /> Add Member
              </button>
           </div>

           <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-sm overflow-hidden">
              {loadingMembers && members.length === 0 ? (
                <div className="space-y-4">
                   {Array(3).fill(0).map((_, i) => (
                     <div key={i} className="h-20 bg-slate-50 rounded-3xl animate-pulse" />
                   ))}
                </div>
              ) : members.length === 0 ? (
                <div className="py-20 text-center">
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">No collaborators invited to your project yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                   {members.map(member => (
                     <div key={member.id} className="group py-6 flex items-center justify-between hover:bg-slate-50 px-6 -mx-6 transition-colors first:pt-0 last:pb-0">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center font-black text-rose-600 text-lg uppercase italic border border-rose-100 shadow-inner">
                              {member.name.substring(0, 2)}
                           </div>
                           <div>
                              <h5 className="text-lg font-black italic">{member.name}</h5>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.role}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <span className="hidden md:block px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest">Active Now</span>
                           <button 
                             onClick={() => handleDelete('teamMembers', member.id)}
                             className="w-10 h-10 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
              )}
           </div>
        </section>
      </main>

      {/* Global Modals */}
      <AnimatePresence>
         {activeModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 30 }}
               className="bg-white rounded-[64px] w-full max-w-xl p-16 shadow-[0_64px_128px_-16px_rgba(0,0,0,0.1)] relative overflow-hidden"
             >
                <button 
                  onClick={() => setActiveModal(null)}
                  className="absolute top-12 right-12 w-12 h-12 rounded-full bg-slate-50 text-slate-300 hover:text-slate-900 transition-colors flex items-center justify-center"
                >
                   <X size={24} />
                </button>

                <div className="mb-12">
                   <h2 className="text-4xl font-display font-black italic tracking-tight mb-3">
                      {activeModal === 'folder' && 'Initialize Folder'}
                      {activeModal === 'file' && 'Index New File'}
                      {activeModal === 'note' && 'Capture Insight'}
                      {activeModal === 'member' && 'Deploy Member'}
                   </h2>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Accessing Digital Infrastructure</p>
                </div>

                <form 
                  onSubmit={
                    activeModal === 'folder' ? handleCreateFolder : 
                    activeModal === 'file' ? handleAddFile : 
                    activeModal === 'note' ? handleCreateNote : 
                    handleAddMember
                  }
                  className="space-y-8"
                >
                   {/* Shared Name/Title Input */}
                   <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                         {activeModal === 'note' ? 'Insight Title' : 'Entity Name'}
                      </label>
                      <input 
                        required
                        value={activeModal === 'note' ? formTitle : formName}
                        onChange={(e) => activeModal === 'note' ? setFormTitle(e.target.value) : setFormName(e.target.value)}
                        placeholder="..."
                        className="w-full bg-slate-50 border border-slate-100 p-7 rounded-[32px] focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-xl placeholder:text-slate-200 transition-all"
                      />
                   </div>

                   {/* Conditional Inputs */}
                   {activeModal === 'file' && (
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">File Size</label>
                           <input 
                              required
                              value={formSize}
                              onChange={(e) => setFormSize(e.target.value)}
                              placeholder="e.g. 2.4MB"
                              className="w-full bg-slate-50 border border-slate-100 p-7 rounded-[32px] focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-lg placeholder:text-slate-200"
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Target Folder</label>
                           <select 
                              value={formFolderId}
                              onChange={(e) => setFormFolderId(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-100 p-7 rounded-[32px] focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-lg appearance-none cursor-pointer"
                           >
                              <option value="">Root Archive</option>
                              {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                           </select>
                        </div>
                     </div>
                   )}

                   {activeModal === 'note' && (
                     <div className="space-y-3">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Contextual Content</label>
                        <textarea 
                           value={formContent}
                           onChange={(e) => setFormContent(e.target.value)}
                           rows={4}
                           placeholder="Type your notes here..."
                           className="w-full bg-slate-50 border border-slate-100 p-7 rounded-[40px] focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium text-lg placeholder:text-slate-200 transition-all resize-none"
                        />
                     </div>
                   )}

                   {activeModal === 'member' && (
                     <div className="space-y-3">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Designated Role</label>
                        <input 
                           value={formRole}
                           onChange={(e) => setFormRole(e.target.value)}
                           placeholder="e.g. Lead Designer"
                           className="w-full bg-slate-50 border border-slate-100 p-7 rounded-[32px] focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-xl placeholder:text-slate-200"
                        />
                     </div>
                   )}

                   <div className="flex gap-6 pt-4">
                      <button 
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="flex-1 py-7 border border-slate-200 rounded-[32px] font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
                      >
                         Override System
                      </button>
                      <button 
                        disabled={modalLoading}
                        className="flex-2 py-7 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                      >
                         {modalLoading ? (
                           <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                         ) : (
                           <>Execute Command <ChevronRight size={16} /></>
                         )}
                      </button>
                   </div>
                </form>
             </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Persistence Indicator */}
      <div className="fixed bottom-12 left-12 flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-full shadow-2xl z-40">
         <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sync Active: Hub Node 4.0</p>
      </div>
    </div>
  );
}

