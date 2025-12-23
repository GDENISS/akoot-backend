# Deployment Guide

## Backend Deployed on Render

**URL:** https://akoot-backend.onrender.com

### Important Notes:

1. **Cold Start Delay**: First request after 15 minutes of inactivity takes ~30 seconds
2. **Solution**: Use a service like [UptimeRobot](https://uptimerobot.com/) or [Cron-job.org](https://cron-job.org) to ping your health endpoint every 10 minutes:
   - URL to ping: `https://akoot-backend.onrender.com/health`
   - Interval: Every 10 minutes
   - This keeps the server warm and prevents cold starts

### Frontend Configuration

Update your frontend API base URL to:
```
NEXT_PUBLIC_API_URL=https://akoot-backend.onrender.com/api
```

### CORS Configuration

Already configured for:
- `https://akoot.tech`
- `https://www.akoot.tech`
- `http://localhost:3000` (development)

### Environment Variables on Render

Required:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `NODE_ENV=production`
- `PORT=5000`

## Testing Endpoints

- Health: https://akoot-backend.onrender.com/health
- Blogs: https://akoot-backend.onrender.com/api/blogs
- Contacts: https://akoot-backend.onrender.com/api/contacts
- Subscriptions: https://akoot-backend.onrender.com/api/subscriptions
