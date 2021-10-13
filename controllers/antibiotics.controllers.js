const Antibiotics = require("../models/antibiotics.model");
const axios = require("axios");
const _ = require("lodash");

exports.addNew = async (req, res) => {
  const antibiotc = new Antibiotics({
    name: req.body.name,
    panel: req.body.panel,
  });
  antibiotc.save((err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    return res.json({
      status: true,
      message: "Added Successfuly!",
      data: result,
    });
  });
};

exports.getAll = async (req, res) => {
  Antibiotics.find({}, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    return res.json({
      status: true,
      message: "Retrived Successfully!",
      data: result,
    });
  });
};

exports.getPanel = async (req, res) => {
  Antibiotics.find({ panel: _.toLower(req.params.panel) }, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    return res.json({
      status: true,
      message: "Retrived Successfully!",
      data: result,
    });
  });
};
