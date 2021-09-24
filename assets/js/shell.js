'use strict';

const shell = document.getElementById('shell');

// Set up an interval to make the cursor blink
setInterval(() => {
    document.getElementById('cursor').classList.toggle('inactive');
}, 500);

/**
 * Append text into the shell
 */
function type(text) {
    return new Promise(resolve => {
        const append = rest => {
            if (!rest.length) {
                resolve();
                return;
            }
            const c = rest.charAt(0);
            shell.textContent = `${shell.textContent}${c}`;

            setTimeout(() => append(rest.slice(1)), 12);
        };

        append(text);
    });
}

/**
 * Reset the shell text
 */
function reset() {
    return new Promise(resolve => {
        const remove = () => {
            shell.textContent = shell.textContent.slice(0, shell.textContent.length - 1);

            if (shell.textContent) {
                setTimeout(remove, 16);
            } else {
                resolve();
            }
        };
        setTimeout(remove, 16);
    });
}