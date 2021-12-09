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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  randomUserID: {
    id: "djf376",
    email: "email@email.com",
    password: "123456"
  }
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
  // const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  const templateVars = { urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  // console.log(templateVars);
  // console.log(req.cookies,"req");
  res.render("urls_index", templateVars);
});
  

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  
  const templateVars = { urls: urlDatabase,
    user: users[req.cookies.user_id]};
  res.render("register",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  // console.log(req.params);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_id]
  };
  // const longURL = req.body.longURL;
  
  // res.redirect(longURL);
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL",(req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
  
});

app.get('/login',(req, res) => {
  const templateVars = { urls: urlDatabase,
    user: users[req.cookies.user_id]};
  res.render("login",templateVars);
});





app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = longURL;
  
  res.redirect(`/urls/${shortURL}`);
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});


app.post("/urls/:shortURL/delete",(req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post("/urls/:id",(req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;
  // console.log(req.body.longURL);
  res.redirect('/urls');
});


app.post("/login",(req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let id = getIdByEmail(email);
  if (!id) {
    res.send(403);
  } else if (password !== users[id]["password"]) {
    res.send(403);
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
    res.send(400);
  }
  if (getIdByEmail(email)) {
    res.send(400);
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



