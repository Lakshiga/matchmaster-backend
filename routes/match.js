import express from 'express';
import { verifyToken as auth } from '../middleware/AuthMiddleware.js';
import { checkRole } from '../middleware/checkRole.js';
import Match from '../models/Match.js';

const router = express.Router();

// Create match (Organizer only)
router.post('/create-match', auth, checkRole('Organizer'), async (req, res) => {
  const { name, type, players, umpireId } = req.body;

  // Validate required fields
  if (!name || !type || !players || !umpireId) {
    return res.status(400).json({ msg: 'Please fill out all fields.' });
  }

  try {
    const match = new Match({
      name,
      type,
      players,
      umpire: umpireId, // Assigning umpire to the match
      status: 'Pending',
    });
    await match.save();
    res.status(201).json({ msg: 'Match created successfully', match });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Fetch all matches assigned to the umpire (Umpire only)
router.get('/umpire/:umpireId', auth, checkRole('Umpire'), async (req, res) => {
  try {
    const matches = await Match.find({
      umpire: req.params.umpireId,
      status: { $in: ['Pending', 'Ongoing'] },
    });
    res.json(matches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update the match score (Umpire only)
router.put('/match/:id/score', auth, checkRole('Umpire'), async (req, res) => {
  const { player1Score, player2Score } = req.body;

  try {
    let match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ msg: 'Match not found' });
    }

    match.score = {
      player1Score,
      player2Score,
    };
    match.status = 'Finished'; // Mark the match as finished

    await match.save();
    res.json({ msg: 'Match score updated successfully', match });
  } catch (err) {
    console.error('Error updating score:', err.message);
    res.status(500).send('Server error');
  }
});

// View a single match (All roles)
router.get('/match/:id', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ msg: 'Match not found' });
    }
    res.json(match);
  } catch (err) {
    console.error('Error viewing match:', err.message);
    res.status(500).send('Server error');
  }
});

// List all matches (All roles)
router.get('/matches', auth, async (req, res) => {
  try {
    const matches = await Match.find();
    res.json(matches);
  } catch (err) {
    console.error('Error listing matches:', err.message);
    res.status(500).send('Server error');
  }
});

// Fetch all finished matches (All roles)
router.get('/matches/finished', auth, async (req, res) => {
  try {
    const finishedMatches = await Match.find({ status: 'Finished' });
    res.json(finishedMatches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;