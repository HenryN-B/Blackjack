from bs4 import BeautifulSoup
import requests

def get_currency(in_cur, out_curr):
    url = f"https://www.x-rates.com/calculator/?from={in_cur}&to={out_curr}&amount=1"
    content = requests.get(url).text
    soup = BeautifulSoup(content, "html.parser")
    rate = soup.find("span", class_="ccOutputRslt").getText()
    rate = rate.replace(",", "")  # Remove thousands separator
    rate = float(rate[0:-4])
    return rate