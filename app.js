// ============================================================
// VOTEVERSE
// Complete application JavaScript
// ============================================================


// ============================================================
// SUPABASE CONFIGURATION
// ============================================================

const SUPABASE_URL =
  "https://fkowymadydhckaqsaxdi.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_itesUAJ1NMYBXVuSCjXUjQ__OtmQUkT";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ============================================================
// GLOBAL STATE
// ============================================================

let currentUser = null;

let currentProfile = null;

let currentElection = null;

let currentVoter = null;

let currentBallot = {};

let currentPositionIndex = 0;

let editingElection = null;


// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await checkExistingSession();

  }
);


// ============================================================
// SESSION
// ============================================================

async function checkExistingSession() {

  const {
    data: {
      session
    }
  } =
    await supabaseClient.auth.getSession();


  if (!session) {

    return;

  }


  currentUser = session.user;


  const {
    data: profile
  } =
    await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();


  if (profile) {

    currentProfile = profile;

  }

}


// ============================================================
// BASIC UI
// ============================================================

function showAuth() {

  document
    .getElementById("authModal")
    ?.classList
    .remove("hidden");

}


function closeModal() {

  document
    .getElementById("authModal")
    ?.classList
    .add("hidden");

}


function closeLogin() {

  document
    .getElementById("loginModal")
    ?.classList
    .add("hidden");

}


function openAdminLogin() {

  closeModal();


  document
    .getElementById("adminLogin")
    ?.classList
    .remove("hidden");


  document
    .getElementById("voterLogin")
    ?.classList
    .add("hidden");


  document
    .getElementById("loginTitle")
    .textContent =
      "Admin Login";


  document
    .getElementById("loginSubtitle")
    .textContent =
      "Sign in to manage your elections.";


  document
    .getElementById("loginModal")
    ?.classList
    .remove("hidden");

}


function openVoterLogin() {

  closeModal();


  document
    .getElementById("adminLogin")
    ?.classList
    .add("hidden");


  document
    .getElementById("voterLogin")
    ?.classList
    .remove("hidden");


  document
    .getElementById("loginTitle")
    .textContent =
      "Enter Voting Code";


  document
    .getElementById("loginSubtitle")
    .textContent =
      "Enter the code provided by your election organizer.";


  document
    .getElementById("loginModal")
    ?.classList
    .remove("hidden");

}


// ============================================================
// ADMIN SIGNUP
// ============================================================

async function adminSignup() {

  const email =
    document
      .getElementById("email")
      .value
      .trim();


  const password =
    document
      .getElementById("password")
      .value;


  if (!email || !password) {

    alert(
      "Please enter your email and password."
    );

    return;

  }


  if (password.length < 6) {

    alert(
      "Password must be at least 6 characters."
    );

    return;

  }


  const redirectUrl =
    window.location.origin +
    window.location.pathname;


  const {
    data,
    error
  } =
    await supabaseClient.auth.signUp({

      email,

      password,

      options: {

        emailRedirectTo:
          redirectUrl,

        data: {

          full_name:
            "Election Admin"

        }

      }

    });


  if (error) {

    alert(error.message);

    return;

  }


  if (data.user) {

    const {
      error:
        profileError
    } =
      await supabaseClient
        .from("profiles")
        .upsert({

          id:
            data.user.id,

          full_name:
            "Election Admin",

          role:
            "admin"

        });


    if (profileError) {

      console.error(
        profileError
      );

    }

  }


  alert(
    "Account created! Check your email to confirm your account."
  );

}


// ============================================================
// ADMIN LOGIN
// ============================================================

async function adminLogin() {

  const email =
    document
      .getElementById("email")
      .value
      .trim();


  const password =
    document
      .getElementById("password")
      .value;


  if (!email || !password) {

    alert(
      "Enter your email and password."
    );

    return;

  }


  const {
    data,
    error
  } =
    await supabaseClient.auth
      .signInWithPassword({

        email,

        password

      });


  if (error) {

    alert(error.message);

    return;

  }


  currentUser =
    data.user;


  const {
    data:
      profile,
    error:
      profileError
  } =
    await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();


  if (profileError) {

    console.error(
      profileError
    );

    alert(
      "Could not load your profile."
    );

    return;

  }


  if (
    !profile ||
    profile.role !== "admin"
  ) {

    alert(
      "This account does not have administrator access."
    );

    await supabaseClient.auth.signOut();

    return;

  }


  currentProfile =
    profile;


  closeLogin();


  showAdminDashboard();

}


// ============================================================
// ADMIN DASHBOARD
// ============================================================

