const express = require('express');
const app = express();
const PORT = 8080;
const cookies = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookies({
  name: 'session',
  keys: ["nasdylksdfkaf"]
}));

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" },
  "idFhed": { longURL: "http://www.example.com", userID: "user2RandomID" },
  "GvswhG": { longURL: "https://www.youtube.com", userID: "userRandomID" },
  "O7QJXg": { longURL: "https://www.wikipedia.org", userID: "user2RandomID" },
  "0fhTa2": { longURL: "https://9gag.com", userID: "user2RandomID" },
  "yHq36q": { longURL: "https://developer.mozilla.org/en-US", userID: "user2RandomID" }
};

let users = {}
// let users = {
//   "userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur"
//   },
//   "user2RandomID": {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk"
//   }
// }
// ----------------functions --------------------//
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

const emailLookup = function (userID, users) {
  for (const user in users) {
    if (user === userID) {
      return users[user]['email'];
    }
  }
};

const urlsForUser = function (user_ID) {
  let filteredDatabase = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key]['userID'] === user_ID) {
      filteredDatabase[key] = urlDatabase[key];
    }
  }
  return filteredDatabase;
};
//---------------------------------------------------------//

// Display all short and long URLs in a table with EDIT and DELETE options
// Only if a user is logged in, and only with the shortURL the user created
app.get("/urls", (req, res) => {
  let templateVars = {
    user_ID: req.session.user_ID,
    urls: urlsForUser(req.session.user_ID, urlDatabase),
    email: emailLookup(req.session.user_ID, users)
  };
  if (req.session.user_ID) {
    res.render("urls_index", templateVars);
  } else {
    res.render("please_log_in", templateVars);
  }
});

// Display page that allows creation of new short URL if logged in
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
  shortURL = generateRandomString();
  longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, 'userID': req.session.user_ID };
  res.redirect(`/urls/${shortURL}`);
});

// Displays page that shows short and long URL, with an Edit field
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    user_ID: req.session.user_ID,
    email: emailLookup(req.session.user_ID, users)
  };
  if (req.session.user_ID) {
    res.render("urls_show", templateVars);
  } else {
    res.render("please_log_in", templateVars);
  }
});

// Redirect to long URL by clicking on the short URL
app.get(`/u/:shortURL`, (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

// Delete a short URL
app.post("/urls/:shortURL/delete", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    user_ID: req.session.user_ID,
    email: emailLookup(req.session.user_ID, users)
  };
  if (req.session.user_ID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.render("please_log_in", templateVars)
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
  // let userID = req.session.user_ID;
  // let userEmail = emailLookup(userID, users)
  let templateVars = { user_ID: req.session.user_ID, email: emailLookup(req.session.user_ID, users) };
  res.render("login", templateVars);
})

// login form
app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 400;
    res.send("Please fill in both email and password to log in.");
  } else {
    if (!emailExists(req.body.email, users)) {
      res.statusCode = 403;
      res.send("Email address not registered.");
    } else {
      if (emailExists(req.body.email, users) &&
        !passwordCorrect(req.body.email, req.body.password, users)) {
        res.statusCode = 403;
        console.log(users)
        res.send("Incorrect password! Please try again.");
      } else {
        if (emailExists(req.body.email, users) &&
          passwordCorrect(req.body.email, req.body.password, users)) {
          req.session.user_ID = userIDLookup(req.body.email, users);
          res.redirect("/urls")
        }
      }
    }
  }
});

// logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Registration page
app.get("/register", (req, res) => {
  let templateVars = { user_ID: req.session.user_ID, email: emailLookup(req.session.user_ID, users) };
  res.render("registration", templateVars);
})

// Handle new registations
app.post("/register", (req, res) => {
  if (emailExists(req.body.email, users)) {
    res.statusCode = 400;
    res.send("Email already exists!")
  } else {
    if (req.body.email === "" || req.body.password === "") {
      res.statusCode = 400;
      res.send("Please fill in both email and password to log in.")
    } else {
      const randomID = generateRandomString();
      users[randomID] = { id: randomID, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
      req.session.user_ID = randomID;
      res.redirect("/urls")
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

