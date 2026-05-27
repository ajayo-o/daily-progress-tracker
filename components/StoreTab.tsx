"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function StoreTab({ wallet, inventory, customGoals, onBuyItem, onAddCustomGoal, onDeleteCustomGoal, onEditCustomGoal }: any) {
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalPrice, setNewGoalPrice] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultItems = [
    { id: "car", name: "3D Supercar Render", price: 3000 },
    { id: "setup", name: "Ultimate Dev Setup", price: 5000 },
  ];

  const allItems = [...defaultItems, ...customGoals];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName || !newGoalPrice) return;
    
    let base64String = "";
    if (selectedFile) {
        base64String = await fileToBase64(selectedFile);
    }
    
    if (editingGoalId) {
        onEditCustomGoal({
            id: editingGoalId,
            name: newGoalName,
            price: Number(newGoalPrice),
            image: base64String || customGoals.find((g: any) => g.id === editingGoalId)?.image
        });
    } else {
        onAddCustomGoal({
            id: Date.now().toString(),
            name: newGoalName,
            price: Number(newGoalPrice),
            image: base64String
        });
    }
    
    resetForm();
  };

  const triggerEdit = (goal: any) => {
      setEditingGoalId(goal.id);
      setNewGoalName(goal.name);
      setNewGoalPrice(goal.price.toString());
      setSelectedFile(null);
      // Scroll to top to see the form
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
      setEditingGoalId(null);
      setNewGoalName("");
      setNewGoalPrice("");
      setSelectedFile(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-light">Vision Board Milestones</h2>
        <div className="text-right">
          <div className="text-sm text-zinc-500">Total Accumulated XP</div>
          <div className="text-3xl font-mono text-emerald-400">{wallet} XP</div>
        </div>
      </div>

      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 mb-8 relative">
        {editingGoalId && (
            <button onClick={resetForm} className="absolute top-6 right-6 text-xs text-zinc-500 hover:text-white">Cancel Edit</button>
        )}
        <h3 className="text-lg font-light mb-4">{editingGoalId ? "Edit Milestone" : "Set Custom Milestone"}</h3>
        <form onSubmit={handleSubmit} className="flex gap-3 flex-wrap">
          <input type="text" value={newGoalName} onChange={e => setNewGoalName(e.target.value)} placeholder="Milestone name..." className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" required />
          <input type="number" value={newGoalPrice} onChange={e => setNewGoalPrice(e.target.value)} placeholder="Target XP" className="w-28 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" required />
          
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-zinc-900 border border-white/10 px-4 py-3 rounded-xl text-sm text-zinc-400 hover:text-white">
            {selectedFile ? "Image Attached!" : (editingGoalId ? "Change Image" : "Upload Image")}
          </button>
          
          <button type="submit" className="bg-white text-zinc-950 px-6 py-3 rounded-xl text-sm font-bold hover:bg-zinc-200">
            {editingGoalId ? "Save Changes" : "Add Milestone"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allItems.map((item: any) => {
          const isUnlocked = inventory.includes(item.id);
          const canUnlock = wallet >= item.price;
          const progress = Math.min(100, Math.round((wallet / item.price) * 100));
          const isCustom = customGoals.some((g: any) => g.id === item.id);

          return (
            <div key={item.id} className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {isCustom && (
                <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => triggerEdit(item)} className="text-zinc-500 hover:text-white bg-black/50 p-2 rounded-lg">✏️</button>
                    {!isUnlocked && (
                        <button onClick={() => onDeleteCustomGoal(item.id)} className="text-zinc-500 hover:text-red-400 bg-black/50 p-2 rounded-lg">🗑️</button>
                    )}
                </div>
              )}

              <div className="relative z-10 flex flex-col h-full justify-between mt-2">
                <div>
                  {item.image && <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-xl mb-4 border border-white/5" />}
                  <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                  <div className="text-zinc-500 font-mono text-sm mb-4">Target: {item.price} XP</div>
                </div>
                
                {isUnlocked ? (
                  <div className="w-full bg-emerald-500/20 text-emerald-400 py-3 rounded-xl text-center text-sm font-bold uppercase tracking-widest border border-emerald-500/20">Milestone Unlocked</div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden border border-white/5">
                      <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-xs text-zinc-500 font-mono">
                      <span>{progress}%</span>
                      <span>{Math.max(0, item.price - wallet)} XP remaining</span>
                    </div>
                    <button onClick={() => onBuyItem(item)} disabled={!canUnlock} className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${canUnlock ? "bg-white text-zinc-950 hover:bg-zinc-200" : "bg-white/5 text-zinc-600 cursor-not-allowed"}`}>
                      {canUnlock ? "Claim Milestone" : "XP Locked"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}