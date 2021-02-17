const express = require("express");
const app = express();
const PORT = 8080; //default port
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
}

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));
//set the view engine to ejs
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//route path
app.get("/", (req, res) => {
  res.send("Hello!");
});

//showing how html can be included in .js but not ideal
app.get("/hello", (req, res) => { 
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//res.render sends a view to the user...looks in the views dir for the views
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

//add another page to display a single url and it's shortened form
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const username = req.cookies["username"]
  const templateVars = {
    shortURL, 
    longURL,
    username
  };
  res.render("urls_show", templateVars);
});


app.get("/urls/:id", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const formattedUrl = longURL.includes("http") ? longURL : `http://${longURL}`;
  res.redirect(formattedUrl);
});

// create new url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});


//handle a delete request via POST method
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//add POST route that updates a URL resource
app.post("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect(`/urls/${shortURL}`);
  });

// handle a post to /login - set a cookie named username - redirect back to /urls
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

  app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});