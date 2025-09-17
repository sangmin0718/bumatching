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
    ig: p.ig ?? ""
  };
}
function addParticipant(p) {
  const list = loadAll();
  const n = normalize(p);
  n.id = nextId(list);
  list.push(n);
  saveAll(list);
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
  const common = (bHobbies || []).filter(h => setA.has(h));
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
