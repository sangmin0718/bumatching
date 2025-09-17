document.addEventListener("DOMContentLoaded", () => {
  // 학부 select 채우기 (COLLEGES 배열은 infolist.js에서 제공됨)
  const collegeSelect = document.querySelector('[name="college"]');
  collegeSelect.innerHTML =
    `<option value="">학부를 선택해주세요.</option>` +
    COLLEGES.map(c => `<option value="${c}">${c}</option>`).join("");

  // 다음 버튼
  document.getElementById("btnNext").addEventListener("click", () => {
    const data = {
      gender: document.querySelector('[name="gender"]').value,
      nickName: document.querySelector('[name="nickName"]').value,
      age: document.querySelector('[name="age"]').value,
      name: document.querySelector('[name="name"]').value,
      college: document.querySelector('[name="college"]').value,
    };

    const prev = JSON.parse(localStorage.getItem("tempUser") || "{}");
    localStorage.setItem("tempUser", JSON.stringify({ ...prev, ...data }));

    // 다음 단계로 이동
    location.href = "../inforeg2/inforeg2.html";
  });
});
