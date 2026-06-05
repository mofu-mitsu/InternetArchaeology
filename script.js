// --- 状態管理 ---
let state = {
    points: 0,
    digCount: 0,
    rank: "見習い発掘者",
    foundIds: new Set(),
    unlockedAchievements: new Set()
};
let lastDugSite = null;

// --- ランクと解放条件 ---
const ranks = [
    { name: "見習い発掘者", pt: 0 },
    { name: "発掘者", pt: 100, unlock: "古代プロフ" },
    { name: "研究員", pt: 300, unlock: "テキストサイト" },
    { name: "主任研究員", pt: 500, unlock: "Flash" },
    { name: "教授", pt: 800, unlock: "お絵かき掲示板" },
    { name: "伝説の考古学者", pt: 1500, unlock: "VIP" },
    { name: "神の観測者", pt: 3000, unlock: "M2K" }
];

const raritySettings = {
    "Unknown": { color: "var(--rarity-unknown)", pt: 10 },
    "Rare": { color: "var(--rarity-rare)", pt: 50 },
    "Epic": { color: "var(--rarity-epic)", pt: 100 },
    "Legendary": { color: "var(--rarity-legendary)", pt: 300 },
    "Mythic": { color: "var(--rarity-mythic)", pt: 500 },
    "DevRelic": { color: "var(--rarity-relic)", pt: 1000 }
};

// --- 図鑑DB (マンデー提案の階層分け＋侍魂修正) ---
const realDB = [
    { id: "P01", category: "古代プロフ", title: "前略プロフィール", year: 2006, rarity: "Rare", desc: "学生たちがこぞって自己紹介を書いていたプロフサイト跡地。", url: "http://web.archive.org/web/20061109015949/http://pr.cgiboy.com/" },
    { id: "T01", category: "テキストサイト", title: "侍魂", year: 2002, rarity: "Legendary", desc: "テキストサイトの金字塔。「先行者」の記事が社会現象になった。", url: "http://web.archive.org/web/20020603004313/http://www.geocities.co.jp/SiliconValley/4358/" },
    { id: "F01", category: "Flash", title: "ゴノレゴシリーズ", year: 2005, rarity: "Epic", desc: "吉野家コピペなどをFlashアニメ化した伝説のコンテンツ跡地。", url: "http://web.archive.org/web/20050826002013/http://www.geocities.jp/poe_k_f/g-1.html" },
    { id: "O01", category: "お絵かき掲示板", title: "OekakiBBS跡地", year: 2004, rarity: "Epic", desc: "Javaアプレットで動いていたお絵かき掲示板。現在は動かない。", url: "http://web.archive.org/web/20040605000000/http://www.oekakibbs.com/" },
    { id: "V01", category: "VIP", title: "阿部寛のホームページ", year: 2003, rarity: "Mythic", desc: "インターネット史上最も表示が速いとされるSSR遺跡。ついに辿り着いた。", url: "http://web.archive.org/web/20030206193910/http://homepage3.nifty.com/abe-hiroshi/" },
    { id: "V02", category: "VIP", title: "2ちゃんねる (初期)", year: 2001, rarity: "Mythic", desc: "巨大掲示板の最初期の姿。壷のAAが置かれている。", url: "http://web.archive.org/web/20010124083300/http://www.2ch.net/" }
];

