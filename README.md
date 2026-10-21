# TaskFlow — React Native To-Do App with Authentication

A full-stack task management application for Android built with React Native CLI (TypeScript) and a Node.js + Express + MongoDB backend.

---

## Features

### 1. User Authentication
- User registration and login using email and password.
- Passwords hashed using bcrypt.
- JWT-based authentication for all task endpoints.
- Persistent login state using `@react-native-async-storage/async-storage` and Zustand.

### 2. Task Management
- **Add tasks with full metadata**:
  - **Title**: Required task title.
  - **Description**: Detailed description / notes.
  - **Date-Time**: Scheduled date and time (`YYYY-MM-DD` or `YYYY-MM-DD HH:mm`).
  - **Deadline**: Due date and deadline timestamp.
  - **Priority**: Low, Medium, High.
- **Mark as completed**: Interactive checkbox with immediate UI update.
- **Delete tasks**: Confirmation dialog before permanently removing.
- **Task list & status**: Categorized view with progress ring showing completion rate.

### 3. Bonus Features
- **Smart Urgency Mix Algorithm**: Sorts tasks using a weighted formula combining priority level, deadline proximity (overdue, <24h, <3d, <7d), and creation time.
- **Filtering**: Filter tasks by All, Active, High Priority, and Completed.
- **Sorting**: Switch between Smart Mix, Deadline, Priority, and Newest.
- **Categories / Tags**: Organize tasks under General, Work, Personal, Study, or Urgent.
- **Custom UI**: Dark modern theme with responsive animations and overdue indicators.

---

## Tech Stack

- **Frontend**: React Native CLI 0.88, TypeScript, React Navigation 7, Zustand, Async Storage
- **Backend**: Node.js, Express 5, MongoDB, Mongoose 9, jsonwebtoken, bcryptjs, cors

---

## Setup & Running

### 1. Backend

```bash
cd backend
npm install
```

Configure `.env`:
```env
PORT=5000
MONGODB_URI="mongodb://127.0.0.1:27017/taskflow"
JWT_SECRET="replace-this-with-a-long-random-secret-at-least-32-characters"
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=*
```

Start server:
```bash
npm run dev
```

### 2. Frontend (TodoApp)

```bash
cd TodoApp
npm install
```

Start Metro:
```bash
npm start
```

Run on Android:
```bash
npm run android
```

> **Network Note**:
> On the Android emulator, API calls connect to host machine via `http://10.0.2.2:5000/api`.
> For physical phones on the same Wi-Fi, update `API_BASE_URL` in `TodoApp/src/api/client.ts` to your machine's local IP.

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new account |
| POST | `/api/auth/login` | No | Log in and receive JWT |
| GET | `/api/tasks` | Yes | Get current user's tasks |
| POST | `/api/tasks` | Yes | Create new task |
| PATCH | `/api/tasks/:id` | Yes | Update task or toggle completion |
| DELETE | `/api/tasks/:id` | Yes | Delete task |
