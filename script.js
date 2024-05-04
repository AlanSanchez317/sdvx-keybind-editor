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

document.addEventListener('DOMContentLoaded', function () {
    const defaultKeybinds = {
        'bt-a': 'D',
        'bt-b': 'F',
        'bt-c': 'J',
        'bt-d': 'K',
        'fx-l': 'S',
        'fx-r': 'L',
        'vol-l': 'V',
        'vol-r': 'N',
        'start': 'ENTER'
    };

    const keyInputs = document.querySelectorAll('.config-entry input');
    const resetButton = document.getElementById('reset');
    const endButton = document.getElementById('end');

    // Setup key input event listeners
    keyInputs.forEach(input => {
        input.addEventListener('keydown', function (event) {
            event.preventDefault();  // Prevent default typing behavior
            const keyName = event.key === ' ' ? 'Space' : event.key.length === 1 ? event.key.toUpperCase() : event.key;
            input.value = keyName;
            updateDisplay(input.dataset.displayId, keyName);
        });
    });

    // Reset all keybinds to default when the reset button is clicked
    resetButton.addEventListener('click', function () {
        keyInputs.forEach(input => {
            const key = input.id;
            const defaultKey = defaultKeybinds[key];
            input.value = defaultKey;
            updateDisplay(input.dataset.displayId, defaultKey);
        });
    });

    // End the application when the end button is clicked
    endButton.addEventListener('click', function () {
        ipcRenderer.send('close-app');
    });

    // Function to update the display element associated with an input
    function updateDisplay(displayId, value) {
        const displayElement = document.getElementById(displayId);
        if (displayElement) {
            displayElement.innerText = value;
        }
    }

    const saveButton = document.getElementById('save');
    saveButton.addEventListener('click', function () {
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
        console.log('Sending new config:', config);
        ipcRenderer.send('update-device-config', {config: config});
    });
});
