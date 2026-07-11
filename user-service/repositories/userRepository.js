const pool = require("../db");

async function findAllUsers() {
  const result = await pool.query(
    "SELECT id, name, email FROM users ORDER BY id"
  );

  return result.rows;
}

async function findUserByEmail(email) {
  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  return result.rows[0];
}

async function createUser(userData) {
  const result = await pool.query(
    `INSERT INTO users(name,email,password)
     VALUES($1,$2,$3)
     RETURNING id,name,email,password`,
    [userData.name, userData.email, userData.password]
  );

  return result.rows[0];
}

async function deleteUserById(id) {
  const result = await pool.query(
    "DELETE FROM users WHERE id=$1",
    [id]
  );

  return result.rowCount > 0;
}

module.exports = {
  findAllUsers,
  findUserByEmail,
  createUser,
  deleteUserById
};