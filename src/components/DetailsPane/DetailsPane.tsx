import React from "react";
import { Button, Table } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { APIProvider, Map, MapCameraChangedEvent, Marker } from '@vis.gl/react-google-maps';


import {
  ChevronLeft,
  ChevronRight,
  Star,
  TwitterX,
} from "react-bootstrap-icons";

interface DetailsPaneProps {
  details: {
    city: string;
    state: string;
    date: string;
    weatherDescription: string;
    maxTemperature: number;
    minTemperature: number;
    temperature: number;
    sunrise: string;
    sunset: string;
    humidity: number;
    windSpeed: number;
    visibility: number;
    cloudCover: number;
  };
  lat: string;
  lon: string;
  setCarouselIndex: (index: number) => void;
}
const formatTimeTo12Hour = (timeString: string): string => {
  const date = new Date(timeString);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert hours to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12;

  const decimalTime = hours + minutes / 60;
  return `${decimalTime.toFixed(2)} ${ampm}`;
};

// Function to format date to "Day, dd Month yyyy" format
const formatDate = (dateString: string) => {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const DetailsPane: React.FC<DetailsPaneProps> = ({
  details,
  lat,
  lon,
  setCarouselIndex,
}) => {
  console.log("details", details);

// Create tweet text dynamically
const tweetText = `The temperature in ${details.city}, ${details.state} on ${formatDate(details.date)} is ${details.temperature.toFixed(
  2
)} °F and the conditions are ${details.weatherDescription} #CSCI571WeatherForecast`;

const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
const markerPosition = { lat: parseFloat(lat), lng: parseFloat(lon) };


  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-1 mt-3">
      <Button className="mb-1 bg-white text-dark border border-dark" onClick={() => setCarouselIndex(0)}><ChevronLeft/>{"List"}</Button>
      <span><h5 className="text-center mb-1">{formatDate(details.date)}</h5></span>
         {/* Twitter/X Button */}
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-secondary mb-1"
          aria-label="Share on X"
        ><TwitterX/>
        </a>

        </div>
      <Table className="details-table table-striped">
        <tbody>
          <tr>
            <td className="fw-bold col-5">Status</td>
            <td>{details.weatherDescription}</td>
          </tr>
          <tr>
            <td className="fw-bold col-5">Max Temperature</td>
            <td>{details.maxTemperature} °F</td>
          </tr>
          <tr>
            <td className="fw-bold col-5">Min Temperature</td>
            <td>{details.minTemperature} °F</td>
          </tr>
          <tr>
            <td className="fw-bold col-5">Apparent Temperature</td>
            <td>{details.temperature} °F</td>
          </tr>
          <tr>
            <td className="fw-bold col-5">Sun Rise Time</td>
            <td>{formatTimeTo12Hour(details.sunrise)}</td>
          </tr>
          <tr>
            <td className="fw-bold col-5">Sun Set Time</td>
            <td>{formatTimeTo12Hour(details.sunset)}</td>
          </tr>
          <tr>
            <td className="fw-bold col-5">Humidity</td>
            <td>{details.humidity} %</td>
          </tr>
          <tr>
            <td className="fw-bold col-5">Wind Speed</td>
            <td>{details.windSpeed} mph</td>
          </tr>
          <tr>
            <td className="fw-bold col-5">Visibility</td>
            <td>{details.visibility} mi</td>
          </tr>
          <tr>
            <td className="fw-bold col-5">Cloud Cover</td>
            <td>{details.cloudCover} %</td>
          </tr>
        </tbody>
      </Table>

      {/* Google Maps Integration */}
      <div style={{ height: "400px", width: "100%" }}>

        <APIProvider apiKey="AIzaSyB32ZyEKGCtbQ3ljMmb_ieZdMZhBXHZ8IA" onLoad={() => console.log('Maps API has loaded.')}>
          <Map
            defaultZoom={13}
            defaultCenter={{ lat: parseFloat(lat), lng: parseFloat(lon) }}
            onCameraChanged={(ev: MapCameraChangedEvent) =>
              console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
            }>
            <Marker position={markerPosition} />
            </Map>
          
        </APIProvider>

      </div>
    </div>
  );
};

export default DetailsPane;
