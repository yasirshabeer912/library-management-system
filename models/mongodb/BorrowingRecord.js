import mongoose from 'mongoose';

const BorrowingRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  borrow_date: {
    type: Date,
    required: true,
  },
  return_date: {
    type: Date,
  },
});

const BorrowingRecord = mongoose.model('BorrowingRecord', BorrowingRecordSchema);

export default BorrowingRecord;

