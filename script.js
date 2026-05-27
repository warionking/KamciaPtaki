gsap.registerPlugin(TextPlugin);
// 0. EFEKTY WIZUALNE EKRANU LOGOWANIA
let farquaadTriggered = false;
let farquaadAudio; // Deklarujemy zmienną tutaj

function showFarquaad() {
    // Zabezpieczenie, żeby kod wykonał się tylko raz
    if (farquaadTriggered) return;
    farquaadTriggered = true;

    // Inicjalizujemy audio bezpośrednio wewnątrz gestu użytkownika (to pomaga ominąć blokady przeglądarki)
    farquaadAudio = new Audio('img/lord_pierwsza_mowa.mp3');
    farquaadAudio.play().catch(error => {
        console.warn("Błąd odtwarzania dźwięku Lorda na starcie:", error);
    });

    // Wysuwamy postać
    const farquaadContainer = document.getElementById('farquaad-container');
    if (farquaadContainer) farquaadContainer.classList.add('show-character');

    // Pokazujemy dymek i odpalamy maszynę do pisania GSAP z NOWYM TEKSTEM
    setTimeout(() => {
        const bubble = document.getElementById('farquaad-bubble');
        const textElement = document.getElementById('farquaad-text');
        if (bubble && textElement) {
            bubble.style.setProperty('--bubble-color', '#ff0055'); // Domyślny, czerwony kolor
            textElement.innerHTML = "";
            bubble.classList.add('show-bubble');

            gsap.to(textElement, {
                text: "Ekhem... czy możemy powiększyć ten ekran? Przy moim... imponującym wzroście każdy centymetr ma znaczenie! Wciśnijcie F11 bo czuję się tu ściśnięty jak w niedzielnej kolejce na Szyndzielnię. Zróbcie mi trochę przestrzeni i zaczynamy to show!",
                duration: 16, 
                ease: "none"
            });
        }
    }, 1000);

    // Sprzątamy: usuwamy nasłuchiwacze po pierwszym kliknięciu
    ['click', 'touchstart'].forEach(evt => 
        window.removeEventListener(evt, showFarquaad)
    );
}

window.addEventListener('DOMContentLoaded', () => {
    // Czekamy na pierwsze kliknięcie lub dotknięcie gdziekolwiek na stronie, aby wywołać Lorda
    ['click', 'touchstart'].forEach(evt => 
        window.addEventListener(evt, showFarquaad, { once: true })
    );
});

// 1. OBSŁUGA LOGOWANIA I INTRO
const introVideo = document.getElementById('intro-video');
let introStep = 1; 

function startFromLogin() {
    // --- NOWOŚĆ: Dźwięk kliknięcia logowania ---
    const clickSound = new Audio('img/button_click.mp3');
    clickSound.play().catch(e => console.warn("Błąd odtwarzania dźwięku kliknięcia:", e));

    const inputUser = document.getElementById('loginUser').value;
    const inputPass = document.getElementById('loginPass').value;

    if (inputUser === 'PanienskieKamila' && inputPass === 'PtakiLatajaKluczem') {
        
        // --- NOWOŚĆ: Zatrzymujemy audio Lorda Farquaada i resetujemy jego czas ---
        farquaadAudio.pause();
        farquaadAudio.currentTime = 0;

        // --- NOWOŚĆ: Chowamy postać oraz dymek ---
        const farquaadContainer = document.getElementById('farquaad-container');
        const bubble = document.getElementById('farquaad-bubble');
        if (farquaadContainer) farquaadContainer.classList.remove('show-character');
        if (bubble) bubble.classList.remove('show-bubble');

        // Reszta logiki logowania bez zmian
        const loginWrapper = document.getElementById('login-wrapper');
        loginWrapper.style.opacity = '0';
        setTimeout(() => { 
            loginWrapper.style.display = 'none'; 
            introVideo.style.display = 'block'; 
            introVideo.muted = false;
            introVideo.play();
        }, 500);
    } else {
        alert("Odmowa dostępu! Błędny login lub hasło.");
    }
}

