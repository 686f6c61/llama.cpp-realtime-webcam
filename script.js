/**
 * Camera Interaction App
 * This is a fork of https://github.com/ngxson/smolvlm-realtime-webcam
 * Fork maintained by https://github.com/686f6c61
 */

// DOM Elements
const video = document.getElementById('videoFeed');
const canvas = document.getElementById('canvas');
const baseURL = document.getElementById('baseURL');
const instructionText = document.getElementById('instructionText');
const responseText = document.getElementById('responseText');
const languageRadios = document.querySelectorAll('input[name="language"]');
const startButton = document.getElementById('startButton');

// History Elements
const historyToggle = document.getElementById('historyToggle');
const historyPanel = document.getElementById('historyPanel');
const historyList = document.getElementById('historyList');
const emptyHistory = document.getElementById('emptyHistory');
const exportTxtBtn = document.getElementById('exportTxt');
const exportCsvBtn = document.getElementById('exportCsv');
const clearHistoryBtn = document.getElementById('clearHistory');

// Initialize the base URL from config
baseURL.value = CONFIG.api.defaultEndpoint;

// Global variables
let stream;
let isProcessing = false;
let processingPending = false;
let currentLanguage = 'es';
let queryHistory = [];

// Initialize history from localStorage if available
try {
    const savedHistory = localStorage.getItem('queryHistory');
    if (savedHistory) {
        queryHistory = JSON.parse(savedHistory);
        updateHistoryUI();
    }
} catch (e) {
    console.error('Error loading history from localStorage:', e);
    queryHistory = [];
}

// Get selected language from radio buttons
const getSelectedLanguage = () => {
    languageRadios.forEach(radio => {
        if (radio.checked) {
            currentLanguage = radio.value;
        }
    });
    return currentLanguage;
};

// Set UI text based on language
const updateUIText = (lang) => {
    // Update placeholders
    instructionText.placeholder = CONFIG.ui.placeholders.instruction[lang];
    responseText.placeholder = CONFIG.ui.placeholders.response[lang];
    
    // Update button text if not processing
    if (!isProcessing) {
        const buttonSpan = startButton.querySelector('span:not(.icon)');
        if (buttonSpan) {
            buttonSpan.textContent = CONFIG.ui.buttons.start[lang];
        }
    }
};

// Set default instruction based on language
const setDefaultInstruction = () => {
    const lang = getSelectedLanguage();
    instructionText.value = CONFIG.language.defaultInstructions[lang];
    updateUIText(lang);
};

// Initialize default instruction
setDefaultInstruction();

// Update instruction when language changes
languageRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        currentLanguage = radio.value;
        setDefaultInstruction();
    });
});

// Returns response text (string)
async function sendChatCompletionRequest(instruction, imageBase64URL) {
    // Get selected language and corresponding prompt
    const selectedLanguage = getSelectedLanguage();
    const languagePrompt = CONFIG.language.prompts[selectedLanguage];
    
    // Always force the language instruction regardless of user input
    // This ensures the model always respects the language setting
    
    // Format the instruction to make language directive stand out
    // Place directive at beginning and end to reinforce it
    let finalInstruction;
    
    if (selectedLanguage === 'es') {
        finalInstruction = `[RESPONDE SOLO EN ESPAÑOL]\n\n${instruction}\n\n${languagePrompt}\n\n[RESPUESTA FINAL SOLO EN ESPAÑOL]`;
    } else {
        finalInstruction = `[RESPOND ONLY IN ENGLISH]\n\n${instruction}\n\n${languagePrompt}\n\n[FINAL RESPONSE ONLY IN ENGLISH]`;
    }
    
    console.log(`Using language: ${selectedLanguage}`);
    console.log(`Language prompt applied: ${languagePrompt}`);

    
    // Construct API URL from base URL and config path
    const apiUrl = `${baseURL.value}${CONFIG.api.completionPath}`;
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            max_tokens: CONFIG.api.maxTokens,
            messages: [
                { role: 'user', content: [
                    { type: 'text', text: finalInstruction },
                    { type: 'image_url', image_url: {
                        url: imageBase64URL,
                    } }
                ] },
            ]
        })
    });
    if (!response.ok) {
        const errorData = await response.text();
        return `Server error: ${response.status} - ${errorData}`;
    }
    const data = await response.json();
    return data.choices[0].message.content;
}

