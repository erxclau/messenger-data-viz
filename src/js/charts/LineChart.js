import { html, Component } from 'https://unpkg.com/htm/preact/standalone.module.js';

import { max } from "https://cdn.skypack.dev/d3-array@3";
import { scaleTime, scaleLinear } from "https://cdn.skypack.dev/d3-scale@4";
import { line } from "https://cdn.skypack.dev/d3-shape@3";

import { parseTime } from '../util.js';

class LineChart extends Component {
  render({ data, start, end }) {
    const width = 900;
    const height = 500;
    const margin = { left: 20, top: 20, right: 20, bottom: 20 };

    const cumulative = Object.values(data).map(d =>
      ({ 
        data: Object.entries(d.cumulative).map(e => ({
          date: parseTime(e[0]),
          value: e[1]
        })).sort((a, b) => a.date - b.date),
        name: d.name,
        total: d.total
      })
    ).sort((a, b) => b.total - a.total);

    const x = scaleTime()
      .domain([parseTime(start), parseTime(end)])
      .range([margin.left, width - margin.right]);

    const y = scaleLinear()
      .domain([0, max(cumulative, d => d.total)])
      .range([height - margin.bottom, margin.top]);

    console.log(cumulative);

    const l = line()
      .x(d => x(d.date))
      .y(d => y(d.value));

    return html`
      <svg width="${width}px" height="${height}px">
        ${cumulative.map((c, i) => 
            html`
              <path 
                d="${l(c.data)}" 
                fill="none" 
                stroke="${i < 10 ? "steelblue" : "gainsboro"}" 
                stroke-width="${i < 10 ? 2 : 1}"
                name="${c.name}"
              />
            `
          )
        }
      </svg>
    `;
  }
}

export default LineChart;