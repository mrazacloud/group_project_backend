# EventHub Backend — Part 1

Express API for the EventHub event management application.

## Setup

```bash
npm install
cp .env.example .env   # fill in MongoDB URI and JWT secret
npm run dev
```

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and get JWT |
| GET | `/api/auth/profile` | Yes | Get current user profile |
| PUT | `/api/auth/profile` | Yes | Update profile |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events` | No | List all events |
| GET | `/api/events/:id` | No | Get single event |
| POST | `/api/events` | Yes | Create event |
| PUT | `/api/events/:id` | Yes | Edit own event |
| PUT | `/api/events/:id/status` | Yes | Change event status |
| GET | `/api/events/:id/history` | Yes | View event change history |

### RSVPs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/events/:id/rsvp` | Yes | RSVP to event |
| PUT | `/api/events/:id/rsvp` | Yes | Cancel RSVP |
| GET | `/api/events/:id/rsvps` | No | List RSVPs for event |

## Tech

- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing
- express-validator for input validation
