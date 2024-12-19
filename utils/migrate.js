import mongoose from "mongoose";
import {
  Author as MySQLAuthor,
  Book as MySQLBook,
  BorrowingRecord as MySQLBorrowingRecord,
  LibraryBranch as MySQLLibraryBranch,
  Shelf as MySQLShelf,
  User as MySQLUser,
  Writes as MySQLWrites,
} from "./mysqlModels/index.js"; // MySQL Models

import {
  Author as MongoAuthor,
  Book as MongoBook,
  BorrowingRecord as MongoBorrowingRecord,
  LibraryBranch as MongoLibraryBranch,
  Shelf as MongoShelf,
  User as MongoUser,
  Writes as MongoWrites,
} from "./mongoModels/index.js"; // MongoDB Models

export const migrateData = async (req, res) => {
  try {
    // Step 1: Migrate Library Branches (no id and timestamps)
    const mongoBranches = await MongoLibraryBranch.find();
    const branchMap = {}; // Map MongoDB IDs to MySQL IDs
    for (const branch of mongoBranches) {
      const mysqlBranch = await MySQLLibraryBranch.create({
        branch_name: branch.branch_name,
        address: branch.address,
        contact_number: branch.contact_number,
      });
      branchMap[branch._id.toString()] = mysqlBranch.branch_id;
    }

    // Step 2: Migrate Authors (no id and timestamps)
    const mongoAuthors = await MongoAuthor.find();
    const authorMap = {};
    for (const author of mongoAuthors) {
      const mysqlAuthor = await MySQLAuthor.create({
        name: author.name,
        biography: author.biography,
        nationality: author.nationality,
        mentor_id: author.mentor ? authorMap[author.mentor.toString()] : null, // Relating mentor based on MongoDB author id
      });
      authorMap[author._id.toString()] = mysqlAuthor.author_id;
    }

    // Step 3: Migrate Shelves (no id and timestamps)
    const mongoShelves = await MongoShelf.find();
    const shelfMap = {};
    for (const shelf of mongoShelves) {
      const mysqlShelf = await MySQLShelf.create({
        shelf_number: shelf.shelf_number,
        category: shelf.category,
        branch_id: branchMap[shelf.branch.toString()],
      });
      shelfMap[shelf._id.toString()] = mysqlShelf.shelf_id;
    }

    // Step 4: Migrate Books (no id and timestamps)
    const mongoBooks = await MongoBook.find().populate("authors");
    const bookMap = {};
    for (const book of mongoBooks) {
      const mysqlBook = await MySQLBook.create({
        title: book.title,
        ISBN: book.ISBN,
        publication_date: book.publication_date,
        status: book.status,
        branch_id: branchMap[book.branch.toString()],
        shelf_id: shelfMap[book.shelf.toString()],
      });
      bookMap[book._id.toString()] = mysqlBook.book_id;

      // Add authors for each book (link the authors in the Books table)
      for (const author of book.authors) {
        await MySQLWrites.create({
          author_id: authorMap[author.toString()],
          book_id: mysqlBook.book_id,
        });
      }
    }

    // Step 5: Migrate Users (no id and timestamps)
    const mongoUsers = await MongoUser.find();
    const userMap = {};
    for (const user of mongoUsers) {
      const mysqlUser = await MySQLUser.create({
        name: user.name,
        email: user.email,
        password: user.password,
        membership_status: user.membership_status,
        role: user.role,
      });
      userMap[user._id.toString()] = mysqlUser.user_id;
    }

    // Step 6: Migrate Borrowing Records (no id and timestamps)
    const mongoRecords = await MongoBorrowingRecord.find();
    for (const record of mongoRecords) {
      await MySQLBorrowingRecord.create({
        borrow_date: record.borrow_date,
        return_date: record.return_date,
        book_id: bookMap[record.book.toString()],
        user_id: userMap[record.user.toString()],
      });
    }

    res.status(200).json({ message: "Data migration successful" });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({ message: "Data migration failed", error: error.message });
  }
};
