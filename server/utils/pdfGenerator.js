import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generatePDF = (logs, filepath, fontPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      //  绝对路径 + 中文字体
      const absFontPath = path.resolve(fontPath);
      doc.font(absFontPath);

      logs.forEach((log, i) => {
        doc.fontSize(16).text(`日志 ${i + 1}`, { underline: true });
        doc.fontSize(12).text(`地点: ${log.location_display_name}`);
        doc.text(`时间: ${new Date(log.created_at).toLocaleString()}`);
        doc.text(`内容: ${log.content}`);
        doc.moveDown(2);
      });

      doc.end();
      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};
