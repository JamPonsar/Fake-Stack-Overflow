// Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.

let userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

let Tag = require('./models/tags')
let Answer = require('./models/answers')
let Question = require('./models/questions')
let Comment = require('./models/comments')
let User = require('./models/user')


let mongoose = require('mongoose');
let mongoDB = userArgs[0];
let adminUser = userArgs[1];
let adminPass = userArgs[2];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

function tagCreate(name) {
  let tag = new Tag({ name: name });
  return tag.save();
}

async function answerCreate(text, ans_by, ans_date_time, comments, votes, author_id) {
  answerdetail = {text:text};
  if (ans_by != false) answerdetail.ans_by = ans_by;
  if (ans_date_time != false) answerdetail.ans_date_time = ans_date_time;
  if (comments != false) answerdetail.comments = comments;
  if (votes != false) answerdetail.votes = votes;
  if (author_id!= false) answerdetail.author_id = author_id;

  let answer = new Answer(answerdetail);
  return answer.save();
}

async function questionCreate(title, text, summary, tags, answers, comments, asked_by, ask_date_time, views, votes, author_id) {
console.log("ASKED BY" ,asked_by);
  qstndetail = {
    title: title,
    text: text,
    summary: summary,
    tags: tags,
    asked_by: asked_by,
    author_id : author_id
  };
  if (answers != false) qstndetail.answers = answers;
  if (comments != false) qstndetail.comments = comments;
  if (ask_date_time != false) qstndetail.ask_date_time = ask_date_time;
  if (views != false) qstndetail.views = views;
  if (votes != false) qstndetail.votes = votes;
  let qstn = new Question(qstndetail);
  return qstn.save();
}

async function commentCreate(comment_by, text, votes, comment_date_time, author_id) {
    let comment = new Comment({ 
        comment_by : comment_by,
        text : text,
        author_id: author_id
    });

    if (votes != false) comment.votes = votes;
    if (comment_date_time != false) comment.comment_date_time = comment_date_time;
    return comment.save();
  }

  function userCreate(username, password, email, admin = false, reputation){
    let user = new User(
        {
            username: username,
            password: password,
            email: email,
            admin: admin,
            reputation : reputation
        }
    );

    return user.save();
}

const populate = async () => {

    let u1 = await userCreate(adminUser, adminPass, adminUser + '@gmail.com', true, 9999);
    let u2 = await userCreate('henry', 'password', 'henry@gmail.com', false, 50);
    let u3 = await userCreate('jam', 'volleyball', 'jam@gmail.com', false, 50);
    let u4 = await userCreate('banerjee', 'nlp', 'jeejee@gmail.com', false, 50);


    let t1 = await tagCreate('react');
    let t2 = await tagCreate('javascript');
    let t3 = await tagCreate('android-studio');
    let t4 = await tagCreate('shared-preferences');
    
    let c1 = await commentCreate(u3.username, 'yes', 4, false, u3);
    let c2 = await commentCreate(u2.username, 'mayhaps', 2, false, u2);
    let c3 = await commentCreate(u3.username, 'gooodd', false, false, u3);
    let c4 = await commentCreate(u4.username, 'damnnn i agree', false, false, u4);
    let c5 = await commentCreate(u4.username, 'noooooooooo', false, false, u4);
    let c6 = await commentCreate(u2.username, 'badddd', false, false, u2);
    let c7 = await commentCreate(u3.username, 'i know the answer', false, false, u3);
    let c8 = await commentCreate(u4.username, 'eureka', false, false, u4);



    let a1 = await answerCreate('React Router is mostly a wrapper around the history library. history handles interaction with the browser\'s window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don\'t have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.'
    , u3.username, false, [c1,c2], false, u3);
    let a2 = await answerCreate('On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn\'t change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router.'
    , u2.username, false, [c4,c5], 1, u2);
    let a3 = await answerCreate('Consider using apply() instead; commit writes its data to persistent storage immediately, whereas apply will handle it in the background.'
    , u3.username, false, [c3], 3, u3);
    let a4 = await answerCreate('YourPreference yourPrefrence = YourPreference.getInstance(context); yourPreference.saveData(YOUR_KEY,YOUR_VALUE);'
    , u4.username, false, false, false, u4);
    let a5 = await answerCreate('I just found all the above examples just too confusing, so I wrote my own. '
    , u4.username, false, false, false, u4);


    await questionCreate('Programmatically navigate using React router', 'the alert shows the proper index for the li clicked, and when I alert the variable within the last function I\'m calling, moveToNextImage(stepClicked), the same value shows but the animation isn\'t happening. This works many other ways, but I\'m trying to pass the index value of the list item clicked to use for the math to calculate.'
    , 'need help',[t1, t2], [a1, a2], [c6,c7], u2.username, false, false , false, u2);
    await questionCreate('android studio save string shared preference, start activity and load the saved string', 'I am using bottom navigation view but am using custom navigation, so my fragments are not recreated every time i switch to a different view. I just hide/show my fragments depending on the icon selected. The problem i am facing is that whenever a config change happens (dark/light theme), my app crashes. I have 2 fragments in this activity and the below code is what i am using to refrain them from being recreated.'
    , 'app crashes',[t3, t4, t2], [a3, a4, a5], [c8], u3.username, false, 121 , 12, u3);


    if(db) db.close();
    console.log('done');
}

populate()
  .catch((err) => {
    console.log('ERROR: ' + err);
    if(db) db.close();
  });

console.log('processing ...');
