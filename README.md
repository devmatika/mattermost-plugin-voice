# Mattermost Voice Plugin

Mattermost plugin for voice messaging, maintained by [devmatika](https://github.com/devmatika).

This plugin adds support for basic **voice messaging** in Mattermost.

**Requires Mattermost Server v11.0.0 or later** (tested with v11.7.x).

![](https://i.imgur.com/hPZ3GhG.gif)

## Usage

To start sending a voice message you can either use the `/voice` slash command or the existing file attachment functionality as shown in the picture above.

## Limitations

This plugin uses web app components for recording and the custom audio player. Those parts work in the **web client** and **desktop app**.

### Desktop app (Mac / Windows)

If the timer stays at `0:00` or Send does nothing, check that Mattermost has **microphone permission** in system settings. Recent plugin builds also resume the audio context required by the desktop app.

### Mobile app

- **Playback:** Voice messages include an MP3 attachment. Tap the player below the message to listen.
- **Recording:** The in-app recorder is **not available** on the native mobile app ([Mattermost limitation](https://developers.mattermost.com/integrate/plugins/components/mobile/)). To send a voice message, tap **+ → Attach a file** and choose an audio file (voice memo, MP3, M4A, etc.). The plugin recognizes it automatically.
- Type `/voice` in a channel for step-by-step instructions.

### Desktop / browser

- **Playback:** New voice messages show an inline player (not a download-only file card). Older messages sent before this update may still appear as file attachments until re-sent.
- **Recording:** Use **Voice message** in the attachment menu, `/voice`, the app bar, or the main menu.

## Installation

1. Download the latest version from the [release page](https://github.com/devmatika/mattermost-plugin-voice/releases).
2. Upload the file through **System Console > Plugins > Plugin Management**. See the [plugin documentation](https://docs.mattermost.com/administration-guide/manage/plugins.html) for more details.

## Development

Use `make dist` to build this plugin.

Use `make deploy` to deploy the plugin to your local server.

Before running `make deploy` you need to set a few environment variables:

```
export MM_SERVICESETTINGS_SITEURL=http://localhost:8065
export MM_ADMIN_USERNAME=admin
export MM_ADMIN_PASSWORD=password
```

For more details on how to develop a plugin refer to the official [documentation](https://developers.mattermost.com/integrate/plugins/).

## Support

If you find this plugin useful and want to support its development, you can donate here:

**[Donate via NOWPayments](https://nowpayments.io/donation/davood)**

## License

[mattermost-plugin-voice](https://github.com/devmatika/mattermost-plugin-voice) is licensed under [MIT](LICENSE)  
Originally forked from [streamer45/mattermost-plugin-voice](https://github.com/streamer45/mattermost-plugin-voice).  
[mp3rec-wasm](https://github.com/streamer45/mp3rec-wasm) is licensed under [MIT](LICENSE)  
[LAME](http://lame.sourceforge.net/) is licensed under [LGPL](vendor/lame/COPYING)
