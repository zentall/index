const gridContainer = document.getElementById("grid-container");

// シート内プレイヤー関連
const sheetPlayerContainer = document.getElementById("sheet-player-container");
const sheetPlayer = document.getElementById("sheet-player");
const closeSheetPlayerBtn = document.getElementById("close-sheet-player");

// ボトムシート関連
const sheetOverlay = document.getElementById("sheet-overlay");
const bottomSheet = document.getElementById("bottom-sheet");
const sheetTitle = document.getElementById("sheet-title");
const sheetDate = document.getElementById("sheet-date");
const sheetRating = document.getElementById("sheet-rating");
const sheetGenres = document.getElementById("sheet-genres");
const sheetStats = document.getElementById("sheet-stats");
const sheetDesc = document.getElementById("sheet-desc");
const playTrailerBtn = document.getElementById("play-trailer-btn");

let currentMovie = null;

// 📌 日付から週の開始日（月曜日）を返す
function getWeekStart(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDay(); // 0:日曜〜6:土曜
    const diff = (day === 0 ? -6 : 1 - day); // 月曜開始にそろえる
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    return monday.toISOString().split("T")[0];
}

// 📌 日付フォーマット
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
}

// 📌 公開状況を判定
function getReleaseStatus(dateStr) {
    if (!dateStr) return { status: 'unknown', label: '日付未定', color: '#666' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const releaseDate = new Date(dateStr);
    releaseDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((releaseDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        // 既に公開済み
        return { status: 'released', label: '公開中', color: '#22c55e' };
    } else if (diffDays === 0) {
        // 本日公開
        return { status: 'today', label: '本日公開', color: '#ef4444' };
    } else if (diffDays <= 3) {
        // 今週末まで（3日以内）
        return { status: 'this-weekend', label: `${diffDays}日後`, color: '#f59e0b' };
    } else if (diffDays <= 7) {
        // 来週（7日以内）
        return { status: 'next-week', label: `${diffDays}日後`, color: '#3b82f6' };
    } else if (diffDays <= 30) {
        // 今月中
        return { status: 'this-month', label: `${diffDays}日後`, color: '#8b5cf6' };
    } else {
        // それ以降
        return { status: 'upcoming', label: '公開予定', color: '#64748b' };
    }
}

// 📌 ジャンル別配色を取得（レイヤー方式）
function getGenreGradient(genres) {
    if (!genres || genres.length === 0) {
        return {
            gradient: 'linear-gradient(135deg, #1f2937, #4b5563)',
            textColor: '#ffffff'
        };
    }

    // ジャンルごとの色定義（dark, mid, light）
    const genreColors = {
        // アクション (Action, Thriller, War, Crime)
        28: { dark: '#1f2933', mid: '#7c1d1d', light: '#dc2626', text: '#ffffff' },
        53: { dark: '#1f2933', mid: '#7c1d1d', light: '#dc2626', text: '#ffffff' },
        10752: { dark: '#1f2933', mid: '#7c1d1d', light: '#dc2626', text: '#ffffff' },
        80: { dark: '#1f2933', mid: '#7c1d1d', light: '#dc2626', text: '#ffffff' },

        // SF (Science Fiction)
        878: { dark: '#312e81', mid: '#1e40af', light: '#0ea5e9', text: '#ffffff' },

        // ドラマ (Drama, History)
        18: { dark: '#7c2d12', mid: '#c2410c', light: '#fbbf24', text: '#111827' },
        36: { dark: '#7c2d12', mid: '#c2410c', light: '#fbbf24', text: '#111827' },

        // ロマンス (Romance)
        10749: { dark: '#be185d', mid: '#db2777', light: '#fda4af', text: '#ffffff' },

        // ホラー (Horror)
        27: { dark: '#020617', mid: '#0f172a', light: '#14532d', text: '#e5e7eb' },

        // コメディ (Comedy)
        35: { dark: '#f59e0b', mid: '#fbbf24', light: '#fde047', text: '#111827' },

        // ファンタジー (Fantasy, Animation)
        14: { dark: '#4c1d95', mid: '#7c3aed', light: '#22c55e', text: '#ffffff' },
        16: { dark: '#4c1d95', mid: '#7c3aed', light: '#22c55e', text: '#ffffff' },

        // ドキュメンタリー (Documentary)
        99: { dark: '#374151', mid: '#6b7280', light: '#9ca3af', text: '#ffffff' },

        // アドベンチャー (Adventure)
        12: { dark: '#854d0e', mid: '#ca8a04', light: '#fde047', text: '#111827' },

        // ミステリー (Mystery)
        9648: { dark: '#1e293b', mid: '#475569', light: '#64748b', text: '#ffffff' },

        // ファミリー (Family)
        10751: { dark: '#0369a1', mid: '#0ea5e9', light: '#7dd3fc', text: '#ffffff' },

        // 西部劇 (Western)
        37: { dark: '#78350f', mid: '#92400e', light: '#d97706', text: '#ffffff' },

        // 音楽 (Music)
        10402: { dark: '#701a75', mid: '#a21caf', light: '#e879f9', text: '#ffffff' },

        // TV映画 (TV Movie)
        10770: { dark: '#1e3a8a', mid: '#3b82f6', light: '#93c5fd', text: '#ffffff' },
    };

    const defaultColor = { dark: '#1f2937', mid: '#374151', light: '#4b5563', text: '#ffffff' };

    // 最大3ジャンルまで使用
    const colors = genres.slice(0, 3).map(g => genreColors[g.id] || defaultColor);

    let gradient;
    let textColor = colors[0].text;

    if (colors.length === 1) {
        // 1ジャンル：シンプルな2色グラデーション
        gradient = `linear-gradient(135deg, ${colors[0].dark}, ${colors[0].light})`;
    } else if (colors.length === 2) {
        // 2ジャンル：3ポイントグラデーション（メイン→サブブレンド→メイン）
        const blendMid = blendColors(colors[0].mid, colors[1].mid);
        gradient = `linear-gradient(135deg, ${colors[0].dark}, ${blendMid}, ${colors[0].light})`;
        // テキスト色は2ジャンルの平均的な明るさで判断
        textColor = isLightGradient([colors[0], colors[1]]) ? '#111827' : '#ffffff';
    } else {
        // 3ジャンル：4ポイントグラデーション（メイン→サブ1→サブ2→メイン）
        const blend1 = blendColors(colors[0].mid, colors[1].mid);
        const blend2 = blendColors(colors[0].light, colors[2].mid);
        gradient = `linear-gradient(135deg, ${colors[0].dark}, ${blend1}, ${blend2}, ${colors[0].light})`;
        textColor = isLightGradient(colors) ? '#111827' : '#ffffff';
    }

    return { gradient, textColor };
}

// 2色をブレンド（単純平均）
function blendColors(color1, color2) {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');

    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);

    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);

    const r = Math.round((r1 + r2) / 2);
    const g = Math.round((g1 + g2) / 2);
    const b = Math.round((b1 + b2) / 2);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// グラデーションが明るいかどうか判定
function isLightGradient(colors) {
    // 黄色やオレンジ系のジャンルが含まれている場合は明るいと判定
    const lightGenres = [35, 18, 36, 12]; // コメディ、ドラマ、アドベンチャー
    return colors.some(c => c.text === '#111827');
}

// 📌 シート内プレイヤーを表示
function showSheetPlayer(videoKey) {
    if (!videoKey) return;
    sheetPlayer.src = `https://www.youtube.com/embed/${videoKey}?autoplay=1`;
    sheetPlayerContainer.classList.add('active');

    // プレイヤー位置までスクロール
    sheetPlayerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 📌 シート内プレイヤーを閉じる
function closeSheetPlayer() {
    sheetPlayer.src = '';
    sheetPlayerContainer.classList.remove('active');
}

// 📌 ボトムシートを表示
function showBottomSheet(movie) {
    currentMovie = movie;
    console.log('Showing bottom sheet for movie:', movie.title);

    // シートコンテンツを一番上にスクロール
    const sheetContent = document.querySelector('.sheet-content');
    if (sheetContent) {
        sheetContent.scrollTop = 0;
    }

    sheetTitle.textContent = movie.title;

    // 日付表示
    const displayDate = movie.jpReleaseDate || movie.releaseDate;

    sheetDate.textContent = `日本公開: ${formatDate(displayDate)}`;

    // 評価
    if (movie.voteAverage && movie.voteCount > 0) {
        const voteCountText = movie.voteCount >= 1000
            ? `${(movie.voteCount / 1000).toFixed(1)}k`
            : movie.voteCount;
        sheetRating.innerHTML = `⭐ ${movie.voteAverage.toFixed(1)} <span style="color: #666; font-size: 13px">(${voteCountText}件)</span>`;
    } else {
        sheetRating.textContent = '';
    }

    // ジャンル
    sheetGenres.innerHTML = '';
    if (movie.genres && movie.genres.length > 0) {
        movie.genres.forEach(genre => {
            const tag = document.createElement('span');
            tag.className = 'genre-tag';
            tag.textContent = genre.name;
            sheetGenres.appendChild(tag);
        });
    }

    // 統計
    sheetStats.innerHTML = '';

    // オリジナルタイトル（日本語タイトルと異なる場合のみ）
    if (movie.originalTitle && movie.originalTitle !== movie.title) {
        sheetStats.innerHTML += `
            <div class="stat-item" style="grid-column: 1 / -1;">
                <div class="stat-label">原題</div>
                <div class="stat-value" style="font-size: 14px; word-break: break-word;">${movie.originalTitle}</div>
            </div>
        `;
    }

    // 上映時間（必ず表示）
    sheetStats.innerHTML += `
        <div class="stat-item">
            <div class="stat-label">上映時間</div>
            <div class="stat-value">${movie.runtime ? movie.runtime + '分' : '―'}</div>
        </div>
    `;

    // 日本の公開状態を表示
    const releaseStatus = getReleaseStatus(displayDate);
    const statusLabel = releaseStatus.status === 'released' ? '公開中' :
        releaseStatus.status === 'today' ? '本日公開' :
            '公開予定';

    sheetStats.innerHTML += `
        <div class="stat-item">
            <div class="stat-label">状態</div>
            <div class="stat-value" style="font-size: 14px; color: ${releaseStatus.color}">${statusLabel}</div>
        </div>
    `;

    // 概要
    sheetDesc.textContent = movie.overview || '概要情報がありません';

    // 監督とキャストセクション（概要の後に追加）
    let creditsSection = document.getElementById('credits-section');
    if (!creditsSection) {
        creditsSection = document.createElement('div');
        creditsSection.id = 'credits-section';
        creditsSection.style.marginTop = '24px';
        sheetDesc.parentNode.insertBefore(creditsSection, sheetDesc.nextSibling);
    }

    creditsSection.innerHTML = '';

    // 監督
    if (movie.directors && movie.directors.length > 0) {
        const directorsHtml = movie.directors.map(d => `<span class="credit-name">${d.name}</span>`).join(', ');
        creditsSection.innerHTML += `
            <div class="credits-group">
                <div class="credits-label">監督</div>
                <div class="credits-value">${directorsHtml}</div>
            </div>
        `;
    }

    // キャスト
    if (movie.cast && movie.cast.length > 0) {
        const castHtml = movie.cast.map(c => {
            const character = c.character ? ` <span style="color: #888; font-size: 13px;">(${c.character})</span>` : '';
            return `<span class="credit-name">${c.name}${character}</span>`;
        }).join(', ');
        creditsSection.innerHTML += `
            <div class="credits-group">
                <div class="credits-label">出演</div>
                <div class="credits-value">${castHtml}</div>
            </div>
        `;
    }

    // 公式サイトリンク
    let homepageSection = document.getElementById('homepage-section');
    if (!homepageSection) {
        homepageSection = document.createElement('div');
        homepageSection.id = 'homepage-section';
        homepageSection.style.marginTop = '20px';
        creditsSection.parentNode.insertBefore(homepageSection, creditsSection.nextSibling);
    }

    if (movie.homepage) {
        homepageSection.innerHTML = `
            <a href="${movie.homepage}" target="_blank" rel="noopener noreferrer" class="homepage-btn">
                <span>🌐</span>
                <span>公式サイトを見る</span>
                <span style="font-size: 12px; opacity: 0.7;">↗</span>
            </a>
        `;
        homepageSection.style.display = 'block';
    } else {
        homepageSection.style.display = 'none';
    }

    // トレーラーボタン
    if (movie.trailerUrl) {
        // trailerUrlからvideoKeyを抽出
        const match = movie.trailerUrl.match(/(?:watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        const videoKey = match ? match[1] : null;

        if (videoKey) {
            playTrailerBtn.classList.remove('disabled');
            playTrailerBtn.onclick = () => {
                console.log('Playing trailer:', videoKey);
                showSheetPlayer(videoKey);
            };
        } else {
            playTrailerBtn.classList.add('disabled');
            playTrailerBtn.onclick = null;
        }
    } else {
        playTrailerBtn.classList.add('disabled');
        playTrailerBtn.onclick = null;
    }

    sheetOverlay.classList.remove('hidden');
    sheetOverlay.classList.add('show');
    bottomSheet.classList.add('show');
}

// 📌 ボトムシートを閉じる
function hideBottomSheet() {
    console.log('Hiding bottom sheet');
    closeSheetPlayer(); // プレイヤーも閉じる
    sheetOverlay.classList.remove('show');
    bottomSheet.classList.remove('show');
    setTimeout(() => {
        sheetOverlay.classList.add('hidden');
    }, 300);
}

// イベントリスナー
closeSheetPlayerBtn.addEventListener('click', closeSheetPlayer);
sheetOverlay.addEventListener('click', hideBottomSheet);
document.querySelector('.sheet-handle-container').addEventListener('click', hideBottomSheet);

// 現在の月のJSONファイル名を生成
function getCurrentMonthJsonFile() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `./data/movies_${year}_${month}.json`;
}

// ローカル JSON から映画データを取得して描画
const jsonFile = getCurrentMonthJsonFile();
console.log('Starting to fetch movies JSON:', jsonFile);
fetch(jsonFile)
    .then(res => {
        console.log('Fetch response:', res);
        if (!res.ok) throw new Error('Failed to load movies JSON');
        return res.json();
    })
    .then(movies => {
        console.log('Movies loaded:', movies.length, 'items');
        // movies は配列を想定
        const moviesByWeek = {};
        (movies || []).forEach(m => {
            // 日本の最新リリース日を優先、なければreleaseDate
            const displayDate = m.jpReleaseDate || m.releaseDate;
            if (!displayDate) return;

            const weekStart = getWeekStart(displayDate);
            if (!moviesByWeek[weekStart]) moviesByWeek[weekStart] = [];
            moviesByWeek[weekStart].push(m);
        });

        console.log('Movies grouped by week:', Object.keys(moviesByWeek).length, 'weeks');

        // グリッド描画（最新から順に）
        Object.keys(moviesByWeek).sort().reverse().forEach(week => {
            const section = document.createElement("div");
            section.className = "week-section";

            const title = document.createElement("div");
            title.className = "week-title";
            title.textContent = `${week}`;
            section.appendChild(title);

            const grid = document.createElement("div");
            grid.className = "movie-grid";

            moviesByWeek[week].forEach(m => {
                const card = document.createElement("div");
                card.className = "poster-card";

                // 日本の劇場公開日を使用
                const displayDate = m.jpReleaseDate || m.releaseDate;

                const posterWrapper = document.createElement("div");
                posterWrapper.className = "poster-wrapper";

                // ステータスバッジを追加（日本の公開日基準）
                const releaseStatus = getReleaseStatus(displayDate);
                const statusBadge = document.createElement("div");
                statusBadge.className = "status-badge";
                statusBadge.textContent = releaseStatus.label;
                statusBadge.style.backgroundColor = releaseStatus.color;
                posterWrapper.appendChild(statusBadge);

                if (m.posterUrl) {
                    // 画像がある場合
                    const img = document.createElement("img");
                    img.src = m.posterUrl;
                    img.alt = m.title;
                    img.loading = "lazy";
                    posterWrapper.appendChild(img);
                } else {
                    // 画像がない場合：ジャンル別デザイン
                    const genreStyle = getGenreGradient(m.genres);

                    const noImageDiv = document.createElement("div");
                    noImageDiv.className = "no-image-poster";
                    noImageDiv.style.background = genreStyle.gradient;

                    const titleOverlay = document.createElement("div");
                    titleOverlay.className = "no-image-title";
                    titleOverlay.style.color = genreStyle.textColor;
                    titleOverlay.textContent = m.title;

                    noImageDiv.appendChild(titleOverlay);
                    posterWrapper.appendChild(noImageDiv);
                }

                const infoDiv = document.createElement("div");
                infoDiv.className = "movie-info";

                const titleDiv = document.createElement("div");
                titleDiv.className = "movie-title";
                titleDiv.textContent = m.title;

                const dateDiv = document.createElement("div");
                dateDiv.className = "release-date";
                dateDiv.textContent = formatDate(displayDate);

                infoDiv.appendChild(titleDiv);
                infoDiv.appendChild(dateDiv);

                card.appendChild(posterWrapper);
                card.appendChild(infoDiv);

                // クリック → ボトムシートを表示
                card.addEventListener("click", () => {
                    console.log('Poster clicked for movie:', m.title);
                    showBottomSheet(m);
                });

                grid.appendChild(card);
            });

            section.appendChild(grid);
            gridContainer.appendChild(section);
        });
        console.log('Grid rendering completed');
    })
    .catch(err => {
        console.error('Error loading movies:', err);
        gridContainer.textContent = '映画データの読み込みに失敗しました';
    });