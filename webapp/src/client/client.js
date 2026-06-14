import {Client4} from 'mattermost-redux/client';

import {getPluginURL} from '../utils.js';

import Recorder from './recorder.js';

function getRequestHeaders(method) {
    const options = Client4.getOptions({method});
    const headers = {...options.headers};

    // Let the browser set multipart boundaries for file uploads.
    if (method === 'post' && headers['Content-Type']?.includes('multipart/form-data')) {
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

export default class Client {
    constructor() {
        this._onUpdate = null;
        this.timerID = null;
        this.recorder = new Recorder({
            workerURL: `${getPluginURL()}/public/recorder.worker.js`,
        });

        fetch(`${getPluginURL()}/config`, {
            headers: {
                Accept: 'application/json',
            },
            credentials: 'same-origin',
        }).then(parseJSONResponse).then((config) => {
            return this.recorder.init({
                maxDuration: parseInt(config.VoiceMaxDuration, 10),
                bitRate: parseInt(config.VoiceAudioBitrate, 10),
            });
        }).catch(() => {
            // Use recorder defaults if config cannot be loaded.
        });

        this.recorder.on('maxduration', () => {
            if (this.timerID) {
                clearInterval(this.timerID);
            }
            this.recorder.stop().then((recording) => {
                this._recording = recording;
                if (this._onUpdate) {
                    this._onUpdate(0);
                }
            });
        });
    }

    startRecording(channelId, rootId) {
        this.channelId = channelId || null;
        this.rootId = rootId || null;
        this._recording = null;
        return this.recorder.start().then(() => {
            this.timerID = setInterval(() => {
                if (this._onUpdate && this.recorder.startTime) {
                    this._onUpdate(new Date().getTime() - this.recorder.startTime);
                }
            }, 200);
        });
    }

    stopRecording() {
        if (this.timerID) {
            clearInterval(this.timerID);
        }
        this._onUpdate = null;
        return this.recorder.stop();
    }

    cancelRecording() {
        if (this.timerID) {
            clearInterval(this.timerID);
        }
        this._onUpdate = null;
        return this.recorder.cancel();
    }

    _sendRecording({channelId, rootId, recording}) {
        const filename = `${new Date().getTime() - recording.duration}.mp3`;
        const formData = new FormData();
        formData.append('files', recording.blob, filename);
        formData.append('channel_id', channelId);

        return fetch(Client4.getFilesRoute(), {
            method: 'POST',
            headers: getRequestHeaders('post'),
            body: formData,
            credentials: 'same-origin',
        }).then(parseJSONResponse).then((fileResponse) => {
            const data = {
                channel_id: channelId,
                root_id: rootId,
                message: 'Voice Message',
                type: 'custom_voice',
                props: {
                    fileId: fileResponse.file_infos[0].id,
                    duration: recording.duration,
                },
            };

            return fetch(Client4.getPostsRoute(), {
                method: 'POST',
                headers: getRequestHeaders('post'),
                body: JSON.stringify(data),
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

        if (this._recording) {
            return this._sendRecording({
                channelId: cId,
                rootId: rId,
                recording: this._recording,
            });
        }
        return this.recorder.stop().then((res) => {
            return this._sendRecording({
                channelId: cId,
                rootId: rId,
                recording: res,
            });
        });
    }

    on(type, cb) {
        if (type === 'update') {
            this._onUpdate = cb;
        }
    }
}
