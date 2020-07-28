import { createArc } from './svg/arc.js';
import { createStackArea } from './svg/stack.js';
import Calendar from './svg/calendar.js';
import { getISOString, isoToDate, fillSpan, setWeight } from './utility.js';

window.onload = async () => {
    let data = await d3.json('/data');

    console.log(data);

    let formatNum = d3.format(',');

    let collective = data['collective'];
    let individual = data['individual'];

    let total = collective['total'];

    fillSpan('total-messages', formatNum(total));

    let colorScale = createArc('current-percent', collective['current_percent']);

    fillSpan('increment', collective['msgs_per']['increment']);
    createStackArea('messages-per', collective['msgs_per']['data'], colorScale);

    let conversations = document.getElementById('conversations-container');
    let convos = individual['info'];
    let current;

    let tooltip = d => `${d.value} messages on ${d.date.toDateString()}`;
    let ncolors = 8;
    let legendDesc = 'Number of messages';

    let colors = d3.schemeBlues[ncolors];
    colors.shift();

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

                let messages = createYearArray(convo_data['msgs_per_day']);
                let percentages = createYearArray(convo_data['percent_per_day']);

                let toggle = messages;

                let curYear = 'Recent';
                let curToggle = 'Messages';
                let calendar = new Calendar(calendar_id, colors);

                calendar.addData(
                    toggle['data'][curYear],
                    toggle['start'][curYear],
                    tooltip, legendDesc
                );

                let years = Object.keys(toggle['start']);
                let yearContainer = document.getElementById('year-container');
                yearContainer.textContent = '';

                years.forEach(year => {
                    let e = document.createElement('small');
                    e.id = `year-${year}`;
                    e.textContent = year;
                    e.addEventListener('click', function () {
                        if (this.textContent != curYear) {
                            setWeight(`year-${curYear}`, 400);
                            curYear = this.textContent;
                            setWeight(`year-${curYear}`, 'bold');

                            calendar.addData(
                                toggle['data'][curYear],
                                toggle['start'][curYear],
                                tooltip, legendDesc
                            )
                        }
                    })
                    yearContainer.appendChild(e);
                });

                setWeight(`year-${curYear}`, 'bold');

                let toggleContainer = document.getElementById('calendar-toggle');
                toggleContainer.textContent = '';

                ['Messages', 'Percentage'].forEach(type => {
                    let e = document.createElement('small');
                    e.id = `type-${type}`;
                    e.textContent = type;
                    e.addEventListener('click', function () {
                        if (this.textContent != curToggle) {
                            setWeight(`type-${curToggle}`, 400);
                            curToggle = this.textContent;
                            setWeight(`type-${curToggle}`, 'bold');

                            tooltip = type == 'Messages'
                                ? d => `${d.value} messages on ${d.date.toDateString()}`
                                : d => `${d.value.toPrecision(3)}% on ${d.date.toDateString()}`

                            legendDesc = type == 'Messages'
                                ? 'Number of messages'
                                : 'Percentage';

                            toggle = type == 'Messages' ? messages : percentages;

                            calendar.addData(
                                toggle['data'][curYear],
                                toggle['start'][curYear],
                                tooltip, legendDesc
                            )
                        }
                    })
                    toggleContainer.appendChild(e);
                })

                setWeight(`type-${curToggle}`, 'bold');
            }
        })
        conversations.appendChild(el);
    }
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
