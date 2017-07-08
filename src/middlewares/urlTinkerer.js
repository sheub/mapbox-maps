const CALL_HISTORY_METHOD = '@@router/CALL_HISTORY_METHOD';

const urlTinkerer = (store) => (next) => (action) => { // eslint-disable-line

  switch (action.type) {
  case 'SET_STATE_VALUE': {
    next(action);

    let actionPayload = getActionPayload(action.key, action.value);
    const url = updateUrlWithPayload(store.getState().router.location.pathname, actionPayload);

    next({
      type: CALL_HISTORY_METHOD,
      payload: {
        method: 'replace',
        args: [url]
      }
    });

    break;
  }

  case 'SET_STATE_VALUES': {
    next(action);

    let url = store.getState().router.location.pathname;
    Object.keys(action.modifiedState).forEach(k => {
      let actionPayload = getActionPayload(k, action.modifiedState[k]);
      url = updateUrlWithPayload(url, actionPayload);
    });

    next({
      type: CALL_HISTORY_METHOD,
      payload: {
        method: 'replace',
        args: [url]
      }
    });

    break;
  }

  default:
    next(action); // let through as default
    break;
  }

};

function getActionPayload(key, value) {
  let actionPayload = {};
  if (key === 'mapCoords') {
    actionPayload = {
      coords: value
    };
  } else if (key === 'searchLocation') {
    actionPayload = {
      searchCoords: value.geometry.coordinates,
      searchPlace: value.place_name.split(',')[0]
    };
  }
  return actionPayload;
}

function updateUrlWithPayload(url, actionPayload) {
  var props = parseUrl(url);
  return toUrl(Object.assign({}, props, actionPayload));
}

function parseUrl(url) {
  var props = {};
  var splits = url.split('/');
  splits.forEach(s => {
    if (s.startsWith('@')) { // Parse coords, noted with an @.
      props.coords = s.slice(1).split(',').map(Number);
    } else if (s.startsWith('+')) { // Parse search coords, noted with a +.
      props.searchCoords = s.slice(1).split(',').map(Number);
    } else if (s.startsWith('~')) { // Parse search place name, noted with a ~.
      props.searchPlace = decodeURI(s.slice(1));
    }
  });

  return props;
}

function toUrl(props) {
  var res = [''];
  if (props.coords) {
    res.push('@' + [
      props.coords[0].toFixed(6),
      props.coords[1].toFixed(6),
      props.coords[2].toFixed(2),
    ].join(','));
  }
  if (props.searchCoords) {
    res.push('+' + props.searchCoords.map(e => e.toFixed(6)).join(','));
  }
  if (props.searchPlace) {
    res.push('~' + encodeURI(props.searchPlace));
  }

  return res.join('/');
}

export default urlTinkerer;
