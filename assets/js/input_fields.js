/**
 * This file allows specifying input fields with a "data-query" attribute. When
 * pressing the return key, the specified query will be put into the data-query URL
 * and opened in the browser.
 * 
 * The placeholder '{query}' needs to be used.
 */

// Find all input fields
const inputs = document.querySelectorAll('input');

for (const input of inputs) {
    const queryTemplate = input.getAttribute('data-query');

    if (!queryTemplate) {
        // Input is not configured correctly or is unrelated
        continue;
    }

    input.addEventListener('keydown', e => {
        if (e.key !== 'Enter') {
            return;
        }

        window.location.href = queryTemplate.replace('{query}', input.value);
    });
}