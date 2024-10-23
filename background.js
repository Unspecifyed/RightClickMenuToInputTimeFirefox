/*
 * This file is part of the Insert Date and Time Extension.
 *
 * Insert Date and Time Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Insert Date and Time Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Insert Date and Time Extension. If not, see <https://www.gnu.org/licenses/>.
 */

// Set the debug flag
const DEBUG = false;  // Set to false for production

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

                    // Check if the element is an input, textarea, or contenteditable element
                    if (activeElement && 
                        (activeElement.tagName === 'TEXTAREA' || 
                        (activeElement.tagName === 'INPUT' && activeElement.type === 'text') || 
                        activeElement.getAttribute('contenteditable') === 'true')) {

                        console.log("Valid editable element found. Inserting date and time...");

                        let dateTime = new Date().toISOString().replace('T', ' ').split('.')[0];  // YYYY-MM-DD HH:MM:SS

                        if (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') {
                            // Handle insertion and cursor movement for input and textarea
                            let cursorPos = activeElement.selectionStart;
                            let textBeforeCursor = activeElement.value.substring(0, cursorPos);
                            let textAfterCursor = activeElement.value.substring(cursorPos);

                            activeElement.value = textBeforeCursor + dateTime + textAfterCursor;
                            activeElement.selectionStart = activeElement.selectionEnd = cursorPos + dateTime.length;

                            console.log("Date and time inserted into input/textarea. Cursor moved to end of inserted text.");

                        } else if (activeElement.getAttribute('contenteditable') === 'true') {
                            // Handle insertion and cursor movement for contenteditable elements
                            let selection = window.getSelection();
                            let range = selection.getRangeAt(0);

                            // Insert the date and time at the current cursor position
                            range.deleteContents();
                            let textNode = document.createTextNode(dateTime);
                            range.insertNode(textNode);

                            // Move the cursor to the end of the inserted text
                            range.setStartAfter(textNode);
                            range.setEndAfter(textNode);
                            selection.removeAllRanges();
                            selection.addRange(range);

                            // Focus the active element
                            activeElement.focus();

                            // Ensure the cursor is visible (for elements that may lose focus)
                            if (activeElement.scrollIntoView) {
                                activeElement.scrollIntoView({ block: "nearest", inline: "nearest" });
                            }

                            console.log("Date and time inserted into contenteditable element. Cursor moved to end of inserted text and element refocused.");
                        }

                    } else {
                        console.error("No valid input or contenteditable element is focused or active.");
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
