document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("formStep3").addEventListener("submit", (e) => {
    e.preventDefault();

    if (!document.getElementById("agreeTerms").checked) {
      alert("개인정보 수집 및 이용에 동의해야 합니다.");
      return;
    }

    const data = {
      bio: document.querySelector('[name="bio"]').value.trim(),
      myComment: document.querySelector('[name="myComment"]').value.trim(),
    };

    const prev = JSON.parse(localStorage.getItem("tempUser") || "{}");
    const finalData = { ...prev, ...data };

    // 🔥 infomain.js의 addParticipant 사용
    const added = addParticipant(finalData);

    // 임시 데이터 삭제
    localStorage.removeItem("tempUser");

    // 결과 페이지로 이동
    location.href = "../../Selection/Selection.html";
  });

  document.getElementById("btnPrev").addEventListener("click", () => {
    location.href = "../inforeg2/inforeg2.html";
  });
});
