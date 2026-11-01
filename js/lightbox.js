/* 機密保持のためにモーダルを無効化する場合は、bodyの data-modal-enabled を "false" に変更してください */
document.addEventListener('DOMContentLoaded', () => {
  // Modal Markup
  const modalHTML = `
    <div class="lightbox-modal" id="lightbox-modal">
      <button class="lightbox-close" id="lightbox-close" aria-label="閉じる">&times;</button>
      <button class="lightbox-prev" id="lightbox-prev" aria-label="前へ">&#8592;</button>
      <button class="lightbox-next" id="lightbox-next" aria-label="次へ">&#8594;</button>
      <div class="lightbox-content">
        <img src="" alt="" class="lightbox-img" id="lightbox-img" style="display: none;">
        <video src="" class="lightbox-video" id="lightbox-video" controls playsinline style="display: none;"></video>
        <div class="lightbox-caption" id="lightbox-caption"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const modalVideo = document.getElementById('lightbox-video');
  const modalCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  let currentGallery = [];
  let currentIndex = 0;

  // Initialize galleries
  const galleries = document.querySelectorAll('.bento-grid, [data-lightbox-gallery]');
  
  galleries.forEach((gallery) => {
    // Collect all media triggers: .bento-video-wrap, .bento-img, img, video
    // Filter out images/videos inside .bento-video-wrap to avoid duplicate items
    const rawItems = Array.from(gallery.querySelectorAll('.bento-video-wrap, .bento-img, img, video'));
    
    const items = [];
    rawItems.forEach((el) => {
      // If element is inside a .bento-video-wrap, ignore it (wrap itself is the trigger)
      if (el.closest('.bento-video-wrap') && !el.classList.contains('bento-video-wrap')) {
        return;
      }
      if (!items.includes(el)) {
        items.push(el);
      }
    });

    items.forEach((item, index) => {
      // Find the actual media element (img or video)
      const mediaEl = item.classList.contains('bento-video-wrap') ? item.querySelector('video, img') : item;

      // If it has a video in thumbnail, add hover preview behavior
      if (mediaEl && mediaEl.tagName.toLowerCase() === 'video') {
        item.addEventListener('mouseenter', () => {
          if (!modal.classList.contains('is-open')) {
            mediaEl.play().catch(() => {});
          }
        });
        item.addEventListener('mouseleave', () => {
          mediaEl.pause();
          mediaEl.currentTime = 0.001;
        });
      }

      item.addEventListener('click', (e) => {
        // Prevent default navigation / inline play
        e.preventDefault();

        // スイッチ判定: "false" の場合は処理を中断
        if (document.body.getAttribute('data-modal-enabled') === 'false') {
          return;
        }
        
        currentGallery = items;
        currentIndex = index;
        openModal();
      });
    });
  });

  function stopVideo() {
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.removeAttribute('src');
      modalVideo.load();
    }
  }

  function updateModal() {
    const item = currentGallery[currentIndex];
    if (!item) return;

    // Resolve inner media element if wrapped
    const mediaEl = item.classList.contains('bento-video-wrap') ? item.querySelector('video, img') : item;
    if (!mediaEl) return;

    const tagName = mediaEl.tagName.toLowerCase();
    const isVideo = tagName === 'video' ||
                    mediaEl.dataset.videoSrc ||
                    (mediaEl.src && mediaEl.src.match(/\.(mp4|mov|webm)(\?|#|$)/i));

    stopVideo();

    if (isVideo) {
      modalImg.style.display = 'none';
      modalImg.removeAttribute('src');

      modalVideo.style.display = 'block';
      const rawSrc = mediaEl.dataset.videoSrc || mediaEl.currentSrc || mediaEl.src;
      // Remove hash like #t=0.001 so it plays from 0s in modal
      const cleanSrc = rawSrc ? rawSrc.replace(/#t=[\d.]+/, '') : '';
      modalVideo.src = cleanSrc;
      modalVideo.load();

      const playPromise = modalVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay may be restricted without user gesture/sound permissions
        });
      }

      const altText = mediaEl.getAttribute('alt') || mediaEl.getAttribute('aria-label') || '動画';
      modalCaption.textContent = `${currentIndex + 1} / ${currentGallery.length} - ${altText}`;
    } else {
      modalVideo.style.display = 'none';

      modalImg.style.display = 'block';
      modalImg.src = mediaEl.src;
      const altText = mediaEl.alt || '画像';
      modalCaption.textContent = `${currentIndex + 1} / ${currentGallery.length} - ${altText}`;
    }

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
    stopVideo();
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
