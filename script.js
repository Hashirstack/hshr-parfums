// --------- PAGE TRANSITION FADE (GSAP) ---------
function fadeInPage() {
    const overlay = document.getElementById("page-transition-overlay");
    if (overlay && typeof gsap !== "undefined") {
        gsap.killTweensOf(overlay);
        gsap.set(overlay, { opacity: 1, display: "block" });
        gsap.to(overlay, { opacity: 0, duration: 0.4, ease: "power1.out", delay: 1, onComplete: () => {
            overlay.style.display = "none";
        }});
    }
}

window.addEventListener("DOMContentLoaded", fadeInPage);
window.addEventListener("pageshow", (e) => {
    if (e.persisted) fadeInPage();
});

function navigateWithFade(url) {
    const overlay = document.getElementById("page-transition-overlay");
    if (overlay && typeof gsap !== "undefined") {
        overlay.style.display = "block";
        gsap.fromTo(overlay, { opacity: 0 }, {
            opacity: 1,
            duration: 0.3,
            ease: "power1.in",
            onComplete: () => { window.location.href = url; }
        });
    } else {
        window.location.href = url;
    }
}
function handleNavClick(e, url) {
    e.preventDefault();
    navigateWithFade(url);
    return false;
}
// --------- SUPABASE INIT ---------
const supabaseClient = supabase.createClient(
    'https://ssathbullxtesytuwvdn.supabase.co',
    'sb_publishable_0vMiq-5ct87hvHOGyGLZeg_wBfwRQ76'
);

let allProducts = [];

// --------- FETCH & RENDER PRODUCTS ---------
async function loadProducts() {
    const { data, error } = await supabaseClient.from('products').select('*');
    if (error) { console.error(error); return; }
    allProducts = data;

    if (document.getElementById('looks-name')) updateLooksProduct(currentLooksGender);

    const mensList = document.getElementById('mens-list');
    const womensList = document.getElementById('womens-list');
    const allList = document.getElementById('all-list');

    if (mensList) renderCards(data.filter(p => p.gender === 'men'), mensList);
    if (mensList) initSortAndCount('men', mensList);
    if (womensList) renderCards(data.filter(p => p.gender === 'women'), womensList);
    if (womensList) initSortAndCount('women', womensList);
    if (allList) renderCards(data, allList);
    if (allList) initSortAndCount('all', allList);
    const twinsList = document.getElementById('twins-list');
if (twinsList) {
    const twinIds = ['335e2677-e222-44ed-a441-bed1c03a2731', '5a51d5a2-e1ed-4a7e-995d-05cdf65c2b8f'];
    const twinsData = allProducts.filter(p => twinIds.includes(p.id));
    renderCards(twinsData, twinsList);

    const countEl = document.getElementById('products-count');
    if (countEl) countEl.textContent = `${twinsData.length} PRODUCTS`;

    const sortToggle = document.getElementById('sort-toggle');
    const sortMenu = document.getElementById('sort-menu');
    if (sortToggle && sortMenu && !sortToggle.dataset.bound) {
        sortToggle.dataset.bound = "true";
        sortToggle.addEventListener('click', () => {
            sortMenu.classList.toggle('active');
            sortToggle.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!sortMenu.contains(e.target) && !sortToggle.contains(e.target)) {
                sortMenu.classList.remove('active');
                sortToggle.classList.remove('active');
            }
        });
        sortMenu.querySelectorAll('.sort-option').forEach(opt => {
            opt.addEventListener('click', () => {
                sortMenu.querySelectorAll('.sort-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                const sorted = applySort(twinsData, opt.dataset.sort);
                renderCards(sorted, twinsList);
                sortMenu.classList.remove('active');
            });
        });

        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                viewButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                twinsList.style.opacity = '0';
                setTimeout(() => {
                    twinsList.classList.remove('view-grid-small', 'view-list');
                    if (btn.dataset.view === 'grid-small') twinsList.classList.add('view-grid-small');
                    if (btn.dataset.view === 'list') twinsList.classList.add('view-list');
                    twinsList.style.opacity = '1';
                }, 200);
            });
        });
    }
}}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function getRatingData(product) {
    const h = hashCode(String(product.id || product.name));
    const rating = 78 + (h % 19);      // ~78%-96% fill
    const reviews = 42 + (h % 280);    // 42-321 reviews
    return { rating, reviews };
}
const CART_LIMIT = 5;

function getCartTotalQty(cart) {
    return cart.reduce((sum, item) => sum + (item.qty || 1), 0);
}
const sizeAdjust = {
    'Cedar Eclipse': 0.72,
    'Monarch': 0.75,
    'Onyx Stride': 0.75,
    'Lumière d\'Ange': 0.72,
    '0 Degree': 0.85,
    'Lecaro': 0.85,
    'Zero Hour': 0.8,
    'Rugged Noir': 0.8,
    'Xenon': 0.8
};

function renderCards(products, container) {
    container.innerHTML = '';
    products.forEach((p, index) => {
        const card = document.createElement('a');
        card.href = `Product.html?id=${p.id}`;
        card.className = 'perfume-card fade-in';
        card.style.transitionDelay = `${index * 0.06}s`;

        const { rating, reviews } = getRatingData(p);
        const scale = sizeAdjust[p.name] || 1;

        card.innerHTML = `
            <div class="perfume-img-box">
                <img src="${p.image_url}" alt="${p.name}" class="perfume-img angle-1" style="transform: scale(${scale});">
                <img src="${p.image_url_2 || p.image_url}" alt="${p.name}" class="perfume-img angle-2" style="transform: translate(-50%, -50%) scale(${scale});">
            </div>
            <h3>${p.name}</h3>
            <p class="price">PKR ${p.price.toLocaleString()}</p>
            <div class="looks-rating-row">
                <div class="looks-rating" style="--rating: ${rating}%;"></div>
                <span class="looks-review-count">${reviews} Reviews</span>
            </div>
        `;
        container.appendChild(card);
    });

    container.querySelectorAll('.perfume-card').forEach(card => {
    card.addEventListener('click', (e) => {
        e.preventDefault();
        navigateWithFade(card.href);
    });
});

container.querySelectorAll('.perfume-card').forEach(card => {
    card.addEventListener('dblclick', () => {}); // placeholder, real add-to-cart lives on Product page
});
    container.querySelectorAll('.perfume-card').forEach(card => {
        card.addEventListener('dblclick', () => {}); // placeholder, real add-to-cart lives on Product page
    });

    initFadeIn();
}

