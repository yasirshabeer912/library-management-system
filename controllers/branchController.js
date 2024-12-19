import { getModel } from "../utils/modelUtils.js";
// const logger = require("../utils/logger");

export const getAllBranches = async (req, res) => {
  try {
    const LibraryBranch = getModel("LibraryBranch");
    const Book = getModel("Book");
    const Shelf = getModel("Shelf");

    let branches;

    if (process.env.DB_TYPE === "MongoDB") {
      branches = await LibraryBranch.find();
    } else if (process.env.DB_TYPE === "MySQL") {
      branches = await LibraryBranch.findAll({
        include: [{ model: Book }, { model: Shelf }],
      });
    }

    res.json(branches);
  } catch (error) {
    // logger.error("Error fetching branches:", error);
    res.status(500).json({ message: "Error fetching branches" });
  }
};

export const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const LibraryBranch = getModel("LibraryBranch");
    const Book = getModel("Book");
    const Shelf = getModel("Shelf");

    let branch;

    if (process.env.DB_TYPE === "MongoDB") {
      branch = await LibraryBranch.findById(id).populate(["books", "shelves"]);
    } else if (process.env.DB_TYPE === "MySQL") {
      branch = await LibraryBranch.findOne({
        where: { id },
        include: [{ model: Book }, { model: Shelf }],
      });
    }

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.json(branch);
  } catch (error) {
    // logger.error("Error fetching branch:", error);
    res.status(500).json({ message: "Error fetching branch" });
  }
};

export const createBranch = async (req, res) => {
  try {
    const { branch_name, address, contact_number } = req.body;
    const LibraryBranch = getModel("LibraryBranch");

    let branch;

    if (process.env.DB_TYPE === "MongoDB") {
      branch = new LibraryBranch({ branch_name, address, contact_number });
      await branch.save();
    } else if (process.env.DB_TYPE === "MySQL") {
      branch = await LibraryBranch.create({
        branch_name,
        address,
        contact_number,
      });
    }

    // logger.info(`New branch created: ${branch.branch_name}`);
    res.status(201).json(branch);
  } catch (error) {
    // logger.error("Error creating branch:", error);
    res.status(500).json({ message: "Error creating branch" });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_name, address, contact_number } = req.body;
    const LibraryBranch = getModel("LibraryBranch");

    let updatedBranch;

    if (process.env.DB_TYPE === "MongoDB") {
      updatedBranch = await LibraryBranch.findByIdAndUpdate(
        id,
        { branch_name, address, contact_number },
        { new: true }
      );
    } else if (process.env.DB_TYPE === "MySQL") {
      const [updated, branches] = await LibraryBranch.update(
        { branch_name, address, contact_number },
        { where: { id }, returning: true }
      );
      updatedBranch = branches[0];
    }

    if (!updatedBranch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // logger.info(`Branch updated: ${updatedBranch.branch_name}`);
    res.json(updatedBranch);
  } catch (error) {
    // logger.error("Error updating branch:", error);
    res.status(500).json({ message: "Error updating branch" });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const Book = getModel("Book");
    const Shelf = getModel("Shelf");
    const LibraryBranch = getModel("LibraryBranch");

    let booksCount;

    if (process.env.DB_TYPE === "MongoDB") {
      booksCount = await Book.countDocuments({ branch_id: id });
    } else if (process.env.DB_TYPE === "MySQL") {
      booksCount = await Book.count({ where: { branch_id: id } });
    }

    if (booksCount > 0) {
      return res.status(400).json({
        message: "Cannot delete branch with existing books",
      });
    }

    if (process.env.DB_TYPE === "MongoDB") {
      await Shelf.deleteMany({ branch_id: id });
      await LibraryBranch.findByIdAndDelete(id);
    } else if (process.env.DB_TYPE === "MySQL") {
      await Shelf.destroy({ where: { branch_id: id } });
      await LibraryBranch.destroy({ where: { id } });
    }

    // logger.info(`Branch deleted: ${id}`);
    res.json({ message: "Branch deleted successfully" });
  } catch (error) {
    // logger.error("Error deleting branch:", error);
    res.status(500).json({ message: "Error deleting branch" });
  }
};