// Ask for camera permission on load
async function initCamera() {
    try {
        // Request resolution from config
        const constraints = {
            video: {
                width: { ideal: CONFIG.camera.idealResolution.width },
                height: { ideal: CONFIG.camera.idealResolution.height }
            },
            audio: false
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        
        // Wait for the video to be fully loaded before allowing capture
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                // Give a little extra time for the camera to fully initialize
                setTimeout(() => {
                    const lang = getSelectedLanguage();
                    responseText.value = CONFIG.ui.statusMessages.cameraReady[lang];
                    resolve();
                }, 500);
            };
        });
    } catch (err) {
        console.error("Error accessing camera:", err);
        const lang = getSelectedLanguage();
        responseText.value = `Error: ${err.name} - ${err.message}`;
        alert(`Error con la cámara: ${err.name}. Asegúrate de conceder permisos.`);
        throw err; // Re-throw to be caught by caller
    }
}

function captureImage() {
    if (!stream) {
        console.warn("Video stream not active.");
        return null;
    }
    
    // Use sizes from config
    const canvasWidth = CONFIG.camera.canvasSize.width;
    const canvasHeight = CONFIG.camera.canvasSize.height;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const context = canvas.getContext('2d');
    
    // Clear the canvas first
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw the current video frame to canvas, centering and covering like CSS 'cover'
    const videoRatio = video.videoWidth / video.videoHeight;
    const canvasRatio = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight, x, y;
    
    if (videoRatio > canvasRatio) {
        // Video is wider than canvas
        drawHeight = canvasHeight;
        drawWidth = video.videoWidth * (canvasHeight / video.videoHeight);
        x = (canvasWidth - drawWidth) / 2;
        y = 0;
    } else {
        // Video is taller than canvas
        drawWidth = canvasWidth;
        drawHeight = video.videoHeight * (canvasWidth / video.videoWidth);
        x = 0;
        y = (canvasHeight - drawHeight) / 2;
    }
    
    try {
        // Draw image with computed dimensions
        context.drawImage(video, x, y, drawWidth, drawHeight);
        return canvas.toDataURL('image/jpeg', CONFIG.camera.imageQuality);
    } catch (err) {
        console.error("Error capturing image:", err);
        return null;
    }
}

async function sendData() {
    if (!isProcessing || processingPending) return; // Prevent multiple overlapping requests
    
    processingPending = true;
    
    const instruction = instructionText.value;
    const imageBase64URL = captureImage();
    const lang = getSelectedLanguage();

    if (!imageBase64URL) {
        responseText.value = CONFIG.ui.statusMessages.captureError[lang];
        processingPending = false;
        return;
    }

    const payload = {
        instruction: instruction,
        imageBase64URL: imageBase64URL
    };

    try {
        const response = await sendChatCompletionRequest(payload.instruction, payload.imageBase64URL);
        responseText.value = response;
        
        // Add to history
        addToHistory(payload.instruction, response);
    } catch (error) {
        console.error('Error sending data:', error);
        responseText.value = `Error: ${error.message}`;
    }
    
    processingPending = false;
    
    // If still processing, immediately send the next request
    if (isProcessing) {
        // Use setTimeout with 0ms to allow UI to update before next request
        setTimeout(sendData, 0);
    }
}

