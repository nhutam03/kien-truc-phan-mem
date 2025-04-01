const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Kết nối với MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error("Không thể kết nối MySQL:", err);
    return;
  }
  console.log("Kết nối MySQL thành công!");
});

// Route kiểm tra kết nối
app.get("/", (req, res) => {
  db.query("SELECT NOW() AS time", (err, result) => {
    if (err) {
      res.status(500).send("Lỗi kết nối MySQL");
    } else {
      res.send(`MySQL Server Time: ${result[0].time}`);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
