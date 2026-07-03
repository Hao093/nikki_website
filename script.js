const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.close');

// 生成图片元素
imageFiles.forEach(filename => {
    const img = document.createElement('img');
    img.src = `images/${filename}`;
    img.alt = filename;
    img.loading = 'lazy';

    // 点击放大逻辑不变
    img.addEventListener('click', () => {
        lightbox.style.display = 'flex';
        lightboxImg.src = img.src;
    });

    // 给每张图包一个 div，Masonry 要求直接子元素是 item
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.appendChild(img);
    gallery.appendChild(item);
});

window.addEventListener('load', () => {
    const items = document.querySelectorAll('.gallery-item img');
    items.forEach(img => {
        if (img.naturalWidth / img.naturalHeight > 1.5) {
            img.parentElement.classList.add('wide');
        }
    });

    const msnry = new Masonry(gallery, {
        itemSelector: '.gallery-item',
        columnWidth: 250,
        gutter: 15,
    });

    // 确保居中
    gallery.style.marginLeft = 'auto';
    gallery.style.marginRight = 'auto';
});

// ====== 关闭灯箱 ======
closeBtn.addEventListener('click', () => {
    lightbox.style.display = 'none';
});

// 点击背景黑色区域也可关闭
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.style.display = 'none';
    }
});

// 按 ESC 键关闭（提升体验）
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.style.display === 'flex') {
        lightbox.style.display = 'none';
    }
});