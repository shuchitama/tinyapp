const { assert } = require('chai');

const {
  emailLookup,
  emailExists,
  userIDLookup,
  urlsForUser,
  deleteShortURL
} = require('../helpers.js');

const testDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  's7kg20': { longURL: 'http://www.lighthouselabs.ca', userID: 'user2RandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'userRandomID' },
  'idFhed': { longURL: 'http://www.example.com', userID: 'user2RandomID' },
  'GvswhG': { longURL: 'https://www.youtube.com', userID: 'userRandomID' },
  'O7QJXg': { longURL: 'https://www.wikipedia.org', userID: 'user2RandomID' },
  '0fhTa2': { longURL: 'https://9gag.com', userID: 'user2RandomID' },
  'yHq36q': { longURL: 'https://developer.mozilla.org/en-US', userID: 'user2RandomID' }
}

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
    const input = emailLookup("userRandomID", testUsers)
    const expectedOutput = "user@example.com";
    assert.equal(input, expectedOutput);
  });
  it('should return undefined if there is no user with the given user ID', function () {
    const input = emailLookup("user3RandomID", testUsers)
    const expectedOutput = undefined;
    assert.equal(input, expectedOutput);
  });
});


describe('emailExists', function () {
  it('should return true if it finds a user with the given email', function () {
    const input = emailExists("user@example.com", testUsers)
    const expectedOutput = true;
    assert.equal(input, expectedOutput);
  });
  it('should return false if it does not find a user with the given email', function () {
    const input = emailExists("someone@example.com", testUsers)
    const expectedOutput = false;
    assert.equal(input, expectedOutput);
  });
});

describe('userIDLookup', function () {
  it('should return the user ID of the user with the given email address', function () {
    const input = userIDLookup("user2@example.com", testUsers)
    const expectedOutput = 'user2RandomID';
    assert.equal(input, expectedOutput);
  });
  it('should return undefined if there is no user with the given email address', function () {
    const input = userIDLookup("someone@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(input, expectedOutput);
  });
});

describe('urlsForUser', function () {
  it('should return a filtered database containing only the given user\'s shortURLs', function () {
    const input = urlsForUser('userRandomID', testDatabase)
    const expectedOutput = {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
      '9sm5xK': { longURL: 'http://www.google.com', userID: 'userRandomID' },
      'GvswhG': { longURL: 'https://www.youtube.com', userID: 'userRandomID' }
    };
    assert.deepEqual(input, expectedOutput);
  });
  it('should return a filtered database containing only the given user\'s shortURLs', function () {
    const input = urlsForUser('user2RandomID', testDatabase)
    const expectedOutput = {
      's7kg20': { longURL: 'http://www.lighthouselabs.ca', userID: 'user2RandomID' },
      'idFhed': { longURL: 'http://www.example.com', userID: 'user2RandomID' },
      'O7QJXg': { longURL: 'https://www.wikipedia.org', userID: 'user2RandomID' },
      '0fhTa2': { longURL: 'https://9gag.com', userID: 'user2RandomID' },
      'yHq36q': { longURL: 'https://developer.mozilla.org/en-US', userID: 'user2RandomID' }
    };
    assert.deepEqual(input, expectedOutput);
  });
  it('should return an empty object if no user with the given user ID was found', function () {
    const input = urlsForUser('user3RandomID', testDatabase)
    const expectedOutput = {};
    assert.deepEqual(input, expectedOutput);
  });
});