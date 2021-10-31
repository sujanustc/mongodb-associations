const router = require("express").Router();
const User = require("../models/Users");
const verify = require("./verifyToken");

// router.get('/', verify, (req, res)=>{
//     res.send(req.user)
//     User.findbyOne({_id: req.user._id})

//     // res.json({
//     //     posts:{
//     //         title: "1st post",
//     //         des: "secret data"
//     //     }
//     // })
// })

const Post = require("../models/Posts");

router.post("/add", async function (req, res) {
  const { title, body, email } = req.query;
  const user = await User.findOne({ email: email });
  const post = new Post({
    title: title,
    body: body,
    userId: user._id,
  });

  try {
    const savedPost = await post.save();
    res.json(savedPost);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

module.exports = router;
