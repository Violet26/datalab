---
---

// add legend
d3.select('#legend_scaleKey').append('circle')
  .attr('r', 25)
  .attr('class', 'legend_scaleKeyCircle')
  .attr('cx', 60)
  .attr('cy', 65);
d3.select('#legend_scaleKey').append('circle')
  .attr('r', 35)
  .attr('class', 'legend_scaleKeyCircle')
  .attr('cx', 60)
  .attr('cy', 65);
d3.select('#legend_scaleKey').append('circle')
  .attr('r', 45)
  .attr('class', 'legend_scaleKeyCircle')
  .attr('cx', 60)
  .attr('cy', 65);

let chartData; // ref to current data parent (only for center label) 
let ringLabels; // text to show in center

const grantRings = ['CFDA', ['Grant Awards', 'Family', 'Program']];
const contractRings = ['PSC', ['Contract Awards', 'Family', 'Program']];
function changeCategory(category) {
  if (category.value === 'contracts') {
    chartData = contractsChartArray[0];
    ringLabels = contractRings;
    drawChart(contractsChartArray);
  } else if (category.value === 'grants') {
    chartData = grantsChartArray[0];
    ringLabels = grantRings;
    drawChart(grantsChartArray);
  } else if (category.value === 'research') {
    chartData = researchGrantsChartArray[0];
    ringLabels = grantRings;
    drawChart(researchGrantsChartArray);
  }
}

const width = 700;
const height = 700;
const radius = Math.min(width, height) / 2;
const xScale = d3.scale.linear().range([0, 2 * Math.PI]);
const yScale = d3.scale.sqrt().range([0, radius]);
const svg = d3.select('#sunburst')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')')
  ;

const formatNumber = d3.format('$,.0f');
const center = d3.select('#center');

// When contracts is selected:
// PSC Category
// [PSC Category Name]
// [$spending in that PSC category]
// “Total $ of Funding”
// Center of Circle when PSC is clicked on
//     “PSC Category”
//     [PSC Category Name]
//     “PSC”
//     [Name of PSC]
//     [$spending on that PSC]
//     Total $ of Funding
// When grant or grant (research) is selected
// Center of circle when CFDA category is clicked on
//     CFDA Category
//     [CFDA Category Name]
//     [$spending in that CFDA category]
//     “Total $ of Funding”
// Center of Circle when PSC is clicked on
//     “CFDA Category”
//     [CFDA Category Name]
//     “CFDA”
//     [Name of CFDA]
//     [$spending on that CFDA]
//     Total $ of Funding

function updateCenter(d) {
  center.selectAll('*').remove();
  if (d.depth === 0) {
    center.append('div')
      .attr('id', 'tab')
      // .html (`
      //         <div class='heading'>CFDA Category</div>
      //         <div class='title'>${ringLabels[1][d.depth]}</div>
      //         <div class='heading'>${d.name}</div>
      //         <div class='amount'>${formatNumber (d.value)}</div>
      //         <div class='heading'>Total $ of Funding</div>
      // `)
      .html(`
                  <div class='heading'>CFDA Category</div>
                  <div class='heading'>${d.name}</div>
                  <div class='amount'>${formatNumber(d.value)}</div>
                  <div class='heading'>Total $ of Funding</div>
          `)
      ;
  } else {
    center.append('div')
      .attr('id', 'tab')
      // .html (`
      //         <div class='heading'>${ringLabels[1][d.depth]}</div>
      //         <div class='title'>${d.name}</div>
      //         <div class='amount'>${formatNumber (d.value)}</div>
      //   `)
      .html(`
                  <div class='title'>${d.name}</div>
                  <div class='amount'>${formatNumber(d.value)}</div>
            `)
      ;
  }
}

const centerColor = 'rgba(0, 0, 0, 0)'; //transparent to show #center
const wedgeColors = ['#881e3d', '#daa200', '#D25d15', '#082344', '#004c40'];
function getWedgeColor(d) {
  if (d.depth === 0) {
    return centerColor;
  }
  while (d.depth > 1) { //fill with colorIndex color (or ancestors')
    d = d.parent;
  }
  return wedgeColors[d.colorIndex];
}

function hover(d) {
  updateCenter(d);
}

const arc = d3.svg.arc()
  .startAngle(d => Math.max(0, Math.min(2 * Math.PI, xScale(d.x))))
  .endAngle(d => Math.max(0, Math.min(2 * Math.PI, xScale(d.x + d.dx))))
  .innerRadius(d => Math.max(0, yScale(d.y)))
  .outerRadius(d => Math.max(0, yScale(d.y + d.dy)))
  ;

function drawChart(data) {
  svg.selectAll('path').remove();
  const paths = svg.selectAll('path').data(data);
  paths.enter().append('path')
    .attr('d', arc)
    .attr('class', d => 'depth' + d.depth)
    .attr('fill', d => getWedgeColor(d))
    .on('mouseover', hover)
    .on('click', click)
    .append('title').text(d => d.name)
    ;
  updateCenter(data[0]); // initialize legend to summary
  click(data[0]); // simulate clicking center to reset zoom
}

