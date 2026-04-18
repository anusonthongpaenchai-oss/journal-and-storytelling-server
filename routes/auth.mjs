import { Router } from "express";
import connectionPool, { isDbConfigured } from "../utils/db.mjs";
import supabase, { isSupabaseConfigured } from "../utils/supabase.mjs";
import protectUser from "../middlewares/protectUser.mjs";

const authRouter = Router();

async function findUserByUsername(username) {
  const usernameCheckQuery = `
    SELECT * FROM users
    WHERE username = $1
  `;

  const { rows } = await connectionPool.query(usernameCheckQuery, [username]);
  return rows;
}

async function findUserById(userId) {
  const query = `
    SELECT * FROM users
    WHERE id = $1
  `;

  const { rows } = await connectionPool.query(query, [userId]);
  return rows[0] || null;
}

async function registerUser(req, res, role) {
  const { email, password, username, name } = req.body;

  if (!isDbConfigured || !isSupabaseConfigured) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const existingUser = await findUserByUsername(username);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "This username is already taken" });
    }

    const { data, error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (supabaseError) {
      if (supabaseError.code === "user_already_exists") {
        return res
          .status(400)
          .json({ error: "User with this email already exists" });
      }

      return res
        .status(400)
        .json({ error: "Failed to create user. Please try again." });
    }

    const supabaseUserId = data.user.id;
    const query = `
      INSERT INTO users (id, username, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [supabaseUserId, username, name, role];
    const { rows } = await connectionPool.query(query, values);

    return res.status(201).json({
      message: `${role} created successfully`,
      user: rows[0],
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred during registration" });
  }
}

async function loginUser(req, res, requiredRole = null) {
  const { email, password } = req.body;

  if (!isDbConfigured || !isSupabaseConfigured) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (
        error.code === "invalid_credentials" ||
        error.message.includes("Invalid login credentials")
      ) {
        return res.status(400).json({
          error: "Your password is incorrect or this email doesn't exist",
        });
      }

      return res.status(400).json({ error: error.message });
    }

    if (requiredRole) {
      const user = await findUserById(data.user.id);

      if (!user) {
        return res.status(404).json({ error: "User profile not found" });
      }

      if (user.role !== requiredRole) {
        return res.status(403).json({
          error: "Forbidden: You do not have admin access",
        });
      }
    }

    return res.status(200).json({
      message: "Signed in successfully",
      access_token: data.session.access_token,
    });
  } catch (error) {
    return res.status(500).json({ error: "An error occurred during login" });
  }
}

authRouter.post("/register", async (req, res) => {
  return registerUser(req, res, "user");
});

authRouter.post("/admin/register", async (req, res) => {
  return registerUser(req, res, "admin");
});

authRouter.post("/login", async (req, res) => {
  return loginUser(req, res);
});

authRouter.post("/admin/login", async (req, res) => {
  return loginUser(req, res, "admin");
});

authRouter.get("/get-user", protectUser, async (req, res) => {
  if (!isDbConfigured) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }

    return res.status(200).json({
      id: req.user.id,
      email: req.user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      profilePic: user.profile_pic,
      bio: user.bio,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default authRouter;
