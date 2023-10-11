import asyncHandler from "express-async-handler";
import User from "../Models/User.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const register = asyncHandler(async (req, res) => {
  const { username, password, role } = req.body;
  const allowedRoles = ["user", "admin"];

  if (!username || !password || !role) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }
  if (!allowedRoles.includes(role.toLowerCase()))
    return res
      .status(400)
      .json({ error: true, message: "Invalid choice of role" });

  // format role into right word format
  let firstLetterRole = role.slice(0, 1);
  const upperCaseFirstLeter = firstLetterRole.toUpperCase();
  const restOfLetterRole = role.slice(1);
  const formattedRole = upperCaseFirstLeter + restOfLetterRole;

  const existingUser = await User.findOne({ username });
  if (existingUser)
    return res
      .status(409)
      .json({ error: true, message: `Username ${username} already exist` });

  const hashedPass = await bcrypt.hash(password, 10);

  const createUser = new User({
    username,
    password: hashedPass,
    role: formattedRole,
  });
  let createdUser = await createUser.save();

  // set the response into object
  const response = createdUser.toObject();
  delete response.password;

  res.status(201).json({ success: true, data: response });
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Fill all the necessary information" });
  }

  const foundUSer = await User.findOne({ username });

  if (!foundUSer) {
    return res.status(404).json({ error: true, message: "Account not found" });
  }

  const isMatch = await bcrypt.compare(password, foundUSer.password);
  if (!isMatch)
    return res
      .status(400)
      .json({ error: true, message: "Wrong username or password" });

  // implement jwt here
  const access_token = jwt.sign(
    {
      role: foundUSer.role,
      username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  res.cookie("jwt", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.json({ access_token });
});

// GET method
// logout private access

const logout = (req, res) => {
  const cookie = req.cookies;
  console.log(cookie);

  if (!cookie) return res.sendStatus(204);

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.sendStatus(204);
};

// GET method
// private access
const getUser = (req, res) => {
  if (!req?.user || !req?.role) {
    const cookie = req.cookies;

    if (!cookie) return res.sendStatus(204);

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.sendStatus(401);
  } else {
    res.json({ user: req.user, role: req.role });
  }
};

export { register, login, logout, getUser };
