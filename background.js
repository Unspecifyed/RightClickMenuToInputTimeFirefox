// Set the debug flag
const DEBUG = true;  // Set to false for production

// A helper function to log messages when debugging is enabled
function debugLog(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

function debugError(...args) {
    if (DEBUG) {
        console.error(...args);
    }
}

// Log the creation of the context menu item
debugLog("Creating context menu item...");

browser.contextMenus.create({
    id: "insert-date-time",
    title: "Insert Date and Time",
    contexts: ["editable"]
}, () => {
    if (browser.runtime.lastError) {
        debugError("Error creating context menu item:", browser.runtime.lastError);
    } else {
        debugLog("Context menu item created successfully.");
    }
});

// Log when the context menu item is clicked
browser.contextMenus.onClicked.addListener((info, tab) => {
    debugLog("Context menu clicked. Info:", info);
    
    if (info.menuItemId === "insert-date-time") {
        debugLog("Inserting date and time into tab:", tab.id);

        // Inject the content script to insert the date and time
        browser.tabs.executeScript(tab.id, {
            code: `
                (function() {
                    console.log("Running insertDateTime function...");

                    let activeElement = document.activeElement;
                    console.log("Active element:", activeElement);

                    if (activeElement && (activeElement.tagName === 'TEXTAREA' || (activeElement.tagName === 'INPUT' && activeElement.type === 'text'))) {
                        console.log("Valid input element found. Inserting date and time...");

                        let cursorPos = activeElement.selectionStart;
                        let textBeforeCursor = activeElement.value.substring(0, cursorPos);
                        let textAfterCursor = activeElement.value.substring(cursorPos);
                        let dateTime = new Date().toISOString().replace('T', ' ').split('.')[0];  // YYYY-MM-DD HH:MM:SS

                        console.log("Current value before cursor:", textBeforeCursor);
                        console.log("Current value after cursor:", textAfterCursor);
                        console.log("Inserting date and time:", dateTime);

                        // Insert the date and time at the cursor position
                        activeElement.value = textBeforeCursor + dateTime + textAfterCursor;

                        // Reset the cursor position after inserting the text
                        activeElement.selectionStart = activeElement.selectionEnd = cursorPos + dateTime.length;

                        console.log("Date and time inserted successfully.");
                    } else {
                        console.error("No valid input element is focused or active.");
                    }
                })();
            `
        }).then(() => {
            debugLog("Script injected successfully.");
        }).catch(error => {
            debugError("Error injecting script:", error);
        });
    }
});
