import { createArc } from './svg/arc.js';
import { createStackArea } from './svg/stack.js';
import { fillSpan } from './utility.js';

window.onload = async () => {
    let data = await d3.json('/data');

    let formatNum = d3.format(',');

    let collective = data['collective'];

    fillSpan('total-messages', formatNum(collective['total']));
    fillSpan('increment', collective['msgs_per']['increment']);

    console.log(data);

    let colorScale = createArc('current-percent', collective['current_percent']);

    createStackArea('messages-per', collective['msgs_per']['data'], colorScale);

    let individuals = document.getElementById('individual-conversations');
    let convos = data['individual']['info'];
    for (const convo in convos) {
        individuals.innerHTML += `<p><a href="/view/${convo}">${convos[convo]['name']}</a></p>`
    }
}
