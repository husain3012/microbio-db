const express = require("express");
const router = express.Router();
const { bacteriaAntibiogram, trendAnalysis } = require("../controllers/antibiogram.controller");

router.post("/antibiogram/bacteria", bacteriaAntibiogram);
router.post("/antibiogram/trend_analysis", trendAnalysis);

module.exports = router;
