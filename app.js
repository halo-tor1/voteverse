/*
 * VoteVerse
 * A framework-free client for Supabase.
 *
 * The publishable Supabase key is safe to use in a browser when Row Level
 * Security is enabled. Paste schema.sql into the Supabase SQL editor before
 * using database-backed actions.
 */
const SUPABASE_URL = "https://fkowymadydhckaqsaxdi.supabase.co";
const SUPABASE_KEY = "sb_publishable_itesUAJ1NMYBXVuSCjXUjQ__OtmQUkT";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const state = {
  user: null, profile: null, elections: [], posts: [], homeCategory: "all",
  election: null, positions: [], ballot: {}, positionIndex: 0, voterName: "",
  resultElection: null
};

const $ = (id) => document.getElementById(id);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[char]));
const categoryName = (value) => ({ political: "politics", politics: "politics", school: "school", student: "school", organization: "others", custom: "others", others: "others" }[value] || "others");
const categoryLabel = (value) => ({ school: "Schools", politics: "Politics", others: "Others" }[categoryName(value)] || "Others");
const iconFor = (value) => ({ school: "⌂", political: "◈", politics: "◈", student: "✦", organization: "◎", custom: "◌", others: "◌" }[value] || "◌");

document.addEventListener("DOMContentLoaded", init);

async function init() {
  renderHome();
  const { data } = await db.auth.getSession();
  if (data.session) {
    state.user = data.session.user;
    await loadProfile();
  }
  db.auth.onAuthStateChange(async (_event, session) => {
    state.user = session?.user || null;
    if (state.user) await loadProfile();
  });
}

async function loadProfile() {
  const { data } = await db.from("profiles").select("*").eq("id", state.user.id).maybeSingle();
  state.profile = data;
}

