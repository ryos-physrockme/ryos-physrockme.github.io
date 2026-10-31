const dialog = document.querySelector('#qr-dialog');
if (typeof dialog?.showModal === 'function') {
  for (const link of document.querySelectorAll('[data-qr]')) {
    link.addEventListener('click', event => {
      event.preventDefault();
      const isWebsite = link.dataset.qr === 'website';
      const destination = document.querySelector(`.card-contact a${isWebsite ? ':last-child' : ':first-child'}`);
      document.querySelector('#qr-title').textContent = isWebsite ? 'Website' : 'Email';
      const image = document.querySelector('#qr-large');
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      const target = document.querySelector('#qr-destination');
      target.href = destination.href;
      target.textContent = destination.textContent;
      dialog.showModal();
    });
  }
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
}
