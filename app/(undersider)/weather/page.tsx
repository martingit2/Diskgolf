'use client'

import { useState, useEffect } from "react";

interface WeatherData {
  temperature: number;
  windSpeed: number;
  condition: string;
  updatedAt: string;
  name: string;
  lat: string;
  lon: string;
}

const defaultDiscGolfLocations = [
  { name: "Oslo", lat: "59.911491", lon: "10.757933" },
  { name: "Bergen", lat: "60.391263", lon: "5.322054" },
  { name: "Bø, Midt-Telemark", lat: "59.4602", lon: "9.0281" }
];

const WeatherPage = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [customLocation, setCustomLocation] = useState("");
  const [searchResult, setSearchResult] = useState<WeatherData | null>(null);
  const [favorites, setFavorites] = useState<WeatherData[]>([]);

  // Load saved favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favoriteCities");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Load weather for default locations
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weatherPromises = defaultDiscGolfLocations.map(async (loc) => {
          const response = await fetch(`/api/weather?lat=${loc.lat}&lon=${loc.lon}`);
          if (!response.ok) throw new Error(`Failed to fetch ${loc.name}`);
          const data: WeatherData = await response.json();
          return { ...data, name: loc.name, lat: loc.lat, lon: loc.lon };
        });

        const results = await Promise.all(weatherPromises);
        setWeatherData(results);
      } catch (error) {
        console.error("Error fetching weather:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  // Handle search for a custom location
  const handleCustomSearch = async () => {
    if (!customLocation.trim()) return;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customLocation)}`;

    try {
      const response = await fetch(url);
      const results = await response.json();
      if (results.length === 0) {
        alert("Location not found!");
        return;
      }

      const { lat, lon, display_name } = results[0];
      const weatherResponse = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const weatherData = await weatherResponse.json();

      setSearchResult({ ...weatherData, name: display_name, lat, lon });
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  // Add or remove favorite locations
  const toggleFavorite = (city: WeatherData) => {
    setFavorites((prevFavorites) => {
      let updatedFavorites;
      const exists = prevFavorites.some((fav) => fav.name === city.name);
      if (exists) {
        updatedFavorites = prevFavorites.filter((fav) => fav.name !== city.name);
      } else {
        updatedFavorites = [...prevFavorites, city];
      }

      // Save to localStorage
      localStorage.setItem("favoriteCities", JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center">🌤 Værmelding</h1>

      {/* Search Bar */}
      <div className="mt-4 flex gap-2">
        <input 
          type="text"
          placeholder="Søk etter by..."
          value={customLocation}
          onChange={(e) => setCustomLocation(e.target.value)}
          className="p-3 border rounded-lg w-full shadow-md"
        />
        <button onClick={handleCustomSearch} className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md">
          Søk
        </button>
      </div>

      {/* Show searched city */}
      {searchResult && (
        <div className="mt-6 p-4 bg-blue-100 rounded-lg flex justify-between items-center shadow-lg border border-blue-300">
          <div>
            <h2 className="text-xl font-semibold">{searchResult.name}</h2>
            <p>🌡 Temperatur: {searchResult.temperature}°C</p>
            <p>💨 Vindhastighet: {searchResult.windSpeed} m/s</p>
            <p>🌥 Værforhold: {searchResult.condition}</p>
            <p className="text-sm text-gray-500">Sist oppdatert: {new Date(searchResult.updatedAt).toLocaleString()}</p>
          </div>
          <button onClick={() => toggleFavorite(searchResult)} className="text-yellow-500 text-2xl">
            {favorites.some(fav => fav.name === searchResult.name) ? "⭐" : "☆"}
          </button>
        </div>
      )}

      {/* Show favorite locations BELOW searched city */}
      {favorites.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-700">⭐ Favorittsteder</h2>
          {favorites.map((weather, index) => (
            <div key={index} className="mt-4 p-4 bg-yellow-100 rounded-lg flex justify-between items-center shadow-lg border border-yellow-300">
              <div>
                <h2 className="text-xl font-semibold">{weather.name}</h2>
                <p>🌡 Temperatur: {weather.temperature}°C</p>
                <p>💨 Vindhastighet: {weather.windSpeed} m/s</p>
                <p>🌥 Værforhold: {weather.condition}</p>
                <p className="text-sm text-gray-500">Sist oppdatert: {new Date(weather.updatedAt).toLocaleString()}</p>
              </div>
              <button onClick={() => toggleFavorite(weather)} className="text-yellow-500 text-2xl">
                ⭐
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Show default locations if no search is active */}
      {!searchResult && (
        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="text-center text-gray-600">Henter værdata...</p>
          ) : (
            weatherData.map((weather, index) => (
              <div key={index} className="p-4 bg-gray-100 rounded-lg flex justify-between items-center shadow-md border border-gray-300">
                <div>
                  <h2 className="text-xl font-semibold">{weather.name}</h2>
                  <p>🌡 Temperatur: {weather.temperature}°C</p>
                  <p>💨 Vindhastighet: {weather.windSpeed} m/s</p>
                  <p>🌥 Værforhold: {weather.condition}</p>
                  <p className="text-sm text-gray-500">Sist oppdatert: {new Date(weather.updatedAt).toLocaleString()}</p>
                </div>
                <button onClick={() => toggleFavorite(weather)} className="text-yellow-500 text-2xl">
                  {favorites.some(fav => fav.name === weather.name) ? "⭐" : "☆"}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherPage;
