---
---

window.treemapModule = {
    draw: (data, { agencies }) => {
        const svg = d3.select("#treemapSvg");
        const width = +svg.attr("width");
        const height = +svg.attr("height");

        const { tooltipModule } = window;

        const treemap = d3
            .treemap()
            .tile(d3.treemapResquarify)
            .size([width, height])
            .round(true)
            .paddingInner(1);

        function handleMouseOver(d) {
            const formatNumber = d3.format("$,d");
            tooltipModule.draw("#tooltip", agencies[d.data.agencyId].name, {
                "Employee Salaries": formatNumber(d.value)
            });
            d3.select(this).style("fill", "#D334BA");
        }

        function handleMouseOut() {
            tooltipModule.remove("#tooltip");
            d3.select(this).style("fill", "#6E9BA3");
        }

        function handleMouseMove() {
            tooltipModule.move("#tooltip");
        }

        const root = d3
            .hierarchy(data)
            .sum((d) => d.obligations)
            .sort((a, b) => b.height - a.height || b.value - a.value);

        treemap(root);

        const cell = svg
            .selectAll("g")
            .data(root.leaves())
            .enter()
            .append("g")
            .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

        cell
            .append("rect")
            .attr("id", (d) => d.data.agencyId)
            .attr("width", (d) => d.x1 - d.x0)
            .attr("height", (d) => d.y1 - d.y0)
            .attr("fill", "#6E9BA3")
            .on("mouseover", handleMouseOver)
            .on("mousemove", handleMouseMove)
            .on("mouseout", handleMouseOut);

        cell
            .append("clipPath")
            .attr("id", (d) => `clip-${d.data.agencyId}`)
            .append("use")
            .attr("xlink:href", (d) => `#${d.data.agencyId}`);

        cell
            .append("text")
            .text((d) => agencies[d.data.agencyId].abbreviation)
            .attr("dy", 12)
            .attr("dx", 2)
            .attr("fill", "white")
            .attr("pointer-events", "none");
    }
};
