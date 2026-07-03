// ---- 2. Navbar sliding underline setup ----
  navbar = document.querySelector('.navbar');
  if (navbar) {
    underline = document.createElement('div');
    underline.className = 'navbar-underline';
    navbar.appendChild(underline);
  }
