// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const session = require("express-session")
const app = express();
let cors = require("cors");
const port = 8000;
const mongoose = require("mongoose");
const mongodb = "mongodb://127.0.0.1:27017/fake_so";

let Questions = require("./models/questions");
let Answers = require("./models/answers");
let Tags = require("./models/tags");
let Comments = require("./models/comments");
let User = require("./models/user");

const bcrypt = require("bcrypt")
// Use the cors middleware
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(
    session({
      name:'mySessionCookie',
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: true,
      cookie: {secure:false} 
    })
  );

app.get("/", function (req, res) {
    res.send("Hello World!");
});

app.get("/questions", async (req, res) => {
    try {
        // Populate the tags, answers, comments, and author_id fields
        let questions = await Questions.find({})
            .populate('tags')
            .populate('answers')
            .populate('comments')
            .populate('author_id')
            .exec();
        res.send(questions);
    } catch (err) {
        console.error("Error fetching questions:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/answers", async (req, res) => {
    let answers = await Answers.find({})
    .populate('comments')
    .populate('author_id')
    .exec();
    res.send(answers);
});

app.get("/tags", async (req, res) => {
    let tags = await Tags.find();
    res.send(tags);
});

app.get("/questions/:page", async (req, res) => {
    let questions = await Questions.find({ _id: req.params.page })
        .populate('tags')
        .populate({
            path: 'answers',
            populate: [
                { path: 'comments' , populate: { path: 'author_id' } }
            ]
        })
        .populate({
            path: 'comments',
            populate: { path: 'author_id' } 
        })
        .populate('author_id')
        .exec();
    res.send(questions);
});

// return num documents with tag
app.get("/tagQuestionCount/:tid", async (req, res) => {
    const tid = new mongoose.Types.ObjectId(req.params.tid);
    const num = await Questions.countDocuments({ 'tags': { $in: [tid] } });
    res.send({count: num });
});

//search for question with tag name in database
app.get("/searchTag/:tag", async (req, res) => {
    try {
        let tagName = req.params.tag.toLowerCase();
        // Find the tag document with the specified name
        let tagDocument = await Tags.findOne({ name: tagName }).exec();
        if (!tagDocument) {
            // If tag not found, return an empty array of questions
            return res.send([]);
        }
        // Find questions that have the tag with the specified name
        let questions = await Questions.find({ tags: tagDocument._id })
            .populate('tags')
            .populate('answers')
            .populate('comments')
            .populate('author_id')
            .exec();
        console.log("searched for tag", tagName, "and got", questions);
        res.send(questions);
    } catch (error) {
        res.send([]);
    }
});


//search for question with specific search term (both title and text) in database 
app.get("/searchWord/:search", async (req, res) => {
    try {
        let search = req.params.search.toLowerCase();
        let questions = await Questions.find({ $or: [ { 'title': { $regex: search,$options: 'i'} }, { 'text': { $regex: search, $options: 'i'} } ] })
            .populate('tags')
            .populate('answers')
            .populate('comments')
            .populate('author_id')
            .exec();
        console.log("searched for" ,search, "and got" ,questions)
        res.send(questions);
    } catch (error) {
        res.send([]);
    }
});


app.post("/addQuestion", async (req, res) => {
    try {
        // Split the tag names sent as a string by whitespace
        let tagNames = req.body.questionTags.split(" ");
        let qsTags = [];

        // Loop through each tag name
        for (let i = 0; i < tagNames.length; i++) {
            let tagName = tagNames[i];

            // Check if the tag already exists in the database
            let exist = await Tags.findOne({ name: tagName });

            // If the tag doesn't exist, create a new one and save it
            if (!exist) {
                let newTag = new Tags({ name: tagName });
                await newTag.save();
                qsTags.push(newTag);
            } else {
                // If the tag exists, push it to the array of question tags
                qsTags.push(exist);
            }
        }

        // Create question details object
        let questionDetails = {
            title: req.body.questionTitle,
            text: req.body.questionText,
            summary: req.body.questionSummary,
            tags: qsTags,
            answers: [],
            comments:[],
            asked_by: req.body.questionUsername,
            ask_date_time: new Date(),
            views: 0,
            votes:0,
            author_id : req.body.questionUserId
        };

        // Create a new question instance and save it
        let newQuestion = new Questions(questionDetails);
        let savedQuestion = await newQuestion.save();

        // Send the saved question as response
        res.send(savedQuestion);
    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error adding question:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/addAnswer", async (req, res) => {
    try {
        // Extract answer details from the request body
        const { answerText, answerUser,answerUsername, qid } = req.body;

        // Create a new answer object with the provided details
        const newAnswer = new Answers({
            text: answerText,
            ans_by: answerUsername,
            author_id: answerUser,
            ans_date_time: new Date(),
            votes: 0,
            comments:[]
        });

        // Save the new answer to the database
        await newAnswer.save();

        // Update the corresponding question by pushing the new answer into its answers array
        await Questions.updateOne(
            { _id: qid },
            { $push: { answers: newAnswer } }
        );

        // Send the newly created answer as the response
        res.send(newAnswer);
    } catch (error) {
        // Handle any errors and send an appropriate error response
        console.error("Error adding answer:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/addView/:page", async (req, res) => {
    try {
        // Find the question by its ID
        const question = await Questions.findOne({ _id: req.params.page });

        // Increment the number of views by 1
        const numViews = question.views + 1;

        // Update the question's views count
        await Questions.updateOne(
            { _id: req.params.page },
            { $set: { views: numViews } }
        );

        // Send a success status code (200) as the response
        res.sendStatus(200);
    } catch (error) {
        // Handle any errors and send an appropriate error response
        console.error("Error adding view:", error);
        res.status(500).send("Internal Server Error");
    }
});

async function main() {
    console.log("Connecting to mongoDB");
    await mongoose.connect(mongodb);
    console.log("Connected to mongoDB");
    db = mongoose.connection;
};

main().catch((err) => console.log(err));
app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
});

process.on("SIGINT", function () {
    console.log("Server closed. Database instance disconnected");
    process.exit(0);
});

app.get('/getAllQuestions', async (req, res) => {
    try{
        let questions = await Questions.find({})
        .populate('tags')
        .populate('answers')
        .populate('comments')
        .populate('author_id')
        .exec();
        res.send(questions);
    }
    catch(error){
      console.log(error);
      res.sendStatus(500);
    }
  });

app.get('/checkLoggedIn', (req, res) => {
// Check if user is logged in, e.g. by verifying a session or token
//console.log("test");
//console.log(req.session);
if (req.session.username) {
    // If user is logged in, return the username or other user data as JSON
    res.json({
    userId: req.session.userId,
    username: req.session.username});
} else {
    // If user is not logged in, return an error status code and message
    res.status(401).json({ error: 'User not logged in' });
}
});

 // guest login from welcome page
app.post("/loginGuest", async (req, res) => {
    console.log(req.session);
    req.session.userId = 0;
    req.session.username = "Guest";
    res.send({ message: "Successfully logged in!" });
});
  
//login from login page
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).send({ message: "Email not registered!" });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).send({ message: "Invalid email or password" });
      }
  
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.admin = user.admin;
      req.session.reputation = user.reputation;
      res.send({ message: "Successfully logged in!" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "An error occurred while logging in" });
    }
  });

