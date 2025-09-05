const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const util = require("util");
const cheerio = require("cheerio");
const cors = require("cors");
const mongoose = require('mongoose');
const crypto = require('crypto');

async function getKey() {
  const response = await axios.get('https://api.mp3youtube.cc/v2/sanity/key', {
  headers: {
    'authority': 'api.mp3youtube.cc',
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'if-none-match': 'W/"7e-Xcrp6nLPTZPdL1e3Scx4/pfbzWg-gzip"',
    'origin': 'https://iframe.y2meta-uk.com',
    'referer': 'https://iframe.y2meta-uk.com/',
    'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
  }
});
  return response.data.key;
};


async function xnxx(url) {
  if(!url) {
    throw new Error("Url must be needed");
  }
  try {
    const response = await axios.get(url, {
      headers: {
        'authority': 'www.xnxx.tv',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en-US,en;q=0.9',
        'cookie': 'cit=720148e249640c8aqbG-DQxXu4SyBmFbPtWt6g%3D%3D; last_views=%5B%2274183059-1747741517%22%2C%2267789443-1747744917%22%2C%2285501597-1748684644%22%2C%2283695929-1748685431%22%2C%2281860929-1749737569%22%2C%2250484511-1749737699%22%2C%2281789093-1749785459%22%2C%2245865721-1749795323%22%2C%2283645841-1749816161%22%2C%2264095431-1749816547%22%2C%2285673411-1750126545%22%2C%2278324243-1750127135%22%2C%2269184635-1751874533%22%2C%2281158057-1751874827%22%2C%2282286925-1751877865%22%2C%2266203957-1752391011%22%5D; session_token=70164f83aff6fdfe96flGgShwVhWbKDwrbsdl20R7qRejiPCYjJi8XQbU8kgpF6SijFJBoXIjsaVUNakDWphVqTxtCh2Oyt9IopuL0ug-8C-E0LJaKVdj4jJNFzsr8QcE2ZleHxwDwmCeZRGfdn6X6Ryeqgj8hPziyiCBGJN6sACVu4ntJCsB7b-07FaYijrR41bdsN065NsFD1DdsJYdwnC18fl93zEngAbeR7sLLOWOIDAexbhRwUXbPQ%3D',
        'device-memory': '2',
        'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-arch': '""',
        'sec-ch-ua-bitness': '""',
        'sec-ch-ua-full-version': '"137.0.7337.0"',
        'sec-ch-ua-full-version-list': '"Chromium";v="137.0.7337.0", "Not/A)Brand";v="24.0.0.0"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-model': '"ORBIT Y21"',
        'sec-ch-ua-platform': '"Android"',
        'sec-ch-ua-platform-version': '"12.0.0"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
        'viewport-width': '980'
      }
    });

    const $ = cheerio.load(response.data);

    const highQualityVideo = $("a:contains('View High Qual')").attr("href");

    const lowQualityVideo = $("a:contains('View Low Qual')").attr("href");

    return lowQualityVideo;
  
  } catch (e) {
    throw new Error(e);
  }
};

async function facebook(url) {
  if(!url) {
    throw new Error("Url must be needed");
  }
  try {
    const response = await axios.get(url, {
      headers: {
        'authority': 'www.facebook.com',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en-US,en;q=0.9',
        'cookie': 'datr=c1gHaEA27fsp1OHJA5czZ9Xu; sb=c1gHaMNf9Nf9K2sooe1BLUom; ps_l=1; ps_n=1; vpd=v1%3B700x360x2; pas=61574558282971%3AdCQhOqCBYn%2C61571148094230%3AvRlsSrb3l6; dpr=2; c_user=61571148094230; xs=25%3A6nUJpYmb_HdTwA%3A2%3A1752321459%3A-1%3A-1; locale=en_GB; fr=1jcsemZeFFCBfhiea.AWekjxtyk3_-r9Ra14g7zu1l8vSNVAvDHIUIrd_vERd-dTXT4bg.BocsVS..AAA.0.0.Boc2ea.AWclusnQdrnXk5c-UoT_CxqpmEc; fbl_st=101436729%3BT%3A29206560; wl_cbv=v2%3Bclient_version%3A2868%3Btimestamp%3A1752393626%3BCRCM%3A-1335446266',
        'dpr': '2',
        'sec-ch-prefers-color-scheme': 'light',
        'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-full-version-list': '"Chromium";v="137.0.7337.0", "Not/A)Brand";v="24.0.0.0"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-model': '"ORBIT Y21"',
        'sec-ch-ua-platform': '"Android"',
        'sec-ch-ua-platform-version': '"12.0.0"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
        'viewport-width': '980'
      }
    });

    const $ = cheerio.load(response.data);

    const videoUrl = $('[data-video-url]').attr('data-video-url');

  return videoUrl;
  } catch (e) {
    throw new Error(e);
  }
};


