/* ============================================
   BAC SIMULATION ENGINE — simulation.js
   ============================================ */

const examData = {
    math: {
        label: "رياضيات", color: "#2c5cc5", icon: "fas fa-calculator",
        subjects: [
            { name: "الرياضيات", duration: 270, icon: "fa-solid fa-calculator", examUrl: "", solutionUrl: "", schedule: "الاثنين 04 ماي - 08:30" },
            { name: "العلوم الفيزيائية", duration: 270, icon: "fa-solid fa-atom", examUrl: "", solutionUrl: "", schedule: "الخميس 07 ماي - 08:30" },
            { name: "العلوم الطبيعية", duration: 150, icon: "fa-solid fa-dna", examUrl: "", solutionUrl: "", schedule: "الثلاثاء 05 ماي - 08:30" },
            { name: "اللغة العربية", duration: 150, icon: "fa-solid fa-language", examUrl: "https://drive.google.com/file/d/1lfIXDuPheU68cIz4RU1nLosn_pwp7et9/preview", solutionUrl: "https://drive.google.com/file/d/1J1ED3nxvnN3yGnvWgs4R446Q3W9KT6te/preview", schedule: "الأحد 03 ماي - 08:30" },
            { name: "اللغة الفرنسية", duration: 150, icon: "fas fa-flag", examUrl: "", solutionUrl: "", schedule: "الثلاثاء 05 ماي - 15:00" },
            { name: "اللغة الإنجليزية", duration: 150, icon: "fas fa-comment-dots", examUrl: "", solutionUrl: "", schedule: "الاثنين 04 ماي - 15:00" },
            { name: "تاريخ وجغرافيا", duration: 210, icon: "fas fa-landmark", examUrl: "", solutionUrl: "", schedule: "الأربعاء 06 ماي - 08:30" },
            { name: "العلوم الإسلامية", duration: 150, icon: "fa-solid fa-mosque", examUrl: "https://drive.google.com/file/d/1fhOrK51LPssye7Cd755yUeCkdRwF8dZs/preview", solutionUrl: "https://drive.google.com/file/d/1wLaZhLISXi3c84H1laUYO3Gx4UktAA69/preview", schedule: "الأحد 03 ماي - 15:00" },
            { name: "الفلسفة", duration: 210, icon: "fas fa-brain", examUrl: "", solutionUrl: "", schedule: "الخميس 07 ماي - 15:00" },
            { name: "اللغة الأمازيغية", duration: 150, icon: "ⵣ", examUrl: "", solutionUrl: "", schedule: "الأربعاء 06 ماي - 15:00" }
        ]
    },
    science: {
        label: "علوم تجريبية", color: "#28a745", icon: "fas fa-flask",
        subjects: [
            { name: "العلوم الطبيعية", duration: 270, icon: "fa-solid fa-dna", examUrl: "https://drive.google.com/file/d/12oNBN9_-31lluAI3E7dJuCmwXhdhQzPB/preview", solutionUrl: "", schedule: "الثلاثاء 05 ماي - 08:30" },
            { name: "الرياضيات", duration: 210, icon: "fa-solid fa-calculator", examUrl: "https://drive.google.com/file/d/1EtKYVK2q8NPXkP-kb8HGfMC6Mm-Mmvck/preview", solutionUrl: "https://drive.google.com/file/d/12iBbsGbEOaHIVNkm71p99TAf_KK5IlrA/preview", schedule: "الاثنين 04 ماي - 08:30" },
            { name: "العلوم الفيزيائية", duration: 210, icon: "fa-solid fa-atom", examUrl: "https://drive.google.com/file/d/1BjCBGeAoME73ZG3CiNZD44mslCgYCcXe/preview", solutionUrl: "https://drive.google.com/file/d/1tJw40VPEHmrZhonb-aaCMksd8KwwtcfS/preview", schedule: "الخميس 07 ماي - 08:30" },
            { name: "اللغة العربية", duration: 150, icon: "fa-solid fa-language", examUrl: "https://drive.google.com/file/d/1lfIXDuPheU68cIz4RU1nLosn_pwp7et9/preview", solutionUrl: "https://drive.google.com/file/d/1J1ED3nxvnN3yGnvWgs4R446Q3W9KT6te/preview", schedule: "الأحد 03 ماي - 08:30" },
            { name: "اللغة الفرنسية", duration: 150, icon: "fas fa-flag", examUrl: "", solutionUrl: "", schedule: "الثلاثاء 05 ماي - 15:00" },
            { name: "اللغة الإنجليزية", duration: 150, icon: "fas fa-comment-dots", examUrl: "", solutionUrl: "", schedule: "الاثنين 04 ماي - 15:00" },
            { name: "تاريخ وجغرافيا", duration: 210, icon: "fas fa-landmark", examUrl: "", solutionUrl: "", schedule: "الأربعاء 06 ماي - 08:30" },
            { name: "العلوم الإسلامية", duration: 150, icon: "fa-solid fa-mosque", examUrl: "https://drive.google.com/file/d/1fhOrK51LPssye7Cd755yUeCkdRwF8dZs/preview", solutionUrl: "https://drive.google.com/file/d/1wLaZhLISXi3c84H1laUYO3Gx4UktAA69/preview", schedule: "الأحد 03 ماي - 15:00" },
            { name: "الفلسفة", duration: 210, icon: "fas fa-brain", examUrl: "", solutionUrl: "", schedule: "الخميس 07 ماي - 15:00" },
            { name: "اللغة الأمازيغية", duration: 150, icon: "ⵣ", examUrl: "", solutionUrl: "", schedule: "الأربعاء 06 ماي - 15:00" }
        ]
    },
    tech: {
        label: "تقني رياضي", color: "#f39c12", icon: "fas fa-microchip",
        subjects: [
            { name: "التكنولوجيا", duration: 270, icon: "fas fa-microchip", examUrl: "", solutionUrl: "", schedule: "الثلاثاء 05 ماي - 08:30" },
            { name: "الرياضيات", duration: 270, icon: "fa-solid fa-calculator", examUrl: "", solutionUrl: "", schedule: "الاثنين 04 ماي - 08:30" },
            { name: "العلوم الفيزيائية", duration: 270, icon: "fa-solid fa-atom", examUrl: "", solutionUrl: "", schedule: "الخميس 07 ماي - 08:30" },
            { name: "اللغة العربية", duration: 150, icon: "fa-solid fa-language", examUrl: "https://drive.google.com/file/d/1lfIXDuPheU68cIz4RU1nLosn_pwp7et9/preview", solutionUrl: "https://drive.google.com/file/d/1J1ED3nxvnN3yGnvWgs4R446Q3W9KT6te/preview", schedule: "الأحد 03 ماي - 08:30" },
            { name: "اللغة الفرنسية", duration: 150, icon: "fas fa-flag", examUrl: "", solutionUrl: "", schedule: "الثلاثاء 05 ماي - 15:00" },
            { name: "اللغة الإنجليزية", duration: 150, icon: "fas fa-comment-dots", examUrl: "", solutionUrl: "", schedule: "الاثنين 04 ماي - 15:00" },
            { name: "تاريخ وجغرافيا", duration: 210, icon: "fas fa-landmark", examUrl: "", solutionUrl: "", schedule: "الأربعاء 06 ماي - 08:30" },
            { name: "العلوم الإسلامية", duration: 150, icon: "fa-solid fa-mosque", examUrl: "https://drive.google.com/file/d/1fhOrK51LPssye7Cd755yUeCkdRwF8dZs/preview", solutionUrl: "https://drive.google.com/file/d/1wLaZhLISXi3c84H1laUYO3Gx4UktAA69/preview", schedule: "الأحد 03 ماي - 15:00" },
            { name: "الفلسفة", duration: 210, icon: "fas fa-brain", examUrl: "", solutionUrl: "", schedule: "الخميس 07 ماي - 15:00" },
            { name: "اللغة الأمازيغية", duration: 150, icon: "ⵣ", examUrl: "", solutionUrl: "", schedule: "الأربعاء 06 ماي - 15:00" }
        ]
    },
    management: {
        label: "تسيير واقتصاد", color: "#8e44ad", icon: "fas fa-chart-line",
        subjects: [
            { name: "التسيير المحاسبي والمالي", duration: 270, icon: "fas fa-file-invoice-dollar", examUrl: "", solutionUrl: "", schedule: "الثلاثاء 05 ماي - 08:30" },
            { name: "الاقتصاد والمناجمنت", duration: 210, icon: "fas fa-chart-line", examUrl: "", solutionUrl: "", schedule: "الخميس 07 ماي - 08:30" },
            { name: "القانون", duration: 150, icon: "fas fa-gavel", examUrl: "https://drive.google.com/file/d/1HZjg0JTD4juK-Tyx4LkgETCqI4domYD1/preview", solutionUrl: "https://drive.google.com/file/d/1LnqgNlawVgxj8CDY-_agbTKyTCqPI5vi/preview", schedule: "الأحد 03 ماي - 11:30" },
            { name: "الرياضيات", duration: 210, icon: "fa-solid fa-calculator", examUrl: "", solutionUrl: "", schedule: "الاثنين 04 ماي - 08:30" },
            { name: "تاريخ وجغرافيا", duration: 210, icon: "fas fa-landmark", examUrl: "", solutionUrl: "", schedule: "الأربعاء 06 ماي - 08:30" },
            { name: "اللغة العربية", duration: 150, icon: "fa-solid fa-language", examUrl: "https://drive.google.com/file/d/1lfIXDuPheU68cIz4RU1nLosn_pwp7et9/preview", solutionUrl: "https://drive.google.com/file/d/1J1ED3nxvnN3yGnvWgs4R446Q3W9KT6te/preview", schedule: "الأحد 03 ماي - 08:30" },
            { name: "اللغة الفرنسية", duration: 150, icon: "fas fa-flag", examUrl: "", solutionUrl: "", schedule: "الثلاثاء 05 ماي - 15:00" },
            { name: "اللغة الإنجليزية", duration: 150, icon: "fas fa-comment-dots", examUrl: "", solutionUrl: "", schedule: "الاثنين 04 ماي - 15:00" },
            { name: "العلوم الإسلامية", duration: 150, icon: "fa-solid fa-mosque", examUrl: "https://drive.google.com/file/d/1fhOrK51LPssye7Cd755yUeCkdRwF8dZs/preview", solutionUrl: "https://drive.google.com/file/d/1wLaZhLISXi3c84H1laUYO3Gx4UktAA69/preview", schedule: "الأحد 03 ماي - 15:00" },
            { name: "الفلسفة", duration: 210, icon: "fas fa-brain", examUrl: "", solutionUrl: "", schedule: "الخميس 07 ماي - 15:00" },
            { name: "اللغة الأمازيغية", duration: 150, icon: "ⵣ", examUrl: "", solutionUrl: "", schedule: "الأربعاء 06 ماي - 15:00" }
        ]
    },
    literature: {
        label: "آداب وفلسفة", color: "#e74c3c", icon: "fas fa-pen-nib",
        subjects: [
            { name: "الفلسفة", duration: 270, icon: "fas fa-brain", examUrl: "", solutionUrl: "", schedule: "الثلاثاء 05 ماي - 08:30" },
            { name: "اللغة العربية", duration: 270, icon: "fa-solid fa-language", examUrl: "https://drive.google.com/file/d/1LBcnE-aHFigFoX83hZwaJ0cxLHvVoFHj/preview", solutionUrl: "https://drive.google.com/file/d/1Ws1EtpQ9BFy3LN4cqVyOKMngszUvzR4h/preview", schedule: "الأحد 03 ماي - 08:30" },
            { name: "تاريخ وجغرافيا", duration: 270, icon: "fas fa-landmark", examUrl: "", solutionUrl: "", schedule: "الأربعاء 06 ماي - 08:30" },
            { name: "اللغة الفرنسية", duration: 150, icon: "fas fa-flag", examUrl: "", solutionUrl: "", schedule: "الثلاثاء 05 ماي - 15:00" },
            { name: "اللغة الإنجليزية", duration: 150, icon: "fas fa-comment-dots", examUrl: "", solutionUrl: "", schedule: "الاثنين 04 ماي - 15:00" },
            { name: "العلوم الإسلامية", duration: 150, icon: "fa-solid fa-mosque", examUrl: "https://drive.google.com/file/d/1fhOrK51LPssye7Cd755yUeCkdRwF8dZs/preview", solutionUrl: "https://drive.google.com/file/d/1wLaZhLISXi3c84H1laUYO3Gx4UktAA69/preview", schedule: "الأحد 03 ماي - 15:00" },
            { name: "الرياضيات", duration: 150, icon: "fa-solid fa-calculator", examUrl: "", solutionUrl: "", schedule: "الاثنين 04 ماي - 08:30" },
            { name: "اللغة الأمازيغية", duration: 150, icon: "ⵣ", examUrl: "", solutionUrl: "", schedule: "الأربعاء 06 ماي - 15:00" }
        ]
    },
    languages: {
        label: "لغات أجنبية", color: "#16a085", icon: "fas fa-globe",
        subjects: [
            { name: "اللغة الفرنسية", duration: 210, icon: "fas fa-flag", examUrl: "", solutionUrl: "", schedule: "الثلاثاء 05 ماي - 15:00" },
            { name: "اللغة الإنجليزية", duration: 210, icon: "fas fa-comment-dots", examUrl: "", solutionUrl: "", schedule: "الاثنين 04 ماي - 15:00" },
            { name: "لغة أجنبية ثالثة", duration: 210, icon: "fa-solid fa-language", examUrl: "", solutionUrl: "", schedule: "الخميس 07 ماي - 08:30" },
            { name: "اللغة العربية", duration: 210, icon: "fa-solid fa-language", examUrl: "https://drive.google.com/file/d/1eWJBioO7WIl3nN32KycPRAwDsDG76VBv/preview", solutionUrl: "https://drive.google.com/file/d/1NO3eqI5KuIBtTId_04OrdZ7ntJhbLELz/preview", schedule: "الأحد 03 ماي - 08:30" },
            { name: "تاريخ وجغرافيا", duration: 210, icon: "fas fa-landmark", examUrl: "", solutionUrl: "", schedule: "الأربعاء 06 ماي - 08:30" },
            { name: "الفلسفة", duration: 210, icon: "fas fa-brain", examUrl: "", solutionUrl: "", schedule: "الثلاثاء 05 ماي - 08:30" },
            { name: "العلوم الإسلامية", duration: 150, icon: "fa-solid fa-mosque", examUrl: "https://drive.google.com/file/d/1fhOrK51LPssye7Cd755yUeCkdRwF8dZs/preview", solutionUrl: "https://drive.google.com/file/d/1wLaZhLISXi3c84H1laUYO3Gx4UktAA69/preview", schedule: "الأحد 03 ماي - 15:00" },
            { name: "الرياضيات", duration: 150, icon: "fa-solid fa-calculator", examUrl: "", solutionUrl: "", schedule: "الاثنين 04 ماي - 08:30" },
            { name: "اللغة الأمازيغية", duration: 150, icon: "ⵣ", examUrl: "", solutionUrl: "", schedule: "الأربعاء 06 ماي - 15:00" }
        ]
    }
};

