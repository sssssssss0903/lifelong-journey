import api from '../api';

/**
 * 统一导出文件逻辑（CSV / PDF）
 */
export function useDownload() {
  const downloadLogFile = async ({ username, logId = '', type = 'csv' }) => {
    try {
      const params = { username, type };
      if (logId) params.logId = logId;

      const res = await api.get('/api/exports', {
        params,
        responseType: 'blob',
      });

      const blob = res.data;
      let filename = logId ? `log_${logId}.${type}` : `logs_export.${type}`;
      const disposition = res.headers['content-disposition'];
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = decodeURIComponent(match[1]);
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('导出失败:', err);
      alert('导出失败，请稍后重试');
    }
  };

  return { downloadLogFile };
}
