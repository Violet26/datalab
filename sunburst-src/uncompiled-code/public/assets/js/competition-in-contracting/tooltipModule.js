"use strict";

var tooltipModule = function tooltipModule() {
  function draw(title, information) {
    d3
      .select("#tooltip")
      .transition()
      .duration(200)
      .style("opacity", 1);

    d3
      .select("#tooltip")
      .html(toolTipHtml(title, information))
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY + "px");

    function toolTipHtml(title, information) {
      var html =
        '\n      <p style="border-bottom:1px solid #898C90; font-size: 18px; margin:0; padding-bottom:15px">\n        <b style="color:#555555">' +
        title +
        '</b>\n      </p>\n      <b style="color:#555555">\n        <br>\n        <ul style="list-style-type: circle; margin:0; padding:0 0 0 15px">\n          ' +
        Object.entries(information).reduce(function(a, c) {
          a +=
            '<li style="font-size: 14px; font-weight: normal; margin:0; line-height: 16px">' +
            c[0] +
            ": " +
            c[1] +
            "</li>";
          return a;
        }, "") +
        "\n        </ul>\n      </b>";

      return html;
    }
  }

  function remove() {
    d3
      .select("#tooltip")
      .transition()
      .duration(500)
      .style("opacity", 0)
      .style("pointer-events", "none");
  }

  function move() {
    d3
      .select("#tooltip")
      .style("left", d3.event.pageX + 10 + "px")
      .style("top", d3.event.pageY + 10 + "px");
  }

  return { draw: draw, remove: remove, move: move };
};
