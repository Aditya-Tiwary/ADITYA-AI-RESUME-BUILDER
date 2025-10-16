# AI Resume Builder

## Overview

This is a full-stack AI-powered resume builder application that helps users create, edit, and enhance professional resumes. The application uses AI to improve resume content and provides a modern, interactive interface for resume creation. Users can save multiple resumes, apply different templates and themes, and leverage AI enhancements for various resume sections.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **React 17** - Core UI library for building component-based user interface
- **Vite** - Fast build tool and development server with HMR (Hot Module Replacement)
- **Wouter** - Lightweight client-side routing library
- **Framer Motion** - Animation library for smooth UI transitions
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Axios** - HTTP client for API communication

**Development Server Configuration:**
- Runs on port 3000 with HMR over WebSocket Secure (WSS) protocol
- Proxy configuration routes `/api`, `/health`, and `/enhance` requests to backend on port 3002
- Cookie forwarding enabled through proxy to maintain authentication sessions

**Design Patterns:**
- Component-based architecture with React hooks
- Service layer pattern for API interactions (AuthService, ResumeService, AIEnhancementService)
- Client-side token storage using localStorage as fallback for development environments
- Credential-based requests for cookie authentication

### Backend Architecture

**Technology Stack:**
- **Express 5** - Web application framework
- **Node.js** - Runtime environment
- **Mongoose** - MongoDB ODM for data modeling

**Server Configuration:**
- API server runs on port 3002
- CORS enabled with support for multiple origins (localhost and Replit domains)
- Credentials support enabled for cookie-based authentication
- JSON and URL-encoded request body parsing

**Route Structure:**
- `/api/auth/*` - Authentication endpoints (signup, login, logout, profile)
- `/api/resumes/*` - Resume CRUD operations
- `/health` and `/api/health` - Service health check endpoints
- `/enhance` - AI text enhancement endpoint

**Middleware Stack:**
1. **CORS middleware** - Handles cross-origin requests with dynamic origin validation
2. **Cookie parser** - Parses HTTP cookies for authentication
3. **Database connection checker** - Validates MongoDB connection before processing requests
4. **Authentication middleware** - JWT token validation with dual-source support (cookies and Authorization header)

**Authentication Strategy:**
- JWT (JSON Web Token) based authentication with 7-day expiration
- Tokens stored in HTTP-only cookies for security
- Fallback to Authorization header for development/testing
- Password hashing using bcryptjs
- Dual token source support (cookies primary, header fallback)

### Data Layer

**Database:**
- **MongoDB** with Mongoose ODM
- Connection managed through centralized connection module
- Graceful degradation - application continues running even if database connection fails

**Data Models:**

1. **User Model:**
   - Fields: username, email, password (hashed), firstName, lastName, profilePicture
   - Pre-save hook for password hashing
   - Email validation with regex pattern
   - Timestamps for createdAt and lastLogin

2. **Resume Model:**
   - Linked to User via userId reference
   - Sections: personal info, summary, experience, education, skills, achievements, projects, languages
   - Support for template and theme customization
   - Nested schemas for experience, education, and skills
   - Timestamp tracking for creation and modifications

**Data Validation:**
- Schema-level validation through Mongoose
- Required fields enforced at model level
- Email format validation
- Password minimum length requirements

### Process Management

**Startup Strategy:**
- Custom `start.js` orchestrates multi-process startup
- Backend server (port 3002) starts first with 2-second delay before frontend
- Frontend server (port 3000) starts after backend is ready
- Graceful shutdown handling with SIGINT listener
- Process coordination - frontend exit triggers backend termination

## External Dependencies

### Third-Party Services

**AI Enhancement Service:**
- Custom AI text enhancement API
- Health check endpoints: `/api/health` and `/health`
- Used for improving resume content in various sections
- Service availability checking before enhancement attempts

### Authentication & Security

**JWT (jsonwebtoken):**
- Token generation and verification
- 7-day token expiration
- Secret key stored in environment variable (JWT_SECRET)

**bcryptjs:**
- Password hashing before storage
- Password comparison for login verification

### Database

**MongoDB:**
- Primary data store for users and resumes
- Connection string via environment variable (MONGODB_URI)
- Requires proper user permissions and IP whitelist configuration
- Connection managed through Mongoose with automatic reconnection

### Development Tools

**Build & Development:**
- Vite for fast development and optimized production builds
- Tailwind CSS with PostCSS and Autoprefixer for styling
- Hot Module Replacement (HMR) for instant updates during development

**Environment Variables Required:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing

### HTTP & Networking

**CORS (cors):**
- Cross-origin resource sharing configuration
- Supports localhost and Replit domain patterns
- Credentials mode enabled for cookie transmission

**Axios:**
- Client-side HTTP requests
- Server-to-server communication support
- Timeout configuration for reliability

**Cookie Parser:**
- Server-side cookie parsing middleware
- Essential for cookie-based authentication flow