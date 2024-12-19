import mongoose from 'mongoose';
import { Schema } from 'mongoose';

// Define the Writes Schema
const writesSchema = new Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author', // Reference to the Author model
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book', // Reference to the Book model
      required: true,
    },
  },
  { timestamps: true } // optional: adds createdAt and updatedAt fields
);

// Create the Writes model
const Writes = mongoose.model('Writes', writesSchema);

export default Writes;
