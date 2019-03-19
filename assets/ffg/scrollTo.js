(function () {
    function goScroll(step) {
        window.scroll(0, window.pageYOffset + step);
    }

    function onLinkClick(e) {
        const headerEl = document.getElementById('header'),
            fontSize = window.getComputedStyle(document.body).getPropertyValue('font-size'),
            imageResize = 7; // At the top of the page, the image is larger than when we scroll down where the 'tight' class is added.
        let headerHeight = headerEl.clientHeight,
            target = e.srcElement;

        if(headerEl.className !== 'tight'){
            headerHeight = headerHeight - (parseInt(fontSize,10) + imageResize);
        }

        if (target.nodeName !== 'A') {
            target = target.parentElement
        }

        targetSelector = target.getAttribute("href");

        targetElementOffset = document.querySelector(targetSelector).offsetTop,
            step = 45,
            difference = targetElementOffset - window.pageYOffset - headerHeight,
            steps = Math.floor(Math.abs(difference) / step),
            remainder = difference % step;
        i = 0;

        e.preventDefault();

        if (difference < 0) {
            step = 0 - step;
        }

        goScroll(remainder);

        var s = setInterval(function () {
            if (i === steps) {
                clearInterval(s);
            } else {
                i += 1;
                goScroll(step)
            }
        }, 10)
    }

    function attachHandlers() {
        const scrollToEls = document.querySelectorAll('.scroll-to');
        for(let i = scrollToEls.length; i--;){
            scrollToEls[i].addEventListener("click", onLinkClick);
        }
    }

    attachHandlers();
})();