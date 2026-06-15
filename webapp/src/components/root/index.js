import {cancelRecording, sendRecording} from 'actions';
import {isRecordingModalVisible, recordingDuration, recordingError} from 'selectors';

import Root from './root';

const connect = window.ReactRedux.connect;
const bindActionCreators = window.Redux.bindActionCreators;

const mapStateToProps = (state) => {
    return {
        visible: isRecordingModalVisible(state),
        duration: recordingDuration(state),
        error: recordingError(state),
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    cancel: cancelRecording,
    send: sendRecording,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Root);
