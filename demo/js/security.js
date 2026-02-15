/**
 * Code Protection & Security Measures
 * Requested Feature: Prevent copying and show custom message.
 */

(function () {
    const WARNING_MSG = "ניסית להעתיק? לא יפה היית פונה אליי 😉";

    // 1. Disable Right Click
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        alert(WARNING_MSG);
    });

    // 2. Disable Key Shortcuts (F12, Ctrl+U, Ctrl+Shift+I/J/C)
    document.addEventListener('keydown', function (e) {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
            alert(WARNING_MSG);
            return;
        }

        // Ctrl + Shift + I/J/C (DevTools)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
            e.preventDefault();
            alert(WARNING_MSG);
            return;
        }

        // Ctrl + U (View Source)
        if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
            e.preventDefault();
            alert(WARNING_MSG);
            return;
        }
    });

    // 3. Intercept Copy/Cut/Paste
    ['copy', 'cut', 'paste'].forEach(event => {
        document.addEventListener(event, function (e) {
            // Allow copy inside input fields so users can actually use the tool
            const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;
            if (!isInput) {
                e.preventDefault();
                alert(WARNING_MSG);
            }
        });
    });

    // 4. Console Clearing & Warning
    // Continuously clear console to annoy inspection
    // setInterval(() => {
    //     console.clear();
    //     console.log("%c" + WARNING_MSG, "color: red; font-size: 20px; font-weight: bold;");
    // }, 2000);

    // Initial log
    console.log("%cStop!", "color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 0 black;");
    console.log("%c" + WARNING_MSG, "color: orange; font-size: 20px; font-weight: bold;");

})();
