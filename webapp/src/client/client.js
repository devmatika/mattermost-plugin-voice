import {Client4} from 'mattermost-redux/client';

import {getPluginURL} from '../utils.js';

import Recorder from './recorder.js';

const DEFAULT_MAX_DURATION = 300;
const DEFAULT_BIT_RATE = 64;

function getRequestHeaders(method, body) {
    const options = Client4.getOptions({method, body});
    const headers = {...options.headers};

    // Let the browser set multipart boundaries for file uploads.
    if (body instanceof FormData && headers['Content-Type']?.includes('multipart/form-data')) {
        delete headers['Content-Type'];
    }

    return headers;
}

function parseJSONResponse(response) {
    if (!response.ok) {
        return response.text().then((text) => {
            throw new Error(text || response.statusText);
        });
    }

    return response.json();
}

function formatDuration(msecs) {
    const secs = Math.round(msecs / 1000);
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export default class Client {
    constructor() {
        this._onUpdate = null;
        this.timerID = null;
        this.recorder = new Recorder({
            workerURL: `${getPluginURL()}/public/recorder.worker.js`,
        });

        this._ready = this.recorder.init({
            maxDuration: DEFAULT_MAX_DURATION,
            bitRate: DEFAULT_BIT_RATE,
        });

        this._ready.then(() => {
            return fetch(`${getPluginURL()}/config`, {
                headers: {
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            }).then(parseJSONResponse).then((config) => {
                this.recorder.maxDuration = parseInt(config.VoiceMaxDuration, 10) || DEFAULT_MAX_DURATION;
                this.recorder.bitRate = parseInt(config.VoiceAudioBitrate, 10) || DEFAULT_BIT_RATE;
            });
        }).catch(() => {
            // Keep default recorder settings if config cannot be loaded.
        });
    }

    startRecording(channelId, rootId) {
        this.channelId = channelId || null;
        this.rootId = rootId || null;
        this._recording = null;
        return this._ready.then(() => {
            return this.recorder.start().then(() => {
                this.timerID = setInterval(() => {
                    if (this._onUpdate && this.recorder.startTime) {
                        this._onUpdate(new Date().getTime() - this.recorder.startTime);
                    }
                }, 200);
            });
        });
    }

    stopRecording() {
        if (this.timerID) {
            clearInterval(this.timerID);
        }
        this._onUpdate = null;
        return this._ready.then(() => this.recorder.stop());
    }

    cancelRecording() {
        if (this.timerID) {
            clearInterval(this.timerID);
        }
        this._onUpdate = null;
        return this._ready.then(() => this.recorder.cancel());
    }

    _sendRecording({channelId, rootId, recording}) {
        const filename = `${new Date().getTime() - recording.duration}.mp3`;
        const formData = new FormData();
        formData.append('files', recording.blob, filename);
        formData.append('channel_id', channelId);

        return fetch(Client4.getFilesRoute(), {
            method: 'POST',
            headers: getRequestHeaders('post', formData),
            body: formData,
            credentials: 'same-origin',
        }).then(parseJSONResponse).then((fileResponse) => {
            const fileId = fileResponse.file_infos[0].id;
            const durationLabel = formatDuration(recording.duration);
            const data = {
                channel_id: channelId,
                root_id: rootId,
                message: `Voice Message (${durationLabel})`,
                type: 'custom_voice',
                file_ids: [fileId],
                props: {
                    voice_message: true,
                    fileId,
                    duration: recording.duration,
                },
            };
            const body = JSON.stringify(data);

            return fetch(Client4.getPostsRoute(), {
                method: 'POST',
                headers: getRequestHeaders('post', body),
                body,
                credentials: 'same-origin',
            }).then(parseJSONResponse);
        });
    }

    sendRecording(channelId, rootId) {
        if (!this.channelId && !channelId) {
            return Promise.reject(new Error('channel id is required'));
        }
        const cId = this.channelId ? this.channelId : channelId;
        const rId = !this.channelId && rootId ? rootId : this.rootId;

        const send = (recording) => {
            if (!recording || !recording.blob || recording.duration <= 0) {
                return Promise.reject(new Error('no recording available'));
            }
            return this._sendRecording({
                channelId: cId,
                rootId: rId,
                recording,
            });
        };

        if (this._recording) {
            return send(this._recording);
        }
        return this._ready.then(() => this.recorder.stop()).then(send);
    }

    on(type, cb) {
        if (type === 'update') {
            this._onUpdate = cb;
        }
    }
}
