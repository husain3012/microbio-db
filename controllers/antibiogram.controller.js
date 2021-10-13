const Sample = require("../models/sample.model");
const axios = require("axios");

exports.bacteriaAntibiogram = async (req, res) => {
  const today = new Date();
  const past = new Date();
  past.setMonth(today.getMonth() - 3);

  let startDate = past.toISOString();
  let endDate = today.toISOString();
  if (req.body.startDate && req.body.endDate) {
    startDate = new Date(req.body.startDate);
    endDate = new Date(req.body.endDate);
  }
  let bacteria = req.body.bacteria;

  Sample.find({ createdAt: { $gte: startDate, $lte: endDate } }).exec((err, result) => {
    let atb_data = {};
    if (result.length > 0) {
      result.forEach((sample) => {
        calculateAntibiogram(sample, bacteria, atb_data);
      });
    }

    return res.json(atb_data);
  });
};

exports.trendAnalysis = async (req, res) => {
  let startYear = new Date(req.body.startYear + "-01-01");
  let endYear = new Date(req.body.endYear + "-01-01");
  console.log(startYear.toLocaleString());
  let bacteria = req.body.bacteria;

  let years = [];
  for (let i = req.body.startYear; i <= req.body.endYear; i++) {
    years.push(i);
  }
  Sample.find({ createdAt: { $gte: startYear, $lte: endYear } }).exec((err, result) => {
    let atb_data = {};
    if (result.length > 0) {
      years.forEach((year) => {
        atb_data[year] = {};
        result.forEach((sample) => {
          if (sample.createdAt.getFullYear() === year) {
            calculateAntibiogram(sample, bacteria, atb_data[year]);
          }
        });
      });
    }

    return res.json(atb_data);
  });
};

const calculateAntibiogram = (sample, bacteria, atb_data) => {
  // staphylococcusName
  if (sample.sensitivity && sample.sensitivity.staphylococcusName === bacteria) {
    sample.sensitivity.staphylococcusPanel.forEach((atb) => {
      !atb_data[atb.antib] && (atb_data[atb.antib] = {});
      if (atb.sensitivity === "S") {
        atb_data[atb.antib].sus ? atb_data[atb.antib].sus++ : (atb_data[atb.antib].sus = 1);
      }
      atb_data[atb.antib].total ? atb_data[atb.antib].total++ : (atb_data[atb.antib].total = 1);
    });
  }
  // streptococcusName
  if (sample.sensitivity && sample.sensitivity.streptococcusName === bacteria) {
    sample.sensitivity.streptococcusPanel.forEach((atb) => {
      !atb_data[atb.antib] && (atb_data[atb.antib] = {});
      if (atb.sensitivity === "S") {
        atb_data[atb.antib].sus ? atb_data[atb.antib].sus++ : (atb_data[atb.antib].sus = 1);
      }
      atb_data[atb.antib].total ? atb_data[atb.antib].total++ : (atb_data[atb.antib].total = 1);
    });
  }
  // gramPositiveName
  if (sample.sensitivity && sample.sensitivity.gramPositiveName === bacteria) {
    sample.sensitivity.gramPositivePanel.forEach((atb) => {
      !atb_data[atb.antib] && (atb_data[atb.antib] = {});
      if (atb.sensitivity === "S") {
        atb_data[atb.antib].sus ? atb_data[atb.antib].sus++ : (atb_data[atb.antib].sus = 1);
      }
      atb_data[atb.antib].total ? atb_data[atb.antib].total++ : (atb_data[atb.antib].total = 1);
    });
  }
  // pseudomonasName
  if (sample.sensitivity && sample.sensitivity.pseudomonasName === bacteria) {
    sample.sensitivity.pseudomonasPanel.forEach((atb) => {
      !atb_data[atb.antib] && (atb_data[atb.antib] = {});
      if (atb.sensitivity === "S") {
        atb_data[atb.antib].sus ? atb_data[atb.antib].sus++ : (atb_data[atb.antib].sus = 1);
      }
      atb_data[atb.antib].total ? atb_data[atb.antib].total++ : (atb_data[atb.antib].total = 1);
    });
  }
};
