const express = require("express");
const fs = require("fs");

const router = express.Router();

router.get("/video", function (req, res) {
  console.log(req.headers);

  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 11MB)
  const videoPath = "Aerial Shot of a Lighthouse.mp4";
  const videoSize = fs.statSync(videoPath).size;
  console.log(videoSize);

  // Parse Range
  // Example: 'bytes=6750208-'
  const CHUNK_SIZE = 5 * 10 ** 5; // ~500 KB => 500000 Bytes
  const start = Number(range.replace(/\D/g, "")); // 'bytes=6750208-' => 6750208
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  console.log(start, end);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

module.exports = router;
