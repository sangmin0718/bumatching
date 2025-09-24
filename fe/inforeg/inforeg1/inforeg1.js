document.addEventListener("DOMContentLoaded", () => {
  // 학부 select 채우기
  const collegeSelect = document.querySelector('[name="college"]');
  collegeSelect.innerHTML =
    `<option value="">학부를 선택해주세요.</option>` +
    COLLEGES.map(c => `<option value="${c}">${c}</option>`).join("");

  document.getElementById("btnNext").addEventListener("click", () => {
    // ✅ 체크된 성별 라디오만 읽기
    const genderEl = document.querySelector('input[name="gender"]:checked');
    const gender = genderEl ? genderEl.value : "";

    // 버튼 타입이 button이므로 간단한 수동 검증
    if (!gender) { alert("성별을 선택해주세요."); return; }
    if (!document.querySelector('[name="nickName"]').value.trim()) { alert("닉네임을 입력해주세요."); return; }
    if (!document.querySelector('[name="age"]').value) { alert("나이를 입력해주세요."); return; }
    if (!document.querySelector('[name="name"]').value.trim()) { alert("이름을 입력해주세요."); return; }
    if (!document.querySelector('[name="college"]').value) { alert("학부를 선택해주세요."); return; }

    const data = {
      gender,
      nickName: document.querySelector('[name="nickName"]').value.trim(),
      age: Number(document.querySelector('[name="age"]').value),
      name: document.querySelector('[name="name"]').value.trim(),
      college: document.querySelector('[name="college"]').value
    };

    const prev = JSON.parse(localStorage.getItem("tempUser") || "{}");
    localStorage.setItem("tempUser", JSON.stringify({ ...prev, ...data }));

    // 다음 단계로 이동
    location.href = "../inforeg2/inforeg2.html";
  });
});
