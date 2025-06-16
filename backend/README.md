# Insight Pulse Backend API

A Node.js Express backend for the Insight Pulse Admin Dashboard application.

## Features

- **Authentication**: Session-based authentication with secure login/logout
- **User Management**: CRUD operations for users with role-based access
- **Department Management**: Manage organizational departments
- **Permissions System**: Control survey permissions between departments
- **Survey System**: Handle survey creation, submission, and reporting
- **Dashboard Analytics**: Provide statistics and metrics for the admin dashboard

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Database
- **bcryptjs** - Password hashing
- **express-session** - Session management
- **express-validator** - Input validation
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
npm run init-db
```

5. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /login` - User login
- `POST /logout` - User logout  
- `GET /verify_auth` - Verify authentication status

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create new department (Admin only)

### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Permissions
- `GET /api/permissions` - Get survey permissions
- `POST /api/permissions` - Update permissions (Admin only)
- `POST /api/permissions/mail-alert` - Send permission alerts (Admin only)

### Surveys
- `GET /api/surveys` - Get available surveys
- `GET /api/surveys/:id` - Get specific survey
- `POST /api/submit-survey` - Submit survey response

### Dashboard
- `GET /api/dashboard/overall-stats` - Get dashboard statistics
- `GET /api/dashboard/department-metrics` - Get department metrics
- `GET /api/user-submissions` - Get user's survey submissions

## Default Users

The system creates a default admin user:
- **Username**: `admin`
- **Password**: `password`
- **Role**: `Admin`

Sample users are also created for testing purposes.

## Security Features

- Password hashing with bcryptjs
- Session-based authentication
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention
- Security headers with Helmet

## Database Schema

The application uses SQLite with the following main tables:
- `users` - User accounts and profiles
- `departments` - Organizational departments
- `permissions` - Survey permissions between departments
- `surveys` - Survey definitions
- `survey_questions` - Survey questions
- `survey_submissions` - Survey responses

## Development

For development with auto-reload:
```bash
npm run dev
```

For production:
```bash
npm start
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `DB_PATH` - Database file path
- `JWT_SECRET` - JWT signing secret
- `SESSION_SECRET` - Session signing secret
- `FRONTEND_URL` - Frontend URL for CORS

## License

MIT License