function showAdminDashboard() {

  document.body.innerHTML = `

    <div class="dashboard">

      <aside class="sidebar">

        <div class="dashboard-logo">

          <div class="logo-icon">
            ✓
          </div>

          <span>
            Vote<span class="gradient-text">
              Verse
            </span>
          </span>

        </div>


        <div class="sidebar-label">
          WORKSPACE
        </div>


        <button
          class="side-link active"
          onclick="showAdminDashboard()"
        >

          <span>▦</span>

          Dashboard

        </button>


        <button
          class="side-link"
          onclick="showCreateElection()"
        >

          <span>＋</span>

          Create Election

        </button>


        <button
          class="side-link"
          onclick="showAdminElections()"
        >

          <span>◉</span>

          Elections

        </button>


        <button
          class="side-link"
          onclick="showResultsPicker()"
        >

          <span>◈</span>

          Results

        </button>


        <div class="sidebar-bottom">

          <button
            class="side-link"
            onclick="adminLogout()"
          >

            <span>↪</span>

            Sign Out

          </button>

        </div>

      </aside>


      <main class="dashboard-main">

        <header class="dashboard-header">

          <div>

            <div class="dashboard-eyebrow">
              ADMIN WORKSPACE
            </div>

            <h1>
              Good evening 👋
            </h1>

            <p>
              Ready to run your next election?
            </p>

          </div>


          <button
            class="primary-button"
            onclick="showCreateElection()"
          >
            ＋ New Election
          </button>

        </header>


        <section class="stats-grid">

          <div class="stat-card">

            <span>◈</span>

            <small>
              Total Elections
            </small>

            <strong
              id="totalElections"
            >
              0
            </strong>

          </div>


          <div class="stat-card">

            <span>●</span>

            <small>
              Active Elections
            </small>

            <strong
              id="activeElections"
            >
              0
            </strong>

          </div>


          <div class="stat-card">

            <span>◎</span>

            <small>
              Total Voters
            </small>

            <strong
              id="totalVoters"
            >
              0
            </strong>

          </div>


          <div class="stat-card">

            <span>↗</span>

            <small>
              Turnout
            </small>

            <strong
              id="totalTurnout"
            >
              0%
            </strong>

          </div>

        </section>


        <section class="elections-section">

          <div class="section-top">

            <div>

              <h2>
                Your Elections
              </h2>

              <p>
                Manage your elections.
              </p>

            </div>


            <button
              class="ghost-button"
              onclick="loadAdminElections()"
            >
              Refresh ↻
            </button>

          </div>


          <div id="electionsList">

            <div class="loading-card">
              Loading your elections...
            </div>

          </div>

        </section>

      </main>

    </div>
  `;


  loadAdminElections();

}


// ============================================================
// LOAD ADMIN ELECTIONS
// ============================================================

async function loadAdminElections() {

  const {
    data: {
      user
    }
  } =
    await supabaseClient.auth
      .getUser();


  if (!user) {

    return;

  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("elections")
      .select("*")
      .eq("admin_id", user.id)
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(error);

    const list =
      document.getElementById(
        "electionsList"
      );


    if (list) {

      list.innerHTML = `
        <div class="loading-card">
          Could not load elections.
        </div>
      `;

    }

    return;

  }


  const total =
    data.length;


  const active =
    data.filter(
      election =>
        election.status ===
        "active"
    ).length;


  const totalElections =
    document.getElementById(
      "totalElections"
    );


  const activeElections =
    document.getElementById(
      "activeElections"
    );


  if (totalElections) {

    totalElections.textContent =
      total;

  }


  if (activeElections) {

    activeElections.textContent =
      active;

  }


  if (!data.length) {

    document.getElementById(
      "electionsList"
    ).innerHTML = `

      <div class="empty-card">

        <div class="empty-icon">
          🗳️
        </div>

        <h3>
          No elections yet
        </h3>

        <p>
          Create your first election
          and start collecting votes.
        </p>

        <button
          class="primary-button"
          onclick="showCreateElection()"
        >
          ＋ Create Election
        </button>

      </div>

    `;

    return;

  }


  document.getElementById(
    "electionsList"
  ).innerHTML =

    data.map(
      election => `

        <div class="election-card">

          <div class="election-symbol">
            ${getElectionIcon(
              election.election_type
            )}
          </div>


          <div class="election-info">

            <h3>
              ${escapeHTML(
                election.title
              )}
            </h3>

            <p>
              ${escapeHTML(
                election.description ||
                "No description"
              )}
            </p>


            <div class="election-meta">

              <span>
                ${escapeHTML(
                  election.election_type
                )}
              </span>

              <span>
                Code:
                <strong>
                  ${escapeHTML(
                    election.voting_code
                  )}
                </strong>
              </span>

            </div>

          </div>


          <div
            class="
              election-status
              ${election.status}
            "
          >
            ${election.status}
          </div>


          <button
            class="manage-button"
            onclick="
              manageElection(
                '${election.id}'
              )
            "
          >
            Manage →
          </button>

        </div>

      `
    ).join("");

}


// ============================================================
// CREATE ELECTION
// ============================================================

