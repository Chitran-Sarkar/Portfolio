
  // ---- 10. Details Know More Typing Animation ----
  const details = document.querySelector('.about-text details');
  if (details) {
    const paragraphs = Array.from(details.querySelectorAll('p'));
    
    // Store original HTML and clear paragraphs on load
    paragraphs.forEach(p => {
      p.dataset.originalHtml = decodeHtml(p.innerHTML);
      p.innerHTML = '';
    });

    let typingSeqId = 0;

    function typeHtml(element, htmlString, speed, callback) {
      let i = 0;
      element.innerHTML = "";
      const currentSeq = typingSeqId;
      
      function step() {
        if (typingSeqId !== currentSeq) return; // cancel if sequence changed
        
        if (i < htmlString.length) {
          if (htmlString[i] === '<') {
            let closingIndex = htmlString.indexOf('>', i);
            if (closingIndex !== -1) {
              element.innerHTML += htmlString.substring(i, closingIndex + 1);
              i = closingIndex + 1;
            } else {
              element.innerHTML += htmlString[i];
              i++;
            }
          } else {
            element.innerHTML += htmlString[i];
            i++;
          }
          setTimeout(step, speed);
        } else if (callback) {
          callback();
        }
      }
      step();
    }

    details.addEventListener('toggle', () => {
      // Increment sequence ID to stop any running typing instances
      typingSeqId++;
      
      if (details.open) {
        // Clear all paragraphs first
        paragraphs.forEach(p => {
          p.innerHTML = '';
          p.classList.remove('typing');
        });

        // Type paragraphs sequentially
        const typeSequence = (index) => {
          if (index < paragraphs.length) {
            const p = paragraphs[index];
            p.classList.add('typing');
            typeHtml(p, p.dataset.originalHtml, 15, () => {
              p.classList.remove('typing');
              typeSequence(index + 1);
            });
          }
        };
        typeSequence(0);
      } else {
        // If closed, clear everything so it starts fresh next time
        paragraphs.forEach(p => {
          p.innerHTML = '';
          p.classList.remove('typing');
        });
      }
    });
  }