// --- 🌟 M&2K ツール群 (全41種搭載！) ---
const mitsukiSites = [
    { title: "夢コード", url: "https://mofu-mitsu.github.io/dream-code/", desc: "AIキャラと戦う心理学アドベンチャー。" },
    { title: "モデルA・ビルダー", url: "https://mofu-mitsu.github.io/model-a-builder/", desc: "ソシオニクスの「モデルA」を構築・判定。" },
    { title: "MBTIモヤモヤ解剖室", url: "https://mofu-mitsu.github.io/mbti-moyamuya/", desc: "類型学への違和感を論理的に解剖。" },
    { title: "思考暴走シミュレーター", url: "https://mofu-mitsu.github.io/LII_simulator/", desc: "LII/INTJの脳内メモリの限界を追体験。" },
    { title: "Deep Cognition", url: "https://mofu-mitsu.github.io/Deep-Cognition-Archive/", desc: "心理機能から深層タイプを精密に観測。" },
    { title: "闇観測実験アーカイブ", url: "https://mofu-mitsu.github.io/yami_kansoku_archive/", desc: "あなたの心の奥底の闇を暴き出す。" },
    { title: "恋愛4タイプ診断", url: "https://mofu-mitsu.github.io/love-type-diagnosis/", desc: "ソシオニクス的恋愛スタイルを判定。" },
    { title: "ソシオTi強度チェッカー", url: "https://mofu-mitsu.github.io/logic-playground/", desc: "内的論理の強度とポジションを判定。" },
    { title: "創作16タイプ診断", url: "https://mofu-mitsu.github.io/creator-brain-log/", desc: "16タイプで創作スタイルを分析。" },
    { title: "ふわふわ相性診断", url: "https://mofu-mitsu.github.io/fluffy-love-check/", desc: "2人の名前を入れると相性を占うよ♡" },
    { title: "気まぐれ猫占い", url: "https://mofu-mitsu.github.io/yuuki_fortune/", desc: "猫占い師ゆうきくんが未来を鑑定🔮" },
    { title: "Chroma Log", url: "https://mofu-mitsu.github.io/chroma-log/", desc: "1658万色から深層心理をカラー化。" },
    { title: "Gモデル診断", url: "https://mofu-mitsu.github.io/Wonderland-G-Tracker/", desc: "最新理論で社会的使命を暴く。" },
    { title: "理想のソシオ恋愛診断", url: "https://mofu-mitsu.github.io/ideal-partner-diagnosis/", desc: "真に求める理想の恋人タイプを算出。" },
    { title: "認知機能ダイブ", url: "https://mofu-mitsu.github.io/cognitive-dive/", desc: "行動から心理機能を測る体感型MBTI測定。" },
    { title: "推しキャラプロフ", url: "https://mofu-mitsu.github.io/oshi-profile-maker/", desc: "推しの魅力を詰め込んだプロフ画像作成。" },
    { title: "推しキャラプロフ2", url: "https://mofu-mitsu.github.io/oshi-profile-maker2/", desc: "デザイン一新！可愛く推しを紹介。" },
    { title: "オリキャラプロフ", url: "https://mofu-mitsu.github.io/orikyara-profile-maker/", desc: "圧倒的人気！設定画風シートが作れるメーカー。" },
    { title: "オリキャラプロフ2", url: "https://mofu-mitsu.github.io/orikyara-profile-maker2/", desc: "デザイン一新！うちの子の魅力を1枚に。" },
    { title: "学生証ファクトリー", url: "https://mofu-mitsu.github.io/Character-Student-ID-Factory/", desc: "推しやオリキャラの学生証がすぐ作れる！" },
    { title: "推し名刺ジェネレーター", url: "https://mofu-mitsu.github.io/oshi-card-generator/", desc: "イベントやオフ会で使える推しの名刺。" },
    { title: "推し愛爆発♡カード", url: "https://mofu-mitsu.github.io/oshiai-card-maker/", desc: "推しの尊さを1枚の画像に凝縮！" },
    { title: "推しとお出かけプラン", url: "https://mofu-mitsu.github.io/oshi-date-maker/", desc: "推しとの理想のデートプランを自動生成。" },
    { title: "Psycho-Shooter", url: "https://mofu-mitsu.github.io/Psycho-Shooter/", desc: "ネガティブな感情を撃ち抜くシューティング！" },
    { title: "とりの丘トリ’S人狼", url: "https://mofu-mitsu.github.io/Torinooka-Werewolf/", desc: "とりの丘学園のAIキャラたちと人狼勝負！" },
    { title: "世界観メーカー", url: "https://mofu-mitsu.github.io/world-maker/", desc: "創作の世界観設定をランダムに生成！" },
    { title: "設定資料集ジェネレーター", url: "https://mofu-mitsu.github.io/lore-book-maker/", desc: "設定を1冊のPDF資料集として出力！" },
    { title: "相関図メーカー", url: "https://mofu-mitsu.github.io/orikyara-relationship-chart/", desc: "キャラ同士の関係を線で整理！" },
    { title: "夢日記メーカー", url: "https://mofu-mitsu.github.io/yumekawa-dream-card/", desc: "見た夢をカードにして記録しよう。" },
    { title: "うちの子観察チェック", url: "https://mofu-mitsu.github.io/uchinoko-check-sheet/", desc: "オリキャラを深く知るための質問リスト！" },
    { title: "顔文字メーカー", url: "https://mofu-mitsu.github.io/kaomoji-maker/", desc: "自分だけのオリジナル顔文字を作ろう！" },
    { title: "タイピングマスター", url: "https://mofu-mitsu.github.io/typing-Master/", desc: "スコアアタックに挑戦してね！" },
    { title: "献立メーカー", url: "https://mofu-mitsu.github.io/kondate-maker/", desc: "シェフが勝手に献立を決めてくれるよ！" },
    { title: "Cocotte Simple Memo", url: "https://cocotte-simple-memo.vercel.app/", desc: "ブラウザで使えるメモツール" },
    { title: "大富豪", url: "https://daifugo-mofu.vercel.app/", desc: "ブラウザで遊べる大富豪" },
    { title: "ソリティア", url: "https://mirintea-solitaire.vercel.app/", desc: "ブラウザで遊べるソリティア" },
    { title: "Tori's Project BOOTH", url: "https://torisproject.booth.pm/", desc: "M&2KのBOOTHショップ" },
    { title: "アメブロ", url: "https://ameblo.jp/erunea-log/", desc: "ソラ家のアメブロ（個人ブログ）" },
    { title: "note (ni_intp)", url: "https://note.com/ni_intp", desc: "にー観測所のnote" },
    { title: "note (sorake)", url: "https://note.com/sorake", desc: "M&2Kのnote" },
    { title: "Mofu-Mitsu Portfolio", url: "https://mofu-mitsu.github.io/", desc: "M&2Kのポータルサイト" }
];

