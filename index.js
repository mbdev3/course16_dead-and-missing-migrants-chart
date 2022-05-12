import React, {
  useState,
  useCallback,
  useEffect,
} from 'react';
import ReactDOM from 'react-dom';
import { useData } from './useData';
import { AxisBottom } from './axisBottom';
import { AxisLeft } from './axisLeft';
import { Marks } from './Marks';
import {
  csv,
  scaleLinear,
  max,
  format,
  extent,
  scaleTime,
  timeFormat,
  bin,
  timeMonths,
  sum,
} from 'd3';

const width = window.innerWidth;
const height = window.innerHeight;
const margin = {
  top: 20,
  bottom: 60,
  right: 30,
  left: 100,
};

const App = () => {
  const data = useData();
  if (!data) {
    return <pre>loading..</pre>;
  }

  const xValue = (d) => d['Reported Date'];
  const xAxisLabel = 'Date';

  const yValue = (d) =>
    d['Total Dead and Missing'];
  const yAxisLabel = 'Total Dead and Missing';

  const innerHeight =
    height - margin.top - margin.bottom;
  const innerWidth =
    width - margin.right - margin.left;

  const xScale = scaleTime()
    .domain(extent(data, xValue))
    .range([0, innerWidth])
    .nice();

 

  // d['Total Dead and Missing'] = +d['Total Dead and Missing']
  //      d['Reported Date'] = new Date(d['Reported Date'] )

  const xAxisTickFormat = timeFormat('%m/%d/%Y');
  const [start, stop] = xScale.domain();
  const binnedData = bin()
    .value(xValue)
    .domain(xScale.domain())
    .thresholds(timeMonths(start, stop))(data)
    .map((array) => ({
      y: sum(array, yValue),
      x0:array.x0,
       x1:array.x1
    }));
  
   const yScale = scaleLinear()
    .domain([0,max(binnedData, d=>d.y)])
    .range([innerHeight,0])
    .nice();
  console.log(binnedData);
 

  return (
    <svg width={width} height={height}>
      <g
        transform={`translate(${margin.left},${margin.top})`}
      >
        <AxisBottom
          innerHeight={innerHeight}
          xScale={xScale}
          tickFormat={xAxisTickFormat}
        />
        <AxisLeft
          yScale={yScale}
          innerWidth={innerWidth}
        />
        <text
          className="label"
          textAnchor="middle"
          x={innerWidth / 2}
          y={height - margin.bottom / 2}
        >
          {xAxisLabel}
        </text>
        <text
          className="label"
          textAnchor="middle"
          transform={`translate(${
            -margin.left / 2
          },${innerHeight / 2}) rotate(-90)`}
        >
          {yAxisLabel}
        </text>
        <Marks
          binnedData={binnedData}
          xScale={xScale}
          yScale={yScale}
          xValue={xValue}
          yValue={yValue}
          innerHeight={innerHeight}
          tooltip={d=> d}
        />
      </g>
    </svg>
  );
};

const rootElement = document.getElementById(
  'root'
);
ReactDOM.render(<App />, rootElement);
