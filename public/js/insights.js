// /public/js/insights.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Insights page JavaScript loaded!");

    // --- NEW: Smart Scroll Restoration ---
    const scrollPosition = sessionStorage.getItem('insightsScrollPosition');
    if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition, 10));
        // Clean up the stored value so it doesn't trigger on a normal refresh
        sessionStorage.removeItem('insightsScrollPosition');
    }

    const insightBoxes = document.querySelectorAll('.insight-box');

    insightBoxes.forEach(box => {
        box.addEventListener('click', (event) => {
            const graphType = event.currentTarget.dataset.graphType;
            if (graphType) {
                console.log(`Insight box clicked: ${graphType}`);

                // --- NEW: Save scroll position before navigating ---
                sessionStorage.setItem('insightsScrollPosition', window.scrollY);

                // Navigate to the parameterized graph page
                window.location.href = `/insights/graph/${graphType}`;
            }
        });
    });
});