function handleStart() {
    // Desactivar el botón temporalmente para evitar clics múltiples
    startButton.disabled = true;
    
    // Get current language
    const lang = getSelectedLanguage();
    
    if (!stream) {
        // Mostrar indicador de carga mientras se inicializa la cámara
        responseText.value = CONFIG.ui.statusMessages.cameraInitializing[lang];
        
        initCamera()
            .then(() => {
                // Pequeña pausa para asegurar que todo está listo
                setTimeout(() => {
                    startProcessing();
                    startButton.disabled = false;
                }, 300);
            })
            .catch(err => {
                console.error("Failed to initialize camera:", err);
                startButton.disabled = false;
            });
    } else {
        startProcessing();
        startButton.disabled = false;
    }

    function startProcessing() {
        isProcessing = true;
        processingPending = false;
        // Just call sendData once, it will chain itself
        sendData();
        
        // Get current language
        const lang = getSelectedLanguage();
        
        // Update button for Bulma styles
        const buttonSpan = startButton.querySelector('span:not(.icon)');
        if (buttonSpan) buttonSpan.textContent = CONFIG.ui.buttons.stop[lang];
        
        startButton.classList.remove('is-primary', 'start');
        startButton.classList.add('is-danger', 'stop');
        startButton.classList.remove('pulse-button');
        
        // Update icon
        const iconElement = startButton.querySelector('.icon i');
        if (iconElement) {
            iconElement.classList.remove('fa-play');
            iconElement.classList.add('fa-stop');
        }
        
        // Add status indicator to page if not exists
        if (!document.querySelector('.status-indicator')) {
            const buttonContainer = startButton.closest('.control');
            const statusIndicator = document.createElement('div');
            statusIndicator.className = 'status-indicator status-active mt-2';
            const statusText = document.createElement('small');
            statusText.textContent = CONFIG.ui.statusMessages.processing[lang];
            statusText.className = 'has-text-success';
            const statusContainer = document.createElement('div');
            statusContainer.className = 'has-text-centered mt-2';
            statusContainer.appendChild(statusIndicator);
            statusContainer.appendChild(statusText);
            buttonContainer.after(statusContainer);
        } else {
            const indicator = document.querySelector('.status-indicator');
            indicator.classList.remove('status-inactive');
            indicator.classList.add('status-active');
            const statusText = indicator.nextElementSibling;
            if (statusText) {
                statusText.textContent = CONFIG.ui.statusMessages.processing[lang];
                statusText.className = 'has-text-success';
            }
        }
    }
}

function handleStop() {
    isProcessing = false;
    
    // Get current language
    const lang = getSelectedLanguage();
    
    // Update button for Bulma styles
    const buttonSpan = startButton.querySelector('span:not(.icon)');
    if (buttonSpan) buttonSpan.textContent = CONFIG.ui.buttons.start[lang];
    
    startButton.classList.remove('is-danger', 'stop');
    startButton.classList.add('is-primary', 'start');
    startButton.classList.add('pulse-button');
    
    // Update icon
    const iconElement = startButton.querySelector('.icon i');
    if (iconElement) {
        iconElement.classList.remove('fa-stop');
        iconElement.classList.add('fa-play');
    }
    
    // Update status indicator
    const indicator = document.querySelector('.status-indicator');
    if (indicator) {
        indicator.classList.remove('status-active');
        indicator.classList.add('status-inactive');
        const statusText = indicator.nextElementSibling;
        if (statusText) {
            statusText.textContent = CONFIG.ui.statusMessages.stopped[lang];
            statusText.className = 'has-text-danger';
        }
    }
}

// Function to add an entry to the history
function addToHistory(query, response) {
    // Create a new history entry
    const timestamp = new Date();
    const historyEntry = {
        timestamp,
        query,
        response
    };
    
    // Add to the beginning of the array
    queryHistory.unshift(historyEntry);
    
    // Limit the size of history
    if (queryHistory.length > CONFIG.history.maxEntries) {
        queryHistory = queryHistory.slice(0, CONFIG.history.maxEntries);
    }
    
    // Save to localStorage
    try {
        localStorage.setItem('queryHistory', JSON.stringify(queryHistory));
    } catch (e) {
        console.error('Error saving history to localStorage:', e);
    }
    
    // Update UI
    updateHistoryUI();
}

