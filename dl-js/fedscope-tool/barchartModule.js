---
---

function handleMouseOver(d) {
    const formatNumber = d3.format(",d");
    window.tooltipModule.draw("#tooltip", d.occupationCategoryName, {
        Employees: formatNumber(d.employeeCount)
    });
}

function handleMouseOut() {
    window.tooltipModule.remove("#tooltip");
}

function handleMouseMove() {
    window.tooltipModule.move("#tooltip");
}

const svg = d3.select("#barchartSvg");
const margin = {
    top: 10, right: 80, bottom: 110, left: 90
};
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;

const x = d3
    .scaleBand()
    .rangeRound([0, width])
    .padding(0.1);
const y = d3.scaleLinear().rangeRound([height, 0]);

const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

function findFillColor(type) {
    switch (type) {
        case "Blue Collar":
            return "#0C99CD";
        case "White Collar":
            return "white";
        case "Other":
            return "#075D7D";
        default:
            return "";
    }
}

window.barchartModule = {
    draw: (data, { occupationCategories }) => {
        window.keyModule.draw(
            "barchartKey",
            [
                {
                    name: "White Collar",
                    fillColor: "#fff",
                    borderColor: "rgb(0,0,0)"
                },
                {
                    name: "Blue Collar",
                    fillColor: "#0C99CD",
                    borderColor: "#0C99CD"
                },
                {
                    name: "Other",
                    fillColor: "#075D7D",
                    borderColor: "#075D7D"
                }
            ],
            {
                orientation: "horizontal",
                fontSize: 16,
                shape: "circle",
                spacing: 150,
                borderWidth: 2
            }
        );

        g.selectAll("*").remove();

        const groupedData = Object.values(
            data.reduce((a, c) => {
                if (!a[c.occupationCategoryId]) {
                    a[c.occupationCategoryId] = {
                        occupationCategoryId: c.occupationCategoryId,
                        occupationCategoryName:
              occupationCategories[c.occupationCategoryId].shortenedName,
                        employeeCount: c.employeeCount,
                        occupationCategoryType: c.occupationType
                    };
                }
                else {
                    a[c.occupationCategoryId].employeeCount += c.employeeCount;
                }
                return a;
            }, {})
        )
            .sort((a, b) => b.employeeCount - a.employeeCount)
            .reduce((a, c, i) => {
                if (i < 25) {
                    a.push(c);
                }
                else if (i === 25) {
                    a.push({
                        occupationCategoryId: 99,
                        occupationCategoryName: "All Other Occupations",
                        occupationCategoryType: "Other",
                        employeeCount: c.employeeCount
                    });
                }
                else if (i > 25) {
                    a[25].employeeCount += c.employeeCount;
                }
                return a;
            }, []);

        x.domain(groupedData.map((d) => d.occupationCategoryName));
        y.domain([0, d3.max(groupedData, (d) => d.employeeCount)]);

        g
            .append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(10))
            .append("text")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "start")
            .text("Employee Count")
            .attr("transform", `translate(-85,250) rotate(-90)`)
            .attr("fill", "black");

        g
            .selectAll(".bar")
            .data(groupedData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => x(d.occupationCategoryName))
            .attr("y", (d) => y(d.employeeCount))
            .attr("width", x.bandwidth())
            .attr("height", (d) => height - y(d.employeeCount))
            .attr("fill", (d) => findFillColor(d.occupationCategoryType))
            .attr("stroke", "rgb(0,0,0)")
            .attr("stroke-width", "1")
            .on("mouseover", handleMouseOver)
            .on("mousemove", handleMouseMove)
            .on("mouseout", handleMouseOut);

        g
            .append("g")
            .attr("class", "axis axis--x")
            .attr("transform", `translate(1,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "start")
            .attr("dx", ".5em")
            .attr("dy", ".3em")
            .attr("transform", "rotate(45)")
            .attr("pointer-events", "none");
    }
};