function showCreateElection() {

  document.body.innerHTML = `

    <div class="dashboard">

      ${adminSidebar()}


      <main class="dashboard-main">

        <div class="page-back">

          <button
            class="back-button"
            onclick="showAdminDashboard()"
          >
            ← Dashboard
          </button>

        </div>


        <div class="form-header">

          <div>

            <div class="dashboard-eyebrow">
              NEW ELECTION
            </div>

            <h1>
              Create your election
            </h1>

            <p>
              Set up the basics first.
              You can add positions and
              candidates next.
            </p>

          </div>

        </div>


        <div class="create-layout">

          <div class="create-main">

            <div class="form-card">

              <div class="form-section-title">
                <span>01</span>
                Election Details
              </div>


              <label>
                Election name
              </label>

              <input
                id="electionTitle"
                class="form-input"
                placeholder="
                  e.g. Student Council Election 2026
                "
              />


              <label>
                Description
              </label>

              <textarea
                id="electionDescription"
                class="form-input"
                rows="4"
                placeholder="
                  Tell voters what this election is about...
                "
              ></textarea>


              <label>
                Election type
              </label>


              <div class="type-grid">


                <button
                  class="type-card selected"
                  data-type="school"
                  onclick="
                    selectElectionType(
                      'school',
                      this
                    )
                  "
                >

                  <span>🏫</span>

                  <strong>
                    School
                  </strong>

                  <small>
                    School elections
                  </small>

                </button>


                <button
                  class="type-card"
                  data-type="political"
                  onclick="
                    selectElectionType(
                      'political',
                      this
                    )
                  "
                >

                  <span>🏛️</span>

                  <strong>
                    Political
                  </strong>

                  <small>
                    Political elections
                  </small>

                </button>


                <button
                  class="type-card"
                  data-type="student"
                  onclick="
                    selectElectionType(
                      'student',
                      this
                    )
                  "
                >

                  <span>🎓</span>

                  <strong>
                    Student
                  </strong>

                  <small>
                    Student government
                  </small>

                </button>


                <button
                  class="type-card"
                  data-type="organization"
                  onclick="
                    selectElectionType(
                      'organization',
                      this
                    )
                  "
                >

                  <span>🏢</span>

                  <strong>
                    Organization
                  </strong>

                  <small>
                    Clubs & groups
                  </small>

                </button>


                <button
                  class="type-card"
                  data-type="custom"
                  onclick="
                    selectElectionType(
                      'custom',
                      this
                    )
                  "
                >

                  <span>🗳️</span>

                  <strong>
                    Custom
                  </strong>

                  <small>
                    Anything else
                  </small>

                </button>


              </div>


              <input
                type="hidden"
                id="electionType"
                value="school"
              />


              <div class="form-section-title second">
                <span>02</span>
                Schedule
              </div>


              <div class="date-grid">

                <div>

                  <label>
                    Opens
                  </label>

                  <input
                    id="startDate"
                    class="form-input"
                    type="datetime-local"
                  />

                </div>


                <div>

                  <label>
                    Closes
                  </label>

                  <input
                    id="endDate"
                    class="form-input"
                    type="datetime-local"
                  />

                </div>

              </div>


              <div class="form-actions">

                <button
                  class="ghost-button"
                  onclick="
                    showAdminDashboard()
                  "
                >
                  Cancel
                </button>


                <button
                  class="primary-button"
                  onclick="
                    createElection()
                  "
                >
                  Create Election →
                </button>

              </div>

            </div>

          </div>


          <aside class="preview-card">

            <div class="preview-label">
              PREVIEW
            </div>

            <div class="preview-icon">
              🗳️
            </div>

            <h3
              id="previewTitle"
            >
              Your Election
            </h3>

            <p
              id="previewDescription"
            >
              Your election description
              will appear here.
            </p>

            <div class="preview-line"></div>

            <div class="preview-detail">

              <span>
                Type
              </span>

              <strong
                id="previewType"
              >
                School
              </strong>

            </div>

            <div class="preview-detail">

              <span>
                Status
              </span>

              <strong>
                Draft
              </strong>

            </div>

          </aside>

        </div>

      </main>

    </div>
  `;


  const title =
    document.getElementById(
      "electionTitle"
    );


  const description =
    document.getElementById(
      "electionDescription"
    );


  title.addEventListener(
    "input",
    () => {

      document.getElementById(
        "previewTitle"
      ).textContent =
        title.value ||
        "Your Election";

    }
  );


  description.addEventListener(
    "input",
    () => {

      document.getElementById(
        "previewDescription"
      ).textContent =
        description.value ||
        "Your election description will appear here.";

    }
  );

}


// ============================================================
// SIDEBAR
// ============================================================

function adminSidebar() {

  return `

    <aside class="sidebar">

      <div class="dashboard-logo">

        <div class="logo-icon">
          ✓
        </div>

        <span>
          Vote<span class="gradient-text">
            Verse
          </span>
        </span>

      </div>


      <div class="sidebar-label">
        WORKSPACE
      </div>


      <button
        class="side-link"
        onclick="showAdminDashboard()"
      >
        <span>▦</span>
        Dashboard
      </button>


      <button
        class="side-link active"
        onclick="showCreateElection()"
      >
        <span>＋</span>
        Create Election
      </button>


      <button
        class="side-link"
        onclick="showAdminElections()"
      >
        <span>◉</span>
        Elections
      </button>


      <button
        class="side-link"
        onclick="showResultsPicker()"
      >
        <span>◈</span>
        Results
      </button>


      <div class="sidebar-bottom">

        <button
          class="side-link"
          onclick="adminLogout()"
        >
          <span>↪</span>
          Sign Out
        </button>

      </div>

    </aside>

  `;

}


// ============================================================
// ELECTION TYPE
// ============================================================

function selectElectionType(
  type,
  button
) {

  document
    .querySelectorAll(
      ".type-card"
    )
    .forEach(
      card =>
        card.classList.remove(
          "selected"
        )
    );


  button.classList.add(
    "selected"
  );


  document.getElementById(
    "electionType"
  ).value = type;


  const label =
    type.charAt(0).toUpperCase() +
    type.slice(1);


  document.getElementById(
    "previewType"
  ).textContent =
    label;

}


// ============================================================
// CREATE ELECTION DATABASE RECORD
// ============================================================

