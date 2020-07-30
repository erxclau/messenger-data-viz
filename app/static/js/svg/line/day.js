import LineGraph from './line.js';

let createDayLine = (data, id) => {
    let margin = { 'top': 10, 'right': 20, 'bottom': 25, 'left': 30 };

    let timeParse = d3.timeParse('%Y-%m-%dT%H:%M:%S');

    let today = timeParse('2020-05-24T00:00:00');
    let tmrw = timeParse('2020-05-24T23:59:59');

    let range = d3.utcMinute.every(1).range(today, tmrw);

    d3.select(`#${id} svg`).remove();
    let graph = new LineGraph(id, '100%', '500px');

    let xScale = d3.scaleUtc()
        .domain([today, tmrw])
        .range([margin.left, graph.width - margin.right]);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d)])
        .range([graph.height - margin.bottom, margin.top]);

    let xAxis = g => g
        .attr('id', `${id}-x-axis`)
        .attr('transform', `translate(0, ${graph.height - margin.bottom})`)
        .call(d3.axisBottom().scale(xScale).tickFormat(d3.timeFormat("%I %p")));

    let yAxis = g => g
        .attr('id', `${id}-y-axis`)
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    graph.addAxes(xScale, yScale, xAxis, yAxis);
    graph.addLine(d3.curveBasis, range);
    graph.drawLine(data, 1.5, 'steelblue');
    graph.yLabel('Messages');
}

export { createDayLine }