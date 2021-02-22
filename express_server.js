const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;
const { emailExists, generateRandomString, emailMatchesPass, findUserID, showUserUrls } = require('./helpers')


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "superDuperCoolCookies",
  keys: ["key1", "key2"]
}));

//tells express to use EJS as its templating engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ481W" },
  "9sn5xK": { longURL: "http://www.google.com", userID: "aJ481W" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "$2b$10$SrDVvVdcXWomzpQYU/g6q.zz2ld3FTNn/UXe1bvJz7v7ktPdzK6MS"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "$2b$10$2N1IAzGm7eNmCyfjFkvPZuqzS2nh6mTVlMWOtZwYbSHXetKttOBCi"
  }
}


// #REGISTER NEW USER
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    user: users[userID]
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // neither email nor password exit in database
  if (!email || !password) {
    res.status(400).send("400 Email and password fields cannot be empty");
  } 
  if (emailExists(email, users)) {
    res.status(400).send("400 This email is already registered");
  } else {
    let id = generateRandomString();
    newUserObj = {
      id,
      email,
      password: bcrypt.hashSync(password, 10)
    }
    users[id] = newUserObj;
    req.session.user_id = id;
    res.redirect("/urls")
  }
});

// #LOGIN
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    user: users[userID]
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send("400 Email and password fields cannot be empty");
  }
  if (!emailExists(email, users) || !emailMatchesPass(email, password, users)) {
    res.status(403).send("403 Email or password are incorrect");
    //if email exits & password is correct
  } else {
    const id = findUserID(email, password, users);
    req.session.user_id = id;
    res.redirect("/urls");  
  } 
});


// #HOMEPAGE
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const data = showUserUrls(userID, urlDatabase);
  const templateVars = { 
      user: users[userID],
      urls: data
  }
  //res.render passes url data to our template (urls_index)
  //express knows to look inside a views directory for template file with extension .ejs, thus we don't need to add a path to file
  res.render("urls_index", templateVars);
});

// redirect away from "/"
app.get("/", (req, res) => {
  const userID = req.session.user_id;
  
  if (userID) {
    res.redirect("/urls");
    return;
  } 
  res.redirect("/login");
});


// #CREATE NEW URLS
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    res.redirect("/login")
  } else {
    const templateVars = { 
      user: users[userID],
      longURL: req.body.longURL,
      shortURL: req.body.shortURL
    };
    res.render("urls_new", templateVars);
  }
});

//pushes form submission data & newly created short url into our database object
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL : req.body.longURL, 
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});


// #TINY URLS INDIVIDUAL PAGES
//creates a page for newly created shortURL
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const templateVars = { 
    user: users[userID],
    longURL: urlDatabase[req.params.shortURL].longURL,
    shortURL: req.params.shortURL
  }
  //if not logged in:
  if (!userID) {
    return res.status(401).send("Must be logged in to view this resource");
  } 
  //if logged in & own URL:
  if (Object.keys(showUserUrls(userID, urlDatabase)).includes(req.params.shortURL)) {
    urlDatabase[shortURL] = {longURL: longURL, userID: userID };
    res.render("urls_show", templateVars);
    // return;
  } 
  //if logged but don't own URL
  else {
    return res.status(403).send("This page does not belong to you");
  }
})

//redirects users to longURL when they click on link in above page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  //DO WE NEED TO DELETE OR KEEP THIS SECTION??
  // const templateVars = {
  //   userID: req.session.user_id,
  // };
  res.redirect(longURL);
  // res.render("urls_show", templateVars);
});


// #UPDATE URL PAGES
app.post("/urls/:shortURL", (req, res) => {
  //shortURL stays the same: obtain it from the params key
  const shortURL = req.params.shortURL;
  //longURL is entered by user: obtain it from the body key
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  if (!userID) {
    res.status(401).send("401 Must be logged in");
  } if (Object.keys(showUserUrls(userID, urlDatabase)).includes(req.params.shortURL)) {
    urlDatabase[shortURL] = {longURL: longURL, userID: userID };
    res.redirect("/urls");
  } else {
    res.status(403).send("403 This url does not belong to you");
  }
});


// #DELETE URL PAGES
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.status(401).send("401 Must be logged in");
    return;
  } 
  if (Object.keys(showUserUrls(userID, urlDatabase)).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
    return;
  } else if (Object.keys(showUserUrls(userID, urlDatabase)).includes(req.params.shortURL)){
    res.status(403).send("403 This url does not belong to you");
  }
});


// #LOGOUT
app.post("/logout", (req, res) => {
  // cookie is cleared upon logout
  req.session = null;
  res.redirect("/urls");  
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});

//worked on code with Samantha Knoop