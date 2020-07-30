import os
import time
import json
from pprint import pprint
from datetime import datetime, timedelta


fp = os.path.dirname(os.path.abspath(__file__))
inbox = f"{fp}/messages/inbox"


def strtodate(string):
    return datetime.strptime(string, '%Y-%m-%d')


def find_percentage_by_day(data, totals):
    for c_id in data.keys():
        convo = data[c_id]
        convo['percent_per_day'] = dict()
        for date in convo['msgs_per_day'].keys():
            percent = convo['msgs_per_day'][date] / totals[date] * 100
            convo['percent_per_day'][date] = percent


def find_per_info(data):
    increment = 'daily'
    stack_msgs_by_day = dict()
    total_by_day = dict()

    names = {key: data[key]['name'] for key in data.keys()}

    convo_ids = data.keys()
    for c_id in convo_ids:

        msgs = data[c_id]['msgs_per_day']
        for date in msgs.keys():
            if not date in stack_msgs_by_day:
                stack_msgs_by_day[date] = dict()

                for id in convo_ids:
                    stack_msgs_by_day[date][id] = 0

            stack_msgs_by_day[date][c_id] = msgs[date]

            if not date in total_by_day:
                total_by_day[date] = msgs[date]
            else:
                total_by_day[date] += msgs[date]

    keys = list(sorted(stack_msgs_by_day.keys()))

    i = 0
    length = len(keys) - 1
    while i < length:
        currD = strtodate(keys[i])
        nextD = strtodate(keys[i+1])
        diff = nextD - currD
        distance = diff.days
        for j in range(distance - 1):
            tmp = currD + timedelta(j + 1)
            string = tmp.isoformat()[:10]
            stack_msgs_by_day[string] = dict()
            for id in convo_ids:
                stack_msgs_by_day[string][id] = 0
            keys.insert(i+j+1, string)
        length = len(keys) - 1
        i += distance

    dates = [strtodate(date) for date in keys]
    if len(dates) > 365 * 2:
        increment = 'weekly'
        tmp_msg_dict = dict()
        one_day = timedelta(days=1)
        while dates[0].weekday() != 6:
            day_before = dates[0] - one_day
            string = day_before.isoformat()[:10]
            stack_msgs_by_day[string] = dict()
            for id in convo_ids:
                stack_msgs_by_day[string][id] = 0
            dates.insert(0, day_before)
        curr_week = dates[0]
        for i in range(len(dates)):
            if dates[i].weekday() == 6:
                curr_week = dates[i]
            else:
                week_str = curr_week.isoformat()[:10]
                curr_str = dates[i].isoformat()[:10]

                for name in stack_msgs_by_day[curr_str].keys():
                    stack_msgs_by_day[week_str][name] += stack_msgs_by_day[curr_str][name]

                stack_msgs_by_day.pop(curr_str)

    msg_list = list()
    for date in sorted(stack_msgs_by_day.keys()):

        count_val = stack_msgs_by_day[date]
        count_val = {names[key]: count_val[key] for key in count_val}
        count_val['date'] = date

        msg_list.append(count_val)

    return increment, msg_list, total_by_day


def get_msgs_by_time(messages):
    msgDateMap = dict()

    msgMinuteList = list()
    for i in range(24):
        msgMinuteList.append(list())
        for j in range(60):
            msgMinuteList[i].append(0)

    for msg in messages:
        t = int(msg['timestamp_ms']) / 1000
        date = datetime.fromtimestamp(t)
        iso = date.isoformat()[:10]

        if not iso in msgDateMap:
            msgDateMap[iso] = 1
        else:
            msgDateMap[iso] += 1

        msgMinuteList[date.hour][date.minute] += 1

    msgs_by_minute = list()
    for data in msgMinuteList:
        msgs_by_minute.extend(data)

    return msgDateMap, msgs_by_minute


def find_current_percentage(data, total):
    for d in data:
        d['percent'] = d['number'] / total * 100

    return sorted(data, key=lambda x: x['number'], reverse=True)


def get_conversation(convo):
    tmp = {'number': 0, 'messages': list()}
    msg_files = [f.name for f in os.scandir(f"{inbox}/{convo}") if f.is_file()]
    for msg_file in msg_files:
        fi = open(f"{inbox}/{convo}/{msg_file}")
        f = json.load(fi)
        fi.close()

        if not 'name' in tmp:
            title = f['title'].encode('latin-1').decode('utf-8')
            tmp['name'] = title

        msgs = f['messages']
        tmp['number'] += len(msgs)
        tmp['messages'].extend(msgs)

    return tmp


def get_msg_split(messages):
    split_dict = dict()
    for msg in messages:
        name = msg['sender_name']
        if name not in split_dict:
            split_dict[name] = list()
        split_dict[name].append(msg)

    split_list = list()
    for name in split_dict.keys():
        split_list.append({
            'name': name.encode('latin-1').decode('utf-8'),
            'number': len(split_dict[name]),
            'value': len(split_dict[name]) / len(messages) * 100
        })
    return split_list


def aggregate_data():

    convo_dirs = [f.name for f in os.scandir(inbox)]

    current_percent = list()
    conversations = dict()
    total = 0

    for convo in convo_dirs:
        convo_info = get_conversation(convo)
        subtotal = convo_info['number']
        name = convo_info['name']
        msgs = convo_info['messages']

        total += subtotal
        current_percent.append({'number': subtotal, 'name': name})

        msgs_by_day, msgs_by_minute = get_msgs_by_time(msgs)

        msg_split = get_msg_split(msgs)

        conversations[convo] = {
            'name': name,
            'msgs_per_day': msgs_by_day,
            'msgs_per_minute': msgs_by_minute,
            'split': msg_split,
            'total': subtotal
        }

    return current_percent, conversations, total


def create_data_dump(data):

    current_percent, conversations, total = data

    increment, msgs_per, total_per_day = find_per_info(conversations)
    find_percentage_by_day(conversations, total_per_day)
    current_percent = find_current_percentage(current_percent, total)

    content = {
        'collective': {
            'total': total,
            'current_percent': current_percent,
            'msgs_per': {
                'data': msgs_per,
                'increment': increment
            },
        },
        'individual': {
            'info': conversations
        }
    }

    return content


if __name__ == "__main__":
    start = time.time()

    writefile = f"{fp}/data.json"

    data = aggregate_data()
    content = create_data_dump(data)

    with open(writefile, 'w', encoding='utf-8') as file:
        json.dump(content, file, ensure_ascii=False, indent=2)

    print(time.time() - start)
