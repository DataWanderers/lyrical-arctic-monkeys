/**********************/
/******* d3           */
/**********************/ 

const words = Object.keys(dispersionAlbums[0]).filter(word => word !== "Album");
const albums = dispersionAlbums.map(d => d.Album);
const songs = dispersionSongs.map(d => d.Song);

const upperCount = 5;
const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, upperCount]);
const rectangle_height = height / words.length

const svg_dispersion = d3.select("#viz-dispersion")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const chartDispersion = svg_dispersion.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

function makeChartDispersionAlbums() {
    const rectangle_width = width / albums.length;

    chartDispersion.selectAll()
        .data(dispersionAlbums)
        .enter()
        .append("g")
        .selectAll("rect")
        .data(d => words.map(w => ({ album: d.Album, word: w, count: d[w] })))
        .enter()
        .append("rect")
        .attr("x", (d, i) => albums.indexOf(d.album) * rectangle_width)
        .attr("y", (d, i) => i * rectangle_height)
        .attr("width", rectangle_width)
        .attr("height", rectangle_height)
        .style("fill", d => colorScale(d.count));

    chartDispersion.selectAll()
        .data(dispersionAlbums)
        .enter()
        .append("g")
        .selectAll("text")
        .data(d => words.map(w => ({ album: d.Album, word: w, count: d[w] })))
        .enter()
        .append("text")
        .attr("class", "count")
        .text(function(d) { if (d.count > 0) return d.count; }) // show the count inside the rectangle
        .attr("x", (d, i) => albums.indexOf(d.album) * rectangle_width + rectangle_width / 2)
        .attr("y", (d, i) => i * rectangle_height + rectangle_height / 2)
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("fill", d => d.count >= upperCount ? "white" : "black");

    chartDispersion.append("g")
        .selectAll("text")
        .data(albums)
        .enter()
        .append("text")
        .attr("class", "Xaxis")
        .text(d => d)
        .attr("x", (d, i) => i * rectangle_width + rectangle_width / 2)
        .attr("y", -10)
        .style("text-anchor", "middle")
        .style("font-size", "12px");

    chartDispersion.append("g")
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .attr("class", "Yaxis")
        .text(d => d)
        .attr("x", -10)
        .attr("y", (d, i) => i * rectangle_height + rectangle_height / 2)
        .style("text-anchor", "end")
        .style("alignment-baseline", "middle");
}

const chartDispersionSongs = svg_dispersion.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

const songsPerAlbum = {};
dispersionSongs.forEach(song => {
    const album = song.Album;
    if (songsPerAlbum[album]) {
        songsPerAlbum[album] += 1;
    } else {
        songsPerAlbum[album] = 1;
    }
});

let cumulativeSongsCount = 0;
const cumulativeSongs = {};
for (const album in songsPerAlbum) {
    cumulativeSongsCount += songsPerAlbum[album];
    cumulativeSongs[album] = cumulativeSongsCount;
}

function showTooltip(d, tooltip) {
    tooltip.transition().duration(200)
    tooltip.style("opacity", 1).html(d.song + " - " + d.count + "x " + d.word.toLowerCase())
}

function makeChartDispersionSongs() {
    const rectangle_width = width / songs.length;

    var Tooltip = chartDispersionSongs.append("text")
        .attr("x", 0)
        .attr("y", height + 20)
        .style("opacity", 0)
        .style("font-size", 13)
        .style("font-weight", 600)
        
    chartDispersionSongs.selectAll()
        .data(dispersionSongs)
        .enter()
        .append("g")
        .selectAll()
        .data(d => words.map(w => ({ album: d.Album, song: d.Song, word: w, count: d[w] })))
        .enter()
        .append("rect")
        .attr("x", (d, i) => songs.indexOf(d.song) * rectangle_width)
        .attr("y", (d, i) => i * rectangle_height)
        .attr("width", rectangle_width)
        .attr("height", rectangle_height)
        .style("fill", d => colorScale(d.count))
        .on("mouseover", function(d) { showTooltip(d, Tooltip); })
        .on("mouseleave", function(d) { hideTooltip(d, Tooltip); });

    chartDispersionSongs.selectAll()
        .data(dispersionSongs)
        .enter()
        .selectAll()
        .data((d, i, data) => [{ song: d.Song, isLastSong: (i === data.length - 1) || (data[i + 1].__data__.Album !== d.Album) }] )
        .enter()
        .filter(d => {
            if (d.isLastSong && d.song !== songs[songs.length - 1]) {
              return true;
            }
            return false;
        })
        .append("line")
        .attr("x1", d => (songs.indexOf(d.song) + 1) * rectangle_width)
        .attr("x2", d => (songs.indexOf(d.song) + 1) * rectangle_width)
        .attr("y1", 0)
        .attr("y2", height)
        .style("stroke", "grey")
        .style("stroke-width", 1);     
    
    chartDispersionSongs.append("g")
        .selectAll("text")
        .data(albums)
        .enter()
        .append("text")
        .attr("class", "Xaxis")
        .text(d => d)
        .attr("x", d => cumulativeSongs[d] * rectangle_width - (songsPerAlbum[d] * rectangle_width))
        .attr("y", -10)
        .style("text-anchor", "start")
        .style("font-size", "12px");

    chartDispersionSongs.append("g")
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .attr("class", "Yaxis")
        .text(d => d)
        .attr("x", -10)
        .attr("y", (d, i) => i * rectangle_height + rectangle_height / 2)
        .style("text-anchor", "end")
        .style("alignment-baseline", "middle");
}