// --------- PRODUCTS COUNT + SORT (Men/Women dedicated pages) ---------
function applySort(products, sortType) {
    const list = [...products];
    switch (sortType) {
        case 'az': return list.sort((a, b) => a.name.localeCompare(b.name));
        case 'za': return list.sort((a, b) => b.name.localeCompare(a.name));
        case 'price-low': return list.sort((a, b) => a.price - b.price);
        case 'price-high': return list.sort((a, b) => b.price - a.price);
        case 'date-old': return list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        case 'date-new': return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        default: return list; // 'featured' / 'relevant' = original order
    }
}

function initSortAndCount(gender, listEl) {
    const countEl = document.getElementById('products-count');
    const sortToggle = document.getElementById('sort-toggle');
    const sortMenu = document.getElementById('sort-menu');

    if (countEl) {
        const count = gender === 'all' ? allProducts.length : allProducts.filter(p => p.gender === gender).length;
        countEl.textContent = `${count} PRODUCT${count === 1 ? '' : 'S'}`;
    }

    if (sortToggle && sortMenu && !sortToggle.dataset.bound) {
        sortToggle.dataset.bound = "true";
                sortToggle.addEventListener('click', () => {
                sortMenu.classList.toggle('active');
                sortToggle.classList.toggle('active');
            });
      document.addEventListener('click', (e) => {
    if (!sortMenu.contains(e.target) && !sortToggle.contains(e.target)) {
        sortMenu.classList.remove('active');
        sortToggle.classList.remove('active');
    }
});
        sortMenu.querySelectorAll('.sort-option').forEach(opt => {
            opt.addEventListener('click', () => {
                sortMenu.querySelectorAll('.sort-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                const productsToSort = gender === 'all' ? allProducts : allProducts.filter(p => p.gender === gender);
                const sorted = applySort(productsToSort, opt.dataset.sort);
                renderCards(sorted, listEl);
                sortMenu.classList.remove('active');
            });
        });
    }
        const viewButtons = document.querySelectorAll('.view-btn');
    if (viewButtons.length && !viewButtons[0].dataset.bound) {
        viewButtons.forEach(btn => {
            btn.dataset.bound = "true";
                    btn.addEventListener('click', () => {
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            listEl.style.opacity = '0';
            setTimeout(() => {
                listEl.classList.remove('view-grid-small', 'view-list');
                if (btn.dataset.view === 'grid-small') listEl.classList.add('view-grid-small');
                if (btn.dataset.view === 'list') listEl.classList.add('view-list');
                listEl.style.opacity = '1';
            }, 200);
        });
        });
    }
}

if (document.getElementById('mens-list') || document.getElementById('all-list') || document.getElementById('search-input')) {
    loadProducts();
}

// --------- PRODUCT DETAIL PAGE ---------
const productImg = document.getElementById("product-img");
const productName = document.getElementById("product-name");
const productPrice = document.getElementById("product-price");
const productDesc = document.getElementById("product-desc");
const addCartBtn = document.getElementById("add-cart-btn");
const buyNowBtn = document.getElementById("buy-now-btn");

let currentProduct = null;

if (productName) {
    (async () => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        const { data: product, error } = await supabaseClient.from('products').select('*').eq('id', id).single();
        if (error || !product) return;

        const angle1 = product.image_url;
        const angle2 = product.image_url_2 || product.image_url;

        productImg.src = angle1;
        productImg.style.opacity = "0";
        productImg.onload = () => {
        gsap.to(productImg, { opacity: 1, duration: 0.5, ease: "power1.out" });
        };
        productName.textContent = product.name;
        productPrice.textContent = "PKR " + product.price.toLocaleString();
        currentProduct = product;

        // Rating & reviews (same deterministic generator as card grid)
        const { rating, reviews } = getRatingData(product);
        const ratingEl = document.getElementById("product-rating");
        const reviewCountEl = document.getElementById("product-review-count");
        if (ratingEl) ratingEl.style.setProperty('--rating', rating + '%');
        if (reviewCountEl) reviewCountEl.textContent = reviews + " Reviews";

        // Thumbnails: click to swap hero image
// Thumbnails: click to swap hero image smoothly
        const thumb1 = document.getElementById("thumb-1");
        const thumb2 = document.getElementById("thumb-2");

        if (thumb1 && thumb2) {
            thumb1.src = angle1;
            thumb2.src = angle2;

            function switchAngle(newSrc, slideOutX, slideInX) {
                // 1. Exit fast (0.08s)
                productImg.style.transition = "transform 0.08s ease-in";
                productImg.style.transform = `translateX(${slideOutX}px)`;

                productImg.addEventListener("transitionend", function handler() {
                    productImg.removeEventListener("transitionend", handler);

                    productImg.src = newSrc;
                    productImg.style.transition = "none";
                    productImg.style.transform = `translateX(${slideInX}px)`;

                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            // 2. Extended entry time (0.45s) with heavy deceleration at the end
                            productImg.style.transition = "transform 0.45s cubic-bezier(0, 0.7, 0.1, 1)";
                            productImg.style.transform = "translateX(0)";
                        });
                    });
                }, { once: true });
            }

            thumb1.addEventListener("click", () => {
                switchAngle(angle1, 150, -150);
                thumb1.classList.add("active");
                thumb2.classList.remove("active");
            });

            thumb2.addEventListener("click", () => {
                switchAngle(angle2, -150, 150);
                thumb2.classList.add("active");
                thumb1.classList.remove("active");
            });
        }

        // Split description into main paragraph + Top/Middle/Base notes
        const fullDesc = product.description || "";
        const noteLabels = ["Top Notes:", "Middle Notes:", "Base Notes:"];
        let mainText = fullDesc;
        let notesHtml = "";
        const firstNoteIndex = fullDesc.indexOf("Top Notes:");
        if (firstNoteIndex !== -1) {
            mainText = fullDesc.slice(0, firstNoteIndex).trim();
            const notesSection = fullDesc.slice(firstNoteIndex);

            // Grab each note segment up to the next label (or end)
            const segments = [];
            noteLabels.forEach((label, i) => {
                const start = notesSection.indexOf(label);
                if (start === -1) return;
                const nextLabel = noteLabels[i + 1];
                const end = nextLabel ? notesSection.indexOf(nextLabel) : notesSection.length;
                segments.push({ label: label.replace(":", ""), text: notesSection.slice(start + label.length, end === -1 ? undefined : end).trim() });
            });

            // Anything after the last note label that isn't part of the notes themselves (closing line)
            const lastLabel = noteLabels[noteLabels.length - 1];
            const lastStart = notesSection.indexOf(lastLabel);
            let closingLine = "";
            if (lastStart !== -1) {
                const afterLast = notesSection.slice(lastStart + lastLabel.length);
                // Base notes text ends at first ". " followed by capital letter starting a new sentence beyond the note list
                const sentenceMatch = afterLast.match(/^(.*?\.)\s(.*)$/);
                if (sentenceMatch) {
                    segments[segments.length - 1].text = sentenceMatch[1].trim();
                    closingLine = sentenceMatch[2].trim();
                }
            }

            notesHtml = segments.map(s => `<p><strong>${s.label}:</strong> ${s.text}</p>`).join("");
            if (closingLine) notesHtml += `<p>${closingLine}</p>`;
        }

        productDesc.textContent = mainText;
        const notesContainer = document.getElementById("product-notes");
        if (notesContainer) notesContainer.innerHTML = notesHtml;

                addCartBtn.addEventListener("click", () => {
            let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
            const limitMsg = document.getElementById("product-limit-msg");

            if (getCartTotalQty(cart) >= CART_LIMIT) {
                if (limitMsg) limitMsg.classList.add("active");
                return;
            }
            if (limitMsg) limitMsg.classList.remove("active");

            const existingIndex = cart.findIndex(item => item.id === product.id);
            if (existingIndex !== -1) {
                cart[existingIndex].qty += 1;
            } else {
                cart.push({ id: product.id, name: product.name, price: product.price, img: product.image_url, qty: 1 });
            }
            localStorage.setItem("cartItems", JSON.stringify(cart));
            loadCart();
            openCart();
        });

        buyNowBtn.addEventListener("click", () => {
            localStorage.setItem("buyNowProduct", JSON.stringify({
                id: product.id, name: product.name, price: product.price, img: product.image_url, qty: 1
            }));
            navigateWithFade("Checkout.html");
        });
    })();
}