async function showHome() {
  window.location.hash = "";
  document.body.innerHTML = `<div class="site-shell">
    <header class="topbar"><a class="brand" href="#" onclick="showHome();return false;"><span class="brand-mark">✓</span><span>Vote<span class="brand-accent">Verse</span></span></a>
      <nav class="main-nav"><a href="#discover">Discover</a><a href="#how-it-works">How it works</a><a href="#about">About</a></nav>
      <button class="button button-small button-dark" onclick="openAuth('admin')">Admin access <span>↗</span></button></header>
    <main id="app">
      <section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="live-dot"></span> Open, simple, and transparent</div><h1>Your voice.<br><em>Your <span>choice.</span></em></h1><p class="hero-lede">A calmer way to participate in the decisions that shape your school, community, and future.</p><div class="hero-actions"><button class="button button-primary" onclick="openAuth('voter')">Find an election <span>→</span></button><button class="text-button" onclick="document.querySelector('#how-it-works').scrollIntoView({behavior:'smooth'})">See how it works <span>↓</span></button></div><div class="hero-proof"><div class="avatar-stack"><i>J</i><i>M</i><i>A</i><i class="more">+</i></div><span>Join voters making their<br><strong>voice count.</strong></span></div></div>
      <div class="hero-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="paper-card"><span class="paper-kicker">CURRENT POLL</span><span class="paper-title">Who should lead<br>the student council?</span><div class="paper-choice selected"><span class="choice-dot"></span><b>Amara Okafor</b><strong>54%</strong></div><div class="paper-choice"><span class="choice-dot"></span><b>David Mensah</b><strong>31%</strong></div><div class="paper-choice"><span class="choice-dot"></span><b>Fatima Bello</b><strong>15%</strong></div><div class="paper-footer"><span>2,481 votes</span><span class="mini-check">✓</span></div></div><div class="floating-note note-top">ONE PERSON<br><strong>ONE VOTE</strong></div><div class="floating-note note-bottom">Make it<br><strong>count.</strong> <span>↗</span></div></div></section>
      <section class="ticker"><span>BUILT FOR REAL DECISIONS</span><i></i><span>PRIVATE BY DESIGN</span><i></i><span>ONE CLEAR CHOICE</span><i></i><span>RESULTS YOU CAN TRUST</span></section>
      <section class="discover section-wrap" id="discover"><div class="section-heading"><div><span class="section-number">01 / DISCOVER</span><h2>What matters<br><em>to you?</em></h2></div><p>Explore active elections and conversations from your community. Choose a category to find your next ballot.</p></div><div class="category-tabs"><button class="category-tab active" data-category="all" onclick="filterHome('all',this)">All topics</button><button class="category-tab" data-category="school" onclick="filterHome('school',this)">Schools</button><button class="category-tab" data-category="politics" onclick="filterHome('politics',this)">Politics</button><button class="category-tab" data-category="others" onclick="filterHome('others',this)">Others</button></div><div id="homeContent" class="discover-grid"><div class="loading-card">Loading elections and suggested posts…</div></div></section>
      <section class="how section-wrap" id="how-it-works"><div class="section-heading compact"><div><span class="section-number">02 / HOW IT WORKS</span><h2>Just three<br><em>simple steps.</em></h2></div></div><div class="steps-grid"><article class="step"><span>01</span><div class="step-icon">⌕</div><h3>Find your election</h3><p>Use the access code shared by your organizer to find the right ballot.</p></article><article class="step"><span>02</span><div class="step-icon">✦</div><h3>Make your choices</h3><p>Review every candidate and submit one clear, considered ballot.</p></article><article class="step"><span>03</span><div class="step-icon">✓</div><h3>See your impact</h3><p>Once the election closes, results are ready to be shared transparently.</p></article></div></section>
      <section class="about-strip section-wrap" id="about"><div><span class="section-number">03 / OUR PROMISE</span><h2>Every decision<br>deserves a <em>voice.</em></h2></div><p>VoteVerse gives organizers the tools to run focused elections and gives voters a clear, respectful way to participate. No noise. No confusion. Just your choice.</p></section>
    </main><footer><a class="brand" href="#"><span class="brand-mark">✓</span><span>Vote<span class="brand-accent">Verse</span></span></a><span>Built for better decisions.</span><span>© 2026 VoteVerse</span></footer></div>
    <div id="authModal" class="modal hidden" role="dialog" aria-modal="true"><div class="modal-backdrop" onclick="closeAuth()"></div><div class="modal-card auth-card"><button class="modal-close" onclick="closeAuth()">×</button><div class="modal-kicker">WELCOME TO VOTEVERSE</div><h2 id="authTitle">Make a difference.</h2><p id="authSubtitle">Sign in as an administrator to create an election.</p><div class="auth-switch"><button id="adminTab" class="active" onclick="setAuthMode('admin')">Admin</button><button id="voterTab" onclick="setAuthMode('voter')">Voter</button></div><div id="adminAuth"><label>Email address<input id="authEmail" type="email" autocomplete="email" placeholder="you@example.com"></label><label>Password<input id="authPassword" type="password" autocomplete="current-password" placeholder="At least 6 characters"></label><button class="button button-primary full" onclick="adminSignIn()">Sign in <span>→</span></button><p class="form-note">New organizer? <button class="inline-button" onclick="adminSignUp()">Create an admin account</button></p></div><div id="voterAuth" class="hidden"><label>Election access code<input id="accessCode" class="code-input" type="text" maxlength="12" placeholder="e.g. VOTE2026" oninput="this.value=this.value.toUpperCase()"></label><p class="form-note">Ask your election organizer for the unique code.</p><button class="button button-primary full" onclick="findElection()">Continue to ballot <span>→</span></button></div><div id="authMessage" class="inline-message hidden"></div></div></div><div id="toast" class="toast"></div>`;
  await loadHomeData();
}

async function renderHome() {
  if (!$("homeContent")) return;
  await loadHomeData();
}

async function loadHomeData() {
  const [electionResponse, postResponse] = await Promise.all([
    db.from("elections").select("id,title,description,election_type,voting_code,status,starts_at,ends_at").eq("status","active").order("created_at",{ascending:false}).limit(30),
    db.from("posts").select("id,title,body,category,created_at").eq("published",true).order("created_at",{ascending:false}).limit(20)
  ]);
  state.elections = electionResponse.data || [];
  state.posts = postResponse.data || [];
  renderHomeCards();
}

