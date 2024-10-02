import express from "express";
import { verifyToken as auth } from "../middleware/AuthMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";
import Event from "../models/Event.js";

const router = express.Router();

// Create event (Organizer only)
// Event creation route (Organizer only)
router.post("/create-event", auth, checkRole("Organizer"), async (req, res) => {
  const { name, matchType } = req.body;  // Remove organizerId from req.body

  try {
    // Get the organizer's ID from the authenticated user's token (populated by auth middleware)
    const organizerId = req.user.id;  // Automatically get the organizerId from the token

    // Validate matchType to ensure it's either 'League' or 'Knockout'
    const validMatchTypes = ['League', 'Knockout'];
    if (!validMatchTypes.includes(matchType)) {
      return res.status(400).json({ msg: "Invalid match type. Must be either 'League' or 'Knockout'." });
    }

    // Create a new event with the automatically assigned organizerId
    const event = new Event({
      name,
      organizerID: organizerId,  // Automatically assign organizerId
      matchType,
      players: [],   // Initialize players array
      umpires: []    // Initialize umpires array
    });

    // Save the event to the database
    await event.save();
    res.status(201).json({ msg: "Event created successfully", event });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Update event (Organizer only)
router.put("/event/:id", auth, checkRole("Organizer"), async (req, res) => {
  const { name, date, location, description } = req.body;

  // Validate required fields
  if (!name || !date || !location || !description) {
    return res.status(400).json({ msg: "Please fill out all fields." });
  }

  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    event.name = name;
    event.date = date;
    event.location = location;
    event.description = description;

    await event.save();
    res.json({ msg: "Event updated successfully", event });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Delete event (Organizer only)
router.delete("/event/:id", auth, checkRole("Organizer"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    await event.remove();
    res.json({ msg: "Event deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get event by ID (All roles)
router.get("/event/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// List all events (All roles)
router.get("/events", auth, async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/events-by-organizer/:organizerId", auth, async (req, res) => {
  try {
    console.log(req.params);
    
    console.log(req.params.organizerId);
    const events = await Event.find({organizerId:{oid: req.params.organizerId}});
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default router;