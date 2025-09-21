// Selection.js
document.addEventListener("DOMContentLoaded", () => {
  // 1) 만료자 즉시 복구
  if (typeof cooldownSweep === "function") cooldownSweep();

  // 저장된 추천 결과 불러오기
  const saved = JSON.parse(localStorage.getItem("jjagja_top3_matches_v1"));
  if (!saved || !saved.top3) {
    console.warn("추천결과가 없습니다.");
    return;
  }

  const seekerId = saved.seekerId; // 선택한 본인 ID
  const top3 = saved.top3; // 추천 상대 3명

  const container = document.querySelector(".card-container");
  const overlay = document.getElementById("overlay");
  const okBtn = document.getElementById("okBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  let pendingUser = null;

  container.innerHTML = "";
  console.log("top3:", top3);

  // 카드 생성
  top3.forEach((user) => {
    const card = document.createElement("div");
    card.className = "cardBox";
    card.innerHTML = `
      <p class="score">${user.total}</p>
      <p class="score-context">궁합점수</p>
      <div class="detail-container">
        <p class="detail-title">한줄 자기소개</p>
        <div class="detail-box"><p class="detail">${user.bio || "-"}</p></div>
        <p class="detail-title">내가 원하는 이상형</p>
        <div class="detail-box"><p class="detail">${
          user.myComment || "-"
        }</p></div>
      </div>
      <div class="card-footer">닉네임 : ${user.nickName}</div>
    `;
    card.addEventListener("click", () => {
      pendingUser = user;
      overlay.classList.add("active"); // 모달 열기
    });
    container.appendChild(card);
  });

  // 취소 버튼
  cancelBtn.addEventListener("click", () => {
    pendingUser = null;
    overlay.classList.remove("active");
  });

  // 확인 버튼
  okBtn.addEventListener("click", () => {
    if (!pendingUser) return;

    // 2) 둘 다 matched 처리 + 타임스탬프 기록 (쿨타임 20분 시작)
    markMatched([pendingUser.id, seekerId]);

    // 결과 페이지에서 보여줄 최소 정보 저장
    localStorage.setItem(
      "selectedUser",
      JSON.stringify({
        name: pendingUser.nickName, // 수정됨 (name → nickName)
        college: pendingUser.college,
        phone: pendingUser.phone,
        ig: pendingUser.ig,
      })
    );

    overlay.classList.remove("active");
    location.href = "../SelectionResult/SelectionResult.html";
  });

  // 3) 탭이 열려 있는 동안에도 주기적으로 만료 복구 (30초마다)
  setInterval(() => {
    if (typeof cooldownSweep === "function") cooldownSweep();
  }, 30 * 1000);
});
