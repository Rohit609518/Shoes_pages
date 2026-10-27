/**
 * LocalShoes – script.js
 * Full-featured vanilla JS for the LocalShoes e-commerce site.
 * Features: Cart, Wishlist, Search, Filter, Sort, Contact Form,
 *           Toast, Scroll Reveal, Back-to-Top, Mobile Menu, Newsletter.
 */

'use strict';

/* ============================================================
   1. PRODUCT DATA
   ============================================================ */
const PRODUCTS = [
  {
    id: 1,
    name: 'AirFlex Running Sneakers',
    category: 'men',
    price: 2999,
    originalPrice: 4499,
    rating: 4.8,
    reviewCount: 1240,
    image: '../images/mens_running_shoe.jpg',
    sizes: ['7', '8', '9', '10', '11'],
    badge: '33% OFF',
    featured: true,
  },
  {
    id: 2,
    name: 'Urban Street Sneakers',
    category: 'men',
    price: 3499,
    originalPrice: 4999,
    rating: 4.6,
    reviewCount: 876,
    image: '../images/urban_street_shoe.jpg',
    sizes: ['7', '8', '9', '10', '11', '12'],
    badge: '30% OFF',
  },
  {
    id: 3,
    name: 'Classic Leather Oxfords',
    category: 'men',
    price: 4499,
    originalPrice: null,
    rating: 4.9,
    reviewCount: 542,
    image: '../images/classic_leather_shoe.jpg',
    sizes: ['7', '8', '9', '10', '11'],
    badge: null,
    featured: true,
  },
  {
    id: 4,
    name: 'SportMax Training Shoes',
    category: 'men',
    price: 1999,
    originalPrice: 2799,
    rating: 4.5,
    reviewCount: 698,
    image: '../images/sport_training_shoe.jpg',
    sizes: ['7', '8', '9', '10', '11'],
    badge: '29% OFF',
  },
  {
    id: 5,
    name: "Women's Comfort Walkers",
    category: 'women',
    price: 1799,
    originalPrice: 2499,
    rating: 4.7,
    reviewCount: 1023,
    image: '../images/womens_comfort_shoe.jpg',
    sizes: ['4', '5', '6', '7', '8'],
    badge: '28% OFF',
    featured: true,
  },
  {
    id: 6,
    name: "Elegant Women's Sneakers",
    category: 'women',
    price: 2499,
    originalPrice: 3299,
    rating: 4.8,
    reviewCount: 765,
    image: '../images/womens_sneaker.jpg',
    sizes: ['4', '5', '6', '7', '8', '9'],
    badge: '24% OFF',
  },
  {
    id: 7,
    name: "Kids' Active Runners",
    category: 'kids',
    price: 999,
    originalPrice: 1499,
    rating: 4.7,
    reviewCount: 432,
    image: '../images/kids_shoe.jpg',
    sizes: ['2', '3', '4', '5', '6'],
    badge: '33% OFF',
    featured: true,
  },
  {
    id: 8,
    name: "Kids' Everyday School Shoes",
    category: 'kids',
    price: 699,
    originalPrice: 999,
    rating: 4.5,
    reviewCount: 318,
    image: '../images/kids_shoe.jpg',
    sizes: ['2', '3', '4', '5', '6'],
    badge: '30% OFF',
  },
];

/* ============================================================
   2. STATE
   ============================================================ */
