export const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB
const toHex = buffer => [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');

// 计算文件SHA-256（也可换SparkMD5）
export async function calcFileHash(file) {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return toHex(digest); // hex字符串
}

export function sliceFile(file, size = CHUNK_SIZE) {
  const chunks = [];
  let cur = 0;
  while (cur < file.size) {
    chunks.push(file.slice(cur, cur + size));
    cur += size;
  }
  return chunks;
}

// 并发控制器
async function runPool(limit, tasks, onProgress) {
  let i = 0, inFlight = 0, done = 0;
  return new Promise((resolve, reject) => {
    const next = () => {
      if (done === tasks.length) return resolve();
      while (inFlight < limit && i < tasks.length) {
        const cur = i++;
        inFlight++;
        tasks[cur]()
          .then(() => {
            inFlight--; done++;
            onProgress?.(done, tasks.length);
            next();
          })
          .catch(reject);
      }
    };
    next();
  });
}

// 与后端交互（资源命名统一复数 uploads + RESTful 化的端点名）
export async function checkFile(api, fileHash, filename) {
  const { data } = await api.post('/api/uploads/check', { fileHash, filename });
  return data; // {exists:boolean, url?:string}
}
export async function getUploadedChunks(api, fileHash) {
  const { data } = await api.get(`/api/uploads/status`, { params: { fileHash } });
  return data; // {uploaded:[index,...]}
}
export async function uploadChunk(api, { fileHash, index, chunk, filename }) {
  const form = new FormData();
  form.append('fileHash', fileHash);
  form.append('index', index);
  form.append('filename', filename);
  form.append('chunk', chunk);
  await api.post('/api/uploads/chunks', form);
}
export async function mergeChunks(api, { fileHash, filename, total, mime }) {
  const { data } = await api.post('/api/uploads/complete', { fileHash, filename, total, mime });
  return data; // {url}
}

// 高层封装：上传一个文件（带断点续传+秒传）
export async function uploadFileWithResume(api, file, { onProgress } = {}) {
  const filename = file.name;
  const mime = file.type;
  const fileHash = await calcFileHash(file); // 秒传依据
  // 秒传检查
  const ck = await checkFile(api, fileHash, filename);
  if (ck.exists) {
    onProgress?.(1, 1); // 直接完成
    return { url: ck.url, fileHash, seconds: true };
  }

  // 分块
  const chunks = sliceFile(file);
  const status = await getUploadedChunks(api, fileHash);
  const uploaded = new Set(status?.uploaded || []);

  // 构建上传任务
  let sentBytes = 0;
  const totalBytes = file.size;

  const tasks = chunks.map((chunk, index) => async () => {
    if (uploaded.has(index)) {
      sentBytes += chunk.size;
      onProgress?.(sentBytes / totalBytes);
      return;
    }
    await uploadChunk(api, { fileHash, index, chunk, filename });
    sentBytes += chunk.size;
    onProgress?.(sentBytes / totalBytes);
  });

  // 并发上传（建议 3~6）
  await runPool(4, tasks);

  // 合并
  const { url } = await mergeChunks(api, { fileHash, filename, total: chunks.length, mime });
  return { url, fileHash, seconds: false };
}
