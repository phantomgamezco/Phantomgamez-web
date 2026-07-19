const shopItems = [
  {
    id: "support",
    name: "support me",
    description: "support me im a small video game maker",
    price: "free",
    image: "favicon.png",
    link: "https://app.modakmakers.com/payment-link/v2/1784418849494266592",
    downloadUrl: "",
    checkoutUrl: ""
  }
];

const purchasedItems = new Set();

function getPurchaseKey() {
  const user = JSON.parse(localStorage.getItem("pg_user") || "null");
  return user && user.name ? `pg_purchases_${user.name}` : "pg_purchases_guest";
}

function loadPurchases() {
  const key = getPurchaseKey();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      arr.forEach((id) => purchasedItems.add(id));
    }
  } catch (e) {
    console.error("Failed to load purchases:", e);
  }
}

function savePurchases() {
  const key = getPurchaseKey();
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(purchasedItems)));
  } catch (e) {
    console.error("Failed to save purchases:", e);
  }
}

function parsePrice(value) {
  if (!value || value.toLowerCase() === "free") return 0;
  const numeric = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function handlePurchase(itemId, button) {
  const item = shopItems.find((entry) => entry.id === itemId);
  if (!item) return;

  const priceValue = parsePrice(item.price);
  if (priceValue <= 0) {
    purchasedItems.add(itemId);
    savePurchases();
    renderShopItems();
    return;
  }

  const checkoutUrl = item.checkoutUrl || item.paymentUrl || "";
  if (checkoutUrl) {
    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    return;
  }

  const confirmed = window.confirm(`Pay ${item.price} for ${item.name} using Pay?`);
  if (!confirmed) return;

  purchasedItems.add(itemId);
  savePurchases();
  button.textContent = "✓ Purchased";
  button.disabled = true;
  renderShopItems();
}

function renderShopItems() {
  // Ensure purchases are loaded for current user before rendering
  loadPurchases();
  const container = document.getElementById("shopItems");
  if (!container) return;

  if (!shopItems.length) {
    container.innerHTML = `
      <div class="shop-empty">
        <strong>Shop empty</strong>
        <p>Come back another time for new items.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = shopItems
    .map(
      (item) => {
        const isPurchased = purchasedItems.has(item.id);
        const priceValue = parsePrice(item.price);
        const canAccess = priceValue <= 0 || isPurchased;

        return `
          <article class="shop-card">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" />` : ""}
            <div class="meta">
              <strong>${item.name}</strong>
              <span class="price">${item.price || "Price coming soon"}</span>
            </div>
            <div>${item.description || ""}</div>
          <div class="shop-actions">
            ${canAccess && item.link ? `<button type="button" class="play-btn" data-game-url="${item.link}">▶ Play</button>` : ""}
            ${canAccess && item.downloadUrl ? `<a href="${item.downloadUrl}" download>⬇ Download</a>` : ""}
            ${!canAccess ? `<button type="button" data-item-id="${item.id}">Pay</button>` : ""}
          </div>
          </article>
        `;
      }
    )
    .join("");

  container.querySelectorAll("button[data-item-id]").forEach((button) => {
    button.addEventListener("click", () => handlePurchase(button.dataset.itemId, button));
  });

  container.querySelectorAll("button.play-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const gameUrl = button.dataset.gameUrl;
      if (window.playGame) window.playGame(gameUrl);
    });
  });
}