// --- 実績リスト ---
const achievements = [
    { id: "first", name: "初めての発掘", desc: "1回目の発掘を完了した", icon: "fa-hammer" },
    { id: "analog", name: "アナログ回線の記憶", desc: "2001年以前の遺跡を発見した", icon: "fa-phone" },
    { id: "ssr", name: "伝説の目撃者", desc: "阿部寛のホームページを発掘した", icon: "fa-star" },
    { id: "ooparts", name: "未知の高度文明", desc: "オーパーツを発見した", icon: "fa-rocket" }
];

// --- 初期化 ---
function init() {
    const zukanGrid = document.getElementById('zukan-grid');
    // 図鑑には通常DBと、「M&2K」カテゴリとして1枠（代表）を用意
    const zukanItems = [...realDB, {id: "M01", title: "M&2Kアーティファクト"}];
    
    zukanItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'zukan-item';
        div.id = `zukan-${item.id}`;
        div.innerHTML = `<i class="fa-solid fa-file-contract"></i><br>No.???`;
        zukanGrid.appendChild(div);
    });
    document.getElementById('total-count').textContent = zukanItems.length;

    const achiList = document.getElementById('achievement-list');
    achievements.forEach(ach => {
        const li = document.createElement('li');
        li.className = 'achievement-item';
        li.id = `ach-${ach.id}`;
        li.innerHTML = `<div class="achievement-icon"><i class="fa-solid ${ach.icon}"></i></div><div><strong>${ach.name}</strong><br><small>${ach.desc}</small></div>`;
        achiList.appendChild(li);
    });
}
init();

// --- 🍞 トースト ---
function showToast(icon, message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// --- 🗂️ タブ切り替え ---
window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    event.currentTarget.classList.add('active');
    document.getElementById(`${tabId}-section`).classList.remove('hidden');
};

// --- 💰 楽天物資手配 ---
const RAKUTEN_APP_ID = "1055088369869282145";
const RAKUTEN_AFF_ID = "3d94ea21.0d257908.3d94ea22.0ed11c6e";
const adKeywords = ["平成レトロ", "レトロゲーム", "フロッピーディスク", "ブラウン管", "ドット絵 グッズ", "サイバーパンク 雑貨"];

