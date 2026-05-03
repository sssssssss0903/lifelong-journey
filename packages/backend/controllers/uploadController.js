import fs from "fs";
import path from "path";
import multer from "multer";
import { pipeline } from "stream";
import { promisify } from "util";
import { ok, BadRequest } from '../utils/apiResponse.js';

const streamPipeline = promisify(pipeline);
const ROOT = path.resolve("uploads");
const CHUNK_DIR = path.join(ROOT, "chunks");
const FILE_DIR = path.join(ROOT, "files");

fs.mkdirSync(CHUNK_DIR, { recursive: true });
fs.mkdirSync(FILE_DIR, { recursive: true });

// 防 hash/filename 路径穿越
const safeName = (s) => path.basename(String(s || ''));
const isHash = (s) => /^[a-fA-F0-9]{16,128}$/.test(s);

// POST /api/uploads/check  → 200 OK
// controller resource: 文件秒传探测，非 CRUD 流程接口
export const checkFile = (req, res, next) => {
  try {
    const { fileHash, filename } = req.body || {};
    if (!isHash(fileHash) || !filename) {
      throw BadRequest('fileHash 或 filename 非法', 'INVALID_PARAMS');
    }
    const finalPath = path.join(FILE_DIR, `${fileHash}_${safeName(filename)}`);
    if (fs.existsSync(finalPath)) {
      return ok(res, { exists: true, url: `/static/${fileHash}_${safeName(filename)}` });
    }
    ok(res, { exists: false });
  } catch (err) {
    next(err);
  }
};

// GET /api/uploads/status?fileHash=...  → 200 OK
export const getUploadedChunks = (req, res, next) => {
  try {
    const { fileHash } = req.query;
    if (!isHash(fileHash)) throw BadRequest('fileHash 非法', 'INVALID_HASH');

    const dir = path.join(CHUNK_DIR, fileHash);
    if (!fs.existsSync(dir)) return ok(res, { uploaded: [] });

    const uploaded = fs.readdirSync(dir)
      .filter((n) => /^\d+$/.test(n))
      .map(Number)
      .sort((a, b) => a - b);
    ok(res, { uploaded });
  } catch (err) {
    next(err);
  }
};

// POST /api/uploads/chunks  (multer)  → 200 OK
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    if (!isHash(req.body.fileHash)) return cb(new Error('INVALID_HASH'));
    const dir = path.join(CHUNK_DIR, req.body.fileHash);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, _file, cb) => cb(null, String(parseInt(req.body.index, 10))),
});
export const upload = multer({ storage });

// POST /api/uploads/complete  → 201 Created（合并成产生最终文件资源）
export const mergeChunks = async (req, res, next) => {
  try {
    const { fileHash, filename, total } = req.body || {};
    if (!isHash(fileHash) || !filename || !total) {
      throw BadRequest('参数非法', 'INVALID_PARAMS');
    }

    const dir = path.join(CHUNK_DIR, fileHash);
    const finalName = `${fileHash}_${safeName(filename)}`;
    const finalPath = path.join(FILE_DIR, finalName);

    if (fs.existsSync(finalPath)) {
      // 已合并过，幂等返回
      return ok(res, { url: `/static/${finalName}` });
    }

    const writeStream = fs.createWriteStream(finalPath);
    for (let i = 0; i < Number(total); i++) {
      const chunkPath = path.join(dir, String(i));
      if (!fs.existsSync(chunkPath)) {
        writeStream.destroy();
        fs.unlink(finalPath, () => {});
        throw BadRequest(`缺少分块 ${i}`, 'MISSING_CHUNK');
      }
      await streamPipeline(fs.createReadStream(chunkPath), writeStream, { end: false });
    }
    writeStream.end();
    fs.rmSync(dir, { recursive: true, force: true });

    res.status(201).setHeader('Location', `/static/${finalName}`).json({ url: `/static/${finalName}` });
  } catch (err) {
    next(err);
  }
};
