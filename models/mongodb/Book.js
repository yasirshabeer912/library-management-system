import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  ISBN: {
    type: String,
    required: true,
  },
  publication_date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LibraryBranch',
    required: false, // Make branch optional
  },
  authors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
  }],
});

const Book = mongoose.model('Book', BookSchema);

export default Book;
