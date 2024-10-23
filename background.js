// Listen for when the context menu is clicked
browser.contextMenus.create({
    id: "insert-date-time",
    title: "Insert Date and Time",
    contexts: ["editable"]
});

// Function to get the current date and time
function getCurrentDateTime() {
    let date = new Date();
    return date.toISOString().replace('T', ' ').split('.')[0]; // YYYY-MM-DD HH:MM:SS
}

// Handle the click event on the context menu item
browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "insert-date-time") {
        browser.tabs.executeScript(tab.id, {
            code: `(() => {
                let activeElement = document.activeElement;
                if (activeElement && (activeElement.tagName === 'TEXTAREA' || (activeElement.tagName === 'INPUT' && activeElement.type === 'text'))) {
                    let cursorPos = activeElement.selectionStart;
                    let textBeforeCursor = activeElement.value.substring(0, cursorPos);
                    let textAfterCursor = activeElement.value.substring(cursorPos);
                    let dateTime = "${getCurrentDateTime()}";
                    activeElement.value = textBeforeCursor + dateTime + textAfterCursor;
                    activeElement.selectionStart = activeElement.selectionEnd = cursorPos + dateTime.length;
                }
            })();`
        });
    }
});
