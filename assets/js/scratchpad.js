'use strict';

// Toggle whether you want to see links rendered as a clickable <a> tag on the right side
// of the scratchpad
const ENABLE_SCRATCHPAD_LINKS = true;

/**
 * Highlight all links in the CodeMirror editor
 *
 * We append a div element to all lines that have a "cm-link"
 * attached to it.
 * We do not have to clean up old links because CodeMirror will
 * delete the line.
 *
 * I didn't figure out how to make the link
 * itself clickable without many hacks, because as soon as you
 * click on the link the line gets re-rendered, meaning your
 * old event handlers won't be registered anymore.
 *
 * There is a way to extend CodeMirror, but it just looked like too much
 * effort to learn, this works for now albeit not being great.
 */
function highlightLinks() {
  const renderedLinks = [...document.querySelectorAll('.scratchpad-link')].map(
    (el) => el.getAttribute('data-url')
  );

  document.querySelectorAll('.CodeMirror-line').forEach((line) => {
    let name = [...line.querySelectorAll('.cm-link')]
      .map((l) => l.innerText)
      .join('')
      .replace(/[\[\]]/g, '');
    let link = [...line.querySelectorAll('.cm-url')]
      .map((l) => l.innerText)
      .join('')
      .replace(/[\(\)]/g, '');

    if (link.length < 1) {
      // Try to find non-markdown links
      const re =
        /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/;

      const matches = name.match(re);

      if (!matches) {
        return;
      }

      // We found a non-markdown link, let's give it a generic
      // name and show our element.
      name = 'open';
      link = matches[0];
    }

    // Make sure we did not render this link before
    if (!renderedLinks.includes(link)) {
      // Create our link element
      const el = document.createElement('div');
      el.id = link;
      el.innerHTML = `<a target="_blank" href="${link}">${name}</a>`;
      el.classList.toggle('scratchpad-link', true);
      el.setAttribute('data-url', link);

      line.appendChild(el);
    }
  });
}

// Create the SimpleMDE scratchpad
const scratchpad = document.getElementById('scratchpad');
const simplemde = new window.SimpleMDE({
  element: scratchpad,
  status: false,
  toolbar: false,
  spellChecker: false,
  forceSync: true,
  autosave: {
    enabled: true,
    delay: 1000,
    uniqueId: 'scratchpad',
  },
  shortcuts: {
    toggleUnorderedList: null,
  },
});

// Disable "Tab" so we can get out of the editor
simplemde.codemirror.options.extraKeys.Tab = false;

if (ENABLE_SCRATCHPAD_LINKS) {
  // We need to call highlightLinks in an interval to work
  // around CodeMirror re-rendering its DOM.
  //
  // For more info: Whenever the cursor changes in CodeMirror,
  // the line it falls on gets re-rendered all the time.
  // If we are now in a line that contains a markdown link, this
  // line will be re-rendered. We attach our link element as a child
  // of the CodeMirror-line, so our element will be gone when
  // CodeMirror re-renders this line. The interval will make the link
  // re-appear within the given time.
  //
  // Is this great performance-wise? Absolutely not. Does it work
  // for now? yeah.
  setInterval(highlightLinks, 1000);

  // Hack to wait for simplemde to be initialised
  setTimeout(highlightLinks, 100);
}
