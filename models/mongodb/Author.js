import mongoose from 'mongoose';

const AuthorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  biography: {
    type: String,
  },
  nationality: {
    type: String,
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
  },
});

const Author = mongoose.model('Author', AuthorSchema);

export default Author;