let cart = JSON.parse(localStorage.getItem('ls_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('ls_wishlist') || '[]');
let currentFilter = 'all';
let currentSort = 'default';

/* ============================================================
   3. UTILITY FUNCTIONS
   ============================================================ */

/** Format a number as Indian rupee string */
function formatRupee(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

/** Generate star string from rating number */
function generateStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

/** Debounce helper to limit rapid calls */
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/* ============================================================
   4. TOAST NOTIFICATION
   ============================================================ */
let toastTimer = null;

function showToast(msg, icon = '✓') {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  const toastIcon = document.getElementById('toast-icon');
  toastMsg.textContent = msg;
  toastIcon.textContent = icon;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ============================================================
   5. CART FUNCTIONS
   ============================================================ */

/** Persist cart to localStorage */
function saveCart() {
  localStorage.setItem('ls_cart', JSON.stringify(cart));
}

/** Update the cart counter badge in the navbar */
function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  const el = document.getElementById('cart-count');
  el.textContent = total;
  el.classList.remove('bump');
  // Force reflow for animation restart
  void el.offsetWidth;
  if (total > 0) el.classList.add('bump');
  setTimeout(() => el.classList.remove('bump'), 300);
}

/** Add a product to cart (or increase qty if exists) */
function addToCart(productId, size) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  if (!size) {
    showToast('Please select a size first!', '⚠');
    return;
  }

  const key = `${productId}_${size}`;
  const existing = cart.find(item => item.key === key);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      key,
      id: productId,
      name: product.name,
      image: product.image,
      price: product.price,
      category: product.category,
      size,
      qty: 1,
    });
  }
  saveCart();
  updateCartCount();
  renderCart();
  showToast(`${product.name} added to cart!`, '🛒');
}

/** Remove a cart item by key */
function removeFromCart(key) {
  cart = cart.filter(item => item.key !== key);
  saveCart();
  updateCartCount();
  renderCart();
  showToast('Item removed from cart', '🗑');
}

/** Change quantity of a cart item */
function changeQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  updateCartCount();
  renderCart();
}

/** Render all cart items into the drawer */
function renderCart() {
  const body = document.getElementById('cart-body');
  const footer = document.getElementById('cart-footer');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-icon">🛒</span>
        <h3>Your cart is empty</h3>
        <p>Add your favourite shoes and they'll appear here.</p>
      </div>`;
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';

  body.innerHTML = cart.map(item => `
    <div class="cart-item" data-key="${item.key}">
      <img
        src="${item.image}"
        alt="${item.name}"
        class="cart-item-img"
        onerror="this.src='https://via.placeholder.com/72/202025/FF6B35?text=Shoe'"
      />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">
          <span>${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
          <span>Size ${item.size}</span>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty('${item.key}', -1)" aria-label="Decrease quantity">−</button>
          <span class="qty-num" aria-label="Quantity">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.key}', 1)" aria-label="Increase quantity">+</button>
          <button class="cart-item-remove" onclick="removeFromCart('${item.key}')" aria-label="Remove ${item.name} from cart">✕</button>
        </div>
      </div>
      <div class="cart-item-price">${formatRupee(item.price * item.qty)}</div>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  subtotalEl.textContent = formatRupee(subtotal);
  totalEl.textContent = formatRupee(subtotal); // Free shipping
}

/** Open the cart drawer */
function openCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  drawer.classList.add('open');
  overlay.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

/** Close the cart drawer */
function closeCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ============================================================
   6. WISHLIST FUNCTIONS
   ============================================================ */

function saveWishlist() {
  localStorage.setItem('ls_wishlist', JSON.stringify(wishlist));
}

function toggleWishlist(productId) {
  const idx = wishlist.indexOf(productId);
  if (idx === -1) {
    wishlist.push(productId);
    showToast('Added to wishlist!', '❤');
  } else {
    wishlist.splice(idx, 1);
    showToast('Removed from wishlist', '🤍');
  }
  saveWishlist();
  // Update the heart button state in the grid
  const btn = document.querySelector(`.wishlist-btn[data-id="${productId}"]`);
  if (btn) {
    btn.classList.toggle('active', wishlist.includes(productId));
    btn.setAttribute('aria-pressed', wishlist.includes(productId));
    btn.textContent = wishlist.includes(productId) ? '❤' : '♡';
  }
}

/* ============================================================
   7. PRODUCT CARD RENDER
   ============================================================ */

