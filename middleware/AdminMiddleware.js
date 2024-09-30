import Organizer from '../models/User.js';

// AdminMiddleware.js

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role.toLowerCase() !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only' });
  }
  next(); // Proceed if the user is an admin
};


// Admin can view all organizers
export const getAllOrganizers = async (req, res) => {
  try {
    const organizers = await Organizer.find();
    res.json(organizers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Admin can verify an organizer's registration
export const verifyOrganizer = async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.params.id);
    if (!organizer) {
      return res.status(404).json({ msg: 'Organizer not found' });
    }
    organizer.verified = true;
    await organizer.save();
    res.json({ msg: 'Organizer verified successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Export isAdmin as well
export { isAdmin };


