document.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector(".cardBox");
  const overlay = document.getElementById("overlay");
  const cancelBtn = document.getElementById("cancelBtn");
  const okBtn = document.getElementById("okBtn");

  // 카드 클릭 시 모달 열기
  card.addEventListener("click", () => {
    overlay.classList.add("active");
  });

  // 취소 클릭 시 닫기
  cancelBtn.addEventListener("click", () => {
    overlay.classList.remove("active");
  });

  // 확인 클릭 시 닫기
  okBtn.addEventListener("click", () => {
    alert("확인되었습니다!");
    overlay.classList.remove("active");
  });

  // 오버레이 바깥 클릭 시 닫기
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
    }
  });
});
