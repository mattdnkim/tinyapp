const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");



const generateRandomString = function(n) {
  let randomString           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < n; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

const getIdByEmail = function(email) {
  const keys = Object.keys(users);
  console.log(keys);
  for (const id of keys) {
    if (users[id]["email"] === email) {
      return id;
    }
  }
};



const urlDatabase = {
  abc123:
  {longURL: "http://www.lighthouselabs.ca",
    userID: "dsdf32"},
  cbd123:
    {longURL: "http://www.google.com",
      userID: "dsdf32"},
  ghg123:
      {longURL: "http://www.naver.com",
        userID: "343fdf" }
};

const users = {
  dsdf32: {
    id: "djf376",
    email: "e@e.com",
    password: "123"
  }
};

const urlsForUser = function(id) {
  const keys = Object.keys(urlDatabase);
  let keyobj = {};
  for (const key of keys) {
    if (urlDatabase[key]["userID"] === id) {
      keyobj[key] = urlDatabase[key];
    }
  }
  return keyobj;
};

  


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = { urls: urlsForUser(id),
    user: users[id],
  };
  res.render("urls_index", templateVars);
});
  

app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = { urls: urlsForUser(id),
    user: users[req.cookies.user_id]
  };
  const cookie = req.cookies.user_id;
  if (!cookie) {
    return res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

  


app.get("/register", (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = { urls: urlsForUser(id),
    user: users[req.cookies.user_id]};
  res.render("register",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies.user_id]
  };
  console.log(urlDatabase);
  res.render("urls_show", templateVars);
});
  
  
app.get("/login",(req, res) => {
  const id = req.cookies.user_id;
  const templateVars = { urls: urlsForUser(id),
    user: users[req.cookies.user_id]};
  res.render("login",templateVars);
});
  
  
app.get("/u/:shortURL",(req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(400).send("no page found");
  }
  const assignedLongURL = urlDatabase[shortURL].longURL;
  if (assignedLongURL) {
    res.redirect(assignedLongURL);
  }
});
  

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  const userID = req.cookies.user_id;
  urlDatabase[shortURL] = {longURL,userID};
  res.redirect(`/urls/${shortURL}`);
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});


app.post("/urls/:shortURL/delete",(req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL",(req, res) => {
  const id = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[id].longURL = newLongURL;
  // console.log(req.body.longURL);
  res.redirect('/urls');
});


app.post("/login",(req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let id = getIdByEmail(email);
  if (!id) {
    res.status(403).send("Email doesn't exist");
  } else if (password !== users[id]["password"]) {
    res.status(403).send("Password isn't correct");
  }
  res.cookie("user_id",id);
  res.redirect('/urls');
});

app.post("/logout",(req, res) => {
  res.clearCookie("user_id",req.body.user_id);
  res.redirect('/urls');
});

app.post("/register",(req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.status(400).send("Please fill up the form");
  }
  if (getIdByEmail(email)) {
    res.status(400).send("There is an existing email");
  }
  const id = generateRandomString(6);
  const user = {id,email,password};
  users[id] = user;
  console.log(users);
  res.cookie("user_id",id);
  res.redirect('/urls');
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



