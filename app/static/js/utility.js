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

let createYearArray = (data) => {
    let now = new Date();
    let start = new Date();
    start.setFullYear(now.getFullYear() - 1);

    let res = fillData(data, start, now, 0);
    return { 'data': res['data'], 'start': res['start'] };
}

let fillData = (data, start, end, novalue) => {

    let beginning = isoToDate(`${d3.min(Object.keys(data)).substr(0, 4)}-01-01`);

    let years = { 'Recent': new Array() };
    let starts = { 'Recent': start };

    let tmp = isoToDate(getISOString(beginning));

    for (let i = beginning; i <= end; i.setFullYear(i.getFullYear() + 1)) {
        let iso = getISOString(i);
        let y = i.getFullYear();
        years[`${y}`] = new Array();
        starts[y] = isoToDate(iso);
    }

    beginning = (start < tmp)
        ? isoToDate(`${getISOString(start).substr(0, 4)}-01-01`)
        : tmp

    for (let i = beginning; i <= end; i.setDate(i.getDate() + 1)) {
        let iso = getISOString(i);
        let time = isoToDate(iso);
        let year = time.getFullYear();

        let value = (iso in data) ? data[iso] : novalue;

        let obj = { 'date': time, 'value': value };

        if (`${year}` in years) {
            years[`${year}`].push(obj);
        }

        if (time >= start && time <= end) {
            years['Recent'].push(obj);
        }
    }

    let curYear = new Date().getFullYear();
    let cur = years[curYear];

    let lastDateIso = getISOString(cur[cur.length - 1]['date']);
    let lastDate = isoToDate(lastDateIso);
    lastDate.setDate(lastDate.getDate() + 1);

    for (let i = lastDate; lastDate.getFullYear() == curYear; i.setDate(i.getDate() + 1)) {
        let iso = getISOString(i);
        let time = isoToDate(iso);
        years[curYear].push({ 'date': time, 'value': 0 });
    }

    return { 'data': years, 'start': starts };
}

const delay = (time) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
};

// Modified from https://observablehq.com/@mbostock/saving-svg
function serialize(svg) {
    const xmlns = "http://www.w3.org/2000/xmlns/";
    const xlinkns = "http://www.w3.org/1999/xlink";
    const svgns = "http://www.w3.org/2000/svg";
    svg = svg.cloneNode(true);
    const fragment = window.location.href + "#";
    const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT, null, false);
    while (walker.nextNode()) {
        for (const attr of walker.currentNode.attributes) {
            if (attr.value.includes(fragment)) {
                attr.value = attr.value.replace(fragment, "#");
            }
        }
    }
    svg.setAttributeNS(xmlns, "xmlns", svgns);
    svg.setAttributeNS(xmlns, "xmlns:xlink", xlinkns);
    const serializer = new window.XMLSerializer;
    const string = serializer.serializeToString(svg);
    return new Blob([string], { type: "image/svg+xml" });
};

function rasterize(svg) {
    let resolve, reject;
    const promise = new Promise((y, n) => (resolve = y, reject = n));
    const image = new Image;
    image.onerror = reject;
    image.onload = () => {
        const rect = svg.getBoundingClientRect();
        const canvas = document.createElement('canvas');
        canvas.width = rect.width;
        canvas.height = rect.height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, rect.width, rect.height);
        context.canvas.toBlob(resolve);
    };
    image.src = URL.createObjectURL(serialize(svg));
    return promise;
}

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

// let image = rasterize(calendar.svg.node());
// let link = document.createElement('a');
// link.href = image.src;
// link.download = 'temp';
// document.body.appendChild(link);
// link.click();
// window.URL.revokeObjectURL(image.src);

export { rasterize, wrap, getISOString, isoToDate, legend, fillSpan, setWeight, createYearArray }