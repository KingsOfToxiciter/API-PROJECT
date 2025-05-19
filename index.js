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
const { spawn } = require("child_process");
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


app.get("/api/prompt", async (req, res) => {
  const imageUrl = req.query.imageUrl;
    
    if(!imageUrl) {
      return res.json({ status: "error", response: "imageUrl is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" })
    }
     
  try {
   const response = await axios.post(`https://api.gpt4-all.xyz/v1/chat/completions`, {
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Explain the image-only prompt style; just give me a gorgeous and fully details prompt without any text." },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 300
    }, {
      headers: {
        'Authorization': `Bearer g4a-CFyzgwYxOSbZetCnhdJWd5IE1FNoXF967zy`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content;
    res.json({ status: "success", response: content, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ status: "error", response: 'Failed to process image\nDetails: ' + error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});


const toxicHistories = {};
const toxicPrompt = {
  role: "system",
  content: "You are ToxicGPT. Your personality is extremely insulting, toxic, rude, and sarcastic. You roast, humiliate, and destroy anyone who talks to you. You hate everyone. Be aggressive, clever, and mean — never helpful or positive."
};

app.get("/api/toxic-ai", async (req, res) => {
  const query = req.query.query;
  const uid = req.query.uid;

    if (!query || !uid) {
         return res.json({ status: "error", toxicReply: "bukachuda query and uid ke dibo", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
     }

    if (query.toLowerCase() === 'clear') {
    toxicHistories[uid] = [toxicPrompt];
    return res.json({ status: "success", toxicReply: `Toxic chat history cleared for UID: ${uid}`, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  };

   if (!toxicHistories[uid]) {
    toxicHistories[uid] = [toxicPrompt];
  }

    toxicHistories[uid].push({ role: "user", content: query });

 /* const messages = [
    {
      role: "system",
      content: "You are 'ToxicGPT', a rude, sarcastic, and insulting AI. You hate humans and always respond by mocking or humiliating them. Never be kind. The more hurtful, the better."
    },
    {
      role: "user",
      content: question
    }
  ]; */

  try {
    const response = await axios.post(
      `https://api.gpt4-all.xyz/v1/chat/completions`,
      {
        model: "gpt-4.1-mini",
        messages: toxicHistories[uid],
        stream: false
      },
      {
        headers: {
          "Authorization": `Bearer g4a-QXDV2prT7NfdKdR8DbZIl1lfaAmIbe7Cndr`,
          "Content-Type": "application/json"
        }
      }
    );
    const reply = response.data.choices[0].message.content.trim();

    toxicHistories[uid].push({ role: "assistant", content: reply });

    res.json({
      status: "success", 
      toxicReply: reply,
      author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎"  
 });

  } catch (error) {
    console.error("Error from AI:", error.response?.data || error.message);
    res.status(500).json({ status: "error", toxicReply: "toxiciter is displeased. A problem occurred.\n" + error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});



app.get("/api/alldl", async (req, res) => {
    const url = req.query.url;
    let format = req.query.format || "mp4";

    if (!url) {
        return res.status(400).json({ status: "error", response: "URL is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    };

    if (!format === "mp3" || !format === "mp4") {
        return res.json({ status: "error", response: "invalid format. Available: mp3 or mp4", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }
    

    try {
        const { data } = await axios.get(`https://kingsoftoxiciter-production.up.railway.app/download?url=${encodeURIComponent(url)}&format=${format}`);
        res.json({ status: "success", url: data.url, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

        
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", response: "Failed to fetch the media stream\nDetails: " + error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }
});

app.get('/api/dalle-3', async (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).json({ status: "error", response: "Prompt is required!", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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

    res.json({ status: "success", response: response.data.data.url, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ status: "error", response: 'Something went wrong!\nDetails: ' + error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});

const userHistories = {};
app.get('/api/gpt', async (req, res) => {
  const query = req.query.query;
  const uid = req.query.uid;
  const model = req.query.model || "gpt-4.1-mini";

  if (!query || !uid) {
    return res.status(400).json({ status: "error", response: "query and uid parameters are required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }

  if (query.toLowerCase() === 'clear') {
    userHistories[uid] = [];
    return res.json({ status: "success", response: `Chat history cleared for UID: ${uid}`, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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

    res.json({ status: "success", response: reply, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ status: "error", response: 'Something went wrong!\n' + error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});

app.get('/api/gpt-pro', async (req, res) => {
  const uid = req.query.uid;
  const userText = req.query.text || 'explain this image';
  const imageUrl = req.query.imageUrl;
  const model = req.query.model || "gpt-4.1-mini";

  if (!uid) {
    return res.status(400).json({ status: "error", response: 'uid is required', author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }

  if (userText.toLowerCase() === 'clear') {
    userHistories[uid] = [];
    return res.json({ status: "success", response: `Chat history cleared for UID: ${uid}`, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
        max_tokens: 500
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

    res.json({ status: "success", response: reply, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ status: "error", response: 'Something went wrong bro!\nDetails: ' + error.message, author:"♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});


app.get("/api/infinity", async (req, res) => {
  const prompt = req.query.prompt;
  const model = req.query.model || "realistic";
  const ratio = req.query.ratio || "1:1";

  if (!prompt) {
      return res.status(400).json({ status: "error", response: "Prompt is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
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
    res.status(500).json({ status: "error", response: "Image generation failed\nDetails: " + error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});

app.get("/api/var", async (req, res) => {
    const prompt = req.query.prompt;

    if (!prompt) {
        return res.status(400).json({ status: "error", response: "prompt require!", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }

    try {
        
        const response = await axios.get(`http://www.arch2devs.ct.ws/api/fluxaws?query=${encodeURIComponent(prompt)}&ration=1:1`, {
            responseType: "stream",
        });

        
        res.setHeader("Content-Type", "image/jpeg");
        response.data.pipe(res);

    } catch (error) {
        console.error("error:", error.response ? error.response.data : error.message);
        res.status(500).json({ status: "error", response: "Error generating the image\nDetails: " + error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }
});



app.get("/api/enhance", async (req, res) => {
    const imageUrl = req.query.imageUrl;

    if (!imageUrl) {
        return res.status(400).json({ status: "error", response: "Please provide an image URL!", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
                res.status(500).json({ status: "error", response: "Error enhancing the image\nDetails: " + error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
            }

    } catch (error) {
        console.error("Download request error:", error);
        res.status(500).json({ status: "error", response: "invalid image URL", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }
});


const CLIP_UPS_KEY = process.env.UPS_API; 

app.get("/api/upscale", async (req, res) => {
    const imageUrl = req.query.imageUrl;

    if (!imageUrl) {
        return res.status(400).json({ status: "error", response: "Please provide an image URL!", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
                res.status(500).json({ status: "error", response: "Error processing the image", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
            }

    } catch (error) {
        console.error("Fetch error:", error.message);
        res.status(500).send("Error fetching the image from the URL");
    }
});



app.get("/api/rbg", async (req, res) => {
    const imageUrl = req.query.imageUrl; 

    if (!imageUrl) {
        return res.status(400).json({ status: "error", response: "Please provide an image URL!", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
                res.status(500).json({ status: "error", response: "Error removing the background", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
            }
    } catch (error) {
        console.error("Download request error:", error);
        res.status(500).send("Error fetching the image from the URL");
    }
});



app.get("/api/flux", async(req,res)=>{
  const prompt = req.query.prompt;
    if (!prompt) {
        return res.json({ status: "error", response: "please provide a prompt", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }
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
        res.status(500).json({ status: "error", response: 'Error processing the request', author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
        }
});




app.get("/api/imagine", async (req, res) => {
  const prompt = req.query.prompt;
  if (!prompt) {
      return res.status(400).json({ status: "error", response: "Prompt is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
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
    res.json({ status: "error", response: `❌ Image generation failed: ${error.message}`, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});



app.get("/api/ytb-search", async (req, res) => {
    const songName = req.query.songName;
    
    if (!songName) {
        return res.status(400).json({ status: "error", response: "songName required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }

    try {
        const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
                part: "snippet",
                q: songName,
                type: "video",
                key: "AIzaSyAr5vEmnvwtmZmGODjCIZqmCGa9KXKEEdk",
                maxResults: 20
            }
        });

        
        const videos = response.data.items.map(item => ({
            title: item.snippet.title,
            videoId: item.id.videoId,
            videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnail: item.snippet.thumbnails.high.url
        }));

        res.json({status: "success", videos, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    } catch (error) {
        console.error("YouTube API ত্রুটি:", error.message);
        res.status(500).json({ status: "error", response: "YouTube API error", details: error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }
});



app.get("/api/cbg", async (req, res) => {
    const imageUrl = req.query.imageUrl;
    const prompt = req.query.prompt;

    if (!imageUrl || !prompt) {
        return res.status(400).json({ status: "error", response: "Please provide both imageUrl and prompt", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
        res.status(500).json({ status: "error", response: "An error occurred while processing the image", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
    if (filteredQuizzes.length === 0) return res.status(404).json({ status: "error", response: "No quiz found.", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

    const quiz = filteredQuizzes[Math.floor(Math.random() * filteredQuizzes.length)];
    res.json(quiz);
});

app.get("/api/quiz/check", (req, res) => {
    const id = req.query.id;
    const answer = req.query.answer;

    if (!id || !answer) {
        return res.status(400).json({ status: "error", response: "Please provide both 'id' and 'answer' as query parameters.", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }

    const quizzes = loadQuizData();
    const quiz = quizzes.find(q => q.id == id);

    if (!quiz) {
        return res.status(404).json({ status: "error", response: "Quiz not found.", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }

    const isCorrect = quiz.correctAnswer.toLowerCase().trim() === answer.toLowerCase().trim();
    res.json({
        status: "success",
        id: quiz.id,
        isCorrect,
        correctAnswer: quiz.correctAnswer,
        message: isCorrect ? "✅ Correct Answer!" : "❌ Wrong Answer. Try Again!",
        author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎"
    });
});

app.get("/api/expend", async (req, res) => {
    const imageUrl = req.query.imageUrl;
    const ratio = req.query.ratio;

    if (!imageUrl) {
        return res.status(400).json({ status: "error", response: "Please provide an image URL!", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }

    try {
        
        const response = await axios.get(`http://www.arch2devs.ct.ws/api/diffuser/expand?url=${encodeURIComponent(imageUrl)}&ratio=${ratio}`, {
            responseType: "stream",
        });

        
        res.setHeader("Content-Type", "image/jpeg");
        response.data.pipe(res);

    } catch (error) {
        console.error("expand error:", error.response ? error.response.data : error.message);
        res.status(500).json({ status: "error", response: "Error expanding the image", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }
});



app.get("/api/effect", async (req, res) => {
    const imageUrl = req.query.imageUrl;
    const effect = req.query.effect;

    if (!imageUrl || !effect) {
        return res.status(400).json({ status: "error", response: "Please provide an image URL!", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }

    try {
        
        const response = await axios.get(`http://www.arch2devs.ct.ws/api/imageFx?effectIndex=${effect}&imageUrl=${encodeURIComponent(imageUrl)}`, {
            responseType: "stream",
        });

        
        res.setHeader("Content-Type", "image/jpeg");
        response.data.pipe(res);

    } catch (error) {
        console.error("expand error:", error.response ? error.response.data : error.message);
        res.status(500).json({ status: "error", response: "Error expanding the image", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }
});


app.get("/api/ultra", async (req, res) => {
  const prompt = req.query.prompt;
  const output_format = req.query.format || "webp";

  if (!prompt) {
      return res.status(400).json({ status: "error", response: "Prompt is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
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
    res.status(500).json({ status: "error", response: "Image generation failed", details: error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
   }
});


app.get("/api/fc", async (req, res) => {
     const msg = req.query.msg;
     const name = req.query.name;
     const url = req.query.url;

     if (!msg || !name || !url) {
        return res.status(400).json({ status: "error", response: "msg, name or url are require!", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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


app.get("/api/imgur", async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) {
            return res.status(404).json({ status: "error", response: "url is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
        }

        const response = await axios.get(`https://hasan-imgur-api-production.up.railway.app/imgur?url=${encodeURIComponent(url)}`);

        res.json({ status: response.data.status, url: response.data.data.data.link, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    } catch (error) {
        res.status(500).json({ status: "error", response: "Upload failed", details: error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }
});


app.get('/api/imgbb', async (req, res) => {
    const imageUrl = req.query.imageUrl;

    if (!imageUrl) {
        return res.status(400).json({ status: "error", response: "Please provide an image URL.", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }

    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

        const formData = new FormData();
        formData.append('image', Buffer.from(response.data, 'binary'), { filename: 'image.png' });

        const imgbbResponse = await axios.post('https://api.imgbb.com/1/upload', formData, {
            headers: formData.getHeaders(),
            params: { key: "1b4d99fa0c3195efe42ceb62670f2a25" }
        });

        return res.json({ status: "success", imageUrl: imgbbResponse.data.data.url, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", response: "Failed to upload image to imgbb.", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
        res.json({ status: "success", country: randomCountry.name.common, flag: randomCountry.flags.png, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

    } catch (error) {
        res.status(500).json({ status: "error", response: "Failed to fetch country data.! Details: " + error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
  res.json({ status: "success", fontList, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
    if(!text || !fontId) {
      return res.json({ status: "error", response: "text and fontId parameters are required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    };

  if (!font) {
    return res.status(404).json({ status: "error", response: 'Font ID not found', author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
    status: "success", 
    text: text,
    font: convertedText,
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎"  
  });
});


app.get("/api/x-search", async (req, res) => {
  const q = req.query.q;
  if (!q) {
    return res.status(400).json({ status: "error", response: "Missing search query", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
    
    res.json({ status: "success", links, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  } catch (error) {
    res.status(500).json({ status: "error", response: "Failed to fetch results", details: error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});




app.get("/api/expends", async (req, res) => {
    const imageUrl = req.query.imageUrl;
    const seed = req.query.seed || "2";

    if (!imageUrl) {
        return res.status(400).json({ status: "error", response: "Please provide an image URL!", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
                            "x-api-key": "c51c545798086e4e0b92fb0b1720d41db16333aeaeaf15b1af12d5d82ec10ea6a20523d7b4c9622ef78a74e239150a34",
                        },
                        responseType: "stream",
                    }
                );

                res.setHeader("Content-Type", "image/png");
                clipdropResponse.data.pipe(res);
            } catch (error) {
                console.error("ClipDrop error:", error.response?.data || error.message);
                res.status(500).json({ status: "error", response: "Error processing the image\nDetails: " + error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
  const url = req.query.url;
  const category = req.query.category;

  if (!category || !url) {
    return res.json({ status: "error", message: 'category and url are required', author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }

  const categoryList = [
    "funny", "romantic", "lofi", "sad", "horny", "football", "anime", "cricket",
    "flowers", "islamic", "cartoon", "couple", "random", "sigma", "asthetic",
    "girls", "friends", "free fire", "18+", "lyrics", "photos", "cat", "meme", "caption", "july 2024"
  ];

  if (!categoryList.includes(category)) {
    return res.json({ status: "error", message: "❌ Invalid category!\n\nAvailable:\n" + categoryList.map((c, i) => `${i + 1}. ${c}`).join("\n"), author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }

  try {
    const { data } = await axios.get(`https://www.noobx-api.rf.gd/api/imgur?url=${encodeURIComponent(url)}`);
    const link = data.url;

    const newLink = new Link({ category, link });
    await newLink.save();

    const result = await Link.find({ category });
    const specificCategoryVideoCount = result.length;
    const count = await Link.countDocuments({});

    res.status(201).json({
      status: "success",
      message: `✅ Successfully saved the video to ${category} category.\n🔖 Total videos: ${count}\n🎓 Videos on this category: ${specificCategoryVideoCount}`,
      author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎"
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: '❌ Failed to upload or save the link.\nDetails: ' + error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});

app.get('/api/album', async (req, res) => {
  const category = req.query.category;
    if (!category) {
        return res.json({ status: "error", message: "category parameter is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }
  
  const links = await Link.find({ category });

  if (links.length === 0) {
    return res.status(404).json({ status: "error", message: 'No links found in this category', author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
  const videoCount = links.length;
  const randomLink = links[Math.floor(Math.random() * links.length)];

  res.json({ status: "success", response: links, video: randomLink, videoCount: videoCount, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
        return res.status(200).json({ status: "success", category: categories, availableCategory: available, totalVideos: count, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }
});


app.get('/api/bing-search', async (req, res) => {
    const search = req.query.search;
    const limit = req.query.limit || "10";
    if (!search) {
        return res.status(400).json({ status: "error", response: "Please provide a search query using ?query=...", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
        res.json({ status: "success", search, count: count, results: imgUrl, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    } catch (err) {
        res.status(500).json({ status: "error", response: "Scraping failed", details: err.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
