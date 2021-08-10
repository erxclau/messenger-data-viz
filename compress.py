import os
import json

msgdir = f"{os.path.dirname(os.path.abspath(__file__))}/messages"

def compression(indent=None):
    subdirs = ["archived_threads", "filtered_threads", "inbox", "message_requests"]
    for subdir in subdirs:
        dir = f"{msgdir}/{subdir}"
        for (dirpath, dirnames, filenames) in os.walk(dir):
            for filename in filenames:
                absolute = f"{dirpath}/{filename}"
                file = open(absolute)
                if absolute.endswith(".json"):
                    data = json.load(file)
                    with open(absolute, 'w') as x:
                        json.dump(data, x, ensure_ascii=True, indent=indent)


if __name__ == "__main__":
    compression()