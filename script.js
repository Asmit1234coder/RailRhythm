document.addEventListener('DOMContentLoaded', () => {
    
    const App = {
        // --- INITIALIZATION ---
        init() {
            console.log("Traffic Control Center UI Initialized.");
            this.setupEventListeners();
            this.showPage('control-center'); // Default page
            this.startLiveUpdates(); // start dummy metrics updates
            this.startDummyAlerts(); // start dummy alerts
        },

        // --- CONTENT SWITCHING LOGIC ---
        showPage(pageId) {
            document.querySelectorAll('.content-page').forEach(page => {
                page.classList.add('hidden');
            });

            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                targetPage.classList.remove('hidden');
            } else {
                console.error(`Error: Page with ID "${pageId}" not found.`);
            }
        },

        // --- EVENT LISTENER SETUP ---
        setupEventListeners() {
            // Sidebar navigation
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    if (item.classList.contains('active')) return;

                    // Update active states
                    navItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');

                    // Show target content
                    const targetPageId = item.dataset.target;
                    this.showPage(targetPageId);

                    console.log(`Switched to: ${item.querySelector('span').textContent}`);
                });
            });

            // AI Insights button glow effect
            const aiInsightsButton = document.getElementById('ai-insights-btn');
            if (aiInsightsButton) {
                aiInsightsButton.addEventListener('click', () => {
                    console.log("'AI Insights' button clicked.");
                    const insightsPanel = document.querySelector('.insights-panel');
                    if (insightsPanel) {
                        insightsPanel.style.transition = 'box-shadow 0.3s ease';
                        insightsPanel.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.6)';
                        setTimeout(() => {
                            insightsPanel.style.boxShadow = 'none';
                        }, 1500);
                    }
                });
            }

            // Sidebar toggle for mobile
            const toggleBtn = document.getElementById("toggle-sidebar");
            if (toggleBtn) {
                toggleBtn.addEventListener("click", () => {
                    document.querySelector("aside").classList.toggle("hidden");
                });
            }
        },

        // --- LIVE METRICS UPDATE ---
        startLiveUpdates() {
            this.updateMetricsOnce(); // run immediately
            setInterval(() => {
                this.updateMetricsOnce();
            }, 3000);
        },

        updateMetricsOnce() {
            // On-Time Performance
            const onTime = Math.floor(Math.random() * 100);
            const onTimeMetric = document.getElementById("on-time-metric");
            const onTimeBar = document.getElementById("on-time-bar");
            if (onTimeMetric && onTimeBar) {
                onTimeMetric.textContent = onTime + "%";
                onTimeBar.style.width = onTime + "%";
            }

            // Average Speed
            const speed = Math.floor(Math.random() * 80) + 40; // 40–120 km/h
            const speedMetric = document.getElementById("avg-speed-metric");
            const speedBar = document.getElementById("avg-speed-bar");
            if (speedMetric && speedBar) {
                speedMetric.textContent = speed + " km/h";
                speedBar.style.width = (speed / 120 * 100) + "%";
            }

            // Network Efficiency
            const efficiency = Math.floor(Math.random() * 100);
            const effMetric = document.getElementById("efficiency-metric");
            const effBar = document.getElementById("efficiency-bar");
            if (effMetric && effBar) {
                effMetric.textContent = efficiency + "%";
                effBar.style.width = efficiency + "%";
            }

            // --- UPDATE KPI CARDS ---
            // Active Trains (simulate 0–10)
            const activeTrains = Math.floor(Math.random() * 10);
            const activeTrainsEl = document.getElementById("active-trains");
            if (activeTrainsEl) activeTrainsEl.textContent = activeTrains;

            // Network Efficiency KPI
            const netEffEl = document.getElementById("network-efficiency");
            if (netEffEl) netEffEl.textContent = efficiency + "%";

            // Avg Delay (simulate 0–15 min)
            const delay = Math.floor(Math.random() * 15);
            const avgDelayEl = document.getElementById("avg-delay");
            if (avgDelayEl) avgDelayEl.textContent = delay + " min";
        },

        // --- DUMMY ALERT GENERATOR ---
        startDummyAlerts() {
            const alertsContainer = document.getElementById("alerts-container");
            if (!alertsContainer) return;

            const dummyAlerts = [
                "Delay predicted: Train 12456 (Mumbai–Delhi) +12 min",
                "Track maintenance scheduled at Station X",
                "Congestion detected near Junction Y",
                "Priority assigned to Passenger Train 22222",
                "Freight Train 88901 rerouted to avoid delay"
            ];

            const alertsCard = alertsContainer.closest('.card');
            const alertsTitleEl = alertsCard ? alertsCard.querySelector('h2') : null;
            const activeAlertsCountEl = document.getElementById("active-alerts-count");

            const updateAlertsTitle = () => {
                const count = alertsContainer.querySelectorAll('.alert-item').length;
                if (alertsTitleEl) {
                    alertsTitleEl.textContent = `Active Alerts (${count})`;
                }
                if (activeAlertsCountEl) {
                    activeAlertsCountEl.textContent = count; // update KPI card
                }
            };

            const removePlaceholderIfPresent = () => {
                const children = Array.from(alertsContainer.children);
                children.forEach(ch => {
                    const txt = (ch.textContent || '').trim().toLowerCase();
                    if (txt.includes('no active alert')) ch.remove();
                });
            };

            removePlaceholderIfPresent();
            updateAlertsTitle();

            setInterval(() => {
                removePlaceholderIfPresent();

                const randomAlert = dummyAlerts[Math.floor(Math.random() * dummyAlerts.length)];
                const alertEl = document.createElement("div");
                alertEl.className = "alert-item text-sm text-yellow-400";
                alertEl.style.wordBreak = "break-word";
                alertEl.textContent = `⚠️ ${randomAlert} — ${new Date().toLocaleTimeString()}`;

                alertsContainer.prepend(alertEl);

                const items = alertsContainer.querySelectorAll('.alert-item');
                if (items.length > 5) {
                    items[items.length - 1].remove();
                }

                updateAlertsTitle();
            }, 10000);
        },
    };

    App.init();

});






