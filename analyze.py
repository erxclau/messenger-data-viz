from os import scandir
from os.path import dirname, abspath
from time import time
from json import load, dump
from datetime import datetime, timedelta
from functools import reduce

from nltk import FreqDist
from emoji import UNICODE_EMOJI
from regex import findall


def generate_count_list(tokens, limit):
    vocab = FreqDist(tokens)
    common = vocab.most_common(limit)
    return [{'text': word[0], 'count': word[1]} for word in common if word[1] > 1]


def decode_str(text: str):
    return text.encode("latin-1").decode("utf-8")


def is_content(message: dict):
    msg_type: str = message.get("type", "")
    return msg_type == "Generic" or msg_type == "Share"


def strtodate(string: str):
    return datetime.fromisoformat(string)


class Conversation():

    def __init__(self, path: str):
        self.path: str = path
        self.name: str = str()
        self.messages: list[dict] = list()
        self.dates: dict[str, int] = dict()
        self.minutes: list[int] = [0 for _ in range(60 * 24)]
        self.senders: list[dict] = list()

        self.emoji: dict[str, int] = dict()
        self.emoji_count = 0
        self.avg_text_length = 0

        files = [f.name for f in scandir(path) if f.is_file()]

        for file in files:
            with open(f"{path}/{file}", encoding="latin-1") as f:
                conversation = load(f)
                if not self.name:
                    self.set_name(conversation["title"])
                msgs = conversation['messages']
                self.messages.extend([m for m in msgs if is_content(m)])

    def set_name(self, title: str):
        self.name = decode_str(title)

    def analyze(self):
        self.parse_messages()
        self.process_language()
        self.find_streak()
        self.find_max()

    def parse_messages(self):
        split: dict[str, int] = dict()

        for message in self.messages:
            t = int(message["timestamp_ms"]) / 1000
            d = datetime.fromtimestamp(t)
            date = d.date().isoformat()

            self.dates[date] = self.dates.get(date, 0) + 1
            self.minutes[(d.hour * 60) + d.minute] += 1

            name = message["sender_name"]
            split[name] = split.get(name, 0) + 1

        self.senders = [{
            'name': decode_str(name),
            'number': split[name],
            'percent': split[name] / len(self.messages) * 100
        } for name in split.keys()]

    def get_avg_text_length(self):
        content = self.content
        length = reduce(lambda acc, text: acc + len(text), content, 0)
        self.avg_text_length = length / len(content) if len(content) > 0 else 0

    def analyze_emoji(self):
        text = " ".join(self.content)
        for word in findall(r'\X', text):
            if any(char in UNICODE_EMOJI for char in word):
                self.emoji_count += 1
                self.emoji[word] = self.emoji.get(word, 0) + 1

    def process_language(self):
        self.content: list[str] = [decode_str(d['content'])
                                   for d in self.messages if 'content' in d]

        self.get_avg_text_length()
        self.analyze_emoji()

        common_vocab = FreqDist(self.content)
        self.common_count = generate_count_list(common_vocab, 100)
        self.common_total = reduce(
            lambda acc, t: acc + t['count'], self.common_count, 0)

    def find_streak(self):
        dates = sorted([strtodate(date) for date in self.dates.keys()])
        one_day = timedelta(days=1)
        streak = longest_streak = 1
        start = end = longest_start = longest_end = dates[0]
        for i in range(len(dates) - 1):
            diff = dates[i+1] - dates[i]
            if diff <= one_day:
                streak += 1
                end = dates[i+1]
                if streak >= longest_streak:
                    longest_streak = streak
                    longest_start = start
                    longest_end = end
            else:
                streak = 1
                start = dates[i+1]
                end = dates[i+1]
        self.streak = {
            'length': longest_streak,
            'start': longest_start.date().isoformat(),
            'end': longest_end.date().isoformat()
        }

    def find_max(self):
        date = max(self.dates, key=self.dates.get)
        value = self.dates[date]
        self.max = {'date': date, 'value': value}

    def get_analysis(self):
        self.analyze()
        return {
            'name': self.name,
            'dates': self.dates,
            'minutes': self.minutes,
            'senders': self.senders,
            'emoji': {
                'count': self.emoji_count,
                'emojis': self.emoji
            },
            'text_count': {
                'count': self.common_count,
                'total': self.common_total
            },
            'text_length': self.avg_text_length,
            'streak': self.streak,
            'max': self.max,
            'total': len(self.messages)
        }