// --------- CHECKOUT PAGE ---------
const checkoutItemsContainer = document.querySelector(".order-summary");
const checkoutSubtotal = document.getElementById("checkout-subtotal");
const checkoutTotal = document.getElementById("checkout-total");
const checkoutForm = document.getElementById("checkout-form");



async function initCheckoutContactState() {
    const guestContact = document.getElementById("guest-contact");
    const loggedInContact = document.getElementById("logged-in-contact");
    const contactHeading = document.getElementById("contact-heading");
    if (!guestContact || !loggedInContact) return;

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (user) {
        guestContact.style.display = "none";
        loggedInContact.style.display = "flex";
        if (contactHeading) contactHeading.style.display = "none";

        const email = user.email || "";
        const name = user.user_metadata?.full_name || email;
        const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

        document.getElementById("checkout-avatar").textContent = initials;
        document.getElementById("checkout-user-email").textContent = email;

        const dotsBtn = document.getElementById("checkout-account-dots");
        const dropdown = document.getElementById("checkout-account-dropdown");
        dotsBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("active");
        });
        document.addEventListener("click", (e) => {
            if (!dropdown.contains(e.target) && !dotsBtn.contains(e.target)) {
                dropdown.classList.remove("active");
            }
        });

        document.getElementById("checkout-signout-btn").addEventListener("click", async () => {
            await supabaseClient.auth.signOut();
            location.reload();
        });
    } else {
        guestContact.style.display = "block";
        loggedInContact.style.display = "none";
        if (contactHeading) contactHeading.style.display = "block";
    }
}
initCheckoutContactState();

