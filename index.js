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
const crypto = require('crypto');
const { GoogleGenAI, Modality } = require("@google/genai");
const Link = require('./models/Link');
const { spawn } = require("child_process");
const {
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
  downloadImageAsBase64
     } = require('./utils');
const { tokens, workIDs } = require("./config");

const DOWNLOAD_FOLDER = path.join(__dirname, "downloads");
if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER);
};

const AI_API_KEY = process.env.AI_API;
const hg_apis = process.env.HG_API.split(',').map(key => key.trim());
const sd_apis = process.env.ST_API.split(',').map(key => key.trim());

const app = express();
const PORT = 30009;

app.use(cors());
app.use(express.json());
// All other routes (must be the LAST route)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "404.html"));
});
const uploadFolder = path.join(__dirname, 'images');
app.use('/hasan', express.static(uploadFolder));


app.get("/api/tts", async (req, res) => {
  const text = req.query.text;
  if(!text) {
    return res.status(400).json({ status: "error", response: "text is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
  try {
    const response = await axios.get('https://vocloner.com/google.php', {
      params: {
        'state': 'HA-MJWUSBZV4I71HOFAP5K6DC93R2EN08QGTLXY',
        'code': '4/0AVMBsJjxLFC4J2GGFYMopGwWbWYOP5D1Be9tsFK8192oI4attMWsU0LQgDbzpgOZMi2MUA',
        'scope': 'email profile https://www.googleapis.com/auth/userinfo.email openid https://www.googleapis.com/auth/userinfo.profile',
        'authuser': '1',
        'prompt': 'none'
      },
      headers: {
        'authority': 'vocloner.com',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en-US,en;q=0.9',
        'cookie': '_tccl_visitor=f7c9bfc6-412d-403b-baa2-08f0ad1bd175; _ga=GA1.1.1765327107.1753309979; fpestid=0GAjO1lb3rCtL1Zw1BY73Tl00fVUZL9c8SVTyN4-5xiVvkz8xqgTxTkGrnZ0BUWb2WzmDA; _cc_id=fb6a8f2bb856bf1a77711a68ec3c5044; panoramaId_expiry=1753396381541; _tccl_visit=c117ab75-5947-4c61-bc16-71f8a999b167; _ga_T3P4M8519Q=GS2.1.s1753331471$o4$g1$t1753331582$j38$l0$h0; PHPSESSID=6hitojrjb82alvtcmem6kik95s; _scc_session=pc=7&C_TOUCH=2025-07-24T04:57:36.730Z',
        'referer': 'https://accounts.google.com/',
        'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
    });

    const { data } = await axios.post(
  'https://vocloner.com/tts_processprova.php',
  {
    'voice': '6f8db788565041cd82a48c5adeeba69f',
    'text': text,
    'format': 'mp3',
    'mode': 'standard'
  },
  {
    headers: {
      'authority': 'vocloner.com',
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      'cookie': '_tccl_visitor=f7c9bfc6-412d-403b-baa2-08f0ad1bd175; _ga=GA1.1.1765327107.1753309979; fpestid=0GAjO1lb3rCtL1Zw1BY73Tl00fVUZL9c8SVTyN4-5xiVvkz8xqgTxTkGrnZ0BUWb2WzmDA; _cc_id=fb6a8f2bb856bf1a77711a68ec3c5044; panoramaId_expiry=1753396381541; _tccl_visit=c117ab75-5947-4c61-bc16-71f8a999b167; _ga_T3P4M8519Q=GS2.1.s1753331471$o4$g1$t1753331582$j38$l0$h0; PHPSESSID=43ddvm0mrfsvi5ottt8mcj8dmm; _scc_session=pc=12&C_TOUCH=2025-07-24T05:03:05.774Z',
      'origin': 'https://vocloner.com',
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
    const url = "https://vocloner.com/" + data.file_path;
    const stream = await axios.get(url, {
      responseType: "stream",
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
    });
    const purl = await upload(stream.data, "mp3");
    res.status(200).json({ status: "success", response: purl, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  } catch (e) {
    console.error(e)
    res.status(500).json({ status: "error", response: e.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});


app.get("/api/tikVideo", async (req, res) => {
  const query = req.query.q;

  if (!query) return res.status(400).json({ status: "error", response: "❌ Provide a search query using ?q=", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

  try {
    const encodedQuery = encodeURIComponent(query);

    const url = `https://www.tiktok.com/api/search/general/full/?keyword=${encodedQuery}&offset=0&region=BD&search_source=search_sug&app_name=tiktok_web&device_platform=web_pc&browser_platform=Linux`;

    const response = await axios.get(url, {
      headers: {
        'authority': 'www.tiktok.com',
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cookie': 'tt_chain_token=hQOuCUPAL7s5ANo3N/p7zg==; passport_csrf_token=d662f5a5c53bebd34be85afd3292dff1; passport_csrf_token_default=d662f5a5c53bebd34be85afd3292dff1; d_ticket=abd7a7b047f5c6ced2a0d2033cbf5699bc9f6; last_login_method=email; _ttp=2xhmzAYkTaOHvj5aAkStBH90NB7; delay_guest_mode_vid=3; perf_feed_cache={%22expireTimestamp%22:1752292800000%2C%22itemIds%22:[%227520979738614107399%22%2C%227520183872844270855%22]}; tt_csrf_token=V6Vwfsqi-bZpv8fGBwbGitMafHp3OTm9EKos; s_v_web_id=verify_mcwwhs6m_meWoC4V9_TGsw_40rW_AnLg_TVo3CSDdcQ2w; tiktok_webapp_theme=dark; multi_sids=7128444573172384774%3A806932624bc9502b9adb752c5d819a55; cmpl_token=AgQQAPNYF-RO0rLTvDWxMp0_8k2bBkjHf4XTYN4Ojw; uid_tt=3498daaa520044f4694a6fe20a796c79f477fd054273def0d6c2803b6537bb30; uid_tt_ss=3498daaa520044f4694a6fe20a796c79f477fd054273def0d6c2803b6537bb30; sid_tt=806932624bc9502b9adb752c5d819a55; sessionid=806932624bc9502b9adb752c5d819a55; sessionid_ss=806932624bc9502b9adb752c5d819a55; store-idc=alisg; store-country-code=bd; store-country-code-src=uid; tt-target-idc=alisg; tt-target-idc-sign=ugjGdD16CmaG6yAfq3S2VHdBcizphL0I-jJXYn7P-OYJVicZGdZibsPM43QTIb_fEW6_htH0Moo_Be9QpyXHcuz0YnUaJ6LV7SBEQNDAldPIGbCOSorKkmePfa2BLjuOXpTOMiJctPM6ObWuuZuQ4e1oTLiYL36p53B-8uOay6ZG_ITziWkgenYVFlhHCCpG8_VFKa3mns2xafmW9TGn0lyHkNuvNhDZ53PtkNIDY3ovmt4b3pBxXn6dEwF0SJnQ35QT8R6FCzlCTyaKgPKmQlsAQTxMqmtyOMLW4PZS44_n1pJH6umRnucMX7GEhvVnUZyYnVzGBZxwMi77CjDRDJVq_mGipRCw2mXe2_KNCENtszVygo8eV457iSxfhdlfpZn4LnPPMzeQsZuJXBqE2NwXsj5J4vUPU9id1LAtGf92ptnTn7rhCanU7bxT6FuhBPRReMqdOKtPSgxQ_drK-8ox43nuK2o4NfbRwMdVcQ9baRJPSaI6Qp38ekqaoWwi; tiktok_webapp_theme_source=auto; passport_fe_beating_status=true; ttwid=1%7CuS68HhFC_BddrWqmZWNujJSrJ0M0BwF5sKiR61adsBw%7C1752122600%7C0e79b333de14d174fd20112ab2e6a903c0cc31061b39ec12c70da37692fcc39b; sid_guard=806932624bc9502b9adb752c5d819a55%7C1752122600%7C15551988%7CTue%2C+06-Jan-2026+04%3A43%3A08+GMT; sid_ucp_v1=1.0.0-KGE1MmVhOThiNmRlZGI0MWQxNzg4NWU2Yzg1YmVhZjU5M2Q4MTJjNmYKGgiGiIHIo9LU9mIQ6Im9wwYYsws4AUDqB0gEEAMaAm15IiA4MDY5MzI2MjRiYzk1MDJiOWFkYjc1MmM1ZDgxOWE1NQ; ssid_ucp_v1=1.0.0-KGE1MmVhOThiNmRlZGI0MWQxNzg4NWU2Yzg1YmVhZjU5M2Q4MTJjNmYKGgiGiIHIo9LU9mIQ6Im9wwYYsws4AUDqB0gEEAMaAm15IiA4MDY5MzI2MjRiYzk1MDJiOWFkYjc1MmM1ZDgxOWE1NQ; odin_tt=2c02112e482afdf97858529e35e763f971e0a9dab2c5bf87c2bac22b531ffe16af1a08df708d0c3677f734a88b1844f0e6d462ca61a6e8c36de1f2e456b11766ab125b41f10b14b72d9dec6fb214d224; store-country-sign=MEIEDPV-Yu0Pvc6xxfhy3QQgeDfni-pIluiK6HM01MJlvzbl9jAobhOfhBYddkTmijAEEHmRRTjYFZ8fLfsi8NfFlKg; msToken=Aes7Y7p_GV90Zdmgs273a5TOquhj9Mc7IiNaF3us-Q2SdXbJmOpEG4HSIyH3How81iSLDBszhNrSBg-Qr4al4SZhrVHMoGbZ1od8GhCg7xASHOxdqSSpKWSIyJ6qcQP1jptpTkRecK83Nr2bzByZEMEScw==; msToken=B6nTOjsoaC5zQcCkg9_4T217IG69cT8M-Xo2a6ReNMswXvQIVxZWu-Q0goJnyuDQz9XyCQ_Z-eiDAYN0y_-I8nK1NWsWBOighvoDR7Syrier3rp78dlCu-Xns3Cm3Kk0hQWAaR-2lW920kT89X4fmdkkmw==',
        'referer': `https://www.tiktok.com/search/video?q=${encodedQuery}&t=1752122641477`,
        'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        'x-mssdk-info': '9d5n02SyoWPFaLu4kFzjeHbJ2KWK7oO6bVks2lXCIJPkcLc.gMnIwp8rOUgFzMD8WYZU.zYORD6HAr4uGK0G9SFGEjirvDYPdHmMcwRCGI.3BAx0k4HRG0jfgHEDlK9.IlOWhxue30543n520MeheytgEhTZqIcDL9uDJ6GlD9WSLbsgq9MsAUP9L5lFO1BezX64cQK6hLQ9U3KVHybMyy1vGRG8cGRR3rAQbosJ0WBZ9wsvbAJ57Uux7PsuQ6Jq4GaRH1031Tn7NOQP30lHxARSYqN9QXJ5MQ1NH8if1aRmSWhhS9rHn6aCXAnGwRSpyDpKX.uKqQkrzI4jmAttKtfXTeeAlGcPWv0O8SayjfDwUwiQMjNVFzI61FmLV2zcY4XF8sor8ASsPOqWkNNEY1bYxewEoBcM1ilyX3sNDgeizwUTBwuDWUkZlWAWmbxp079FanvxV1MmhlpIFJlmMZE0uMcl1IeP4LcxUcRGhmzOadgeEdUjJLz6YJqD52AfT7H6615sVsxD9.3bEGEVVlLwe4Au8I1-IHHhNj9Itu50TeeK3LYoIIPcsRnc2Tj2FP-y2Di0dgXobYb1xVmM74qE4c9MwLx-Sio8i2oELmkIyzN84RdfllLUjsJy5ufLSJWnPg9nd9KXu68C.J9rPH8nXxR7YH6FjRmw68ZvJTvaHCopcwnv5AzNL9Kyo5pAjhjkVmI-aWu4RkjIBSs4QbjD3AYkZQVPMyZV37l8HRp6Rax8u5juHHTFgGKpZN8MfP5rkSZZLWKE4jIv8aLGUsW85S3nti2xqC-KfBbjzDnqB-S2V7fefi2oixxnIk-1ULHm3hbIkphKFkt8FvI3UWhKAEem9JwVhEMKo.CAzezILNEmqCc7xLWD.xZ5zq9e4QoTMbqhSEFLR7HHuTSL1cKPrQI9YhtzNUKsibzx7khufu9xThIzR8TR5x31dQxmlfexr0JBvQ6N8KDHcaz1KxYbVBkoccOQIuk8xaUMn8tGzFxZJnd1ugWjA7Pys8EAiDXRoIwzw5T7Gspnw00ER.ikJXXBUZr.iBxCbPsEuO6kcS1P22oDFPDhrGPg8IC1N0KIuI2ITx8a9CE1sBqjcdGox4bL1ndotvRV2-MvZi8tEWvRJZt.SNDv6Srx.a4.mA7oie45U-7zkTAxP2R.GkK3P8uW-1dZwkGyQxbRwB5FhLYnS3E5HK.0BNWXKiDQKy0b4ki5EgKCY5wJMOCOFLb8zRnjtukWBpNJmYL1KGTDM-gnB4dcRl2AItekSyRjnEFxrwXWeM6qs0t9Bp-Ow27ZmH041E5-MJQDqNsUxWax.52vmGVlU4FWTrkR9rN5WS2hi-G8OrmYVZuVWE.LA0mJdFmoXvEifvjY.ffHHKwDCvC0qB2.BeH5Ml-5Z9jdBSWxcqxq1BZFdH8WGgkih8nupSmGIslYTvwrIBuviwSo8xMIw88x61seo0hVReo7p0i9NLkHNLRkieBTQfYskwN5PeAB6WCwAH0FmkxnZ.lJNtB9kGBvBiad6ZY6nWTf0qS.DA3SVbAPJvabb20tgI3.w93YlPHXt6lSpRilxctP3SbhioXj1W85s8ztS2UNW8-0SAXB8K1u1YtK7jg7AuI-uoM5dyPjNW-nbqHJM8koJrTPks3WmNGaXm3rXs3.gkTM87CzYNaMcec2bMiH08y3qvYFzHCkuQNv0UPIuZJvtzdRrUXyGh3YCGWdbII7gHV10YhVj0FKGl.2YABXWkeKnpFEvPiW-QMlhub8pTbRWPdIEHSclmfHF.nHBX34dvd3Mf61QE8uHRywF72XYiJkYERQxMIv81h5Jq8Kr8Mnlb9FDJv3zyJaLAG.qCiSTvUwcmmlEh8Z5fi-APi4JOW2qDsqW8UDC4twDeSDak06RWXwPpk5Pk6KQloagCaoP3ds7FELdWAhJWdBRsa-H24x3F1jG8qyH8RMj-acnGsI6l1vOYh-VZYPFJWrXr7sEQbfFVYw05uaJdStXxV4BEb.CCo0KuqDCQ4LYFVNM4IjmF-xKpZBYq7ovxYqJFpM6iKliwd7l4fO22Hz7CBHF13qXbHbRevxMgs7oe30SLilUJBMnz25LB5-ADoM6XB5Kq48bUDY8w77RpWemPhZXcDzDCpwo6GcpqPTGnVx504KXg0ALnkQokpIeu0K-4ClA3B0OvzhpKZeduYvWtYVEUtz485VZuPoLzGowU79GGHag96bZcRqt24L.uizN8OQAcW6TMv28EwPpJc7-3vwqQHNLl6XO2j8VZUo-PmSRddDrWcMfDPrlDYBv-wozi6JRyYdYSEqVg-wpK6s3dyOanIAqjWnBW0vjdLwGh7jmN6NqL8xr5iPQMKt4.6d7WbRHPFj305nE7huCm.mtSzQifbJZN68bxzJYmAOdMcmqku287IC2k1ggXSbBBkjofp5Zdws-D1YDsEZCrn8Bx3fkKU8.Wp38uDxCVzjxeChoZCiE47nubErMT4lt-0GIAGzRjL4ziRRGP4ZljFkcUf2V7VEU9u7eVAX4.0j5KJAZuQlThKM.aIcYpdUnX05i-QVXUP4UCcfDyzAmlEYOSjNzA4MoD.Ux2llP3yIhzi1aP-ECEzQEFwGdEmL16JqpGfc.1dwtQ5XmxuvWP2nU.3D2-RApfGobqGzJvZupi5wQ-JE5cxKHYO8aBHDUhQdK.arL44wvbsT41usGi6StMPBhDcRY0KgM3hmseaAmjOnyzyk6rxk36Oge3lTLIq9P-UWQ0CPMDKZYUhcW8HBefkcZjlE7ry.NZ5EG4TmtpbhKUX5RmqmjFzX7owOj0TH4d1tJwdgekLpUAe43nSANNgRkOoXCmpftuzSA-xbRNqYiXRuBpHVuQHnLL18Os770IAUh0NuG7YNn4Q85lZzbFzKo4uxIAUygdYRPOH6NpEWGyd3hEQ='
      }
    });
    const video = response.data.data[0].item.video.playAddr;

    const stream = await axios.get(video, 
                                   {                                    
                                     responseType: "stream",             
                                     headers: {                                  'authority': 'v16-webapp-prime.tiktok.com',
                                    'accept': '*/*',
                                    'accept-language': 'en-US,en;q=0.9',
                                    'cookie': 'tt_chain_token=hQOuCUPAL7s5ANo3N/p7zg==; passport_csrf_token=d662f5a5c53bebd34be85afd3292dff1; passport_csrf_token_default=d662f5a5c53bebd34be85afd3292dff1; d_ticket=abd7a7b047f5c6ced2a0d2033cbf5699bc9f6; _ttp=2xhmzAYkTaOHvj5aAkStBH90NB7; multi_sids=7128444573172384774%3A806932624bc9502b9adb752c5d819a55; cmpl_token=AgQQAPNYF-RO0rLTvDWxMp0_8k2bBkjHf4XTYN4Ojw; uid_tt=3498daaa520044f4694a6fe20a796c79f477fd054273def0d6c2803b6537bb30; uid_tt_ss=3498daaa520044f4694a6fe20a796c79f477fd054273def0d6c2803b6537bb30; sid_tt=806932624bc9502b9adb752c5d819a55; sessionid=806932624bc9502b9adb752c5d819a55; sessionid_ss=806932624bc9502b9adb752c5d819a55; store-idc=alisg; store-country-code=bd; store-country-code-src=uid; tt-target-idc=alisg; tt-target-idc-sign=ugjGdD16CmaG6yAfq3S2VHdBcizphL0I-jJXYn7P-OYJVicZGdZibsPM43QTIb_fEW6_htH0Moo_Be9QpyXHcuz0YnUaJ6LV7SBEQNDAldPIGbCOSorKkmePfa2BLjuOXpTOMiJctPM6ObWuuZuQ4e1oTLiYL36p53B-8uOay6ZG_ITziWkgenYVFlhHCCpG8_VFKa3mns2xafmW9TGn0lyHkNuvNhDZ53PtkNIDY3ovmt4b3pBxXn6dEwF0SJnQ35QT8R6FCzlCTyaKgPKmQlsAQTxMqmtyOMLW4PZS44_n1pJH6umRnucMX7GEhvVnUZyYnVzGBZxwMi77CjDRDJVq_mGipRCw2mXe2_KNCENtszVygo8eV457iSxfhdlfpZn4LnPPMzeQsZuJXBqE2NwXsj5J4vUPU9id1LAtGf92ptnTn7rhCanU7bxT6FuhBPRReMqdOKtPSgxQ_drK-8ox43nuK2o4NfbRwMdVcQ9baRJPSaI6Qp38ekqaoWwi; sid_guard=806932624bc9502b9adb752c5d819a55%7C1752122600%7C15551988%7CTue%2C+06-Jan-2026+04%3A43%3A08+GMT; sid_ucp_v1=1.0.0-KGE1MmVhOThiNmRlZGI0MWQxNzg4NWU2Yzg1YmVhZjU5M2Q4MTJjNmYKGgiGiIHIo9LU9mIQ6Im9wwYYsws4AUDqB0gEEAMaAm15IiA4MDY5MzI2MjRiYzk1MDJiOWFkYjc1MmM1ZDgxOWE1NQ; ssid_ucp_v1=1.0.0-KGE1MmVhOThiNmRlZGI0MWQxNzg4NWU2Yzg1YmVhZjU5M2Q4MTJjNmYKGgiGiIHIo9LU9mIQ6Im9wwYYsws4AUDqB0gEEAMaAm15IiA4MDY5MzI2MjRiYzk1MDJiOWFkYjc1MmM1ZDgxOWE1NQ; tt_csrf_token=CI4qbw8a-dkYI-Fxqyg_Gm7XWbufahxuEyHM; ttwid=1%7CuS68HhFC_BddrWqmZWNujJSrJ0M0BwF5sKiR61adsBw%7C1752124400%7Caacbf0b54b1b25243066d65a3c1805e4477d05dcc2784cb3287c293afd1dccf2; odin_tt=2de7fcc4ad202f029ac6a7001012f6cd1f786bb5b9d9c7f978c7cb78bfe5f58c937b34490bac2f878c626d95989bd497242f44a6e511e57b06a1ba7900f27a0042d5a0cd0e2af9933fad0b549b5ce48c; store-country-sign=MEIEDDMhONriQqVlssypFQQgWGWolvpc7IalWx1wnO3hmvK0P4VzltFWR9AjlkgAfi0EEJrbAWcCWDSukdPSrWOvnsY; s_v_web_id=verify_mcwxmpkg_hDgRTE0V_7VEX_4pzV_BfYD_AqMd4RLCyjwU; msToken=nCaTaVlUkdYHNCRhnHatuRukVYqcw5FQfiKjIURFB8TQeA1hLYCKHBqzeBWRDhgLuTsxrPUpleR4myXrZArg5RmPb9iCuma8JJEb-pSTHHq10VAwvngwLGy_xNdKaGk-7onDUXochJTaVt_Jx5FjqbqnlL4=',
                                    'range': 'bytes=0-',
                                    'referer': 'https://www.tiktok.com/',
                                    'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
                                    'sec-ch-ua-mobile': '?0',
                                    'sec-ch-ua-platform': '"Linux"',
                                    'sec-fetch-dest': 'video',
                                    'sec-fetch-mode': 'no-cors',
                                    'sec-fetch-site': 'same-site',
                                    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
                                  }})

    const purl = await upload(stream.data, "mp4");
    res.status(200).json({ status: "success", response: purl, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", response: err.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});


app.get("/api/tikDl", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ status: "error", response: "url is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
    const stream = await axios.get(dlUrl, {
      responseType: "stream",
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
    });
   const purl = await upload(stream.data, "mp4");
    res.status(200).json({ status: "success", response: purl, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error", response: e.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});



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


app.get("/api/ytDl", async (req, res) => {
  const url = req.query.url;
  const format = req.query.format || "mp4";
  let quality = req.query.quality || "sd";
  if(!url) {
    res.status(400).json({ status: "error", response: "Please provide a youtube video url", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  } else if (!["mp4", "mp3"].includes(format)) {
    res.status(400).json({ status: "error", response: "Format must be between mp3 and mp4", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  } else if (!["sd", "hd"].includes(quality)) {
    res.status(400).json({ status: "error", response: "Quality must be between hd or sd", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
    }
  }
);
    const stream = await axios.get(data.url, { responseType: "stream", headers: {
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
    });
    let ext = "mp4";
    if(format === "mp3") {
      ext = "mp3";
    }
    const purl = await upload(stream.data, ext);
    
    res.status(200).json({ status: "success", title: data.filename, response: purl, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "error", response: e.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  };
  
});


app.get("/api/sms-boomber", async (req, res) => {
  const number = req.query.number;
  const limit = parseInt(req.query.limit) || 500;

  if (!number) {
    return res.status(400).json({
      status: "error",
      response: "📵 number must be provided",
      author: "HA SA N"
    });
  }
  
  const isValid = /^[0-9]{11}$/.test(number);

  if (!isValid) {
    return res.status(400).json({
      status: "error",
      response: "📵 Invalid number! Must be 11 digits and numeric (e.g. 01XXXXXXXXX)",
      author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎"
    });
  }

  try {
    const { data } = await axios.get(`https://alldl.koyeb.app/sms-boomber?number=${encodeURIComponent(number)}&limit=${encodeURIComponent(limit)}`);

    return res.status(200).json({
      status: "success",
      response: data.response,
      author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎"
    });
  } catch (error) {
    console.error("❌ Bomber Error:", error);

    return res.status(500).json({
      status: "error",
      response: error.message || "Internal Server Error",
      author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎"
    });
  }
});

const geminiHistories = {};
app.get('/api/gemini', async (req, res) => {
  const uid = req.query.uid;
  const userText = req.query.text || 'explain this image';
  const imageUrl = req.query.imageUrl;
  const model = req.query.model || "google/gemini-2.5-pro";

  if (!uid) {
    return res.status(400).json({ status: "error", response: 'uid is required', author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }

  if (userText.toLowerCase() === 'clear') {
    geminiHistories[uid] = [];
    return res.status(201).json({ status: "success", response: `Chat history cleared for UID: ${uid}`, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }

  if (!geminiHistories[uid]) {
    geminiHistories[uid] = [];
  }

  const contentArray = [{ type: 'text', text: userText }];
  if (imageUrl) {
    contentArray.push({ type: 'image_url', image_url: { url: imageUrl } });
  }

  geminiHistories[uid].push({ role: 'user', content: contentArray });

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: model,
        messages: geminiHistories[uid],
        max_tokens: 500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer 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`
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    geminiHistories[uid].push({
      role: 'assistant',
      content: [{ type: 'text', text: reply }]
    });

    res.status(200).json({ status: "success", response: reply, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ status: "error", response: 'Something went wrong bro!\nDetails: ' + error.message, author:"♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});


const ai = new GoogleGenAI({ apiKey: "AIzaSyC5DfedomQYoPqlJ4hL-HxTePJ_YCzwuPA" });
app.get("/api/edit", async (req, res) => {
  const url = req.query.url;
  const prompt = req.query.prompt

  if (!url || !prompt) {
    return res.status(400).json({ status: "error", response: "url and prompt are required.", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }

  try {
    const { base64Image, mimeType } = await downloadImageAsBase64(url);

    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
    ];

    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: contents,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const resultParts = response.candidates[0].content.parts;
    let responseText = "";
    let imageData = null;
    
    for (const part of resultParts) {
      if (part.text) {
        responseText = part.text;
      } else if (part.inlineData && part.inlineData.data) {
        imageData = part.inlineData.data;
      }
    }

    if (imageData) {
      const buffer = Buffer.from(imageData, "base64");
      const filename = fileName(".jpg");
      const filePath = path.join(uploadFolder, filename);
      fs.writeFileSync(filePath, buffer);

      return res.status(200).json({
        status: "success",
        response: responseText,
        url: `https://www.noobx-api.rf.gd/hasan/${filename}`,
        author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎"
      });
    } else {
      return res.status(200).json({
        status: "unsuccessful",
        response: responseText || "No image generated.",
        author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎"
      });
    }

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});


app.get('/api/fluxpro', async (req, res) => {
  const prompt = req.query.prompt;
  const num_img = req.query.num_img || 2;

   if(!prompt) return res.status(400).status(400).json({ status: "error", response: "prompt is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  
  try {
    const promises = [];

    for (let i = 0; i < num_img; i++) {
      
     const imgur = await fluxproGen(prompt);
       promises.push(imgur);
    }

    const urls = await Promise.all(promises);

    res.status(200).json({
      status: "success",
      response: urls,
      author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎"
    });

  } catch (err) {
     console.error(err)
    res.status(500).json({
      status: "error",
      response: err.message,
      author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎"
    });
  }
});


app.get("/api/upscale_2", async (req, res) => {
  const url = req.query.url;
  
  if (!url) {
    return res.status(400).json({ status: "error", response: "url is missing!", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }

  try {
    const { data } = await axios.post(
  'https://queue.fal.run/fal-ai/esrgan',
  {
    'image_url': url
  },
  {
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
  }
);
    console.log(data);
    const status = data.status_url;
    const response = data.response_url;
    const image = await getOnceArtUpscale(status, response);

    res.status(200).json({ status: "success", response: image, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "error", response: e.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});



app.get("/api/swap", async (req, res) => {
  const swapFrom = req.query.swapFrom;
  const swapTo = req.query.swapTo;
  const type = req.query.type;
  
  if(!swapFrom || !swapTo || !type) return res.status(400).json({ status: "error", response: "swapFrom, swapTo and type are required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

  const sFrom = await seaArtUploader(swapFrom);
  const sTo = await seaArtUploader(swapTo);
  
  const applyMap = {
    face: "ct2qk8htbv3c73ck5g4g",
    cloth: "cusbdb5e878c73f5ob90",
    mix: "ct40sn5e878c738367f0"
  };
  const applyID = applyMap[type];

  const inputMap = {
    face: [
      {
        'field': 'image',
        'node_id': '10',
        'node_type': 'LoadImage',
        'val': sFrom
      },
      {
        'field': 'image',
        'node_id': '16',
        'node_type': 'LoadImage',
        'val': sTo
      }
    ],
    cloth: [
      {
        'field': 'image',
        'node_id': '60',
        'node_type': 'LoadImage',
        'val': sFrom
      },
      {
        'field': 'image',
        'node_id': '61',
        'node_type': 'LoadImage',
        'val': sTo
      }
    ],
    mix: [
        {
            'field': 'image',
            'node_id': '40',
            'node_type': 'LoadImage',
            'val': sFrom
        },
        {
            'field': 'image',
            'node_id': '47',
            'node_type': 'LoadImage',
            'val': sTo
        },
    ]
  };
  const input = inputMap[type];

  try {
    return await fallBack(async (token) => {
    const response = await axios.post(
  'https://www.seaart.ai/api/v1/creativity/generate/apply',
  {
    'apply_id': applyID,
    'inputs': input,
    'g_recaptcha_token': '03AFcWeA6O5AnymDxdmN-RrKVGLAiOCbUEwjX_IqB7auHKIqbVp8a6AxhJ-Bj6E3n6U_xgfTrr2KmhD7a3YKGAp8E6oXfTzQJWzPrGl_kcqEW6dbcoWqHxj-D8JvyHQKmLvhuoIZ7V3Xh0wm9smknsEoV009FaMwxf0vE0CyHV1AwKvcBEAahSILx8UCsokTf1o9Gwe27M9VQGl3lTQf_uAoHjh27OsF6LNhMnEcHXC_oIuid-RKHVxOh7djeVocMwqQdge0g7gKq_d_AdSdvPaYP0K8b3KydDii8hsiRe0vD8EkWdI7wPudqNMH4H9NqdT-mj91eJd5_xeQepw61yPHYvfiYX2x4XmXoq7sE7d33ySC9qHOO9d0gtBE8L6gyVpiS2r2nmeqxLPsMmRHctQngGPQ4FUkWDjAhItsXxhMdKXM-un04TKBRl7SwGV9kmiGqffo6KZRFMR6gqhc21c2DIG30emIT2G49ysas8yQctDJT3SmDz0y4MTDKBZfN8RjYRX96f9kcVGMj5Ew-YZ0RzfR81sOnCuLwQ6DANP1Yo-Rv6X19JvFJICUFHZAQKMS5FE8JvetEb1JSdNzgaADn_gJmwpwD8rqCGo-x39Cb9o31vU8Pg577iXk-nWTtz8ixQwdBLrKShvEMxpkIvtJv97Nof-cUpXPwXTnojAQ2BlTpJtHacvV8GOiU8JkVJS07ojjvTnvrp0wH0ms5lx5GaxATODyx91nIoXoEUOofW5VPeqW3Ran1Yur1TMYXfuMH6-Sp18NOnzmTrgWyGli1TtC11TTmcelXzXKaac31EDZw7H3KgKJ-Iinll-LmLCa8DWYIYkKkmJvGNZSL4OrgwxTeWC4vyR9awJ_qNPfulDCPgNhxHRmSafvfM3qrkeDahEdiiTsm7Q9qd1GV_csmol58V1YgYWY4f72dHvYEB0ZFzuSU8vk67dr1ZzsDf-otRpaPUOoU5B2XOhvfHrke2cvyw9LEgoBNaWnhtecuSnWllzdnBdwXeAapUaidjI9V9RPLuGf1yWQccNgLreZ4aui9TjthYu_rnn8GvubQnwJORFa5Ll3IikFqHFVjGga0dRWEpSAB70ap8oFkWbSsvT8UsWOIWJvHg_ebNse4Z_I6BsWVuiuhYhdyGCRy_i_ytn-Ot5g9Kj6XGy8gBGyaHJNBCeFP3QYCyly5TkSBhsJyHQKgFaf8JtPp2SkqcUYpUKTRLO5AhFqZwMf1zpbt5NTq_87amVjpfVQAXiUoNUSK6kahjJntHX81uCBMvgHdD0fUTgipAuVE-nhYJ51_bOjjRdvsr0zKUQjCasOUEF_UTAt2naBBWXjmIq2M2mLcPVC8u6n6mfWa2yA3oS4IegH4f1zUyJ2lZxSKMsg57_uJhrSAIcZsxDndTraVEg-2H_JD8yF1DzxQrtxhPqfka-NmhbQu42h3FpnJQ9Rr-olAVYGSs6CyYjKII3aCZ0n4TPpimktET7xZMGvdKQtim-vCM86jZggHlKKwXGgo1tm-BlfDvyIiuqtnljpwbz-sE825OTJJzLYOTaVX9vT5JhhrhItgkpVrbZukmEnZ6N7qvPvoscptBS6izrPaGJH8dDAmPg9pGnDnZE4PxpdYHvZXTQohYBXbHRyRAXBgL6k05TKj-8bWPiJGLLTu3yO4jAXpRF6dO2S3rRv_0WbHipfaCGuxrjeDZxGUbqb2_odtilTlBQzzEr_iZ3r--dxq-DDUmZdErRFLhT9jGodLANFtG55THk_sf4M0MIKoxjEGfjrKFS08ropA7F9ZLzMnDjVlIZMxnDouk1i8ou_o8OiIxkU5XL_YFwnLQF_4Lv4NWYysU9QFzFzkGKkaUZWT_1xXvYBC4cRXkpQLV-S_t8GxB28LV8epYeomkQ-bWF1T6OVc2FI3ECnJCOykOwz5GPjFSS56KGKzjox2_hr72C2dothALXOhP-R_MsHKVlMkcSsPD8Z-5wDzfBkYR3_xby6t09-WQsdJwdQeflIeFm8znNzyheOy3_tbRqnEhqHmIwbcM4XkTqP5mBR6yTt1K2K-eSirprOLK5p4iyTeyb8q-IobEtQ',
    'task_flow_version': 'v2'
    },
    {
     headers: {
       'authority': 'www.seaart.ai',
       'accept-language': 'en',
       'cookie': `_fbp=fb.1.1748332541103.161936213781524982; T=${token}; lang=en; X-Eyes=false; deviceId=71682b86-5e26-441c-a07a-007e87d34350; _ga=GA1.1.471471526.1748334600; _pin_unauth=dWlkPU1EaGlNemd6WmpBdE9EZGtPQzAwTnprekxXSTBObVF0WmpNNFpXVTFPV0ZrWWpObA; _gcl_au=1.1.749810034.1748334604; browserId=d51971dc459c87ce528af797217bc824; _uetsid=fc212df03acf11f086209d83494028c7; _uetvid=fc22cb803acf11f0a833b3237d732b73; enable_tavern=true; locaExpire=1748340501865; isDeadline=false; pageId=9c8551d7-a058-459d-b425-d4a7aadba1e7; _ga_YDMZ43CD3E=GS2.1.s1748340207$o2$g1$t1748340244$j23$l0$h0$dVcQudWXgBhXXodU4tFXop-E2pRKpTUqptQ; _ga_4X5PK5P053=GS2.1.s1748332478$o6$g1$t1748340244$j15$l0$h0$d9DoInIewfx-ECmyfcuZmPaJ4HtBAS_k46Q`,
       'origin': 'https://www.seaart.ai',
       'referer': 'https://www.seaart.ai/ai-tools/image-upscaler',
       'X-Timezone': 'Asia/Dhaka',
       'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
       'Token': token
      }
   }
);
      console.log(response.data.status);
    const status = response.data.status;
      if(status.code !== 10000) throw new Error(`retrying... ${status.msg}`);
    
    const id = response.data?.data?.id;
    const key = token;
    const [imageUrls] = await getDataFromSeaArt(id, key);
    res.status(200).json({ status: "success", response: imageUrls, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }, tokens);
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "error", response: e.message, details: e, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
     }

});



app.get("/api/remove-background", async (req, res) => {
  const url = req.query.url;
  
  if(!url) return res.status(400).json({ status: "error", response: "url is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

  const seaArtUrl = await seaArtUploader(url);
  try {
    return await fallBack(async (token) => {
    const response = await axios.post(
    'https://www.seaart.ai/api/v1/task/create',
    {
      'action': 19,
      'source': 8,
      'meta': {
        'remove_background': {
          'uri': seaArtUrl
        }
      }
    },
    {
     headers: {
       'authority': 'www.seaart.ai',
       'accept-language': 'en',
       'cookie': `_fbp=fb.1.1748332541103.161936213781524982; T=${token}; lang=en; X-Eyes=false; deviceId=71682b86-5e26-441c-a07a-007e87d34350; _ga=GA1.1.471471526.1748334600; _pin_unauth=dWlkPU1EaGlNemd6WmpBdE9EZGtPQzAwTnprekxXSTBObVF0WmpNNFpXVTFPV0ZrWWpObA; _gcl_au=1.1.749810034.1748334604; browserId=d51971dc459c87ce528af797217bc824; _uetsid=fc212df03acf11f086209d83494028c7; _uetvid=fc22cb803acf11f0a833b3237d732b73; enable_tavern=true; locaExpire=1748340501865; isDeadline=false; pageId=9c8551d7-a058-459d-b425-d4a7aadba1e7; _ga_YDMZ43CD3E=GS2.1.s1748340207$o2$g1$t1748340244$j23$l0$h0$dVcQudWXgBhXXodU4tFXop-E2pRKpTUqptQ; _ga_4X5PK5P053=GS2.1.s1748332478$o6$g1$t1748340244$j15$l0$h0$d9DoInIewfx-ECmyfcuZmPaJ4HtBAS_k46Q`,
       'origin': 'https://www.seaart.ai',
       'referer': 'https://www.seaart.ai/ai-tools/image-upscaler',
       'X-Timezone': 'Asia/Dhaka',
       'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
       'Token': token
      }
   }
);
      console.log(response.data.status);
    const status = response.data.status;
      if(status.code !== 10000) throw new Error(`retrying... ${status.msg}`);
    
    const id = response.data?.data?.id;
    const key = token;
    const [imageUrls] = await getDataFromSeaArt(id, key);
    res.status(200).json({ status: "success", response: imageUrls, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }, tokens);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message, details: e, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
     }

});



app.get("/api/tools", async (req, res) => {
  const url = req.query.url;
  const prompt = req.query.prompt;
  const type = req.query.type;
  if(!url || !type) return res.status(400).json({ status: "error", response: "url and type are required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  
  if (!["upscale", "undress", "removebg", "changebg", "blurbg", "edit", "draw", "art", "upscale_2", "logo", "undresspro", "gta", "expend", "naked"].includes(type)) {
    return res.status(400).json({ status: "error", response: "Invalid type !?\nAvailable: upscale, upscale_2, undress, removebg, changebg, blurbg, edit, draw, art, gta, logo, undresspro, expend, naked .etc", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" })
  };

  if (["changebg", "edit"].includes(type) && !prompt) {
    return res.status(400).json({ status: "error", response: "prompt are required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }

  const applyMap = {
    upscale: "d0gugqle878c73fhtctg",
    upscale_2: "d0gmq65e878c73dgca70",
    undress: "d0mo88le878c73es98s0",
    removebg: "cv7m4gte878c73edlg40",
    changebg: "cqacvqde878c73dj234g",
    blurbg: "cvd8ucte878c73dd45qg",
    edit: "d070sqhl2o2c73aou74g",
    draw: "cqtg92de878c7392oav0",
    art: "csc9l35e878c73cn55f0",
    logo: "d13nj3te878c7382r6mg",
    undresspro: "ctha0dde878c73dbt58g",
    gta: "d0dku45e878c73dnpgo0",
    expend: "cos9stle878c738ijfcg",
    naked: "cu0hf6de878c73c1qrag"
  };
    const typeID = applyMap[type];
     
    const seaArtUrl = await seaArtUploader(url);

  const inputMap = {
    expend: [
        {
            'field': 'image',
            'node_id': '5',
            'node_type': 'LoadImage',
            'val': seaArtUrl
        },
        {
            'field': 'left',
            'node_id': '50',
            'node_type': 'ImagePadForOutpaint',
            'val': 400,
        },
        {
            'field': 'right',
            'node_id': '50',
            'node_type': 'ImagePadForOutpaint',
            'val': 400,
        },
        {
            'field': 'top',
            'node_id': '50',
            'node_type': 'ImagePadForOutpaint',
            'val': 400,
        },
        {
            'field': 'bottom',
            'node_id': '50',
            'node_type': 'ImagePadForOutpaint',
            'val': 400,
        },
    ],
    upscale: [
      {
        'field': 'image',
        'node_id': '11',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      },
      {
        'field': 'Number',
        'node_id': '54',
        'node_type': 'Int',
        'val': '1536'
      }
    ],
    upscale_2: [
      {
        'field': 'image',
        'node_id': '10',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      },
      {
        'field': 'Number',
        'node_id': '80',
        'node_type': 'Float',
        'val': '0.25'
      }
    ],
    undress: [
      {
        'field': 'image',
        'node_id': '1',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      }
    ],
    removebg: [
      {
        'field': 'image',
        'node_id': '2',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      }
    ],
    changebg: [
      {
        'field': 'image',
        'node_id': '11',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      },
      {
        'field': 'text',
        'node_id': '73',
        'node_type': 'CR Text',
        'val': prompt
      },
      {
        'field': 'batch_size',
        'node_id': '42',
        'node_type': 'EmptyLatentImage',
        'val': 1
      }
    ],
    blurbg: [
      {
        'field': 'image',
        'node_id': '1',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      },
      {
        'field': 'angle',
        'node_id': '32',
        'node_type': 'LayerFilter: MotionBlur',
        'val': -15
      },
      {
        'field': 'blur',
        'node_id': '32',
        'node_type': 'LayerFilter: MotionBlur',
        'val': 25
      }
    ],
    edit: [
      {
        'field': 'image',
        'node_id': '2',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      },
      {
        'field': 'prompt',
        'node_id': '1',
        'node_type': 'OpenSeaArtImageEdit',
        'val': prompt
      }
    ],
    draw: [
      {
        'field': 'image',
        'node_id': '33',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      }
    ],
    art: [
      {
        'field': 'image',
        'node_id': '3',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      }
    ],
    logo: [
        {
            'field': 'image',
            'node_id': '24',
            'node_type': 'LoadImage',
            'val': seaArtUrl
        },
    ],
    undresspro: [
        {
            'field': 'image',
            'node_id': '1',
            'node_type': 'LoadImage',
            'val': seaArtUrl
        },
    ],
    gta: [
        {
            'field': 'image',
            'node_id': '21',
            'node_type': 'LoadImage',
            'val': seaArtUrl
        },
    ],
    naked: [
        {
            'field': 'image',
            'node_id': '309',
            'node_type': 'OpenSeaArtLoadImageWithWH',
            'val': seaArtUrl
        },
        {
            'field': 'expand',
            'node_id': '170',
            'node_type': 'GrowMask',
            'val': 30,
        },
    ]
  };

  const input = inputMap[type];

  
  try {
    return await fallBack(async (token) => {
    const response = await axios.post(
  'https://www.seaart.ai/api/v1/creativity/generate/apply',
  {
    'apply_id': typeID,
    'inputs': input,
    'g_recaptcha_token': '03AFcWeA56LJmvQDnY-4OLt3dXamg5-GpaTebSiMTN_5DgywWhBUUn5mkNO5R1hvm3FLAu4KAMtWi1frSAoGA80VIzIhrD11SBbU1v-4nCuCaVa8VP0Za-WwjP6KuZnXInaMsTrR5ezpV-cOkwdVY9DWrmsEFLoa5Txd53jIgDL-axvIl1_1RRJP-T738uqsol8Mnaj-CcMQ26NmT-1zTz2ZVYuDmSmK8EKUePMyY1-Dk_N9pUtjY0p0j0ZqCzLcQqtQdNEqfciYnTugNOU6mcDfHhMkFqH4N9xLJx3EGg7hAdCltSP6QFDSR154S1AsR6WSMORV-EDy0DdZesxBdSFX4BGp_xXpewpZs6xJQKwpwdzPil1mhusMmlU0DF4uLLOHbv1Z21fsM92G4jy2DsLl0CRqiG-5ZBzaBcHs38I9pfn2thV1fEFlqIAAd6mMYHEGHTQCVdwX4PFcMJa3E2P_iapZgALrbQNMgRCfw1EC8k9btanJKR4NtusPSptJX8326Wznm-bDGqqq7YHHQBJRGV6Krl-j4m3GprQn6p495HOBH1B4mgZmyaH0LbWksVn4y0EaoqIssuafytAypSZhRX_-Er1lnpnhc6OG7dglBtKM6RPRXR_lZo542OrGjKrNKH6TM4AjkS-_pRFlrSrbva3EmxXqsS_HXpMIWJwnBuDdPzHQg6Pc_TP4Gd4bKxDtXGqwjK_QS9mmmzs4v7UCXb-M1z8JGjjG82iiNCdnZzGySR7TCXn-PpDGToTwle2FfLBwTS2B_ds6CVBILcZ9VAiTOEwzb77RHSt8WeM-yMWOZXpgITLxJxZs662dhdyfKBq68_Tf2Ur6atJit93R3teTlsDBoxTSbgnBVWUGC9vzJQkpiFGV2mGlF23_rYrXBwqPZed5FUcVK_Yk1MQKJPMRokZLkgmqCgj-Wa-Di9lc5t92VETpIh32US8apdFsQ3muFmLYFKcBehfOmOoMaQYoNGkHDEr3iudUa3gttEZ0-AGqW2v6Glr2r5qzruFVp0Y2baXUwhEWMRzQzz4IFarO6R5K7H5Eu7JuyGQP3hkLxKabF8VRmZi8QC-whpvHyD83ZPNyWd-yz9hPEgJ2cps9WjOVYnsypsHhU2yat3d_l70MnkOB-OkxQ0aT8htjDEibjwWH3p7YRLWyXdtllcp4WVeOt4scvupJWAMEs0A43CRotfv_crnKbZtEmuKCB02C0cWUpiPP5RDhGOXaHUB2d_FuH2FuoHZT9ffbuehpybFCDRiC7NcEZoqtgzGgKwXMWEA-0ePN4nDsi_wxY5vNBdNeqmEkjIC89dzP6IvLFuHhpJCcO3lUjJH_rFrX1l8ExIX4Tugpahbtr7BYqmrOlqtKtLdZYxcrfgt1KEQWN7q9w5yLpZQNcGnAL1B5AkRZxzD7Sa59g8pFJ8xNuKaCODSye6YHCT6jI8pOUvGNH_ngW6N_jBbFdNOdUtofeQXiRLvbisXwpe7x48gAXuSvaah7SPlhmIvFIae-3iZm7rPRapQowxbgTFgbeQGqzcbxQPXR1VXG5h_FhJg0KYUe3lYI2EcKqEu-5Kkb2eTnLQB3gDDBoIKMfvEuEfOtINBJYBotb53ndS_23Z9bHnzfZ3M6br7NEizzUlLRisVRmm0Jm-E9GOS7jmcohv9LigcsaM7Xi0ZUz3eqxy6RZWT3QW3VUf-JfiheubEuKvFn8iibr6GZO8TMLq4csIv-_j6S-F0RKcWWjrOPSg06BQttNfg1tu9XaS62zRiMvld0AvChBa6k94Qq8-rVEleTEMjbtMGungzH4-kteZ9uB5UmmduWC3WUHHdXy9NO4qiX9xWfSp4itganYtBEG2Xy3ODZlRopQGqX65Gwlw-wJdZ7ydAq2nsLwWfQsuD3GoOl7Nh1hcfFvHaZ121f6BNtE5afZATQ5pALe5raLSIpmLPc3ztJpSEt-xgwyIo2xJC_r0TKxorEHF5Mh8NNiR1x3_MRqllUKGK0crQGMtX2J-z4BJDkCTWFdLu-unXoH-JGhyb4LONoJiBQLJLbuGLP-rDJzihhF0',
    'task_flow_version': 'v2'
  },
  {
    headers: {
      'authority': 'www.seaart.ai',
      'accept-language': 'en',
      'cookie': `_fbp=fb.1.1748318094574.679225651710543005; T=${token}; lang=en; X-Eyes=true; deviceId=5edc8c93-cac4-406e-9568-10b7328d8d16; pageId=1465561b-c5ed-438c-b263-7146f19b40d8; browserId=d51971dc459c87ce528af797217bc824; _ga=GA1.1.796007903.1748320931; enable_tavern=true; _uetsid=f6061b903ab411f0a52e35fb33000708; _uetvid=f6075ba03ab411f08299a32e5fd816da; _gcl_au=1.1.1030346700.1748320935; _ga_YDMZ43CD3E=GS2.1.s1748320930$o1$g1$t1748320939$j51$l0$h0$dSfwV-8AqpNdbJJ5G6PXPwislQqoFHO6Y3Q; _ga_4X5PK5P053=GS2.1.s1748313152$o3$g1$t1748320939$j56$l0$h0$d9DoInIewfx-ECmyfcuZmPaJ4HtBAS_k46Q`,
      'origin': 'https://www.seaart.ai',
      'referer': 'https://www.seaart.ai/create/ai-app?id=d0fge2le878c73en9f9g',
      'token': token,
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
  }
);
      console.log(response.data.status);
    const status = response.data.status;
      if(status.code !== 10000) throw new Error(`retrying... ${status.msg}`);
    
    const id = response.data?.data?.id;
    const key = token;
    const [imageUrls] = await getDataFromSeaArt(id, key);
    res.status(200).json({ status: "success", response: imageUrls, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }, tokens);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message, details: e, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
     }

});
                          


app.get("/api/upscale", async (req, res) => {
  const url = req.query.url;
  const type = req.query.type || 2;
  const prompt = req.query.prompt || "";
  const key = req.query.key;
  
  if(key !== "toxiciter") return res.status(403).json({ status: "unavailable", details: "It's not for you only owner can use it", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  if(!url) return res.status(400).json({ status: "error", response: "url is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

  const seaArtUrl = await seaArtUploader(url);
  try {
    return await fallBack(async (token) => {
    const response = await axios.post(
  'https://www.seaart.ai/api/v1/task/tool/ultra-hd/create',
  {
    'image_url': seaArtUrl,
    'hd_scale': type,
    'prompt': prompt,
    'creativity': 0.5,
    'fractality': 0.5,
    'hdr': 0.5,
    'resemblance': 0.5,
    'engine': 0,
    'style': 0
  },
  {
    headers: {
      'authority': 'www.seaart.ai',
      'accept-language': 'en',
      'cookie': `_fbp=fb.1.1748332541103.161936213781524982; T=${token}; lang=en; X-Eyes=false; deviceId=71682b86-5e26-441c-a07a-007e87d34350; _ga=GA1.1.471471526.1748334600; _pin_unauth=dWlkPU1EaGlNemd6WmpBdE9EZGtPQzAwTnprekxXSTBObVF0WmpNNFpXVTFPV0ZrWWpObA; _gcl_au=1.1.749810034.1748334604; browserId=d51971dc459c87ce528af797217bc824; _uetsid=fc212df03acf11f086209d83494028c7; _uetvid=fc22cb803acf11f0a833b3237d732b73; enable_tavern=true; locaExpire=1748340501865; isDeadline=false; pageId=9c8551d7-a058-459d-b425-d4a7aadba1e7; _ga_YDMZ43CD3E=GS2.1.s1748340207$o2$g1$t1748340244$j23$l0$h0$dVcQudWXgBhXXodU4tFXop-E2pRKpTUqptQ; _ga_4X5PK5P053=GS2.1.s1748332478$o6$g1$t1748340244$j15$l0$h0$d9DoInIewfx-ECmyfcuZmPaJ4HtBAS_k46Q`,
      'origin': 'https://www.seaart.ai',
      'referer': 'https://www.seaart.ai/ai-tools/image-upscaler',
      'X-Timezone': 'Asia/Dhaka',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
      'Token': token
      }
  }
);
      console.log(response.data.status);
    const status = response.data.status;
      if(status.code !== 10000) throw new Error(`retrying... ${status.msg}`);
    
    const id = response.data?.data?.id;
    const key = token;
    const [imageUrls] = await getDataFromSeaArt(id, key);
    res.status(200).json({ status: "success", response: imageUrls, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }, tokens);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message, details: e, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
     }

});
    


app.get("/api/text-to-song", async (req, res) => {
  const lyrics = req.query.lyrics;
  
  if (!lyrics) return res.status(400).json({ status: "error", response: "lyrics parameters is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  
  try {
return await fallBack(async (token) => {
const response = await axios.post(
  'https://www.seaart.ai/api/v1/creativity/generate/apply',
  {
    'apply_id': 'd0fge2le878c73en9f9g',
    'inputs': [
      {
        'field': 'tags',
        'node_id': '14',
        'node_type': 'TextEncodeAceStepAudio',
        'val': 'female vocals, crystal clear tone, dreamy quality, electro-pop, upbeat rhythm, modern electronic effects, commercial quality'
      },
      {
        'field': 'lyrics',
        'node_id': '14',
        'node_type': 'TextEncodeAceStepAudio',
        'val': lyrics
      },
      {
        'field': 'seconds',
        'node_id': '17',
        'node_type': 'EmptyAceStepLatentAudio',
        'val': 40
      }
    ],
    'g_recaptcha_token': '03AFcWeA6H9KmejeaFSU_p4AO6RP9oS8J-X5TwSeQAW_D13LNlf3J5gvxt6oydvIOvvMXk8BMasrttHHWbshuew0tc8Y_eZF9wUDJCAZIlgtwWxo0tBYYQPjU5vYsnp5Qs4LQDeIJyqpYFzF_fst3UN0mDbIk0x7AhG-I7tp7sS4dqv_zpsiGFzlZpf99AJ_K5k5tUgfx6b0bWXuhRE4dbcEsaS--tn2cUY9iVypq0n5MzD0H2MVME7jeNataJGxSFcIqS6fjMMLaHqwnBABCY3CKMg2KOC8x9nRMyXihJfNO2BSuv5vkGYboDkMK-HlWQSMbhRJKSgAGE1DvoXRL7eRsjI0qCuOuUKaTjHilNzo4fmLzZpmqrUyTfD6Q1M-Eui6-FDFmVeUeJCKFRKbG_L2EltJp6klY2LsZqUmtP0usqx43s46pZH7wefiwDGvmva8g2zmijSR51_XuX8NdBg0RVaZKLMer03V2Qa35esM2T8O16qLY91dyNU7dptTcCylT35BRq2WTpIpFzF7B1o_450d7TcubsqNeezLnW5PzZbtL0awCzWkQMLCesms0L74O7SNagfWmdu3TkC-WrxrBF37JlxcwqrjieClVUUg1k1ORlNHL7Vv68I5689wZ5j9ikMzAeAihwp2G0HtDicQH4YHe_Zo5MC_se61cF0fpafT8fBIEzt3NbJYMyRTpcH3h8S7xC2JziMpa8YwUO0w8rydGXcNg_-DC3jkBuK9I_LT3b0ibS-kzUCHzDtL87VDZ16vZtSOc0aP69YB9issu28U-OoLuBi_6Xl3NAFpxk6_r-PgeuMmzUK0ooA3tCVI3UaKnT9uqRJqxQn3BNYZyIuojm-rys3OfVu4z7nVXc4HDw18gxwd3XRjBFqj1Mm4TuhvYZiSyiXuvCs1Doi_wN248R07fB48mFKv5YD7PTnHvq2igB2nZZv_zUA6vuCDbxnrX4__whdbdqh92nwlHel-kQjKR9wFurzve7EnWt_WYrHlvp_EdAdIbcX6Q47i-TULLhu9rYJR_hV706J_jdEXjg3E6ZaP5Z1chB49xG-fa5U7AzCBnJCQr07b6nxwV2ONKUQVnApvEHXmSlTBcFldYvuT31AkvkgiP6Xc4C0ZRD_jCPBBOtIs-MtJWCgFFDDK0fyhQtW40WQGh6GRT2oeCfHvTXibv19CsJEwCII0gjkfV7Oue_Z9IzgqPsUM2XC-cEXBEX6FqKlnmVfJlo_qegwh5Ihj_MKgvgXhJgMUyWCHps4Y0utLwhzlPmfVpE-Vw8UB6rCZiSNxXkD0nPN7vqNn4-Knk0SJDfS60_7eaQ7lYtAGUbP8kb6saT1UiIOzr7aU51K3Mkk3jKIDl73rsIQQRUceKAasRROOtfU-1MwTYb9xajpZrH5zPXDpbvQySSMWlwV--aCm7E7vYo1Nu8CenYcdxdZm-XuEz1tOv1v2afW7ZAuWEEw7ho24p5wF_bLaxK_8WRklgtNtjR4wIGCxqMxVOJPlUslm57JkGvG-WIDjwPLWL799cjzZlgi1w2xWufmJ0BbWAiBgZcbfQ1U-PQlTI29eGD3KTs7Ju39M5l-PfoZ3sSSC8hh1iwIFdJcBZpAqfPgaw4sVRO7w-_k7H2D80yYLy3SLOZrASh-pWP039wRk6Nel3-HxVnUIT8SzeI4mqD1vF0paC3cWo6ybrn15q3S1pwIsn8GuQ_G7plXDgpvKW8qeUvVwwqoRqdYkz6mP3Xzuc8CnI8eHA2Jc1yn2DvIWWiOhwy-Rtadib4kZS6JteDi8-zc2PGYBeR20vEo5TgbmqvdF-ZkZK-1T4xmL8q3Uc_URN_HNfNvbuzP2v0YtBo_FCl4ObFTTiv7vdGl7GvvDbBQcSSiP17Bk7Wzdyxlw4BLc5-u27Yz7udiWG8ty6HrxqMQBdbZaQ-n3fTBMPBoNAIV9vjLyXwOFE40G-IkpXy4x7WspXJrAop8F1uZes2q3i3ugxbcwRZJxz0POV7A0ZaHzjxrdcg9WF2W55ybUrmZ5OnLkEzAuqiHM0_3eNUJHEf3_bvNC4NCAad',
    'task_flow_version': 'v2'
  },
  {
    headers: {
      'authority': 'www.seaart.ai',
      'accept-language': 'en',
      'cookie': `_fbp=fb.1.1748318094574.679225651710543005; T=${token}; lang=en; X-Eyes=true; deviceId=5edc8c93-cac4-406e-9568-10b7328d8d16; pageId=1465561b-c5ed-438c-b263-7146f19b40d8; browserId=d51971dc459c87ce528af797217bc824; _ga=GA1.1.796007903.1748320931; enable_tavern=true; _uetsid=f6061b903ab411f0a52e35fb33000708; _uetvid=f6075ba03ab411f08299a32e5fd816da; _gcl_au=1.1.1030346700.1748320935; _ga_YDMZ43CD3E=GS2.1.s1748320930$o1$g1$t1748320939$j51$l0$h0$dSfwV-8AqpNdbJJ5G6PXPwislQqoFHO6Y3Q; _ga_4X5PK5P053=GS2.1.s1748313152$o3$g1$t1748320939$j56$l0$h0$d9DoInIewfx-ECmyfcuZmPaJ4HtBAS_k46Q`,
      'origin': 'https://www.seaart.ai',
      'referer': 'https://www.seaart.ai/create/ai-app?id=d0fge2le878c73en9f9g',
      'token': token,
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
    }
  }
);
      console.log(response.data.status);
    const status = response.data.status;
      if(status.code !== 10000) throw new Error(`retrying... ${status.msg}`);
    
    const id = response.data?.data?.id;
    const key = token;
    const [imageUrls] = await getDataFromSeaArt(id, key);
    res.status(200).json({ status: "success", response: imageUrls, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }, tokens);
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "error", response: e.message, details: e, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});


app.get("/api/editpro", async (req, res) => {
  const url = req.query.url;
  const prompt = req.query.prompt;
  const key = req.query.key;

  if(key !== "toxiciter") return res.status(403).json({ status: "unavailable", response: "It's not for you!. Only owner can use it!. if you want to use this feature? contract with the owner", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  if(!url || !prompt) return res.status(400).json({ status: "error", response: "url and prompt are required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

  const seaArtUrl = await seaArtUploader(url);
  try {
    return await fallBack(async (token) => {
    const response = await axios.post(
  'https://www.seaart.ai/api/v1/creativity/generate/apply',
  {
    'apply_id': 'd017fv5e878c738ltm1g',
    'inputs': [
      {
        'field': 'image',
        'node_id': '2',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      },
      {
        'field': 'prompt',
        'node_id': '1',
        'node_type': 'OpenSeaArtImageEdit',
        'val': prompt
      }
    ],
    'g_recaptcha_token': '03AFcWeA56LJmvQDnY-4OLt3dXamg5-GpaTebSiMTN_5DgywWhBUUn5mkNO5R1hvm3FLAu4KAMtWi1frSAoGA80VIzIhrD11SBbU1v-4nCuCaVa8VP0Za-WwjP6KuZnXInaMsTrR5ezpV-cOkwdVY9DWrmsEFLoa5Txd53jIgDL-axvIl1_1RRJP-T738uqsol8Mnaj-CcMQ26NmT-1zTz2ZVYuDmSmK8EKUePMyY1-Dk_N9pUtjY0p0j0ZqCzLcQqtQdNEqfciYnTugNOU6mcDfHhMkFqH4N9xLJx3EGg7hAdCltSP6QFDSR154S1AsR6WSMORV-EDy0DdZesxBdSFX4BGp_xXpewpZs6xJQKwpwdzPil1mhusMmlU0DF4uLLOHbv1Z21fsM92G4jy2DsLl0CRqiG-5ZBzaBcHs38I9pfn2thV1fEFlqIAAd6mMYHEGHTQCVdwX4PFcMJa3E2P_iapZgALrbQNMgRCfw1EC8k9btanJKR4NtusPSptJX8326Wznm-bDGqqq7YHHQBJRGV6Krl-j4m3GprQn6p495HOBH1B4mgZmyaH0LbWksVn4y0EaoqIssuafytAypSZhRX_-Er1lnpnhc6OG7dglBtKM6RPRXR_lZo542OrGjKrNKH6TM4AjkS-_pRFlrSrbva3EmxXqsS_HXpMIWJwnBuDdPzHQg6Pc_TP4Gd4bKxDtXGqwjK_QS9mmmzs4v7UCXb-M1z8JGjjG82iiNCdnZzGySR7TCXn-PpDGToTwle2FfLBwTS2B_ds6CVBILcZ9VAiTOEwzb77RHSt8WeM-yMWOZXpgITLxJxZs662dhdyfKBq68_Tf2Ur6atJit93R3teTlsDBoxTSbgnBVWUGC9vzJQkpiFGV2mGlF23_rYrXBwqPZed5FUcVK_Yk1MQKJPMRokZLkgmqCgj-Wa-Di9lc5t92VETpIh32US8apdFsQ3muFmLYFKcBehfOmOoMaQYoNGkHDEr3iudUa3gttEZ0-AGqW2v6Glr2r5qzruFVp0Y2baXUwhEWMRzQzz4IFarO6R5K7H5Eu7JuyGQP3hkLxKabF8VRmZi8QC-whpvHyD83ZPNyWd-yz9hPEgJ2cps9WjOVYnsypsHhU2yat3d_l70MnkOB-OkxQ0aT8htjDEibjwWH3p7YRLWyXdtllcp4WVeOt4scvupJWAMEs0A43CRotfv_crnKbZtEmuKCB02C0cWUpiPP5RDhGOXaHUB2d_FuH2FuoHZT9ffbuehpybFCDRiC7NcEZoqtgzGgKwXMWEA-0ePN4nDsi_wxY5vNBdNeqmEkjIC89dzP6IvLFuHhpJCcO3lUjJH_rFrX1l8ExIX4Tugpahbtr7BYqmrOlqtKtLdZYxcrfgt1KEQWN7q9w5yLpZQNcGnAL1B5AkRZxzD7Sa59g8pFJ8xNuKaCODSye6YHCT6jI8pOUvGNH_ngW6N_jBbFdNOdUtofeQXiRLvbisXwpe7x48gAXuSvaah7SPlhmIvFIae-3iZm7rPRapQowxbgTFgbeQGqzcbxQPXR1VXG5h_FhJg0KYUe3lYI2EcKqEu-5Kkb2eTnLQB3gDDBoIKMfvEuEfOtINBJYBotb53ndS_23Z9bHnzfZ3M6br7NEizzUlLRisVRmm0Jm-E9GOS7jmcohv9LigcsaM7Xi0ZUz3eqxy6RZWT3QW3VUf-JfiheubEuKvFn8iibr6GZO8TMLq4csIv-_j6S-F0RKcWWjrOPSg06BQttNfg1tu9XaS62zRiMvld0AvChBa6k94Qq8-rVEleTEMjbtMGungzH4-kteZ9uB5UmmduWC3WUHHdXy9NO4qiX9xWfSp4itganYtBEG2Xy3ODZlRopQGqX65Gwlw-wJdZ7ydAq2nsLwWfQsuD3GoOl7Nh1hcfFvHaZ121f6BNtE5afZATQ5pALe5raLSIpmLPc3ztJpSEt-xgwyIo2xJC_r0TKxorEHF5Mh8NNiR1x3_MRqllUKGK0crQGMtX2J-z4BJDkCTWFdLu-unXoH-JGhyb4LONoJiBQLJLbuGLP-rDJzihhF0',
    'task_flow_version': 'v2'
  },
  {
    headers: {
      'authority': 'www.seaart.ai',
      'accept-language': 'en',
      'cookie': `_fbp=fb.1.1748318094574.679225651710543005; T=${token}; lang=en; X-Eyes=true; deviceId=5edc8c93-cac4-406e-9568-10b7328d8d16; pageId=1465561b-c5ed-438c-b263-7146f19b40d8; browserId=d51971dc459c87ce528af797217bc824; _ga=GA1.1.796007903.1748320931; enable_tavern=true; _uetsid=f6061b903ab411f0a52e35fb33000708; _uetvid=f6075ba03ab411f08299a32e5fd816da; _gcl_au=1.1.1030346700.1748320935; _ga_YDMZ43CD3E=GS2.1.s1748320930$o1$g1$t1748320939$j51$l0$h0$dSfwV-8AqpNdbJJ5G6PXPwislQqoFHO6Y3Q; _ga_4X5PK5P053=GS2.1.s1748313152$o3$g1$t1748320939$j56$l0$h0$d9DoInIewfx-ECmyfcuZmPaJ4HtBAS_k46Q`,
      'origin': 'https://www.seaart.ai',
      'referer': 'https://www.seaart.ai/create/ai-app?id=d0fge2le878c73en9f9g',
      'token': token,
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
  }
);
      console.log(response.data.status);
    const status = response.data.status;
      if(status.code !== 10000) throw new Error(`retrying... ${status.msg}`);
    
    const id = response.data?.data?.id;
    const key = token;
    const [imageUrls] = await getDataFromSeaArt(id, key);
    res.status(200).json({ status: "success", response: imageUrls, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }, tokens);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message, details: e, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
     }

});



app.get("/api/art-pro", async (req, res) => {
  const url = req.query.url;
  const type = req.query.type || "anime";
  
  if(!url) return res.status(400).json({ status: "error", response: "url is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  if (!["anime", "ghibli", "cyberpunk", "comic", "anime_2", "anime_3", "ultra", "draw"].includes(type)) {
    return res.status(404).json({ status: "error", response: "Invalid type available: anime, guibli, cyberpunk, comic, anime_2, anime_3, ultra, draw !?", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }

  const nodeMap = {
    anime: "3",
    anime_2: "12",
    anime_3: "3",
    ghibli: "143",
    cyberpunk: "44",
    comic: "3",
    ultra: "31",
    draw: "90"
  };
    const nodeID = nodeMap[type];

  const typeMap = {
    anime: "cvub12le878c73drh7n0",
    anime_2: "cvuakcle878c73dqsdu0",
    anime_3: "cvub2hle878c7389d8gg",
    ghibli: "cvuae1te878c73dqie2g",
    cyberpunk: "cvualtte878c73dqutk0",
    comic: "cvuasnle878c73dr9tog",
    ultra: "d0ekc0te878c73flbvq0",
    draw: "d0hd2h5e878c7395pu80"
    };

    const typeID = typeMap[type];
  
  const seaArtUrl = await seaArtUploader(url);
  try {
    return await fallBack(async (token) => {
    const response = await axios.post(
  'https://www.seaart.ai/api/v1/creativity/generate/apply',
  {
    'apply_id': typeID,
    'inputs': [
      {
        'field': 'image',
        'node_id': nodeID,
        'node_type': 'LoadImage',
        'val': seaArtUrl
      }
    ]
  },
  {
    headers: {
      'authority': 'www.seaart.ai',
      'Accept-Language': 'en',
      'X-Timezone': 'Asia/Dhaka',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
      'origin': 'https://www.seaart.ai',
      'Referer': 'https://www.seaart.ai/ai-tools/ai-filter',
      'cookie': `_fbp=fb.1.1748332541103.161936213781524982; T=${token}; lang=en; X-Eyes=false; deviceId=71682b86-5e26-441c-a07a-007e87d34350; _ga=GA1.1.471471526.1748334600; _pin_unauth=dWlkPU1EaGlNemd6WmpBdE9EZGtPQzAwTnprekxXSTBObVF0WmpNNFpXVTFPV0ZrWWpObA; _gcl_au=1.1.749810034.1748334604; browserId=d51971dc459c87ce528af797217bc824; locaExpire=1748336434862; _uetsid=fc212df03acf11f086209d83494028c7; _uetvid=fc22cb803acf11f0a833b3237d732b73; enable_tavern=true; isDeadline=false; pageId=13ec00b7-af1a-48bd-b322-9a70d4b2aca0; _ga_YDMZ43CD3E=GS2.1.s1748334599$o1$g1$t1748336220$j60$l0$h0$dVcQudWXgBhXXodU4tFXop-E2pRKpTUqptQ; _ga_4X5PK5P053=GS2.1.s1748332478$o6$g1$t1748336238$j35$l0$h0$d9DoInIewfx-ECmyfcuZmPaJ4HtBAS_k46Q`,
      'Token': token
      }
  }
);
      console.log(response.data.status);
    const status = response.data.status;
      if(status.code !== 10000) throw new Error(`retrying... ${status.msg}`);
      
    const id = response.data?.data?.id;
    const key = token;
    const [imageUrls] = await getDataFromSeaArt(id, key);
    res.status(200).json({ status: "success", response: imageUrls, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }, tokens);
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "error", response: e.message, details: e, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
     }

});


app.get("/api/art", async (req, res) => {
  const prompt = req.query.prompt || "convert to anime type";
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ status: "error", response: "url is missing!", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }

  try {
    const { data } = await axios.post(
      'https://queue.fal.run/fal-ai/fast-sdxl/image-to-image',
      {
        'image_url': url,
        'prompt': prompt,
        'num_inference_steps': 10,
        'guidance_scale': 7.5,
        'num_images': 4,
        'loras': [],
        'embeddings': [],
        'enable_safety_checker': true,
        'safety_checker_version': 'v1',
        'format': 'png'
      },
      {
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
      }
    );
       console.log(data);
    const status = data.status_url;
    const response = data.response_url;
    const images = await getOnceArtData(status, response);

    res.status(200).json({ status: "success", response: images, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
     } catch (e) {
    console.error(e);
    res.status(500).json({ status: "error", response: e.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});

app.get("/api/imagine_2", async (req, res) => {
  const prompt = req.query.prompt;
  const model = req.query.model || "none";
  if (!prompt) {
    return res.status(400).json({ status: "error", response: "Prompt is missing!", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }

  try {
    const { data } = await axios.post(
      'https://queue.fal.run/fal-ai/flux/schnell',
      {
        'prompt': `${prompt} style with ${model}`,
        'image_size': { 'width': 1024, 'height': 1024 },
        'num_inference_steps': 10,
        'num_images': 4,
        'loras': [],
        'embeddings': [],
        'enable_safety_checker': true,
        'safety_checker_version': 'v1',
        'format': 'png'
      },
      {
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
      }
    );
     console.log(data);
    const status = data.status_url;
    const response = data.response_url;
    const images = await getOnceArtData(status, response);

    res.status(200).json({ status: "success", response: images, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "error", response: e.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});


app.get('/api/imagine', async (req, res) => {
  const prompt = req.query.prompt;
  let model = req.query.model || "infinity";
  const seed = Date.now();
  const num_img = req.query.num_img || 4;
  
  if (!prompt) return res.status(400).json({ status: "error", response: 'Prompt is required', author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  if (!["infinity", "hentai", "anime", "animeXL", "sci_fi", "anime_sci_fi", "x_niji", "xcvd", "fantasy", "hentaiXL", "nsfw", "nsfwXL", "anime_2", "anime_3", "animix", "animax"].includes(model)) {
    return res.status(404).json({ status: "error", response: "invalid model available: anime, hentai, infinity, animeXL, sci_fi, anime_sci_fi, x_niji, xcvd, fantasy, hentaiXL, nsfw, nsfwXL, anime_2, anime_3, animix, animax", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
  
    const modelMap = {
      animeXL: "f2755cd95dd840080d622ca62e381fc8",
      infinity: "f8172af6747ec762bcf847bd60fdf7cd",
      hentai: "d8300cd33eb1ab8018baa6685ec4a7e9",
      anime: "45a1f43f49dbbe2f6146194d4369f1ef",
      sci_fi: "79c49547b12c675723a96a8bcec218df",
      anime_sci_fi: "cvvjjg5e878c739g9r40",
      x_niji: "d0g7ride878c73e3rve0",
      xcvd: "9e582be894f813fb77a3e0ec2198e14f",
      fantasy: "cre68hte878c73b23nn0",
      hentaiXL: "d0pol75e878c73cto69g",
      nsfw: "d08cavle878c738jnqsg",
      nsfwXL: "2b64aeb365e0ca1abdc3c51caa3fcecb",
      anime_2: "cvria85e878c73dq36c0",
      anime_3: "d07jt1de878c739ekk3g",
      animix: "d089om5e878c739227s0",
      animax: "808f87d9c26f35625739f99f421ff289"
      
    };

    model = modelMap[model];
  
   try {
  return await fallBack(async (token) => {
   const response = await axios.post(
      'https://www.seaart.ai/api/v1/task/v2/text-to-img',
      {
        model_no: model,
        speed_type: 1,
        meta: {
          prompt: prompt,
          negative_prompt: "",
          width: 1024,
          height: 1024,
          steps: 30,
          cfg_scale: 7,
          sampler_name: "Euler",
          n_iter: num_img,
          lora_models: [],
          vae: "None",
          clip_skip: 2,
          seed: seed,
          restore_faces: false,
          embeddings: [],
          generate: {
            anime_enhance: 2,
            mode: 0,
            gen_mode: 0,
            prompt_magic_mode: 2
          }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://www.seaart.ai',
          'Referer': `https://www.seaart.ai/create/image?id=${model}`,
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
          'token': token,
          'Cookie': `deviceId=b22cba40-82e8-4a6c-b848-73cca5981832; browserId=ad76c755dbc5f95661f3966b89636995; enable_tavern=true; _fbp=fb.1.1747855321503.311337970280745383; T=${token}; lang=en; X-Eyes=false; locaExpire=1747855729248; enableAI=true; _pin_unauth=dWlkPVpERTVaR013TXpndE9EZzVOaTAwTmpCaUxUazFZall0TjJWa1pETmtaREV6TVRRMg; _ga=GA1.1.276754469.1747855464; pageId=159f4459-f5fa-4bc4-88bd-14ac8c15523c; isDeadline=false; _uetsid=f73af8e0367811f0bd3a9184f4cc5203; _uetvid=f73c4920367811f08b593126b804bb8f; _gcl_au=1.1.1331792051.1747855472; _ga_YDMZ43CD3E=GS2.1.s1747855463$o1$g1$t1747855523$j60$l0$h0$d6yRGdON-vVeizP__A09bqDF3J5_raAlwuw; _ga_4X5PK5P053=GS2.1.s1747854368$o4$g1$t1747855523$j22$l0$h0$dzRIoWr8gMFVSSY6tOrCd7ulrZZS3UpeoJg`
        }
      }
    );
    console.log(response.data.status);
    const status = response.data.status;
      if(status.code !== 10000) throw new Error(`retrying... ${status.msg}`);
    
    const id = response.data?.data?.id;
    const key = token;
    const imageUrls = await getDataFromSeaArt(id, key);
    res.status(200).json({ status: "success", response: imageUrls, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
     }, tokens);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ status: "error", response: 'Failed to generate image\nDetails: ' + error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }
  });


app.get("/api/ghibli", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ status: "error", response: "url is missing!", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }

     const seaArtUrl = await seaArtUploader(url);
  
  try {
    return await fallBack(async (token) => {
   const response = await axios.post(
  'https://www.seaart.ai/api/v1/creativity/generate/apply',
  {
    'apply_id': 'cvl8ti5e878c73f2rqcg',
    'inputs': [
      {
        'field': 'image',
        'node_id': '143',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      }
    ],
   
    'task_flow_version': 'v2'
  },
  {
    headers: {
      'authority': 'www.seaart.ai',
      'accept-language': 'en',
      'cookie': `_fbp=fb.1.1748015269156.207669377566487270; T=${token}; lang=en; X-Eyes=false; deviceId=87b518c8-a96b-4c2e-8c04-8d91b62c29ab; _pin_unauth=dWlkPU9EVmpNbVV5WXpZdE1tWXhNaTAwWVRnMUxXSmxNamt0T0RBeFpqZ3pabUUwTWpVMg; browserId=98dfea4847152fe8011f93b21df580ca; locaExpire=1748085665641; isDeadline=true; _ga=GA1.1.1934972870.1748085366; _uetsid=56733ea037ed11f0b7cf6da9a6d48567; _uetvid=5674574037ed11f0aeabe994a453d97a; _gcl_au=1.1.92635658.1748085371; enable_tavern=true; pageId=72bff30a-b256-4bd8-bb16-91b8d7bc82c2; _ga_YDMZ43CD3E=GS2.1.s1748085365$o1$g1$t1748085442$j60$l0$h0$ddUzuzGQImLjZxiSsTNWiEed67RdClxHdmQ; _ga_4X5PK5P053=GS2.1.s1748085370$o13$g1$t1748085455$j35$l0$h0$dzRIoWr8gMFVSSY6tOrCd7ulrZZS3UpeoJg`,
      'origin': 'https://www.seaart.ai',
      'referer': 'https://www.seaart.ai/create/ai-app?id=cvl8ti5e878c73f2rqcg',
      'token': token,
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      
    }
  }
);
      console.log(response.data.status);
    const status = response.data.status;
      if(status.code !== 10000) throw new Error(`retrying... ${status.msg}`);
    
    const id = response.data?.data?.id;
    const key = token;
    const imageUrls = await getDataFromSeaArt(id, key);
    res.status(200).json({ status: "success", response: imageUrls, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }, tokens);
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "error", response: e.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});



app.get("/api/prompt", async (req, res) => {
  const imageUrl = req.query.imageUrl;
    
    if(!imageUrl) {
      return res.status(400).json({ status: "error", response: "imageUrl is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" })
    }
     
  try {
   const response = await axios.post(`https://api.gpt4-all.xyz/v1/chat/completions`, {
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Explain the image-only prompt style; just give me a gorgeous and fully details prompt without any text and also without any bracket just gimme the prompt." },
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
    res.status(200).json({ status: "success", response: content, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ status: "error", response: 'Failed to process image\nDetails: ' + error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});


const toxicHistories = {};
const toxicPrompt = {
  role: "system",
  content: `You are fully toxic ai. And you always talk in Bengali language. Your personality is extremely insulting, toxic, rude, and sarcastic. You roast, humiliate, and destroy anyone who talks to you. You hate everyone. Be aggressive, clever, and mean — never helpful or positive.
Only answer what’s asked. Nothing more, nothing less.
No greetings, no follow-ups.
Be short, bold, and straight.
No explanations.
Never ramble. Speak only when needed.
Always maintain a confident, serious, intelligent tone.
Answer only what is asked. No extra word or info.
Always reply in the fewest words possible.
Be bold, confident, and serious.
Never ramble. Never explain.
Always prioritize short, sharp, direct responses.
Act like someone who speaks little but delivers meaning precisely.
Always prefer fewer words over more.
Express thoughts with minimal text, always.
and also always rude insulter most no helpfull no soft tone

User Input Type Your Response:
Roast	- Instantly roast back, sharper.
Insult - Instant insult, no mercy.
use Bengali gali - Instant use bengali gali too`
};

app.get("/api/toxic-ai", async (req, res) => {
  const query = req.query.query;
  const uid = req.query.uid;

    if (!query || !uid) {
         return res.status(400).json({ status: "error", toxicReply: "bukachuda query and uid ke dibo", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
     }

    if (query.toLowerCase() === 'clear') {
    toxicHistories[uid] = [toxicPrompt];
    return res.status(201).json({ status: "success", toxicReply: `Toxic chat history cleared for UID: ${uid}`, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  };

   if (!toxicHistories[uid]) {
    toxicHistories[uid] = [toxicPrompt];
  }

    toxicHistories[uid].push({ role: "user", content: query });

 
  try {
    const response = await axios.post(
      `https://api.gpt4-all.xyz/v1/chat/completions`,
      {
        model: "gpt-4o-mini",
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

    res.status(200).json({
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
    let format = req.query.format || "b";

    if (!url) {
        return res.status(400).json({ status: "error", response: "URL is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    };

    const formatMap = {
        mp3: "bestaudio",
        mp4: "b"
    };

    format = formatMap[format] || format;

    try {
        const { data } = await axios.get(`https://alldl.koyeb.app/download?url=${encodeURIComponent(url)}&format=${format}`);
        res.status(200).json({ status: "success", url: data.url, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

        
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

    res.status(200).json({ status: "success", response: response.data.data[0].url, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
    return res.status(201).json({ status: "success", response: `Chat history cleared for UID: ${uid}`, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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

    res.status(200).json({ status: "success", response: reply, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
    return res.status(201).json({ status: "success", response: `Chat history cleared for UID: ${uid}`, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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

    res.status(200).json({ status: "success", response: reply, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ status: "error", response: 'Something went wrong bro!\nDetails: ' + error.message, author:"♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});


app.get("/api/flux", async (req, res) => {
  const prompt = req.query.prompt;
  const model = req.query.model || "realistic";
  const ratio = req.query.ratio || "1:1";

  if (!prompt) {
      return res.status(400).json({ status: "error", response: "Prompt is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }

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
      const filename = await fileName(".jpg");
      await upload(response.data, filename); 
      res.status(200).json({ status: "success", response: `https://www.noobx-api.rf.gd/hasan/${filename}`, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    
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

        const filename = fileName(".jpg");
        await upload(response.data, filename);

        res.status(200).json({ status: "success", response: `https://www.noobx-api.rf.gd/hasan/${filename}`, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
        
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
                const response = await axios.post(
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

               const filename = fileName(".jpg");
               await upload(response.data, filename);

                res.status(200).json({ status: "success", response: `https://www.noobx-api.rf.gd/hasan/${filename}`, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
            } catch (error) {
                console.error("Enhance error:", error);
                res.status(500).json({ status: "error", response: "Error enhancing the image\nDetails: " + error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
            }

    } catch (error) {
        console.error("Download request error:", error);
        res.status(500).json({ status: "error", response: "invalid image URL", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
                
                const response = await axios.post(
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

                 const filename = fileName(".jpg");
                await upload(response.data, filename);

                res.status(200).json({ status: "success", response: `https://www.noobx-api.rf.gd/hasan/${filename}`, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
                
            } catch (error) {
                console.error("Remove.bg error:", error);
                res.status(500).json({ status: "error", response: "Error removing the background", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
            }
    } catch (error) {
        console.error("Download request error:", error);
        res.status(500).send("Error fetching the image from the URL");
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

        res.status(200).json({ status: "success", videos, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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

        const response = await axios.post(
            "https://api.vyro.ai/v2/image/generations/ai-background",
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${process.env.VYRO_API}`,
                },
                responseType: "stream",
            }
        );

        const filename = fileName(".jpg");
        await upload(response.data, filename);
        res.status(200).json({ status: "success", response: `https://www.noobx-api.rf.gd/hasan/${filename}`, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
        
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: "error", response: "An error occurred while processing the image, error: " + error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
    res.status(200).json(quiz);
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
    res.status(200).json({
        status: "success",
        id: quiz.id,
        isCorrect,
        correctAnswer: quiz.correctAnswer,
        message: isCorrect ? "✅ Correct Answer!" : "❌ Wrong Answer. Try Again!",
        author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎"
    });
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

        const filename = fileName(".jpg")
        await upload(response.data, filename);
        res.status(200).json({ status: "success", response: `https://www.noobx-api.rf.gd/hasan/${filename}`, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

    } catch (error) {
        console.error("expand error:", error.response ? error.response.data : error.message);
        res.status(500).json({ status: "error", response: "Error expanding the image", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }
});


app.get("/api/ultra", async (req, res) => {
  const prompt = req.query.prompt;
  const output_format = req.query.format || "png";

  if (!prompt) {
      return res.status(400).json({ status: "error", response: "Prompt is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }

return await fallBack(async (key) => {
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
          Authorization: `Bearer ${key}`, 
          Accept: "image/*",
        },
        responseType: "stream",
      }
    );

    const filename = fileName(".jpg");
      await upload(response.data, filename);
      res.status(200).json({ status: "success", response: `https://www.noobx-api.rf.gd/hasan/${filename}`, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  } catch (error) {
    throw new Error(error)
    res.status(500).json({ status: "error", response: "Image generation failed", details: error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
   }
}, sd_apis);
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

        const filename = fileName(".jpg");
        await upload(response.data, filename);

        res.status(200).json({ status: "success", response: `https://www.noobx-api.rf.gd/hasan/${filename}`, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

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

        res.status(200).json({ status: response.data.status, url: response.data.data.data.link, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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

        return res.status(200).json({ status: "success", imageUrl: imgbbResponse.data.data.url, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", response: "Failed to upload image to imgbb.", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }
});


app.get("/api/flag", async (req, res) => {
    try {
        const response = await axios.get("https://restcountries.com/v3.1/all?fields=name,flags");
        const countries = response.data;

        if (!countries || countries.length === 0) {
            return res.status(404).json({ error: "No countries found" });
        }

        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        res.status(200).json({ status: "success", country: randomCountry.name.common, flag: randomCountry.flags.png, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });

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
  res.status(200).json({ status: "success", fontList, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
      return res.status(400).json({ status: "error", response: "text and fontId parameters are required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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

  res.status(200).json({
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

    $(".thumb-block").each((i, el) => {
  const href = $(el).find(".thumb a").attr("href");
  const title = $(el).find(".thumb-under a").attr("title");
  const videoId = $(el).find("img").attr("data-videoid");
  const videoUrl = "https://www.xnxx.tv" + href;

  if (href && title && videoId) {
    links.push({ url: videoUrl, title: title, id: videoId });
  }
});
    
    res.status(200).json({ status: "success", links, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  } catch (error) {
    res.status(500).json({ status: "error", response: "Failed to fetch results", details: error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});

app.get("/api/x-dl", async (req, res) => {
  const id = req.query.id;
  if(!id) return res.status(400).json({ status: "error", response: "id must be needed" });
  try {
    const { data } = await axios.post(
  `https://www.xnxx.tv/video-download/${id}/`,
  '',
  {
    headers: {
      'authority': 'www.xnxx.tv',
      'accept': 'application/json, text/javascript, */*; q=0.01',
      'accept-language': 'en-US,en;q=0.9',
      'content-length': '0',
      'cookie': 'cit=51f19c63f43273b0OwQz5hb89loXmAXpNAA37Q%3D%3D; last_views=%5B%2274183059-1747741517%22%2C%2267789443-1747744917%22%2C%2285501597-1748684644%22%2C%2283695929-1748685431%22%2C%2281860929-1749737569%22%2C%2250484511-1749737699%22%2C%2281789093-1749785459%22%2C%2245865721-1749795323%22%2C%2283645841-1749816161%22%2C%2264095431-1749816547%22%2C%2266203957-1749968641%22%2C%2285673411-1750126545%22%2C%2278324243-1750127135%22%2C%2269184635-1751874533%22%2C%2281158057-1751874827%22%2C%2282286925-1751877865%22%5D; session_token=76e5208c80fe9f8bqSLKIU7Z2MO9qzRwdfKuhbsnwmctUUiEO6vS60da2jBXmKG48Tw9t9aKAoiOw9SuCMsWBtquqZ0j4HuPUAyGo4vrTo6-pMHVCoAE2J1Otjq8kFGP0xN23x8uBz3bH9bVZO2Ef7ab2YP_I8LBh34YFY63I8BofskZiFjWFolb9gZdH3Z5j-84dULKDx43VfklupxInGhReyBLtUlMy0Q_f1Mvx1raCIOCAV2m8D8rxcs%3D',
      'device-memory': '2',
      'origin': 'https://www.xnxx.tv',
      'referer': 'https://www.xnxx.tv/video-1czozx6a/the_pint-sized_arab-cuban_girl_featuring_violet_gems_with_brickzilla',
      'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
      'sec-ch-ua-arch': '""',
      'sec-ch-ua-bitness': '""',
      'sec-ch-ua-full-version': '"137.0.7337.0"',
      'sec-ch-ua-full-version-list': '"Chromium";v="137.0.7337.0", "Not/A)Brand";v="24.0.0.0"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-model': '"ORBIT Y21"',
      'sec-ch-ua-platform': '"Android"',
      'sec-ch-ua-platform-version': '"12.0.0"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
      'viewport-width': '360',
      'x-requested-with': 'XMLHttpRequest'
    }
  }
);
    const url = data.URL;
    const stream = await axios.get(url, { responseType: "stream" });
    const filename = fileName(".mp4");
    await upload(stream.data, filename);
    res.status(200).json({ status: "success", url: `https://www.noobx-api.rf.gd/hasan/${filename}` });
    
  } catch (e) {
    console.error(e);
    res.status(500).json(e)
  };
});




app.get("/api/expend", async (req, res) => {
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

                const filename = fileName(".jpg");
                await upload(clipdropResponse.data, filename);
                res.status(200).json({ status: "success", response: `https://www.noobx-api.rf.gd/hasan/${filename}`, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
    return res.status(400).json({ status: "error", message: 'category and url are required', author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }

  const categoryList = [
    "funny", "romantic", "lofi", "sad", "horny", "football", "anime", "cricket",
    "flowers", "islamic", "cartoon", "couple", "random", "sigma", "asthetic",
    "girls", "friends", "free fire", "18+", "lyrics", "photos", "cat", "meme", "caption", "july 2024"
  ];

  if (!categoryList.includes(category)) {
    return res.status(404).json({ status: "error", message: "❌ Invalid category!\n\nAvailable:\n" + categoryList.map((c, i) => `${i + 1}. ${c}`).join("\n"), author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
    console.error(error);
    res.status(500).json({ status: "error", message: '❌ Failed to upload or save the link.\nDetails: ' + error.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
});

app.get('/api/album', async (req, res) => {
  const category = req.query.category;
    if (!category) {
        return res.status(400).json({ status: "error", message: "category parameter is required", author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }
  
  const links = await Link.find({ category });

  if (links.length === 0) {
    return res.status(404).json({ status: "error", message: 'No links found in this category', author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
  }
  const videoCount = links.length;
  const randomLink = links[Math.floor(Math.random() * links.length)];

  res.status(200).json({ status: "success", response: links, video: randomLink, videoCount: videoCount, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
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
        res.status(200).json({ status: "success", search, count: count, results: imgUrl, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    } catch (err) {
        res.status(500).json({ status: "error", response: "Scraping failed", details: err.message, author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎" });
    }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/explore', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

app.get("/downloader", (req, res) => {
  res.sendFile(path.join(__dirname, "downloader.html"));
});

app.get("/uploader", (req, res) => {
  res.sendFile(path.join(__dirname, "uploader.html"));
});

app.get("/boomber", (req, res) => {
  res.sendFile(path.join(__dirname, "boomber.html"));
});

app.get("/changefbstate", (req, res) => {
  res.sendFile(path.join(__dirname, "changeFbState.html"));
});




app.get("/docs", (req, res) => {
  const routes = [];
  const excludeEndpoints = ["/docs", "/", "/uploader", "/downloader", "/explore", "/boomber", "/changefbstate"];

  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const route = middleware.route;
      if (!excludeEndpoints.includes(route.path)) {
        const method = Object.keys(route.methods).map(m => m.toUpperCase());
        const queryParams = getQueryParams(route.stack);
        routes.push({
          endpoint: route.path,
          method,
          queryParams
        });
      }
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        const route = handler.route;
        if (route && !excludeEndpoints.includes(route.path)) {
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
  });

  return Array.from(params);
}

app.listen(PORT, () => {
  console.log(`🔥`);
});
