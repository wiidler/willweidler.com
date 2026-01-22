/**
 * Will Weidler - Terminal Logic v2.0
 */

document.addEventListener('DOMContentLoaded', () => {
    const processIncludes = async () => {
        // Handle nested includes by looping until none remain
        let includeNodes = document.querySelectorAll('[data-include]');
        while (includeNodes.length) {
            await Promise.all(Array.from(includeNodes).map(async (node) => {
                const url = node.getAttribute('data-include');
                if (!url) return;
                try {
                    const res = await fetch(url);
                    if (!res.ok) return;
                    let html = await res.text();
                    const status = node.getAttribute('data-footer-status') || '-- Connection Idle --';
                    const note = node.getAttribute('data-footer-note') || '';
                    const title = node.getAttribute('data-title') || '';
                    html = html
                        .replaceAll('{{STATUS}}', status)
                        .replaceAll('{{NOTE}}', note)
                        .replaceAll('{{TITLE}}', title);
                    node.outerHTML = html;
                } catch (_) {
                    // Fail silently; leave the placeholder as-is.
                }
            }));
            includeNodes = document.querySelectorAll('[data-include]');
        }
    };

    (async () => {
        await processIncludes();

        const typeElements = document.querySelectorAll('.typewriter');
        const toggle = document.getElementById('typewriter-toggle');
        const cursorAnchor = document.querySelector('[data-cursor-anchor]');
        const anchorIndex = Array.from(typeElements).findIndex((el) => el === cursorAnchor);

        let totalDelay = 0;
        const typingSpeed = 30;

        // Preferences
        const typewriterEnabled = localStorage.getItem('typewriterEnabled') !== 'false';
        if (toggle) toggle.checked = typewriterEnabled;

        // Utils
        const isRaw = (el) => el.dataset.rawValue !== undefined || el.dataset.rawText !== undefined;

        const getOriginalText = (el) => {
            if (el.dataset.rawValue !== undefined) return el.dataset.rawValue;
            if (el.dataset.rawText !== undefined) return el.textContent;
            return el.innerHTML;
        };

        const setTextInstant = (el, text) => {
            el.innerHTML = '';
            if (isRaw(el)) el.textContent = text; else el.innerHTML = text;
        };

        const revealTargetsFor = (el) => {
            const targets = el.dataset ? el.dataset.revealTarget : null;
            if (!targets) return;
            targets
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
                .forEach((selector) => {
                    document.querySelectorAll(selector).forEach((node) => {
                        node.classList.add('reveal');
                        if (node.dataset.cursorAnchor !== undefined) node.classList.add('typewriter-done');
                    });
                });
        };

        // Render all instantly (no typewriter)
        const showAllText = () => {
            typeElements.forEach((el) => {
                setTextInstant(el, getOriginalText(el));
                el.style.visibility = 'visible';
                el.classList.remove('typing', 'typewriter-done');
                revealTargetsFor(el);
            });
            const anchorTarget = cursorAnchor || typeElements[typeElements.length - 1];
            if (anchorTarget) anchorTarget.classList.add('typewriter-done');
        };

        // Typewriter sequence
        const runTypewriter = () => {
            typeElements.forEach((el, index) => {
                const originalText = getOriginalText(el);
                setTextInstant(el, '');
                const useCursor = !el.dataset.noCursor && (anchorIndex === -1 || index <= anchorIndex);

                setTimeout(() => {
                    el.style.visibility = 'visible';
                    if (useCursor) el.classList.add('typing');

                    let i = 0;
                    const timer = setInterval(() => {
                        if (i < originalText.length) {
                            if (isRaw(el)) el.textContent = originalText.slice(0, i + 1);
                            else el.innerHTML += originalText.charAt(i);
                            i++;
                        } else {
                            clearInterval(timer);
                            if (useCursor) el.classList.remove('typing');

                            revealTargetsFor(el);

                            if (cursorAnchor && el === cursorAnchor) {
                                cursorAnchor.classList.add('typewriter-done');
                            } else if (!cursorAnchor && index === typeElements.length - 1) {
                                el.classList.add('typewriter-done');
                            }
                        }
                    }, typingSpeed);
                }, totalDelay);

                totalDelay += originalText.length * typingSpeed + 250;
            });
        };

        // Mobile nav hamburger toggle (setup before typewriter)
        const headerNav = document.querySelector('header nav');
        const navToggleBtn = headerNav ? headerNav.querySelector('.nav-toggle') : null;
        if (headerNav && navToggleBtn) {
            navToggleBtn.addEventListener('click', () => {
                const isOpen = headerNav.classList.toggle('open');
                navToggleBtn.setAttribute('aria-expanded', String(isOpen));
            });
            // Close after clicking a link
            headerNav.querySelectorAll('a').forEach((a) => {
                a.addEventListener('click', () => {
                    headerNav.classList.remove('open');
                    navToggleBtn.setAttribute('aria-expanded', 'false');
                });
            });
        }

        // Execute chosen mode
        if (typewriterEnabled) runTypewriter(); else showAllText();

        // Toggle changes
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                localStorage.setItem('typewriterEnabled', e.target.checked);
                location.reload();
            });
        }

        // Demo button
        const alertBtn = document.getElementById('alert-btn');
        if (alertBtn) {
            alertBtn.addEventListener('click', () => {
                alert("Terminal Message: System operational.");
            });
        }

        // Dynamic year in footer
        const currentYear = new Date().getFullYear();
        document.querySelectorAll('.js-year').forEach((el) => {
            el.textContent = currentYear;
        });

        console.log("%c [SYSTEM]: Access granted.", "color: #00ff41; font-weight: bold;");
    })();
});

function sendMail() {
    const subjectField = document.getElementById('subject');
    const bodyField = document.getElementById('message');
    const statusDisplay = document.getElementById('status-msg');

    const subject = subjectField ? subjectField.value : "Inquiry";
    const body = bodyField ? bodyField.value : "";
    const recipient = "info@willweidler.com";

    if (!statusDisplay) return;

    if (!body.trim()) {
        statusDisplay.style.display = "block";
        statusDisplay.style.color = "#ffcc00";
        statusDisplay.innerHTML = "[!] ERROR: MESSAGE_BODY_EMPTY";
        return;
    }

    statusDisplay.style.display = "block";
    statusDisplay.style.color = "#00ff41";
    statusDisplay.innerHTML = "[+] SECURE_TUNNEL_OPENING...";

    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setTimeout(() => {
        window.location.href = mailtoUrl;
        statusDisplay.innerHTML = "[+] PACKET_HANDED_TO_SYSTEM_CLIENT";
    }, 1000);
}