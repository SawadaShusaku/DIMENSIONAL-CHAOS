import fs from 'fs';
import path from 'path';
import https from 'https';

const url = 'https://raw.githubusercontent.com/ToxSam/open-source-3d-assets/main/data/assets/pm-momuspark.json';
const saveDir = path.join(process.cwd(), 'public', 'models');

if (!fs.existsSync(saveDir)) {
  fs.mkdirSync(saveDir, { recursive: true });
}

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const assets = JSON.parse(data);
    // Take 10 models
    const selected = assets.slice(0, 15);
    
    selected.forEach(asset => {
      const fileUrl = asset.model_file_url;
      const fileName = path.basename(fileUrl);
      const destPath = path.join(saveDir, fileName);
      
      console.log(`Downloading ${fileName}...`);
      const file = fs.createWriteStream(destPath);
      https.get(fileUrl, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Saved ${fileName}`);
        });
      });
    });
  });
});
