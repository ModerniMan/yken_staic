// Global Configuration for Branch Features
let branchConfig = {
    showPodium: true,
    showStarVolunteer: true,
    showFullVolunteersListCard: true
};

async function loadConfig() {
    try {
        const response = await fetch('config.json');
        if (response.ok) {
            const data = await response.json();
            branchConfig = { ...branchConfig, ...data };
            console.log('Successfully loaded branch configuration:', branchConfig);
        }
    } catch (err) {
        console.warn('Failed to load config.json, using defaults:', err);
    }
    applyConfigToUI();
}

function applyConfigToUI() {
    // Hide/show star inputs in sidebar
    const starInputs = document.getElementById('star-inputs-sidebar');
    if (starInputs) {
        starInputs.style.display = branchConfig.showStarVolunteer ? 'block' : 'none';
    }
}

let currentTab = 'stats';

// Portal Logic
function enterSystem(tab = 'stats') {
    const portal = document.getElementById('portal-entry');
    if (portal) {
        portal.classList.add('hidden');
    }
    // Switch to the requested tab after a short delay for smooth transition
    setTimeout(() => {
        switchTab(tab);
    }, 100);
}

// 1. Dark Mode Logic
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

if (localStorage.getItem('darkMode') === 'true') {
    body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('darkMode', isDark);
    });
}

// 1.1 Instructions Modal Logic
const modal = document.getElementById('instructions-modal');
const infoBtn = document.getElementById('info-btn');
const closeBtn = document.getElementById('close-modal');

if (infoBtn) {
    infoBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// 2. Local History - Disabled for Manual Mode
/*
const inputsToSave = ['in-w-names'];
inputsToSave.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        const saved = localStorage.getItem('autosave_' + id);
        if (saved) {
            input.value = saved;
        }
        input.addEventListener('input', (e) => {
            localStorage.setItem('autosave_' + id, e.target.value);
        });
    }
});
*/

// 3. Smart Share Logic
async function shareImage() {
    const activeTabId = document.querySelector('.tab-btn.active').dataset.tab;
    let targetId;
    if (activeTabId === 'tab-stats') targetId = 'card-stats';
    else if (activeTabId === 'tab-welcome') targetId = 'card-welcome';

    const node = document.getElementById(targetId);
    const shareBtnText = document.getElementById('share-text');
    const originalText = shareBtnText ? shareBtnText.textContent : 'Share';
    if (shareBtnText) shareBtnText.textContent = '...מכין שיתוף';

    try {
        // Use html2canvas consistent with download function
        const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: null });

        canvas.toBlob(async (blob) => {
            if (!blob) {
                console.error('Canvas to Blob failed');
                if (shareBtnText) {
                    shareBtnText.textContent = 'שגיאה';
                    setTimeout(() => { shareBtnText.textContent = originalText; }, 3000);
                }
                return;
            }

            const file = new File([blob], "yedidim_share.png", { type: "image/png" });

            // Try Native Share
            if (navigator.share && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'מחולל ידידים',
                        text: 'הנה התמונה שיצרתי במחולל!'
                    });
                    if (shareBtnText) shareBtnText.textContent = 'שיתוף הצליח!';
                } catch (shareErr) {
                    console.log('Share cancelled or failed', shareErr);
                    if (shareBtnText) shareBtnText.textContent = 'בוטל/נכשל';
                }
            } else {
                // Fallback to Clipboard
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ [blob.type]: blob })
                    ]);
                    alert("התמונה הועתקה ללוח! ניתן להדביק בוואטסאפ (Ctrl+V)");
                    if (shareBtnText) shareBtnText.textContent = 'הועתק! הדבק בוואטסאפ';
                } catch (clipErr) {
                    console.error('Clipboard failed:', clipErr);
                    alert("לא ניתן לשתף בדפדפן זה. אנא השתמש בכפתור ההורדה.");
                    if (shareBtnText) shareBtnText.textContent = 'שגיאה';
                }
            }
            if (shareBtnText) setTimeout(() => { shareBtnText.textContent = originalText; }, 3000);
        }, 'image/png');

    } catch (err) {
        console.error('Sharing generation failed:', err);
        alert("שגיאה ביצירת התמונה לשיתוף.");
        if (shareBtnText) {
            shareBtnText.textContent = 'שגיאה';
            setTimeout(() => { shareBtnText.textContent = originalText; }, 3000);
        }
    }
}

