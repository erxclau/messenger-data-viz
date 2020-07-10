import { createArc } from './arc.js';
import { createStackArea } from './stack.js';

window.onload = async () => {
    let data = await d3.json('/data');

    let formatNum = d3.format(',');

    fillSpan('total-messages', formatNum(data['total']));

    createArc('current-percent', data['current_percent']);

    createStackArea('messages-per-day', data['msgs_per_day']);

    // let individuals = document.getElementById('individual-conversations');
    // let convos = data['conversation_names'];
    // for (const convo in convos) {
    //     individuals.innerHTML += `<p><a href="/view/${convo}">${convos[convo]}</a></p>`
    // }
}

let fillSpan = (id, text) => {
    document.getElementById(id).innerHTML = text;
}