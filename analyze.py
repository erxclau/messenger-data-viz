import os
import time
import json
from pprint import pprint

start = time.time()

fp = os.path.dirname(os.path.abspath(__file__))
inbox = f"{fp}/messages/inbox"

convo_dirs = [f.name for f in os.scandir(inbox)]

convo_list = list()
total = 0
for convo in convo_dirs:
    tmp = dict()
    msg_files = [f.name for f in os.scandir(f"{inbox}/{convo}") if f.is_file()]
    for msg_file in msg_files:
        f = open(f"{inbox}/{convo}/{msg_file}")
        f = json.load(f)

        title = f['title'].encode('latin-1').decode('utf-8')
        if not 'title' in tmp:
            tmp['title'] = title

        count = len(f['messages'])
        if not 'count' in tmp:
            tmp['count'] = count
        else:
            tmp['count'] += count
        total += count
    convo_list.append(tmp)

for d in convo_list:
    d['percent'] = d['count'] / total

content = {
    'total': total,
    'conversations': convo_list
}

writefile = f"{fp}/data.json"

with open(writefile, 'w', encoding='utf-8') as file:
    json.dump(content, file, ensure_ascii=False)

print(time.time() - start)
