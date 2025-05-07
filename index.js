require("dotenv").config();
const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const util = require("util");
const cheerio = require("cheerio");
const cors = require("cors");
const mongoose = require('mongoose');
const Link = require('./models/Link');
const DOWNLOAD_FOLDER = path.join(__dirname, "downloads");

if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER);
};
const AI_API_KEY = process.env.AI_API;
const apis = process.env.HG_API.split(',').map(key => key.trim());
const apiKey = getRandomApi(apis);
const ultraApi = process.env.ST_API.split(',').map(key => key.trim());
const randomUltraApi = getRandomApi(ultraApi);

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());


function getRandomApi(key) {
  return key[Math.floor(Math.random() * key.length)];
};


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
};


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'profile.html'));
});


app.get("/apis", async (req, res) => {
    const { data } = await axios.get("https://raw.githubusercontent.com/KingsOfToxiciter/APIS/refs/heads/main/toxicitieslordhasan.json");
    res.json(data);
});


app.get('/api/dalle-3', async (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required!" });
  }

  try {
    const response = await axios.post(
      "https://api.gpt4-all.xyz/v1/images/generations",
      {
        model: "dall-e-3",
        prompt: prompt
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer g4a-CFyzgwYxOSbZetCnhdJWd5IE1FNoXF967zy`
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

const userHistories = {};
app.get('/api/gpt', async (req, res) => {
  const query = req.query.query;
  const uid = req.query.uid;
  const model = req.query.model || "gpt-4o-mini";

  if (!query || !uid) {
    return res.status(400).json({ error: "query and uid parameters are required" });
  }

  if (query.toLowerCase() === 'clear') {
    userHistories[uid] = [];
    return res.json({ response: `Chat history cleared for UID: ${uid}` });
  }

  if (!userHistories[uid]) {
    userHistories[uid] = [];
  }

  userHistories[uid].push({ role: 'user', content: query });

  try {
    const response = await axios.post(
      "https://api.gpt4-all.xyz/v1/chat/completions",
      {
        model: model,
        messages: userHistories[uid],
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`
        }
      }
    );

    const reply = response.data.choices[0].message.content;
    userHistories[uid].push({ role: 'assistant', content: reply });

    res.json({ response: reply });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

app.get('/api/gpt-pro', async (req, res) => {
  const uid = req.query.uid;
  const userText = req.query.text || 'explain this image';
  const imageUrl = req.query.imageUrl;
  const model = req.query.model || "gpt-4o-mini";

  if (!uid) {
    return res.status(400).json({ error: 'uid is required' });
  }

  if (userText.toLowerCase() === 'clear') {
    userHistories[uid] = [];
    return res.json({ response: `Chat history cleared for UID: ${uid}` });
  }

  if (!userHistories[uid]) {
    userHistories[uid] = [];
  }

  const contentArray = [{ type: 'text', text: userText }];
  if (imageUrl) {
    contentArray.push({ type: 'image_url', image_url: { url: imageUrl } });
  }

  userHistories[uid].push({ role: 'user', content: contentArray });

  try {
    const response = await axios.post(
      "https://api.gpt4-all.xyz/v1/chat/completions",
      {
        model: model,
        messages: userHistories[uid],
        max_tokens: 300
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer g4a-QXDV2prT7NfdKdR8DbZIl1lfaAmIbe7Cndr`
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    userHistories[uid].push({
      role: 'assistant',
      content: [{ type: 'text', text: reply }]
    });

    res.json({ response: reply });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Something went wrong bro!' });
  }
});


app.get("/api/grok", async (req, res) => {
    const prompt = req.query.prompt;
    const uid = req.query.uid;
    const imageUrl = req.query.imageUrl;
if (!prompt || !uid) {
    return res.status(400).json({ error: "prompt and uid parameters are required" });
}
    const { data } = await axios.get(`https://zaikyoov3.koyeb.app/api/grok-3-plus?prompt=${prompt}&uid=${uid}&img=${imageUrl}`);
    res.json(data);
});

app.get("/api/infinity", async (req, res) => {
  const prompt = req.query.prompt;
  const model = req.query.model || "realistic";
  const ratio = req.query.ratio || "1:1";

  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  res.setHeader("Content-Type", "image/png");

  try {
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("style", model);
    form.append("aspect_ratio", ratio);

    const response = await axios.post("https://api.vyro.ai/v2/image/generations", form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${process.env.VYRO_API}`
      },
      responseType: "stream",
    });

    response.data.pipe(res);
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Image generation failed", details: error.message });
  }
});

app.get("/api/var", async (req, res) => {
    const { prompt } = req.query;

    if (!prompt) {
        return res.status(400).send("prompt require!");
    }

    try {
        
        const response = await axios.get(`http://www.arch2devs.ct.ws/api/fluxaws?query=${encodeURIComponent(prompt)}&ration=1:1`, {
            responseType: "stream",
        });

        
        res.setHeader("Content-Type", "image/jpeg");
        response.data.pipe(res);

    } catch (error) {
        console.error("error:", error.response ? error.response.data : error.message);
        res.status(500).send("Error generating the image");
    }
});



app.get("/api/enhance", async (req, res) => {
    const { imageUrl } = req.query;

    if (!imageUrl) {
        return res.status(400).send("Please provide an image URL!");
    }

    const imagePath = path.join(DOWNLOAD_FOLDER, "input.jpg");
    await downloadFromUrl(imageUrl, imagePath);

    try {
        const form = new FormData();
            form.append("image", fs.createReadStream(imagePath));

            try {
                const enhanceResponse = await axios.post(
                    "https://api.vyro.ai/v2/image/enhance",
                    form,
                    {
                        headers: {
                            ...form.getHeaders(),
                            Authorization: `Bearer ${process.env.VYRO_API}`, 
                        },
                        responseType: "stream",
                    }
                );

               
                res.setHeader("Content-Type", "image/jpeg");
                enhanceResponse.data.pipe(res);
            } catch (error) {
                console.error("Enhance error:", error);
                res.status(500).send("Error enhancing the image");
            }

    } catch (error) {
        console.error("Download request error:", error);
        res.status(500).send("Error fetching the image from the URL");
    }
});


const CLIP_UPS_KEY = process.env.UPS_API; 

app.get("/api/upscale", async (req, res) => {
    const { imageUrl } = req.query;

    if (!imageUrl) {
        return res.status(400).send("Please provide an image URL!");
    }

    const imagePath = path.join(DOWNLOAD_FOLDER, "input.jpg");
    await downloadFromUrl(imageUrl, imagePath);

    try {
        const form = new FormData();
            form.append("image_file", fs.createReadStream(imagePath));
            form.append("target_width", "1080");
            form.append("target_height", "1080");

            try {
                const clipdropResponse = await axios.post(
                    "https://clipdrop-api.co/image-upscaling/v1/upscale",
                    form,
                    {
                        headers: {
                            ...form.getHeaders(),
                            "x-api-key": CLIP_UPS_KEY,
                        },
                        responseType: "stream",
                    }
                );

                res.setHeader("Content-Type", "image/png");
                clipdropResponse.data.pipe(res);
            } catch (error) {
                console.error("ClipDrop error:", error.response?.data || error.message);
                res.status(500).send("Error processing the image with ClipDrop API");
            }

    } catch (error) {
        console.error("Fetch error:", error.message);
        res.status(500).send("Error fetching the image from the URL");
    }
});



app.get("/api/rbg", async (req, res) => {
    const { imageUrl } = req.query; 

    if (!imageUrl) {
        return res.status(400).send("Please provide an image URL!");
    }

    const imagePath = path.join(DOWNLOAD_FOLDER, "input.jpg");
    await downloadFromUrl(imageUrl, imagePath);

    try {
      
         const form = new FormData();
            form.append("size", "auto");
            form.append("image_file", fs.createReadStream(imagePath));

            try {
                
                const enhanceResponse = await axios.post(
                    "https://api.remove.bg/v1.0/removebg",
                    form,
                    {
                        headers: {
                            ...form.getHeaders(),
                            "X-Api-Key": "6Sbc6WfMGv5ENhmmVhVzG6RS",
                        },
                        responseType: "stream",
                    }
                );

             
                res.setHeader("Content-Type", "image/png");

              
                enhanceResponse.data.pipe(res);
            } catch (error) {
                console.error("Remove.bg error:", error);
                res.status(500).send("Error removing the background");
            }
    } catch (error) {
        console.error("Download request error:", error);
        res.status(500).send("Error fetching the image from the URL");
    }
});



app.get("/api/flux", async(req,res)=>{
  const { prompt } = req.query;
        try {
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
              
                { "inputs": prompt },
              
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    responseType: 'stream',
                }
            );

        res.setHeader('Content-Type', 'image/png');
        response.data.pipe(res)
    } catch (error) {
          console.log("imagine error",error)
        res.status(500).send('Error processing the request');
        }
});




app.get("/api/imagine", async (req, res) => {
  const prompt = req.query.prompt;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  res.setHeader("Content-Type", "image/png"); 

  try {
    const form = new FormData();
    form.append('prompt', `${prompt}`);
    form.append("style", "flux-schnell");
    form.append("aspect_ratio", "1:1");


    const response = await axios.post(
      "https://api.vyro.ai/v2/image/generations",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${process.env.VYRO_API}`,
        },
        responseType: "stream", 
      }
    );

    response.data.on("data", (chunk) => {
      res.write(chunk); 
    });

    response.data.on("end", () => {
      res.write("\n🎉 Image generation complete!\n");
      res.end();
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.write(`\n❌ Image generation failed: ${error.message}\n`);
    res.end();
  }
});


const YT_API_KEY = "AIzaSyAr5vEmnvwtmZmGODjCIZqmCGa9KXKEEdk";

app.get("/api/ytb-search", async (req, res) => {
    const songName = req.query.songName;
    
    if (!songName) {
        return res.status(400).json({ error: "songName required" });
    }

    try {
        const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
                part: "snippet",
                q: songName,
                type: "video",
                key: YT_API_KEY,
                maxResults: 20
            }
        });

        
        const videos = response.data.items.map(item => ({
            title: item.snippet.title,
            videoId: item.id.videoId,
            videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnail: item.snippet.thumbnails.high.url
        }));

        res.json(videos);
    } catch (error) {
        console.error("YouTube API ত্রুটি:", error.message);
        res.status(500).json({ error: "YouTube API error", details: error.message });
    }
});



app.get("/api/cbg", async (req, res) => {
    const { imageUrl, prompt } = req.query;

    if (!imageUrl || !prompt) {
        return res.status(400).json({ error: "Please provide both imageUrl and prompt" });
    }

    const imagePath = path.join(DOWNLOAD_FOLDER, "input.jpg");
    await downloadFromUrl(imageUrl, imagePath);

    try {
        const form = new FormData();
        form.append("image", fs.createReadStream(imagePath));
        form.append("prompt", prompt);

        const enhanceResponse = await axios.post(
            "https://api.vyro.ai/v2/image/generations/ai-background",
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${process.env.VYRO_API}`,
                },
                responseType: "arraybuffer",
            }
        );

        res.setHeader("Content-Type", "image/jpeg");
        res.send(Buffer.from(enhanceResponse.data));
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "An error occurred while processing the image" });
    }
});




