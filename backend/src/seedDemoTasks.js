import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Task from './models/Task.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const user = await User.findOne({ email: 'test@gmail.com' });
  if (!user) {
    console.error('User test@gmail.com not found!');
    process.exit(1);
  }

  console.log(`Found user: ${user.name} (${user._id})`);

  // Clear existing demo tasks for clean video presentation
  await Task.deleteMany({ user: user._id });

  const now = new Date();
  
  const sampleTasks = [
    {
      user: user._id,
      title: 'Prepare React Native Mobile Demo Video',
      description: 'Record smooth walkthrough showing user login, task filtering, date picker, and MongoDB sync.',
      dateTime: new Date(now.getTime() + 1000 * 60 * 60 * 2), // in 2 hours
      deadline: new Date(now.getTime() + 1000 * 60 * 60 * 5), // in 5 hours
      priority: 'high',
      category: 'Urgent',
      completed: false,
    },
    {
      user: user._id,
      title: 'Finalize Q4 Product Roadmap & Architecture',
      description: 'Review microservice boundaries, API latency metrics, and write technical specifications.',
      dateTime: new Date(now.getTime() + 1000 * 60 * 60 * 24), // tomorrow
      deadline: new Date(now.getTime() + 1000 * 60 * 60 * 48), // in 2 days
      priority: 'high',
      category: 'Work',
      completed: false,
    },
    {
      user: user._id,
      title: 'Team Sprint Sync & Design Review',
      description: 'Present the updated mobile app UI components, date-time selector modal, and responsive layouts.',
      dateTime: new Date(now.getTime() + 1000 * 60 * 60 * 4),
      deadline: new Date(now.getTime() + 1000 * 60 * 60 * 6),
      priority: 'medium',
      category: 'Work',
      completed: false,
    },
    {
      user: user._id,
      title: 'Study System Design: Scalable Event Driven Systems',
      description: 'Read chapters on Kafka partitioning, idempotency keys, and consumer group rebalancing.',
      dateTime: new Date(now.getTime() + 1000 * 60 * 60 * 72),
      deadline: new Date(now.getTime() + 1000 * 60 * 60 * 96),
      priority: 'medium',
      category: 'Study',
      completed: false,
    },
    {
      user: user._id,
      title: 'Weekly Grocery & Health Essentials',
      description: 'Stock up on fresh fruits, almond milk, coffee beans, and vitamins.',
      dateTime: new Date(now.getTime() + 1000 * 60 * 60 * 36),
      deadline: new Date(now.getTime() + 1000 * 60 * 60 * 40),
      priority: 'low',
      category: 'Personal',
      completed: false,
    },
    {
      user: user._id,
      title: 'Setup Android Environment & Local Reverse Proxy',
      description: 'Configure adb reverse ports 8081 & 5000, verify cleartext traffic and Gradle 9 compilation.',
      dateTime: new Date(now.getTime() - 1000 * 60 * 60 * 3),
      deadline: new Date(now.getTime() - 1000 * 60 * 60 * 1),
      priority: 'high',
      category: 'Work',
      completed: true,
    },
  ];

  await Task.insertMany(sampleTasks);
  console.log(`Successfully seeded ${sampleTasks.length} demo tasks for ${user.email}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
