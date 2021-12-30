

const getIdByEmail = function(email, users) {
  const keys = Object.keys(users);
  for (const id of keys) {
    if (users[id]['email'] === email) {
      return id;
    }
  }
};

const generateRandomString = function(n) {
  let randomString           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < n; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

const urlsForUser = function(id,urlDatabase) {
  console.log('db', urlDatabase)
  const keys = Object.keys(urlDatabase);
  let keyobj = {};
  for (const key of keys) {
    if (urlDatabase[key]['userID'] === id) {
      keyobj[key] = urlDatabase[key];
    }
  }
  return keyobj;
};

module.exports = { getIdByEmail,generateRandomString,urlsForUser };