const loadQuizData = () => {
    const data = fs.readFileSync("quiz.json");
    return JSON.parse(data);
};

app.get("/api/quiz", (req, res) => {
    const category = req.query.category || "general";
    const quizzes = loadQuizData();
    const filteredQuizzes = quizzes.filter(q => q.category === category);
    if (filteredQuizzes.length === 0) return res.status(404).json({ error: "No quiz found." });

    const quiz = filteredQuizzes[Math.floor(Math.random() * filteredQuizzes.length)];
    res.json(quiz);
});

app.get("/api/quiz/check", (req, res) => {
    const id = req.query.id;
    const answer = req.query.answer;

    if (!id || !answer) {
        return res.status(400).json({ error: "Please provide both 'id' and 'answer' as query parameters." });
    }

    const quizzes = loadQuizData();
    const quiz = quizzes.find(q => q.id == id);

    if (!quiz) {
        return res.status(404).json({ error: "Quiz not found." });
    }

    const isCorrect = quiz.correctAnswer.toLowerCase().trim() === answer.toLowerCase().trim();
    res.json({
        id: quiz.id,
        isCorrect,
        correctAnswer: quiz.correctAnswer,
        message: isCorrect ? "✅ Correct Answer!" : "❌ Wrong Answer. Try Again!"
    });
});

