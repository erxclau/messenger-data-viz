let createStackArea = (id, data) => {

    for (let i = 0; i < data.length; i++) {
        data[i].date = new Date(`${data[i].date}T12:00:00`);
    }

    let margin = { 'top': 0, 'right': 20, 'bottom': 30, 'left': 20 };

    let svg = d3.select(`#${id}`)
        .append('svg')
        .attr('id', `${id}-svg`)
        .attr('width', '100%')
        .attr('height', '75vh');

    let pseudo = svg._groups[0][0];
    let width = pseudo.clientWidth;
    let height = pseudo.clientHeight;

    svg
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height]);

    let keys = Object.keys(data[0]);
    keys.pop();

    let series = d3.stack()
        .keys(keys)
        .offset(d3.stackOffsetSilhouette)
        .order(d3.stackOrderAscending)
        (data);

    let x = d3.scaleUtc()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right]);

    let y = d3.scaleLinear()
        .domain([d3.min(series, d => d3.min(d, d => d[0])), d3.max(series, d => d3.max(d, d => d[1]))])
        .range([height - margin.bottom, margin.top]);

    let area = d3.area()
        // .curve(d3.curveMonotoneX)
        .x(d => x(d.data.date))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

    let color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeAccent)

    svg.append('g')
        .selectAll('path')
        .data(series)
        .join('path')
        .attr('fill', ({key}) => color(key))
        .attr('d', area)
        .on('mouseover', function(data) {
            let coords = d3.mouse(this);
            svg
                .append('text')
                .attr('x', coords[0])
                .attr('y', coords[1] - 20)
                .attr('class', 'label')
                .text(data.key);

            svg.selectAll('path')
                .attr('fill-opacity', d => d.key != data.key ? 0.1 : 1)
        })
        .on('mouseout', function() {
            svg.selectAll('text.label').remove();

            svg.selectAll('path')
                .attr('fill-opacity', 1);
        })

    let xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

    svg.append('g')
        .attr('id', `${id}-x-axis`)
        .call(xAxis);
}

export { createStackArea };