var ctx = document.getElementById("myChart").getContext("2d");
var antibiogramChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Antibiotics"],
    datasets: [
      {
        label: "Bacteria",
        data: [0],

        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

$("#antibiogram-form").on("submit", function (e) {
  e.preventDefault();
  $(`#loader`).addClass("active");
  clearChart(antibiogramChart);
  $("#antibiogram-table").empty();
  let bacterias = $(this).find("input[name=bacteria]").val().split(", ");
  console.log(bacterias);

  let startDate = $(this).find("input[name=startDate]").val();
  let endDate = $(this).find("input[name=endDate]").val();
  let panel = $(this).find("select[name=panel]").val();

  startDate ? (startDate = new Date(startDate)) : null;
  endDate ? (endDate = new Date(endDate)) : null;

  var fetchData = new Promise((resolve, reject) => {
    bacterias.forEach((bacteria, index) => {
      axios.get("/api/antibiotic/getPanel/" + panel).then((atb_panel) => {
        axios.post(`/api/antibiogram/bacteria`, { bacteria, startDate, endDate }).then((response) => {
          $(`#loader`).removeClass("active");
          let data = [];
          let labels = [];

          $("#antibiogram-table").append(`<table class='m-5 d-inline' id='${bacteria}'><tr><th class='table-heading'>${bacteria}</th></tr><tr><th>Antibiotic</th><th>Susceptible</th><th>Total</th><th>Fraction</th></tr></table>`);

          atb_panel.data.data.forEach((atb) => {
            if (response.data[atb.name]) {
              $(`#${bacteria}`).append(`<tr><td>${atb.name}</td><td>${response.data[atb.name].sus || 0}</td><td>${response.data[atb.name].total}</td><td>${Math.round(response.data[atb.name].sus / response.data[atb.name].total*1000)/1000}</td></tr>`);
            }
            labels.push(atb.name);

            if (response.data[atb.name]) {
              data.push((response.data[atb.name].sus / response.data[atb.name].total) * 100);
            } else {
              data.push(0);
            }
          });

          addChartData(antibiogramChart, labels, data, bacteria, index);
          if (index === bacterias.length - 1) {
            resolve();
          }
        });
      });
    });
  });
  fetchData.then(() => {
    antibiogramChart.update();
  });
});
 function addChartData(chart, labels, data, bacteria, i) {
  chart.type = "bar";
  chart.data.labels = labels;
  chart.data.datasets[i] = {
    data: [...data],
    label: bacteria,
    backgroundColor: [randomRGBA(0.5)],
    borderColor: [randomRGBA(1)],
  };
}

function clearChart(chart) {
  chart.data.labels = [];
  chart.data.datasets = [
    {
      label: "Bacteria",
      data: [0],

      borderWidth: 1,
    },
  ];
  chart.update();
}

function randomRGBA(opacity = 1) {
  return `rgb(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 255)}, ${opacity})`;
}
