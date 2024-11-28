import React, { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMore from 'highcharts/highcharts-more';

HighchartsMore(Highcharts); // Initialize Highcharts-more for arearange

interface Props {
  day: any;
  hourly_weather: any[]; // Define this type if needed
}

const TemperatureRangeChart: React.FC<Props> = ({ day }) => {
  const chartRef = useRef(null);

  // Generate data once the day prop changes
  const generateData = (dayData: any) => {
    const length = dayData.length;
    const data = [];
    const today = new Date();
    const start = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      12,
      0,
      0
    );

    for (let i = 0; i < length; i++) {
      const time = start + i * 24 * 3600 * 1000;
      data.push([time, dayData[i].temp_high, dayData[i].temp_low]);
    }
    console.log("chart data-", data);
    return data;
   
  };
  

  const options = {
    chart: {
      type: 'arearange',
    },
    title: {
      text: 'Temperature Ranges (Min, Max)',
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: '',
      },
      dateTimeLabelFormats: {
        day: '%e %b',
      },
    },
    yAxis: {
      title: {
        text: '',
      },
    },
    tooltip: {
      shared: true,
      valueSuffix: '°F',
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        type: 'arearange',
        name: 'Temperature Range',
        data: generateData(day),
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(255, 165, 0, 0.5)'],
            [1, 'rgba(0, 123, 255, 0.5)'],
          ],
        },
        lineColor: '#666',
        lineWidth: 1,
      },
    ],
  };

  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        ref={chartRef}
      />
    </div>
  );
};

export default TemperatureRangeChart;