// Po zakończeniu pierwszego intro (czołówki)
introVideo.onended = function() {
    if (introStep === 1) {
        introVideo.style.display = 'none'; 
        // Pokazujemy ekran Netflixowy
        const netflixScreen = document.getElementById('netflix-pause-screen');
        if (netflixScreen) netflixScreen.style.display = 'flex'; 

        // --- NOWOŚĆ: Blokujemy przyciski, by wymusić interakcję ---
        const netflixBtns = document.querySelectorAll('.netflix-btn');
        netflixBtns.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.4';
            btn.style.cursor = 'not-allowed';
        });

        // Nasłuchiwanie na ruch lub dotyk (aby odpalić Farquaada)
        window.addEventListener('mousemove', triggerFarquaadNetflix, { once: true });
        window.addEventListener('touchstart', triggerFarquaadNetflix, { once: true });

    } else if (introStep === 2) {
        skipIntro();
    }
};

// FUNKCJA URUCHAMIAJĄCA FARQUAADA NA EKRANIE PAUZY
function triggerFarquaadNetflix() {
    setTimeout(() => {
        const netflixScreen = document.getElementById('netflix-pause-screen');
        
        // Sprawdzamy, czy ekran pauzy jest nadal widoczny
        if (netflixScreen && netflixScreen.style.display !== 'none') {
            
            // 1. Przygotowujemy dynamiczny dymek tekstowy
            const bubble = document.getElementById('farquaad-bubble');
            const textElement = document.getElementById('farquaad-text');
            bubble.style.setProperty('--bubble-color', '#e50914'); // Kolor z Netflixa
            textElement.innerHTML = "";

            // 2. Odtwarzamy plik dźwiękowy
            const netflixAudio = new Audio('img/lord_farqaad_przerwa.mp3');
            netflixAudio.play().catch(e => console.warn(e));

            // Odblokowujemy przyciski dopiero gdy audio się skończy
            netflixAudio.onended = () => {
                const netflixBtns = document.querySelectorAll('.netflix-btn');
                netflixBtns.forEach(btn => {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.cursor = 'pointer';
                });
            };

            // 3. Wysuwamy postać
            const container = document.getElementById('farquaad-container');
            if (container) container.classList.add('show-character');

            // 4. Pokazujemy dymek i odpalamy maszynę do pisania po sekundzie
            setTimeout(() => {
                if (bubble) bubble.classList.add('show-bubble');
                gsap.to(textElement, {
                    text: "Przerwa na ratowanie jakiegoś jeża czy po prostu próbujecie dojść do siebie? Bardzo szlachetnie, ale tu na ekranie wciąż czeka stado bestii do odstrzału! Wracamy do gry!",
                    duration: 5.5, 
                    ease: "none"
                });
            }, 1000);
        }
    }, 2000); // 2 sekundy opóźnienia po wykryciu ruchu
}

// Zmodyfikowana funkcja, która chowa Farquaada po kliknięciu "Oglądaj dalej"
function playRulesWithSound() {
    const netflixScreen = document.getElementById('netflix-pause-screen');
    if (netflixScreen) netflixScreen.style.display = 'none'; 
    
    // CHOWAMY FARQUAADA, jeśli był na ekranie
    const container = document.getElementById('farquaad-container');
    const bubble = document.getElementById('farquaad-bubble');
    if (container) container.classList.remove('show-character');
    if (bubble) bubble.classList.remove('show-bubble');
    
    // Przywracamy domyślny dymek po schowaniu się postaci (dla porządku)
    setTimeout(() => {
        if (bubble) bubble.src = 'img/bubble.png';
    }, 800);
    
    introVideo.src = 'img/zasady.mp4'; 
    introVideo.style.display = 'block';
    introStep = 2; 
    introVideo.muted = false;
    introVideo.load(); 
    introVideo.play().catch(error => {
        console.log("Błąd odtwarzania zasad: ", error);
    });
}

function skipIntro() {
    const overlay = document.getElementById('intro-overlay');
    overlay.style.opacity = '0';
    setTimeout(() => { 
        overlay.style.display = 'none'; 
        
        // --- NOWOŚĆ: Kinowy wjazd kabin odpala się DOKŁADNIE tutaj! ---
        gsap.from(".cabin", {
            duration: 1.2,
            y: 150,           // Kabiny wjeżdżają z dołu
            opacity: 0,       // Zaczynają jako całkowicie przezroczyste
            scale: 0.5,       // Są małe
            rotationX: -20,   // Lekko odchylone
            stagger: 0.15,    // Wchodzą falami od lewej do prawej
            ease: "power3.out"
        });
        
    }, 1000); 
}

