import debounce from 'javascript-debounce'

let detailOverlay, mainContainer, windowWidth;
let isInApp = false;

if (!window) {
    windowWidth = 459;
    isInApp = true;
} else {
    windowWidth = window.innerWidth;
}

var isMobile;
var isTablet;
var isDesktop;

function init() {
    detailOverlay = document.getElementById("detailOverlay");
    mainContainer = document.getElementById("gv-content-container");
    adjustToWinSize();
    addListeners();
}

function checkForScrollEnd() {

    //console.log("checkForScrollEnd")
    if (document.body.scrollTop >= (document.getElementById("gv-content-container").offsetTop + document.getElementById("gv-content-container").offsetHeight - 300))
    {
        detailOverlay.classList.remove('opened');
        return true;
    } else {
        return false
    }
}

function resetHighlight(){
    [].slice.apply(document.getElementsByClassName('item-photo selected')).forEach(el => {
        el.classList.remove('selected');
    });
}

function adjustToWinSize(){
    windowWidth = window.innerWidth;

    if(windowWidth < 460) { isMobile =  true; isTablet = false; isDesktop = false; }
    else if(windowWidth > 459 && windowWidth < 980) { isMobile =  false; isTablet = true; isDesktop = false; } 
    else if(windowWidth > 979 ) { isMobile =  false; isTablet = false; isDesktop = true; }

    if (isMobile || isTablet) { 
        detailOverlay.classList.remove("abs-pos"); 
        detailOverlay.classList.add("fix-pos"); 
        detailOverlay.style.top = "0px"; 
    }
    if (isDesktop) { 
        detailOverlay.classList.remove("fix-pos"); 
        detailOverlay.classList.add("abs-pos"); 
    } 

    resetHighlight();
}


function afterResize(){
    adjustToWinSize()
    addListeners() 
    detailOverlay.classList.remove('opened');

}


function addListeners() {

    [].slice.apply(document.querySelectorAll('.facewall-item')).forEach(el => {
        var elId = el.getAttribute("id");
        el.addEventListener('click', () => openDetailContainer(el, elId));
    });

    document.addEventListener('scroll', debounce(checkForScrollEnd, 100));

    detailOverlay.addEventListener('click', function() { detailOverlay.classList.remove('opened'); });


    [].slice.apply(document.querySelectorAll('.cta-button-holder')).forEach(el => {
        el.addEventListener('click', () => window.open(el.getAttribute("data-link")));
    });
     
     if(window){
        window.addEventListener("resize", debounce(afterResize, 500) );

     }
     

}


function openDetailContainer(el, elId) {
    var bannerHeaderEl = document.getElementById("bannerandheader");
    var detailScrollEl = document.getElementById('detailScroll');
    // var detailContainerEl = document.getElementById('detailOverlay');

    var itemDetailEl = document.getElementById('detailItem_' + elId.split("_")[1]);
    var itemDetailOffset = itemDetailEl.getBoundingClientRect().top;
    var parentContainerOffset = document.getElementById('detailScroll').getBoundingClientRect().top;
    var parentContainerScroll = document.getElementById('detailScroll').scrollTop;
    var oldOffset = parentContainerScroll;
    var newOffset = itemDetailOffset - parentContainerOffset + parentContainerScroll - 36;

    //document.querySelector('.interactive-container').className += ' detail-panel-opened';
    detailOverlay.classList.add('opened');
    document.getElementById('detailScroll').scrollTop = newOffset;

    //check if at end of scroll
    let scrollback = checkForScrollEnd();

    if (!isDesktop && scrollback) { window.scrollTo(0, document.getElementById("gv-content-container").offsetTop + document.getElementById("gv-content-container").offsetHeight - 500);
        detailOverlay.classList.add('opened') 
    }


    if (isDesktop) { 
        detailOverlay.style.paddingTop = 0;
        moveDetail(el, detailOverlay);
    }

    setHighLight(elId);
}


function moveDetail(el, detailContainerEl) {

    console.log(el)
    let sectionRef = (el.getAttribute("section-ref"));

    [].slice.apply(document.querySelectorAll('.main-list-bullet')).forEach(sectionEl => {

        console.log(sectionEl.offsetTop)

        var elRef = sectionEl.getAttribute("section-ref");
        if (elRef == sectionRef) {
            detailScroll.classList.remove("add-border-bottom")
            detailContainerEl.style.top = (sectionEl.offsetTop + 12) + "px";
            if ((sectionEl.offsetTop + detailContainerEl.offsetHeight) > mainContainer.offsetHeight) {
                detailScroll.classList.add("add-border-bottom")
                detailContainerEl.style.top = (((sectionEl.offsetTop - detailContainerEl.offsetHeight) + 13) + "px")
            }
        }
    });

}


function isElementVisible(el) {
    var rect = el.getBoundingClientRect(),
        vWidth = window.innerWidth || doc.documentElement.clientWidth,
        vHeight = window.innerHeight || doc.documentElement.clientHeight,
        efp = function(x, y) {
            return document.elementFromPoint(x, y)
        };

    return (rect.height * -1 < rect.top)
}

function setHighLight(elId) {
    let ref = elId.split("_")[1];
    [].slice.apply(document.getElementsByClassName('item-photo selected')).forEach(el => {
        el.classList.remove('selected');
    });

    [].slice.apply(document.getElementsByClassName('gv-detail-img selected')).forEach(el => {
        el.classList.remove('selected');
    });

    [].slice.apply(document.getElementsByClassName('gv-detail-item selected')).forEach(el => {
        el.classList.remove('selected');
    });

    document.getElementById(elId).getElementsByClassName("item-photo")[0].classList.add('selected');
    document.getElementById("detailItemImg_" + ref).classList.add('selected');
    document.getElementById("detailItem_" + ref).classList.add('selected');
}

init();