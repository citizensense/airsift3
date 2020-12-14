import * as React from "react";
import { LinePath, Line, Bar } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import { GridRows, GridColumns } from "@visx/grid";
import { scaleTime, scaleLinear } from "@visx/scale";
import { LinearGradient } from "@visx/gradient";
import { max, extent } from "d3-array";
import { AxisBottom, AxisLeft } from '@visx/axis';
import { DustboxReading, Dustbox } from './types';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { Point } from '@visx/point';
import { ScaleSVG } from "@visx/responsive"

const getDate = (datum: DustboxReading) => new Date(datum.createdAt as any);
const getPM1Value = (datum: DustboxReading) => datum["pm1"];
const getPM10Value = (datum: DustboxReading) => datum["pm10"];
const getPM25Value = (datum: DustboxReading) => datum["pm25"];
const getHumidityValue = (datum: DustboxReading) => datum["humidity"];
const getTemperatureValue = (datum: DustboxReading) => datum["temperature"];

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

export function Dustbox24HourChart ({
  width,
  height,
  data
}: {
  width: number,
  height: number
  data: DustboxReading[]
}) {
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
          top={margin.top + height}
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

export function DustboxFlexibleChart ({
  mode,
  ...props
}: {
  width: number,
  height: number,
  mean: string,
  dustboxStreams: {
    dustboxId: string,
    readings: DustboxReading[]
  }[],
  mode: 'trunc' | 'part'
}) {
  if (mode === 'trunc') {
    return <HistoricalChart {...props} />
  } else {
    return <PolarChart {...props} />
  }
}

function HistoricalChart ({ width, height, dustboxStreams }: {
  width: number,
  height: number
  dustboxStreams: {
    dustboxId: string,
    readings: DustboxReading[]
  }[],
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

  const margin = { top: 0, right: 90, bottom: 100, left: 30 };

  // bounds
  const innerWidth = width - margin.left - margin.right;
  const axisXStart = margin.left
  const innerHeight = height - margin.top - margin.bottom;
  const axisYStart = margin.top + innerHeight

  const data = dustboxStreams.reduce(
    (data, stream) => [...data, ...stream.readings],
    [] as DustboxReading[]
  )

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
    <ScaleSVG width={width} height={height} style={{
      overflow: 'visible'
    }}>
      <GridRows
        top={margin.top}
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
        left={margin.left}
        scale={dateScale}
        height={innerHeight}
        strokeDasharray="1,3"
        stroke={'black'}
        strokeOpacity={0.1}
        pointerEvents="none"
      />
      {dustboxStreams.map(({ readings: data }) =>
        charts.map(({ name, getter, background }, i) => {
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
        })
      )}
      {/* <Bar
        x={margin.left}
        y={margin.top}
        width={innerWidth}
        height={innerHeight}
        fill="transparent"
        rx={14}
      /> */}
      <AxisLeft
        top={margin.top}
        left={margin.left}
        scale={pm25Scale}
        stroke={''}
        tickStroke={''}
        left={axisXStart}
        tickLabelProps={() => ({
          textAnchor: 'end'
        })}
        tickClassName='font-cousine text-black text-XXS'
      />
      <AxisBottom
        top={margin.top + innerHeight}
        left={margin.left}
        scale={dateScale}
        stroke={''}
        tickStroke={''}
        numTicks={4}
        tickLabelProps={() => ({
          textAnchor: 'middle'
        })}
        tickClassName='font-cousine text-black text-XXS'
      />
    </ScaleSVG>
  );
}

import { LineRadial } from '@visx/shape';
import { setDay } from "date-fns";
import { format, setHours, setMonth } from 'date-fns/esm';

export type RadarProps = {
  margin?: { top: number; right: number; bottom: number; left: number };
  levels?: number;
};

function PolarChart({ mean, dustboxStreams, width, height, levels = 5, margin =  { top: 40, left: 80, right: 80, bottom: 80 } }: RadarProps & {
  width: number,
  height: number,
  mean: 'isodow' | 'month' | 'hour' | string,
  dustboxStreams: {
    dustboxId: string,
    readings: DustboxReading[]
  }[]
}) {
  const orange = '#ff9933';
  const pumpkin = '#f5810c';
  const silver = '#d9d9d9';
  const background = '#FAF7E9';

  const degrees = 360;
  const y = getPM25Value;
  const genAngles = (length: number) =>
    [...new Array(length + 1)].map((_, i) => ({
      angle: i * (degrees / length),
    }));

  const genPoints = (length: number, radius: number) => {
    const step = (Math.PI * 2) / length;
    return [...new Array(length)].map((_, i) => ({
      x: radius * Math.sin(i * step),
      y: radius * Math.cos(i * step),
    }));
  };

  function genPolygonPoints<Datum>(
    dataArray: Datum[],
    scale: (n: number) => number,
    getValue: (d: Datum) => number,
  ) {
    const step = (Math.PI * 2) / dataArray.length;
    const points: { x: number; y: number }[] = new Array(dataArray.length).fill({ x: 0, y: 0 });
    const pointString: string = new Array(dataArray.length + 1).fill('').reduce((res, _, i) => {
      if (i > dataArray.length) return res;
      const xVal = scale(getValue(dataArray[i - 1])) * Math.sin(i * step);
      const yVal = scale(getValue(dataArray[i - 1])) * Math.cos(i * step);
      points[i - 1] = { x: xVal, y: yVal };
      res += `${xVal},${yVal} `;
      return res;
    });

    return { points, pointString };
  }

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;
  const radius = Math.min(xMax, yMax) / 2;

  const radialScale = scaleLinear<number>({
    range: [0, Math.PI * 2],
    domain: [degrees, 0],
  });

  const data = dustboxStreams.reduce(
    (data, stream) => [...data, ...stream.readings],
    [] as DustboxReading[]
  )

  const yScale = React.useMemo(
    () =>
      scaleLinear({
        range: [0, radius],
        domain: [0, max(data, y)],
        nice: true
      }),
    [margin.top, innerHeight, data]
  );

  const zeroPoint = new Point({ x: 0, y: 0 });

  return width < 10 ? null : (
    <ScaleSVG width={width} height={height}>
      <rect fill={background} width={width} height={height} rx={14} />
      <Group top={height / 2 - margin.top} left={width / 2}>
        {dustboxStreams.map(({ dustboxId, readings: data }) => {
          const webs = genAngles(data.length);
          const points = genPoints(data.length, radius);
          const polygonPoints = genPolygonPoints(data, yScale, y);

          return (
            <Group id={`radial-data-${dustboxId}`}>
              {[...new Array(levels)].map((_, i) => (
                <LineRadial
                  key={`web-${i}`}
                  data={webs}
                  angle={d => radialScale(d.angle) ?? 0}
                  radius={((i + 1) * radius) / levels}
                  fill="none"
                  stroke={silver}
                  strokeWidth={2}
                  strokeOpacity={0.8}
                  strokeLinecap="round"
                />
              ))}
              {data.map((_, i) => (
                <React.Fragment>
                  <Text {...points[i]}>
                    {mean === 'isodow'
                    ? format(setDay(new Date(), i), 'iii')
                    : mean === 'hour'
                    ? format(setHours(new Date(), i), 'ha')
                    : mean === 'month'
                    ? format(setMonth(new Date(), i), 'LLL')
                    : i
                    }
                  </Text>
                  <Line key={`radar-line-${i}`} from={zeroPoint} to={points[i]} stroke={silver} />
                </React.Fragment>
              ))}
              <polygon
                points={polygonPoints.pointString}
                fill={orange}
                fillOpacity={0.3}
                stroke={orange}
                strokeWidth={1}
              />
              {polygonPoints.points.map((point, i) => (
                <circle key={`radar-point-${i}`} cx={point.x} cy={point.y} r={4} fill={pumpkin} />
              ))}
            </Group>
          )
        })}
      </Group>
    </ScaleSVG>
  );
}
