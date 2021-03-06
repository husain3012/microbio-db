const Sample = require("../models/sample.model");
var LocalStorage = require("node-localstorage").LocalStorage;
var localStorage = new LocalStorage("./sessionData");
const axios = require("axios");
const { dialog } = require("electron");
const phantomjs = require('phantomjs-prebuilt')
const pdf = require("html-pdf");

exports.createSample = async (req, res) => {
  let level = parseInt(localStorage.getItem("level"));
  if (level > 0) {
    return res.status(401).json({
      message: "Unauthorized!",
    });
  }
  const sample = new Sample({
    sample_id: req.body.sampleId,
    patientName: req.body.patientName,
    age: req.body.age,
    sex: req.body.sex,
    cadsNumber: req.body.cadsNumber,
    specimen: req.body.specimen,
    sampleDate: req.body.specimenDate,
    department: req.body.department,
    physician: req.body.physician,
    diagnosis: req.body.diagnosis,
    examRequired: req.body.examRequired,
  });
  sample.save((err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    } else {
      return res.json({
        status: true,
        message: "New entry created!",
        data: result,
      });
    }
  });
};

exports.updateSample = async (req, res) => {
  const sample_id = req.body.sample_id;
  delete req.body.sample_id;
  Sample.findOneAndUpdate({ sample_id: sample_id }, { $set: { ...req.body } }, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (data) {
      return res.json({
        status: true,
        message: "Sample updated!",
        data: data,
      });
    }
  });
};

exports.getSample = async (req, res) => {
  console.log(req.params);
  Sample.findOne({ sample_id: req.params.sampleId }, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    } else if (!result) {
      return res.status(404).json({
        message: "Sample not found!",
      });
    } else {
      return res.json({
        status: true,
        message: "Sample found!",
        data: result,
      });
    }
  });
};

exports.getByDate = async (req, res) => {
  const today = new Date();
  const past = new Date();
  past.setMonth(today.getMonth() - 3);

  let startDate = past.toISOString();
  let endDate = today.toISOString();
  if (req.query.startDate && req.query.endDate) {
    startDate = new Date(req.query.startDate);
    endDate = new Date(req.query.endDate);
  }

  Sample.find({ createdAt: { $gte: startDate, $lte: endDate } })
    .limit(req.query.limit || 1000)
    .sort({ createdAt: -1 })
    .exec((err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
      return res.json({
        status: true,
        message: result.length + " records retrieved!",
        data: result,
      });
    });
};

exports.generateReport = async (req, res) => {
  Sample.findOne({ sample_id: req.params.sampleId }, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (!result) {
      return res.status(404).json({
        message: "Sample not found!",
      });
    } else {
      dialog.showOpenDialog({ properties: ["openFile", "openDirectory"] }).then((result) => {
        const options = {
          phantomPath: phantomjs.path,
          width: "396mm",
          height: "280mm",
          orientation: "landscape",
        };
        axios
          .get("http://localhost:3000/printTemplate/" + req.params.sampleId)
          .then((response) => {
            pdf.create(response.data, options).toFile(result.filePaths[0] + "/" + req.params.sampleId + "_report.pdf", (err, pdfres) => {
              if (err) {
                console.log(err);
              }
              res.status(200).send(pdfres);
            });
          })
          .catch((error) => {
            res.send(error);
          });
      });
    }
  });
};

exports.findSample = async (req, res) => {
  console.log("-----------------------------------------------------\n", req.body);
  console.log("-----------------------------------------------------\n");
  let searchFields = {};
  // Validate name
  if (req.body.patientName) {
    let patientName = new RegExp(req.body.patientName, "i");
    searchFields = { ...searchFields, patientName: patientName };
  }
  // Validate ID
  if (req.body.sample_id) {
    searchFields = { ...searchFields, sample_id: req.body.sample_id };
  }
  // Validate sex
  if (req.body.sex) {
    searchFields = { ...searchFields, sex: req.body.sex };
  }
  // Validate age
  if (req.body.ageFrom) {
    let ageFrom, ageTo;
    ageFrom = req.body.ageFrom;
    // If ageTo has been entered
    if (req.body.ageTo) {
      ageTo = req.body.ageTo;
      // In case the user exchanges the inputs
      if (ageFrom > ageTo) {
        ageFrom = ageTo;
        ageTo = req.body.ageFrom;
      }
      searchFields = { ...searchFields, age: { $gte: ageFrom, $lte: ageTo } };
    } else {
      // If ageTo has not been entered
      searchFields = { ...searchFields, age: ageFrom };
    }
  }
  // Validate Recieved on date
  if (req.body.specimenDateFrom) {
    let recievedFrom, recievedTo;
    recievedFrom = req.body.specimenDateFrom;
    // If recievedTo has been entered
    if (req.body.specimenDateTo) {
      recievedTo = req.body.specimenDateTo;
      // In case the user exchanges the inputs
      if (recievedFrom > recievedTo) {
        recievedFrom = recievedTo;
        recievedTo = req.body.specimenDateFrom;
      }
      searchFields = { ...searchFields, createdAt: { $gte: recievedFrom, $lte: recievedTo } };
    } else {
      // If recievedTo has not been entered
      searchFields = { ...searchFields, createdAt: { $gte: `${recievedFrom}T00:00:00.000Z`, $lte: `${recievedFrom}T23:59:59.999Z` } };
    }
  }
  // Validate Dept
  if (req.body.department) {
    searchFields = { ...searchFields, department: req.body.department };
  }
  // Validate Physician/ Surgeon
  if (req.body.physician) {
    searchFields = { ...searchFields, physician: new RegExp(req.body.physician, "i") };
  }
  // Validate Specimen
  if (req.body.specimen) {
    searchFields = { ...searchFields, specimen: req.body.specimen };
  }
  // Validate Panel
  if (req.body.panel) {
    const panel = `sensitivity.${req.body.panel}`;
    // If bacteria name was entered
    if (req.body.bacteria) {
      searchFields = { ...searchFields, [panel]: req.body.bacteria };
    } else {
      // If bacteria name was not entered
      searchFields = { ...searchFields, [panel]: { $exists: true, $ne: "" } };
    }
  }
  // Now send this data to database and perform the search
  Sample.find(searchFields)
    .limit(req.query.limit || 1000)
    .sort({ createdAt: -1 })
    .exec((err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      return res.json({
        status: true,
        message: result.length + " records retrieved!",
        data: result,
      });
    });
};

