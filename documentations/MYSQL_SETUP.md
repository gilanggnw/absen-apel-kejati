# MySQL Database Setup Guide

This project now supports both Turso (SQLite) and MySQL databases. You can easily switch between them using environment variables.

## Prerequisites

1. **Install MySQL Server** on your local machine:
   - Download from [MySQL Official Website](https://dev.mysql.com/downloads/)
   - Or use a package manager:
     - Windows: `winget install Oracle.MySQL`
     - macOS: `brew install mysql`
     - Ubuntu: `sudo apt install mysql-server`

2. **Start MySQL Service**:
   - Windows: Start MySQL service from Services app
   - macOS: `brew services start mysql`
   - Ubuntu: `sudo systemctl start mysql`

## Setup Instructions

### 1. Create Database

Connect to MySQL and create the database:

```sql
CREATE DATABASE absen_apel_kejati CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the MySQL configuration:

```env
# Database Selection
USE_MYSQL=true

# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_actual_mysql_password
MYSQL_DATABASE=absen_apel_kejati
```

### 3. Generate and Run Migrations

```bash
# Generate MySQL migrations
npm run db:generate:mysql

# Run migrations to create tables
npm run db:migrate:mysql
```

### 4. Seed the Database

```bash
# Seed with initial data
npm run seed:mysql
```

### 5. Start Development Server

```bash
npm run dev
```

## Available Scripts

### MySQL-specific Scripts:
- `npm run db:generate:mysql` - Generate migrations for MySQL
- `npm run db:migrate:mysql` - Run MySQL migrations
- `npm run db:studio:mysql` - Open Drizzle Studio for MySQL
- `npm run db:push:mysql` - Push schema changes directly to MySQL
- `npm run seed:mysql` - Seed MySQL database with initial data

### Turso Scripts (unchanged):
- `npm run db:generate` - Generate migrations for Turso
- `npm run db:migrate` - Run Turso migrations
- `npm run db:studio` - Open Drizzle Studio for Turso
- `npm run seed` - Seed Turso database

## Switching Between Databases

To switch between MySQL and Turso:

1. **Use MySQL**: Set `USE_MYSQL=true` in your `.env` file
2. **Use Turso**: Set `USE_MYSQL=false` or remove the variable from `.env`

## Database Schema

The MySQL schema includes the same tables as Turso but uses MySQL-specific data types:

- **Users Table**: For authentication (NextAuth.js compatible)
- **Employees Table**: Employee information with photos stored as LONGTEXT (base64)
- **Attendance Table**: Attendance records with photos
- **Accounts/Sessions Tables**: NextAuth.js required tables

## Development Notes

1. **Photo Storage**: Photos are stored as base64 encoded LONGTEXT in MySQL (vs BLOB in SQLite)
2. **Data Types**: Appropriate MySQL data types are used (VARCHAR, INT, BIGINT, TIMESTAMP)
3. **Connection Pooling**: MySQL connection uses connection pooling for better performance
4. **Auto-increment**: Uses MySQL auto-increment for primary keys

## Troubleshooting

### Connection Issues:
1. Verify MySQL service is running
2. Check credentials in `.env` file
3. Ensure database exists
4. Check firewall settings

### Migration Issues:
1. Make sure database is empty for first migration
2. Run `npm run db:push:mysql` to sync schema directly
3. Check MySQL logs for detailed error messages

### Performance:
- Connection pooling is configured with 10 concurrent connections
- Adjust pool settings in `db/mysql.ts` if needed

## Production Deployment

For production, update the MySQL configuration:

```env
MYSQL_HOST=your-production-mysql-host
MYSQL_PORT=3306
MYSQL_USER=your-production-user
MYSQL_PASSWORD=your-secure-password
MYSQL_DATABASE=absen_apel_kejati
```

Consider using:
- MySQL 8.0+ for better performance
- Connection pooling optimization
- SSL connections for security
- Database backup strategies
