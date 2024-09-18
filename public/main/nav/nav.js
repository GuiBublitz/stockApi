document.addEventListener('DOMContentLoaded', () => {
    let sidebarLeft = document.querySelector(".sidebar-left");
    let overlayLeft = document.querySelector(".overlay-left");
    let sidebarClose = document.querySelector(".sidebar-close .close");
    
    overlayLeft.addEventListener("click", function () {
        sidebarLeft.classList.toggle("open");
        overlayLeft.classList.toggle("open");
    });
    sidebarClose.addEventListener("click", function () {
        sidebarLeft.classList.remove("open");
        overlayLeft.classList.remove("open");
    });
    
    let sideMenuLeftNine = document.querySelector(".navbar-nine .menu-bar");
    sideMenuLeftNine.addEventListener("click", function () {
        sidebarLeft.classList.add("open");
        overlayLeft.classList.add("open");
    });
});