document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Page navigation
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const currentPageEl = document.getElementById('current-page');
    const totalPagesEl = document.getElementById('total-pages');
    
    let currentPage = 1;
    const totalPages = parseInt(totalPagesEl.textContent);
    
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            currentPageEl.textContent = currentPage;
            // Here you would load the previous page content
            // For demo purposes, we'll just switch to a random tab
            const randomTab = tabButtons[Math.floor(Math.random() * tabButtons.length)];
            randomTab.click();
        }
    });
    
    nextPageBtn.addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            currentPageEl.textContent = currentPage;
            // Here you would load the next page content
            // For demo purposes, we'll just switch to a random tab
            const randomTab = tabButtons[Math.floor(Math.random() * tabButtons.length)];
            randomTab.click();
        }
    });
    
    // Help modal
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeBtn = document.querySelector('.close-button');
    const closeHelpBtn = document.querySelector('.close-help-button');
    
    helpBtn.addEventListener('click', function() {
        helpModal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', function() {
        helpModal.style.display = 'none';
    });
    
    closeHelpBtn.addEventListener('click', function() {
        helpModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });
    
    // Show help modal on first visit
    if (!localStorage.getItem('helpShown')) {
        setTimeout(function() {
            helpModal.style.display = 'block';
            localStorage.setItem('helpShown', 'true');
        }, 1000);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            prevPageBtn.click();
        } else if (e.key === 'ArrowRight') {
            nextPageBtn.click();
        } else if (e.key === 'Escape' && helpModal.style.display === 'block') {
            helpModal.style.display = 'none';
        }
    });
    
    // Make tabs accessible with keyboard
    tabButtons.forEach(button => {
        button.setAttribute('tabindex', '0');
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
});