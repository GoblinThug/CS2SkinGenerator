const state = {
    skins: [],
    generated: [],
    toasts: []
};

const DOM = {
    rarity: document.querySelector('#rarity'),
    weapon: document.querySelector('#weapon'),
    result: document.querySelector('#result'),
    json: document.querySelector('#json'),
    imageWidth: document.querySelector('#imageWidth'),
    imageHeight: document.querySelector('#imageHeight'),
    count: document.querySelector('#count')
};

const STEAM_IMAGE_RATIO = 4 / 3;
const MAX_TOASTS = 3;

const WEARS = [
    'Factory New',
    'Minimal Wear',
    'Field-Tested',
    'Well-Worn',
    'Battle-Scarred'
];

const KNIFE_TYPES = [
    'knife',
    'bayonet',
    'karambit',
    'm9',
    'butterfly',
    'falchion',
    'shadow daggers',
    'bowie',
    'huntsman',
    'stiletto',
    'talon',
    'ursus',
    'navaja',
    'skeleton',
    'nomad',
    'paracord',
    'survival'
];

const RARITY_COLORS = {
    'Consumer Grade': {
        text: 'text-zinc-300',
        glow: 'shadow-zinc-400/40',
        bg: 'bg-zinc-400'
    },
    'Industrial Grade': {
        text: 'text-sky-300',
        glow: 'shadow-sky-400/40',
        bg: 'bg-sky-400'
    },
    'Mil-Spec Grade': {
        text: 'text-blue-400',
        glow: 'shadow-blue-400/40',
        bg: 'bg-blue-500'
    },
    Restricted: {
        text: 'text-purple-300',
        glow: 'shadow-purple-400/40',
        bg: 'bg-purple-500'
    },
    Classified: {
        text: 'text-pink-300',
        glow: 'shadow-pink-400/40',
        bg: 'bg-pink-500'
    },
    Covert: {
        text: 'text-red-300',
        glow: 'shadow-red-400/40',
        bg: 'bg-red-500'
    },
    Contraband: {
        text: 'text-yellow-300',
        glow: 'shadow-yellow-400/40',
        bg: 'bg-yellow-400'
    }
};

const DEFAULT_RARITY_STYLE = {
    text: 'text-zinc-300',
    glow: 'shadow-zinc-500/30',
    bg: 'bg-zinc-400'
};

function randomBool(chance = 0.25) {
    return Math.random() < chance;
}