function createProductCard(product) {
  const isWishlisted = wishlist.includes(product.id);
  const discountBadge = product.badge ? `<div class="product-discount-badge">${product.badge}</div>` : '';
  const originalPriceHtml = product.originalPrice
    ? `<span class="product-original-price">${formatRupee(product.originalPrice)}</span>`
    : '';

  const sizesHtml = product.sizes.map(size =>
    `<button
       class="size-btn"
       data-size="${size}"
       data-product="${product.id}"
       aria-label="Size ${size}"
       onclick="selectSize(this, ${product.id})"
     >${size}</button>`
  ).join('');

  return `
    <div class="product-card" role="listitem" data-id="${product.id}" data-category="${product.category}">
      <div class="product-img-wrap">
        ${discountBadge}
        <button
          class="wishlist-btn ${isWishlisted ? 'active' : ''}"
          data-id="${product.id}"
          aria-label="Toggle wishlist for ${product.name}"
          aria-pressed="${isWishlisted}"
          onclick="toggleWishlist(${product.id})"
        >${isWishlisted ? '❤' : '♡'}</button>
        <img
          src="${product.image}"
          alt="${product.name} – ${product.category} footwear"
          class="product-img"
          loading="lazy"
          onerror="this.src='https://via.placeholder.com/300/202025/FF6B35?text=Shoe'"
        />
      </div>
      <div class="product-body">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-rating">
          <span class="stars" aria-label="Rating: ${product.rating} out of 5">${generateStars(product.rating)}</span>
          <span class="rating-count">(${product.reviewCount.toLocaleString('en-IN')})</span>
        </div>
        <div class="product-price-row">
          <span class="product-price">${formatRupee(product.price)}</span>
          ${originalPriceHtml}
        </div>
        <div class="product-sizes">
          <div class="sizes-label">Select Size:</div>
          <div class="sizes-list" id="sizes-${product.id}">${sizesHtml}</div>
        </div>
        <button
          class="add-to-cart-btn"
          data-id="${product.id}"
          onclick="handleAddToCart(${product.id})"
          aria-label="Add ${product.name} to cart"
        >Add to Cart 🛒</button>
      </div>
    </div>`;
}

/** Handle size selection */
function selectSize(btn, productId) {
  // Deselect all for this product
  const container = document.getElementById(`sizes-${productId}`);
  if (!container) return;
  container.querySelectorAll('.size-btn').forEach(b => {
    b.classList.remove('selected');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('selected');
  btn.setAttribute('aria-pressed', 'true');
}

/** Handle "Add to Cart" button click — reads selected size */
function handleAddToCart(productId) {
  const container = document.getElementById(`sizes-${productId}`);
  const selectedBtn = container ? container.querySelector('.size-btn.selected') : null;
  const size = selectedBtn ? selectedBtn.dataset.size : null;
  addToCart(productId, size);
}

/* ============================================================
   8. PRODUCT FILTERING & SORTING
   ============================================================ */

function getFilteredProducts() {
  let filtered = [...PRODUCTS];

  // Filter by category
  if (currentFilter !== 'all') {
    filtered = filtered.filter(p => p.category === currentFilter);
  }

  // Sort
  switch (currentSort) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    default:
      // Featured products first
      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  return filtered;
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  const noResults = document.getElementById('no-results');
  const products = getFilteredProducts();

  if (products.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }

  noResults.style.display = 'none';
  grid.innerHTML = products.map(createProductCard).join('');
}

/* ============================================================
   9. SEARCH FUNCTIONALITY
   ============================================================ */

function performSearch(query) {
  const resultsContainer = document.getElementById('search-results');
  query = query.trim().toLowerCase();

  if (!query) {
    resultsContainer.innerHTML = '';
    return;
  }

  const matches = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  ).slice(0, 5);

  if (matches.length === 0) {
    resultsContainer.innerHTML = `<div class="search-result-item"><span style="color:var(--text-muted)">No products found for "${query}"</span></div>`;
    return;
  }

  resultsContainer.innerHTML = matches.map(p => `
    <div class="search-result-item" role="option" tabindex="0"
         onclick="scrollToProductAndHighlight(${p.id})"
         onkeydown="if(event.key==='Enter') scrollToProductAndHighlight(${p.id})">
      <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/44/202025/FF6B35?text=S'" />
      <div>
        <div class="search-result-name">${p.name}</div>
        <div class="search-result-price">${formatRupee(p.price)}</div>
      </div>
    </div>
  `).join('');
}

function scrollToProductAndHighlight(productId) {
  // Close search
  closeSearch();
  // Reset filter so the product is visible
  currentFilter = 'all';
  renderProducts();
  updateFilterTabs('all');
  // Scroll to products section
  const section = document.getElementById('products');
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ============================================================
   10. NAVBAR BEHAVIOR
   ============================================================ */

function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scroll → solid navbar
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveNavLink();
    updateBackToTop();
  }, { passive: true });

  // Smooth scroll for nav links
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMobileMenu();
      }
    });
  });

  // Update active link based on scroll position
  function updateActiveNavLink() {
    const sections = ['home', 'categories', 'products', 'about', 'offers', 'features', 'contact'];
    let current = 'home';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 120) current = id;
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === current || (href === 'men' && current === 'categories'));
    });
  }
}

