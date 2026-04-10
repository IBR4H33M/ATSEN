# ATSEN - Educational Platform

A comprehensive, full-stack educational management platform built to streamline learning, teaching, and institutional management. ATSEN provides an integrated solution for students, instructors, and administrators with features designed to enhance collaboration and learning outcomes.

![ATSEN Logo](https://img.shields.io/badge/ATSEN-Educational%20Platform-blue)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-ISC-blue)

## 🌟 Key Features

### For Students

- **Course Enrollment**: Browse and enroll in available courses
- **Learning Materials**: Access course materials, resources, and documentation
- **Assessments & Quizzes**: Take assessments and track grades
- **Discussion Forums**: Participate in course discussions and forums
- **Progress Tracking**: Monitor personal academic progress and achievements
- **Real-time Chat**: Communicate with instructors and peers
- **Document Management**: Request and manage academic documents

### For Instructors

- **Room/Course Management**: Create and manage courses with sections
- **Content Management**: Upload materials, create assessments, and publish announcements
- **Grading System**: Grade submissions and assessments
- **Student Monitoring**: Track student progress and participation
- **Room Resources**: Manage room-specific resources and documents
- **Forum Moderation**: Moderate discussions and forum content

### For Administrators

- **Institution Management**: Manage institutions and their settings
- **User Management**: Handle student, instructor, and admin accounts
- **Access Control**: Control institutional access and permissions
- **Announcements**: Create institution-wide announcements
- **Analytics Dashboard**: View platform statistics and insights
- **Help Desk**: Manage support tickets and user inquiries

### General Features

- **Multi-role Authentication**: Secure authentication with JWT tokens
- **Real-time Notifications**: Chat and messaging system
- **File Management**: AWS S3 integration for file uploads
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **SEO Optimized**: Sitemap and robots.txt for search engines

## 🛠 Tech Stack

### Backend

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Storage**: AWS S3 (via multer-s3)
- **Caching & Rate Limiting**: Upstash Redis
- **Web Scraping**: Cheerio
- **Additional**: CORS, dotenv, axios

### Frontend

- **Framework**: React 19.x
- **Build Tool**: Vite 7.x
- **Routing**: React Router 7.x
- **Styling**: Tailwind CSS + DaisyUI
- **Components**: Lucide React, React Icons
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Charts**: Recharts

## 📁 Project Structure

```
ATSEN/
├── backend/                          # Express.js backend API
│   ├── src/
│   │   ├── server.js                # Application entry point
│   │   ├── config/
│   │   │   ├── db.js                # MongoDB configuration
│   │   │   └── upstash.js           # Redis configuration
│   │   ├── controllers/             # Business logic layer
│   │   │   ├── authController.js
│   │   │   ├── studentController.js
│   │   │   ├── instructorController.js
│   │   │   ├── roomsController.js
│   │   │   ├── assessmentController.js
│   │   │   ├── gradeController.js
│   │   │   ├── forumContentController.js
│   │   │   ├── chatController.js
│   │   │   └── institution/         # Institution-specific controllers
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── Student.js
│   │   │   ├── Instructor.js
│   │   │   ├── Room.js
│   │   │   ├── Assessment.js
│   │   │   ├── Submission.js
│   │   │   ├── Grade.js
│   │   │   ├── ForumContent.js
│   │   │   ├── ChatMessage.js
│   │   │   └── ...
│   │   ├── routes/                  # API endpoint definitions
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js    # JWT authentication
│   │   │   └── rateLimiter.js       # Rate limiting
│   │   └── utils/                   # Utility functions
│   ├── migrations/                  # Database migrations
│   ├── uploads/                     # Local file storage
│   └── package.json
│
├── frontend/                         # React Vite frontend
│   ├── src/
│   │   ├── main.jsx                 # Entry point
│   │   ├── App.jsx                  # Root component
│   │   ├── components/              # Reusable components
│   │   │   ├── common/
│   │   │   ├── institution/
│   │   │   └── room/
│   │   ├── pages/                   # Page components
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── institution/
│   │   │   ├── student/
│   │   │   ├── teacher/
│   │   │   └── ...
│   │   ├── contexts/                # React Context (Auth, Theme)
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── services/                # API service calls
│   │   ├── utils/                   # Utility functions
│   │   ├── lib/                     # Axios configuration
│   │   └── index.css
│   ├── public/                      # Static files
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── package.json                      # Root package config
├── Procfile                          # Render.com deployment
├── render.yaml                       # Render deploy config
└── README.md
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **MongoDB**: Local or Atlas cloud database
- **Git**: For version control

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ATSEN.git
cd ATSEN
```

### 2. Install Node Modules

Install dependencies for all packages (root, backend, and frontend):

```bash
npm run install:all
```

Or manually:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env
```

Add the following environment variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/atsen?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name

# Upstash Redis (for caching and rate limiting)
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

For frontend, create `.env.development` in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Database Setup

Connect your MongoDB database. The application will create collections automatically based on the Mongoose schemas.

To run migrations:

```bash
cd backend
npm run migrate:student-institutions
```

## 🏃 Running the Application

### Development Mode (Both Backend & Frontend)

Run both backend and frontend simultaneously:

```bash
npm run dev
```

Alternatively, open the browser automatically:

```bash
npm run dev:all:open
```

Or run them separately:

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

- Backend runs on: `http://localhost:5000`
- Frontend runs on: `http://localhost:5173`

### Production Build

Build the entire application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 🌐 API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Student Endpoints

- `GET /api/students/:id` - Get student profile
- `GET /api/students/:id/rooms` - Get enrolled rooms/courses
- `GET /api/students/:id/progress` - Get academic progress
- `GET /api/students/:id/grades` - Get grades

### Instructor Endpoints

- `GET /api/instructors/:id` - Get instructor profile
- `GET /api/instructors/:id/rooms` - Get teaching rooms
- `POST /api/instructors/:id/rooms` - Create new room

### Room/Course Endpoints

- `GET /api/rooms` - List all rooms
- `GET /api/rooms/:id` - Get room details
- `GET /api/rooms/:id/materials` - Get course materials
- `GET /api/rooms/:id/assessments` - Get room assessments

### Assessment Endpoints

- `GET /api/assessments/:id` - Get assessment details
- `POST /api/assessments/:id/submit` - Submit assessment

### Forum Endpoints

- `GET /api/forums/:roomId` - Get forum discussions
- `POST /api/forums/:roomId` - Create new discussion

### Chat Endpoints

- `GET /api/chat/messages/:roomId` - Get room chat
- `POST /api/chat/messages` - Send message

For complete API documentation, refer to the individual route files in `backend/src/routes/`.

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcryptjs for secure password storage
- **CORS**: Cross-Origin Resource Sharing configured
- **Rate Limiting**: Redis-based rate limiting to prevent abuse
- **HTTPS**: Recommended for production
- **Environment Variables**: Sensitive data stored in `.env`

## 📦 Deployment

### Render.com Deployment

The project includes configuration files for Render.com:

- `render.yaml` - Service configuration
- `Procfile` - Process file for deployment

To deploy:

1. Push your code to GitHub
2. Connect repository to Render.com
3. Create a new Web Service
4. Configure environment variables
5. Deploy!

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure:

- Code follows project conventions
- All tests pass
- Documentation is updated

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👥 Authors

- **Project Team**: ATSEN Development Team
- **Course**: CSE 471 - Educational Platform Development

## 💬 Support

For support, please:

- Open an issue on GitHub
- Contact the development team
- Check existing issues for solutions

## 🐛 Known Issues

- [List any known issues or limitations]

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)

## 🎯 Future Enhancements

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Video streaming integration
- [ ] AI-powered learning recommendations
- [ ] Blockchain-based certificates
- [ ] Multi-language support
- [ ] Advanced notification system
- [ ] Integration with third-party tools

---

**Last Updated**: April 2026
**Version**: 1.0.0
