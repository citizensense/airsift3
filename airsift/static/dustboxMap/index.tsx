import ReactDOM from 'react-dom';
import React from 'react';
import { DustboxMap } from './layout';

const ROOT_ID = 'react-app-dustbox-map';

export default () => {
  const root = document.getElementById(ROOT_ID)
  if (root) {
    ReactDOM.render(
      <DustboxMap
        mapboxApiAccessToken={'pk.eyJ1IjoicGVhY2VpbnNpZ2h0IiwiYSI6ImNqbm9nMHFvNjA1MnQzdm0xaWNxM3l5d3YifQ.pXF7u303bNopP7uyVBK8tA'}
        mapboxStyleConfig='mapbox://styles/peaceinsight/ckggfac010dzg19mo9v8odezw'
      />,
    root)
  }
}