async function createElection() {

  const title =
    document.getElementById(
      "electionTitle"
    ).value.trim();


  const description =
    document.getElementById(
      "electionDescription"
    ).value.trim();


  const type =
    document.getElementById(
      "electionType"
    ).value;


  const starts =
    document.getElementById(
      "startDate"
    ).value;


  const ends =
    document.getElementById(
      "endDate"
    ).value;


  if (!title) {

    alert(
      "Please enter an election name."
    );

    return;

  }


  if (!starts || !ends) {

    alert(
      "Please choose when the election opens and closes."
    );

    return;

  }


  if (
    new Date(ends) <=
    new Date(starts)
  ) {

    alert(
      "The closing time must be after the opening time."
    );

    return;

  }


  const {
    data: {
      user
    }
  } =
    await supabaseClient.auth
      .getUser();


  if (!user) {

    alert(
      "Your session has expired. Please sign in again."
    );

    return;

  }


  const votingCode =
    generateVotingCode();


  const {
    data,
    error
  } =
    await supabaseClient
      .from("elections")
      .insert({

        admin_id:
          user.id,

        title,

        description,

        election_type:
          type,

        voting_code:
          votingCode,

        status:
          "draft",

        starts_at:
          new Date(starts)
            .toISOString(),

        ends_at:
          new Date(ends)
            .toISOString()

      })
      .select()
      .single();


  if (error) {

    console.error(error);

    alert(
      error.message
    );

    return;

  }


  currentElection =
    data;


  showElectionBuilder(
    data
  );

}


// ============================================================
// ELECTION BUILDER
// ============================================================

function showElectionBuilder(
  election
) {

  document.body.innerHTML = `

    <div class="dashboard">

      ${adminSidebar()}


      <main class="dashboard-main">

        <div class="page-back">

          <button
            class="back-button"
            onclick="showAdminDashboard()"
          >
            ← Dashboard
          </button>

        </div>


        <div class="form-header">

          <div>

            <div class="dashboard-eyebrow">
              ELECTION BUILDER
            </div>

            <h1>
              ${escapeHTML(
                election.title
              )}
            </h1>

            <p>
              Add the positions and candidates
              voters will see.
            </p>

          </div>


          <div class="code-badge">

            <span>
              VOTING CODE
            </span>

            <strong>
              ${escapeHTML(
                election.voting_code
              )}
            </strong>

          </div>

        </div>


        <div class="builder-grid">

          <div>

            <div
              id="positionsContainer"
            >
            </div>


            <button
              class="add-position-button"
              onclick="
                addPositionCard()
              "
            >
              ＋ Add Position
            </button>

          </div>


          <aside class="builder-side">

            <div class="form-card">

              <div class="preview-label">
                VOTING LINK
              </div>

              <p class="muted">
                Share this with your voters.
              </p>


              <div class="share-link">

                <input
                  id="shareLink"
                  readonly
                  value="
                    ${window.location.origin +
                    window.location.pathname}
                  "
                />

                <button
                  onclick="
                    copyVotingLink()
                  "
                >
                  Copy
                </button>

              </div>


              <button
                class="qr-button"
                onclick="
                  alert(
                    'QR code generation will be added next.'
                  )
                "
              >
                ▦ Generate QR Code
              </button>

            </div>


            <div class="form-card">

              <div class="preview-label">
                ELECTION STATUS
              </div>


              <div class="status-large draft">
                DRAFT
              </div>


              <button
                class="primary-button full"
                onclick="
                  publishElection()
                "
              >
                🟢 Publish Election
              </button>

            </div>

          </aside>

        </div>

      </main>

    </div>

  `;


  addPositionCard();

}


// ============================================================
// ADD POSITION
// ============================================================

function addPositionCard() {

  const container =
    document.getElementById(
      "positionsContainer"
    );


  if (!container) return;


  const positionNumber =
    container.children.length + 1;


  const card =
    document.createElement(
      "div"
    );


  card.className =
    "position-builder";


  card.innerHTML = `

    <div class="position-header">

      <div class="position-number">
        ${String(
          positionNumber
        ).padStart(2, "0")}
      </div>

      <div>

        <h3>
          New Position
        </h3>

        <p>
          What are voters choosing?
        </p>

      </div>

      <button
        class="remove-button"
        onclick="
          this.closest(
            '.position-builder'
          ).remove()
        "
      >
        ×
      </button>

    </div>


    <label>
      Position name
    </label>

    <input
      class="form-input position-title"
      placeholder="
        e.g. President
      "
    />


    <label>
      Candidates
    </label>


    <div class="candidate-list">

      <div class="candidate-row">

        <input
          class="form-input candidate-name"
          placeholder="
            Candidate name
          "
        />

        <button
          class="candidate-remove"
          onclick="
            this.parentElement.remove()
          "
        >
          ×
        </button>

      </div>

    </div>


    <button
      class="add-candidate-button"
      onclick="
        addCandidateRow(this)
      "
    >
      ＋ Add Candidate
    </button>

  `;


  container.appendChild(
    card
  );

}


// ============================================================
// ADD CANDIDATE
// ============================================================

function addCandidateRow(
  button
) {

  const list =
    button
      .parentElement
      .querySelector(
        ".candidate-list"
      );


  const row =
    document.createElement(
      "div"
    );


  row.className =
    "candidate-row";


  row.innerHTML = `

    <input
      class="form-input candidate-name"
      placeholder="
        Candidate name
      "
    />

    <button
      class="candidate-remove"
      onclick="
        this.parentElement.remove()
      "
    >
      ×
    </button>

  `;


  list.appendChild(
    row
  );

}


// ============================================================
// PUBLISH ELECTION
// ============================================================

