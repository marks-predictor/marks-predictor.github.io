async function predictGMR() {
  const marks = parseFloat(document.getElementById('marks').value);
  const output = document.getElementById('output');
  const chartCanvas = document.getElementById('gmrChart');
  output.innerHTML = '';
  if (window.gmrChartInstance) window.gmrChartInstance.destroy();

  if (isNaN(marks) || marks < 0 || marks > 200) {
    output.innerHTML = '<p style="color: red;">Enter valid marks between 0 and 200.</p>';
    return;
  }

  const res = await fetch('data/gmr_data.json');
  const data = await res.json();

  let predictions = [];
  let chartLabels = [];
  let chartData = [];

  for (const year of Object.keys(data)) {
    const points = data[year];
    const sorted = points.sort((a, b) => a.marks - b.marks);
    let lower = null, upper = null;

    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].marks < marks) lower = sorted[i];
      if (sorted[i].marks >= marks) {
        upper = sorted[i];
        break;
      }
    }

    let predicted;
    if (lower && upper && lower.marks !== upper.marks) {
      const slope = (upper.gmr - lower.gmr) / (upper.marks - lower.marks);
      predicted = lower.gmr + slope * (marks - lower.marks);
    } else if (lower) {
      predicted = lower.gmr;
    } else if (upper) {
      predicted = upper.gmr;
    } else {
      predicted = 'Unavailable';
    }

    if (typeof predicted === 'number') {
      predictions.push({ year, gmr: Math.round(predicted) });
      chartLabels.push(year);
      chartData.push(Math.round(predicted));
    }
  }

  if (predictions.length > 0) {
    output.innerHTML += `<h2>🔍 AI Estimated GMR:</h2><ul>`;
    predictions.forEach(p => {
      output.innerHTML += `<li><strong>${p.year}</strong>: GMR ~ <strong>${p.gmr}</strong></li>`;
    });
    output.innerHTML += '</ul>';

    window.gmrChartInstance = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'Estimated GMR',
          data: chartData,
          fill: false,
          borderColor: '#0077cc',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: false, reverse: true },
          x: { title: { display: true, text: 'Year' } }
        }
      }
    });
  } else {
    output.innerHTML = `<p>No prediction available for this mark.</p>`;
  }
}