//registering user from register page 
app.post('/registerUser', async (req, res) => {
    try {
      const { username, password, email } = req.body;
      const user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      const newUser = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        register_date: new Date()
      });
      await newUser.save();
      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });

app.get("/logout", async (req, res) => {
req.session.userId = null
req.session.username = null
res.send("logged out")
});

app.get('/getReputation/:userId', async (req, res) => {
    const userId = req.params.userId;
    try{
      let rep = await User.find({_id: userId}, "reputation");
      // console.log(rep);
      res.json(rep);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });

app.post("/addQuestionComment", async (req, res) => {
    try {
        const {commentText ,commentUserId ,commentUsername, qid} = req.body;

        const newComment = new Comments({
            text: commentText,
            comment_by: commentUsername,
            author_id: commentUserId,
            comment_date_time: new Date(),
            votes: 0,
        });
        console.log(newComment);
        await newComment.save();

        await Questions.updateOne(
            { _id: qid },
            { $push: { comments: newComment } }
        );

        res.send(newComment);
    } catch (error) {
        // Handle any errors and send an appropriate error response
        console.error("Error adding answer:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/addAnswerComment", async (req, res) => {
    try {
        const {commentText ,commentUserId ,commentUsername, aid} = req.body;

        const newComment = new Comments({
            text: commentText,
            comment_by: commentUsername,
            author_id: commentUserId,
            comment_date_time: new Date(),
            votes: 0,
        });

        await newComment.save();

        await Answers.updateOne(
            { _id: aid },
            { $push: { comments: newComment } }
        );

        res.send(newComment);
    } catch (error) {
        // Handle any errors and send an appropriate error response
        console.error("Error adding answer:", error);
        res.status(500).send("Internal Server Error");
    }
});
