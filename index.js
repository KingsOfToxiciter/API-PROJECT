require("dotenv").config();
const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const util = require("util");
const puppeteer = require("puppeteer");
const { BING_COOKIE } = require('./config');


const app = express();
const PORT = 3000;


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

    response.data.pipe(res); // ইমেজ ডাটা সরাসরি পাঠান
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
              //your api url
                { "inputs": prompt },
              //payload body for request data
                {
                    headers: {
                        Authorization: "Bearer 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",
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

const DOWNLOAD_FOLDER = path.join(__dirname, "downloads");

if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER);
}

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
                            Authorization: "Bearer ${process.env.VYRO_API}", 
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


app.get("/upscale", async (req, res) => {
    const { imageUrl } = req.query;

    if (!imageUrl) {
        return res.status(400).send("Please provide an image URL!");
    }

    try {
        
        const response = await axios.get(`http://www.arch2devs.ct.ws/api/upscale?url=${encodeURIComponent(imageUrl)}`, {
            responseType: "stream",
        });

        
        res.setHeader("Content-Type", "image/jpeg");
        response.data.pipe(res);

    } catch (error) {
        console.error("Upscale error:", error.response ? error.response.data : error.message);
        res.status(500).send("Error upscaling the image");
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
            form.append("image", fs.createReadStream(imagePath));

            try {
                const enhanceResponse = await axios.post(
                    "https://api.vyro.ai/v2/image/background/remover",
                    form,
                    {
                        headers: {
                            ...form.getHeaders(),
                            Authorization: "Bearer ${process.env.VYRO_API}",
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



app.get("/midjourney", async(req,res)=>{
  const { prompt } = req.query;
        try {
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/Keltezaa/midjourney-v6-1-meets-flux-sdxl",
              //your api url
                { "inputs": prompt },
              //payload body for request data
                {
                    headers: {
                        Authorization: "Bearer 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",
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
              //your api url
                { "inputs": prompt },
              //payload body for request data
                {
                    headers: {
                        Authorization: "Bearer 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",
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




const API_KEYS = [
  "sk-cHihos8KV0KCJSvLlcaml5azkN3SdXuq4TA6DBmOylANHlUo",
"sk-7tZTTPRMUk7x7Jo0SfSRQOvAITYWswXw7MRrGKv9zJX7qLhA",
"sk-2TtHsl6lyu2qb9UiKYwTTavEo7iHV7vR4l8Op9mMRjz5X0hR",
"sk-t65wMeQw90K1IGUIIeyMs9B4HpG1UvqLP8gPeZ6irNldIvvS",
"sk-y4sDPSyI7NNQ8mq47KiakbWzfNVtmeUOr8fgU5MG35jEGoHz",
"sk-GlRBuow1xk8eWkLps4ViTeIypGXzLbnBmCPl8jQuzuE36aZU",
"sk-sMauynUU1EjMcEby72W80QHYMZvMloeRWW8Ki3vAvQb4daG5"
];

      let apiKey = API_KEYS[Math.floor(Math.random() * API_KEYS.length)];

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
          Authorization: `Bearer ${apiKey}`, 
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


app.use(express.json());

app.get('/bing', async (req, res) => {
    const { prompt } = req.query;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        
        await page.setCookie({
            name: "_U",
            value: BING_COOKIE,
            domain: ".bing.com",
            path: "/"
        });

        await page.goto('https://www.bing.com/images/create');
        await page.waitForSelector("input[placeholder=\"Describe the image you want created or select 'Surprise Me' to get inspired!\"]");

        
        await page.type("input[placeholder=\"Describe the image you want created or select 'Surprise Me' to get inspired!\"]", prompt);
        await page.click('button[type="Creat"]');

        
        await page.waitForSelector('img.generated-image', { timeout: 60000 });

        
        const images = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('img.generated-image')).map(img => img.src);
        });

        await browser.close();
        res.json({ prompt, images });

    } catch (error) {
        await browser.close();
        res.status(500).json({ error: "Failed to generate image", details: error.message });
    }
});



app.get('/gen', async (req, res) => {
    const { prompt } = req.query;
    try {
        const response = await axios.post(
            'http://www.arch2devs.ct.ws/api/flux',
            {
                prompt: prompt,
                steps: 2
            },
            {
                headers: { 'Content-Type': 'application/json' },
                responseType: 'stream'
            }
        );

        res.setHeader('Content-Type', 'image/jpeg');
        response.data.pipe(res);

    } catch (error) {
        res.status(500).json({ error: error.message });
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





app.listen(PORT, () => {
  console.log(`🔥 HASAN'S APIS IS RUNNING`);
});
