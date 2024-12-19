import { getModel } from "../utils/modelUtils.js";
// const logger = require("../utils/logger");

export const getAllShelves = async (req, res) => {
  try {
    const Shelf = getModel("Shelf");
    const LibraryBranch = getModel("LibraryBranch");

    let shelves;

    if (process.env.DB_TYPE === "MongoDB") {
      shelves = await Shelf.find().populate("branch");
    } else if (process.env.DB_TYPE === "MySQL") {
      shelves = await Shelf.findAll({
        include: [{ model: LibraryBranch }],
      });
    }

    res.json(shelves);
  } catch (error) {
    // logger.error("Error fetching shelves:", error);
    res.status(500).json({ message: "Error fetching shelves" ,error});
  }
};

export const getShelfById = async (req, res) => {
  try {
    const { id } = req.params;
    const Shelf = getModel("Shelf");
    const LibraryBranch = getModel("LibraryBranch");

    let shelf;

    if (process.env.DB_TYPE === "MongoDB") {
      shelf = await Shelf.findById(id).populate("branch");
    } else if (process.env.DB_TYPE === "MySQL") {
      shelf = await Shelf.findOne({
        where: { id },
        include: [{ model: LibraryBranch }],
      });
    }

    if (!shelf) {
      return res.status(404).json({ message: "Shelf not found" });
    }

    res.json(shelf);
  } catch (error) {
    // logger.error("Error fetching shelf:", error);
    res.status(500).json({ message: "Error fetching shelf",error });
  }
};

export const createShelf = async (req, res) => {
  try {
    const { shelf_number, category, branch_id } = req.body;
    const Shelf = getModel("Shelf");

    let existingShelf;

    if (process.env.DB_TYPE === "MongoDB") {
      existingShelf = await Shelf.findOne({ shelf_number, branch_id });
    } else if (process.env.DB_TYPE === "MySQL") {
      existingShelf = await Shelf.findOne({
        where: { shelf_number, branch_id },
      });
    }

    if (existingShelf) {
      return res.status(400).json({
        message: "Shelf number already exists in this branch",
      });
    }

    let shelf;

    if (process.env.DB_TYPE === "MongoDB") {
      shelf = new Shelf({
        shelf_number,
        category,
        branch:branch_id,
      });
      await shelf.save();
    } else if (process.env.DB_TYPE === "MySQL") {
      shelf = await Shelf.create({
        shelf_number,
        category,
        branch_id,
      });
    }

    // logger.info(
    //   `New shelf created: ${shelf.shelf_number} in branch ${branch_id}`
    // );
    res.status(201).json(shelf);
  } catch (error) {
    // logger.error("Error creating shelf:", error);
    res.status(500).json({ message: "Error creating shelf",error });
  }
};

export const updateShelf = async (req, res) => {
  try {
    const { id } = req.params;
    const { shelf_number, category, branch_id } = req.body;
    const Shelf = getModel("Shelf");

    let existingShelf;

    if (process.env.DB_TYPE === "MongoDB") {
      existingShelf = await Shelf.findOne({
        shelf_number,
        branch_id,
        _id: { $ne: id },
      });
    } else if (process.env.DB_TYPE === "MySQL") {
      existingShelf = await Shelf.findOne({
        where: {
          shelf_number,
          branch_id,
          NOT: { id },
        },
      });
    }

    if (existingShelf) {
      return res.status(400).json({
        message: "Shelf number already exists in this branch",
      });
    }

    let updatedShelf;

    if (process.env.DB_TYPE === "MongoDB") {
      updatedShelf = await Shelf.findByIdAndUpdate(
        id,
        { shelf_number, category, branch_id },
        { new: true }
      );
    } else if (process.env.DB_TYPE === "MySQL") {
      const [updated, shelves] = await Shelf.update(
        { shelf_number, category, branch_id },
        { where: { id }, returning: true }
      );
      updatedShelf = shelves[0];
    }

    if (!updatedShelf) {
      return res.status(404).json({ message: "Shelf not found" });
    }

    // logger.info(`Shelf updated: ${updatedShelf.shelf_number}`);
    res.json(updatedShelf);
  } catch (error) {
    // logger.error("Error updating shelf:", error);
    res.status(500).json({ message: "Error updating shelf" });
  }
};

export const deleteShelf = async (req, res) => {
  try {
    const { id } = req.params;
    const Shelf = getModel("Shelf");

    if (process.env.DB_TYPE === "MongoDB") {
      await Shelf.findByIdAndDelete(id);
    } else if (process.env.DB_TYPE === "MySQL") {
      await Shelf.destroy({ where: { id } });
    }

    // logger.info(`Shelf deleted: ${id}`);
    res.json({ message: "Shelf deleted successfully" });
  } catch (error) {
    // logger.error("Error deleting shelf:", error);
    res.status(500).json({ message: "Error deleting shelf" });
  }
};
