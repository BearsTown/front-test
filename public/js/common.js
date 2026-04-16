/*  mobile ------------------------------------------------------------------------------ */
function mobile() {
    return window.innerWidth < 1024 ? 1 : 0 //ipad pro는 넓어서 web화면이 나오게
}
/*  initial setup of accessibility ------------------------------------------------------- */
function accessInit(el) {
    $(el).attr('aria-expanded', 'false')
}

/*  ---------------------------------------------------------------------------------------
*    전체메뉴 슬라이드 토글
----------------------------------------------------------------------------------------- */
function quickMenu() {
    const gnbButton = $(".menu-btn");
    const header = document.querySelector('.header-in .inner');

    // 웹 버전
    if (!mobile()) {
        gnbButton.attr("aria-controls", "gnb1");
    } else {
        gnbButton.attr("aria-controls", "gnb2");
    }

    // 전체메뉴 버튼
    gnbButton.on("click", function (e) {
        e.preventDefault();

        // 웹 버전
        if (!mobile()) {
            if( $(this).hasClass("menu-btn__page") ){
                const expanded = $(this).attr('aria-expanded') === "true";
                $(this).attr(
                    'aria-expanded',
                    !expanded
                );

                if( !expanded ){
                    $(this).addClass("active");

                    // Gnb 메뉴 열고 닫기
                    gnbMenuTypes("open");
                    // Header 배경 생성
                    //header?.classList.add('active');
                } else {
                    $(this).removeClass("active");

                    // Header 배경 삭제
                    //header?.classList.remove('active');

                    // Gnb 메뉴 열고 닫기
                    gnbMenuTypes("close");
                }
            }
            
            $(".gnb-menu").toggleClass("gnb-active");
        } else { // 모바일 버전
            $("#gnb2").addClass("active");
            $("html").addClass("scroll_no");
        }
    });

    // 닫기 버튼
    $("#gnb2 .btn-close").on("click", function(){
        $("#gnb2").removeClass("active");
        $("html").removeClass("scroll_no");
    });
}

/*  ---------------------------------------------------------------------------------------
*    gnb
----------------------------------------------------------------------------------------- */
function gnb() {
    const gnbWrap = document.querySelector('.gnb-menu'); // 메뉴 전체
    const gnbBtns = gnbWrap.querySelectorAll('.gnb-btn');
    const header = document.querySelector('.header-in');
    const backdrop = document.querySelector('.gnb-backdrop');

    const first = gnbBtns[0];
    const last = gnbBtns[gnbBtns.length - 1];

    let oldActive = null;
    let isShiftTab = false;

    // 메뉴 버튼
    gnbBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            // 웹 버전
            if (!mobile()) {
                if( document.querySelector(".menu-btn").classList.contains("menu-btn__page") ){
                    const isActive = btn.parentNode.classList.contains('selected');
                    if (isActive){
                        // Gnb 메뉴 열고 닫기
                        //gnbMenuTypes("close");

                        return;
                    };

                    if( oldActive ){
                        oldActive.parentNode.classList.remove('selected');
                        oldActive.setAttribute('aria-expanded', 'false');
                    }

                    btn.parentNode.classList.add('selected');
                    btn.setAttribute('aria-expanded', 'true');

                    // Gnb 메뉴 열고 닫기
                    //gnbMenuTypes("open");

                    oldActive = btn;
                } else {
                    location.href = this.attr("href");
                }
            }

            const target = document.getElementById(btn.getAttribute('aria-controls'));
            if (target) {
                target.classList.add('active');
            } else {
                location.href = btn.attr("href");
            }
        });
    });

    // 2뎁스 메뉴
    const subMenus = gnbWrap.querySelectorAll('.gnb-submenu li');
    subMenus.forEach(li => {
        const link = li.querySelector('a');

        // 클릭 → active
        link.addEventListener('click', (e) => {
            // 전체 active 제거
            subMenus.forEach(item => item.classList.remove('active'));

            // 현재만 active
            li.classList.add('active');
        });

        // 마우스 오버 → over
        li.addEventListener('mouseenter', () => {
            li.classList.add('over');
        });

        li.addEventListener('mouseleave', () => {
            li.classList.remove('over');
        });
    });

    // 배경 영역
    if( backdrop ){
        backdrop.addEventListener("click", () => {
            // Gnb 메뉴 열고 닫기
            gnbMenuTypes("close");
        });        
    }

    gnbWrap.addEventListener('focusin', (e) => {
        console.log(e.target, first, last, isShiftTab);
        if (e.target === first && !isShiftTab) {
            $(".gnb-menu").addClass("gnb-active");
            $(".menu-btn").attr('aria-expanded', true).addClass("active");
            
            // Gnb 메뉴 열고 닫기
            gnbMenuTypes("open");
        }

        if (e.target === last && !isShiftTab) {
            $(".gnb-menu").addClass("gnb-active");
            $(".menu-btn").attr('aria-expanded', true).addClass("active");

            // Gnb 메뉴 열고 닫기
            gnbMenuTypes("open");
        }
    });
    first.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && e.shiftKey) {
            $(".gnb-menu").removeClass("gnb-active");
            $(".menu-btn").attr('aria-expanded', false).removeClass("active");

            // Gnb 메뉴 열고 닫기
            gnbMenuTypes("close");
        }
    });
    last.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && !e.shiftKey) {
            $(".gnb-menu").removeClass("gnb-active");
            $(".menu-btn").attr('aria-expanded', false).removeClass("active");

            // Gnb 메뉴 열고 닫기
            gnbMenuTypes("close");
        }
    });
}
// Gnb 메뉴 열고 닫기
function gnbMenuTypes(type) {
    const header = document.querySelector('.header-in .inner');
    const backdrop = document.querySelector('.gnb-backdrop');
    const gnbBtns = document.querySelectorAll('.gnb-btn');

    if( !type ) return;

    console.log(type);

    // 전체 Gnb메뉴 활성화
    if( type === "open" ){
        header?.classList.add('active');
        //backdrop?.classList.add('active');
    } else { // 전체 Gnb메뉴 숨김
        header?.classList.remove('active');
        //backdrop?.classList.remove('active');

        gnbBtns.forEach(btn => {
            btn.parentNode.classList.remove('selected');
            btn.setAttribute('aria-expanded', 'false');

            const target = document.getElementById(btn.getAttribute('aria-controls'));
            if (target) {
                target.classList.remove('active');
            }
        });
    }
}

