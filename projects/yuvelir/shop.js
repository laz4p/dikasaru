'use strict';

const grid = document.querySelector('.products');
const products = Array.from(grid.children, (card) => ({
  card,
  id: card.dataset.id,
  type: card.dataset.type,
  price: Number(card.dataset.price),
  name: card.querySelector('h3').textContent,
  image: card.querySelector('img').getAttribute('src'),
}));
const cart = document.querySelector('#cart');
const cartContent = document.querySelector('#cart-content');
const cartCount = document.querySelector('#cart-count');
const cartTotal = document.querySelector('#cart-total');
const checkout = document.querySelector('#checkout');
const checkoutNote = document.querySelector('#checkout-note');
const toast = document.querySelector('#toast');
const filters = [...document.querySelectorAll('[data-filter]')];
const sort = document.querySelector('#sort');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const currency = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const storageKey = 'vorn-cart-v1';
const maxQuantity = 99;
const quantities = loadCart();
let category = 'all';
let toastTimer;

function loadCart() {
  const result = new Map();
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey)) || {};
    for (const { id } of products) {
      if (Number.isInteger(saved[id]) && saved[id] > 0) {
        result.set(id, Math.min(saved[id], maxQuantity));
      }
    }
  } catch {
    // The demo can run from a local file even with storage disabled.
  }
  return result;
}

function setQuantity(id, value) {
  if (value > 0) quantities.set(id, Math.min(value, maxQuantity));
  else quantities.delete(id);
  try {
    localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(quantities)));
  } catch {
    // Keep the cart in memory if the browser blocks storage.
  }
  checkoutNote.textContent = '';
  renderCart();
}

function renderCart() {
  const lines = products.filter(({ id }) => quantities.has(id));
  let count = 0;
  let total = 0;
  cartContent.replaceChildren();
  for (const product of lines) {
    const quantity = quantities.get(product.id);
    count += quantity;
    total += product.price * quantity;

    const row = document.createElement('div');
    row.className = 'cart-line';
    row.dataset.id = product.id;
    // All markup values come from the fixed catalog and a validated quantity.
    row.innerHTML = `
      <img src="${product.image}" alt="" width="78" height="78">
      <div><h3>${product.name}</h3><p>${currency.format(product.price * quantity)}</p></div>
      <div class="qty" role="group" aria-label="Количество ${product.name}">
        <button class="square" data-step="-1" type="button" aria-label="${quantity === 1 ? 'Удалить' : 'Уменьшить количество'} ${product.name}"><svg class="icon" aria-hidden="true"><use href="#minus"/></svg></button>
        <span>${quantity}</span>
        <button class="square" data-step="1" type="button" aria-label="Увеличить количество ${product.name}" ${quantity === maxQuantity ? 'disabled' : ''}><svg class="icon" aria-hidden="true"><use href="#plus"/></svg></button>
      </div>`;
    cartContent.append(row);
  }
  if (!lines.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'В корзине пока пусто.';
    cartContent.append(empty);
  }
  cartCount.textContent = count;
  cartTotal.textContent = currency.format(total);
  checkout.disabled = count === 0;
}

function announce(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2000);
}

function renderCatalog() {
  const ordered = [...products];
  if (sort.value === 'low') ordered.sort((a, b) => a.price - b.price);
  if (sort.value === 'high') ordered.sort((a, b) => b.price - a.price);
  for (const { card, type } of ordered) {
    card.hidden = category !== 'all' && category !== type;
    grid.append(card);
    if (!card.hidden && !reducedMotion.matches) {
      card.getAnimations().forEach((animation) => animation.cancel());
      card.animate(
        [{ opacity: .45, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }],
        { duration: 290, easing: 'cubic-bezier(.2,.75,.25,1)' },
      );
    }
  }
}

for (const filter of filters) {
  filter.addEventListener('click', () => {
    if (category === filter.dataset.filter) return;
    category = filter.dataset.filter;
    filters.forEach((button) => button.setAttribute('aria-pressed', button === filter));
    renderCatalog();
  });
}
sort.addEventListener('change', renderCatalog);

for (const { card, id, name } of products) {
  card.querySelector('[data-add]').addEventListener('click', () => {
    const quantity = quantities.get(id) || 0;
    if (quantity === maxQuantity) {
      announce(`В корзине уже ${maxQuantity} шт. ${name}`);
      return;
    }
    setQuantity(id, quantity + 1);
    announce(`${name} добавлено в корзину`);
    if (!reducedMotion.matches) {
      cartCount.animate([{ transform: 'scale(1.2)' }, { transform: 'none' }], 230);
    }
  });
}

for (const button of document.querySelectorAll('[data-open-cart]')) {
  button.addEventListener('click', () => {
    checkoutNote.textContent = '';
    cart.showModal();
  });
}

cart.addEventListener('click', (event) => {
  if (event.target !== cart) return;
  const { left, top, right, bottom } = cart.getBoundingClientRect();
  if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) cart.close();
});

cartContent.addEventListener('click', (event) => {
  const button = event.target.closest('[data-step]');
  if (!button) return;
  const { id } = button.closest('.cart-line').dataset;
  const step = button.dataset.step;
  setQuantity(id, quantities.get(id) + Number(step));

  const updatedRow = cartContent.querySelector(`[data-id="${id}"]`);
  const sameAction = updatedRow?.querySelector(`[data-step="${step}"]:enabled`);
  const alternateAction = updatedRow?.querySelector('[data-step]:enabled');
  const closeButton = cart.querySelector('[autofocus]');
  (sameAction || alternateAction || cartContent.querySelector('button') || closeButton).focus();
});

checkout.addEventListener('click', () => {
  checkoutNote.textContent = 'это демо версия сайта :)';
});

renderCart();
