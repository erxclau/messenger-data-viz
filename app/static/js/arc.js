let createArc = (id, data) => {
    let other = { 'name': 'Other', number: 0, value: 0 };
    for (let i = 0; i < data.length; i++) {
        if (data[i]["value"] < 1.5) {
            other['number'] += data[i]['number']
            other['value'] += data[i]['value']
            data.splice(i, i + 1);
            i--;
        }
    }
    data.push(other);

    let colorScale = d3.schemePastel1;

    let svg = d3.select(`#${id}`)
        .append('svg')
        .attr('id', `${id}-svg`)
        .attr('width', '100%')
        .attr('height', '50vh');

    let pseudo = svg._groups[0][0];
    let width = pseudo.clientWidth;
    let height = pseudo.clientHeight;

    svg.attr('height', height)
        .attr('viewBox', [-width / 2, -height / 2, width, height]);

    let pie = d3.pie()
        .padAngle(0.005)
        .value(d => d.value);

    let arcs = pie(data);

    let radius = Math.min(width, height) / 2;

    let arc = d3.arc()
        .innerRadius(radius * 0.5).outerRadius(radius - 1);

    svg.selectAll('path')
        .data(arcs)
        .join('path')
        .attr('fill', (d, i) => colorScale[i % colorScale.length])
        .attr('d', arc)
        .append('title')
        .text(d => `${d.data.name}: ${d.value.toPrecision(3)}% (${d.data.number})`);

    svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(arcs)
        .join("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .call(text => text.append("tspan")
            .attr("y", "-0.2em")
            .attr("font-weight", "bold")
            .text(d => d.data.name))
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => `${d.data.value.toPrecision(3)}%`));
}

export { createArc }