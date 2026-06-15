import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import {normalizeChannelId} from './utils';
import {
    OPEN_RECORDING_MODAL,
    CLOSE_RECORDING_MODAL,
    START_RECORDING,
    STOP_RECORDING,
    CANCEL_RECORDING,
    UPDATE_RECORDING,
    SET_RECORDING_ERROR,
    SET_RECORDING_TARGET,
} from './action_types';
import {recordingChannelId, recordingRootId} from './selectors';

let Client = null;

const openRecordingModal = () => (dispatch) => {
    dispatch({
        type: OPEN_RECORDING_MODAL,
    });
};

const closeRecordingModal = () => (dispatch) => {
    dispatch({
        type: CLOSE_RECORDING_MODAL,
    });
    dispatch({
        type: SET_RECORDING_ERROR,
        error: '',
    });
};

const setRecordingError = (error) => (dispatch) => {
    dispatch({
        type: SET_RECORDING_ERROR,
        error,
    });
};

export const cancelRecording = () => (dispatch) => {
    dispatch({
        type: CANCEL_RECORDING,
    });
    Client.cancelRecording().catch(() => {
        // Ignore cancel errors.
    });
    closeRecordingModal()(dispatch);
};

export const sendRecording = () => (dispatch, getState) => {
    const channelId = recordingChannelId(getState());
    const rootId = recordingRootId(getState());

    if (!channelId) {
        setRecordingError('Open a channel before sending a voice message.')(dispatch);
        return;
    }

    dispatch({
        type: STOP_RECORDING,
    });

    Client.sendRecording(channelId, rootId).then(() => {
        closeRecordingModal()(dispatch);
    }).catch((err) => {
        setRecordingError(err.message || 'Failed to send voice message')(dispatch);
    });
};

export const recordVoiceMessage = (channelId, rootId, client) => (dispatch, getState) => {
    const state = getState();
    const resolvedChannelId = normalizeChannelId(channelId) || getCurrentChannelId(state) || '';
    const resolvedRootId = rootId || state.views?.rhs?.selectedPostId || '';

    if (!resolvedChannelId) {
        dispatch({
            type: SET_RECORDING_TARGET,
            channelId: '',
            rootId: '',
        });
        openRecordingModal()(dispatch);
        setRecordingError('Open a channel before recording a voice message.')(dispatch);
        return;
    }

    dispatch({
        type: SET_RECORDING_TARGET,
        channelId: resolvedChannelId,
        rootId: resolvedRootId,
    });
    openRecordingModal()(dispatch);

    if (client) {
        Client = client;
    }

    client.on('update', (duration) => {
        dispatch({
            type: UPDATE_RECORDING,
            duration,
        });
    });

    client.startRecording(resolvedChannelId, resolvedRootId).then(() => {
        dispatch({
            type: START_RECORDING,
        });
    }).catch((err) => {
        setRecordingError(err.message || 'Failed to start recording. Check microphone permissions.')(dispatch);
    });
};
