import os
import time
import json
from pprint import pprint
from datetime import datetime

def find_per_day_info(data):
    tmp_dict = dict()
    tmp_total = dict()
    for convo in data:
        msgs = convo['messages']
        name = convo['name']
        for date in msgs.keys():
            if not date in tmp_dict:
                tmp_dict[date] = dict()
            tmp_dict[date][name] = msgs[date]

            if not date in tmp_total:
                tmp_total[date] = msgs[date]
            else:
                tmp_total[date] += msgs[date]

    tmp_list = list()
    for date in sorted(tmp_dict.keys()):
        val = tmp_dict[date]
        val['date'] = date
        tmp_list.append(val)

    return tmp_list, tmp_total

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
msgs_per_day = list()
total = 0

for convo in convo_dirs:
    convo_info, messages = get_convo_info(convo)

    total += convo_info['number']
    current_percent.append(convo_info)

    msgs_per_day.append({
        'name': convo_info['name'],
        'messages': get_msgs_day_convo(messages)
    })
    # break

find_current_percentage(current_percent)
msgs_per_day, total_per_day = find_per_day_info(msgs_per_day)

pprint(msgs_per_day)

content = {
    'total': total,
    'current_percent': current_percent
}

writefile = f"{fp}/data.json"

with open(writefile, 'w', encoding='utf-8') as file:
    json.dump(content, file, ensure_ascii=False, indent=2)

print(time.time() - start)
