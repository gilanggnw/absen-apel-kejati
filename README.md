# Employee Presence Web App

A web application for marking employee presence using webcam photo capture. Built with Next.js, featuring role-based access control and dual database support (SQLite/MySQL).

## Features

- **Employee Attendance**: Webcam photo capture for check-in/check-out
- **Admin Dashboard**: Attendance management and verification
- **Employee Management**: CRUD operations for employee data
- **Role-based Access**: User, Verification Admin, and Super Admin roles
- **Dual Database Support**: SQLite (development) and MySQL (production)
- **Responsive Design**: Built with Tailwind CSS

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (version 18.0 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

For MySQL setup (optional for production):
- [MySQL](https://dev.mysql.com/downloads/mysql/) (version 8.0 or higher)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/gilanggnw/absen-apel-kejati.git
cd absen-apel-kejati
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory and add the following variables:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# Database Configuration (SQLite - Default for development)
DATABASE_URL=file:./sqlite.db

# For MySQL (uncomment and configure if using MySQL)
# DATABASE_URL=mysql://username:password@localhost:3306/absen_kejati
# MYSQL_HOST=localhost
# MYSQL_PORT=3306
# MYSQL_USER=your_mysql_user
# MYSQL_PASSWORD=your_mysql_password
# MYSQL_DATABASE=absen_kejati

# Storage Configuration (optional)
STORAGE_PATH=./public
```

### 4. Database Setup

#### Option A: SQLite (Recommended for development)

Generate and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

Seed the database with initial data:

```bash
npm run db:seed
```

#### Option B: MySQL Setup (For production)

1. Create a MySQL database named `absen_kejati`
2. Update your `.env.local` with MySQL credentials
3. Generate and run MySQL migrations:

```bash
npm run db:generate:mysql
npm run db:migrate:mysql
```

4. Seed the MySQL database:

```bash
npm run db:seed:mysql
```

For detailed MySQL setup instructions, see [MYSQL_SETUP.md](./documentations/MYSQL_SETUP.md).

### 5. Setup Admin User

Create the initial admin user:

```bash
npm run setup:admin
```

This will create three default user accounts:
- **User**: `user@kejati.go.id` (password: `user123`)
- **Verification Admin**: `admin@kejati.go.id` (password: `admin123`)
- **Super Admin**: `superadmin@kejati.go.id` (password: `super123`)

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate SQLite migrations
- `npm run db:migrate` - Run SQLite migrations
- `npm run db:seed` - Seed SQLite database
- `npm run db:generate:mysql` - Generate MySQL migrations
- `npm run db:migrate:mysql` - Run MySQL migrations
- `npm run db:seed:mysql` - Seed MySQL database
- `npm run setup:admin` - Setup admin users

## Database Schema

### Users Table
- `id`, `email`, `password`, `role` (user/verification_admin/superadmin)

### Employees Table
- `id`, `nip`, `nama`, `jabatan`, `pangkat`

### Attendance Table
- `id`, `nip` (FK to employees), `timestamp`, `photo_url`, `status`, `verified_by` (FK to users)

## User Roles

1. **User**: Can mark attendance for all employees using communal login
2. **Verification Admin**: Can verify and manage attendance records
3. **Super Admin**: Full system access including employee management

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Ensure your `.env.local` file is properly configured
   - For MySQL, verify the database exists and credentials are correct

2. **Migration Errors**:
   - Delete the `migrations` folder and regenerate: `npm run db:generate`
   - For MySQL issues, check [MYSQL_SETUP.md](./documentations/MYSQL_SETUP.md)

3. **Port Already in Use**:
   - Change the port: `npm run dev -- -p 3001`

### Getting Help

If you encounter issues:

1. Check the [documentation](./documentations/) folder for detailed guides
2. Ensure all prerequisites are installed
3. Verify environment variables are correctly set
4. Check the console for specific error messages

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.