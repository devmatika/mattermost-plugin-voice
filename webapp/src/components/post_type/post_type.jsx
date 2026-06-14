import VoicePlayer from '../voice_player/voice_player';

const React = window.React;
const PropTypes = window.PropTypes;

export default class PostType extends React.PureComponent {
    static propTypes = {
        post: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        pluginURL: PropTypes.string.isRequired,
    }

    render() {
        const post = {...this.props.post};

        return (
            <VoicePlayer
                playerId={'voice_' + post.id}
                source={`${this.props.pluginURL}/recordings/${post.id}`}
                duration={post.props?.duration}
                theme={this.props.theme}
            />
        );
    }
}
