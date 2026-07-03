/**
 * ============================================================
 *  modules/portfolio-filter.js — Project Portfolio Filter
 * ============================================================
 *  Powers the filter system on the Portfolio tab: both the
 *  mobile dropdown and the desktop button row.
 *
 *  Exposes on window:
 *    • filterFunc(value)   – Shows/hides .project-item by category
 *    • filterBtn           – NodeList of desktop filter buttons
 *    • selectValue         – Dropdown selected-value span
 *
 *  Depends on: globals.js (elementToggleFunc)
 * ============================================================
 */

  // ---- 4. Custom select dropdown logic ----
  const select = document.querySelector("[data-select]");
  const selectItems = document.querySelectorAll("[data-select-item]");
  const selectValue = document.querySelector("[data-select-value]");
  const filterBtn = document.querySelectorAll("[data-filter-btn]");
  const filterItems = document.querySelectorAll("[data-filter-item]");

  if (select) {
    select.addEventListener("click", function () { 
      elementToggleFunc(this); 
    });
  }

  const filterFunc = function (selectedValue) {
    for (let i = 0; i < filterItems.length; i++) {
      if (selectedValue === "all") {
        if (filterItems[i].classList.contains('only-category')) {
          filterItems[i].classList.remove("active");
        } else {
          filterItems[i].classList.add("active");
        }
      } else if (selectedValue === filterItems[i].dataset.category) {
        filterItems[i].classList.add("active");
      } else {
        filterItems[i].classList.remove("active");
      }
    }
  };

  // Add click events to select items
  selectItems.forEach(item => {
    item.addEventListener("click", function () {
      let selectedValue = this.innerText.toLowerCase();
      if (selectValue) selectValue.innerText = this.innerText;
      elementToggleFunc(select);
      filterFunc(selectedValue);
    });
  });

  // Large screen filter buttons click logic
  if (filterBtn.length > 0) {
    let lastClickedBtn = filterBtn[0];
    filterBtn.forEach(btn => {
      btn.addEventListener("click", function () {
        let selectedValue = this.innerText.toLowerCase();
        if (selectValue) selectValue.innerText = this.innerText;
        filterFunc(selectedValue);

        if (lastClickedBtn) lastClickedBtn.classList.remove("active");
        this.classList.add("active");
        lastClickedBtn = this;
      });
    });
  }

  // Default filter call
  filterFunc('all');