async function youtube(url, format, quality) {
        if(!url || !format || !quality) {
           throw new Error("Please provide a youtube video url and also format and quality...!!");
        } else if (!["mp4", "mp3"].includes(format)) {
           throw new Error("Format must be between mp3 and mp4...!!");
        } else if (!["sd", "hd"].includes(quality)) {
           throw new Error("Quality must be between hd or sd");
        };
        const qualityMap = {
          sd: "360",
          hd: "720"
       };
       quality = qualityMap[quality];
    try {
         const key = await getKey();
         console.log(key);
         const { data } = await axios.post(
            'https://api.mp3youtube.cc/v2/converter',
            new URLSearchParams({
            'link': url,
            'format': format,
            'audioBitrate': '128',
            'videoQuality': quality,
            'filenameStyle': 'pretty',
            'vCodec': 'h264'
        }),
      {
       headers: {
           'authority': 'api.mp3youtube.cc',
           'accept': '*/*',
           'accept-language': 'en-US,en;q=0.9',
           'key': key,
           'origin': 'https://iframe.y2meta-uk.com',
           'referer': 'https://iframe.y2meta-uk.com/',
           'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
           'sec-ch-ua-mobile': '?1',           'sec-ch-ua-platform': '"Android"',
           'sec-fetch-dest': 'empty',
           'sec-fetch-mode': 'cors',
           'sec-fetch-site': 'cross-site',
           'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
        }
     });
         return data.url;
      } catch (e) {
      throw new Error(e);
   }
};


async function tiktok(url) {
  if (!url) {
    throw new Error("url is required");
  }
  try {
  const response = await axios.post(
  'https://ssstik.io/abc',
  new URLSearchParams({
    'id': url,
    'locale': 'en',
    'tt': 'ckh5YXE3'
  }),
  {
    params: {
      'url': 'dl'
    },
    headers: {
      'authority': 'ssstik.io',
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'cookie': '_ga=GA1.1.791678634.1752117892; _ga_ZSF3D6YSLC=GS2.1.s1752117891$o1$g1$t1752118012$j17$l0$h0',
      'hx-current-url': 'https://ssstik.io/',
      'hx-request': 'true',
      'hx-target': 'target',
      'hx-trigger': '_gcaptcha_pt',
      'origin': 'https://ssstik.io',
      'referer': 'https://ssstik.io/',
      'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
    }
  }
);
  const dlUrl = response.data.split('<a href="')[1].split('"\r\n\t\t\t\tclass=')[0];
 
    return dlUrl;
  } catch (e) {
    throw new Error(e);
  }
};



