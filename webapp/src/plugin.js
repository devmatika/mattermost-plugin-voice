import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import PostType from './components/post_type';
import Root from './components/root';
import VoiceFilePreview, {isVoiceFile} from './components/file_preview/voice_file_preview';
import reducer from './reducer';
import {recordVoiceMessage} from './actions';

import Client from './client';

export default class VoicePlugin {
    initialize(registry, store) {
        const config = getConfig(store.getState());
        if (config?.SiteURL) {
            Client4.setUrl(config.SiteURL);
        }

        const client = new Client();

        registry.registerRootComponent(Root);
        registry.registerFileUploadMethod(
            <i className='icon fa fa-microphone'/>,
            () => {
                recordVoiceMessage('', '', client)(store.dispatch, store.getState);
            },
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
                recordVoiceMessage(args.channel_id, args.root_id, client)(store.dispatch, store.getState);
                return {};
            }
            return {message, args};
        });
    }
}
