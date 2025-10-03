import { Parser } from 'json2csv';
import fs from 'fs';

export const generateCSV = (data, filepath) => {
  const fields = ['id', 'location_name', 'location_display_name', 'longitude', 'latitude', 'content', 'created_at'];
  const parser = new Parser({ fields });
  const csv = parser.parse(data);
  fs.writeFileSync(filepath, csv);
  return filepath;
};
