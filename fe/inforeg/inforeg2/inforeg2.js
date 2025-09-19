document.addEventListener("DOMContentLoaded", () => {
  /* ==== MBTI 입력 제한 (대문자 + 자리별 허용 문자) ==== */
  const mbtiEl = document.querySelector('[name="mbti"]');
  if (mbtiEl) {
    mbtiEl.addEventListener('input', function (e) {
      const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
      let result = '';
      if (v.length > 0) result += v[0].replace(/[^EI]/g, '');
      if (v.length > 1) result += v[1].replace(/[^NS]/g, '');
      if (v.length > 2) result += v[2].replace(/[^FT]/g, '');
      if (v.length > 3) result += v[3].replace(/[^JP]/g, '');
      e.target.value = result;
    });
  } else {
    console.warn('MBTI input not found: [name="mbti"]');
  }

  /* ==== 취미 버튼 채우기 ==== */
  const hobbyContainer = document.getElementById("hobbyChecks");
  if (!hobbyContainer) {
    console.warn('#hobbyChecks element not found');
  } else {
    if (typeof HOBBIES === 'undefined' || !Array.isArray(HOBBIES)) {
      console.error('HOBBIES is not defined or not an array. 취미가 표시되지 않습니다.');
      hobbyContainer.innerHTML = '<p style="color:#999">취미 데이터 없음</p>';
    } else {
      hobbyContainer.innerHTML = HOBBIES.map(hobby => `
        <label class="hobby-item">
          <input type="checkbox" name="hobbies" value="${hobby}">
          <span>${hobby}</span>
        </label>
      `).join("");
    }

    // 취미 체크박스 최대 5개 선택 제한
    hobbyContainer.addEventListener("change", (e) => {
      const target = e.target;
      if (target && target.type === "checkbox") {
        const checked = hobbyContainer.querySelectorAll('input[type="checkbox"]:checked');
        if (checked.length > 5) {
          target.checked = false;
          alert("취미는 최대 5개까지만 선택할 수 있습니다.");
        }
      }
    });
  }

  /* ==== 지역 선택 채우기 ==== */
  const regionSelect = document.getElementById("region");
  const subregionSelect = document.getElementById("subregion");
  if (!regionSelect) {
    console.warn('#region element not found');
    if (subregionSelect) subregionSelect.disabled = true;
  } else {
    if (typeof CITIES === 'undefined' || typeof Object.keys !== 'function') {
      console.error('CITIES is not defined. 지역 목록을 불러올 수 없습니다.');
      regionSelect.innerHTML = `<option value="">지역 데이터 없음</option>`;
      if (subregionSelect) {
        subregionSelect.innerHTML = `<option value="">군/구 데이터 없음</option>`;
        subregionSelect.disabled = true;
      }
    } else {
      regionSelect.innerHTML =
        `<option value="">시/도를 선택해주세요.</option>` +
        Object.keys(CITIES).map(city => `<option value="${city}">${city}</option>`).join("");
      if (subregionSelect) {
        subregionSelect.disabled = true;
        regionSelect.addEventListener("change", (e) => {
          const city = e.target.value;
          if (!city) {
            subregionSelect.innerHTML = `<option value="">군/구를 선택해주세요.</option>`;
            subregionSelect.disabled = true;
            return;
          }
          const list = CITIES[city] || [];
          subregionSelect.innerHTML = `<option value="">군/구를 선택해주세요.</option>` +
            list.map(s => `<option value="${s}">${s}</option>`).join("");
          subregionSelect.disabled = false;
        });
      }
    }
  }

  /* ==== 전화번호 자동 하이픈 ==== */
  const phoneEl = document.querySelector('[name="phone"]');
  if (phoneEl) {
    phoneEl.addEventListener('input', function (e) {
      let num = e.target.value.replace(/[^0-9]/g, '');
      if (num.length > 11) num = num.slice(0, 11);
      if (num.length <= 3) {
        e.target.value = num;
      } else if (num.length <= 7) {
        e.target.value = num.slice(0, 3) + '-' + num.slice(3);
      } else {
        e.target.value = num.slice(0, 3) + '-' + num.slice(3, 7) + '-' + num.slice(7);
      }
    });
  }

  /* ==== 다음 버튼 ==== */
  document.getElementById("btnNext").addEventListener("click", () => {
    const mbti = document.querySelector('[name="mbti"]').value.trim().toUpperCase();
    const hobbies = [...document.querySelectorAll('input[name="hobbies"]:checked')]
      .map(i => i.value);
    const region = document.querySelector('[name="region"]').value;
    const subregion = document.querySelector('[name="subregion"]').value;
    const phone = document.querySelector('[name="phone"]').value.trim();
    const ig = document.querySelector('[name="ig"]').value.trim();

    const data = {
      mbti,
      hobbies,
      region: subregion ? `${region} ${subregion}` : region,
      phone,
      ig,
    };

    // 기존 tempUser 불러와서 병합
    const prev = JSON.parse(localStorage.getItem("tempUser") || "{}");
    localStorage.setItem("tempUser", JSON.stringify({ ...prev, ...data }));

    // 다음 페이지로 이동
    location.href = "../inforeg3/inforeg3.html";
  });

  /* ==== 이전 버튼 ==== */
  document.getElementById("btnPrev").addEventListener("click", () => {
    location.href = "../inforeg1/inforeg1.html";
  });
});