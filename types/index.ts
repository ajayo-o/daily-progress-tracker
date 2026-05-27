export interface Task { 
  id: string; 
  text: string; 
  completed: boolean; 
  proof?: string; 
}

export interface ChatMessage { 
  id: string; 
  sender: "user" | "ai"; 
  text: string; 
}

export interface StoreItem {
  id: string;
  name: string;
  price: number;
  image: string;
  desc: string;
  isCustom?: boolean;
}

export interface HistoryEntry {
  date: string;
  earned: number;
  proofs: {
    taskName: string;
    proofText: string;
  }[];
}

export interface CountdownEvent {
  id: string;
  title: string;
  targetDate: string; // YYYY-MM-DD
}