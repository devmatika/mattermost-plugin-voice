package main

import (
	"strings"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin"
)

const postTypeVoice = "custom_voice"

// MessageHasBeenPosted ensures voice posts include file attachments for mobile clients
// and upgrades regular audio uploads to the voice post type.
func (p *Plugin) MessageHasBeenPosted(_ *plugin.Context, post *model.Post) {
	if post == nil || post.Id == "" {
		return
	}

	updatedPost := post.Clone()
	changed := false

	if post.Type == postTypeVoice {
		changed = ensureVoicePostFiles(updatedPost)
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

func ensureVoicePostFiles(post *model.Post) bool {
	fileID, ok := post.GetProp("fileId").(string)
	if !ok || fileID == "" {
		return false
	}

	for _, existingID := range post.FileIds {
		if existingID == fileID {
			return false
		}
	}

	post.FileIds = append(post.FileIds, fileID)
	return true
}

func upgradeAudioUploadPost(p *Plugin, post *model.Post) bool {
	for _, fileID := range post.FileIds {
		info, err := p.API.GetFileInfo(fileID)
		if err != nil || info == nil || !isAudioMimeType(info.MimeType) {
			continue
		}

		post.Type = postTypeVoice
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
