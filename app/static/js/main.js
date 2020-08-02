import { createArc } from './svg/arc.js';
import { createStackArea } from './svg/stack.js';
import { createDayLine } from './svg/line/day.js';
import { createBubbleGraph } from './svg/bubble.js';
import Calendar from './svg/calendar.js';
import { rasterize, isoToDate, fillSpan, setWeight, createYearArray } from './utility.js';

window.onload = async () => {
    let data = await d3.json('/data');

    let formatNum = d3.format(',');
    let formatTime = d3.timeFormat('%B %d %Y');

    console.log(data);

    let collective = data['collective'];
    let individual = data['individual'];

    let total = collective['total'];

    fillSpan('total-messages', formatNum(total));

    let colorScale = createArc('current-percent', collective['current_percent']);

    fillSpan('increment', collective['msgs_per']['increment']);
    createStackArea('messages-per', collective['msgs_per']['data'], colorScale);

    let conversations = document.getElementById('conversations-container');
    let convos = individual['info'];
    let currentConvo;

    let tooltip;
    let ncolors = 8;
    let legendDesc;

    let colors = d3.schemeBlues[ncolors];
    colors.shift();

    let calendar_id = 'message-calendar-container';

    for (const convo in convos) {
        let el = document.createElement('div');
        el.className = 'conversation';
        let name = convos[convo]['name']
        el.textContent = name;
        el.id = convo;
        el.addEventListener('click', async function () {
            let convo_data = convos[this.id];
            if (this.id != currentConvo) {
                if (currentConvo) {
                    document.getElementById(currentConvo).style.backgroundColor = 'transparent';
                }

                currentConvo = this.id;
                this.style.backgroundColor = 'lightgray';

                fillSpan('name', name);

                let subtotal = convo_data['total'];
                fillSpan('subtotal', `There have been a total of ${subtotal} messages sent in this conversation.`);

                let percentage = formatNum((subtotal / total * 100).toPrecision(4))
                fillSpan('subpercent', `That makes up ${percentage}% of your total messages across all conversations.`);

                let streakStart = formatTime(isoToDate(convo_data['streak']['start']));
                let streakEnd = formatTime(isoToDate(convo_data['streak']['end']));
                let streakLen = convo_data['streak']['length'];

                let streakDisplay = (streakLen > 1)
                    ? `This conversation had its longest streak of texts from ${streakStart} to ${streakEnd}. That's ${streakLen} days!`
                    : 'This conversation has not had a streak of texts longer than one day.';

                fillSpan('streak', streakDisplay);

                let maxDay = formatTime(isoToDate(convo_data['max']['date']))
                fillSpan('max-day', `The day with the most texts sent was ${maxDay}. ${convo_data['max']['value']} messages were sent on that day`)

                let textLength = convo_data['text_length'].toPrecision(3);
                fillSpan('text-length', `The average message length of this conversation is ${textLength} characters.`)
                let messages = createYearArray(convo_data['msgs_per_day']);
                let percentages = createYearArray(convo_data['percent_per_day']);

                let currentData = messages;

                let currentYear = 'Recent';
                let currentView = 'Messages';
                let calendar = new Calendar(calendar_id, colors);

                tooltip = d => `${d.value} messages on ${d.date.toDateString()}`;
                legendDesc = 'Number of messages';

                // console.log(await rasterize(calendar.svg.node()));

                calendar.addData(
                    currentData['data'][currentYear],
                    currentData['start'][currentYear],
                    tooltip, legendDesc
                );

                let years = Object.keys(currentData['start']);
                let yearContainer = document.getElementById('year-container');
                yearContainer.textContent = '';

                years.forEach(year => {
                    let e = document.createElement('small');
                    e.id = `year-${year}`;
                    e.textContent = year;
                    e.addEventListener('click', function () {
                        if (this.textContent != currentYear) {
                            setWeight(`year-${currentYear}`, 400);
                            currentYear = this.textContent;
                            setWeight(`year-${currentYear}`, 'bold');

                            calendar.addData(
                                currentData['data'][currentYear],
                                currentData['start'][currentYear],
                                tooltip, legendDesc
                            )
                        }
                    })
                    yearContainer.appendChild(e);
                });

                setWeight(`year-${currentYear}`, 'bold');

                let toggleContainer = document.getElementById('calendar-toggle');
                toggleContainer.textContent = '';

                ['Messages', 'Percentage'].forEach(type => {
                    let e = document.createElement('small');
                    e.id = `type-${type}`;
                    e.textContent = type;
                    e.addEventListener('click', function () {
                        if (this.textContent != currentView) {
                            setWeight(`type-${currentView}`, 400);
                            currentView = this.textContent;
                            setWeight(`type-${currentView}`, 'bold');

                            tooltip = type == 'Messages'
                                ? d => `${d.value} messages on ${d.date.toDateString()}`
                                : d => `${d.value.toPrecision(3)}% on ${d.date.toDateString()}`

                            legendDesc = type == 'Messages' ? 'Number of messages' : 'Percentage';

                            currentData = type == 'Messages' ? messages : percentages;

                            calendar.addData(
                                currentData['data'][currentYear],
                                currentData['start'][currentYear],
                                tooltip, legendDesc
                            )
                        }
                    })
                    toggleContainer.appendChild(e);
                })

                setWeight(`type-${currentView}`, 'bold');

                createDayLine(convo_data['msgs_per_minute'], 'minute-line-container');

                createArc('message-split-arc', convo_data['split']);

                d3.select(`#bubble-graph svg`).remove();
                if (convo_data['text_count']['total'] > 0) {
                    createBubbleGraph('bubble-graph', convo_data['text_count']);
                }
            }
        })
        conversations.appendChild(el);
    }
}
