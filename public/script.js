const video = document.getElementById('video');

async function initializeCamera() {
    try {
        const constraints = {
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;

        video.addEventListener('loadedmetadata', () => {
            console.log(`Camera resolution: ${video.videoWidth}x${video.videoHeight}`);
        });
    } catch (error) {
        console.error('Error accessing the camera:', error);
    }
}

initializeCamera();

function getEventCoordinates(event) {
    const rect = video.getBoundingClientRect();
    const scaleX = video.videoWidth / rect.width;
    const scaleY = video.videoHeight / rect.height;

    return {
        x: Math.round((event.clientX - rect.left) * scaleX),
        y: Math.round((event.clientY - rect.top) * scaleY)
    };
}

function sendEventData(endpoint, params = {}) {
    const url = `${window.location.origin}/api/${endpoint}?${new URLSearchParams(params)}`;
    fetch(url, { method: 'POST' });
}

video.addEventListener('mousemove', (event) => {
    const { x, y } = getEventCoordinates(event);
    sendEventData('mousemove', { x, y });
});

video.addEventListener('mousedown', (event) => {
    const buttonMap = { 0: 'left', 1: 'middle', 2: 'right' };
    sendEventData('mousedown', { button: buttonMap[event.button] });
});

video.addEventListener('mouseup', () => {
    sendEventData('mouseup');
});

document.addEventListener('keydown', (event) => {
    const key = event.key.length === 1 ? event.key : event.key.toLowerCase();
    sendEventData('keydown', {
        key,
        control: event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey
    });
});

document.addEventListener('keyup', () => {
    sendEventData('keyup');
});

['dblclick', 'wheel', 'contextmenu', 'beforeunload'].forEach(type => {
    window.addEventListener(type, e => {
        e.preventDefault();
        if (type === 'beforeunload') return '';
    });
});

function updateConnectionIndicator(color) {
    const indicator = document.getElementById('connection-indicator');
    indicator.style.backgroundColor = color;
}

async function checkConnectionStatus() {
    try {
        const res = await fetch('/api/ping');
        if (!res.ok) {
            updateConnectionIndicator('gray');
            return;
        }
    } catch {
        updateConnectionIndicator('gray');
        return;
    }

    const stream = video.srcObject;
    if (!stream || !stream.active || !video.videoWidth || !video.videoHeight) {
        updateConnectionIndicator('red');
        return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let r = 0, g = 0, b = 0;
    let count = 0;
    const step = 400 * 4;

    for (let i = 0; i < data.length; i += step) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
    }

    r /= count;
    g /= count;
    b /= count;
    const avg = (r + g + b) / 3;
    const isUniform = Math.abs(r - g) < 10 && Math.abs(r - b) < 10;

    if (avg > 220 || isUniform) {
        updateConnectionIndicator('red');
        return;
    }

    updateConnectionIndicator('limegreen');
}

setInterval(checkConnectionStatus, 3000);


