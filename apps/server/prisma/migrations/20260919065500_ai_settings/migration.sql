INSERT INTO "platform_settings" ("id", "mentorSystemPrompt", "updatedAt")
VALUES ('default', '', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
