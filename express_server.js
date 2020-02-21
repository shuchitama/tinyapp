const express = require('express');
const app = express();
const PORT = 8080;
const cookies = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const
  { emailLookup,
    generateRandomString,
    emailExists,
    passwordCorrect,
    userIDLookup,
    urlsForUser,
    deleteShortURL } = require('./helpers');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookies({
  name: 'session',
  keys: ["nasdylksdfkaf"]
}));

const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'eNH4Ui' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'eNH4Ui' },
  'idFhed': { longURL: 'http://www.example.com', userID: 'YwEdhe' },
  'GvswhG': { longURL: 'https://www.youtube.com', userID: 'eNH4Ui' },
  'O7QJXg': { longURL: 'https://www.wikipedia.org', userID: 'YwEdhe' },
  '0fhTa2': { longURL: 'https://9gag.com', userID: 'YwEdhe' },
  'yHq36q': { longURL: 'https://developer.mozilla.org/en-US', userID: 'YwEdhe' }
};

let users = {
  YwEdhe: {
    id: 'YwEdhe',
    email: 'user2@example.com',
    password: '$2b$10$xbJR6rB1Yycjv2bfwLuv5u4lcDGWdQ8W1wvZnRUo8ylNPMhTuva7e'
  },

  eNH4Ui: {
    id: 'eNH4Ui',
    email: 'user@example.com',
    password: '$2b$10$1.z2AV0HP5QBDu8a5LnBgOjg9Blw7Ia4BIOARzWDF.GhACooi77XO'
  }
};

// Redirect to /url if a user is signed in, otherwise ask client to login or register
app.get("/", (req, res) => {
  let templateVars = {
    user_ID: req.session.user_ID,
    urls: urlsForUser(req.session.user_ID, urlDatabase),
    email: emailLookup(req.session.user_ID, users),
    msg: "plsLogIn"
  };
  if (req.session.user_ID) {
    res.render("urls_index", templateVars);
  } else {
    res.render("errorMsgs", templateVars);
  }
});

// Display all short and long URLs in a table with EDIT and DELETE options
// Only if a user is logged in, and only with the shortURL the user created
app.get("/urls", (req, res) => {
  let templateVars = {
    user_ID: req.session.user_ID,
    urls: urlsForUser(req.session.user_ID, urlDatabase),
    email: emailLookup(req.session.user_ID, users),
    msg: "plsLogIn"
  };
  if (req.session.user_ID) {
    res.render("urls_index", templateVars);
  } else {
    res.render("errorMsgs", templateVars);
  }
});

// Displays page that allows creation of new short URL if logged in
app.get("/urls/new", (req, res) => {
  let templateVars = { user_ID: req.session.user_ID, email: emailLookup(req.session.user_ID, users) };
  if (templateVars.user_ID) {
    res.render("urls_new", templateVars);
  } else {
    res.render("login", templateVars);
  }
});

// creates a new short URL and redirects to page showing short and long URL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, 'userID': req.session.user_ID };
  res.redirect(`/urls/${shortURL}`);
});

// Displays page that shows short and long URL, with an Edit field
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    user_ID: req.session.user_ID,
    email: emailLookup(req.session.user_ID, users),
  };
  if (!req.session.user_ID) {
    templateVars['msg'] = "plsLogIn";
    res.render("errorMsgs", templateVars);
    return;
  }
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    templateVars['msg'] = "noShortURL";
    res.render("errorMsgs", templateVars);
    return;
  }
  if (urlDatabase[req.params.shortURL]['userID'] === req.session.user_ID) {
    templateVars['longURL'] = urlDatabase[req.params.shortURL]['longURL']
    res.render("urls_show", templateVars);
  } else {
    templateVars['msg'] = "notYourURL";
    res.render("errorMsgs", templateVars);
    return;
  }
});

// Redirect to long URL by clicking on the short URL
app.get(`/u/:shortURL`, (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    user_ID: req.session.user_ID,
    email: emailLookup(req.session.user_ID, users),
    msg: "noShortURL"
  };
  if (Object.keys(urlDatabase).includes(req.params.shortURL)) {
    const longURL = urlDatabase[req.params.shortURL]['longURL'];
    res.redirect(longURL);
  } else {
    res.render("errorMsgs", templateVars);
  }
});

// Delete a short URL
app.post("/urls/:shortURL/delete", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    user_ID: req.session.user_ID,
    email: emailLookup(req.session.user_ID, users),
    msg: "noShortURL"
  };
  if (req.session.user_ID) {
    deleteShortURL(req.session.user_ID, req.params.shortURL, urlDatabase);
    res.redirect("/urls");
  } else {
    res.render("errorMsgs", templateVars);
  }
});

// Pressing the "EDIT" button on index page -> redirects to edit page
app.post("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    user_ID: req.session.user_ID,
    email: emailLookup(req.session.user_ID, users)
  };
  res.render("urls_show", templateVars);
});

// Submitting edited URL, redirect to index page with new long url
app.post("/urls/:shortURL/edit", (req, res) => {
  let key = req.params.shortURL;
  urlDatabase[key] = { longURL: req.body.edit, userID: req.session.user_ID };
  res.redirect("/urls");
});

// login page
app.get("/login", (req, res) => {
  if (req.session.user_ID) {
    res.redirect("/urls");
  } else {
    let templateVars = { user_ID: req.session.user_ID, email: emailLookup(req.session.user_ID, users) };
    res.render("login", templateVars);
  }
});

// login form
app.post("/login", (req, res) => {
  let templateVars = {
    user_ID: req.session.user_ID,
  };
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 400;
    templateVars['msg'] = "fillAllFields"
    res.render("errorMsgs", templateVars);
    return;
  }
  if (!emailExists(req.body.email, users)) {
    res.statusCode = 403;
    templateVars['msg'] = "noSuchEmail"
    res.render("errorMsgs", templateVars);
    return
  }
  if (emailExists(req.body.email, users) &&
    !passwordCorrect(req.body.email, req.body.password, users)) {
    res.statusCode = 403;
    templateVars['msg'] = "wrongPassword"
    res.render("errorMsgs", templateVars);
    res.send("Incorrect password! Please try again.");
    return;
  }
  if (emailExists(req.body.email, users) &&
    passwordCorrect(req.body.email, req.body.password, users)) {
    req.session.user_ID = userIDLookup(req.body.email, users);
    res.redirect("/urls");
    return;
  }
});

// logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Registration page
app.get("/register", (req, res) => {
  if (req.session.user_ID) {
    res.redirect("/urls");
  } else {
    let templateVars = { user_ID: req.session.user_ID, email: emailLookup(req.session.user_ID, users) };
    res.render("registration", templateVars);
  }
});

// Handle new registations
app.post("/register", (req, res) => {
  let templateVars = {
    user_ID: req.session.user_ID,
    email: emailLookup(req.session.user_ID, users),
  };
  if (emailExists(req.body.email, users)) {
    res.statusCode = 400;
    templateVars['msg'] = "emailExists"
    res.render("errorMsgs", templateVars);
    return;
  }
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 400;
    templateVars['msg'] = "fillAllFields"
    res.render("errorMsgs", templateVars);
    return;
  } else {
    const randomID = generateRandomString();
    users[randomID] = { id: randomID, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
    req.session.user_ID = randomID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

