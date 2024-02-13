document.addEventListener('DOMContentLoaded', function() {
	//format price
	function formatPrice(price) {
		const priceString = price.toString().replace(',', '.');

		const parts = priceString.split('.');
		const integerPart = parts[0];
		const decimalPart = parts.length > 1 ? parts[1] : '00';

		const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
		return `R$${formattedIntegerPart},${decimalPart}`;
	}
	//fechar o tooltipLookbook
	function closeTooltip() {
		const tooltipLookbook = document.getElementById('tooltipLookbook');
		tooltipLookbook.style.display = 'none';
	}

	const lookbookLinks = document.querySelectorAll('.lookbook-block a');
	const tooltipLookbook = document.getElementById('tooltipLookbook');

	lookbookLinks.forEach(function(link) {
		link.addEventListener('click', function(event) {
			event.preventDefault();
			const handle = link.getAttribute('data-handle');
			const apiUrl = `/products/${handle}.json`;

			fetch(apiUrl)
				.then(response => response.json())
				.then(data => {
					tooltipLookbook.innerHTML = '';

					const sliderContainer = document.createElement('div');
					sliderContainer.classList.add('swiper-container');

					const sliderWrapper = document.createElement('div');
					sliderWrapper.classList.add('swiper-wrapper');

					// Adiciona o item do link clicado ao início do sliderWrapper
					const swiperSlideClicked = document.createElement('div');
					swiperSlideClicked.classList.add('swiper-slide');

					const h3Clicked = document.createElement('h3');
					h3Clicked.textContent = data.product.title;

					const imgClicked = document.createElement('img');
					imgClicked.src = data.product.image.src;

					const spanClicked = document.createElement('span');
					spanClicked.classList.add('price');
					spanClicked.textContent = formatPrice(data.product.variants[0].price);

					const aClicked = document.createElement('a');
					aClicked.href = '#';
					aClicked.setAttribute('data-variant-id', data.product.variants[0].id);
					aClicked.classList.add('addCart');
					aClicked.textContent = 'Adicionar';

					aClicked.addEventListener('click', function(event) {
						event.preventDefault();
						this.classList.add('loading');
						const variantId = aClicked.getAttribute('data-variant-id');
						const items = [{
							quantity: 1,
							id: variantId
						}];
						fetch('/cart/add.js', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json'
								},
								body: JSON.stringify({
									items
								})
							})
							.then(response => response.json())
							.then(result => {
								Swal.fire({
									title: "Produto adicionado!",
									icon: "success",
									allowOutsideClick: false
								}).then(function(isConfirm) {
									if (isConfirm) {
										location.reload();
									}
								});
							})
							.catch(error => {
								console.error('Erro ao adicionar ao carrinho:', error);
							});
					});

					swiperSlideClicked.appendChild(h3Clicked);
					swiperSlideClicked.appendChild(imgClicked);
					swiperSlideClicked.appendChild(spanClicked);
					swiperSlideClicked.appendChild(aClicked);

					sliderWrapper.appendChild(swiperSlideClicked);

					const requests = [];

					lookbookLinks.forEach(function(otherLink) {
						if (otherLink !== link) {
							const otherHandle = otherLink.getAttribute('data-handle');
							const otherApiUrl = `/products/${otherHandle}.json`;

							const request = fetch(otherApiUrl)
								.then(response => response.json())
								.then(otherData => {
									const swiperSlide = document.createElement('div');
									swiperSlide.classList.add('swiper-slide');

									const h3 = document.createElement('h3');
									h3.textContent = otherData.product.title;

									const img = document.createElement('img');
									img.src = otherData.product.image.src;

									const span = document.createElement('span');
									span.classList.add('price');
									span.textContent = formatPrice(otherData.product.variants[0].price);

									const a = document.createElement('a');
									a.href = '#';
									a.setAttribute('data-variant-id', otherData.product.variants[0].id);
									a.classList.add('addCart');
									a.textContent = 'Adicionar';

									a.addEventListener('click', function(event) {
										event.preventDefault();
										this.classList.add('loading');
										const variantId = a.getAttribute('data-variant-id');
										const items = [{
											quantity: 1,
											id: variantId
										}];
										fetch('/cart/add.js', {
												method: 'POST',
												headers: {
													'Content-Type': 'application/json'
												},
												body: JSON.stringify({
													items
												})
											})
											.then(response => response.json())
											.then(result => {
												Swal.fire({
													title: "Produto adicionado!",
													icon: "success",
													allowOutsideClick: false
												}).then(function(isConfirm) {
													if (isConfirm) {
														location.reload();
													}
												});
											})
											.catch(error => {
												console.error('Erro ao adicionar ao carrinho:', error);
											});
									});

									swiperSlide.appendChild(h3);
									swiperSlide.appendChild(img);
									swiperSlide.appendChild(span);
									swiperSlide.appendChild(a);

									sliderWrapper.appendChild(swiperSlide);
								})
								.catch(error => console.error('Erro ao carregar informações do produto:', error));

							requests.push(request);
						}
					});

					//append no tooltip
					Promise.all(requests).then(() => {
						sliderContainer.appendChild(sliderWrapper);
						const paginationDiv = document.createElement('div');
						paginationDiv.classList.add('swiper-pagination');
						sliderContainer.appendChild(paginationDiv);

						tooltipLookbook.appendChild(sliderContainer);

						// Inicializa o carrossel
						const swiper = new Swiper('.swiper-container', {
							slidesPerView: 1,
							spaceBetween: 30,
							loop: false,
							autoplay: false,
							pagination: {
								el: ".swiper-pagination",
								clickable: true
							}
						});

						tooltipLookbook.style.display = 'block';

						// Adiciona o botão de fechar
						const closeButton = document.createElement('button');
						closeButton.textContent = 'Fechar';
						closeButton.classList.add('btn-fechar');
						closeButton.addEventListener('click', closeTooltip);
						tooltipLookbook.appendChild(closeButton);

						// fechar o tooltipLookbook quando clicar fora mobile
						if(window.innerWidth < 680){
							document.addEventListener('click', function(event) {
								if (!tooltipLookbook.contains(event.target) && event.target !== link) {
									closeTooltip();
								}
							});
						}
					});
				})
				.catch(error => console.error('Erro ao carregar informações do produto:', error));
		});
	});

	// fechar tooltip ao clicar fora mobile
	if(window.innerWidth < 680){
		document.addEventListener('click', function(event) {
			if (!tooltipLookbook.contains(event.target)) {
				closeTooltip();
			}
		});
	}

	//mostra regua admin
	const photoBlock = document.querySelector('.photo-block');
	if (window.Shopify.designMode == true) {
		photoBlock.classList.add('active');
	}
});