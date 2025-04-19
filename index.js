require("dotenv").config();
const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const util = require("util");
const imageOf = require("image-size");
const cheerio = require("cheerio");
const mongoose = require('mongoose');
const Link = require('./models/Link');
const DOWNLOAD_FOLDER = path.join(__dirname, "downloads");

if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER);
};

const apis = process.env.HG_API.split(',').map(key => key.trim());
const apiKey = apis[Math.floor(Math.random() * apis.length)];
const ultraApi = process.env.ST_API.split(',').map(key => key.trim());
const randomUltraApi = ultraApi[Math.floor(Math.random() * ultraApi.length)];

const app = express();
const PORT = 3000;


app.get('/', (req, res) => {
  res.send('𝑯𝒂𝒔𝒂𝒏 𝒂𝒍𝒍 𝒂𝒑𝒊𝒔 𝒂𝒓𝒆 𝒓𝒖𝒏𝒏𝒊𝒏𝒈 😙💥');
});



app.get("/infinity", async (req, res) => {
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

app.get("/var", async (req, res) => {
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


app.get("/anigen", async(req,res)=>{
  const { prompt } = req.query;
        try {
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/brushpenbob/flux-midjourney-anime",
              
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



app.get("/enhance", async (req, res) => {
    const { imageUrl } = req.query;

    if (!imageUrl) {
        return res.status(400).send("Please provide an image URL!");
    }

    const imagePath = path.join(DOWNLOAD_FOLDER, "input.jpg");

    try {
       
        const response = await axios.get(imageUrl, { responseType: "stream" });
        const writer = fs.createWriteStream(imagePath);

        response.data.pipe(writer);

        writer.on("finish", async () => {
            console.log("Image downloaded successfully:", imagePath);

            
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
        });

        writer.on("error", (err) => {
            console.error("Download error:", err);
            res.status(500).send("Error downloading the image");
        });
    } catch (error) {
        console.error("Download request error:", error);
        res.status(500).send("Error fetching the image from the URL");
    }
});


const CLIP_UPS_KEY = process.env.UPS_API; 

app.get("/upscale", async (req, res) => {
    const { imageUrl } = req.query;

    if (!imageUrl) {
        return res.status(400).send("Please provide an image URL!");
    }

    const imagePath = path.join(DOWNLOAD_FOLDER, "input.jpg");

    try {
        const response = await axios.get(imageUrl, { responseType: "stream" });
        const writer = fs.createWriteStream(imagePath);

        response.data.pipe(writer);

        writer.on("finish", async () => {
            console.log("Image downloaded successfully:", imagePath);

            const dimensions = imageOf(imagePath);
            const width = dimensions.width.toString();
            const height = dimensions.height.toString();
            
            const form = new FormData();
            form.append("image_file", fs.createReadStream(imagePath));
            form.append("target_width", width);
            form.append("target_height", height);

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
        });

        writer.on("error", (err) => {
            console.error("Download error:", err);
            res.status(500).send("Error downloading the image");
        });
    } catch (error) {
        console.error("Fetch error:", error.message);
        res.status(500).send("Error fetching the image from the URL");
    }
});



app.get("/rbg", async (req, res) => {
    const { imageUrl } = req.query; 

    if (!imageUrl) {
        return res.status(400).send("Please provide an image URL!");
    }

    const imagePath = path.join(DOWNLOAD_FOLDER, "input.jpg");

    try {
      
        const response = await axios.get(imageUrl, { responseType: "stream" });
        const writer = fs.createWriteStream(imagePath);

        response.data.pipe(writer);

        writer.on("finish", async () => {
            console.log("Image downloaded successfully:", imagePath);

            
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
        });

        writer.on("error", (err) => {
            console.error("Download error:", err);
            res.status(500).send("Error downloading the image");
        });
    } catch (error) {
        console.error("Download request error:", error);
        res.status(500).send("Error fetching the image from the URL");
    }
});



app.get("/midjourney", async(req,res)=>{
  const { prompt } = req.query;
        try {
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/Keltezaa/midjourney-v6-1-meets-flux-sdxl",
             
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


app.get("/flux", async(req,res)=>{
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


app.get("/fluxpro", async(req,res)=>{
  const { prompt } = req.query;
        try {
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
              
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




app.get("/imagine", async (req, res) => {
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



const cors = require("cors");

const YT_API_KEY = "AIzaSyAr5vEmnvwtmZmGODjCIZqmCGa9KXKEEdk";

app.use(cors());

app.get("/ytb-search", async (req, res) => {
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




if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER);
}

app.get("/cbg", async (req, res) => {
    const { imageUrl, prompt } = req.query;

    if (!imageUrl || !prompt) {
        return res.status(400).json({ error: "Please provide both imageUrl and prompt" });
    }

    const imagePath = path.join(DOWNLOAD_FOLDER, "input.jpg");

    try {
        const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
        await util.promisify(fs.writeFile)(imagePath, response.data);

        console.log("Image downloaded successfully:", imagePath);

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


app.get("/quiz", (req, res) => {
    const category = req.query.category || "general";
    const quizzes = loadQuizData();
    const filteredQuizzes = quizzes.filter(q => q.category === category);
    if (filteredQuizzes.length === 0) return res.status(404).json({ error: "No quiz found." });

    const quiz = filteredQuizzes[Math.floor(Math.random() * filteredQuizzes.length)];
    res.json(quiz);
});

app.get("/quiz/check", (req, res) => {
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

app.get("/expend", async (req, res) => {
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



app.get("/effect", async (req, res) => {
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


app.get("/ultra", async (req, res) => {
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




app.get('/flux-dev', async (req, res) => {
    let { prompt, steps } = req.query;

   
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    
    steps = parseInt(steps) || 2;

    try {
        
        const response = await axios.post(
            'http://www.arch2devs.ct.ws/api/flux',
            {
                prompt: prompt,
                width: 1440,
                height: 1440,
                steps: steps
            },
            {
                headers: { 'Content-Type': 'application/json' },
                responseType: 'stream', 
                timeout: 15000 
            }
        );

        
        res.setHeader('Content-Type', 'image/jpeg');
        response.data.pipe(res);

    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            res.status(504).json({ error: 'Request timed out. Try again later.' });
        } else if (error.response) {
            res.status(error.response.status).json({ error: error.response.statusText });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});



app.get("/vit", async (req, res) => {
    const { prompt } = req.query;

    if (!prompt) {
        return res.status(400).send("prompt require!");
    }

    try {
        
        const response = await axios.get(`http://www.arch2devs.ct.ws/api/weigen?prompt=${encodeURIComponent(prompt)}`, {
            responseType: "stream",
        });

        
        res.setHeader("Content-Type", "image/jpeg");
        response.data.pipe(res);

    } catch (error) {
        console.error("error:", error.response ? error.response.data : error.message);
        res.status(500).send("Error generating the image");
    }
});



app.get("/ai", async (req, res) => {
    const { text } = req.query;
    const model = req.query.model || "gpt-4o-mini";
    if (!text) {
        return res.status(400).json({
            error: "Missing text to ask the ai"
        })
    }
 
    try {
        const response = await axios.post(
            "http://www.arch2devs.ct.ws/api/v1/chat/completions",
            {
    model: model,
    messages: [
         {
        role: "user",
        content: text,
                    },
                ],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.get("/llma", async (req, res) => {
    const { text } = req.query;


    if (!text) {
        return res.status(400).json({
            error: "Missing text to ask the AI"
        });
    }

    try {
        const response = await axios.post(
            "http://www.arch2devs.ct.ws/api/llama-70b",
            {
                messages: [
                    {
                        role: "user",
                        content: text,
                    },
                ],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.get("/deepseek", async (req, res) => {
    const { text } = req.query;


    if (!text) {
        return res.status(400).json({
            error: "Missing text to ask the AI"
        });
    }

    try {
        const response = await axios.post(
            "http://www.arch2devs.ct.ws/api/deepseek-70b",
            {
                messages: [
                    {
                        role: "user",
                        content: text,
                    },
                ],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/gpt', async (req, res) => {
    const text = req.query.text;
    try {
        const response = await axios.get(`http://www.arch2devs.ct.ws/api/gpt?content=${text}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong', details: error.message });
    }
});



app.get('/chat', async (req, res) => {
    const text = req.query.text;
    const id = req.query.id;
    try {
        const response = await axios.get(`http://www.arch2devs.ct.ws/api/chat?content=${text}&conversationId=${id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong', details: error.message });
    }
});



app.get("/tts", async (req, res) => {
    const prompt = req.query.prompt;
    const voice = req.query.voice || "Ivy";
    try {
        const response = await axios({
            method: "GET",
            url: `http://www.arch2devs.ct.ws/api/polly?text=${prompt}&voice=${voice}`,
            responseType: "stream", 
        });

        
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Transfer-Encoding", "chunked");

        response.data.pipe(res);
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
});



app.get("/art", async (req, res) => {
    const { imageUrl } = req.query;

    if (!imageUrl) {
        return res.status(400).send("Please provide an image URL!");
    }

    try {
        
        const response = await axios.get(`http://www.arch2devs.ct.ws/api/toanime?url=${encodeURIComponent(imageUrl)}`, {
            responseType: "stream",
        });

        
        res.setHeader("Content-Type", "image/jpeg");
        response.data.pipe(res);

    } catch (error) {
        console.error("expand error:", error.response ? error.response.data : error.message);
        res.status(500).send("Error expanding the image");
    }
});


app.get('/hentai', async (req, res) => {
    const type = req.query.type;
    try {
        const response = await axios.get(`http://www.arch2devs.ct.ws/api/hentai?action=${type}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'API request failed' });
    }
});



app.get("/fc", async (req, res) => {
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



app.get('/alldl', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

  const response = await axios.get(`https://www.noobs-api.rf.gd/dipto/alldl?url=${url}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });
    res.json({ data: response.data });
  } catch (error) {
    console.error('alldl Error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});



app.get("/imgur", async (req, res) => {
    try {
        const { imageUrl } = req.query;

        if (!imageUrl) {
            return res.status(400).json({ error: "Please provide an image URL" });
        }

        
        const response = await axios.get(imageUrl, { responseType: "arraybuffer", headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        } });
        const imageBase64 = Buffer.from(response.data).toString("base64");

        
        const formData = new FormData();
        formData.append("image", imageBase64);

        
        const imgurResponse = await axios.post("https://api.imgur.com/3/image", formData, {
            headers: {
                Authorization: "Client-ID da9c35e7d727e2d",
                ...formData.getHeaders()
            }
        });

        res.json({ url: imgurResponse.data.data.link });
    } catch (error) {
        res.status(500).json({ error: "Upload failed", details: error.message });
    }
});



const imgbbApiKey = "1b4d99fa0c3195efe42ceb62670f2a25";

app.use(express.json());


app.get('/imgbb', async (req, res) => {
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
            params: { key: imgbbApiKey }
        });

        return res.json({ imageUrl: imgbbResponse.data.data.url });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to upload image to imgbb." });
    }
});


app.get("/flag", async (req, res) => {
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

app.get('/font/list', (req, res) => {
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

app.get('/font', (req, res) => {
  const { text, fontId } = req.query;
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



app.get("/ghibli", async(req,res)=>{
  const { prompt } = req.query;
        try {
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/strangerzonehf/Flux-Ghibli-Art-LoRA",

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


app.get("/x-search", async (req, res) => {
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
app.get("/expends", async (req, res) => {
    const { imageUrl } = req.query;
    const seed = req.query.seed || "2";

    if (!imageUrl) {
        return res.status(400).send("Please provide an image URL!");
    }

    const imagePath = path.join(DOWNLOAD_FOLDER, "input.jpg");

    try {
        const response = await axios.get(imageUrl, { responseType: "stream" });
        const writer = fs.createWriteStream(imagePath);

        response.data.pipe(writer);

        writer.on("finish", async () => {
            console.log("Image downloaded successfully:", imagePath);

            const form = new FormData();
            form.append("image_file", fs.createReadStream(imagePath));
form.append("extend_left", "130");
form.append("extend_right", "130");
form.append("extend_up", "130");
form.append("extend_down", "130");
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
        });

        writer.on("error", (err) => {
            console.error("Download error:", err);
            res.status(500).send("Error downloading the image");
        });
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
                                                                      
app.get('/save-album', async (req, res) => {
  const { category, link } = req.query;
  if (!category || !link) {
    return res.status(400).json({ message: 'category and link are required' });
  }

  const newLink = new Link({ category, link });
  await newLink.save();

  res.status(201).json({ message: `✅ Successfully saved the video to ${category} category` });
});


app.get('/album', async (req, res) => {
  const category = req.query.category || "funny";

  const links = await Link.find({ category });

  if (links.length === 0) {
    return res.status(404).json({ message: 'No links found in this category' });
  }

  const categories = await Link.distinct('category');

  const randomLink = links[Math.floor(Math.random() * links.length)];

  res.json({ all: links, category: categories, video: randomLink, link: randomLink.link  });
});



app.listen(PORT, () => {
  console.log(`🔥 HASAN'S APIS IS RUNNING`);
});
