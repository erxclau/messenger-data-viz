import os
import json
from pprint import pprint

# from flask import Flask, request, redirect, session, render_template, url_for, flash
from flask import Flask, render_template

app = Flask(__name__)
app.secret_key = os.urandom(32)
fp = os.path.dirname(os.path.abspath(__file__))

df = open(f"{fp}/../data.json", encoding='latin-1')
df = df.read().encode('latin-1').decode('utf-8')


@app.route('/')
def root():
    return render_template('index.html')


@app.route('/data')
def data():
    return df


@app.route('/view/<id>')
def individual_view(id):
    return render_template('individual.html')


@app.route('/data/<id>')
def individual_data(id):
    f = json.loads(df)
    return f['individual_msgs_per_day'][id]


if __name__ == "__main__":
    app.debug = True
    app.run()
