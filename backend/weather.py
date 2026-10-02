import os
import asyncio
import httpx
from fastapi import FastAPI, Request, Query
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

app = FastAPI()

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

OWM_API_KEY = os.environ.get("OWM_API_KEY", "your-secret-api-key")

@app.get("/test-connection")
def test_connection():
    return {"status": "connected", "message": "Hello from FastAPI backend!"}

@app.get("/weather")
async def fetch_weather(
    cityInput: str = Query(None),
    latitude: str = Query(None),
    longitude: str = Query(None)
):
    async with httpx.AsyncClient() as client:
        if cityInput:
            geo_url = f"https://api.openweathermap.org/geo/1.0/direct?q={cityInput}&limit=1&appid={OWM_API_KEY}"
            geo_res = await client.get(geo_url)
            
            if geo_res.status_code != 200 or not geo_res.json():
                return {"success": False, "error": f"Could not find location data for '{cityInput}'."}
            
            geo_data = geo_res.json()
            lat = geo_data[0]["lat"]
            lon = geo_data[0]["lon"]
        else:
            lat = latitude
            lon = longitude
        if lat is None or lon is None:
            return {"success": False, "error": "Missing city name or coordinates."}

        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OWM_API_KEY}&units=metric"
        forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={OWM_API_KEY}&units=metric"
        aqi_url = f"https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={OWM_API_KEY}"
    
        try:
            weather_task = client.get(weather_url)
            forecast_task = client.get(forecast_url)
            aqi_task = client.get(aqi_url)

            weather_res, forecast_res, aqi_res = await asyncio.gather(weather_task, forecast_task, aqi_task)

            if weather_res.status_code != 200 or forecast_res.status_code != 200 or aqi_res.status_code != 200:
                return {"success": False, "error": "Failed to fetch data from weather service."}

            return {
                "success": True,
                "data": {
                    "current": weather_res.json(),
                    "forecast": forecast_res.json(),
                    "aqi": aqi_res.json()
                }
            }

        except Exception as e:
            return {"success": False, "error": f"Internal server error: {str(e)}"}
        
@app.get("/suggestions")
async def get_city_suggestions(query: str = Query(None)):
    if not query or len(query) < 3:
        return {"success": False, "error": "Query must be at least 3 characters."}

    async with httpx.AsyncClient() as client:
        geo_url = f"https://api.openweathermap.org/geo/1.0/direct?q={query}&limit=5&appid={OWM_API_KEY}"
        
        try:
            response = await client.get(geo_url)
            if response.status_code != 200:
                return {"success": False, "error": "Failed to look up cities."}
                
            return {"success": True, "data": response.json()}
            
        except Exception as e:
            return {"success": False, "error": f"Server error: {str(e)}"}

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
    )