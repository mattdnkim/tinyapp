const express = require("express");
const app = express();
const PORT = 8080;
const { redirect } = require("express/lib/response");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session")
const { getIdByEmail } = require("./helper") //This can grab the 6digit alphanumeric id for cookie by user"s email
const { generateRandomString } = require("./helper");
const { urlsForUser } = require("./helper");
const bcrypt = require("bcryptjs");


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({ 
  httpOnly: false,
  name: "session",
  keys: ["cookie"],
}))
app.set("view engine", "ejs")

const urlDatabase = {}
const users = {}

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const templateVars = { //object to render to html
    urls: urlsForUser(id, urlDatabase),
    user: users[id],
  };
  if (!req.session.user_id) {
    res.status(403).send("You are able to access after login");
  }
  res.render("urls_index", templateVars);
});
  
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login")
  }
  const id = req.session.user_id;
  const templateVars = { //object to render to html
    urls: urlsForUser(id, urlDatabase),
    user: users[req.session.user_id]
  };
  const cookie = req.session.user_id;
  if (!cookie) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const id = req.session.user_id;
  const templateVars = { //object to render to html
    urls: urlsForUser(id, urlDatabase),
    user: users[req.session.user_id]};
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("register",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send("You are able to access after login");
  }
  const shortURL = req.params.shortURL;
  req.body.longURL = urlDatabase[shortURL].longURL;
 
  if (!urlDatabase[shortURL]) {
    res.status(400).send("Page not found");
  }

  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    res.redirect("/urls");
  }
  const templateVars = { //object to render to html
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.session.user_id]
  };
  
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL",(req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(400).send("Page not found");
  }
  const assignedLongURL = urlDatabase[shortURL].longURL;
  if (assignedLongURL) {
    res.redirect(assignedLongURL);
  }
});

app.get("/login",(req, res) => {
  const id = req.session.user_id;
  const templateVars = { //object to render to html
    urls: urlsForUser(id, urlDatabase),
    user: users[req.session.user_id]};
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("login",templateVars);
});
  
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send("You are able to access after login");
  }
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  const userID = req.session.user_id;
  urlDatabase[shortURL] = {longURL,userID};
  res.redirect(`/urls/${shortURL}`);
  res.send("Ok");
});

app.post("/urls/:shortURL/delete",(req, res) => {
  if (!req.session.user_id) {
    res.status(403).send("You are able to access after login");
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL",(req, res) => {
  if (!req.session.user_id) {
    res.status(403).send("You are able to access after login");
  }
  const id = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[id].longURL = newLongURL;
  res.redirect("/urls");
});


app.post("/login",(req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let id = getIdByEmail(email, users);
  if (!id) {
    return res.status(403).send("Email doesn't exist");
    
  } else if (!bcrypt.compareSync(password, users[id]["password"])) { 
    return res.status(403).send("Password isn't correct");
  }
  req.session.user_id = id
  res.redirect("/urls");
});

app.post("/logout",(req, res) => {
  req.session = null
  res.redirect("/");
});

app.post("/register",(req,res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!email.length || !password.length) {
    email = undefined;
    password = undefined;
    res.status(400).send("Please fill up the form").end();
  }
  if (getIdByEmail(email,users)) {
    res.status(400).send("There is an existing email");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString(6);
  const user = {id,email,password: hashedPassword};
  users[id] = user;
  req.session.user_id = id;
  res.redirect("/urls");
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



