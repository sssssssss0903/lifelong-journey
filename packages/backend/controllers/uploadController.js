import fs from "fs";
import path from "path";
import multer from "multer";
import { pipeline } from "stream";
import { promisify } from "util";

const streamPipeline = promisify(pipeline);
const ROOT = path.resolve("uploads");
const CHUNK_DIR = path.join(ROOT, "chunks");
const FILE_DIR = path.join(ROOT, "files");

fs.mkdirSync(CHUNK_DIR, { recursive: true });
fs.mkdirSync(FILE_DIR, { recursive: true });

// ----------------- 秒传检查 -----------------
export const checkFile = async (req, res) => {
  const { fileHash, filename } = req.body;
  const finalPath = path.join(FILE_DIR, `${fileHash}_${filename}`);
  if (fs.existsSync(finalPath)) {
    return res.json({
      exists: true,
      url: `/static/${fileHash}_${filename}`,
    });
  }
  res.json({ exists: false });
};

// ----------------- 查询已上传分块（断点续传） -----------------
export const getUploadedChunks = async (req, res) => {
  const { fileHash } = req.query;
  const dir = path.join(CHUNK_DIR, fileHash);
  if (!fs.existsSync(dir)) return res.json({ uploaded: [] });
  const uploaded = fs.readdirSync(dir)
    .filter(n => /^\d+$/.test(n))
    .map(n => Number(n))
    .sort((a, b) => a - b);
  res.json({ uploaded });
};

// ----------------- 上传分块 -----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(CHUNK_DIR, req.body.fileHash);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, String(req.body.index)),
});
export const upload = multer({ storage });

// ----------------- 合并分块 -----------------
export const mergeChunks = async (req, res) => {
  const { fileHash, filename, total } = req.body;
  const dir = path.join(CHUNK_DIR, fileHash);
  const finalPath = path.join(FILE_DIR, `${fileHash}_${filename}`);

  if (fs.existsSync(finalPath)) {
    return res.json({ url: `/static/${fileHash}_${filename}` });
  }

  const writeStream = fs.createWriteStream(finalPath);
  for (let i = 0; i < Number(total); i++) {
    const chunkPath = path.join(dir, String(i));
    if (!fs.existsSync(chunkPath)) {
      return res.status(400).json({ message: `缺少分块 ${i}` });
    }
    await streamPipeline(fs.createReadStream(chunkPath), writeStream, { end: false });
  }
  writeStream.end();

  // 删除临时分块
  fs.rmSync(dir, { recursive: true, force: true });

  res.json({ url: `/static/${fileHash}_${filename}` });
};
