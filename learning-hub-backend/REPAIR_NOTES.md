# Repair notes

Changes in this package:
- Replaced disk-based lesson video upload with authenticated 1 MiB chunk uploads stored in MongoDB Atlas GridFS.
- Enforced a 30 MiB maximum upload size.
- Added upload-session and upload-chunk MongoDB models with 24-hour TTL cleanup.
- Added GridFS video streaming with HTTP byte-range support.
- Added upload cancellation and cleanup after successful completion.
- Changed lesson ordering behavior to automatically choose the next available order when a requested order already exists, avoiding old duplicate-key collisions.
- Replaced the instructor quiz placeholder with a real quiz creation form connected to the existing quiz API.
- Made frontend API URL configurable using VITE_API_URL.

Important remaining work:
- The student dashboard, student lesson player, student quiz page, instructor dashboard and instructor student-results page still contain demo/mock content and need a separate frontend integration pass. This package is therefore a repair-in-progress, not a fully verified production release.
- Frontend production build could not be completed in this environment because the uploaded node_modules folder is missing the platform-specific Rollup optional dependency. Run npm install in the frontend folder on your Windows machine before building.
- Do not include .env or node_modules when sharing this project. Create your own backend .env from .env.example and keep credentials private.
- GridFS stores new uploads in the MongoDB `videos.files` and `videos.chunks` collections. Existing videos stored on local disk are not migrated automatically.
