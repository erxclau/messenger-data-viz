import { createArc } from './arc.js';

window.onload = async () => {
    let data = await d3.json('data.json');

    createArc('split-arc', data['conversations'])
}
