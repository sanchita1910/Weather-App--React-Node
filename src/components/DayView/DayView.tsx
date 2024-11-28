import React, { useEffect, useRef, useState } from "react";
import { Button, Card, Image, Tab, Table, Tabs } from "react-bootstrap";
import MeteogramChart from "../MeteogramChart/MeteogramChart";
import TemperatureRangeChart from "../TemperatureRangeChart/TemperatureRangeChart";


// images 
import rainHeavy from "../../Images/Weather Symbols for Weather Codes/rain_heavy.svg";
import rain from "../../Images/Weather Symbols for Weather Codes/rain.svg";
import rainLight from "../../Images/Weather Symbols for Weather Codes/rain_light.svg";
import freezingRainHeavy from "../../Images/Weather Symbols for Weather Codes/freezing_rain_heavy.svg";
import freezingRain from "../../Images/Weather Symbols for Weather Codes/freezing_rain.svg";
import freezingRainLight from "../../Images/Weather Symbols for Weather Codes/freezing_rain_light.svg";
import freezingDrizzle from "../../Images/Weather Symbols for Weather Codes/freezing_drizzle.svg";
import drizzle from "../../Images/Weather Symbols for Weather Codes/drizzle.svg";
import icePelletsHeavy from "../../Images/Weather Symbols for Weather Codes/ice_pellets_heavy.svg";
import icePellets from "../../Images/Weather Symbols for Weather Codes/ice_pellets.svg";
import icePelletsLight from "../../Images/Weather Symbols for Weather Codes/ice_pellets_light.svg";
import snowHeavy from "../../Images/Weather Symbols for Weather Codes/snow_heavy.svg";
import snow from "../../Images/Weather Symbols for Weather Codes/snow.svg";
import snowLight from "../../Images/Weather Symbols for Weather Codes/snow_light.svg";
import flurries from "../../Images/Weather Symbols for Weather Codes/flurries.svg";
import thunderstorm from "../../Images/Weather Symbols for Weather Codes/tstorm.svg";
import lightFog from "../../Images/Weather Symbols for Weather Codes/fog_light.svg";
import fog from "../../Images/Weather Symbols for Weather Codes/fog.svg";
import cloudy from "../../Images/Weather Symbols for Weather Codes/cloudy.svg";
import mostlyCloudy from "../../Images/Weather Symbols for Weather Codes/mostly_cloudy.svg";
import partlyCloudyDay from "../../Images/Weather Symbols for Weather Codes/partly_cloudy_day.svg";
import mostlyClearDay from "../../Images/Weather Symbols for Weather Codes/mostly_clear_day.svg";
import clearDay from "../../Images/Weather Symbols for Weather Codes/clear_day.svg";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  StarFill
} from "react-bootstrap-icons";


const WEATHER_CODE_MAPPING: { [key: number]: any} = {
  4201: {
    description: "Heavy Rain",
    iconlocation: rainHeavy,
  },
  4001: {
    description: "Rain",
    iconlocation: rain,
  },
  4200: {
    description: "Light Rain",
    iconlocation: rainLight,
  },
  6201: {
    description: "Heavy Freezing Rain",
    iconlocation: freezingRainHeavy,
  },
  6001: {
    description: "Freezing Rain",
    iconlocation: freezingRain,
  },
  6200: {
    description: "Light Freezing Rain",
    iconlocation: freezingRainLight,
  },
  6000: {
    description: "Freezing Drizzle",
    iconlocation: freezingDrizzle,
  },
  4000: {
    description: "Drizzle",
    iconlocation: drizzle,
  },
  7101: {
    description: "Heavy Ice Pellets",
    iconlocation: icePelletsHeavy,
  },
  7000: {
    description: "Ice Pellets",
    iconlocation: icePellets,
  },
  7102: {
    description: "Light Ice Pellets",
    iconlocation: icePelletsLight,
  },
  5101: {
    description: "Heavy Snow",
    iconlocation: snowHeavy,
  },
  5000: {
    description: "Snow",
    iconlocation: snow,
  },
  5100: {
    description: "Light Snow",
    iconlocation: snowLight,
  },
  5001: {
    description: "Flurries",
    iconlocation: flurries,
  },
  8000: {
    description: "Thunderstorm",
    iconlocation: thunderstorm,
  },
  2100: {
    description: "Light Fog",
    iconlocation: lightFog,
  },
  2000: {
    description: "Fog",
    iconlocation: fog,
  },
  1001: {
    description: "Cloudy",
    iconlocation: cloudy,
  },
  1102: {
    description: "Mostly Cloudy",
    iconlocation: mostlyCloudy,
  },
  1101: {
    description: "Partly Cloudy",
    iconlocation: partlyCloudyDay,
  },
  1100: {
    description: "Mostly Clear",
    iconlocation: mostlyClearDay,
  },
  1000: {
    description: "Clear, Sunny",
    iconlocation: clearDay,
  },
};

interface WeatherDay {
  date: string;
  status: string;
  temp_high: number;
  temp_low: number;
  wind_speed: number;
}

interface DayViewProps {
  weatherData: any;
  location: { city: string; state: string };
  latitude: string | null;
  longitude: string | null;
  setCarouselIndex: (index: number) => void;
  setDetailsData: (data: any) => void;
  favorite: { _id: string; city: string; state: string } | null;
  addFavorite: (city: string, state: string) => void;
  deleteFavorite: (id: string) => void;
  selectedRow: number | null;
  setSelectedRow: (row: number | null) => void;
}

