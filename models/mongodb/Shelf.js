import mongoose from 'mongoose';

const ShelfSchema = new mongoose.Schema({
  shelf_number: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LibraryBranch',
    required: true,
  },
});

const Shelf = mongoose.model('Shelf', ShelfSchema);

export default Shelf;

