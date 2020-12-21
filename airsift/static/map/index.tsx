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
          mapboxApiAccessToken={'pk.eyJ1IjoiY2l0aXplbnNlbnNlMSIsImEiOiJja2l5cnN2YjYxZm9mMnRtZTNqNTByNWd1In0.v61_Jv9DgHoDsePAr-PA-w'}
          mapboxStyleConfig={'mapbox://styles/citizensense1/ckiyrorg9704219qokjh01owg'}
        />
      </Provider>,
    root)
  }
}
