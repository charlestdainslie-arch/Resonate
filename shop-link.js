(() => {
  const appRoot = document.getElementById('app');
  function installHeaderLinks() {
    const orbitButton = document.getElementById('centerBtn');
    if (orbitButton) {
      const shop = document.createElement('a');
      shop.className = 'shop-entry';
      shop.href = 'https://monadresonate.com';
      shop.target = '_blank';
      shop.rel = 'noopener noreferrer';
      shop.setAttribute('aria-label', 'Open the RESONATE Store by Chas');
      shop.innerHTML = '<span class="shop-label">Shop</span><span class="brand-orbit" aria-hidden="true"><span></span></span>';
      orbitButton.replaceWith(shop);
    }
    const brand = appRoot.querySelector('.brand-name');
    if (brand && !brand.closest('.brand-home')) {
      const group = brand.parentElement;
      const home = document.createElement('button');
      home.type = 'button';
      home.className = 'brand-home';
      home.setAttribute('aria-label', 'RESONATE home');
      while (group.firstChild) home.appendChild(group.firstChild);
      home.onclick = () => { closeMenu(); go('home'); };
      group.replaceWith(home);
    }
  }
  if (!appRoot) return;
  new MutationObserver(installHeaderLinks).observe(appRoot, { childList: true, subtree: true });
  installHeaderLinks();
})();
