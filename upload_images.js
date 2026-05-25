const fs = require('fs');
const path = require('path');

const cloudName = "dgb5o9y0v";
const uploadPreset = "ugda3w5p";
const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

const imagesDir = path.join(__dirname, 'univercelu');
const outputFile = path.join(__dirname, 'uploaded_images.json');

async function uploadFile(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);
    
    const formData = new FormData();
    formData.append('file', blob, path.basename(filePath));
    formData.append('upload_preset', uploadPreset);
    
    const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Error en subida');
    }
    
    const data = await response.json();
    return data.secure_url;
}

async function main() {
    if (!fs.existsSync(imagesDir)) {
        console.error(`La carpeta de origen '${imagesDir}' no existe.`);
        return;
    }

    const files = fs.readdirSync(imagesDir).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
    });
    
    console.log(`Encontradas ${files.length} imágenes para subir.`);
    
    let results = {};
    if (fs.existsSync(outputFile)) {
        try {
            results = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
        } catch (e) {}
    }
    
    let count = 0;
    for (const file of files) {
        count++;
        if (results[file]) {
            console.log(`[${count}/${files.length}] Saltando ${file} (ya subido).`);
            continue;
        }
        
        console.log(`[${count}/${files.length}] Subiendo ${file}...`);
        const filePath = path.join(imagesDir, file);
        try {
            const url = await uploadFile(filePath);
            results[file] = url;
            fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf8');
            console.log(`✓ Subido exitosamente: ${url}`);
        } catch (e) {
            console.error(`✕ Error al subir ${file}:`, e.message);
        }
        
        // Pequeño retardo para no saturar el servidor y respetar límites
        await new Promise(r => setTimeout(r, 600));
    }
    
    console.log('¡Proceso de subida masiva a Cloudinary finalizado con éxito!');
}

main().catch(console.error);
