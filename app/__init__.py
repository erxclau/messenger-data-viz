import os

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
    f = open(f"{fp}/../data.json", encoding='latin-1')
    return f.read().encode('latin-1').decode('utf-8')


if __name__ == "__main__":
    app.debug = True
    app.run()