// 2. LOGIKA TELEWIZYJNEJ ROZGRYWKI
let moznaKlikac = true; 
const obejrzaneKabiny = new Set(); 
const odkryteDlonie = new Set();   

function focusCabin(id) {
    if (!moznaKlikac || obejrzaneKabiny.has(id)) return;
    moznaKlikac = false; 

    const playBtn = document.getElementById(`play-btn-${id}`);
    playBtn.innerText = "OGLĄDASZ..."; 

    const video = document.getElementById(`video-${id}`);
    const silhouette = document.getElementById(`silhouette-${id}`);
    const face = document.getElementById(`face-${id}`);
    const cabin = document.getElementById(`cabin-${id}`);
    
    document.getElementById('horseshoeStage').classList.add('dimmed');
    document.querySelector('.stage-title-box').style.opacity = '0'; /* Ukrywa tytuł */
    cabin.classList.add('zoomed-focus');
    document.getElementById(`glass-${id}`).classList.remove('blurred');
    
    if (silhouette) silhouette.style.display = 'none';
    video.style.display = 'block';
    video.play();

    // --- NOWOŚĆ: Reżyserski najazd kamery (GSAP) - WERSJA MAX ---
    gsap.to(cabin, { y: -70, scale: 1.55, zIndex: 100, duration: 0.5, ease: "power2.out" });

    video.onended = function() {
        obejrzaneKabiny.add(id);
        cabin.classList.add('viewed-cabin');
        playBtn.innerText = "ODTWORZONO";
        
        video.style.display = 'none';
        face.classList.remove('hidden-face');
        cabin.classList.remove('zoomed-focus');
        document.getElementById('horseshoeStage').classList.remove('dimmed');
        document.querySelector('.stage-title-box').style.opacity = '1'; /* Przywraca tytuł */
        moznaKlikac = true;
        
        // --- NOWOŚĆ: Powrót kabiny na swoje miejsce w łuku (GSAP) ---
        let originY = 0, originScale = 1, originZ = 6;
        if (id === 1 || id === 7) { originY = 40; originScale = 0.9; originZ = 5; }
        else if (id === 2 || id === 6) { originY = 20; originScale = 0.95; originZ = 6; }
        else if (id === 3 || id === 5) { originY = 5; originScale = 1.0; originZ = 7; }
        else if (id === 4) { originY = -5; originScale = 1.05; originZ = 8; }

        gsap.to(cabin, { y: originY, scale: originScale, zIndex: originZ, duration: 0.5, ease: "power2.out" });

        if (obejrzaneKabiny.size === 7) {
            document.getElementById('stage-title').innerText = "KANDYDACI POZNANI";
            document.getElementById('stage-desc').innerText = "Wszyscy kandydaci obejrzani. Czas odkryć ich tajemnice!";
            document.getElementById('next-round1-btn').style.display = 'inline-block';

            // --- NOWOŚĆ: Przywrócenie kolorów i ukrycie przycisków "ODTWORZONO" ---
            for (let i = 1; i <= 7; i++) {
                const c = document.getElementById(`cabin-${i}`);
                const btn = document.getElementById(`play-btn-${i}`);
                if (c) c.classList.remove('viewed-cabin'); // Usuwamy szary filtr
                if (btn) btn.style.display = 'none';        // Ukrywamy przycisk całkowicie
            }
        }
    };
}

// ==========================================
// NOWY UNIWERSALNY SILNIK RUND (1-7)
// ==========================================

