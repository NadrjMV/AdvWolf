import { db } from './firebase-config.js'; // Importa a referência do DB
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {

    // Animações de scroll com ScrollReveal
    try {
        const sr = ScrollReveal({
            origin: 'bottom',
            distance: '60px',
            duration: 1600,
            delay: 200,
            easing: 'ease-in-out',
        });

        sr.reveal('.hero-content, .section-title');
        sr.reveal('.about-image, .highlight', { origin: 'left' });
        sr.reveal('.about-text', { origin: 'right' });
        sr.reveal('.service-card, .testimonial-card', { interval: 100 });
        sr.reveal('.location-content', { origin: 'top' });
        sr.reveal('.contact-container', { scale: 0.9 });
    } catch (e) {
        console.error("ScrollReveal não pôde ser inicializado. Verifique se o script está no HTML.", e);
    }
    
    // Header com scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Menu mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // Dark/Light Mode
    const themeSwitcher = document.getElementById('checkbox');
    const docElement = document.documentElement;
    const applyTheme = (theme) => {
        docElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeSwitcher) {
            themeSwitcher.checked = theme === 'dark';
        }
    };
    if (themeSwitcher) {
        themeSwitcher.addEventListener('change', () => {
            const newTheme = themeSwitcher.checked ? 'dark' : 'light';
            applyTheme(newTheme);
        });
    }
    const currentTheme = localStorage.getItem('theme') || 'light';
    applyTheme(currentTheme);


    // ===================================================================
    // NOVA FUNÇÃO para carregar imóveis dinamicamente na página inicial
    // ===================================================================
    const loadFeaturedProperties = async () => {
        const propertiesContainer = document.querySelector('.properties-showcase');
        if (!propertiesContainer) return; // Sai da função se o container não existir

        propertiesContainer.innerHTML = '<p>Carregando imóveis...</p>';

        try {
            // Cria uma consulta para buscar os imóveis da coleção "properties"
            // - orderBy("createdAt", "desc"): Ordena pelos mais recentes primeiro.
            // - limit(3): Pega apenas os 3 primeiros resultados.
            const q = query(collection(db, "properties"), orderBy("createdAt", "desc"), limit(3));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                propertiesContainer.innerHTML = '<p>Nenhum imóvel em destaque no momento.</p>';
                return;
            }

            let html = '';
            querySnapshot.forEach((doc) => {
                const property = doc.data();
                // Cria o card HTML para cada imóvel
                html += `
                    <div class="property-item">
                        <img src="${property.imageUrl}" alt="${property.title}">
                        <div class="property-info">
                            <h3>${property.title}</h3>
                            <p>${property.location}</p>
                            <a href="https://wa.me/553591299394" target="_blank" class="btn-contact">Contato</a>
                        </div>
                    </div>
                `;
            });
            // Insere os cards gerados no container
            propertiesContainer.innerHTML = html;

        } catch (error) {
            console.error("Erro ao carregar imóveis em destaque: ", error);
            propertiesContainer.innerHTML = '<p>Não foi possível carregar os imóveis. Tente novamente mais tarde.</p>';
        }
    };

    // Chama a função para carregar os imóveis assim que a página é carregada
    loadFeaturedProperties();
});