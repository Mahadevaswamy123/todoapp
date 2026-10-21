import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  dateTime: { type: Date, default: null },
  deadline: { type: Date, default: null },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  category: { type: String, enum: ['General', 'Work', 'Personal', 'Study', 'Urgent'], default: 'General' },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

taskSchema.index({ user: 1, completed: 1, createdAt: -1 });

export default mongoose.model('Task', taskSchema);
