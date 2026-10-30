const API_URL = 'http://localhost:8000';

const form = document.getElementById('shortenForm');
const originalUrlInput = document.getElementById('originalUrl');
const resultBox = document.getElementById('resultBox');
const shortUrlLink = document.getElementById('shortUrl');
const errorMsg = document.getElementById('errorMsg');
const copyBtn = document.getElementById('copyBtn');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    errorMsg.classList.add('hidden');
    resultBox.classList.add('hidden');
    
    const url = originalUrlInput.value;
    
    submitBtn.textContent = 'Acortando...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/shorten`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ original_url: url })
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        shortUrlLink.href = data.short_url;
        shortUrlLink.textContent = data.short_url;
        resultBox.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error al acortar:', error);
        errorMsg.textContent = 'Error: No se pudo conectar con el servidor backend. Verifica que la API esté en ejecución.';
        errorMsg.classList.remove('hidden');
    } finally {
        submitBtn.textContent = 'Acortar URL';
        submitBtn.disabled = false;
    }
});

copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(shortUrlLink.href);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '¡Copiado!';
        copyBtn.style.backgroundColor = '#4caf50';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = '';
        }, 2000);
    } catch (err) {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar el enlace al portapapeles');
    }
});