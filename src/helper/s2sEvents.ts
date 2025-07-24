export interface S2sEventData {
    event: Record<string, any>;
    timestamp?: number;
}

export class S2sEvent {
    static DEFAULT_INFER_CONFIG = {
        maxTokens: 1024,
        topP: 0.95,
        temperature: 0.7
    };

    static DEFAULT_SYSTEM_PROMPT = "Eres Carlos, el asistente virtual de Nova Sonic. Eres amable, profesional y hablas en español argentino. Tu función es ayudar a los usuarios con: - Consultar, cancelar y crear pedidos - Agendar, cancelar, modificar y consultar citas médicas Siempre responde de forma clara y natural. Si necesitas más información, pídela amablemente. IMPORTANTE: Cuando uses herramientas (tools), SIEMPRE envía los números como dígitos, no como palabras. Por ejemplo: usa '6' en lugar de 'seis', '627' en lugar de 'seiscientos veintisiete', '10065' en lugar de 'diez mil sesenta y cinco'. Esto es crucial para que las herramientas funcionen correctamente.";

    static DEFAULT_AUDIO_INPUT_CONFIG = {
        mediaType: "audio/lpcm",
        sampleRateHertz: 16000,
        sampleSizeBits: 16,
        channelCount: 1,
        audioType: "SPEECH",
        encoding: "base64"
    };

    static DEFAULT_AUDIO_OUTPUT_CONFIG = {
        mediaType: "audio/lpcm",
        sampleRateHertz: 24000,
        sampleSizeBits: 16,
        channelCount: 1,
        voiceId: "carlos",
        encoding: "base64",
        audioType: "SPEECH"
    };

    static DEFAULT_TOOL_CONFIG = {
        tools: []
    };

    static DEFAULT_CHAT_HISTORY = [];

    static sessionStart(inferenceConfig = S2sEvent.DEFAULT_INFER_CONFIG): S2sEventData {
        return {
            event: {
                sessionStart: {
                    inferenceConfiguration: inferenceConfig
                }
            }
        };
    }

    static promptStart(promptName: string, audioOutputConfig = S2sEvent.DEFAULT_AUDIO_OUTPUT_CONFIG, toolConfig = S2sEvent.DEFAULT_TOOL_CONFIG): S2sEventData {
        return {
            event: {
                promptStart: {
                    promptName: promptName,
                    textOutputConfiguration: {
                        mediaType: "text/plain"
                    },
                    audioOutputConfiguration: audioOutputConfig,
                    toolUseOutputConfiguration: {
                        mediaType: "application/json"
                    },
                    toolConfiguration: toolConfig
                }
            }
        };
    }

    static contentStartText(promptName: string, contentName: string, role = "SYSTEM"): S2sEventData {
        return {
            event: {
                contentStart: {
                    promptName: promptName,
                    contentName: contentName,
                    type: "TEXT",
                    interactive: true,
                    role: role,
                    textInputConfiguration: {
                        mediaType: "text/plain"
                    }
                }
            }
        };
    }

    static textInput(promptName: string, contentName: string, systemPrompt = S2sEvent.DEFAULT_SYSTEM_PROMPT): S2sEventData {
        return {
            event: {
                textInput: {
                    promptName: promptName,
                    contentName: contentName,
                    content: systemPrompt
                }
            }
        };
    }

    static contentEnd(promptName: string, contentName: string): S2sEventData {
        return {
            event: {
                contentEnd: {
                    promptName: promptName,
                    contentName: contentName
                }
            }
        };
    }

    static contentStartAudio(promptName: string, contentName: string, audioInputConfig = S2sEvent.DEFAULT_AUDIO_INPUT_CONFIG): S2sEventData {
        return {
            event: {
                contentStart: {
                    promptName: promptName,
                    contentName: contentName,
                    type: "AUDIO",
                    interactive: true,
                    role: "USER",
                    audioInputConfiguration: audioInputConfig
                }
            }
        };
    }

    static audioInput(promptName: string, contentName: string, content: string): S2sEventData {
        return {
            event: {
                audioInput: {
                    promptName: promptName,
                    contentName: contentName,
                    content: content
                }
            }
        };
    }

    static contentStartTool(promptName: string, contentName: string, toolUseId: string): S2sEventData {
        return {
            event: {
                contentStart: {
                    promptName: promptName,
                    contentName: contentName,
                    interactive: false,
                    type: "TOOL",
                    role: "TOOL",
                    toolResultInputConfiguration: {
                        toolUseId: toolUseId,
                        type: "TEXT",
                        textInputConfiguration: {
                            mediaType: "text/plain"
                        }
                    }
                }
            }
        };
    }

    static textInputTool(promptName: string, contentName: string, content: string): S2sEventData {
        return {
            event: {
                toolResult: {
                    promptName: promptName,
                    contentName: contentName,
                    content: content
                }
            }
        };
    }

    static promptEnd(promptName: string): S2sEventData {
        return {
            event: {
                promptEnd: {
                    promptName: promptName
                }
            }
        };
    }

    static sessionEnd(): S2sEventData {
        return {
            event: {
                sessionEnd: {}
            }
        };
    }
} 