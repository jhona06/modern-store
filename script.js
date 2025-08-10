// Data (realistic example products using Unsplash)
const PRODUCTS = [
  { id:1, title:"Classic Wristwatch", price:79.99, category:"Accessories", img:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=60", tag:"New" },
  { id:2, title:"Running Sneakers", price:59.99, category:"Shoes", img:"https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=900&q=60", tag:"Popular" },
  { id:3, title:"Wireless Headphones", price:99.99, category:"Electronics", img:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=60", tag:"On Sale" },
  { id:4, title:"Leather Backpack", price:89.99, category:"Bags", img:"https://images.unsplash.com/photo-1585386959984-a41552231693?w=900&q=60", tag:"" },
  { id:5, title:"Designer Sunglasses", price:49.99, category:"Accessories", img:"https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&q=60", tag:"" },
  { id:6, title:"Smart Camera", price:129.99, category:"Electronics", img:"https://images.unsplash.com/photo-1519183071298-a2962be54a32?w=900&q=60", tag:"Popular" },
  { id:7, title:"Bluetooth Speaker", price:39.99, category:"Electronics", img:"https://images.unsplash.com/photo-1518441902117-9a4b0b7a1b3b?w=900&q=60", tag:"" },
  { id:8, title:"Summer Hat", price:29.99, category:"Accessories", img:"https://images.unsplash.com/photo-1556228724-4d3b7d5a3b18?w=900&q=60", tag:"New" },
  { id:9, title:"True Wireless Earbuds", price:49.99, category:"Electronics", img:"https://images.unsplash.com/photo-1585386959984-a41552231693?w=900&q=60", tag:"" }
];

// state
const state = {
  products: PRODUCTS,
  q: '',
  category: 'All',
  page: 1,
  pageSize: 6,
  cart: {}
};

// DOM refs
const categoryList = document.getElementById('categoryList');
const productsGrid = document.getElementById('productsGrid');
const recRow = document.getElementById('recRow');
const heroSearch = document.getElementById('heroSearch');
const miniSearch = document.getElementById('miniSearch');
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const closeCart = document.getElementById('closeCart');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const sortSelect = document.getElementById('sortSelect');

document.getElementById('year').textContent = new Date().getFullYear();

// init
renderCategories();
renderProducts();
renderRecs();
attachEvents();
updateCartUI();

function uniqueCategories(){
  const cats = new Set(PRODUCTS.map(p=>p.category));
  return ['All', ...cats];
}

function renderCategories(){
  categoryList.innerHTML = uniqueCategories().map(c=>`<li data-cat="${c}" class="${c==='All'?'active':''}">${c}</li>`).join('');
}

function attachEvents(){
  // category click
  categoryList.addEventListener('click', e=>{
    const li = e.target.closest('li');
    if(!li) return;
    document.querySelectorAll('#categoryList li').forEach(el=>el.classList.remove('active'));
    li.classList.add('active');
    state.category = li.dataset.cat;
    state.page = 1;
    renderProducts();
  });

  // search
  [heroSearch, miniSearch].forEach(inp=>{
    inp.addEventListener('input', ()=>{
      state.q = heroSearch.value.trim().toLowerCase() || miniSearch.value.trim().toLowerCase();
      state.page = 1;
      renderProducts();
    });
  });

  // sort
  sortSelect.addEventListener('change', ()=>{ renderProducts(); });

  // pagination
  prevPage.addEventListener('click', ()=>{ if(state.page>1){ state.page--; renderProducts(); }});
  nextPage.addEventListener('click', ()=>{ const tot = Math.ceil(filtered().length/state.pageSize); if(state.page<tot){ state.page++; renderProducts(); }});

  // cart toggle
  cartBtn.addEventListener('click', ()=>toggleCart());
  closeCart.addEventListener('click', ()=>toggleCart(false));

  // checkout / clear
  document.getElementById('checkoutBtn').addEventListener('click', ()=> alert('Checkout demo — integrate a payment gateway to complete purchase.'));
  document.getElementById('clearCart').addEventListener('click', ()=>{ state.cart = {}; updateCartUI(); });

  // subscribe
  document.getElementById('subscribeBtn').addEventListener('click', ()=>{
    const email = document.getElementById('emailInput').value.trim();
    if(!email) return showToast('Enter an email');
    showToast('Thanks — subscribed!');
    document.getElementById('emailInput').value = '';
  });

  // modal close
  document.getElementById('closeModal').addEventListener('click', ()=>closeModal());
}

function filtered(){
  let list = PRODUCTS.slice();
  if(state.category && state.category!=='All'){
    list = list.filter(p=>p.category===state.category);
  }
  if(state.q){
    list = list.filter(p=>p.title.toLowerCase().includes(state.q));
  }

  // sort
  const s = sortSelect.value;
  if(s==='price-asc') list.sort((a,b)=>a.price-b.price);
  if(s==='price-desc') list.sort((a,b)=>b.price-a.price);

  return list;
}

function renderProducts(){
  const list = filtered();
  const totalPages = Math.max(1, Math.ceil(list.length/state.pageSize));
  if(state.page > totalPages) state.page = totalPages;
  const start = (state.page-1)*state.pageSize;
  const pageItems = list.slice(start,start+state.pageSize);

  pageInfo.textContent = `${state.page} / ${totalPages}`;
  document.getElementById('resultsInfo').textContent = `${list.length} products`;

  productsGrid.innerHTML = pageItems.map(p=>`
    <article class="product-card" data-id="${p.id}">
      <div class="product-media"><img src="${p.img}" alt="${escapeHtml(p.title)}"></div>
      <div class="tag">${p.tag||'Shop'}</div>
      <div class="product-title">${escapeHtml(p.title)}</div>
      <div class="product-meta"><div class="price">$${p.price.toFixed(2)}</div><div class="product-cat">${p.category}</div></div>
      <div class="product-actions">
        <button class="btn primary add-btn" data-id="${p.id}">Add to Cart</button>
        <button class="btn ghost view-btn" data-id="${p.id}">Quick View</button>
      </div>
    </article>
  `).join('') || `<div style="padding:16px;color:${'#6b7280'}">No products.</div>`;

  // attach events to new buttons
  document.querySelectorAll('.add-btn').forEach(b=>b.addEventListener('click', ()=> addToCart(Number(b.dataset.id))));
  document.querySelectorAll('.view-btn').forEach(b=>b.addEventListener('click', ()=> showModal(Number(b.dataset.id))));
}

function renderRecs(){
  const recs = PRODUCTS.slice(0,5);
  recRow.innerHTML = recs.map(p=>`
    <div class="rec-card">
      <img src="${p.img}" alt="${escapeHtml(p.title)}">
      <div style="margin-top:8px;font-weight:600">${escapeHtml(p.title)}</div>
      <div style="color:var(--muted)">$${p.price.toFixed(2)}</div>
    </div>
  `).join('');
}

// CART
function addToCart(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  if(state.cart[id]) state.cart[id].qty++;
  else state.cart[id] = {...p, qty:1};
  updateCartUI();
  showToast(`${p.title} added`);
}

function updateCartUI(){
  const items = Object.values(state.cart);
  const qty = items.reduce((s,i)=>s+i.qty,0);
  const total = items.reduce((s,i)=>s+i.qty*i.price,0);
  cartCount.textContent = qty;
  cartTotal.textContent = total.toFixed(2);

  if(items.length===0){
    cartItems.innerHTML = '<div style="color:var(--muted);padding:12px">No items yet.</div>'; return;
  }
  cartItems.innerHTML = items.map(it=>`
    <div class="cart-item">
      <img src="${it.img}" alt="${escapeHtml(it.title)}">
      <div style="flex:1">
        <div style="font-weight:600">${escapeHtml(it.title)}</div>
        <div style="color:var(--muted);font-size:0.9rem">$${it.price.toFixed(2)} • Qty: ${it.qty}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="icon-btn cart-op" data-op="inc" data-id="${it.id}">+</button>
        <button class="icon-btn cart-op" data-op="dec" data-id="${it.id}">−</button>
      </div>
    </div>
  `).join('');

  // attach inc/dec
  cartItems.querySelectorAll('.cart-op').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = Number(btn.dataset.id); const op = btn.dataset.op;
      if(op==='inc') state.cart[id].qty++;
      else { state.cart[id].qty--; if(state.cart[id].qty<=0) delete state.cart[id]; }
      updateCartUI();
    });
  });
}

