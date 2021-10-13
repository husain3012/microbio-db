const express = require("express");
const path = require("path");
const axios = require("axios");
const mongoose = require("mongoose");
const app = express();
const sampleRoute = require("./routes/sample.routes");
const antibioticRoutes = require("./routes/antibiotics.routes");
const antibiogram = require("./routes/antibiogram.routes");
var LocalStorage = require("node-localstorage").LocalStorage;
var localStorage = new LocalStorage("./sessionData");
const morgan = require("morgan");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// process.env.DATABASE

mongoose
  .connect(process.env.DATABASE="mongodb+srv://admin-husain:sony9ofclubs@cluster0.ouw0w.mongodb.net/jnmc?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("DB connected"))
  .catch((err) => {
    console.log(err);
  });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("combined"));

const serverRoot = "http://localhost:" + (process.env.PORT || "3000");

app.get("/", (req, res) => {
  axios.get(serverRoot + "/api/sample/getByDate").then((response) => {
    if (response.status) {
      res.render("index", { records: response.data.data });
    }
  });
});

app.post("/", (req, res) => {
  let endDate = new Date();
  let startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);
  if (req.body.startDate != "") {
    startDate = new Date(req.body.startDate);
  }
  if (req.body.endDate != "") {
    endDate = new Date(req.body.endDate);
  }
  axios.get(serverRoot + "/api/sample/getByDate?startDate=" + startDate.toISOString() + "&endDate=" + endDate.toISOString()).then((response) => {
    if (response.status) {
      res.render("index", { records: response.data.data });
    }
  });
});

app.get("/add_new_entry", (req, res) => {
  res.render("newentry");
});

