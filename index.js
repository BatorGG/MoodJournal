const express = require("express");
const path = require("path");
const moment = require("moment");
const fs = require('fs');
var users = {
    "abc": {
        "registered": 1681310602449,
        "emotions": ["happy", "sad"],
        "history": [
            {
                "timestamp": 1681310602449,
                "emotions" : {
                    "happy": 10,
                    "sad": 0
                },
                "note": "Good day"
            },
            {
                "timestamp": 1681310602449,
                "emotions" : {
                    "happy": 0,
                    "sad": 10
                },
                "note": "Bad day"
            }
        ]
    }
}


const app = express();

//Middelware
const logger = (req, res, next) => {
    console.log(`${moment().format()}: ${req.protocol}://${req.get("host")}${req.originalUrl}`);
    next();
};

//Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false}));

app.use(logger);



//Check login
app.post("/checklogin", (req, res) =>{
    var password = req.body.password;

    if (users.hasOwnProperty(password)) {
        res.json(true);
    }
    else {
        res.json(false);
    }
});

//Register
app.post("/register", (req, res) =>{
    var password = req.body.password;
    var emotions = req.body.emotions;
    console.log(emotions);

    if (users.hasOwnProperty(password) || password.length < 3 || emotions.length < 1) {
        res.json(false);
    }
    else {
        users[password] = {
            "registered": Date.now(),
            "emotions": emotions,
            "history": []
        }

        console.log(users)

        res.json(true);
    }
});

//Get user emotions
app.post("/getemotions", (req, res) =>{
    var password = req.body.password;

    if (users.hasOwnProperty(password)) {

        res.json(users[password]["emotions"]);
    }
    else {
        res.json([]);
    }
});

//Get user history
app.post("/gethistory", (req, res) =>{
    var password = req.body.password;

    if (users.hasOwnProperty(password)) {

        res.json(users[password]["history"]);
    }
    else {
        res.json([]);
    }
});

//Add emotions to users history
app.post("/addemotions", (req, res) =>{
    var password = req.body.password;
    var data = req.body.data;

    if (users.hasOwnProperty(password)) {

        users[password]["history"].unshift(data)

        var writeStr = JSON.stringify(users)
        fs.writeFile('./users.txt', writeStr, err => {
            if (err) {
                console.error(err);
            }
        });

        res.json(true);
    }
    else {
        res.json(false);
    }
});



//Set a static folder
app.use(express.static(path.join(__dirname, "public")));


const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);

    fs.readFile('./users.txt', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        users = JSON.parse(data);
      });
});