// MBTI 입력 제한 및 대문자 변환
document.querySelector('[name="mbti1"]').addEventListener('input', function(e) {
  e.target.value = e.target.value.toUpperCase().replace(/[^EI]/g, '');
});
document.querySelector('[name="mbti2"]').addEventListener('input', function(e) {
  e.target.value = e.target.value.toUpperCase().replace(/[^NS]/g, '');
});
document.querySelector('[name="mbti3"]').addEventListener('input', function(e) {
  e.target.value = e.target.value.toUpperCase().replace(/[^FT]/g, '');
});
document.querySelector('[name="mbti4"]').addEventListener('input', function(e) {
  e.target.value = e.target.value.toUpperCase().replace(/[^JP]/g, '');
});

document.addEventListener("DOMContentLoaded", () => {
  /* ==== 취미 버튼 채우기 ==== */
  const hobbyContainer = document.getElementById("hobbyChecks");
  hobbyContainer.innerHTML = HOBBIES.map(hobby => `
    <label>
      <input type="checkbox" name="hobbies" value="${hobby}">
      <span>${hobby}</span>
    </label>
  `).join("");

  // 취미갯수제한 // 취미 체크박스 최대 5개 선택 제한했음
  hobbyContainer.addEventListener("change", (e) => {
    if (e.target.type === "checkbox") {
      const checked = hobbyContainer.querySelectorAll('input[type="checkbox"]:checked');
      if (checked.length > 5) {
        e.target.checked = false;
        alert("취미는 최대 5개까지만 선택할 수 있습니다.");
      }
    }
  });

  /* ==== 지역 선택 채우든지요니미 씨발 ==== */
  const regionSelect = document.getElementById("region");
  regionSelect.innerHTML =
    `<option value="">시/도를 선택해주세요.</option>` +
    Object.keys(CITIES).map(city => `<option value="${city}">${city}</option>`).join("");

  const subregionSelect = document.getElementById("subregion");
  regionSelect.addEventListener("change", (e) => {
    const selectedCity = e.target.value;
    if (selectedCity && CITIES[selectedCity]) {
      subregionSelect.innerHTML =
        `<option value="">군/구를 선택해주세요.</option>` +
        CITIES[selectedCity].map(sub => `<option value="${sub}">${sub}</option>`).join("");
      subregionSelect.disabled = false;
    } else {
      subregionSelect.innerHTML = `<option value="">군/구를 선택해주세요.</option>`;
      subregionSelect.disabled = true;
    }
  });
  subregionSelect.disabled = true;

  // 전화번호 자동 하이픈
document.querySelector('[name="phone"]').addEventListener('input', function(e) {
  let num = e.target.value.replace(/[^0-9]/g, '');
  if (num.length <= 3) {
    e.target.value = num;
  } else if (num.length <= 7) {
    e.target.value = num.slice(0,3) + '-' + num.slice(3);
  } else if (num.length <= 11) {
    e.target.value = num.slice(0,3) + '-' + num.slice(3,7) + '-' + num.slice(7,11);
  }
});
  /* ==== 다음 버튼 ==== */
  document.getElementById("btnNext").addEventListener("click", () => {
    const mbti = (
      document.querySelector('[name="mbti1"]').value.trim() +
      document.querySelector('[name="mbti2"]').value.trim() +
      document.querySelector('[name="mbti3"]').value.trim() +
      document.querySelector('[name="mbti4"]').value.trim()
    ).toUpperCase();
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