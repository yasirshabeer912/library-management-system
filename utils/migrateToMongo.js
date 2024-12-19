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
import { connectMongoDB } from "../config/database.js";

// Mapping objects to store relationships between MySQL and MongoDB IDs
const idMappings = {
  libraryBranch: new Map(),
  author: new Map(),
  book: new Map(),
  user: new Map(),
  shelf: new Map(),
  writes: new Map(),
};

async function migrateLibraryBranch() {
  try {
    console.log("Starting LibraryBranch Migration to MongoDB...");
    const libraryBranches = await MySQLLibraryBranch.findAll();

    for (let branch of libraryBranches) {
      const newBranch = new MongoLibraryBranch({
        branch_name: branch.branch_name,
        address: branch.address,
        contact_number: branch.contact_number,
      });

      await newBranch.save();

      // Store mapping between MySQL and MongoDB IDs
      idMappings.libraryBranch.set(branch.branch_id, newBranch._id.toString());

      console.log(
        `Migrated LibraryBranch: ${branch.branch_name} with Mongo ID: ${newBranch._id}, MySQL ID: ${branch.branch_id}`
      );
    }
    console.log("LibraryBranch Migration to MongoDB Complete.");
    console.log(
      "LibraryBranch Mappings:",
      Object.fromEntries(idMappings.libraryBranch)
    );
  } catch (error) {
    console.error("Error migrating LibraryBranch to MongoDB:", error);
    throw error;
  }
}

async function migrateAuthor() {
  try {
    console.log("Starting Author Migration to MongoDB...");
    const authors = await MySQLAuthor.findAll();

    for (let author of authors) {
      const newAuthor = new MongoAuthor({
        name: author.name,
        biography: author.biography,
        nationality: author.nationality,
        // Removed the mentor relationship
      });

      await newAuthor.save();

      // Store mapping between MySQL and MongoDB IDs
      idMappings.author.set(author.author_id, newAuthor._id.toString());

      console.log(
        `Migrated Author: ${author.name} with Mongo ID: ${newAuthor._id}, MySQL ID: ${author.author_id}`
      );
    }
    console.log("Author Migration to MongoDB Complete.");
    console.log("Author Mappings:", Object.fromEntries(idMappings.author));
  } catch (error) {
    console.error("Error migrating Author to MongoDB:", error);
    throw error;
  }
}

async function migrateUser() {
  try {
    console.log("Starting User Migration to MongoDB...");
    const users = await MySQLUser.findAll();

    for (let user of users) {
      const newUser = new MongoUser({
        name: user.name,
        email: user.email,
        password: user.password,
        membership_status: user.membership_status,
        role: user.role,
      });

      await newUser.save();

      // Store mapping between MySQL and MongoDB IDs
      idMappings.user.set(user.user_id, newUser._id.toString());

      console.log(
        `Migrated User: ${user.name} with Mongo ID: ${newUser._id}, MySQL ID: ${user.user_id}`
      );
    }
    console.log("User Migration to MongoDB Complete.");
    console.log("User Mappings:", Object.fromEntries(idMappings.user));
  } catch (error) {
    console.error("Error migrating User to MongoDB:", error);
    throw error;
  }
}

async function migrateBook() {
  try {
    console.log("Starting Book Migration to MongoDB...");

    // Fetch the first LibraryBranch from MongoDB if needed
    const firstLibraryBranch = await MongoLibraryBranch.findOne().exec();
    if (firstLibraryBranch) {
      console.log("Founded");
    }
    const books = await MySQLBook.findAll({
      include: [
        { model: MySQLLibraryBranch, as: "branch" }, // Correct alias
        { model: MySQLAuthor, through: MySQLWrites },
      ],
    });

    for (let book of books) {
      // Check if the book has a branch_id in MySQL, else use the first MongoDB branch
      let branchMongoId;
      if (book.branch) {
        console.log("adding in book.branch");
        console.log("");
        branchMongoId =
          idMappings.libraryBranch.get(book.branch.branch_id) ||
          firstLibraryBranch._id.toString();
        console.log("branchMongoId", branchMongoId);
      } else {
        console.log("goin in else");
        // If no branch_id is found, assign the first available branch
        if (firstLibraryBranch) {
          branchMongoId = firstLibraryBranch._id;
          console.warn(
            `No branch found for Book ID ${book.book_id}. Associating with the first branch.`
          );
        } else {
          console.warn(
            `No branch found for Book ID ${book.book_id}, and no default branch available.`
          );
        }
      }

      // Map author IDs from MySQL to MongoDB
      const authorMongoIds = book.Authors
        ? book.Authors.map((author) =>
            idMappings.author.get(author.author_id)
          ).filter(Boolean)
        : [];

      // Create a new MongoDB Book document
      const newBook = new MongoBook({
        title: book.title,
        ISBN: book.ISBN,
        publication_date: book.publication_date,
        status: book.status,
        branch: branchMongoId || undefined, // Skip branch if not found
        authors:
          authorMongoIds.length > 0
            ? await MongoAuthor.find({ _id: { $in: authorMongoIds } })
            : [],
      });

      await newBook.save();

      // Store mapping between MySQL and MongoDB IDs
      idMappings.book.set(book.book_id, newBook._id.toString());

      console.log(
        `Migrated Book: ${book.title} with Mongo ID: ${newBook._id}, MySQL ID: ${book.book_id}`
      );
    }

    console.log("Book Migration to MongoDB Complete.");
    console.log("Book Mappings:", Object.fromEntries(idMappings.book));
  } catch (error) {
    console.error("Error migrating Book to MongoDB:", error);
    throw error;
  }
}

