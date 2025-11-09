
document.addEventListener('DOMContentLoaded', () => {
    // ===============================================
    // Navbar Scroll & Search Logic
    // ===============================================

    const navbar = document.querySelector('.navbar');

    // --- Part 1: Conditional Scroll & Style Logic ---
    if (navbar) {
        const currentPath = window.location.pathname;

        const isHymnPage = currentPath === '/hymn' || currentPath.startsWith('/hymn/');

        if (isHymnPage) {
            navbar.style.position = 'static';

        } else {
            const scrollDownThreshold = 10;
            const scrollUpThreshold = 300;
            let lastScrollY = window.scrollY;

            window.addEventListener('scroll', () => {
                const currentScrollY = window.scrollY;

                if (currentScrollY <= navbar.offsetHeight) {
                    navbar.classList.remove('navbar--hidden');
                    lastScrollY = currentScrollY;
                    return;
                }

                if (currentScrollY > lastScrollY) {
                    if (currentScrollY - lastScrollY > scrollDownThreshold) {
                        navbar.classList.add('navbar--hidden');
                        lastScrollY = currentScrollY;
                    }
                } else {
                    if (lastScrollY - currentScrollY > scrollUpThreshold) {
                        navbar.classList.remove('navbar--hidden');
                        lastScrollY = currentScrollY;
                    }
                }
            });
        }
    }

    // --- Part 2: Search Bar Logic (runs on all pages) ---
    const searchInput = document.getElementById('searchInput');
    const suggestionList = document.getElementById('suggestionList');
    let timeout = null;

    if (searchInput && suggestionList) {
        // Position suggestions dropdown below search input
        const positionSuggestions = () => {
            const rect = searchInput.getBoundingClientRect();
            suggestionList.style.top = `${rect.bottom + 5}px`;
            suggestionList.style.left = `${rect.left}px`;
            suggestionList.style.width = `${rect.width}px`;
        };

        const fetchSuggestions = async (query) => {
            try {
                const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`);
                const data = await response.json();

                suggestionList.innerHTML = '';

                if (data.length > 0) {
                    data.forEach(item => {
                        const li = document.createElement('li');
                        li.classList.add('suggestion-item');
                        li.innerHTML = `
                            <span class="suggestion-type suggestion-type-${item.type.toLowerCase()}">${item.type}:</span>
                            <span class="suggestion-text">${item.display}</span>
                        `;

                        li.addEventListener('click', () => {
                            if (item.type === 'Stanza' && item.display) {
                                const elementId = `stanza-${item.display.replace(/\./g, '-')}`;
                                const targetUrl = `${item.path}#${elementId}`;
                                window.location.href = targetUrl;
                            } else {
                                window.location.href = item.path;
                            }
                        });

                        suggestionList.appendChild(li);
                    });
                    positionSuggestions();
                    suggestionList.style.display = 'block';
                } else {
                    suggestionList.style.display = 'none';
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                suggestionList.style.display = 'none';
            }
        };

        searchInput.addEventListener('input', () => {
            clearTimeout(timeout);
            const query = searchInput.value.trim();

            if (query.length === 0) {
                suggestionList.innerHTML = '';
                suggestionList.style.display = 'none';
                return;
            }

            timeout = setTimeout(() => {
                fetchSuggestions(query);
            }, 250);
        });

        // Reposition on window resize or scroll
        window.addEventListener('resize', () => {
            if (suggestionList.style.display === 'block') {
                positionSuggestions();
            }
        });
        
        window.addEventListener('scroll', () => {
            if (suggestionList.style.display === 'block') {
                positionSuggestions();
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionList.contains(e.target)) {
                suggestionList.style.display = 'none';
            }
        });
    }
});