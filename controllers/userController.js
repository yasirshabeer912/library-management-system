import { getModel } from "../utils/modelUtils.js";
import bcrypt from "bcryptjs";

export const seedUsers = async (req, res) => {
  try {
    const User = getModel("User"); // Get the appropriate model

    const usersData = [
      {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        membership_status: "active",
        role: "user",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "librarian456",
        membership_status: "active",
        role: "librarian",
      },
    ];

    for (const userData of usersData) {
      let existingUser;

      if (process.env.DB_TYPE === "MongoDB") {
        // MongoDB: Find user by email
        existingUser = await User.findOne({ email: userData.email });
      } else if (process.env.DB_TYPE === "MySQL") {
        // MySQL: Find user by email
        existingUser = await User.findOne({
          where: { email: userData.email },
        });
      }

      if (!existingUser) {
        // Hash password for MongoDB
        if (process.env.DB_TYPE === "MongoDB") {
          const salt = await bcrypt.genSalt(10);
          userData.password = await bcrypt.hash(userData.password, salt);
        }

        // Create user in the database
        await User.create(userData);
      }
    }

    res.status(201).json({ message: "Users seeded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error seeding users", error: error });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const User = getModel("User");

    let users;

    if (process.env.DB_TYPE === "MongoDB") {
      // MongoDB: Fetch all users with selected fields
      users = await User.find({}, 'id name email membership_status role created_at updated_at');
    } else if (process.env.DB_TYPE === "MySQL") {
      // MySQL: Fetch all users with selected attributes
      users = await User.findAll({
        attributes: [
          // "id",
          "name",
          "email",
          "membership_status",
          "role",
          // "created_at",
          // "updated_at",
        ],
      });
    }

    res.json(users);
  } catch (error) {
    // logger.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users",error });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is authorized to view this profile
    if (req.user.role !== "LIBRARIAN" && req.user.id !== id) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this profile" });
    }

    const User = getModel("User");
    const BorrowingRecord = getModel("BorrowingRecord");

    let user;

    if (process.env.DB_TYPE === "MongoDB") {
      // MongoDB: Fetch user and related borrowings
      user = await User.findById(id).populate('borrowings');
    } else if (process.env.DB_TYPE === "MySQL") {
      // MySQL: Fetch user with borrowings
      user = await User.findOne({
        where: { id },
        attributes: [
          "id",
          "name",
          "email",
          "membership_status",
          "role",
          // "created_at",
          // "updated_at",
        ],
        include: [
          {
            model: BorrowingRecord,
            include: ["book"], // Assuming 'book' is the related model name
          },
        ],
      });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    // logger.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, membership_status } = req.body;

    // Check if user is authorized to update this profile
    if (req.user.role !== "LIBRARIAN" && req.user.id !== id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this profile" });
    }

    const updateData = {
      name,
      email,
      ...(password && { password: await bcrypt.hash(password, 10) }),
      ...(req.user.role === "LIBRARIAN" && { membership_status }),
    };

    const User = getModel("User");

    let updatedUser;

    if (process.env.DB_TYPE === "MongoDB") {
      // MongoDB: Update user by ID
      updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    } else if (process.env.DB_TYPE === "MySQL") {
      // MySQL: Update user by ID
      const [updated] = await User.update(updateData, {
        where: { id },
        returning: true,
      });

      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }

      updatedUser = await User.findOne({
        where: { id },
        attributes: [
          "id",
          "name",
          "email",
          "membership_status",
          "role",
          // "created_at",
          // "updated_at",
        ],
      });
    }

    // logger.info(`User updated: ${updatedUser.email}`);
    res.json(updatedUser);
  } catch (error) {
    // logger.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user",error });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const BorrowingRecord = getModel("BorrowingRecord");
    const User = getModel("User");

    // Check for active borrowings
    let activeBorrowings;
    if (process.env.DB_TYPE === "MongoDB") {
      activeBorrowings = await BorrowingRecord.find({ user_id: id, return_date: null });
    } else if (process.env.DB_TYPE === "MySQL") {
      activeBorrowings = await BorrowingRecord.findAll({
        where: {
          user_id: id,
          return_date: null,
        },
      });
    }

    if (activeBorrowings.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete user with active borrowings" });
    }

    // Delete borrowing records and user
    if (process.env.DB_TYPE === "MongoDB") {
      await BorrowingRecord.deleteMany({ user_id: id });
      await User.findByIdAndDelete(id);
    } else if (process.env.DB_TYPE === "MySQL") {
      await BorrowingRecord.destroy({ where: { user_id: id } });
      await User.destroy({ where: { id } });
    }

    // logger.info(`User deleted: ${id}`);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    // logger.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};