const roundConfig = {
    1: { title: "RUNDA 1: STOPY", desc: "Zgrabne paluszki czy haluksy jak racice krowy domowej? Ściągnij im skarpetki i bezlitośnie wskaż, kto na tych kopytach musi wracać do domu.", audio: "Runda_1_Box.mp3", part: "Stopy", isElim: false },
    2: { title: "RUNDA 2: NOGI", desc: "Podobno prawdziwa siła drzemie w nogach. Szkoda że u niektórych z nich drzemie co najwyżej chuda gałązka i owłosione kolano. Pokażcie te patyki!", audio: "Lord_Nogi.mp3", part: "Nogi", isElim: true },
    3: { title: "RUNDA 3: PĘPEK", desc: "Wklęsły jak portfel po weekendzie, czy wypukły jak ego faceta na Tinderze, który trzyma rybę na profilowym? Sprawdzamy, co kryje się w centrum dowodzenia. Pokazujcie pępki!", audio: "Lord_Pępek.mp3", part: "Pępek", isElim: false },
    4: { title: "RUNDA 4: SUTEK", desc: "Stoją na baczność jak po usłyszeniu pytania 'a ty ile masz wzrostu?', czy są małe i zagubione jak facet w dziale z tamponami? Czas odkryć, co oni tam ukrywają pod koszulką i kogoś bezlitośnie wyeliminować!", audio: "Lord_Sutek.mp3", part: "Sutek", isElim: true },
    5: { title: "RUNDA 5: ŁOKIEĆ", desc: "Szorstkie jak jego żarty na pierwszej randce, czy gładziutkie od wiecznego leżenia przed Netflixem? Pora na ostateczny test łokcia.", audio: "Lord_Łokieć.mp3", part: "Łokieć", isElim: false },
    6: { title: "RUNDA 6: BICEPS", desc: "Biceps godny drwala, który sam zbuduje Ci dom, czy ugotowany makaron, który będzie prosił o pomoc przy otwarciu słoika z pesto? Prężymy muły! I patrzymy kto da radę nosić za tobą torby na zakupach.", audio: "Lord_Biceps.mp3", part: "Biceps", isElim: true },
    7: { title: "RUNDA 7: DŁONIE", desc: "Czas na ulubiony fetysz z TikToka. Są tam te seksowne, żylaste dłonie, czy mięciutkie rączki, które wpadają w panikę przy składaniu szafki z IKEI?", audio: "Lord_DlonieRewers.mp3", part: "Rewers", isElim: false }
};

let currentRound = 1;

function startRound(nrRundy) {
    new Audio('img/button_click.mp3').play().catch(e => console.warn(e));

    currentRound = nrRundy;
    const data = roundConfig[nrRundy];

    const stage = document.getElementById('horseshoeStage');
    if (nrRundy === 1) stage.classList.add('round1-layout');
    else stage.classList.remove('round1-layout');

    // --- NOWOŚĆ: Sprawdzamy, czy włączyć potężny Układ Finałowy (dla 4 i mniej kabin) ---
    const aktywneKabiny = document.querySelectorAll('.cabin:not(.eliminated)').length;
    if (aktywneKabiny <= 4 && nrRundy > 1) stage.classList.add('finale-layout');
    else stage.classList.remove('finale-layout');

    document.getElementById('stage-title').innerText = data.title;
    document.getElementById('stage-desc').innerText = data.desc;

    [1, 2, 3, 4, 5, 6, 7].forEach(n => {
        const btn = document.getElementById(`next-round${n}-btn`);
        if (btn) btn.style.display = 'none';
    });

    const audio = new Audio(`img/${data.audio}`);
    audio.play().catch(e => console.warn("Błąd audio rundy:", e));

    odkryteDlonie.clear(); 

    for (let i = 1; i <= 7; i++) {
        const cabin = document.getElementById(`cabin-${i}`);
        if (cabin && !cabin.classList.contains('eliminated')) {
            const glass = document.getElementById(`glass-${i}`);
            const imgPart = document.getElementById(`hand-${i}`);
            const actionBtn = document.getElementById(`hand-btn-${i}`);

            glass.classList.add('blurred');
            glass.style.background = '';
            glass.style.boxShadow = '';

            document.getElementById(`video-${i}`).style.display = 'none';
            document.getElementById(`face-${i}`).classList.add('hidden-face');
            document.getElementById(`play-btn-${i}`).style.display = 'none';

            if (imgPart) {
                imgPart.classList.add('hidden-hand');
                // Pobieramy czysty atrybut src z HTML (np. img/Części_Ciała/Arek_Stopy.webp)
                let currentSrc = decodeURIComponent(imgPart.getAttribute('src'));
                
                // 1. Zamieniamy starą część ciała na nową
                let newSrc = currentSrc.replace(/Stopy|Nogi|Pępek|Sutek|Łokieć|Biceps|Dlonie|Rewers/gi, data.part);
                
                // 2. Wymuszamy format .webp, niezależnie od tego co było wcześniej
                newSrc = newSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                
                imgPart.src = newSrc;
            }

            if (actionBtn) {
                actionBtn.innerHTML = `🔍 ODSŁOŃ ${data.part.toUpperCase()}`;
                actionBtn.setAttribute('onclick', `revealPart(${i})`);
                actionBtn.style.display = 'none'; 
            }
        }
    }

    audio.onended = () => {
        for (let i = 1; i <= 7; i++) {
            const cabin = document.getElementById(`cabin-${i}`);
            if (cabin && !cabin.classList.contains('eliminated')) {
                const actionBtn = document.getElementById(`hand-btn-${i}`);
                if (actionBtn) actionBtn.style.display = 'inline-block';
            }
        }
    };
}