function click(d) {
  svg.transition()
    .duration(750)
    .tween('scale', () => {

      // adjust xScale domain values to expand/contract selected sector (no changes to radii (y))
      const i = d3.interpolateArray(xScale.domain(), [d.x, d.x + d.dx]);
      return t => {
        xScale.domain(i(t));
      };
    })
    .selectAll('path')
    .attrTween('d', d => function () {
      return arc(d);
    })
    ;
}

function buildDataHierarchy(title, dataArray) {
  const data = { name: title, children: [] };
  const levels = ['family', 'Program_Title'];

  dataArray.forEach(d => {
    // Keep this as a reference to the current level
    let depthCursor = data.children;
    // Go down one level at a time
    levels.forEach((property, depth) => {

      // Look to see if a branch has already been created
      let index;
      depthCursor.forEach((child, i) => {
        if (d[property] == child.name) {
          index = i;
        }
      });
      // Add a branch if it isn't there
      if (isNaN(index)) {
        depthCursor.push({ 'name': d[property], 'children': [] });
        index = depthCursor.length - 1;
      }
      // Now reference the new child array as we go deeper into the tree
      depthCursor = depthCursor[index].children;
      // This is a leaf, so add the last element to the specified branch
      if (depth === levels.length - 1) {
        depthCursor.push({ 'name': d.Recipient, 'size': d.Obligation });
      }
    });
  });
  return data;
}

function toggleMapView() {
  console.log('toggle map view running!');
  let sunContainer = $('#sunburst');
  let mapBtn = $('#table_view');
  let tableContainer = $('#investment-table');

  mapBtn.click(function(){
    sunContainer.toggle(); // hide!
    tableContainer.toggle(); // show!
  });  
}

// Creating our Table!
// Passing in an Array[] of Columns! (using map)
function createInvestmentTable(columns) {
  d3.csv('data-lab-data/CollegesAndUniversityGrants.csv', function(err, data) {
    if (err) { return err; }

    /**
     * Table START
     */
    let table = d3.select('#investment-table').append('table')
        .attr('id', 'investment-table-datatable'); // id given to table for Datatables.js

    let titles = ['Family', 'Program Title', 'Agency', 'Subagency', 'Recipient', 'Obligation'];

    let rows = table.append('tbody')
        .selectAll('tr')
        .data(data).enter()
        .append('tr')
        .on('click', function (d) {
	  // TODO! right hand panel will come out on this TR click! 
	  // secondary table view
	  //          createSecondaryTableView(d.name, ['Type', 'Awarded Amount', '% of Total']); // going to pass in the row value and columns we want
        });

    
    let headers = table.append('thead').append('tr')
        .selectAll('th')
        .data(titles).enter()
        .append('th')
        .text(function (d) {
          return d;
        });

    rows.selectAll('td')
      .data(function (row) {
        return columns.map(function (column) {
          return { column: column, value: row[column] };
        });
      }).enter()
      .append('td')
      .classed('name', function (d) {
        return d.column == 'Recipient';
      })
      .classed('percentage', function (d) {
        return d.column == 'State';
      })
      .classed('total', function (d) {
        return d.column == 'Total';
      })
      .text(function (d) {
        return d.value;
      })
      .attr('data-th', function (d) {
        return d.name;
      });


    // datatable start
    let investmentDataTable = $('#investment-table-datatable').dataTable(); // start datatable
  }); // end d3 function
};


const partition = d3.layout.partition().value(d => d.size);

let grantsHierarchy, grantsChartArray;
let researchGrantsHierarchy, researchGrantsChartArray;
d3.csv('data-lab-data/CollegesAndUniversityGrants.csv', (error, grantData) => {
  // create hierarchy (which sorts by total value), then add colorIndex to 1st level nodes
  grantsHierarchy = buildDataHierarchy('Grants CFDA', grantData);
  grantsChartArray = partition.nodes(grantsHierarchy)
    .filter(d => d.depth < 3); // leave off recipients
  grantsHierarchy.children.forEach((node, index) => {
    node.colorIndex = index % wedgeColors.length;
  });
  chartData = grantsChartArray[0];

  drawChart(grantsChartArray); // default chart is all grants
  toggleMapView(); // event listeners for the table view! 
  createInvestmentTable(['family', 'Program_Title', 'Agency', 'Subagency', 'Recipient', 'Obligation']); // matching data headers from csv!

  

  // now do it all again with only research grants
  researchGrantsHierarchy = buildDataHierarchy('Research Grants CFDA', grantData.filter(c => c.Research));
  researchGrantsChartArray = partition.nodes(researchGrantsHierarchy)
    .filter(d => d.depth < 3); // leave off recipients
  researchGrantsHierarchy.children.forEach((node, index) => {
    node.colorIndex = index % wedgeColors.length;
  });
});

let contractsHierarchy, contractsChartArray;
d3.csv('data-lab-data/CollegesAndUniversitiesContracts.csv', (error, contractData) => {
  // create hierarchy (which sorts by total value), then add colorIndex to 1st level nodes
  contractsHierarchy = buildDataHierarchy('Contracts PSC', contractData);
  contractsChartArray = partition.nodes(contractsHierarchy)
    .filter(d => d.depth < 3); // leave off recipients
  contractsHierarchy.children.forEach((node, index) => {
    node.colorIndex = index % wedgeColors.length;
  });
});

svg.on('mouseleave', () => {
  hover(chartData);
});

d3.select(self.frameElement).style('height', height + 'px');
