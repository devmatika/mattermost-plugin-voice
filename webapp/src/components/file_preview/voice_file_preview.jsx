import {Client4} from 'mattermost-redux/client';

import VoicePlayer from '../voice_player/voice_player';

const React = window.React;
const PropTypes = window.PropTypes;

function isVoiceFile(fileInfo, post) {
    if (!fileInfo || !post) {
        return false;
    }

    if (post.props?.voice_message === true || post.props?.voice_message === 'true') {
        return true;
    }

    if (post.type === 'custom_voice') {
        return true;
    }

    const mimeType = fileInfo.mime_type || fileInfo.mimeType || '';
    if (mimeType.startsWith('audio/') && post.props?.fileId === fileInfo.id) {
        return true;
    }

    if (mimeType.startsWith('audio/') && post.message?.startsWith('Voice Message')) {
        return true;
    }

    return false;
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
            playerId={`voice_preview_${post.id}_${fileInfo.id}`}
        />
    );
}

VoiceFilePreview.propTypes = {
    fileInfo: PropTypes.object.isRequired,
    post: PropTypes.object.isRequired,
    theme: PropTypes.object,
};

export {isVoiceFile};
