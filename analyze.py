import os
import time
import json
from pprint import pprint
from datetime import datetime, timedelta

def strtodate(string):
    return datetime.strptime(string, '%Y-%m-%d')

def find_per_day_info(data, names):
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

    # pprint(sorted(msg_dict.keys()))
    keys = list(sorted(msg_dict.keys()))
    # pprint(len(keys))

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

    # pprint(msg_dict['2013-04-23'])

    # dates = [strtodate(date) for date in keys]

    # for date in dates[:100]:
    #     print(date, date.weekday())

    # print(len(dates))

    msg_list = list()
    percent_list = list()
    for date in sorted(msg_dict.keys()):

        count_val = msg_dict[date]

        percent_val = {
            name:
            (count_val[name] / tmp_total[date] * 100) if tmp_total[date] != 0 else 0
            for name in count_val.keys()
        }

        count_val['date'] = date
        percent_val['date'] = date

        msg_list.append(count_val)
        percent_list.append(percent_val)

    return msg_list, percent_list


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
    name = str()
    msg_files = [f.name for f in os.scandir(f"{inbox}/{convo}") if f.is_file()]
    for msg_file in msg_files:
        f = open(f"{inbox}/{convo}/{msg_file}")
        f = json.load(f)

        if not 'name' in tmp:
            title = f['title'].encode('latin-1').decode('utf-8')
            tmp['name'] = title
            name = title

        msgs = f['messages']
        tmp['number'] += len(msgs)
        messages.extend(msgs)

    return tmp, messages, name


start = time.time()

fp = os.path.dirname(os.path.abspath(__file__))
inbox = f"{fp}/messages/inbox"

convo_dirs = [f.name for f in os.scandir(inbox)]

current_percent = list()
msgs_per_day = list()
names = list()
names_dict = dict()
total = 0

for convo in convo_dirs:
    convo_info, messages, tmp_name = get_convo_info(convo)

    total += convo_info['number']
    current_percent.append(convo_info)

    msgs_per_day.append({
        'name': convo_info['name'],
        'messages': get_msgs_day_convo(messages)
    })

    names.append(tmp_name)
    names_dict[convo] = tmp_name

find_current_percentage(current_percent)
msgs_per_day, percent_per_day = find_per_day_info(msgs_per_day, names)

content = {
    'total': total,
    'current_percent': current_percent,
    'msgs_per_day': msgs_per_day,
    'percent_per_day': percent_per_day,
    'conversation_names': names_dict
}

writefile = f"{fp}/data.json"

with open(writefile, 'w', encoding='utf-8') as file:
    json.dump(content, file, ensure_ascii=False, indent=2)

print(time.time() - start)
