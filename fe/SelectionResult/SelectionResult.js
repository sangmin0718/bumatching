// 나중에 서버나 다른 페이지에서 받아올 변수 (현재는 하드코딩)
const userData = {
  school: "백석대학교",   // ← 변수화 가능
  name: "이정민",         // ← 변수화 가능
  phone: "010-0000-0000", // ← 변수화 가능
  instagram: "dlts_min"   // ← 변수화 가능
};

// DOM 요소에 값 넣기
document.querySelector(".school").innerText = userData.school;
document.getElementById("name").innerText = userData.name;
document.getElementById("phone").innerText = userData.phone;
document.getElementById("instagram").innerText = "@" + userData.instagram;

// 종료하기 버튼 클릭 이벤트
document.querySelector(".end-btn").addEventListener("click", () => {
  alert("종료되었습니다."); 
  // TODO: 여기서 메인 페이지로 이동하거나 세션 종료 로직 추가
});