/*  ---------------------------------------------------------------------------------------
*    mobileGnb
----------------------------------------------------------------------------------------- */
function mobileGnb(opt) {
    const menuBtn = document.querySelector('.menu-btn');
    const mobileMenu = document.getElementById('gnb2');
    const mobileMenuBtn = mobileMenu.querySelectorAll(".gnb-button");
    const closeBtn = document.querySelector('.btn-close');

    let oldActive = null;

    // 공통 활성화 함수
    function openMenu(btn) {
        if (!btn) return;

        // 기존 active 제거
        if (oldActive) {
            oldActive.parentNode.classList.remove('active');
            oldActive.setAttribute('aria-expanded', 'false');

            const oldTarget = document.getElementById(oldActive.getAttribute('aria-controls'));
            if (oldTarget) oldTarget.classList.remove('active');
        }

        // 현재 active 적용
        btn.parentNode.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');

        const target = document.getElementById(btn.getAttribute('aria-controls'));
        if (target) target.classList.add('active');

        oldActive = btn;
    }

    // 초기 active 자동 실행
    const defaultActive = mobileMenu.querySelector('.gnb-button.active');
    if (defaultActive) {
        openMenu(defaultActive);
    }

    // 메뉴 클릭
    mobileMenuBtn.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            const isActive = btn.parentNode.classList.contains('active');

            if (isActive) {
                btn.parentNode.classList.remove("active");
                btn.setAttribute('aria-expanded', 'false');

                const target = document.getElementById(btn.getAttribute('aria-controls'));
                if (target) target.classList.remove('active');

                oldActive = null;
                return;
            }

            openMenu(btn);
        });
    });

    // 닫기 버튼
    closeBtn.addEventListener('click', () => {
        mobileMenu.hidden = true;
        menuBtn.setAttribute('aria-expanded', 'false');
    });
}

// 외부 클릭 닫기
document.addEventListener('click', (e) => {
    const isInside =
        e.target.closest('.gnb-menu') ||
        e.target.closest('.footer-top_related') ||
        e.target.closest('.select-style') ||
        e.target.closest('.menu-btn');

    if (!isInside) {
        closeAll();
    }
});

// ESC 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAll();
    }
});

// Aria Name Close
function closeAll() {
    // Gnb 메뉴
    document.querySelectorAll('.gnb-btn').forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');

        const target = document.getElementById(
            btn.getAttribute('aria-controls')
        );

        if (target) target.hidden = true;
    });

    document.querySelectorAll('.select-style__button').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', false);
    });

    document.querySelectorAll('.select-style__list').forEach(list => {
        list.hidden = true;
    });

    // 관련사이트
    const relatedBtn = document.querySelector('.related-button');
    const relatedList = document.getElementById('relatedList');

    if (relatedBtn && relatedList) {
        relatedBtn.setAttribute('aria-expanded', 'false');
        relatedBtn.classList.remove('active');
        relatedList.hidden = true;
    }
}

/*  ---------------------------------------------------------------------------------------
*    셀렉트박스 링크
----------------------------------------------------------------------------------------- */
function selectUrlForm(){
    const relatedBtn = document.querySelector('.related-button');
    const relatedList = document.getElementById('relatedList');

    relatedBtn.addEventListener('click',()=>{
        const expanded = relatedBtn.getAttribute('aria-expanded') === 'true';

        relatedBtn.setAttribute('aria-expanded', !expanded);
        if( !expanded ){
            relatedBtn.classList.add("active");
        } else {
            relatedBtn.classList.remove("active");
        }
        
        relatedList.hidden = expanded;
    });
}

