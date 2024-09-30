import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js'; // Importing the db connection
import userRoutes from './routes/auth.js'; // Importing user authentication routes
import eventRoutes from './routes/event.js'; // Importing event routes
import adminRoutes from './routes/admin.js'; // Importing admin routes
import organizerRoutes from './routes/organizer.js'; // Importing organizer routes

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', userRoutes); // API route for user-related operations
app.use('/api/event', eventRoutes); // API route for event-related operations
app.use('/api/admin', adminRoutes); // API route for admin-related operations
app.use('/api/organizer', organizerRoutes); // API route for organizer-related operations

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.join(__dirname, 'client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
