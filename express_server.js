const express = require("express");
const app = express();
const PORT = 8080; //default port
const bodyParser = require("body-parser");
const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
}

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//add another page to display a single url and it's shortened form
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL]};
  res.render("urls_show", templateVars);
});


app.get("/urls/:id", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
const longURL = urlDatabase[req.params.shortURL];
res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});