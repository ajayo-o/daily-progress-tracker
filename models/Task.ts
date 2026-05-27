import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  text: String,
  completed: Boolean,
  proof: String,
  userId: String, // We'll use this later for authentication
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);