function randomFromArray(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function randomWear() {
    return randomFromArray(WEARS);
}

function getRarityStyle(rarity) {
    return RARITY_COLORS[rarity] || DEFAULT_RARITY_STYLE;
}

function getImage(skin) {
    return skin.image || skin.image_url || skin.images?.icon || '';
}

function getWeaponDisplayName(skin) {
    return skin.weapon?.name || skin.weapon || '';
}

function isKnifeWeapon(weaponName = '') {
    const name = weaponName.toLowerCase();

    return KNIFE_TYPES.some(type => name.includes(type));
}

function getWeaponFilterName(skin) {
    const weaponName = getWeaponDisplayName(skin);

    return isKnifeWeapon(weaponName) ? 'Ножи' : weaponName;
}

function getRarityName(skin) {
    return skin.rarity?.name || skin.rarity || '';
}

function getSkinName(skin) {
    if (skin.pattern?.name) {
        return skin.pattern.name;
    }

    if (skin.name?.includes('|')) {
        return skin.name.split('|')[1].trim();
    }

    return skin.name || '';
}

function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function escapeAttr(value = '') {
    return escapeHtml(value).replaceAll('`', '&#096;');
}

function numberValue(input, fallback) {
    const value = Number(input?.value);

    return Number.isFinite(value) && value > 0 ? value : fallback;
}

function setupImageSizeRatio() {
    let syncing = false;

    DOM.imageWidth.addEventListener('input', () => {
        if (syncing) return;

        const width = numberValue(DOM.imageWidth, 0);

        if (!width) return;

        syncing = true;
        DOM.imageHeight.value = Math.round(width / STEAM_IMAGE_RATIO);
        syncing = false;
    });

    DOM.imageHeight.addEventListener('input', () => {
        if (syncing) return;

        const height = numberValue(DOM.imageHeight, 0);

        if (!height) return;

        syncing = true;
        DOM.imageWidth.value = Math.round(height * STEAM_IMAGE_RATIO);
        syncing = false;
    });
}

function createOption(value) {
    const option = document.createElement('option');

    option.value = value;
    option.textContent = value;

    return option;
}

function fillFilters() {
    const rarities = [...new Set(state.skins.map(getRarityName).filter(Boolean))].sort();
    const weapons = [...new Set(state.skins.map(getWeaponFilterName).filter(Boolean))].sort();

    DOM.rarity.append(...rarities.map(createOption));
    DOM.weapon.append(...weapons.map(createOption));
}

function getFilters() {
    return {
        rarity: DOM.rarity.value,
        weapon: DOM.weapon.value,
        width: numberValue(DOM.imageWidth, 300),
        height: numberValue(DOM.imageHeight, 225),
        count: numberValue(DOM.count, 10)
    };
}

function getFilteredSkins(filters) {
    return state.skins.filter(skin => {
        const skinRarity = getRarityName(skin);
        const skinWeapon = getWeaponFilterName(skin);

        return (!filters.rarity || skinRarity === filters.rarity) &&
            (!filters.weapon || skinWeapon === filters.weapon);
    });
}

function pickRandomItems(items, count) {
    const result = [];
    const usedIndexes = new Set();
    const limit = Math.min(count, items.length);

    while (result.length < limit) {
        const index = Math.floor(Math.random() * items.length);

        if (usedIndexes.has(index)) continue;

        usedIndexes.add(index);
        result.push(items[index]);
    }

    return result;
}

function createGeneratedItem(skin, width, height) {
    const weapon = getWeaponDisplayName(skin);
    const skinName = getSkinName(skin);
    const wear = randomWear();
    const stattrak = randomBool();

    return {
        weapon,
        weaponFilter: getWeaponFilterName(skin),
        skin: skinName,
        fullName: `${stattrak ? 'StatTrak™ ' : ''}${weapon}`,
        subtitle: `${skinName} (${wear})`,
        rarity: getRarityName(skin),
        stattrak,
        wear,
        image: getImage(skin),
        imageSize: {
            width,
            height
        }
    };
}

function setupToastContainer() {
    let container = document.querySelector('#toastContainer');

    if (container) return container;

    const oldToast = document.querySelector('#toast');

    if (oldToast) {
        oldToast.remove();
    }

    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'fixed right-6 top-16 z-[9999] flex w-[360px] max-w-[calc(100vw-48px)] flex-col gap-3 pointer-events-none';

    document.body.appendChild(container);

    return container;
}

function getToastStyle(type) {
    const styles = {
        error: {
            title: 'Ошибка',
            icon: 'bg-red-500 shadow-red-500/50',
            border: 'border-red-500/20',
            glow: 'shadow-red-500/10'
        },
        success: {
            title: 'Готово',
            icon: 'bg-emerald-500 shadow-emerald-500/50',
            border: 'border-emerald-500/20',
            glow: 'shadow-emerald-500/10'
        },
        info: {
            title: 'Информация',
            icon: 'bg-sky-500 shadow-sky-500/50',
            border: 'border-sky-500/20',
            glow: 'shadow-sky-500/10'
        }
    };

    return styles[type] || styles.error;
}

function removeToast(toast) {
    if (!toast || toast.dataset.removing === 'true') return;

    toast.dataset.removing = 'true';

    toast.classList.remove('opacity-100', 'translate-x-0', 'scale-100');
    toast.classList.add('opacity-0', 'translate-x-6', 'scale-95');

    setTimeout(() => {
        toast.remove();
        state.toasts = state.toasts.filter(item => item !== toast);
    }, 250);
}

function showToast(message, type = 'error', title = null) {
    const container = setupToastContainer();
    const style = getToastStyle(type);

    while (state.toasts.length >= MAX_TOASTS) {
        const oldToast = state.toasts.shift();
        removeToast(oldToast);
    }

    const toast = document.createElement('div');

    toast.className = `
        pointer-events-auto
        rounded-2xl
        border
        ${style.border}
        bg-zinc-950/95
        p-4
        shadow-2xl
        ${style.glow}
        backdrop-blur
        opacity-0
        translate-x-6
        scale-95
        transition-all
        duration-300
        ease-out
    `;

    toast.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full shadow-lg ${style.icon}"></div>

            <div class="min-w-0 flex-1">
                <div class="text-sm font-semibold text-white">
                    ${escapeHtml(title || style.title)}
                </div>

                <div class="mt-1 break-words text-sm text-zinc-400">
                    ${escapeHtml(message)}
                </div>
            </div>

            <button
                type="button"
                class="toast-close -mr-1 -mt-1 rounded-lg px-2 py-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                title="Закрыть"
            >
                ×
            </button>
        </div>
    `;

    container.prepend(toast);
    state.toasts.unshift(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('opacity-0', 'translate-x-6', 'scale-95');
        toast.classList.add('opacity-100', 'translate-x-0', 'scale-100');
    });

    const timer = setTimeout(() => {
        removeToast(toast);
    }, 3000);

    toast.querySelector('.toast-close')?.addEventListener('click', () => {
        clearTimeout(timer);
        removeToast(toast);
    });
}

async function copySkinImage(imageUrl) {
    try {
        const img = new Image();

        img.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageUrl;
        });

        const canvas = document.createElement('canvas');

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        canvas.getContext('2d').drawImage(img, 0, 0);

        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve);
        });

        if (!blob) {
            throw new Error('Не удалось подготовить изображение');
        }

        await navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob
            })
        ]);

        showToast('Изображение скопировано в буфер обмена', 'success');
    } catch (error) {
        console.error(error);
        showToast(error.message || 'Не удалось скопировать изображение');
    }
}

async function copyJson() {
    try {
        const jsonText = DOM.json.textContent.trim();

        if (!jsonText || jsonText === '[]') {
            showToast('Сначала сгенерируй массив', 'info');
            return;
        }

        await navigator.clipboard.writeText(jsonText);

        showToast('JSON скопирован в буфер обмена', 'success');
    } catch (error) {
        console.error(error);
        showToast(error.message || 'Не удалось скопировать JSON');
    }
}

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);

        showToast('Текст скопирован в буфер обмена', 'success');
    } catch (error) {
        console.error(error);
        showToast(error.message || 'Не удалось скопировать текст');
    }
}

function renderJson(items) {
    DOM.json.textContent = JSON.stringify(items, null, 2);
}

function renderCards(items, width, height) {
    DOM.result.innerHTML = items.map(item => createCardTemplate(item, width, height)).join('');
}

function createCardTemplate(item, width, height) {
    const rarityStyle = getRarityStyle(item.rarity);

    return `
        <div class="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-4 shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-zinc-600">

            <div class="absolute left-0 top-0 h-1 w-full ${rarityStyle.bg}"></div>

            <div class="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full ${rarityStyle.bg} opacity-25 blur-3xl transition duration-300 group-hover:opacity-45"></div>

            <div
                class="relative mb-4 flex h-48 cursor-copy items-center justify-center rounded-2xl bg-black/40"
                data-copy-image="${escapeAttr(item.image)}"
                title="Нажми, чтобы скопировать изображение"
            >
                <img
                    src="${escapeAttr(item.image)}"
                    alt="${escapeAttr(`${item.fullName} ${item.subtitle}`)}"
                    style="width:${width}px;height:${height}px"
                    class="relative z-10 max-w-[70%] object-contain drop-shadow-2xl transition duration-300 group-hover:scale-110"
                />
            </div>

            <div class="mb-4 min-h-[58px] flex flex-col">
                <div class="relative inline-block max-w-full">
                    <button
                        type="button"
                        data-copy-text="${escapeAttr(item.fullName)}"
                        class="block max-w-full cursor-copy text-left text-lg font-bold leading-tight text-white transition duration-200 hover:text-sky-300 hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.45)] active:scale-[0.98]"
                        title="Скопировать название оружия"
                    >
                        ${escapeHtml(item.fullName)}
                    </button>
                </div>

                <div class="relative mt-1 inline-block max-w-full">
                    <button
                        type="button"
                        data-copy-text="${escapeAttr(item.subtitle)}"
                        class="block max-w-full cursor-copy text-left text-sm leading-tight text-zinc-400 transition duration-200 hover:text-violet-300 hover:drop-shadow-[0_0_8px_rgba(196,181,253,0.4)] active:scale-[0.98]"
                        title="Скопировать название скина"
                    >
                        ${escapeHtml(item.subtitle)}
                    </button>
                </div>
            </div>

            <div class="space-y-2">
                <div class="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2">
                    <span class="text-xs text-zinc-500">Оружие</span>
                    <span class="text-sm font-medium text-zinc-200">${escapeHtml(item.weapon)}</span>
                </div>

                <div class="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2">
                    <span class="text-xs text-zinc-500">Рарность</span>

                    <div class="flex items-center gap-2">
                        <span class="h-2.5 w-2.5 rounded-full ${rarityStyle.bg} shadow-lg ${rarityStyle.glow}"></span>

                        <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold ${rarityStyle.text}">
                            ${escapeHtml(item.rarity)}
                        </span>
                    </div>
                </div>

                <div class="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2">
                    <span class="text-xs text-zinc-500">Тип</span>
                    <span class="text-sm font-medium ${item.stattrak ? 'text-orange-400' : 'text-zinc-300'}">
                        ${item.stattrak ? 'StatTrak™' : 'Обычный'}
                    </span>
                </div>
            </div>

        </div>
    `;
}

function generate() {
    const filters = getFilters();
    const filtered = getFilteredSkins(filters);

    if (!filtered.length) {
        state.generated = [];
        renderJson([]);
        DOM.result.innerHTML = '';
        showToast('По выбранным фильтрам ничего не найдено', 'info');
        return;
    }

    state.generated = pickRandomItems(filtered, filters.count)
        .map(skin => createGeneratedItem(skin, filters.width, filters.height));

    renderJson(state.generated);
    renderCards(state.generated, filters.width, filters.height);
}

function handleResultClick(event) {
    const imageButton = event.target.closest('[data-copy-image]');
    const textButton = event.target.closest('[data-copy-text]');

    if (imageButton) {
        copySkinImage(imageButton.dataset.copyImage);
        return;
    }

    if (textButton) {
        copyText(textButton.dataset.copyText);
    }
}

function setupWindowControls() {
    document.querySelector('#reloadApp')?.addEventListener('click', () => {
        window.cs2Api.reloadApp();
    });

    document.querySelector('#openDevTools')?.addEventListener('click', () => {
        window.cs2Api.openDevTools();
    });

    document.querySelector('#minimizeWindow')?.addEventListener('click', () => {
        window.cs2Api.minimizeWindow();
    });

    document.querySelector('#maximizeWindow')?.addEventListener('click', () => {
        window.cs2Api.maximizeWindow();
    });

    document.querySelector('#closeWindow')?.addEventListener('click', () => {
        window.cs2Api.closeWindow();
    });
}

async function init() {
    try {
        setupToastContainer();
        setupWindowControls();
        setupImageSizeRatio();

        DOM.result.addEventListener('click', handleResultClick);

        state.skins = await window.cs2Api.getSkins();

        fillFilters();

        document
            .querySelector('#generate')
            ?.addEventListener('click', generate);

        document
            .querySelector('#copyJson')
            ?.addEventListener('click', copyJson);
    } catch (error) {
        console.error(error);
        showToast(error.message || 'Не удалось запустить приложение');
    }
}

init();