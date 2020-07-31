# messenger-data-viz

## Description

This repository contains code to analyze and visualize your Facebook Messenger conversations using various Python packages and D3.js.

## Instructions

### Getting Data From Facebook

1. Open Facebook and click on "Settings" or "Settings and Privacy".
2. Click on "Your Facebook Information".
3. Click on "Download Your Information".
4. Deselect all options in "Your Information" except for "Messages".
5. Select a date range for the messages you would like to analyze.
6. Select JSON as the format.
7. Select low media quality to reduce the file size of images and videos.
8. Click "Create File".
9. Facebook will send you two emails: one confirming that you requested for data and another one alerting you when your file has been created. This may take several minutes.
10. Click on the "Available Copies" tab to download your data. The folder will be called `facebook-<YOUR_USERNAME>` These copies expire four days after they are created.
11. Extract the files from the downloaded zipped folder.

For reference, when I downloaded around 8 years of data, I ended up with over 2 gigabytes of data. And I didn't extensively use Messenger for those 8 years.

### Cloning the repository

Run the following command in your terminal:

```shell
git clone https://github.com/ericlau00/messenger-data-viz.git
```

Alternatively, download the zip file for this repository which can be found by clicking on the green "Code" button at the top of the page.

Move into the repository by running the following:

```shell
cd messenger-data-viz
```

### Setting Up Your Python Environment

- Download a version of python3 and pip.
- To prevent conflicts with globally installed packages, it is recommended to run everything in a virtual environment.

#### Setting Up a Virtual Environment

- Run `python -V` or `python3 -V` and in the following steps, use the python command that says you are using a version of python3.
- Run `python -m venv venv` to create a virtual environment.
- Enter your virtual environment by running:
  - **Windows**:
    - Make sure your terminal allows you to execute scripts. Read about Execution Policies [here](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-7).
    - `.\venv\Scripts\activate`
  - **Linux or macOS**:
    - `. venv/bin/activate`
- To exit your virtual environment, run `deactivate`.

#### Installing Dependencies

- Install the necessary dependencies by running the following command in your virtual environment:

```shell
pip install -r requirements.txt
```

- Install the corpora (i.e. collection of written texts) necessary to process natural language with NLTK by running the following:

```shell
python -m nltk.downloader stopwords
```

### Using Your Data

- Move the `messages` folder from `facebook-<YOUR_USERNAME>` into the root level of this repository.
- The script will only analyze messages in the `inbox` folder (i.e. not `archived_threads` or `message_requests`).
  - If you'd like to analyze `archived_threads` or `message_requests` too, simply move the conversation folders inside those folders into `inbox`.
  - If there are conversations you do not want to analyze, move them out of `inbox` or delete them.
- Run the following commands in your virtual environment
  - `python analyze.py`
  <!-- - `python -m http.server 5000 --bind 127.0.0.1` -->
  - `python app/__init__.py` on Linux / macOS or `python app\__init__.py` on Windows.
- Go to <http://127.0.0.1:5000/>.
