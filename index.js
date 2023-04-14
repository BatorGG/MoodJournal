require("dotenv").config();
const express = require("express");
const path = require("path");
const moment = require("moment");
const mongoose  = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    data: {
        type: String,
        required: true
    }
});

const Data = mongoose.model("Data", UserSchema);

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

// DB Config
const db = process.env.MONGO_URI;


const connectDatabase = async () => {
    try {
        console.log("Trying to connect to mongo");
        await mongoose.connect(db, { useNewUrlParser: true })
    
        console.log("MongoDB connected...");
      } catch (error) {
        console.log(error);
        //process.exit(1);
        setTimeout(connectDatabase, 1000);
      }
}

connectDatabase();

//Middelware
const logger = (req, res, next) => {
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    console.log(`${ip} ${moment().format()}: ${req.protocol}://${req.get("host")}${req.originalUrl}`);
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
app.post("/addemotions", async (req, res) =>{
    var password = req.body.password;
    var data = req.body.data;

    if (users.hasOwnProperty(password)) {

        users[password]["history"].unshift(data)

        var isValid = await Data.findOne({ name: "data"});

        if (isValid) {
            var filter = { name: "data" };
            var update = { data: JSON.stringify(users)  };
            var updated = await Data.findOneAndUpdate(filter, update, {
                new: true
            });
            console.log("Saved added emotion to database.")
        }
        else {
            console.log("An error occured while saving data to database.");
        }

        res.json(true);
    }
    else {
        res.json(false);
    }
});



//Set a static folder
app.use(express.static(path.join(__dirname, "public")));


const PORT = 5000;

app.listen(PORT, async () => {
    console.log(`Server started on port ${PORT}`);

    var isValid = await Data.findOne({ name: "data"});

    if (isValid) {
        users = JSON.parse(isValid.data);
        console.log("Data loaded successfully.");
        console.log(users);
    }
    else {
        console.log("An error occured while loading data from database.");
    }

});