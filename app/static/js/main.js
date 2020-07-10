import { createArc } from './arc.js';

window.onload = async () => {
    let data = await d3.json('/data');

    console.log(data);

    let formatNum = d3.format(',');

    fillSpan('total-messages', formatNum(data['total']));

    createArc('current-percent', data['conversations'])
}

let fillSpan = (id, text) => {
    document.getElementById(id).innerHTML = text;
}