document.addEventListener('DOMContentLoaded', () => {
	const items = document.querySelectorAll('.hymn-item');
	const itemsPerPage = 15;
	const totalItems = items.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const paginationControls = document.getElementById('pagination-controls');
	const paginationWrapper = document.getElementById('pagination-wrapper'); // Grab the wrapper element
	const paginationInfo = document.getElementById('pagination-info');
	let currentPage = 1;

	// === NEW LOGIC: Hide controls if only one page exists ===
	if (totalPages <= 1) {
		if (paginationInfo) {
			paginationInfo.style.display = 'none'; // Hide the info text
		}
		if (paginationWrapper) {
			paginationWrapper.style.display = 'none'; // Hide the entire navigation bar
		}

		// Ensure all items are visible since there's no pagination
		items.forEach(item => {
			item.style.display = 'block';
		});
		return; // Exit the script early, no need for pagination functions
	}
	// === END NEW LOGIC ===

	function displayPage(page) {
		currentPage = page;
		const start = (page - 1) * itemsPerPage;
		const end = start + itemsPerPage;

		items.forEach((item, index) => {
			// Hide/Show items based on current page range
			item.style.display = (index >= start && index < end) ? 'block' : 'none';
		});

		// Update pagination display text
		const startItem = start + 1;
		const endItem = Math.min(end, totalItems);
		paginationInfo.textContent = `Showing ${startItem}–${endItem} of ${totalItems} hymns (Page ${currentPage} of ${totalPages})`;

		renderPaginationButtons();

		// SCROLL TO TOP OF CONTENT
		const titleElement = document.querySelector('h3');
		if (titleElement) {
			// Scroll smoothly to the main title element
			titleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
		} else {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function renderPaginationButtons() {
		paginationControls.innerHTML = ''; // Clear existing buttons

		// Previous Button
		const prevButton = document.createElement('span');
		prevButton.textContent = '«';
		prevButton.setAttribute('aria-label', 'Previous Page');
		prevButton.classList.add('page-link', 'nav-link');
		if (currentPage > 1) {
			prevButton.addEventListener('click', () => displayPage(currentPage - 1));
		} else {
			prevButton.classList.add('disabled');
		}
		paginationControls.appendChild(prevButton);

		// Page Number Buttons (Show all pages for horizontal scroll)
		for (let i = 1; i <= totalPages; i++) {
			const button = document.createElement('a');
			button.textContent = i;
			button.classList.add('page-link');
			if (i === currentPage) {
				button.classList.add('active');
			} else {
				button.addEventListener('click', () => displayPage(i));
			}
			paginationControls.appendChild(button);
		}

		// Next Button
		const nextButton = document.createElement('span');
		nextButton.textContent = '»';
		nextButton.setAttribute('aria-label', 'Next Page');
		nextButton.classList.add('page-link', 'nav-link');
		if (currentPage < totalPages) {
			nextButton.addEventListener('click', () => displayPage(currentPage + 1));
		} else {
			nextButton.classList.add('disabled');
		}
		paginationControls.appendChild(nextButton);
	}

	// Initialize by showing the first page (only runs if totalPages > 1)
	displayPage(1);
});