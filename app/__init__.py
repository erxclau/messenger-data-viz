import os
import json
from pprint import pprint

# from flask import Flask, request, redirect, session, render_template, url_for, flash
from flask import Flask, render_template

app = Flask(__name__)
app.secret_key = os.urandom(32)
fp = os.path.dirname(os.path.abspath(__file__))


@app.route('/')
def root():
    return render_template('index.html')


@app.route('/data')
def data():
    df = open(f"{fp}/../data.json", encoding='latin-1')
    df = df.read().encode('latin-1').decode('utf-8')
    return df


if __name__ == "__main__":
    app.debug = True
    app.run()