if (checkoutForm) {
    let checkoutCart = [];

   function loadCheckoutCart() {
    let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const buyNowProduct = JSON.parse(localStorage.getItem("buyNowProduct"));

    if (buyNowProduct) {
        cart = [buyNowProduct];
        localStorage.removeItem("buyNowProduct");
    }
    checkoutCart = cart;

    const firstItem = checkoutItemsContainer.querySelector(".order-item");
    checkoutItemsContainer.querySelectorAll(".order-item.extra-item").forEach(el => el.remove());
    const emptyMsg = checkoutItemsContainer.querySelector(".empty-msg");
    if (emptyMsg) emptyMsg.remove();

    if (cart.length === 0) {
        firstItem.style.display = "none";
        const msg = document.createElement("p");
        msg.textContent = "Nothing to show";
        msg.classList.add("empty-msg");
        msg.style.textAlign = "center";
        checkoutItemsContainer.insertBefore(msg, checkoutItemsContainer.querySelector(".summary-separator"));
        checkoutSubtotal.textContent = "PKR 0";
        checkoutTotal.querySelector("b").textContent = "0";
        return;
    }

    firstItem.style.display = "flex";
    let subtotal = 0;

    cart.forEach((product, index) => {
        const qty = product.qty || 1;
        const itemSubtotal = product.price * qty;
        subtotal += itemSubtotal;

        let itemEl = firstItem;
        if (index > 0) {
            itemEl = firstItem.cloneNode(true);
            itemEl.classList.add("extra-item");
            itemEl.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));
            checkoutItemsContainer.insertBefore(itemEl, checkoutItemsContainer.querySelector(".summary-separator"));
        }

        itemEl.querySelector(".order-item-img").src = product.img;
        itemEl.querySelector(".order-item-img").alt = product.name;
        itemEl.querySelector(".qty-badge").textContent = qty;
        itemEl.querySelector(".order-item-name").textContent = product.name;
        itemEl.querySelector(".order-item-price-right").textContent = "PKR " + itemSubtotal.toLocaleString();
    });

    checkoutSubtotal.textContent = "PKR " + subtotal.toLocaleString();
    checkoutTotal.querySelector("b").textContent = (subtotal + 100).toLocaleString();
}

    loadCheckoutCart();
function validateCheckoutForm(formData, cart) {
    const errorEl = document.getElementById("checkout-error-msg");
    errorEl.classList.remove("active");

    function showError(msg) {
        errorEl.textContent = msg;
        errorEl.classList.add("active");
        errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (!cart || cart.length === 0) {
        showError("Your cart is empty. Please add a product before completing your order.");
        return false;
    }

    const firstName = formData.get("firstName")?.trim();
    const lastName = formData.get("lastName")?.trim();
    const address = formData.get("address")?.trim();
    const city = formData.get("city")?.trim();
    const phone = formData.get("phone")?.trim();

    if (!firstName || !lastName || !address || !city || !phone) {
        showError("Please fill in all required fields.");
        return false;
    }

    if (address.length < 8 || !/[A-Za-z]/.test(address)) {
    showError("Please enter a complete, valid address.");
    return false;
    }

    const cityRegex = /^[A-Za-z\s]{3,}$/;
    if (!cityRegex.test(city)) {
        showError("Please enter a valid city name (letters only, at least 3 characters).");
        return false;
    }

    const postalCode = formData.get("postalCode")?.trim();
    if (postalCode && !/^\d+$/.test(postalCode)) {
        showError("Postal code must contain numbers only.");
        return false;
    }

    const phoneDigitsOnly = phone.replace(/[\s\-]/g, "");
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(phoneDigitsOnly)) {
        showError("Please enter a valid 11-digit phone number.");
        return false;
    }

    return true;
}
    checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { data: { user } } = await supabaseClient.auth.getUser();
    const guestEmailInput = document.getElementById("checkout-email-input");

    const orderEmail = user ? user.email : (guestEmailInput ? guestEmailInput.value.trim() : "");

const checkoutErrorEl = document.getElementById("checkout-error-msg");
checkoutErrorEl.classList.remove("active");

if (!orderEmail) {
    checkoutErrorEl.textContent = "Please enter your email before placing an order.";
    checkoutErrorEl.classList.add("active");
    checkoutErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
}

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
if (!emailRegex.test(orderEmail)) {
    checkoutErrorEl.textContent = "Please enter a valid email address (e.g. name@gmail.com).";
    checkoutErrorEl.classList.add("active");
    checkoutErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
}
        const formData = new FormData(checkoutForm);

        if (!validateCheckoutForm(formData, checkoutCart)) {
            return;
        }

        const subtotal = checkoutCart.reduce((sum, p) => sum + p.price * (p.qty || 1), 0);
        const total = subtotal + 99.00;

            const { data: order, error: orderError } = await supabaseClient.from('orders').insert({
            user_id: user ? user.id : null,
            email: orderEmail,
            first_name: formData.get('firstName'),
            last_name: formData.get('lastName'),
            address: formData.get('address'),
            apartment: formData.get('apartment'),
            city: formData.get('city'),
            postal_code: formData.get('postalCode'),
            phone: formData.get('phone'),
            payment_method: formData.get('payment'),
            subtotal: subtotal,
            shipping_fee: 99.00,
            total: total
        }).select().single();

        if (orderError) { console.error(orderError); alert("Something went wrong placing your order."); return; }

        const orderItems = checkoutCart.map(p => ({
            order_id: order.id,
            product_id: p.id,
            product_name: p.name,
            price: p.price,
            quantity: p.qty || 1
        }));
        await supabaseClient.from('order_items').insert(orderItems);

        //EMAIL CONFIRMATION 
        try {
        await supabaseClient.functions.invoke('send-order-email', {
            body: {
                email: orderEmail,
                firstName: formData.get('firstName'),
                orderId: order.id,
                items: checkoutCart.map(p => ({ name: p.name, qty: p.qty || 1, price: p.price })),
                total: total
            }
        });
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
        }
        localStorage.removeItem("cartItems");
        checkoutForm.reset();

        document.getElementById("success-order-id").textContent = order.id.slice(0, 8).toUpperCase();
        document.getElementById("order-success-modal").classList.add("active");

document.getElementById("continue-shopping-btn").addEventListener("click", () => {
    navigateWithFade("Perfume.html");
});
    });
}

