export default class LineGraph {
    constructor(id, width, height) {
        this.id = id;
        this.svg = d3.select(`#${id}`)
            .append('svg')
            .attr('id', `${id}-svg`)
            .attr('width', width)
            .attr('height', height)
            .attr('font-family', 'sans-serif')
            .attr('font-size', 10);

        let pseudo = this.svg._groups[0][0];
        this.width = pseudo.clientWidth;
        this.height = pseudo.clientHeight;
        this.length = new Object();
    }

    addAxes(xScale, yScale, xAxis, yAxis) {
        this.xScale = xScale;
        this.yScale = yScale;
        this.xAxis = xAxis;
        this.yAxis = yAxis;

        this.svg.append('g')
            .attr('id', `${this.id}-x-axis`)
            .call(this.xAxis);
        this.svg.append('g')
            .attr('id', `${this.id}-y-axis`)
            .call(this.yAxis);
    }

    addLine(curve, range) {
        this.line = d3.line()
            .curve(curve)
            .defined(d => !isNaN(d))
            .x((d, i) => this.xScale(range[i]))
            .y(d => this.yScale(d));
    }

    addPercentLine() {
        this.line = d3.line()
            .defined(d => !isNaN(d.value))
            .curve(d3.curveMonotoneX)
            .x(d => this.xScale(d.date))
            .y(d => this.yScale(d.value))
    }

    distanceLine() {
        let timeParse = d3.timeParse('%Y-%m-%dT%H:%M:%S');
        this.line = d3.line()
            .defined(d => !isNaN(d.value))
            .curve(d3.curveMonotoneX)
            .x(d => this.xScale(d.date))
            .y(d => {
                let tmp = timeParse('2020-05-24T00:00:00');
                tmp.setSeconds(tmp.getSeconds() + d.value);
                return this.yScale(tmp);
            })
    }

    drawLine(data, strokewidth, color) {
        this.undefinedPath =
            this.svg.append('path')
                .datum(data.filter(this.line.defined()))
                .attr('fill', 'none')
                .attr('stroke', 'darkgrey')
                .attr('stroke-width', strokewidth * 0.5)
                .attr('stroke-linejoin', 'round')
                .attr('stroke-linecap', 'round')
                .attr('id', `${this.id}-undefined-path`)
                .attr('d', this.line);

        this.path = this.svg.append('path')
            .datum(data)
            .attr('id', `${this.id}-path`)
            .attr('fill', 'none')
            .attr('stroke-width', strokewidth)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke', color)
            .attr('d', this.line)
    }

    addAnimatedLine(data, strokewidth, color, name) {
        this.svg.append('path')
            .datum(data)
            .attr('id', `${this.id}-path-${name}`)
            .attr('fill', 'none')
            .attr('class', 'line')
            .attr('stroke-width', strokewidth)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke', color)
            .attr('d', this.line)

        let tmp = d3.select(`#${this.id}-path-${name}`);
        let len = tmp.node().getTotalLength();
        this.length[name] = len;

        tmp.attr('stroke-dasharray', `${len} ${len}`)
            .attr('stroke-dashoffset', len);
    }

    drawAnimatedLine(name, color) {
        d3.select(`#${this.id}-path-${name}`)
            .attr('stroke', color)
            .transition()
            .ease(d3.easeCubicInOut)
            .duration(1000)
            .attr('stroke-dashoffset', 0)
    }

    hideAnimatedLine(name) {
        let tmp = d3.select(`#${this.id}-path-${name}`)

        tmp.attr('stroke', 'lightgray')

        tmp.transition()
            .ease(d3.easeCubicInOut)
            .duration(1000)
            .attr('stroke-dashoffset', this.length[name]);
    }

    yLabel(label) {
        this.svg.select(`#${this.id}-y-axis`)
            .call(g => g.select('.tick:last-of-type text').clone()
                .attr('x', 3)
                .attr('text-anchor', 'start')
                .attr('font-weight', 'bold')
                .text(label));
    }
}