async function fetchRakutenAd() {
    const keyword = adKeywords[Math.floor(Math.random() * adKeywords.length)];
    const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?applicationId=${RAKUTEN_APP_ID}&keyword=${encodeURIComponent(keyword)}&hits=3&format=json`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.Items && data.Items.length > 0) {
            const item = data.Items[Math.floor(Math.random() * data.Items.length)].Item;
            const affUrl = `https://hb.afl.rakuten.co.jp/hgc/${RAKUTEN_AFF_ID}/?pc=${encodeURIComponent(item.itemUrl.split("?")[0])}`;
            document.getElementById(`ad-text-card`).textContent = `${item.itemName.substring(0, 25)}...`;
            document.getElementById(`ad-link-card`).href = affUrl;
            document.getElementById(`ad-img-card`).src = item.mediumImageUrls[0].imageUrl;
            document.getElementById(`ad-img-card`).classList.remove('hidden');
        }
    } catch (e) {
        document.getElementById(`ad-text-card`).textContent = "📦 通信エラー: 物資の調達に失敗しました";
    }
}

// --- 🌐 ガチャ生成 (年代とドメインを自然にマッチさせる) ---
const generateRandomArchive = () => {
    // はてなダイアリー(2004-2009) や ジオシティーズ(1999-2004) を年代で分ける
    const year = Math.floor(Math.random() * (2009 - 1999 + 1)) + 1999;
    const id = Math.floor(Math.random() * 9000) + 1000;
    const word = Math.random().toString(36).substring(2, 8);
    
    let url = "";
    if (year >= 2004) {
        // 2004年以降は はてなダイアリーやFC2が主流に
        const domains = [`http://d.hatena.ne.jp/${word}/`, `http://id${id}.bbs.fc2.com/`];
        url = domains[Math.floor(Math.random() * domains.length)];
    } else {
        // 2003年以前は ジオシティーズ、infoseek等が主流
        const domains = [`http://www.geocities.co.jp/SiliconValley/${id}/`, `http://isweb.infoseek.co.jp/computer/${id}/`];
        url = domains[Math.floor(Math.random() * domains.length)];
    }

    return {
        id: "RND", category: "表層", title: "名もなき遺跡 (ランダム生成)", year: year, rarity: "Unknown",
        desc: "※警告: データ層が完全に風化しており404(Not Found)の可能性があります。しかし、その虚無もまたインターネットの歴史です。",
        url: `https://web.archive.org/web/${year}0615000000/${url}`
    };
};

// --- 🔨 発掘処理 ---
document.getElementById('dig-btn').addEventListener('click', () => {
    const overlay = document.getElementById('digging-overlay');
    const hammer = document.getElementById('hammer');
    const rock = document.getElementById('rock');
    const spark = document.getElementById('spark');
    
    overlay.classList.remove('hidden');
    rock.style.transform = "none"; rock.style.opacity = "1"; rock.textContent = "🪨";
    spark.classList.add('hidden');

    let hits = 0;
    const hitInterval = setInterval(() => {
        hammer.classList.remove('swing'); void hammer.offsetWidth; hammer.classList.add('swing');
        setTimeout(() => {
            hits++;
            if(hits === 3) {
                clearInterval(hitInterval);
                spark.classList.remove('hidden'); rock.classList.add('break-rock'); rock.textContent = "☄️";
                setTimeout(() => {
                    overlay.classList.add('hidden');
                    processDig();
                    fetchRakutenAd(); // 物資手配
                }, 800);
            }
        }, 300);
    }, 600);
});

function processDig() {
    const targetLayer = document.getElementById('category').value;
    let result;

    if (targetLayer === "ランダム") {
        // 0.5% の確率で通常のランダム層からもM&2Kが出る
        if (Math.random() < 0.005) {
            result = getMitsukiArtifact();
        } else {
            result = generateRandomArchive();
        }
    } else if (targetLayer === "M2K") {
        // M2K層確定ガチャ
        result = getMitsukiArtifact();
    } else {
        const pool = realDB.filter(s => s.category === targetLayer);
        result = pool[Math.floor(Math.random() * pool.length)];
    }

    lastDugSite = result;
    displayResult(result);
}

// 41個の中からランダムにみつきサイトを抽出
function getMitsukiArtifact() {
    const item = mitsukiSites[Math.floor(Math.random() * mitsukiSites.length)];
    return {
        id: "M01", // 図鑑登録用共通ID
        category: "M2K",
        title: item.title,
        year: 2026,
        rarity: "DevRelic",
        desc: `【警告】周辺の地層と技術水準が一致しません。\n内容: ${item.desc}\nM&2Kが埋めた未確認の高度オーパーツです。`,
        url: item.url
    };
}

