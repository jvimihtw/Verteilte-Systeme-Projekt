const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "password_123";

function removePassword(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

async function getAllUsers() {
  const users = await userRepository.findAllUsers();

  return users.map(removePassword);
}

async function createUser(userData) {
  if (!userData.name || !userData.email || !userData.password) {
    return {
      error: true,
      status: 400,
      message: "Name, email and password are required"
    };
  }

  const userExists = await userRepository.findUserByEmail(userData.email);
  if (userExists) {
    return {
      error: true,
      status: 400,
        message: "The email address is already registered to another account."
    };
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const newUser = await userRepository.createUser({
    ...userData,
    password: hashedPassword
  });
  return {
    error: false,
    status: 201,
    message: "User created successfully",
    user: removePassword(newUser)
  };
}

async function login(email, password) {
  if (!email || !password) {
    return {
      error: true,
      status: 400,
      message: "Email and password are required"
    };
  }

  const foundUser = await userRepository.findUserByEmail(email);
  if (!foundUser) {
    return {
      error: true,
      status: 404,
      message: "Account does not exist"
    };
  }

  const isPasswordValid = await bcrypt.compare(password, foundUser.password);
  if (!isPasswordValid) {
    return {
      error: true,
      status: 401,
      message: "Invalid email or password"
    };
  }

  const token = jwt.sign(
    { id: foundUser.id, email: foundUser.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    error: false,
    status: 200,
    message: "Login successful",
    token: token,
    user: removePassword(foundUser)
  };
}

async function deleteUser(id) {
  const wasDeleted = await userRepository.deleteUserById(id);

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