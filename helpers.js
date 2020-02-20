const bcrypt = require('bcrypt');

const emailLookup = function (userID, users) {
  for (const user in users) {
    if (user === userID) {
      return users[user]['email'];
    }
  }
};

const generateRandomString = function () {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const emailExists = function (email, users) {
  for (const user in users) {
    if (users[user]['email'] === email) {
      return true;
    }
  }
  return false;
};

const passwordCorrect = function (email, password, users) {
  for (const user in users) {
    if (users[user]['email'] === email &&
      bcrypt.compareSync(password, users[user]['password'])) {
      return true;
    }
  }
  return false;
}

const userIDLookup = function (email, users) {
  for (const user in users) {
    if (users[user]['email'] === email) {
      return user;
    }
  }
};

const urlsForUser = function (user_ID, urlDatabase) {
  let filteredDatabase = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key]['userID'] === user_ID) {
      filteredDatabase[key] = urlDatabase[key];
    }
  }
  return filteredDatabase;
};

const deleteShortURL = function (user_ID, shortURL, urlDatabase) {
  for (const key in urlDatabase) {
    if (urlDatabase[key]['userID'] === user_ID &&
      key === shortURL) {
      delete urlDatabase[key];
    }
  }
}

module.exports = {
  emailLookup,
  generateRandomString,
  emailExists,
  passwordCorrect,
  userIDLookup,
  urlsForUser,
  deleteShortURL
};