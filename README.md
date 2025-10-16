<p align="center">
  <img src="https://github.com/user-attachments/assets/9ae811ef-acfd-4617-8144-6eaf821b6429" width="701" height="98" alt="Centered Image" />
</p>

An intelligent resume builder application that leverages AI to help users create professional, ATS-optimized resumes quickly and efficiently.

## Homepage
<img width="1920" height="1080" alt="Screenshot (921)" src="https://github.com/user-attachments/assets/5c5ccd73-9ff7-4b0a-8ea8-41dd4cbc35f6" />
<img width="1920" height="1080" alt="Screenshot (922)" src="https://github.com/user-attachments/assets/53f37371-9019-4ce6-94ac-e74d4be19bf7" />
<img width="1920" height="1080" alt="Screenshot (923)" src="https://github.com/user-attachments/assets/40a5d1aa-6060-4c92-9c02-4ca27fa0f940" />
<img width="1920" height="1080" alt="Screenshot (925)" src="https://github.com/user-attachments/assets/5d1c2905-3aa5-4e8a-83bd-5748a3f6b492" />

## Template Selection
<img width="1500" height="844" alt="image" src="https://github.com/user-attachments/assets/42a8caf3-c9ae-4a6e-b843-cee38186c59d" />
<img width="1920" height="1080" alt="Screenshot (928)" src="https://github.com/user-attachments/assets/c0e2dc50-4f39-4c00-b72b-4bf6d908a80a" />

## Templates
### Classic
<img width="1920" height="1080" alt="Screenshot (1013)" src="https://github.com/user-attachments/assets/37c6115a-6718-4adc-aad8-52361cf9e5e3" />

### Creative
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/a39f2f84-d095-47dc-b450-4ff9997f7d12" />

### Modern
<img width="1920" height="1080" alt="Screenshot (1012)" src="https://github.com/user-attachments/assets/1a7f354d-e456-40fc-aaa3-387921682bd7" />

## Login & Signup
<img width="1500" height="844" alt="image" src="https://github.com/user-attachments/assets/8ace2f10-f929-43a4-a12a-f9d9a2645568" />

## Sidebar
<img width="1500" height="844" alt="image" src="https://github.com/user-attachments/assets/9d4054ad-4c56-42de-80bd-0c0d9dafad65" />

## Responsive Design
<img width="1500" height="844" alt="image" src="https://github.com/user-attachments/assets/9bdb37ed-635b-4d16-b302-7c2c34bafd55" />

## Export PDF
<img width="1500" height="844" alt="image" src="https://github.com/user-attachments/assets/dd12a571-75a1-4241-90e5-e1b7552256dd" />

## AI Enhancer
<img width="1200" height="675" alt="image" src="https://github.com/user-attachments/assets/6a94d49b-e9c5-4a11-9d8d-519ad9d822dd" />
<img width="1318" height="744" alt="{63F7991B-5F8C-4808-8AC7-CD11425DF0C1}" src="https://github.com/user-attachments/assets/91d362f4-ce0f-4ace-9f31-7fcbc3cea085" />
<img width="1317" height="747" alt="{EC5D1669-50C0-402B-AE8E-22ED685342E1}" src="https://github.com/user-attachments/assets/30a4c75f-8fef-4248-aeea-dc8cc38971bd" />

## Save Functionality
<img width="1500" height="841" alt="image" src="https://github.com/user-attachments/assets/fba42f93-28e6-42e0-a073-6a15b5b4fc41" />

## Dashboard
<img width="1500" height="843" alt="image" src="https://github.com/user-attachments/assets/84cc072c-9bed-4356-aca6-66b378072d2e" />

## Share
<img width="1500" height="844" alt="image" src="https://github.com/user-attachments/assets/6f1ac1f6-b8a0-48ea-a73c-6030f8519bd4" />

## Technology Stack
<img width="1500" height="842" alt="image" src="https://github.com/user-attachments/assets/33f456d6-9a0d-4bd4-8cdd-29fdb56e4995" />


## Features

### AI-Powered Content Enhancement
- **Smart Resume Generation**: Utilize advanced AI (Gemini API) to generate professional resume content
- **Tailored Content**: Create industry-specific skills and achievements based on job titles
- **Section Enhancement**: AI-powered improvement for summaries, experience, skills, and achievements
- **Context-Aware**: Generate content optimized for specific industries and roles

