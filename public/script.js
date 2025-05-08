const video = document.getElementById('video');

function throttle(func, limit) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            func.apply(this, args);
        }
    };
}

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

const throttledMouseMove = throttle((event) => {
    const { x, y } = getEventCoordinates(event);
    sendEventData('mousemove', { x, y });
}, 15); // 15ms = ~60 FPS

const deviceInfo = document.getElementById('device-info');

if (deviceInfo) {
    setTimeout(() => {
        deviceInfo.style.opacity = '0';
    }, 5000);
}

video.addEventListener('mousemove', throttledMouseMove);

video.addEventListener('mousedown', (event) => {
    const buttonMap = { 0: 'left', 1: 'middle', 2: 'right' };
    sendEventData('mousedown', { button: buttonMap[event.button] });
});

video.addEventListener('mouseup', () => {
    sendEventData('mouseup');
});

document.addEventListener('keydown', (event) => {
    const isAltShift = event.altKey && event.key.toLowerCase() === 'shift';
    if (isAltShift) {
        sendEventData('switch-language');
        event.preventDefault();
        return;
    }
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

video.addEventListener('mousedown', (event) => {
    const circle = document.createElement('div');
    circle.className = 'click-circle';
    circle.style.left = `${event.clientX}px`;
    circle.style.top = `${event.clientY}px`;
    document.getElementById('click-feedback').appendChild(circle);

    setTimeout(() => {
        circle.remove();
    }, 500);
});

document.addEventListener('keydown', (event) => {
    const keyBox = document.getElementById('key-feedback');
    const key = event.key.length === 1 ? event.key : event.key.toLowerCase();
    let combo = [];

    if (event.ctrlKey) combo.push('Ctrl');
    if (event.shiftKey) combo.push('Shift');
    if (event.altKey) combo.push('Alt');
    combo.push(key);

    keyBox.textContent = '⌨ ' + combo.join(' + ');
    keyBox.style.display = 'block';

    clearTimeout(keyBox.hideTimeout);
    keyBox.hideTimeout = setTimeout(() => {
        keyBox.style.display = 'none';
    }, 1500);
});

async function loadDeviceInfo() {
    try {
        const res = await fetch('/api/device');
        const data = await res.json();
        const box = document.getElementById('device-info');
        box.textContent = `${data.hostname} • ${data.os} • ${data.resolution}`;
    } catch (err) {
        console.warn('Device info unavailable');
    }
}

loadDeviceInfo();

