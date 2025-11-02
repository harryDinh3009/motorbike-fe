/** 공통 import */
import Swal from "sweetalert2";

/** PC 헤더 스크롤 메뉴 숨김 */
export function headerStyle() {
  const windowWidth = window.innerWidth;

  if (windowWidth > 1024) {
    let didScroll;
    window.addEventListener("scroll", function () {
      didScroll = true;

      setInterval(function () {
        if (didScroll) {
          hasScrolled();
          didScroll = false;
        }
      }, 10);
    });
  }
  let lastScrollTop = 0;
  const delta = 0; // 동작의 구현이 시작되는 위치

  // 동작을 구현
  function hasScrolled() {
    // 접근하기 쉽게 현재 스크롤의 위치를 저장한다.
    const st = window.scrollY || document.documentElement.scrollTop;

    // 설정한 delta 값보다 더 스크롤되었는지를 확인한다.
    if (Math.abs(lastScrollTop - st) <= delta) {
      return;
    }

    // 헤더의 높이보다 더 스크롤되었는지 확인하고 스크롤의 방향이 위인지 아래인지를 확인한다.
    if (st > lastScrollTop) {
      // Scroll Down
      document.body.classList.add("scrolly");
    } else {
      // Scroll Up
      if (st + window.innerHeight < document.documentElement.scrollHeight) {
        document.body.classList.remove("scrolly");
      }
    }

    // lastScrollTop 에 현재 스크롤위치를 지정한다.
    lastScrollTop = st;
  }
}

/** PC 헤더 GNB */
export function gnbOneDepth() {
  let gnbLinks = document.querySelectorAll(".gnb_1depth > li");

  function gnbMouseEnter() {
    this.classList.add("on");

    let gnb2Depth = this.querySelector(".gnb_2depth");
    if (gnb2Depth) {
      gnb2Depth.style.maxHeight = gnb2Depth.scrollHeight + "px";

      let gnb2DepthItems = gnb2Depth.querySelectorAll("li");
      gnb2DepthItems.forEach(function (item) {
        let gnb3Depth = item.querySelector(".gnb_3depth");
        if (gnb3Depth) {
          item.addEventListener("mouseenter", function () {
            gnb2Depth.style.overflow = "visible";
            gnb3Depth.style.maxHeight = gnb3Depth.scrollHeight + "px";
          });
          item.addEventListener("mouseleave", function () {
            gnb2Depth.style.overflow = "hidden";
            gnb3Depth.style.maxHeight = "0";
          });
        }
      });
    }
    let gnb3Depth = this.querySelector(".gnb_3depth");
    if (gnb3Depth) {
      gnb3Depth.style.maxHeight = gnb3Depth.scrollHeight + "px";

      let gnb3DepthItems = gnb3Depth.querySelectorAll("li");
      gnb3DepthItems.forEach(function (item) {
        let gnb4Depth = item.querySelector(".gnb_4depth");
        if (gnb4Depth) {
          item.addEventListener("mouseenter", function () {
            gnb3Depth.style.overflow = "visible";
            gnb4Depth.style.maxHeight = gnb4Depth.scrollHeight + "px";
          });
          item.addEventListener("mouseleave", function () {
            gnb3Depth.style.overflow = "hidden";
            gnb4Depth.style.maxHeight = "0";
          });
        }
      });
    }
  }

  function gnbMouseLeave() {
    this.classList.remove("on");

    let gnb2Depth = this.querySelector(".gnb_2depth");
    if (gnb2Depth) {
      gnb2Depth.style.maxHeight = "0";

      // 2depth 메뉴 내의 3depth 처리
      let gnb2DepthItems = gnb2Depth.querySelectorAll("li");
      gnb2DepthItems.forEach(function (item) {
        let gnb3Depth = item.querySelector(".gnb_3depth");
        if (gnb3Depth) {
          gnb3Depth.style.maxHeight = "0";
        }
      });
    }
    let gnb3Depth = this.querySelector(".gnb_3depth");
    if (gnb3Depth) {
      gnb3Depth.style.maxHeight = "0";

      // 3depth 메뉴 내의 4depth 처리
      let gnb3DepthItems = gnb3Depth.querySelectorAll("li");
      gnb3DepthItems.forEach(function (item) {
        let gnb4Depth = item.querySelector(".gnb_4depth");
        if (gnb4Depth) {
          gnb4Depth.style.maxHeight = "0";
        }
      });
    }
  }

  gnbLinks.forEach(function (link) {
    link.addEventListener("mouseenter", gnbMouseEnter);
    link.addEventListener("mouseleave", gnbMouseLeave);
  });
}

