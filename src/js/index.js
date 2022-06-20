import { extent, merge } from "https://cdn.skypack.dev/d3-array@3";
import { json } from "https://cdn.skypack.dev/d3-fetch@3";
import { html, render } from "https://unpkg.com/htm/preact/standalone.module.js";

import BarChart from "./charts/BarChart.js";
import LineChart from "./charts/LineChart.js";
import { comma, formatTime, parseTime } from "./util.js";

const $ = (selectors) => document.querySelector(selectors);

window.onload = async () => {
  const { conversations, total } = await json("./data.json");
  console.log(conversations, total);

  $("#total").textContent = comma(total);

  const [start, end] = extent(
    merge(
      Object.values(conversations)
        .map(
          conversation => extent(
            Object.keys(conversation.cumulative)
          )
        )
    )
  );

  const daterange = `${formatTime(parseTime(start))} to ${formatTime(parseTime(end))}`;
  $("#total-date-range").textContent = daterange;

  render(
    html`<${BarChart} data=${conversations} />`,
    $("#bar-chart")
  );

  render(
    html`<${LineChart} data=${conversations} start=${start} end=${end} />`,
    $("#line-chart")
  );
};