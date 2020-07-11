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
        data['messages']['array'],
        data['messages']['start'],
        'message-calendar-container',
        [0, 700], 8,
        'Number of messages',
        d => `${d.value} messages on ${d.date.toDateString()}`
    );
}

let createYearArray = (data) => {
    let now = new Date();
    let start = new Date();
    start.setFullYear(now.getFullYear() - 1);

    let res = fillData(data, start, now, 0);
    return { 'array': res['array'], 'start': res['start'] };
}

let fillData = (data, start, end, novalue) => {
    let arr = new Array();

    let tmp = getISOString(start);

    for (let i = start; i <= end; i.setDate(i.getDate() + 1)) {
        let iso = getISOString(i);
        let time = isoToDate(iso);

        let value = (iso in data) ? data[iso] : novalue

        arr.push({ 'date': time, 'value': value });
    }

    start = isoToDate(tmp);

    return { 'array': arr, 'start': start, 'end': end };
}