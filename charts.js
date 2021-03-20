
var loadedData = {};

function init() {
    // Grab a reference to the dropdown select element
    const selector = d3.select("#selDataset");

    // Use the list of sample names to populate the select options
    d3.json("samples.json").then(function (data) {
        console.log(data);
        loadedData = data;
        data.names.forEach(row => {
            selector
                .append("option")
                .property("value", row)
                .text(row);
        })
        // Use the first sample from the list to build the initial plots
        buildMetadata(data.names[0]);
        buildCharts(data.names[0]);

        d3.selectAll(".tabcontent").nodes().forEach((tab) => tab.style.display = tab.id === 'bar' ? 'block' : 'none');
        d3.select(".tablinks").classed("active", true);
    });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected
    buildMetadata(newSample);
    buildCharts(newSample);
}

// Demographics Panel 
function buildMetadata(selectedValue) {

    // Use d3 to select the panel with id of `#sample-metadata`
    const PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Filter the data for the object with the desired sample number
    const resultArray = loadedData.metadata.filter(row => row.id == selectedValue);
    if (resultArray.length > 0) {
        const resultObject = resultArray[0];

        // Add each key and value pair to the panel
        for (object in resultObject) {
            var h5 = PANEL.append("h5");
            h5.append("span")
                .text(object.toUpperCase() + ": ");
            h5.append("span").text(resultObject[object]).style("font-weight", "bold");
        }
    }
}

// Create a function to build the charts
function buildCharts(selectedValue) {
    let chartDimensions = {
        width: 820,
        height: 600
    }

    const sampleArray = loadedData.samples.filter(row => row.id == selectedValue);
    if (sampleArray.length > 0) {
        const resultSample = sampleArray[0];

        otu_idsArray = resultSample.otu_ids;
        otu_labelsArray = resultSample.otu_labels;
        sample_valuesArray = resultSample.sample_values;

        //Create the yticks for the bar chart.
        var yticks = otu_idsArray.slice(0, 10).reverse().map(item => "OTU " + item);

        //Create the Bar Chart
        var barData = [{
            x: sample_valuesArray.slice(0, 10).reverse(),
            y: yticks,
            text: otu_labelsArray.slice(0, 10).reverse(),
            type: "bar",
            orientation: 'h'
        }];

        var barLayout = {
            ...chartDimensions,
            title: 'Top 10 Bacteria Cultures Found'
        };

        Plotly.newPlot("bar", barData, barLayout, { responsive: true });

        // Create the Bubble Chart
        var bubbleData = [{
            x: otu_idsArray,
            y: sample_valuesArray,
            hovertext: otu_labelsArray,
            mode: 'markers',
            marker: {
                size: sample_valuesArray,
                color: otu_idsArray,
                colorscale: 'Earth'
            }
        }];

        var bubbleLayout = {
            ...chartDimensions,
            title: 'Bacteria Cultures Per Sample',
            hovermode: 'closest',
            xaxis: {
                title: {
                    text: 'OTU ID'
                }
            },
            margin: {
                t: 50,
                b: 50
            }
        };

        Plotly.newPlot("bubble", bubbleData, bubbleLayout, { responsive: true });
    }

    // Create a Gauge Chart
    const washingArray = loadedData.metadata.filter(row => row.id == selectedValue);
    if (washingArray.length > 0) {
        const washFrequency = washingArray[0].wfreq;

        var gaugeData = [{
            value: washFrequency,
            title: { text: "Scrubs Per Week" },
            type: "indicator",
            mode: "gauge+number",
            gauge: {
                axis: { range: [0, 10], majorTicks: [0, 2, 4, 6, 8, 10] },
                bar: { color: "black" },
                steps: [
                    { range: [0, 2], color: "red" },
                    { range: [2, 4], color: "orange" },
                    { range: [4, 6], color: "yellow" },
                    { range: [6, 8], color: "yellowgreen" },
                    { range: [8, 10], color: "green" }
                ]
            }
        }]

        var gaugeLayout = {
            ...chartDimensions,
            title: "<b>Belly Button Washing Frequency</b>"
        }

        Plotly.newPlot("gauge", gaugeData, gaugeLayout, { responsive: true });

    }
}

function openChart(event, chart) {
    var i, tabcontent, tablinks;
    tabcontent = d3.selectAll(".tabcontent").nodes();
    tabcontent.forEach((tab) => tab.style.display = tab.id === chart ? 'block' : 'none');
    tablinks = d3.selectAll(".tablinks").classed("active", false);
    d3.select(event.currentTarget).classed("active", true);
}
