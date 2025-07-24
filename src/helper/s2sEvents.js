class S2sEvent {
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
        tools: [
            {
                toolSpec: {
                    name: "consultarOrder",
                    description: "Consultar el estado y detalles de un pedido por ID",
                    inputSchema: {
                        json: JSON.stringify({
                            "type": "object",
                            "properties": {
                                "order_id": {
                                    "type": "string",
                                    "description": "ID del pedido a consultar"
                                }
                            },
                            "required": ["order_id"]
                        })
                    }
                }
            },
            {
                toolSpec: {
                    name: "cancelarOrder",
                    description: "Cancelar un pedido existente por ID",
                    inputSchema: {
                        json: JSON.stringify({
                            "type": "object",
                            "properties": {
                                "order_id": {
                                    "type": "string",
                                    "description": "ID del pedido a cancelar"
                                }
                            },
                            "required": ["order_id"]
                        })
                    }
                }
            },
            {
                toolSpec: {
                    name: "crearOrder",
                    description: "Crear un nuevo pedido con items y datos del cliente",
                    inputSchema: {
                        json: JSON.stringify({
                            "type": "object",
                            "properties": {
                                "customer_name": {
                                    "type": "string",
                                    "description": "Nombre del cliente"
                                },
                                "items": {
                                    "type": "array",
                                    "description": "Lista de items del pedido",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "product_id": {
                                                "type": "string",
                                                "description": "ID del producto"
                                            },
                                            "quantity": {
                                                "type": "integer",
                                                "description": "Cantidad del producto"
                                            }
                                        }
                                    }
                                }
                            },
                            "required": ["customer_name", "items"]
                        })
                    }
                }
            },
            {
                toolSpec: {
                    name: "agendarTurno",
                    description: "Agendar una nueva cita médica",
                    inputSchema: {
                        json: JSON.stringify({
                            "type": "object",
                            "properties": {
                                "patient_name": {
                                    "type": "string",
                                    "description": "Nombre del paciente"
                                },
                                "date": {
                                    "type": "string",
                                    "description": "Fecha de la cita (YYYY-MM-DD)"
                                },
                                "time": {
                                    "type": "string",
                                    "description": "Hora de la cita (HH:MM)"
                                },
                                "doctor": {
                                    "type": "string",
                                    "description": "Nombre del doctor"
                                }
                            },
                            "required": ["patient_name", "date", "time", "doctor"]
                        })
                    }
                }
            },
            {
                toolSpec: {
                    name: "cancelarTurno",
                    description: "Cancelar una cita médica existente",
                    inputSchema: {
                        json: JSON.stringify({
                            "type": "object",
                            "properties": {
                                "appointment_id": {
                                    "type": "string",
                                    "description": "ID de la cita a cancelar"
                                }
                            },
                            "required": ["appointment_id"]
                        })
                    }
                }
            },
            {
                toolSpec: {
                    name: "modificarTurno",
                    description: "Modificar la fecha u hora de una cita médica",
                    inputSchema: {
                        json: JSON.stringify({
                            "type": "object",
                            "properties": {
                                "appointment_id": {
                                    "type": "string",
                                    "description": "ID de la cita a modificar"
                                },
                                "new_date": {
                                    "type": "string",
                                    "description": "Nueva fecha (YYYY-MM-DD)"
                                },
                                "new_time": {
                                    "type": "string",
                                    "description": "Nueva hora (HH:MM)"
                                }
                            },
                            "required": ["appointment_id"]
                        })
                    }
                }
            },
            {
                toolSpec: {
                    name: "consultarTurno",
                    description: "Consultar los detalles de una cita médica",
                    inputSchema: {
                        json: JSON.stringify({
                            "type": "object",
                            "properties": {
                                "appointment_id": {
                                    "type": "string",
                                    "description": "ID de la cita a consultar"
                                }
                            },
                            "required": ["appointment_id"]
                        })
                    }
                }
            }
        ]
    };

    static DEFAULT_CHAT_HISTORY = [];

    static sessionStart(inferenceConfig = S2sEvent.DEFAULT_INFER_CONFIG) {
        return {
            event: {
                sessionStart: {
                    inferenceConfiguration: inferenceConfig
                }
            }
        };
    }

    static promptStart(promptName, audioOutputConfig = S2sEvent.DEFAULT_AUDIO_OUTPUT_CONFIG, toolConfig = S2sEvent.DEFAULT_TOOL_CONFIG) {
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

    static contentStartText(promptName, contentName, role = "SYSTEM") {
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

    static textInput(promptName, contentName, systemPrompt = S2sEvent.DEFAULT_SYSTEM_PROMPT) {
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

    static contentEnd(promptName, contentName) {
        return {
            event: {
                contentEnd: {
                    promptName: promptName,
                    contentName: contentName
                }
            }
        };
    }

    static contentStartAudio(promptName, contentName, audioInputConfig = S2sEvent.DEFAULT_AUDIO_INPUT_CONFIG) {
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

    static audioInput(promptName, contentName, content) {
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

    static contentStartTool(promptName, contentName, toolUseId) {
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

    static textInputTool(promptName, contentName, content) {
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

    static promptEnd(promptName) {
        return {
            event: {
                promptEnd: {
                    promptName: promptName
                }
            }
        };
    }

    static sessionEnd() {
        return {
            event: {
                sessionEnd: {}
            }
        };
    }
}

export default S2sEvent; 