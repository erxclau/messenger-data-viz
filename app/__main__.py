import os

from flask import Flask, render_template

app = Flask(__name__)
app.secret_key = os.urandom(32)


@app.route('/')
def root():
    return render_template('index.html')


@app.route('/data')
def data():
    filepath = os.path.dirname(os.path.abspath(__file__))
    f = open(f"{filepath}/../data.json", encoding='latin-1')
    datajson = f.read().encode('latin-1').decode('utf-8')
    f.close()
    return datajson


if __name__ == "__main__":
    app.debug = True
    app.run()
