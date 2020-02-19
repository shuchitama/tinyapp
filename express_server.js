const express = require('express');
const app = express();
const PORT = 8080;
const cookies = require('cookie-parser');
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookies());


function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "idFhed": "http://www.example.com",
  "GvswhG": "https://www.youtube.com",
  "O7QJXg": "https://www.wikipedia.org",
  "0fhTa2": "https://9gag.com",
  "yHq36q": "https://developer.mozilla.org/en-US"
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

// Display all short and long URLs in a table with EDIT and DELETE options
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

// Display page that allows creation of new short URL
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

// creates a new short URL and redirects to page showing short and long URL
app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Displays page that shows short and long URL, with an Edit field
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

// Redirect to long URL by clicking on the short URL
app.get(`/u/:shortURL`, (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Delete a short URL
app.post("/urls/:shortURL/delete", (req, res) => {
  let key = req.params.shortURL
  delete urlDatabase[key];
  res.redirect("/urls");
});

// Pressing the "EDIT" button on index page -> redirects to edit page
app.post("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

// Submitting edited URL, redirect to index page with new long url
app.post("/urls/:shortURL/edit", (req, res) => {
  let key = req.params.shortURL;
  urlDatabase[key] = req.body.edit;
  res.redirect("/urls");
});

// login
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// Registration page
app.get("/register", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("registration", templateVars);
})

// Handle new registations
app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  users[randomID] = { id: randomID, email: req.body.email, password: req.body.password };
  res.cookie("username", randomID);
  console.log(users);
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

