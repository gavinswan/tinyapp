const bcrypt = require('bcryptjs');
// this function checks whether the given email matches on in our database
const generateRandomString = function() {
  const str = Math.random().toString(36).substring(7);
  return str;
}
const emailExists = function(email, database) {
  for (const key in database) {
    if (database[key].email === email) {
      return true;
    }
  }
  return false;
}
const emailMatchesPass = function(email, password, users) {
  for (const key in users) {
    const hashedPassword = users[key].password;
    if (bcrypt.compareSync(password, hashedPassword) && users[key].email === email) {
      return true;
    }
  }
  return false;
}
const findID = function(email, password, users) {
  for (const key in users) {
    if (users[key].password === password && users[key].email === email) {
      return key;
    }
  }
  return false;
}
//compare the userID from database with the logged-in user's ID, then only show the URLS if matched
const showUserUrls = function(id, urlDatabase) {
  let urls = {}
  for (const key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      urls[key] = urlDatabase[key]
    }
  }
  return urls;
}
module.exports = {
  generateRandomString,
  emailExists,
  emailMatchesPass,
  findID,
  showUserUrls,
}