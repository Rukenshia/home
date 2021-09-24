'use strict';

const resolvers = new Map();
const specialResolvers = new Map();

// Find all "Categories".
// The way this home page works is by dividing the page
// into customisable sections. A category is a collection
// of links.
//
// Each category will automatically be assigned with a letter
// starting at 'a'.
//
// Links inside of categories will automatically be assigned with
// a number, starting at '1'. When the last number, '0' is exhausted,
// the next available letter is assigned. Letters already assigned to
// categories are ignored during link assignment.
const categories = document.querySelectorAll('h2');
categories.forEach((c, i) => {
    const cel = document.createElement('div');
    cel.classList = 'link-hint';
    cel.textContent = String.fromCharCode('a'.charCodeAt(0) + i);

    c.parentElement.prepend(cel);

    // Set up a new resolver with some utility functions
    resolvers.set(cel.textContent, {
        resetVisualFocus() {
            cel.classList.toggle('focus', false);
            c.parentElement.parentElement.classList.toggle('focus', false);
        },
        toggleFocus() {
            cel.classList.toggle('focus');
            c.parentElement.parentElement.classList.toggle('focus');

            if (cel.classList.contains('focus')) {
                type(`${c.textContent} . `);
            } else {
                reset();
            }
        },
        links: new Map(),
    });

    // Find all links
    const links = c.parentElement.parentElement.querySelectorAll('a');
    links.forEach((l, i) => {
        // Assign the next available number or letter
        const linkChar = i > 8 ? String.fromCharCode('a'.charCodeAt(0) + categories.length + i - 9) : (i + 1);
        const lel = document.createElement('div');
        lel.classList = 'link-hint';
        lel.textContent = linkChar;

        l.parentElement.prepend(lel);

        // Set up the resolver for when the link is focused/clicked
        resolvers.get(cel.textContent).links.set(lel.textContent, () => {
            lel.classList.toggle('focus');
            type(l.textContent).then(() => l.click());
        })
    });
});

// Find all so-called "special triggers".
// A special trigger is a link that only requires one key-press
// to call it. To add a special trigger, the html element needs to
// include a "data-trigger" attribute with the intended shortcut.
//
// Note: 'S' is a reserved special trigger for the Scratchpad and
// 		 cannot be used.
document.querySelectorAll('[data-trigger]').forEach(specialLi => {
    if (specialLi.getAttribute('data-trigger') === 'S') {
        // Reserved for [S]cratchpad
        return;
    }

    const linkHint = document.createElement('div');
    linkHint.classList = 'link-hint special';
    linkHint.textContent = specialLi.getAttribute('data-trigger');

    // When the data-trigger is set to an input, we need to put the
    // linkHint into the parent node.
    // Additionally, we only want to focus it instead of clicking anything.
    if (specialLi.nodeName === 'INPUT') {
        specialLi.parentElement.prepend(linkHint);
        specialResolvers.set(linkHint.textContent, e => {
            specialLi.focus();
            e.preventDefault();
        });
        return;
    }

    const link = specialLi.querySelector('a');
    specialLi.prepend(linkHint);
    specialResolvers.set(linkHint.textContent, () => {
        if (link) {
            link.click();
        }
    });
});

// Set up the Scratchpad special trigger
specialResolvers.set('S', e => {
    simplemde.codemirror.focus();
    simplemde.codemirror.setCursor(simplemde.codemirror.lineCount(), 0);
    e.preventDefault();
});

let currentCategory = undefined;

// Handle all keypresses, find if they relate to any
// of our triggers
document.addEventListener('keydown', ev => {
    // Ignore any input while we are in the scratchpad or input fields
    if (document.activeElement === scratchpad
        || document.querySelector('.CodeMirror-focused') !== null
        || document.activeElement && document.activeElement.nodeName === 'INPUT'
        || document.activeElement && document.activeElement.nodeName === 'TEXTAREA') {
        return;
    }

    // Handle special triggers: they only have one key that requires to be pressed
    // We could just have them in the "resolvers" map, but that would require a lot more logic
    // so we take the simple way of a separate resolver map
    if (specialResolvers.has(ev.key)) {
        if (currentCategory) {
            // Deselect the current category as a shortcut was used
            currentCategory.toggleFocus();
        }
        currentCategory = undefined;

        specialResolvers.get(ev.key)(ev);
        return;
    }

    // If we have no category selected yet, let's see if the key
    // resolves to a category key and then activate it.
    // This will change its background color slightly (theme dependent) and also
    // show the category name in the "shell" at the top of the page
    if (!currentCategory) {
        currentCategory = resolvers.get(ev.key);
        if (currentCategory) {
            currentCategory.toggleFocus();
        }
        return;
    }

    // Check if we are trying to deselect the current category
    if (resolvers.get(ev.key) === currentCategory) {
        currentCategory.toggleFocus();
        currentCategory = undefined;
        return;
    }

    // Attempt to call actual resolver
    const resolver = currentCategory.links.get(ev.key);
    if (!resolver) {
        // Invalid character, attempt to resolve new category
        const newCategory = resolvers.get(ev.key);
        if (newCategory) {
            // Only reset the "highlighted section", not the shell
            currentCategory.resetVisualFocus();

            // Reset the shell manually and immediately focus the new category to avoid a jerky shell
            currentCategory = newCategory;
            reset().then(currentCategory.toggleFocus);
            return;
        }

        // No category, reset everything
        currentCategory.toggleFocus();
        currentCategory = undefined;
        return;
    }

    resolver(ev);
    currentCategory = undefined;
});
