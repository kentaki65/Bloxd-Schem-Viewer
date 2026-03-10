const express = require("express");
const multer = require("multer");
const bloxd = require("./parser.js");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static("public"));
app.post("/upload", upload.single("schem"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "no file" });
  }
  const buffer = req.file.buffer;
  console.log("file size:", buffer.length);
  console.log("header:", buffer.slice(0,4));
  try {
    const parsed = bloxd.parseBloxdschem(buffer);
    return res.json(parsed);
  } catch (err1) {
    try {
      const parsed = bloxd.parseBloxdschem(buffer.slice(4));
      return res.json(parsed);
    } catch (err2) {
      console.error("parse failed:", err1);
      console.error("after header skip:", err2);
      return res.status(500).json({
        error: "parse failed"
      });
    }
  }
});
app.listen(3000, () => console.log("Server started"));