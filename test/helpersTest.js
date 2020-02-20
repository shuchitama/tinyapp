const { assert } = require('chai');

const {
  emailLookup,
  emailExists,
  passwordCorrect,
  userIDLookup,
  urlsForUser,
  deleteShortURL
} = require('../helpers.js');

const testUsers = {
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
};

describe('emailLookup', function () {
  it('should return the email address of the user with the given user ID', function () {
    const user = emailLookup("userRandomID", testUsers)
    const expectedOutput = "user@example.com";
    assert.equal(user, expectedOutput);
  });
  it('should return undefined if there is no user with the given user ID', function () {
    const user = emailLookup("user3RandomID", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});


describe('emailExists', function () {
  it('should return true if it finds a user with the given email', function () {
    const user = emailExists("user@example.com", testUsers)
    const expectedOutput = true;
    assert.equal(user, expectedOutput);
  });
  it('should return false if it does not find a user with the given email', function () {
    const user = emailExists("someone@example.com", testUsers)
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});