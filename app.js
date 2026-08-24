// ==========================================
// SUPABASE CONFIG
// ==========================================

const SUPABASE_URL = "https://fkowymadydhckaqsaxdi.supabase.co";

const SUPABASE_KEY = "sb_publishable_itesUAJ1NMYBXVuSCjXUjQ__OtmQUkT";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ==========================================
// UI HELPERS
// ==========================================

const authModal =
  document.getElementById("authModal");

const loginModal =
  document.getElementById("loginModal");


function showAuth(type) {

  authModal.classList.remove("hidden");

}


function closeModal() {

  authModal.classList.add("hidden");

}


function closeLogin() {

  loginModal.classList.add("hidden");

}


function openAdminLogin() {

  closeModal();

  document
    .getElementById("adminLogin")
    .classList.remove("hidden");

  document
    .getElementById("voterLogin")
    .classList.add("hidden");

  document
    .getElementById("loginTitle")
    .textContent = "Admin Login";

  document
    .getElementById("loginSubtitle")
    .textContent =
      "Sign in to manage your elections.";

  loginModal.classList.remove("hidden");

}


function openVoterLogin() {

  closeModal();

  document
    .getElementById("adminLogin")
    .classList.add("hidden");

  document
    .getElementById("voterLogin")
    .classList.remove("hidden");

  document
    .getElementById("loginTitle")
    .textContent = "Enter Voting Code";

  document
    .getElementById("loginSubtitle")
    .textContent =
      "Enter the code provided by your election organizer.";

  loginModal.classList.remove("hidden");

}


// ==========================================
// ADMIN SIGN UP
// ==========================================

async function adminSignup() {

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;

  if (!email || !password) {

    alert("Please enter an email and password.");

    return;
  }


  if (password.length < 6) {

    alert(
      "Password must be at least 6 characters."
    );

    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient.auth.signUp({

      email,
      password,

      options: {

        data: {
          full_name: "Election Admin"
        }

      }

    });


  if (error) {

    alert(error.message);

    return;
  }


  if (data.user) {

    const {
      error: profileError
    } =
      await supabaseClient
        .from("profiles")
        .insert({

          id: data.user.id,

          full_name: "Election Admin",

          role: "admin"

        });


    if (profileError) {

      console.error(profileError);

    }

  }


  alert(
    "Account created! Check your email if confirmation is enabled."
  );

}


// ==========================================
// ADMIN LOGIN
// ==========================================

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
    await supabaseClient.auth.signInWithPassword({

      email,

      password

    });


  if (error) {

    alert(error.message);

    return;
  }


  alert(
    "Welcome back! Admin dashboard coming next."
  );

  closeLogin();

}


// ==========================================
// FIND ELECTION
// ==========================================

async function findElection() {

  const code =
    document
      .getElementById("votingCode")
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
      .eq("voting_code", code)
      .eq("status", "active")
      .maybeSingle();


  if (error) {

    console.error(error);

    alert(
      "Something went wrong finding the election."
    );

    return;
  }


  if (!data) {

    alert(
      "No active election found with that code."
    );

    return;
  }


  alert(
    `Election found: ${data.title}`
  );

  closeLogin();

}