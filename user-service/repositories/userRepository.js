const users = require("../data/usersData");

function findAllUsers() {
  return users;
}

function findUserByEmailAndPassword(email, password) {
  return users.find(user => user.email === email && user.password === password);
}

function createUser(userData) {
  const newUser = {
    id: users.length + 1,
    name: userData.name,
    email: userData.email,
    password: userData.password
  };

  users.push(newUser);

  return newUser;
}

function deleteUserById(id) {
  const index = users.findIndex(user => user.id === id);

  if (index === -1) {
    return false;
  }

  users.splice(index, 1);
  return true;
}

module.exports = {
  findAllUsers,
  findUserByEmailAndPassword,
  createUser,
  deleteUserById
};