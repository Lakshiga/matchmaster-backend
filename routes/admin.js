import express from 'express';
import { getAllOrganizers, verifyOrganizer } from '../middleware/AdminMiddleware.js';

const router = express.Router();

// Admin routes for organizers
router.get('/organizers', getAllOrganizers); 
router.put('/organizers/:id/verify', verifyOrganizer); // Changed POST to PUT


export default router;