### Professional Templates
- **Classic Template**: Timeless elegance for traditional industries with clean layout and ATS-friendly design
- **Creative Template**: Stand out with unique flair, visual elements, and modern approach
- **Modern Template**: Clean, contemporary design perfect for tech-friendly roles

### User Management
- **Secure Authentication**: JWT-based authentication with encrypted password storage
- **Resume Management**: Save, update, duplicate, and delete resumes

### Additional Features
- **ATS Optimization**: Templates designed to pass Applicant Tracking Systems
- **Real-time Editing**: Direct content editing within the application
- **Auto-save**: Automatic resume saving to prevent data loss
- **Responsive Design**: Mobile-friendly interface with optimized modals
- **Export Options**: Download resumes for job applications

## Tech Stack

### Frontend
- **React** - UI library for building interactive user interfaces
- **Vite** - Fast build tool and development server
- **Wouter** - Lightweight routing for React
- **Framer Motion** - Animation library for smooth UI effects
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web framework for building REST APIs
- **MongoDB** - NoSQL database for data persistence
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt.js** - Password hashing library

### AI Integration
- **Gemini API** - Google's AI for intelligent content generation
- **Fallback System** - Automatic API key rotation for reliability

## Prerequisites

Before running this application, ensure you have:

- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- **MongoDB** database (local or cloud instance)
- **Gemini API Key** (for AI features)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-resume-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=your_mongodb_connection_string
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_key
   
   # Server Configuration
   PORT=3002
   
   # Gemini API Keys (for AI enhancement)
   GEMINI_API_KEY_PRIMARY=your_primary_api_key
   GEMINI_API_KEY_SECONDARY=your_secondary_api_key
   ```

## Running the Application

### Development Mode

Start both the backend API server and frontend development server:

```bash
npm run dev
```

This will start:
- **Backend API Server**: `http://localhost:3002`
- **Frontend Development Server**: `http://localhost:3000`

The application will automatically open in your browser at `http://localhost:3000`

### Production Build

Build the frontend for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
ai-resume-builder/
├── src/
│   ├── client/               # Frontend React application
│   │   ├── components/       # Reusable React components
│   │   ├── services/         # API service clients
│   │   ├── context/          # React Context providers
│   │   ├── templates/        # Resume template components
│   │   ├── HomePage.jsx      # Landing page
│   │   ├── TemplateSelection.jsx
│   │   └── service.js        # AI enhancement service
│   │
│   ├── server/               # Backend Express server
│   │   └── server.js         # Main server file
│   │
│   ├── routes/               # API route handlers
│   │   ├── auth.js          # Authentication routes
│   │   └── resume.js        # Resume CRUD routes
│   │
│   ├── database/            # Database configuration
│   │   ├── connection.js    # MongoDB connection
│   │   └── models/          # Mongoose models
│   │       ├── User.js
│   │       └── Resume.js
│   │
│   ├── middleware/          # Express middleware
│   │   ├── auth.js         # Authentication middleware
│   │   └── database.js     # Database check middleware
│   │
│   └── App.jsx             # Main React component
│
├── public/                 # Static assets
├── attached_assets/        # User uploaded assets
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── package.json           # Project dependencies
└── README.md             # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Resumes
- `GET /api/resumes` - Get all user resumes
- `GET /api/resumes/:id` - Get specific resume
- `POST /api/resumes/save` - Save new resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume
- `POST /api/resumes/:id/duplicate` - Duplicate resume
- `GET /api/resumes/:id/ownership` - Check resume ownership

### AI Enhancement
- `POST /enhance` - AI-powered text enhancement

## Usage

1. **Sign Up/Login**: Create an account or log in to access resume features
2. **Select Template**: Choose from Classic, Creative, or Modern templates
3. **Enter Information**: Fill in your personal details, experience, skills, and education
4. **AI Enhancement**: Use the AI enhancement feature to improve your content
5. **Customize**: Edit and refine the AI-generated content
6. **Save Resume**: Save your resume to your account
7. **Download**: Export your completed resume

## Configuration

### Vite Configuration
The application uses Vite for development with proxy configuration for API requests. The proxy automatically forwards:
- `/api/*` requests to `http://localhost:3002`
- `/enhance` requests to the AI enhancement server

### CORS Configuration
The backend allows requests from:
- `http://localhost:3000` (development)
- Replit domains (`*.replit.dev`, `*.pike.replit.dev`)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Gemini AI for powering the intelligent content generation
- React and Vite communities for excellent tooling
- Tailwind CSS for the styling framework
- Framer Motion for beautiful animations
---

Built with ❤️ by Aditya Tiwary