/*  ---------------------------------------------------------------------------------------
*    셀렉트박스 디자인
----------------------------------------------------------------------------------------- */
function selectStyle(node){
    const selectType = document.querySelector(`.${node}`);
    const selectNode = selectType.querySelector(".select");
    const selectNodeOpt = selectType.querySelectorAll(".select option");
    const selectContent = selectType.querySelector(".select-content");
    const listArr = [];

    selectNodeOpt.forEach(option => {
        listArr.push( option.innerText );
    });

    // 초기 목록 생성
    const createOption = selectCreate();
    selectContent.innerHTML = createOption;

    const selectTypeBtn = selectType.querySelector('.select-style__button');
    const selectTypeList = selectType.querySelector('.select-style__list');
    const selectTypeListBtn = selectTypeList.querySelectorAll("a");

    // 버튼
    selectTypeBtn.addEventListener('click',()=>{
        const expanded = selectTypeBtn.getAttribute('aria-expanded') === 'true';

        // 먼저 전체 닫기
        closeAllSelect();

        // 닫혀있던 상태면 다시 열기
        if (!expanded) {
            selectTypeBtn.classList.add('active');
            selectTypeBtn.setAttribute('aria-expanded', true);
            selectTypeList.hidden = false;
        }
    });

    // 리스트 버튼
    selectTypeListBtn.forEach((btn, index) => {
        btn.addEventListener('click', (e)=>{
            // 기본링크 기능삭제
            e.preventDefault();

            // 모든 active 제거
            selectTypeListBtn.forEach(b => {
                b.parentNode.classList.remove('active');
            });
            // 버튼
            btn.parentNode.classList.add("active");
            // 셀렉스 value 값
            selectNode.selectedIndex = index;
            // 셀렉트 메인 버튼
            selectTypeBtn.innerHTML = btn.innerText;
            selectTypeBtn.classList.remove('active');
            selectTypeBtn.setAttribute('aria-expanded', false);
            // 리스트 숨김
            selectTypeList.hidden = true;
        });
    });

    // 목록 생성
    function selectCreate(){
        let result = '';
        result += `<button type="button" aria-expanded="false" aria-controls="${node}" class="select-style__button">${listArr[0]}</button>`;
        result += `<ul id="${node}" class="select-style__list" hidden>`;
        listArr.forEach((text, index) => {
            if( index === 0 ){
                result += `    <li class="active"><a href="#">${text}</a></li>`;
            } else {
                result += `    <li><a href="#">${text}</a></li>`;
            }
        });
        result += '</ul>';

        return result;
    }

    // 목록 닫기
    function closeAllSelect() {
        document.querySelectorAll('.select-style__button').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-expanded', false);
        });

        document.querySelectorAll('.select-style__list').forEach(list => {
            list.hidden = true;
        });
    }
}

/*  ---------------------------------------------------------------------------------------
*    슬라이드 배너
----------------------------------------------------------------------------------------- */
function createInfiniteSlider() {
    const track = document.querySelector('.menu-list');
    const originalItems = Array.from(track.children);
    const originalLength = originalItems.length;
    let position = 0;
    let speed = 0.5;
    let itemWidth = 0;
    let baseOffset = 0;

    // 앞에 복사 (10개)
    [...originalItems].reverse().forEach(item => {
        const clone = item.cloneNode(true);
        track.insertBefore(clone, track.firstChild);
    });

    // 뒤에 2배 복사 (20개)
    for (let i = 0; i < 2; i++) {
        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            track.appendChild(clone);
        });
    }
    let itemTotalCount = originalItems.length
    , itemTotalWidth = originalItems[0].offsetWidth + parseFloat(window.getComputedStyle(originalItems[0]).marginRight);
    let totalWidth = itemTotalCount * itemTotalWidth;
    track.style.width = (totalWidth * 4) + "px";

    // 목록
    const items = Array.from(track.children);

    // 기준값
    function calculate() {
        itemWidth = items[0].offsetWidth;

        const style = getComputedStyle(items[0]);
        const margin = parseFloat(style.marginRight || 0);

        itemWidth += margin;

        // 시작 위치 = "두번째 블록 (11번 위치)"
        baseOffset = itemWidth * originalLength;

        position = baseOffset;
    }

    // 슬라이드 모션
    function animate() {
        position += speed;

        // 21번 위치까지 가면 다시 11번으로 점프
        if (position >= baseOffset + (itemWidth * originalLength)) {
            position = baseOffset;
        }

        track.style.transform = `translate3d(${-position}px,0,0)`;

        requestAnimationFrame(animate);
    }

    // 기준값
    calculate();
    // 슬라이드 모션
    animate();

    // 리사이즈시 초기화
    window.addEventListener('resize', () => {
        calculate();
    });
}

// 리사이즈시
window.addEventListener('resize', () => {
    let active = document.querySelector('.gnb-menu').classList.contains("gnb-active")

    if( active ){
        if( mobile() ){
            document.querySelector('.menu-btn').classList.remove("active");
        } else {
            document.querySelector('.menu-btn').classList.add("active");
        }
    }
});