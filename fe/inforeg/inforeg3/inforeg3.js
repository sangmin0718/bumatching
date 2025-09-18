// inforeg3.js
// 요구사항: 공용 유틸(LS_KEY, addParticipant 등)만 사용하고,
//            스텝3 입력값은 다른 페이지 이동 시 절대 보존하지 않음(초안 저장 제거)

document.addEventListener('DOMContentLoaded', () => {
  // 요소 참조
  const form = document.getElementById('formStep3');
  const bioEl = form.elements['bio'];
  const myCommentEl = form.elements['myComment'];
  const agreeEl = document.getElementById('agreeTerms');
  const btnPrev = document.getElementById('btnPrev');
  const btnSubmit = document.getElementById('btnSubmit');

  // 브라우저 자동완성/자동복원 방지
  try { form.setAttribute('autocomplete', 'off'); } catch {}

  // 최초 진입 시 폼 초기화 (이전 방문 흔적 제거)
  try { form.reset(); } catch {}

  // 뒤로가기(bfcache)로 돌아온 경우에도 폼 비우기
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      try { form.reset(); } catch {}
      // 혹시 모를 값 잔존도 명시적으로 비움
      bioEl.value = '';
      myCommentEl.value = '';
      agreeEl.checked = false;
    }
  });

  // 페이지를 떠날 때(앞/뒤 이동 포함) 입력값을 비워 스냅샷에 남지 않도록 시도
  window.addEventListener('pagehide', () => {
    bioEl.value = '';
    myCommentEl.value = '';
    agreeEl.checked = false;
  });

  /* ===================== 유효성(동의 체크) 보조 ===================== */
  function validateAgree() {
    if (!agreeEl.checked) {
      agreeEl.setCustomValidity('개인정보 수집 및 이용 동의가 필요합니다.');
    } else {
      agreeEl.setCustomValidity('');
    }
  }
  agreeEl.addEventListener('change', () => {
    validateAgree();
    form.reportValidity();
  });

  /* ===================== 이전 버튼 (정적 경로 이동) ===================== */
  btnPrev.addEventListener('click', () => {
    // 폴더 구조가 fe/ 아래라면 info2(또는 inforeg3) 기준으로 한 단계 올라가 inforeg/inforeg2로 이동
    // 프로젝트 구조에 맞춰 필요 시 수정하세요.
    location.href = '../inforeg2/inforeg2.html';
  });

  /* ===================== 단축키(Ctrl/Cmd + Enter) 제출 ===================== */
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'enter') {
      btnSubmit?.click();
    }
  });

  /* ===================== 제출 처리 ===================== */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // 기본 검증( bio required, agree required ) + 커스텀 메시지
    validateAgree();
    if (!form.reportValidity()) return;

    // 현재 스텝 입력값
    const dataStep3 = {
      bio: bioEl.value.trim(),
      myComment: myCommentEl.value.trim()
      // gender, name, age 등은 이전 스텝에서 tempUser에 저장되어 있을 수 있음
    };

    // 이전 스텝 임시데이터 병합 (tempUser는 다른 스텝에서 관리)
    const prev = JSON.parse(localStorage.getItem('tempUser') || '{}');
    const finalData = { ...prev, ...dataStep3 };

    try {
      // 공용 스토리지 유틸 사용 (중복 저장 로직 없음)
      const saved = addParticipant(finalData);

      // 임시데이터 정리(스텝3은 초안 저장 자체가 없으므로 tempUser만 제거)
      localStorage.removeItem('tempUser');

      console.log('Saved participant =>', saved);

      // 결과(선택 화면)로 이동
      location.href = '../../Selection/Selection.html';
    } catch (err) {
      alert('저장 중 오류가 발생했습니다: ' + (err?.message || err));
    }
  });
});