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

  try {
    const buffer = req.file.buffer;
    const parsed = await bloxd.parseBloxdschem(buffer);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "parse failed" });
  }
});

app.listen(3000, () => console.log("Server started"));