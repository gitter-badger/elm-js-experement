import * as sagaEffects from 'redux-saga/effects'
import * as sagaUtils from 'redux-saga/lib/internal/utils'


export const call = (...args) => {
  return sagaEffects.call(...args);
};

export const delay = (ms) => {
  return sagaEffects.call(sagaUtils.delay, ms);
};
