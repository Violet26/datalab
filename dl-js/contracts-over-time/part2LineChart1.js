---
---
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
d3.json('../../../data-lab-data/contracts-over-time/panel6a.json', (data) => {
    const svgHeight = 556;
    const svgWidth = 1400;

    function setDimsOfSvg(id) {
        const windowWidth = $(window).width();
        const windowHeight = $(window).height();
        const windowMargin = 50;
    
        $(id)
          .attr("height", svgHeight)
          .attr("width", svgWidth);
    
        $("<style>")
        .prop("type", "text/css")
        .html(`
          .fixed {top: ${windowMargin}px;}
          .left {height: ${svgHeight}px;}
        `)
        .appendTo("head");
      }
    
    setDimsOfSvg("#svg-3");

    const svgMargin = { top: 20, right: 25, bottom: 80, left: 45 },
      height = svgHeight,
      height2 = 50,
      svgMargin2 = {top: (height+20), right: 25, bottom: "auto", left: 45},
      width = svgWidth,
      legendHeight = 50;

    var parseDate = d3.timeParse("%Y-%m-%d");

    // Add SVG
    var svg = d3
      .select("#svg-3")
      .attr("viewBox", `0 0 1400 556`)
      .html(`<defs><clipPath id="clipPath"><rect x="0" y="0" width=${width} height=${height}></rect></clipPath></defs>`)
      .append("g")
      .attr('class','frame')
      .attr("transform", `translate(${svgMargin.left},${svgMargin.top})`);

    Object.entries(data.lineData).forEach(d =>
      d[1].forEach(e => (e.parsedDate = parseDate(e.date)))
    );
    Object.entries(data.verticalLineData).forEach(d =>
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

    var LineChart = svg.append("g")
      .attr("class", "focus")
      .attr("transform", "translate(0,0)")
      .style("clip-path", "url(#clipPath)");

    var focus = svg.append("g")
      .attr("class", "focus")
      .attr("transform", "translate(0,0)");

    var context = svg.append("g")
      .attr("class", "context")
      .attr("transform", "translate(0," + svgMargin2.top + ")");

    var brush = d3.brushX()
      .extent([[0, 0], [width, height2]])
      .on("brush", brushed);

    var zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]]);

    var lineColor = d3
      .scaleOrdinal()
      .range(["#027693"])
      .domain([0, Object.keys(data.lineData).length - 1]);

    var verticalLineColor = d3
      .scaleOrdinal()
      .range(["#FF7C7E","#6F6F6F"])
      .domain([0, Object.keys(data.verticalLineData).length - 1]);

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
    function DrawLines(){
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
        .duration(0)
        .attr("stroke-dashoffset", "0");
      };

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
    function DrawPoints(){
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
          .attr("r", 2)
          .attr("opacity", "0")
          .on("mouseover", d => handleMouseOver(d, l[0]))
          .on("mouseout", handleMouseOut)
          .on("mousemove", handleMouseMove);
      });
    }

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

    function DrawVerticalLines(){
        // draw vertical lines

        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([10, 0])
          .html(function(d) {
            return "<span style='color:#FFF; background-color:#000;padding:0 5px;'>" + d.date + "</span>";
          })

        LineChart.call(tip);

        Object.entries(data.verticalLineData).forEach((l, i) => {

          var tip = d3.tip()
          .attr('class', `d3-tip${i}`)
          .offset([-5, 0])
          .html(function(d) {
            return `<span style='color:#FFF; background-color:${verticalLineColor(i)};padding:0 5px;'>` + d.date + "</span>";
          })

          LineChart.call(tip);

          d3.selectAll("body > div.d3-tip0").style("color","#FF7C7E");
          d3.selectAll("body > div.d3-tip1").style("color","#6F6F6F");

            LineChart
            .append("g")
            .attr("class", "vertical-line-paths")
            .selectAll(`.vertical-line-${i}`)
            .data(l[1])
            .enter()
            .append("line")
            .attr("class", `.vertical-line-${i}`)
            .style("stroke", () => verticalLineColor(i))
            .attr("x1", d => x(d.parsedDate))
            .attr("y1", height)
            .attr("x2", d => x(d.parsedDate))
            .attr("y2", 0)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .style("stroke-dasharray", ("3,3"))
            .attr("stroke-dashoffset", d => d.totalLength)
            .style("stroke-width","1px")
            .style("stroke-opacity",".6")
            .transition()
            .duration(0)
            .attr("stroke-dashoffset", "0");
        });
    }

  if(data.verticalLineData["New Appropriations"]){
    
    context
        .append("g")
        .attr("class", "vertical-line-paths")
        .selectAll('.vertical-line-0')
        .data(data.verticalLineData["New Appropriations"])
        .enter()
        .append("line")
        .attr("class", '.vertical-line-0')
        .style("stroke","#6F6F6F")
        .attr("x1", d => x(d.parsedDate))
        .attr("y1", height2)
        .attr("x2", d => x(d.parsedDate))
        .attr("y2", d => d.val*.177)
        .style("stroke-dasharray", ("3,3"))
        .attr("stroke-dashoffset",80)
        .style("stroke-width","1px")
        .style("stroke-opacity",".6")
        .transition()
        .duration(0)
        .attr("stroke-dashoffset", "0");

    context
        .append("g")
        .attr("class", "vertical-line-paths")
        .selectAll('.vertical-line-1')
        .data(data.verticalLineData["Continuing Resolution"])
        .enter()
        .append("line")
        .attr("class", '.vertical-line-1')
        .style("stroke","#FF7C7E")
        .attr("x1", d => x(d.parsedDate))
        .attr("y1", height2)
        .attr("x2", d => x(d.parsedDate))
        .attr("y2", d => d.val*.177)
        .style("stroke-dasharray", ("3,3"))
        .attr("stroke-dashoffset",80)
        .style("stroke-width","1px")
        .style("stroke-opacity",".6")
        .transition()
        .duration(0)
        .attr("stroke-dashoffset", "0");
  }

    // draw gridlines
    chartModule.drawYAxisGridlines(svg, y, width, 10);

  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    LineChart.selectAll('.line').remove();
    d3.selectAll("#svg-3 > g > g:nth-child(1) > g").remove();
    DrawLines(0);
    DrawVerticalLines(0);
    focus.select(".axis--x").call(xAxis);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
    LineChart.selectAll('.data-point').remove();
    DrawPoints(0);
  }

  var legendVals = Object.keys(data.lineData);
  var legendVals2 = Object.keys(data.verticalLineData);

  var legend = d3.select('.part2legend1').selectAll("legends")
    .data(legendVals)
    .enter().append("div")
    .attr("class","legends");
  
  var p = legend.append("p").attr("class","title")
  p.append("span").attr("class","key-dot").style("background",function(d,i) { return lineColor(i) } );
  p.insert("text").attr("class","title").text(function(d,i) { return d } );

  var legendWidth = 200;

  $(".part2control-group1 > div > label > input:checkbox").on("click", (e) => {
    const checkedVals = $('.box1:checkbox:checked').map(function () {
        return this.value;
    }).get();

    if(checkedVals.length===2){
        d3.selectAll("#svg-3 > g > g:nth-child(1) > g:nth-child(3) > line").style("stroke-width","1px");
        d3.selectAll("#svg-3 > g > g:nth-child(1) > g:nth-child(2) > line").style("stroke-width","1px");
    }else if(checkedVals[0]==="resolution"){
        d3.selectAll("#svg-3 > g > g:nth-child(1) > g:nth-child(2) > line").style("stroke-width","1px");
        d3.selectAll("#svg-3 > g > g:nth-child(1) > g:nth-child(3) > line").style("stroke-width","0px");
    }else if(checkedVals[0]==="budget"){
        d3.selectAll("#svg-3 > g > g:nth-child(1) > g:nth-child(3) > line").style("stroke-width","1px");
        d3.selectAll("#svg-3 > g > g:nth-child(1) > g:nth-child(2) > line").style("stroke-width","0px");
    }else{
        d3.selectAll("#svg-3 > g > g:nth-child(1) > g:nth-child(3) > line").style("stroke-width","0px");
        d3.selectAll("#svg-3 > g > g:nth-child(1) > g:nth-child(2) > line").style("stroke-width","0px");
    }
  });
});
