const https = require('https');
const fs = require('fs');
const path = require('path');

const hdris = {
  'sunset.hdr': 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/venice_sunset_4k.hdr',
  'city.hdr': 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/potsdamer_platz_4k.hdr'
};

const hdriDir = path.join(__dirname, 'public', 'hdri');

// Create directory if it doesn't exist
if (!fs.existsSync(hdriDir)) {
  fs.mkdirSync(hdriDir, { recursive: true });
}

// Download function
function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(hdriDir, filename));
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(path.join(hdriDir, filename));
      reject(err);
    });
  });
}

// Download all HDRIs
async function downloadAll() {
  try {
    for (const [filename, url] of Object.entries(hdris)) {
      await downloadFile(url, filename);
    }
    console.log('All HDRIs downloaded successfully!');
  } catch (error) {
    console.error('Error downloading HDRIs:', error);
  }
}

downloadAll(); 