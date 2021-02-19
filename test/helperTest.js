const { assert } = require('chai');
const bcrypt = require('bcryptjs');
const { emailExists, emailMatchesPass, findUserID, showUserUrls } = require('../helpers.js');
const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    // hPassword: "purple-monkey-dinosaur",
    password: "$2b$10$sZ28SFv6HLp.N5vntKfbsuyuqHoArZyc69Qb8oqZd4YcKjfnPYEPq"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    // hPassword: "dishwasher-funk",
    password: "$2b$10$P4t9g2w4zd0CN4mVL4N.Z.h/wPbNp5siWAGstyRZijsULXrO.9WEq"
  }
};
const testUrlDB = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sn5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};
describe('emailExists', function() {
  it('should return true if the entered email matches one in user database', function() {
    const actualOutput = emailExists("user@example.com", testUsers)
    const expectedOutput = true;
    assert.strictEqual(actualOutput, expectedOutput)
  });
});
describe('emailExists', function() {
  it("should return false if the entered email doesn't match one in user database", function() {
    const actualOutput = emailExists("user@fake.com", testUsers)
    const expectedOutput = false;
    assert.strictEqual(actualOutput, expectedOutput)
  });
});
describe('hashedPassTest', function() {
  it("should return true if the given password matches the hashed one", function() {
    const actualOutput = emailMatchesPass("user@example.com", "purple-monkey-dinosaur", testUsers)
    const expectedOutput = true;
    assert.strictEqual(actualOutput, expectedOutput)
  });
});
describe('hashedPassTest', function() {
  it("should return false if the given password doesn't match the hashed one", function() {
    const actualOutput = emailMatchesPass("user@example.com", "urple-monkey-dinosaur", testUsers)
    const expectedOutput = false;
    assert.strictEqual(actualOutput, expectedOutput)
  });
});
describe('hashedPassTest', function() {
  it("should return false if the given email doesn't match database one", function() {
    const actualOutput = emailMatchesPass("user@fake.com", "purple-monkey-dinosaur", testUsers)
    const expectedOutput = false;
    assert.strictEqual(actualOutput, expectedOutput)
  });
});
describe('hashedPassTest', function() {
  it("should return false if the given email and password are wrong", function() {
    const actualOutput = emailMatchesPass("user@fake.com", "urple-monkey-dinosaur", testUsers)
    const expectedOutput = false;
    assert.strictEqual(actualOutput, expectedOutput)
  });
});
describe('findUserID', function() {
  it("should return the user ID if the given email and password are correct", function() {
    const actualOutput = findUserID("user@example.com", "purple-monkey-dinosaur", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(actualOutput, expectedOutput)
  });
});
describe('findUserID', function() {
  it("should return false if the given email and password are incorrect", function() {
    const actualOutput = findUserID("user@fake.com", "urple-monkey-dinosaur", testUsers);
    const expectedOutput = false;
    assert.strictEqual(actualOutput, expectedOutput)
  });
});
describe('findUserID', function() {
  it("should return false if the given email is right but the password is incorrect", function() {
    const actualOutput = findUserID("user@example.com", "urple-monkey-dinosaur", testUsers);
    const expectedOutput = false;
    assert.strictEqual(actualOutput, expectedOutput)
  });
});
describe('findUserID', function() {
  it("should return false if the given email is right but the password is incorrect", function() {
    const actualOutput = findUserID("user@fake.com", "purple-monkey-dinosaur", testUsers);
    const expectedOutput = false;
    assert.strictEqual(actualOutput, expectedOutput)
  });
});
describe('showUserUrls', function() {
  it("should return a url if the given ID matches the one in the database", function() {
    const actualOutput = showUserUrls("userRandomID", testUrlDB);
    const expectedOutput = {"b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" }}
    assert.deepEqual(actualOutput, expectedOutput)
  });
});
describe('showUserUrls', function() {
  it("should return false if the given ID does not match the one in the database", function() {
    const actualOutput = showUserUrls("user6RandomID", testUrlDB);
    const expectedOutput = {};
    assert.deepEqual(actualOutput, expectedOutput)
  });
});