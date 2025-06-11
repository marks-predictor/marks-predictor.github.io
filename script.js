async function predictGMR() {
  const marks = parseFloat(document.getElementById('marks').value);
  const output = document.getElementById('output');
  output.innerHTML = '';

  if (isNaN(marks) || marks < 0 || marks > 200) {
    output.innerHTML = '<p style="color: red;">Enter valid marks between 0 and 200.</p>';
    return;
  }

  const response = await fetch('data/gmr_data.json');
  const allData = await response.json();

  const years = ['2024', '2023', '2022'];

  years.forEach(year => {
    const yearData = allData[year];
    const block = document.createElement('div');
    block.classList.add('year-block');
    block.innerHTML = `<h3>${year}</h3>`;

    // Find matches in ±2 range
    const closeMatches = yearData.filter(d => Math.abs(d.marks - marks) <= 2);

    if (closeMatches.length > 0) {
      closeMatches.sort((a, b) => a.marks - b.marks);
      block.innerHTML += '<ul>' + closeMatches.map(d => `<li>Marks: ${d.marks} → GMR: ${d.gmr}</li>`).join('') + '</ul>';
    } else {
      // Fallback: use interpolation from nearest marks
      const sorted = [...yearData].sort((a, b) => a.marks - b.marks);
      let lower = null, upper = null;

      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].marks < marks) lower = sorted[i];
        if (sorted[i].marks > marks) {
          upper = sorted[i];
          break;
        }
      }

      if (lower && upper) {
        const min = Math.min(lower.gmr, upper.gmr);
        const max = Math.max(lower.gmr, upper.gmr);
        block.innerHTML += `<p>Estimated GMR Range: <span class='range'>${min} – ${max}</span><br>
        Based on marks ${lower.marks} (GMR: ${lower.gmr}) and ${upper.marks} (GMR: ${upper.gmr})</p>`;
      } else {
        block.innerHTML += `<p>No data available for prediction.</p>`;
      }
    }

    output.appendChild(block);
  });
}
