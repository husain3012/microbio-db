const express = require("express");
const router = express.Router();
const { addNew, getAll, getPanel } = require("../controllers/antibiotics.controllers");

router.post("/antibiotic/create", addNew);
router.get("/antibiotic/getAll", getAll);
router.get("/antibiotic/getPanel/:panel", getPanel);

module.exports = router;
