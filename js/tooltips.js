document.addEventListener('DOMContentLoaded', function() {
    let tooltipsEnabled = true; // Tooltips are enabled by default
  
    // Function to toggle tooltips
    function toggleTooltips() {
      tooltipsEnabled = !tooltipsEnabled;
      const tooltipElements = document.querySelectorAll('.tooltip');
  
      tooltipElements.forEach(el => {
        if (!tooltipsEnabled) {
          el.classList.remove('show');
        }
      });
    }
  
    // Add event listeners to elements with data-tooltip attribute
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
  
    tooltipElements.forEach(el => {
      // Wrap the element in a span with class 'tooltip'
      const wrapper = document.createElement('span');
      wrapper.className = 'tooltip';
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);
  
      // Create the tooltip text element
      const tooltipText = document.createElement('span');
      tooltipText.className = 'tooltiptext';
      tooltipText.innerText = el.getAttribute('data-tooltip');
      wrapper.appendChild(tooltipText);
  
      // Show tooltip on mouseenter
      el.addEventListener('mouseenter', () => {
        if (tooltipsEnabled) {
          wrapper.classList.add('show');
        }
      });
  
      // Hide tooltip on mouseleave
      el.addEventListener('mouseleave', () => {
        wrapper.classList.remove('show');
      });
  
      // Allow clicking the tooltip to dismiss it
      tooltipText.addEventListener('click', () => {
        wrapper.classList.remove('show');
      });
    });
  
    // Add event listener to the '?' button to toggle tooltips
    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
      helpBtn.addEventListener('click', function() {
        toggleTooltips();
        // Optionally change the appearance of the help button
        if (tooltipsEnabled) {
          helpBtn.classList.remove('disabled');
        } else {
          helpBtn.classList.add('disabled');
        }
      });
    }
  });
  