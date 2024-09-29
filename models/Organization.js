import mongoose from 'mongoose';

const { Schema } = mongoose;

const OrganizationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  organizationID: {
    type: String,
    required: true,
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

const Organization = mongoose.model('Organization', OrganizationSchema);
export default Organization; // Use default export
