# 🎥 Camera Interaction App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Powered by llama.cpp](https://img.shields.io/badge/Powered%20by-llama.cpp-red.svg)](https://github.com/ggerganov/llama.cpp)
[![Bulma CSS](https://img.shields.io/badge/Bulma-0.9.4-00d1b2.svg)](https://bulma.io/)
[![Maintained by 686f6c61](https://img.shields.io/badge/Maintained%20by-686f6c61-blue.svg)](https://github.com/686f6c61)

> Este proyecto es un fork mejorado de [smolvlm-realtime-webcam](https://github.com/ngxson/smolvlm-realtime-webcam) con numerosas mejoras y funcionalidades adicionales.

## 📝 Descripción

Esta aplicación web utiliza la cámara del dispositivo para capturar imágenes en tiempo real y enviarlas a un servidor llama.cpp con SmolVLM 500M para análisis y detección de objetos. Las respuestas del modelo se muestran de manera instantánea, sin intervalos de espera entre solicitudes, proporcionando una experiencia fluida.

<div align="center">
  <img src="https://user-images.githubusercontent.com/32314/130090265-46fa5f6e-6433-4b44-b336-1c49d6d6c219.gif" width="600" alt="Camera Interaction App Demo" />
  <p><em>Detección de objetos en tiempo real</em></p>
</div>

## ✨ Características

### 📊 Funcionalidades principales
- **Captura de video en tiempo real** - Utiliza la webcam para analizar el entorno
- **Procesamiento continuo** - Sin intervalos de espera entre solicitudes
- **Soporte multilingüe** - Respuestas en español o inglés según preferencia
- **Prompts reforzados** - Algoritmo mejorado para evitar respuestas en idioma mixto
- **Interfaz moderna** - Diseño limpio y responsivo con Bulma CSS
- **Configuración centralizada** - Archivo config.js para gestionar tokens, prompts y ajustes

### 📋 Historial y exportación de datos
- **Historial de consultas** - Registro no invasivo de todas las interacciones
- **Exportación en TXT y CSV** - Guardar todas las consultas y respuestas
- **Persistencia local** - El historial se mantiene entre sesiones
- **Reutilización de consultas** - Haz clic en cualquier consulta anterior para restaurarla

### 🛠️ Mejoras técnicas sobre el original
- **Arquitectura modular** - Código organizado en archivos separados (HTML, CSS, JavaScript)
- **Optimización de captura** - Ajustes de proporción y resolución para una mejor captura
- **Manejo de errores** - Mayor robustez en la inicialización de la cámara
- **Diseño responsivo** - Funciona en dispositivos móviles y de escritorio
- **Interfáz clara y ordenada** - Mejor disposición de elementos y feedback visual

## 🚀 Configuración

### Prerrequisitos

- Navegador moderno con soporte para WebRTC
- Cámara web
- Servidor llama.cpp con modelo SmolVLM o compatible

### Pasos para la instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/686f6c61/RealTime.git
   cd RealTime
   ```

2. **Instalar llama.cpp**
   - Sigue las instrucciones en el [repositorio oficial de llama.cpp](https://github.com/ggerganov/llama.cpp)
   ```bash
   git clone https://github.com/ggerganov/llama.cpp
   cd llama.cpp
   make
   ```

3. **Ejecutar el servidor llama.cpp con SmolVLM**
   ```bash
   ./llama-server -hf ggml-org/SmolVLM-500M-Instruct-GGUF
   ```
   - **Para GPU NVIDIA/AMD/Intel**: añade `-ngl 99` al comando
   - **Para CUDA**: añade `-b 1024 -c 2048 --mlock` para mejor rendimiento
   - **Modelos alternativos**: Prueba con otros modelos VLM compatibles

4. **Abrir la aplicación**
   - Abre el archivo `index.html` directamente en tu navegador
   - O usa un servidor web ligero como:
     ```bash
     # Python 3
     python -m http.server 8000
     ```
   - Accede a `http://localhost:8000` en tu navegador

## 💡 Uso

### Interacción básica

1. Al abrir la aplicación, verás la vista de la cámara
2. La API base apunta a `http://localhost:8080` por defecto (servidor llama.cpp)
3. Selecciona el idioma deseado para las respuestas (Español o Inglés)
4. Escribe tu consulta o usa la predeterminada ("¿Qué ves en esta imagen?")
5. Haz clic en "Iniciar" para comenzar el procesamiento
6. El modelo analizará la imagen en tiempo real y mostrará las respuestas
7. Haz clic en "Detener" para detener el procesamiento

### Uso del historial

1. Haz clic en el icono de historial (🕒) en la esquina superior derecha del panel de respuestas
2. Verás todas tus consultas anteriores con sus respuestas y timestamps
3. Haz clic en cualquier entrada para restaurar esa consulta y respuesta
4. Usa los botones de exportación para guardar el historial en formato TXT o CSV
5. Puedes borrar el historial con el botón de papelera

### Configuración avanzada

Puedes personalizar diversos aspectos editando el archivo `config.js`:

```javascript
// Ejemplos de configuraciones que puedes modificar
CONFIG.api.maxTokens = 250;          // Aumentar tokens para respuestas más largas
CONFIG.camera.imageQuality = 0.9;    // Mejorar calidad de imagen (0-1)
CONFIG.history.maxEntries = 200;     // Aumentar límite de historial
```

## 🔧 Estructura del proyecto

```
RealTime/
├── index.html          # Estructura HTML principal
├── styles.css         # Estilos CSS con Bulma
├── script.js          # Lógica principal JavaScript
├── config.js          # Configuración centralizada
└── README.md          # Documentación
```

## 🧩 Tecnologías utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: [Bulma CSS](https://bulma.io/)
- **Iconos**: [Font Awesome](https://fontawesome.com/)
- **Backend**: [llama.cpp](https://github.com/ggerganov/llama.cpp) con SmolVLM
- **Modelo**: [SmolVLM-500M-Instruct-GGUF](https://huggingface.co/ggml-org/SmolVLM-500M-Instruct-GGUF)
- **Almacenamiento**: LocalStorage para persistencia

## 👥 Créditos

- **Proyecto original**: [smolvlm-realtime-webcam](https://github.com/ngxson/smolvlm-realtime-webcam) por [ngxson](https://github.com/ngxson)
- **Fork mejorado**: Mantenido por [686f6c61](https://github.com/686f6c61)

## 📜 Licencia

Este proyecto se distribuye bajo la misma licencia que el proyecto original.

---

<div align="center">
  <p>Desarrollado con ❤️ utilizando tecnologías modernas</p>
  <p>
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  </p>
</div>
