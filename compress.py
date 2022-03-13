from os import walk
from os.path import dirname, abspath
from json import load, dump


def compress(indent=None):
    msgdir = f"{dirname(abspath(__file__))}/messages"
    subdirs = ["archived_threads", "filtered_threads",
               "inbox", "message_requests"]
    for subdir in subdirs:
        dir = f"{msgdir}/{subdir}"
        for (dirpath, _, filenames) in walk(dir):
            jsonfiles = [fn for fn in filenames if fn.endswith(".json")]
            for jsonfile in jsonfiles:
                absolute = f"{dirpath}/{jsonfile}"
                with open(absolute, 'r') as f:
                    data = load(f)
                with open(absolute, 'w') as f:
                    dump(data, f, ensure_ascii=True, indent=indent)


if __name__ == "__main__":
    compress()
