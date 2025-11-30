document.addEventListener("DOMContentLoaded", () => {

    const cartCountEl = document.querySelector("[data-cart-count]");
    const cartListEl = document.querySelector("[data-cart-items]");
    const clearButton = document.querySelector("[data-clear-cart]");
    const productButtons = document.querySelectorAll("[data-add-to-cart] button");

    const loginBtn = document.querySelector("[data-login-btn]");
    const logoutBtn = document.querySelector("[data-logout-btn]");

    const STORAGE_KEY = "pulseThreadsCart";
    const USER_KEY = "PulseUser";
    const VIEWED_KEY = "PulseRecentlyViewed";

    let cartState = readCartState();

    updateBadge();
    renderCartItems();
    applyAuthState();

    if (productButtons) {
        productButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const card = button.closest("[data-add-to-cart]");
                const product = card.getAttribute("data-product");
                const category = card.getAttribute("data-category");

                addToCart(product, category, button);
                addRecentlyViewed(product, category);
            });
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem(USER_KEY);
            applyAuthState();
        });
    }

    if (clearButton) {
        clearButton.addEventListener("click", () => {
            cartState = { count: 0, items: [] };
            persistCart();
            updateBadge();
            renderCartItems();
        });
    }

    function applyAuthState() {
        const user = readUser();
        if (user && user.loggedIn) {
            if (loginBtn) loginBtn.style.display = "none";
            if (logoutBtn) logoutBtn.style.display = "inline-block";
        } else {
            if (loginBtn) loginBtn.style.display = "inline-block";
            if (logoutBtn) logoutBtn.style.display = "none";
        }
    }

    function addRecentlyViewed(product, category) {
        const list = readRecentlyViewed();
        list.unshift({ product, category });

        const unique = [];
        const names = new Set();

        list.forEach((item) => {
            if (!names.has(item.product)) {
                names.add(item.product);
                unique.push(item);
            }
        });

        const finalList = unique.slice(0, 6);
        localStorage.setItem(VIEWED_KEY, JSON.stringify(finalList));
    }

    function readRecentlyViewed() {
        try {
            const raw = localStorage.getItem(VIEWED_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function addToCart(product, category, button) {
        cartState.count += 1;
        cartState.items.push({ product, category });
        persistCart();
        updateBadge();
        renderCartItems();

        button.classList.add("pulse");
        setTimeout(() => button.classList.remove("pulse"), 400);
    }

    function renderCartItems() {
        if (!cartListEl) return;

        cartListEl.innerHTML = "";

        if (!cartState.items.length) {
            const empty = document.createElement("li");
            empty.className = "empty-state";
            empty.textContent = "Your cart is empty.";
            cartListEl.appendChild(empty);
            return;
        }

        cartState.items.forEach((item) => {
            const li = document.createElement("li");
            let label = "";

            if (item.category === "mens") label = "Menswear pick";
            else if (item.category === "womens") label = "Womenswear pick";
            else if (item.category === "kids") label = "Kidswear pick";
            else if (item.category === "discount") label = "Discount deal";
            else label = "Fresh drop";

            li.innerHTML = `<span>${item.product}</span><span>${label}</span>`;
            cartListEl.appendChild(li);
        });
    }

    function updateBadge() {
        if (cartCountEl) {
            cartCountEl.textContent = cartState.count.toString();
        }
    }

    function readCartState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : { count: 0, items: [] };
        } catch {
            return { count: 0, items: [] };
        }
    }

    function persistCart() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cartState));
    }

    function readUser() {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    const recentListEl = document.querySelector("[data-recently-viewed]");
    if (recentListEl) {
        const viewed = readRecentlyViewed();
        viewed.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.product + " (" + item.category + ")";
            recentListEl.appendChild(li);
        });
    }

});
