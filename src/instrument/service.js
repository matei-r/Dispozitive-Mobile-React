import {getLogger} from '../core/utils';
import {apiUrl, authHeaders} from '../core/api';
const log = getLogger('instrument/service');
const action = (type, payload) => ({type, payload});

const SAVE_INSTRUMENT_STARTED = 'instrument/saveStarted';
const SAVE_INSTRUMENT_SUCCEEDED = 'instrument/saveSucceeded';
const SAVE_INSTRUMENT_FAILED = 'instrument/saveFailed';
const CANCEL_SAVE_INSTRUMENT = 'instrument/cancelSave';

const LOAD_INSTRUMENTS_STARTED = 'instrument/loadStarted';
const LOAD_INSTRUMENTS_SUCCEEDED = 'instrument/loadSucceeded';
const LOAD_INSTRUMENTS_FAILED = 'instrument/loadFailed';
const CANCEL_LOAD_INSTRUMENTS = 'instrument/cancelLoad';

export const loadInstruments = () => (dispatch, getState) => {
  log(`loadInstruments started`);
  dispatch(action(LOAD_INSTRUMENTS_STARTED));
  let ok = false;
  return fetch(`${apiUrl}/instrument`, {method: 'GET', headers: authHeaders(getState().auth.token)})
    .then(res => {
      ok = res.ok;
      return res.json();
    })
    .then(json => {
      log(`loadInstruments ok: ${ok}, json: ${JSON.stringify(json)}`);
      if (!getState().instrument.isLoadingCancelled) {
        dispatch(action(ok ? LOAD_INSTRUMENTS_SUCCEEDED : LOAD_INSTRUMENTS_FAILED, json));
      }
    })
    .catch(err => {
      log(`loadInstruments err = ${err.message}`);
      if (!getState().instrument.isLoadingCancelled) {
        dispatch(action(LOAD_INSTRUMENTS_FAILED, {issue: [{error: err.message}]}));
      }
    });
};
export const cancelLoadInstruments = () => action(CANCEL_LOAD_INSTRUMENTS);

export const saveInstrument = (instrument) => (dispatch, getState) => {
  const body = JSON.stringify(instrument);
  log(`saveInstrument started`);
  dispatch(action(SAVE_INSTRUMENT_STARTED));
  let ok = false;
  const url = instrument._id ? `${apiUrl}/instrument/${instrument._id}` : `${apiUrl}/instrument`;
  const method = instrument._id ? `PUT` : `POST`;
  return fetch(url, {method, headers: authHeaders(getState().auth.token), body})
    .then(res => {
      ok = res.ok;
      return res.json();
    })
    .then(json => {
      log(`saveInstrument ok: ${ok}, json: ${JSON.stringify(json)}`);
      if (!getState().instrument.isSavingCancelled) {
        dispatch(action(ok ? SAVE_INSTRUMENT_SUCCEEDED : SAVE_INSTRUMENT_FAILED, json));
      }
    })
    .catch(err => {
      log(`saveInstrument err = ${err.message}`);
      if (!getState().isSavingCancelled) {
        dispatch(action(SAVE_INSTRUMENT_FAILED, {issue: [{error: err.message}]}));
      }
    });
};
export const cancelSaveInstrument = () => action(CANCEL_SAVE_INSTRUMENT);

export const instrumentReducer = (state = {items: [], isLoading: false, isSaving: false}, action) => { //newState (new object)
  switch(action.type) {
    case LOAD_INSTRUMENTS_STARTED:
      return {...state, isLoading: true, isLoadingCancelled: false, issue: null};
    case LOAD_INSTRUMENTS_SUCCEEDED:
      return {...state, items: action.payload, isLoading: false};
    case LOAD_INSTRUMENTS_FAILED:
      return {...state, issue: action.payload.issue, isLoading: false};
    case CANCEL_LOAD_INSTRUMENTS:
      return {...state, isLoading: false, isLoadingCancelled: true};
    case SAVE_INSTRUMENT_STARTED:
      return {...state, isSaving: true, isSavingCancelled: false, issue: null};
    case SAVE_INSTRUMENT_SUCCEEDED:
      let items = [...state.items];
      let index = items.findIndex((i) => i._id == action.payload._id);
      if (index != -1) {
        items.splice(index, 1, action.payload);
      } else {
        items.push(action.payload);
      }
      return {...state, items, isSaving: false};
    case SAVE_INSTRUMENT_FAILED:
      return {...state, issue: action.payload.issue, isSaving: false};
    case CANCEL_SAVE_INSTRUMENT:
      return {...state, isSaving: false, isSavingCancelled: true};
    default:
      return state;
  }
};