const DayView: React.FC<DayViewProps> = ({
  weatherData,
  location,
  latitude,
  longitude,
  setCarouselIndex,
  setDetailsData,
  favorite,
  addFavorite,
  deleteFavorite,
  selectedRow,
  setSelectedRow,
}) => {
  const [activeTab, setActiveTab] = useState("dayView");
  const [chartData, setChartData] = useState<WeatherDay[]>([]);
  const [hourlyWeather, setHourlyWeather] = useState([]);
  // const [selectedRow, setSelectedRow] = useState<number | null>(null);
 

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  console.log("Weather data", weatherData);

  const mapIconToDescription = (description) => {
    const entry = Object.values(WEATHER_CODE_MAPPING).find(
      (item) => item.description.toLowerCase() === description.toLowerCase()
    );
    return entry ? entry.iconlocation : null;
  };

  const processedData = Array.isArray(weatherData)
    ? weatherData
    : weatherData.daily_forecast || [];

    const processedDataWithIcons = processedData.map((day) => ({
      ...day,
      weatherIconLocation: mapIconToDescription(day.weatherDescription),
    }));

  const prepareChartData = () => {
    return processedData.map((day: any) => ({
      date: day.date,
      temp_high: day.temperature_high,
      temp_low: day.temperature_low,
      wind_speed: day.windSpeed,
      status: day.status,
    }));
  };

  useEffect(() => {
    if (processedData && selectedRow !== null) {
      setDetailsData({
        city: location.city,
        state: location.state,
        date: processedData[selectedRow].date,
        weatherDescription: weatherData.current.weatherDescription,
        maxTemperature: processedData[selectedRow].temperature_high,
        minTemperature: processedData[selectedRow].temperature_low,
        temperature: processedData[selectedRow].temperature,
        sunrise: processedData[selectedRow].sunriseTime,
        sunset: processedData[selectedRow].sunsetTime,
        humidity: weatherData.current.humidity,
        windSpeed: weatherData.current.windSpeed,
        visibility: weatherData.current.visibility,
        cloudCover: weatherData.current.cloudCover,
      });
    }
  }, [selectedRow]);

  useEffect(() => {
    if (activeTab === "tempChart") {
      setChartData(prepareChartData());
    } else if (activeTab === "meteogram") {
      setHourlyWeather(weatherData.hourly_forecast || []);
    }
  }, [activeTab, processedData, weatherData]);

  if (!weatherData || !location) {
    return null;
  }

  const formatWeatherDescription = (description) => {
    if (!description) return "";
    const primaryTerm = description.split(",")[0]; 
    return primaryTerm.trim();
  };
  console.log("processed data", processedData);
  console.log("fav", favorite);
  console.log("location.city", location.city);
  console.log("location.state", location.state);
  
  return (
    <Card className="mt-4 shadow-sm slide-container" border="0">
      <Card.Header className="bg-white">
        <div className="d-flex flex-column ">
          <div>
            <h3 className="mb-0 text-center">
            Forecast at{" "}
            {[location.city, location.state].filter((_) => _).join(", ")}
          </h3>
          </div>
          
          <div className="d-flex justify-content-end align-items-center mt-2">
            {
              <Button
                variant="link" className="ms-auto border"
                onClick={() => {
                  if (favorite) {
                    deleteFavorite(favorite._id);
                  } else {
                    addFavorite(location.city, location.state);
                  }
                }}
              >
                {favorite ? <StarFill size={20} fill="yellow" color="black" /> : <Star size={20} color="black" />}
              </Button>
            }
            <span style={{color: "#000000", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => {
                setSelectedRow(selectedRow !== null ? selectedRow : 0); // Default to first row if no row is selected
                setCarouselIndex(1);
              }}>
              Details <ChevronRight/>
            </span>
          </div>
        </div>
        <div className="d-flex justify-content-end mt-2">
          <Tabs
            activeKey={activeTab}
            onSelect={(tab) => setActiveTab(tab as string)}
            className="flex flex-nowrap overflow-x-auto no-wrap-tabs"
          >
            <Tab eventKey="dayView" title="Day View" />
            <Tab eventKey="tempChart" title="Daily Temp. Chart" />
            <Tab eventKey="meteogram" title="Meteogram" />
          </Tabs>
        </div>
      </Card.Header>
      <Card.Body>
        <>
          {activeTab === "dayView" && (
            <Table hover responsive className="align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Temp. High(°F)</th>
                  <th>Temp. Low(°F)</th>
                  <th>Wind Speed(mph)</th>
                </tr>
              </thead>
              <tbody>
                {processedDataWithIcons.map((day: any, index: number) => (
                  <tr
                    key={index}
                    onClick={() => {
                      setSelectedRow(index);
                      setCarouselIndex(1);
                    }}
                    style={{
                      cursor: "pointer",
                      backgroundColor: selectedRow === index ? "#e0f7fa" : "",
                    }}
                  >
                    <td>{index + 1}</td>
                    <td>{formatDate(day.date)}</td>
                    <td>
                      <Image
                        src={day.weatherIconLocation}
                        alt={day.status}
                        width={30}
                        height={30}
                        rounded
                      />
                      {/* {day.weatherDescription} */}
                      {formatWeatherDescription(day.weatherDescription)}
                    </td>
                    <td>{day.temperature_high}</td>
                    <td>{day.temperature_low}</td>
                    <td>{day.windSpeed}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {activeTab === "tempChart" && (
            <TemperatureRangeChart day={chartData} hourly_weather={[]} />
          )}
          {activeTab === "meteogram" && (
            <MeteogramChart hourlyWeather={hourlyWeather} />
          )}
        </>
      </Card.Body>
    </Card>
  );
};

export default DayView;