function revealPart(id) {
    const data = roundConfig[currentRound];
    const imgPart = document.getElementById(`hand-${id}`);
    const glass = document.getElementById(`glass-${id}`);
    const actionBtn = document.getElementById(`hand-btn-${id}`);
    const silhouette = document.getElementById(`silhouette-${id}`);
    const face = document.getElementById(`face-${id}`);

    if (imgPart && glass) {
        glass.classList.remove('blurred');
        glass.style.background = '#ffffff';
        glass.style.boxShadow = 'none';

        if (silhouette) silhouette.style.display = 'none';
        if (face) face.classList.add('hidden-face');

        imgPart.classList.remove('hidden-hand');
        actionBtn.style.display = 'none';

        odkryteDlonie.add(id);

        const aktywneKabiny = document.querySelectorAll('.cabin:not(.eliminated)').length;

        if (odkryteDlonie.size === aktywneKabiny) {
            if (data.isElim) {
                document.getElementById('stage-desc').innerText = "Widziałaś już wszystko. Czas wyeliminować jednego ogra.";
                for (let i = 1; i <= 7; i++) {
                    const elBtn = document.getElementById(`elim-btn-${i}`);
                    const cabin = document.getElementById(`cabin-${i}`);
                    if (elBtn && cabin && !cabin.classList.contains('eliminated')) {
                        elBtn.style.display = 'inline-block';
                    }
                }
            } else {
                document.getElementById('stage-desc').innerText = "Widziałaś już wszystko w tej rundzie! Przechodzimy dalej.";
                const nextBtn = document.getElementById(`next-round${currentRound + 1}-btn`);
                if (nextBtn) nextBtn.style.display = 'inline-block';
            }
        }
    }
}

// ==========================================
// 3. ETAP 3: LOGIKA RUNDY 1 I ELIMINACJI
// ==========================================