function filterHome(category, button) {
  state.homeCategory = category;
  document.querySelectorAll(".category-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
  renderHomeCards();
}

function renderHomeCards() {
  const container = $("homeContent");
  if (!container) return;
  const elections = state.elections.filter((item) => state.homeCategory === "all" || categoryName(item.election_type) === state.homeCategory);
  const posts = state.posts.filter((item) => state.homeCategory === "all" || categoryName(item.category) === state.homeCategory);
  const electionCards = elections.map((item) => `<article class="election-tile"><span class="tile-tag">${esc(categoryLabel(item.election_type))} · Active election</span><h3 class="tile-title">${esc(item.title)}</h3><p class="tile-description">${esc(item.description || "Make your voice heard in this community election.")}</p><div class="tile-bottom"><span>Access code <strong>${esc(item.voting_code)}</strong></span><button class="tile-action" onclick="openElectionById('${esc(item.id)}')">Vote →</button></div></article>`).join("");
  const postCards = posts.map((item) => `<article class="post-tile"><span class="tile-tag">Suggested post · ${esc(categoryLabel(item.category))}</span><h3 class="tile-title">${esc(item.title)}</h3><p class="tile-description">${esc(item.body || "A conversation worth showing up for.")}</p><div class="tile-bottom"><span>Community conversation</span><span>↗</span></div></article>`).join("");
  container.innerHTML = electionCards + postCards || `<div class="empty-card">No active elections or posts in this category yet.<br><button class="text-button" style="margin-top:15px" onclick="openAuth('voter')">Have an access code? Enter it here →</button></div>`;
}

function openAuth(mode = "admin") {
  if (!$("authModal")) { showHome(); setTimeout(() => openAuth(mode), 0); return; }
  $("authModal").classList.remove("hidden");
  setAuthMode(mode);
}
function closeAuth() { $("authModal")?.classList.add("hidden"); }
function setAuthMode(mode) {
  const admin = mode === "admin";
  $("adminTab")?.classList.toggle("active", admin); $("voterTab")?.classList.toggle("active", !admin);
  $("adminAuth")?.classList.toggle("hidden", !admin); $("voterAuth")?.classList.toggle("hidden", admin);
  if ($("authTitle")) $("authTitle").textContent = admin ? "Make a difference." : "Your ballot is waiting.";
  if ($("authSubtitle")) $("authSubtitle").textContent = admin ? "Sign in as an administrator to create an election." : "Enter the access code shared by your election organizer.";
  $("authMessage")?.classList.add("hidden");
}
function setAuthMessage(message, good = false) {
  const box = $("authMessage"); if (!box) return;
  box.textContent = message; box.classList.remove("hidden"); box.style.background = good ? "#eaf4df" : ""; box.style.color = good ? "#35614d" : "";
}
async function adminSignIn() {
  const email = $("authEmail")?.value.trim(), password = $("authPassword")?.value;
  if (!email || !password) return setAuthMessage("Enter your email and password.");
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) return setAuthMessage(error.message);
  state.user = data.user; await loadProfile();
  if (state.profile?.role !== "admin") {
    const { error: claimError } = await db.rpc("claim_first_admin");
    if (claimError && claimError.code === "42883") {
      return setAuthMessage("Supabase setup is incomplete. Run schema.sql in your Supabase SQL Editor, then sign in again.");
    }
    await loadProfile();
  }
  if (state.profile?.role !== "admin") return setAuthMessage("This account is a voter. Only the first account in this Supabase project can become the admin.");
  closeAuth(); renderAdminDashboard();
}
async function adminSignUp() {
  const email = $("authEmail")?.value.trim(), password = $("authPassword")?.value;
  if (!email || !password || password.length < 6) return setAuthMessage("Use a valid email and a password of at least 6 characters.");
  const { error } = await db.auth.signUp({ email, password, options: { data: { full_name: "Election organizer" }, emailRedirectTo: window.location.href } });
  if (error) return setAuthMessage(error.message);
  setAuthMessage("Account created in Supabase. Confirm your email, then sign in. After schema.sql is applied, the first account becomes admin automatically.", true);
}
async function signOut() { await db.auth.signOut(); state.user = null; state.profile = null; showHome(); }

