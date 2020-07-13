import { createArc } from './svg/arc.js';
import { createStackArea } from './svg/stack.js';
import { fillSpan } from './utility.js';

window.onload = async () => {
    let data = await d3.json('/data');

    let formatNum = d3.format(',');

    fillSpan('total-messages', formatNum(data['total']));
    fillSpan('increment', data['msgs_per']['increment']);

    console.log(data);

    let colorScale = createArc('current-percent', data['current_percent']);

    createStackArea('messages-per', data['msgs_per']['data'], colorScale);

    let individuals = document.getElementById('individual-conversations');
    let convos = data['individual_msgs_per_day'];
    for (const convo in convos) {
        individuals.innerHTML += `<p><a href="/view/${convo}">${convos[convo]['name']}</a></p>`
    }
}
