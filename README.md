# Employee Presence Web App Roadmap

This roadmap outlines the steps to develop a web application for marking employee presence using a webcam. The app will allow employees to check in/out by capturing their photo via webcam and storing the data for attendance tracking.

## 1. Requirements & Planning
- Define user roles: Employee, Admin
- List core features:
  - Employee sign-in/sign-out with webcam photo
  - Admin dashboard for attendance management
  - Secure authentication (e.g., Clerk, Auth.js)
  - Attendance history & reporting
- Choose tech stack (Next.js, Turso/SQLite, Tailwind CSS, Clerk, etc.)

## 2. Database Design
Create three main tables:

### `users` table:
- `id`, `email`, `password`, `role` (user/verification_admin/superadmin)

### `employees` table:
- `id`, `nip`, `nama`, `jabatan`, `pangkat`

### `attendance` table:
- `id`, `nip` (FK to employees), `timestamp`, `photo_url` or `photo_blob`, `status` (present/absent), `verified_by` (FK to users)

**Key Changes:**
- **No user_id FK in employees table** - employees don't need individual login accounts
- **Added verified_by field** in attendance table to track which admin verified the attendance
- **Only 3 user accounts needed:**
  - 1 communal "user" account for employee check-ins
  - 1 "verification_admin" account for verifying attendance
  - 1 "superadmin" account for full system management

**Workflow:**
1. All employees use the same communal login to mark attendance
2. Verification admin reviews and approves attendance records
3. Superadmin manages employees and system settings

## 3. Authentication & Authorization
- Integrate authentication provider (e.g., Clerk)
- Implement role-based access (employee/admin)
- Link authenticated users to employee records

## 4. Frontend Development
- Build sign-in/sign-out page with webcam capture (use `react-webcam` or similar)
- Create dashboard for employees to view their attendance
- Create admin dashboard to view/manage all attendance records and employee data
- Employee management interface for admins
- Style with Tailwind CSS

## 5. Backend/API Development
- Create API routes for:
  - User authentication and session management
  - Employee CRUD operations (admin only)
  - Submitting attendance with photo
  - Fetching attendance records (filtered by role)
  - Admin management endpoints
- Handle image upload (store in DB as BLOB or upload to external storage and save URL)
- Implement proper authorization checks

## 6. Image Handling
- Integrate webcam capture on frontend
- Convert image to suitable format (base64 or blob)
- Store image in database or upload to storage (e.g., S3, Cloudinary)

## 7. Testing
- Unit and integration tests for API and UI
- Manual testing of webcam and image upload
- Test user roles and permissions

## 8. Deployment
- Deploy frontend and backend (Vercel, Netlify, etc.)
- Set up environment variables and production database
- Configure proper CORS and security headers

## 9. Documentation & Training
- Write user/admin guides
- Document API endpoints
- Create employee onboarding documentation

## 10. Future Enhancements
- Add face recognition for verification
- Mobile app support
- Analytics and reporting features
- Shift management and scheduling
- Overtime calculations
- Integration with payroll systems

---

**Tip:** Start with a minimal prototype (MVP) and iterate based