// Function to update the history UI
function updateHistoryUI() {
    // Clear current list
    historyList.innerHTML = '';
    
    // Show/hide empty state
    if (queryHistory.length === 0) {
        emptyHistory.classList.remove('is-hidden');
    } else {
        emptyHistory.classList.add('is-hidden');
    }
    
    // Get the selected language
    const lang = getSelectedLanguage();
    
    // Format date based on locale
    const dateFormat = CONFIG.history.dateFormat[lang];
    
    // Add entries
    queryHistory.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.className = 'history-entry';
        row.dataset.index = index;
        
        // Format timestamp
        const formattedDate = new Date(entry.timestamp).toLocaleString(
            dateFormat.locale, 
            dateFormat.options
        );
        
        row.innerHTML = `
            <td class="history-timestamp">${formattedDate}</td>
            <td><div class="history-query">${escapeHtml(entry.query)}</div></td>
            <td><div class="history-response">${escapeHtml(entry.response)}</div></td>
        `;
        
        // Add click listener to restore this query and response
        row.addEventListener('click', () => {
            instructionText.value = entry.query;
            responseText.value = entry.response;
        });
        
        historyList.appendChild(row);
    });
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Function to export history as TXT
function exportAsTxt() {
    if (queryHistory.length === 0) {
        alert(CONFIG.history.export.emptyHistoryWarning[getSelectedLanguage()]);
        return;
    }
    
    const lang = getSelectedLanguage();
    const dateFormat = CONFIG.history.dateFormat[lang];
    const headers = CONFIG.history.export.headers;
    
    let content = '';
    
    // Add entries
    queryHistory.forEach((entry, index) => {
        const formattedDate = new Date(entry.timestamp).toLocaleString(
            dateFormat.locale, 
            dateFormat.options
        );
        
        content += `${headers.timestamp[lang]}: ${formattedDate}\n`;
        content += `${headers.query[lang]}: ${entry.query}\n`;
        content += `${headers.response[lang]}: ${entry.response}\n\n`;
    });
    
    // Create and download file
    const filename = `${CONFIG.history.export.txtFilename[lang]}_${new Date().toISOString().slice(0,10)}.txt`;
    downloadFile(content, filename, 'text/plain');
    showExportSuccess(exportTxtBtn);
}

// Function to export history as CSV
function exportAsCsv() {
    if (queryHistory.length === 0) {
        alert(CONFIG.history.export.emptyHistoryWarning[getSelectedLanguage()]);
        return;
    }
    
    const lang = getSelectedLanguage();
    const dateFormat = CONFIG.history.dateFormat[lang];
    const headers = CONFIG.history.export.headers;
    
    // Prepare CSV content
    let csvContent = `${headers.timestamp[lang]},${headers.query[lang]},${headers.response[lang]}\n`;
    
    // Add entries
    queryHistory.forEach(entry => {
        const formattedDate = new Date(entry.timestamp).toLocaleString(
            dateFormat.locale, 
            dateFormat.options
        );
        
        // Escape CSV values
        const escapedQuery = `"${entry.query.replace(/"/g, '""')}"`;
        const escapedResponse = `"${entry.response.replace(/"/g, '""')}"`;
        
        csvContent += `"${formattedDate}",${escapedQuery},${escapedResponse}\n`;
    });
    
    // Create and download file
    const filename = `${CONFIG.history.export.csvFilename[lang]}_${new Date().toISOString().slice(0,10)}.csv`;
    downloadFile(csvContent, filename, 'text/csv');
    showExportSuccess(exportCsvBtn);
}

// Helper function to download a file
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to show export success animation
function showExportSuccess(button) {
    const lang = getSelectedLanguage();
    const originalTitle = button.getAttribute('title');
    
    button.classList.add('export-success');
    button.setAttribute('title', CONFIG.history.export.successMessage[lang]);
    
    setTimeout(() => {
        button.classList.remove('export-success');
        button.setAttribute('title', originalTitle);
    }, 2000);
}

// Function to clear all history
function clearHistory() {
    const lang = getSelectedLanguage();
    if (confirm(CONFIG.history.export.clearConfirmation[lang])) {
        queryHistory = [];
        localStorage.removeItem('queryHistory');
        updateHistoryUI();
    }
}

// Event Listeners
startButton.addEventListener('click', () => {
    if (isProcessing) {
        handleStop();
    } else {
        handleStart();
    }
});

// History toggle
historyToggle.addEventListener('click', () => {
    historyPanel.classList.toggle('is-hidden');
    updateHistoryUI();
});

// Export buttons
exportTxtBtn.addEventListener('click', exportAsTxt);
exportCsvBtn.addEventListener('click', exportAsCsv);
clearHistoryBtn.addEventListener('click', clearHistory);

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Update history UI
    updateHistoryUI();
    
    // Do not auto-start camera to respect user privacy
    responseText.value = "Click 'Start' to begin camera access and processing.";
});
