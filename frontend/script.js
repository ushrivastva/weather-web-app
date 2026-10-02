document.addEventListener("DOMContentLoaded", () => {
    let clockInterval = null;
    
    const searchForm = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');
    const geolocationBtn = document.getElementById('geolocation-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const weatherContent = document.getElementById('weather-content');
    const errorModal = document.getElementById('error-modal');
    const errorMessageEl = document.getElementById('error-message');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const animationContainer = document.getElementById('animation-container');
    const suggestionsBox = document.getElementById('suggestions-box');
    const cityNameEl = document.getElementById('city-name');
    const currentDateEl = document.getElementById('current-date');
    const currentTimeEl = document.getElementById('current-time');
    const currentTempEl = document.getElementById('current-temp');
    const currentWeatherDescEl = document.getElementById('current-weather-desc');
    const currentWeatherIconEl = document.getElementById('current-weather-icon');
    const forecastContainer = document.getElementById('forecast-container');
    const sunriseTimeEl = document.getElementById('sunrise-time');
    const sunsetTimeEl = document.getElementById('sunset-time');
    const humidityEl = document.getElementById('humidity');
    const windSpeedEl = document.getElementById('wind-speed');
    const feelsLikeEl = document.getElementById("feels-like");
    const pressureEl = document.getElementById('pressure');
    const visibilityEl = document.getElementById('visibility');
    const airQualityEl = document.getElementById('air-quality');
    const healthRecommendationsEl = document.getElementById('health-recommendations');

    const backgroundImageDay = {
        Clear: "https://images.unsplash.com/photo-1549660567-54419f7fd629?q=80&w=2241&auto=format&fit=crop",
        Clouds: "https://images.unsplash.com/photo-1661695098088-2b5ddc25509b?q=80&w=2071&auto=format&fit=crop",
        Rain: "https://images.unsplash.com/photo-1496034663057-6245f11be793?q=80&w=2070&auto=format&fit=crop",
        Drizzle: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2948&auto=format&fit=crop",
        Thunderstorm: "https://images.unsplash.com/photo-1594760467013-64ac2b80b7d3?q=80&w=2232&auto=format&fit=crop",
        Snow: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?q=80&w=2108&auto=format&fit=crop",
        Mist: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop",
        Default: "https://images.unsplash.com/photo-1586521995568-39abaa0c2311?q=80&w=2940&auto=format&fit=crop",
    };
    
    const backgroundImageNight = {
        Clear: "https://images.unsplash.com/photo-1624777771435-913a1b979be2?q=80&w=2070&auto=format&fit=crop",
        Clouds: "https://images.unsplash.com/photo-1533983272060-edb6f56af634?q=80&w=2223&auto=format&fit=crop",
        Rain: "https://images.unsplash.com/photo-1625726376374-1e6768c03ec0?q=80&w=2071&auto=format&fit=crop",
        Drizzle: "https://images.unsplash.com/photo-1502657877623-f66bf489d236?q=80&w=2069&auto=format&fit=crop",
        Thunderstorm: "https://images.unsplash.com/photo-1526516417830-11570179d642?q=80&w=2074&auto=format&fit=crop",
        Snow: "https://images.unsplash.com/photo-1676363707718-eabe464ca9ae?q=80&w=1674&auto=format&fit=crop",
        Mist: "https://images.unsplash.com/photo-1507149677524-254e3ebb240f?q=80&w=2071&auto=format&fit=crop",
        Default: "https://images.unsplash.com/photo-1574610758891-5b809b6e6e2e?q=80&w=2952&auto=format&fit=crop"
    };

    const fetchWeather = async ({ lat, lon, city }) => {
        showLoading();
        if (clockInterval) clearInterval(clockInterval);
        
        try {
            let url = "/weather?";
            if (city) {
                url += `cityInput=${encodeURIComponent(city)}`;
            } else {
                url += `latitude=${lat}&longitude=${lon}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch weather data.");
            
            const result = await response.json();
            if (!result.success) {
                showError(result.error);
                return;
            }
            
            const { current, forecast, aqi } = result.data;
            updateUI(current, forecast, aqi);
            
        } catch (error) {
            console.error("Weather data fetch error:", error);
            showError(error.message);
        } finally {
            hideLoading();
        }
    };

    const updateUI = (weather, forecast, aqi) => {
        let weatherConditionForBg = weather.weather[0].main;
        if (weatherConditionForBg === "Clouds" && weather.clouds.all < 20) {
            weatherConditionForBg = "Clear";
        }
        
        updateClock(weather.timezone);
        clockInterval = setInterval(() => updateClock(weather.timezone), 1000);

        const currentTimeUTC = weather.dt;
        const sunriseUTC = weather.sys.sunrise;
        const sunsetUTC = weather.sys.sunset;
        const isNight = (currentTimeUTC < sunriseUTC || currentTimeUTC > sunsetUTC);

        const backgroundSet = isNight ? backgroundImageNight : backgroundImageDay;
        document.body.style.backgroundImage = `url('${backgroundSet[weatherConditionForBg] || backgroundSet.Default}')`;

        if (currentWeatherIconEl) currentWeatherIconEl.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;
        if (cityNameEl) cityNameEl.textContent = `${weather.name}, ${weather.sys.country}`;
        
        const localDate = new Date((weather.dt + weather.timezone) * 1000);
        if (currentDateEl) currentDateEl.textContent = localDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
        if (currentTempEl) currentTempEl.textContent = `${Math.round(weather.main.temp)}°`;
        if (currentWeatherDescEl) currentWeatherDescEl.textContent = weather.weather[0].description;

        const formatTime = (timestamp) => new Date(timestamp * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" }); 
        if (sunriseTimeEl) sunriseTimeEl.textContent = formatTime(weather.sys.sunrise + weather.timezone);
        if (sunsetTimeEl) sunsetTimeEl.textContent = formatTime(weather.sys.sunset + weather.timezone);

        if (humidityEl) humidityEl.textContent = `${weather.main.humidity}%`;
        if (windSpeedEl) windSpeedEl.textContent = `${(weather.wind.speed * 3.6).toFixed(1)} km/h`;
        if (feelsLikeEl) feelsLikeEl.textContent = `${Math.round(weather.main.feels_like)}°`;
        if (pressureEl) pressureEl.textContent = `${weather.main.pressure} hPa`;
        if (visibilityEl) visibilityEl.textContent = `${(weather.visibility / 1000).toFixed(1)} km`;

        const aqiValue = aqi.list[0].main.aqi;
        const aqiInfo = getAqiInfo(aqiValue);
        if (airQualityEl) {
            airQualityEl.textContent = aqiInfo.text;
            airQualityEl.className = `font-bold px-3 py-1 rounded-full text-sm ${aqiInfo.color}`;
        }
        if (healthRecommendationsEl) healthRecommendationsEl.innerHTML = `<p class="text-gray-200 text-sm">${aqiInfo.recommendation}</p>`;

        const dailyForecasts = processForecast(forecast.list);
        if (forecastContainer) {
            forecastContainer.innerHTML = "";
            dailyForecasts.forEach(day => {
                const card = document.createElement("div");
                card.className = `p-4 rounded-2xl text-center card backdrop-blur-xl`;
                card.innerHTML = `
                    <p class="font-bold text-lg">${new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}</p>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}" class="w-16 h-16 mx-auto">
                    <p class="font-semibold">${Math.round(day.main.temp_max)}° / ${Math.round(day.main.temp_min)}°</p>
                `;
                forecastContainer.appendChild(card);
            });
        }

        updateNightAnimation(isNight, weatherConditionForBg);
    };

    const updateNightAnimation = (isNight, condition) => {
        if (!animationContainer) return;
        animationContainer.innerHTML = "";
        if (!isNight) return;

        if (condition === "Clear") {
            for (let i = 0; i < 20; i++) {
                const star = document.createElement("div");
                star.className = "star";
                star.style.top = `${Math.random() * 100}%`;
                star.style.left = `${Math.random() * 100}%`;
                star.style.width = `${Math.random() * 2 + 1}px`;
                star.style.height = star.style.width;
                star.style.animationDelay = `${Math.random() * 5}s`;
                star.style.animationDuration = `${Math.random() * 3 + 2}s`;
                animationContainer.appendChild(star);
            }
        } else if (condition === "Rain" || condition === "Drizzle") {
            for (let i = 0; i < 50; i++) {
                const drop = document.createElement("div");
                drop.className = "rain-drop";
                drop.style.left = `${Math.random() * 100}%`;
                drop.style.animationDelay = `${Math.random() * 2}s`;
                drop.style.animationDuration = `${Math.random() * 0.5 + 0.5}s`;
                animationContainer.appendChild(drop);
            }
        } else if (condition === "Snow") {
            for (let i = 0; i < 50; i++) {
                const flake = document.createElement("div");
                flake.className = "snowFlake";
                flake.style.left = `${Math.random() * 100}%`;
                flake.style.animationDelay = `${Math.random() * 10}s`;
                flake.style.animationDuration = `${Math.random() * 5 + 5}s`;
                flake.style.opacity = `${Math.random() * 0.5 + 0.3}`;
                animationContainer.appendChild(flake);
            }
        }
    };

    const getAqiInfo = (aqi) => {
        switch (aqi) {
            case 1: return { text: "Good", color: 'bg-green-500 text-white', recommendation: "Air quality is great. It's a perfect day to be active outside." };
            case 2: return { text: 'Fair', color: 'bg-yellow-500 text-black', recommendation: "Air quality is acceptable. Unusually sensitive people should consider reducing prolonged outdoor exertion." };
            case 3: return { text: 'Moderate', color: 'bg-orange-500 text-white', recommendation: "Sensitive groups may experience health effects. The general public is less likely to be affected." };
            case 4: return { text: 'Poor', color: 'bg-red-500 text-white', recommendation: "Everyone may begin to experience health effects. Members of sensitive groups may experience more severe effects." };
            case 5: return { text: 'Very Poor', color: 'bg-purple-700 text-white', recommendation: "Health alert: The risk of health effects is increased for everyone. Avoid outdoor activities." };
            default: return { text: 'Unknown', color: 'bg-gray-500 text-white', recommendation: "Air quality data is not available at the moment." };
        }
    };

    
    const processForecast = (forecastList) => {
        const dailyData = {};
        if (!forecastList) return [];
        
        forecastList.forEach(entry => {
            const date = entry.dt_txt.split(' ')[0]; 
            if (!dailyData[date]) {
                dailyData[date] = { temp_max: [], temp_min: [], icons: {}, entry: null };
            }
            dailyData[date].temp_max.push(entry.main.temp_max);
            dailyData[date].temp_min.push(entry.main.temp_min);
            
            const icon = entry.weather[0].icon;
            dailyData[date].icons[icon] = (dailyData[date].icons[icon] || 0) + 1;
            
            if (!dailyData[date].entry || entry.dt_txt.includes("12:00:00")) {
                dailyData[date].entry = entry;
            }
        });

        const processed = [];
        for (const date in dailyData) {
            const day = dailyData[date];
            const mostCommonIcon = Object.keys(day.icons).reduce((a, b) => day.icons[a] > day.icons[b] ? a : b);
            day.entry.weather[0].icon = mostCommonIcon;
            day.entry.main.temp_max = Math.max(...day.temp_max);
            day.entry.main.temp_min = Math.min(...day.temp_min);
            processed.push(day.entry);
        }
        return processed.slice(0, 5);
    };

    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    };

    const handleCityInput = async (event) => {
        const query = event.target.value.trim();
        if (!suggestionsBox) return;
        
        if (query.length < 3) {
            suggestionsBox.classList.add("hidden");
            return;
        }

        try {
            const response = await fetch(`/suggestions?query=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error("Failed to fetch suggestions");

            const result = await response.json();
            if (!result.success) throw new Error(result.error);

            const cities = result.data;
            suggestionsBox.innerHTML = "";

            if (cities.length > 0) {
                suggestionsBox.classList.remove("hidden");
                
                cities.forEach(city => {
                    const div = document.createElement("div");
                    div.className = 'p-3 hover:bg-white/10 cursor-pointer text-white';
                    div.textContent = `${city.name}${city.state ? `, ${city.state}` : ''} (${city.country})`;
                    
                    div.onclick = () => {
                        if (cityInput) cityInput.value = city.name;
                        suggestionsBox.classList.add("hidden");
                        fetchWeather({ lat: city.lat, lon: city.lon });
                    };
                    suggestionsBox.appendChild(div);
                });
            } else {
                suggestionsBox.classList.add("hidden");
            }
        } catch (error) {
            console.error("Suggestion fetch error:", error);
        }
    };

    const updateClock = (timezoneOffset) => {
        if (!currentTimeEl) return;
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000); 
        const localtime = new Date(utc + (timezoneOffset * 1000));
        currentTimeEl.textContent = localtime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "UTC" });
    };

    const showLoading = () => {
        if (loadingOverlay) {
            loadingOverlay.classList.remove("hidden");
            loadingOverlay.classList.add("flex");
        }
    };

    const hideLoading = () => {
        if (loadingOverlay) {
            loadingOverlay.classList.add("hidden");
            loadingOverlay.classList.remove("flex");
        }
    };

    const showError = (message) => {
        if (errorMessageEl) errorMessageEl.textContent = message;
        if (errorModal) {
            errorModal.classList.remove("hidden");
            errorModal.style.display = "flex"; 
        }
    };

    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const city = cityInput ? cityInput.value.trim() : "";
            if (city) fetchWeather({ city });
            if (suggestionsBox) suggestionsBox.classList.add("hidden");
            if (cityInput) cityInput.value = "";
        });
    }

    if (cityInput) {
        cityInput.addEventListener("input", debounce(handleCityInput, 300));
    }

    document.addEventListener("click", (e) => {
        if (searchForm && suggestionsBox && !searchForm.contains(e.target)) {
            suggestionsBox.classList.add("hidden");
        }
    });

    if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
        if (errorModal) {
            errorModal.classList.add("hidden");
            errorModal.style.display = "none"; 
        }
    });
}

    if (geolocationBtn) {
        geolocationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => fetchWeather({ lat: position.coords.latitude, lon: position.coords.longitude }),
                    () => {
                        console.log("Geolocation failed. Falling back to default city.");
                        fetchWeather({ city: "New Delhi" });
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            } else {
                fetchWeather({ city: "New Delhi" });
            }
        });
        
        
        geolocationBtn.click();
    }
});