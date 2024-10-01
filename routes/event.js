import express from "express";
import { verifyToken as auth } from "../middleware/AuthMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";
import Event from "../models/Event.js";

const router = express.Router();

// Create event (Organizer only)
router.post("/event", auth, checkRole("Organizer"), async (req, res) => {
  const { name, organizerId, matchType } = req.body;

  // Validate required fields
  // if (!name || !date || !location || !description) {
  //   return res.status(400).json({ msg: "Please fill out all fields." });
  // }

  try {
    const event = new Event({ name, organizerId, matchType });
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