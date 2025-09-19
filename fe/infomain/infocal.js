/* ===================== 스토리지 유틸 ===================== */
const LS_KEY = "jjagja_participants_live_v1";

function loadAll() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveAll(list) { localStorage.setItem(LS_KEY, JSON.stringify(list)); }
function clearAll() { localStorage.removeItem(LS_KEY); }

function nextId(list) {
  return list.reduce((m, p) => Math.max(m, p.id || 0), 0) + 1;
}

/* ===== 연락처 정규화 유틸 ===== */
function normalizePhone(str) {
  if (!str) return "";
  return String(str).replace(/\D/g, ""); // 숫자만
}
function normalizeIg(str) {
  if (!str) return "";
  return String(str).trim().toLowerCase().replace(/^@+/, ""); // @ 제거 + 소문자
}

function normalize(p) {
  const hobbyMap = { "헬스": "운동" };
  const hobbies = (p.hobbies || []).map(h => hobbyMap[h] || h);
  const mbti = String(p.mbti || "").toUpperCase();
  return {
    id: p.id ?? 0,
    gender: p.gender,
    name: (p.name || "").trim(),
    nickName: (p.nickName || "").trim(),
    bio: (p.bio || "").trim(),
    myComment: (p.myComment || "").trim(),
    status: p.status || "waiting",
    age: Number(p.age),
    college: p.college,
    mbti,
    hobbies,
    region: p.region,
    phone: p.phone ?? "",
    ig: p.ig ?? "",
    // ✅ 쿨타임 타임스탬프 기본값
    lastMatchedAt: (typeof p.lastMatchedAt === "number") ? p.lastMatchedAt : 0
  };
}

/**
 * 참가자 추가 (재방문 중복 제거 지원)
 * - 새로 입력된 phone/ig가 기존 레코드와 하나라도 일치하면 → 기존 레코드 삭제 후 신규만 저장
 */
function addParticipant(p) {
  const list = loadAll();

  // 새 입력 값 정규화
  const newPhone = normalizePhone(p.phone);
  const newIg = normalizeIg(p.ig);

  // 중복 제거: phone 또는 ig가 일치하는 기존 레코드 제거
  let filtered = list;
  if (newPhone || newIg) {
    filtered = list.filter(x => {
      const xPhone = normalizePhone(x.phone);
      const xIg = normalizeIg(x.ig);
      const phoneConflict = newPhone && xPhone && (xPhone === newPhone);
      const igConflict = newIg && xIg && (xIg === newIg);
      return !(phoneConflict || igConflict);
    });
  }

  // 정규화 & 저장
  const n = normalize(p);
  n.id = nextId(filtered);
  filtered.push(n);
  saveAll(filtered);
  return n;
}

function filterByGender(g) { return loadAll().filter(p => p.gender === g); }

