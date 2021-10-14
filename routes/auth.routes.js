const express = require("express");
const router = express.Router();
const { login, signup } = require("../controllers/auth.controllers");

router.post("/auth/login", login);
router.post("/auth/signup", signup);
// router.get("/auth/signout", signout);

module.exports = router;