async function publishElection() {

  if (!currentElection) {

    alert(
      "No election selected."
    );

    return;

  }


  const positionCards =
    document.querySelectorAll(
      ".position-builder"
    );


  if (!positionCards.length) {

    alert(
      "Add at least one position."
    );

    return;

  }


  for (
    let i = 0;
    i < positionCards.length;
    i++
  ) {

    const card =
      positionCards[i];


    const title =
      card
        .querySelector(
          ".position-title"
        )
        .value
        .trim();


    if (!title) {

      alert(
        "Every position needs a name."
      );

      return;

    }


    const {
      data: position,
      error:
        positionError
    } =
      await supabaseClient
        .from("positions")
        .insert({

          election_id:
            currentElection.id,

          title,

          display_order:
            i

        })
        .select()
        .single();


    if (positionError) {

      console.error(
        positionError
      );

      alert(
        positionError.message
      );

      return;

    }


    const candidateInputs =
      card.querySelectorAll(
        ".candidate-name"
      );


    const candidates = [];


    candidateInputs.forEach(
      (
        input,
        index
      ) => {

        const name =
          input.value.trim();


        if (name) {

          candidates.push({

            position_id:
              position.id,

            name,

            display_order:
              index

          });

        }

      }
    );


    if (!candidates.length) {

      alert(
        `Add at least one candidate for ${title}.`
      );

      return;

    }


    const {
      error:
        candidateError
    } =
      await supabaseClient
        .from("candidates")
        .insert(
          candidates
        );


    if (candidateError) {

      console.error(
        candidateError
      );

      alert(
        candidateError.message
      );

      return;

    }

  }


  const {
    error
  } =
    await supabaseClient
      .from("elections")
      .update({

        status:
          "active"

      })
      .eq(
        "id",
        currentElection.id
      );


  if (error) {

    alert(
      error.message
    );

    return;

  }


  currentElection.status =
    "active";


  showPublishSuccess();

}


// ============================================================
// PUBLISH SUCCESS
// ============================================================

function showPublishSuccess() {

  const link =
    window.location.origin +
    window.location.pathname +
    "?vote=" +
    encodeURIComponent(
      currentElection.voting_code
    );


  document.body.innerHTML = `

    <div class="success-screen">

      <div class="success-glow"></div>

      <div class="success-card">

        <div class="success-icon">
          ✓
        </div>

        <div class="dashboard-eyebrow">
          ELECTION LIVE
        </div>

        <h1>
          Your election is live! 🚀
        </h1>

        <p>
          Share the voting link with
          your voters.
        </p>


        <div class="live-code">

          <span>
            VOTING CODE
          </span>

          <strong>
            ${escapeHTML(
              currentElection.voting_code
            )}
          </strong>

        </div>


        <div class="share-link large">

          <input
            id="finalVotingLink"
            readonly
            value="${link}"
          />

          <button
            onclick="
              navigator.clipboard.writeText(
                document
                  .getElementById(
                    'finalVotingLink'
                  )
                  .value
              );

              this.textContent =
                'Copied!';
            "
          >
            Copy
          </button>

        </div>


        <div class="success-actions">

          <button
            class="primary-button"
            onclick="
              openVoterFromCurrentElection()
            "
          >
            Preview Ballot →
          </button>

          <button
            class="ghost-button"
            onclick="
              showAdminDashboard()
            "
          >
            Back to Dashboard
          </button>

        </div>

      </div>

    </div>

  `;

}


// ============================================================
// VOTER
// ============================================================

