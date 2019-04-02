import { select, selectAll } from 'd3-selection';
import { simplifyNumber } from '../../utils';
import { initScale, drawChart } from './chart';
import { sortByLatestYear } from '../../spending/trends';

const d3 = { select, selectAll };

function getValueByYear(values, year) {
    let response;

    values.every(r => {
        if (r.year === year) {
            response = r.amount;
            return false;
        }

        return true;
    })

    return response;
}

function buildSummary(row, d) {
    const summary = row.append('div').classed('trend-row__summary', true),
        begin = getValueByYear(d.values, 2014),
        end = getValueByYear(d.values, 2018),
        difference = begin - end,
        percentChange = Number.parseFloat((Math.abs(difference / begin) * 100)).toFixed(1);

    let changeIcon;

    summary.append('span').classed('trend-row__summary-years trend-mobile__year', true).text('2014-2018: ')
    summary.append('span').classed('trend-row__summary-amounts trend-mobile__amount', true).text(`${simplifyNumber(begin)} - ${simplifyNumber(end)} `)
    changeIcon = summary.append('i').classed('fas trend-row__summary-icon', true);
    summary.append('span').classed('trend-row__summary-change', true).text(`${percentChange}%`);

    if (difference > 0) {
        changeIcon.classed('fa-arrow-circle-down', true)
    } else if (difference < 0) {
        changeIcon.classed('fa-arrow-circle-up', true)
    } else {
        changeIcon.remove();
    }
}

function placeDataDetail(d) {
    const row = d3.select(this);

    row.append('span')
        .classed('trend-mobile__year', true)
        .text(d.year + ': ');

    row.append('span')
        .classed('trend-mobile__amount', true)
        .text(simplifyNumber(d.amount))
}

function insertChart(row, d, config, detail) {
    const chartRow = row.append('div').classed('chart-row', true),
        dataBox = chartRow.append('div').classed('chart-row__data', true),
        chartBox = chartRow.append('div').classed('chart-row__chart', true);

    dataBox.selectAll('p')
        .data(d)
        .enter()
        .append('p')
        .classed('chart-row__data-line', true)
        .each(placeDataDetail);

    drawChart(chartBox, d, config, detail);
}

function toggleVisibility() {
    const button = d3.select(this),
        activeClass = 'chart-row--active',
        parent = d3.select(this.parentNode.parentNode).select('.chart-row'), //laaaaame. TODO: use more specific selectors to find the desired parent.
        isActive = parent.classed(activeClass);

    parent.classed(activeClass, !isActive);

    button.select('span').text(function () {
        return (isActive) ? 'view chart' : 'hide chart';
    });
}

function toggleDetail(d) {
    const button = d3.select(this),
        activeClass = 'trend-row--detail-active',
        parent = d3.select(this.parentNode.parentNode), //laaaaame. TODO: use more specific selectors to find the desired parent.
        detail = parent.select('.trend-row__detail'),
        isActive = parent.classed(activeClass);

    let container;

    parent.classed(activeClass, !isActive);

    button.select('span').text(function () {
        return (isActive) ? 'show subcategories' : 'close subcategories';
    });

    if (isActive) {
        // close - empty contents
        detail.selectAll('*').remove();
    } else {
        // load contents
        container = detail.append('div').classed('trend-mobile trend-mobile--detail', true);
        trendMobile(d.subcategories.sort(sortByLatestYear), container, d.config, 'detail')
    }
}

function buildChartButton(buttonRow) {
    const chartButton = buttonRow.append('button')
        .classed('trend-row__chart-toggle trend-row-button', true);

    chartButton.append('span')
        .classed('trend-row-button__toggle-text', true)
        .text('view chart');

    chartButton.append('i').classed('fas fa-chart-line', true);

    chartButton.on('click', toggleVisibility);
}

function buildDetailButton(buttonRow, d, config) {
    const detailButton = buttonRow.append('button')
        .classed('trend-row__detail-toggle trend-row-button', true);

    detailButton.append('span')
        .classed('trend-row-button__toggle-text', true)
        .text('show subcategories');

    detailButton.append('i').classed('fas fa-caret-down', true);

    d.config = config;

    detailButton.on('click', toggleDetail);
}

function buildRow(d, dom, config, detail) {
    const row = d3.select(dom);

    let buttonRow;

    row.append('h3')
        .classed('trend-row__heading', true)
        .text(d.name);

    buildSummary(row, d);
    insertChart(row, d.values, config, detail);

    buttonRow = row.append('div').classed('trend-row__buttons', true);

    buildChartButton(buttonRow);

    if (!detail) {
        buildDetailButton(buttonRow, d, config);
    }

    if (!config.detail) {
        row.append('div').classed('trend-row__detail', true)
    }
}

function openFirstChart() {
    const firstButton = d3.select('button.trend-row__chart-toggle');

    toggleVisibility.bind(firstButton.node())();
}

export function trendMobile(data, container, config, detail) {
    initScale(data, container, config);

    container.selectAll('.trend-row')
        .data(data)
        .enter()
        .append('div')
        .classed('trend-row ' + config.chapter, true)
        .each(function (d) {
            buildRow(d, this, config, detail);
        })

    if (!detail) {
        openFirstChart();
    }
}