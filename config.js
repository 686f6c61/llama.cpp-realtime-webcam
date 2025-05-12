/**
 * Configuration file for Camera Interaction App
 * This is part of a project that's a fork of https://github.com/ngxson/smolvlm-realtime-webcam
 * Fork maintained by https://github.com/686f6c61
 */

const CONFIG = {
    // API Configuration
    api: {
        // Default API endpoint
        defaultEndpoint: 'http://localhost:8080',
        
        // Max tokens for response
        maxTokens: 150,
        
        // Path to completion endpoint
        completionPath: '/v1/chat/completions',
    },
    
    // Language Configuration
    language: {
        // Available languages
        options: [
            { code: 'es', name: 'Español', default: true },
            { code: 'en', name: 'English', default: false }
        ],
        
        // Default instructions by language
        defaultInstructions: {
            es: "¿Qué ves en esta imagen?",
            en: "What do you see in this image?"
        },
        
        // Language prompts to append to user instructions
        prompts: {
            es: "INSTRUCCIÓN IMPORTANTE: Responde ÚNICAMENTE en español. No uses ninguna palabra en inglés. Debes responder de manera concisa y directa SOLO en español.",
            en: "IMPORTANT INSTRUCTION: Respond ONLY in English. Do not use any Spanish words. You must respond concisely and directly ONLY in English."
        }
    },
    
    // Camera Configuration
    camera: {
        // Ideal resolution to request
        idealResolution: {
            width: 1280,
            height: 720
        },
        
        // Canvas size for image capture
        canvasSize: {
            width: 640,
            height: 480
        },
        
        // Image quality (0-1) for JPEG compression
        imageQuality: 0.85
    },
    
    // History Configuration
    history: {
        // Maximum number of entries to keep in history
        maxEntries: 100,
        
        // Date format for history entries
        dateFormat: {
            es: {
                options: { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit',
                    hour12: false
                },
                locale: 'es-ES'
            },
            en: {
                options: { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit',
                    hour12: true
                },
                locale: 'en-US'
            }
        },
        
        // Text for export features
        export: {
            txtFilename: {
                es: "historial_consultas",
                en: "query_history"
            },
            csvFilename: {
                es: "historial_consultas",
                en: "query_history"
            },
            headers: {
                timestamp: {
                    es: "Fecha y Hora",
                    en: "Timestamp"
                },
                query: {
                    es: "Consulta",
                    en: "Query"
                },
                response: {
                    es: "Respuesta", 
                    en: "Response"
                }
            },
            successMessage: {
                es: "Exportación completada",
                en: "Export completed"
            },
            emptyHistoryWarning: {
                es: "No hay datos para exportar",
                en: "No data to export"
            },
            clearConfirmation: {
                es: "¿Estás seguro de que quieres borrar todo el historial?",
                en: "Are you sure you want to clear all history?"
            }
        }
    },
    
    // UI Configuration
    ui: {
        // Button text
        buttons: {
            start: {
                es: "Iniciar",
                en: "Start"
            },
            stop: {
                es: "Detener",
                en: "Stop"
            }
        },
        
        // Status messages
        statusMessages: {
            cameraInitializing: {
                es: "Inicializando cámara...",
                en: "Initializing camera..."
            },
            cameraReady: {
                es: "Cámara lista. Puedes comenzar.",
                en: "Camera ready. You can start."
            },
            processing: {
                es: "Procesando",
                en: "Processing"
            },
            stopped: {
                es: "Detenido",
                en: "Stopped"
            },
            captureError: {
                es: "Error al capturar imagen. Verifica que la cámara funcione correctamente.",
                en: "Failed to capture image. Verify that the camera is working correctly."
            }
        },
        
        // Placeholder texts
        placeholders: {
            instruction: {
                es: "¿Qué quieres preguntar?",
                en: "What do you want to ask?"
            },
            response: {
                es: "La respuesta aparecerá aquí...",
                en: "The response will appear here..."
            }
        }
    }
};

// Export the configuration
window.CONFIG = CONFIG;
