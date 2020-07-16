import os
import time
import json
from pprint import pprint
from datetime import datetime, timedelta


def strtodate(string):
    return datetime.strptime(string, '%Y-%m-%d')


def find_per_info(data, names):
    increment = 'daily'
    msg_dict = dict()
    tmp_total = dict()
    for convo in data:
        msgs = convo['messages']
        for date in msgs.keys():
            if not date in msg_dict:
                msg_dict[date] = dict()
                for name in names:
                    msg_dict[date][name] = 0
            msg_dict[date][convo['name']] = msgs[date]

            if not date in tmp_total:
                tmp_total[date] = msgs[date]
            else:
                tmp_total[date] += msgs[date]

    keys = list(sorted(msg_dict.keys()))

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
            msg_dict[string] = dict()
            for name in names:
                msg_dict[string][name] = 0
            tmp_total[string] = 0
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
            msg_dict[string] = dict()
            for name in names:
                msg_dict[string][name] = 0
            tmp_total[string] = 0
            dates.insert(0, day_before)
        curr_week = dates[0]
        for i in range(len(dates)):
            if dates[i].weekday() == 6:
                curr_week = dates[i]
            else:
                week_str = curr_week.isoformat()[:10]
                curr_str = dates[i].isoformat()[:10]

                for name in msg_dict[curr_str].keys():
                    msg_dict[week_str][name] += msg_dict[curr_str][name]
                tmp_total[week_str] += tmp_total[curr_str]

                msg_dict.pop(curr_str)
                tmp_total.pop(curr_str)

    msg_list = list()
    percent_list = list()
    for date in sorted(msg_dict.keys()):

        count_val = msg_dict[date]

        percent_val = {
            name:
            (count_val[name] / tmp_total[date] *
             100) if tmp_total[date] != 0 else 0
            for name in count_val.keys()
        }

        count_val['date'] = date
        percent_val['date'] = date

        msg_list.append(count_val)
        percent_list.append(percent_val)

    return increment, msg_list, percent_list


def get_msgs_day_convo(messages):
    tmp = dict()
    for msg in messages:
        t = int(msg['timestamp_ms']) / 1000
        date = datetime.fromtimestamp(t)
        iso = date.isoformat()[:10]

        if not iso in tmp:
            tmp[iso] = 1
        else:
            tmp[iso] += 1
    return tmp


def find_current_percentage(data):
    for d in data:
        d['percent'] = d['number'] / total * 100

    data.sort(key=lambda x: x['number'], reverse=True)


def get_convo_info(convo):
    tmp = dict()
    tmp['number'] = 0
    messages = list()
    msg_files = [f.name for f in os.scandir(f"{inbox}/{convo}") if f.is_file()]
    for msg_file in msg_files:
        f = open(f"{inbox}/{convo}/{msg_file}")
        f = json.load(f)

        if not 'name' in tmp:
            title = f['title'].encode('latin-1').decode('utf-8')
            tmp['name'] = title

        msgs = f['messages']
        tmp['number'] += len(msgs)
        messages.extend(msgs)

    return tmp, messages


start = time.time()

fp = os.path.dirname(os.path.abspath(__file__))
inbox = f"{fp}/messages/inbox"

convo_dirs = [f.name for f in os.scandir(inbox)]

current_percent = list()
individual_msgs = dict()
msgs_per_day = list()
names = list()
total = 0

for convo in convo_dirs:
    convo_info, messages = get_convo_info(convo)
    subtotal = convo_info['number']
    name = convo_info['name']

    total += subtotal
    current_percent.append(convo_info)

    daily_msgs = get_msgs_day_convo(messages)

    msgs_per_day.append({
        'name': name,
        'messages': daily_msgs
    })

    individual_msgs[convo] = {
        'name': name,
        'per_day': daily_msgs,
        'total': subtotal
    }

    names.append(name)

find_current_percentage(current_percent)
per_increment, msgs_per, percent_per = find_per_info(msgs_per_day, names)

content = {
    'collective': {
        'total': total,
        'current_percent': current_percent,
        'msgs_per': {
            'data': msgs_per,
            'increment': per_increment
        }
    },
    'individual': {
        'info': individual_msgs
    }
    # 'percent_per_day': percent_per_day,
}

writefile = f"{fp}/data.json"

with open(writefile, 'w', encoding='utf-8') as file:
    json.dump(content, file, ensure_ascii=False, indent=2)

print(time.time() - start)
