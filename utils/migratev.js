import {
  Author as MySQLAuthor,
  Book as MySQLBook,
  BorrowingRecord as MySQLBorrowingRecord,
  LibraryBranch as MySQLLibraryBranch,
  User as MySQLUser,
  Shelf as MySQLShelf,
  Writes as MySQLWrites,
} from "../models/mysql/index.js"; // MySQL Models

import {
  Author as MongoAuthor,
  Book as MongoBook,
  BorrowingRecord as MongoBorrowingRecord,
  LibraryBranch as MongoLibraryBranch,
  User as MongoUser,
  Shelf as MongoShelf,
  Writes as MongoWrites,
} from "../models/mongodb/index.js"; // MongoDB Models
import mongoose from "mongoose";

// Mapping objects to store relationships between MongoDB and MySQL IDs
const idMappings = {
  libraryBranch: new Map(),
  author: new Map(),
  book: new Map(),
  user: new Map(),
  shelf: new Map(),
  writes: new Map(),
};
const connectMongoDB = async () => {
  const mongoUri = process.env.MONGODB_URL; // Access the environment variable
  if (!mongoUri) {
    throw new Error('MONGODB_URL is not defined in environment variables.');
  }
  try {
    await mongoose.connect(mongoUri, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      connectTimeoutMS: 20000, // Increase connection timeout
  socketTimeoutMS: 20000, // Increase socket timeout
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
async function migrateLibraryBranch() {
  
  try {
    console.log("Starting LibraryBranch Migration...");
    const libraryBranches = await MongoLibraryBranch.find();

    for (let branch of libraryBranches) {
      const newBranch = await MySQLLibraryBranch.create({
        branch_name: branch.branch_name,
        address: branch.address,
        contact_number: branch.contact_number,
      });

      // Store mapping between MongoDB and MySQL IDs
      idMappings.libraryBranch.set(branch._id.toString(), newBranch.branch_id);

      console.log(
        `Migrated LibraryBranch: ${branch.branch_name} with MySQL ID: ${newBranch.branch_id}, Mongo ID: ${branch._id}`
      );
    }
    console.log("LibraryBranch Migration Complete.");
    console.log(
      "LibraryBranch Mappings:",
      Object.fromEntries(idMappings.libraryBranch)
    );
  } catch (error) {
    console.error("Error migrating LibraryBranch:", error);
    throw error;
  }
}

async function migrateAuthor() {
  try {
    console.log("Starting Author Migration...");
    const authors = await MongoAuthor.find();

    for (let author of authors) {
      const newAuthor = await MySQLAuthor.create({
        name: author.name,
        biography: author.biography,
        nationality: author.nationality,
        // Use mapped mentor ID if exists
        mentor_id: author.mentor
          ? idMappings.author.get(author.mentor._id.toString())
          : null,
      });

      // Store mapping between MongoDB and MySQL IDs
      idMappings.author.set(author._id.toString(), newAuthor.author_id);

      console.log(
        `Migrated Author: ${author.name} with MySQL ID: ${newAuthor.author_id}, Mongo ID: ${author._id}`
      );
    }
    console.log("Author Migration Complete.");
    console.log("Author Mappings:", Object.fromEntries(idMappings.author));
  } catch (error) {
    console.error("Error migrating Author:", error);
    throw error;
  }
}

async function migrateUser() {
  try {
    console.log("Starting User Migration...");
    const users = await MongoUser.find();

    for (let user of users) {
      const newUser = await MySQLUser.create({
        name: user.name,
        email: user.email,
        password: user.password,
        membership_status: user.membership_status,
        role: user.role,
      });

      // Store mapping between MongoDB and MySQL IDs
      idMappings.user.set(user._id.toString(), newUser.user_id);

      console.log(
        `Migrated User: ${user.name} with MySQL ID: ${newUser.user_id}, Mongo ID: ${user._id}`
      );
    }
    console.log("User Migration Complete.");
    console.log("User Mappings:", Object.fromEntries(idMappings.user));
  } catch (error) {
    console.error("Error migrating User:", error);
    throw error;
  }
}

async function migrateBook() {
  try {
    console.log("Starting Book Migration...");
    // Populate branch and authors to ensure we have the correct references
    const books = await MongoBook.find().populate("branch authors");

    for (let book of books) {
      console.log(`Processing Book: ${book.title}`);
      console.log(`Book Branch:`, book.branch);

      // Ensure we have a valid branch ID mapping
      const branchId = book.branch
        ? idMappings.libraryBranch.get(book.branch._id.toString())
        : null;

      console.log(`Branch Mapping:`, {
        mongoId: book.branch?._id.toString(),
        mysqlId: branchId,
      });

      if (!branchId) {
        console.warn(
          `Skipping book ${book.title} due to missing branch mapping`
        );
        continue;
      }

      const newBook = await MySQLBook.create({
        title: book.title,
        ISBN: book.ISBN,
        publication_date: book.publication_date,
        status: book.status,
        branch_id: branchId,
      });

      // Store mapping between MongoDB and MySQL IDs
      idMappings.book.set(book._id.toString(), newBook.book_id);

      // Handle author associations
      if (book.authors && book.authors.length > 0) {
        for (let author of book.authors) {
          const mysqlAuthorId = idMappings.author.get(author._id.toString());
          if (mysqlAuthorId) {
            await newBook.addAuthor(mysqlAuthorId);
          }
        }
      }

      console.log(
        `Migrated Book: ${book.title} with MySQL ID: ${newBook.book_id}, Mongo ID: ${book._id}`
      );
    }
    console.log("Book Migration Complete.");
    console.log("Book Mappings:", Object.fromEntries(idMappings.book));
  } catch (error) {
    console.error("Error migrating Book:", error);
    throw error;
  }
}

async function migrateBorrowingRecord() {
  try {
    console.log("Starting BorrowingRecord Migration...");
    // Populate user and book to ensure we have the correct references
    const borrowingRecords = await MongoBorrowingRecord.find().populate(
      "user book"
    );

    for (let record of borrowingRecords) {
      console.log(`Processing Borrowing Record:`, record);
      console.log(`User:`, record.user);
      console.log(`Book:`, record.book);

      // Ensure we have valid user and book ID mappings
      const userId = record.user
        ? idMappings.user.get(record.user._id.toString())
        : null;
      const bookId = record.book
        ? idMappings.book.get(record.book._id.toString())
        : null;

      console.log(`User Mapping:`, {
        mongoId: record.user?._id.toString(),
        mysqlId: userId,
      });
      console.log(`Book Mapping:`, {
        mongoId: record.book?._id.toString(),
        mysqlId: bookId,
      });

      if (!userId || !bookId) {
        console.warn(
          `Skipping borrowing record due to missing user or book mapping`
        );
        continue;
      }

      const newRecord = await MySQLBorrowingRecord.create({
        borrow_date: record.borrow_date,
        return_date: record.return_date,
        user_id: userId,
        book_id: bookId,
      });

      console.log(
        `Migrated BorrowingRecord for User ID: ${userId} and Book ID: ${bookId}`
      );
    }
    console.log("BorrowingRecord Migration Complete.");
  } catch (error) {
    console.error("Error migrating BorrowingRecord:", error);
    throw error;
  }
}

async function migrateShelf() {
  try {
    console.log("Starting Shelf Migration...");
    // Populate branch to ensure we have the correct references
    const shelves = await MongoShelf.find().populate("branch");

    for (let shelf of shelves) {
      console.log(`Processing Shelf: ${shelf.shelf_number}`);

      // Ensure we have a valid branch ID mapping
      const branchId = shelf.branch
        ? idMappings.libraryBranch.get(shelf.branch._id.toString())
        : null;

      if (!branchId) {
        console.warn(
          `Skipping shelf ${shelf.shelf_number} due to missing branch mapping`
        );
        continue;
      }

      const newShelf = await MySQLShelf.create({
        shelf_number: shelf.shelf_number,
        category: shelf.category,
        branch_id: branchId,
      });

      // Store mapping between MongoDB and MySQL IDs
      idMappings.shelf.set(shelf._id.toString(), newShelf.shelf_id);

      console.log(
        `Migrated Shelf: ${shelf.shelf_number} with MySQL ID: ${newShelf.shelf_id}, Mongo ID: ${shelf._id}`
      );
    }
    console.log("Shelf Migration Complete.");
    console.log("Shelf Mappings:", Object.fromEntries(idMappings.shelf));
  } catch (error) {
    console.error("Error migrating Shelf:", error);
    throw error;
  }
}

async function migrateWrites() {
  try {
    console.log("Starting Writes Migration...");
    const writes = await MongoWrites.find();

    for (let write of writes) {
      const mysqlAuthorId = idMappings.author.get(write.author.toString());
      const mysqlBookId = idMappings.book.get(write.book.toString());

      if (!mysqlAuthorId || !mysqlBookId) {
        console.warn(`Skipping Writes Record: Invalid mapping for author_id: ${write.author} or book_id: ${write.book}`);
        continue;
      }

      // Check for existing record in MySQL
      const existingWrite = await MySQLWrites.findOne({
        where: { author_id: mysqlAuthorId, book_id: mysqlBookId }
      });

      if (existingWrite) {
        console.warn(`Duplicate Write Found: Skipping author_id: ${mysqlAuthorId}, book_id: ${mysqlBookId}`);
        continue;
      }

      await MySQLWrites.create({
        author_id: mysqlAuthorId,
        book_id: mysqlBookId
      });

      console.log(`Migrated Writes Record: author_id: ${mysqlAuthorId}, book_id: ${mysqlBookId}`);
    }
    console.log("Writes Migration Complete.");
  } catch (error) {
    console.error("Error migrating Writes:", error);
    throw error;
  }
}

export async function migrateFromMongoToMysql() {
  try {
    console.log("Starting Complete Database Migration...");
    await connectMongoDB();
    await migrateLibraryBranch();
    await migrateAuthor();
    await migrateUser();
    await migrateBook();
    await migrateShelf();
    await migrateWrites();
    await migrateBorrowingRecord();

    console.log("Full Migration Completed Successfully!");
    return {
      success: true,
      mappings: idMappings,
    };
  } catch (error) {
    console.error("Error during complete migration:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
