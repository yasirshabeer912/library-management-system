import { sequelize } from "../../config/database.js";
import Author from "./Author.js";
import Book from "./Book.js";

const Writes = sequelize.define("Writes", {}, { timestamps: false }); // If no extra fields, disable timestamps.

// Define associations with explicit foreign key names
Author.belongsToMany(Book, {
  through: Writes,
  foreignKey: "author_id",
  otherKey: "book_id",
});

Book.belongsToMany(Author, {
  through: Writes,
  foreignKey: "book_id",
  otherKey: "author_id",
});

export default Writes;
