import { getISOString, legend } from '../utility.js';

export default class Calendar {
    constructor(id, colors) {
        this.cellSize = 16;
        this.width = 954;
        this.height = this.cellSize * 11;
        this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        this.countDay = d => d.getUTCDay();
        this.formatDay = d => 'SMTWTFS'[d.getUTCDay()];
        this.timeWeek = d3.utcSunday;

        this.id = id;
        this.colors = colors;

        this.calendar = this.initializeCalendarSVG();

        this.calendar
            .append('g')
            .attr('id', 'calendar-group');

        // this portion labels the weekdays at the left hand side of the calendar
        // use the year 1995 because the weekdays line up correctly
        // https://www.timeanddate.com/calendar/?year=1995&country=1

        this.calendar.append('g')
            .attr('text-anchor', 'end')
            .selectAll('text')
            .data(d3.range(7).map(i => new Date(1995, 0, i)))
            .join('text')
            .attr('x', -5)
            .attr('y', d => (this.countDay(d) + 0.5) * this.cellSize)
            .attr('dy', '0.31em')
            .text(this.formatDay);
    }

    initializeCalendarSVG() {
        d3.select(`#${this.id} svg`).remove();

        this.svg = d3.select(`#${this.id}`)
            .append('svg')
            .attr('id', `${this.id}-calendar-svg`)
            .attr('viewBox', [0, 0, this.width, this.height])
            .attr('font-family', 'sans-serif')
            .attr('font-size', '13px')

        this.legend = this.svg.append('g')
            .attr('id', `${this.id}-legend`)
            .attr("width", 320)
            .attr("height", 50)
            .attr('transform', 'translate(600,132)')
            .attr("viewBox", [0, 0, 320, 50]);

        this.legend.append('g').attr('id', `${this.id}-legend-colors`);
        this.legend.append('g').attr('id', `${this.id}-legend-ticks-container`);

        return this.svg.append('g')
            .attr('transform', `translate(40.5, ${this.cellSize * 1.5})`);
    }

    addData(data, start, tooltip, legendDesc) {
        let colorMapper = legendDesc == 'Percentage'
            ? d3.scaleQuantize()
                .domain([0, 100])
                .range(this.colors)
                .nice()
            : d3.scaleQuantize()
                .domain([0, d3.max(data, d => d.value) * 0.7])
                .range(this.colors)
                .nice()

        let startOffset = this.timeWeek.count(d3.utcYear(start), start);

        this.markSideLabel(start);

        this.calendar.select('#calendar-group')
            .selectAll('rect')
            .data(data)
            .join('rect')
            .attr('width', this.cellSize - 3)
            .attr('height', this.cellSize - 3)
            .attr('id', d => getISOString(d.date))
            .attr('x', d =>
                (this.timeWeek.count(d3.utcYear(start), d.date) - startOffset) * this.cellSize + 0.5)
            .attr('y', d => this.countDay(d.date) * this.cellSize + 0.5)
            .attr('fill', d => d.value == 0 ? '#F8F8FD' : colorMapper(d.value))

        this.calendar.selectAll('.title-label').remove();

        this.calendar.selectAll('rect')
            .append('title')
            .attr('class', 'title-label')
            .text(tooltip);

        this.markMonths(start);

        legend(this.id, colorMapper, legendDesc, 4.5, 320, 50, 18, 0, 22, 0, 5, 'd');
    }

    markSideLabel(start) {
        this.calendar.select('#side-label').remove();

        this.calendar.append('text')
            .attr('x', -5)
            .attr('y', -5)
            .attr('id', 'side-label')
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'end')
            .text(start.getFullYear())
    }

    markMonths(start) {
        this.calendar.selectAll('.month-marks').remove();

        let tempDate = new Date(start.toISOString());
        let endDate = new Date(tempDate.toISOString());
        endDate.setFullYear(endDate.getFullYear() + 1);
        for (let i = tempDate; i <= endDate; i.setMonth(i.getMonth() + 1), i.setDate(1)) {
            let rect = document.getElementById(getISOString(i));

            if (rect != null) {
                this.calendar.append('text')
                    .datum(this.months[i.getMonth()])
                    .attr('x', rect.getAttribute('x'))
                    .attr('class', 'month-marks')
                    .attr('y', -5)
                    .text(d => d)
            }
        }
    }
}