def find_percentage_by_day(data, totals):
    for c_id in data.keys():
        convo = data[c_id]
        convo['percent_per_day'] = dict()
        for date in convo['dates'].keys():
            percent = convo['dates'][date] / totals[date] * 100
            convo['percent_per_day'][date] = percent


def find_per_info(data):
    increment = 'daily'
    stack_msgs_by_date = dict()
    total_by_day = dict()

    names = {key: data[key]['name'] for key in data.keys()}

    convo_ids = data.keys()
    for c_id in convo_ids:

        msgs = data[c_id]['dates']
        for date in msgs.keys():
            if not date in stack_msgs_by_date:
                stack_msgs_by_date[date] = dict()

                for id in convo_ids:
                    stack_msgs_by_date[date][id] = 0

            stack_msgs_by_date[date][c_id] = msgs[date]

            if not date in total_by_day:
                total_by_day[date] = msgs[date]
            else:
                total_by_day[date] += msgs[date]

    keys = list(sorted(stack_msgs_by_date.keys()))

    i = 0
    length = len(keys) - 1
    while i < length:
        currD = strtodate(keys[i])
        nextD = strtodate(keys[i+1])
        diff = nextD - currD
        distance = diff.days
        for j in range(distance - 1):
            tmp = currD + timedelta(j + 1)
            string = tmp.date().isoformat()
            stack_msgs_by_date[string] = dict()
            for id in convo_ids:
                stack_msgs_by_date[string][id] = 0
            keys.insert(i+j+1, string)
        length = len(keys) - 1
        i += distance

    dates = [strtodate(date) for date in keys]
    if len(dates) > 365 * 2:
        increment = 'weekly'
        one_day = timedelta(days=1)
        while dates[0].weekday() != 6:
            day_before = dates[0] - one_day
            string = day_before.date().isoformat()
            stack_msgs_by_date[string] = dict()
            for id in convo_ids:
                stack_msgs_by_date[string][id] = 0
            dates.insert(0, day_before)
        curr_week = dates[0]
        for i in range(len(dates)):
            if dates[i].weekday() == 6:
                curr_week = dates[i]
            else:
                week_str = curr_week.date().isoformat()
                curr_str = dates[i].date().isoformat()

                for name in stack_msgs_by_date[curr_str].keys():
                    stack_msgs_by_date[week_str][name] += stack_msgs_by_date[curr_str][name]

                stack_msgs_by_date.pop(curr_str)

    msg_list = list()
    for date in sorted(stack_msgs_by_date.keys()):

        count_val = stack_msgs_by_date[date]
        count_val = {names[key]: count_val[key] for key in count_val}
        count_val['date'] = date

        msg_list.append(count_val)

    return increment, msg_list, total_by_day


def get_data(inbox: str):
    conversations: dict[str, dict] = dict()
    total: int = 0

    paths: list[str] = [f.name for f in scandir(inbox)]
    for path in paths:
        c = Conversation(f'{inbox}/{path}')

        subtotal = len(c.messages)
        total += subtotal

        print('Analyzing messages from', c.name)
        conversations[path] = c.get_analysis()

    for c in conversations:
        conversations[c]['percent'] = conversations[c]['total'] / total * 100

    increment, msgs_per, total_per_day = find_per_info(conversations)
    find_percentage_by_day(conversations, total_per_day)

    return {
        'total': total,
        'individual': conversations,
        'collective': {
            'data': msgs_per,
            'increment': increment
        },
    }


if __name__ == "__main__":
    start = time()

    filepath = dirname(abspath(__file__))
    inbox = f"{filepath}/messages/inbox"
    writefile = f"{filepath}/data.json"

    data = get_data(inbox)

    with open(writefile, 'w', encoding='utf-8') as file:
        dump(data, file, ensure_ascii=False)

    print(time() - start, "seconds")
