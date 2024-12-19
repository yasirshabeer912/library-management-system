import { getModel } from "../utils/modelUtils.js";
// const logger = require("../utils/logger");

export const getAllAuthors = async (req, res) => {
  try {
    const Author = getModel("Author");
    const Writes = getModel("Writes");
    const Book = getModel("Book");

    let authors;

    if (process.env.DB_TYPE === "MongoDB") {
      authors = await Author.find();
    } else if (process.env.DB_TYPE === "MySQL") {
      authors = await Author.findAll();
    }

    res.json(authors);
  } catch (error) {
    // logger.error("Error fetching authors:", error);,error
    res.status(500).json({ message: "Error fetching authors",error });
  }
};

export const getAuthorById = async (req, res) => {
  try {
    const { id } = req.params;
    const Author = getModel("Author");
    const Writes = getModel("Writes");
    const Book = getModel("Book");

    let author;

    if (process.env.DB_TYPE === "MongoDB") {
      author = await Author.findById(id).populate({
        path: "writes",
        populate: { path: "book" },
      });
    } else if (process.env.DB_TYPE === "MySQL") {
      author = await Author.findOne({
        where: { id },
        include: [{ model: Writes, include: [{ model: Book }] }],
      });
    }

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    res.json(author);
  } catch (error) {
    // logger.error("Error fetching author:", error);
    res.status(500).json({ message: "Error fetching author" });
  }
};

export const createAuthor = async (req, res) => {
  try {
    const { name, biography, nationality } = req.body;
    const Author = getModel("Author");

    let author;

    if (process.env.DB_TYPE === "MongoDB") {
      author = new Author({
        name,
        biography,
        nationality,
      });
      await author.save();
    } else if (process.env.DB_TYPE === "MySQL") {
      author = await Author.create({
        name,
        biography,
        nationality,
      });
    }

    // logger.info(`New author created: ${author.name}`);
    res.status(201).json(author);
  } catch (error) {
    // logger.error("Error creating author:", error);
    res.status(500).json({ message: "Error creating author" });
  }
};

export const updateAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, biography, nationality } = req.body;
    const Author = getModel("Author");

    let updatedAuthor;

    if (process.env.DB_TYPE === "MongoDB") {
      updatedAuthor = await Author.findByIdAndUpdate(
        id,
        { name, biography, nationality },
        { new: true }
      );
    } else if (process.env.DB_TYPE === "MySQL") {
      const [updated, authors] = await Author.update(
        { name, biography, nationality },
        { where: { id }, returning: true }
      );
      updatedAuthor = authors[0];
    }

    if (!updatedAuthor) {
      return res.status(404).json({ message: "Author not found" });
    }

    logger.info(`Author updated: ${updatedAuthor.name}`);
    res.json(updatedAuthor);
  } catch (error) {
    // logger.error("Error updating author:", error);
    res.status(500).json({ message: "Error updating author" });
  }
};

export const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const Writes = getModel("Writes");
    const Author = getModel("Author");

    if (process.env.DB_TYPE === "MongoDB") {
      await Writes.deleteMany({ author_id: id });
      await Author.findByIdAndDelete(id);
    } else if (process.env.DB_TYPE === "MySQL") {
      await Writes.destroy({ where: { author_id: id } });
      await Author.destroy({ where: { id } });
    }

    logger.info(`Author deleted: ${id}`);
    res.json({ message: "Author deleted successfully" });
  } catch (error) {
    // logger.error("Error deleting author:", error);
    res.status(500).json({ message: "Error deleting author" });
  }
};
