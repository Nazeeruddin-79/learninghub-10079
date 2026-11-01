# Learning Hub Backend

A REST API designed for the Learning Hub React + Vite frontend.

## Stack
Node.js 20+, Express 4, MongoDB Atlas/Mongoose, JWT, bcryptjs, Zod validation, Multer video uploads, Helmet, CORS and rate limiting.

## Setup (PowerShell)
From the `learning-hub-backend` folder:

```powershell
npm install
Copy-Item .env.example .env
```

Open `.env` in VS Codium and fill in `MONGODB_URI` (your MongoDB Atlas connection string), `JWT_SECRET` (at least 32 random characters), and `CLIENT_ORIGIN=http://localhost:5173`. Keep `.env` private and never send it to anyone.

### MongoDB Atlas
Create a cluster and database user, allow your development IP under Network Access, copy the Node.js connection string, and replace its placeholders in `.env`.

### Run
```powershell
npm run dev
```
API default: `http://localhost:5000`. Check `GET http://localhost:5000/api/health`.

### Create an instructor account
Public registration creates students only. Create instructors from this backend terminal:
```powershell
npm run create-instructor -- "Instructor Name" instructor@example.com "Use-A-Strong-Password!"
```
Use that email/password in the frontend instructor login after integration. The old Level 1 demo credentials are not backend accounts.

## Authentication
`POST /api/auth/register` body: `{ "name":"Jamie Student", "email":"jamie@example.com", "password":"StrongPass123" }`
`POST /api/auth/login` body: `{ "email":"jamie@example.com", "password":"StrongPass123", "role":"student" }`
`role` is optional; if supplied it must match the account. Both return `{success, token, user}`. Send `Authorization: Bearer TOKEN` on protected requests. Passwords are bcrypt-hashed. Logout on the current JWT setup means removing the token from the frontend; token revocation/refresh-token rotation can be added later.

## API route map
All paths below are prefixed by `/api`.

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | API status |
| POST | `/auth/register` | Public | Register student |
| POST | `/auth/login` | Public | Student/instructor login |
| GET | `/auth/me` | Signed in | Current user |
| GET | `/courses` | Public | Browse published courses; optional `search`, `category`, `level` |
| GET | `/courses/:courseId` | Public | Course detail and lesson list |
| GET | `/courses/mine` | Instructor | Own courses with counts |
| POST | `/courses` | Instructor | Create course |
| PATCH | `/courses/:courseId` | Course owner | Update own course |
| DELETE | `/courses/:courseId` | Course owner | Delete course and related records |
| POST | `/courses/:courseId/enroll` | Student | Enroll in published course |
| POST | `/lessons/course/:courseId` | Course owner | Add lesson; optional multipart video |
| GET | `/lessons/:lessonId` | Signed in | Lesson metadata |
| GET | `/lessons/:lessonId/video` | Preview, enrolled student, or owner | Authorized video stream |
| PATCH | `/lessons/:lessonId` | Course owner | Update lesson/replace video |
| DELETE | `/lessons/:lessonId` | Course owner | Delete lesson |
| POST | `/lessons/:lessonId/complete` | Enrolled student | Mark lesson complete |
| POST | `/quizzes/course/:courseId` | Course owner | Create quiz |
| GET | `/quizzes/mine` | Instructor | Own quizzes |
| PATCH | `/quizzes/:quizId` | Quiz owner | Update quiz |
| DELETE | `/quizzes/:quizId` | Quiz owner | Delete quiz and attempts |
| GET | `/quizzes/:quizId` | Enrolled student | Quiz questions without answers |
| POST | `/quizzes/:quizId/submit` | Enrolled student | Backend scoring |
| GET | `/quizzes/attempts/mine` | Student | Own quiz attempts |
| GET | `/student/dashboard` | Student | Dashboard summary |
| GET | `/student/courses` | Student | Enrolled courses/progress |
| GET | `/student/courses/:courseId/lessons` | Enrolled student | Lessons and completion |
| GET | `/student/progress` | Student | Own lesson progress and attempts |
| GET | `/instructor/dashboard` | Instructor | Instructor statistics |
| GET | `/instructor/students` | Instructor | Students in own courses and quiz results |

### Course creation body
```json
{"title":"JavaScript Foundations","description":"Learn JavaScript from the ground up.","category":"Development","level":"Beginner","thumbnail":"","status":"draft"}
```
Publish by setting `status` to `published`.

### Lesson upload
Send `multipart/form-data` to `/lessons/course/:courseId` with a `video` file field (optional) and text fields `title`, `order`, `description`, `durationMinutes`, `videoUrl`, `isPreview`. Supported MIME types: MP4, WebM, QuickTime/MOV, Matroska/MKV. Default maximum is 500 MB (`MAX_VIDEO_SIZE_MB`). Files are stored under `uploads/videos`, not in MongoDB. The API supports HTTP byte ranges for seeking. For production, move videos to persistent object storage; local app filesystems may be temporary.

### Quiz creation body
```json
{
 "title":"JavaScript Basics","description":"Knowledge check","timeLimitMinutes":15,"passingScore":60,
 "questions":[{"prompt":"Which keyword declares a block-scoped variable?","options":["var","let","print","echo"],"correctOptionIndex":1,"points":1}]
}
```
Quiz student responses omit `correctOptionIndex`; submission body is `{"answers":[{"questionId":"QUESTION_SUBDOCUMENT_ID","selectedOptionIndex":1}]}`. Scoring is performed server-side.

## Database models
The seven planned models are `User`, `Course`, `Lesson`, `Enrollment`, `Quiz`, `QuizAttempt`, and `LessonProgress`.

## Frontend integration plan
The frontend currently uses demo/local data. Integration is the next separate checkpoint:
1. Add a frontend API service with base URL `http://localhost:5000/api`.
2. Replace demo register/login with `/auth/register` and `/auth/login`.
3. Store the returned token and attach `Authorization: Bearer <token>` to protected requests.
4. Replace mock course, lesson, quiz, enrollment and progress data with the matching routes.
5. Use each lesson's `videoStreamUrl` for uploaded videos. Note: a native `<video>` element cannot add an Authorization header. Before using protected uploaded-video streaming from the browser, implement a short-lived signed video URL or fetch the video with the bearer token and create a blob URL. Do not make uploads public just to bypass authorization.
6. Connect and test one feature group at a time: authentication, courses/enrollment, lessons/video, then quizzes/progress.

## Production checklist
Use HTTPS, strong secrets, exact production CORS origins, MongoDB backups, persistent video storage, upload-size limits, and automated integration tests. Consider refresh-token rotation and revocation before a public production launch.
