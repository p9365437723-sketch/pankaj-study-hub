import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, 
  deleteDoc, query, where, orderBy, setDoc, serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Class, Subject, Chapter, SiteSettings, UserProfile } from '../types';

// Fallback Mock Data
const MOCK_CLASSES: Class[] = [
  { id: 'class9', name: 'Class 9' },
  { id: 'class10', name: 'Class 10' }
];

const MOCK_SUBJECTS: Subject[] = [
  { id: 'sci-9', classId: 'class9', name: 'Science', icon: 'FlaskConical', color: 'emerald' },
  { id: 'math-9', classId: 'class9', name: 'Mathematics', icon: 'Calculator', color: 'blue' }
];

const MOCK_CHAPTERS: Record<string, Chapter[]> = {
  'sci-9': [
    { 
      id: 'ch1', 
      subjectId: 'sci-9', 
      title: 'Matter in Our Surroundings', 
      content: { 
        notes: 'Everything in this universe is made up of material which scientists have named matter...',
        questions: [{ q: 'What is matter?', a: 'Anything that occupies space and has mass.' }],
        quiz: [{ question: 'Is air matter?', options: ['Yes', 'No'], answer: 0 }],
        dates: [],
        summary: 'Basics of matter.',
        keywords: []
      }
    }
  ]
};

const isDemo = () => !db;

export const dataService = {
  // Classes
  async getClasses(): Promise<Class[]> {
    if (isDemo()) return JSON.parse(localStorage.getItem('classes') || JSON.stringify(MOCK_CLASSES));
    try {
      const snap = await getDocs(collection(db, 'classes'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Class));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'classes');
      return [];
    }
  },

  async addClass(name: string): Promise<string> {
    if (isDemo()) {
      const classes = await this.getClasses();
      const newClass = { id: Date.now().toString(), name };
      localStorage.setItem('classes', JSON.stringify([...classes, newClass]));
      return newClass.id;
    }
    const docRef = await addDoc(collection(db, 'classes'), { name, createdAt: serverTimestamp() });
    return docRef.id;
  },

  // Subjects
  async getSubjects(classId: string): Promise<Subject[]> {
    if (isDemo()) {
      const all = JSON.parse(localStorage.getItem('subjects') || JSON.stringify(MOCK_SUBJECTS));
      return all.filter((s: Subject) => s.classId === classId);
    }
    try {
      const q = query(collection(db, 'subjects'), where('classId', '==', classId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Subject));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'subjects');
      return [];
    }
  },

  async addSubject(classId: string, subject: Omit<Subject, 'id'>): Promise<string> {
    if (isDemo()) {
      const all = JSON.parse(localStorage.getItem('subjects') || JSON.stringify(MOCK_SUBJECTS));
      const id = Date.now().toString();
      localStorage.setItem('subjects', JSON.stringify([...all, { ...subject, id }]));
      return id;
    }
    const docRef = await addDoc(collection(db, 'subjects'), { ...subject, classId, createdAt: serverTimestamp() });
    return docRef.id;
  },

  // Chapters
  async getChapters(subjectId: string): Promise<Chapter[]> {
    if (isDemo()) {
      const all: Chapter[] = JSON.parse(localStorage.getItem('chapters') || '[]');
      const filtered = all.filter(c => c.subjectId === subjectId);
      if (filtered.length === 0 && MOCK_CHAPTERS[subjectId]) return MOCK_CHAPTERS[subjectId];
      return filtered;
    }
    try {
      const q = query(collection(db, 'chapters'), where('subjectId', '==', subjectId), orderBy('createdAt', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Chapter));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'chapters');
      return [];
    }
  },

  async getChapter(chapterId: string): Promise<Chapter | null> {
    if (isDemo()) {
      const all: Chapter[] = JSON.parse(localStorage.getItem('chapters') || '[]');
      let found = all.find(c => c.id === chapterId);
      if (!found) {
        // Search in mocks
        for (const subId in MOCK_CHAPTERS) {
          const m = MOCK_CHAPTERS[subId].find(c => c.id === chapterId);
          if (m) found = m;
        }
      }
      return found || null;
    }
    try {
      const docSnap = await getDoc(doc(db, 'chapters', chapterId));
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Chapter : null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `chapters/${chapterId}`);
      return null;
    }
  },

  async saveChapter(chapter: Chapter): Promise<void> {
    if (isDemo()) {
      const all: Chapter[] = JSON.parse(localStorage.getItem('chapters') || '[]');
      const index = all.findIndex(c => c.id === chapter.id);
      if (index >= 0) all[index] = chapter;
      else all.push(chapter);
      localStorage.setItem('chapters', JSON.stringify(all));
      return;
    }
    const { id, ...data } = chapter;
    await setDoc(doc(db, 'chapters', id), { ...data, updatedAt: serverTimestamp() });
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    const defaultSettings: SiteSettings = { upiId: 'p9365437723@okaxis', subscriptionPrice: 100 };
    if (isDemo()) return JSON.parse(localStorage.getItem('settings') || JSON.stringify(defaultSettings));
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'global'));
      return docSnap.exists() ? docSnap.data() as SiteSettings : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  },

  async updateSettings(settings: SiteSettings): Promise<void> {
    if (isDemo()) {
      localStorage.setItem('settings', JSON.stringify(settings));
      return;
    }
    await setDoc(doc(db, 'settings', 'global'), settings);
  }
};
