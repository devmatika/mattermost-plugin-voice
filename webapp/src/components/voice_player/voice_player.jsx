import {css} from '@emotion/react';
import {changeOpacity} from 'mattermost-redux/utils/theme_utils';

import '../post_type/post_type.css';

const React = window.React;
const PropTypes = window.PropTypes;

function pad2(n) {
    const val = n | 0;
    return val < 10 ? `0${val}` : `${Math.min(val, 99)}`;
}

function pad2nozero(n) {
    const val = n | 0;
    return val < 10 ? `${val}` : `${Math.min(val, 99)}`;
}

const PLAYBACK_SPEEDS = [1, 1.5, 2];

function formatSpeed(rate) {
    return rate === 1 ? '1x' : `${rate}x`;
}

export default class VoicePlayer extends React.PureComponent {
    static propTypes = {
        source: PropTypes.string.isRequired,
        duration: PropTypes.number,
        theme: PropTypes.object.isRequired,
        playerId: PropTypes.string.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            player: null,
            currentTime: '0:00',
            duration: '',
            playing: false,
            played: false,
            progress: 0,
            playbackRate: 1,
        };
    }

    componentDidMount() {
        this.bindPlayer();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.source !== this.props.source) {
            this.bindPlayer();
        }
    }

    bindPlayer() {
        const player = document.getElementById(this.props.playerId);
        if (!player) {
            return;
        }

        const durationSecs = player.duration > 0 ?
            player.duration : (this.props.duration || 0) / 1000;

        player.ontimeupdate = (ev) => {
            const secs = Math.round(ev.target.currentTime);
            const progress = Math.round((ev.target.currentTime / durationSecs) * 100);
            this.setState({
                currentTime: pad2nozero(secs / 60) + ':' + pad2(secs % 60),
                progress,
            });
        };

        player.onplay = () => {
            this.setState({playing: true, played: true});
        };

        player.onplaying = () => {
            this.setState({playing: true});
        };

        player.onpause = () => {
            this.setState({playing: false});
        };

        player.onerror = () => {
            this.setState({playing: false, played: false});
        };

        player.onended = () => {
            this.setState({playing: false, played: false});
        };

        player.playbackRate = this.state.playbackRate;

        this.setState({
            player,
            duration: pad2nozero(Math.round(durationSecs) / 60) + ':' + pad2(Math.round(durationSecs) % 60),
        });
    }

    play = () => {
        if (this.state.player) {
            this.state.player.play();
        }
    }

    pause = () => {
        if (this.state.player) {
            this.state.player.pause();
        }
    }

    onProgressClick = (ev) => {
        if (!this.state.player) {
            return;
        }

        const durationSecs = this.state.player.duration > 0 ?
            this.state.player.duration : (this.props.duration || 0) / 1000;
        const rect = ev.target.getBoundingClientRect();
        const seekPos = ev.clientX - rect.left;
        const seekValue = (seekPos / rect.width);
        const seekTime = (durationSecs * seekValue);
        const progress = Math.round((seekTime / durationSecs) * 100);
        const {player} = this.state;

        player.currentTime = seekTime;
        this.setState({player, progress});
    }

    cyclePlaybackSpeed = () => {
        const currentIndex = PLAYBACK_SPEEDS.indexOf(this.state.playbackRate);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % PLAYBACK_SPEEDS.length;
        const playbackRate = PLAYBACK_SPEEDS[nextIndex];

        if (this.state.player) {
            this.state.player.playbackRate = playbackRate;
        }

        this.setState({playbackRate});
    }

    render() {
        const theme = this.props.theme;
        const hoverCss = css`
            &:hover {
                color: ${theme.linkColor};
            }
        `;

        const playIcon = this.state.playing ?
            <i onClick={this.pause} css={hoverCss} className='fa fa-pause'/> :
            <i onClick={this.play} css={hoverCss} className='fa fa-play'/>;

        const playbackInfo = this.state.played ? this.state.currentTime : this.state.duration;

        const playerStyle = {
            backgroundColor: theme.centerChannelBg,
            color: changeOpacity(theme.centerChannelColor, 0.7),
            border: '1px solid ' + changeOpacity(theme.centerChannelColor, 0.2),
        };

        const progressCss = css`
            -webkit-appearance: none;
            -moz-appearance: none;
            background: ${changeOpacity(theme.centerChannelColor, 0.1)};
            color: ${theme.linkColor};
            border: 1px solid ${changeOpacity(theme.centerChannelColor, 0.1)};
            &::-moz-progress-bar {
                background: ${theme.linkColor};
            }
            &::-webkit-progress-bar {
                background: ${changeOpacity(theme.centerChannelColor, 0.1)};
            }
            &::-webkit-progress-value {
                background: ${theme.linkColor};
            }
        `;

        const speedButtonCss = css`
            background: none;
            border: none;
            padding: 0 4px;
            margin-left: 4px;
            font-size: 11px;
            font-weight: 600;
            line-height: 1;
            cursor: pointer;
            color: ${changeOpacity(theme.centerChannelColor, 0.56)};
            min-width: 28px;
            &:hover {
                color: ${theme.linkColor};
            }
        `;

        return (
            <div>
                <div
                    className='voice-player'
                    style={playerStyle}
                >
                    <div style={{width: '12px'}}>
                        <button className='voice-player-playbutton'>
                            {playIcon}
                        </button>
                    </div>
                    <progress
                        onClick={this.onProgressClick}
                        css={progressCss}
                        className='voice-player-progress'
                        min='0'
                        max='100'
                        value={this.state.progress}
                    />
                    <span>{playbackInfo}</span>
                    <button
                        type='button'
                        className='voice-player-speed'
                        css={speedButtonCss}
                        onClick={this.cyclePlaybackSpeed}
                        title='Playback speed'
                        aria-label={`Playback speed ${formatSpeed(this.state.playbackRate)}`}
                    >
                        {formatSpeed(this.state.playbackRate)}
                    </button>
                </div>
                <audio
                    id={this.props.playerId}
                    preload='none'
                >
                    <source
                        src={this.props.source}
                        type='audio/mpeg'
                    />
                </audio>
            </div>
        );
    }
}
