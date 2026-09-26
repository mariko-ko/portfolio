/* 機密保持のためにモーダルを無効化する場合は、bodyの data-modal-enabled を "false" に変更してください */
document.addEventListener('DOMContentLoaded', () => {
  // Modal Markup
  const modalHTML = `
    <div class="lightbox-modal" id="lightbox-modal">
      <button class="lightbox-close" id="lightbox-close">&times;</button>
      <button class="lightbox-prev" id="lightbox-prev">&#8592;</button>
      <button class="lightbox-next" id="lightbox-next">&#8594;</button>
      <div class="lightbox-content">
        <img src="" alt="" class="lightbox-img" id="lightbox-img">
        <div class="lightbox-caption" id="lightbox-caption"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const modalCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  let currentGallery = [];
  let currentIndex = 0;

  // Initialize galleries
  const galleries = document.querySelectorAll('.bento-grid');
  
  galleries.forEach((gallery) => {
    const images = Array.from(gallery.querySelectorAll('.bento-img'));
    
    images.forEach((img, index) => {
      img.addEventListener('click', () => {
        // スイッチ判定: "false" の場合は処理を中断
        if (document.body.getAttribute('data-modal-enabled') === 'false') {
          return;
        }
        
        currentGallery = images;
        currentIndex = index;
        openModal();
      });
    });
  });

  function updateModal() {
    const img = currentGallery[currentIndex];
    modalImg.src = img.src;
    const altText = img.alt || '画像';
    modalCaption.textContent = `${currentIndex + 1} / ${currentGallery.length} - ${altText}`;
    modal.scrollTop = 0;
  }

  function openModal() {
    updateModal();
    modal.classList.add('is-open');
    modal.scrollTop = 0;
    document.body.style.overflow = 'hidden'; // prevent scrolling
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % currentGallery.length;
    updateModal();
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    updateModal();
  }

  // Event Listeners
  closeBtn.addEventListener('click', closeModal);
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('lightbox-content')) {
      closeModal();
    }
  });

  // Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });
});
