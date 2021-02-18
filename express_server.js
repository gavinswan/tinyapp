const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
//tells express app to use EJS ar its templating engine
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
    const hashedPassword = users[key].password;
    if (bcrypt.compareSync(password, hashedPassword) && users[key].email === email) {
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
//compare the userID from database with the logged-in user's ID, then only show the URLS if matched
function urlsForUser(id) {
  let urls = {}
  for (const key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      urls[key] = urlDatabase[key]
    }
  }
  return urls;
}
// #REGISTER NEW USER
app.get("/register", (req, res) => {
  const userID = req.cookies.user_id;
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
    newUserObj = {
      id,
      email,
      password: bcrypt.hashSync(password, 10)
    }
    // console.log(newUserObj);
    users[id] = newUserObj
    res.cookie("user_id", id);
    res.redirect("/urls")
  }
});
// #LOGIN
app.get("/login", (req, res) => {
  const userID = req.cookies.user_id;
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
    res.status(403).send("403 Email or password are incorrect");
  }
  else if (!emailMatchesPass(email, password)) {
    res.status(403).send("403 Email or password are incorrect");
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
  const userID = req.cookies.user_id;
  const data = urlsForUser(userID);
  const templateVars = { 
      user: users[userID],
      urls: data
  }
      // longURL: req.body.longURL,
      // shortURL: req.body.shortURL,
  //res.render passes url data to our template (urls_index)
  //express knows to look inside a views directory for template file with extension .ejs, thus we don't need to add a path to file
  res.render("urls_index", templateVars);
});
// #CREATE NEW URLS
app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const longURL = req.body.longURL;
  const shortURL = req.body.shortURL
  if (!userID) {
    res.redirect("/login")
  } else {
    const templateVars = { 
      user,
      longURL,
      shortURL
    };
    res.render("urls_new", templateVars);
  }
});
//pushes form submission data & newly created short url into our database object
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL : req.body.longURL, userID: req.cookies.user_id};
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});
//creates a page for newly created shortURL
app.get("/urls/:shortURL", (req, res) => {
  const longURL = req.params.longURL;
  const shortURL = req.params.shortURL
  const userID = req.cookies.user_id;
  const user = users[userID]
  const templateVars = { 
    user,
    longURL,
    shortURL
  }
  res.render("urls_show", templateVars);
})
//redirects users to longURL when they click on link in above page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const templateVars = {
    userID: req.cookies.user_id,
  };
  res.redirect(longURL);
  res.render("urls_show", templateVars);
});
// #UPDATE URLS
app.post("/urls/:shortURL", (req, res) => {
  //shortURL stays the same, so we obtain it from the params key in object
  const shortURL = req.params.shortURL;
  //longURL is a new one, so we obtain it from the body key in our object
  const longURL = req.body.longURL;
  const userID = req.cookies.user_id;
  if (!userID) {
    res.status(401).send("401 Must be logged in");
  } else {
  //create new key/value pair
  urlDatabase[shortURL] = {longURL: longURL, userID: userID };
  res.redirect(`/urls/${shortURL}`);
  }
});
// #DELETE URLS
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies.user_id;
  if (!userID) {
    res.status(401).send("401 Must be logged in");
  } else {
  //js delete operator removes property (longURL) from object
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
  }
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
//worked on code with Gavin Swan (edited