import express from "express";
import { verifyToken as auth } from "../middleware/AuthMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";
import Event from "../models/Event.js";

const router = express.Router();

// Create event (Organizer only)
router.post("/create-event", auth, checkRole("Organizer"), async (req, res) => {
  const { name, matchType, players, umpires } = req.body;

  try {
    const organizerId = req.user.id;

    // Validate matchType to ensure it's either 'League' or 'Knockout'
    const validMatchTypes = ["League", "Knockout"];
    if (!validMatchTypes.includes(matchType)) {
      return res.status(400).json({
        msg: "Invalid match type. Must be either 'League' or 'Knockout'.",
      });
    }

    // Ensure players and umpires arrays are provided and have at least one element
    if (!players || players.length === 0) {
      return res.status(400).json({
        msg: "Players are required. Please provide at least one player.",
      });
    }

    if (!umpires || umpires.length === 0) {
      return res.status(400).json({
        msg: "Umpires are required. Please provide at least one umpire.",
      });
    }

    // Further validate player and umpire content (e.g., ensure no empty names)
    if (players.some(player => !player.trim())) {
      return res.status(400).json({ msg: "Player names cannot be empty." });
    }

    if (umpires.some(umpire => !umpire.trim())) {
      return res.status(400).json({ msg: "Umpire names cannot be empty." });
    }

    // Create the event
    const event = new Event({
      name,
      organizerID: organizerId,
      matchType,
      players,  // Use players array from request
      umpires,  // Use umpires array from request
    });

    // Save event to the database
    await event.save();
    return res.status(201).json({ msg: "Event created successfully", event });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
});

// **Export the router**
export default router;