// --------- CART SIDEBAR ---------
const cartSidebar = document.getElementById("cart-sidebar");
const closeCartBtn = document.getElementById("close-cart");
const cartItemsContainer = document.getElementById("cart-items");
const cartIcon = document.getElementById("open-cart");
const checkoutBtn = document.getElementById("cart-checkout-btn");

function openCart() { if (cartSidebar) cartSidebar.classList.add("active"); }
if (cartIcon) cartIcon.addEventListener("click", e => { e.preventDefault(); openCart(); });
if (closeCartBtn) closeCartBtn.addEventListener("click", () => cartSidebar.classList.remove("active"));

if (checkoutBtn) {
    checkoutBtn.style.display = "none";
    checkoutBtn.addEventListener("click", () => { navigateWithFade("Checkout.html"); });
}

function loadCart() {
    if (!cartItemsContainer) return;
    const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    cartItemsContainer.innerHTML = "";
}
    function loadCart() {
    if (!cartItemsContainer) return;
    document.getElementById("cart-limit-msg")?.classList.remove("active");
    document.getElementById("product-limit-msg")?.classList.remove("active");
    const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    cartItemsContainer.innerHTML = "";

    const cartDot = document.getElementById("cart-dot");
    if (cartDot) {
        const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
        cartDot.style.display = totalQty > 0 ? "block" : "none";
    }

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart" style="text-align:center;">Your cart is empty</p>';
        if (checkoutBtn) checkoutBtn.style.display = "none";
        return;
    }
    if (checkoutBtn) checkoutBtn.style.display = "block";
    // ...rest of function stays exactly the same

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart" style="text-align:center;">Your cart is empty</p>';
        if (checkoutBtn) checkoutBtn.style.display = "none";
        return;
    }
    if (checkoutBtn) checkoutBtn.style.display = "block";

    cart.forEach((item, index) => {
        if (!item.qty) item.qty = 1;
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="cart-item-details">
                <p>${item.name}</p>
                <p>Price: PKR ${item.price}</p>
                <div class="cart-quantity-control">
                    <button class="cart-decrement" data-index="${index}">-</button>
                    <span class="cart-quantity">${item.qty}</span>
                    <button class="cart-increment" data-index="${index}">+</button>
                </div>
            </div>
            <button class="remove-item" data-index="${index}">Remove</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

cartItemsContainer.querySelectorAll(".cart-increment").forEach(btn => {
    btn.addEventListener("click", e => {
        let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
        const limitMsg = document.getElementById("cart-limit-msg");

        if (getCartTotalQty(cart) >= CART_LIMIT) {
            if (limitMsg) limitMsg.classList.add("active");
            return;
        }
        if (limitMsg) limitMsg.classList.remove("active");

        cart[e.target.dataset.index].qty += 1;
        localStorage.setItem("cartItems", JSON.stringify(cart));
        loadCart();
    });
});
    cartItemsContainer.querySelectorAll(".cart-decrement").forEach(btn => {
        btn.addEventListener("click", e => {
            let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
            if (cart[e.target.dataset.index].qty > 1) cart[e.target.dataset.index].qty -= 1;
            localStorage.setItem("cartItems", JSON.stringify(cart));
            loadCart();
        });
    });
    cartItemsContainer.querySelectorAll(".remove-item").forEach(btn => {
        btn.addEventListener("click", e => {
            let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
            cart.splice(e.target.dataset.index, 1);
            localStorage.setItem("cartItems", JSON.stringify(cart));
            loadCart();
        });
    });
}
loadCart();

// --------- CLICK OUTSIDE TO CLOSE CART ---------
document.addEventListener('click', function(e) {
    const cart = document.getElementById('cart-sidebar');
    const toggle = document.getElementById('open-cart');
    const addBtn = document.getElementById('add-cart-btn');
    const path = e.composedPath();

    if (cart && cart.classList.contains('active')) {
        const clickedInsideCart = path.includes(cart);
        const clickedToggle = toggle && path.includes(toggle);
        const clickedAddCart = addBtn && path.includes(addBtn);

        if (!clickedInsideCart && !clickedToggle && !clickedAddCart) {
            cart.classList.remove('active');
        }
    }
});

// --------- CLICK OUTSIDE TO CLOSE LOGOUT DROPDOWN ---------
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('logout-dropdown');
    if (dropdown && dropdown.classList.contains('active')) {
        if (!dropdown.parentElement.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    }
});
const hamburgerBtn = document.getElementById("hamburger-btn");
const mobileNavMenu = document.getElementById("mobile-nav-menu");
const mobileNavOverlay = document.getElementById("mobile-nav-overlay");

function toggleMobileMenu() {
    hamburgerBtn.classList.toggle("active");
    mobileNavMenu.classList.toggle("active");
    mobileNavOverlay.classList.toggle("active");
}

hamburgerBtn?.addEventListener("click", toggleMobileMenu);
mobileNavOverlay?.addEventListener("click", toggleMobileMenu);
document.getElementById("mobile-nav-close")?.addEventListener("click", toggleMobileMenu);
// --------- SEARCH ---------
const siteSections = {
    home: "header", men: "mens-perfumes", women: "womens-perfumes",
    "all products": "all-products", contact: "contact"
};

const searchIcon = document.getElementById("search-icon");
const searchOverlay = document.getElementById("search-overlay");
const closeSearch = document.getElementById("close-search");
const searchInput = document.getElementById("search-input");
const suggestionsBox = document.getElementById("search-suggestions");
const navBar = document.querySelector("nav");