// Sekwencja Eliminacji z GSAP i Pop-upem
function eliminateCandidate(id) {
    // 1. Natychmiast ukrywamy przyciski eliminacji, żeby zablokować podwójne kliknięcie
    document.querySelectorAll('.elim-cabin-btn').forEach(btn => btn.style.display = 'none');

    // 2. Włączenie kinowego Pop-upa
    const popup = document.getElementById('elimination-popup');
    const elimVideo = document.getElementById('elimination-video');
    
    // TYMCZASOWO: Używamy jednego filmu dla każdego uczestnika (do czasu zebrania reszty nagrań)
    elimVideo.src = 'img/tomek_przegrywa.mp4'; 
    
    // Animujemy wejście pop-upa przez GSAP
    gsap.to(popup, { opacity: 1, display: 'flex', duration: 0.5 });
    
    elimVideo.style.display = 'block';
    elimVideo.play().catch(e => console.warn("Brak pliku wideo pożegnalnego:", e));

    // 3. Reakcja po zakończeniu filmu pożegnalnego
    elimVideo.onended = () => {
        // Chowamy pop-up
        gsap.to(popup, { opacity: 0, display: 'none', duration: 0.5 });
        
        // --- NOWOŚĆ: Zmiana opisu na ekranie po usunięciu kandydata ---
        document.getElementById('stage-desc').innerText = "Jednego mniej ... ufff. Do odstrzału zostało jeszcze paru więc nie traćmy czasu.";
        
        const cabin = document.getElementById(`cabin-${id}`);
        cabin.classList.add('eliminated'); // Kabina staje się szara (CSS)

        // 4. ANIMACJA GSAP: Zapadnia i kurczenie się luki
        gsap.to(cabin, {
            y: 200, // Kabina spada fizycznie w dół
            rotationX: -15, // Przechyla się w tył
            opacity: 0, // Znikanie
            duration: 1.2,
            ease: "power2.in",
            onComplete: () => {
                // Gdy kabina zjedzie w dół, kurczymy jej miejsce do zera
                // Dzięki temu Flexbox płynnie "zlepi" pozostałe kabiny ze sobą
                gsap.to(cabin, {
                    width: 0,
                    margin: 0,
                    padding: 0,
                    border: 0,
                    duration: 0.8,
                    ease: "power2.inOut",
                    onComplete: () => {
                        cabin.style.display = 'none';
                        
                        // --- NOWOŚĆ: Automatyczne włączenie Układu Finałowego ---
                        const aktywneKabiny = document.querySelectorAll('.cabin:not(.eliminated)').length;
                        if (aktywneKabiny <= 4) {
                            document.getElementById('horseshoeStage').classList.add('finale-layout');
                        }

                        // ZWIASTUN ETAPU 4: Tu wywołamy Farquaada z jego dynamicznym dymkiem
                        if (typeof triggerEliminationFarquaad === "function") {
                            triggerEliminationFarquaad(id);
                        }
                    }
                });
            }
        });
    };
}

// ==========================================
// 4. ETAP 4: ŻYWY LORD FARQUAAD (GSAP)
// ==========================================

