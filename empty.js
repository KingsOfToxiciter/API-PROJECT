const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const crypto = require('crypto');
const { xnxx, facebook, youtube, tiktok } = require('./utils');
const stored = path.join(__dirname, "hasan");

async function download(url, format) {
  if (!url) {
    throw new Error("URL is required");
  } else if (!["mp4", "mp3"].includes(format)) {
    throw new Error("Format must be between mp3 and mp4...!!");
  }
  
  try {
    let responseUrl;

    if (url.includes("tiktok.com")) {
      responseUrl = await tiktok(url);
    } else if (url.includes("facebook.com") || url.includes("fb.watch")) {
      responseUrl = await facebook(url);
    } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
      responseUrl = await youtube(url, format, "sd");
    } else if (url.includes("xnxx.com") || url.includes("xnxx.tv")) {
      responseUrl = await xnxx(url);
    } else {
      throw new Error("Invalid url");                         
    }

    
    const { data } = await axios.get(responseUrl, {
      responseType: "arraybuffer",
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
    });
    let ext;
    if (format === "mp4") {
      ext = "mp4";
    } else {
      ext = "mp3";
    };
  
    const fileName = crypto.randomBytes(5).toString('hex') + "." + ext;
    const filePath = path.join(stored, fileName);
    
    const buffer = Buffer.from(data);

    await fs.writeFile(filePath, buffer);
    return `https://www.th-hasan.page.gd/hasan/${fileName}`;
  
    } catch (err) {
      throw new Error(err);
    }
  };

global.download = download;