/* ============================================================
   11. MOBILE MENU
   ============================================================ */

function initMobileMenu() {
  const hamburger = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close when a nav link is clicked
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMobileMenu);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

function closeMobileMenu() {
  const hamburger = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

/* ============================================================
   12. SEARCH BAR TOGGLE
   ============================================================ */

function initSearch() {
  const toggleBtn = document.getElementById('search-toggle-btn');
  const closeBtn = document.getElementById('search-close-btn');
  const submitBtn = document.getElementById('search-submit-btn');
  const input = document.getElementById('search-input');

  toggleBtn.addEventListener('click', () => {
    const container = document.getElementById('search-bar-container');
    const isOpen = container.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
    container.setAttribute('aria-hidden', !isOpen);
    if (isOpen) {
      input.focus();
    } else {
      closeSearch();
    }
  });

  closeBtn.addEventListener('click', closeSearch);

  input.addEventListener('input', debounce(() => performSearch(input.value), 300));

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') performSearch(input.value);
    if (e.key === 'Escape') closeSearch();
  });

  submitBtn.addEventListener('click', () => performSearch(input.value));
}

function closeSearch() {
  const container = document.getElementById('search-bar-container');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  container.classList.remove('open');
  container.setAttribute('aria-hidden', 'true');
  document.getElementById('search-toggle-btn').setAttribute('aria-expanded', 'false');
  input.value = '';
  results.innerHTML = '';
}

/* ============================================================
   13. FILTER & SORT CONTROLS
   ============================================================ */

function initFilters() {
  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentFilter = tab.dataset.filter;
      updateFilterTabs(currentFilter);
      renderProducts();
    });
  });

  // Category card "Shop Now" buttons
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      currentFilter = filter;
      updateFilterTabs(filter);
      renderProducts();
      const section = document.getElementById('products');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Sort select
  const sortSelect = document.getElementById('sort-select');
  sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    renderProducts();
  });
}

function updateFilterTabs(filter) {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    const isActive = tab.dataset.filter === filter;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive);
  });
}

/* ============================================================
   14. CONTACT FORM VALIDATION
   ============================================================ */

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (validateContactForm()) {
      // Simulate form submission
      const btn = document.getElementById('contact-submit-btn');
      btn.textContent = 'Sending…';
      btn.disabled = true;
      setTimeout(() => {
        form.reset();
        btn.textContent = 'Send Message 🚀';
        btn.disabled = false;
        showToast('Message sent! We\'ll be in touch soon.', '✅');
      }, 1500);
    }
  });

  // Real-time validation
  ['contact-name', 'contact-email', 'contact-subject', 'contact-message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validateField(el));
  });
}

