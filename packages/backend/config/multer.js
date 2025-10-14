import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { config } from './env.js';

// 上传目录（优先用 .env 配置）
const uploadDir = config.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 文件存储规则
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // 统一小写扩展名，避免 .JPG / .Png 等问题
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const allowedExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = (file.mimetype || '').toLowerCase();

  if (allowedExt.includes(ext) && mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.originalname}`), false);
  }
};


// Multer 初始化
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 单文件最大 5MB
    files: 10, // 最多 10 张
  },
});

// 导出方法
export const multiUpload = upload.array('images', 10); // 多图上传
export const singleUpload = upload.single('image');   // 单图上传
export { uploadDir };
