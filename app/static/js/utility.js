let getISOString = (date) => {
    let iso = date.toISOString();
    return iso.substring(0, iso.indexOf('T'));
}

let isoToDate = string => new Date(`${string}T12:00:00`);

let fillSpan = (id, text) => {
    document.getElementById(id).innerHTML = text;
}

let setWeight = (id, weight) => {
    document.getElementById(id).style.fontWeight = weight;
}

function legend(
    id,
    color,
    title,
    tickSize = 6,
    width = 320,
    height = 44 + tickSize,
    marginTop = 18,
    marginRight = 0,
    marginBottom = 16 + tickSize,
    marginLeft = 0,
    ticks = width / 64,
    tickFormat,
    tickValues) {

    let x = d3.scaleLinear()
        .domain([-1, color.range().length])
        .rangeRound([marginLeft, width - marginRight]);

    d3.select(`#${id}-legend-colors`)
        .selectAll('rect')
        .data(color.range())
        .join('rect')
        .attr('x', (d, i) => x(i - 1))
        .attr('y', marginTop)
        .attr('width', (d, i) => x(i) - x(i - 1))
        .attr('height', height - marginTop - marginBottom)
        .attr('fill', d => d)

    let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
    const thresholds = color.thresholds();
    const thresholdFormat = d => Math.round(d);
    tickValues = d3.range(thresholds.length);
    tickFormat = i => thresholdFormat(thresholds[i], i);

    d3.select(`#${id}-legend-ticks`).remove();

    d3.select(`#${id}-legend-ticks-container`)
        .append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .attr('id', `${id}-legend-ticks`)
        .style('font-size', 11)
        .call(d3.axisBottom(x)
            .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
            .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
            .tickSize(tickSize)
            .tickValues(tickValues))
        .call(tickAdjust)
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", marginLeft)
            .attr("y", marginTop + marginBottom - height - 6)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("font-size", '12px')
            .text(title));
}

const delay = (time) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
};

function wrap(text, width) {
    text.each(function () {
        let text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1, // ems
            y = text.attr("y"),
            x = text.attr("x"),
            dy = 1,
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}

export { getISOString, isoToDate, legend, fillSpan, setWeight }