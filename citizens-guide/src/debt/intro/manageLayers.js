import { select, selectAll } from 'd3-selection';
import 'd3-transition';
import { layers } from './createLayers';
import { translator, establishContainer } from '../../utils';
import { chartWidth } from './widthManager';

const d3 = { select, selectAll },
    scaleFactor = 0.6,
    duration = 1000;

let activeCompare, revenueFirstTime, debtFirstTime;

function revealHiddenElements() {
    d3.selectAll('.intro-hidden').classed('intro-hidden', null);
    resizeSvg();
}

function resizeSvg() {
    let h = (activeCompare) ? 900 * scaleFactor : 900;
    
    establishContainer().transition().duration(duration).attr('height', h);
}

function zoom(out) {
    const yOffset = 35;

    if (out) {
        layers.master.transition()
            .duration(duration)
            .attr('transform', translator((chartWidth - chartWidth * scaleFactor) / 2, yOffset) + ` scale(${scaleFactor})`)
            .ease();
    } else {
        layers.master.transition()
            .duration(duration)
            .attr('transform', translator(0, yOffset) + ` scale(1)`)
            .ease();
    }
}

function showHideMath() {
    d3.selectAll('.intro-math').classed('intro-math--hidden', activeCompare);
}

function toggleLayer() {
    const clicked = d3.select(this),
        id = clicked.attr('data-trigger-id'),
        noDelay = (id === 'debt' && activeCompare !== 'deficit');

    d3.selectAll('.facts__trigger').classed('facts__trigger--active', false);

    if (id === activeCompare) {
        activeCompare = null;
        zoom();
    } else {
        zoom('out')
        clicked.classed('facts__trigger--active', true);
        activeCompare = id;
    }

    transitionLayers();

    resizeSvg();
    showHideMath();
}

function compareDeficit() {
    layers.deficit.transition()
        .duration(duration)
        .attr('opacity', 1)
        .ease();
}

function transitionLayers() {
    layers.deficit.transition()
        .duration(duration)
        .attr('opacity', function(){
            return activeCompare === 'deficit' ? 1 : 0;
        })
        .ease();

    layers.gdp.transition()
        .duration(duration)
        .attr('opacity', function(){
            return activeCompare === 'gdp' ? 1 : 0;
        })
        .ease();
}

function showDebt() {
    layers.debt.transition()
        .duration(duration)
        .attr('opacity', 1)
        .ease();
}

export function layersInit() {
    d3.selectAll('.facts__trigger').on('click', toggleLayer);
    zoom();
    showDebt();
    setTimeout(showHideMath, duration * 2);
    setTimeout(revealHiddenElements, duration);
}