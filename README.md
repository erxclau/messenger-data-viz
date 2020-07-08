# messenger-data-viz

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
9. Facebook will send you two emails: one confirming that you requested for data and another one alerting you when your file has been created.
10. Click on the "Available Copies" tab to download your data. These copies expire four days after they are created.

For reference, when I downloaded around 8 years of data, I ended up with over 2 gigabytes of data. And I didn't extensively use Messenger for those 8 years.

## Setting up your Python Environment

- Download a version of python3 and pip.
- To prevent conflicts with globally installed packages, it is recommended to run everything in a virtual environment.

### Setting Up a Virtual Environment

- Run `python -V` or `python3 -V` and in the following steps, use the python command that says you are using a version of python3.
- Run `python -m venv venv` to create a virtual environment.
- Enter your virtual environment by running:
  - **Windows**:
    - Make sure your terminal allows you to execute scripts. Read about Execution Policies [here](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-7).
    - `.\venv\Scripts\activate`
  - **Linux or macOS**:
    - `. venv/bin/activate`
- To exit your virtual environment, run `deactivate`.

### Installing Dependencies

- Install necessary dependencies by running the following command in your virtual environment:

```bash
pip install -r requirements.txt
```
