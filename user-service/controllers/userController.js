const userService = require("../services/userService");

function getUsers(req, res) {
  const users = userService.getAllUsers();

  res.json(users);
}

function createUser(req, res) {
  const result = userService.createUser(req.body);

  res.status(result.status).json(result);
}

function loginUser(req, res) {
  const { email, password } = req.body;

  const result = userService.login(email, password);

  res.status(result.status).json(result);
}

function deleteUser(req, res) {
  const id = Number(req.params.id);

  const result = userService.deleteUser(id);

  res.status(result.status).json(result);
}

module.exports = {
  getUsers,
  createUser,
  loginUser,
  deleteUser
};