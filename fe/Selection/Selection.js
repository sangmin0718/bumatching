document.addEventListener("DOMContentLoaded", () => {
  const all = loadAll(); // infomain.js 함수
  if (all.length === 0) return;

  const last = all[all.length - 1];
  const targetGender = (last.gender === "남") ? "여" : "남";
  const pool = filterByGender(targetGender);
  const top3 = getTopMatches(last, pool, 3);

  const container = document.querySelector(".card-container");
  container.innerHTML = "";

  top3.forEach((user) => {
    const card = document.createElement("div");
    card.className = "cardBox";
    card.innerHTML = `
      <p class="score">${user.total}</p>
      <p class="score-context">궁합점수</p>
      <div class="detail-container">
        <p class="detail">${user.bio}</p>
      </div>
      <div class="card-footer">${user.nickName}</div>
    `;
    // ✅ 카드 클릭 시 선택한 사용자 저장
    card.addEventListener("click", () => {
      localStorage.setItem("selectedUser", JSON.stringify(user));
      location.href = "../SelectionResult/SelectionResult.html";
    });
    container.appendChild(card);
  });
});
