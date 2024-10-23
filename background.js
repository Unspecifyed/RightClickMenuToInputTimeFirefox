// Create the context menu item
browser.contextMenus.create({
    id: "insert-date-time",
    title: "Insert Date and Time",
    contexts: ["editable"]  // Only show when right-clicking in text fields
});

// Define the function to get the current date and time
function getCurrentDateTime() {
    let date = new Date();
    return date.toISOString().replace('T', ' ').split('.')[0];  // Format: YYYY-MM-DD HH:MM:SS
}

// Add an event listener for the context menu click
browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "insert-date-time") {
        // Inject a content script to execute in the active tab
        browser.tabs.executeScript(tab.id, {
            code: `
                (function() {
                    let activeElement = document.activeElement;
                    if (activeElement && (activeElement.tagName === 'TEXTAREA' || (activeElement.tagName === 'INPUT' && activeElement.type === 'text'))) {
                        let cursorPos = activeElement.selectionStart;
                        let textBeforeCursor = activeElement.value.substring(0, cursorPos);
                        let textAfterCursor = activeElement.value.substring(cursorPos);
                        let dateTime = "${getCurrentDateTime()}";
                        activeElement.value = textBeforeCursor + dateTime + textAfterCursor;
                        activeElement.selectionStart = activeElement.selectionEnd = cursorPos + dateTime.length;
                    }
                })();
            `
        }).catch(error => {
            console.error("Error executing script: ", error);
        });
    }
});
