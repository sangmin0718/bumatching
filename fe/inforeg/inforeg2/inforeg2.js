document.querySelector('[name="mbti"]').addEventListener('input', function(e) {
  let v = e.target.value.toUpperCase();
  let result = '';
  if (v.length > 0) result += v[0].replace(/[^EI]/, '');
  if (v.length > 1) result += v[1].replace(/[^NS]/, '');
  if (v.length > 2) result += v[2].replace(/[^FT]/, '');
  if (v.length > 3) result += v[3].replace(/[^JP]/, '');
  e.target.value = result;
});

const HOBBIES = [
  "헬스","러닝","수영","요가","필라테스","등산","클라이밍","축구","농구","야구",
      "게임","보드게임","퍼즐","코딩","경기 관람",
      "영화","드라마","예능","애니","다큐","공포영화","독립영화",
      "음악","노래","밴드","악기","피아노","기타","드럼","클럽",
      "독서","시집","에세이","소설","경제","자기계발", "경영", 
      "요리","베이킹","커피","카페탐방","차(티)","와인","맥주",
      "사진","필름카메라","여행","드라이브","캠핑","백패킹","차박","낚시",
      "전시회","뮤지컬","연극","미술관","박람회","콘서트",
      "댄스","방탈출","노래방","춤","클럽","파티",
      "패션","뷰티","메이크업","쇼핑","악세사리",
      "산책","반려동물","고양이","강아지","식물키우기",
      "봉사활동","스터디","동아리","e스포츠","자전거"
];
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