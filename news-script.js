// Функция для загрузки космических новостей
async function loadSpaceNews() {
    const newsContainer = document.getElementById('news-container');
    
    try {
        // Временные данные для примера (позже заменим на реальные API)
        const newsData = [
            {
                title: "Новое открытие телескопа Джеймса Уэбба",
                date: "2024-01-15",
                content: "Космический телескоп обнаружил новые галактики в ранней Вселенной."
            },
            {
                title: "Солнечная активность сегодня",
                date: "2024-01-15", 
                content: "Уровень солнечной активности в норме, вспышек не зарегистрировано."
            }
        ];
        
        // Очищаем контейнер
        newsContainer.innerHTML = '';
        
        // Добавляем новости на страницу
        newsData.forEach(news => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.innerHTML = `
                <h3 class="news-title">${news.title}</h3>
                <div class="news-date">${news.date}</div>
                <div class="news-content">${news.content}</div>
            `;
            newsContainer.appendChild(newsItem);
        });
        
    } catch (error) {
        newsContainer.innerHTML = '<p>Ошибка загрузки новостей. Попробуйте позже.</p>';
    }
}

// Загружаем новости когда страница загрузится
document.addEventListener('DOMContentLoaded', loadSpaceNews);