/** 모바일 헤더 GNB */
export function mobileGnb() {
  let body = document.body;
  let btnMenu = document.querySelector(".header_wrap .btn_menu");
  let subFooter = document.querySelector(".gnb_submenu .sub_footer .grid_content");
  let headerFunction = document.querySelector(".header_function");
  let btnAlarm = headerFunction.querySelector(".btn_alarm");
  let btnLogout = headerFunction.querySelector(".btn_logout");
  let loginInfo = headerFunction.querySelector(".login_info");
  let headerLogo = document.querySelector(".header_top .header_logo");

  btnMenu.addEventListener("click", function () {
    body.classList.toggle("gnb");
  });

  let isMobile = false;

  function handleResize() {
    var windowWidth = window.innerWidth || document.documentElement.clientWidth;
    if (windowWidth < 1025 && !isMobile) {
      // console.log("모바일 화면");
      isMobile = true;
      if (subFooter) {
        subFooter.appendChild(loginInfo);
      }

      document.querySelectorAll(".gnb_2depth").forEach(function (element) {
        element.style.maxHeight = "0";
      });

      headerLogo.addEventListener("click", function () {
        document.body.classList.remove("gnb");
      });

      if (btnAlarm) {
        btnAlarm.addEventListener("click", function () {
          document.body.classList.remove("gnb");
        });
      }
      if (btnLogout) {
        btnLogout.addEventListener("click", function () {
          document.body.classList.remove("gnb");
        });
      }

      let sub1DepthLinks = document.querySelectorAll(".sub_1depth > li > a");

      sub1DepthLinks.forEach(function (list) {
        let sub2Depth = list.nextElementSibling;
        list.addEventListener("click", function () {
          let listItem = this.parentNode;

          //토글슬라이드
          if (listItem.classList.contains("gnb")) {
            sub2Depth.style.maxHeight = "0";
            listItem.classList.remove("gnb");
            return;
          }
          list.parentNode.classList.add("gnb");
          if (sub2Depth) {
            sub2Depth.style.maxHeight = sub2Depth.scrollHeight + "px";
            sub2Depth.addEventListener("click", function () {
              body.classList.remove("gnb");
              list.parentNode.classList.remove("gnb");
              sub2Depth.style.maxHeight = "0";
            });
          } else {
            body.classList.remove("gnb");
            list.parentNode.classList.remove("gnb");
          }

          //다른메뉴 접기
          sub1DepthLinks.forEach(function (otherList) {
            if (otherList !== list) {
              otherList.parentNode.classList.remove("gnb");
              let other2Depth = otherList.nextElementSibling;
              if (other2Depth) {
                other2Depth.style.maxHeight = "0";
              }
            }
          });
        });
      });

      document.querySelectorAll(".sub_1depth > li").forEach(function (target) {
        var anchor = target.querySelector("a");
        var subMore = anchor.querySelector(".sub_more");
        var sub2Depth = target.querySelector(".sub_2depth");

        if (subMore) {
          subMore.style.display = "none";
        }

        if (sub2Depth) {
          var span = document.createElement("span");
          span.className = "sub_more";
          span.textContent = "펼쳐보기";
          anchor.appendChild(span);
        }
      });
    } else if (windowWidth >= 1025 && isMobile) {
      // console.log("PC 화면");
      isMobile = false;

      body.classList.remove("gnb");
      if (loginInfo) {
        headerFunction.prepend(loginInfo);
      }
    }
  }

  handleResize();
  window.addEventListener("resize", handleResize);
}

/** moveTop */
export function moveTop() {
  var moveTopButton = document.querySelector(".move_top");

  function updateButtonVisibility() {
    if (window.scrollY > 200) {
      moveTopButton.classList.add("on");
    } else {
      moveTopButton.classList.remove("on");
    }
  }

  function scrollToTop() {
    var startTime;
    var duration = 300;
    var startScrollY = window.scrollY;
    var endScrollY = 0;

    function animateScroll(currentTime) {
      if (!startTime) {
        startTime = currentTime;
      }

      var elapsedTime = currentTime - startTime;
      var progress = Math.min(elapsedTime / duration, 1);

      window.scrollTo(0, startScrollY + (endScrollY - startScrollY) * progress);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    }

    requestAnimationFrame(animateScroll);
  }

  window.addEventListener("scroll", updateButtonVisibility);
  moveTopButton.addEventListener("click", function () {
    scrollToTop();
  });

  // 초기 상태 설정
  updateButtonVisibility();
}

/** 공지사항, 설문조사, 만족도조사 컬러설정 */
export function setColors() {
  const listItems = document.querySelectorAll(".notice_box");

  listItems.forEach((item, index) => {
    if ((index + 1) % 3 === 1) {
      item.style.backgroundColor = "#8AA8E3";
    } else if ((index + 1) % 3 === 2) {
      item.style.backgroundColor = "#C2BAF2";
    } else {
      item.style.backgroundColor = "#F9D0AD";
    }
  });
}

