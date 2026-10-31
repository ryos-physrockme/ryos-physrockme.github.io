import renderMathInElement from './vendor/katex-0.19.1/contrib/auto-render.mjs';

// Each entry has its own macro scope, including after a list refresh.
export function renderMath(root = document) {
  const selector = '[data-math], .record-body';
  const elements = [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
  for (const element of elements) {
    renderMathInElement(element, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
      ],
      ignoredClasses: ['katex', 'katex-display', 'katex-error'],
      throwOnError: false,
      errorColor: '#65508e',
      trust: false,
      maxExpand: 1000,
      maxSize: 10,
      macros: {}
    });
  }
}

if (typeof document !== 'undefined') renderMath();
