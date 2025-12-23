# Akoot.tech Backend API

A highly scalable Node.js and MongoDB backend for akoot.tech featuring blog management, contact forms, and email subscription services.

## Features

- **Blog Management**: Full CRUD operations with categories, tags, search, and featured posts
- **Contact System**: Form submissions with status tracking and admin management
- **Email Subscriptions**: Newsletter signup with preferences and unsubscribe functionality
- **Security**: Rate limiting, input validation, MongoDB injection prevention, and CORS
- **Scalability**: Optimized database queries with indexes and efficient pagination

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Security**: Helmet, express-mongo-sanitize, express-rate-limit
- **Validation**: express-validator

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- pnpm (recommended) or npm

## Installation

1. Clone the repository
2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update MongoDB URI and other settings

```env
MONGODB_URI=mongodb://localhost:27017/akoot_tech
PORT=5000
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
```

## Running the Server

Development mode with auto-reload:
```bash
pnpm dev
```

Production mode:
```bash
pnpm start
```

## API Endpoints

### Blogs
- `GET /api/blogs` - Get all blogs (with pagination, filtering, search)
- `GET /api/blogs/:id` - Get single blog by ID or slug
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog
- `PUT /api/blogs/:id/like` - Like a blog
- `GET /api/blogs/categories/list` - Get all categories
- `GET /api/blogs/tags/popular` - Get popular tags

### Contacts
- `POST /api/contacts` - Submit contact form
- `GET /api/contacts` - Get all contacts (admin)
- `GET /api/contacts/:id` - Get single contact (admin)
- `PUT /api/contacts/:id` - Update contact status (admin)
- `DELETE /api/contacts/:id` - Delete contact (admin)
- `GET /api/contacts/stats/summary` - Get contact statistics (admin)

### Email Subscriptions
- `POST /api/subscriptions` - Subscribe to mailing list
- `GET /api/subscriptions/unsubscribe/:token` - Unsubscribe
- `GET /api/subscriptions` - Get all subscriptions (admin)
- `GET /api/subscriptions/:id` - Get single subscription (admin)
- `PUT /api/subscriptions/:id` - Update subscription (admin)
- `DELETE /api/subscriptions/:id` - Delete subscription (admin)
- `GET /api/subscriptions/stats/summary` - Get subscription statistics (admin)
- `GET /api/subscriptions/export/emails` - Export email list (admin)

### Health Check
- `GET /health` - Server health status

## Query Parameters

### Blogs
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category
- `tags` - Filter by tags (comma-separated)
- `search` - Full-text search
- `published` - Filter by published status
- `featured` - Filter by featured status
- `sort` - Sort field (default: -createdAt)

### Contacts & Subscriptions
- Similar pagination and filtering options

## Project Structure

```
server/
├── config/           # Configuration files
│   ├── db.js        # MongoDB connection
│   └── index.js     # Config exports
├── controllers/      # Request handlers
│   ├── blogController.js
│   ├── contactController.js
│   └── subscriptionController.js
├── middleware/       # Custom middleware
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   └── validator.js
├── models/          # Mongoose schemas
│   ├── Blog.js
│   ├── Contact.js
│   └── EmailSubscription.js
├── routes/          # API routes
│   ├── blogRoutes.js
│   ├── contactRoutes.js
│   └── subscriptionRoutes.js
├── utils/           # Utility functions
│   ├── asyncHandler.js
│   └── errorResponse.js
└── index.js         # App entry point
```

## Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Validates and sanitizes all inputs
- **MongoDB Injection Prevention**: Using express-mongo-sanitize
- **CORS**: Configured for specific origins
- **Helmet**: Security headers
- **Error Handling**: Centralized error handling with proper status codes

## Database Indexes

Optimized queries with indexes on:
- Blog: title, content, tags (text search), published + createdAt
- Contact: email, status + createdAt
- EmailSubscription: email, isActive + verified

## Future Enhancements

- [ ] JWT authentication for admin routes
- [ ] Email notification service
- [ ] File upload for blog images
- [ ] Comments system for blogs
- [ ] Analytics and tracking
- [ ] Admin dashboard API
- [ ] Automated email campaigns

## License

ISC

## Support

For support, email your_email@akoot.tech
