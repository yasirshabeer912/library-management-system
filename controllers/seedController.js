import { getModel } from "../utils/modelUtils.js";

export const seedData = async (req, res) => {
  try {
    const LibraryBranch = getModel("LibraryBranch");
    const Author = getModel("Author");
    const Shelf = getModel("Shelf");
    const Book = getModel("Book");
    const User = getModel("User");
    const BorrowingRecord = getModel("BorrowingRecord");

    // Seed Library Branches
    const branch1 = await LibraryBranch.create({
      branch_name: "Main Branch",
      address: "123 Main St, City, Country",
      contact_number: "123-456-7890",
    });

    const branch2 = await LibraryBranch.create({
      branch_name: "Downtown Branch",
      address: "456 Downtown Ave, City, Country",
      contact_number: "098-765-4321",
    });

    // Seed Authors
    const author1 = await Author.create({
      name: "John Doe",
      biography: "A prolific writer of fiction",
      nationality: "American",
    });

    const author2 = await Author.create({
      name: "Jane Smith",
      biography: "Award-winning novelist",
      nationality: "British",
    });

    // Seed Shelves
    const shelf1 = await Shelf.create({
      shelf_number: "A1",
      category: "Fiction",
      ...(process.env.DB_TYPE === "MongoDB"
        ? { branch: branch1._id }
        : { branch_id: branch1.branch_id }),
    });

    const shelf2 = await Shelf.create({
      shelf_number: "B2",
      category: "Non-Fiction",
      ...(process.env.DB_TYPE === "MongoDB"
        ? { branch: branch2._id }
        : { branch_id: branch2.branch_id }),
    });

    // Seed Books
    const book1 = await Book.create({
      title: "The Great Novel",
      ISBN: "1234567890123",
      publication_date: new Date("2023-01-01"),
      status: "available",
      ...(process.env.DB_TYPE === "MongoDB"
        ? { branch: branch1._id, shelf: shelf1._id, authors: [author1._id] }
        : { branch_id: branch1.branch_id, shelf_id: shelf1.shelf_id }),
    });

    const book2 = await Book.create({
      title: "The Amazing Story",
      ISBN: "9876543210987",
      publication_date: new Date("2023-02-01"),
      status: "available",
      ...(process.env.DB_TYPE === "MongoDB"
        ? { branch: branch2._id, shelf: shelf2._id, authors: [author2._id] }
        : { branch_id: branch2.branch_id, shelf_id: shelf2.shelf_id }),
    });

    // For MySQL, associate authors with books
    // Associate authors with books
    if (process.env.DB_TYPE === "MySQL") {
      const Writes = getModel("Writes");

      // MySQL: Use foreign keys to link authors and books
      await Writes.create({
        author_id: author1.author_id,
        book_id: book1.book_id,
      });
      await Writes.create({
        author_id: author2.author_id,
        book_id: book2.book_id,
      });
    } else if (process.env.DB_TYPE === "MongoDB") {
      const Writes = getModel("Writes");

      // MongoDB: Use ObjectIds to create documents in the Writes collection
      await Writes.create({ author: author1._id, book: book1._id });
      await Writes.create({ author: author2._id, book: book2._id });
    }

    // Seed Users
    const user1 = await User.create({
      name: "Alice Johnson",
      email: "alice@example.com",
      password: "password123", // Will be hashed by the `beforeCreate` hook
      membership_status: "active",
      role: "user",
    });

    const user2 = await User.create({
      name: "Bob Smith",
      email: "bob@example.com",
      password: "password123", // Will be hashed by the `beforeCreate` hook
      membership_status: "active",
      role: "librarian",
    });

    // Seed Borrowing Records
    await BorrowingRecord.create({
      ...(process.env.DB_TYPE === "MongoDB"
        ? { user: user1._id, book: book1._id }
        : { user_id: user1.user_id, book_id: book1.book_id }),
      borrow_date: new Date("2023-03-01"),
      return_date: null,
    });

    await BorrowingRecord.create({
      ...(process.env.DB_TYPE === "MongoDB"
        ? { user: user2._id, book: book2._id }
        : { user_id: user2.user_id, book_id: book2.book_id }),
      borrow_date: new Date("2023-04-01"),
      return_date: new Date("2023-05-01"),
    });

    res.status(201).json({ message: "Data seeded successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error seeding data", error: error.message });
  }
};