function toggleCart(force){
  if(typeof force === 'boolean') {
    cartDrawer.classList.toggle('open', force);
  } else cartDrawer.classList.toggle('open');
}

// MODAL
function showModal(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  document.getElementById('modalContent').innerHTML = `
    <div style="display:flex;gap:18px;align-items:flex-start">
      <div style="flex:1"><img style="width:100%;border-radius:8px" src="${p.img}" alt="${escapeHtml(p.title)}"></div>
      <div style="flex:1">
        <h3>${escapeHtml(p.title)}</h3>
        <div style="color:var(--muted);margin-bottom:12px">$${p.price.toFixed(2)}</div>
        <p style="margin-bottom:12px">Beautifully crafted item. High quality finish and excellent value. Perfect for gifting or everyday use.</p>
        <div style="display:flex;gap:8px">
          <button class="btn primary" id="modalAdd">Add to Cart</button>
          <button class="btn ghost" id="modalClose">Close</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('productModal').classList.add('open');
  document.getElementById('productModal').setAttribute('aria-hidden','false');
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalAdd').addEventListener('click', ()=> { addToCart(id); closeModal(); });
}
function closeModal(){
  document.getElementById('productModal').classList.remove('open');
  document.getElementById('productModal').setAttribute('aria-hidden','true');
}

// small toast
function showToast(msg){
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style,{position:'fixed',left:'50%',transform:'translateX(-50%)',bottom:'28px',background:'#111',color:'#fff',padding:'10px 14px',borderRadius:'999px',zIndex:999});
  document.body.appendChild(t);
  setTimeout(()=> t.style.opacity='0',1400);
  setTimeout(()=> t.remove(),1900);
}

// escape
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
