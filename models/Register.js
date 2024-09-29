import mongoose from 'mongoose';

const { Schema } = mongoose;

const registerSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    organizationID: {
        type: String,
        required: true,
    },
});

const Register = mongoose.model('Register', registerSchema);
export default Register; // Use default export