// 4. Core Logic
function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tabs .tab-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.tabs .tab-btn[data-tab="tab-${tab}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    const statsInputs = document.getElementById('inputs-stats');
    const welcomeInputs = document.getElementById('inputs-welcome');
    const statDown = document.getElementById('btn-stat-down');
    const welcomeDown = document.getElementById('btn-group-welcome');
    const cardStats = document.getElementById('card-stats');
    const cardWelcome = document.getElementById('card-welcome');
    const cardList = document.getElementById('card-volunteers-list');


    if (statsInputs) statsInputs.style.display = 'none';
    if (welcomeInputs) welcomeInputs.style.display = 'none';
    if (statDown) statDown.style.display = 'none';
    if (welcomeDown) welcomeDown.style.display = 'none';

    // Hide inactive cards
    if (cardStats) cardStats.style.display = 'none';
    if (cardWelcome) cardWelcome.style.display = 'none';
    if (cardList) cardList.style.display = 'none';

    if (tab === 'stats') {
        if (statsInputs) statsInputs.style.display = 'block';
        if (statDown) statDown.style.display = 'inline-block';
        if (cardStats) cardStats.style.display = 'flex';
        renderStats();
    } else if (tab === 'welcome') {
        if (welcomeInputs) welcomeInputs.style.display = 'block';
        if (welcomeDown) welcomeDown.style.display = 'block';
        if (cardWelcome) cardWelcome.style.display = 'flex';
        renderWelcome(); // Ensure we render
    }

    const controlsSection = document.querySelector('.controls-section');
    if (controlsSection) {
        controlsSection.style.display = (tab === 'stats') ? 'flex' : 'none';
    }

    // Dynamic Button Colors - No longer needed as they are hidden in welcome, but kept for safety if logic changes
    const btnSave = document.getElementById('btn-save-data');
    const btnLoad = document.getElementById('btn-load-data');
    if (btnSave && btnLoad && tab === 'stats') {
        // Stats Theme: Blue & Orange
        btnSave.style.background = 'linear-gradient(135deg, #1e88e5, #1565c0)';
        btnSave.style.boxShadow = '0 2px 5px rgba(21, 101, 192, 0.3)';
        btnLoad.style.background = 'linear-gradient(135deg, #fb8c00, #ef6c00)';
        btnLoad.style.boxShadow = '0 2px 5px rgba(239, 108, 0, 0.3)';
    }
}

function parseNames(text) {
    if (!text) return [];
    const lines = text.split('\n');
    let result = [];
    
    // Keywords that indicate a line is an event category summary, not a volunteer
    const eventKeywords = ['התנעה', 'הנעה', "פנצ'ר", 'פנצר', 'פנצ', 'נעול', 'דלק', 'דלת', 'שינוע', 'לחימה', 'חשמלי', 'הטענת', 'אחר', 'שמן', 'מים'];
    
    lines.forEach(line => {
        let clean = line.trim();
        if (!clean) return;
        
        // Remove ranking like "1. ", "1 - ", etc. at the start of the line
        clean = clean.replace(/^\d+[\s\.\-\)]+\s*/, '').trim();
        
        let name = "";
        let score = 0;
        
        // Option 1: Name - Score
        let match = clean.match(/^(.*?)[ \-\.\u2013\u2014:]+(\d+)$/);
        if (match) {
            name = match[1].trim();
            score = parseInt(match[2]);
        } else {
            // Option 2: Score - Name (reverse)
            let matchRev = clean.match(/^(\d+)[ \-\.\u2013\u2014:]+(.*?)$/);
            if (matchRev) {
                name = matchRev[2].trim();
                score = parseInt(matchRev[1]);
            }
        }
        
        if (name && !isNaN(score)) {
            // Check if the parsed name is actually an event category
            // We do a strict comparison to avoid filtering out volunteers named "אחרן" etc.
            const isEvent = eventKeywords.some(kw => name === kw || name.startsWith(kw + ' ') || name.endsWith(' ' + kw) || name === 'רכב נעול' || name === 'דלת טרוקה');
            if (!isEvent) {
                result.push({ name: name, score: score });
            }
        }
    });
    return result.sort((a, b) => b.score - a.score);
}

// Logic: Calculate Graph Data
function calculateGraphData() {
    const ids = ['pancer', 'hanaa', 'locked', 'fuel', 'door', 'transport', 'war', 'ev', 'other'];
    const vals = ids.map(id => {
        const el = document.getElementById('in-' + id);
        return {
            id: id,
            val: el ? (parseInt(el.value) || 0) : 0
        };
    });
    const max = Math.ceil(Math.max(...vals.map(v => v.val), 1) / 10) * 10;
    return { vals, max };
}

// Logic: Prepare Podium Data
function getPodiumData(list) {
    if (list.length === 0) list = Array(3).fill({ name: '-', score: 0 });
    return {
        top1: list[0] || { name: '-', score: 0 },
        top2: list[1] || { name: '-', score: 0 },
        top3: list[2] || { name: '-', score: 0 },
        rest: list.slice(3)
    };
}

function updateStarSelect(list) {
    const datalist = document.getElementById('star-options');
    if (!datalist) return;
    datalist.innerHTML = '';
    list.forEach(p => {
        let opt = document.createElement('option');
        opt.value = p.name;
        datalist.appendChild(opt);
    });
}

