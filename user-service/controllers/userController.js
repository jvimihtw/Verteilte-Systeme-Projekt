const userService = require("../services/userService");

async function getUsers(req, res) {
  const users = userService.getAllUsers();

  res.json(users);
}

async function createUser(req, res) {
  const result = await userService.createUser(req.body);

  res.status(result.status).json(result);
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  const result = await userService.login(email, password);

  res.status(result.status).json(result);
}

async function deleteUser(req, res) {
  const id = Number(req.params.id);

  const result = await userService.deleteUser(id);

  res.status(result.status).json(result);
}

module.exports = {
  getUsers,
  createUser,
  loginUser,
  deleteUser
};