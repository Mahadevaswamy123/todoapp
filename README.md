# TaskFlow — React Native To-Do Application

A full-stack mobile task management application for Android built with **React Native CLI (TypeScript)** and a **Node.js + Express + MongoDB** backend.

---

## Key Features

### 1. User Authentication
- **Registration & Login**: Secure account creation and authentication using email and password.
- **Password Security**: Passwords securely hashed with `bcryptjs`.
- **JWT Authentication**: Protected API endpoints with JSON Web Tokens.
- **Session Persistence**: Automatic token persistence using `@react-native-async-storage/async-storage` and Zustand state store.

### 2. Task Management
- **Required Metadata**:
  - **Title**: Required task title.
  - **Description**: Detailed task description or sub-notes.
  - **Date-Time (Scheduled)**: Scheduled date and time picker.
  - **Deadline**: Task due date and deadline timestamp.
  - **Priority**: High (coral), Medium (amber), Low (mint).
  - **Category**: General, Work, Personal, Study, Urgent.
- **Interactive Completion**: 1-tap checkbox with instant optimistic UI update and progress calculation.
- **Custom Delete Confirmation Modal**: In-app styled confirmation dialog displaying task title before permanent removal.
- **Custom Profile & Account Sheet**: User profile popup displaying user name, email, task statistics (total, completed, pending, completion rate %), and one-tap sign-out.

### 3. Date & Time Picker
- **Custom Interactive Modal**: Built with native React Native components (no external native dependency conflicts).
- **Quick Presets**: 1-tap presets (`Today 6 PM`, `Tomorrow 10 AM`, `In 3 Days`, `Next Week`).
- **Calendar Grid**: Month-by-month navigation and day-of-week selection.
- **Time Selection**: 12-hour selector, 15-minute intervals, and AM/PM toggle.

### 4. Organization & Smart Sorting
- **Filters**: Filter tasks by `All`, `Active`, `🔥 High Priority`, and `Done`.
- **Sorting Modes**:
  - `⚡ Smart Mix`: Composite urgency algorithm weighing priority, overdue status, upcoming deadlines (<24h, <3d, <7d), and recency.
  - `⏰ Deadline`: Chronological deadline ordering.
  - `🎯 Priority`: High → Medium → Low.
  - `✦ Newest`: Newly created tasks first.
- **Visual Progress Ring**: Live percentage completion counter and encouragement banner.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Mobile App** | React Native CLI 0.88, TypeScript, React Navigation 7, Zustand, Async Storage |
| **Backend API** | Node.js, Express 5, Mongoose 9, jsonwebtoken, bcryptjs, cors |
| **Database** | MongoDB (Local / Atlas) |

---

## Project Structure

```
todoapp/
├── backend/
│   ├── src/
│   │   ├── config/db.js           # MongoDB connection
│   │   ├── models/User.js         # User model (name, email, passwordHash)
│   │   ├── models/Task.js         # Task model (user, title, description, dateTime, deadline, priority, category, completed)
│   │   ├── routes/authRoutes.js   # Register, Login, Current User
│   │   ├── routes/taskRoutes.js   # CRUD endpoints
│   │   ├── seedDemoTasks.js       # Demo tasks seeder for test@gmail.com
│   │   └── server.js              # Express app entry point
│   ├── .env                       # Environment configuration
│   └── package.json
└── TodoApp/
    ├── src/
    │   ├── api/client.ts          # API client with multi-host fallback (ADB reverse, emulator, LAN)
    │   ├── components/            # TaskCard, DateTimePickerModal, ProfileModal, DeleteConfirmModal, Ui
    │   ├── navigation/            # AppNavigator (Auth / Home / CreateTask)
    │   ├── screens/               # AuthScreen, HomeScreen, CreateTaskScreen
    │   ├── stores/authStore.ts    # Zustand authentication store
    │   └── theme/                 # Dark modern color palette and typography
    ├── android/                   # Native Android project (Gradle 9, SDK 34)
    └── package.json
```

---

## How to Run Locally

### 1. Start MongoDB
Ensure MongoDB is running locally on port `27017` (or provide a cloud MongoDB Atlas URI in `backend/.env`).

```bash
# Check MongoDB status (macOS/Linux)
brew services list
# or on Windows
net start MongoDB
```

### 2. Start the Backend API

```bash
cd backend
npm install
npm run dev
```

The backend starts at `http://localhost:5000` with the health check available at `http://localhost:5000/api/health`.

#### Demo Account & Sample Tasks
To populate realistic sample tasks for video recording and testing:
```bash
node src/seedDemoTasks.js
```
- **Email:** `test@gmail.com`
- **Password:** `Password123`

---

### 3. Run the Mobile App (React Native CLI)

#### Running on a Physical Android Phone via USB:
1. Enable **Developer Options** and turn on **USB Debugging** on your phone.
2. Connect your phone via USB and check the device is detected:
   ```bash
   adb devices
   ```
3. Enable port forwarding so the mobile app can reach the backend and Metro bundler over the USB cable:
   ```bash
   adb reverse tcp:8081 tcp:8081
   adb reverse tcp:5000 tcp:5000
   ```
4. Start Metro bundler:
   ```bash
   cd TodoApp
   npm start
   ```
5. In a second terminal, install and launch the app:
   ```bash
   cd TodoApp
   npx react-native run-android
   ```

#### Running on Android Studio Emulator:
- Launch your emulator from Android Studio Device Manager.
- Run `npm start` in `TodoApp` and `npx react-native run-android`.
- The API client automatically connects to `http://10.0.2.2:5000/api`.

---

## How to Build the APK (For Form Submission)

### 1. Build Standalone Release APK

Run Gradle assemble from the `android/` directory:

```powershell
cd TodoApp/android
.\gradlew.bat assembleRelease
```
*(On macOS / Linux use `./gradlew assembleRelease`)*

### 2. APK Location

Once built, the standalone APK file ready to attach to your form is located at:

```
TodoApp/android/app/build/outputs/apk/release/app-release.apk
```

> **Note:** A debug APK is also generated at:
> `TodoApp/android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Installing the APK directly onto a Phone via ADB:

```bash
adb install -r TodoApp/android/app/build/outputs/apk/release/app-release.apk
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Log in and receive JWT token |
| `GET` | `/api/tasks` | Yes | Get all tasks for authenticated user |
| `POST` | `/api/tasks` | Yes | Create a new task |
| `PATCH` | `/api/tasks/:id` | Yes | Update task or toggle completion status |
| `DELETE` | `/api/tasks/:id` | Yes | Permanently delete a task |
| `GET` | `/api/health` | No | Backend health check |


Option A: Launch directly on your phone (Recommended)
Since the app is already installed on your device:

Ensure your backend is running (cd backend && npm run dev).
Run port forwarding so the app can reach the backend over USB:
bash
adb reverse tcp:5000 tcp:5000
Tap the TodoApp icon on your phone screen. Everything (tasks, date picker, profile, signout) will work standalone.