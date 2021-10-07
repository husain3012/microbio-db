var xmlhttp = new XMLHttpRequest();
var url = "http://localhost:3000/api/antibiogram/bacteria?bacteria=Staphylococcus";
xmlhttp.open("GET", url, true);
xmlhttp.send();
xmlhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.readyState == 200) {
        var data = JSON.parse(this.responeText);
        // console.log(data);
        var bacteria = data.atb_data.map(function(elem) {
            return elem.antib;
        });
        var sus = data.atb_data.map(function(elem) {
            return elem.sensitivity;
        });



        var ctx = document.getElementById('canvas').getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: bacteria,
                datasets: [{
                    label: 'susceptiblity',
                    data: sus,
                    backgroundColor: 'transparent',
                    borderColor: 'red',
                    borderWidth: 4
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}
