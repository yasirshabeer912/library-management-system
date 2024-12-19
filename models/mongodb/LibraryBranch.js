import mongoose from 'mongoose';

const LibraryBranchSchema = new mongoose.Schema({
  branch_name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  contact_number: {
    type: String,
    required: true,
  },
});

const LibraryBranch = mongoose.model('LibraryBranch', LibraryBranchSchema);

export default LibraryBranch;

