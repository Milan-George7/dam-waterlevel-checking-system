# Dam Water Level Monitoring System

A comprehensive web-based system built with the MERN stack (MongoDB, Express.js, React.js, Node.js) for Dam Operators to record and monitor daily water levels with real-time alerts.

## 🌟 Features

### Authentication & Security
- Secure login system with email and password
- Role-based access control (Admin & Operator)
- JWT token-based authentication
- Password hashing with bcrypt

### Admin Module
- **Operator Management**
  - Add, view, edit, and delete operators
  - Email validation (must contain @)
  - Phone number validation (max 10 digits)
  - No self-registration for operators

- **Dashboard**
  - View statistics (total operators, records, alerts)
  - Monitor water level history
  - Real-time alert notifications
  - Visual charts for water level trends

- **Settings**
  - Set critical water level threshold (default: 90 meters)
  - Automatic alert triggering when threshold exceeded

### Operator Module
- **Water Level Management**
  - Add, view, edit, and delete daily water level records
  - Date and time tracking
  - Optional notes for each entry
  - Automatic alert generation when level exceeds threshold

- **Dashboard**
  - View personal statistics
  - Search and filter records
  - Real-time threshold monitoring

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (local with MongoDB Compass)
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **CSS3** - Styling

## 📋 Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
3. **MongoDB Compass** (Optional but recommended) - [Download](https://www.mongodb.com/try/download/compass)

## 🚀 Installation & Setup

### 1. Install MongoDB

1. Download and install MongoDB Community Server
2. Start MongoDB service:
   ```powershell
   # Windows (Run as Administrator)
   net start MongoDB
   ```

3. Verify MongoDB is running:
   ```powershell
   mongosh
   ```

### 2. Clone/Setup Project

The project is already in your directory: `c:\Users\Dell\OneDrive\Desktop\new`

### 3. Install Dependencies

```powershell
# Install all dependencies (backend + frontend)
npm run install-all
```

Or install separately:

```powershell
# Install backend dependencies
Set-Location "c:\Users\Dell\OneDrive\Desktop\new\backend"; npm install

# Install frontend dependencies
Set-Location "c:\Users\Dell\OneDrive\Desktop\new\frontend"; npm install
```

### 4. Create Admin User

```powershell
# Run the seed script to create default admin
npm run seed-admin
```

This will create the default admin account:
- **Email:** admin@mail123
- **Password:** admin1

### 5. Start the Application

You need to run both backend and frontend servers:

**Terminal 1 - Backend:**
```powershell
Set-Location "c:\Users\Dell\OneDrive\Desktop\new\backend"
npm start
```
Backend will run on: http://localhost:5000

**Terminal 2 - Frontend:**
```powershell
Set-Location "c:\Users\Dell\OneDrive\Desktop\new\frontend"
npm start
```
Frontend will run on: http://localhost:3000

## 🔐 Default Credentials

### Admin Account
- **Email:** admin@mail123
- **Password:** admin1

### Operator Accounts
Operators can only be created by the Admin through the Operator Management interface.

## 📱 Usage Guide

### For Admin:

1. **Login** with admin credentials
2. **Add Operators:**
   - Navigate to "Operators" section
   - Click "Add Operator"
   - Fill in email, password, and phone number
   - Submit the form

3. **Set Critical Threshold:**
   - Go to "Settings"
   - Update the critical water level threshold
   - Save changes

4. **Monitor Water Levels:**
   - View "Water Levels" section
   - Check alerts and trends
   - Filter by status (All/Alerts/Safe)

### For Operators:

1. **Login** with operator credentials (provided by admin)
2. **Add Water Level Record:**
   - Click "Add Record"
   - Enter water level in meters
   - Select date and time
   - Add optional notes
   - Submit

3. **Manage Records:**
   - View all your records
   - Edit existing entries
   - Delete records if needed
   - Search and filter data

4. **Monitor Alerts:**
   - System automatically alerts when level exceeds threshold
   - View alert status in the dashboard

## 🗄️ Database Structure

### Collections:

1. **users**
   - email (unique)
   - password (hashed)
   - phoneNumber
   - role (admin/operator)
   - createdAt

2. **waterlevels**
   - level (number)
   - date
   - recordedBy (reference to user)
   - notes
   - isAlert (boolean)
   - createdAt
   - updatedAt

3. **settings**
   - criticalThreshold
   - updatedBy
   - updatedAt

## 🔧 Configuration

### Backend Configuration (.env)
Located at: `backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dam_monitoring
JWT_SECRET=dam_monitoring_secret_key_2024
NODE_ENV=development
```

### Frontend Configuration
The frontend is configured to proxy API requests to `http://localhost:5000`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Operators (Admin Only)
- `GET /api/operators` - Get all operators
- `POST /api/operators` - Add operator
- `PUT /api/operators/:id` - Update operator
- `DELETE /api/operators/:id` - Delete operator

### Water Levels
- `GET /api/water-levels` - Get all records
- `POST /api/water-levels` - Add record
- `PUT /api/water-levels/:id` - Update record
- `DELETE /api/water-levels/:id` - Delete record
- `GET /api/water-levels/alerts` - Get alert records

### Settings (Admin Only)
- `GET /api/settings` - Get settings
- `PUT /api/settings/threshold` - Update threshold

## ✅ Validation Rules

### Email
- Must contain @ symbol
- Unique across all users

### Password
- Minimum 4 characters
- Hashed before storage

### Phone Number
- Maximum 10 digits
- Only numeric characters

### Water Level
- Cannot be negative
- Decimal values allowed

## 🎨 Features Highlights

- ✅ Responsive design for all devices
- ✅ Real-time alert notifications
- ✅ Data visualization with charts
- ✅ Search and filter functionality
- ✅ Sortable tables
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Success/Error messages
- ✅ Modal dialogs
- ✅ Role-based routing

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB service is running
```powershell
net start MongoDB
```

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution:** Kill the process or change port in `.env` file

### Cannot Find Module
```
Error: Cannot find module 'express'
```
**Solution:** Install dependencies
```powershell
npm run install-all
```

## 📝 Development Notes

### Adding New Features
1. Backend: Add routes in `backend/routes/`
2. Backend: Add controllers in `backend/controllers/`
3. Frontend: Add components in `frontend/src/components/`
4. Frontend: Add pages in `frontend/src/pages/`

### Database Management
Use MongoDB Compass to:
- View collections
- Query data
- Manage indexes
- Export/Import data

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes
- Role-based access control
- Input validation
- XSS protection
- CORS enabled

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check MongoDB connection
4. Verify all dependencies are installed

## 🎯 Future Enhancements

- Email notifications for alerts
- SMS alerts
- Export data to CSV/PDF
- Advanced analytics
- Multi-dam support
- Mobile app
- Weather integration
- Predictive analytics

---

Built By Milan George
