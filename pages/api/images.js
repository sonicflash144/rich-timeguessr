import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const directoryPath = path.join(process.cwd(), 'public', 'images');
    const files = fs.readdirSync(directoryPath);
    
    const imageExtensions = ['.heic', '.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
    });

    const imageDataPath = path.join(process.cwd(), 'public', 'autoImageData.json');
    const imageData = JSON.parse(fs.readFileSync(imageDataPath, 'utf-8'));

    const imagesWithMetadata = imageFiles.map(file => {
        const metadata = imageData[file];
        return {
            file,
            lat: metadata ? metadata.lat : null,
            lng: metadata ? metadata.lng : null,
            time: metadata ? metadata.time : null
        };
    });

    console.log(json(imagesWithMetadata));
    res.status(200).json(imagesWithMetadata);
}