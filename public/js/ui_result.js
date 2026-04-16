$(document).ready(function(){
// Quick Menu
quickMenu();

// Gnb Menu
gnb();

// Mobile Gnb Menu
mobileGnb();

// 메인 비쥬얼
if( $(".mainSwiper").length ){
    const mainVisual = new Swiper(".mainSwiper", {
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".swiper-pagination",
            type: "fraction",
        },
        navigation: {
            nextEl: ".main-swiper .swiper-button-next",
            prevEl: ".main-swiper .swiper-button-prev",
        }
    });
    const swiperStop = document.querySelector(".swiper-button-stop")
    , swiperPlay = document.querySelector(".swiper-button-play");
    swiperStop.addEventListener("click", () => {
        // Swiper 정지
        mainVisual.autoplay.stop();

        // 정지 버튼 숨김
        swiperStop.style.display = "none";
        // 재생 버튼 활성화
        swiperPlay.style.display = "block";
    });
    swiperPlay.addEventListener("click", () => {
        // Swiper 정지
        mainVisual.autoplay.start();

        // 정지 버튼 숨김
        swiperPlay.style.display = "none";
        // 재생 버튼 활성화
        swiperStop.style.display = "block";
    });

    // Resize 이벤트
    window.addEventListener('resize', () => {
        mainVisual.update();
    });
}

// 대한민국 실증도시
if( $(".city-swiper").length ){
    new Swiper(".city-swiper", {
        slidesPerView: 1.2,
        spaceBetween: 15,
        navigation: {
            nextEl: ".city-swiper_controll .swiper-button-next",
            prevEl: ".city-swiper_controll .swiper-button-prev",
        },
        breakpoints: {
            768: {
                slidesPerView: 2.3,
                spaceBetween: 24,
            },
            1024: {
                slidesPerView: 3.3,
                spaceBetween: 24,
            }
        }
    });
}

// 통합 정보 아카이브
if( $(".archive-swiper").length ){
    new Swiper(".archive-swiper", {
        slidesPerView: 2.5,
        spaceBetween: 15,
        breakpoints: {
            768: {
                slidesPerView: 3.5,
                spaceBetween: 20,
            },
            1024: {
                slidesPerView: 5.5,
                spaceBetween: 24
            },
            1400: {
                slidesPerView: 7,
                spaceBetween: 60,
                enabled: true,
            }
        }
    });
}

// 셀렉트박스 스타일
if( $(".js-select__year").length ){
    selectStyle("js-select__year");
}
if( $(".js-select__quantity").length ){
    selectStyle("js-select__quantity");
}

// 셀렉트박스 링크
if( $(".select-link").length ){
    selectUrlForm();
}

// 메인 배너 슬라이드
if( $(".menu-list").length ){
    setTimeout(() => {
        createInfiniteSlider();
    }, 100);
}
});
