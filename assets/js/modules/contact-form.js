/**
 * ============================================================
 *  modules/contact-form.js — Contact Form & Web3Forms
 * ============================================================
 *  Handles all contact form behaviour:
 *    • Real-time validation   – Enables/disables Send button
 *    • Shake animation        – On submit while form is invalid
 *    • Runaway button         – Send button flees the cursor
 *                               when form is incomplete
 *    • Form submission        – POST to Web3Forms API via fetch
 *    • Toast feedback         – Success / error notifications
 *
 *  ⚠️  Update WEB3FORMS_ACCESS_KEY with your own key from
 *       https://web3forms.com/ before deploying.
 *
 *  Depends on: globals.js (showToast)
 * ============================================================
 */

  // ---- 6. Web3Forms and Form validation setup ----
  // Get your free Web3Forms Access Key here: https://web3forms.com/
  const WEB3FORMS_ACCESS_KEY = "a5a7986d-d5c4-4313-8969-5f55b6981ccb"; 

  const form = document.querySelector("[data-form]");
  const submitButton = document.querySelector("[data-form-btn]");
  const formInputs = document.querySelectorAll("[data-form-input]");

  const updateButtonState = () => {
    if (form && form.checkValidity()) {
      submitButton.removeAttribute("disabled");
      submitButton.classList.add("btn-ready");
      submitButton.classList.remove("btn-fleeing");
      submitButton.style.transform = 'translateX(0)'; // snap back to centre
    } else if (submitButton) {
      submitButton.setAttribute("disabled", "true");
      submitButton.classList.remove("btn-ready");
      submitButton.classList.add("btn-fleeing");
    }
  };

  formInputs.forEach(input => {
    input.addEventListener("input", updateButtonState);
  });

  updateButtonState();

  // Shake the form when clicking the disabled send button (incomplete fields)
  if (submitButton) {
    submitButton.addEventListener("click", function () {
      if (submitButton.disabled && form) {
        form.classList.remove("form-shake"); // reset to re-trigger
        void form.offsetWidth;              // force reflow so animation restarts
        form.classList.add("form-shake");
        form.addEventListener("animationend", () => {
          form.classList.remove("form-shake");
        }, { once: true });
      }
    });
  }

  // ---- Runaway button: binary-edge flee across the form when invalid ----
  // Resting position: RIGHT edge (translateX(0) with margin-left:auto, margin-right:0)
  // Flee only activates when cursor is within PROXIMITY_Y pixels of the button.
  // When hovering over input fields / textarea (above the button), no flee occurs.
  if (submitButton && form) {
    submitButton.style.position = 'relative';
    submitButton.style.transition = 'transform 0.15s cubic-bezier(0.25, 0.8, 0.25, 1)';

    const PROXIMITY_Y = 60; // px above button top edge that counts as "near the button"

    form.addEventListener('mousemove', (e) => {
      // When valid → reset to right-side rest, no flee
      if (!submitButton.classList.contains('btn-fleeing')) {
        submitButton.style.transform = 'translateX(0)';
        return;
      }

      const formRect = form.getBoundingClientRect();
      const btnRect  = submitButton.getBoundingClientRect();

      // Cursor Y relative to form top
      const cursorY     = e.clientY - formRect.top;
      // Button top edge relative to form top
      const btnTopInForm = btnRect.top - formRect.top;

      // Only flee when cursor is within the proximity zone of the button
      if (cursorY < btnTopInForm - PROXIMITY_Y) {
        // Cursor is on inputs/textarea — snap back to right rest, don't flee
        submitButton.style.transform = 'translateX(0)';
        return;
      }

      const cursorX = e.clientX - formRect.left;
      const formMid = formRect.width / 2;
      const formPad = 20;

      // Full slide distance: from right edge all the way to left edge
      const maxFlee = formRect.width - btnRect.width - formPad * 2;

      // Cursor on LEFT half  → stay at right (translateX 0 = right-aligned rest)
      // Cursor on RIGHT half → flee fully to left edge
      const targetX = cursorX >= formMid ? -maxFlee : 0;

      submitButton.style.transform = `translateX(${targetX}px)`;
    });

    form.addEventListener('mouseleave', () => {
      // Snap back to right-side resting position
      submitButton.style.transform = 'translateX(0)';
    });
  }







  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (WEB3FORMS_ACCESS_KEY === "YOUR_ACCESS_KEY_HERE") {
        showToast('Please set your Web3Forms Access Key in script.js first!', 'error');
        return;
      }

      // Retrieve form data
      const fullname = form.querySelector('input[name="fullname"]').value;
      const email = form.querySelector('input[name="email"]').value;
      const message = form.querySelector('textarea[name="message"]').value;

      if (submitButton) {
        submitButton.setAttribute("disabled", "true");
        submitButton.classList.remove("btn-ready");
        submitButton.innerText = "Sending...";
      }

      // Send the email using Web3Forms
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: fullname,
          email: email,
          subject: "New Message from Portfolio Contact Form",
          message: message
        })
      })
      .then(async (response) => {
        let json = await response.json();
        if (response.status === 200) {
          showToast('Your message has been sent successfully!', 'success');
          form.reset();
          updateButtonState();
        } else {
          console.error('Web3Forms Error Response:', json);
          showToast(json.message || 'Failed to send the message. Please try again.', 'error');
        }
      })
      .catch((error) => {
        console.error('FAILED...', error);
        showToast('Failed to send the message. Please try again.', 'error');
      })
      .finally(() => {
        if (submitButton) submitButton.innerHTML = '<ion-icon name="paper-plane"></ion-icon><span>Send Message</span>';
      });
    });
  }