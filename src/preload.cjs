const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('newsApp',{
 library:()=>ipcRenderer.invoke('library'),refresh:()=>ipcRenderer.invoke('refresh'),
 favorite:id=>ipcRenderer.invoke('favorite',id),theme:value=>ipcRenderer.invoke('theme',value),
 copy:id=>ipcRenderer.invoke('copy',id),open:id=>ipcRenderer.invoke('open',id),print:id=>ipcRenderer.invoke('print',id)
});
