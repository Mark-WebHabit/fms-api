import path from "path";
import os from "os";
import asyncHandler from "express-async-handler";
import fs, { existsSync } from "fs";

import { fileURLToPath } from "url";

import File from "../Models/File.js";
import Folder from "../Models/Folder.js";

import {
  getFileExtension,
  getFileType,
} from "../utilities/getFileExtension.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.join(__dirname, "..", "..", "frontend", "files");

// GET method
// endpoint /api/files
// private access

const getFiles = asyncHandler(async (req, res) => {
  if (!fs.existsSync(directoryPath)) {
    await fsPromises.mkdir(directoryPath);
  }

  // Read the directory contents
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ error: true, message: "Error reading directory" });
    }

    // Respond with the list of files
    res.json({ files });
  });
});

// GET method
// endpoint /api/files/:id
// private access

const getFile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ error: true, message: "Invalid Parameter" });

  const file = await File.findById(id);

  if (!file)
    return res.status(404).json({ error: true, message: "File not found" });

  return res.json({ file });
});

// POST method
// endpoint /api/files
// private access

const uploadFile = asyncHandler(async (req, res) => {
  const { folder, file } = req.body;

  if (!file?.name)
    return res.status(404).json({ error: true, message: "No file selected" });
  if (!folder)
    return res.status(404).json({ error: true, message: "No folder selected" });

  const allowedFIleType = [
    "text/plain",
    "text/markdown",
    "text/csv",
    "text/html",
    "application/json",
  ];

  // if file already exists to local storage
  const existingFolder = await Folder.findById(folder); // if file already exists to local storage
  if (!existingFolder)
    return res.status(404).json({ error: true, message: "No folder selected" });

  // if the folder already exists in local storage
  const createdFodlerPath = path.join(directoryPath, existingFolder.name);

  if (!fs.existsSync(createdFodlerPath))
    return res
      .status(409)
      .json({ error: true, message: "Selected Folder does not exists" });

  // if it has a valid file type
  if (!allowedFIleType.includes(file.type))
    return res.status(400).json({ error: true, message: "Invalid File type" });

  const maxSize = 3; //megabytes
  const kbSIze = file && file.size / 1024;
  const mbSize = kbSIze / 1024;

  if (mbSize > maxSize)
    return res.status(400).json({ error: true, message: "File too big" });

  if (fs.existsSync(path.join(createdFodlerPath, file.name)))
    return res
      .status(409)
      .json({ error: true, message: "File already exists" });

  // upload to db
  const createFile = new File({
    name: file.name,
    ext: getFileExtension(file.name),
    size: Number(file.size),
    type: file.type,
    content: file.content,
    absPath: createdFodlerPath,
  });
  const cratedFile = await createFile.save();

  existingFolder.content.push(cratedFile._id);
  await existingFolder.save();

  fs.writeFileSync(
    path.join(directoryPath, existingFolder.name, file.name),
    file.content
  );

  return res.status(201).json({ file });
});

// DELETE method
// endpoint /api/files/:id
// private access

const deleteFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { folder } = req.body;
  const foundFolder = await Folder.findById(folder);
  const foundFile = await File.findById(id);
  const folderPath = foundFile.absPath;

  if (!id)
    return res.status(400).json({ error: true, message: "Invalid parameter" });

  if (!foundFolder) {
    return res.status(404).json({ error: true, message: "Folder not found" });
  }
  if (!foundFile)
    return res.status(404).json({ error: true, message: "File not found" });

  const isFileExisting = foundFolder.content.some((el) => el.equals(id));

  if (!isFileExisting)
    return res.status(404).json({ error: true, message: "File not found" });

  fs.unlink(path.join(folderPath, foundFile.name), async (err) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: true, message: "Error deleting file" });
    } else {
      const newContent = foundFolder.content.filter((el) => !el.equals(id));
      foundFolder.content = newContent;
      await foundFolder.save();

      await File.deleteOne({ _id: foundFile._id });

      return res.json({ message: "File deleted" });
    }
  });
});

// PUT method
// endpoint /api/files/:id
// private access

const updateFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  //  allow empty content

  if (!id)
    return res.status(400).json({ error: true, message: "Invalid parameter" });

  const updatedFile = await File.findByIdAndUpdate(
    id,
    { content },
    { new: true }
  );
  const filePath = updatedFile.absPath;

  fs.writeFileSync(path.join(filePath, updatedFile.name), updatedFile.content);

  res.json(updatedFile);
});

// POST method
// endpoint /api/files/create
// private access

const makeFile = asyncHandler(async (req, res) => {
  const { filename, fileext, folderId } = req.body;

  if (filename === "" || fileext === "" || folderId === "")
    return res.status(400).json({ error: true, message: "Invalid Parameter" });

  const file = filename + "." + fileext;
  const directory = await Folder.findById(folderId);

  if (!directory)
    return res
      .status(404)
      .json({ error: true, message: "Cannot find directory" });

  const files = directory.content;
  const dirname = directory.name;
  if (!existsSync(path.join(directoryPath, dirname))) {
    return res
      .status(404)
      .json({ error: true, message: "Cannot find directory" });
  }

  if (files?.length) {
    for (const fileId of files) {
      const fileContent = await File.findById(fileId);
      const filepathParts = fileContent.absPath.split("\\");
      const fileDir = filepathParts[filepathParts.length - 1];

      if (fileContent === filename && dirname === fileDir) {
        return res
          .status(409)
          .json({ error: true, message: "File already exists" });
      }
    }
  }

  fs.writeFileSync(path.join(directoryPath, dirname, file), "");

  // upload to db
  const newFile = new File({
    name: file,
    ext: fileext,
    size: 0,
    type: getFileType(fileext),
    content: file.content,
    absPath: path.join(directoryPath, dirname),
  });
  const createdFile = await newFile.save();
  directory.content.push(createdFile._id);
  await directory.save();

  res.status(201).json({ success: true, message: "File created" });
});

// GET method
// endpoint /api/files/download/:id
// private access
const downloadFile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ error: true, message: "Invalid parameter" });

  const file = await File.findById(id);

  if (!file)
    return res.status(404).json({ error: true, message: "File not found" });

  const filename = file.name;
  const absPath = file.absPath;
  const userHomeDir = os.homedir();
  const downloadsPath = path.join(userHomeDir, "Downloads");
  const downloadFilePath = path.join(downloadsPath, filename);

  const dlPath = path.join(absPath, filename);

  if (!existsSync(dlPath))
    return res.status(404).json({ error: true, message: "File not found" });

  res.download(dlPath, downloadFilePath, (err) => {
    if (err) return res.sendStatus(500);
  });
});

export {
  getFiles,
  uploadFile,
  getFile,
  deleteFile,
  updateFile,
  makeFile,
  downloadFile,
};
