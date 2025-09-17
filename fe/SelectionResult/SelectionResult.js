document.addEventListener("DOMContentLoaded", () => {
  const userData = JSON.parse(localStorage.getItem("selectedUser"));
  if (!userData) return;

  document.querySelector(".school").innerText = userData.college || "-";
  document.getElementById("name").innerText = userData.name || "-";
  document.getElementById("phone").innerText = userData.phone || "-";
  document.getElementById("instagram").innerText = userData.ig ? "@" + userData.ig : "-";

  // 종료하기 버튼
  document.querySelector(".end-btn").addEventListener("click", () => {
    alert("종료되었습니다."); 
    setTimeout(() => {
      window.location.href = "../start.html";
    }, 1000);
  });
});
