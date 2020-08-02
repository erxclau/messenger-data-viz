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

export { getISOString, legend, fillSpan, setWeight, createYearArray }