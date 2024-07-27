////////////////////////
///////Zero Chart///////
////////////////////////

function renderZeroChartAnnotations(d, x, y, margin) {
    d3.select(".annotation-group").remove();
    const annotations = [
        {
            note: {
                label: "The model counts gets to " + d.count + " in 2023",
                lineType: "none",
                bgPadding: {"top": 15, "left": 10, "right": 10, "bottom": 10},
                title: "The peak",
                orientation: "topBottom",
                align: "top"
            },
            type: d3.annotationCalloutCircle,
            subject: {radius: 30},
            x: x,
            y: y,
            dx: -100,
            dy: -10
        },
    ];
    const makeAnnotations = d3.annotation().annotations(annotations);
    const chart = d3.select("svg")
    
    chart.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "annotation-group")
        
        .call(makeAnnotations).transition().delay(3500)
}

async function renderZeroChart() {
    const margin = {top: 50, right: 50, bottom: 50, left: 50},
        width = 1000 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;
    const data = await d3.csv("https:///KilluJ.github.io/Data/c1.csv");
    const svg = d3.select("#c-0")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    // Add X axis to measure time
    const x = d3.scaleLinear()
        .domain([1997,2024])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));
    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 63000])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format("d")));
    
    
    const line = svg
        .append('g')
        .append("path")
        //.attr("id", "line-" + entities[0])
        .datum(data)
        .attr("d", d3.line()
            .x(function (d) {
                return x(Number(d.year))
            })
            .y(function (d) {
                return y(Number(d.count))
            })
        )
        .attr("stroke", "green")
        .style("stroke-width", 4)
        .style("fill", "none");
    const length = line.node().getTotalLength(); // Get line length  
    line.attr("stroke-dasharray", length + " " + length)
    .attr("stroke-dashoffset", length)
    .transition()
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0)
    .delay(1000)
    .duration(3000)

    const peak = data[data.length - 1]
    renderZeroChartAnnotations(peak, x(Number(peak.year)), y(Number(peak.count)), margin);
}







/////////////////////////////
///// First Chart ///////////
/////////////////////////////

function fTooltipHTML(object) {
    return "<div>" + object.county + ":</div><div>$" + object.count + " models in total</div>";
}


async function render1Chart() {
    const margin = {top: 50, right: 50, bottom: 50, left: 50},
        width = 1000 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    const data = await d3.csv("https:///KilluJ.github.io/Data/c2.csv");

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.county))
        .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());
    
    const fontSize = 22;

    // Create the pie layout and arc generator.
    const pie = d3.pie()
        .sort(null)
        .value(d => d.count);

    const arc = d3.arc()
        .innerRadius(180)
        .outerRadius(Math.min(width, height) / 2 - 1);

    const labelRadius = arc.outerRadius()() * 0.8;

    // A separate arc generator for labels.
    const arcLabel = d3.arc()
        .innerRadius(labelRadius)
        .outerRadius(labelRadius);

    const arcs = pie(data);

    const svg = d3.select("#c-1").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    // -1- Create a tooltip div that is hidden by default:
    const tooltip = d3.select("#c-1")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10")
        .style("color", "white")
        .style("width", "150px")
        .style("height", "50px")

    svg.append("g")
        .attr("stroke", "white")
        .selectAll()
        .data(arcs)
        .join("path")
        .attr("fill", d => color(d.data.county))
        .attr("d", arc)
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                 .duration('50')
                 .attr('opacity', '.75');
       })
       .on('mouseout', function (d, i) {
            d3.select(this).transition()
                 .duration('50')
                 .attr('opacity', '1');
       })
        .append("title")
        .text(d => `${d.data.county}: ${d.data.count.toLocaleString("en-US")}`)
        ;

    svg.append("g")
        .attr("text-anchor", "middle")
        .selectAll()
        .data(arcs)
        .join("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.15).append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .attr("font-size", 20)
            .attr("fill", "white")
            .text(d => d.data.county))
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.15).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .attr("font-size", 20)
            .attr("fill", "white")
            .text(d => d.data.count.toLocaleString("en-US")));

}

async function render11Chart() {
    const margin = {top: 50, right: 50, bottom: 50, left: 50},
        width = 1000 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    const data = await d3.csv("https:///KilluJ.github.io/Data/make.csv");

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.make))
        .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());

    // Create the pie layout and arc generator.
    const pie = d3.pie()
        .sort(null)
        .value(d => d.count);

    const arc = d3.arc()
        .innerRadius(180)
        .outerRadius(Math.min(width, height) / 2 - 1);

    const labelRadius = arc.outerRadius()() * 0.8;

    // A separate arc generator for labels.
    const arcLabel = d3.arc()
        .innerRadius(labelRadius)
        .outerRadius(labelRadius);

    const arcs = pie(data);

    const svg = d3.select("#c-11").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    svg.append("g")
        .attr("stroke", "white")
        .selectAll()
        .data(arcs)
        .join("path")
        .attr("fill", d => color(d.data.make))
        .attr("d", arc)
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                 .duration('50')
                 .attr('opacity', '.75');
       })
       .on('mouseout', function (d, i) {
            d3.select(this).transition()
                 .duration('50')
                 .attr('opacity', '1');
       })
        .append("title")
        .text(d => `${d.data.make}: ${d.data.count.toLocaleString("en-US")}`);

    svg.append("g")
        .attr("text-anchor", "middle")
        .selectAll()
        .data(arcs)
        .join("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.15).append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .attr("font-size", 20)
            .attr("fill", "white")
            .text(d => d.data.make))
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.15).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .attr("font-size", 20)
            .attr("fill", "white")
            .text(d => d.data.count.toLocaleString("en-US")));

}
async function ndslide() {
    render1Chart();
    render11Chart();
}






