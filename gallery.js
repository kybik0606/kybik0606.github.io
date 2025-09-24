// Функциональность модального окна для галереи
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('photoModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const closeBtn = document.querySelector('.close-btn');
    
    // Находим все кнопки "Увеличить"
    const viewButtons = document.querySelectorAll('.view-btn');
    
    // Обработчик для кнопок увеличения
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const photoCard = this.closest('.photo-card');
            const photo = photoCard.querySelector('.photo');
            const title = photoCard.querySelector('h4').textContent;
            const description = photoCard.querySelector('p').textContent;
            
            // Заполняем модальное окно данными
            modalImage.src = photo.src;
            modalImage.alt = photo.alt;
            modalTitle.textContent = title;
            modalDescription.textContent = description;
            
            // Показываем модальное окно
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Запрещаем прокрутку страницы
        });
    });
    
    // Закрытие модального окна
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Возвращаем прокрутку
    });
    
    // Закрытие при клике вне изображения
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Закрытие по клавише Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});