async function openElectionById(id) {
  const election = state.elections.find((item) => item.id === id);
  if (election) return startVoterFlow(election);
  const { data, error } = await db.from("elections").select("*").eq("id", id).eq("status","active").maybeSingle();
  if (error || !data) return toast("This election is no longer active.");
  startVoterFlow(data);
}
async function findElection() {
  const code = $("accessCode")?.value.trim().toUpperCase();
  if (!code) return setAuthMessage("Enter the election access code.");
  const { data, error } = await db.from("elections").select("*").eq("voting_code", code).eq("status","active").maybeSingle();
  if (error) return setAuthMessage(error.message.includes("relation") ? "Run schema.sql in Supabase first, then try again." : "Could not find that election.");
  if (!data) return setAuthMessage("No active election was found with that code.");
  closeAuth(); startVoterFlow(data);
}
async function startVoterFlow(election) {
  state.election = election; state.voterName = ""; state.ballot = {}; state.positionIndex = 0;
  const { data, error } = await db.from("positions").select("id,title,display_order,candidates(id,name,description,display_order)").eq("election_id", election.id).order("display_order");
  if (error) return toast("Could not load this ballot. Check the Supabase schema.");
  state.positions = (data || []).sort((a,b) => a.display_order - b.display_order);
  if (!state.positions.length) return toast("This election has no positions yet.");
  showVoterVerify();
}
function voterHeader() { return `<header class="ballot-top"><a class="brand" href="#" onclick="showHome();return false;"><span class="brand-mark">✓</span><span>Vote<span class="brand-accent">Verse</span></span></a><span class="section-number">${esc(categoryLabel(state.election.election_type))} / PRIVATE BALLOT</span></header>`; }
function showVoterVerify() {
  document.body.innerHTML = `<div class="ballot-shell">${voterHeader()}<main class="ballot-center"><div class="dashboard-eyebrow">YOU'RE IN THE RIGHT PLACE</div><h1>${esc(state.election.title)}</h1><p class="ballot-subtitle">${esc(state.election.description || "Your vote is private and can only be submitted once.")}</p><div class="verify-card"><h2>Before you begin</h2><p class="tile-description">Add your name or voter reference so your organizer can understand turnout. Your choice is stored separately from this label.</p><label>Voter name or reference<input id="voterName" maxlength="80" placeholder="e.g. Ada N. or Student 042"></label><button class="button button-primary full" onclick="beginBallot()">Continue to ballot <span>→</span></button><p class="form-note">Your browser will remember this election after submission to help prevent a second vote.</p></div></main></div>`;
}
function browserVoterKey() {
  const key = "voteverse-voter-key";
  let value = localStorage.getItem(key);
  if (!value) { value = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`; localStorage.setItem(key,value); }
  return value;
}
function hasVotedLocally() { return localStorage.getItem(`voteverse-voted-${state.election.id}`) === "yes"; }
function beginBallot() {
  const name = $("voterName")?.value.trim();
  if (!name) return toast("Add a voter name or reference to continue.");
  if (hasVotedLocally()) return showAlreadyVoted();
  state.voterName = name; state.positionIndex = 0; showBallotPosition();
}
function showBallotPosition() {
  const position = state.positions[state.positionIndex], total = state.positions.length;
  const candidates = [...(position.candidates || [])].sort((a,b) => a.display_order - b.display_order);
  const selected = state.ballot[position.id];
  document.body.innerHTML = `<div class="ballot-shell">${voterHeader()}<main class="ballot-center"><div class="ballot-progress"><div style="width:${((state.positionIndex+1)/total)*100}%"></div></div><div class="ballot-card"><div class="dashboard-eyebrow">POSITION ${String(state.positionIndex+1).padStart(2,"0")} OF ${String(total).padStart(2,"0")}</div><h2>${esc(position.title)}</h2><p class="ballot-subtitle">Select one candidate. You can review all choices before submitting.</p><div class="choice-list">${candidates.map((candidate) => `<button class="choice-button ${selected === candidate.id ? "selected" : ""}" onclick="selectCandidate('${esc(candidate.id)}')"><span class="radio">${selected === candidate.id ? "✓" : ""}</span><b>${esc(candidate.name)}</b>${candidate.description ? `<span>${esc(candidate.description)}</span>` : ""}</button>`).join("")}</div><div class="ballot-actions">${state.positionIndex ? `<button class="ghost-button" onclick="previousPosition()">← Back</button>` : "<span></span>"}<button class="button button-primary" onclick="nextPosition()">${state.positionIndex === total-1 ? "Review ballot" : "Next position →"}</button></div></div></main></div>`;
}
function selectCandidate(id) { state.ballot[state.positions[state.positionIndex].id] = id; showBallotPosition(); }
function nextPosition() {
  if (!state.ballot[state.positions[state.positionIndex].id]) return toast("Choose one candidate to continue.");
  if (state.positionIndex === state.positions.length - 1) return showBallotReview();
  state.positionIndex++; showBallotPosition();
}
function previousPosition() { if (state.positionIndex > 0) state.positionIndex--; showBallotPosition(); }
function showBallotReview() {
  const rows = state.positions.map((position) => { const candidate = (position.candidates || []).find((item) => item.id === state.ballot[position.id]); return `<div class="review-row"><span>${esc(position.title)}</span><b>${esc(candidate?.name || "No selection")}</b></div>`; }).join("");
  document.body.innerHTML = `<div class="ballot-shell">${voterHeader()}<main class="ballot-center"><div class="dashboard-eyebrow">FINAL REVIEW</div><h1>Ready to make<br><em>your mark?</em></h1><p class="ballot-subtitle">Check your choices once before submitting. A submitted ballot cannot be changed.</p><div class="ballot-card">${rows}<div class="ballot-actions"><button class="ghost-button" onclick="state.positionIndex=0;showBallotPosition()">← Edit choices</button><button class="button button-primary" onclick="submitBallot()">Submit my ballot <span>✓</span></button></div></div></main></div>`;
}
async function submitBallot() {
  if (hasVotedLocally()) return showAlreadyVoted();
  const selections = state.positions.map((position) => ({ position_id: position.id, candidate_id: state.ballot[position.id] }));
  const { error } = await db.rpc("submit_ballot", { p_election_id: state.election.id, p_voter_key: browserVoterKey(), p_voter_name: state.voterName, p_selections: selections });
  if (error) {
    if (error.code === "23505" || error.message.toLowerCase().includes("already voted")) return showAlreadyVoted();
    return toast(error.message.includes("function") ? "Paste schema.sql into Supabase to enable secure ballot submission." : error.message);
  }
  localStorage.setItem(`voteverse-voted-${state.election.id}`, "yes");
  showVoteSuccess();
}
function showVoteSuccess() {
  document.body.innerHTML = `<div class="success-page"><div class="success-card"><div class="success-icon">✓</div><div class="dashboard-eyebrow">BALLOT RECEIVED</div><h1>Thank you for<br><em>showing up.</em></h1><p>Your vote was submitted securely. You can close this page now.</p><button class="button button-primary" style="margin-top:25px" onclick="showHome()">Back to VoteVerse <span>→</span></button></div></div>`;
}
function showAlreadyVoted() {
  document.body.innerHTML = `<div class="success-page"><div class="success-card"><div class="success-icon">✓</div><div class="dashboard-eyebrow">ALREADY SUBMITTED</div><h1>Your voice<br>is already <em>counted.</em></h1><p>Our one-vote guard found a ballot for this election from this voter key. Thank you for participating.</p><button class="button button-primary" style="margin-top:25px" onclick="showHome()">Back to VoteVerse <span>→</span></button></div></div>`;
}

async function renderAdminDashboard() {
  const { data, error } = await db.from("elections").select("*").eq("admin_id", state.user.id).order("created_at",{ascending:false});
  if (error) return toast(error.message);
  state.elections = data || [];
  const active = state.elections.filter((e) => e.status === "active").length;
  document.body.innerHTML = `<div class="dashboard-shell">${adminSidebar("dashboard")}<main class="dash-main"><header class="dash-top"><div><div class="dashboard-eyebrow">ADMIN WORKSPACE</div><h1>Good to see you.</h1><p>Everything you need to run a thoughtful election.</p></div><button class="button button-primary" onclick="showCreateElection()">＋ New election</button></header><section class="stats"><div class="stat"><span class="stat-icon">◈</span><small>Total elections</small><strong>${state.elections.length}</strong></div><div class="stat"><span class="stat-icon">●</span><small>Active now</small><strong>${active}</strong></div><div class="stat"><span class="stat-icon">◎</span><small>Published codes</small><strong>${state.elections.filter((e)=>e.voting_code).length}</strong></div><div class="stat"><span class="stat-icon">↗</span><small>Workspace</small><strong>Live</strong></div></section><div class="dash-section-head"><div><h2>Your elections</h2><p>Create, publish, and track each ballot from here.</p></div><button class="ghost-button" onclick="renderAdminDashboard()">Refresh ↻</button></div><div class="election-list">${state.elections.length ? state.elections.map(adminElectionCard).join("") : `<div class="empty-state"><div style="font-size:28px">◌</div><h3>No elections yet</h3><p>Create your first ballot and share its access code.</p><button class="button button-primary" onclick="showCreateElection()">Create an election →</button></div>`}</div></main></div>`;
}
function adminSidebar(active) {
  return `<aside class="sidebar"><a class="brand" href="#" onclick="renderAdminDashboard();return false;"><span class="brand-mark">✓</span><span>Vote<span class="brand-accent">Verse</span></span></a><div class="side-label">WORKSPACE</div><button class="side-link ${active==="dashboard"?"active":""}" onclick="renderAdminDashboard()">▦ &nbsp; Dashboard</button><button class="side-link ${active==="create"?"active":""}" onclick="showCreateElection()">＋ &nbsp; New election</button><button class="side-link ${active==="results"?"active":""}" onclick="showResults()">◈ &nbsp; Results</button><div class="side-spacer"></div><button class="side-link" onclick="signOut()">↪ &nbsp; Sign out</button></aside>`;
}
function adminElectionCard(election) {
  return `<article class="admin-election"><div class="admin-election-icon">${iconFor(election.election_type)}</div><div class="admin-election-info"><h3>${esc(election.title)}</h3><p>${esc(election.description || "No description")}</p><div class="meta-row"><span>${esc(categoryLabel(election.election_type))}</span><span>Code: <b>${esc(election.voting_code)}</b></span></div></div><span class="status-pill ${election.status}">${esc(election.status)}</span><button class="ghost-button" onclick="manageElection('${esc(election.id)}')">Manage →</button></article>`;
}
function showCreateElection() {
  document.body.innerHTML = `<div class="dashboard-shell">${adminSidebar("create")}<main class="dash-main"><button class="ghost-button" onclick="renderAdminDashboard()">← Dashboard</button><header class="dash-top" style="margin-top:30px"><div><div class="dashboard-eyebrow">NEW ELECTION</div><h1>Create a ballot.</h1><p>Set the question, choose a topic, then add candidates.</p></div></header><div class="form-layout"><section class="form-panel"><h2>Election details</h2><p>Voters will see this information before they start.</p><div class="form-grid"><div class="wide"><label class="field-label">Election title<input id="newTitle" placeholder="e.g. Student Council Election 2026"></label></div><div class="wide"><label class="field-label">Description<textarea id="newDescription" rows="4" placeholder="What is this election about?"></textarea></label></div><div class="wide"><label class="field-label">Topic</label><div class="type-picker"><button class="selected" data-type="school" onclick="pickType('school',this)">⌂<b>Schools</b></button><button data-type="politics" onclick="pickType('politics',this)">◈<b>Politics</b></button><button data-type="others" onclick="pickType('others',this)">◌<b>Others</b></button></div><input type="hidden" id="newType" value="school"></div><label class="field-label">Opens<input id="newStarts" type="datetime-local"></label><label class="field-label">Closes<input id="newEnds" type="datetime-local"></label></div><div class="form-actions"><button class="ghost-button" onclick="renderAdminDashboard()">Cancel</button><button class="button button-primary" onclick="createElection()">Create and add candidates <span>→</span></button></div></section><aside class="preview-box"><small>QUICK NOTE</small><h3>Make the choice clear.</h3><p>A focused title and short description help voters understand exactly what they are deciding.</p></aside></div></main></div>`;
}
function pickType(type, button) { document.querySelectorAll(".type-picker button").forEach((item)=>item.classList.remove("selected")); button.classList.add("selected"); $("newType").value = type; }
function generateCode() { const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; return Array.from({length:8},()=>chars[Math.floor(Math.random()*chars.length)]).join(""); }
async function createElection() {
  const title = $("newTitle")?.value.trim(), description = $("newDescription")?.value.trim(), type = $("newType")?.value, starts = $("newStarts")?.value, ends = $("newEnds")?.value;
  if (!title || !starts || !ends) return toast("Add a title, opening time, and closing time.");
  if (new Date(ends) <= new Date(starts)) return toast("The closing time must be after the opening time.");
  const { data, error } = await db.from("elections").insert({ admin_id: state.user.id, title, description, election_type: type, voting_code: generateCode(), status: "draft", starts_at: new Date(starts).toISOString(), ends_at: new Date(ends).toISOString() }).select().single();
  if (error) return toast(error.message);
  state.election = data; showBuilder(data);
}
async function manageElection(id) {
  const { data, error } = await db.from("elections").select("*").eq("id",id).single();
  if (error) return toast(error.message);
  state.election = data; showBuilder(data);
}
async function showBuilder(election) {
  const { data } = await db.from("positions").select("id,title,display_order,candidates(id,name,display_order)").eq("election_id",election.id).order("display_order");
  const positions = data || [];
  document.body.innerHTML = `<div class="dashboard-shell">${adminSidebar()}<main class="dash-main"><button class="ghost-button" onclick="renderAdminDashboard()">← Dashboard</button><header class="dash-top" style="margin-top:30px"><div><div class="dashboard-eyebrow">ELECTION BUILDER</div><h1>${esc(election.title)}</h1><p>Add at least one position and candidate before publishing.</p></div><span class="status-pill ${election.status}">${esc(election.status)}</span></header><div class="builder-grid"><div id="builderPositions">${positions.map(positionCard).join("")}</div><aside class="builder-side"><div class="builder-card"><h2>Share access</h2><p>Give this code to eligible voters.</p><div class="code-box"><small>ELECTION CODE</small><strong>${esc(election.voting_code)}</strong></div></div><div class="builder-card"><h2>Ready to publish?</h2><p>Publishing makes this ballot visible to voters in the selected category.</p><button class="button button-primary full" onclick="publishElection()">Publish election →</button></div></aside></div><button class="button button-dark" style="margin-top:15px" onclick="addPositionCard()">＋ Add position</button></main></div>`;
  if (!positions.length) addPositionCard();
}
function positionCard(position = {}) {
  const candidates = position.candidates || [{name:""}];
  return `<article class="position-card"><div class="position-head"><div><h3>What are voters choosing?</h3><p>One position, one clear choice.</p></div><button class="remove-link" onclick="this.closest('.position-card').remove()">Remove</button></div><label class="field-label">Position name<input class="position-title" value="${esc(position.title || "")}" placeholder="e.g. President"></label><label class="field-label">Candidates</label><div class="candidate-list">${candidates.map((candidate)=>`<div class="candidate-row"><input class="candidate-name" value="${esc(candidate.name || "")}" placeholder="Candidate name"><button class="remove-small" onclick="this.parentElement.remove()">×</button></div>`).join("")}</div><button class="add-link" onclick="addCandidateRow(this)">＋ Add candidate</button></article>`;
}
function addPositionCard() { $("builderPositions")?.insertAdjacentHTML("beforeend",positionCard()); }
function addCandidateRow(button) { button.previousElementSibling.insertAdjacentHTML("beforeend",`<div class="candidate-row"><input class="candidate-name" placeholder="Candidate name"><button class="remove-small" onclick="this.parentElement.remove()">×</button></div>`); }
async function publishElection() {
  const cards = [...document.querySelectorAll(".position-card")];
  if (!cards.length) return toast("Add at least one position.");
  for (let index=0; index<cards.length; index++) {
    const card = cards[index], title = card.querySelector(".position-title")?.value.trim(), names = [...card.querySelectorAll(".candidate-name")].map((input)=>input.value.trim()).filter(Boolean);
    if (!title || !names.length) return toast("Every position needs a name and at least one candidate.");
    const { data: position, error } = await db.from("positions").insert({ election_id: state.election.id, title, display_order:index }).select().single();
    if (error) return toast(error.message);
    const { error: candidateError } = await db.from("candidates").insert(names.map((name, candidateIndex)=>({ position_id:position.id, name, display_order:candidateIndex })));
    if (candidateError) return toast(candidateError.message);
  }
  const { error } = await db.from("elections").update({status:"active"}).eq("id",state.election.id);
  if (error) return toast(error.message);
  state.election.status = "active"; showPublished();
}
function showPublished() {
  document.body.innerHTML = `<div class="success-page"><div class="success-card"><div class="success-icon">✓</div><div class="dashboard-eyebrow">ELECTION LIVE</div><h1>Your ballot<br>is <em>live.</em></h1><p>Share this access code with eligible voters.</p><div class="code-box" style="margin:25px auto;max-width:250px"><small>ELECTION CODE</small><strong>${esc(state.election.voting_code)}</strong></div><button class="button button-primary" onclick="renderAdminDashboard()">Back to dashboard <span>→</span></button></div></div>`;
}
async function showResults() {
  const elections = state.elections?.length ? state.elections : (await db.from("elections").select("*").eq("admin_id",state.user.id)).data || [];
  document.body.innerHTML = `<div class="dashboard-shell">${adminSidebar("results")}<main class="dash-main"><header class="dash-top"><div><div class="dashboard-eyebrow">RESULTS</div><h1>Read the room.</h1><p>Select an election to see its current count.</p></div></header><div class="election-list">${elections.length ? elections.map((item)=>`<article class="admin-election"><div class="admin-election-icon">${iconFor(item.election_type)}</div><div class="admin-election-info"><h3>${esc(item.title)}</h3><p>${esc(item.status)}</p></div><button class="button button-primary" onclick="loadResults('${esc(item.id)}')">View results →</button></article>`).join("") : `<div class="empty-state">Create an election before viewing results.</div>`}</div></main></div>`;
}
async function loadResults(id) {
  const { data: election, error } = await db.from("elections").select("*").eq("id",id).single();
  if (error) return toast(error.message);
  const { data: positions, error: positionError } = await db.from("positions").select("id,title,candidates(id,name)").eq("election_id",id).order("display_order");
  const { data: votes, error: votesError } = await db.from("vote_selections").select("candidate_id").eq("election_id",id);
  if (positionError || votesError) return toast("Could not load results. Check the results policy in schema.sql.");
  const counts = {}; (votes || []).forEach((vote)=>{ counts[vote.candidate_id] = (counts[vote.candidate_id] || 0) + 1; });
  const total = (votes || []).length;
  document.body.innerHTML = `<div class="dashboard-shell">${adminSidebar("results")}<main class="dash-main"><button class="ghost-button" onclick="showResults()">← All results</button><header class="dash-top" style="margin-top:30px"><div><div class="dashboard-eyebrow">RESULTS / ${esc(categoryLabel(election.election_type))}</div><h1>${esc(election.title)}</h1><p>${total} ballot${total===1?"":"s"} counted so far.</p></div></header><div class="result-grid">${(positions || []).map((position)=>`<article class="result-card"><h3>${esc(position.title)}</h3>${(position.candidates || []).map((candidate)=>{const count=counts[candidate.id]||0;const percent=total?Math.round((count/total)*100):0;return `<div class="result-bar"><div class="result-bar-head"><b>${esc(candidate.name)}</b><span>${count} · ${percent}%</span></div><div class="bar-track"><i style="width:${percent}%"></i></div></div>`;}).join("")}</article>`).join("") || `<div class="empty-state">No positions found.</div>`}</div></main></div>`;
}
function toast(message) { const element = $("toast"); if (!element) return window.alert(message); element.textContent = message; element.classList.add("show"); clearTimeout(window.__voteToast); window.__voteToast = setTimeout(()=>element.classList.remove("show"),4200); }