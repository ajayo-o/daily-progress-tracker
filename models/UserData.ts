import mongoose from "mongoose";

const UserDataSchema = new mongoose.Schema({
  // Authentication & Identity
  clerkUserId: { type: String, required: true, unique: true }, 
  password: { type: String }, 
  username: { type: String, default: "Agent" },
  phone: { type: String, default: "" },
  
  // App Preferences & AI
  theme: { type: String, enum: ["dark", "light"], default: "dark" },
  aiMode: { type: String, enum: ["online", "offline"], default: "online" },
  aiBehavior: { 
    type: String, 
    default: "Direct answers only. No conversational filler. Focus on highly optimized code, DSA logic, and technical trading setups." 
  },
  
  // Core Mechanics
  wallet: { type: Number, default: 0 },
  inventory: { type: [String], default: [] },
  tasks: { type: Array, default: [] },
  history: { type: Array, default: [] },
  countdowns: { type: Array, default: [] },
  
  // Vision Board (Images saved as Base64)
  customGoals: { type: Array, default: [] },
  
  // --- NEW: Advanced Terminal Storage ---
  chatSessions: { type: Array, default: [] }, // Stores chat history
  terminalNotes: { type: Array, default: [] }, // Stores complex notes with images
  
  // --- NEW: Syllabus Engine Storage ---
  targetSyllabus: { type: Array, default: [] },
}, { timestamps: true });

export default mongoose.models.UserData || mongoose.model("UserData", UserDataSchema);