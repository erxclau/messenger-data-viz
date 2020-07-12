import { getISOString, isoToDate, fillSpan } from './utility.js';
import { createCalendar } from './svg/calendar.js';

window.onload = async () => {
    let convo_id = window.location.pathname.substr(6)

    let data = await d3.json(`/data/${convo_id}`);
    let name = data['name']

    document.title = name;
    fillSpan('name', name);

    data['messages'] = createYearArray(data['messages']);

    console.log(data['messages']);

    createCalendar(
        data['messages']['data']['recent'],
        data['messages']['start']['recent'],
        'message-calendar-container', 8,
        'Number of messages',
        d => `${d.value} messages on ${d.date.toDateString()}`
    );
}

let createYearArray = (data) => {
    let now = new Date();
    let start = new Date();
    start.setFullYear(now.getFullYear() - 1);

    let res = fillData(data, start, now, 0);
    return { 'data': res['data'], 'start': res['start'] };
}

let fillData = (data, start, end, novalue) => {

    let beginning = isoToDate(`${Object.keys(data)[0].substr(0, 4)}-01-01`);

    let years = { 'recent': new Array() };
    let starts = { 'recent': start };

    let tmp = getISOString(beginning);

    for (let i = beginning; i <= end; i.setFullYear(i.getFullYear() + 1)) {
        let iso = getISOString(i);
        let y = i.getFullYear();
        years[y] = new Array();
        starts[y] = isoToDate(iso);
    }

    beginning = isoToDate(tmp);

    for (let i = beginning; i <= end; i.setDate(i.getDate() + 1)) {
        let iso = getISOString(i);
        let time = isoToDate(iso);
        let year = time.getFullYear();

        let value = (iso in data) ? data[iso] : novalue;

        let obj = { 'date': time, 'value': value };

        years[year].push(obj);

        if (time >= start && time <= end) {
            years['recent'].push(obj);
        }
    }

    return { 'data': years, 'start': starts, 'end': end };
}