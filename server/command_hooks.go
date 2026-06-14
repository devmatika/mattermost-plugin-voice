package main

import (
	"fmt"
	"strings"

	"github.com/pkg/errors"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin"
)

const (
	commandTriggerVoice = "voice"
	commandVoiceHelp    = "Use this command to start recording a voice message."
)

func (p *Plugin) registerCommands() error {
	if err := p.API.RegisterCommand(&model.Command{
		Trigger:          commandTriggerVoice,
		AutoComplete:     true,
		AutoCompleteDesc: "Start recording a voice message",
		DisplayName:      "Start recording a voice message",
	}); err != nil {
		return errors.Wrapf(err, "failed to register %s command", commandTriggerVoice)
	}
	return nil
}

// ExecuteCommand executes a command that has been previously registered via the RegisterCommand
// API.
func (p *Plugin) ExecuteCommand(c *plugin.Context, args *model.CommandArgs) (*model.CommandResponse, *model.AppError) {
	trigger := strings.TrimPrefix(strings.Fields(args.Command)[0], "/")

	if trigger == commandTriggerVoice {
		return &model.CommandResponse{
			ResponseType: model.CommandResponseTypeEphemeral,
			Text: "**Desktop / web:** use **Voice message** in the attachment menu, the app bar, or the main menu.\n\n" +
				"**Mobile app:** tap **+ → Attach a file** and choose an audio recording (MP3, M4A, voice memo, etc.). " +
				"The server recognizes it as a voice message automatically.",
		}, nil
	}

	return &model.CommandResponse{
		ResponseType: model.CommandResponseTypeEphemeral,
		Text:         fmt.Sprintf("Unknown command: %s", args.Command),
	}, nil
}
