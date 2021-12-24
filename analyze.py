import os
from time import time
from json import load, dump
from datetime import datetime, timedelta
from functools import reduce

import nltk
import emoji
import regex

fp = os.path.dirname(os.path.abspath(__file__))
inbox = f"{fp}/messages/inbox"


def strtodate(string: str):
    return datetime.fromisoformat(string)


def find_percentage_by_day(data, totals):
    for c_id in data.keys():
        convo = data[c_id]
        convo['percent_per_day'] = dict()
        for date in convo['msgs_by_date'].keys():
            percent = convo['msgs_by_date'][date] / totals[date] * 100
            convo['percent_per_day'][date] = percent


def find_per_info(data):
    increment = 'daily'
    stack_msgs_by_date = dict()
    total_by_day = dict()

    names = {key: data[key]['name'] for key in data.keys()}

    convo_ids = data.keys()
    for c_id in convo_ids:

        msgs = data[c_id]['msgs_by_date']
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


def parse(messages):
    dates: dict[str, int] = dict()
    minutes = [0 for _ in range(60 * 24)]
    split_dict: dict[str, int] = dict()

    for message in messages:
        t = int(message['timestamp_ms']) / 1000
        d = datetime.fromtimestamp(t)
        date = d.date().isoformat()

        dates[date] = dates.get(date, 0) + 1
        minutes[(d.hour * 60) + d.minute] += 1

        name = message['sender_name']
        split_dict[name] = split_dict.get(name, 0) + 1

    split = [{
        'name': name.encode('latin-1').decode('utf-8'),
        'number': split_dict[name],
        'percent': split_dict[name] / len(messages) * 100
    } for name in split_dict.keys()]

    return dates, minutes, split


def find_current_percentage(data, total):
    for d in data:
        d['percent'] = d['number'] / total * 100

    return sorted(data, key=lambda x: x['number'], reverse=True)


def get_emoji_analysis(content: list[str]):
    text = " ".join(content)
    emoji_dict: list[str, int] = dict()
    emoji_list: list[str] = list()
    count = 0
    for word in regex.findall(r'\X', text):
        if any(char in emoji.UNICODE_EMOJI for char in word):
            count += 1
            emoji_dict[word] = emoji_dict.get(word, 0) + 1
            emoji_list.append(word)
    return emoji_dict, emoji_list, count


def generate_count_list(tokens, limit):
    vocab = nltk.FreqDist(tokens)
    common = vocab.most_common(limit)
    return [{'text': word[0], 'count': word[1]} for word in common if word[1] > 1]


def get_text_length(content):
    length = reduce(lambda acc, text: acc + len(text), content, 0)
    return length / len(content) if len(content) > 0 else 0


def get_lang_processing(messages: list[dict]):
    content: list[str] = [d['content'].encode('latin-1').decode('utf-8')
                          for d in messages if 'content' in d]

    text_length = get_text_length(content)

    emoji_dict, emoji_list, emoji_count = get_emoji_analysis(content)

    common_vocab = nltk.FreqDist(content)
    common_count = generate_count_list(common_vocab, 100)
    common_total = reduce(lambda acc, t: acc + t['count'], common_count, 0)

    return {
        'emoji': {
            'breakdown': emoji_dict,
            'list': emoji_list,
            'count': emoji_count
        },
        'text_count': {
            'count': common_count,
            'total': common_total
        },
        'text_length': text_length
    }


def find_streak(dates: list[str]):
    dates: list[datetime] = sorted([strtodate(date) for date in dates])
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
    return {
        'length': longest_streak,
        'start': longest_start.date().isoformat(),
        'end': longest_end.date().isoformat()
    }


def get_max_day(msgs_by_date: dict[str, int]):
    date = max(msgs_by_date, key=msgs_by_date.get)
    value = msgs_by_date[date]
    return {'date': date, 'value': value}


def get_conversation(directory: str):
    name = str()
    messages: list[dict] = list()

    path = f"{inbox}/{directory}"
    msg_files = [f.name for f in os.scandir(path) if f.is_file()]

    for msg_file in msg_files:
        with open(f"{path}/{msg_file}", encoding="latin-1") as file:
            f = load(file)
            if not name:
                name = str(f['title'].encode('latin-1').decode('utf-8'))
            messages.extend(f['messages'])

    return name, messages


def aggregate_data():
    convo_dirs = [f.name for f in os.scandir(inbox)]

    current_percent = list()
    conversations = dict()
    total = 0

    for convo in convo_dirs:
        name, messages = get_conversation(convo)
        print('Analyzing messages from', name)

        subtotal = len(messages)
        total += subtotal
        current_percent.append({'number': subtotal, 'name': name})

        msgs_by_date, msgs_by_minute, msg_split = parse(messages)
        streak_info = find_streak(list(msgs_by_date.keys()))
        lang_processing = get_lang_processing(messages)
        max_msgs_in_day = get_max_day(msgs_by_date)

        conversations[convo] = {
            'name': name,
            'msgs_by_date': msgs_by_date,
            'msgs_by_minute': msgs_by_minute,
            'split': msg_split,
            'emoji': lang_processing['emoji'],
            'text_count': lang_processing['text_count'],
            'text_length': lang_processing['text_length'],
            'streak': streak_info,
            'max': max_msgs_in_day,
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
    start = time()

    writefile = f"{fp}/data.json"

    data = aggregate_data()
    content = create_data_dump(data)

    with open(writefile, 'w', encoding='utf-8') as file:
        dump(content, file, ensure_ascii=False)

    print(time() - start, "seconds")
