import mongoose, { Schema, Document, Model } from 'mongoose';

interface IUserProgress extends Document {
  userId: string;
  xp: number;
  wallet: number;
  inventory: { cars: string[]; watches: string[]; tech: string[] };
  history: { date: string; progress: number; proofs: string[] }[]; // <-- NEW: The Calendar Memory
}

const UserProgressSchema = new Schema<IUserProgress>({
  userId: { type: String, required: true, index: true, unique: true },
  xp: { type: Number, default: 0 },
  wallet: { type: Number, default: 0 },
  inventory: {
    cars: { type: [String], default: [] },
    watches: { type: [String], default: [] },
    tech: { type: [String], default: [] }
  },
  history: [{
    date: String,
    progress: Number,
    proofs: [String]
  }]
}, { timestamps: true });

export default (mongoose.models.UserProgress as Model<IUserProgress>) || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);