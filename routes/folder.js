import express from "express";
import {
  createFolder,
  getFolders,
  deleteFolder,
} from "../controller/directoryCOntroller.js";

const router = express.Router();

router.route("/folder").post(createFolder).get(getFolders);
router.route("/folder/:id").delete(deleteFolder);

export default router;
