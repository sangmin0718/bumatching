// Selection.js
document.addEventListener("DOMContentLoaded", () => {
  // 1) 만료자 즉시 복구
  if (typeof cooldownSweep === "function") cooldownSweep();

  const all = loadAll();
  if (!all.length) return;

  // 방금 등록한 사람(리스트 가장 마지막)
  const seeker = all[all.length - 1];

  // 반대 성별 풀에서 TOP3
  const targetGender = (seeker.gender === "남") ? "여" : "남";
  const pool = filterByGender(targetGender);
  const top3 = getTopMatches(seeker, pool, 3);

  const container = document.querySelector(".card-container");
  const overlay = document.getElementById("overlay");
  const okBtn = document.getElementById("okBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  let pendingUser = null;

  container.innerHTML = "";
  top3.forEach((user) => {
    const card = document.createElement("div");
    card.className = "cardBox";
    card.innerHTML = `
      <p class="score">${user.total}</p>
      <p class="score-context">궁합점수</p>
      <div class="detail-container">
        <div class="detail-box"><p class="detail">${user.bio || "-"}</p></div>
        <div class="detail-box"><p class="detail">${user.myComment || "-"}</p></div>
      </div>
      <div class="card-footer">${user.nickName}</div>
    `;
    card.addEventListener("click", () => {
      pendingUser = user;
      overlay.classList.add("active");
    });
    container.appendChild(card);
  });

  cancelBtn.addEventListener("click", () => {
    pendingUser = null;
    overlay.classList.remove("active");
  });

  okBtn.addEventListener("click", () => {
    if (!pendingUser) return;

    // 2) 둘 다 matched 처리 + 타임스탬프 기록 (쿨타임 20분 시작)
    markMatched([pendingUser.id, seeker.id]);

    // 결과 페이지에서 보여줄 최소 정보 저장
    localStorage.setItem("selectedUser", JSON.stringify({
      name: pendingUser.name,
      college: pendingUser.college,
      phone: pendingUser.phone,
      ig: pendingUser.ig
    }));

    overlay.classList.remove("active");
    location.href = "../SelectionResult/SelectionResult.html";
  });

  // 3) 탭이 열려 있는 동안에도 주기적으로 만료 복구 (30초마다)
  setInterval(() => {
    if (typeof cooldownSweep === "function") cooldownSweep();
  }, 30 * 1000);
});