app.get("/api/expend", async (req, res) => {
    const { imageUrl } = req.query;
    const { ratio } = req.query;

    if (!imageUrl) {
        return res.status(400).send("Please provide an image URL!");
    }

    try {
        
        const response = await axios.get(`http://www.arch2devs.ct.ws/api/diffuser/expand?url=${encodeURIComponent(imageUrl)}&ratio=${ratio}`, {
            responseType: "stream",
        });

        
        res.setHeader("Content-Type", "image/jpeg");
        response.data.pipe(res);

    } catch (error) {
        console.error("expand error:", error.response ? error.response.data : error.message);
        res.status(500).send("Error expanding the image");
    }
});



app.get("/api/effect", async (req, res) => {
    const { imageUrl } = req.query;
    const { effect } = req.query;

    if (!imageUrl) {
        return res.status(400).send("Please provide an image URL!");
    }

    try {
        
        const response = await axios.get(`http://www.arch2devs.ct.ws/api/imageFx?effectIndex=${effect}&imageUrl=${encodeURIComponent(imageUrl)}`, {
            responseType: "stream",
        });

        
        res.setHeader("Content-Type", "image/jpeg");
        response.data.pipe(res);

    } catch (error) {
        console.error("expand error:", error.response ? error.response.data : error.message);
        res.status(500).send("Error expanding the image");
    }
});


