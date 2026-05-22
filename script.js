/**
 * Vitalis Academy Core Logic
 * Handles persistence, interactivity, and "Life" elements.
 */

// --- State Management ---
const VitalisState = {
    get() {
        const defaultState = {
            points: 0,
            completedModules: [],
            userName: "د. عمر عبد العزيز",
            rank: "طالب متدرب",
            notifications: [
                { id: 1, text: "أهلاً بك في أكاديمية Vitalis المحدثة!", time: "الآن" }
            ],
            history: []
        };
        const saved = localStorage.getItem('vitalis_academy_state');
        return saved ? JSON.parse(saved) : defaultState;
    },
    save(state) {
        localStorage.setItem('vitalis_academy_state', JSON.stringify(state));
    },
    addPoints(p, reason) {
        const s = this.get();
        s.points += p;
        if (reason) s.history.unshift({ text: reason, time: new Date().toLocaleTimeString('ar-SA') });
        if (s.history.length > 5) s.history.pop();
        
        // Update Rank
        if (s.points > 1200) s.rank = "استشاري (Consultant)";
        else if (s.points > 700) s.rank = "أخصائي (Specialist)";
        else if (s.points > 300) s.rank = "طبيب مقيم (Resident)";
        else s.rank = "طالب متدرب (Intern)";

        this.save(s);
        this.updateUI();
        spawnNotification(`+${p} نقطة: ${reason}`);
    },
    updateUI() {
        const s = this.get();
        const pointElements = document.querySelectorAll('.points-display, #score');
        pointElements.forEach(el => el.innerText = s.points);

        const rankEl = document.getElementById('userRank');
        if (rankEl) rankEl.innerText = s.rank;
        
        const progressCircle = document.querySelector('.progress-circle');
        if (progressCircle) {
            const percentage = Math.min(Math.round((s.points / 1500) * 100), 100);
            
            // Animate Background
            progressCircle.style.background = `conic-gradient(var(--primary) ${percentage}%, #e2e8f0 0)`;
            
            // Animate Number smoothly
            let start = parseInt(progressCircle.getAttribute('data-current') || 0);
            let end = percentage;
            let duration = 1000;
            let startTime = null;

            function animate(currentTime) {
                if (!startTime) startTime = currentTime;
                let elapsed = currentTime - startTime;
                let progress = Math.min(elapsed / duration, 1);
                let current = Math.floor(start + (end - start) * progress);
                
                progressCircle.style.setProperty('--progress-text', `"${current}%"`);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    progressCircle.setAttribute('data-current', end);
                }
            }
            requestAnimationFrame(animate);
        }

        // Update Academy Rank (Simulated)
        const academyRankEl = document.getElementById('academyRankDisplay');
        if (academyRankEl) {
            const rank = Math.max(1, 100 - Math.floor(s.points / 20));
            academyRankEl.innerText = rank;
        }

        // Update History
        const historyList = document.getElementById('recentActivity');
        if (historyList && s.history.length > 0) {
            historyList.innerHTML = s.history.map(item => `
                <div class="quick-link" style="font-size: 0.8rem; animation: slideInLeft 0.3s ease;">
                    <i class="fas fa-check-circle" style="color: #22c55e;"></i>
                    <span>${item.text}</span>
                    <span style="margin-right: auto; opacity: 0.5;">${item.time}</span>
                </div>
            `).join('');
        }
    }
};

// --- "Life" Features ---

// 1. Live Clock
function updateClock() {
    const clockEl = document.getElementById('liveClock');
    if (clockEl) {
        const now = new Date();
        clockEl.innerText = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    }
}

// 2. Random Notifications
function spawnNotification(text) {
    const container = document.getElementById('notifContainer');
    if (!container) return;

    const notif = document.createElement('div');
    notif.className = 'notif-toast';
    notif.innerHTML = `<i class="fas fa-bell"></i> ${text}`;
    container.appendChild(notif);

    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 500);
    }, 4000);
}

// 3. Library Search
function initSearch() {
    const searchInput = document.getElementById('libSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.article-card');
            cards.forEach(card => {
                const text = card.innerText.toLowerCase();
                card.style.display = text.includes(term) ? 'block' : 'none';
            });
        });
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    VitalisState.updateUI();
    setInterval(updateClock, 1000);
    updateClock();
    initSearch();

    // Smooth page transitions
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 10);

    // Dynamic greeting based on time
    const hour = new Date().getHours();
    const welcomeText = document.querySelector('.welcome-banner h1');
    if (welcomeText) {
        let greeting = "صباح الخير";
        if (hour >= 12) greeting = "مساء الخير";
        if (hour >= 18) greeting = "ليلة سعيدة";
        welcomeText.innerText = `${greeting}، د. عمر`;
    }
});

// Global Helpers
window.addVitalisPoints = (p) => VitalisState.addPoints(p);
