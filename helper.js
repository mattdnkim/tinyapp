const getIdByEmail = function(email) {
  const keys = Object.keys(users);
  for (const id of keys) {
    if (users[id]["email"] === email) {
      return id;
    }
  }
};


module.exports = {getIdByEmail};