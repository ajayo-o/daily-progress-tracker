"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Spline from '@splinetool/react-spline';
import { useSession, signIn, signOut } from "next-auth/react"; 
import AiMentor from "@/components/AiMentor";
import StoreTab from "@/components/StoreTab";
import { Task, StoreItem, HistoryEntry, CountdownEvent } from "@/types";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function Home() {
  const { data: session, status } = useSession();
  
  // Auth & Login UI State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<0 | 1 | 2>(0);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"directives" | "calendar" | "store" | "syllabus" | "terminal">("directives");
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const skipSave = useRef(true);
  
  // Workspace Layout Customization
  const [showRightPanel, setShowRightPanel] = useState(true);

  // User Identity & Preferences
  const [username, setUsername] = useState("M. Ajay Prakash");
  const [phone, setPhone] = useState("");
  const [theme, setTheme] = useState("dark");
  const [aiMode, setAiMode] = useState<"online" | "offline">("online");
  const [aiBehavior, setAiBehavior] = useState("Direct answers only. Focus on highly optimized code, DSA logic, and technical trading setups.");

  // Game/Progress State
  const [wallet, setWallet] = useState(0); 
  const [inventory, setInventory] = useState<string[]>([]);
  const [customGoals, setCustomGoals] = useState<StoreItem[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [countdowns, setCountdowns] = useState<CountdownEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // UI State
  const [newTaskText, setNewTaskText] = useState("");
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [proofText, setProofText] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newCountdown, setNewCountdown] = useState({ title: "", date: "" });
  const [editingCountdownId, setEditingCountdownId] = useState<string | null>(null);
  const [editCdTitle, setEditCdTitle] = useState("");
  const [editCdDate, setEditCdDate] = useState("");
  const [expandedTaskHistory, setExpandedTaskHistory] = useState<string | null>(null);

  // Syllabus State
  const [syllabi, setSyllabi] = useState<any[]>([]);
  const [syllabusTitle, setSyllabusTitle] = useState("");
  const [syllabusRaw, setSyllabusRaw] = useState("");
  const [syllabusDays, setSyllabusDays] = useState(7);
  const [activeSyllabus, setActiveSyllabus] = useState<any | null>(null);
  const [editingSyllabusId, setEditingSyllabusId] = useState<string | null>(null);

  // Advanced Terminal State
  const [terminalView, setTerminalView] = useState<"chat" | "notes">("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Chat State
  const [chatSessions, setChatSessions] = useState<any[]>([{ id: "default", title: "Initialize Request...", messages: [] }]);
  const [activeSessionId, setActiveSessionId] = useState("default");
  const [chatSearch, setChatSearch] = useState("");
  const [chatMode, setChatMode] = useState<"fast" | "deep">("fast");
  const [chatInput, setChatInput] = useState("");
  const [chatMenuOpen, setChatMenuOpen] = useState<string | null>(null);
  const [editingChatTitleId, setEditingChatTitleId] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState("");
  
  // Notes State
  const [terminalNotes, setTerminalNotes] = useState<any[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteImage, setNoteImage] = useState<string | null>(null);
  const [noteVideoLink, setNoteVideoLink] = useState("");
  const [noteSearch, setNoteSearch] = useState("");
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const noteFileInputRef = useRef<HTMLInputElement>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) alert("Invalid credentials. Please try again.");
    setIsAuthLoading(false);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotPasswordStep === 1) {
        setIsAuthLoading(true);
        setTimeout(() => { setIsAuthLoading(false); setForgotPasswordStep(2); }, 1500);
    } else if (forgotPasswordStep === 2) {
        alert("OTP Verified. Reset link sent to your secure comms.");
        setForgotPasswordStep(0);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    const loadCloudData = async () => {
      try {
        const res = await fetch("/api/user-data", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && data._id) {
            setTasks(data.tasks || []);
            setWallet(data.wallet || 0);
            setHistory(data.history || []);
            setCountdowns(data.countdowns || []);
            setCustomGoals(data.customGoals || []);
            setInventory(data.inventory || []);
            setChatSessions(data.chatSessions?.length ? data.chatSessions : [{ id: "default", title: "Initialize Request...", messages: [] }]);
            setTerminalNotes(data.terminalNotes || []);
            setSyllabi(data.targetSyllabus || []);
            setUsername(data.username || "M. Ajay Prakash");
            setPhone(data.phone || "");
            setTheme(data.theme || "dark");
            setAiMode(data.aiMode || "online");
            setAiBehavior(data.aiBehavior || "Direct answers only. Focus on highly optimized code, DSA logic, and technical trading setups.");
            setTimeout(() => { skipSave.current = false; }, 1000);
          }
        }
      } catch (error) { console.error("Failed to load cloud data:", error); } finally { setIsDataLoaded(true); }
    };
    loadCloudData();
  }, [status]);

  useEffect(() => {
    if (!isDataLoaded || status !== "authenticated" || skipSave.current) return; 
    const saveCloudData = async () => {
      try {
        await fetch("/api/user-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            tasks, wallet, history, countdowns, customGoals, inventory, 
            username, phone, theme, aiMode, aiBehavior, 
            chatSessions, terminalNotes, targetSyllabus: syllabi
          }),
        });
      } catch (error) {}
    };
    const timeoutId = setTimeout(() => saveCloudData(), 1500);
    return () => clearTimeout(timeoutId);
  }, [tasks, wallet, history, countdowns, customGoals, inventory, username, phone, theme, aiMode, aiBehavior, chatSessions, terminalNotes, syllabi, isDataLoaded, status]);

  // Core Data
  const progressPercentage = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;
  const todayEarned = tasks.filter(t => t.completed).length * 20;

  const groupedHistory = history.reduce((acc, day) => {
    day.proofs.forEach(proof => {
      if (!acc[proof.taskName]) {
        const isActive = tasks.some(t => t.text === proof.taskName);
        acc[proof.taskName] = { status: isActive ? "In Progress" : "Archived / Deleted", logs: [] };
      }
      acc[proof.taskName].logs.push({ date: day.date, proofText: proof.proofText });
    });
    return acc;
  }, {} as Record<string, { status: string, logs: { date: string, proofText: string }[] }>);

  // --- ACTIONS ---
  const submitProof = async () => {
    if (!proofText.trim()) return;
    const taskObj = tasks.find(t => t.id === activeTaskId);
    const taskName = taskObj ? taskObj.text : "Unknown Mission";
    setTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, completed: true, proof: proofText } : t));
    setWallet(prev => prev + 20); 
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setHistory(prev => {
      const existingDayIndex = prev.findIndex(h => h.date === todayStr);
      if (existingDayIndex >= 0) {
        const newHistory = [...prev];
        newHistory[existingDayIndex] = { ...newHistory[existingDayIndex], earned: newHistory[existingDayIndex].earned + 20, proofs: [...newHistory[existingDayIndex].proofs, { taskName, proofText }] };
        return newHistory;
      } else {
        return [{ date: todayStr, earned: 20, proofs: [{ taskName, proofText }] }, ...prev];
      }
    });
    setProofModalOpen(false);
    setProofText("");
    setActiveTaskId(null);
  };

  const removeTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));
  const startEdit = (task: Task) => { setEditingTaskId(task.id); setEditText(task.text); };
  const saveEdit = (id: string) => { setTasks(tasks.map(t => t.id === id ? { ...t, text: editText.trim() } : t)); setEditingTaskId(null); };
  const handleAddCountdown = (e: React.FormEvent) => { e.preventDefault(); if(!newCountdown.title || !newCountdown.date) return; setCountdowns([...countdowns, { id: Date.now().toString(), title: newCountdown.title, targetDate: newCountdown.date }]); setNewCountdown({ title: "", date: "" }); };
  const removeCountdown = (id: string) => setCountdowns(countdowns.filter(c => c.id !== id));
  const startEditCountdown = (cd: CountdownEvent) => { setEditingCountdownId(cd.id); setEditCdTitle(cd.title); setEditCdDate(cd.targetDate); };
  const saveEditCountdown = (id: string) => { setCountdowns(countdowns.map(c => c.id === id ? { ...c, title: editCdTitle, targetDate: editCdDate } : c)); setEditingCountdownId(null); };
  const calculateDaysLeft = (targetDate: string) => { const diffTime = new Date(targetDate).getTime() - new Date().getTime(); return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); };

  // Syllabus & Notes
  const handleAddSyllabus = () => {
    if(!syllabusTitle) return alert("Syllabus needs a title.");
    if(editingSyllabusId) {
        setSyllabi(syllabi.map(s => s.id === editingSyllabusId ? { ...s, courseName: syllabusTitle, totalDays: syllabusDays, rawContent: syllabusRaw } : s));
        setEditingSyllabusId(null);
    } else {
        const newSyllabus = { id: Date.now().toString(), courseName: syllabusTitle, totalDays: syllabusDays, rawContent: syllabusRaw, progress: 0, createdAt: new Date().toLocaleDateString() };
        setSyllabi([newSyllabus, ...syllabi]);
    }
    setSyllabusTitle(""); setSyllabusRaw("");
  };
  const handleDeleteSyllabus = (id: string) => { setSyllabi(syllabi.filter(s => s.id !== id)); if(activeSyllabus?.id === id) setActiveSyllabus(null); };
  const handleEditSyllabus = (s: any) => { setSyllabusTitle(s.courseName); setSyllabusDays(s.totalDays); setSyllabusRaw(s.rawContent); setEditingSyllabusId(s.id); setActiveSyllabus(null); };

  const handleSaveNote = async () => {
    if(!noteTitle) return alert("Note requires a title to save.");
    let base64Img = noteImage;
    if(attachedFile) base64Img = await fileToBase64(attachedFile);
    const newNote = { id: activeNoteId || Date.now().toString(), title: noteTitle, content: noteContent, image: base64Img, videoLink: noteVideoLink, date: new Date().toLocaleDateString() };
    if(activeNoteId) setTerminalNotes(terminalNotes.map(n => n.id === activeNoteId ? newNote : n));
    else setTerminalNotes([newNote, ...terminalNotes]);
    alert("Note Saved!"); setAttachedFile(null);
  };
  const handleDeleteNote = (id: string) => { setTerminalNotes(terminalNotes.filter(n => n.id !== id)); if(activeNoteId === id) { setActiveNoteId(null); setNoteTitle(""); setNoteContent(""); setNoteImage(null); setNoteVideoLink(""); } };

  // Chat Actions
  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!chatInput.trim()) return;
    const currentSession = chatSessions.find(s => s.id === activeSessionId) || chatSessions[0];
    const newLog = [...(currentSession.messages || []), { role: "user", content: chatInput }];
    const updatedTitle = currentSession.title === "Initialize Request..." ? chatInput.substring(0, 20) + "..." : currentSession.title;
    setChatSessions(chatSessions.map(s => s.id === activeSessionId ? { ...s, title: updatedTitle, messages: newLog } : s));
    setChatInput("");
    try {
      const res = await fetch("/api/terminal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: newLog, mode: aiMode, behavior: aiBehavior, chatMode }) });
      const data = await res.json();
      setChatSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...newLog, { role: "ai", content: data.reply }] } : s));
    } catch (err) {
      setChatSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...newLog, { role: "ai", content: "SYSTEM ERROR: API unreachable." }] } : s));
    }
  };
  const handleBranchChat = (sessionId: string) => {
      const sessionToBranch = chatSessions.find(s => s.id === sessionId);
      if(!sessionToBranch) return;
      const newSession = { id: Date.now().toString(), title: `${sessionToBranch.title} (Branch)`, messages: [...sessionToBranch.messages] };
      setChatSessions([newSession, ...chatSessions]);
      setActiveSessionId(newSession.id);
      setChatMenuOpen(null);
  };
  const handleDeleteChat = (sessionId: string) => {
      const newSessions = chatSessions.filter(s => s.id !== sessionId);
      setChatSessions(newSessions.length ? newSessions : [{ id: Date.now().toString(), title: "Initialize Request...", messages: [] }]);
      if(activeSessionId === sessionId) setActiveSessionId(newSessions[0]?.id || "default");
      setChatMenuOpen(null);
  };
  const handleRenameChat = (id: string) => {
      setChatSessions(chatSessions.map(s => s.id === id ? { ...s, title: newChatTitle } : s));
      setEditingChatTitleId(null);
  };

  const activeChatMessages = chatSessions.find(s => s.id === activeSessionId)?.messages || [];
  const filteredSessions = chatSessions.filter(s => s.title.toLowerCase().includes(chatSearch.toLowerCase()));
  const filteredNotes = terminalNotes.filter(n => n.title.toLowerCase().includes(noteSearch.toLowerCase()));
  const extractYoutubeId = (url: string) => { const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/; const match = url.match(regExp); return (match && match[2].length === 11) ? match[2] : null; };

  if (status === "loading") return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 tracking-widest text-sm uppercase animate-pulse">Initializing System...</div>;
  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-zinc-900/50 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl relative z-10">
          <div className="text-center mb-8"><h1 className="text-3xl font-bold bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">Hustle Tracker</h1></div>
          {forgotPasswordStep === 0 ? (
            <form onSubmit={handleAuth} className="space-y-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email / Target ID" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" required />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Passkey" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">{showPassword ? "👁️‍🗨️" : "👁️"}</button>
              </div>
              <div className="flex justify-end"><button type="button" onClick={() => setForgotPasswordStep(1)} className="text-xs text-zinc-500 hover:text-white transition-colors">Forgot Passkey?</button></div>
              <button type="submit" disabled={isAuthLoading} className="w-full bg-white text-zinc-950 font-bold py-3 rounded-xl mt-4 hover:bg-zinc-200 transition-colors flex justify-center items-center">{isAuthLoading ? "Verifying..." : "Access Mainframe"}</button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-zinc-400 mb-4">{forgotPasswordStep === 1 ? "Enter your registered email to receive a secure OTP reset link." : "Enter the OTP sent to your secure comms."}</p>
              {forgotPasswordStep === 1 ? (<input type="email" placeholder="Recovery Email" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" required />) : (<input type="text" placeholder="6-Digit Secure OTP" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none tracking-[0.5em] text-center font-mono" required />)}
              <button type="submit" disabled={isAuthLoading} className="w-full bg-emerald-500 text-zinc-950 font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors">{isAuthLoading ? "Processing..." : (forgotPasswordStep === 1 ? "Send OTP" : "Verify & Reset")}</button>
              <button type="button" onClick={() => setForgotPasswordStep(0)} className="w-full text-zinc-500 text-sm py-2 hover:text-white transition-colors">Return to Login</button>
            </form>
          )}
        </motion.div>
      </main>
    );
  }

  if (!isDataLoaded) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-emerald-500/50 tracking-widest text-sm uppercase animate-pulse">Syncing Cloud Database...</div>;

  return (
    <main className="relative min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans overflow-hidden flex flex-col">
      <div className="relative z-10 max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <header className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-br from-white to-zinc-600 bg-clip-text text-transparent">Hustle Tracker</h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-zinc-500 text-xs uppercase tracking-[0.3em] font-medium">Agent <span className="text-emerald-400 font-bold">{username}</span></p>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold ${aiMode === 'online' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>{aiMode === 'online' ? 'Cloud Link' : 'Local Inference'}</span>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setShowRightPanel(!showRightPanel)} className="text-xs text-zinc-400 hover:text-white border border-white/10 bg-white/5 px-4 py-2 rounded-xl transition-all">
              {showRightPanel ? "⛶ Maximize OS" : "🗗 Show Mentor"}
            </button>
            <div className="bg-white/[0.05] px-6 py-3 rounded-2xl border border-white/20 flex items-center shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <span className="text-zinc-400 font-bold mr-2">Progress:</span><span className="font-mono text-2xl font-bold text-white">{wallet} XP</span>
            </div>
            <button onClick={() => setIsSettingsOpen(true)} className="p-3 border border-white/10 rounded-xl bg-white/[0.02] hover:bg-white/10 transition-all text-zinc-400 hover:text-white">⚙️</button>
          </div>
        </header>

        <div className="flex flex-wrap gap-4 mb-8">
          {[ { id: "directives", label: "Daily Directives" }, { id: "calendar", label: "Discipline Vault" }, { id: "store", label: "Vision Board" }, { id: "syllabus", label: "Syllabus Vault" }, { id: "terminal", label: "OS Terminal" } ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? "bg-white text-zinc-950" : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/5"}`}>{tab.label}</button>
          ))}
        </div>

        <div className={`grid gap-8 flex-1 transition-all duration-300 ${showRightPanel ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
          <div className={`${showRightPanel ? 'col-span-2' : 'col-span-1'} bg-white/[0.02] rounded-3xl p-8 border border-white/10 backdrop-blur-2xl overflow-y-auto min-h-[500px] flex flex-col`}>
            
            {activeTab === "directives" && (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-2xl font-light mb-6">Today's Missions (20 XP each)</h2>
                  <form onSubmit={(e) => { e.preventDefault(); if (!newTaskText.trim()) return; setTasks([...tasks, { id: Date.now().toString(), text: newTaskText, completed: false }]); setNewTaskText(""); }} className="mb-6 flex gap-3">
                    <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Initialize new directive..." className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                    <button type="submit" className="bg-white text-zinc-950 px-6 py-3 rounded-xl text-sm font-medium">Add</button>
                  </form>
                  <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-2xl group">
                          <div className="flex items-center gap-4 flex-1">
                            <button onClick={() => { if (!task.completed) { setActiveTaskId(task.id); setProofModalOpen(true); } }} className={`w-6 h-6 rounded-lg border ${task.completed ? "bg-emerald-500 border-emerald-500" : "border-white/20"}`} />
                            {editingTaskId === task.id ? (<input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} onBlur={() => saveEdit(task.id)} onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)} className="flex-1 bg-zinc-900 border border-white/20 rounded-lg px-3 py-1 text-sm text-white" autoFocus />) : (
                              <div className="flex flex-col"><span className={task.completed ? "text-zinc-500 line-through" : "text-white"}>{task.text}</span>{task.proof && <span className="text-[10px] text-zinc-400 mt-1 bg-white/5 px-2 py-0.5 rounded w-fit uppercase">Proof: {task.proof}</span>}</div>
                            )}
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4 shrink-0">
                            <button onClick={() => startEdit(task)} className="text-xs text-zinc-500 hover:text-white px-2 py-1">Edit</button>
                            <button onClick={() => removeTask(task.id)} className="text-xs text-zinc-500 hover:text-red-400 px-2 py-1">Remove</button>
                          </div>
                        </div>
                      ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {activeTab === "calendar" && (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="mb-10 pb-8 border-b border-white/5">
                    <h2 className="text-2xl font-light mb-6">Future Directives</h2>
                    <form onSubmit={handleAddCountdown} className="flex gap-3 mb-6">
                      <input type="text" value={newCountdown.title} onChange={e => setNewCountdown({...newCountdown, title: e.target.value})} placeholder="e.g., Target Exam..." className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white" required />
                      <input type="date" value={newCountdown.date} onChange={e => setNewCountdown({...newCountdown, date: e.target.value})} className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white cursor-pointer" required />
                      <button type="submit" className="bg-white text-zinc-950 px-6 py-3 rounded-xl text-sm font-medium">Set Timer</button>
                    </form>
                    <div className="grid grid-cols-1 gap-4">
                      {countdowns.length === 0 && <p className="text-sm text-zinc-600">No future events set.</p>}
                      {countdowns.map(cd => (
                        <div key={cd.id} className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl flex justify-between items-center group transition-all">
                          {editingCountdownId === cd.id ? (
                            <div className="flex gap-3 flex-1 mr-4">
                              <input type="text" value={editCdTitle} onChange={e=>setEditCdTitle(e.target.value)} className="flex-1 bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-sm text-white" />
                              <input type="date" value={editCdDate} onChange={e=>setEditCdDate(e.target.value)} className="bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-sm text-white cursor-pointer" />
                              <button onClick={() => saveEditCountdown(cd.id)} className="bg-white text-zinc-950 px-4 rounded-lg text-sm font-bold">Save</button>
                            </div>
                          ) : (
                            <>
                              <span className="text-zinc-300 font-medium">{cd.title} <span className="text-xs text-zinc-600 ml-2 font-mono">({cd.targetDate})</span></span>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <div className="text-2xl font-mono text-emerald-400">{calculateDaysLeft(cd.targetDate)}</div>
                                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Days Left</div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEditCountdown(cd)} className="text-xs text-zinc-500 hover:text-white px-2 py-1">Edit</button>
                                  <button onClick={() => removeCountdown(cd.id)} className="text-xs text-zinc-500 hover:text-red-400 px-2 py-1">Remove</button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-light">Discipline Journal</h2>
                    <div className="text-right"><div className="text-sm text-zinc-500">Unique Missions Logged</div><div className="text-3xl font-mono text-white">{Object.keys(groupedHistory).length}</div></div>
                  </div>
                  <div className="space-y-4">
                    {Object.keys(groupedHistory).length === 0 ? ( <div className="text-center p-10 border border-white/5 border-dashed rounded-2xl text-zinc-600 text-sm">No history yet.</div> ) : (
                      Object.entries(groupedHistory).map(([taskName, data]) => (
                        <div key={taskName} className="border border-white/10 rounded-3xl bg-white/[0.01] overflow-hidden transition-all">
                          <button onClick={() => setExpandedTaskHistory(expandedTaskHistory === taskName ? null : taskName)} className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors text-left">
                            <div><h3 className="font-bold text-lg text-white mb-2">{taskName}</h3><span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold ${data.status === "In Progress" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>{data.status}</span></div>
                            <div className="flex items-center gap-4"><div className="text-right hidden sm:block"><div className="text-xl font-mono text-white">{data.logs.length}</div><div className="text-[10px] text-zinc-500 uppercase tracking-widest">Logs</div></div><span className={`text-zinc-500 transition-transform ${expandedTaskHistory === taskName ? "rotate-180" : ""}`}>▼</span></div>
                          </button>
                          <AnimatePresence>
                            {expandedTaskHistory === taskName && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5">
                                <div className="p-6 space-y-4">
                                  {data.logs.map((log, idx) => (<div key={idx} className="flex flex-col md:flex-row gap-2 md:gap-4 items-start"><div className="w-28 shrink-0 text-xs text-zinc-500 font-mono pt-1">{log.date}</div><div className="flex-1 bg-zinc-900/50 p-4 rounded-2xl border border-white/5 text-sm text-zinc-300">{log.proofText}</div></div>))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {activeTab === "store" && (
              <StoreTab wallet={wallet} inventory={inventory} customGoals={customGoals} onBuyItem={(item: any) => { if(wallet >= item.price) { setWallet(wallet - item.price); setInventory([...inventory, item.id]); } }} onAddCustomGoal={(goal: any) => setCustomGoals([...customGoals, goal])} onEditCustomGoal={(updatedGoal: any) => setCustomGoals(customGoals.map(g => g.id === updatedGoal.id ? updatedGoal : g))} onDeleteCustomGoal={(id: string) => setCustomGoals(customGoals.filter(g => g.id !== id))} />
            )}

            {activeTab === "syllabus" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                  {!activeSyllabus ? (
                      <>
                        <div className="flex justify-between items-end mb-6"><h2 className="text-2xl font-light">Syllabus Vault</h2></div>
                        <div className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl mb-8 relative">
                            {editingSyllabusId && (<button onClick={() => {setEditingSyllabusId(null); setSyllabusTitle(""); setSyllabusRaw("");}} className="absolute top-6 right-6 text-xs text-zinc-500 hover:text-white">Cancel Edit</button>)}
                            <h3 className="text-sm font-bold text-white mb-4">{editingSyllabusId ? "Edit Target Roadmap" : "Add New Target"}</h3>
                            <div className="space-y-4">
                                <input type="text" value={syllabusTitle} onChange={(e) => setSyllabusTitle(e.target.value)} placeholder="Course Title..." className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                                <input type="number" value={syllabusDays} onChange={(e) => setSyllabusDays(Number(e.target.value))} placeholder="Target Days" className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                                <textarea value={syllabusRaw} onChange={(e) => setSyllabusRaw(e.target.value)} placeholder="Paste syllabus content..." className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 min-h-[100px] text-sm text-white" />
                                <button onClick={handleAddSyllabus} className="w-full bg-white text-zinc-950 font-bold py-3 rounded-xl hover:bg-zinc-200">Save to Vault</button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {syllabi.map(s => (
                                <div key={s.id} className="w-full bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 flex justify-between items-center group transition-colors">
                                    <button onClick={() => setActiveSyllabus(s)} className="flex-1 text-left p-4"><div className="font-bold text-white">{s.courseName} <span className="text-xs font-normal text-emerald-400 ml-2">({s.totalDays} Days)</span></div><div className="text-xs text-zinc-500 mt-1">Saved: {s.createdAt}</div></button>
                                    <div className="flex gap-3 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditSyllabus(s)} className="text-zinc-500 hover:text-white text-sm" title="Edit">✏️</button>
                                        <button onClick={() => handleDeleteSyllabus(s.id)} className="text-zinc-500 hover:text-red-400 text-sm" title="Remove">🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                      </>
                  ) : (
                      <div className="flex flex-col h-full">
                          <button onClick={() => setActiveSyllabus(null)} className="text-xs text-zinc-500 hover:text-white mb-4 uppercase tracking-widest w-fit">← Back to Vault</button>
                          <h2 className="text-3xl font-bold text-white mb-6">{activeSyllabus.courseName}</h2>
                          <div className="bg-black/30 p-6 rounded-2xl border border-white/5 text-sm text-zinc-300 whitespace-pre-wrap font-mono flex-1 overflow-y-auto">{activeSyllabus.rawContent}</div>
                      </div>
                  )}
              </motion.div>
            )}

            {activeTab === "terminal" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col flex-1 relative">
                
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4 shrink-0">
                  <div className="flex gap-2">
                    <button onClick={() => setTerminalView("chat")} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest ${terminalView === "chat" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}>Active Chat</button>
                    <button onClick={() => setTerminalView("notes")} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest ${terminalView === "notes" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}>Saved Notes</button>
                  </div>
                  <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-xs text-zinc-400 hover:text-white bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                    {isSidebarOpen ? "Hide History" : "Show History"}
                  </button>
                </div>

                {terminalView === "notes" ? (
                  <div className="flex-1 flex gap-6 h-full">
                     {isSidebarOpen && (
                       <div className="w-1/3 border-r border-white/5 pr-4 flex flex-col shrink-0">
                          <button onClick={() => {setActiveNoteId(null); setNoteTitle(""); setNoteContent(""); setNoteImage(null); setNoteVideoLink("");}} className="w-full bg-white/5 text-white text-xs font-bold py-3 rounded-xl mb-4 hover:bg-white/10">+ New Note</button>
                          <input type="text" value={noteSearch} onChange={(e) => setNoteSearch(e.target.value)} placeholder="Search notes..." className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mb-4" />
                          <div className="overflow-y-auto space-y-2 custom-scrollbar">
                              {filteredNotes.map(n => (
                                  <div key={n.id} className={`w-full text-left p-3 rounded-xl text-sm flex justify-between group ${activeNoteId === n.id ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-white/[0.02] text-zinc-400 hover:bg-white/5 border border-transparent"}`}>
                                      <button onClick={() => { setActiveNoteId(n.id); setNoteTitle(n.title); setNoteContent(n.content); setNoteImage(n.image || null); setNoteVideoLink(n.videoLink || ""); }} className="flex-1 truncate text-left"><div className="font-bold truncate">{n.title}</div><div className="text-[10px] opacity-60 mt-1">{n.date}</div></button>
                                      <button onClick={() => handleDeleteNote(n.id)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 pl-2">🗑️</button>
                                  </div>
                              ))}
                          </div>
                       </div>
                     )}

                     <div className="flex-1 flex flex-col overflow-y-auto pr-2 custom-scrollbar">
                        <input type="text" value={noteTitle} onChange={(e)=>setNoteTitle(e.target.value)} placeholder="Note Title..." className="bg-transparent text-2xl font-bold text-white focus:outline-none mb-4 shrink-0" />
                        <textarea value={noteContent} onChange={(e)=>setNoteContent(e.target.value)} placeholder="Paste data, code, or research here..." className="w-full min-h-[150px] bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-white/20 resize-y mb-4 shrink-0" />
                        
                        {noteImage && (
                          <div className="relative mb-4 group shrink-0">
                              <img src={noteImage} alt="Note Attachment" className="w-full h-auto max-h-96 object-cover rounded-xl border border-white/10 cursor-zoom-in" onClick={() => setZoomedImage(noteImage)} />
                              <button onClick={() => setNoteImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100">✕</button>
                          </div>
                        )}
                        
                        {noteVideoLink && (
                          <div className="mb-4 relative group shrink-0">
                             {extractYoutubeId(noteVideoLink) ? (
                               <iframe className="w-full aspect-video rounded-xl border border-white/10" src={`https://www.youtube.com/embed/${extractYoutubeId(noteVideoLink)}`} allowFullScreen />
                             ) : (
                               <video controls className="w-full rounded-xl border border-white/10"><source src={noteVideoLink} /></video>
                             )}
                             <button onClick={() => setNoteVideoLink("")} className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full text-xs">✕</button>
                          </div>
                        )}

                        <div className="flex gap-2 items-center shrink-0 mb-4">
                            <input type="file" ref={noteFileInputRef} className="hidden" accept="image/*" onChange={(e) => setAttachedFile(e.target.files?.[0] || null)} />
                            <button onClick={() => noteFileInputRef.current?.click()} className="text-zinc-400 hover:text-white text-sm bg-white/5 px-4 py-2 rounded-xl">📎 Attach Image</button>
                            <input type="text" value={noteVideoLink} onChange={(e) => setNoteVideoLink(e.target.value)} placeholder="Paste Video URL (YouTube, MP4)..." className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                        </div>
                        <div className="flex justify-end shrink-0 pb-10"><button onClick={handleSaveNote} className="bg-white text-zinc-950 px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-zinc-200">Save Note Permanently</button></div>
                     </div>
                  </div>
                ) : (
                  <div className="flex-1 flex gap-6 h-full">
                     {isSidebarOpen && (
                       <div className="w-1/3 border-r border-white/5 pr-4 flex flex-col shrink-0">
                          <button onClick={() => { const newId = Date.now().toString(); setChatSessions([{id: newId, title: "New Chat...", messages: []}, ...chatSessions]); setActiveSessionId(newId); }} className="w-full bg-white/5 text-white text-xs font-bold py-3 rounded-xl mb-4 hover:bg-white/10">+ New Chat</button>
                          <input type="text" value={chatSearch} onChange={(e) => setChatSearch(e.target.value)} placeholder="Search sessions..." className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mb-4" />
                          <div className="overflow-y-auto space-y-2 custom-scrollbar">
                              {filteredSessions.map(s => (
                                  <div key={s.id} className={`w-full text-left p-3 rounded-xl text-sm flex flex-col group ${activeSessionId === s.id ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-white/[0.02] text-zinc-400 hover:bg-white/5 border border-transparent"}`}>
                                      <div className="flex justify-between items-center w-full">
                                          {editingChatTitleId === s.id ? (
                                              <input type="text" value={newChatTitle} onChange={(e) => setNewChatTitle(e.target.value)} onBlur={() => handleRenameChat(s.id)} onKeyDown={(e) => e.key === 'Enter' && handleRenameChat(s.id)} className="w-full bg-zinc-900 border border-white/20 text-white rounded px-2 py-1 text-xs focus:outline-none" autoFocus />
                                          ) : (
                                              <button onClick={() => setActiveSessionId(s.id)} className="flex-1 text-left truncate pr-2">{s.title}</button>
                                          )}
                                          <button onClick={() => setChatMenuOpen(chatMenuOpen === s.id ? null : s.id)} className="p-1 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">⋮</button>
                                      </div>
                                      
                                      {/* INLINE CSS FIX FOR DROPDOWN */}
                                      {chatMenuOpen === s.id && (
                                          <div className="flex flex-col mt-2 bg-black/50 rounded-lg overflow-hidden text-xs w-full">
                                              <button onClick={() => { setEditingChatTitleId(s.id); setNewChatTitle(s.title); setChatMenuOpen(null); }} className="px-3 py-2 text-left hover:bg-white/5 text-zinc-300 border-b border-white/5">Rename</button>
                                              <button onClick={() => handleBranchChat(s.id)} className="px-3 py-2 text-left hover:bg-white/5 text-zinc-300 border-b border-white/5">Branch</button>
                                              <button onClick={() => handleDeleteChat(s.id)} className="px-3 py-2 text-left hover:bg-white/5 text-red-400">Delete</button>
                                          </div>
                                      )}
                                  </div>
                              ))}
                          </div>
                       </div>
                     )}

                     <div className="flex-1 flex flex-col relative h-full">
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pb-20 pr-2 custom-scrollbar">
                        {activeChatMessages.map((msg: any, idx: number) => (
                            <div key={idx} className={`flex gap-2 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group mb-4`}>
                                {msg.role === 'ai' && ( <button onClick={() => { navigator.clipboard.writeText(msg.content); alert("Copied to clipboard!"); }} className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-white transition-opacity rounded-lg shrink-0 mt-1" title="Copy Result">📄</button> )}
                                <div className={`max-w-[90%] p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-emerald-500/10 text-emerald-100 border border-emerald-500/20 rounded-br-sm' : 'bg-zinc-900 border border-white/10 text-zinc-300 rounded-bl-sm font-mono whitespace-pre-wrap'}`}>{msg.content}</div>
                                {msg.role === 'user' && ( <button onClick={() => setChatInput(msg.content)} className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-white transition-opacity rounded-lg shrink-0 mt-1" title="Edit Prompt">✏️</button> )}
                            </div>
                        ))}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-md pt-2">
                        <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 bg-zinc-900 border border-white/10 p-2 rounded-2xl">
                            <select value={chatMode} onChange={(e) => setChatMode(e.target.value as "fast" | "deep")} className="bg-black/50 border border-white/10 text-zinc-300 text-xs rounded-lg px-2 py-3 focus:outline-none cursor-pointer hidden sm:block shrink-0"><option value="fast">⚡ Fast</option><option value="deep">🧠 Deep</option></select>
                            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Query AI..." className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white px-2 w-full" />
                            <button type="submit" disabled={!chatInput.trim()} className="p-3 bg-white text-zinc-950 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 shrink-0">Send</button>
                        </form>
                        </div>
                     </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
          
          {/* THE MODULAR RIGHT PANEL */}
          {showRightPanel && (
            <div className="space-y-6 flex flex-col col-span-1">
                <div className="bg-white/[0.02] rounded-3xl p-6 border border-white/10 text-center">
                <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Daily Progress</h3>
                <div className="text-6xl font-thin mb-2">{progressPercentage}%</div>
                </div>
                <AiMentor progressPercentage={progressPercentage} />
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-lg w-full shadow-2xl relative my-8">
              <button onClick={() => setIsSettingsOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white">✕</button>
              <h3 className="text-2xl mb-6 font-light">System Settings</h3>
              <div className="space-y-6 mb-8">
                <div className="space-y-4 border-b border-white/5 pb-6">
                  <h4 className="text-sm font-bold text-white mb-2">Identity Matrix</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Agent Name</label>
                      <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Secure Contact</label>
                      <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4 border-b border-white/5 pb-6">
                  <h4 className="text-sm font-bold text-white mb-2">A.I. Configuration</h4>
                  <div>
                    <div className="flex gap-2 p-1 bg-black/50 rounded-xl border border-white/5 mb-4">
                      <button onClick={() => setAiMode("online")} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${aiMode === "online" ? "bg-white/10 text-white" : "text-zinc-500"}`}>Cloud API</button>
                      <button onClick={() => setAiMode("offline")} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${aiMode === "offline" ? "bg-white/10 text-white" : "text-zinc-500"}`}>Local / Offline</button>
                    </div>
                    <textarea value={aiBehavior} onChange={e => setAiBehavior(e.target.value)} placeholder="System Instruction..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 min-h-[100px] text-sm text-white focus:outline-none" />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-between items-center">
                <button onClick={() => signOut()} className="text-red-400 text-sm font-bold">Disconnect</button>
                <button onClick={() => setIsSettingsOpen(false)} className="bg-white text-zinc-950 px-6 py-2 rounded-xl text-sm font-bold hover:bg-zinc-200">Save & Apply</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {zoomedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out" onClick={() => setZoomedImage(null)}>
            <img src={zoomedImage} alt="Zoomed Note" className="max-w-full max-h-full object-contain rounded-xl" />
        </div>
      )}

      <AnimatePresence>
        {proofModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-md w-full">
              <h3 className="text-2xl mb-2">Submit Proof</h3>
              <textarea value={proofText} onChange={(e) => setProofText(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-6 min-h-[100px] text-sm text-white" />
              <div className="flex justify-end gap-3">
                <button onClick={() => setProofModalOpen(false)} className="text-zinc-500 text-sm px-4 hover:text-white">Cancel</button>
                <button onClick={submitProof} className="bg-white text-zinc-950 px-6 py-2 rounded-xl text-sm font-bold">Verify & +20 XP</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}