const simApp = {
    state: { specialty: null, subject: null, timer: null, totalSeconds: 0, remainingSeconds: 0, isActive: false },

    init() {
        // Initialize history state
        if (!history.state) {
            history.replaceState({ step: 'sim-home' }, '', '');
        }

        window.addEventListener('popstate', (e) => {
            if (e.state) {
                if (e.state.specialtyKey) {
                    // Re-select specialty without pushing state
                    this.selectSpecialty(e.state.specialtyKey, false);
                }
                if (e.state.subjectIndex !== undefined) {
                    // Re-select subject without pushing state
                    this.selectSubject(e.state.subjectIndex, false);
                }
                this.showStep(e.state.step || 'sim-home', false);
            } else {
                this.showStep('sim-home', false);
            }
        });

        // Auto-refresh availability
        setInterval(() => this.checkAvailability(), 30000);
    },

    showStep(id, push = true, extraState = {}) {
        if (push) {
            history.pushState({ step: id, ...extraState }, '', '');
        }

        ['sim-home', 'sim-subjects', 'sim-prep', 'sim-exam', 'sim-done'].forEach(s => {
            const el = document.getElementById(s);
            if (el) { el.style.display = 'none'; el.classList.remove('active'); }
        });
        const target = document.getElementById(id);
        if (target) { target.style.display = 'block'; setTimeout(() => target.classList.add('active'), 30); }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    goBack(step) {
        if (this.state.isActive) {
            if (!confirm("أنت في منتصف الامتحان! هل تريد حقاً المغادرة؟")) return;
            this.cleanup();
        }
        window.history.back();
    },

    formatDuration(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        let res = "";
        if (h > 0) res += `${h} سا `;
        if (m > 0) res += `${m} د `;
        return res.trim();
    },

    parseSchedule(scheduleStr) {
        if (!scheduleStr) return null;
        try {
            const parts = scheduleStr.split(' ');
            const day = parseInt(parts[1]);
            const monthStr = parts[2];
            const timeStr = parts[4];
            const months = {
                "جانفي": 0, "فيفري": 1, "مارس": 2, "أفريل": 3, "ماي": 4, "جوان": 5,
                "جويلية": 6, "أوت": 7, "سبتمبر": 8, "أكتوبر": 9, "نوفمبر": 10, "ديسمبر": 11
            };
            const [hours, minutes] = timeStr.split(':').map(Number);
            return new Date(2026, months[monthStr], day, hours, minutes);
        } catch (e) { return null; }
    },

    checkAvailability() {
        if (!this.state.subject) return;
        const startBtn = document.getElementById('sim-start-btn');
        const availMsg = document.getElementById('availability-msg');
        const scheduledTime = this.parseSchedule(this.state.subject.schedule);
        const now = new Date();
        const isTimeArrived = scheduledTime ? (now.getTime() >= (scheduledTime.getTime() - 60000)) : true;
        const hasUrl = !!this.state.subject.examUrl;

        if (hasUrl && isTimeArrived) {
            startBtn.style.display = 'block';
            availMsg.style.display = 'none';
        } else {
            startBtn.style.display = 'none';
            availMsg.style.display = 'block';
            if (!hasUrl && isTimeArrived) {
                availMsg.innerHTML = `<i class="fas fa-info-circle"></i> ستكون المواضيع متوفرة في تاريخ الانطلاق الرسمي`;
            } else if (scheduledTime) {
                availMsg.innerHTML = `<i class="fas fa-clock"></i> سيكون الموضوع متوفراً يوم ${this.state.subject.schedule}`;
            }
        }
    },

    selectSpecialty(key, push = true) {
        this.state.specialty = examData[key];
        document.getElementById('subject-title').innerText = `مواد شعبة ${this.state.specialty.label}`;
        const grid = document.getElementById('subject-grid');
        grid.innerHTML = '';
        this.state.specialty.subjects.forEach((sub, i) => {
            const btn = document.createElement('button');
            btn.className = `main-btn ${sub.icon === 'ⵣ' ? 'tamazight-btn' : ''}`;
            
            const iconHtml = sub.icon.startsWith('fa') 
                ? `<i class="${sub.icon}"></i>` 
                : `<span class="tamazight-icon">${sub.icon}</span>`;
                
            btn.innerHTML = `${iconHtml}${sub.name}<span class="sim-duration-text" style="font-size:0.8rem;margin-top:4px;">${this.formatDuration(sub.duration)}</span>`;
            btn.onclick = () => this.selectSubject(i);
            grid.appendChild(btn);
        });
        this.showStep('sim-subjects', push, { specialtyKey: key });
    },

    selectSubject(i, push = true) {
        this.state.subject = this.state.specialty.subjects[i];
        document.getElementById('pre-exam-title').innerText = this.state.subject.name;
        document.getElementById('pre-exam-duration').innerHTML = `المدة الرسمية: <span class="sim-duration-text">${this.formatDuration(this.state.subject.duration)}</span>`;
        document.getElementById('meta-spec').innerText = this.state.specialty.label;
        document.getElementById('meta-sub').innerText = this.state.subject.name;
        document.getElementById('meta-dur').innerText = this.formatDuration(this.state.subject.duration);
        document.getElementById('meta-dur').classList.add('sim-duration-text');
        document.getElementById('exam-iframe').src = this.state.subject.examUrl || 'about:blank';
        document.getElementById('exam-download-btn').href = this.state.subject.examUrl || '#';
        
        // Update prep icon
        const iconContainer = document.querySelector('.sim-prestart-icon');
        if (iconContainer) {
            const iconHtml = this.state.subject.icon.startsWith('fa') 
                ? `<i class="${this.state.subject.icon}"></i>` 
                : `<span class="tamazight-icon" style="font-size: 2.8rem; margin:0;">${this.state.subject.icon}</span>`;
            iconContainer.innerHTML = iconHtml;
        }

        this.checkAvailability();

        // Reset exam UI
        document.getElementById('exam-layout').classList.remove('exam-active');
        document.getElementById('timer-side').style.display = 'none';
        this.state.totalSeconds = this.state.subject.duration * 60;
        this.state.remainingSeconds = this.state.totalSeconds;
        this.renderTimer();
        this.showStep('sim-prep', push, { subjectIndex: i });
    },

    startExam() {
        this.state.isActive = true;
        this.showStep('sim-exam');
        document.getElementById('exam-layout').classList.add('exam-active');
        document.getElementById('timer-side').style.display = 'flex';

        // Play start sound
        const sound = document.getElementById('end-sound');
        if (sound) {
            console.log("Playing start sound...");
            sound.currentTime = 0;
            const playPromise = sound.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.warn("Start sound play failed:", e));
            }
        }

        window.onbeforeunload = () => "أنت في منتصف الامتحان!";

        this.state.timer = setInterval(() => {
            this.state.remainingSeconds--;
            this.renderTimer();
            if (this.state.remainingSeconds <= 0) this.endExam(true, true);
        }, 1000);
    },

    renderTimer() {
        const s = this.state.remainingSeconds;
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        const display = document.getElementById('timer-display');
        display.innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;

        const pct = (s / this.state.totalSeconds) * 100;
        const bar = document.getElementById('timer-bar');
        bar.style.width = `${pct}%`;

        // Color states
        bar.classList.remove('warning', 'critical');
        display.classList.remove('critical');
        if (pct < 20 && pct >= 5) { bar.classList.add('warning'); }
        else if (pct < 5) { bar.classList.add('critical'); display.classList.add('critical'); }
    },

    endExam(completed, timeUp) {
        this.cleanup();
        if (timeUp) {
            const sound = document.getElementById('end-sound');
            if (sound) {
                console.log("Playing end sound (Time Up)...");
                sound.currentTime = 0;
                const playPromise = sound.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => console.warn("End sound play failed:", e));
                }
            }
        }
        if (completed) {
            const spent = this.state.totalSeconds - this.state.remainingSeconds;
            const h = Math.floor(spent / 3600);
            const m = Math.floor((spent % 3600) / 60);
            const s = spent % 60;
            
            let timeStr = "";
            if (h > 0) timeStr += `${h} ساعة `;
            if (m > 0) timeStr += `${m} دقيقة `;
            if (s > 0 && h === 0) timeStr += `${s} ثانية`;
            
            document.getElementById('done-msg').innerText = timeUp
                ? `انتهى الوقت الرسمي! لقد استغرقت ${timeStr || 'كامل الوقت'} في محاولة الحل.`
                : `لقد أنهيت الامتحان في ${timeStr || 'أقل من دقيقة'}. مجهود رائع!`;
            
            this.showStep('sim-done');

            // Tracking completion via Google Tag Manager
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'exam_completed',
                'event_category': 'Simulation',
                'event_label': this.state.subject.name,
                'specialty': this.state.specialty.label,
                'subject': this.state.subject.name,
                'time_spent_seconds': spent
            });
        }
    },

    showSolution() {
        if (!this.state.subject.solutionUrl) {
            alert("عذراً، التصحيح النموذجي لهذا الموضوع غير متوفر حالياً. سيتم إضافته قريباً!");
            return;
        }

        this.showStep('sim-exam');
        document.getElementById('exam-prestart').style.display = 'none';
        document.getElementById('timer-side').style.display = 'none';
        document.getElementById('exam-layout').classList.remove('exam-active');
        document.getElementById('exam-iframe').src = this.state.subject.solutionUrl;
    },

    reset() {
        this.cleanup();
        this.showStep('sim-home');
    },

    scrollTo(id) {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    cleanup() {
        this.state.isActive = false;
        clearInterval(this.state.timer);
        window.onbeforeunload = null;
    }
};

// Initialize the app
simApp.init();
