# ShareVerse Social Media Platform

ShareVerse is a simplified, clean, and beginner-friendly mini social media platform designed as a college assignment project. It is built using Node.js and Express on the backend, MongoDB with Mongoose for data persistence, and Vanilla HTML5, CSS3, and JavaScript on the frontend.

---

# Live Webiste

🔗https://share-verse.onrender.com/

---

## Features

- **User Authentication**: Secure user registration and login with password hashing (`bcryptjs`) and token authorization (`jsonwebtoken`). Includes working logout support.
- **Home Feed**: Responsive, chronological feed showing posts. Supports text-only posts, image posts, video posts, and combined layouts.
- **Create Post**: Integrated post creation supporting text caption entry and file uploads (images/videos) with dynamic UI previews.
- **Comments Thread**: Users can view comment timelines on dedicated post pages, add new comments, and delete their own comments.
- **Likes**: Users can toggle likes/unlikes on posts with real-time counter updates.
- **User Profiles**: Displays name, username, bio, total posts count, and followers/following counts. Clicking the counts opens overlay modals listing followers and following.
- **Edit Profile**: Profile update form supporting bio modifications and custom profile picture uploads.
- **Follow System**: Users can follow and unfollow other users. Follow lists are accessible directly from profiles.
- **Search**: Real-time debounced query search finding users by name or username.
- **Responsive Layout**: Clean, Instagram/Facebook-inspired white/light layout designed with Flexbox and CSS Grid that collapses gracefully on mobile devices.

---

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (No React/Angular/Vue frameworks). Uses Fetch API for all REST requests.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB with Mongoose ODM.
- **File Uploads**: Multer for handling multipart/form-data.
- **Security**: bcryptjs for password hashing, jsonwebtoken for JWT auth.

---

## Folder Structure

```
share-verse/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── controllers/
│   ├── authController.js     # User registration, login, logout, & state checks
│   ├── commentController.js  # Creating, fetching, and deleting comments
│   ├── followController.js   # Toggling follows, listing followers/following
│   ├── postController.js     # Post CRUD operations & toggle likes
│   └── userController.js     # Fetch profile stats, update bios, and search users
├── middleware/
│   ├── authMiddleware.js     # JWT route protection guard
│   └── uploadMiddleware.js   # Multer file storage & filter configuration
├── models/
│   ├── Comment.js            # Comment database schema
│   ├── Follow.js             # Follow association database schema
│   ├── Post.js               # Post details database schema
│   └── User.js               # User credentials & details schema
├── routes/
│   ├── authRoutes.js         # /api/auth routes
│   ├── commentRoutes.js      # /api/comments routes
│   ├── followRoutes.js       # /api/follow routes
│   ├── postRoutes.js         # /api/posts routes
│   └── userRoutes.js         # /api/users routes
├── public/                   # Client-side static assets
│   ├── css/
│   │   └── style.css         # Clean, responsive light-theme stylesheet
│   ├── js/
│   │   ├── api.js            # Global API fetch client wrappers
│   │   └── components.js     # Shared navbar, sidebar, logout, & toast systems
│   ├── edit-profile.html     # Edit profile page
│   ├── index.html            # Home feed & create post page
│   ├── login.html            # Login page
│   ├── post-details.html     # Post details & comments page
│   ├── profile.html          # User profile & follow overlay page
│   ├── register.html         # Register page
│   └── search.html           # Search page
├── uploads/                  # Locally uploaded media files (gitignored)
│   ├── posts/                # Post images and videos
│   └── profiles/             # User avatar profile images
├── utils/
│   └── seeder.js             # Seed script populating local mock data
├── .env                      # Local configuration file (created from example)
├── .env.example              # Template configuration file
├── package.json              # Dependencies and start scripts
└── server.js                 # Express server & central boot file
```

---

## Installation & Setup

Follow these steps to run the project locally:

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally on port `27017` (or access to a MongoDB Atlas cluster).

### 2. Clone and Install Dependencies
Navigate to the project root directory and run:
```bash
npm install
```

### 3. Environment Configuration
Verify that the `.env` file exists in the project root. It should look like this:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/shareverse
JWT_SECRET=super_secret_shareverse_token_signing_key_12345
```
*Note: The project comes pre-configured with a `.env` file referencing localhost MongoDB for immediate runnability.*

### 4. Seed the Database
Populate the database with sample users, posts, comments, likes, and follows by running:
```bash
npm run seed
```
This will clear any old data and insert:
- **5 sample users** (default password for all: `password123`)
- **15 posts** (including text, images, and videos)
- **20 comments**
- Random likes and follow associations

### 5. Start the Server
Run the following command to start the Express server:
```bash
npm start
```
The server will start on port `5000`. Open your browser and navigate to:
```
http://localhost:5000
```
You will be redirected to the Login page. Log in using one of the seeded users:
- **Username**: `alice` | **Password**: `password123`
- **Username**: `bob` | **Password**: `password123`

---

## API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user (multipart/form-data with `profilePicture` file support).
- `POST /api/auth/login` - Login user, returns JWT and user payload.
- `POST /api/auth/logout` - Sign out notification (instructs client to purge token).
- `GET /api/auth/me` - Get details of currently logged-in user (Protected).

### Users (`/api/users`)
- `GET /api/users/profile/:username` - Get profile metadata, post/follow counts, and follow status.
- `PUT /api/users/profile` - Update profile data (name, username, bio, and optional `profilePicture` file) (Protected).
- `GET /api/users/search?q=query` - Live regex-search for users by name or username.

### Posts (`/api/posts`)
- `POST /api/posts` - Create post. Supports `caption` and optional `media` file uploads (images or videos) (Protected).
- `GET /api/posts` - Get all posts chronologically with author details and like flags (Protected).
- `GET /api/posts/user/:username` - Get posts published by a specific user.
- `GET /api/posts/:id` - Fetch single post details, comment count, and like state.
- `PUT /api/posts/:id` - Edit post caption (Protected, Owner only).
- `DELETE /api/posts/:id` - Delete post and all associated comments (Protected, Owner only).
- `POST /api/posts/:id/like` - Toggle like/unlike on a post (Protected).

### Comments (`/api/comments`)
- `POST /api/comments/:postId` - Publish comment on a post (Protected).
- `GET /api/comments/:postId` - Get comments timeline for a post.
- `DELETE /api/comments/:id` - Delete comment (Protected, Comment Owner only).

### Follows (`/api/follow`)
- `POST /api/follow/:userId` - Toggle follow/unfollow on a user (Protected).
- `GET /api/follow/:userId/followers` - Get followers list of a user.
- `GET /api/follow/:userId/following` - Get following list of a user.
