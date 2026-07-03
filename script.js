// ====== 配置：后端 API 地址 ======
// 本地测试用 http://127.0.0.1:5000 ，部署后改成 Render 地址
const API_BASE = 'https://Hao093.pythonanywhere.com';

// ====== 获取元素 ======
const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.close');


// 在灯箱内添加点赞和留言的容器（动态创建，避免修改 HTML）
const lightboxContent = document.createElement('div');
lightboxContent.className = 'lightbox-interact';
lightboxContent.innerHTML = `
    <div class="like-section">
        <button id="like-btn">❤️ <span id="like-count">0</span></button>
    </div>
    <div class="comment-section">
        <h3>留言</h3>
        <ul id="comment-list"></ul>
        <div class="comment-input">
            <input type="text" id="comment-text" placeholder="说点什么吧...">
            <button id="comment-submit">发送</button>
        </div>
    </div>
`;
// 插入到灯箱内部（紧贴在图片后面）
const lightboxInner = document.querySelector('.lightbox'); // 获取灯箱容器
lightboxInner.appendChild(lightboxContent);

// 当前正在查看的图片文件名（不含路径）
let currentImageId = null;

// ====== 生成图片元素（保持你原有的逻辑） ======
imageFiles.forEach(filename => {
    const img = document.createElement('img');
    img.src = `images/${filename}`;
    img.alt = filename;
    img.loading = 'lazy';

    img.addEventListener('click', () => {
        lightbox.style.display = 'flex';
        lightboxImg.src = img.src;
        currentImageId = filename;   // 记录当前图片文件名
        loadLikeAndComments(filename); // 加载点赞和留言
    });

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

// ====== 加载点赞数和留言 ======
async function loadLikeAndComments(imageId) {
    // 重置点赞数显示为 "-"
    document.getElementById('like-count').textContent = '...';
    document.getElementById('comment-list').innerHTML = '<li>加载中...</li>';

    // 获取点赞数（如果后端没有这条记录，会返回0）
    try {
        const likeRes = await fetch(`${API_BASE}/api/like/${imageId}`, { method: 'GET' });
        if (likeRes.ok) {
            const data = await likeRes.json();
            document.getElementById('like-count').textContent = data.likes;
        } else {
            // 如果接口不支持 GET 获取点赞数，我们可以自己单独请求
            // 这里暂时直接调用点赞接口但用 GET 返回数量，我们修改后端提供 GET /api/like/<id>
            // 上面后端代码没写 GET，我们补一个。
        }
    } catch (e) {
        console.error('获取点赞数失败', e);
        document.getElementById('like-count').textContent = '0';
    }

    // 获取留言列表
    try {
        const commentsRes = await fetch(`${API_BASE}/api/comments/${imageId}`);
        if (commentsRes.ok) {
            const comments = await commentsRes.json();
            const list = document.getElementById('comment-list');
            list.innerHTML = '';
            if (comments.length === 0) {
                list.innerHTML = '<li>暂无留言，快来第一个评论吧！</li>';
            } else {
                comments.forEach(c => {
                    const li = document.createElement('li');
                    li.textContent = c.text + (c.created_at ? ` (${c.created_at})` : '');
                    list.appendChild(li);
                });
            }
        }
    } catch (e) {
        console.error('获取留言失败', e);
        document.getElementById('comment-list').innerHTML = '<li>加载失败</li>';
    }
}

// ====== 点赞按钮事件 ======
document.getElementById('like-btn').addEventListener('click', async () => {
    if (!currentImageId) return;
    const btn = document.getElementById('like-btn');
    btn.disabled = true;
    try {
        const res = await fetch(`${API_BASE}/api/like/${currentImageId}`, { method: 'POST' });
        if (res.ok) {
            const data = await res.json();
            document.getElementById('like-count').textContent = data.likes;
        }
    } catch (e) {
        console.error('点赞失败', e);
    }
    btn.disabled = false;
});

// ====== 发留言事件 ======
document.getElementById('comment-submit').addEventListener('click', async () => {
    const textInput = document.getElementById('comment-text');
    const text = textInput.value.trim();
    if (!text || !currentImageId) return;

    try {
        const res = await fetch(`${API_BASE}/api/comments/${currentImageId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        if (res.ok) {
            textInput.value = '';
            // 重新加载留言列表
            loadLikeAndComments(currentImageId);
        } else {
            const err = await res.json();
            alert(err.error || '发送失败');
        }
    } catch (e) {
        console.error('发送留言失败', e);
    }
});

// ====== 关闭灯箱逻辑（不变） ======
closeBtn.addEventListener('click', () => {
    lightbox.style.display = 'none';
    currentImageId = null;
});
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.style.display = 'none';
        currentImageId = null;
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.style.display === 'flex') {
        lightbox.style.display = 'none';
        currentImageId = null;
    }
});