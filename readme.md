# Employee Task Management System

A real-time employee task management tool built with React frontend and Node.js backend.

## Project Structure

```
employee-task-management/
├── backend/
│   ├── config/              # Firebase & Vonage configuration
│   │   ├── firebase.js
│   │   └── vonage.js
│   ├── routes/              # API endpoints
│   │   ├── employee.js      # Employee authentication & management
│   │   └── owner.js         # Owner operations & employee CRUD
│   ├── socket/              # Real-time chat functionality
│   │   └── chatSocket.js
│   ├── utils/               # Backend utilities
│   │   └── emailService.js  # Email notifications
│   ├── server.js            # Express server setup
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/      # React components organized by role
│   │   │   ├── employee/    # Employee-specific components
│   │   │   │   ├── EmployeeDashboard.jsx
│   │   │   │   ├── EmployeeLogin.jsx
│   │   │   │   ├── EmployeeMessages.jsx
│   │   │   │   ├── EmployeeSetup.jsx
│   │   │   │   └── PasswordLoginForm.jsx
│   │   │   ├── owner/       # Owner-specific components
│   │   │   │   ├── EmployeeModal.jsx
│   │   │   │   ├── OwnerDashboard.jsx
│   │   │   │   ├── OwnerLogin.jsx
│   │   │   │   ├── OwnerMessages.jsx
│   │   │   │   └── OwnerTasks.jsx
│   │   │   └── shared/      # Shared components
│   │   ├── layouts/         # Layout components
│   │   │   ├── EmployeeLayout.jsx
│   │   │   └── OwnerLayout.jsx
│   │   ├── styles/          # CSS stylesheets
│   │   │   ├── chat.css
│   │   │   ├── forms.css
│   │   │   └── layout.css
│   │   ├── utils/           # Frontend utilities
│   │   ├── useRouteElements.jsx  # Routing configuration
│   │   └── App.jsx
│   └── vite.config.js       # Vite configuration
└── readme.md
```

## Features

### Owner Role
- Phone number authentication with SMS verification
- Employee management (Create, Read, Update, Delete)
- Task assignment and management
- Real-time chat with employees

### Employee Role  
- Email-based account setup
- Profile management
- Task viewing and status updates
- Real-time chat with owner

## Tech Stack

**Frontend:**
- React.js
- Axios for API calls
- Socket.io-client for real-time features

**Backend:**
- Node.js & Express
- Firebase Firestore (database)
- Vonage (SMS service)
- Socket.io for real-time chat
- NodeMailer for sending email

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- Firebase account
- Vonage-Nexmo account

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (copy from `.env.example`):
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

# Vonage SMS Service
VONAGE_API_KEY=your-vonage-api-key
VONAGE_API_SECRET=your-vonage-api-secret

# Email Service (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=5000
NODE_ENV=development
```

Start backend:
```bash
npm start
# Backend runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
# Frontend runs on http://localhost:5173
```

### 3. Firebase Setup

1. Create Firebase project
2. Enable Firestore database
3. Create service account key
4. Add credentials to `.env` file

### 4. SMS Service Setup (Vonage)

1. Create Vonage account
2. Get API key and secret
3. Add credentials to `.env` file

## How to Run

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application:**
   - Owner Login: http://localhost:5173/
   - Employee Login: http://localhost:5173/employee
   

## API Endpoints

### Owner Routes
- `POST /api/owner/createNewAccessCode` - Generate SMS code
- `POST /api/owner/validateAccessCode` - Validate SMS code
- `POST /api/owner/createEmployee` - Create new employee
- `POST /api/owner/updateEmployee` - Update employee details
- `POST /api/owner/deleteEmployee` - Delete employee
- `GET /api/owner/getAllEmployees` - Get all employees

### Employee Routes
- `POST /api/employee/loginEmail` - Generate email login code
- `POST /api/employee/validateAccessCode` - Validate email code
- `POST /api/employee/loginPassword` - Username/password login
- `POST /api/employee/verifySetupToken/:token` - Verify setup token
- `POST /api/employee/setupAccount` - Setup account credentials
- `POST /api/employee/getProfile` - Get employee profile
- `POST /api/employee/updateProfile` - Update profile details
- `POST /api/employee/getMyTasks` - Get assigned tasks
- `POST /api/employee/updateTaskStatus` - Update task completion status

## Usage

### For Owners:
1. Enter phone number start with +84 format on login page
2. Receive SMS verification code
3. Access employee management dashboard
4. Create, edit, or delete employees
5. Assign tasks and chat with employees

### For Employees:
1. Receive setup email from owner
2. Click setup link to create credentials
3. Login with username/password or send code to email to login
4. View assigned tasks and update status
5. Edit profile and chat with owner

## Screenshots

### Owner Workflow
![Owner Login Screen](screenshots/ower_login_screen.PNG)
![Owner Verify Code](screenshots/owner_verify_code.PNG)
![Owner Dashboard](screenshots/owner_dashboard.PNG)
![Add New Employee](screenshots/add_new_employee.PNG)
![Assign Task](screenshots/assign_task.PNG)
![Owner Chat](screenshots/owner_chat.PNG)

### Employee Workflow
![Employee Account Setup](screenshots/employee_account_setup.PNG)
![Employee Login](screenshots/employee_login.PNG)
![Employee Dashboard](screenshots/employee_dashboard.PNG)
![Employee Message](screenshots/employee_message.PNG)

## Development Notes

- Uses Firebase Firestore for data storage
- Real-time features powered by Socket.io
- SMS verification for owner authentication
- Email notifications for employee setup

## Troubleshooting

**Backend Issues:**
- Check Firebase credentials in `.env`
- Verify SMS service configuration
- Ensure port 5000 is available

**Frontend Issues:**
- Clear browser cache
- Check API endpoint URLs
- Verify backend is running