exports.randomSampleGen = async (req, res) => {
  let count = req.body.count || 1;
  let i;
  const sex = ["f", "m", "o"],
    specimen = ["puss", "blood", "urine"];
  const dept = ["Surgery", "xxxx", "yyyy"],
    sensitivityArr = ["S", "I", "R"];
  const names = ["Adrak", "Lahsun", "Doraemon", "Chota Bheem", "Raju", "Mirchi", "Doc Oct", "May Parker", "Uncle Ben"];
  let date,
    end = new Date(),
    sensitivity = {},
    staphPanel = [];
  pseudoPanel = [];
  let randomSamples = [];
  for (i = 0; i < count; i++) {
    date = new Date(Math.floor(Math.random() * end.getTime()));
    let createdDate = new Date();
    createdDate.setMonth(createdDate.getMonth() - Math.floor(Math.random() * 48));
    createdDate.setMonth(createdDate.getMonth() - Math.floor(Math.random() * 25));
    let bacterias = ["Staphylococcus", "Staphylococcus2", "Staphylococcus3"];

    sensitivity = {
      growthTime: Math.floor(Math.random() * 60),
      aerobic: true,
      anaerobic: false,
      bacterialCount: Math.floor(Math.random() * 1000),
      staphylococcusName: bacterias[Math.floor(Math.random() * bacterias.length)],
      staphylococcusPanel: staphPanel,
      streptococcussName: "",
      streptococcussPanel: [],
      gramNegativeName: "",
      gramNegativePanel: [],
      pseudomonasName: "Pseudomonas",
      pseudomonasPanel: pseudoPanel,
    };
    // This array can be automated (by loops) to consist of all the panel (by array) names if needed
    staphPanel = [
      {
        antib: "AZM",
        sensitivity: sensitivityArr[Math.floor(Math.random() * sensitivityArr.length)],
      },
      {
        antib: "CD",
        sensitivity: sensitivityArr[Math.floor(Math.random() * sensitivityArr.length)],
      },
      {
        antib: "CX",
        sensitivity: sensitivityArr[Math.floor(Math.random() * sensitivityArr.length)],
      },
      {
        antib: "AMX",
        sensitivity: sensitivityArr[Math.floor(Math.random() * sensitivityArr.length)],
      },
      {
        antib: "AMC",
        sensitivity: sensitivityArr[Math.floor(Math.random() * sensitivityArr.length)],
      },
      {
        antib: "COT",
        sensitivity: sensitivityArr[Math.floor(Math.random() * sensitivityArr.length)],
      },
      {
        antib: "Lx",
        sensitivity: sensitivityArr[Math.floor(Math.random() * sensitivityArr.length)],
      },
      {
        antib: "DOX",
        sensitivity: sensitivityArr[Math.floor(Math.random() * sensitivityArr.length)],
      },
      {
        antib: "Va",
        sensitivity: sensitivityArr[Math.floor(Math.random() * sensitivityArr.length)],
      },
    ];
    pseudoPanel = [
      {
        antib: "CAZ",
        sensitivity: sensitivityArr[Math.floor(Math.random() * sensitivityArr.length)],
      },
      {
        antib: "G",
        sensitivity: sensitivityArr[Math.floor(Math.random() * sensitivityArr.length)],
      },
      // {
      //   antib: "Tob",
      //   sensitivity: sensitivityArr[Math.floor(Math.random() * sensitivityArr.length)],
      // },
      {
        antib: "Ak",
        sensitivity: sensitivityArr[Math.floor(Math.random() * sensitivityArr.length)],
      },
      {
        antib: "Pit",
        sensitivity: sensitivityArr[Math.floor(Math.random() * sensitivityArr.length)],
      },
    ];
    const sample = {
      sample_id: new Date().getTime() + (i + 1) * (i + 1) * 10000000,
      patientName: names[Math.floor(Math.random() * names.length)],
      age: 10 + Math.floor(Math.random() * 90),
      sex: sex[Math.floor(Math.random() * sex.length)],
      // cadsNumber: req.body.cadsNumber,
      createdAt: createdDate,
      specimen: specimen[Math.floor(Math.random() * specimen.length)],
      sampleDate: date,
      department: dept[Math.floor(Math.random() * dept.length)],
      physician: names[Math.floor(Math.random() * names.length)],
      // diagnosis: req.body.diagnosis,
      examRequired: "Analysis",
      progress: "growth",
      sensitivity: sensitivity,
    };
    randomSamples.push(sample);
  }
  Sample.insertMany(randomSamples, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    return res.json({
      status: true,
      message: result.length + " records inserted!",
      data: result,
    });
  });
};
