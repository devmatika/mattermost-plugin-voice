import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import PostType from './components/post_type';
import Root from './components/root';
import VoiceFilePreview, {isVoiceFile} from './components/file_preview/voice_file_preview';
import reducer from './reducer';
import {recordVoiceMessage} from './actions';
import {getPluginURL, normalizeChannelId} from './utils';
import {injectVoiceStyles} from './styles';

import Client from './client';

const microphoneIcon = <i className='icon fa fa-microphone'/>;

export default class VoicePlugin {
    initialize(registry, store) {
        const config = getConfig(store.getState());
        if (config?.SiteURL) {
            Client4.setUrl(config.SiteURL);
        }

        injectVoiceStyles();

        const client = new Client();

        const startRecording = (channelLike = '', rootId = '') => {
            const resolvedChannelId = normalizeChannelId(channelLike) || getCurrentChannelId(store.getState()) || '';
            recordVoiceMessage(resolvedChannelId, rootId, client)(store.dispatch, store.getState);
        };

        registry.registerRootComponent(Root);
        registry.registerFileUploadMethod(
            microphoneIcon,
            () => startRecording(),
            <FormattedMessage
                id='plugin.upload'
                defaultMessage='Voice message'
            />,
        );
        registry.registerPostTypeComponent('custom_voice', PostType);
        registry.registerFilePreviewComponent(isVoiceFile, VoiceFilePreview);
        registry.registerReducer(reducer);
        registry.registerSlashCommandWillBePostedHook((message, args) => {
            if (message.trim() === '/voice') {
                startRecording(args.channel_id, args.root_id);
                return {};
            }
            return {message, args};
        });
        registry.registerMainMenuAction(
            <FormattedMessage
                id='plugin.main_menu'
                defaultMessage='Record voice message'
            />,
            () => startRecording(),
            microphoneIcon,
        );
        registry.registerAppBarComponent({
            iconUrl: `${getPluginURL()}/public/voice-icon.svg`,
            action: (channelLike) => startRecording(channelLike),
            tooltipText: (
                <FormattedMessage
                    id='plugin.app_bar'
                    defaultMessage='Voice message'
                />
            ),
        });
    }
}
