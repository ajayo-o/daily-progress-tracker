"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/types";

export default function AiMentor({ progressPercentage }: { progressPercentage: number }) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "init", sender: "ai", text: "System online. $100 daily maximum. Do not skip days." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const typingId = Date.now().toString() + "-ai";
    
    // 1. Add user message
    setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: "user", text: userText }]);
    setChatInput("");
    
    // 2. Add "Analyzing..." placeholder
    setChatMessages(prev => [...prev, { id: typingId, sender: "ai", text: "Analyzing..." }]);

    // 3. Fetch from Groq AI API
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, progress: progressPercentage }),
      });
      const data = await response.json();
      
      // 4. Replace placeholder with actual response
      setChatMessages(prev => prev.map(msg => msg.id === typingId ? { ...msg, text: data.reply } : msg));
    } catch {
      setChatMessages(prev => prev.map(msg => msg.id === typingId ? { ...msg, text: "Connection offline. Focus on the mission." } : msg));
    }
  };

  return (
    <div className="bg-white/[0.02] rounded-3xl p-6 border border-white/10 flex flex-col flex-1 min-h-[350px]">
      <h3 className="mb-4 text-sm tracking-wide border-b border-white/5 pb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse"></span> AI Mentor
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 text-sm custom-scrollbar">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            <div className={`p-3 rounded-2xl max-w-[85%] ${msg.sender === "user" ? "bg-white/10 text-white rounded-br-sm" : "bg-zinc-900 border border-white/5 text-zinc-300 rounded-bl-sm"}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2 relative">
        <input 
          value={chatInput} 
          onChange={(e) => setChatInput(e.target.value)} 
          placeholder="Analyze my code..." 
          className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-white/30 text-white" 
        />
        <button type="submit" className="bg-white text-zinc-950 px-4 rounded-xl font-medium hover:bg-zinc-200 transition-all">
          Send
        </button>
      </form>
    </div>
  );
}