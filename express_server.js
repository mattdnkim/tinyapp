const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { getIdByEmail } = require('./helper')
const { generateRandomString } = require('./helper');
const { urlsForUser } = require('./helper');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

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

app.get("/", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect('/urls');
  }
  if (!req.cookies.user_id) {
    res.redirect('/login');
  }
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
  if (!req.cookies.user_id) {
    res.status(403).send("You are able to access after login");
  }
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
  if (req.cookies.user_id) {
    res.redirect('/urls');
  }
  res.render("register",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  req.body.longURL = urlDatabase[shortURL].longURL;
  if (!req.cookies.user_id) {
    res.status(403).send("You are able to access after login");
  }
 
  if (!urlDatabase[shortURL]) {
    res.status(400).send("Page not found");
  }

  if (req.cookies.user_id !== urlDatabase[shortURL].userID) {
    res.redirect('/urls');
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[shortURL].longURL,
    user: users[req.cookies.user_id]
  };
  
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL",(req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(400).send("Page not found");
  }
  if (!req.cookies.user_id) {
    res.status(403).send("You are able to access after login");
  }
  const assignedLongURL = urlDatabase[shortURL].longURL;
  if (assignedLongURL) {
    res.redirect(assignedLongURL);
  }
});
  
app.get("/login",(req, res) => {
  const id = req.cookies.user_id;
  const templateVars = { urls: urlsForUser(id),
    user: users[req.cookies.user_id]};
  if (req.cookies.user_id) {
    res.redirect('/urls');
  }
  res.render("login",templateVars);
});
  
  
  

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  const userID = req.cookies.user_id;
  urlDatabase[shortURL] = {longURL,userID};
  res.redirect(`/urls/${shortURL}`);
  res.send("Ok");
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
  let email = req.body.email;
  let password = req.body.password;
  if (!email.length || !password.length) {
    email = undefined;
    password = undefined;
    res.status(400).send("Please fill up the form").end();
  }
  if (getIdByEmail(email)) {
    res.status(400).send("There is an existing email");
  }
  const id = generateRandomString(6);
  const user = {id,email,password};
  users[id] = user;
  res.cookie("user_id",id);
  res.redirect('/urls');
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



