import express from "express";
import {
  getFiles,
  uploadFile,
  getFile,
  deleteFile,
  updateFile,
  makeFile,
  downloadFile,
} from "../controller/fileController.js";

const router = express.Router();

router.route("/files").get(getFiles).post(uploadFile);
router.route("/files/create").post(makeFile);
router.route("/files/download/:id").get(downloadFile);
router.route("/files/:id").get(getFile).post(deleteFile).put(updateFile);

export default router;