async function migrateBorrowingRecord() {
  try {
    console.log("Starting BorrowingRecord Migration to MongoDB...");
    const borrowingRecords = await MySQLBorrowingRecord.findAll({
      include: [
        {
          model: MySQLUser,
          as: "user",
          required: false,
        },
        {
          model: MySQLBook,
          as: "book",
          required: false,
        },
      ],
    });

    for (let record of borrowingRecords) {
      // Find mapped user and book IDs
      const userMongoId = record.user
        ? idMappings.user.get(record.user.user_id)
        : null;
      const bookMongoId = record.book
        ? idMappings.book.get(record.book.book_id)
        : null;

      if (!userMongoId || !bookMongoId) {
        console.warn(
          `Skipping borrowing record due to missing user or book mapping`
        );
        continue;
      }

      const newRecord = new MongoBorrowingRecord({
        borrow_date: record.borrow_date,
        return_date: record.return_date,
        user: await MongoUser.findById(userMongoId),
        book: await MongoBook.findById(bookMongoId),
      });

      await newRecord.save();

      console.log(
        `Migrated BorrowingRecord for User Mongo ID: ${userMongoId} and Book Mongo ID: ${bookMongoId}`
      );
    }
    console.log("BorrowingRecord Migration to MongoDB Complete.");
  } catch (error) {
    console.error("Error migrating BorrowingRecord to MongoDB:", error);
    throw error;
  }
}

async function migrateShelf() {
  try {
    console.log("Starting Shelf Migration to MongoDB...");
    const shelves = await MySQLShelf.findAll({
      include: [{ model: MySQLLibraryBranch, as: "branch" }],
    });

    for (let shelf of shelves) {
      // Find the mapped branch ID
      const branchMongoId = shelf.branch
        ? idMappings.libraryBranch.get(shelf.branch.branch_id)
        : null;

      if (!branchMongoId) {
        console.warn(
          `Skipping shelf ${shelf.shelf_number} due to missing branch mapping`
        );
        continue;
      }

      const newShelf = new MongoShelf({
        shelf_number: shelf.shelf_number,
        category: shelf.category,
        branch: await MongoLibraryBranch.findById(branchMongoId),
      });

      await newShelf.save();

      // Store mapping between MySQL and MongoDB IDs
      idMappings.shelf.set(shelf.shelf_id, newShelf._id.toString());

      console.log(
        `Migrated Shelf: ${shelf.shelf_number} with Mongo ID: ${newShelf._id}, MySQL ID: ${shelf.shelf_id}`
      );
    }
    console.log("Shelf Migration to MongoDB Complete.");
    console.log("Shelf Mappings:", Object.fromEntries(idMappings.shelf));
  } catch (error) {
    console.error("Error migrating Shelf to MongoDB:", error);
    throw error;
  }
}

async function migrateWrites() {
  try {
    console.log("Starting Writes Migration to MongoDB...");
    const writes = await MySQLWrites.findAll({
      include: [
        { model: MySQLAuthor, as: "author" }, // Use 'as' as defined in the association
        { model: MySQLBook, as: "book" }, // Use 'as' as defined in the association
      ],
    });

    for (let write of writes) {
      // Find mapped author and book IDs
      const authorMongoId = write.author
        ? idMappings.author.get(write.author.author_id)
        : null;
      const bookMongoId = write.book
        ? idMappings.book.get(write.book.book_id)
        : null;

      if (!authorMongoId || !bookMongoId) {
        console.warn(
          `Skipping writes record due to missing author or book mapping`
        );
        continue;
      }

      // Create a new Writes document in MongoDB
      const newWrite = new MongoWrites({
        author: await MongoAuthor.findById(authorMongoId),
        book: await MongoBook.findById(bookMongoId),
      });

      await newWrite.save();

      console.log(
        `Migrated Writes Record: Author Mongo ID ${authorMongoId}, Book Mongo ID ${bookMongoId}`
      );
    }
    console.log("Writes Migration to MongoDB Complete.");
  } catch (error) {
    console.error("Error migrating Writes to MongoDB:", error);
    throw error;
  }
}

export async function migrateMySQLToMongo() {
  try {
    console.log("Starting Complete Database Migration to MongoDB...");
    await connectMongoDB()
    // Sequentially migrate entities to respect foreign key constraints
    await migrateLibraryBranch();
    await migrateAuthor();
    await migrateUser();
    await migrateBook();
    await migrateShelf();
    await migrateWrites();
    await migrateBorrowingRecord();

    console.log("Full Migration to MongoDB Completed Successfully!");
    return {
      success: true,
      mappings: idMappings,
    };
  } catch (error) {
    console.error("Error during complete migration to MongoDB:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
