import {
    OPEN_RECORDING_MODAL,
    CLOSE_RECORDING_MODAL,
    START_RECORDING,
    STOP_RECORDING,
    CANCEL_RECORDING,
    UPDATE_RECORDING,
    SET_RECORDING_ERROR,
} from './action_types';

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

export const sendRecording = (channelId, rootId) => (dispatch) => {
    dispatch({
        type: STOP_RECORDING,
    });

    Client.sendRecording(channelId, rootId).then(() => {
        closeRecordingModal()(dispatch);
    }).catch((err) => {
        setRecordingError(err.message || 'Failed to send voice message')(dispatch);
    });
};

export const recordVoiceMessage = (channelId, rootId, client) => (dispatch) => {
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

    client.startRecording(channelId, rootId).then(() => {
        dispatch({
            type: START_RECORDING,
        });
    }).catch((err) => {
        setRecordingError(err.message || 'Failed to start recording. Check microphone permissions.')(dispatch);
    });
};
