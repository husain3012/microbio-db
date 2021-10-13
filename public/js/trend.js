const data = {
  labels: [],
  datasets: [],
};

var ctx = document.getElementById("trend-chart").getContext("2d");
var trendChart = new Chart(ctx, {
  type: "line",
  data: data,
});

$("#trend-analysis-form").on("submit", function (e) {
  e.preventDefault();
  $(`#loader`).addClass("active");

  let bacteria = $(this).find("input[name=bacteria]").val().trim();
  let startYear = $(this).find("input[name=startYear]").val().trim();
  let endYear = $(this).find("input[name=endYear]").val().trim();
  let panel = $(this).find("select[name=panel]").val().trim();
  startYear = parseInt(startYear);
  endYear = parseInt(endYear);
  let years = [];
  for (let i = startYear; i <= endYear; i++) {
    years.push(i.toString());
  }
  endYear++;
  let datasets = [];
  var fetchData = new Promise((resolve, reject) => {
    axios.get("/api/antibiotic/getPanel/" + panel).then((atbs_panel) => {
      axios.post("/api/antibiogram/trend_analysis", { startYear, endYear, bacteria }).then((res) => {
        $(`#loader`).removeClass("active");
        atbs_panel.data.data.forEach((atb) => {
          let atb_data = [];
          for (let i = startYear; i < endYear; i++) {
            if (res.data[i][atb.name] && res.data[i][atb.name].total) {
              atb_data.push((res.data[i][atb.name].sus / res.data[i][atb.name].total) * 100);
            } else {
              if (i == startYear) {
                atb_data.push(0);
              } else {
                atb_data.push(atb_data[atb_data.length - 1]);
              }
            }
          }
          datasets.push({
            label: atb.name,
            data: atb_data,
            fill: false,
            borderColor: randomRGBA(1),
            tension: 0.1,
          });
        });
        addChartData(trendChart, years, datasets);
        resolve();
      });
    });
  });
  fetchData.then(() => {
    trendChart.update();
  });
});

function addChartData(chart, labels, datasets) {
  chart.data.labels = labels;
  chart.data.datasets = datasets;
}

function randomRGBA(opacity = 1) {
  return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${opacity})`;
}
