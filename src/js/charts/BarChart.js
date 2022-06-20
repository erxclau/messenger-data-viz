import { html, Component } from 'https://unpkg.com/htm/preact/standalone.module.js';

import { comma } from '../util.js';

class BarChart extends Component {
  render({ data }) {
    const list = Object.values(data).map((c) => ({
      name: c.name,
      total: c.total,
      percent: c.percent,
    })).sort((a, b) => b.total - a.total)

    const other = {
      name: "Other",
      total: 0,
      percent: 0,
    };

    while (list.length > 10) {
      const last = list.pop();
      other.total += last.total;
      other.percent += last.percent;
    }

    list.push(other);

    return html`
      ${list.map(d => html`
        <div class="row">
          <span class="name">${d.name}</span>
          <span class="bar-container">
            <span class="bar" style="width: ${d.percent}%;"></span>
            <span class="label">
              ${d.percent.toPrecision(3)}% (${comma(d.total)})
            </span>
          </span>
        </div>
      `)}
    `;
  }
}

export default BarChart;
