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
    key: 'pm1',
    name: "PM1 mg/m³",
    getter: getPM1Value,
    background: '#FF8695'
  }, {
    key: 'pm25',
    name: "PM2.5 mg/m³",
    getter:getPM25Value,
    background: '#33CCFF'
  }, {
    key: 'pm10',
    name: "PM10 mg/m³",
    getter:getPM10Value,
    background: '#CF96C8'
  }, {
    key: 'humidity',
    name: "Humidity %",
    getter:getHumidityValue,
    background: '#2E03DA'
  }, {
    key: 'temperature',
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

type ChartProps = {
  isLoading: boolean,
  width: number,
  height: number,
  mean: string,
  dustboxStreams: {
    dustboxId: string,
    dustbox: Dustbox,
    readings: DustboxReading[]
  }[],
  mode: 'trunc' | 'part'
  measure: string
  valueGetter: (a: any) => number
}

const getChartLegend = (str: string) => {
  return charts.find(({ key }) => key === str)!
}

export function DustboxFlexibleChart (props: ChartProps) {
  if (!props.isLoading && props.dustboxStreams.length === 0) {
    return (
      <div className='text-S font-cousine uppercase text-midDarker text-center m-4 max-w-md'>
        Select one or more dustboxes to visualise air quality readings data.
      </div>
    )
  }
  if (props.mode === 'trunc') {
    return <HistoricalChart {...props} />
  }
  return <PolarChart {...props} />
}

import Plot from 'react-plotly.js';
import { format, setDay, setHours, setMonth } from 'date-fns/esm';
import randomcolor from 'randomcolor'

export function HistoricalChart ({ measure, dustboxStreams, width, height }: ChartProps) {
  const chartLegend = getChartLegend(measure)
  return (
    <Plot
      data={dustboxStreams.map(stream => {
        const color = randomcolor({ seed: stream.dustboxId, luminosity: 'bright' })

        return {
          name: `${stream.dustbox.title.toUpperCase()}`,
          x: stream.readings.map(getDate),
          y: stream.readings.map(chartLegend.getter),
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color },
          trendline: "ols"
        }
      })}
      layout={{
        title: `Historical data (${chartLegend.name})`,
        width,
        height,
        font: {
          family: "Cousine, 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
          size: 16,
          color: '#585e5f',
        },
        yaxis: {
          title: {
            text: chartLegend.name
          }
        }
      }}
      config={{
        responsive: true,
        displaylogo: false,
        displayModeBar: true,
      }}
    />
  )
}

class Mean {
  constructor(
    public length: number,
    public FORMAT: string,
    public labelFn?: (i: number, FORMAT: string) => string,
    public seriesFn?: (i: number) => number[]
  ) {}

  public label = (i: number) => {
    return this.labelFn ? this.labelFn(i, this.FORMAT) : format(setHours(new Date(), i), this.FORMAT)
  }

  public series = () => {
    return this.seriesFn ? this.seriesFn(this.length) : [...new Array(this.length)].map((_, i) => i)
  }
}

const hour = new Mean(
  24, 'ha',
  (i: number, FORMAT: string) => format(setHours(new Date(), i), FORMAT)
)
const isodow = new Mean(
  7, 'iii',
  (i: number, FORMAT: string) => format(setDay(new Date(), i), FORMAT)
)
const month = new Mean(
  12, 'MMM',
  (i: number, FORMAT: string) => format(setMonth(new Date(), i - 1), FORMAT),
  (length) => [...new Array(length)].map((_, i) => i + 1)
)

export const means: { [key: string]: Mean } = { hour, isodow, month }

function dummyArrayItem <T>(a: T[]): T {
  const example = JSON.parse(JSON.stringify(a[0]))
  for (const key in example) {
    if (typeof example[key] === 'number' || 'string' || 'boolean') {
      // @ts-ignore
      example[key] = null
    }
  }
  return example
}

function loopedPolarData (
  mean: string,
  getter: (d: DustboxReading) => number,
  _data: DustboxReading[],
) {
  const data = _data.slice()
  if (!data.length) return { r: [], theta: [] }
  const meanMean = means[mean]!

  const loopedData = meanMean.series().map(createdAt => {
    return data.find(a => a.createdAt === createdAt) || { ...dummyArrayItem(data), createdAt: createdAt }
  })

  let out = {
    r: loopedData.map(getter),
    theta: loopedData.map(d => meanMean.label(d.createdAt as any))
  }

  return out
}

export function PolarChart ({ measure, dustboxStreams, width, height, mean }: ChartProps) {
  if (!Object.keys(means).includes(mean)) {
    mean = 'isodow'
  }
  const chartLegend = getChartLegend(measure)
  const meanMean = means[mean]!
  const categoryarray = meanMean.series().map(n => meanMean.label(n).toUpperCase())

  return (
    <Plot
      data={dustboxStreams.map(stream => {
        const color = randomcolor({ seed: stream.dustboxId, luminosity: 'bright' })
        const { r, theta } = loopedPolarData(mean, chartLegend.getter, stream.readings)

        return {
          name: `${stream.dustbox.title.toUpperCase()}`,
          type: "scatterpolar",
          mode: "lines+markers",
          r,
          theta: categoryarray,
          line: {
            color
          },
          marker: {
            color,
            symbol: "square",
            size: 8
          },
          subplot: "polar"
        }
      })}
      layout={{
        font: {
          family: "Cousine, 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
          size: 16,
          color: '#585e5f',
        },
        polar: {
          radialaxis: {
            title: {
              text: chartLegend.name
            }
          },
          angularaxis: {
            // @ts-ignore
            rotation:
              mean === 'hour' ? (360 / 24) * 6
              : mean === 'isodow' ? (360 / 7) * 2.75
              : 360 * 0.25,
            direction: 'clockwise'
          }
        },
        title: `Pattern of air quality data (${chartLegend.name})`,
        width,
        height,
      }}
    />
  )
}
