const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// console.log(generateRandomString());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
//tells express app to use EJS ar its templating engine
app.set("view engine", "ejs");
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sn5xK": "http://www.google.com"
};
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
function generateRandomString() {
  const str = Math.random().toString(36).substring(7);
  return str;
}
function emailExists (email) {
  for (const key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
}
function emailMatchesPass (email, password) {
  for (const key in users) {
    if (users[key].password === password && users[key].email === email) {
      return true;
    }
  }
  return false;
}
function findID (email, password) {
  for (const key in users) {
    if (users[key].password === password && users[key].email === email) {
      return key;
    }
  }
  return false;
}
// #REGISTER NEW USER
app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID]
  };
  res.render("register", templateVars);
});
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("400 Email and password fields cannot be empty");
  } 
  if (emailExists(email)) {
    res.status(400).send("400 This email is already registered");
  } else {
    let id = generateRandomString();
    users[id] = {
      id,
      email,
      password
    }
    res.cookie("user_id", id);
    res.redirect("/urls")
  }
});
// #LOGIN
app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID]
  };
  res.render("login", templateVars);
});
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("400 Email and password fields cannot be empty");
  }
  else if (!emailExists(email)) {
    res.status(403).send("403 This email was not found in our records");
  }
  else if (!emailMatchesPass(email, password)) {
    res.status(403).send("403 Email address match password");
  } 
  else {
    const id = findID(email, password);
    //if email exits & password is correct
    res.cookie("user_id", id);
    res.redirect("/urls");  
  } 
});
// #HOMEPAGE
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { 
    user: users[userID],
    urls: urlDatabase
  };
  //res.render passes url data to our template (urls_index)
  //express knows to look inside a views directory for template file with extension .ejs, thus we don't need to add a path to file
  res.render("urls_index", templateVars);
});

// #NEW URLS
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { 
    user: users[userID]
  };
  res.render("urls_new", templateVars);
});
//creates a page for newly created shortURL
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { 
    user: users[userID]
  }
  res.render("urls_show", templateVars);
})
//redirects users to longURL when they click on link in above page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = {
    userID: req.cookies["user_id"],
  };
  res.redirect(longURL);
  res.render("urls_show", templateVars);
});
//pushes form submission data & newly created short url into our database object
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  //creates new key/value pair
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});
// #UPDATE URLS
app.post("/urls/:shortURL", (req, res) => {
  //shortURL stays the same, so we obtain it from the params key in object
  const shortURL = req.params.shortURL;
  //longURL is a new one, so we obtain it from the body key in our object
  const longURL = req.body.longURL;
  //creates new key/value pair
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});
// #DELETE URLS
//handle a delete request via POST method
app.post("/urls/:shortURL/delete", (req, res) => {
  //js delete operator removes property (longURL) from object
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
// #LOGOUT
app.post("/logout", (req, res) => {
  // don't need second variable in res.clearCookie because we don't need username to show on page
  res.clearCookie("user_id");
  res.redirect("/urls");  
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});
//worked on code with Samantha Knoop