// Field coefficients (weights for each subject)
    const coefficients = {
        math: {
            'math-math-grade': 7,
            'math-physics-grade': 6,
            'math-arabic-grade': 3,
            'math-science-grade': 2,
            'math-islamics-grade': 2,
            'math-history-geo-grade': 2,
            'math-english-grade': 2,
            'math-french-grade': 2,
            'math-philo-grade': 2,
            'math-tamazight-grade': 2,
            'math-sport-grade': 1
        },
        science: {
            'science-science-grade': 6,
            'science-math-grade': 5,
            'science-physics-grade': 5,
            'science-arabic-grade': 3,
            'science-islamics-grade': 2,
            'science-history-geo-grade': 2,
            'science-english-grade': 2,
            'science-french-grade': 2,
            'science-philo-grade': 2,
            'science-tamazight-grade': 2,
            'science-sport-grade': 1
        },
        tech: {
            'tech-tech-grade': 7,
            'tech-math-grade': 6,
            'tech-physics-grade': 6,
            'tech-arabic-grade': 3,
            'tech-islamics-grade': 2,
            'tech-history-geo-grade': 2,
            'tech-english-grade': 2,
            'tech-french-grade': 2,
            'tech-philo-grade': 2,
            'tech-tamazight-grade': 2,
            'tech-sport-grade': 1
        }
    };

    let calculatorState = 'fieldSelection';

    function showSection(id, push = true) {
        if (id === 'fieldSelection' || id === 'mathSubjects' || 
            id === 'scienceSubjects' || id === 'techSubjects') {

            document.getElementById('fieldSelection').style.display = 
                (id === 'fieldSelection') ? 'grid' : 'none';

            document.querySelectorAll('.subject-container').forEach(container => {
                container.style.display = (container.id === id) ? 'block' : 'none';
            });

            if (id !== 'fieldSelection') {
                const fieldName = getFieldName(id.replace('Subjects', ''));
                document.querySelector('.calculator-header h2').textContent = 
                    `حساب معدل البكالوريا - ${fieldName}`;
                document.querySelector('.calculator-header p').textContent = 'أدخل علاماتك';
            } else {
                document.querySelector('.calculator-header h2').textContent = 'حساب معدل البكالوريا';
                document.querySelector('.calculator-header p').textContent = 'اختر شعبتك لحساب المعدل';
            }

            document.getElementById('resultSection').style.display = 'none';

            calculatorState = id;
            id = 'calculator';
        }

        document.querySelectorAll('.resource-content')
            .forEach(sec => sec.classList.remove('active'));

        const section = document.getElementById(id);
        if (section) {
            section.classList.add('active');
            if (push) {
                history.pushState({ section: id, calculatorState }, '', `#${id}`);
            }
        }
    }

    window.addEventListener('popstate', (event) => {
        const state = event.state;
        const id = state?.section || location.hash.slice(1) || 'home';
        const calcState = state?.calculatorState || 'fieldSelection';

        if (id === 'calculator') {
            calculatorState = calcState;
            showSection(calcState, false);
        } else {
            showSection(id, false);
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        const initial = location.hash.slice(1) || 'home';
        const savedState = localStorage.getItem('calculatorState') || 'fieldSelection';

        if (initial === 'calculator') {
            calculatorState = savedState;
            showSection(savedState, false);
            history.replaceState({ section: 'calculator', calculatorState: savedState }, '', '#calculator');
        } else {
            showSection(initial, false);
            history.replaceState({ section: initial }, '', `#${initial}`);
        }

        updateTimer();
        setInterval(updateTimer, 1000);
        initSampleData();

        document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                // Only show section if it's one of your managed sections
                if (['home', 'about', 'contact', 'calculator', 'calculator-section', 'field-selection ' , 'subject-container' ,'fieldSelection', 
                'mathSubjects', 'scienceSubjects', 'techSubjects', 
                'resources'].includes(targetId)) { 
                    showSection(targetId);
                } else {
                    // Just scroll to the section (for static parts like about, contact)
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    });

    function updateTimer() {
        const examDate = new Date(2026, 5, 15, 8, 30, 0);
        const now = new Date();
        const diff = examDate - now;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }

    function getFieldName(field) {
        if(field === 'math') return 'شعبة رياضيات';
        if(field === 'science') return 'شعبة علوم تجريبية';
        if(field === 'tech') return 'شعبة تقني رياضي';
        return '';
    }

    function selectField(field) {
        document.getElementById('fieldSelection').style.display = 'none';
        if(field === 'math') {
            document.getElementById('mathSubjects').style.display = 'block';
        } else if(field === 'science') {
            document.getElementById('scienceSubjects').style.display = 'block';
        } else if(field === 'tech') {
            document.getElementById('techSubjects').style.display = 'block';
        }
        document.querySelector('.calculator-header h2').textContent = `حساب معدل البكالوريا - ${getFieldName(field)}`;
        document.querySelector('.calculator-header p').textContent = 'أدخل علاماتك';
        document.getElementById('resultSection').style.display = 'none';
    }

    function showFieldSelection() {
        document.querySelectorAll('.subject-container').forEach(container => {
            container.style.display = 'none';
        });
        document.getElementById('fieldSelection').style.display = 'grid';
        document.querySelector('.calculator-header h2').textContent = 'حساب معدل البكالوريا';
        document.querySelector('.calculator-header p').textContent = 'اختر شعبتك لحساب المعدل';
        document.getElementById('resultSection').style.display = 'none';
    }

    function calculateAverage(field) {
        let totalScore = 0;
        let totalCoefficient = 0;
        let hasError = false;
        let subjectCount = 0;
        let firstErrorInput = null;

        const fieldCoefficients = coefficients[field];

        for (const [inputId, coefficient] of Object.entries(fieldCoefficients)) {
            const input = document.getElementById(inputId);
            const value = parseFloat(input.value);
            const isOptional = input.closest('.subject-card.optional') !== null;

            const errorSpan = input.parentElement.querySelector('.error-message');
            errorSpan.style.display = 'none';
            errorSpan.textContent = '';

            input.classList.remove('input-error');
            input.closest('.subject-card')?.classList.remove('card-error');


            if (isOptional && (isNaN(value) || input.value.trim() === '')) {
                continue;
            }

            if (isNaN(value)) {
                errorSpan.textContent = 'الرجاء إدخال علامة صحيحة';
                errorSpan.style.display = 'block';
                input.classList.add('input-error');
                input.closest('.subject-card')?.classList.add('card-error');
                if (!firstErrorInput) firstErrorInput = input;
                hasError = true;
            } else if (value < 0 || value > 20) {
                errorSpan.textContent = 'يجب أن تكون العلامة بين 0 و 20';
                errorSpan.style.display = 'block';
                input.classList.add('input-error');
                input.closest('.subject-card')?.classList.add('card-error');
                if (!firstErrorInput) firstErrorInput = input;
                hasError = true;
            } else {
                totalScore += value * coefficient;
                totalCoefficient += coefficient;
                subjectCount++;
            }
        }

        if (hasError) {
            if (firstErrorInput) {
                firstErrorInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorInput.focus();
            }
            return;
        }

        const average = totalScore / totalCoefficient;

        document.getElementById('calculatedAverage').textContent = average.toFixed(2);
        document.getElementById('totalPoints').textContent = totalScore.toFixed(2);
        document.getElementById('totalCoeffs').textContent = totalCoefficient;
        document.getElementById('subjectCount').textContent = subjectCount;

        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });

        localStorage.setItem('calculatorState', field + 'Subjects');
    }

    function resetForm() {
        document.querySelectorAll('.grade-input').forEach(input => {
            input.value = '';
            const errorSpan = input.parentElement.querySelector('.error-message');
            if (errorSpan) {
                errorSpan.style.display = 'none';
                errorSpan.textContent = '';
            }
        });

        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('calculatedAverage').textContent = '0.00';
        document.getElementById('totalPoints').textContent = '0';
        document.getElementById('totalCoeffs').textContent = '0';
        document.getElementById('subjectCount').textContent = '0';
    }

    function initSampleData() {
        document.getElementById('math-math-grade').value = '18.0';
        document.getElementById('math-physics-grade').value = '16.5';
        document.getElementById('math-arabic-grade').value = '14.5';
        document.getElementById('math-science-grade').value = '17.5';
        document.getElementById('math-islamics-grade').value = '15.5';
        document.getElementById('math-history-geo-grade').value = '19.0';
        document.getElementById('math-english-grade').value = '16.0';
        document.getElementById('math-french-grade').value = '16.5';
        document.getElementById('math-philo-grade').value = '19.5';
        document.getElementById('math-tamazight-grade').value = '19.0';
        document.getElementById('math-sport-grade').value = '18.33';

        document.getElementById('science-science-grade').value = '17.5';
        document.getElementById('science-math-grade').value = '18.0';
        document.getElementById('science-physics-grade').value = '16.5';
        document.getElementById('science-arabic-grade').value = '14.5';
        document.getElementById('science-islamics-grade').value = '15.5';
        document.getElementById('science-history-geo-grade').value = '19.0';
        document.getElementById('science-english-grade').value = '16.0';
        document.getElementById('science-french-grade').value = '16.5';
        document.getElementById('science-philo-grade').value = '19.5';
        document.getElementById('science-tamazight-grade').value = '19.0';
        document.getElementById('science-sport-grade').value = '18.33';

        document.getElementById('tech-tech-grade').value = '18.0';
        document.getElementById('tech-math-grade').value = '18.0';
        document.getElementById('tech-physics-grade').value = '16.5';
        document.getElementById('tech-arabic-grade').value = '14.5';
        document.getElementById('tech-islamics-grade').value = '15.5';
        document.getElementById('tech-history-geo-grade').value = '19.0';
        document.getElementById('tech-english-grade').value = '16.0';
        document.getElementById('tech-french-grade').value = '16.5';
        document.getElementById('tech-philo-grade').value = '19.5';
        document.getElementById('tech-tamazight-grade').value = '19.0';
        document.getElementById('tech-sport-grade').value = '18.33';
    }
    // Handle form submission with AJAX
        document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const submitButton = this.querySelector('button[type="submit"]');
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');

        // Hide both first
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';

        submitButton.disabled = true;
        submitButton.textContent = 'جاري الإرسال...';

        fetch(this.action, {
            method: this.method,
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                successMessage.style.display = 'block';
                this.reset();
            } else {
                errorMessage.textContent = data.message;
                errorMessage.style.display = 'block';
            }
        })
        .catch(() => {
            errorMessage.textContent = 'حدث خطأ في الشبكة. يرجى المحاولة لاحقاً.';
            errorMessage.style.display = 'block';
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'إرسال الرسالة';

            // Auto-hide after 5s
            setTimeout(() => {
                successMessage.style.display = 'none';
                errorMessage.style.display = 'none';
            }, 5000);
        });
    });
    
    let lastScrollY = window.scrollY;
    const navbar = document.querySelector('.navbar');
    const navBrand = document.querySelector('.nav-brand');

    window.addEventListener('scroll', () => {
        if (window.innerWidth > 768) {
            navbar.classList.remove('hidden');
            navBrand.classList.remove('fixed');
            return;
        }

        if (window.scrollY === 0) {
            // At top, show full navbar with brand normal
            navbar.classList.remove('hidden');
            navBrand.classList.remove('fixed');
        } else if (window.scrollY > lastScrollY) {
            // Scroll down: hide navbar, fix brand at top
            navbar.classList.add('hidden');
            navBrand.classList.add('fixed');
        } else {
            // Scroll up: show navbar, brand normal
            navbar.classList.remove('hidden');
            navBrand.classList.remove('fixed');
        }

        lastScrollY = window.scrollY;
    });

    // Fullscreen toggler for multiple PDF viewers
    function toggleFullScreen(event) {
        // Get the clicked button element (fullscreen button)
        const btn = event.currentTarget;
        
        // Find the iframe inside this wrapper
        const iframe = btn.closest('.pdf-wrapper').querySelector('iframe');

        if (document.fullscreenElement === iframe) {
            // Exit fullscreen if this iframe is already fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { // Safari
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE11
                document.msExitFullscreen();
            }
        } else {
            // Enter fullscreen only for the iframe
            if (iframe.requestFullscreen) {
                iframe.requestFullscreen();
            } else if (iframe.webkitRequestFullscreen) { // Safari
                iframe.webkitRequestFullscreen();
            } else if (iframe.msRequestFullscreen) { // IE11
                iframe.msRequestFullscreen();
            }
        }
    }

    // Optional: ESC exits fullscreen for better UX
    document.addEventListener('keydown', function (e) {
        if (e.key === "Escape" && document.fullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { // Safari
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE11
                document.msExitFullscreen();
            }
        }
    });

        document.addEventListener('DOMContentLoaded', function () {
            document.querySelectorAll('.resource-content').forEach(resource => {
                const galleryImages = Array.from(resource.querySelectorAll('.gallery-images img'));
                const centerImg = resource.querySelector('.center-photo-img');
                const leftImg = resource.querySelector('.left-photo');
                const rightImg = resource.querySelector('.right-photo');
                const counter = resource.querySelector('.photo-counter');
                const leftNav = resource.querySelector('.left-nav');
                const rightNav = resource.querySelector('.right-nav');

                // Exit if key elements are missing
                if (!galleryImages.length || !centerImg || !leftImg || !rightImg || !leftNav || !rightNav || !counter) {
                console.warn("Missing one or more gallery elements in:", resource);
                return;
                }

                let currentIndex = 0;

                function updateGallery() {
                const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
                const nextIndex = (currentIndex + 1) % galleryImages.length;

                // Update the main and peek images
                centerImg.src = galleryImages[currentIndex].src;
                centerImg.alt = galleryImages[currentIndex].alt;

                leftImg.src = galleryImages[prevIndex].src;
                leftImg.alt = galleryImages[prevIndex].alt;

                rightImg.src = galleryImages[nextIndex].src;
                rightImg.alt = galleryImages[nextIndex].alt;

                // Update counter
                counter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
                }

                // Navigation buttons
                leftNav.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
                updateGallery();
                });

                rightNav.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % galleryImages.length;
                updateGallery();
                });

                // Initial setup
                updateGallery();
            });
            });