function closeSearchBar() {
    if (searchOverlay) {
        searchOverlay.classList.remove("active");
        navBar.classList.remove("nav-active");
        navBar.classList.remove("nav-search-open");
        searchInput.value = "";
        suggestionsBox.innerHTML = "";
    }
}

    if (searchIcon) searchIcon.addEventListener("click", (e) => {
    e.preventDefault();
    navBar.classList.add("nav-active");
    navBar.classList.add("nav-search-open");
    // nav-top height animates over 0.3s; wait for it to settle before
    // measuring, otherwise we capture a mid-transition (too tall) value.
    setTimeout(() => {
        const navBottom = navBar.getBoundingClientRect().bottom;
        searchOverlay.style.setProperty("--nav-h", navBottom + "px");
        searchOverlay.classList.add("active");
        searchInput.focus();
    }, 300);
});

if (closeSearch) closeSearch.addEventListener("click", closeSearchBar);
window.addEventListener('scroll', () => { if (searchOverlay?.classList.contains("active")) closeSearchBar(); });

// Give the nav a solid ivory background once the user scrolls past the dark hero,
// so its text/icons (white by default over the hero photo) stay readable over
// the light sections underneath.
if (navBar) {
    const heroEl = document.getElementById("header");
    const scrollThreshold = () => (heroEl ? heroEl.offsetHeight - 80 : 400);
window.addEventListener('scroll', () => {
    if (window.scrollY > scrollThreshold()) {
        navBar.classList.add("nav-active");
        navBar.classList.add("nav-scrolled");
    } else if (!searchOverlay?.classList.contains("active")) {
        navBar.classList.remove("nav-active");
        navBar.classList.remove("nav-scrolled");
    }
});
}
document.addEventListener('click', (e) => {
    if (searchOverlay?.classList.contains("active")) {
        const isClickInside = searchOverlay.contains(e.target) || searchIcon.contains(e.target);
        if (!isClickInside) closeSearchBar();
    }
});

if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        suggestionsBox.innerHTML = "";
        if (query.length === 0) return;

        const productMatches = allProducts.filter(p => p.name.toLowerCase().includes(query));
        const sectionMatches = Object.keys(siteSections).filter(key => key.includes(query));

        productMatches.forEach(p => {
            const div = document.createElement("div");
            div.classList.add("suggestion-item");
            div.innerHTML = `
                <div style="display:flex; align-items:center; gap:15px;">
                    <img src="${p.image_url}" style="width:35px; height:35px; object-fit:cover; border-radius:4px;">
                    <div><span style="display:block; font-weight:500;">${p.name}</span><small style="color:#888;">Product</small></div>
                </div>`;
div.addEventListener("click", () => {
    navigateWithFade(`Product.html?id=${p.id}`);
});
            suggestionsBox.appendChild(div);
        });

        sectionMatches.forEach(key => {
            const div = document.createElement("div");
            div.classList.add("suggestion-item");
            div.innerHTML = `<div style="display:flex; align-items:center; gap:15px;">
                <div style="width:35px; height:35px; display:flex; align-items:center; justify-content:center; background:#eee; border-radius:4px;">
                    <i class="fa-solid fa-arrow-down" style="font-size:12px; color:#555;"></i></div>
                <span style="font-weight:500; text-transform:capitalize;">${key}</span></div>`;
            div.addEventListener("click", () => {
                document.getElementById(siteSections[key]).scrollIntoView({ behavior: 'smooth' });
                closeSearchBar();
            });
            suggestionsBox.appendChild(div);
        });

        if (productMatches.length === 0 && sectionMatches.length === 0) {
            const noResult = document.createElement("div");
            noResult.style.cssText = "padding:20px; text-align:center; color:#888;";
            noResult.textContent = "No matches found...";
            suggestionsBox.appendChild(noResult);
        }
    });
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") suggestionsBox.querySelector(".suggestion-item")?.click();
    });
}

// --------- REAL AUTH (SUPABASE) ---------
const userIcon = document.getElementById("user-icon");
const authModal = document.getElementById("user-modal");
const closeAuth = document.getElementById("close-auth");
const loginBox = document.getElementById("login-box");
const signupBox = document.getElementById("signup-box");
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");

// Only opens the login/signup modal when NOT logged in (avatar click is handled separately in updateAuthUI)
if (userIcon) userIcon.addEventListener("click", (e) => {
    e.preventDefault();
    if (!userIcon.querySelector('.user-avatar-wrapper')) {
        authModal.style.display = "flex";
    }
});

const closeModal = () => {
    authModal.style.display = "none";
    loginForm.reset();
    signupForm.reset();
    document.getElementById("login-error-msg")?.classList.remove("active");
    document.getElementById("signup-error-msg")?.classList.remove("active");
    document.getElementById('password-strength').style.width = "0%";
};
if (closeAuth) closeAuth.addEventListener("click", closeModal);
window.addEventListener("click", (e) => { if (e.target === authModal) closeModal(); });

document.getElementById("to-signup")?.addEventListener("click", () => {
    loginBox.style.display = "none"; signupBox.style.display = "block";
});
document.getElementById("to-login")?.addEventListener("click", () => {
    signupBox.style.display = "none"; loginBox.style.display = "block";
});

const signupPass = document.getElementById("signup-pass");
const strengthMeter = document.getElementById("password-strength");
signupPass?.addEventListener("input", () => {
    const val = signupPass.value;
    let strength = 0;
    if (val.length >= 8) strength += 40;
    if (/[A-Z]/.test(val)) strength += 30;
    if (/[0-9]/.test(val)) strength += 30;
    strengthMeter.style.width = strength + "%";
    strengthMeter.style.backgroundColor = strength < 40 ? "#ff004f" : strength < 80 ? "#f1c40f" : "#2ecc71";
});

document.querySelectorAll(".toggle-password").forEach(icon => {
    icon.addEventListener("click", () => {
        const targetId = icon.dataset.target;
        const input = document.getElementById(targetId);
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        icon.innerHTML = isPassword
            ? '<i class="bi bi-eye"></i>'
            : '<i class="bi bi-eye-slash"></i>';
    });
});

loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const pass = document.getElementById("login-pass").value;
    const loginErrorEl = document.getElementById("login-error-msg");
    loginErrorEl.classList.remove("active");

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
    if (error) {
        loginErrorEl.textContent = error.message.includes("Invalid login credentials")
            ? "Incorrect email or password. Please try again."
            : error.message;
        loginErrorEl.classList.add("active");
        return;
    }
    location.reload();
});

    signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const pass = document.getElementById("signup-pass").value;
    const errorEl = document.getElementById("signup-error-msg");
    errorEl.classList.remove("active");

    if (pass.length < 8 || !/[A-Z]/.test(pass) || !/[0-9]/.test(pass)) {
        errorEl.textContent = "Password must be at least 8 characters, with 1 uppercase letter and 1 number.";
        errorEl.classList.add("active");
        return;
    }

    const { error } = await supabaseClient.auth.signUp({
        email, password: pass, options: { data: { full_name: name } }
    });
    if (error) {
        errorEl.textContent = error.message.includes("already registered") || error.message.includes("already exists")
            ? "This email is already in use. Please use a different email address."
            : error.message;
        errorEl.classList.add("active");
        return;
    }

    // Sign out immediately (email confirmation is off, so signUp auto-logs-in) and send to login screen
    document.getElementById("page-loader").classList.add("active");
    await supabaseClient.auth.signOut();

    setTimeout(() => {
        document.getElementById("page-loader").classList.remove("active");
        signupForm.reset();
        signupBox.style.display = "none";
        loginBox.style.display = "block";
    }, 2500);
});

document.getElementById("google-signin-btn")?.addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/Perfume.html'
        }
    });
    if (error) alert(error.message);
});

// --------- LOGGED-IN AVATAR + LOGOUT ---------
async function updateAuthUI() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const icon = document.getElementById("user-icon");
    if (!icon || !user) return;

    const name = user.user_metadata?.full_name || "Account";
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    icon.innerHTML = `
        <div class="user-avatar-wrapper">
            <div class="user-avatar">${initials}</div>
            <span class="user-first-name">${name.split(" ")[0]}</span>
            <div id="logout-dropdown" class="logout-dropdown">
                <button id="logout-btn" type="button"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
            </div>
        </div>
    `;

    icon.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("logout-dropdown").classList.toggle("active");
    };

    document.getElementById("logout-btn").addEventListener("click", async (e) => {
        e.stopPropagation();
        await supabaseClient.auth.signOut();
        location.reload();
    });
}
updateAuthUI();

// --------- FADE-IN ON SCROLL (site-wide, Afnan-style) ---------
let fadeObserver;
function initFadeIn() {
    if (!fadeObserver) {
        fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("fade-in-visible");
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
    }
    document.querySelectorAll(".fade-in:not(.fade-in-visible)").forEach(el => fadeObserver.observe(el));
}

// Auto-tags every major visual block (images, buttons, videos, banners, form elements)
// so the whole site fades in as you scroll, not just product cards.
function autoTagFadeElements() {
    // Staggered groups: each direct child pops in one after another
    const staggerGroups = document.querySelectorAll(
        '#about .row, #contact .row, .about-col-2, .contact-left, ' +
        '.product-buttons, .tab-titles'
    );
    staggerGroups.forEach(group => {
        Array.from(group.children).forEach((child, i) => {
            child.classList.add('fade-in');
            child.style.transitionDelay = `${i * 0.12}s`;
        });
    });

    // Single-fade elements (whole block fades/rises together)
    // NOTE: .tab-contents deliberately excluded — it's display:none for
    // inactive tabs, so it never intersects and would stay invisible forever
    // once switched to. Tab switching handles its own visibility instead.
    const singleFade = document.querySelectorAll(
        '.section-banner img, .section-banner-content, .most-popular-img, .most-popular-content, .btn, .btn2, ' +
        '.auth-container, .product-right, .about-col-1 img, ' +
        '.promo-single img, .promo-single-content'
    );
    singleFade.forEach(el => el.classList.add('fade-in'));

    // Shop Now button fades in just after its banner image, not simultaneously
    const promoBtn = document.querySelector('.promo-single-content');
    if (promoBtn) promoBtn.style.transitionDelay = '0.2s';

    initFadeIn();
}

document.addEventListener('DOMContentLoaded', autoTagFadeElements);

// --------- NEWSLETTER SUBSCRIBE ---------
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('newsletter-email');
        const msg = document.getElementById('newsletter-msg');
        const email = emailInput.value.trim();

        const { error } = await supabaseClient.from('newsletter_subscribers').insert({ email });

        if (error) {
            msg.textContent = "Something went wrong. Please try again.";
        } else {
            msg.textContent = "You're in! Check your inbox for your discount code.";
            emailInput.value = '';
        }
    });
}
// Also run immediately in case DOM is already loaded by the time script.js executes
if (document.readyState !== 'loading') autoTagFadeElements();

// --------- SCROLL ARROWS ---------
function updateArrows(id) {
    const container = document.getElementById(id);
    if (!container) return;
    const wrapper = container.closest('.scroll-wrapper');
    if (!wrapper) return;
    const leftBtn = wrapper.querySelector('.scroll-arrow.left');
    const rightBtn = wrapper.querySelector('.scroll-arrow.right');
    if (!leftBtn || !rightBtn) return;

    leftBtn.style.display = container.scrollLeft <= 5 ? 'none' : 'block';
    rightBtn.style.display =
        (container.scrollLeft + container.clientWidth >= container.scrollWidth - 5)
        ? 'none' : 'block';
}

