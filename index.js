const express = require("express");
const app = express();

//cors
const cors = require("cors");
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());

// mongodb 연결
const mongoose = require("mongoose");
const Admin = require("./models/Admin");
mongoose.connect(
  "mongodb+srv://Ddalkkak:w4pyl4PrbsxZAWJw@omm.wdu5kds.mongodb.net/OMM?retryWrites=true&w=majority"
);
mongoose.connection.once("open", () => {
  console.log("MongoDB is Connected");
});

//passward암호화
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

//회원가입
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await Admin.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(400).json(e);
  }
});

//로그인
const jwt = require("jsonwebtoken");
const secret = "qweasdzxc";
app.post("/login/admin", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await Admin.findOne({ username });
  const passOk = bcrypt.compareSync(password, userDoc.password);

  //true or false
  if (passOk) {
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token).json({
        id: userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json({ message: "비밀번호가 틀렸습니다. " });
  }
});

//로그인 후 유효한 토큰을 갖고 있는지 검증
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
});

//로그아웃
app.post("/logout", (req, res) => {
  res.cookie("token", "").json("로그아웃");
});

// const PayDeliveryModel = mongoose.model("PayDelivery", PayDeliverySchema);
// app.get("/orderlsit", (req, res) => {
//   PayDeliveryModel.find((err, data) => {
//     if (err) {
//       return res.status(500).send(err);
//     }
//     return res.json(data);
//   });
// });

app.listen(4000, () => {
  console.log("4000에서 돌고 있음");
});