async function fluxproGen(prompt) {
  const hash = crypto.randomBytes(6).toString('hex');
  await axios.post(
    'https://nihalgazi-flux-pro-unlimited.hf.space/gradio_api/queue/join',
    {
      'data': [
        prompt,
        1280,
        1280,
        0,
        true,
        'Google US Server'
      ],
      'event_data': null,
      'fn_index': 0,
      'trigger_id': 8,
      'session_hash': hash
    },
    {
      params: {
        '__theme': 'system'
      },
      headers: {
        'authority': 'nihalgazi-flux-pro-unlimited.hf.space',
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'origin': 'https://nihalgazi-flux-pro-unlimited.hf.space',
          'referer': 'https://nihalgazi-flux-pro-unlimited.hf.space/?__theme=system',
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
      }
    }
  );

  return new Promise((resolve, reject) => {
    axios.get('https://nihalgazi-flux-pro-unlimited.hf.space/gradio_api/queue/data', {
      params: {
        'session_hash': hash
      },
      responseType: 'stream',
      headers: {
        'authority': 'nihalgazi-flux-pro-unlimited.hf.space',
          'accept': 'text/event-stream',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'referer': 'https://nihalgazi-flux-pro-unlimited.hf.space/?__theme=system',
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
    }).then((streamResponse) => {
      streamResponse.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(Boolean);
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(6));
              if (jsonData.msg === 'process_completed') {
                const url = jsonData.output.data[0].url;
                resolve(url);
                streamResponse.data.destroy();
              }
            } catch (e) {
              console.log(e);
            }
          }
        }
      });

      streamResponse.data.on('end', () => {
        reject(new Error('Stream ended without receiving image URL.'));
      });

      streamResponse.data.on('error', (err) => {
        reject(err);
      });
    }).catch((err) => reject(err));
  });
};

let index = 0;
let error;

async function fallBack(request, keys) {
  try {
    const result = await request(keys[index]);
    return result;
  } catch (err) {
    error = err;
    console.warn(`Default key attempt failed`, err.response?.data || err.message);
  }

  for (let i = 0; i < keys.length; i++) {
    if (i === index) continue;
    try {
      const result = await request(keys[i]);
      index = i;
      return result;
    } catch (err) {
      console.warn(`Fallback attempt ${i + 1} failed`, err.response?.data || err.message);
    }
  }

  throw new Error(error);
}