app.get("/api/ultra", async (req, res) => {
  const prompt = req.query.prompt;
  const output_format = req.query.format || "webp";

  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  res.setHeader("Content-Type", `image/${output_format}`);

  try {
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("output_format", output_format);

    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/ultra",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${randomUltraApi}`, 
          Accept: "image/*",
        },
        responseType: "stream",
      }
    );

    response.data.pipe(res);
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Image generation failed", details: error.message       });
   }
});


app.get("/api/fc", async (req, res) => {
     const msg = req.query.msg;
     const name = req.query.name;
     const url = req.query.url;

     if (!msg || !name || !url) {
        return res.status(400).send("msg, name or url are require!");
    } 

    try {
        
        const response = await axios.get(`http://www.arch2devs.ct.ws/api/qoutely?text=${msg}&username=${name}&avatar=${url}`, {
            responseType: "stream",
        });

        
        res.setHeader("Content-Type", "image/jpeg");
        response.data.pipe(res);

    } catch (error) {
        console.error("error:", error.response ? error.response.data : error.message);
        res.status(500).send("Error generating the image");
    }
});


app.get('/api/alldl', async (req, res) => {
  try {
    const url = req.query.url;
    const format = req.query.format || "b";

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const response = await axios.get(`https://alldl-api-production.up.railway.app/alldl?url=${url}&format=${format}`, {
      responseType: 'stream'
    });


    response.data.pipe(res);

  } catch (error) {
    console.error('alldl Error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});


app.get("/api/imgur", async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) {
            return res.status(404).json({ error: "url is required" });
        }

        const response = await axios.get(`https://hasan-imgur-api-production.up.railway.app/imgur?url=${encodeURIComponent(url)}`);

        res.json({ status: response.data.status, url: response.data.data.data.link, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    } catch (error) {
        res.status(500).json({ error: "Upload failed", details: error.message });
    }
});


app.get('/api/imgbb', async (req, res) => {
    const { imageUrl } = req.query;

    if (!imageUrl) {
        return res.status(400).json({ error: "Please provide an image URL." });
    }

    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

        const formData = new FormData();
        formData.append('image', Buffer.from(response.data, 'binary'), { filename: 'image.png' });

        const imgbbResponse = await axios.post('https://api.imgbb.com/1/upload', formData, {
            headers: formData.getHeaders(),
            params: { key: "1b4d99fa0c3195efe42ceb62670f2a25" }
        });

        return res.json({ imageUrl: imgbbResponse.data.data.url });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to upload image to imgbb." });
    }
});


app.get("/api/flag", async (req, res) => {
    try {
        const response = await axios.get("https://restcountries.com/v3.1/all");
        const countries = response.data;

        if (!countries || countries.length === 0) {
            return res.status(500).json({ error: "No countries found" });
        }

        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        res.json({ country: randomCountry.name.common, flag: randomCountry.flags.png });

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch country data" });
    }
});





const FONTS_FILE = path.join(__dirname, 'font.json');

function loadFonts() {
  return JSON.parse(fs.readFileSync(FONTS_FILE, 'utf8'));
}

app.get('/api/font/list', (req, res) => {
  const fonts = loadFonts();
  const fontList = fonts.map(font => ({
    id: font.id,
    example: font.example
  }));
  res.json(fontList);
});


function getCapitalVariant(fontData) {
  const capitalFont = {};
  for (const [key, value] of Object.entries(fontData.font)) {
    capitalFont[key.toUpperCase()] = value;
  }
  return capitalFont;
}

app.get('/api/font', (req, res) => {
  const text = req.query.text;
  const fontId = req.query.fontId;
  const fonts = loadFonts();
  const font = fonts.find(f => f.id === fontId);

  if (!font) {
    return res.status(404).json({ error: 'Font ID not found' });
  }

  const fullFontMap = {
    ...font.font,
    ...getCapitalVariant(font)
  };

  
  let convertedText = text
    .split('')
    .map(char => fullFontMap[char] || char)
    .join('');

 
  const prefix = font.font._prefix || '';
  const suffix = font.font._suffix || '';
  convertedText = `${prefix}${convertedText}${suffix}`;

  res.json({ 
    text: text,
    font: convertedText
  });
});


app.get("/api/x-search", async (req, res) => {
  const q = req.query.q;
  if (!q) {
    return res.status(400).json({ error: "Missing search query" });
  }

  try {
    const url = `https://www.xnxx.tv/search/${encodeURIComponent(q)}`;
    const { data } = await axios.get(url, { headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    } });
    const $ = cheerio.load(data);

    let links = [];

    $('div.thumb-under p a').each((i, element) => {
      const title = $(element).attr('title');
      const href = $(element).attr('href');
      const videoUrl = "https://www.xnxx.tv" + href;
      if (videoUrl && title) {
        links.push({ x_url: videoUrl, title: title });
      }
    });
    
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch results", details: error.message });
  }
});




const CLIP_KEY = 'c51c545798086e4e0b92fb0b1720d41db16333aeaeaf15b1af12d5d82ec10ea6a20523d7b4c9622ef78a74e239150a34'; 
app.get("/api/expends", async (req, res) => {
    const { imageUrl } = req.query;
    const seed = req.query.seed || "2";

    if (!imageUrl) {
        return res.status(400).send("Please provide an image URL!");
    }

    const imagePath = path.join(DOWNLOAD_FOLDER, "input.jpg");
    await downloadFromUrl(imageUrl, imagePath);

    try {
        const form = new FormData();
            form.append("image_file", fs.createReadStream(imagePath));
form.append("extend_left", "200");
form.append("extend_right", "200");
form.append("extend_up", "200");
form.append("extend_down", "200");
form.append("seed", seed);

            try {
                const clipdropResponse = await axios.post(
                    "https://clipdrop-api.co/uncrop/v1",
                    form,
                    {
                        headers: {
                            ...form.getHeaders(),
                            "x-api-key": CLIP_KEY,
                        },
                        responseType: "stream",
                    }
                );

                res.setHeader("Content-Type", "image/png");
                clipdropResponse.data.pipe(res);
            } catch (error) {
                console.error("ClipDrop error:", error.response?.data || error.message);
                res.status(500).send("Error processing the image with ClipDrop API");
            }
        
    } catch (error) {
        console.error("Fetch error:", error.message);
        res.status(500).send("Error fetching the image from the URL");
    }
});


mongoose.connect('mongodb+srv://toxiciter:Hasan5&7@toxiciter.9tkfu.mongodb.net/ALBUM?retryWrites=true&w=majority&appName=Toxiciter', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));
                                                                      
