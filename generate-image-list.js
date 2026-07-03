const fs = require('fs');
const path = require('path');

const imagesDir = './images';
const outputFile = './image-list.js';

// 读取 images 文件夹里的所有文件
fs.readdir(imagesDir, (err, files) => {
    if (err) {
        console.error('读取文件夹失败:', err);
        return;
    }

    // 过滤出常见的图片后缀
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
    });

    // 生成 JS 文件，把数组暴露出去
    const content = `// 自动生成的图片列表，请勿手动编辑
const imageFiles = ${JSON.stringify(imageFiles, null, 4)};
`;

    fs.writeFile(outputFile, content, 'utf8', (err) => {
        if (err) {
            console.error('写入失败:', err);
        } else {
            console.log(`已生成 ${outputFile}，包含 ${imageFiles.length} 张图片。`);
        }
    });
});