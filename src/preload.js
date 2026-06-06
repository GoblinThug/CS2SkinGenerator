const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cs2Api', {
    getSkins: async () => {
        const res = await fetch(
            'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json'
        );

        if (!res.ok) {
            throw new Error('Не удалось загрузить skins.json');
        }

        return res.json();
    },

    minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
    maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
    closeWindow: () => ipcRenderer.invoke('window:close'),

    reloadApp: () => ipcRenderer.invoke('app:reload'),
    openDevTools: () => ipcRenderer.invoke('app:devtools')
});