function renderStats(triggeredBySelect = false) {
    // 1. Stat Circles
    const total = document.getElementById('in-total').value || 0;
    const vols = document.getElementById('in-vols').value || 0;
    const emer = document.getElementById('in-emer').value || 0;

    const outTotal = document.getElementById('out-total');
    const outVols = document.getElementById('out-vols');
    const outEmer = document.getElementById('out-emer');

    if (outTotal) outTotal.innerText = total;
    if (outVols) outVols.innerText = vols;
    if (outEmer) outEmer.innerText = emer;

    // 2. Graph
    const graphData = calculateGraphData();
    graphData.vals.forEach(item => {
        const col = document.getElementById('col-' + item.id);
        const bar = document.getElementById('bar-' + item.id);
        if (col && bar) {
            const txt = col.querySelector('.g-val');
            if (item.val > 0) {
                col.style.display = 'flex';
                bar.style.height = (item.val / graphData.max * 100) + "%";
                if (txt) txt.innerText = item.val;
            } else {
                col.style.display = 'none';
                bar.style.height = "0%";
                if (txt) txt.innerText = "0";
            }
        }
    });

    // 3. Podium & List
    const inListStats = document.getElementById('in-list-stats');
    const rawText = inListStats ? inListStats.value : '';
    let list = parseNames(rawText);

    if (!triggeredBySelect) updateStarSelect(list);

    const { top1, top2, top3 } = getPodiumData(list);

    const podiumHeading = document.getElementById('podium-heading');
    const podiumArea = document.getElementById('podium-area');
    if (podiumArea) {
        if (!branchConfig.showPodium) {
            podiumArea.innerHTML = '';
            podiumArea.style.display = 'none';
            if (podiumHeading) podiumHeading.style.display = 'none';
        } else {
            podiumArea.style.display = 'block';
            if (podiumHeading) podiumHeading.style.display = 'block';
            podiumArea.innerHTML = `
                <div class="excellence-container">
                    <div class="podium-section">
                        <div class="podium-title">🏆 המתנדבים המובילים</div>
                        <div class="podium-wrapper">
                            <div class="podium-col place-2">
                                <div class="p-avatar" contenteditable="true">${top2.name}<br>${top2.score} אירועים</div>
                                <div class="p-block">
                                    <div class="rank-num">2</div>
                                    <div class="medal-icon"></div>
                                </div>
                            </div>
                            <div class="podium-col place-1">
                                <div class="p-avatar" contenteditable="true">${top1.name}<br>${top1.score} אירועים</div>
                                <div class="p-block">
                                    <div class="rank-num">1</div>
                                    <div class="medal-icon"></div>
                                </div>
                            </div>
                            <div class="podium-col place-3">
                                <div class="p-avatar" contenteditable="true">${top3.name}<br>${top3.score} אירועים</div>
                                <div class="p-block">
                                    <div class="rank-num">3</div>
                                    <div class="medal-icon"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        }
    }

    // 3.5 Star Volunteer
    const starArea = document.getElementById('star-area');
    const starInput = document.getElementById('in-star-select');
    const noStarCheckbox = document.getElementById('in-no-star');
    const noStar = noStarCheckbox ? noStarCheckbox.checked : false;
    const starName = starInput ? starInput.value.trim() : '';

    // Disable/enable the star select input based on checkbox
    if (starInput) starInput.disabled = noStar;

    if (!branchConfig.showStarVolunteer) {
        if (starArea) {
            starArea.innerHTML = '';
            starArea.style.display = 'none';
        }
    } else {
        if (starArea) starArea.style.display = 'block';
        if (noStar) {
            // Hide star area when "no star" is checked
            if (starArea) starArea.innerHTML = '';
        } else if (starArea && list.length > 0) {
            let starPerson;
            if (starName) {
                starPerson = list.find(p => p.name === starName);
                if (!starPerson) starPerson = { name: starName, score: '' };
            } else {
                starPerson = list[0]; // Default: top volunteer
            }

            const scoreText = starPerson.score ? `${starPerson.score} אירועים` : '';
            starArea.innerHTML = `
                <div class="star-section">
                    <div class="star-icon-box">⭐</div>
                    <div class="star-info">
                        <div class="star-label">מצטיין השבוע</div>
                        <div class="star-name" contenteditable="true">${starPerson.name}</div>
                        <div class="star-score">${scoreText}</div>
                    </div>
                </div>`;
        } else if (starArea) {
            starArea.innerHTML = '';
        }
    }

    // 4. List Card (Full volunteers list)
    const downBtn = document.getElementById('btn-stat-down');
    const listCard = document.getElementById('card-volunteers-list');
    const volunteersListContent = document.getElementById('volunteers-list-content');
    const volunteersListContentMerged = document.getElementById('volunteers-list-content-merged');

    let buttonText = branchConfig.showFullVolunteersListCard ? '📥 שמור דוח פודיום' : '📥 שמור דוח שבועי';
    let btnsHTML = `<button class="download-btn" onclick="downloadImage()">${buttonText}</button>`;

    if (list.length > 3) {
        let listHTML = '';

        // שלושת הראשונים - כרטיסים ממורכזים
        listHTML += '<div class="v-top3-cards">';
        for (let i = 0; i < Math.min(3, list.length); i++) {
            const p = list[i];
            const rank = i + 1;
            let rowClass = '';
            let medalEmoji = '';
            if (rank === 1) { rowClass = 'v-gold'; medalEmoji = '🥇'; }
            else if (rank === 2) { rowClass = 'v-silver'; medalEmoji = '🥈'; }
            else if (rank === 3) { rowClass = 'v-bronze'; medalEmoji = '🥉'; }
            listHTML += `
                <div class="v-top3-card ${rowClass}">
                    <span class="v-top3-medal">${medalEmoji}</span>
                    <span class="v-top3-name">${p.name}</span>
                    <span class="v-top3-score">${p.score} אירועים</span>
                </div>`;
        }
        listHTML += '</div>';

        // מקומות 4+ - מעל 20 בזוגות, אחרת ממורכז בשורה אחת
        if (list.length > 3) {
            const usePairs = list.length > 20;
            listHTML += usePairs ? '<div class="v-list-grid two-cols">' : '<div class="v-list-single">';
            if (usePairs) {
                for (let i = 3; i < list.length; i += 2) {
                    let row1 = list[i];
                    let row2 = list[i + 1];
                    listHTML += `
                        <div class="v-list-row">
                            <span class="v-rank">${i + 1}.</span>
                            <span class="v-name">${row1.name}</span>
                            <span class="v-score">${row1.score}</span>
                        </div>`;
                    if (row2) {
                        listHTML += `
                            <div class="v-list-row">
                                <span class="v-rank">${i + 2}.</span>
                                <span class="v-name">${row2.name}</span>
                                <span class="v-score">${row2.score}</span>
                            </div>`;
                    }
                }
            } else {
                for (let i = 3; i < list.length; i++) {
                    const p = list[i];
                    listHTML += `
                        <div class="v-list-row">
                            <span class="v-rank">${i + 1}.</span>
                            <span class="v-name">${p.name}</span>
                            <span class="v-score">${p.score}</span>
                        </div>`;
                }
            }
            listHTML += '</div>';
        }

        if (branchConfig.showFullVolunteersListCard) {
            if (volunteersListContent) volunteersListContent.innerHTML = listHTML;
            if (volunteersListContentMerged) {
                volunteersListContentMerged.innerHTML = '';
                volunteersListContentMerged.style.display = 'none';
            }
            if (currentTab === 'stats') {
                if (listCard) listCard.style.display = 'flex';
                btnsHTML += `<button class="download-btn" style="background:linear-gradient(135deg, #607d8b, #455a64); margin-top:10px;" onclick="downloadVolunteersList()">📜 הורד רשימה מלאה (${list.length}) 📥</button>`;
            }
        } else {
            if (volunteersListContentMerged) {
                volunteersListContentMerged.innerHTML = listHTML;
                if (currentTab === 'stats') volunteersListContentMerged.style.display = 'block';
            }
            if (listCard) listCard.style.display = 'none';
        }
    } else {
        if (listCard) listCard.style.display = 'none';
        if (volunteersListContentMerged) {
            volunteersListContentMerged.innerHTML = '';
            volunteersListContentMerged.style.display = 'none';
        }
    }

    if (currentTab === 'stats' && downBtn) {
        downBtn.innerHTML = btnsHTML;
    }

    // Update theme based on selection
    const themeSelect = document.getElementById('in-theme');
    if (themeSelect) {
        changeReportTheme(themeSelect.value);
    }
}

function changeReportTheme(themeName) {
    const cardStats = document.getElementById('card-stats');
    const cardVolunteersList = document.getElementById('card-volunteers-list');
    
    if (cardStats) {
        cardStats.classList.remove('theme-classic', 'theme-dark-neon', 'theme-mechanic-garage');
        cardStats.classList.add('theme-' + themeName);
    }
    if (cardVolunteersList) {
        cardVolunteersList.classList.remove('theme-classic', 'theme-dark-neon', 'theme-mechanic-garage');
        cardVolunteersList.classList.add('theme-' + themeName);
    }
    
    const themeSelect = document.getElementById('in-theme');
    if (themeSelect && themeSelect.value !== themeName) {
        themeSelect.value = themeName;
    }
}

function renderWelcome() {
    const defaultTitle = "ברוכים הבאים!";

    const mainTitleEl = document.getElementById('in-w-title');
    const subBlueEl = document.getElementById('in-w-sub-blue');
    const subRedEl = document.getElementById('in-w-sub-red');

    const mainTitle = mainTitleEl && mainTitleEl.value ? mainTitleEl.value : defaultTitle;
    const subBlue = subBlueEl ? subBlueEl.value : '';
    const subRed = subRedEl ? subRedEl.value : '';

    document.querySelectorAll('.w-title').forEach(el => el.innerText = mainTitle);
    document.querySelectorAll('.w-sub-blue').forEach(el => el.innerText = subBlue);
    document.querySelectorAll('.w-sub-red').forEach(el => el.innerText = subRed);

    // Update Names
    const inWNames = document.getElementById('in-w-names');
    const namesText = inWNames ? inWNames.value : '';
    const names = namesText.split('\n').filter(n => n.trim() !== '');
    const listFamily = document.getElementById('w-list-family');
    const listOperational = document.getElementById('w-list-operational');
    if (listFamily) listFamily.innerHTML = '';
    if (listOperational) listOperational.innerHTML = '';

    names.forEach(name => {
        let cleanName = name.replace(/\*/g, '').trim();

        let divF = document.createElement('div');
        divF.className = 'name-tag';
        divF.innerHTML = `👋 ${cleanName}`;
        if (listFamily) listFamily.appendChild(divF);

        let divO = document.createElement('div');
        divO.className = 'name-tag';
        divO.innerHTML = `🛑 ${cleanName}`;
        if (listOperational) listOperational.appendChild(divO);
    });
}

// Helper to generate canvas with consistent settings
function generateAndDownload(elementId, fileName) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error("Element not found:", elementId);
        return;
    }

    const options = {
        scale: 3, // Increased quality
        useCORS: true, // Required for server usage to handle images properly
        allowTaint: false, // Taint disabled to allow dataURL export
        logging: true, // Enable logging for debug
        backgroundColor: null,
        // Forced window size to prevent mobile styles in capture
        windowWidth: 1600,
        windowHeight: 1200,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
            const clonedEl = clonedDoc.getElementById(elementId);
            const clonedContainer = clonedDoc.getElementById('canvas-container');

            if (clonedContainer) {
                // Reset Zoom/Scale
                clonedContainer.style.transform = 'none';
                clonedContainer.style.width = 'auto';
                clonedContainer.style.height = 'auto';
                clonedContainer.style.position = 'static';
                clonedContainer.style.overflow = 'visible';
            }

            if (clonedEl) {
                // Ensure layout matches preview exactly, but render at high scale
                clonedEl.style.position = 'relative';
                clonedEl.style.transform = 'none';
                clonedEl.style.maxWidth = 'none';
                clonedEl.style.width = '500px'; // Force exact width to match CSS
                clonedEl.style.margin = '0 auto';
                clonedEl.style.boxShadow = 'none'; // Optional: remove shadow for cleaner cut
            }
        }
    };

    const btn = document.activeElement; // The button clicked
    const originalText = btn ? btn.innerText : '';
    if (btn) btn.innerText = '⏳ מעבד...';

    // Ensure fonts are loaded before capture
    document.fonts.ready.then(() => {
        html2canvas(element, options).then(canvas => {
            let link = document.createElement("a");
            link.download = fileName;
            link.href = canvas.toDataURL("image/png");
            link.click();
            if (btn) btn.innerText = originalText;
        }).catch(err => {
            console.error("Export failed:", err);
            alert("שגיאה ביצירת התמונה: " + err.message);
            if (btn) btn.innerText = originalText;
        });
    });
}

function downloadImage() {
    generateAndDownload('card-stats', 'yedidim_stats.png');
}

function downloadWelcome(type) {
    let targetId = (type === 'family') ? 'card-welcome-family' : 'card-welcome-operational';
    generateAndDownload(targetId, `yedidim_welcome_${type}.png`);
}

function downloadVolunteersList() {
    generateAndDownload('card-volunteers-list', 'yedidim_stats_full_list.png');
}

// --- Template URL System (Restored) ---
function copyTemplateLink() {
    const params = new URLSearchParams();
    const inputs = document.querySelectorAll('input[id^="in-"], textarea[id^="in-"]');
    inputs.forEach(input => {
        if (input.value && input.value.trim() !== '') params.set(input.id, input.value);
    });
    const branch = document.querySelector('.logo-text .highlight');
    if (branch) params.set('branch', branch.innerText);
    const subtitle = document.querySelector('.card-subtitle');
    if (subtitle) params.set('subtitle', subtitle.innerText);

    const url = window.location.origin + window.location.pathname + '?' + params.toString();

    navigator.clipboard.writeText(url).then(() => {
        alert("הקישור נשמר ללוח! 🔗\n(שמור במועדפים)");
    }).catch(err => {
        prompt("העתק ידנית:", url);
    });
}

function loadParamsFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (Array.from(params).length === 0) return;
    params.forEach((val, key) => {
        if (key === 'branch') {
            document.querySelectorAll('.logo-text .highlight').forEach(el => el.innerText = val);
        } else if (key === 'subtitle') {
            document.querySelectorAll('.card-subtitle').forEach(el => el.innerText = val);
        } else {
            const el = document.getElementById(key);
            if (el) el.value = val;
        }
    });
}

// Ensure Layout
window.addEventListener('load', resizePreview);
setTimeout(resizePreview, 100);

function scrollToPreview() {
    const el = document.querySelector('.preview-area');
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
    } else {
        // Fallback if class missing (compat)
        const container = document.getElementById('canvas-container');
        if (container) container.scrollIntoView({ behavior: 'smooth' });
    }
}

// Generic Auto-Scale for Side-by-Side or Single
function resizePreview() {
    const container = document.getElementById('canvas-container');
    const wrapper = document.querySelector('.preview-area');
    if (!container || !wrapper) return;

    // Reset transform to measure true dimensions
    container.style.transform = 'none';
    container.style.transition = 'none';
    container.style.marginBottom = '0';

    // Force Layout Measure
    void container.offsetHeight;

    // Use scrollWidth to capture Side-by-Side width (e.g. 1040px)
    const contentWidth = container.scrollWidth;
    const contentHeight = container.scrollHeight;
    const availableWidth = wrapper.clientWidth - 40; // More padding

    let scale = 1;

    if (availableWidth > 1100) {
        // Desktop Large - Scale Up slightly (safer)
        scale = Math.min(1.4, (availableWidth - 50) / contentWidth);
        scale = Math.max(1, scale);
    } else {
        // Desktop Small / Tablet - Fit to width
        scale = Math.min(1, availableWidth / contentWidth);
    }

    // Apply Scale
    if (scale !== 1) {
        container.style.transition = 'transform 0.3s ease';
        container.style.transform = `scale(${scale})`;
        container.style.transformOrigin = 'top center'; // Keep centered origin

        // Adjust vertical space
        if (scale > 1) {
            const extraHeight = contentHeight * (scale - 1);
            container.style.marginBottom = `${extraHeight + 30}px`;
        } else {
            const lostHeight = contentHeight * (1 - scale);
            container.style.marginBottom = `-${lostHeight * 0.8}px`;
        }
    } else {
        container.style.transition = 'transform 0.3s ease';
    }
}

window.addEventListener('resize', resizePreview);
// Call on load and updates
window.addEventListener('load', async () => {
    // loadData(); // Auto-load removed
    await loadConfig();
    loadParamsFromURL(); // Still load from URL if present (legacy sharing)
    resizePreview();
    // Force initial state to hide inactive cards
    switchTab('stats');
});

// Hook into switchTab to update scale based on content
const originalSwitch = switchTab;
switchTab = function (tab) {
    originalSwitch(tab);
    setTimeout(resizePreview, 100); // Trigger resize after tab change
};

// --- Manual Save/Load System (JSON) ---
function exportProjectData() {
    const data = {};
    // Inputs
    document.querySelectorAll('input, textarea, select').forEach(el => {
        if (el.id && el.id !== 'file-upload') { // Exclude file input
            if (el.type === 'checkbox' || el.type === 'radio') {
                data[el.id] = el.checked;
            } else {
                data[el.id] = el.value;
            }
        }
    });

    // Content Editable Elements
    const statsHeader = document.querySelector('#card-stats h1');
    if (statsHeader) data['stats_h1'] = statsHeader.innerText;

    const statsSub = document.querySelector('#card-stats .header-section span');
    if (statsSub) data['stats_sub'] = statsSub.innerText;

    // Card Headings (contenteditable)
    const cardHeadings = document.querySelectorAll('#card-stats .card-heading');
    cardHeadings.forEach((el, i) => {
        data['card_heading_' + i] = el.innerText;
    });

    // Card Footer
    const cardFooter = document.querySelector('#card-stats .card-footer');
    if (cardFooter) data['stats_footer'] = cardFooter.innerText;

    // Welcome Card contenteditable elements
    const wTitleFamily = document.querySelector('#card-welcome-family .w-title');
    if (wTitleFamily) data['w_title_family'] = wTitleFamily.innerText;
    const wSubBlue = document.querySelector('#card-welcome-family .w-sub-blue');
    if (wSubBlue) data['w_sub_blue_card'] = wSubBlue.innerText;
    const wFooterBlue = document.querySelector('#card-welcome-family .footer-msg');
    if (wFooterBlue) data['w_footer_blue'] = wFooterBlue.innerHTML;

    const wTitleOp = document.querySelector('#card-welcome-operational .w-title');
    if (wTitleOp) data['w_title_op'] = wTitleOp.innerText;
    const wSubRed = document.querySelector('#card-welcome-operational .w-sub-red');
    if (wSubRed) data['w_sub_red_card'] = wSubRed.innerText;
    const wFooterRed = document.querySelector('#card-welcome-operational .footer-msg');
    if (wFooterRed) data['w_footer_red'] = wFooterRed.innerHTML;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const date = new Date().toISOString().slice(0, 10);
    downloadAnchorNode.setAttribute("download", "yedidim_project_" + date + ".ydm");
    document.body.appendChild(downloadAnchorNode); // Required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importProjectData(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            applyProjectData(data);
            alert("הפרויקט נטען בהצלחה! 📂");
        } catch (err) {
            console.error("Error parsing JSON:", err);
            alert("שגיאה בטעינת הקובץ. וודא שזהו קובץ נתונים תקין (.ydm).");
        }
        // Reset input so same file can be selected again if needed
        input.value = '';
    };
    reader.readAsText(file);
}

function applyProjectData(data) {
    // Restore Inputs
    for (const [id, val] of Object.entries(data)) {
        const el = document.getElementById(id);
        if (el) {
            if (el.type === 'checkbox' || el.type === 'radio') {
                el.checked = val;
            } else {
                el.value = val;
            }
        }
    }

    // Restore Stats Titles
    if (data['stats_h1']) {
        const h1 = document.querySelector('#card-stats h1');
        if (h1) h1.innerText = data['stats_h1'];
    }
    if (data['stats_sub']) {
        const sub = document.querySelector('#card-stats .header-section span');
        if (sub) sub.innerText = data['stats_sub'];
    }

    // Restore Card Headings
    const cardHeadings = document.querySelectorAll('#card-stats .card-heading');
    cardHeadings.forEach((el, i) => {
        if (data['card_heading_' + i]) el.innerText = data['card_heading_' + i];
    });

    // Restore Card Footer
    if (data['stats_footer']) {
        const footer = document.querySelector('#card-stats .card-footer');
        if (footer) footer.innerText = data['stats_footer'];
    }

    // Render Updates (generates podium, star, etc.)
    renderStats();
    renderWelcome();

    // Restore Welcome contenteditable (after render so elements exist)
    if (data['w_title_family']) {
        const el = document.querySelector('#card-welcome-family .w-title');
        if (el) el.innerText = data['w_title_family'];
    }
    if (data['w_sub_blue_card']) {
        const el = document.querySelector('#card-welcome-family .w-sub-blue');
        if (el) el.innerText = data['w_sub_blue_card'];
    }
    if (data['w_footer_blue']) {
        const el = document.querySelector('#card-welcome-family .footer-msg');
        if (el) el.innerHTML = data['w_footer_blue'];
    }
    if (data['w_title_op']) {
        const el = document.querySelector('#card-welcome-operational .w-title');
        if (el) el.innerText = data['w_title_op'];
    }
    if (data['w_sub_red_card']) {
        const el = document.querySelector('#card-welcome-operational .w-sub-red');
        if (el) el.innerText = data['w_sub_red_card'];
    }
    if (data['w_footer_red']) {
        const el = document.querySelector('#card-welcome-operational .footer-msg');
        if (el) el.innerHTML = data['w_footer_red'];
    }
}

// ======================================================
//   📧 Email Parser - הדבקת מייל מעוגן
// ======================================================
function openEmailModal() {
    const modal = document.getElementById('email-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('email-paste-area').value = '';
        document.getElementById('email-paste-area').focus();
    }
}

function closeEmailModal() {
    const modal = document.getElementById('email-modal');
    if (modal) modal.classList.add('hidden');
}

function parseEmail() {
    const text = document.getElementById('email-paste-area').value;
    if (!text.trim()) { alert('לא הודבק תוכן'); return; }

    // 1. סה"כ אירועים
    const totalMatch = text.match(/(?:סך הכל|סה"כ)\s*(?:אירועים|קריאות|פעילויות)?\s*[-–—:]?\s*(\d+)/) ||
                       text.match(/(?:אירועים|קריאות|פעילויות)\s*(?:סה"כ|סך הכל)\s*[-–—:]?\s*(\d+)/) ||
                       text.match(/סך הכל\s+(\d+)\s+(?:אירועים|קריאות|פעילויות)/);
    if (totalMatch) setField('in-total', totalMatch[1]);

    // 2. מספר מתנדבים
    const volsMatch = text.match(/(\d+)\s+(?:מתנדבים|כוננים)/) ||
                      text.match(/(?:מתנדבים|כוננים)(?:\s+שהשתתפו|\s+השתתפו)?\s*[-–—:]?\s*(\d+)/) ||
                      text.match(/(?:כמות|מספר)\s+(?:מתנדבים|כוננים)\s*[-–—:]?\s*(\d+)/);
    if (volsMatch) setField('in-vols', volsMatch[1]);

    // 2.5 אירועי חירום
    const emerMatch = text.match(/(?:אירועי\s+)?חירום\s*[-–—:]?\s*(\d+)/);
    if (emerMatch) setField('in-emer', emerMatch[1]);

    // 3. התפלגות קטגוריות
    const lines = text.split('\n');
    const categoryValues = {
        'in-hanaa': 0,
        'in-pancer': 0,
        'in-locked': 0,
        'in-fuel': 0,
        'in-door': 0,
        'in-transport': 0,
        'in-war': 0,
        'in-ev': 0,
        'in-other': 0
    };

    lines.forEach(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return;

        let m;
        if (m = cleanLine.match(/^(?:הנעה|התנעה)\s*[-–—:]?\s*(\d+)$/)) {
            categoryValues['in-hanaa'] += parseInt(m[1]);
        } else if (m = cleanLine.match(/^פנצ['\u05F3\u2019]?ר\s*[-–—:]?\s*(\d+)$/)) {
            categoryValues['in-pancer'] += parseInt(m[1]);
        } else if (m = cleanLine.match(/^(?:רכב\s+)?נעול\s*[-–—:]?\s*(\d+)$/)) {
            categoryValues['in-locked'] += parseInt(m[1]);
        } else if (m = cleanLine.match(/^(?:דלק|שמן[\+\/\\ ]+מים|מים[\+\/\\ ]+שמן|שמן\/מים\/דלק)\s*[-–—:]?\s*(\d+)$/)) {
            categoryValues['in-fuel'] += parseInt(m[1]);
        } else if (m = cleanLine.match(/^(?:דלת|דלת\s+טרוקה)\s*[-–—:]?\s*(\d+)$/)) {
            categoryValues['in-door'] += parseInt(m[1]);
        } else if (m = cleanLine.match(/^שינוע\s*[-–—:]?\s*(\d+)$/)) {
            categoryValues['in-transport'] += parseInt(m[1]);
        } else if (m = cleanLine.match(/^(?:לחימה|זמן\s+לחימה)\s*[-–—:]?\s*(\d+)$/)) {
            categoryValues['in-war'] += parseInt(m[1]);
        } else if (m = cleanLine.match(/^(?:רכב\s+חשמלי|הטענת\s+רכב\s+חשמלי|חשמלי|הטענה)\s*[-–—:]?\s*(\d+)$/)) {
            categoryValues['in-ev'] += parseInt(m[1]);
        } else if (m = cleanLine.match(/^אחר\s*[-–—:]?\s*(\d+)$/)) {
            categoryValues['in-other'] += parseInt(m[1]);
        }
    });

    for (const [fieldId, val] of Object.entries(categoryValues)) {
        setField(fieldId, val.toString());
    }

    // 4. רשימת מתנדבים
    const listMatch = text.match(/(?:רשימת\s+(?:כל\s+)?(?:המתנדבים|הכוננים|החברים)|דירוג\s+(?:המתנדבים|הכוננים|החברים)|טבלת\s+(?:המתנדבים|הכוננים|החברים))[^\n]*\n([\s\S]*?)(?:עד כאן הספירה|בברכה|שבת שלום|$|על מנת|הדוח המלא)/);
    
    let volunteerLines = [];
    const excludeKeywords = ['סה"כ', 'סך הכל', 'אירועים', 'מתנדבים', 'כוננים', 'השתתפו', 'קריאות', 'חירום', 'התנעה', 'הנעה', 'פנצ', 'נעול', 'דלק', 'דלת', 'שינוע', 'לחימה', 'חשמלי', 'הטענת', 'אחר', 'שמן', 'מים', 'תודה', 'השתדלות', 'אזרחי'];
    
    if (listMatch) {
        const rawLines = listMatch[1].trim().split('\n');
        rawLines.forEach(l => {
            const clean = l.trim();
            if (!clean) return;
            const hasExclude = excludeKeywords.some(kw => clean.includes(kw));
            if (hasExclude) return;
            if (clean.match(/\d+/) && clean.replace(/^\d+[\s\.\-\)]+\s*/, '').trim().match(/^(.+?)\s*[-–—:]?\s*(\d+)\s*(?:אירועים)?$/)) {
                volunteerLines.push(clean);
            }
        });
    }
    
    if (volunteerLines.length === 0) {
        const volunteerMap = {};
        lines.forEach(l => {
            const clean = l.trim();
            if (!clean) return;
            if (clean.endsWith(':')) return;
            const hasExclude = excludeKeywords.some(kw => clean.includes(kw));
            if (hasExclude) return;
            
            let cleanLine = clean.replace(/^\d+[\s\.\-\)]+\s*/, '').trim();
            const m = cleanLine.match(/^(.+?)\s*[-–—:]?\s*(\d+)\s*(?:אירועים)?$/);
            if (m) {
                const name = m[1].trim();
                const count = parseInt(m[2]);
                if (name && !isNaN(count)) {
                    volunteerMap[name] = (volunteerMap[name] || 0) + count;
                }
            }
        });
        
        const sortedVolunteers = Object.entries(volunteerMap)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => `${name} - ${count}`);
            
        volunteerLines = sortedVolunteers;
    } else {
        volunteerLines = volunteerLines.map(l => {
            let cleanLine = l.replace(/^\d+[\s\.\-\)]+\s*/, '').trim();
            const m = cleanLine.match(/^(.+?)\s*[-–—:]?\s*(\d+)\s*(?:אירועים)?$/);
            return m ? `${m[1].trim()} - ${m[2]}` : cleanLine;
        });
    }

    if (volunteerLines.length > 0) {
        const listArea = document.getElementById('in-list-stats');
        if (listArea) listArea.value = volunteerLines.join('\n');
    }

    renderStats();
    closeEmailModal();
}

function setField(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

// Removed Auto-Save Listeners per user request
// window.addEventListener('input', saveData); 
// document.body.addEventListener('blur', ...) 

function resetData() {
    if (confirm("האם לאפס את כל הנתונים?")) {
        document.querySelectorAll('input, textarea').forEach(el => el.value = '');
        location.reload();
    }
}
