import {cancelRecording, sendRecording} from 'actions';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {isRecordingModalVisible, recordingDuration, recordingError} from 'selectors';

import Root from './root';

const connect = window.ReactRedux.connect;
const bindActionCreators = window.Redux.bindActionCreators;

const mapStateToProps = (state) => {
    return {
        visible: isRecordingModalVisible(state),
        duration: recordingDuration(state),
        channelId: getCurrentChannelId(state),
        rootId: state.views?.rhs?.selectedPostId || '',
        error: recordingError(state),
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    cancel: cancelRecording,
    send: sendRecording,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Root);
