const User = require("../models/auth.model");

const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

exports.signup = (req, res) => {
  let newUser = new User(req.body);
  newUser.save((err, user) => {
    if (err) {
      return res.status(400).json({
        status: false,
        error: "Username is taken",
      });
    }
    res.json({
      status: true,
      user,
    });
  });
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  // check if user exist
  User.findOne({ username }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        status: false,
        error: "User does not exist.",
      });
    }
    // authenticate
    if (user.password !== password) {
      return res.status(400).json({
        status: false,
        error: "Username and password do not match.",
      });
    }
    // generate a token and send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.json({
      status: true,
      token,
      user,
    });
  });
};

// exports.signout = (req, res) => {
//   res.clearCookie("token");
//   res.redirect("/login");
// };