// 4.1. Oddychanie i śledzenie kursora (Idle Animation)
window.addEventListener('DOMContentLoaded', () => {
    const character = document.getElementById('farquaad-character');

    // Subtelne oddychanie (góra-dół)
    gsap.to(character, {
        y: -10, 
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    // Wodzenie wzrokiem (Paralaksa - wychylanie postaci względem kursora myszy)
    window.addEventListener('mousemove', (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 90;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 90;
        
        gsap.to(character, {
            rotationY: xAxis,
            rotationX: yAxis,
            duration: 0.5,
            ease: "power1.out"
        });
    });
});

function triggerEliminationFarquaad(id) {
    const container = document.getElementById('farquaad-container');
    const bubble = document.getElementById('farquaad-bubble');
    const textElement = document.getElementById('farquaad-text');

    const colors = { 1: '#ff1f60', 2: '#00f3ff', 3: '#00ff66', 4: '#ffad00', 5: '#b5179e', 6: '#ff5e00', 7: '#bfff00' };
    bubble.style.setProperty('--bubble-color', colors[id] || '#ff0044');

    const elimData = {
        2: { text: "Krzywe jak szable moich rycerzy! Dobrze że się go pozbyłaś, z takimi nogami to on by nawet przed smokiem nie uciekł.", audio: "Lord_Nogi_Eliminacja.mp3", duration: 7 },
        4: { text: "Te sutki są tak smutne i przerażone, że wyglądają, jakby zaraz same chciały uciec! To jakaś kpina! Próbuję nastroić to radyjko na jakąś męską częstotliwość, a dostaję tylko szum bo ta klatka piersiowa nadaje wyłącznie na fali rozpaczy!", audio: "Lord_Sutek_Eliminacja.mp3", duration: 13 },
        6: { text: "Biceps? Jaki biceps?! Moja babcia ma więcej krzepy w lewym ramieniu od samego mieszania w kotle! Nie potrzebujemy tu takich cherlaków. Żegnamy!", audio: "Lord_Biceps_Eliminacja.mp3", duration: 10 }
    };

    const data = elimData[currentRound];
    if(!data) {
        console.error("Brak danych Farquaada dla rundy eliminacyjnej nr: " + currentRound);
        return;
    }

    textElement.innerHTML = ""; 
    container.classList.add('show-character');

    setTimeout(() => {
        bubble.classList.add('show-bubble');
        
        const elimAudio = new Audio(`img/${data.audio}`);
        elimAudio.play().catch(e => console.warn(e));

        gsap.to(textElement, {
            text: data.text,
            duration: data.duration,
            ease: "none",
            onComplete: () => {
                setTimeout(() => {
                    bubble.classList.remove('show-bubble');
                    setTimeout(() => {
                        container.classList.remove('show-character');
                        const nextBtn = document.getElementById(`next-round${currentRound + 1}-btn`);
                        if (nextBtn) nextBtn.style.display = 'inline-block';
                    }, 400);
                }, 3000);
            }
        });
    }, 800); 
}

// ==========================================
// 5. KINOWE EFEKTY WIZUALNE (GSAP 2.5D)
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
    // 5.2. EFEKT INTERAKTYWNEJ PARALAKSY (Hover)
    const cabins = document.querySelectorAll('.cabin');

    // --- NAPRAWA 1: Ściszenie dźwięku hovera (0.05 to subtelne tło) ---
    const hoverSound = new Audio('img/hover.mp3'); 
    hoverSound.volume = 0.05; 

    cabins.forEach(cabin => {
        const id = cabin.id.split('-')[1];
        const silhouette = document.getElementById(`silhouette-${id}`);
        const reflection = cabin.querySelector('.floor-reflection');

        // Reakcja na najechanie kursorem
        cabin.addEventListener('mouseenter', () => {
            if (!moznaKlikac || cabin.classList.contains('eliminated') || cabin.classList.contains('zoomed-focus') || cabin.classList.contains('viewed-cabin')) return; 

            // NAPRAWA: Zatrzymujemy hover TYLKO na ekranie podsumowania wizytówek
            if (document.getElementById('stage-title').innerText === "KANDYDACI POZNANI") return;
            
            hoverSound.currentTime = 0; 
            hoverSound.play().catch(e => console.warn("Przeglądarka zablokowała dźwięk hovera:", e));

            gsap.killTweensOf([cabin, silhouette, reflection]);

            const timeline = gsap.timeline();
            timeline.to(cabin, { y: -25, scale: 1.15, zIndex: 100, duration: 0.4, ease: "back.out(1.2)" }, 0);
            if (silhouette) timeline.to(silhouette, { scale: 0.9, y: 10, duration: 0.4 }, 0);
            if (reflection) timeline.to(reflection, { y: 20, opacity: 0.6, scale: 1.1, duration: 0.4 }, 0);
        });

        // Reakcja na zjechanie kursorem
        cabin.addEventListener('mouseleave', () => {
            if (!moznaKlikac || cabin.classList.contains('eliminated') || cabin.classList.contains('zoomed-focus') || cabin.classList.contains('viewed-cabin')) return;

            // NAPRAWA: Zatrzymujemy hover TYLKO na ekranie podsumowania wizytówek
            if (document.getElementById('stage-title').innerText === "KANDYDACI POZNANI") return;

            gsap.killTweensOf([cabin, silhouette, reflection]);

            const numId = parseInt(id);
            
            // Przywracamy tylko oryginalny z-index
            let cssZIndex = 4;
            if (numId === 1 || numId === 7) cssZIndex = 7;
            else if (numId === 2 || numId === 6) cssZIndex = 6;
            else if (numId === 3 || numId === 5) cssZIndex = 5;

            // --- NAPRAWA 2: Usunięto psujące rotacje. Niech CSS decyduje o układzie łuku! ---
            const tl = gsap.timeline();
            tl.to(cabin, { 
                y: 0, scale: 1, zIndex: cssZIndex, 
                duration: 0.3, ease: "power2.out" 
            }, 0);
            if (silhouette) tl.to(silhouette, { scale: 0.85, y: 0, duration: 0.3 }, 0);
            if (reflection) tl.to(reflection, { y: 0, opacity: 0.35, scale: 1, duration: 0.3 }, 0);
        });
    });
});
