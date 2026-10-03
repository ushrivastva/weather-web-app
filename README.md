# 🌤️ Weather Web App

A full-stack weather application built with **Python and FastAPI** that provides real-time weather information based on a city or geographic coordinates.

## 🚀 Features

- 🌍 Search weather by city
- 📍 Support for latitude and longitude
- 🌡️ Display current weather information
- 🔗 Integration with OpenWeather API
- ⚡ FastAPI backend
- 🌐 HTML, CSS and JavaScript frontend
- 🔄 Frontend–backend communication using REST APIs
- ❌ Error handling for invalid locations and missing data
- 🔐 API key stored using environment variables

## 🛠️ Tech Stack

### Backend
- Python
- FastAPI
- HTTPX

### Frontend
- HTML
- CSS
- JavaScript

### API
- OpenWeather API

### Development Tools
- Git
- GitHub
- uv

## 📁 Project Structure

```text
weather-web-app/
│
├── backend/
│   └── weather.py
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── .gitignore
├── .python-version
├── pyproject.toml
├── uv.lock
└── README.md
```

# **⚙️ How It Works**
```text
User
  │
  ▼
Frontend
HTML + CSS + JavaScript
  │
  │ HTTP Request
  ▼
FastAPI Backend
  │
  ▼
OpenWeather API
  │
  ▼
Weather Data
  │
  ▼
Frontend
```
# **🔧 Installation**

## 1.Clone the repositry
```bash
git clone https://github.com/ushrivastva/weather-web-app.git
```
## 2.Move into the project
```bash
cd weather-web-app
```
## 3.Create a virtual enviroment
```bash
python -m venv .venv
```
** Activate it on Windows: **
```bash
.venv\Scripts\activate
```
## 4.Install dependencies
if you are using `uv`:
```bash
uv sync
```
or install the dependencies with pip:
```bash
pip install -r requirements.txt
```
 ##🔑 Enviroment Variables
 
Create a `.env` file or configure the enviroment variable directly.

```bash
OWN_API_KEY=your_openweather_api_key
```
The API key should **never be committed to GitHub.**

Make sure `.env` is included in `.gitignore`.

##▶️Run the Application

Start the FastAPI server:
```bash
uvicorn backend.weather:app --reload
```
Then Open:
```bash
http://127.0.0.1:800
```
##📍API Example

###Weather endpoint:
```bash
GET /weather
```
###Example using a city:
```bash
/weather?cityInput=Delhi
```
###Using geographic coordinates:
```bash
/weather?latitude=28.6139&longitude=77.2090
```
##📚What I Learned

###Building this project helped me understand:

• FastAPI application structure
• Creating API routes 
• Handling query parameters
• Calling external APIs with HTTPX
• Frontend and Backend communication
• Working with JSON responses
• Git and GitHub workflow

##🧑‍💻Author

###USHRIVASTVA

Aspiring Software Engineer focused on:

• Python
• FastAPI
• PostgreSQL
• System Design
• Backend Engineering
• AI/ML

##🧾License

This project is for learning and educational purposes.

