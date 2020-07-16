import { createArc } from './svg/arc.js';
import { createStackArea } from './svg/stack.js';
import { createCalendar, addData } from './svg/calendar.js';
import { getISOString, isoToDate, fillSpan } from './utility.js';


window.onload = async () => {
    let data = await d3.json('/data');

    let formatNum = d3.format(',');

    let collective = data['collective'];
    let individual = data['individual'];

    let total = collective['total'];

    fillSpan('total-messages', formatNum(total));
    fillSpan('increment', collective['msgs_per']['increment']);

    console.log(data);

    let colorScale = createArc('current-percent', collective['current_percent']);

    createStackArea('messages-per', collective['msgs_per']['data'], colorScale);

    let conversations = document.getElementById('conversations-container');
    let convos = individual['info'];
    let current;

    let tooltip = d => `${d.value} messages on ${d.date.toDateString()}`;
    let ncolors = 8;
    let legendDesc = 'Number of messages';

    let colors = d3.schemeBlues[ncolors];
    colors.shift();

    let cellSize = 16;
    let calendar_id = 'message-calendar-container';

    for (const convo in convos) {
        let el = document.createElement('div');
        el.className = 'conversation';
        let name = convos[convo]['name']
        el.textContent = name;
        el.id = convo;
        el.addEventListener('click', function () {
            let convo_data = convos[this.id];
            if (this.id != current) {
                if (current) {
                    document.getElementById(current).style.backgroundColor = 'transparent';
                }

                current = this.id;
                this.style.backgroundColor = 'lightgray';

                fillSpan('name', name);

                let subtotal = convo_data['total'];
                fillSpan('subtotal', `There have been a total of ${subtotal} messages sent in this conversation.`);

                let percentage = formatNum((subtotal / total * 100).toPrecision(4))
                fillSpan('subpercent', `That makes up ${percentage}% of your total messages across all conversations.`);

                let messages = createYearArray(convo_data['per_day']);

                let cur = 'Recent';
                let calendar = createCalendar(calendar_id, cellSize);

                addData(
                    calendar, calendar_id,
                    messages['data'][cur],
                    messages['start'][cur],
                    cellSize, tooltip,
                    colors, legendDesc
                );

                let years = Object.keys(messages['start']);
                let yearContainer = document.getElementById('year-container');
                yearContainer.textContent = '';

                years.forEach(year => {
                    let e = document.createElement('small');
                    e.id = `year-${year}`;
                    e.textContent = year;
                    e.addEventListener('click', function () {
                        if (this.textContent != cur) {
                            setWeight(`year-${cur}`, 400);
                            cur = this.textContent;
                            setWeight(`year-${cur}`, 'bold');

                            addData(
                                calendar, calendar_id,
                                messages['data'][cur],
                                messages['start'][cur],
                                cellSize, tooltip,
                                colors, legendDesc,
                            )
                        }
                    })
                    yearContainer.appendChild(e);
                });

                setWeight(`year-${cur}`, 'bold');
            }
        })
        conversations.appendChild(el);
    }
}

let setWeight = (id, weight) => {
    document.getElementById(id).style.fontWeight = weight;
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

    console.log(beginning, start);

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
        ? isoToDate(`${getISOString(start).substr(0,4)}-01-01`)
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