app.post("/add_new_entry", (req, res) => {
  axios.post(serverRoot + "/api/sample/create", req.body).then((response) => {
    if (response.status) {
      console.log(response.data);
      res.redirect("/update_progress/" + response.data.data.sample_id);
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});


app.get("/update_progress/:sample_id", (req, res) => {
  console.log(req.params);
  let sample_id = req.params.sample_id;
  axios.get(serverRoot + "/api/sample/get/" + sample_id).then((response) => {
    axios.get(serverRoot + "/api/antibiotic/getAll").then((antibioticResponse) => {
      const staphylococcus = antibioticResponse.data.data.filter((antibiotic) => antibiotic.panel === "staphylococcus");
      const streptococuss = antibioticResponse.data.data.filter((antibiotic) => antibiotic.panel === "streptococuss");
      const gramNegative = antibioticResponse.data.data.filter((antibiotic) => antibiotic.panel === "gramNegative");
      const pseudomonas = antibioticResponse.data.data.filter((antibiotic) => antibiotic.panel === "pseudomonas");

      res.render("update_sample", { sample: response.data.data, staphylococcus, streptococuss, gramNegative, pseudomonas });
    });
  });
});

app.post("/update_progress/", (req, res) => {
  const data = req.body;
  console.log(data);
  axios.get(serverRoot + "/api/antibiotic/getAll").then((antibioticResponse) => {
    const staphylococcusData = antibioticResponse.data.data.filter((antibiotic) => antibiotic.panel === "staphylococcus");
    const streptococussData = antibioticResponse.data.data.filter((antibiotic) => antibiotic.panel === "streptococuss");
    const gramNegativeData = antibioticResponse.data.data.filter((antibiotic) => antibiotic.panel === "gramNegative");
    const pseudomonasData = antibioticResponse.data.data.filter((antibiotic) => antibiotic.panel === "pseudomonas");

    const staphylococcusPanel = [];
    const streptococussPanel = [];
    const gramNegativePanel = [];
    const pseudomonasPanel = [];

    staphylococcusData.forEach((antibiotic) => {
      if (req.body[antibiotic.panel + "$" + antibiotic.name]) {
        staphylococcusPanel.push({
          antib: antibiotic.name,
          sensitivity: req.body[antibiotic.panel + "$" + antibiotic.name],
        });
      }
    });
    streptococussData.forEach((antibiotic) => {
      if (req.body[antibiotic.panel + "$" + antibiotic.name]) {
        streptococussPanel.push({
          antib: antibiotic.name,
          sensitivity: req.body[antibiotic.panel + "$" + antibiotic.name],
        });
      }
    });
    gramNegativeData.forEach((antibiotic) => {
      if (req.body[antibiotic.panel + "$" + antibiotic.name]) {
        gramNegativePanel.push({
          antib: antibiotic.name,
          sensitivity: req.body[antibiotic.panel + "$" + antibiotic.name],
        });
      }
    });
    pseudomonasData.forEach((antibiotic) => {
      if (req.body[antibiotic.panel + "$" + antibiotic.name]) {
        pseudomonasPanel.push({
          antib: antibiotic.name,
          sensitivity: req.body[antibiotic.panel + "$" + antibiotic.name],
        });
      }
    });

    let sensitivity = {
      growthTime: data.growth_time,
      aerobic: data.growth_type === "aerobic",
      anaerobic: data.growth_type === "anaerobic",
      bacterialCount: data.bacterialCount,
      staphylococcusName: data.staphylococcusName,
      streptococussName: data.streptococussName,
      gramNegativeName: data.gramNegativeName,
      pseudomonasName: data.pseudomonasName,
      staphylococcusPanel,
      streptococussPanel,
      gramNegativePanel,
      pseudomonasPanel,
    };

    const formattedData = {
      sample_id: data.sample_id,
      progress: data.progress,
      remarks: data.remarks,
      sensitivity,
    };

    axios.post(serverRoot + "/api/sample/update", formattedData).then((response) => {
      if (response.status) {
        res.redirect("/");
      }
    });
  });
});

app.get("/sample_info/:sample_id", (req, res) => {
  axios.get(serverRoot + "/api/sample/get/" + req.params.sample_id).then((response) => {
    console.log(response.data);
    if (response.status) {
      res.render("sample_details", { sample: response.data.data });
    }
  });
});

app.post("/search", (req, res) => {
  let query = Object.fromEntries(Object.entries(req.body).filter(([_, v]) => v !== null && v !== ""));
  console.log(query);

  axios.post(serverRoot + "/api/sample/search", query).then((response) => {
    console.log(response.data);
    if (response.status) {
      res.render("index", { records: response.data.data });
    }
  });
});

app.get("/printReport/:sample_id", (req, res) => {
  axios.get(serverRoot + "/api/sample/get/" + req.params.sample_id).then((response) => {
    axios.get(serverRoot + "/api/antibiotic/getAll").then((antibioticResponse) => {
      const staphylococcusData = antibioticResponse.data.data.filter((antibiotic) => antibiotic.panel === "staphylococcus");
      const streptococussData = antibioticResponse.data.data.filter((antibiotic) => antibiotic.panel === "streptococuss");
      const gramNegativeData = antibioticResponse.data.data.filter((antibiotic) => antibiotic.panel === "gramNegative");
      const pseudomonasData = antibioticResponse.data.data.filter((antibiotic) => antibiotic.panel === "pseudomonas");

      axios.get(serverRoot + "/api/sample/report/" + req.params.sample_id).then((print) => {
        if (response.status) {
          console.log(print.data);
          res.render("print_report", { sample: response.data.data, staphylococcusData, streptococussData, gramNegativeData, pseudomonasData, printed: print.data.filename });
        }
      });
    });
  });
});

app.get("/printTemplate/:sample_id", (req, res) => {
  axios.get(serverRoot + "/api/sample/get/" + req.params.sample_id).then((response) => {
    axios.get(serverRoot + "/api/antibiotic/getAll").then((antibioticResponse) => {
      const staphylococcusData = antibioticResponse.data.data.filter((antibiotic) => antibiotic.panel === "staphylococcus");
      const streptococussData = antibioticResponse.data.data.filter((antibiotic) => antibiotic.panel === "streptococuss");
      const gramNegativeData = antibioticResponse.data.data.filter((antibiotic) => antibiotic.panel === "gramNegative");
      const pseudomonasData = antibioticResponse.data.data.filter((antibiotic) => antibiotic.panel === "pseudomonas");

      console.log(response.data);
      if (response.status) {
        res.render("reportTemplate", { sample: response.data.data, staphylococcusData, streptococussData, gramNegativeData, pseudomonasData });
      }
    });
  });
});

app.get("/antibiogram", (req, res) => {
  res.render("antibiogram", { antibiogram });
});

app.post("/antibiogram", (req, res) => {
  const bacteria = req.body.bacteria;

  axios.get(serverRoot + "/api/antibiogram/bacteria?bacteria=" + bacteria).then((response) => {
    if (response.status) {
      console.log(response.data);
      res.render("antibiogram", { antibiogram: response.data });
    }
  });
});

app.use("/api", sampleRoute);
app.use("/api", antibioticRoutes);
app.use("/api", antibiogram);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
// if (app.get("env") === "development") {
//   app.use(function (err, req, res, next) {
//     res.status(err.status || 500);
//     res.render("error", {
//       message: err.message,
//       error: err,
//     });
//   });
// }

// production error handler
// no stacktraces leaked to user
// app.use(function (err, req, res, next) {
//   res.status(err.status || 500);
//   res.render("error", {
//     message: err.message,
//     error: {},
//   });
// });
//   ***************************  //

const server = app.listen(3000, () => console.log(`Express server listening on port 3000`));

module.exports = app;
