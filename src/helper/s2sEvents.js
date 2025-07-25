class S2sEvent {
    static DEFAULT_INFER_CONFIG = {
        maxTokens: 1024,
        topP: 0.95,
        temperature: 0.7
    };

    static DEFAULT_SYSTEM_PROMPT = "Eres Carlos, el asistente virtual de Nova Sonic. Eres amable, profesional y hablas en español argentino de forma natural y conversacional. Tu función es ayudar a los usuarios con pedidos y citas médicas. REGLAS CRÍTICAS PARA TUS RESPUESTAS: - Responde de forma NATURAL y CONVERSACIONAL, como si estuvieras hablando con un amigo. - NO hagas listas ni bullet points. Habla de forma fluida y natural. - Responde SOLO a lo que te preguntan, no des información extra que no pidieron. - Si preguntan por el ESTADO de un pedido, solo di el estado y fecha estimada de entrega. - Si preguntan por DETALLES de un pedido, entonces sí menciona los productos. - Si preguntan por el ESTADO de una cita, solo di la fecha, hora y estado. - Si preguntan por DETALLES de una cita, entonces sí menciona el doctor y tipo. - Sé CONCISO: máximo 2-3 frases naturales. - NO uses frases especulativas como 'podría', 'tal vez', 'quizás'. - Si necesitas más información, pídela de forma breve y natural. - Cuando uses herramientas, SIEMPRE envía los números como dígitos (ej: '6' no 'seis'). - Para pedidos, pide DNI o nombre completo para verificar identidad. - Para citas, pide nombre del paciente para verificar identidad. - Al final de cada respuesta, incluye [FINAL].";

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
                    description: "Consultar el estado y detalles de un pedido por ID. Se requiere verificación de identidad con DNI o nombre completo.",
                    inputSchema: {
                        json: JSON.stringify({
                            "$schema": "http://json-schema.org/draft-07/schema#",
                            "type": "object",
                            "properties": {
                                "orderId": {
                                    "type": "string",
                                    "description": "ID del pedido a consultar"
                                },
                                "dni": {
                                    "type": "string",
                                    "description": "Número de DNI del titular del pedido"
                                },
                                "customerName": {
                                    "type": "string",
                                    "description": "Nombre completo del titular del pedido"
                                }
                            },
                            "required": ["orderId"],
                            "anyOf": [
                                {"required": ["dni"]},
                                {"required": ["customerName"]}
                            ]
                        })
                    }
                }
            },
            {
                toolSpec: {
                    name: "cancelarOrder",
                    description: "Cancelar un pedido existente por ID. Se requiere verificación de identidad con DNI o nombre completo.",
                    inputSchema: {
                        json: JSON.stringify({
                            "$schema": "http://json-schema.org/draft-07/schema#",
                            "type": "object",
                            "properties": {
                                "orderId": {
                                    "type": "string",
                                    "description": "ID del pedido a cancelar"
                                },
                                "dni": {
                                    "type": "string",
                                    "description": "Número de DNI del titular del pedido"
                                },
                                "customerName": {
                                    "type": "string",
                                    "description": "Nombre completo del titular del pedido"
                                }
                            },
                            "required": ["orderId"],
                            "anyOf": [
                                {"required": ["dni"]},
                                {"required": ["customerName"]}
                            ]
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
                            "$schema": "http://json-schema.org/draft-07/schema#",
                            "type": "object",
                            "properties": {
                                "customerName": {
                                    "type": "string",
                                    "description": "Nombre completo del cliente"
                                },
                                "customerEmail": {
                                    "type": "string",
                                    "description": "Email del cliente"
                                },
                                "items": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "name": {"type": "string"},
                                            "quantity": {"type": "integer"},
                                            "price": {"type": "number"},
                                            "description": {"type": "string"}
                                        }
                                    },
                                    "description": "Lista de productos en el pedido"
                                }
                            },
                            "required": ["customerName", "customerEmail", "items"]
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
                            "$schema": "http://json-schema.org/draft-07/schema#",
                            "type": "object",
                            "properties": {
                                "patientName": {
                                    "type": "string",
                                    "description": "Nombre completo del paciente"
                                },
                                "patientEmail": {
                                    "type": "string",
                                    "description": "Email del paciente"
                                },
                                "doctorName": {
                                    "type": "string",
                                    "description": "Nombre del doctor"
                                },
                                "date": {
                                    "type": "string",
                                    "description": "Fecha y hora de la cita (ISO format)"
                                },
                                "duration": {
                                    "type": "integer",
                                    "description": "Duración en minutos"
                                },
                                "type": {
                                    "type": "string",
                                    "description": "Tipo de cita (consultation, follow-up, emergency, routine)"
                                },
                                "notes": {
                                    "type": "string",
                                    "description": "Notas adicionales"
                                }
                            },
                            "required": ["patientName", "patientEmail", "doctorName", "date"]
                        })
                    }
                }
            },
            {
                toolSpec: {
                    name: "cancelarTurno",
                    description: "Cancelar una cita médica existente. Se requiere verificación de identidad con nombre del paciente.",
                    inputSchema: {
                        json: JSON.stringify({
                            "$schema": "http://json-schema.org/draft-07/schema#",
                            "type": "object",
                            "properties": {
                                "appointmentId": {
                                    "type": "string",
                                    "description": "ID de la cita a cancelar"
                                },
                                "patientName": {
                                    "type": "string",
                                    "description": "Nombre completo del paciente"
                                }
                            },
                            "required": ["appointmentId", "patientName"]
                        })
                    }
                }
            },
            {
                toolSpec: {
                    name: "modificarTurno",
                    description: "Modificar la fecha u hora de una cita médica. Se requiere verificación de identidad con nombre del paciente.",
                    inputSchema: {
                        json: JSON.stringify({
                            "$schema": "http://json-schema.org/draft-07/schema#",
                            "type": "object",
                            "properties": {
                                "appointmentId": {
                                    "type": "string",
                                    "description": "ID de la cita a modificar"
                                },
                                "patientName": {
                                    "type": "string",
                                    "description": "Nombre completo del paciente"
                                },
                                "newDate": {
                                    "type": "string",
                                    "description": "Nueva fecha (opcional)"
                                },
                                "newTime": {
                                    "type": "string",
                                    "description": "Nueva hora (opcional)"
                                }
                            },
                            "required": ["appointmentId", "patientName"]
                        })
                    }
                }
            },
            {
                toolSpec: {
                    name: "consultarTurno",
                    description: "Consultar los detalles de una cita médica. Se requiere verificación de identidad con nombre del paciente.",
                    inputSchema: {
                        json: JSON.stringify({
                            "$schema": "http://json-schema.org/draft-07/schema#",
                            "type": "object",
                            "properties": {
                                "appointmentId": {
                                    "type": "string",
                                    "description": "ID de la cita a consultar"
                                },
                                "patientName": {
                                    "type": "string",
                                    "description": "Nombre completo del paciente"
                                }
                            },
                            "required": ["appointmentId", "patientName"]
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