async function findElection() {

  const code =
    document
      .getElementById(
        "votingCode"
      )
      .value
      .trim()
      .toUpperCase();


  if (!code) {

    alert(
      "Please enter your voting code."
    );

    return;

  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("elections")
      .select("*")
      .eq(
        "voting_code",
        code
      )
      .eq(
        "status",
        "active"
      )
      .maybeSingle();


  if (error) {

    console.error(error);

    alert(
      "Could not find the election."
    );

    return;

  }


  if (!data) {

    alert(
      "No active election was found with that code."
    );

    return;

  }


  currentElection =
    data;


  closeLogin();


  showVoterVerification();

}


// ============================================================
// VOTER VERIFICATION
// ============================================================

function showVoterVerification() {

  document.body.innerHTML = `

    <div class="voter-page">

      <div class="voter-top">

        <div class="dashboard-logo">

          <div class="logo-icon">
            ✓
          </div>

          <span>
            Vote<span class="gradient-text">
              Verse
            </span>
          </span>

        </div>

      </div>


      <main class="voter-center">

        <div class="voter-card">

          <div class="modal-icon">
            🔐
          </div>

          <div class="dashboard-eyebrow">
            VOTER VERIFICATION
          </div>

          <h1>
            Verify your ballot
          </h1>

          <p>
            Enter the voter code provided
            by your election organizer.
          </p>


          <input
            id="voterCode"
            class="form-input"
            placeholder="
              Your voter code
            "
          />


          <button
            class="primary-button full"
            onclick="
              verifyVoter()
            "
          >
            Continue →
          </button>


          <div class="election-mini">

            <span>
              ELECTION
            </span>

            <strong>
              ${escapeHTML(
                currentElection.title
              )}
            </strong>

          </div>

        </div>

      </main>

    </div>

  `;

}


// ============================================================
// VERIFY VOTER
// ============================================================

async function verifyVoter() {

  const code =
    document
      .getElementById(
        "voterCode"
      )
      .value
      .trim();


  if (!code) {

    alert(
      "Enter your voter code."
    );

    return;

  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("voters")
      .select("*")
      .eq(
        "election_id",
        currentElection.id
      )
      .eq(
        "voter_code",
        code
      )
      .maybeSingle();


  if (error) {

    console.error(error);

    alert(
      "Could not verify the voter code."
    );

    return;

  }


  if (!data) {

    alert(
      "Invalid voter code."
    );

    return;

  }


  if (data.has_voted) {

    showAlreadyVoted();

    return;

  }


  currentVoter =
    data;


  await loadBallot();

}


// ============================================================
// LOAD BALLOT
// ============================================================

async function loadBallot() {

  const {
    data:
      positions,
    error
  } =
    await supabaseClient
      .from("positions")
      .select(`
        *,
        candidates (*)
      `)
      .eq(
        "election_id",
        currentElection.id
      )
      .order(
        "display_order"
      );


  if (error) {

    console.error(error);

    alert(
      "Could not load ballot."
    );

    return;

  }


  currentElection.positions =
    positions;


  currentPositionIndex =
    0;


  currentBallot =
    {};


  showBallot();

}


// ============================================================
// SHOW BALLOT
// ============================================================

function showBallot() {

  const position =
    currentElection
      .positions[
        currentPositionIndex
      ];


  const total =
    currentElection
      .positions.length;


  const selected =
    currentBallot[
      position.id
    ];


  document.body.innerHTML = `

    <div class="voter-page">

      <div class="voter-top">

        <div class="dashboard-logo">

          <div class="logo-icon">
            ✓
          </div>

          <span>
            Vote<span class="gradient-text">
              Verse
            </span>
          </span>

        </div>


        <div class="progress-text">
          Position
          ${currentPositionIndex + 1}
          of
          ${total}
        </div>

      </div>


      <main class="ballot-main">

        <div class="ballot-progress">

          <div
            style="
              width:
              ${(
                (
                  currentPositionIndex + 1
                ) /
                total
              ) * 100}%
            "
          ></div>

        </div>


        <div class="ballot-card">

          <div class="dashboard-eyebrow">
            ${escapeHTML(
              currentElection.title
            )}
          </div>

          <h1>
            ${escapeHTML(
              position.title
            )}
          </h1>

          <p class="ballot-instruction">
            Select a candidate.
          </p>


          <div class="candidate-vote-list">

            ${position.candidates
              .sort(
                (
                  a,
                  b
                ) =>
                  a.display_order -
                  b.display_order
              )
              .map(
                candidate => `

                  <button
                    class="
                      vote-candidate
                      ${
                        selected ===
                        candidate.id
                          ? "selected"
                          : ""
                      }
                    "
                    onclick="
                      selectCandidate(
                        '${candidate.id}'
                      )
                    "
                  >

                    <div class="candidate-radio">

                      ${
                        selected ===
                        candidate.id
                          ? "✓"
                          : ""
                      }

                    </div>

                    <div>

                      <strong>
                        ${escapeHTML(
                          candidate.name
                        )}
                      </strong>

                      ${
                        candidate.description
                          ? `
                            <span>
                              ${escapeHTML(
                                candidate.description
                              )}
                            </span>
                          `
                          : ""
                      }

                    </div>

                  </button>

                `
              )
              .join("")}

          </div>


          <div class="ballot-actions">

            ${
              currentPositionIndex > 0
                ? `
                  <button
                    class="ghost-button"
                    onclick="
                      previousPosition()
                    "
                  >
                    ← Back
                  </button>
                `
                : `
                  <div></div>
                `
            }


            <button
              class="primary-button"
              onclick="
                nextPosition()
              "
            >
              ${
                currentPositionIndex ===
                total - 1
                  ? "Review Ballot →"
                  : "Continue →"
              }
            </button>

          </div>

        </div>

      </main>

    </div>

  `;

}


// ============================================================
// SELECT CANDIDATE
// ============================================================

function selectCandidate(
  candidateId
) {

  const position =
    currentElection
      .positions[
        currentPositionIndex
      ];


  currentBallot[
    position.id
  ] =
    candidateId;


  showBallot();

}


// ============================================================
// NEXT POSITION
// ============================================================

function nextPosition() {

  const position =
    currentElection
      .positions[
        currentPositionIndex
      ];


  if (
    !currentBallot[
      position.id
    ]
  ) {

    alert(
      "Please select a candidate before continuing."
    );

    return;

  }


  if (
    currentPositionIndex <
    currentElection.positions.length - 1
  ) {

    currentPositionIndex++;

    showBallot();

    return;

  }


  showBallotReview();

}


// ============================================================
// PREVIOUS
// ============================================================

function previousPosition() {

  if (
    currentPositionIndex > 0
  ) {

    currentPositionIndex--;

    showBallot();

  }

}


// ============================================================
// REVIEW BALLOT
// ============================================================

function showBallotReview() {

  const rows =
    currentElection.positions
      .map(
        position => {

          const candidate =
            position.candidates
              .find(
                candidate =>
                  candidate.id ===
                  currentBallot[
                    position.id
                  ]
              );


          return `

            <div class="review-row">

              <span>
                ${escapeHTML(
                  position.title
                )}
              </span>

              <strong>
                ${escapeHTML(
                  candidate?.name ||
                  "Not selected"
                )}
              </strong>

            </div>

          `;

        }
      )
      .join("");


  document.body.innerHTML = `

    <div class="voter-page">

      <div class="voter-top">

        <div class="dashboard-logo">

          <div class="logo-icon">
            ✓
          </div>

          <span>
            Vote<span class="gradient-text">
              Verse
            </span>
          </span>

        </div>

      </div>


      <main class="voter-center">

        <div class="review-card">

          <div class="modal-icon">
            🔍
          </div>

          <div class="dashboard-eyebrow">
            FINAL REVIEW
          </div>

          <h1>
            Review your ballot
          </h1>

          <p>
            Make sure everything looks
            correct before submitting.
          </p>


          <div class="review-list">

            ${rows}

          </div>


          <div class="privacy-note">

            🔒 Your ballot can only be
            submitted once.

          </div>


          <div class="ballot-actions">

            <button
              class="ghost-button"
              onclick="
                currentPositionIndex =
                  0;
                showBallot();
              "
            >
              ← Edit
            </button>


            <button
              class="primary-button"
              onclick="
                submitBallot()
              "
            >
              Submit My Vote ✓
            </button>

          </div>

        </div>

      </main>

    </div>

  `;

}


// ============================================================
// SUBMIT BALLOT
// ============================================================

async function submitBallot() {

  if (!currentVoter) {

    alert(
      "Voter session is missing."
    );

    return;

  }


  const positionIds =
    currentElection
      .positions
      .map(
        position =>
          position.id
      );


  const allSelected =
    positionIds.every(
      id =>
        currentBallot[id]
    );


  if (!allSelected) {

    alert(
      "Please complete your ballot."
    );

    return;

  }


  // Re-check voter status before submission.
  const {
    data:
      voterCheck,
    error:
      voterCheckError
  } =
    await supabaseClient
      .from("voters")
      .select("*")
      .eq(
        "id",
        currentVoter.id
      )
      .single();


  if (voterCheckError) {

    alert(
      "Could not verify your voting status."
    );

    return;

  }


  if (
    voterCheck.has_voted
  ) {

    showAlreadyVoted();

    return;

  }


  const {
    data:
      ballot,
    error:
      ballotError
  } =
    await supabaseClient
      .from("ballots")
      .insert({

        election_id:
          currentElection.id,

        voter_id:
          currentVoter.id

      })
      .select()
      .single();


  if (ballotError) {

    console.error(
      ballotError
    );


    if (
      ballotError.code ===
      "23505"
    ) {

      showAlreadyVoted();

      return;

    }


    alert(
      ballotError.message
    );

    return;

  }


  const votes =
    positionIds.map(
      positionId => ({

        ballot_id:
          ballot.id,

        position_id:
          positionId,

        candidate_id:
          currentBallot[
            positionId
          ]

      })
    );


  const {
    error:
      votesError
  } =
    await supabaseClient
      .from("votes")
      .insert(
        votes
      );


  if (votesError) {

    console.error(
      votesError
    );

    alert(
      "There was a problem saving your votes."
    );

    return;

  }


  const {
    error:
      voterUpdateError
  } =
    await supabaseClient
      .from("voters")
      .update({

        has_voted:
          true,

        voted_at:
          new Date()
            .toISOString()

      })
      .eq(
        "id",
        currentVoter.id
      )
      .eq(
        "has_voted",
        false
      );


  if (voterUpdateError) {

    console.error(
      voterUpdateError
    );

  }


  showVoteSuccess();

}


// ============================================================
// VOTE SUCCESS
// ============================================================

function showVoteSuccess() {

  document.body.innerHTML = `

    <div class="success-screen">

      <div class="success-glow"></div>

      <div class="success-card">

        <div class="success-icon">
          ✓
        </div>

        <div class="dashboard-eyebrow">
          VOTE RECORDED
        </div>

        <h1>
          Your voice has been heard.
        </h1>

        <p>
          Your ballot was successfully
          submitted for:
        </p>

        <h3>
          ${escapeHTML(
            currentElection.title
          )}
        </h3>

        <div class="privacy-note">

          🔒 Your ballot has been recorded.
          You cannot vote again in this election.

        </div>

      </div>

    </div>

  `;

}


// ============================================================
// ALREADY VOTED
// ============================================================

function showAlreadyVoted() {

  document.body.innerHTML = `

    <div class="success-screen">

      <div class="success-card">

        <div class="already-icon">
          ✓
        </div>

        <div class="dashboard-eyebrow">
          ALREADY SUBMITTED
        </div>

        <h1>
          You've already voted.
        </h1>

        <p>
          Our system shows that a ballot
          has already been submitted using
          this voter code.
        </p>

        <div class="privacy-note">

          🔒 Each voter can submit only
          one ballot per election.

        </div>

      </div>

    </div>

  `;

}


// ============================================================
// ADMIN ELECTIONS
// ============================================================

async function showAdminElections() {

  showAdminDashboard();

}


// ============================================================
// RESULTS PICKER
// ============================================================

async function showResultsPicker() {

  const {
    data: {
      user
    }
  } =
    await supabaseClient.auth
      .getUser();


  if (!user) return;


  const {
    data:
      elections,
    error
  } =
    await supabaseClient
      .from("elections")
      .select("*")
      .eq(
        "admin_id",
        user.id
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    alert(
      error.message
    );

    return;

  }


  document.body.innerHTML = `

    <div class="dashboard">

      ${adminSidebar()}


      <main class="dashboard-main">

        <div class="page-back">

          <button
            class="back-button"
            onclick="
              showAdminDashboard()
            "
          >
            ← Dashboard
          </button>

        </div>


        <div class="form-header">

          <div>

            <div class="dashboard-eyebrow">
              RESULTS
            </div>

            <h1>
              Election results
            </h1>

            <p>
              Select an election to view results.
            </p>

          </div>

        </div>


        <div class="results-picker">

          ${
            elections.length
              ? elections.map(
                  election => `

                    <button
                      class="result-election"
                      onclick="
                        showElectionResults(
                          '${election.id}'
                        )
                      "
                    >

                      <div
                        class="election-symbol"
                      >
                        ${getElectionIcon(
                          election.election_type
                        )}
                      </div>

                      <div>

                        <strong>
                          ${escapeHTML(
                            election.title
                          )}
                        </strong>

                        <span>
                          ${election.status}
                        </span>

                      </div>

                      <b>
                        →
                      </b>

                    </button>

                  `
                ).join("")
              : `
                <div class="empty-card">
                  No elections yet.
                </div>
              `
          }

        </div>

      </main>

    </div>

  `;

}


// ============================================================
// RESULTS
// ============================================================

async function showElectionResults(
  electionId
) {

  const {
    data:
      election,
    error
  } =
    await supabaseClient
      .from("elections")
      .select("*")
      .eq(
        "id",
        electionId
      )
      .single();


  if (error) {

    alert(
      error.message
    );

    return;

  }


  const {
    data:
      positions
  } =
    await supabaseClient
      .from("positions")
      .select(`
        *,
        candidates (*)
      `)
      .eq(
        "election_id",
        electionId
      )
      .order(
        "display_order"
      );


  document.body.innerHTML = `

    <div class="dashboard">

      ${adminSidebar()}


      <main class="dashboard-main">

        <div class="page-back">

          <button
            class="back-button"
            onclick="
              showResultsPicker()
            "
          >
            ← Results
          </button>

        </div>


        <div class="form-header">

          <div>

            <div class="dashboard-eyebrow">
              RESULTS
            </div>

            <h1>
              ${escapeHTML(
                election.title
              )}
            </h1>

            <p>
              Election results overview.
            </p>

          </div>

        </div>


        <div
          id="resultsContainer"
          class="results-container"
        >

          Loading results...

        </div>

      </main>

    </div>

  `;


  const {
    data:
      votes,
    error:
      votesError
  } =
    await supabaseClient
      .from("votes")
      .select("*")
      .in(
        "position_id",
        positions.map(
          p => p.id
        )
      );


  if (votesError) {

    console.error(
      votesError
    );

    return;

  }


  document.getElementById(
    "resultsContainer"
  ).innerHTML =

    positions.map(
      position => {

        const counts = {};


        position.candidates
          .forEach(
            candidate => {

              counts[
                candidate.id
              ] = 0;

            }
          );


        votes
          .filter(
            vote =>
              vote.position_id ===
              position.id
          )
          .forEach(
            vote => {

              if (
                counts[
                  vote.candidate_id
                ] !== undefined
              ) {

                counts[
                  vote.candidate_id
                ]++;

              }

            }
          );


        const total =
          Object.values(
            counts
          )
          .reduce(
            (
              sum,
              value
            ) =>
              sum + value,
            0
          );


        return `

          <div class="result-card">

            <div class="result-header">

              <div>

                <div class="dashboard-eyebrow">
                  POSITION
                </div>

                <h2>
                  ${escapeHTML(
                    position.title
                  )}
                </h2>

              </div>

              <strong>
                ${total} votes
              </strong>

            </div>


            ${position.candidates
              .sort(
                (
                  a,
                  b
                ) =>
                  counts[b.id] -
                  counts[a.id]
              )
              .map(
                candidate => {

                  const count =
                    counts[
                      candidate.id
                    ] || 0;


                  const percentage =
                    total
                      ? Math.round(
                          (
                            count /
                            total
                          ) * 100
                        )
                      : 0;


                  return `

                    <div class="result-row">

                      <div class="result-name">

                        <strong>
                          ${escapeHTML(
                            candidate.name
                          )}
                        </strong>

                        <span>
                          ${count} votes
                          ·
                          ${percentage}%
                        </span>

                      </div>


                      <div class="result-bar">

                        <div
                          style="
                            width:
                            ${percentage}%
                          "
                        ></div>

                      </div>

                    </div>

                  `;

                }
              )
              .join("")}

          </div>

        `;

      }
    ).join("");

}


// ============================================================
// MANAGE ELECTION
// ============================================================

async function manageElection(
  id
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("elections")
      .select("*")
      .eq(
        "id",
        id
      )
      .single();


  if (error) {

    alert(
      error.message
    );

    return;

  }


  currentElection =
    data;


  showElectionBuilder(
    data
  );

}


// ============================================================
// COPY LINK
// ============================================================

function copyVotingLink() {

  const input =
    document.getElementById(
      "shareLink"
    );


  if (!input) return;


  navigator.clipboard
    .writeText(
      input.value
    );


  alert(
    "Voting link copied!"
  );

}


// ============================================================
// PREVIEW
// ============================================================

function openVoterFromCurrentElection() {

  if (!currentElection) {

    return;

  }


  showVoterVerification();

}


// ============================================================
// LOGOUT
// ============================================================

async function adminLogout() {

  await supabaseClient
    .auth
    .signOut();


  window.location.reload();

}


// ============================================================
// HELPERS
// ============================================================

function generateVotingCode() {

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


  let result = "";


  for (
    let i = 0;
    i < 8;
    i++
  ) {

    result +=
      chars[
        Math.floor(
          Math.random() *
          chars.length
        )
      ];

  }


  return result;

}


function getElectionIcon(
  type
) {

  const icons = {

    political:
      "🏛️",

    school:
      "🏫",

    organization:
      "🏢",

    student:
      "🎓",

    custom:
      "🗳️"

  };


  return (
    icons[type] ||
    "🗳️"
  );

}


function escapeHTML(
  value
) {

  return String(
    value
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}
