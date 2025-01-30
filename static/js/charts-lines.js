/**
 * For usage, visit Chart.js docs https://www.chartjs.org/docs/latest/
 */
const lineConfig = {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Solicitudes por mes',
        backgroundColor: '#0694a2',
        borderColor: '#0694a2',
        data: [],
        fill: false,
      },
    ],
  },
  options: {
    responsive: true,
    legend: {
      display: false,
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
    scales: {
      x: {
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Mes',
        },
      },
      y: {
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Cantidad de Solicitudes',
        },
      },
    },
  },
}

// Función para contar las solicitudes por mes
function countRequestsByMonth(data) {
  let counts = {};
  let months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
    "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  Object.values(data).forEach(entry => {
    if (entry.saved) {
      let dateParts = entry.saved.split(',')[0].trim().split('/'); // Extraer la fecha
      let monthIndex = parseInt(dateParts[1], 10) - 1; // Convertir a índice del mes
      let monthName = months[monthIndex];

      counts[monthName] = (counts[monthName] || 0) + 1;
    }
  });

  return {
    labels: Object.keys(counts),
    counts: Object.values(counts),
  };
}

// Fetch data y actualizar el gráfico
function updateLineChart() {
  fetch('/api/v1/landing')
    .then(response => response.json())
    .then(data => {
      let { labels, counts } = countRequestsByMonth(data);

      console.log("Labels recibidos:", labels);
      console.log("Counts recibidos:", counts);

      // Actualizar el gráfico
      window.myLine.data.labels = labels;
      window.myLine.data.datasets[0].data = counts;
      window.myLine.update();
    })
    .catch(error => console.error('Error:', error));
}

// Crear el gráfico de líneas
const lineCtx = document.getElementById('line');
window.myLine = new Chart(lineCtx, lineConfig);

// Llamar a la función de actualización
updateLineChart();
