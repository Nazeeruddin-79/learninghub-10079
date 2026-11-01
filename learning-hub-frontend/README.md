# Learning Hub — Frontend

A simple, responsive React + Vite frontend for the Learning Hub project.

## Requirements
- Node.js 18 or newer
- VS Codium (or another code editor)

## Run locally
1. Extract the ZIP.
2. Open the `learning-hub-frontend` folder in VS Codium.
3. Open the integrated terminal.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the URL shown by Vite (normally http://localhost:5173).

## Production build check
Run:

```bash
npm run build
```

Vite creates the production files in `dist/`.

## Demo access
The login screen has a demo mode. Choose Student or Instructor to preview the two dashboards. This is frontend-only demo navigation, NOT real authentication.

## Backend synchronization plan (Level 2)
The frontend API base URL is read from `VITE_API_URL`. Copy `.env.example` to `.env` when the backend is ready.

Expected API contract to implement in Express:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Student registration |
| POST | `/api/auth/login` | Login |
| GET | `/api/courses` | Browse published courses |
| GET | `/api/courses/:id` | Course details |
| POST | `/api/courses/:id/enroll` | Enroll current student |
| GET | `/api/enrollments/me` | Student's enrolled courses |
| GET | `/api/lessons/:id` | Lesson details and authorized video URL |
| PATCH | `/api/progress/:lessonId` | Mark lesson complete |
| GET | `/api/quizzes/:id` | Quiz questions WITHOUT correct answers |
| POST | `/api/quizzes/:id/attempts` | Submit answers; server calculates score |
| GET | `/api/instructor/courses` | Instructor's own courses |
| POST | `/api/instructor/courses` | Create course |
| POST | `/api/instructor/lessons` | Create lesson / attach uploaded video URL |
| POST | `/api/instructor/quizzes` | Create quiz |
| GET | `/api/instructor/students` | Instructor's enrolled students and results |

The backend must enforce authentication, roles, ownership, enrollment access, input validation, and quiz scoring. Never trust frontend role checks for security.

## Checkpoints
### Checkpoint 1 — Frontend
- [ ] `npm install` completes.
- [ ] `npm run dev` opens the app.
- [ ] Student and instructor demo navigation works.
- [ ] All pages load and responsive layouts work.
- [ ] `npm run build` completes successfully.

### Checkpoint 2 — Full application (after Level 2)
- [ ] Real registration/login works.
- [ ] API integration works.
- [ ] Course ownership and enrollment are enforced by backend.
- [ ] Video upload and playback work.
- [ ] Quiz scoring happens only on backend.
- [ ] Progress and results persist in MongoDB.

## Notes
- This first delivery uses local sample data so the UI can be developed independently.
- Video upload and quiz actions are visual/demo interfaces only until backend and storage integration are built.
- No secrets belong in frontend environment variables. `VITE_*` values are public in the browser bundle.
