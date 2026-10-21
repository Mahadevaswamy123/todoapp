import { Router } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();
router.use(requireAuth);

function parseDateInput(val) {
  if (val === null || val === '') return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? 'INVALID' : d;
}

function validateTaskInput(body, partial = false) {
  const data = {};

  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 120) {
      return { error: 'Title is required (1–120 characters).' };
    }
    data.title = body.title.trim();
  }

  const rawDesc = body.description !== undefined ? body.description : body.notes;
  if (rawDesc !== undefined) {
    if (typeof rawDesc !== 'string' || rawDesc.length > 1000) {
      return { error: 'Description must be at most 1000 characters.' };
    }
    data.description = rawDesc.trim();
  } else if (!partial) {
    data.description = '';
  }

  // Parse task date-time
  const rawDateTime = body.dateTime !== undefined ? body.dateTime : body['date-time'];
  if (rawDateTime !== undefined) {
    const parsed = parseDateInput(rawDateTime);
    if (parsed === 'INVALID') return { error: 'Date-time must be a valid date string.' };
    data.dateTime = parsed;
  } else if (!partial) {
    data.dateTime = null;
  }

  // Parse deadline
  const rawDeadline = body.deadline !== undefined ? body.deadline : body.dueDate;
  if (rawDeadline !== undefined) {
    const parsed = parseDateInput(rawDeadline);
    if (parsed === 'INVALID') return { error: 'Deadline must be a valid date string.' };
    data.deadline = parsed;
  } else if (!partial) {
    data.deadline = null;
  }

  if (body.priority !== undefined) {
    if (!['low', 'medium', 'high'].includes(body.priority)) {
      return { error: 'Priority must be low, medium, or high.' };
    }
    data.priority = body.priority;
  } else if (!partial) {
    data.priority = 'medium';
  }

  if (body.category !== undefined) {
    const allowed = ['General', 'Work', 'Personal', 'Study', 'Urgent'];
    if (!allowed.includes(body.category)) {
      return { error: `Category must be one of: ${allowed.join(', ')}` };
    }
    data.category = body.category;
  } else if (!partial) {
    data.category = 'General';
  }

  if (body.completed !== undefined) {
    if (typeof body.completed !== 'boolean') return { error: 'Completed must be true or false.' };
    data.completed = body.completed;
  }

  return { data };
}

function formatTask(task) {
  const desc = task.description || task.notes || '';
  const dead = task.deadline || task.dueDate || null;
  return {
    ...task,
    id: task._id.toString(),
    _id: undefined,
    user: undefined,
    title: task.title,
    description: desc,
    notes: desc,
    dateTime: task.dateTime || null,
    deadline: dead,
    dueDate: dead,
    priority: task.priority || 'medium',
    category: task.category || 'General',
    completed: Boolean(task.completed),
  };
}

// GET /api/tasks - list authenticated user's tasks
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.userId })
      .sort({ completed: 1, createdAt: -1 })
      .lean();
    res.json({ tasks: tasks.map(formatTask) });
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks - create new task
router.post('/', async (req, res, next) => {
  try {
    const { data, error } = validateTaskInput(req.body);
    if (error) return res.status(400).json({ message: error });

    const task = await Task.create({ ...data, user: req.userId });
    res.status(201).json({ task: formatTask(task.toObject()) });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/tasks/:id - update existing task
router.patch('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task id.' });
    }

    const { data, error } = validateTaskInput(req.body, true);
    if (error) return res.status(400).json({ message: error });
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Provide at least one field to update.' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ task: formatTask(task) });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id - delete task
router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task id.' });
    }

    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task deleted.' });
  } catch (error) {
    next(error);
  }
});

export default router;