app.get('/api/album/upload', async (req, res) => {
  const link = req.query.link;
  const category = req.query.category;

  if (!category || !link) {
    return res.status(400).json({ message: 'category and link are required' });
  }

  const categoryList = [
    "funny", "romantic", "lofi", "sad", "horny", "football", "anime", "cricket",
    "flowers", "islamic", "cartoon", "couple", "random", "sigma", "asthetic",
    "girls", "friends", "free fire", "18+", "lyrics", "photos", "cat", "meme", "caption", "july 2024"
  ];

  if (!categoryList.includes(category)) {
    return res.json({ message: "❌ Invalid category!\n\nAvailable:\n" + categoryList.map((c, i) => `${i + 1}. ${c}`).join("\n") });
  }

  try {
    const { data } = await axios.get(`https://www.noobs-api-69.rf.gd/api/imgur?url=${link}`);
    const url = data.url;

    const newLink = new Link({ category, url });
    await newLink.save();

    const result = await Link.find({ category });
    const specificCategoryVideoCount = result.length;
    const count = await Link.countDocuments({});

    res.status(201).json({
      message: `✅ Successfully saved the video to ${category} category.\n🔖 Total videos: ${count}\n🎓 Videos on this category: ${specificCategoryVideoCount}`
    });
  } catch (error) {
    res.status(500).json({ message: '❌ Failed to upload or save the link.', error: error.message });
  }
});

