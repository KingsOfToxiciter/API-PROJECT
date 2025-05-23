const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const util = require("util");
const cheerio = require("cheerio");
const cors = require("cors");
const mongoose = require('mongoose');
const crypto = require('crypto');


let current = 0;

function getFallbackKey(keys) {
  return () => {
    const key = keys[current];
    current = (current + 1) % keys.length;
    return key;
  };
}

function getRandomData(key) {
  return key[Math.floor(Math.random() * key.length)];
};

function fileName(ext) {
    return crypto.randomBytes(5).toString('hex') + ext;
};

async function upload(response, filename) {
const uploadFolder = path.join(__dirname, 'images');

const filePath = path.join(uploadFolder, filename);
const writer = fs.createWriteStream(filePath);

response.pipe(writer);

await new Promise((resolve, reject) => {
  writer.on("finish", resolve);
  writer.on("error", reject);
});
    setTimeout(() => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`❌ Error deleting ${filename}:`, err.message);
      } else {
        console.log(`✅ Deleted file: ${filename}`);
      }
    });
  }, 5 * 60 * 1000);
}


async function downloadFromUrl(url, path) {
  const response = await axios.get(url, { responseType: 'stream', headers: {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
  } });
  const writer = fs.createWriteStream(path);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
      setTimeout(() => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`❌ Error deleting ${filename}:`, err.message);
      } else {
        console.log(`✅ Deleted file: ${filename}`);
      }
    });
  }, 1 * 60 * 1000);
}



module.exports = {
  getFallbackKey,
  getRandomData,
  fileName,
  upload,
  downloadFromUrl
};