async function getDataFromSeaArt(taskId, token) {
  for (let i = 0; i < 150; i++) {
    const progressRes = await axios.post(
      'https://www.seaart.ai/api/v1/task/batch-progress',
      { task_ids: [taskId] },
      {
        headers: {
          'accept': 'application/json',
              'content-type': 'application/json',
              'origin': 'https://www.seaart.ai',
              'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
              'token': token,
              'cookie': `deviceId=b22cba40-82e8-4a6c-b848-73cca5981832; browserId=ad76c755dbc5f95661f3966b89636995; enable_tavern=true; _fbp=fb.1.1747855321503.311337970280745383; T=${token}; lang=en; X-Eyes=false; locaExpire=1747855729248; enableAI=true; _pin_unauth=dWlkPVpERTVaR013TXpndE9EZzVOaTAwTmpCaUxUazFZall0TjJWa1pETmtaREV6TVRRMg; _ga=GA1.1.276754469.1747855464; pageId=159f4459-f5fa-4bc4-88bd-14ac8c15523c; isDeadline=false; _uetsid=f73af8e0367811f0bd3a9184f4cc5203; _uetvid=f73c4920367811f08b593126b804bb8f; _gcl_au=1.1.1331792051.1747855472; _ga_YDMZ43CD3E=GS2.1.s1747855463$o1$g1$t1747855523$j60$l0$h0$d6yRGdON-vVeizP__A09bqDF3J5_raAlwuw; _ga_4X5PK5P053=GS2.1.s1747854368$o4$g1$t1747855523$j22$l0$h0$dzRIoWr8gMFVSSY6tOrCd7ulrZZS3UpeoJg`
          
        }
      }
    );

    console.log(progressRes.data.status);

    const items = progressRes.data?.data?.items;
    const task = items?.find(item => item.task_id === taskId);

    if (task && task.status === 3 && task.status_desc === "finish") {
      const imageUrls = task.img_uris.map(img => img.url);
      return imageUrls;
    }

    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  throw new Error('Image generation timed out.');

}


async function getOnceArtData(statusUrl, responseUrl) {
  for (let i = 0; i < 50; i++) {
    const statusRes = await axios.get(statusUrl, {
      headers: {
           'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
           'sec-ch-ua-mobile': '?1',
           'Authorization': 'Key be2ef301-67be-4834-a9dc-485549cc1719:b54707a909af99411f1158ceb32184be',
           'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
           'Content-Type': 'application/json',
           'Accept': 'application/json',
           'Referer': 'https://www.onceart.com/',
           'sec-ch-ua-platform': '"Android"'
      }
    });
         console.log(statusRes.data.status);
    if (statusRes.data.status === "COMPLETED") {
      try {
        const { data } = await axios.get(responseUrl, {
          headers: {
            'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
            'sec-ch-ua-mobile': '?1',
            'Authorization': 'Key be2ef301-67be-4834-a9dc-485549cc1719:b54707a909af99411f1158ceb32184be',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Referer': 'https://www.onceart.com/',
            'sec-ch-ua-platform': '"Android"'
          }
        });

        console.log(data);
        const imageUrls = data.images.map(img => img.url);
        return imageUrls;
      } catch (e) {
        console.error("Error fetching final image data:", e.message);
      }
      break;
    } else {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error("Image not found");
}


async function getOnceArtUpscale(statusUrl, responseUrl) {
  for (let i = 0; i < 50; i++) {
    const statusRes = await axios.get(statusUrl, {
      headers: {
           'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
           'sec-ch-ua-mobile': '?1',
           'Authorization': 'Key be2ef301-67be-4834-a9dc-485549cc1719:b54707a909af99411f1158ceb32184be',
           'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
           'Content-Type': 'application/json',
           'Accept': 'application/json',
           'Referer': 'https://www.onceart.com/',
           'sec-ch-ua-platform': '"Android"'
      }
    });
         console.log(statusRes.data.status);
    if (statusRes.data.status === "COMPLETED") {
      try {
        const { data } = await axios.get(responseUrl, {
          headers: {
            'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
            'sec-ch-ua-mobile': '?1',
            'Authorization': 'Key be2ef301-67be-4834-a9dc-485549cc1719:b54707a909af99411f1158ceb32184be',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Referer': 'https://www.onceart.com/',
            'sec-ch-ua-platform': '"Android"'
          }
        });

        console.log(data);
        return data.image.url;
      } catch (e) {
        console.error("Error fetching final image data:", e.message);
      }
      break;
    } else {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error("Image not found");
}



async function seaArtUploader(imageUrl) {

  const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });

    const imageData = imageResponse.data;
    const fileSize = imageData.byteLength;
  
  const preSignResponse = await axios.post(
  'https://www.seaart.ai/api/v1/resource/uploadImageByPreSign',
  {
    'content_type': 'image/jpg',
    'file_name': '1735821792651~2.jpg',
    'file_size': fileSize,
    'category': 36
  },
  {
    headers: {
      'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
      'Accept-Language': 'en',
      'X-Platform': 'phone',
      'X-Browser-Id': '98dfea4847152fe8011f93b21df580ca',
      'X-Request-Id': 'c9d845af-0a73-4ea2-b21e-276dbbd01cc9',
      'X-User-Id': '9e67c60d594b39655fdad011feb2b1fb',
      'sec-ch-ua-platform': '"Android"',
      'X-App-Id': 'phone_global_seaart',
      'X-Timezone': 'Asia/Dhaka',
      'sec-ch-ua-mobile': '?1',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
      'Referer': 'https://www.seaart.ai/create/image?id=f8172af6747ec762bcf847bd60fdf7cd&model_ver_no=2c39fe1f-f5d6-4b50-a273-499677f2f7a9',
      'X-Eyes': '7aa77862-ae84-4094-b614-6fdab2cd006f',
      'X-Device-Id': '5292478b-2708-4170-b43a-22f26b11d952',
      'Token': 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzZWEtYXJ0IiwiYXVkIjpbImxvZ2luIl0sImV4cCI6MTc1MzI3MTE2OSwiaWF0IjoxNzQ4MDg3MTY5LCJqdGkiOiI3MzEyNDQxMjIwMDU5MjM4OSIsInBheWxvYWQiOnsiaWQiOiI5ZTY3YzYwZDU5NGIzOTY1NWZkYWQwMTFmZWIyYjFmYiIsImVtYWlsIjoidG94aWMucGVyc29uNjI1MUBnbWFpbC5jb20iLCJjcmVhdGVfYXQiOjE3NDgwODcxNjkyODUsInRva2VuX3N0YXR1cyI6MCwic3RhdHVzIjozLCJpc3MiOiIifX0.S10CFB9MIti8b5RzM4agQXGjz7IPZ3JujmkDuRzJyYWyeNK-cO2pe1zYsGsWYyLtQFupMoBM5EcuO9sGAd3NfbSGkJSZCb27R6F-aFyZKxVo4s2ATGStA4cRaIiaGmjCYlaVTf8DH6fr1eZebJ5I8CNJ7amW2AI6iXIQlQt6_y0illn9wCecUnnKugKMi7bo4U6dXx9CZcyvmyuGFW4afTseir9SxDoYP4AFQBMimwY6Kt_b1_vQLDIZKSSE1JDRW_5Vp2nmrDm-09E_hX-7QJ6vrZMqIXFMACZ4pKoOfLWqe9mD-8GnJlhy2_pBNy2F33OXpzsoPkE_8sLKSCOhyg',
      'X-Page-Id': '7aa77862-ae84-4094-b614-6fdab2cd006f'
    }
  }
);
  const rqUrl = preSignResponse.data.data.pre_sign;
  const id = preSignResponse.data.data.file_id;

     const uploadResponse = await axios.put(rqUrl, imageData, {
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'image/jpg',
        'origin': 'https://www.seaart.ai',
        'referer': 'https://www.seaart.ai/',
        'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
        console.log({ message: "Image uploaded successfully!", status: uploadResponse.status });

      const response = await axios.post(
      'https://www.seaart.ai/api/v1/resource/confirmImageUploadedByPreSign',
      {
        'category': 20,
        'file_id': id,
        'template_id': 'd017fv5e878c738ltm1g'
      },
      {
        headers: {
          'authority': 'www.seaart.ai',
          'accept-language': 'en',
          'cookie': '_fbp=fb.1.1748087168835.720825901918752980; T=eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzZWEtYXJ0IiwiYXVkIjpbImxvZ2luIl0sImV4cCI6MTc1MzI3MTE2OSwiaWF0IjoxNzQ4MDg3MTY5LCJqdGkiOiI3MzEyNDQxMjIwMDU5MjM4OSIsInBheWxvYWQiOnsiaWQiOiI5ZTY3YzYwZDU5NGIzOTY1NWZkYWQwMTFmZWIyYjFmYiIsImVtYWlsIjoidG94aWMucGVyc29uNjI1MUBnbWFpbC5jb20iLCJjcmVhdGVfYXQiOjE3NDgwODcxNjkyODUsInRva2VuX3N0YXR1cyI6MCwic3RhdHVzIjozLCJpc3MiOiIifX0.S10CFB9MIti8b5RzM4agQXGjz7IPZ3JujmkDuRzJyYWyeNK-cO2pe1zYsGsWYyLtQFupMoBM5EcuO9sGAd3NfbSGkJSZCb27R6F-aFyZKxVo4s2ATGStA4cRaIiaGmjCYlaVTf8DH6fr1eZebJ5I8CNJ7amW2AI6iXIQlQt6_y0illn9wCecUnnKugKMi7bo4U6dXx9CZcyvmyuGFW4afTseir9SxDoYP4AFQBMimwY6Kt_b1_vQLDIZKSSE1JDRW_5Vp2nmrDm-09E_hX-7QJ6vrZMqIXFMACZ4pKoOfLWqe9mD-8GnJlhy2_pBNy2F33OXpzsoPkE_8sLKSCOhyg; lang=en; _ga=GA1.1.340240655.1748087628; deviceId=5292478b-2708-4170-b43a-22f26b11d952; _pin_unauth=dWlkPU5EQmxNREEzWmprdE9XVTVOaTAwTmpVMExXSTVZemN0WXpVeU4yTXlORGxsWVdKaA; _gcl_au=1.1.1270424245.1748087632; X-Eyes=false; pageId=2c3b4626-4370-4b9e-a8dd-71494dc72310; browserId=98dfea4847152fe8011f93b21df580ca; _uetsid=aedf8940389411f0917d07efd83b86f6; _uetvid=aee05ff0389411f0a059db47d8dfec6a; enable_tavern=true; _ga_YDMZ43CD3E=GS2.1.s1748197309$o3$g1$t1748200048$j52$l0$h0$dcbHaxZBZnasAV6mnLTarPLtS7J2dnyTfRQ; _ga_4X5PK5P053=GS2.1.s1748197311$o15$g1$t1748200055$j50$l0$h0$dzRIoWr8gMFVSSY6tOrCd7ulrZZS3UpeoJg',
          'origin': 'https://www.seaart.ai',
          'referer': 'https://www.seaart.ai/create/ai-app?id=d017fv5e878c738ltm1g',
          'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
          'sec-ch-ua-mobile': '?1',
          'sec-ch-ua-platform': '"Android"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'token': 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzZWEtYXJ0IiwiYXVkIjpbImxvZ2luIl0sImV4cCI6MTc1MzI3MTE2OSwiaWF0IjoxNzQ4MDg3MTY5LCJqdGkiOiI3MzEyNDQxMjIwMDU5MjM4OSIsInBheWxvYWQiOnsiaWQiOiI5ZTY3YzYwZDU5NGIzOTY1NWZkYWQwMTFmZWIyYjFmYiIsImVtYWlsIjoidG94aWMucGVyc29uNjI1MUBnbWFpbC5jb20iLCJjcmVhdGVfYXQiOjE3NDgwODcxNjkyODUsInRva2VuX3N0YXR1cyI6MCwic3RhdHVzIjozLCJpc3MiOiIifX0.S10CFB9MIti8b5RzM4agQXGjz7IPZ3JujmkDuRzJyYWyeNK-cO2pe1zYsGsWYyLtQFupMoBM5EcuO9sGAd3NfbSGkJSZCb27R6F-aFyZKxVo4s2ATGStA4cRaIiaGmjCYlaVTf8DH6fr1eZebJ5I8CNJ7amW2AI6iXIQlQt6_y0illn9wCecUnnKugKMi7bo4U6dXx9CZcyvmyuGFW4afTseir9SxDoYP4AFQBMimwY6Kt_b1_vQLDIZKSSE1JDRW_5Vp2nmrDm-09E_hX-7QJ6vrZMqIXFMACZ4pKoOfLWqe9mD-8GnJlhy2_pBNy2F33OXpzsoPkE_8sLKSCOhyg',
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
          'x-app-id': 'phone_global_seaart',
          'x-browser-id': '98dfea4847152fe8011f93b21df580ca',
          'x-device-id': '5292478b-2708-4170-b43a-22f26b11d952',
          'x-eyes': '2c3b4626-4370-4b9e-a8dd-71494dc72310',
          'x-page-id': '2c3b4626-4370-4b9e-a8dd-71494dc72310',
          'x-platform': 'phone',
          'x-request-id': '06b950af-9f30-4db4-aa4e-6f4a337fb056',
          'x-timezone': 'Asia/Dhaka',
          'x-user-id': '9e67c60d594b39655fdad011feb2b1fb'
        }
      }
    );
        if (response.data.status.code === 10000) {
          return response.data.data.url;
        } else throw new Error(response.data.status.msg);
  }
                      


async function downloadImageAsBase64(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const base64Image = Buffer.from(response.data, "binary").toString("base64");
  const mimeType = response.headers["content-type"];
  return { base64Image, mimeType };
}


function getRandomData(key) {
  return key[Math.floor(Math.random() * key.length)];
};

function fileName(ext) {
    return crypto.randomBytes(5).toString('hex') + ext;
};

async function upload(response, ext) {
  const filename = fileName("." + ext);
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
  return `https://www.th-hasan.page.gd/hasan/${filename}`;
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
  fallBack,
  getDataFromSeaArt,
  getOnceArtData,
  seaArtUploader,
  fluxproGen,
  getOnceArtUpscale,
  getRandomData,
  fileName,
  upload,
  downloadFromUrl,
  downloadImageAsBase64,
  xnxx,
  facebook,
  youtube,
  tiktok
};
