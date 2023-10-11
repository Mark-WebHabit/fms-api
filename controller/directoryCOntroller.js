import path from "path";
import asyncHandler from "express-async-handler";
import fs from "fs";

import Folder from "../Models/Folder.js";
import File from "../Models/File.js";
import removeDirectoryRecursively from "../utilities/removeDir.js";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// desc - method GET
// endpoint /api/folder
// private access
const getFolders = asyncHandler(async (req, res) => {
  const folders = await Folder.find({});

  if (!folders) {
    // If no folders are found, send an empty array as the response
    res.json({ folders: [] });
  } else {
    // If folders are found, send them as the response
    res.json({ folders });
  }
});

// desc - method POST
// endpoint /api/folders
// private access
const createFolder = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const folderPath = path.join(
    __dirname,
    "..",
    "..",
    "frontend",
    "files",
    name
  );

  if (!name)
    return res
      .status(400)
      .json({ error: true, message: "Invalid Directory Name" });

  const existingFolder = await Folder.findOne({ name });

  if (fs.existsSync(path.join(folderPath)))
    return res
      .status(409)
      .json({ error: true, message: "Folder already exists" });
  if (existingFolder)
    return res
      .status(409)
      .json({ error: true, message: "Folder already exists" });

  fs.mkdirSync(folderPath, { recursive: true });

  // savee to database
  const newFolder = new Folder({
    name,
  });

  let createdFolder = await newFolder.save();

  // set the response into object
  const response = createdFolder.toObject();

  return res.status(201).json({ response });
});

// desc - method DELEET
// endpoint /api/folders/:id
// private access
const deleteFolder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ error: true, message: "Invalid parameter" });

  const existingFolder = await Folder.findById(id);

  if (!existingFolder)
    return res.status(404).json({ error: true, message: "Folder not found" });

  const content = existingFolder.content;

  const folderPath = path.join(
    __dirname,
    "..",
    "..",
    "frontend",
    "files",
    existingFolder.name
  );

  if (folderPath) {
    await removeDirectoryRecursively(folderPath);

    for (const fileId of content) {
      await File.findByIdAndRemove(fileId);
    }
    await Folder.findByIdAndDelete(existingFolder._id);

    return res.json({ message: "Fodler deleted" });
  } else {
    return res
      .status(409)
      .json({ error: true, message: "Failed to delete local folder" });
  }
});

export { createFolder, getFolders, deleteFolder };
