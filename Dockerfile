FROM node:20
RUN apt-get update && apt-get install -y ffmpeg wget \
    && wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    && install -m 755 yt-dlp /usr/local/bin/yt-dlp \
    && rm yt-dlp
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
