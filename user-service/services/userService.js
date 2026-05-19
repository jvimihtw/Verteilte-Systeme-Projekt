const userRepository = require("../repositories/userRepository");

function removePassword(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

function getAllUsers() {
  const users = userRepository.findAllUsers();

  return users.map(removePassword);
}

function createUser(userData) {
  if (!userData.name || !userData.email || !userData.password) {
    return {
      error: true,
      status: 400,
      message: "Name, email and password are required"
    };
  }

  const newUser = userRepository.createUser(userData);

  return {
    error: false,
    status: 201,
    message: "User created successfully",
    user: removePassword(newUser)
  };
}

function login(email, password) {
  if (!email || !password) {
    return {
      error: true,
      status: 400,
      message: "Email and password are required"
    };
  }

  const foundUser = userRepository.findUserByEmailAndPassword(email, password);

  if (!foundUser) {
    return {
      error: true,
      status: 401,
      message: "Invalid email or password"
    };
  }

  return {
    error: false,
    status: 200,
    message: "Login successful",
    user: removePassword(foundUser)
  };
}

function deleteUser(id) {
  const wasDeleted = userRepository.deleteUserById(id);

  if (!wasDeleted) {
    return {
      error: true,
      status: 404,
      message: "User not found"
    };
  }

  return {
    error: false,
    status: 200,
    message: "User deleted successfully"
  };
}

module.exports = {
  getAllUsers,
  createUser,
  login,
  deleteUser
};