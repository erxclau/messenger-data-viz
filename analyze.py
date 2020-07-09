import os
import time
import json
from pprint import pprint
from datetime import datetime

start = time.time()

fp = os.path.dirname(os.path.abspath(__file__))
inbox = f"{fp}/messages/inbox"

convo_dirs = [f.name for f in os.scandir(inbox)]

convo_list = list()
total = 0
for convo in convo_dirs:
    tmp = dict()
    tmp['number'] = 0
    tmp['messages_by_date'] = dict()
    msg_files = [f.name for f in os.scandir(f"{inbox}/{convo}") if f.is_file()]
    for msg_file in msg_files:
        f = open(f"{inbox}/{convo}/{msg_file}")
        f = json.load(f)

        title = f['title'].encode('latin-1').decode('utf-8')
        if not 'name' in tmp:
            tmp['name'] = title

        msgs = f['messages']

        count = len(msgs)
        tmp['number'] += count
        total += count

        for msg in msgs:
            t = int(msg['timestamp_ms']) / 1000
            date = datetime.fromtimestamp(t)

            iso = date.isoformat()[:10]

            if not iso in tmp['messages_by_date']:
                tmp['messages_by_date'][iso] = 1
            else:
                tmp['messages_by_date'][iso] += 1

    convo_list.append(tmp)

for d in convo_list:
    d['value'] = d['number'] / total * 100

convo_list.sort(key=lambda x: x['number'], reverse=True)

content = {
    'total': total,
    'conversations': convo_list
}

writefile = f"{fp}/data.json"

with open(writefile, 'w', encoding='utf-8') as file:
    json.dump(content, file, ensure_ascii=False, indent=2)

print(time.time() - start)
