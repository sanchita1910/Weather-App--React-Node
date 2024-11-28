import React, { useEffect } from 'react';
import Highcharts from 'highcharts';
import windbarb from 'highcharts/modules/windbarb';
import HighchartsReact from 'highcharts-react-official';

windbarb(Highcharts);

interface MeteogramChartProps {
  hourlyWeather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
  }[];
}

const MeteogramChart: React.FC<MeteogramChartProps> = ({ hourlyWeather }) => {
  useEffect(() => {
    console.log("hourly weather", hourlyWeather);
    const noOfHours = hourlyWeather.length;
    const hours = [];
    const now = new Date();
    now.setHours(now.getHours() - 8);

    const temperatureData = [];
    const humidityData = [];
    const windData = [];
    const pressureData = [];

    for (let i = 0; i < noOfHours; i++) {
      const time = new Date(now);
      time.setHours(now.getHours() + i);
      hours.push(time.getTime());
      temperatureData.push(hourlyWeather[i].temperature);
      humidityData.push(hourlyWeather[i].humidity);
      windData.push({
        value: hourlyWeather[i].windSpeed,
        direction: hourlyWeather[i].windDirection,
      });
      pressureData.push(hourlyWeather[i].pressure);
    }

    Highcharts.chart('meteogramChart', {
      title: { text: 'Hourly Weather for Next 5 Days' },
      chart: {
        height: 380,
        plotBorderWidth: 1,
        scrollablePlotArea: { minWidth: 720 },
      },
      xAxis: [
        {
          type: 'datetime',
          tickInterval: 6 * 36e5,
          minorTickInterval: 4 * 36e5,
          gridLineWidth: 1,
          gridLineColor: 'rgba(128, 128, 128, 0.1)',
          labels: { format: '{value:%H}' },
        },
        {
          linkedTo: 0,
          type: 'datetime',
          tickInterval: 24 * 3600 * 1000,
          labels: {
            format: '{value:%a %b %e}',
            align: 'left',
          },
          opposite: true,
          tickLength: 20,
        },
      ],
      yAxis: [
        { title: { text: null }, labels: { format: '{value}°' }, height: '85%',  // Add this
        top: '0%'  },
        { title: { text: null }, labels: { enabled: false }, },
        { title: { text: 'inHg' }, labels: { format: '{value} inHg' }, opposite: true },
        {
            title: { text: 'Wind Direction' },
            labels: { enabled: false },
            top: '85%',
            height: '15%',
            offset: 0,
            min: 0,
            max: 360,
            gridLineWidth: 0,
          },
      ],
      tooltip: { shared: true },
      legend: { enabled: false },
      plotOptions: { series: { pointPlacement: 'between' } },
      series: [
        {
          name: 'Temperature',
          type: 'spline',
          data: temperatureData.map((temp, i) => [hours[i], temp]),
          tooltip: { valueSuffix: '°C' },
          color: '#FF3333',
          zIndex: 5,
        },
        {
          name: 'Humidity',
          type: 'column',
          data: humidityData.map((hum, i) => [hours[i], hum]),
          tooltip: { valueSuffix: ' %' },
          color: '#68CFE8',
          dataLabels: {
            enabled: true,
            format: '{y}',
            style: { color: 'grey', fontSize: '9px' },
          },
        },
        {
          name: 'Wind Speed',
          type: 'windbarb',
          data: windData.map((wind, i) => [hours[i], wind.value, wind.direction]),
          tooltip: { valueSuffix: ' mph' },
          vectorLength: 18,
          yAxis: 3,
          zIndex: 5,
        },
        {
          name: 'Pressure',
          type: 'spline',
          data: pressureData.map((pres, i) => [hours[i], pres]),
          tooltip: { valueSuffix: ' inHg' },
          color: '#8B4513',
        },
      ],
    });
  }, [hourlyWeather]);

  return <div id="meteogramChart"></div>;
};

export default MeteogramChart;