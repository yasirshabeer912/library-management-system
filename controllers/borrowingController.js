import { getModel } from '../utils/modelUtils.js';

export const borrowBook = async (req, res) => {
  try {
    const { book_id } = req.params;
    const user_id = req.user.user_id;

    const Book = getModel('Book');
    const BorrowingRecord = getModel('BorrowingRecord');

    // Check if book exists and is available
    const book = await Book.findByPk(book_id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.status !== 'available') {
      return res.status(400).json({ message: 'Book is not available for borrowing' });
    }

    // Create borrowing record
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

    await BorrowingRecord.create({
      ...(process.env.DB_TYPE === 'MongoDB' ? { user: user_id, book: book_id } : { user_id, book_id }),
      borrow_date: borrowDate,
      due_date: dueDate
    });

    // Update book status
    book.status = 'borrowed';
    await book.save();

    res.status(200).json({ message: 'Book borrowed successfully', due_date: dueDate });
  } catch (error) {
    res.status(500).json({ message: 'Error borrowing book', error: error.message });
  }
};