app.get('/api/album', async (req, res) => {
  const category = req.query.category;
  
  const links = await Link.find({ category });

  if (links.length === 0) {
    return res.status(404).json({ message: 'No links found in this category' });
  }
  const videoCount = links.length;
  const randomLink = links[Math.floor(Math.random() * links.length)];

  res.json({ all: links, video: randomLink, videoCount: videoCount  });
});

app.get("/api/album/list", async (req, res) => {
    const categoryList = req.query.categoryList;
    const categories = [
  "funny", "romantic", "lofi", "sad", "horny", "football", "anime", "cricket",
  "flowers", "islamic", "cartoon", "couple", "random", "sigma", "asthetic",
  "girls", "friends", "free fire", "18+", "lyrics", "photos", "cat", "meme", "caption", "july 2024"
];
    const available = await Link.distinct('category');
    const count = await Link.countDocuments({});
    if (categoryList === "hasan") {
        return res.status(200).json({ category: categories, availableCategory: available, totalVideos: count });
    }
});


app.get('/api/bing-search', async (req, res) => {
    const search = req.query.search;
    const limit = req.query.limit || "10";
    if (!search) {
        return res.status(400).json({ error: "Please provide a search query using ?query=..." });
    }

    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(search)}&form=QBIL`;

    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const $ = cheerio.load(data);
        const imageUrls = [];

        $('a.iusc').each((i, el) => {
            const meta = $(el).attr('m');
            if (meta) {
                try {
                    const json = JSON.parse(meta);
                    if (json && json.murl) {
                        imageUrls.push(json.murl);
                    }
                } catch (e) {}
            }
        });
             const imgUrl = imageUrls.slice(0, limit);
             const count = imgUrl.length;
        res.json({ search, count: count, results: imgUrl });
    } catch (err) {
        res.status(500).json({ error: "Scraping failed", details: err.message });
    }
});


app.get("/docs", (req, res) => {
  const routes = [];

  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const route = middleware.route;
      const method = Object.keys(route.methods).map(m => m.toUpperCase());
      const queryParams = getQueryParams(route.stack);
      routes.push({
        endpoint: route.path,
        method,
        queryParams
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        const route = handler.route;
        if (route) {
          const method = Object.keys(route.methods).map(m => m.toUpperCase());
          const queryParams = getQueryParams(route.stack);
          routes.push({
            endpoint: route.path,
            method,
            queryParams
          });
        }
      });
    }
  });

  res.json(routes);
});



function getQueryParams(stack) {
  const params = new Set();

  stack.forEach(layer => {
    const fnStr = layer?.handle?.toString() || "";

    const directMatch = fnStr.match(/req\.query\.([a-zA-Z0-9_]+)/g) || [];
    directMatch.forEach(m => {
      const param = m.split('.')[2];
      if (param) params.add(param);
    });

    const destructureMatch = fnStr.match(/{\s*([^}]+)\s*}\s*=\s*req\.query/g) || [];
    destructureMatch.forEach(m => {
      const inside = m.match(/{\s*([^}]+)\s*}/);
      if (inside && inside[1]) {
        inside[1].split(',').forEach(f => {
          const field = f.trim().split('=')[0].trim();
          if (field) params.add(field);
        });
      }
    });
  });

  return Array.from(params);
}


app.listen(PORT, () => {
  console.log(`🔥`);
});
