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

    result.forEach((sample) => {
      // staphylococcusName
      if (sample.sensitivity.staphylococcusName === bacteria) {
        sample.sensitivity.staphylococcusPanel.forEach((atb) => {
          !atb_data[atb.antib] && (atb_data[atb.antib] = {});
          if (atb.sensitivity === "S") {
            atb_data[atb.antib].sus ? atb_data[atb.antib].sus++ : (atb_data[atb.antib].sus = 1);
          }
          atb_data[atb.antib].total ? atb_data[atb.antib].total++ : (atb_data[atb.antib].total = 1);
        });
      }
      // streptococcusName
      if (sample.sensitivity.streptococcusName === bacteria) {
        sample.sensitivity.streptococcusPanel.forEach((atb) => {
          !atb_data[atb.antib] && (atb_data[atb.antib] = {});
          if (atb.sensitivity === "S") {
            atb_data[atb.antib].sus ? atb_data[atb.antib].sus++ : (atb_data[atb.antib].sus = 1);
          }
          atb_data[atb.antib].total ? atb_data[atb.antib].total++ : (atb_data[atb.antib].total = 1);
        });
      }
      // gramPositiveName
      if (sample.sensitivity.gramPositiveName === bacteria) {
        sample.sensitivity.gramPositivePanel.forEach((atb) => {
          !atb_data[atb.antib] && (atb_data[atb.antib] = {});
          if (atb.sensitivity === "S") {
            atb_data[atb.antib].sus ? atb_data[atb.antib].sus++ : (atb_data[atb.antib].sus = 1);
          }
          atb_data[atb.antib].total ? atb_data[atb.antib].total++ : (atb_data[atb.antib].total = 1);
        });
      }
      // pseudomonasName
      if (sample.sensitivity.pseudomonasName === bacteria) {
        sample.sensitivity.pseudomonasPanel.forEach((atb) => {
          !atb_data[atb.antib] && (atb_data[atb.antib] = {});
          if (atb.sensitivity === "S") {
            atb_data[atb.antib].sus ? atb_data[atb.antib].sus++ : (atb_data[atb.antib].sus = 1);
          }
          atb_data[atb.antib].total ? atb_data[atb.antib].total++ : (atb_data[atb.antib].total = 1);
        });
      }
    });

    return res.json(atb_data);
  });
};

exports.yearlyAntibiogram = async (req, res) => {
  const bacteria = req.body.bacteria;
  let years = [];

  for (let i = req.body.startYear; i <= req.body.endYear; i++) {
    let startYear = new Date(i + "-1-1");
    let endYear = new Date(i + 1 + "-1-1");
    years.push([startYear, endYear]);
  }

  async function calcYearData() {
    let calculate = new Promise(function (myResolve, myReject) {
      myResolve("I love You !!");
    });
  }
};
