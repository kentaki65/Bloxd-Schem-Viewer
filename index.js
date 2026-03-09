const express = require("express");
const multer = require("multer");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.post("/upload", upload.single("schem"), (req, res) => {
  const buffer = req.file.buffer;
  console.log("received file: ", buffer.length);
})
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));