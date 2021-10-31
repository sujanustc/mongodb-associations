const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

//inport routes
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");

// app.use(bodyParser.urlencoded({ extended: false }))

// // parse application/json
// app.use(bodyParser.json())  {userNewUrlParser: true},

dotenv.config();

//connect to DB
mongoose.connect(process.env.DB_CONNECT, () => {
  console.log("connected to db");
});

//middleware
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// const Posts = require("./models/Posts");
// const myfunc = async () => {
//   const post = await Posts.findById("617e438c6d854a9752f4cba1").populate(
//     "userId"
//   );
//   console.log(post);
// };
// myfunc();

// const Users = require("./models/Users");
// const myfunc2 = async () => {
//   const user = await Users.findOne({ _id: "617e3c66b43619c4259f84b9" })
//     .populate("posts")
//     .exec();
//   console.log(user);
// };
// myfunc2();
const Publisher = require("./models/Publisher");

app.post("/addPublisher", async (req, res) => {
  try {
    //validate req.body data before saving
    console.log(req.body);
    const publisher = new Publisher(req.query);
    await publisher.save();
    res.status(201).json({ success: true, data: publisher });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

const Book = require("./models/Book");
app.post("/addBook", async (req, res) => {
  try {
    //validate data as required

    const book = new Book(req.query);
    // book.publisher = publisher._id; <=== Assign user id from signed in publisher to publisher key
    await book.save();
    const publisher = await Publisher.findById({ _id: book.publisher });
    publisher.publishedBooks.push(book);
    await publisher.save();

    //return new book object, after saving it to Publisher
    res.status(200).json({ success: true, data: book });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.get("/all", async (req, res) => {
  const publisher = await Publisher.find().populate("publishedBooks").exec();
  res.json(publisher);
});

//one to many relationship
app.get("/publishers", async (req, res) => {
  try {
    const data = await Publisher.find().populate({
      path: "booksPublished",
      select: "name publishYear author",
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

//filtering single conditon on populate
app.get("/publishersnew", async (req, res) => {
  try {
    const data = await Publisher.find().populate({
      path: "booksPublished",
      match: [{ name: { $eq: "nextjs" } }],
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

//filtering multiple conditon on populate
app.get("/publishersnew2", async (req, res) => {
  try {
    const data = await Publisher.find().populate({
      path: "booksPublished",
      match: {
        $and: [{ name: { $eq: "nextjs" } }, { publishYear: { $lt: 2022 } }],
      },
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// {
//   $or: [{ region: "NA" }, { sector: "Some Sector" }];
// }

//route middleware
// app.use("/api/user", authRoute);
// app.use("/api/post", postRoute);

app.listen(port, () => console.log(`Example app listening on ${port} port!`));