/////////////////////////////
///// Second Chart ///////////
/////////////////////////////

function getYears() {
    return ['2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011']
}

function getMakeKeys() {
    return ["BMW","CHEVROLET","FORD","KIA","NISSAN","TESLA","TOYOTA"];
}

function renderLegend(svg, makeKeys, width, myColor) {
    // Add one dot in the legend for each name.
    svg.selectAll("legend-dots")
        .data(makeKeys)
        .enter()
        .append("circle")
        .attr("cx", width - 100)
        .attr("cy", function (d, i) {
            return 50 + i * 25
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 4)
        .style("fill", function (d) {
            return myColor(d)
        })

    svg.selectAll("legend-labels")
        .data(makeKeys)
        .enter()
        .append("text")
        .attr("x", width + 8 - 100)
        .attr("y", function (d, i) {
            return 50 + i * 25
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (d) {
            return myColor(d)
        })
        .text(function (d) {
            return d
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
}


async function render22Chart() {
    // set the dimensions and margins of the graph
    this.margin = {top: 50, right: 50, bottom: 50, left: 50};
    this.width = 1000 - margin.left - margin.right;
    this.height = 800 - margin.top - margin.bottom;

    const data = await d3.csv("https:///KilluJ.github.io/Data/c3.csv");

    // append the svg object to the body of the page
    this.svg = d3.select("#cc-2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

    const years = getYears();
    d3.select("#select-year")
        .selectAll('year-options')
        .data(years)
        .enter()
        .append('option')
        .text(function (d) {
              return d;
        }) // text showed in the menu
        .attr("value", function (d) {
              return d;
        }) // corresponding value returned by the button

            
        // Begin stack chart
    var subgroups = data.columns.slice(2)

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    var groups = ['Clark', 'King', 'Kitsap', 'Pierce', 'Snohomish', 'Spokane',
        'Thurston']

   

    // Add X axis
    this.x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2])
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));

    // Add Y axis
    this.y = d3.scaleLinear()
        .domain([0, 25000])
        .range([ height, 0 ]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(d3.schemeSet2);
    renderLegend(svg, subgroups, width, color);
    
    
    var bars = svg.append("g").attr("class", ".myRect");

    const update = data => {
        
          var stackData = d3.stack().keys(subgroups)(data);
        
          // Set up transition.
          const dur = 1000;
          const t = d3.transition().duration(dur);
        
          bars
            .selectAll("g")
            .data(stackData)
            .join(
              enter => enter
                .append("g")
                .attr("fill", d => color(d.key))
                .attr("class", function(d){ return "myRect " + d.key })
                ,
              null, // no update function
        
            exit => {
                exit
                .transition()
                .duration(dur / 2)
                .style("opacity", 0)
                .remove();
            }
            ).selectAll("rect")
              .data(d => d, d => d.data.county)
                .join(
                    enter => enter
                        .append("rect")
                        .attr("class", function(d){ return "myRect " + d.key })
                        .attr("x", d => {
                          return this.x(d.data.county);
                        })
                        .attr("y", () => {
                          return this.y(0);
                        })
                        .attr("height", () => {
                          return this.height - this.y(0);
                        })
                        .attr("width", this.x.bandwidth())
                        .on("mouseover", function (event,d) { 
                            // what subgroup are we hovering?
                            const subGroupName = d3.select(this.parentNode).datum().key
                            // Reduce opacity of all rect to 0.2
                            //d3.selectAll(".myRect").style("opacity", 0.5)
                            // Highlight all rects of this subgroup with opacity 1. It is possible to select them since they have a specific class = their name.
                             d3.selectAll("."+subGroupName).style("opacity",0.3)
                          })
                          .on("mouseleave", function (event,d) { // When user do not hover anymore
                            // Back to normal opacity: 1
                            d3.selectAll(".myRect")
                            .style("opacity",1)
                        })
                    ,
                    null,
                    exit => {
                      exit
                        .transition()
                        .duration(dur / 2)
                        .style("fill-opacity", 0)
                        .remove();
                    }
                  )
                  .transition(t)
                  .delay(300)
                  .attr("x", d => this.x(d.data.county))
                  .attr("y", d => {
                    return this.y(d[1]);
                  })
                  .attr("width", this.x.bandwidth())
                  .attr("height", d => {
                    return this.y(d[0]) - this.y(d[1]);
                  })

                  ;
        };
    
    
   
    
    
    const firstYearTempData = data.filter(function (d) {
        return d.year === '2023'
    });
    const firstYearData = d3.map(firstYearTempData, function(d) {
        return {county:d.county, BMW:d.BMW, CHEVROLET:d.CHEVROLET, FORD:d.FORD, KIA:d.KIA, NISSAN:d.NISSAN, TESLA:d.TESLA, TOYOTA:d.TOYOTA}
    });

    update(firstYearData);

    // When the button is changed, run the updateChart function
    d3.select("#select-year").on("change", function (d) {
        // recover the option that has been chosen
        const selectedYear = d3.select(this).property("value")
        // run the updateChart function with this selected option
        const curYearTempData = data.filter(function (d) {
            return d.year === selectedYear
        });
        const curYearData = d3.map(curYearTempData, function(d) {
            return {county:d.county, BMW:d.BMW, CHEVROLET:d.CHEVROLET, FORD:d.FORD, KIA:d.KIA, NISSAN:d.NISSAN, TESLA:d.TESLA, TOYOTA:d.TOYOTA}
        });
        update(curYearData);

    })

}
