import {Client4} from 'mattermost-redux/client';

import VoicePlayer from '../voice_player/voice_player';

const React = window.React;
const PropTypes = window.PropTypes;

function isVoiceFile(fileInfo, post) {
    if (!fileInfo || !post) {
        return false;
    }

    if (post.props?.voice_message === true) {
        return true;
    }

    if (post.type === 'custom_voice') {
        return true;
    }

    return fileInfo.mime_type?.startsWith('audio/') && post.props?.fileId === fileInfo.id;
}

export default function VoiceFilePreview(props) {
    const {fileInfo, post} = props;
    const duration = post.props?.duration;
    const source = Client4.getFileRoute(fileInfo.id);

    return (
        <VoicePlayer
            source={source}
            duration={duration}
            theme={props.theme}
        />
    );
}

VoiceFilePreview.propTypes = {
    fileInfo: PropTypes.object.isRequired,
    post: PropTypes.object.isRequired,
    theme: PropTypes.object,
};

export {isVoiceFile};