function exportJson() {
  const data = JSON.stringify(loadAll(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "participants_export.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}


/* ===================== 쿨타임(20분) 로직 ===================== */
const COOL_TIME_MS = 20 * 60 * 1000; // 20분

// 만료된 matched → waiting 으로 자동 복구
function cooldownSweep() {
  const now = Date.now();
  const list = loadAll();
  let changed = false;

  for (const p of list) {
    if (p.status === "matched") {
      const last = Number(p.lastMatchedAt || 0);
      // 기록이 없거나 만료된 경우 복구
      if (!last || isNaN(last) || now - last >= COOL_TIME_MS) {
        p.status = "waiting";
        p.lastMatchedAt = 0;
        changed = true;
      }
    }
  }
  if (changed) saveAll(list);
  return changed;
}

// 선택 확정 시 호출: 전달된 id들을 matched로 표시(쿨타임 시작)
function markMatched(ids = []) {
  const now = Date.now();
  const set = new Set(Array.isArray(ids) ? ids : [ids]);
  const list = loadAll();

  for (const p of list) {
    if (set.has(p.id)) {
      p.status = "matched";
      p.lastMatchedAt = now;
    }
  }
  saveAll(list);
}

// (옵션) 특정 id들을 강제로 waiting으로 되돌리고 싶을 때 사용
function markWaiting(ids = []) {
  const set = new Set(Array.isArray(ids) ? ids : [ids]);
  const list = loadAll();
  let changed = false;

  for (const p of list) {
    if (set.has(p.id)) {
      p.status = "waiting";
      p.lastMatchedAt = 0;
      changed = true;
    }
  }
  if (changed) saveAll(list);
}

// (옵션) 남은 쿨타임(ms) 조회
function getCooldownRemaining(p) {
  if (p.status !== "matched" || !p.lastMatchedAt) return 0;
  const remain = COOL_TIME_MS - (Date.now() - p.lastMatchedAt);
  return Math.max(0, remain);
}


/* ===================== 매칭 점수 엔진 ===================== */
const MBTI_SCORES = {
  INFP: { INFP:30, ENFP:30, INFJ:30, ENFJ:40, INTJ:30, ENTJ:40, INTP:30, ENTP:30, ISFP:5, ESFP:5, ISTP:5, ESTP:5, ISFJ:10, ESFJ:5, ISTJ:5, ESTJ:5 },
  ENFP: { INFP:30, ENFP:30, INFJ:40, ENFJ:30, INTJ:40, ENTJ:30, INTP:30, ENTP:30, ISFP:5, ESFP:5, ISTP:5, ESTP:5, ISFJ:5, ESFJ:5, ISTJ:5, ESTJ:5 },
  INFJ: { INFP:30, ENFP:40, INFJ:30, ENFJ:30, INTJ:30, ENTJ:30, INTP:30, ENTP:40, ISFP:5, ESFP:5, ISTP:5, ESTP:5, ISFJ:5, ESFJ:5, ISTJ:5, ESTJ:5 },
  ENFJ: { INFP:40, ENFP:30, INFJ:30, ENFJ:30, INTJ:30, ENTJ:30, INTP:30, ENTP:30, ISFP:40, ESFP:5, ISTP:5, ESTP:5, ISFJ:5, ESFJ:5, ISTJ:5, ESTJ:5 },
  INTJ: { INFP:30, ENFP:40, INFJ:30, ENFJ:30, INTJ:30, ENTJ:30, INTP:30, ENTP:40, ISFP:20, ESFP:20, ISTP:20, ESTP:20, ISFJ:15, ESFJ:15, ISTJ:15, ESTJ:15 },
  ENTJ: { INFP:40, ENFP:30, INFJ:30, ENFJ:30, INTJ:30, ENTJ:30, INTP:40, ENTP:30, ISFP:20, ESFP:20, ISTP:20, ESTP:20, ISFJ:20, ESFJ:20, ISTJ:20, ESTJ:20 },
  INTP: { INFP:30, ENFP:30, INFJ:30, ENFJ:30, INTJ:30, ENTJ:40, INTP:30, ENTP:30, ISFP:20, ESFP:20, ISTP:20, ESTP:20, ISFJ:15, ESFJ:15, ISTJ:15, ESTJ:40 },
  ENTP: { INFP:30, ENFP:30, INFJ:40, ENFJ:30, INTJ:40, ENTJ:30, INTP:30, ENTP:30, ISFP:20, ESFP:20, ISTP:20, ESTP:20, ISFJ:15, ESFJ:15, ISTJ:15, ESTJ:15 },
  ISFP: { INFP:5, ENFP:5, INFJ:5, ENFJ:40, INTJ:20, ENTJ:20, INTP:20, ENTP:20, ISFP:15, ESFP:15, ISTP:15, ESTP:15, ISFJ:20, ESFJ:40, ISTJ:20, ESTJ:40 },
  ESFP: { INFP:5, ENFP:5, INFJ:5, ENFJ:5, INTJ:20, ENTJ:20, INTP:20, ENTP:20, ISFP:15, ESFP:15, ISTP:15, ESTP:15, ISFJ:40, ESFJ:20, ISTJ:40, ESTJ:20 },
  ISTP: { INFP:5, ENFP:5, INFJ:5, ENFJ:5, INTJ:20, ENTJ:20, INTP:20, ENTP:20, ISFP:15, ESFP:15, ISTP:15, ESTP:15, ISFJ:20, ESFJ:40, ISTJ:20, ESTJ:40 },
  ESTP: { INFP:5, ENFP:5, INFJ:5, ENFJ:5, INTJ:20, ENTJ:20, INTP:20, ENTP:20, ISFP:15, ESFP:15, ISTP:15, ESTP:15, ISFJ:40, ESFJ:20, ISTJ:40, ESTJ:20 },
  ISFJ: { INFP:5, ENFP:5, INFJ:5, ENFJ:5, INTJ:15, ENTJ:20, INTP:15, ENTP:15, ISFP:20, ESFP:40, ISTP:20, ESTP:40, ISFJ:30, ESFJ:30, ISTJ:30, ESTJ:30 },
  ESFJ: { INFP:5, ENFP:5, INFJ:5, ENFJ:5, INTJ:15, ENTJ:20, INTP:15, ENTP:15, ISFP:40, ESFP:20, ISTP:40, ESTP:20, ISFJ:30, ESFJ:30, ISTJ:30, ESTJ:30 },
  ISTJ: { INFP:5, ENFP:5, INFJ:5, ENFJ:5, INTJ:15, ENTJ:20, INTP:15, ENTP:15, ISFP:20, ESFP:40, ISTP:20, ESTP:40, ISFJ:30, ESFJ:30, ISTJ:30, ESTJ:30 },
  ESTJ: { INFP:5, ENFP:5, INFJ:5, ENFJ:5, INTJ:15, ENTJ:20, INTP:40, ENTP:15, ISFP:40, ESFP:20, ISTP:40, ESTP:20, ISFJ:30, ESFJ:30, ISTJ:30, ESTJ:30 }
};

function mbtiScore(a, b) {
  a = String(a || "").toUpperCase();
  b = String(b || "").toUpperCase();
  if (MBTI_SCORES[a] && MBTI_SCORES[a][b] !== undefined) return MBTI_SCORES[a][b];
  if (MBTI_SCORES[b] && MBTI_SCORES[b][a] !== undefined) return MBTI_SCORES[b][a];
  return 10;
}
function getHobbiesScore(aHobbies, bHobbies) {
  const setA = new Set(aHobbies || []);
  theCommon = (bHobbies || []).filter(h => setA.has(h));
  const common = theCommon; // rename safety
  if (common.length >= 2) return 20;
  if (common.length === 1) return 10;
  return 0;
}
function getRegionScore(aRegion, bRegion) {
  if (!aRegion || !bRegion) return 5;
  if (aRegion === bRegion) return 20;
  const aTop = aRegion.split(" ")[0], bTop = bRegion.split(" ")[0];
  if (aTop && bTop && aTop === bTop) return 15;
  return 5;
}
function getAgeScore(aAge, bAge) {
  const d = Math.abs((aAge ?? 0) - (bAge ?? 0));
  if (d <= 2) return 15;
  if (d <= 3) return 10;
  if (d <= 6) return 5;
  return 0;
}
function getCollegeScore(aCollege, bCollege) {
  if (!aCollege || !bCollege) return 0;
  return aCollege === bCollege ? 0 : 5;
}
function computeTotal(seeker, candidate) {
  const mbtiRaw   = mbtiScore(seeker.mbti, candidate.mbti);
  const hobbyRaw  = getHobbiesScore(seeker.hobbies, candidate.hobbies);
  const regionRaw = getRegionScore(seeker.region, candidate.region);
  const ageRaw    = getAgeScore(seeker.age, candidate.age);
  const collegeRaw= getCollegeScore(seeker.college, candidate.college);
  return Math.round(mbtiRaw + hobbyRaw + regionRaw + ageRaw + collegeRaw);
}
function getTopMatches(seeker, pool, topK = 3) {
  // ✅ 후보 만들기 전, 만료된 matched 복구
  cooldownSweep();

  return pool
    .filter(p => p.id !== seeker.id && p.status !== "matched")
    .map(c => ({
      id: c.id,
      nickName: c.nickName,
      bio: c.bio,
      myComment: c.myComment,
      total: computeTotal(seeker, c),
      name: c.name,
      college: c.college,
      age: c.age,
      mbti: c.mbti,
      hobbies: c.hobbies,
      region: c.region,
      phone: c.phone,
      ig: c.ig
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, topK);
}
