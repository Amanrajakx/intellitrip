// IntelliTrip - Complete Application JavaScript
// Manages both Landing Page and Dashboard functionality

class IntelliTripApp {
    constructor() {
        this.currentView = 'dashboard';
        this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        this.userData = this.getUserData();
        this.init();
    }

    init() {
        this.detectPageType();
        this.setupEventListeners();
        this.setupNavigation();
        this.loadInitialData();
        this.setupAnimations();
        this.updateAuthUI();
    }

    detectPageType() {
        // Check if we're on dashboard or landing page
        const sidebar = document.querySelector('.sidebar');
        this.isDashboard = !!sidebar;
        console.log(`Loading ${this.isDashboard ? 'Dashboard' : 'Landing Page'}...`);
    }

    setupEventListeners() {
        // Mobile menu toggle (Landing Page)
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                menuToggle.innerHTML = navMenu.classList.contains('active') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-bars"></i>';
            });
            
            // Close mobile menu when clicking a link
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    if (menuToggle) {
                        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                });
            });
        }

        // Dashboard sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                this.showToast('Sidebar toggled', 'info');
            });
        }

        // Navigation links (Dashboard)
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.dataset.view;
                this.showView(view);
                this.updateActiveNav(link);
                
                // Close sidebar on mobile
                if (window.innerWidth < 992 && sidebar) {
                    sidebar.classList.remove('active');
                }
            });
        });

        // AI Tips functionality
        const aiTipsBtn = document.getElementById('aiTipsBtn');
        const aiTipsLink = document.getElementById('aiTipsLink');
        const viewMoreTipsBtn = document.getElementById('viewMoreTipsBtn');
        
        if (aiTipsBtn) {
            aiTipsBtn.addEventListener('click', () => this.openAITips());
        }
        
        if (aiTipsLink) {
            aiTipsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openAITips();
            });
        }
        
        if (viewMoreTipsBtn) {
            viewMoreTipsBtn.addEventListener('click', () => this.openAITips());
        }

        // Notifications
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationsDropdown = document.getElementById('notificationsDropdown');
        
        if (notificationBtn && notificationsDropdown) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationsDropdown.classList.toggle('show');
            });
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            if (notificationsDropdown) {
                notificationsDropdown.classList.remove('show');
            }
        });

        // Search functionality
        const globalSearch = document.getElementById('globalSearch');
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                if (clearSearchBtn) {
                    clearSearchBtn.style.opacity = e.target.value ? '1' : '0';
                }
            });
            
            globalSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(globalSearch.value);
                }
            });
        }
        
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                if (globalSearch) {
                    globalSearch.value = '';
                    clearSearchBtn.style.opacity = '0';
                    this.showToast('Search cleared', 'info');
                }
            });
        }

        // Modal functionality
        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // Modal tabs
        const modalTabs = document.querySelectorAll('.modal-tab');
        modalTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                this.switchModalTab(tabId);
            });
        });

        // Quick create button
        const quickCreateBtn = document.getElementById('quickCreateBtn');
        if (quickCreateBtn) {
            quickCreateBtn.addEventListener('click', () => {
                this.showView('trips');
                this.showToast('Creating new trip...', 'info');
            });
        }

        // Save AI tips
        document.addEventListener('click', (e) => {
            if (e.target.closest('.ai-tip-save')) {
                const tip = e.target.closest('.ai-tip');
                const title = tip.querySelector('h4').textContent;
                this.saveAITip(title);
            }
        });

        // Dashboard preview tilt effect (Landing Page)
        const dashboardPreview = document.querySelector('.dashboard-preview');
        if (dashboardPreview) {
            dashboardPreview.addEventListener('mousemove', (e) => {
                const rect = dashboardPreview.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateY = (x - centerX) / 20;
                const rotateX = (centerY - y) / 20;
                
                dashboardPreview.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            
            dashboardPreview.addEventListener('mouseleave', () => {
                dashboardPreview.style.transform = 'perspective(1000px) rotateX(0) rotateY(-5deg)';
            });
        }

        // CTA buttons
        document.querySelectorAll('.cta-primary, .signup-btn, .login-btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
            
            // Add loading state
            btn.addEventListener('click', function(e) {
                if (!this.href || this.href === '#') return;
                
                this.classList.add('loading');
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 1500);
            });
        });

        // Feature cards interaction
        document.querySelectorAll('.feature').forEach(feature => {
            feature.addEventListener('click', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                setTimeout(() => {
                    this.style.transform = 'translateY(-8px)';
                }, 150);
            });
        });

        // Metric cards interaction (Dashboard)
        document.querySelectorAll('.metric-card').forEach(card => {
            card.addEventListener('click', function() {
                const title = this.querySelector('h4')?.textContent || 'Details';
                window.dashboard?.showToast(`Viewing ${title} details`, 'info');
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (globalSearch) globalSearch.focus();
            }
            
            // Escape to close modals/dropdowns
            if (e.key === 'Escape') {
                this.closeModal();
                if (notificationsDropdown) {
                    notificationsDropdown.classList.remove('show');
                }
            }
            
            // F1 for help
            if (e.key === 'F1') {
                e.preventDefault();
                this.openAITips();
            }
        });

        // Scroll events
        window.addEventListener('scroll', () => {
            this.handleScroll();
            this.highlightNavOnScroll();
        });

        // Window resize
        window.addEventListener('resize', () => this.handleResize());

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#' || targetId === '') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Trip item click handlers
        document.querySelectorAll('.trip-item').forEach(trip => {
            trip.addEventListener('click', () => {
                const title = trip.querySelector('h3, h4')?.textContent || 'Trip';
                this.showToast(`Opening ${title} details`, 'info');
            });
        });

        // Chart interaction
        document.querySelectorAll('.chart-bar, .trend-bar').forEach(bar => {
            bar.addEventListener('mouseenter', function() {
                const value = this.getAttribute('data-value') || 
                             this.textContent || 
                             this.style.height;
                this.setAttribute('title', value);
            });
        });

        // Add CSS for loading state
        this.addLoadingStyles();
    }

    setupNavigation() {
        // Set initial view from URL hash or default
        const hash = window.location.hash.substring(1);
        if (hash && this.isDashboard) {
            this.showView(hash);
        }
        
        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            if (this.isDashboard) {
                const hash = window.location.hash.substring(1) || 'dashboard';
                this.showView(hash);
            }
        });
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }, observerOptions);
        
        // Observe elements to animate
        const animatedElements = document.querySelectorAll('.feature, .step, .metric-card, .stat-card, .dashboard-card');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.5s ease';
            observer.observe(el);
        });

        // Progress bar animations
        const progressBars = document.querySelectorAll('.progress');
        const progressObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateProgressBars();
                    progressObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        progressBars.forEach(bar => {
            if (bar.parentElement) {
                progressObserver.observe(bar.parentElement);
            }
        });
    }

    animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress');
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.transition = 'width 1.5s ease';
                bar.style.width = width;
            }, 300);
        });
    }

    showView(viewName) {
        if (!this.isDashboard) return;
        
        const views = document.querySelectorAll('.view');
        const selectedView = document.getElementById(`${viewName}View`);
        
        if (!selectedView) return;
        
        // Hide all views
        views.forEach(view => view.classList.remove('active'));
        
        // Show selected view
        selectedView.classList.add('active');
        this.currentView = viewName;
        
        // Update URL
        history.pushState(null, null, `#${viewName}`);
        
        // Update page title
        this.updatePageTitle(viewName);
        
        // Show success toast for non-dashboard views
        if (viewName !== 'dashboard') {
            const viewNames = {
                trips: 'My Trips',
                expenses: 'Expenses',
                analytics: 'Analytics',
                reports: 'Reports'
            };
            this.showToast(`Switched to ${viewNames[viewName] || viewName}`, 'success');
        }
        
        // Load view-specific data
        this.loadViewData(viewName);
    }

    updatePageTitle(view) {
        const pageTitle = document.getElementById('currentPageTitle');
        const pageSubtitle = document.getElementById('currentPageSubtitle');
        
        const titles = {
            dashboard: {
                title: 'Dashboard',
                subtitle: 'Welcome back! Manage your travel expenses efficiently'
            },
            trips: {
                title: 'My Trips',
                subtitle: 'Manage all your travel plans and upcoming journeys'
            },
            expenses: {
                title: 'Expenses',
                subtitle: 'Track and manage all your travel expenses'
            },
            analytics: {
                title: 'Analytics',
                subtitle: 'Get insights about your travel patterns and spending'
            },
            reports: {
                title: 'Reports',
                subtitle: 'Generate detailed travel expense reports'
            }
        };
        
        if (pageTitle && pageSubtitle) {
            const titleData = titles[view] || titles.dashboard;
            pageTitle.textContent = titleData.title;
            pageSubtitle.textContent = titleData.subtitle;
        }
    }

    updateActiveNav(activeLink) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link === activeLink) {
                link.classList.add('active');
            }
        });
    }

    loadInitialData() {
        // Load dashboard data if on dashboard
        if (this.isDashboard) {
            this.updateDashboardData();
            this.loadNotifications();
            this.loadAITips();
            this.updateGreeting();
        }
        
        // Load landing page data
        if (!this.isDashboard) {
            this.updateStats();
        }
    }

    updateDashboardData() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Update greeting
        const greeting = this.getGreeting();
        const greetingElement = document.getElementById('greeting');
        if (greetingElement) {
            greetingElement.textContent = `${greeting} • ${timeString}`;
        }
        
        // Update charts with animation
        this.updateChartData();
        
        // Update stats if needed
        this.updateRealTimeStats();
    }

    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }

    updateGreeting() {
        const hour = new Date().getHours();
        let greeting = this.getGreeting();
        
        const greetingElement = document.getElementById('greeting');
        if (greetingElement) {
            greetingElement.textContent = greeting;
        }
    }

    updateChartData() {
        // Update expense chart bars with animation
        const bars = document.querySelectorAll('.chart-bar, .trend-bar');
        bars.forEach(bar => {
            const currentHeight = bar.style.height;
            bar.style.height = '0%';
            
            setTimeout(() => {
                bar.style.height = currentHeight;
            }, 300);
        });
    }

    updateRealTimeStats() {
        // Simulate real-time updates
        const stats = {
            'Active Trips': { value: 3, trend: '+2 this month' },
            'Total Spent': { value: '₹45,300', trend: '12% increase' },
            'Expenses': { value: 127, trend: '42 this month' },
            'Collaborators': { value: 12, trend: '8 active' }
        };
        
        // Update stat cards
        document.querySelectorAll('.stat-card').forEach((card, index) => {
            const keys = Object.keys(stats);
            if (keys[index]) {
                const stat = stats[keys[index]];
                const valueElement = card.querySelector('.stat-value');
                const trendElement = card.querySelector('.stat-trend');
                
                if (valueElement) {
                    valueElement.textContent = stat.value;
                }
                if (trendElement) {
                    trendElement.textContent = stat.trend;
                }
            }
        });
    }

    loadViewData(view) {
        switch(view) {
            case 'dashboard':
                this.updateDashboardData();
                break;
            case 'trips':
                this.loadTripsData();
                break;
            case 'expenses':
                this.loadExpensesData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
            case 'reports':
                this.loadReportsData();
                break;
        }
    }

    loadTripsData() {
        // Sample trips data
        const trips = [
            {
                id: 1,
                title: 'Goa Beach Trip',
                dates: 'Mar 15-20, 2024 • 5 days',
                progress: 80,
                budget: '₹25,000',
                status: 'upcoming'
            },
            {
                id: 2,
                title: 'Business Conference',
                dates: 'Apr 5-7, 2024 • 3 days',
                progress: 60,
                budget: '₹15,000',
                status: 'ongoing'
            },
            {
                id: 3,
                title: 'Mountain Trek',
                dates: 'May 10-15, 2024 • 6 days',
                progress: 30,
                budget: '₹18,000',
                status: 'upcoming'
            }
        ];
        
        // Update trips list if exists
        const tripsList = document.querySelector('.trips-list');
        if (tripsList) {
            tripsList.innerHTML = trips.map(trip => `
                <div class="trip-item" data-id="${trip.id}">
                    <div class="trip-icon">
                        <i class="fas fa-${trip.status === 'ongoing' ? 'briefcase' : 'umbrella-beach'}"></i>
                    </div>
                    <div class="trip-details">
                        <h3>${trip.title}</h3>
                        <p>${trip.dates}</p>
                        <div class="trip-progress">
                            <div class="progress-bar">
                                <div class="progress" style="width: ${trip.progress}%"></div>
                            </div>
                            <span>${trip.progress}% planned</span>
                        </div>
                    </div>
                    <div class="trip-status">
                        <span class="status-badge ${trip.status}">${trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}</span>
                        <span class="trip-budget">${trip.budget}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    loadExpensesData() {
        // Sample expense data
        const expenses = [
            { category: 'Accommodation', amount: '₹20,385', percentage: 45, color: 'var(--navy-900)' },
            { category: 'Transport', amount: '₹11,325', percentage: 25, color: 'var(--navy-700)' },
            { category: 'Food & Dining', amount: '₹6,795', percentage: 15, color: 'var(--blue-600)' },
            { category: 'Activities', amount: '₹4,530', percentage: 10, color: 'var(--blue-400)' },
            { category: 'Shopping', amount: '₹2,265', percentage: 5, color: 'var(--blue-200)' }
        ];
        
        // Update expense chart if exists
        const chartVisual = document.querySelector('.chart-visual');
        const chartLabels = document.querySelector('.chart-labels');
        const chartLegend = document.querySelector('.chart-legend');
        
        if (chartVisual && chartLabels && chartLegend) {
            // Update bars
            chartVisual.innerHTML = expenses.map(expense => `
                <div class="chart-bar" style="height: ${expense.percentage * 2}%; background: ${expense.color};" 
                     data-value="${expense.amount}" title="${expense.category} - ${expense.percentage}%">
                    <span>${expense.percentage}%</span>
                </div>
            `).join('');
            
            // Update labels
            chartLabels.innerHTML = expenses.map(expense => `
                <span>${expense.category.split(' ')[0]}</span>
            `).join('');
            
            // Update legend
            chartLegend.innerHTML = expenses.map(expense => `
                <div class="legend-item">
                    <span class="legend-color" style="background: ${expense.color}"></span>
                    <span class="legend-label">${expense.category}</span>
                    <span class="legend-value">${expense.amount}</span>
                </div>
            `).join('');
        }
    }

    loadAnalyticsData() {
        // Sample analytics data
        const monthlyData = [
            { month: 'Jan', value: 15000 },
            { month: 'Feb', value: 22500 },
            { month: 'Mar', value: 30000 },
            { month: 'Apr', value: 18750 },
            { month: 'May', value: 26250 },
            { month: 'Jun', value: 33750 }
        ];
        
        const maxValue = Math.max(...monthlyData.map(d => d.value));
        
        // Update trend chart if exists
        const trendBars = document.querySelector('.trend-bars');
        const trendLabels = document.querySelector('.trend-labels');
        
        if (trendBars && trendLabels) {
            trendLabels.innerHTML = monthlyData.map(data => `
                <span>${data.month}</span>
            `).join('');
            
            trendBars.innerHTML = monthlyData.map(data => {
                const height = (data.value / maxValue) * 100;
                return `
                    <div class="trend-bar" style="height: ${height}%;" 
                         data-value="₹${data.value.toLocaleString()}"></div>
                `;
            }).join('');
        }
    }

    loadReportsData() {
        // Reports data would be loaded here
        console.log('Loading reports data...');
    }

    loadNotifications() {
        const notifications = [
            {
                id: 1,
                type: 'trip',
                title: 'Trip Reminder',
                message: 'Your Goa trip starts in 3 days',
                time: '10 min ago',
                read: false
            },
            {
                id: 2,
                type: 'expense',
                title: 'Expense Alert',
                message: 'You exceeded your daily budget',
                time: '1 hour ago',
                read: false
            },
            {
                id: 3,
                type: 'system',
                title: 'System Update',
                message: 'New features added to AI Tips',
                time: '2 hours ago',
                read: true
            }
        ];
        
        const container = document.querySelector('.notifications-list');
        if (!container) return;
        
        container.innerHTML = notifications.map(notification => `
            <div class="activity-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
                <div class="activity-icon">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="activity-content">
                    <h4>${notification.title}</h4>
                    <p class="activity-time">${notification.message}</p>
                    <small>${notification.time}</small>
                </div>
                ${!notification.read ? '<span class="notification-dot"></span>' : ''}
            </div>
        `).join('');
        
        // Update notification badge count
        const unreadCount = notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-badge');
        if (badge && unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
        }
    }

    getNotificationIcon(type) {
        const icons = {
            trip: 'suitcase',
            expense: 'file-invoice-dollar',
            system: 'cog',
            collaborator: 'user-plus'
        };
        return icons[type] || 'bell';
    }

    loadAITips() {
        this.aiTips = {
            personalized: [
                {
                    id: 1,
                    title: 'Optimize Your Goa Trip',
                    content: 'Consider traveling mid-week for better hotel rates and fewer crowds.',
                    icon: 'lightbulb',
                    saved: false
                },
                {
                    id: 2,
                    title: 'Flight Booking Alert',
                    content: 'Flight prices to Goa are expected to drop by 15% next week.',
                    icon: 'plane',
                    saved: false
                },
                {
                    id: 3,
                    title: 'Local Experience',
                    content: 'Try authentic Goan cuisine at small family-run restaurants.',
                    icon: 'utensils',
                    saved: false
                }
            ],
            travel: [
                {
                    id: 4,
                    title: 'Pack Smart',
                    content: 'Pack versatile clothing items that can be mixed and matched.',
                    icon: 'suitcase',
                    saved: false
                },
                {
                    id: 5,
                    title: 'Document Safety',
                    content: 'Keep digital copies of important documents in cloud storage.',
                    icon: 'passport',
                    saved: false
                }
            ],
            budget: [
                {
                    id: 6,
                    title: 'Daily Budget',
                    content: 'Set a daily spending limit and track expenses in real-time.',
                    icon: 'wallet',
                    saved: false
                },
                {
                    id: 7,
                    title: 'Local Currency',
                    content: 'Use local ATMs for better exchange rates than airport counters.',
                    icon: 'money-bill-wave',
                    saved: false
                }
            ],
            places: [
                {
                    id: 8,
                    title: 'Hidden Gems in Goa',
                    content: 'Visit Butterfly Beach and Arambol Beach for less crowded experiences.',
                    icon: 'map-marker-alt',
                    saved: false
                },
                {
                    id: 9,
                    title: 'Cultural Sites',
                    content: 'Explore Old Goa churches for rich cultural experiences.',
                    icon: 'landmark',
                    saved: false
                }
            ]
        };
        
        // Update AI tips on dashboard
        this.updateDashboardAITips();
    }

    updateDashboardAITips() {
        const container = document.querySelector('.ai-tips-container');
        if (!container || !this.aiTips) return;
        
        const tips = this.aiTips.personalized.slice(0, 3);
        container.innerHTML = tips.map(tip => `
            <div class="ai-tip" data-id="${tip.id}">
                <div class="ai-tip-icon">
                    <i class="fas fa-${tip.icon}"></i>
                </div>
                <div class="ai-tip-content">
                    <h4>${tip.title}</h4>
                    <p>${tip.content}</p>
                </div>
                <button class="ai-tip-save ${tip.saved ? 'saved' : ''}">
                    <i class="${tip.saved ? 'fas' : 'far'} fa-bookmark"></i>
                </button>
            </div>
        `).join('');
    }

    openAITips() {
        const modal = document.getElementById('aiTipsModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Load personalized tips by default
            this.switchModalTab('personalized');
            
            this.showToast('AI Tips opened', 'info');
        }
    }

    closeModal() {
        const modal = document.getElementById('aiTipsModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    switchModalTab(tabId) {
        // Update active tab
        const tabs = document.querySelectorAll('.modal-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabId) {
                tab.classList.add('active');
            }
        });
        
        // Show active content
        const contents = document.querySelectorAll('.modal-tab-content');
        contents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabId}Tab`) {
                content.classList.add('active');
            }
        });
        
        // Load tab content
        this.loadModalTabContent(tabId);
    }

    loadModalTabContent(tabId) {
        const container = document.getElementById(`${tabId}Tab`);
        if (!container || !this.aiTips) return;
        
        const tips = this.aiTips[tabId] || [];
        
        if (tips.length === 0) {
            container.innerHTML = `
                <div class="ai-tip">
                    <div class="ai-tip-icon">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="ai-tip-content">
                        <h4>No tips available</h4>
                        <p>Check back later for personalized travel tips</p>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = tips.map(tip => `
            <div class="ai-tip" data-id="${tip.id}">
                <div class="ai-tip-icon">
                    <i class="fas fa-${tip.icon}"></i>
                </div>
                <div class="ai-tip-content">
                    <h4>${tip.title}</h4>
                    <p>${tip.content}</p>
                </div>
                <button class="ai-tip-save ${tip.saved ? 'saved' : ''}" onclick="app.saveAITip(${tip.id})">
                    <i class="${tip.saved ? 'fas' : 'far'} fa-bookmark"></i>
                </button>
            </div>
        `).join('');
    }

    saveAITip(tipId) {
        // Find and update tip
        for (const category in this.aiTips) {
            const tip = this.aiTips[category].find(t => t.id === tipId);
            if (tip) {
                tip.saved = !tip.saved;
                this.showToast(
                    `${tip.saved ? 'Saved' : 'Removed'} tip: ${tip.title}`,
                    tip.saved ? 'success' : 'info'
                );
                
                // Update UI
                this.updateDashboardAITips();
                this.loadModalTabContent('personalized');
                break;
            }
        }
    }

    performSearch(query) {
        if (query.trim()) {
            this.showToast(`Searching for: ${query}`, 'info');
            // In a real app, this would trigger API search
            
            // Simulate search results
            if (this.isDashboard) {
                this.highlightSearchResults(query);
            }
        }
    }

    highlightSearchResults(query) {
        const elements = document.querySelectorAll('.trip-item, .activity-item, .ai-tip');
        elements.forEach(el => {
            const text = el.textContent.toLowerCase();
            if (text.includes(query.toLowerCase())) {
                el.style.backgroundColor = 'var(--blue-200)';
                el.style.borderColor = 'var(--blue-400)';
                
                setTimeout(() => {
                    el.style.backgroundColor = '';
                    el.style.borderColor = '';
                }, 2000);
            }
        });
    }

    handleScroll() {
        // Navbar scroll effect (Landing Page)
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        
        // Parallax effect for hero background (Landing Page)
        const hero = document.querySelector('.hero');
        const dashboard = document.querySelector('.dashboard-preview');
        
        if (hero) {
            const rate = window.pageYOffset * -0.5;
            hero.style.backgroundPosition = `center ${rate}px`;
        }
        
        if (dashboard && window.pageYOffset < 500) {
            const rotateY = window.pageYOffset * 0.01;
            dashboard.style.transform = `perspective(1000px) rotateY(${-5 + rotateY}deg)`;
        }
    }

    highlightNavOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    handleResize() {
        const sidebar = document.querySelector('.sidebar');
        if (window.innerWidth >= 992 && sidebar) {
            sidebar.classList.remove('active');
        }
    }

    updateAuthUI() {
        const isLoggedIn = this.isLoggedIn;
        const userEmail = localStorage.getItem('userEmail');
        
        // Update landing page buttons
        const loginBtn = document.querySelector('.login-btn');
        const signupBtn = document.querySelector('.signup-btn');
        const getStartedBtn = document.querySelector('.cta-primary.large');
        
        if (isLoggedIn) {
            // User is logged in
            if (loginBtn) {
                loginBtn.textContent = 'Dashboard';
                loginBtn.href = 'dashboard.html';
            }
            
            if (signupBtn) {
                signupBtn.textContent = 'Logout';
                signupBtn.href = '#';
                signupBtn.onclick = (e) => {
                    e.preventDefault();
                    this.logout();
                };
            }
            
            if (getStartedBtn) {
                getStartedBtn.innerHTML = '<i class="fas fa-dashboard"></i> Go to Dashboard';
                getStartedBtn.onclick = (e) => {
                    e.preventDefault();
                    window.location.href = 'dashboard.html';
                };
            }
        } else {
            // User is not logged in
            if (loginBtn) {
                loginBtn.textContent = 'Log In';
                loginBtn.href = 'login.html';
            }
            
            if (signupBtn) {
                signupBtn.textContent = 'Sign Up';
                signupBtn.href = 'signup.html';
            }
            
            if (getStartedBtn) {
                getStartedBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
                getStartedBtn.onclick = (e) => {
                    e.preventDefault();
                    window.location.href = 'signup.html';
                };
            }
        }
        
        // Update dashboard user info
        if (this.isDashboard && userEmail) {
            const userName = localStorage.getItem('userName') || 'User';
            const userEmailElement = document.querySelector('.user-email');
            const userNameElement = document.querySelector('.user-name');
            
            if (userEmailElement) userEmailElement.textContent = userEmail;
            if (userNameElement) userNameElement.textContent = userName;
        }
    }

    logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        this.isLoggedIn = false;
        this.userData = null;
        
        this.showToast('Logged out successfully', 'success');
        
        // Redirect to home page after a delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    login(email, password) {
        // Simulate login - in real app, this would be an API call
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', email.split('@')[0]);
        
        this.isLoggedIn = true;
        this.userData = this.getUserData();
        
        this.showToast('Login successful!', 'success');
        this.updateAuthUI();
        
        // Redirect to dashboard after a delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }

    getUserData() {
        if (!this.isLoggedIn) return null;
        
        return {
            email: localStorage.getItem('userEmail'),
            name: localStorage.getItem('userName'),
            joinDate: localStorage.getItem('joinDate') || new Date().toISOString()
        };
    }

    updateStats() {
        // Update landing page stats
        const stats = {
            users: 1250,
            trips: 8900,
            savings: 4500000,
            rating: 4.8
        };
        
        // Animate numbers
        document.querySelectorAll('.stat-number').forEach(stat => {
            const target = stats[stat.dataset.stat];
            if (target) {
                this.animateNumber(stat, 0, target, 2000);
            }
        });
    }

    animateNumber(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            
            if (element.dataset.stat === 'savings') {
                element.textContent = '₹' + value.toLocaleString();
            } else if (element.dataset.stat === 'rating') {
                element.textContent = value.toFixed(1);
            } else {
                element.textContent = value.toLocaleString();
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Toast notification system
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) {
            // Create toast container if it doesn't exist
            const toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
            container = toastContainer;
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconClass = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        }[type];
        
        toast.innerHTML = `
            <div class="toast-icon ${type}">
                <i class="${iconClass}"></i>
            </div>
            <div class="toast-content">
                <p class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</p>
                <p class="toast-message">${message}</p>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, duration);
    }

    addLoadingStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .loading {
                position: relative;
                color: transparent !important;
                pointer-events: none;
            }
            
            .loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 20px;
                height: 20px;
                margin: -10px 0 0 -10px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .read {
                opacity: 0.6;
            }
            
            .unread {
                font-weight: 600;
            }
            
            .notification-dot {
                width: 8px;
                height: 8px;
                background: var(--blue-600);
                border-radius: 50%;
                margin-left: auto;
            }
            
            /* Smooth transitions */
            * {
                transition-property: transform, opacity, background-color, border-color, color, box-shadow;
                transition-duration: 0.3s;
                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            /* Toast animations */
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            }
            
            .toast {
                background: var(--white);
                border: 1px solid var(--blue-200);
                border-radius: var(--border-radius);
                padding: 1rem;
                margin-bottom: 0.5rem;
                box-shadow: var(--shadow-lg);
                display: flex;
                align-items: center;
                gap: 1rem;
                min-width: 300px;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease;
            }
            
            .toast.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .toast.hide {
                transform: translateX(100%);
                opacity: 0;
            }
            
            .toast.success {
                border-left: 4px solid var(--success);
            }
            
            .toast.error {
                border-left: 4px solid var(--error);
            }
            
            .toast.info {
                border-left: 4px solid var(--blue-600);
            }
            
            .toast.warning {
                border-left: 4px solid var(--warning);
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the application
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new IntelliTripApp();
    
    // Add loaded class for animations
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Global functions for HTML onclick
window.showView = (view) => app?.showView(view);
window.closeModal = () => app?.closeModal();
window.switchModalTab = (tabId) => app?.switchModalTab(tabId);
window.logout = () => app?.logout();

// Export app for debugging
window.IntelliTripApp = IntelliTripApp;