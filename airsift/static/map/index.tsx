import ReactDOM from 'react-dom';
import React from 'react';
import { Root } from './layout';
import { Provider } from 'jotai';

const ROOT_ID = 'react-app-dustbox-map';

export default () => {
  const root = document.getElementById(ROOT_ID)
  let userId: any = document.getElementById(`user_id`)?.innerHTML
  if (userId === 'null') {
    userId = null
  } else {
    userId = String(userId)
  }
  if (root) {
    ReactDOM.render(
      <Provider>
        <Root
          userId={userId}
          mapboxApiAccessToken={'pk.eyJ1IjoicGVhY2VpbnNpZ2h0IiwiYSI6ImNqbm9nMHFvNjA1MnQzdm0xaWNxM3l5d3YifQ.pXF7u303bNopP7uyVBK8tA'}
          mapboxStyleConfig='mapbox://styles/peaceinsight/ckggfac010dzg19mo9v8odezw'
        />
      </Provider>,
    root)
  }
}
