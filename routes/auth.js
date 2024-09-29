import express from 'express';
import bcrypt from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Player from '../models/Player.js';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../middleware/AuthMiddleware.js';  // Correct import
import { isAdmin } from '../middleware/AdminMiddleware.js'; 

dotenv.config();

const router = express.Router();

router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({
        email,
        password: hashedPassword,
        role,
        verified: role === 'Organizer' ? false : true, // Organizer needs verification
      });

      await user.save(); 
        
      if (user.role === 'Organizer') {
        // Create a new organization for the organizer
        const organization = new Organization({
          userID: user._id,  // Linking the organizer user with the organization
          organizationID: req.body.organizationId,  // Assuming the organizationId is provided
          email: user.email,  // Assuming the organization email is provided
          name: req.body.organizationName,  // Organization name
          contactNumber: req.body.contactNumber  // Organization contact number
        });
      
        // Save the organization details to the database
        await organization.save();
      }
      
      // If the user is a Player, map them to a Player model
      if (user.role === 'Player') {
        const player = new Player({
          userID: user._id,
          email: user.email,  // Assuming the organization email is provided
          name: req.body.name, // Assuming playerName is sent in the body
          contactNumber: req.body.contactNumber,
        });

        await player.save();
      }

      res.status(200).json({
            user:{
                email:user.email,
                role:user.role,
                verified:user.verified
            }
      });
    } catch (err) {
      console.error('Server Error:', err.message);
      res.status(500).send('Server error');
    }
  }
);


router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Admin default credentials check
      const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'lakshiga20021216@gmail.com';
      const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Lachchu16';

      if (email === defaultAdminEmail && password === defaultAdminPassword) {
        const token = jwt.sign(
          { user: { id: 'admin', role: 'admin' } },
          process.env.JWT_SECRET,
          { expiresIn: '5h' }
        );
        return res.json({ token, role: 'admin', msg: 'Login successful as Admin' });
      }

      // Check if the user exists in the database
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      // Check password match
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      // Check if the user is an organizer and verified
      if (user.role === 'Organizer' && !user.verified) {
        // If not verified, send this specific response
        return res.status(200).json({
          token: null,
          role: user.role,
          isVerified:user.verified,
          msg: 'Waiting for admin verification.',
        });
      }

      // If verified or other role
      const payload = {
        user: {
          id: user.id,
          role: user.role,
          isVerified: user.verified,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5h' },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            role: user.role,
            isVerified: user.verified,
            msg: 'Login successful',
          });
        }
      );
    } catch (err) {
      console.error('Server Error:', err.message);
      res.status(500).send('Server error');
    }
  }
);


router.get('/AllUser', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    const unverifiedOrganizers = users.filter(user => user.role === 'Organizer' && !user.verified);
    res.status(200).json({ users, unverifiedOrganizers });
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});


router.put('/AllUser/:id/verify', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'Organizer') {
      return res.status(404).json({ message: 'Organizer not found or not valid' });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({ message: 'Organizer verified successfully' });
  } catch (err) {
    console.error('Error verifying organizer:', err.message);
    res.status(500).json({ message: 'Failed to verify organizer' });
  }
});
export default router;



