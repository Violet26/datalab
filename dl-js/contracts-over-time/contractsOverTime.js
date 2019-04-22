---
---


window.onbeforeunload = function() {
  window.scrollTo(0, 0);
};

$(function() {

  const {
    orientParallaxSection,
    findParallaxStatus,
    findAndOriendParallax
  } = parallaxModule;

  const {
    loadPanelData,
    mem
  } = dataModule;

  // metadata on each panel
  const panels = [
    {
      id: "panel-1",
      module: barchartModule,
      dataset: "panel1a",
      xAxis: "Fiscal Year 2007 - 2017"
    },
    {
      id: "panel-2",
      module: singleYearLinechartModule,
      dataset: "panel2",
      xAxis: "Fiscal Year Starting 9/30"
    },
    {
      id: "panel-3",
      module: multiLinechartModule,
      dataset: "panel3",
      xAxis: "Fiscal Year 2007 - 2017"
    },
    {
      id: "panel-4",
      module: multiLinechartModuleNoDots,
      dataset: "panel4",
      xAxis: "Fiscal Year 2007 - 2017"
    },
    {
      id: "panel-5",
      module: multiLinechartModuleNoDots,
      dataset: "panel5",
      xAxis: "Fiscal Year 2007 - 2017"
    }
  ];

  function setDimsOfSvg(id) {
    const windowWidth = 800;
    const windowHeight = 600;
    const windowMargin = 50;

    const svgHeight = 530;
    const svgWidth = 816;


    $(id)
      .attr("height", svgHeight)
      .attr("width", svgWidth);

    $("#scroll-breakpoint-1").css("padding-top", windowMargin);
    $("#scroll-breakpoint-2").css("padding-top", windowMargin + svgHeight);
    $("#scroll-triggerpoint").css("padding-top", windowMargin + svgHeight * .5);

    $("#scroll-breakpoint-1").css("z-index",-10);
    $("#scroll-breakpoint-2").css("z-index",-10);
    $("#scroll-triggerpoint").css("z-index",-10);

    $("#scroll-breakpoint-1").css("overflow","hidden");
    $("#scroll-breakpoint-2").css("overflow","hidden");
    $("#scroll-triggerpoint").css("overflow","hidden");

    $("<style>")
    .prop("type", "text/css")
    .html(`
      .fixed {top: ${windowMargin}px;}
      .left {height: ${svgHeight}px;}
    `)
    .appendTo("head");
  }

  setDimsOfSvg("#svg-1");

  // orient the parallax panel on page load
  findAndOriendParallax();

  // load dataset 1 and draw barchart
  loadPanelData("panel1a", barchartModule.draw);

  // load remaining datasets
  panels.forEach(p => loadPanelData(p.dataset));

  // handle scroll events
  $(window).scroll(() => {
    const onChangeCB = (preChange, postChange) => {
      if (preChange.activePanel.id === postChange.activePanel.id) return;

      const postChangePanel = panels.find(
        p => p.id === postChange.activePanel.id
      );
      const preChangePanel = panels.find(
        p => p.id === preChange.activePanel.id
      );

      if (!postChangePanel || !preChangePanel) return;

      const { module, dataset, xAxis } = postChangePanel;

      $('.subTitleDiv').empty();
      $('.legend').empty();

      d3
        .select("#svg-1")
        .selectAll("*")
        .transition()
        .style("opacity", 0)
        .remove();

      setTimeout(() => module.draw(mem[dataset], xAxis, postChangePanel.id, 400));
    };


    // parallax variables
    findParallaxStatus(onChangeCB);
    const { parallaxStatus, activePanel } = mem;

    // orient the parallax panel
    orientParallaxSection(parallaxStatus, activePanel);
  });
});
