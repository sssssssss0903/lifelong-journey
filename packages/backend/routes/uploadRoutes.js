import express from "express";
import { authMiddleware } from '../middlewares/auth.js';
import {
  checkFile,
  getUploadedChunks,
  upload,
  mergeChunks,
} from "../controllers/uploadController.js";

const router = express.Router();

// 上传相关全部需要鉴权
router.use(authMiddleware);

// controller resource 风格（流程型操作，非纯 CRUD）
// 资源命名复数：uploads
router.post("/uploads/check", checkFile);                              // 200 秒传探测
router.get("/uploads/status", getUploadedChunks);                      // 200 已传分块
router.post("/uploads/chunks", upload.single("chunk"), (_req, res) => res.status(200).json({ ok: true })); // 200 单分块
router.post("/uploads/complete", mergeChunks);                         // 201 合并完成

export default router;
