import os
import time
import json
from pprint import pprint
from datetime import datetime


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

        # print(msgs)

        # for msg in msgs:
        #     t = int(msg['timestamp_ms']) / 1000
        #     date = datetime.fromtimestamp(t)

        #     iso = date.isoformat()[:10]

        #     if not iso in tmp['messages_by_date']:
        #         tmp['messages_by_date'][iso] = 1
        #     else:
        #         tmp['messages_by_date'][iso] += 1

    return tmp, messages


start = time.time()

fp = os.path.dirname(os.path.abspath(__file__))
inbox = f"{fp}/messages/inbox"

convo_dirs = [f.name for f in os.scandir(inbox)]

current_percent = list()
total = 0

for convo in convo_dirs:
    percent_info, messages = get_convo_info(convo)
    total += percent_info['number']
    current_percent.append(percent_info)
    # break

for d in current_percent:
    d['percent'] = d['number'] / total * 100

current_percent.sort(key=lambda x: x['number'], reverse=True)

content = {
    'total': total,
    'current_percent': current_percent
}

writefile = f"{fp}/data.json"

with open(writefile, 'w', encoding='utf-8') as file:
    json.dump(content, file, ensure_ascii=False, indent=2)

print(time.time() - start)