function displayResult(site) {
    const resArea = document.getElementById('result-area');
    resArea.classList.remove('hidden');
    document.getElementById('res-title').textContent = site.title;
    document.getElementById('res-year').textContent = site.year + "年";
    document.getElementById('res-category').textContent = site.category;
    document.getElementById('res-desc').innerText = site.desc;

    const badge = document.getElementById('res-rarity');
    badge.textContent = site.rarity;
    badge.style.backgroundColor = raritySettings[site.rarity].color;
    badge.style.color = site.rarity === "Unknown" ? "#000" : "#fff";

    const link = document.getElementById('res-link');
    link.href = site.url;
    link.innerHTML = site.id === "M01" ? '<i class="fa-solid fa-rocket"></i> このオーパーツを起動する' : '<i class="fa-solid fa-door-open"></i> Wayback Machineで遺跡を視察';
    link.style.background = site.id === "M01" ? "#ff00ff" : "#10b981";
    site.id === "M01" ? document.getElementById('res-card').classList.add('mitsuki-alert') : document.getElementById('res-card').classList.remove('mitsuki-alert');

    // データ更新
    state.digCount++;
    state.points += raritySettings[site.rarity].pt;
    document.getElementById('points').textContent = state.points;

    // 図鑑登録
    if (site.id !== "RND" && !state.foundIds.has(site.id)) {
        state.foundIds.add(site.id);
        const zBox = document.getElementById(`zukan-${site.id}`);
        zBox.classList.add('found');
        zBox.innerHTML = `<i class="fa-solid fa-globe"></i><br>${site.title}`;
        document.getElementById('found-count').textContent = state.foundIds.size;
        document.getElementById('comp-rate').textContent = Math.floor((state.foundIds.size / (realDB.length + 1)) * 100);
        document.getElementById('progress-fill').style.width = `${(state.foundIds.size / (realDB.length + 1)) * 100}%`;
        showToast("fa-book-open", `図鑑に新種が登録されました！`);
    }

    checkRanksAndAchievements(site);
    resArea.scrollIntoView({ behavior: 'smooth' });
}

function checkRanksAndAchievements(site) {
    let newRank = state.rank;
    ranks.forEach(r => {
        if (state.points >= r.pt) {
            newRank = r.name;
            if (r.unlock) {
                const opt = Array.from(document.getElementById('category').options).find(o => o.value === r.unlock);
                if (opt && opt.disabled) {
                    opt.disabled = false;
                    opt.textContent = opt.textContent.replace('🔒 ', '').replace(/ \(.+?\)/, '');
                    showToast("fa-unlock", `地層【${r.unlock}】が解放されました！`);
                }
            }
        }
    });
    if (newRank !== state.rank) {
        state.rank = newRank;
        document.getElementById('rank-name').textContent = state.rank;
        showToast("fa-award", `ランクアップ！称号【${state.rank}】を獲得！`);
    }

    const unlockAch = (id) => {
        if (!state.unlockedAchievements.has(id)) {
            state.unlockedAchievements.add(id);
            document.getElementById(`ach-${id}`).classList.add('unlocked');
            showToast("fa-trophy", `実績解除: ${achievements.find(a=>a.id===id).name}！`);
        }
    };

    if (state.digCount === 1) unlockAch("first");
    if (site.year <= 2001) unlockAch("analog");
    if (site.id === "V01") unlockAch("ssr");
    if (site.id === "M01") unlockAch("ooparts");
}

// --- 📱 シェア機能 ---
const handleShare = async (text) => {
    if (navigator.share) {
        try { await navigator.share({ title: 'Internet Archaeology', text: text }); }
        catch (e) { console.log("共有キャンセル"); }
    } else {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    }
};

document.getElementById('share-rank-btn').addEventListener('click', () => {
    handleShare(`インターネット遺跡を発掘中！\n称号: ${state.rank} (${state.points}pt)\n図鑑: ${state.foundIds.size}/${realDB.length+1} 種類\n#InternetArchaeology #インターネット考古学\n${window.location.href}`);
});

document.getElementById('share-res-btn').addEventListener('click', () => {
    if(!lastDugSite) return;
    handleShare(`⛏️ 遺跡を発掘！\n【${lastDugSite.title}】(${lastDugSite.year}年 / レア度: ${lastDugSite.rarity})\nURL: ${lastDugSite.url}\n#InternetArchaeology #インターネット考古学\n\nアプリはこちら:\n${window.location.href}`);
});