function zoomRowOrColumn(chart, word, album) {
    if (word != null) {
        chart.selectAll("rect, .count")
            .transition()
            .duration(500)
            .style("display", d => (d.word === word) ? "block" : "none");

        chart.selectAll(".Yaxis")
            .style("opacity", d => (d === word) ? 1.0 : 0.2);

        chart.selectAll(".Xaxis").style("opacity", 1.0);
    } else if (album != null) {
        chart.selectAll("rect, .count")
            .transition()
            .duration(500)
            .style("display", d => (d.album === album) ? "block" : "none");

        chart.selectAll(".Xaxis")
            .style("opacity", d => (d === album) ? 1.0 : 0.2);

        chart.selectAll(".Yaxis").style("opacity", 1.0);
    }
}

function resetChart(chart) {
    chart.selectAll("rect, .count")
    .transition()
    .duration(500)
    .style("display", "block");

    chart.selectAll(".Xaxis, .Yaxis").style("opacity", 1.0);
}

/**********************/
/******* scrollama    */
/**********************/

var scrolly_dispersion = main.select("#scrolly-dispersion");
var figure_dispersion = scrolly_dispersion.select("figure");
var step_dispersion = scrolly_dispersion.select("article").selectAll(".step");
var scroller_dispersion = scrollama();

// initialize charts
makeChartDispersionAlbums()
makeChartDispersionSongs()
toggleChart(chartDispersion, chartDispersionSongs)

function handleStepEnter(response) {
    console.log(response);  // response = { element, index, direction }
    let currentIndex = response.index;

    // add color to current step only
    step_dispersion.classed("is-active", function(d, i) {
        return i === currentIndex;
    });

    // update graph based on step
    switch(currentIndex) {
        case 0:
            resetChart(chartDispersion)
            break;
        case 1:
            zoomRowOrColumn(chartDispersion, "Love", null)
            break;
        case 2:
            zoomRowOrColumn(chartDispersion, "Eyes", null)           
            break;
        case 3:
            toggleChart(chartDispersion, chartDispersionSongs)

            zoomRowOrColumn(chartDispersion, null, "Suck It and See")
            break;
        case 4:
            toggleChart(chartDispersionSongs, chartDispersion)

            resetChart(chartDispersionSongs)
            break;
        case 5:
            zoomRowOrColumn(chartDispersionSongs, "Love", null)
            break;
        case 6:
            zoomRowOrColumn(chartDispersionSongs, null, "WPSIATWIN")
            break;
        case 7:
            zoomRowOrColumn(chartDispersionSongs, null, "Humbug")
            break;
        default:
            break;
    }
}

function init() {
    setupStickyfill();

    // 1. force a resize on load to ensure proper dimensions are sent to scrollama
    handleResize(scroller_dispersion, figure_dispersion, step_dispersion);

    // 2. setup the scroller passing options, this will also initialize trigger observations
    // 3. bind scrollama event handlers (this can be chained like below)
    scroller_dispersion
        .setup({
            step: "#scrolly-dispersion article .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(handleStepEnter);

    // setup resize event
    window.addEventListener("resize", handleResize);
}

// kick things off
init();