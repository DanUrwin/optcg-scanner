// Card Database
let cardDatabase = [];
let scanImage = null;
let scannedCollection = [];
let ocrWorker = null;

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

// Initialize Tesseract OCR Worker
async function initOCR() {
    if (!ocrWorker) {
        console.log('Initializing OCR...');
        try {
            ocrWorker = await Tesseract.createWorker('eng');
            console.log('OCR Worker ready!');
        } catch (error) {
            console.error('OCR init failed:', error);
            return null;
        }
    }
    return ocrWorker;
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
    { prefix: 'OP14', name: 'The Azure Seas Seven', count: 156 },
    { prefix: 'PRB01', name: 'One Piece The Best', count: 319 },
    { prefix: 'PRB02', name: 'One Piece Card The Best Vol.2', count: 316 },
    { prefix: 'EB01', name: 'Memorial Collection', count: 80 },
    { prefix: 'EB02', name: 'Anime 25th Collection', count: 105 },
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

// Parse OCR text to extract card info
function parseOCRText(text) {
    console.log('Raw OCR:', text);
    
    text = text.replace(/\n/g, ' ').toUpperCase();
    
    // Card number patterns
    const patterns = [
        /(OP|ST|EB|PRB|P)\s*(\d{1,2})\s*[-–—]\s*(\d{3})/gi,
        /(OP|ST|EB|PRB|P)(\d{2})[-–—](\d{3})/gi,
        /(OP|ST|EB|PRB|P)\s*(\d{2})(\d{3})/gi
    ];
    
    let cardNumber = null;
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            cardNumber = match[0].replace(/\s+/g, '').replace(/[–—]/g, '-').toUpperCase();
            break;
        }
    }
    
    // Rarity detection
    const rarityPattern = /\b(SEC|SR|UC|L|R|C)\b/gi;
    const rarityMatches = text.match(rarityPattern);
    let rarity = null;
    if (rarityMatches && rarityMatches.length > 0) {
        rarity = rarityMatches[rarityMatches.length - 1].toUpperCase();
    }
    
    // Alt art detection
    const hasAltArt = text.includes('*') || text.includes('★') || text.includes('☆');
    
    console.log('Parsed:', { cardNumber, rarity, hasAltArt });
    return { cardNumber, rarity, hasAltArt };
}

// Find matching cards in database
function findMatchingCards(cardNumber) {
    if (!cardNumber) return [];
    
    return cardDatabase.filter(card => 
        card.cardNumber.toUpperCase() === cardNumber.toUpperCase()
    );
}

// Show card selector modal
function showCardSelector(matches, ocrData) {
    const { cardNumber, rarity, hasAltArt } = ocrData;
    
    let html = `
        <div style="background: rgba(255,215,0,0.1); border: 2px solid var(--secondary); border-radius: 15px; padding: 2rem; margin: 1.5rem 0;">
            <h3 style="font-family: 'Bebas Neue', cursive; color: var(--secondary); font-size: 1.8rem; margin-bottom: 1rem;">
                📸 OCR Results
            </h3>
            <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem;">
                <p><strong>Card Number:</strong> ${cardNumber || '❌ Not detected'}</p>
                <p><strong>Rarity:</strong> ${rarity || '❌ Not detected'}</p>
                <p><strong>Alt Art (*):</strong> ${hasAltArt ? '✓ Yes' : '✗ No'}</p>
            </div>
    `;
    
    if (matches.length === 0) {
        html += `
            <p style="color: #f44336; font-weight: bold; margin-bottom: 1rem;">
                ❌ Card not found in database
            </p>
            <p style="margin-bottom: 1rem;">Please enter manually or try again.</p>
            <button onclick="showManualEntry()" style="width: 100%;">
                ✏️ Enter Manually
            </button>
        `;
    } else if (matches.length === 1) {
        html += `
            <p style="color: #4CAF50; font-weight: bold; margin-bottom: 1rem;">
                ✅ Match Found!
            </p>
            <div style="background: rgba(76,175,80,0.1); padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
                <p><strong>${matches[0].cardNumber}</strong></p>
                <p>${matches[0].setName}</p>
            </div>
            <button onclick='fillCardForm(${JSON.stringify(matches[0])}, "${rarity}", ${hasAltArt})' style="width: 100%;">
                ✓ Use This Card
            </button>
            <button onclick="showManualEntry()" style="width: 100%; margin-top: 0.5rem; background: rgba(255,255,255,0.1);">
                ✏️ Enter Manually
            </button>
        `;
    } else {
        html += `
            <p style="color: var(--secondary); font-weight: bold; margin-bottom: 1rem;">
                🔍 Found ${matches.length} sets
            </p>
            <p style="margin-bottom: 1rem;">Which set?</p>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        `;
        
        matches.forEach(match => {
            html += `
                <button onclick='fillCardForm(${JSON.stringify(match)}, "${rarity}", ${hasAltArt})' 
                        style="width: 100%; text-align: left; padding: 1rem; background: rgba(255,255,255,0.05);">
                    <strong>${match.setCode}</strong> - ${match.setName}
                </button>
            `;
        });
        
        html += `
            </div>
            <button onclick="showManualEntry()" style="width: 100%; margin-top: 1rem; background: rgba(255,255,255,0.1);">
                ✏️ Enter Manually
            </button>
        `;
    }
    
    html += '</div>';
    scanPreview.innerHTML += html;
}

// Fill form with matched card
window.fillCardForm = function(card, rarity, hasAltArt) {
    document.getElementById('name').value = card.cardNumber;
    document.getElementById('card-number').value = card.cardNumber;
    document.getElementById('set-code').value = card.setCode;
    document.getElementById('set').value = card.setName;
    
    if (rarity) {
        const rarityMap = {
            'C': 'Common',
            'UC': 'Uncommon',
            'R': 'Rare',
            'SR': 'Super Rare',
            'SEC': 'Secret Rare',
            'L': 'Leader'
        };
        document.getElementById('rarity').value = rarityMap[rarity] || 'Rare';
    }
    
    if (hasAltArt) {
        document.getElementById('printing').value = 'Alt Art';
    }
    
    cardDetailsSection.style.display = 'block';
    showStatus('✅ Review and add to collection', 'success');
    cardDetailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Show manual entry
window.showManualEntry = function() {
    cardDetailsSection.style.display = 'block';
    showStatus('📝 Enter manually', 'success');
    cardDetailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

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

// Handle scan with OCR
scanUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        scanImage = event.target.result;
        
        scanPreview.innerHTML = `
            <img src="${scanImage}" style="max-width: 250px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);" alt="Scanned card">
        `;
        
        showStatus('🔧 Initializing OCR...', 'success');
        
        const worker = await initOCR();
        if (!worker) {
            showStatus('❌ OCR failed', 'error');
            showManualEntry();
            return;
        }
        
        showStatus('🔍 Reading card...', 'success');
        
        try {
            const { data: { text } } = await worker.recognize(scanImage);
            const ocrData = parseOCRText(text);
            const matches = findMatchingCards(ocrData.cardNumber);
            showCardSelector(matches, ocrData);
        } catch (error) {
            console.error('OCR Error:', error);
            showStatus('❌ OCR failed', 'error');
            showManualEntry();
        }
    };
    reader.readAsDataURL(file);
});

// Form submission
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

// Export CSV
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

// PWA Install
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

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

loadCollection();
