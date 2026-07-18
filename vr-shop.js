const vrShopItems = [
  {
    id: "vr-demo-pack",
    name: "VR Demo Pack",
    description: "A sample VR experience that can be played from a browser page or downloaded as a ZIP archive.",
    price: "$0.01",
    image: "favicon.png",
    playUrl: "vr-demo.html",
    downloadUrl: "vr-demo.txt",
    checkoutUrl: "https://example.com/checkout/vr-demo-pack"
  }
];

const purchasedVrItems = new Set();

function getVrPurchaseKey() {
  const user = JSON.parse(localStorage.getItem("pg_user") || "null");
  return user && user.name ? `pg_vrpurchases_${user.name}` : "pg_vrpurchases_guest";
}

function loadVrPurchases() {
  const key = getVrPurchaseKey();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      arr.forEach((id) => purchasedVrItems.add(id));
    }
  } catch (e) {
    console.error("Failed to load VR purchases:", e);
  }
}

function saveVrPurchases() {
  const key = getVrPurchaseKey();
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(purchasedVrItems)));
  } catch (e) {
    console.error("Failed to save VR purchases:", e);
  }
}

function parsePrice(value) {
  if (!value || value.toLowerCase() === "free") return 0;
  const numeric = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function handleVrPurchase(itemId, button) {
  const item = vrShopItems.find((entry) => entry.id === itemId);
  if (!item) return;

  const priceValue = parsePrice(item.price);
  if (priceValue <= 0) {
    purchasedVrItems.add(itemId);
    saveVrPurchases();
    renderVrShopItems();
    return;
  }

  const checkoutUrl = item.checkoutUrl || item.paymentUrl || "";
  if (checkoutUrl) {
    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    return;
  }

  const confirmed = window.confirm(`Pay ${item.price} for ${item.name} using PayPal?`);
  if (!confirmed) return;

  purchasedVrItems.add(itemId);
  saveVrPurchases();
  button.textContent = "✓ Purchased";
  button.disabled = true;
  renderVrShopItems();
}

function renderVrShopItems() {
  // Ensure VR purchases are loaded for current user before rendering
  loadVrPurchases();
  const container = document.getElementById("vrShopItems");
  if (!container) return;

  if (!vrShopItems.length) {
    container.innerHTML = `
      <div class="shop-empty">
        <strong>VR Shop empty</strong>
        <p>Come back another time for new VR experiences.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = vrShopItems
    .map(
      (item) => {
        const isPurchased = purchasedVrItems.has(item.id);
        const priceValue = parsePrice(item.price);
        const canAccess = priceValue <= 0 || isPurchased;

        return `
          <article class="shop-card">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" />` : ""}
            <div class="meta">
              <strong>${item.name}</strong>
              <span class="price">${item.price || "Free"}</span>
            </div>
            <div>${item.description || ""}</div>
            <div class="shop-actions">
              ${canAccess && item.playUrl ? `<a href="${item.playUrl}" target="_blank" rel="noopener">▶ Play</a>` : ""}
              ${canAccess && item.downloadUrl ? `<a href="${item.downloadUrl}" download>⬇ Download</a>` : ""}
              ${!canAccess ? `<button type="button" data-item-id="${item.id}">PayPal</button>` : ""}
            </div>
          </article>
        `;
      }
    )
    .join("");

  container.querySelectorAll("button[data-item-id]").forEach((button) => {
    button.addEventListener("click", () => handleVrPurchase(button.dataset.itemId, button));
  });
}
