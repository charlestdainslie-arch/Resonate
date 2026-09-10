(() => {
  const STORE_URL = 'https://monadresonate.com';
  const appRoot = document.getElementById('app');

  function installShopLink() {
    const orbitButton = document.getElementById('centerBtn');
    if (!orbitButton) return;

    const shopLink = document.createElement('a');
    shopLink.className = 'brand-orbit shop-entry';
    shopLink.href = STORE_URL;
    shopLink.target = '_blank';
    shopLink.rel = 'noopener noreferrer';
    shopLink.setAttribute('aria-label', 'Open the RESONATE Store by Chas');
    shopLink.setAttribute('title', 'Go to the RESONATE Store by Chas');
    shopLink.innerHTML = '<span class="shop-label">Shop</span>';

    orbitButton.replaceWith(shopLink);
  }

  if (!appRoot) return;

  const observer = new MutationObserver(installShopLink);
  observer.observe(appRoot, { childList: true, subtree: true });
  installShopLink();
})();
