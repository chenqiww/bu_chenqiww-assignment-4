document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();

    let query = document.getElementById('query').value;
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    // Clear existing chart if any
    let chartCanvas = document.getElementById('similarity-chart');
    chartCanvas.getContext('2d').clearRect(0, 0, chartCanvas.width, chartCanvas.height);

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'query': query
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        displayResults(data);
        displayChart(data);
    });
});

let chart;  // Define chart variable globally

function displayResults(data) {
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>Results</h2>';
    for (let i = 0; i < data.documents.length; i++) {
        let docDiv = document.createElement('div');
        let similarity = parseFloat(data.similarities[i]).toFixed(4);
        docDiv.innerHTML = `<strong>Document ${data.indices[i]}</strong><p>${data.documents[i]}</p><br><strong>Similarity: ${similarity}</strong>`;
        resultsDiv.appendChild(docDiv);
    }
}

function displayChart(data) {
    // Get the canvas element
    let ctx = document.getElementById('similarity-chart').getContext('2d');

    // Destroy existing chart if exists
    if (chart) {
        chart.destroy();
    }

    // Prepare data for the chart
    let labels = data.indices.map(index => `Doc ${index}`);
    let similarities = data.similarities.map(similarity => parseFloat(similarity).toFixed(4));

    // Create the bar chart
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cosine Similarity',
                data: similarities,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',  // Blue bars
                borderColor: 'rgba(54, 162, 235, 1)',  // Blue borders
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1
                }
            }
        }
    });
}
