package main

import (
	"strings"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin"
)

const postTypeVoice = "custom_voice"

// MessageHasBeenPosted ensures voice posts include file attachments for mobile clients.
func (p *Plugin) MessageHasBeenPosted(_ *plugin.Context, post *model.Post) {
	if post == nil || post.Id == "" {
		return
	}

	updatedPost := post.Clone()
	changed := false

	if isVoicePost(post) {
		changed = normalizeVoicePost(updatedPost)
	} else if len(post.FileIds) > 0 {
		changed = upgradeAudioUploadPost(p, updatedPost)
	}

	if !changed {
		return
	}

	if _, err := p.API.UpdatePost(updatedPost); err != nil {
		p.API.LogError("failed to update voice post", "post_id", post.Id, "error", err.Error())
	}
}

func isVoicePost(post *model.Post) bool {
	if post.Type == postTypeVoice {
		return true
	}

	if voiceMessage, ok := post.GetProp("voice_message").(bool); ok && voiceMessage {
		return true
	}

	return false
}

func normalizeVoicePost(post *model.Post) bool {
	changed := false

	fileID, ok := post.GetProp("fileId").(string)
	if ok && fileID != "" {
		hasFile := false
		for _, existingID := range post.FileIds {
			if existingID == fileID {
				hasFile = true
				break
			}
		}
		if !hasFile {
			post.FileIds = append(post.FileIds, fileID)
			changed = true
		}
	}

	if post.Type != postTypeVoice {
		post.Type = postTypeVoice
		changed = true
	}

	post.DelProp("attachments")

	if post.GetProp("voice_message") == nil {
		post.AddProp("voice_message", true)
		changed = true
	}

	return changed
}

func upgradeAudioUploadPost(p *Plugin, post *model.Post) bool {
	for _, fileID := range post.FileIds {
		info, err := p.API.GetFileInfo(fileID)
		if err != nil || info == nil || !isAudioMimeType(info.MimeType) {
			continue
		}

		post.Type = postTypeVoice
		post.AddProp("voice_message", true)
		post.AddProp("fileId", fileID)

		if post.Message == "" {
			post.Message = "Voice Message"
		}

		return true
	}

	return false
}

func isAudioMimeType(mimeType string) bool {
	return strings.HasPrefix(strings.ToLower(mimeType), "audio/")
}
