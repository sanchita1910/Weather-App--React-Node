const express = require("express");
const { Client } = require("@googlemaps/google-maps-services-js");
const cors = require("cors");
const axios = require("axios"); // For making HTTP requests
const mongoose = require("mongoose");
const Favorite = require("./models/Favorite");

const app = express();
const PORT = process.env.PORT || 5001; // Changed port to 5001 to avoid conflicts
const client = new Client({});

const TOMORROW_API_KEY = "your api key";
app.get("/", (req, res) => {
  res.status(200).send("Connected to backend");
});

app.use(cors());
app.use(express.json());

const mongoAtlasUri = `mongodb+srv://sanchitasuryavanshi:usGxD24Gu025Q6VU@sharedcluster0.srk8d.mongodb.net/?retryWrites=true&w=majority&appName=SharedCluster0`;
async function connectToDatabase() {
  try {
    await mongoose.connect(mongoAtlasUri);
    console.log("Mongoose is connected");
  } catch (error) {
    console.error("Could not connect to MongoDB:", error);
  }
}
connectToDatabase();

const WEATHER_CODE_MAPPING = {
  4201: {
    description: "Heavy Rain",
    iconlocation: "/Images/Weather Symbols for Weather Codes/rain_heavy.svg",
  },
  4001: {
    description: "Rain",
    iconlocation: "/Images/Weather Symbols for Weather Codes/rain.svg",
  },
  4200: {
    description: "Light Rain",
    iconlocation: "/Images/Weather Symbols for Weather Codes/rain_light.svg",
  },
  6201: {
    description: "Heavy Freezing Rain",
    iconlocation:
      "/Images/Weather Symbols for Weather Codes/freezing_rain_heavy.svg",
  },
  6001: {
    description: "Freezing Rain",
    iconlocation: "/Images/Weather Symbols for Weather Codes/freezing_rain.svg",
  },
  6200: {
    description: "Light Freezing Rain",
    iconlocation:
      "/Images/Weather Symbols for Weather Codes/freezing_rain_light.svg",
  },
  6000: {
    description: "Freezing Drizzle",
    iconlocation:
      "/Images/Weather Symbols for Weather Codes/freezing_drizzle.svg",
  },
  4000: {
    description: "Drizzle",
    iconlocation: "/Images/Weather Symbols for Weather Codes/drizzle.svg",
  },
  7101: {
    description: "Heavy Ice Pellets",
    iconlocation:
      "/Images/Weather Symbols for Weather Codes/ice_pellets_heavy.svg",
  },
  7000: {
    description: "Ice Pellets",
    iconlocation: "/Images/Weather Symbols for Weather Codes/ice_pellets.svg",
  },
  7102: {
    description: "Light Ice Pellets",
    iconlocation:
      "/Images/Weather Symbols for Weather Codes/ice_pellets_light.svg",
  },
  5101: {
    description: "Heavy Snow",
    iconlocation: "/Images/Weather Symbols for Weather Codes/snow_heavy.svg",
  },
  5000: {
    description: "Snow",
    iconlocation: "/Images/Weather Symbols for Weather Codes/snow.svg",
  },
  5100: {
    description: "Light Snow",
    iconlocation: "/Images/Weather Symbols for Weather Codes/snow_light.svg",
  },
  5001: {
    description: "Flurries",
    iconlocation: "/Images/Weather Symbols for Weather Codes/flurries.svg",
  },
  8000: {
    description: "Thunderstorm",
    iconlocation: "/Images/Weather Symbols for Weather Codes/tstorm.svg",
  },
  2100: {
    description: "Light Fog",
    iconlocation: "/Images/Weather Symbols for Weather Codes/fog_light.svg",
  },
  2000: {
    description: "Fog",
    iconlocation: "/Images/Weather Symbols for Weather Codes/fog.svg",
  },
  1001: {
    description: "Cloudy",
    iconlocation: "/Images/Weather Symbols for Weather Codes/cloudy.svg",
  },
  1102: {
    description: "Mostly Cloudy",
    iconlocation: "/Images/Weather Symbols for Weather Codes/mostly_cloudy.svg",
  },
  1101: {
    description: "Partly Cloudy",
    iconlocation:
      "/Images/Weather Symbols for Weather Codes/partly_cloudy_day.svg",
  },
  1100: {
    description: "Mostly Clear",
    iconlocation:
      "/Images/Weather Symbols for Weather Codes/mostly_clear_day.svg",
  },
  1000: {
    description: "Clear, Sunny",
    iconlocation: "/Images/Weather Symbols for Weather Codes/clear_day.svg",
  },
};

