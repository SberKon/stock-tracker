from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import time

app = FastAPI()

class StockItem(BaseModel):
    name: str
    quantity: str

class SectionResult(BaseModel):
    section: str
    items: list[StockItem]

def parse_garden_section(section):
    title = section.find('h2').text.strip()
    items = []
    
    for item in section.find_all('li'):
        name = item.find('span').text.split('x')[0].strip()
        quantity = item.find('span', class_='text-gray-400').text.strip()
        items.append(StockItem(name=name, quantity=quantity))
    
    return SectionResult(section=title, items=items)

@app.get("/api/garden", response_model=list[SectionResult])
def get_garden_stock():
    url = "https://www.vulcanvalues.com/grow-a-garden/stock"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error fetching garden stock: {str(e)}")

    soup = BeautifulSoup(response.text, 'html.parser')
    stock_sections = soup.find_all('div', class_='grid-cols-1')[0].find_all('div', recursive=False)
    
    results = []
    for section in stock_sections:
        try:
            result = parse_garden_section(section)
            results.append(result)
        except Exception as e:
            continue
        
    return results
