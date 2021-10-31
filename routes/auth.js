const router = require("express").Router();
const User = require("../models/Users");
const { registerValidation, loginValidation } = require("../validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async function (req, res) {
  //VALIDATE REQUEST DATA
  console.log(req.query);
  // const error = registerValidation(req.body);
  // //console.log(error);
  // if (error) return res.status(400).send(error);

  //checking if the user is already in the database
  const isEmailExist = await User.findOne({ email: req.query.email });
  if (isEmailExist) return res.status(400).send("email already exist");

  //Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.query.password, salt);

  const user = new User({
    name: req.query.name,
    email: req.query.email,
    password: hashPassword,
  });
  try {
    const savedUser = await user.save();
    res.json({ id: savedUser._id });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res) => {
  //VALIDATE REQUEST DATA
  // const error = loginValidation(req.q);
  // //console.log(error);
  // if (error) return res.status(400).send(error.details[0].message);

  //checking if the user in the database
  const user = await User.findOne({ email: req.query.email });
  if (!user) return res.status(400).send("user doesn't exist");
  //PASSWORD MATCHING
  const validPass = await bcrypt.compare(req.query.password, user.password);
  if (!validPass) return res.status(400).send("invalid password");
  //creating jwt token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token);
  res.send("Loged In");
});

router.get("/all", async (req, res) => {
  console.log(req.query._id);
  const users = await User.find().populate("posts");
  res.json(users);
});

module.exports = router;