function scrollRow(id, amount) {
    const container = document.getElementById(id);
    container.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(() => updateArrows(id), 400);
}

function initArrowVisibility(id) {
    const container = document.getElementById(id);
    if (!container) return;
    updateArrows(id);
    container.addEventListener('scroll', () => updateArrows(id));
    window.addEventListener('resize', () => updateArrows(id));
}
['mens-list', 'womens-list', 'all-list'].forEach(initArrowVisibility);
// --------- OUR LOOKS SECTION ---------
const looksData = {
    men: {
        name: "Cedar Eclipse",
        price: "PKR 3,599",
        reviews: "217 Reviews",
        box: "Images/Boxcedar.png",
        single: "Images/Cedar.png"
    },
    women: {
        name: "Vaniglia Pura",
        price: "PKR 3,299",
        reviews: "290 Reviews",
        box: "Images/Boxpura.png",
        single: "Images/Pura.png"
    }
};

let currentLooksGender = "men";

function updateLooksProduct(gender) {
    currentLooksGender = gender;
    const data = looksData[gender];
    document.getElementById("looks-img-default").src = data.box;
    document.getElementById("looks-img-hover").src = data.single;
    document.getElementById("looks-name").textContent = data.name;
    document.getElementById("looks-price").textContent = data.price;
    document.getElementById("looks-review-count").textContent = data.reviews;

    const match = allProducts.find(p => p.name === data.name);
    document.getElementById("looks-view-btn").href = match
        ? `Product.html?id=${match.id}`
        : "Product.html";
    if (match) {
    const ratingData = getRatingData(match);
    
    document.querySelector("#our-looks .looks-rating").style.setProperty('--rating', ratingData.rating + '%');
}
    document.querySelectorAll(".looks-dot").forEach(dot => {
        dot.classList.toggle("active", dot.dataset.gender === gender);
    });
}

document.querySelectorAll(".looks-dot").forEach(dot => {
    dot.addEventListener("click", () => updateLooksProduct(dot.dataset.gender));
});
document.querySelectorAll('.hero-buttons .btn').forEach(el => {
    let entered = false;

    el.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'transform' && el.classList.contains('swipe-hover')) {
            entered = true;
        }
    });

    el.addEventListener('mouseenter', () => {
        el.classList.remove('swipe-leave');
        el.classList.add('swipe-hover');
    });

    el.addEventListener('mouseleave', () => {
        if (entered) {
            el.classList.remove('swipe-hover');
            el.classList.add('swipe-leave');

            const resetHandler = (e) => {
                if (e.propertyName === 'transform') {
                    el.classList.add('swipe-reset');
                    el.classList.remove('swipe-leave');
                    void el.offsetWidth;
                    el.classList.remove('swipe-reset');
                    el.removeEventListener('transitionend', resetHandler);
                }
            };
            el.addEventListener('transitionend', resetHandler);
        } else {
            el.classList.remove('swipe-hover');
        }
        entered = false;
    });
});
document.querySelectorAll('.promo-shop-btn').forEach(el => {
    let entered = false;

    el.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'transform' && el.classList.contains('swipe-hover')) {
            entered = true;
        }
    });

    el.addEventListener('mouseenter', () => {
        el.classList.remove('swipe-leave');
        el.classList.add('swipe-hover');
    });

    el.addEventListener('mouseleave', () => {
        if (entered) {
            el.classList.remove('swipe-hover');
            el.classList.add('swipe-leave');

            const resetHandler = (e) => {
                if (e.propertyName === 'transform') {
                    el.classList.add('swipe-reset');
                    el.classList.remove('swipe-leave');
                    void el.offsetWidth;
                    el.classList.remove('swipe-reset');
                    el.removeEventListener('transitionend', resetHandler);
                }
            };
            el.addEventListener('transitionend', resetHandler);
        } else {
            el.classList.remove('swipe-hover');
        }
        entered = false;
    });
});
document.querySelectorAll('.btn2').forEach(el => {
    let entered = false;

    el.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'transform' && el.classList.contains('swipe-hover')) {
            entered = true;
        }
    });

    el.addEventListener('mouseenter', () => {
        el.classList.remove('swipe-leave');
        el.classList.add('swipe-hover');
    });

    el.addEventListener('mouseleave', () => {
        if (entered) {
            el.classList.remove('swipe-hover');
            el.classList.add('swipe-leave');

            const resetHandler = (e) => {
                if (e.propertyName === 'transform') {
                    el.classList.add('swipe-reset');
                    el.classList.remove('swipe-leave');
                    void el.offsetWidth;
                    el.classList.remove('swipe-reset');
                    el.removeEventListener('transitionend', resetHandler);
                }
            };
            el.addEventListener('transitionend', resetHandler);
        } else {
            el.classList.remove('swipe-hover');
        }
        entered = false;
    });
});
document.querySelectorAll('.cart-checkout-btn').forEach(el => {
    let entered = false;

    el.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'transform' && el.classList.contains('swipe-hover')) {
            entered = true;
        }
    });

    el.addEventListener('mouseenter', () => {
        el.classList.remove('swipe-leave');
        el.classList.add('swipe-hover');
    });

    el.addEventListener('mouseleave', () => {
        if (entered) {
            el.classList.remove('swipe-hover');
            el.classList.add('swipe-leave');

            const resetHandler = (e) => {
                if (e.propertyName === 'transform') {
                    el.classList.add('swipe-reset');
                    el.classList.remove('swipe-leave');
                    void el.offsetWidth;
                    el.classList.remove('swipe-reset');
                    el.removeEventListener('transitionend', resetHandler);
                }
            };
            el.addEventListener('transitionend', resetHandler);
        } else {
            el.classList.remove('swipe-hover');
        }
        entered = false;
    });
});
