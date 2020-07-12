import { getISOString, legend } from '../utility.js';

let createCalendar = (data, start, id, ncolors, legendDesc, tooltip) => {

    // https://github.com/d3/d3-scale-chromatic color scale reference
    let colors = d3.schemeBlues[ncolors];
    colors.shift();

    let colorMapper = d3.scaleQuantize()
        .domain([0, d3.max(data, d => d.value) * 0.7])
        .range(colors)
        .nice();

    let width = 954;
    let cellSize = 16;
    let height = cellSize * 11;

    let calendar = initializeCalendarSVG(width, height, cellSize, id);

    let countDay = d => d.getUTCDay();
    let timeWeek = d3.utcSunday;

    markSideLabels(calendar, cellSize, countDay, start);

    let startOffset = timeWeek.count(d3.utcYear(start), start);

    calendar.append('g')
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('width', cellSize - 3)
        .attr('height', cellSize - 3)
        .attr('id', d => getISOString(d.date))
        .attr('x', d =>
            (timeWeek.count(d3.utcYear(start), d.date) - startOffset) * cellSize + 0.5)
        .attr('y', d => countDay(d.date) * cellSize + 0.5)
        .attr('fill', d => d.value == 0 ? '#F8F8FD' : colorMapper(d.value))
        .append('title')
        .text(tooltip);

    markMonths(calendar, start);
    legend(id, colorMapper, legendDesc, 4.5, 320, 50, 18, 0, 22, 0, 5, 'd')
}

let initializeCalendarSVG = (width, height, cellSize, id) => {
    const svg = d3.select(`#${id}`)
        .append('svg')
        .attr('id', `${id}-calendar-svg`)
        .attr('viewBox', [0, 0, width, height])
        .attr('font-family', 'sans-serif')
        .attr('font-size', '13px')

    let legend = svg.append('g')
        .attr('id', `${id}-legend`)
        .attr("width", 320)
        .attr("height", 50)
        .attr('transform', 'translate(600,132)')
        .attr("viewBox", [0, 0, 320, 50]);

    legend.append('g').attr('id', `${id}-legend-colors`);
    legend.append('g').attr('id', `${id}-legend-ticks-container`);

    return svg.append('g')
        .attr('transform', `translate(40.5, ${cellSize * 1.5})`);
}

let markSideLabels = (calendar, cellSize, countDay, start) => {

    calendar.append('text')
        .attr('x', -5)
        .attr('y', -5)
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'end')
        .text(start.getFullYear())

    let formatDay = d => 'SMTWTFS'[d.getUTCDay()];

    // this portion labels the weekdays at the left hand side of the calendar
    // use the year 1995 because the weekdays line up correctly
    // https://www.timeanddate.com/calendar/?year=1995&country=1
    calendar.append('g')
        .attr('text-anchor', 'end')
        .selectAll('text')
        .data(d3.range(7).map(i => new Date(1995, 0, i)))
        .join('text')
        .attr('x', -5)
        .attr('y', d => (countDay(d) + 0.5) * cellSize)
        .attr('dy', '0.31em')
        .text(formatDay);
}

let markMonths = (calendar, start) => {
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let tempDate = new Date(start.toISOString());
    let endDate = new Date(tempDate.toISOString());
    endDate.setFullYear(endDate.getFullYear() + 1);
    for (let i = tempDate; i <= endDate; i.setMonth(i.getMonth() + 1), i.setDate(1)) {
        let rect = document.getElementById(getISOString(i));

        if (rect != null) {
            calendar.append('text')
                .datum(months[i.getMonth()])
                .attr('x', rect.getAttribute('x'))
                .attr('y', -5)
                .text(d => d)
        }
    }
}

export { createCalendar };