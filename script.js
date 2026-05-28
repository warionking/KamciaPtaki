// --- ZABEZPIECZENIA PRZED KOPIOWANIEM ---

// 1. Blokada prawego przycisku myszy
document.addEventListener('contextmenu', event => event.preventDefault());

// 2. Blokada skrótów klawiszowych (Kopiowanie, Zapisywanie, Narzędzia developerskie, Odświeżanie)
document.addEventListener('keydown', function(e) {
    if (e.key === 'F5' || // Blokada F5
       (e.ctrlKey && (e.key === 'r' || e.key === 'R')) || // Blokada Ctrl + R
       e.key === 'F12' || 
       (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
       (e.ctrlKey && (e.key === 'U' || e.key === 'C' || e.key === 'S' || e.key === 'P'))) {
        e.preventDefault();
    }
});

// 3. Ostateczna blokada schowka (nawet jak ktoś obejdzie powyższe, skopiuje puste pole)
document.addEventListener('copy', event => {
    event.preventDefault();
});

gsap.registerPlugin(TextPlugin);
let totalScore = 0;
let roundScore = 0;
let eliminatedCount = 0;
let roundAudioPlaying = false; // NOWOŚĆ: Flaga blokująca interakcję podczas audio
// NOWOŚĆ: Dwa osobne pliki muzyczne dla wygranej i porażki
let winBackgroundMusic = new Audio('img/Muzyka_Tło.mp3');
winBackgroundMusic.loop = true;
winBackgroundMusic.volume = 0.3; // Głośność 30% dla wygranej

let lossBackgroundMusic = new Audio('img/Muzyka_Tło_1.mp3');
lossBackgroundMusic.loop = true;
lossBackgroundMusic.volume = 0.15; // Głośność 15% dla przegranej

function updateScoreDisplay() {
    document.getElementById('current-score').innerText = totalScore;
    // Zapisujemy aktualny wynik i rundę do pamięci przeglądarki
    localStorage.setItem('panienkiScore', totalScore);
    localStorage.setItem('panienkiRound', currentRound);
}

// Sprawdzanie pamięci przy starcie strony (dodaj to zaraz pod zmiennymi na górze pliku script.js)
window.addEventListener('load', () => {
    const savedScore = localStorage.getItem('panienkiScore');
    const savedRound = localStorage.getItem('panienkiRound');
    
    if (savedScore !== null) {
        totalScore = parseInt(savedScore);
        document.getElementById('current-score').innerText = totalScore;
    }
    if (savedRound !== null) {
        currentRound = parseInt(savedRound);
    }
});

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
    // PRZYWRÓCONO: Strona startuje od ekranu logowania (koniec trybu testowego)
    document.getElementById('login-wrapper').style.display = 'flex';
    document.getElementById('intro-overlay').style.display = 'none';
    
    // Ukrywamy całe studio na start
    document.querySelector('.studio-container').style.visibility = 'hidden';

    // Podpinamy Lorda Farquaada pod pierwsze kliknięcie na stronie logowania
    window.addEventListener('click', showFarquaad);
    window.addEventListener('touchstart', showFarquaad);
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
            
            // Zatrzymujemy audio Lorda Farquaada (Zabezpieczone, żeby nie wywalało błędu!)
            if (farquaadAudio) {
                farquaadAudio.pause();
                farquaadAudio.currentTime = 0;
            }

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
            
            // NAPRAWA: Wyświetlamy cały kontener intra przed włączeniem wideo!
            const introOverlay = document.getElementById('intro-overlay');
            if (introOverlay) {
                introOverlay.style.display = 'flex';
                introOverlay.style.opacity = '1';
            }
            
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
        
        // Odkrywamy całe, pełne studio (tytuły + podłogę)
        document.querySelector('.studio-container').style.visibility = 'visible';
        
        // --- 1. POGASZENIE ŚWIATEŁ I KABIN PRZED AUDIO ---
        const lights = document.querySelector('.studio-lights');
        if (lights) lights.style.opacity = '0'; // Ukrywamy żarówki w mroku

        const cabins = document.querySelectorAll('.cabin');
        cabins.forEach(cabin => {
            cabin.style.opacity = '0';          // Całkowita niewidoczność
            cabin.style.pointerEvents = 'none'; // ZABEZPIECZENIE: Wyłącza klikanie i dźwięk myszki!
        });

        // Ukrywamy przyciski "ODTWÓRZ"
        for (let i = 1; i <= 7; i++) {
            const btn = document.getElementById(`play-btn-${i}`);
            if (btn) btn.style.display = 'none';
        }

        // --- 2. ODTWARZANIE AUDIO LORDA ---
        const poznajAudio = new Audio('img/Lord_Poznaj_Kandydatow.mp3');
        poznajAudio.play().catch(e => console.warn(e));

        // --- 3. AKCJA PO ZAKOŃCZENIU AUDIO ---
        poznajAudio.onended = () => {
            
            // Płynne włączenie żarówek w tle
            if (lights) {
                gsap.to(lights, {opacity: 1, duration: 1.5, ease: "power2.inOut"});
            }
            
            // Kinowy wjazd kabin! (Używamy fromTo dla pełnej stabilności)
            gsap.fromTo(".cabin", 
                {
                    y: 150,
                    opacity: 0,
                    scale: 0.5,
                    rotationX: -20
                },
                {
                    duration: 1.2,
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotationX: 0,
                    stagger: 0.15,
                    ease: "power3.out",
                    onComplete: function() {
                        // Zdejmujemy blokadę myszki i czyścimy twarde style GSAP dla WSZYSTKICH kabin
                        this.targets().forEach(cabin => {
                            cabin.style.pointerEvents = 'auto';
                            gsap.set(cabin, { clearProps: "opacity,transform" });
                        });
                    }
                }
            );

            // Pokazujemy przyciski "ODTWÓRZ" z lekkim opóźnieniem
            setTimeout(() => {
                for (let i = 1; i <= 7; i++) {
                    const btn = document.getElementById(`play-btn-${i}`);
                    if (btn) {
                        btn.style.display = 'inline-block';
                        gsap.fromTo(btn, {opacity: 0, y: 15}, {opacity: 1, y: 0, duration: 0.4});
                    }
                }
            }, 1000); // Przyciski pokazują się, gdy kabiny już stają na miejscach
        };
        
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
    
    // Ukrywamy panel z przyciskiem na czas powiększenia (eliminuje pikselozę tekstu)
    cabin.querySelector('.cabin-controls').style.opacity = '0';

    // --- POWIĘKSZONE WIDEO (Skala z 1.55 na 1.86) ---
    gsap.to(cabin, { y: -90, scale: 1.86, zIndex: 999, duration: 0.5, ease: "power2.out" });

    video.onended = function() {
        // Przywracamy przycisk po zakończeniu filmu
        cabin.querySelector('.cabin-controls').style.opacity = '1';
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
            document.getElementById('stage-desc').innerText = "Wszyscy kandydaci poznani! Czas na brutalną selekcję. Po takich doznaniach strach pomyśleć, co jeszcze chowają przed światem!";
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
// NOWY UNIWERSALNY SILNIK RUND (1-11) I TASOWANIE
// ==========================================

// ==========================================
// NOWY UNIWERSALNY SILNIK RUND (1-11) I TASOWANIE
// ==========================================

const roundConfig = {
    1: { title: "RUNDA 1: STOPY", desc: "Zgrabne paluszki czy haluksy jak racice krowy domowej? Ściągnij im skarpetki i bezlitośnie wskaż, kto na tych kopytach musi wracać do domu.", audio: "Runda_1_Box.mp3", part: "Stopy" },
    2: { title: "RUNDA 2: NOGI", desc: "Podobno prawdziwa siła drzemie w nogach. Szkoda że u niektórych z nich drzemie co najwyżej chuda gałązka i owłosione kolano. Pokażcie te patyki!", audio: "Lord_Nogi.mp3", part: "Nogi" },
    3: { title: "RUNDA 3: PĘPEK", desc: "Wklęsły jak portfel po weekendzie, czy wypukły jak ego faceta na Tinderze, który trzyma rybę na profilowym? Sprawdzamy, co kryje się w centrum dowodzenia. Pokazujcie pępki!", audio: "Lord_Pępek.mp3", part: "Pępek" },
    4: { title: "RUNDA 4: SUTEK", desc: "Stoją na baczność jak po usłyszeniu pytania ''A ty ile masz wzrostu?'' czy są małe i zagubione jak facet w dziale z tamponami? Czas odkryć, co oni tam ukrywają pod koszulką i kogoś bezlitośnie wyeliminować!", audio: "Lord_Sutek.mp3", part: "Sutek" },
    5: { title: "RUNDA 5: ŁOKIEĆ", desc: "Szorstkie jak jego żarty na pierwszej randce, czy gładziutkie od wiecznego leżenia przed Netflixem? Pora na ostateczny test łokcia.", audio: "Lord_Łokieć.mp3", part: "Łokieć" },
    6: { title: "RUNDA 6: BICEPS", desc: "Biceps godny drwala, który sam zbuduje Ci dom, czy ugotowany makaron, który będzie prosił o pomoc przy otwarciu słoika z pesto? Prężymy muły! I patrzymy kto da radę nosić za tobą torby na zakupach.", audio: "Lord_Biceps.mp3", part: "Biceps" },
    7: { title: "RUNDA 7: DŁONIE (REWERS)", desc: "Czas na ulubiony fetysz z TikToka. Są tam te seksowne, żylaste dłonie, czy mięciutkie rączki, które wpadają w panikę przy składaniu szafki z IKEI?", audio: "Lord_DlonieRewers.mp3", part: "Rewers" },
    8: { title: "RUNDA 8: DŁONIE (AWERS)", desc: "Odwracamy łapy! Czas na bezlitosną ocenę siły chwytu. Odciski od górskich łańcuchów czy może gładziutkie poduszeczki od scrollowania telefonu. Kto nie utrzymałby w dłoniach smyczy ten dzisiaj wylatuje z gry.", audio: "Lord_Runda_8.mp3", part: "Awers" },
    9: { title: "RUNDA 9: USTA I ZAROST", desc: "Gęsta szczecina jak u niedźwiedzia po przebudzeniu czy lico które zamarźnie przy pierwszym podmuchu wiatru na grani? Zbliżamy się do twarzy, pora odsłonić paszcze!", audio: "Lord_Runda_9.mp3", part: "Usta" },
    10: { title: "RUNDA 10: NOS", desc: "Nos stworzony do wyczuwania rześkiego, górskiego powietrza czy może klamka od zakrysti? Odsłaniamy kichawy!", audio: "Lord_Runda_10.mp3", part: "Nos_Bok" },
    11: { title: "RUNDA 11: UCHO", desc: "Została tylko elita! Zanim spojrzymy im głęboko w oczy, oceńmy ich radary! Słuch wyczulony na najcichszy szelest sarny w lesie czy odstające uchwyty od garnka? Czas nadstawić ucha!", audio: "Lord_Runda_11.mp3", part: "Ucho" },
    12: { title: "RUNDA FINAŁOWA: OKO", desc: "Ostatnie starcie! Zostały tylko oczy – zwierciadło duszy. To właśnie w to spojrzenie będziesz wpatrywać się każdego ranka do końca życia. Spójrz im głęboko w oczy i podejmij ostateczną decyzję. Kto jest Twoim przeznaczeniem?", audio: "Lord_Runda_12.mp3", part: "Oko" }
};

// Baza Kandydatów i ich przypisanych "Twarzy" z ekranu Poznaj Kandydatów
const candidatesList = ["Arek", "Dyzio", "Marek", "Robert", "Tomek", "Programista", "Dominik"];
const candidateFaces = {
    "Arek": "1_face.jpg",
    "Dyzio": "2_face.png",
    "Marek": "3_face.jpg",
    "Robert": "4_face.jpg",
    "Tomek": "5_face.png",
    "Programista": "6_face.png",
    "Dominik": "7_face.png"
};

let currentRound = 1;

function startRound(nrRundy) {
    new Audio('img/button_click.mp3').play().catch(e => console.warn(e));

    // --- POPRAWKA BLOKADY KLIKANIA ---
    moznaKlikac = true; 
    document.querySelectorAll('.elim-cabin-btn').forEach(btn => btn.style.pointerEvents = 'auto');
    // ---------------------------------

    currentRound = nrRundy;
    const data = roundConfig[nrRundy];

    const stage = document.getElementById('horseshoeStage');
    if (nrRundy === 1) stage.classList.add('round1-layout');
    else stage.classList.remove('round1-layout');

    // --- Sprawdzamy, czy włączyć potężny Układ Finałowy (dla 4 i mniej kabin) ---
    const aktywneKabiny = document.querySelectorAll('.cabin:not(.eliminated)').length;
    if (aktywneKabiny <= 4 && nrRundy > 1) stage.classList.add('finale-layout');
    else stage.classList.remove('finale-layout');

    document.getElementById('stage-title').innerText = data.title;
    document.getElementById('stage-desc').innerText = data.desc;

    // Chowamy wszystkie przyciski kolejnych rund
    for(let n=1; n<=12; n++){
        const btn = document.getElementById(`next-round${n}-btn`);
        if (btn) btn.style.display = 'none';
    }
    const verdictBtn = document.getElementById('show-verdict-btn');
    if (verdictBtn) verdictBtn.style.display = 'none';

    const audio = new Audio(`img/${data.audio}`);
    roundAudioPlaying = true;
    audio.play().catch(e => console.warn("Błąd audio rundy:", e));

    odkryteDlonie.clear(); 
    roundScore = 0;
    eliminatedCount = 0;

    // Przywracamy scenę z kabinami i tytułem (usuwamy twarde ukrycie z poprzedniej rundy)
    document.getElementById('horseshoeStage').style.removeProperty('display');
    document.querySelector('.stage-title-box').style.opacity = '1';
    document.querySelector('.stage-title-box').style.pointerEvents = 'auto';

    // Przywracamy żarówki na scenie
    const lights = document.querySelector('.studio-lights');
    if (lights) {
        lights.style.display = 'block';
        setTimeout(() => lights.style.opacity = '1', 50); 
    }

    // Reset muzyki tła oraz stylów wygranej/porażki
    winBackgroundMusic.pause();
    winBackgroundMusic.currentTime = 0;
    lossBackgroundMusic.pause();
    lossBackgroundMusic.currentTime = 0;
    const titleBox = document.querySelector('.stage-title-box');
    titleBox.classList.remove('loss-border', 'win-border');
    document.querySelectorAll('[id^="next-round"]').forEach(btn => btn.classList.remove('pulse-loss-btn', 'pulse-win-btn'));

    // Ukrywamy wideo w kontenerze głównym
    const v = document.getElementById('victory-video');
    if (v) { 
        v.style.display = 'none'; 
        v.pause(); 
        v.currentTime = 0; 
    }
    const dv = document.getElementById('defeat-video');
    if (dv) { 
        dv.style.display = 'none'; 
        dv.pause(); 
        dv.currentTime = 0; 
    }

    // ================= TASOWANIE KANDYDATÓW =================
    let currentMapping = [...candidatesList]; 
    
    for (let i = currentMapping.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentMapping[i], currentMapping[j]] = [currentMapping[j], currentMapping[i]];
    }

    // Przywrócenie kabin i przypisanie im nowych "tożsamości"
    for (let i = 1; i <= 7; i++) {
        const cabin = document.getElementById(`cabin-${i}`);
        if(cabin) {
            cabin.classList.remove('eliminated', 'winner-cabin'); 
            cabin.style.display = ''; 
            gsap.killTweensOf(cabin);
            gsap.set(cabin, { clearProps: "all" });

            const candidateName = currentMapping[i - 1]; 
            cabin.dataset.candidate = candidateName;     

            const glass = document.getElementById(`glass-${i}`);
            const imgPart = document.getElementById(`hand-${i}`);
            const actionBtn = document.getElementById(`hand-btn-${i}`);
            const face = document.getElementById(`face-${i}`);

            glass.classList.add('blurred');
            glass.style.background = '';
            glass.style.boxShadow = '';
            document.getElementById(`video-${i}`).style.display = 'none';
            document.getElementById(`play-btn-${i}`).style.display = 'none';
            
            face.classList.add('hidden-face');
            face.src = `img/${candidateFaces[candidateName]}`;

            if (imgPart) {
                imgPart.classList.add('hidden-hand');
                imgPart.src = `img/Części_Ciała/${candidateName}_${data.part}.webp`;
            }

            if (actionBtn) {
                const partLabel = data.part.split('_')[0].toUpperCase();
                actionBtn.innerHTML = `🔍 ODSŁOŃ ${partLabel}`;
                actionBtn.setAttribute('onclick', `revealPart(${i})`);
                actionBtn.style.display = 'none'; 
            }
        }
    }

    audio.onended = () => {
        roundAudioPlaying = false;
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

        if (odkryteDlonie.size === 7) {
            // NOWOŚĆ: Pokazujemy licznik punktów
            document.getElementById('score-counter').style.display = 'block';

            // Każda runda to teraz Saper!
            document.getElementById('stage-desc').innerText = "Czas na czystki! Za każdego wyeliminowanego obcego faceta dostajesz +1 pkt. Uważaj! Jeśli skreślisz Roberta, kończysz rundę z karą -6 pkt! Odrzucaj mądrze.";
            
            for (let i = 1; i <= 7; i++) {
                const elBtn = document.getElementById(`elim-btn-${i}`);
                const cabin = document.getElementById(`cabin-${i}`);
                if (elBtn && cabin && !cabin.classList.contains('eliminated')) {
                    elBtn.style.display = 'inline-block';
                }
            }
        }
    }
}

// ==========================================
// 3. SILNIK "SAPERA" I PUNKTACJA
// ==========================================

// ==========================================
// 3. SILNIK "SAPERA" I PUNKTACJA (NOWY - KINOWY)
// ==========================================

function eliminateCandidate(id) {
    if (!moznaKlikac) return; // Zabezpieczenie przed klikaniem innych kabin w trakcie filmu
    
    const cabin = document.getElementById(`cabin-${id}`);
    const elBtn = document.getElementById(`elim-btn-${id}`);
    
    // Ukrywamy kliknięty przycisk eliminacji
    if (elBtn) elBtn.style.display = 'none';

    new Audio('img/button_click.mp3').play().catch(e => console.warn(e));

    const candidateInThisCabin = cabin.dataset.candidate;
    // Obejście dla Marka - tymczasowo ładuje pliki Arka
    const videoName = candidateInThisCabin === "Marek" ? "Arek" : candidateInThisCabin;

    if (candidateInThisCabin === "Robert") { 
        // ----------------------------------------------------
        // BOMBA! Wyrzuciła Roberta (PORAŻKA)
        // ----------------------------------------------------
        moznaKlikac = false;
        totalScore -= 6;
        updateScoreDisplay();
        
        document.getElementById('stage-desc').innerText = "KATASTROFA! Wyrzuciłaś Roberta! Runda zakończona. Pozostali kandydaci świętują!";
        document.querySelectorAll('.elim-cabin-btn').forEach(btn => btn.style.display = 'none');
        
        // 1. Kabina Roberta "wyparowuje" z ekranu
        gsap.to(cabin, { 
            scale: 0, opacity: 0, duration: 0.6, ease: "power2.in", 
            onComplete: () => {
                cabin.style.display = 'none';
                playVictoryVideosSequentially(); // Odpalamy triumf obcych po zniknięciu Roberta
            }
        });
        
    } else {
        // ----------------------------------------------------
        // SUKCES! Wyrzuciła obcego
        // ----------------------------------------------------
        moznaKlikac = false; // Blokujemy klikanie innych na czas filmu
        document.querySelectorAll('.elim-cabin-btn').forEach(btn => btn.style.pointerEvents = 'none');
        
        const video = document.getElementById(`video-${id}`);
        const handImg = document.getElementById(`hand-${id}`);
        const faceImg = document.getElementById(`face-${id}`);
        const silhouette = document.getElementById(`silhouette-${id}`);
        
        // Ukrywamy odkrytą część ciała i uruchamiamy wideo z Porażką
        if (handImg) handImg.classList.add('hidden-hand');
        if (silhouette) silhouette.style.display = 'none';
        if (faceImg) faceImg.classList.add('hidden-face');
        
        video.src = `img/${videoName}_Przegryw.mp4`;
        video.style.display = 'block';
        video.play().catch(e => console.warn(e));
        
        // Utrzymujemy powiększenie kabiny na czas odtwarzania wideo (nadpisujemy hover)
        gsap.killTweensOf(cabin);
        gsap.to(cabin, { scale: 1.15, y: -25, zIndex: 100, duration: 0.3 });
        
        video.onended = () => {
            // Koniec filmu: ukrywamy wideo, pokazujemy twarz, wyciemniamy i resetujemy skalę
            video.style.display = 'none';
            if (faceImg) faceImg.classList.remove('hidden-face');
            
            cabin.classList.add('eliminated'); 
            gsap.to(cabin, { scale: 1, y: 0, zIndex: 4, duration: 0.4 });
            
            eliminatedCount += 1;
            totalScore += 1; 
            updateScoreDisplay(); 
            
            document.getElementById('stage-desc').innerText = `Dobrze! +1 punkt. Do odstrzału zostało jeszcze ${6 - eliminatedCount} obcych!`;
            
            if (eliminatedCount === 6) {
                // IDEALNA RUNDA! Został tylko Robert
                document.getElementById('stage-desc').innerText = "WSPANIALE! Pozbyłaś się wszystkich ogrów i ocaliłaś narzeczonego!";
                document.querySelectorAll('.elim-cabin-btn').forEach(btn => btn.style.display = 'none');
                
                const winningCabin = document.querySelector('.cabin:not(.eliminated)');
                if (winningCabin) {
                    winningCabin.classList.add('winner-cabin');
                    gsap.killTweensOf(winningCabin);
                    gsap.to(winningCabin, { scale: 2, y: -100, zIndex: 200, duration: 1.5, ease: "elastic.out(1, 0.5)" });
                }
                
                document.querySelector('.stage-title-box').style.opacity = '0';
                document.querySelector('.stage-title-box').style.pointerEvents = 'none';
                document.querySelectorAll('.cabin.eliminated').forEach(c => c.style.display = 'none');
                
                const lights = document.querySelector('.studio-lights');
                if (lights) {
                    lights.style.opacity = '0';
                    setTimeout(() => lights.style.display = 'none', 500);
                }
                
                triggerEndRoundFarquaad('win');
            } else {
                // Runda trwa dalej, odblokowujemy przyciski
                document.querySelectorAll('.elim-cabin-btn').forEach(btn => btn.style.pointerEvents = 'auto');
                moznaKlikac = true;
            }
        };
    }
}

// Funkcja pomocnicza: sekwencyjne odtwarzanie filmów zwycięstwa pozostałych kandydatów
function playVictoryVideosSequentially() {
    // Pobieramy kabiny obcych, którzy nie zostali wyeliminowani (zwycięzcy rundy)
    const activeCabins = Array.from(document.querySelectorAll('.cabin:not(.eliminated)')).filter(c => c.dataset.candidate !== "Robert");
    
    function playNext(index) {
        if (index >= activeCabins.length) {
            // Gdy wszystkie filmy się skończą, wołamy Lorda Farquaada
            const stage = document.getElementById('horseshoeStage');
            stage.classList.remove('round1-layout', 'finale-layout'); 
            stage.style.setProperty('display', 'none', 'important');
            
            document.querySelector('.stage-title-box').classList.add('loss-border');
            triggerEndRoundFarquaad('loss');
            return;
        }
        
        const currentCabin = activeCabins[index];
        const currentId = currentCabin.id.split('-')[1];
        const currentCandidate = currentCabin.dataset.candidate;
        const currentVideoName = currentCandidate === "Marek" ? "Arek" : currentCandidate;
        
        const video = document.getElementById(`video-${currentId}`);
        const handImg = document.getElementById(`hand-${currentId}`);
        const faceImg = document.getElementById(`face-${currentId}`);
        const silhouette = document.getElementById(`silhouette-${currentId}`);
        
        // Ukrywamy to co w kabinie, szykujemy wideo Wygrywu
        if (handImg) handImg.classList.add('hidden-hand');
        if (silhouette) silhouette.style.display = 'none';
        if (faceImg) faceImg.classList.add('hidden-face');
        
        video.src = `img/${currentVideoName}_Wygryw.mp4`;
        video.style.display = 'block';
        
        // Lekko powiększamy wygrywającego kandydata, żeby skupić na nim uwagę
        gsap.killTweensOf(currentCabin);
        gsap.to(currentCabin, { scale: 1.25, y: -40, zIndex: 100, duration: 0.5 });
        
        video.onended = () => {
            // Po filmie pokazujemy jego twarz i pomniejszamy, a następnie odpalamy kolejnego z listy
            video.style.display = 'none';
            if (faceImg) faceImg.classList.remove('hidden-face');
            
            gsap.to(currentCabin, { scale: 1, y: 0, zIndex: 4, duration: 0.4, onComplete: () => {
                playNext(index + 1);
            }});
        };
        
        video.play().catch(e => {
            console.warn(e);
            playNext(index + 1); // W razie błędu omiń ten filmik i leć dalej
        });
    }
    
    playNext(0); // Start pętli od pierwszego kandydata z listy
}

// ==========================================
// 4. LORD FARQUAAD PODSUMOWUJĄCY RUNDĘ
// ==========================================

const farquaadRoundData = {
    1: {
        win: { text: "Cóż za sokoli wzrok! Poznać księcia po samych paluszkach... jestem pod wrażeniem.", audio: "Lord_Robert_Wygrywa_1.mp3", duration: 5 },
        loss: { text: "Własnego narzeczonego potraktować jak pierwszego lepszego ogra?! Oby na ślubnym kobiercu wzrok służył Ci lepiej!", audio: "Lord_Robert_Odpada_1.mp3", duration: 7 }
    },
    2: {
        win: { text: "Idealny wybór! Te nogi już niedługo zatańczą z Tobą na weselu do białego rana. Żaden inny model nie miał z nimi szans!", audio: "Lord_Robert_Wygrywa_2.mp3", duration: 8 },
        loss: { text: "Twoje radio nadaje na fali totalnej katastrofy! Wyrzuciłaś Roberta?!", audio: "Lord_Robert_Odpada_2.mp3", duration: 5 }
    },
    3: {
        win: { text: "Wybrałaś pępek równie precyzyjnie, jak trasę na Szyndzielnię w gęstej mgle. Imponujące, choć dla mnie to wciąż tylko miejsce na zbiór kłaczków!", audio: "Lord_Robert_Wygrywa_3.mp3", duration: 8 },
        loss: { text: "Robert odpada? Gratulacje, właśnie przegrałaś z cudzym pępkiem.", audio: "Lord_Robert_Odpada_3.mp3", duration: 4 }
    },
    4: {
        win: { text: "Te sutki są tak smutne i przerażone, że wyglądają, jakby chciały uciec! Próbuję nastroić to radyjko na męską częstotliwość", audio: "Lord_Robert_Wygrywa_4.mp3", duration: 7 },
        loss: { text: "Własnego narzeczonego potraktować jak pierwszego lepszego ogra?! Oby na ślubnym kobiercu wzrok służył Ci lepiej!", audio: "Lord_Robert_Odpada_1.mp3", duration: 7 }
    },
    5: {
        win: { text: "Łokieć idealny! Kamila, masz oko do detali! Szukasz tak precyzyjnie, jakbyś odróżniała gatunki mchu na korze drzew!", audio: "Lord_Robert_Wygrywa_5.mp3", duration: 7 },
        loss: { text: "Ojej, Robert wyleciał? Twoja selekcja jest bardziej chaotyczna niż stado owiec na górskim szlaku. Ale za to jaka rozrywka!", audio: "Lord_Robert_Odpada_5.mp3", duration: 7 }
    },
    6: {
        win: { text: "Biceps Roberta wygrał na tle konkurencji - która miała je chudsze od kijków do Nordic Walking", audio: "Lord_Robert_Wygrywa_6.mp3", duration: 5 },
        loss: { text: "Wyrzuciłaś Roberta? Jak on się o tym dowie to już nie pomoże Ci z tym cięższym plecakiem w górach", audio: "Lord_Robert_Odpada_6.mp3", duration: 6 }
    },
    7: {
        win: { text: "Nic dziwnego że wygrały łapki Roberta skoro reszta wyglądała jak łapy trolli!", audio: "Lord_Robert_Wygrywa_7.mp3", duration: 4 },
        loss: { text: "Gratulacje! Jakbyś przy ołtarzu zakładała obrączkę komuś innemu, to nawet byś nie wiedziała", audio: "Lord_Robert_Odpada_7.mp3", duration: 5 }
    },
    8: {
        win: { text: "Bez błędów rozpoznałaś te dłonie, które już niedługo wsuną Ci obrączkę na palec. Jesteś gotowa na ślub!", audio: "Lord_Robert_Wygrywa_8.mp3", duration: 5 },
        loss: { text: "Ups - te palce nie należą do Twojego narzeczonego. Masz romans?", audio: "Lord_Robert_Odpada_8.mp3", duration: 4 }
    },
    9: {
        win: { text: "Ten zarost znasz na pamięć. Robert może być spokojny bo żaden inny facet nie ma szans na Twojego buziola!", audio: "Lord_Robert_Wygrywa_9.mp3", duration: 6 },
        loss: { text: "Czyje to wąsy, bo na pewno nie Twojego faceta! Chyba pora na test z całowania na ślepo..", audio: "Lord_Robert_Odpada_9.mp3", duration: 5 }
    },
    10: {
        win: { text: "Masz niesamowitego nosa do swojego faceta! Wywąchałaś go bezbłędnie", audio: "Lord_Robert_Wygrywa_10.mp3", duration: 5 },
        loss: { text: "Co za kinol, ale niestety nie ten! Twój narzeczony utarłby Ci nosa za tę pomyłkę.", audio: "Lord_Robert_Odpada_10.mp3", duration: 6 }
    },
    11: {
        win: { text: "Słuchasz go jak nikt inny! Idealnie rozpoznałaś to ucho, w które już niedługo będziesz szeptać małżeńskie tajemnice.", audio: "Lord_Robert_Wygrywa_11.mp3", duration: 7 },
        loss: { text: "Coś kiepsko słuchasz swojego narzeczonego, skoro nie znasz jego uszu!", audio: "Lord_Robert_Odpada_11.mp3", duration: 4 }
    },
    12: {
        win: { text: "Wybór w mgnieniu oka! Patrzysz na niego z taką miłością, że poznałaś to spojrzenie z kilometra. Jesteście dla siebie stworzeni!", audio: "Lord_Robert_Wygrywa_12.mp3", duration: 7 },
        loss: { text: "Miłość jest ślepa, ale bez przesady! Spojrzałaś w oczy innego faceta i poległaś. Czas kupić mocniejsze okulary przed ślubem!", audio: "Lord_Robert_Odpada_12.mp3", duration: 8 }
    }
};

function triggerEndRoundFarquaad(result) {
    const container = document.getElementById('farquaad-container');
    const bubble = document.getElementById('farquaad-bubble');
    const textElement = document.getElementById('farquaad-text');
    
    // Zabezpieczenie przed brakiem tekstu w nowej rundzie
    const data = farquaadRoundData[currentRound] ? farquaadRoundData[currentRound][result] : { text: "Brak danych.", audio: "button_click.mp3", duration: 4 };
    
    bubble.style.setProperty('--bubble-color', result === 'win' ? '#00ff66' : '#ff0044');
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
                        
                        // Zmiana sceny po ZNIKNIĘCIU Lorda
                        if (result === 'win') {
                            const stage = document.getElementById('horseshoeStage');
                            stage.classList.remove('round1-layout', 'finale-layout'); 
                            stage.style.setProperty('display', 'none', 'important');
                            
                            document.querySelector('.stage-title-box').style.opacity = '1';    
                            document.querySelector('.stage-title-box').style.pointerEvents = 'auto'; 
                            
                            // Aktywacja pulsowania i MUZYKI TŁA dla wygranej
                            document.querySelector('.stage-title-box').classList.add('win-border');
                            winBackgroundMusic.play().catch(e => console.warn(e));

                            // Wyświetlenie wideo w środku kontenera
                            const v = document.getElementById('victory-video');
                            if (v) {
                                v.style.display = 'block';
                                v.play().catch(e => console.warn(e));
                            }
                        } else if (result === 'loss') {
                            // Kabiny zniknęły jeszcze przed Lordem, teraz odpalamy tylko muzykę z 15% głośności
                            lossBackgroundMusic.play().catch(e => console.warn(e)); 
                            
                            // Wyświetlenie wideo z przegraną w środku kontenera
                            const dv = document.getElementById('defeat-video');
                            if (dv) {
                                dv.style.display = 'block';
                                dv.play().catch(e => console.warn(e));
                            }
                        }

                        // Po zakończeniu mowy Lorda w finale pojawia się werdykt, a wcześniej następna runda
                        if (currentRound === 12) {
                            const vBtn = document.getElementById('show-verdict-btn');
                            if (vBtn) vBtn.style.display = 'inline-block';
                        } else {
                            const nextBtn = document.getElementById(`next-round${currentRound + 1}-btn`);
                            if (nextBtn) {
                                nextBtn.style.display = 'inline-block';
                                if (result === 'loss') nextBtn.classList.add('pulse-loss-btn');
                                if (result === 'win') nextBtn.classList.add('pulse-win-btn');
                            }
                        }
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
            if (roundAudioPlaying) return;
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
            if (roundAudioPlaying) return; // Blokada podczas odtwarzania audio
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

// ==========================================
// 6. EKRAN KOŃCOWY I WERDYKT (PO RUNDZIE 12)
// ==========================================

function showFinalVerdict() {
    new Audio('img/button_click.mp3').play().catch(e => console.warn(e));
    
    // Twarde ukrycie starej sceny i starego kontenera z tekstem
    document.getElementById('horseshoeStage').style.setProperty('display', 'none', 'important');
    const oldTitleBox = document.querySelector('.stage-title-box:not(#final-verdict-box)');
    if (oldTitleBox) oldTitleBox.style.display = 'none';
    
    // Zatrzymujemy inne muzyki
    winBackgroundMusic.pause();
    lossBackgroundMusic.pause();
    
    // Ustawienie odpowiedniego tekstu i koloru z poprawką błędu
    const verdictBox = document.getElementById('final-verdict-box');
    const pointsEl = document.getElementById('final-points');
    const titleEl = document.getElementById('final-title');
    const descEl = document.getElementById('final-desc');
    
    verdictBox.style.display = 'block';
    pointsEl.innerText = `${totalScore} / 72 PKT`;
    
    if (totalScore >= 60) {
        verdictBox.classList.add('win-border');
        titleEl.innerText = "EKSPERTKA OD ROBERTA!";
        titleEl.style.color = "#00ff66";
        descEl.innerText = "Jesteście jednością. Poznałabyś go nawet z zamkniętymi oczami w tłumie facetów. Ślub może się odbyć bez najmniejszych obaw!";
        winBackgroundMusic.play().catch(e => console.warn(e));
    } else if (totalScore >= 30) {
        titleEl.innerText = "DOBRZE, ALE BEZ SZAŁU!";
        titleEl.style.color = "#ffcc00";
        descEl.innerText = "Znacie się nieźle, ale parę razy wzrok Cię zmylił i o mało co nie poślubiłaś obcego ogra. Przed ołtarzem lepiej miej oczy szeroko otwarte!";
    } else {
        verdictBox.classList.add('loss-border');
        titleEl.innerText = "KATASTROFA!";
        titleEl.style.color = "#ff0044";
        descEl.innerText = "Zaliczyłaś tyle wpadek, że cudzemu facetowi zafundowałabyś podróż poślubną! Koniecznie załóżcie wizytówki z imionami na weselu, żebyś nie pomyliła męża!";
        lossBackgroundMusic.play().catch(e => console.warn(e));
    }
}