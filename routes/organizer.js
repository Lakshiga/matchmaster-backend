import express from 'express';
import Match from '../models/Match.js';
import User from '../models/User.js';

const router = express.Router();

// Create a new match
router.post('/matches', async (req, res) => {
    try {
        const newMatch = new Match(req.body);
        await newMatch.save();
        res.status(201).json(newMatch);
    } catch (error) {
        res.status(500).json({ message: 'Error creating match', error });
    }
});

// Update an existing match
router.put('/matches/:id', async (req, res) => {
    try {
        const updatedMatch = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedMatch) {
            return res.status(404).json({ message: 'Match not found' });
        }
        res.status(200).json(updatedMatch);
    } catch (error) {
        res.status(500).json({ message: 'Error updating match', error });
    }
});

// Delete a match
router.delete('/matches/:id', async (req, res) => {
    try {
        const deletedMatch = await Match.findByIdAndDelete(req.params.id);
        if (!deletedMatch) {
            return res.status(404).json({ message: 'Match not found' });
        }
        res.status(200).json({ message: 'Match deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting match', error });
    }
});

// Get matches by organizer
router.get('/matches', async (req, res) => {
    try {
        // Assuming organizer ID is stored in req.user.id
        const matches = await Match.find({ organizer: req.user.id });
        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching matches', error });
    }
});

// Get all unverified umpires
router.get('/unverified-umpires', async (req, res) => {
    try {
        const umpires = await User.find({ role:"Umpire",verified:false }); // Use Umpire model instead of User
        res.status(200).json(umpires);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching unverified umpires', error });
    }
});

// Verify an umpire
router.post('/verify-umpire/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const umpire = await User.findById(id); // Use Umpire model instead of User
        if (!umpire) {
            return res.status(404).json({ message: 'Umpire not found' });
        }

        umpire.verificationStatus = 'Verified';
        await umpire.save();
        res.status(200).json({ message: 'Umpire verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying umpire', error });
    }
});

// Get all unverified players
router.get('/unverified-players', async (req, res) => {
    try {
        const players = await User.find({ role:"Player",verified:false});
        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching unverified players', error });
    }
});

// Verify a player
router.post('/verify-player/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const player = await User.find({ _id: id, role: 'Player' });
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        player.verificationStatus = 'Verified';
        await player.save();
        res.status(200).json({ message: 'Player verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying player', error });
    }
});

export default router;