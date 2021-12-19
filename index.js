const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const CryptoJS = require("crypto-js");
const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

mongoose.connect(
  "mongodb+srv://UserAuth:uwNSYdGSxxwV2yS7@cluster0.xnyj5.mongodb.net/users?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("DB connected");
  }
);

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

app.post("/signup", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (user) {
      res.send({ message: "User already registerd" });
    } else {
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, "rakib").toString(),
      });
      user.save((err) => {
        if (err) {
          res.send(err);
        } else {
          res.send({ message: "Successfully Registered, Please login now." });
        }
      });
    }
  });
});

// Routes
app.post("/signin", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      const bytes = CryptoJS.AES.decrypt(user.password, "rakib");
      const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

      if (password === originalPassword) {
        const { password, ...info } = user._doc;
        res.send({ message: "Login Successfull", user: info });
      } else {
        res.send({ message: "Password didn't match" });
      }
    } else {
      res.send({ message: "User not registered" });
    }
  });
});

app.listen(port, () => {
  console.log(`app listening at ${port}`);
});
