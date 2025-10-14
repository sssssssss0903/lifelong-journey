import express from "express";
import {
  checkFile,
  getUploadedChunks,
  upload,
  mergeChunks,
} from "../controllers/uploadController.js";

const router = express.Router();

router.post("/upload/check", checkFile);
router.get("/upload/status", getUploadedChunks);
router.post("/upload/chunk", upload.single("chunk"), (req, res) => {
  res.json({ ok: true });
});
router.post("/upload/merge", mergeChunks);

export default router;