function validateContactForm() {
  const name    = document.getElementById('contact-name');
  const email   = document.getElementById('contact-email');
  const subject = document.getElementById('contact-subject');
  const message = document.getElementById('contact-message');
  let valid = true;

  if (!validateField(name))    valid = false;
  if (!validateField(email))   valid = false;
  if (!validateField(subject)) valid = false;
  if (!validateField(message)) valid = false;

  return valid;
}

function validateField(field) {
  const errorId = 'err-' + field.id.replace('contact-', '');
  const errorEl = document.getElementById(errorId);
  let error = '';

  if (!field.value.trim()) {
    error = 'This field is required.';
  } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
    error = 'Please enter a valid email address.';
  } else if (field.id === 'contact-name' && field.value.trim().length < 2) {
    error = 'Name must be at least 2 characters.';
  } else if (field.id === 'contact-message' && field.value.trim().length < 10) {
    error = 'Message must be at least 10 characters.';
  }

  if (errorEl) errorEl.textContent = error;
  field.classList.toggle('error', !!error);
  return !error;
}

/* ============================================================
   15. NEWSLETTER FORM
   ============================================================ */

function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('newsletter-email');
    if (!input.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
      showToast('Please enter a valid email address.', '⚠');
      return;
    }
    input.value = '';
    showToast('You\'re subscribed! Welcome to LocalShoes.', '🎉');
  });
}

/* ============================================================
   16. SCROLL REVEAL
   ============================================================ */

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger children in the same parent
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   17. BACK TO TOP
   ============================================================ */

function updateBackToTop() {
  const btn = document.getElementById('back-to-top');
  btn.classList.toggle('visible', window.scrollY > 400);
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   18. CHECKOUT (Demo)
   ============================================================ */

function initCheckout() {
  const btn = document.getElementById('checkout-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    showToast('This is a demo store. No real checkout is available.', 'ℹ');
    closeCart();
  });
}

/* ============================================================
   19. KEYBOARD ACCESSIBILITY
   ============================================================ */

function initKeyboardNav() {
  // Close cart with Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeCart();
      closeSearch();
      closeMobileMenu();
    }
  });

  // Handle category card keyboard Enter/Space
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const btn = card.querySelector('.category-btn');
        if (btn) btn.click();
      }
    });
  });
}

/* ============================================================
   20. CART UI EVENTS
   ============================================================ */

function initCartEvents() {
  document.getElementById('cart-open-btn').addEventListener('click', openCart);
  document.getElementById('cart-close-btn').addEventListener('click', closeCart);
  document.getElementById('cart-overlay').addEventListener('click', closeCart);
}

/* ============================================================
   21. HERO CTA → SMOOTH SCROLL
   ============================================================ */

function initHeroCTAs() {
  ['hero-shop-men', 'hero-shop-women', 'hero-explore', 'offers-explore-btn'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', e => {
      const href = el.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ============================================================
   22. INIT – DOM READY
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Render products
  renderProducts();

  // Initialise cart from localStorage
  renderCart();
  updateCartCount();

  // Boot all features
  initNavbar();
  initMobileMenu();
  initSearch();
  initFilters();
  initContactForm();
  initNewsletter();
  initScrollReveal();
  initBackToTop();
  initCheckout();
  initCartEvents();
  initHeroCTAs();
  initKeyboardNav();

  // Reveal navbar as solid on initial load if already scrolled (e.g. page refresh)
  if (window.scrollY > 40) {
    document.getElementById('navbar').classList.add('scrolled');
  }

  console.log('%c👟 LocalShoes loaded successfully!', 'color:#FF6B35;font-size:14px;font-weight:bold;');
});
