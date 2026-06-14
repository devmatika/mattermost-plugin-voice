import {id as pluginId} from './manifest';

export function injectVoiceStyles() {
    const styleId = `${pluginId}-styles`;
    if (document.getElementById(styleId)) {
        return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .post:has(.voice-player) .post-image__columns,
        .post:has([id^="voice_"]) .post-image__columns {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
}
