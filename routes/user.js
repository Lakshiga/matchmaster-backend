import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get matches by organizer
router.get('/userDetail/:id', async (req, res) => {
    try {
        const matches = await User.findById(req.params.id);
        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching matches', error });
    }
});

export default router;