// Existing GET endpoint for autocomplete
app.get("/autocomplete", async (req, res) => {
  const { input } = req.query;

  if (!input) {
    return res.status(400).send({ error: "Input query is required" });
  }

  try {
    const response = await client.placeAutocomplete({
      params: {
        input,
        key: "AIzaSyB32ZyEKGCtbQ3ljMmb_ieZdMZhBXHZ8IA", // Replace with new API key when new project is created
        types: "(cities)", // Optional: specify types if needed
      },
      timeout: 1000, // Optional: define request timeout
    });

    res.send(response.data);
    console.log(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: "Failed to fetch autocomplete suggestions",
    });
  }
});

// New GET endpoint to accept weather location data
app.get("/weather", async (req, res) => {
  const { lat, lon, street, city, state, useLocation } = req.query;

  if (!lat || !lon) {
    return res
      .status(400)
      .send({ error: "Latitude and longitude are required" });
  }
  // Fetching weather data from Tomorrow.io API
  const weatherUrl = `https://api.tomorrow.io/v4/timelines?location=${lat},${lon}&fields=temperature,temperatureApparent,temperatureMin,temperatureMax,windSpeed,windDirection,humidity,pressureSeaLevel,uvIndex,weatherCode,precipitationProbability,precipitationType,sunriseTime,sunsetTime,visibility,moonPhase,cloudCover&timesteps=1d,1h&units=imperial&timezone=America/Los_Angeles&apikey=${TOMORROW_API_KEY}`;

  try {
    const weatherResponse = await axios.get(weatherUrl);
    const weatherData = weatherResponse.data;
    // Log the entire weather data response to the console
    console.log("Weather Data:", JSON.stringify(weatherData, null, 2)); // Pretty-print the response data

    if (!weatherData.data) {
      return res.status(500).send({ error: "Unable to fetch weather data." });
    }

    // Fetching current weather and hourly weather data
    const intervals = weatherData.data.timelines[0].intervals;
    const currentWeather = intervals[0].values;
    const hourlyWeather = weatherData.data.timelines[1].intervals;

    const weatherCode = currentWeather.weatherCode;
    const weatherCondition = WEATHER_CODE_MAPPING[weatherCode] || {
      description: "Unknown",
      iconlocation: "❓",
    };

    // Preparing the response
    const result = {
      location: useLocation,
      current: {
        temperature: currentWeather.temperature,
        humidity: currentWeather.humidity,
        pressure: currentWeather.pressureSeaLevel,
        windSpeed: currentWeather.windSpeed,
        cloudCover: currentWeather.cloudCover,
        moonPhase: currentWeather.moonPhase,
        precipitationProbability: currentWeather.precipitationProbability,
        precipitationType: currentWeather.precipitationType,
        pressureSeaLevel: currentWeather.pressureSeaLevel,
        sunriseTime: currentWeather.sunriseTime,
        sunsetTime: currentWeather.sunsetTime,
        temperatureApparent: currentWeather.temperatureApparent,
        temperatureMax: currentWeather.temperatureMax,
        temperatureMin: currentWeather.temperatureMin,
        uvIndex: currentWeather.uvIndex,
        visibility: currentWeather.visibility,
        windDirection: currentWeather.windDirection,
        weatherCode: currentWeather.weatherCode,
        weatherDescription: weatherCondition.description,
        weathericonlocation: weatherCondition.iconlocation,
      },
      hourly_forecast: hourlyWeather.slice(0, 120).map((interval) => ({
        time: interval.startTime,
        temperature: interval.values.temperature,
        windSpeed: interval.values.windSpeed,
        pressure: interval.values.pressureSeaLevel,
        precipitationProbability: interval.values.precipitationProbability,
        precipitationType: interval.values.precipitationType,
        humidity: interval.values.humidity,
        windDirection: interval.values.windDirection,
      })),
      daily_forecast: [],
    };

    // Calculating daily forecast values
    const currentDate = new Date(intervals[0].startTime);
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(currentDate);
      targetDate.setDate(targetDate.getDate() + i);
      const dailyIntervals = intervals.filter((interval) => {
        const intervalDate = new Date(interval.startTime);
        return intervalDate.toDateString() === targetDate.toDateString();
      });

      if (dailyIntervals.length > 0) {
        let sunriseTime = null;
        let sunsetTime = null;

        // Finding sunrise time
        for (const interval of dailyIntervals) {
          if (interval.values.sunriseTime) {
            sunriseTime = interval.values.sunriseTime;
            break;
          }
        }

        // Finding sunset time
        for (let j = dailyIntervals.length - 1; j >= 0; j--) {
          if (dailyIntervals[j].values.sunsetTime) {
            sunsetTime = dailyIntervals[j].values.sunsetTime;
            break;
          }
        }

        const dailyResult = {
          date: targetDate.toISOString().split("T")[0],
          temperature: Math.max(
            ...dailyIntervals.map((interval) => interval.values.temperature)
          ),
          temperature_high: Math.max(
            ...dailyIntervals.map((interval) => interval.values.temperatureMax)
          ),
          temperature_low: Math.min(
            ...dailyIntervals.map((interval) => interval.values.temperatureMin)
          ),
          windSpeed:
            dailyIntervals.reduce(
              (sum, interval) => sum + interval.values.windSpeed,
              0
            ) / dailyIntervals.length,
          humidity:
            dailyIntervals.reduce(
              (sum, interval) => sum + interval.values.humidity,
              0
            ) / dailyIntervals.length,
          precipitationProbability: Math.max(
            ...dailyIntervals.map(
              (interval) => interval.values.precipitationProbability
            )
          ),
          cloudCover: Math.max(
            ...dailyIntervals.map((interval) => interval.values.cloudCover)
          ),
          visibility: Math.min(
            ...dailyIntervals.map((interval) => interval.values.visibility)
          ),
          sunriseTime,
          sunsetTime,
          precipitationType: Math.max(
            ...dailyIntervals.map(
              (interval) => interval.values.precipitationType
            )
          ),
          weathericonlocation: weatherCondition.iconlocation,
          weatherDescription: weatherCondition.description,
        };

        result.daily_forecast.push(dailyResult);
      }
    }
    console.log("result", result);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).send({ error: "Failed to fetch weather data" });
  }

  // For demonstration, respond with the received data - remove it later
  // res.status(200).send({
  //   message: "Weather data received successfully",
  //   data: { lat, lon, street, city, state },
  // });
});

// Get all favorites
app.get("/favorites", async (req, res) => {
  try {
    const favorites = await Favorite.find().sort({ createdAt: -1 });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new favorite
app.post("/favorites", async (req, res) => {
  const favorite = new Favorite({
    city: req.body.city,
    state: req.body.state,
  });

  try {
    const newFavorite = await favorite.save();
    res.status(201).json(newFavorite);
  } catch (error) {
    // Handle duplicate entries
    if (error.code === 11000) {
      res.status(400).json({ message: "Location already in favorites" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Delete favorite
app.delete("/favorites/:id", async (req, res) => {
  try {
    const favorite = await Favorite.findByIdAndDelete(req.params.id);
    if (favorite) {
      res.json({ message: "Favorite deleted" });
    } else {
      res.status(404).json({ message: "Favorite not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start the server on the configured PORT
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
