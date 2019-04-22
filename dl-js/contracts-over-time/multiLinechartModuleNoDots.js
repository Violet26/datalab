---
---

const multiLinechartModuleNoDots = (function() {
  function draw(data,axisText,id) {
    $('.subTitleDiv').empty();
    $('.legend').empty();
    $("#svg-1").empty();

    const svgMargin = { top: 20, right: 0, bottom: 80, left: 0 },
      height = 530,
      height2 = 80,
      svgMargin2 = {top: (height+20), right: 0, bottom: "auto", left: 0},
      width = 816,
      legendHeight = 50;

    var parseDate = d3.timeParse("%Y-%m-%d");

    // Add SVG
    var svg = d3
      .select("#svg-1")
      .append("g")
      .attr('class','frame')
      .attr('max-width','70%')
      .attr("transform", `translate(${svgMargin.left},${svgMargin.top})`);

    Object.entries(data.lineData).forEach(d =>
      d[1].forEach(e => (e.parsedDate = parseDate(e.date)))
    );

    const combinedLineData = Object.entries(data.lineData).reduce((a, c) => {
      const a2 = [...a, ...c[1]];
      return a2;
    }, []);

    // line value ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    var x2 = d3.scaleTime().range([0, width]);
    var y2 = d3.scaleLinear().range([height2, 0]);

    console.log("y2: ",y2);

    // define the lines
    var line = d3
      .line()
      .x(d => x(d.parsedDate))
      .y(d => y(d.val));
    
    var line2 = d3
      .line()
      .x(d => x2(d.parsedDate))
      .y(d => y2(d.val));

    // Scale the domains
    x.domain(d3.extent(combinedLineData, d => d.parsedDate));
    y.domain([0, d3.max(combinedLineData, d => d.val)]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    let xAxis = d3.axisBottom(x);

    let xAxis2 = d3.axisBottom(x2);

    let yAxis = d3.axisLeft(y)
      .ticks(10)
      .tickFormat(chartModule.formatNumberAsText);

    var clip = svg.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0); 

    var LineChart = svg.append("g")
      .attr("class", "focus")
      .attr("transform", "translate(0,0)")
      .attr("clip-path", "url(#clip)");

    var focus = svg.append("g")
      .attr("class", "focus")
      .attr("transform", "translate(0,0)");

    var context = svg.append("g")
      .attr("class", "context")
      .attr("transform", "translate(0," + svgMargin2.top + ")");

    var brush = d3.brushX()
      .extent([[0, 0], [width, height2]]);

    var zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]]);
    
    if(id === "panel-4"){
        var lineColor = d3
        .scaleOrdinal()
        .range(["#49A5B6", "#F5A623"])
        .domain([0, Object.keys(data.lineData).length - 1]);
    }else if(id === "panel-5"){
        var lineColor = d3
        .scaleOrdinal()
        .range(["#009292","#9C27B0","#FF7043","#E91E63","#F5A623","#1617a9","#990911"])
        .domain([0, Object.keys(data.lineData).length - 1]);
    }else if(id === "panel-6"){
        var lineColor = d3
        .scaleOrdinal()
        .range(["#027693"])
        .domain([0, Object.keys(data.lineData).length - 1]);
    }

    context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

    context.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, x.range());
    
    focus.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    focus.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis);

    // draw lines
    function DrawLines(t){
      return LineChart
        .append("g")
        .attr("class", "line-paths")
        .selectAll(".line")
        .data(Object.entries(data.lineData))
        .enter()
        .append("path")
        .attr("class", "line")
        .style("stroke", (d, i) => lineColor(i))
        .attr("d", d => line(d[1]))
        .each(function(d) {
          d.totalLength = this.getTotalLength();
        })
        .attr("stroke-dasharray", d => d.totalLength)
        .attr("stroke-dashoffset", d => d.totalLength)
        .transition()
        .duration(t)
        .attr("stroke-dashoffset", "0");
      };

    DrawLines(4000);

    context
      .append("g")
      .attr("class", "line-paths")
      .selectAll(".line")
      .data(Object.entries(data.lineData))
      .enter()
      .append("path")
      .attr("class", "line")
      .style("stroke", (d, i) => lineColor(i))
      .attr("d", d => line2(d[1]))
      .each(function(d) {
        d.totalLength = this.getTotalLength();
      })
      .attr("stroke-dasharray", d => d.totalLength)
      .attr("stroke-dashoffset", d => d.totalLength)
      .transition()
      .duration(0)
      .attr("stroke-dashoffset", "0");


      // draw data points
    function DrawPoints(t){
      Object.entries(data.lineData).forEach((l, i) => {
          
        LineChart
          .append("g")
          .attr("class", "data-points")
          .selectAll(".data-point")
          .data(l[1])
          .enter()
          .append("circle")
          .attr("class", "data-point")
          .style("stroke", (d, i) => lineColor(i))
          .attr("cx", d => x(d.parsedDate))
          .attr("cy", d => y(d.val))
          .attr("r", 3)
          .attr("opacity", "0")
          .on("mouseover", d => handleMouseOver(d, l[0]))
          .on("mouseout", handleMouseOut)
          .on("mousemove", handleMouseMove)
          .transition()
          .duration(t);
      });
    }

    DrawPoints(0);

    var TooltipFormatNumberAsText = d =>
    d3.format("$.2s")(d)
      .replace("G", " Billion")
      .replace("M", " Million");
    
      function handleMouseOver(d, title) {
      tooltipModule.draw("#tooltip", title, {
        Value: TooltipFormatNumberAsText(d.val)
      });
    }

    function handleMouseOut() {
      tooltipModule.remove("#tooltip");
    }

    function handleMouseMove() {
      tooltipModule.move("#tooltip");
    }

    // draw gridlines
    chartModule.drawYAxisGridlines(svg, y, width, 10);

  setTimeout(brush.on("brush", brushed),1);

  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    LineChart.selectAll('.data-point').remove();
    LineChart.selectAll('.line').remove();
    DrawLines(0);
    DrawPoints(0);
    focus.select(".axis--x").call(xAxis);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
  }

  function getSubTitle(id){
    if(id === "panel-3") {
      return "Total Contract Spending by Week";
    } else if (id === "panel-4") {
      return "Spending by Contract Type";
    } else if(id === "panel-5"){
      return "Spending by Types of Goods and Services Purchased";
    }else if(id === "panel-6"){
      return "Do congressional budget actions affect how agencies spend money on contracts?";
    }
    return "";
  }
  
  var legendVals = Object.keys(data.lineData);

  var subTitle = d3.select('.subTitleDiv')
    .append("div")
    .attr("class","subTitle")
    .text(getSubTitle(id));

  var legend = d3.select('.legend').selectAll("legends")
    .data(legendVals)
    .enter().append("div")
    .attr("class","legends");
  
  var p = legend.append("p").attr("class","title")
  p.append("span").attr("class","key-dot").style("background",function(d,i) { return lineColor(i) } );
  p.insert("text").attr("class","title").text(function(d,i) { return d } );
  
  p.on("mouseover",(d) => {
    if(d === "Contract Modification"){
      d3.select("#svg-1 > g > g > g.line-paths > path:nth-child(1)").style("stroke-width","1px");
      d3.select("#svg-1 > g > g > g.line-paths > path:nth-child(2)").style("stroke-width","0px");
      d3.select("#svg-1 > g > g.context > g.line-paths > path:nth-child(1)").style("stroke-width","1px");
      d3.select("#svg-1 > g > g.context > g.line-paths > path:nth-child(2)").style("stroke-width","0px");
    }else if (d === "New Contract"){
      d3.select("#svg-1 > g > g > g.line-paths > path:nth-child(1)").style("stroke-width","0px");
      d3.select("#svg-1 > g > g > g.line-paths > path:nth-child(2)").style("stroke-width","1px");
      d3.select("#svg-1 > g > g.context > g.line-paths > path:nth-child(1)").style("stroke-width","0px");
      d3.select("#svg-1 > g > g.context > g.line-paths > path:nth-child(2)").style("stroke-width","1px");
    }else if (d === "Weapons & Ammunition"){
      d3.selectAll("#svg-1 > g > g > g.line-paths > path").style("stroke-width","0px");
      d3.select("#svg-1 > g > g > g.line-paths > path:nth-child(1)").style("stroke-width","1px");
      d3.selectAll("#svg-1 > g > g.context > g.line-paths > path").style("stroke-width","0px");
      d3.select("#svg-1 > g > g.context > g.line-paths > path:nth-child(1)").style("stroke-width","1px");
    }else if (d === "Professional Services, Education & Training"){
      d3.selectAll("#svg-1 > g > g > g.line-paths > path").style("stroke-width","0px");
      d3.select("#svg-1 > g > g > g.line-paths > path:nth-child(2)").style("stroke-width","1px");
      d3.selectAll("#svg-1 > g > g.context > g.line-paths > path").style("stroke-width","0px");
      d3.select("#svg-1 > g > g.context > g.line-paths > path:nth-child(2)").style("stroke-width","1px");
    }else if (d === "Facilities, Equipment & Construction"){
      d3.selectAll("#svg-1 > g > g > g.line-paths > path").style("stroke-width","0px");
      d3.select("#svg-1 > g > g > g.line-paths > path:nth-child(3)").style("stroke-width","1px");
      d3.selectAll("#svg-1 > g > g.context > g.line-paths > path").style("stroke-width","0px");
      d3.select("#svg-1 > g > g.context > g.line-paths > path:nth-child(3)").style("stroke-width","1px");
    }
  })
  .on("mouseout",() => d3.selectAll("#svg-1 > g > g > g.line-paths > path").style("stroke-width","1px"));
  }

  function remove(cb) {
    d3
      .select("#svg-1")
      .selectAll("*")
      .transition()
      .duration(400)
      .style("opacity", 0)
      .remove();

    $('.legend').empty();
    $('.subTitleDiv').empty();

    setTimeout(cb, 400);
  }

  return { draw, remove };
})();
