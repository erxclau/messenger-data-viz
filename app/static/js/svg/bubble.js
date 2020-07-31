let createBubbleGraph = (id, data) => {

    let total = data['total'];
    data = data['count'];

    let svg = d3.select(`#${id}`)
        .append('svg')
        .attr('id', `${id}-svg`)
        .attr('width', '100%')
        .attr('height', '850px')

    let pseudo = svg._groups[0][0];
    let width = pseudo.clientWidth;
    let height = pseudo.clientHeight;

    let sizeFunction = d => (total > 2000)
        ? 500 / d.count
        : (total > 1000)
            ? 150 / d.count
            : 75 / d.count

    let simulation = d3.forceSimulation(data)
        .force('charge', d3.forceManyBody().strength(1))
        .force('x', d3.forceX(width / 2).strength(0.4))
        .force('y', d3.forceY(height / 2).strength(0.4))
        .force('collision', d3.forceCollide().radius(sizeFunction))

    simulation.tick(1000)
    ticked();

    function ticked() {
        let u = svg.selectAll('text')
            .data(data)

        u.enter()
            .append('text')
            .merge(u)
            .attr('dy', '.3em')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('font-size', sizeFunction)
            .attr('dominant-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .text(d => d.text)

        u.exit().remove()
    }
}

export { createBubbleGraph }