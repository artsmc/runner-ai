const fs = require('fs');
const path = require('path');

export const readFileSync = () => {
  const filePath = path.join(__dirname, 'store.json');
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};