import {id as pluginId} from './manifest';

const getPluginState = (state) => state['plugins-' + pluginId] || {};

export const isRecordingModalVisible = (state) => getPluginState(state).recordingModalVisible;

export const recordingDuration = (state) => getPluginState(state).recordingDuration;

export const recordingError = (state) => getPluginState(state).recordingError || '';
