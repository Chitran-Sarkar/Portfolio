
// ---- 5. Skills Tab filter logic (Technical, Programming, Soft) ----
const skillFilterButtons = Array.from(document.querySelectorAll('.skills-filter-btn[data-skill-filter]')).filter(btn => btn.getAttribute('data-skill-filter') !== 'all');
const skillSections = [
  document.querySelector('#technical-skills-section'),
  document.querySelector('#programming-languages-section'),
  document.querySelector('#soft-skills-section')
];

// Helper to apply filter based on provided category
function applySkillFilter(filter) {
  const techSection = document.querySelector('#technical-skills-section');
  const progSection = document.querySelector('#programming-languages-section');
  const softSection = document.querySelector('#soft-skills-section');
  // Ensure sections exist before manipulating
  if (!techSection || !progSection || !softSection) return;
  // Hide all sections initially
  techSection.style.display = 'none';
  progSection.style.display = 'none';
  softSection.style.display = 'none';
  // Show the appropriate section based on filter
  if (filter === 'technical') {
    techSection.style.display = '';
  } else if (filter === 'programming') {
    progSection.style.display = '';
  } else if (filter === 'soft') {
    softSection.style.display = '';
  } else if (filter === 'all') {
    // Show all if 'all' is somehow requested
    techSection.style.display = '';
    progSection.style.display = '';
    softSection.style.display = '';
  }
}

skillFilterButtons.forEach(button => {
  button.addEventListener('click', function() {
    // Remove active class from all buttons
    skillFilterButtons.forEach(btn => btn.classList.remove('active'));
    // Activate this button
    this.classList.add('active');
    // Apply the corresponding filter
    const filter = this.getAttribute('data-skill-filter');
    applySkillFilter(filter);

    // Dispatch custom event to immediately wake up physics
    window.dispatchEvent(new Event('skills-tab-change'));
  });
});

// Set default active skill filter button (Technical) and apply its filter
if (skillFilterButtons.length > 0) {
  const defaultBtn = skillFilterButtons[0];
  defaultBtn.classList.add('active');
  const defaultFilter = defaultBtn.getAttribute('data-skill-filter');
  applySkillFilter(defaultFilter);
}

  // Skills Tab dropdown selection for mobile
  const skillSelect = document.querySelector('[data-skill-select]');
  const skillSelectItems = document.querySelectorAll('[data-skill-select-item]');
  const skillSelectValue = document.querySelector('[data-skill-select-value]');
  if (skillSelect) {
    skillSelect.addEventListener('click', function () {
      skillSelect.classList.toggle('active');
    });
    skillSelectItems.forEach(item => {
      item.addEventListener('click', function () {
        let selectedValue = this.innerText;
        if (skillSelectValue) skillSelectValue.innerText = selectedValue;
        skillSelect.classList.remove('active');
        const btn = Array.from(document.querySelectorAll('.skills-filter-btn[data-skill-filter]')).find(b => b.innerText === selectedValue);
        if (btn) btn.click();
      });
    });
  }
