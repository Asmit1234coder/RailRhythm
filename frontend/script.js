document.addEventListener('DOMContentLoaded', () => {
    let timelineChart; // Chart.js instance

    const App = {
        // --- INITIALIZATION ---
        init() {
            console.log("Traffic Control Center UI Initialized.");
            this.setupEventListeners();
            this.showPage('control-center'); // Default page
            this.startLiveUpdates();
            this.startDummyAlerts();
        },

        // --- CONTENT SWITCHING LOGIC ---
        showPage(pageId) {
            document.querySelectorAll('.content-page').forEach(page => {
                page.classList.add('hidden');
            });
            const targetPage = document.getElementById(pageId);
            if (targetPage) targetPage.classList.remove('hidden');
            else console.error(`Error: Page with ID "${pageId}" not found.`);
        },

        // --- EVENT LISTENER SETUP ---
        setupEventListeners() {
            // Sidebar navigation
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    if (item.classList.contains('active')) return;
                    navItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    this.showPage(item.dataset.target);
                });
            });

            // AI Insights button glow effect
            const aiInsightsButton = document.getElementById('ai-insights-btn');
            if (aiInsightsButton) {
                aiInsightsButton.addEventListener('click', () => {
                    const insightsPanel = document.querySelector('.insights-panel');
                    if (insightsPanel) {
                        insightsPanel.style.transition = 'box-shadow 0.3s ease';
                        insightsPanel.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.6)';
                        setTimeout(() => insightsPanel.style.boxShadow = 'none', 1500);
                    }
                });
            }

            // Sidebar toggle (mobile)
            const toggleBtn = document.getElementById("toggle-sidebar");
            if (toggleBtn) {
                toggleBtn.addEventListener("click", () => {
                    document.querySelector("aside").classList.toggle("hidden");
                });
            }
        },

        // --- LIVE METRICS UPDATE ---
        startLiveUpdates() {
            this.updateMetricsOnce();
            this.fetchTimeline();
            setInterval(() => {
                this.updateMetricsOnce();
                this.fetchTimeline();
            }, 3000);
        },

        updateMetricsOnce() {
            fetch("http://127.0.0.1:8000/metrics")
                .then(res => res.json())
                .then(data => {
                    document.getElementById("active-trains").textContent = data.active_trains;
                    document.getElementById("network-efficiency").textContent = data.efficiency + "%";
                    document.getElementById("avg-delay").textContent = data.avg_delay + " min";

                    document.getElementById("on-time-metric").textContent = data.on_time + "%";
                    document.getElementById("on-time-bar").style.width = data.on_time + "%";

                    document.getElementById("avg-speed-metric").textContent = data.avg_speed + " km/h";
                    document.getElementById("avg-speed-bar").style.width = (data.avg_speed / 120 * 100) + "%";

                    document.getElementById("efficiency-metric").textContent = data.efficiency + "%";
                    document.getElementById("efficiency-bar").style.width = data.efficiency + "%";

                    // Alerts
                    const alertsContainer = document.getElementById("alerts-container");
                    alertsContainer.innerHTML = "";
                    data.alerts.forEach(alert => {
                        const div = document.createElement("div");
                        div.className = "alert-item text-sm text-yellow-400";
                        div.textContent = "⚠️ " + alert;
                        alertsContainer.appendChild(div);
                    });
                    document.getElementById("active-alerts-count").textContent = data.alerts.length;
                })
                .catch(err => console.error("Error fetching /metrics", err));
        },

        fetchTimeline() {
            fetch("http://127.0.0.1:8000/timeline")
                .then(res => res.json())
                .then(data => {
                    console.log("Timeline data:", data.timeline);
                    renderTimeline(data.timeline); // ✅ draw chart
                })
                .catch(err => console.error("Error fetching /timeline", err));
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

            const activeAlertsCountEl = document.getElementById("active-alerts-count");

            const updateAlertsTitle = () => {
                const count = alertsContainer.querySelectorAll('.alert-item').length;
                if (activeAlertsCountEl) activeAlertsCountEl.textContent = count;
            };

            setInterval(() => {
                const randomAlert = dummyAlerts[Math.floor(Math.random() * dummyAlerts.length)];
                const alertEl = document.createElement("div");
                alertEl.className = "alert-item text-sm text-yellow-400";
                alertEl.textContent = `⚠️ ${randomAlert} — ${new Date().toLocaleTimeString()}`;
                alertsContainer.prepend(alertEl);

                const items = alertsContainer.querySelectorAll('.alert-item');
                if (items.length > 5) items[items.length - 1].remove();
                updateAlertsTitle();
            }, 10000);
        }
    };

    // --- TIMELINE RENDER FUNCTION ---
    function renderTimeline(timelineData) {
        const ctx = document.getElementById("timelineChart").getContext("2d");
        const trains = [...new Set(timelineData.map(d => d.train))];

        const colors = {
            "T1": "rgba(255,99,132,0.8)",
            "T2": "rgba(54,162,235,0.8)",
            "T3": "rgba(75,192,192,0.8)"
        };

        const datasets = trains.map(train => {
            const trainData = timelineData.filter(d => d.train === train);
            return {
                label: train,
                data: trainData.map(d => ({
                    x: [d.start, d.end],
                    y: train,
                    block: d.block
                })),
                backgroundColor: colors[train] || "rgba(200,200,200,0.8)"
            };
        });

        if (timelineChart) timelineChart.destroy();

        timelineChart = new Chart(ctx, {
            type: "bar",
            data: { datasets },
            options: {
                indexAxis: "y",
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const d = ctx.raw;
                                return `Block ${d.block} | ${d.x[0]} → ${d.x[1]}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: "linear",
                        position: "bottom",
                        title: { display: true, text: "Time" }
                    },
                    y: {
                        type: "category",
                        labels: trains,
                        title: { display: true, text: "Trains" }
                    }
                }
            }
        });
    }

    App.init();
});

