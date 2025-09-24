// Скрипт для мобильного меню
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
        });
        
        // Закрываем меню при клике на ссылку
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuBtn.classList.remove('active');
                nav.classList.remove('active');
            });
        });
        
        // Закрываем меню при клике вне его
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.header')) {
                mobileMenuBtn.classList.remove('active');
                nav.classList.remove('active');
            }
        });
    }
});