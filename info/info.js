(() => {
  const STORAGE_KEY = "datingProfileForm.v4";

  const trim = (v) => (typeof v === "string" ? v.trim() : v);

  // 입력이 URL(@ 포함)이어도 아이디만 추출 (예: https://instagram.com/abc.def/ -> abc.def)
  function normalizeIgToHandle(input) {
    if (!input) return "";
    let v = input.trim();
    try {
      if (/^https?:\/\//i.test(v)) {
        const u = new URL(v);
        if (/instagram\.com$/i.test(u.hostname)) {
          const parts = u.pathname.split("/").filter(Boolean);
          if (parts.length > 0) v = parts[0];
        }
      }
    } catch { }
    v = v.replace(/^@+/, "").replace(/\/+$/, "").trim();
    return v;
  }

  // 인스타 아이디 유효성: 1~30자, 영문/숫자/._ 가능
  function isValidIgHandle(v) {
    if (!v) return false;
    const re = /^[a-z0-9._]{1,30}$/i;
    if (!re.test(v)) return false;
    return true;
  }

  function bindCounter(inputEl, counterEl, maxLen) {
    const update = () => {
        counterEl.textContent = `${inputEl.value.length}/${maxLen}`;
    };
    inputEl.addEventListener("input", update);
    update();
}

  function saveToLocalStorage(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { }
  }
  function loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function gatherFormData({ nickNameEl, igEl, bioEl, idealHidden, myCommentEl }) {
    return {
      nickname: trim(nickNameEl.value),
      instagram: trim(igEl.value),
      bio: trim(bioEl.value),
      ideal: trim(idealHidden.value),
      myComment: trim(myCommentEl.value),
      meta: { version: 4, savedAt: new Date().toISOString() },
    };
  }

  // 초기화
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("profileForm");

    // 기본 입력
    const nickNameEl = document.getElementById("nickName");
    const nickNameError = document.getElementById("nickNameError");

    const igEl = document.getElementById("ig");
    const igError = document.getElementById("igError");

    const bioEl = document.getElementById("bio");
    const bioCount = document.getElementById("bioCount");
    const bioError = document.getElementById("bioError");

    // 이상형
    const idealTags = document.getElementById("idealTags");
    const idealHidden = document.getElementById("ideal");
    let idealError = document.getElementById("idealError");
    if (!idealError) {
      idealError = document.createElement("p");
      idealError.id = "idealError";
      idealError.className = "error";
      idealError.textContent = "이상형을 최소 1개 이상 선택하세요.";
      idealError.style.display = "none";
      idealTags.insertAdjacentElement("afterend", idealError);
    }

    // 이상형 적기
    const myCommentEl = document.getElementById("myComment");
    const myCommentCount = document.getElementById("myCommentCount");
    const myCommentError = document.getElementById("myCommentError");

    const resultSection = document.getElementById("resultSection");
    const resultPreview = document.getElementById("resultPreview");
    const nextBtn = document.getElementById("nextBtn");

    // 글자수 카운터 연결
    bindCounter(bioEl, bioCount, parseInt(bioEl.maxLength || "60", 10));
    bindCounter(myCommentEl, myCommentCount, parseInt(myCommentEl.maxLength || "60", 10));

    // 이상형 태그: 이벤트 위임
    function updateIdealHiddenFromUI() {
      const selected = Array.from(idealTags.querySelectorAll(".tag.selected"))
        .map((b) => b.textContent.trim());
      idealHidden.value = selected.join(",");
    }
    if (idealTags) {
      idealTags.querySelectorAll(".tag").forEach((b) => {
        if (!b.hasAttribute("aria-pressed")) b.setAttribute("aria-pressed", "false");
      });
      idealTags.addEventListener("click", (e) => {
        const btn = e.target.closest(".tag");
        if (!btn) return;
        btn.classList.toggle("selected");
        btn.setAttribute("aria-pressed", btn.classList.contains("selected") ? "true" : "false");
        updateIdealHiddenFromUI();
        validateIdeal();
        saveToLocalStorage(gatherFormData({ nickNameEl, igEl, bioEl, idealHidden, myCommentEl }));
      });
    }

    // 검증
    function validateNickName() {
      const v = trim(nickNameEl.value);
      const ok = v.length >= 2 && v.length <= 16;
      nickNameError.style.display = ok ? "none" : "block";
      return ok;
    }
    function validateIg() {
      const normalized = normalizeIgToHandle(igEl.value);
      igEl.value = normalized;
      const ok = isValidIgHandle(normalized);
      igError.style.display = ok ? "none" : "block";
      return ok;
    }
    function validateBio() {
      const v = trim(bioEl.value);
      const ok = v.length > 0; 
      bioError.style.display = ok ? "none" : "block";
      return ok;
    }
    function validateIdeal() {
      const ok = idealHidden.value.trim().length > 0;
      idealError.style.display = ok ? "none" : "block";
      return ok;
    }
    function validateMyComment() {
      const v = trim(myCommentEl.value);
      const ok = v.length > 0; 
      myCommentError.style.display = ok ? "none" : "block";
      return ok;
    }

    // 이벤트
    nickNameEl.addEventListener("input", () => {
      validateNickName();
      saveToLocalStorage(gatherFormData({ nickNameEl, igEl, bioEl, idealHidden, myCommentEl }));
    });
    igEl.addEventListener("blur", () => {
      validateIg();
      saveToLocalStorage(gatherFormData({ nickNameEl, igEl, bioEl, idealHidden, myCommentEl }));
    });
    bioEl.addEventListener("input", () => {
      validateBio();
      saveToLocalStorage(gatherFormData({ nickNameEl, igEl, bioEl, idealHidden, myCommentEl }));
    });
    myCommentEl.addEventListener("input", () => {
      validateMyComment();
      saveToLocalStorage(gatherFormData({ nickNameEl, igEl, bioEl, idealHidden, myCommentEl }));
    });

    // 로컬스토리지 복원
    const saved = loadFromLocalStorage();
    if (saved) {
      if (typeof saved.nickname === "string") nickNameEl.value = saved.nickname;
      if (typeof saved.instagram === "string") igEl.value = saved.instagram;
      if (typeof saved.bio === "string") bioEl.value = saved.bio;
      if (typeof saved.myComment === "string") myCommentEl.value = saved.myComment;

      if (typeof saved.ideal === "string" && saved.ideal.length > 0) {
        const set = new Set(saved.ideal.split(",").map((s) => s.trim()));
        idealTags.querySelectorAll(".tag").forEach((btn) => {
          if (set.has(btn.textContent.trim())) {
            btn.classList.add("selected");
            btn.setAttribute("aria-pressed", "true");
          }
        });
        updateIdealHiddenFromUI();
      }

      // UI 상태 갱신
      validateNickName();
      validateIg();
      validateBio();
      validateIdeal();
      validateMyComment();
      // 카운터 갱신
      bioEl.dispatchEvent(new Event("input"));
      myCommentEl.dispatchEvent(new Event("input"));
    }

    // 제출
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      updateIdealHiddenFromUI();

      const okNick = validateNickName();
      const okIg = validateIg();
      const okBio = validateBio();
      const okIdeal = validateIdeal();
      const okMyComment = validateMyComment();

      if (!okNick || !okIg || !okBio || !okIdeal || !okMyComment) {
        alert("입력값을 확인해주세요.");
        return;
      }

      const data = gatherFormData({ nickNameEl, igEl, bioEl, idealHidden, myCommentEl });
      saveToLocalStorage(data);

      window.location.href = "next.html";
    });
  });
})();