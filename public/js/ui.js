// Gnb Menu
gnb();

// Mobile Gnb Menu
mobileGnb();

// 메인 배너 슬라이드
if( document.querySelector(".menu-list") ){
    window.addEventListener('load', createInfiniteSlider);
}
