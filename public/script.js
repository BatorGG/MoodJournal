var loginBtn = document.getElementById("loginBtn")
if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        var password = document.getElementById("login").value;
    
        var success = await fetch("/checklogin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: password
    
            })
        }).then(res => {
            if (res.ok) return res.json();
            return res.json().then(json => Promise.reject(json))
        }).catch(e => {
            console.error(e.error);
        })
        
        if (success) {
            localStorage.setItem("password", password);
            location.href = "./journal.html"
        }
        else {
            alert("Wrong Login!");
        }
    })
}


var registerBtn = document.getElementById("registerBtn")

if (registerBtn) {
    registerBtn.addEventListener("click", async () => {
        var password = document.getElementById("register").value;
    
        var success = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: password,
                emotions: emotions
            })
        }).then(res => {
            if (res.ok) return res.json();
            return res.json().then(json => Promise.reject(json))
        }).catch(e => {
            console.error(e.error);
        })
        
        if (success) {
            window.location.href = "./login.html";
        }
        else {
            alert("Failed to register!");
        }
    })
}

var addBtn = document.getElementById("addBtn");
var emotions = [];

if (addBtn) {
    addBtn.addEventListener("click", async () => {
        var emotion = document.getElementById("addEmotion").value;

        if (emotion.length > 0) {
            emotions.push(emotion);
            document.getElementsByClassName("emotions")[0].innerHTML += "<p>" + emotion + "</p>";
            document.getElementById("addEmotion").value = "";

        }

    })
}

var clearBtn = document.getElementById("clearBtn");

if (clearBtn) {
    clearBtn.addEventListener("click", async () => {
        emotions = [];
        document.getElementsByClassName("emotions")[0].innerHTML = "";

    })
}



async function loadEmotions() {
    var emotionSliders = document.getElementsByClassName("emotionSliders")[0];
    var password = localStorage.getItem("password");

    emotions = await fetch("/getemotions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            password: password
        })
    }).then(res => {
        if (res.ok) return res.json();
        return res.json().then(json => Promise.reject(json))
    }).catch(e => {
        console.error(e.error);
    })

    console.log(emotions);

    emotionSliders.innerHTML = "";
    for (i = 0; i < emotions.length; i++) {
        emotionSliders.innerHTML += '<h1 class="emotionName">' + emotions[i] + ':</h1> <div class="slidecontainer"> <input type="range" min="1" max="10" value="5" class="slider" id="' + emotions[i] + '"> </div>';   
    }


}



var addEmotionsBtn = document.getElementById("addEmotionsBtn");

if (addEmotionsBtn) {
    addEmotionsBtn.addEventListener("click", async () => {

        var emotionSliders = document.getElementsByClassName("slider");
        var sendEmotions = {};
        for (var i = 0; i < emotionSliders.length; i++) {
            var emotionName = emotionSliders[i].id;
            var emotionValue = emotionSliders[i].value;
            sendEmotions[emotionName] = emotionValue;
        }
        var note = document.getElementById("note").value;

        toSend = {
            "timestamp": Date.now(),
            "emotions" : sendEmotions,
            "note": note
        }
        
        var password = localStorage.getItem("password");

        await fetch("/addemotions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: password,
                data: toSend
            })
        }).then(res => {
            loadHistory();
            if (res.ok) return res.json();
            return res.json().then(json => Promise.reject(json))
        }).catch(e => {
            console.error(e.error);
        })
        

    })
}


async function loadHistory() {
    var historyContainer = document.getElementsByClassName("history")[0];
    var password = localStorage.getItem("password");

    if (password.length < 1) {
        location.href = "./login.html";
    }

    var history = await fetch("/gethistory", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            password: password
        })
    }).then(res => {
        if (res.ok) return res.json();
        return res.json().then(json => Promise.reject(json))
    }).catch(e => {
        console.error(e.error);
    })

    console.log(history);

    historyContainer.innerHTML = "";
    for (i = 0; i < Object.keys(history).length; i++) {
        
        var emotionsText = "";
        for (j = 0; j < Object.keys(history[i]["emotions"]).length; j++) {
            emotionsText += '<h2 class="emotion">' + Object.keys(history[i]["emotions"])[j] + ': ' + Object.values(history[i]["emotions"])[j] + '</h2>'
        }

        var dateFormat = new Date(history[i]["timestamp"]);
        var date = dateFormat.getFullYear()+
           "/"+(dateFormat.getMonth()+1)+
           "/"+dateFormat.getDate()+
           " "+dateFormat.getHours()+
           ":"+dateFormat.getMinutes()+
           ":"+dateFormat.getSeconds();
        var note = history[i]["note"];
        historyContainer.innerHTML += '<div class="moment"> <h1 class="time">' + date + '</h1> ' + emotionsText + '<p class="note">' + note + '</p>'
        
    }


}

var logoutBtn = document.getElementById("logout");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        localStorage.setItem("password", "");
    });
}


function ifLoggedIn(){
    var password = localStorage.getItem("password");

    if (password.length > 0) {
        location.href = "./journal.html";
    }
}

