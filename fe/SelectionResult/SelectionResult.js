// SelectionResult.js
document.addEventListener("DOMContentLoaded", () => {
  const LS_KEY = "jjagja_participants_live_v1"; // 전체 참가자 저장 키
  const userData = JSON.parse(localStorage.getItem("selectedUser"));

  if (userData) {
    document.querySelector(".school").innerText = userData.college || "-";
    document.getElementById("name").innerText = userData.name || "-";
    document.getElementById("phone").innerText = userData.phone || "-";
    document.getElementById("instagram").innerText = userData.ig ? "@" + userData.ig : "-";
  }

  // 모든 참가자 JSON 다운로드
  function downloadAllParticipants(filename = "personinfo.json") {
    const LS_KEY = "jjagja_participants_live_v1";
    const list = JSON.parse(localStorage.getItem(LS_KEY) || "[]");

    // 들여쓰기 2칸으로 예쁘게 출력
    const pretty = JSON.stringify(list, null, 2);

    const blob = new Blob([pretty], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // 종료하기 버튼
  document.querySelector(".end-btn").addEventListener("click", () => {
    // 1) 전체 참가자 JSON 자동 다운로드
    downloadAllParticipants("personinfo.json");

    // 2) 안내 후 시작 페이지로 복귀
    setTimeout(() => {
      window.location.href = "../start.html";
    }, 300);
  });
});
