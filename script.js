// Trading Chart Animation
class TradingChart {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.points = [];
        this.animationId = null;
        this.time = 0;
        
        this.resize();
        this.init();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.init();
    }

    init() {
        const numPoints = Math.floor(this.canvas.width / 3);
        this.points = [];
        
        let basePrice = this.canvas.height / 2;
        
        for (let i = 0; i < numPoints; i++) {
            const volatility = 50 + Math.random() * 100;
            const trend = Math.sin(i * 0.01) * 30;
            basePrice += (Math.random() - 0.5) * volatility + trend * 0.1;
            basePrice = Math.max(50, Math.min(this.canvas.height - 50, basePrice));
            
            this.points.push({
                x: (i / numPoints) * this.canvas.width,
                y: basePrice,
                price: basePrice
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw candlesticks
        this.drawCandlesticks();
        
        // Draw price line
        this.drawPriceLine();
        
        // Draw volume bars
        this.drawVolume();
        
        this.time += 0.02;
        this.updatePrices();
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let i = 0; i < 10; i++) {
            const y = (this.canvas.height / 10) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Vertical lines
        for (let i = 0; i < 20; i++) {
            const x = (this.canvas.width / 20) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
    }

    drawPriceLine() {
        if (this.points.length < 2) return;
        
        this.ctx.strokeStyle = '#00d4ff';
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00d4ff';
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            this.ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
        
        // Draw gradient fill
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.lineTo(this.points[this.points.length - 1].x, this.canvas.height);
        this.ctx.lineTo(this.points[0].x, this.canvas.height);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawCandlesticks() {
        const candleWidth = Math.max(2, this.canvas.width / this.points.length / 2);
        
        for (let i = 0; i < this.points.length; i += 3) {
            const point = this.points[i];
            const open = point.y;
            const close = i + 1 < this.points.length ? this.points[i + 1].y : open;
            const high = Math.min(open, close) - 20 - Math.random() * 30;
            const low = Math.max(open, close) + 20 + Math.random() * 30;
            
            const isGreen = close > open;
            this.ctx.strokeStyle = isGreen ? '#00ff88' : '#ff4444';
            this.ctx.fillStyle = isGreen ? '#00ff88' : '#ff4444';
            
            // Draw wick
            this.ctx.beginPath();
            this.ctx.moveTo(point.x, high);
            this.ctx.lineTo(point.x, low);
            this.ctx.stroke();
            
            // Draw body
            const bodyTop = Math.min(open, close);
            const bodyHeight = Math.abs(close - open) || 2;
            
            this.ctx.fillRect(
                point.x - candleWidth / 2,
                bodyTop,
                candleWidth,
                bodyHeight
            );
        }
    }

    drawVolume() {
        this.ctx.fillStyle = 'rgba(123, 47, 247, 0.3)';
        
        for (let i = 0; i < this.points.length; i += 2) {
            const point = this.points[i];
            const volume = 20 + Math.random() * 80;
            
            this.ctx.fillRect(
                point.x - 1,
                this.canvas.height - volume,
                2,
                volume
            );
        }
    }

    updatePrices() {
        // Simulate price movement
        for (let i = 1; i < this.points.length; i++) {
            const prevPrice = this.points[i - 1].price;
            const volatility = 2;
            const trend = Math.sin(this.time + i * 0.1) * 5;
            const noise = (Math.random() - 0.5) * volatility;
            
            this.points[i].price += noise + trend * 0.1;
            this.points[i].price = Math.max(50, Math.min(this.canvas.height - 50, this.points[i].price));
            this.points[i].y = this.points[i].price;
        }
        
        // Add new point and remove old one for scrolling effect
        const lastPoint = this.points[this.points.length - 1];
        const newPrice = lastPoint.price + (Math.random() - 0.5) * 5 + Math.sin(this.time) * 3;
        
        this.points.shift();
        this.points.push({
            x: this.canvas.width,
            y: Math.max(50, Math.min(this.canvas.height - 50, newPrice)),
            price: newPrice
        });
        
        // Update x positions
        const step = this.canvas.width / this.points.length;
        this.points.forEach((point, i) => {
            point.x = (i / this.points.length) * this.canvas.width;
        });
    }

    animate() {
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        this.animate();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            
            // Handle specialized cards with scale animation
            if (entry.target.classList.contains('specialized-card')) {
                entry.target.style.transform = 'translateY(0) scale(1)';
            } else {
                entry.target.style.transform = 'translateY(0)';
            }
            
            // Animate skill bars
            if (entry.target.classList.contains('skill-card')) {
                const progressBar = entry.target.querySelector('.skill-progress');
                if (progressBar) {
                    const progress = progressBar.getAttribute('data-progress');
                    setTimeout(() => {
                        progressBar.style.width = progress + '%';
                    }, 200);
                }
            }
        }
    });
}, observerOptions);

// Observe elements
document.addEventListener('DOMContentLoaded', () => {
    // Observe sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Observe skill cards
    document.querySelectorAll('.skill-card').forEach(card => {
        const progressBar = card.querySelector('.skill-progress');
        if (progressBar) {
            progressBar.style.width = '0%';
        }
        observer.observe(card);
    });
    
    // Observe specialized cards
    document.querySelectorAll('.specialized-card').forEach((card, index) => {
        // Check if card is already in viewport
        const rect = card.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (!isInViewport) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px) scale(0.9)';
        }
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
    
    // Observe timeline items
    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = index % 2 === 0 ? 'translateX(-50px)' : 'translateX(50px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });
    
    // Observe contact cards
    document.querySelectorAll('.contact-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(10, 14, 39, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 212, 255, 0.1)';
    } else {
        navbar.style.background = 'rgba(10, 14, 39, 0.8)';
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Active nav link on scroll
const sections = document.querySelectorAll('.section, .hero');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Initialize Trading Chart
const canvas = document.getElementById('tradingChart');
if (canvas) {
    const chart = new TradingChart(canvas);
    chart.start();
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - scrolled / 500;
    }
});

// Add hover effects to cards
document.querySelectorAll('.about-card, .skill-card, .specialized-card, .contact-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// Add click ripple effect
document.querySelectorAll('.contact-card, .skill-card, .specialized-card').forEach(card => {
    card.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple CSS dynamically
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(0, 212, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

