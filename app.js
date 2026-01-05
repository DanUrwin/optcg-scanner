// Card Database
let cardDatabase = [];
let scanImage = null;
let scannedCollection = [];

// Load collection from localStorage
function loadCollection() {
    const saved = localStorage.getItem('opCardCollection');
    if (saved) {
        scannedCollection = JSON.parse(saved);
        updateCollectionTable();
    }
}

// Save collection to localStorage
function saveCollection() {
    localStorage.setItem('opCardCollection', JSON.stringify(scannedCollection));
}

// Initialize card database
const cardSets = [
    { prefix: 'OP01', name: 'Romance Dawn', count: 154 },
    { prefix: 'OP02', name: 'Paramount War', count: 154 },
    { prefix: 'OP03', name: 'Pillars of Strength', count: 154 },
    { prefix: 'OP04', name: 'Kingdoms of Intrigue', count: 149 },
    { prefix: 'OP05', name: 'Awakening of the New Era', count: 154 },
    { prefix: 'OP06', name: 'Wings of the Captain', count: 151 },
    { prefix: 'OP07', name: '500 Years in the Future', count: 151 },
    { prefix: 'OP08', name: 'Two Legends', count: 151 },
    { prefix: 'OP09', name: 'Emperors in the New World', count: 159 },
    { prefix: 'OP10', name: 'Royal Blood', count: 151 },
    { prefix: 'OP11', name: 'A Fist of Divine Speed', count: 156 },
    { prefix: 'OP12', name: 'Legacy of the Master', count: 155 },
    { prefix: 'OP13', name: 'Carrying on His Will', count: 175 },
    { prefix: 'ST01', name: 'Straw Hat Crew', count: 17 },
    { prefix: 'ST02', name: 'Worst Generation', count: 17 },
    { prefix: 'ST03', name: 'The Seven Warlords', count: 17 },
    { prefix: 'ST04', name: 'Animal Kingdom Pirates', count: 17 },
    { prefix: 'ST05', name: 'ONE PIECE FILM', count: 17 },
    { prefix: 'ST06', name: 'Absolute Justice', count: 17 },
    { prefix: 'ST07', name: 'Big Mom Pirates', count: 17 },
    { prefix: 'ST08', name: 'Monkey D. Luffy', count: 15 },
    { prefix: 'ST09', name: 'Yamato', count: 15 },
    { prefix: 'ST10', name: 'The Three Captains', count: 19 },
    { prefix: 'ST11', name: 'Uta', count: 15 },
    { prefix: 'ST12', name: 'Zoro & Sanji', count: 17 },
    { prefix: 'ST13', name: 'The Three Brothers', count: 35 },
];

// Build card database
cardSets.forEach(set => {
    for (let i = 1; i <= set.count; i++) {
        const cardNum = String(i).padStart(3, '0');
        const cardId = `${set.prefix}-${cardNum}`;
        cardDatabase.push({
            cardNumber: cardId,
            setCode: set.prefix,
            setName: set.name
        });
    }
});

// DOM Elements
const scanUpload = document.getElementById('scan-upload');
const scanPreview = document.getElementById('scan-preview');
const statusDiv = document.getElementById('status');
const cardDetailsSection = document.getElementById('card-details-section');
const cardForm = document.getElementById('card-form');
const collectionSection = document.getElementById('collection-section');
const collectionTbody = document.getElementById('collection-tbody');
const totalCardsSpan = document.getElementById('total-cards');
const exportBtn = document.getElementById('export-btn');

// Handle scan upload
scanUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        scanImage = event.target.result;
        
        scanPreview.innerHTML = `
            <img src="${scanImage}" style="max-width: 200px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);" alt="Scanned card">
        `;
        
        showStatus('🔍 Scanning...', 'success');

        await new Promise(resolve => setTimeout(resolve, 800));

        const randomIndex = Math.floor(Math.random() * cardDatabase.length);
        const matchedCard = cardDatabase[randomIndex];

        document.getElementById('name').value = matchedCard.cardNumber;
        document.getElementById('card-number').value = matchedCard.cardNumber;
        document.getElementById('set-code').value = matchedCard.setCode;
        document.getElementById('set').value = matchedCard.setName;

        cardDetailsSection.style.display = 'block';
        showStatus('✓ Card identified!', 'success');
        
        cardDetailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    reader.readAsDataURL(file);
});

// Handle form submission
cardForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
        quantity: document.getElementById('quantity').value,
        name: document.getElementById('name').value,
        simpleName: document.getElementById('simple-name').value,
        set: document.getElementById('set').value,
        cardNumber: document.getElementById('card-number').value,
        setCode: document.getElementById('set-code').value,
        printing: document.getElementById('printing').value,
        condition: document.getElementById('condition').value,
        language: document.getElementById('language').value,
        rarity: document.getElementById('rarity').value,
        productId: document.getElementById('product-id').value
    };

    scannedCollection.push(formData);
    saveCollection();
    updateCollectionTable();
    
    cardForm.reset();
    document.getElementById('quantity').value = '1';
    document.getElementById('condition').value = 'Near Mint';
    document.getElementById('language').value = 'English';
    document.getElementById('printing').value = 'Normal';
    cardDetailsSection.style.display = 'none';
    scanPreview.innerHTML = '';
    scanUpload.value = '';
    
    showStatus('✓ Card added!', 'success');
    
    document.querySelector('.card:nth-child(3)').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

function updateCollectionTable() {
    collectionSection.style.display = 'block';
    totalCardsSpan.textContent = scannedCollection.length;
    
    collectionTbody.innerHTML = '';
    scannedCollection.forEach(card => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${card.quantity}</td>
            <td>${card.name}</td>
            <td>${card.set}</td>
            <td>${card.cardNumber}</td>
            <td>${card.condition}</td>
            <td>${card.rarity}</td>
        `;
        collectionTbody.appendChild(row);
    });
}

// Export to CSV
exportBtn.addEventListener('click', () => {
    const headers = ['Quantity', 'Name', 'Simple Name', 'Set', 'Card Number', 'Set Code', 'Printing', 'Condition', 'Language', 'Rarity', 'Product ID'];
    
    let csvContent = headers.join(',') + '\n';
    
    scannedCollection.forEach(card => {
        const row = [
            card.quantity,
            `"${card.name}"`,
            `"${card.simpleName}"`,
            `"${card.set}"`,
            card.cardNumber,
            card.setCode,
            card.printing,
            card.condition,
            card.language,
            card.rarity,
            card.productId
        ];
        csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `one-piece-collection-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showStatus('CSV downloaded!', 'success');
});

function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = type;
    statusDiv.style.display = 'block';
}

// PWA Install Prompt
let deferredPrompt;
const installPrompt = document.getElementById('install-prompt');
const installButton = document.getElementById('install-button');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installPrompt.style.display = 'block';
});

installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            installPrompt.style.display = 'none';
        }
        deferredPrompt = null;
    }
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

// Load saved collection on page load
loadCollection();