/** 글자 수 제한, 클래스명으로 제어 */
export function letterCount() {
  function setupLetterCount(commentWrapper) {
    var wrapper = commentWrapper;
    var input = wrapper.querySelector("textarea, input");
    var counter = wrapper.querySelector(".letter_counter");
    var countLimit = parseInt(wrapper.classList[1].replace("count", ""));

    var spanElement = document.createElement("span");
    spanElement.textContent = "0";
    counter.appendChild(spanElement);

    input.addEventListener("input", function () {
      var countLength = this.value.length;

      spanElement.textContent = countLength;

      counter.innerHTML = "<span>" + countLength + "</span>/" + countLimit;

      if (countLength > countLimit) {
        const _text = countLimit + "자 이내로 작성하여 주십시오";
        Swal.fire({
          title: "알림",
          html: _text,
          confirmButtonColor: "#5D87FF",
          reverseButtons: true,
          confirmButtonText: "확인",
        });
        this.value = this.value.substring(0, countLimit);
        spanElement.textContent = countLimit;
        counter.innerHTML = "<span>" + countLimit + "</span>/" + countLimit;
      }
    });

    input.dispatchEvent(new Event("input"));
  }

  var commentWrappers = document.querySelectorAll(".letter_count");
  commentWrappers.forEach(function (commentWrapper) {
    setupLetterCount(commentWrapper);
  });
}

/** 아코디언 */
export function accordion() {
  /** 아코디언 구조 .accordion > .acd_tit + .acd_cnt 가 한 세트
   */
  const accordions = document.querySelectorAll(".accordion");
  const openAccordion = (accordion) => {
    const content = accordion.querySelector(".acd_cnt");
    accordion.classList.add("acd_active");
    content.style.maxHeight = "none";
  };
  const closeAccordion = (accordion) => {
    const content = accordion.querySelector(".acd_cnt");
    accordion.classList.remove("acd_active");
    content.style.maxHeight = null;
  };
  accordions.forEach((accordion) => {
    const intro = accordion.querySelector(".acd_tit");
    const content = accordion.querySelector(".acd_cnt");

    intro.onclick = () => {
      if (content.style.maxHeight) {
        closeAccordion(accordion);
      } else {
        accordions.forEach((accordion) => closeAccordion(accordion));
        openAccordion(accordion);
      }
    };
  });
}

/** 테이블 체크 */
export function tblCheck() {
  var tblChoices = document.querySelectorAll(".tbl_check");

  tblChoices.forEach(function (tblChoice) {
    var checkAll = tblChoice.querySelector('input[name="tbl_checkall"]');
    var checks = tblChoice.querySelectorAll('input[name="tbl_check"]');
    var checkTotalCnt = checks.length;

    if (!checkAll) {
      return;
    }

    checkAll.addEventListener("change", function () {
      var isChecked = checkAll.checked;

      checks.forEach(function (check) {
        check.checked = isChecked;

        if (isChecked) {
          check.closest("tr").classList.add("on");
        } else {
          check.closest("tr").classList.remove("on");
        }
      });
    });

    checks.forEach(function (check) {
      check.addEventListener("change", function () {
        var checkSelected = Array.from(checks).filter(function (c) {
          return c.checked;
        });

        if (check.checked) {
          check.closest("tr").classList.add("on");
        } else {
          check.closest("tr").classList.remove("on");
        }

        checkAll.checked = checkSelected.length >= checkTotalCnt;
      });
    });

    checks.forEach(function (check) {
      check.addEventListener("click", function (event) {
        event.stopPropagation();
      });
    });
  });
}

/** 전체 체크 */
export function checkAll() {
  var checkAllWrappers = document.querySelectorAll(".check_all_wrap");

  checkAllWrappers.forEach(function (wrapper) {
    var checkAllCheckbox = wrapper.querySelector('input[name="checkall"]');
    var checkboxes = wrapper.querySelectorAll('input[name="check"]');

    function updateCheckAll() {
      var allChecked = true;

      checkboxes.forEach(function (checkbox) {
        if (!checkbox.disabled && !checkbox.checked) {
          allChecked = false;
        }
      });

      checkAllCheckbox.checked = allChecked;
    }

    checkAllCheckbox.addEventListener("change", function () {
      checkboxes.forEach(function (checkbox) {
        if (!checkbox.disabled) {
          checkbox.checked = checkAllCheckbox.checked;
        }
      });
    });

    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener("change", updateCheckAll);
    });

    updateCheckAll();
  });
}