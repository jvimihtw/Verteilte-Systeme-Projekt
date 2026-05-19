const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/users", userController.getUsers);
router.post("/users", userController.createUser);
router.post("/login", userController.loginUser);
router.delete("/users/:id", userController.deleteUser);

module.exports = router;