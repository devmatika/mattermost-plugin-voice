import {id as pluginId} from 'manifest';

export function getPluginURL() {
    const pluginURL = window.basename ? `${window.basename}/plugins/${pluginId}` :
        `/plugins/${pluginId}`;
    return pluginURL;
}

export function normalizeChannelId(value) {
    if (typeof value === 'string' && value.trim() !== '') {
        return value.trim();
    }
    if (value && typeof value === 'object' && typeof value.id === 'string' && value.id !== '') {
        return value.id;
    }
    return '';
}
