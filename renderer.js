const { ipcRenderer } = require('electron');

document.getElementById('saveButton').addEventListener('click', () => {
    const config = {
        'bt-a': document.getElementById('bt-a').value,
        'bt-b': document.getElementById('bt-b').value,
        'bt-c': document.getElementById('bt-c').value,
        'bt-d': document.getElementById('bt-d').value,
        'fx-l': document.getElementById('fx-l').value,
        'fx-r': document.getElementById('fx-r').value,
        'vol-l': document.getElementById('vol-l').value,
        'vol-r': document.getElementById('vol-r').value,
        'start': document.getElementById('start').value
    };
    ipcRenderer.send('update-device-config', { config });
    console.log('Config sent:', config);
});

ipcRenderer.on('controller-status', (event, { status, name }) => {
    console.log(`Controller ${status}: ${name}`);
});

ipcRenderer.on('execute-action', (event, { action }) => {
    console.log(`Performing action: ${action}`);
    // Here you would trigger the key press simulation
});
