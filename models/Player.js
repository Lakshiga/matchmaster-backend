import mongoose from 'mongoose';

const { Schema } = mongoose;

const playerSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    userID: {
        type: String,
        required: true,
    },
});

const Player = mongoose.model('Player', playerSchema);
export default Player; // Use default export

