document.addEventListener("DOMContentLoaded", () => {
    const cartCountEl = document.querySelector("[data-cart-count]");
    const cartListEl = document.querySelector("[data-cart-items]");
    const clearButton = document.querySelector("[data-clear-cart]");
    const productButtons = document.querySelectorAll("[data-add-to-cart] button");
    const STORAGE_KEY = "pulseThreadsCart";

    if (!cartCountEl) {
        return;
    }

    let cartState = readCartState();
    updateBadge();
    renderCartItems();

    productButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const card = button.closest("[data-add-to-cart]");
            if (!card) {
                return;
            }

            const product = card.getAttribute("data-product") || "New item";
            const category = card.getAttribute("data-category") || "special";
            addToCart(product, category, button);
        });
    });

    if (clearButton) {
        clearButton.addEventListener("click", () => {
            cartState = { count: 0, items: [] };
            persistCart();
            updateBadge();
            renderCartItems();
        });
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
        if (!cartListEl) {
            return;
        }

        cartListEl.innerHTML = "";

        if (!cartState.items.length) {
            const empty = document.createElement("li");
            empty.className = "empty-state";
            empty.textContent = "Your cart is empty.";
            cartListEl.appendChild(empty);
            return;
        }

        cartState.items.forEach((item) => {
            const listItem = document.createElement("li");
            let label = "";

            if (item.category === "mens") {
                label = "Menswear pick";
            } else if (item.category === "womens") {
                label = "Womenswear pick";
            } else if (item.category === "kids") {
                label = "Kidswear pick";
            } else if (item.category === "discount") {
                label = "Discount deal";
            } else {
                label = "Fresh drop";
            }

            listItem.innerHTML = `
                <span>${item.product}</span>
                <span>${label}</span>
            `;
            cartListEl.appendChild(listItem);
        });
    }

    function updateBadge() {
        cartCountEl.textContent = cartState.count.toString();
    }

    function readCartState() {
        const fallback = { count: 0, items: [] };
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return fallback;
            }
            const parsed = JSON.parse(raw);
            if (typeof parsed.count === "number" && Array.isArray(parsed.items)) {
                return parsed;
            }
            return fallback;
        } catch (error) {
            return fallback;
        }
    }

    function persistCart() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cartState));
    }
});
