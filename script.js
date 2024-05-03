const { ipcRenderer } = require('electron');

ipcRenderer.on('controller-status', (event, data) => {
    const selectElement = document.getElementById('controller');
    console.log(`Controller Event: ${data.status} - ${data.name}`);

    if (data.status === 'connected' && data.name) {
        let exists = Array.from(selectElement.options).some(option => option.text === data.name);
        if (!exists) {
            let newOption = new Option(data.name, data.name);
            selectElement.appendChild(newOption);
        }
    } else if (data.status === 'disconnected' && data.name) {
        Array.from(selectElement.options).forEach(option => {
            if (option.text === data.name) {
                selectElement.removeChild(option);
            }
        });
    }
});
