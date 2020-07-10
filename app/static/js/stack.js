let createStackArea = (id, data) => {

    for (let i = 0; i < data.length; i++) {
        data[i].date = new Date(`${data[i].date}T12:00:00`);
    }

    let margin = { 'top': 0, 'right': 20, 'bottom': 30, 'left': 20 };

    let svg = d3.select(`#${id}`)
        .append('svg')
        .attr('id', `${id}-svg`)
        .attr('width', '100%')
        .attr('height', '100vh');

    let pseudo = svg._groups[0][0];
    let width = pseudo.clientWidth;
    let height = pseudo.clientHeight;

    svg
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height]);

    let keys = Object.keys(data[0]);
    keys.pop();

    let series = d3.stack().keys(keys)(data);

    let x = d3.scaleUtc()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right]);

    let y = d3.scaleLinear()
        .domain([d3.min(series, d => d3.min(d, d => d[0])), d3.max(series, d => d3.max(d, d => d[1]))])
        .range([height - margin.bottom, margin.top]);

    let area = d3.area()
        .x(d => x(d.data.date))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

    let color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemePastel1);

    svg.append('g')
        .selectAll('path')
        .data(series)
        .join('path')
        .attr('fill', ({key}) => color(key))
        .attr('d', area)
        .append('title')
        .text(({ key }) => key);

    console.log(series);
}

export { createStackArea };