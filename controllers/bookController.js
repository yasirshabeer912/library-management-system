import { getModel } from "../utils/modelUtils.js";
// const logger = require("../utils/logger");

export const getAllBooks = async (req, res) => {
  try {
    const Book = getModel("Book");
    const Writes = getModel("Writes");
    const Author = getModel("Author");
    const LibraryBranch = getModel("LibraryBranch");
    const Shelf = getModel("Shelf");

    let books;

    if (process.env.DB_TYPE === "MongoDB") {
      books = await Book.find()
        .populate("authors")
        .populate("branch")
        // .populate("shelf");
    } else if (process.env.DB_TYPE === "MySQL") {
      books = await Book.findAll({
        include: [
          { model: Writes, include: [{ model: Author }] },
          { model: LibraryBranch },
          { model: Shelf },
        ],
      });
    }

    res.json(books);
  } catch (error) {
    // logger.error("Error fetching books:", error);
    res.status(500).json({ message: "Error fetching books" });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const Book = getModel("Book");
    const Writes = getModel("Writes");

    if (process.env.DB_TYPE === "MongoDB") {
      await Writes.deleteMany({ book_id: id });
      const book = await Book.findByIdAndDelete(id);

      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
    } else if (process.env.DB_TYPE === "MySQL") {
      await Writes.destroy({ where: { book_id: id } });
      const deleted = await Book.destroy({ where: { book_id: id } });

      if (!deleted) {
        return res.status(404).json({ message: "Book not found" });
      }
    }

    // logger.info(`Book deleted: ${id}`);
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    // logger.error("Error deleting book:", error);
    res.status(500).json({ message: "Error deleting book" });
  }
};

export const addBook = async (req, res) => {
  try {
    const { title, ISBN, publication_date, branch_id, shelf_id, authors } =
      req.body;

    const Book = getModel("Book");
    const LibraryBranch = getModel("LibraryBranch");
    const Shelf = getModel("Shelf");
    const Author = getModel("Author");

    const branch = await LibraryBranch.findByPk(branch_id);
    if (!branch) {
      return res.status(404).json({ message: "Library branch not found" });
    }

    const shelf = await Shelf.findOne(
      process.env.DB_TYPE === "MongoDB"
        ? { _id: shelf_id, branch: branch_id }
        : { where: { shelf_id, branch_id } }
    );
    if (!shelf) {
      return res
        .status(404)
        .json({ message: "Shelf not found in the specified branch" });
    }

    const book = await Book.create({
      title,
      ISBN,
      publication_date,
      status: "available",
      ...(process.env.DB_TYPE === "MongoDB"
        ? { branch: branch_id, shelf: shelf_id }
        : { branch_id, shelf_id }),
    });

    if (process.env.DB_TYPE === "MongoDB") {
      book.authors = authors;
      await book.save();
    } else {
      const Writes = getModel("Writes");
      for (let authorId of authors) {
        const author = await Author.findByPk(authorId);
        if (author) {
          await Writes.create({ author_id: authorId, book_id: book.book_id });
        }
      }
    }

    res.status(201).json(book);
  } catch (error) {
    // logger.error("Error adding book:", error);
    res
      .status(500)
      .json({ message: "Error adding book", error: error.message });
  }
};
