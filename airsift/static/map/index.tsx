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
          mapboxApiAccessToken={'pk.eyJ1IjoiYWlyc2lmdCIsImEiOiJja2l1ZGo0aGMweGszMndtbTI4eW52YmZ1In0.eotYFVZuDGtZr_QxrRuySg'}
          mapboxStyleConfig={'mapbox://styles/airsift/ckiuctolj2ra219ozb0124rk4'}
        />
      </Provider>,
    root)
  }
}
