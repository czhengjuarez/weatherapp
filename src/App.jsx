import { useState } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Weather emoji mapping
  const getWeatherEmoji = (description) => {
    const desc = description.toLowerCase()
    if (desc.includes('clear') || desc.includes('sunny')) return '☀️'
    if (desc.includes('cloud')) return '☁️'
    if (desc.includes('rain') || desc.includes('drizzle')) return '🌧️'
    if (desc.includes('thunder') || desc.includes('storm')) return '⛈️'
    if (desc.includes('snow')) return '❄️'
    if (desc.includes('mist') || desc.includes('fog') || desc.includes('haze')) return '🌫️'
    if (desc.includes('wind')) return '💨'
    return '🌤️'
  }

  // Background color based on weather
  const getBackgroundClass = (description) => {
    if (!description) return 'bg-gradient-to-br from-blue-400 to-blue-600'
    const desc = description.toLowerCase()
    if (desc.includes('clear') || desc.includes('sunny')) return 'bg-gradient-to-br from-yellow-400 to-orange-500'
    if (desc.includes('cloud')) return 'bg-gradient-to-br from-gray-400 to-gray-600'
    if (desc.includes('rain') || desc.includes('drizzle')) return 'bg-gradient-to-br from-blue-500 to-blue-700'
    if (desc.includes('thunder') || desc.includes('storm')) return 'bg-gradient-to-br from-purple-600 to-gray-800'
    if (desc.includes('snow')) return 'bg-gradient-to-br from-blue-100 to-blue-300'
    if (desc.includes('mist') || desc.includes('fog')) return 'bg-gradient-to-br from-gray-300 to-gray-500'
    return 'bg-gradient-to-br from-blue-400 to-blue-600'
  }

  const fetchWeather = async (e) => {
    e.preventDefault()
    if (!city.trim()) {
      setError('Please enter a city name')
      return
    }

    setLoading(true)
    setError('')
    setWeather(null)

    try {
      // Step 1: Get coordinates from city name using geocoding API
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      )
      
      if (!geoResponse.ok) {
        throw new Error('Failed to find city')
      }

      const geoData = await geoResponse.json()
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found')
      }

      const { latitude, longitude, name, country } = geoData.results[0]

      // Step 2: Get weather data using coordinates
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
      )

      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather')
      }

      const weatherData = await weatherResponse.json()

      // Map Open-Meteo weather codes to descriptions
      const getWeatherDescription = (code) => {
        if (code === 0) return 'clear sky'
        if (code <= 3) return 'partly cloudy'
        if (code <= 49) return 'foggy'
        if (code <= 59) return 'drizzle'
        if (code <= 69) return 'rainy'
        if (code <= 79) return 'snowy'
        if (code <= 84) return 'rain showers'
        if (code <= 86) return 'snow showers'
        if (code >= 95) return 'thunderstorm'
        return 'cloudy'
      }

      const description = getWeatherDescription(weatherData.current.weather_code)

      // Format data to match our existing structure
      const formattedWeather = {
        name: `${name}, ${country}`,
        weather: [{ description, main: description }],
        main: { temp: weatherData.current.temperature_2m }
      }

      setWeather(formattedWeather)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const weatherDescription = weather?.weather[0]?.description || ''
  const bgClass = getBackgroundClass(weatherDescription)

  return (
    <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${bgClass}`}>
      <div className="w-full max-w-md p-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
            Weather in a Word
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Discover the weather anywhere! ⛅
          </p>

          <form onSubmit={fetchWeather} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '...' : '🔍'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl text-center">
              {error}
            </div>
          )}

          {weather && (
            <div className="text-center animate-fade-in">
              <div className="text-8xl mb-4">
                {getWeatherEmoji(weatherDescription)}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2 capitalize">
                {weatherDescription}
              </h2>
              <p className="text-xl text-gray-600 mb-4">
                in {weather.name}
              </p>
              {weather.main?.temp && (
                <p className="text-5xl font-bold text-gray-800">
                  {Math.round(weather.main.temp)}°C
                </p>
              )}
            </div>
          )}

          {!weather && !error && !loading && (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg">Type a city name to get started!</p>
              <p className="text-sm mt-2">Try: Tokyo, Paris, New York...</p>
            </div>
          )}
        </div>

        <p className="text-center text-white/80 text-sm mt-4">
          Powered by{' '}
          <a 
            href="https://open-meteo.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            Open-Meteo
          </a>
          {' '}• Free weather API, no key required!
        </p>
      </div>
    </div>
  )
}

export default App
