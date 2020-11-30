import * as React from "react";
import { LinePath, Line, Bar } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import { GridRows, GridColumns } from "@visx/grid";
import { scaleTime, scaleLinear } from "@visx/scale";
import { LinearGradient } from "@visx/gradient";
import { max, extent } from "d3-array";
import { AxisBottom, AxisLeft } from '@visx/axis';
import { DustboxReading } from './types';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { Point } from '@visx/point';

const getDate = (datum: DustboxReading) => new Date(datum.createdAt);
const getPM1Value = (datum: DustboxReading) => parseFloat(datum["pm1"]);
const getPM10Value = (datum: DustboxReading) => parseFloat(datum["pm10"]);
const getPM25Value = (datum: DustboxReading) => parseFloat(datum["pm2.5"]);
const getHumidityValue = (datum: DustboxReading) => parseFloat(datum["humidity"]);
const getTemperatureValue = (datum: DustboxReading) => parseFloat(datum["temperature"]);

export function Dustbox24HourChart ({
  width,
  height,
  data
}: {
  width: number,
  height: number
  data: DustboxReading[]
}) {
  const charts = [
    {
      name: "PM1 MG/M3",
      getter: getPM1Value,
      background: '#FF8695'
    }, {
      name: "PM10 MG/M3",
      getter:getPM10Value,
      background: '#CF96C8'
    }, {
      name: "PM25 MG/M3",
      getter:getPM25Value,
      background: '#33CCFF'
    }, {
      name: "Humidity %",
      getter:getHumidityValue,
      background: '#2E03DA'
    }, {
      name: "Temp. ºC",
      getter: getTemperatureValue,
      background: '#39F986'
    }
  ]
  const margin = { top: 0, right: 90, bottom: 0, left: 30 };

  // bounds
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // scales
  const dateScale = React.useMemo(
    () =>
      scaleTime({
        range: [margin.left, innerWidth + margin.left],
        domain: extent(data, getDate) as [Date, Date]
      }),
    [innerWidth, margin.left, data]
  );

  const pm25Scale = React.useMemo(
    () =>
      scaleLinear({
        range: [innerHeight + margin.top, margin.top],
        domain: [0, (max(data, getPM25Value) || 0) + innerHeight / 3],
        nice: true
      }),
    [margin.top, innerHeight, data]
  );

  return (
    <div>
      <svg width={width} height={height} style={{
        overflow: 'visible'
      }}>
        <GridRows
          left={margin.left}
          scale={pm25Scale}
          width={innerWidth}
          strokeDasharray="1,3"
          stroke={'black'}
          strokeOpacity={0.1}
          pointerEvents="none"
        />
        <GridColumns
          top={margin.top}
          scale={dateScale}
          height={innerHeight}
          strokeDasharray="1,3"
          stroke={'black'}
          strokeOpacity={0.1}
          pointerEvents="none"
        />
        {charts.map(({ name, getter, background }, i) => {
          const id = `gradient-${name.replace(' ','')}`
          return (
            <React.Fragment key={name}>
              <LinearGradient
                id={id}
                from={background}
                // fromOpacity={1}
                to={background}
                // toOpacity={0.4}
              />
              <LinePath
                data={data}
                x={(d) => dateScale(getDate(d)) ?? 0}
                y={(d) => pm25Scale(getter(d)) ?? 0}
                yScale={pm25Scale}
                strokeWidth={1}
                stroke={`url(#${id})`}
                // fill={`url(#${id})`}
                fill='transparent'
                curve={curveMonotoneX}
              />
              <Group left={width - margin.right + 10} top={i * 30}>
                <Line stroke={background} strokeWidth={2} from={new Point({ x: 0, y: 0 })} to={new Point({ x: 30, y: 0 })} />
                <Text y={15} className='text-XXS text-midDarker font-cousine uppercase'>{name}</Text>
              </Group>
            </React.Fragment>
          )
        })}
        <Bar
          x={margin.left}
          y={margin.top}
          width={innerWidth}
          height={innerHeight}
          fill="transparent"
          rx={14}
        />
        <AxisLeft
          scale={pm25Scale}
          stroke={''}
          tickStroke={''}
          left={margin.left}
          tickLabelProps={() => ({
            textAnchor: 'end'
          })}
          tickClassName='font-cousine text-black text-XXS'
        />
        <AxisBottom
          top={height + margin.top}
          scale={dateScale}
          stroke={''}
          tickStroke={''}
          numTicks={4}
          tickLabelProps={() => ({
            textAnchor: 'middle'
          })}
          tickClassName='font-cousine text-black text-XXS'
        />
      </svg>
    </div>
  );
}
