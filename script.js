const SUPABASE_URL = "https://khdyhvawwfujuvvhnthw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_lDj_7QJkvpEdH_8orM_D5Q_RNe1Levs"; // Replace with your Supabase publishable or anon key
const ADMIN_EMAIL = "vgmsparrow@gmail.com";
const WORK_BUCKET = "contractor-work-images";
const LIVE_SITE_URL = window.location.origin + window.location.pathname;

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const siteTopbar = document.getElementById("siteTopbar");
const themeSelect = document.getElementById("themeSelect");
const openAuthBtn = document.getElementById("openAuthBtn");
const logoutBtn = document.getElementById("logoutBtn");
const statusBanner = document.getElementById("statusBanner");
const sessionStatusText = document.getElementById("sessionStatusText");
const sessionSubText = document.getElementById("sessionSubText");
const roleBadge = document.getElementById("roleBadge");

const recoverySection = document.getElementById("recoverySection");
const recoveryForm = document.getElementById("recoveryForm");
const newPasswordInput = document.getElementById("newPasswordInput");

const adminContractorPanel = document.getElementById("adminContractorPanel");
const createContractorForm = document.getElementById("createContractorForm");
const createContractorBtn = document.getElementById("createContractorBtn");
const adminContractorName = document.getElementById("adminContractorName");
const adminContractorEmail = document.getElementById("adminContractorEmail");
const adminContractorPassword = document.getElementById("adminContractorPassword");
const adminContractorTrade = document.getElementById("adminContractorTrade");
const adminContractorCity = document.getElementById("adminContractorCity");
const adminContractorPhone = document.getElementById("adminContractorPhone");
const adminContractorBio = document.getElementById("adminContractorBio");

// Work Upload & Gallery Elements
const workUploadPanel = document.getElementById("workUploadPanel");
const workUploadHint = document.getElementById("workUploadHint");
const uploadWorkForm = document.getElementById("uploadWorkForm");
const workTargetContractorField = document.getElementById("workTargetContractorField");
const workContractorSelect = document.getElementById("workContractorSelect");
const workTitleInput = document.getElementById("workTitleInput");
const workImageInput = document.getElementById("workImageInput");
const workDescInput = document.getElementById("workDescInput");
const uploadWorkBtn = document.getElementById("uploadWorkBtn");

const worksSubtitle = document.getElementById("worksSubtitle");
const lockedWorksBox = document.getElementById("lockedWorksBox");
const worksGrid = document.getElementById("worksGrid");

// Directory Elements
const directorySubtitle = document.getElementById("directorySubtitle");
const directoryFilters = document.getElementById("directoryFilters");
const lockedDirectoryBox = document.getElementById("lockedDirectoryBox");
const lockedLoginUserBtn = document.getElementById("lockedLoginUserBtn");
const lockedLoginContractorBtn = document.getElementById("lockedLoginContractorBtn");
const lockedLoginAdminBtn = document.getElementById("lockedLoginAdminBtn");
const searchInput = document.getElementById("searchInput");
const tradeFilter = document.getElementById("tradeFilter");
const contractorsGrid = document.getElementById("contractorsGrid");

// Auth Modal Elements
const authModal = document.getElementById("authModal");
const closeAuthBtn = document.getElementById("closeAuthBtn");
const viewLoginTab = document.getElementById("viewLoginTab");
const viewForgotTab = document.getElementById("viewForgotTab");
const loginPanel = document.getElementById("loginPanel");
const forgotPanel = document.getElementById("forgotPanel");

const roleUserBtn = document.getElementById("roleUserBtn");
const roleContractorBtn = document.getElementById("roleContractorBtn");
const roleAdminBtn = document.getElementById("roleAdminBtn");
const roleHint = document.getElementById("roleHint");
const userModeTabs = document.getElementById("userModeTabs");
const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");
const authForm = document.getElementById("authForm");
const signupExtraFields = document.getElementById("signupExtraFields");
const fullNameInput = document.getElementById("fullNameInput");
const phoneInput = document.getElementById("phoneInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const authError = document.getElementById("authError");
const authSubmitBtn = document.getElementById("authSubmitBtn");

const forgotForm = document.getElementById("forgotForm");
const forgotEmailInput = document.getElementById("forgotEmailInput");
const forgotError = document.getElementById("forgotError");
const forgotSubmitBtn = document.getElementById("forgotSubmitBtn");
const returnToLoginBtn = document.getElementById("returnToLoginBtn");

// Application State
let modalView = "login"; // "login" | "forgot"
let loginRole = "user"; // "user" | "contractor" | "admin"
let userAuthMode = "login"; // "login" | "signup"
let currentSession = null;
let currentAccountInfo = null; // { role: "user" | "contractor" | "admin", isAdmin: boolean, contractorRow?: object }
let allContractors = [];
let allWorks = [];

function showBanner(message, type = "success") {
  statusBanner.textContent = message;
  statusBanner.className = `status-banner ${type}`;
  statusBanner.classList.remove("hidden");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function initTheme() {
  const savedTheme = localStorage.getItem("callacrew_theme") || "obsidian";
  document.documentElement.setAttribute("data-theme", savedTheme);
  if (themeSelect) {
    themeSelect.value = savedTheme;
    themeSelect.addEventListener("change", () => {
      document.documentElement.setAttribute("data-theme", themeSelect.value);
      localStorage.setItem("callacrew_theme", themeSelect.value);
    });
  }
}

function initAutoHideTopbar() {
  let lastScrollY = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      const currentY = window.scrollY;
      if (currentY > 90 && currentY > lastScrollY) {
        siteTopbar?.classList.add("topbar-hidden");
      } else {
        siteTopbar?.classList.remove("topbar-hidden");
      }
      lastScrollY = currentY;
    },
    { passive: true }
  );
}

function refreshAuthModalUI() {
  const isForgotView = modalView === "forgot";
  viewLoginTab?.classList.toggle("active", !isForgotView);
  viewForgotTab?.classList.toggle("active", isForgotView);
  loginPanel?.classList.toggle("hidden", isForgotView);
  forgotPanel?.classList.toggle("hidden", !isForgotView);

  const isUser = loginRole === "user";
  const isContractor = loginRole === "contractor";
  const isAdminRole = loginRole === "admin";

  roleUserBtn?.classList.toggle("active", isUser);
  roleContractorBtn?.classList.toggle("active", isContractor);
  roleAdminBtn?.classList.toggle("active", isAdminRole);

  if (!isUser && userAuthMode === "signup") {
    userAuthMode = "login";
  }

  userModeTabs?.classList.toggle("hidden", !isUser);
  tabLogin?.classList.toggle("active", userAuthMode === "login");
  tabSignup?.classList.toggle("active", userAuthMode === "signup");

  const isSignup = isUser && userAuthMode === "signup";
  signupExtraFields?.classList.toggle("hidden", !isSignup);

  if (roleHint) {
    if (isAdminRole) {
      roleHint.textContent = "Sign in with the admin account to create contractor accounts and upload works.";
    } else if (isContractor) {
      roleHint.textContent = "Contractors sign in using credentials created by admin to upload works and images.";
    } else {
      roleHint.textContent = "Users can log in or create a user account.";
    }
  }

  if (authSubmitBtn) {
    if (isSignup) {
      authSubmitBtn.textContent = "Create User Account";
    } else if (isAdminRole) {
      authSubmitBtn.textContent = "Login as Admin";
    } else if (isContractor) {
      authSubmitBtn.textContent = "Login as Contractor";
    } else {
      authSubmitBtn.textContent = "Login as User";
    }
  }

  if (authError) {
    authError.classList.add("hidden");
    authError.textContent = "";
  }
  if (forgotError) {
    forgotError.classList.add("hidden");
    forgotError.textContent = "";
  }
}

function openAuthModal(presetRole = "user", presetView = "login") {
  loginRole = ["user", "contractor", "admin"].includes(presetRole) ? presetRole : "user";
  modalView = presetView === "forgot" ? "forgot" : "login";
  userAuthMode = "login";
  refreshAuthModalUI();
  authModal?.classList.remove("hidden");
  if (modalView === "forgot") {
    forgotEmailInput?.focus();
  } else {
    emailInput?.focus();
  }
}

function closeAuthModal() {
  authModal?.classList.add("hidden");
  authForm?.reset();
  forgotForm?.reset();
  modalView = "login";
  userAuthMode = "login";
  refreshAuthModalUI();
}

async function resolveAccountRole(user) {
  if (!user) return null;
  const emailLower = (user.email || "").toLowerCase();
  const isAdmin = emailLower === ADMIN_EMAIL.toLowerCase();

  if (isAdmin) {
    return { role: "admin", isAdmin: true, contractorRow: null };
  }

  const { data: contractorRow } = await supabaseClient
    .from("contractors")
    .select("*")
    .or(`user_id.eq.${user.id},email.eq.${emailLower}`)
    .limit(1)
    .maybeSingle();

  if (contractorRow) {
    return { role: "contractor", isAdmin: false, contractorRow };
  }

  return { role: "user", isAdmin: false, contractorRow: null };
}

async function ensureUserRow(user) {
  if (!user) return;
  const emailLower = (user.email || "").toLowerCase();
  if (emailLower === ADMIN_EMAIL.toLowerCase()) return;

  const { data: contractorRow } = await supabaseClient
    .from("contractors")
    .select("id")
    .or(`user_id.eq.${user.id},email.eq.${emailLower}`)
    .limit(1)
    .maybeSingle();

  if (contractorRow) return;

  await supabaseClient.from("users").upsert(
    {
      id: user.id,
      email: emailLower,
      full_name: user.user_metadata?.full_name || emailLower.split("@")[0] || "User",
      phone: user.user_metadata?.phone || "",
    },
    { onConflict: "id" }
  );
}

function populateWorkContractorSelector() {
  if (!workContractorSelect) return;
  if (!allContractors.length) {
    workContractorSelect.innerHTML = `<option value="">No registered contractors found</option>`;
    return;
  }

  workContractorSelect.innerHTML = allContractors
    .map((c) => {
      const label = `${c.name || "Contractor"} (${c.email || c.trade || "Registered"})`;
      return `<option value="${escapeHtml(String(c.id))}">${escapeHtml(label)}</option>`;
    })
    .join("");
}

function updateSessionUI() {
  const user = currentSession?.user;
  const isLoggedIn = Boolean(user);

  if (!isLoggedIn) {
    openAuthBtn?.classList.remove("hidden");
    logoutBtn?.classList.add("hidden");
    adminContractorPanel?.classList.add("hidden");
    workUploadPanel?.classList.add("hidden");

    if (sessionStatusText) sessionStatusText.textContent = "Browsing as guest";
    if (sessionSubText) {
      sessionSubText.textContent =
        "Log in as a User, Contractor, or Admin to view registered contractors.";
    }
    if (roleBadge) {
      roleBadge.textContent = "Guest";
      roleBadge.className = "role-badge role-guest";
    }

    lockedDirectoryBox?.classList.remove("hidden");
    directoryFilters?.classList.add("hidden");
    contractorsGrid?.classList.add("hidden");
    if (directorySubtitle) {
      directorySubtitle.textContent =
        "Log in as a User, Contractor, or Admin to view registered contractors.";
    }

    lockedWorksBox?.classList.remove("hidden");
    worksGrid?.classList.add("hidden");
    if (worksSubtitle) {
      worksSubtitle.textContent =
        "Log in as a User, Contractor, or Admin to view uploaded work and images.";
    }
    return;
  }

  openAuthBtn?.classList.add("hidden");
  logoutBtn?.classList.remove("hidden");

  const isAdmin = Boolean(currentAccountInfo?.isAdmin);
  const isContractor = currentAccountInfo?.role === "contractor";
  const roleLabel = isContractor ? "Contractor" : isAdmin ? "Admin" : "User";

  adminContractorPanel?.classList.toggle("hidden", !isAdmin);

  // Both Contractor and Admin can upload work details & images
  const canUploadWork = isAdmin || isContractor;
  workUploadPanel?.classList.toggle("hidden", !canUploadWork);
  workTargetContractorField?.classList.toggle("hidden", !isAdmin);

  if (workUploadHint) {
    workUploadHint.textContent = isAdmin
      ? "As Admin, select any registered contractor and upload their work details or work image."
      : `Uploading work to your contractor profile (${user.email}).`;
  }

  if (sessionStatusText) sessionStatusText.textContent = `Signed in as ${user.email}`;
  if (sessionSubText) {
    sessionSubText.textContent = `Logged in as ${roleLabel}. Registered contractors and uploaded works unlocked.`;
  }
  if (roleBadge) {
    roleBadge.textContent = roleLabel;
    roleBadge.className = "role-badge role-active";
  }

  lockedDirectoryBox?.classList.add("hidden");
  directoryFilters?.classList.remove("hidden");
  contractorsGrid?.classList.remove("hidden");
  if (directorySubtitle) {
    directorySubtitle.textContent = "Registered contractors visible to logged-in accounts.";
  }

  lockedWorksBox?.classList.add("hidden");
  worksGrid?.classList.remove("hidden");
  if (worksSubtitle) {
    worksSubtitle.textContent = "Completed works and photos uploaded by contractors and admin.";
  }

  renderContractors();
  renderWorks();
}

async function loadContractors() {
  if (!currentSession?.user) {
    allContractors = [];
    return;
  }

  const { data, error } = await supabaseClient
    .from("contractors")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (contractorsGrid) {
      contractorsGrid.innerHTML = `<p class="muted-text">Could not load contractors: ${escapeHtml(error.message)}</p>`;
    }
    return;
  }

  allContractors = data || [];
  populateWorkContractorSelector();
  renderContractors();
}

async function loadWorks() {
  if (!currentSession?.user) {
    allWorks = [];
    return;
  }

  const { data, error } = await supabaseClient
    .from("contractor_works")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (worksGrid) {
      worksGrid.innerHTML = `<p class="muted-text">Could not load uploaded works: ${escapeHtml(error.message)}</p>`;
    }
    return;
  }

  allWorks = data || [];
  renderWorks();
}

function renderWorks() {
  if (!worksGrid || !currentSession?.user) return;

  const isAdmin = Boolean(currentAccountInfo?.isAdmin);
  const userEmailLower = (currentSession.user.email || "").toLowerCase();

  if (!allWorks.length) {
    worksGrid.innerHTML = `<p class="muted-text">No contractor works uploaded yet.</p>`;
    return;
  }

  worksGrid.innerHTML = allWorks
    .map((work) => {
      const contractorMatch = allContractors.find(
        (c) => String(c.id) === String(work.contractor_id) || (c.email || "").toLowerCase() === (work.contractor_email || "").toLowerCase()
      );
      const contractorLabel = contractorMatch?.name || work.contractor_email || "Contractor";
      const canDelete =
        isAdmin || (work.contractor_email || "").toLowerCase() === userEmailLower;

      const deleteBtn = canDelete
        ? `<button type="button" class="btn btn-danger btn-sm delete-work-btn" data-id="${escapeHtml(String(work.id))}" data-path="${escapeHtml(work.image_path || "")}">Delete</button>`
        : "";

      const imageHtml = work.image_url
        ? `<img src="${escapeHtml(work.image_url)}" alt="${escapeHtml(work.title || "Contractor work")}" class="work-card-image" loading="lazy" />`
        : "";

      return `
        <article class="contractor-card">
          ${imageHtml}
          <div class="contractor-top">
            <h3 class="contractor-name">${escapeHtml(work.title || "Completed Work")}</h3>
            <span class="trade-pill">${escapeHtml(contractorLabel)}</span>
          </div>
          ${work.description ? `<p class="muted-text">${escapeHtml(work.description)}</p>` : ""}
          <div class="card-actions">
            <a class="btn btn-ghost btn-sm" href="tel:+917867065129">Inquire via Concierge</a>
            ${deleteBtn}
          </div>
        </article>
      `;
    })
    .join("");

  worksGrid.querySelectorAll(".delete-work-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const imagePath = btn.getAttribute("data-path");

      if (imagePath) {
        await supabaseClient.storage.from(WORK_BUCKET).remove([imagePath]);
      }

      const { error } = await supabaseClient.from("contractor_works").delete().eq("id", id);
      if (error) {
        showBanner(`Could not delete work: ${error.message}`, "error");
      } else {
        showBanner("Uploaded work deleted.", "success");
        await loadWorks();
      }
    });
  });
}

function renderContractors() {
  if (!contractorsGrid || !currentSession?.user) return;

  const query = (searchInput?.value || "").trim().toLowerCase();
  const trade = tradeFilter?.value || "all";
  const isAdmin = Boolean(currentAccountInfo?.isAdmin);

  const filtered = allContractors.filter((item) => {
    const matchesTrade =
      trade === "all" || (item.trade || "General").toLowerCase() === trade.toLowerCase();
    const haystack = `${item.name || ""} ${item.trade || ""} ${item.city || ""}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    return matchesTrade && matchesQuery;
  });

  if (!filtered.length) {
    contractorsGrid.innerHTML = `<p class="muted-text">No registered contractors match your filter.</p>`;
    return;
  }

  contractorsGrid.innerHTML = filtered
    .map((item) => {
      const deleteBtn = isAdmin
        ? `<button type="button" class="btn btn-danger btn-sm delete-contractor-btn" data-id="${escapeHtml(String(item.id))}">Delete</button>`
        : "";

      return `
        <article class="contractor-card">
          <div class="contractor-top">
            <h3 class="contractor-name">${escapeHtml(item.name || "Contractor")}</h3>
            <span class="trade-pill">${escapeHtml(item.trade || "General")}</span>
          </div>
          <p class="muted-text">${escapeHtml(item.city || "Local Service Area")}</p>
          ${item.phone ? `<p class="muted-text">Phone: ${escapeHtml(item.phone)}</p>` : ""}
          ${item.bio ? `<p class="muted-text">${escapeHtml(item.bio)}</p>` : ""}
          <div class="card-actions">
            <a class="btn btn-ghost btn-sm" href="tel:+917867065129">Contact via Concierge</a>
            ${deleteBtn}
          </div>
        </article>
      `;
    })
    .join("");

  contractorsGrid.querySelectorAll(".delete-contractor-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!currentAccountInfo?.isAdmin) return;
      const id = btn.getAttribute("data-id");
      const { error } = await supabaseClient.from("contractors").delete().eq("id", id);
      if (error) {
        showBanner(`Delete failed: ${error.message}`, "error");
      } else {
        showBanner("Contractor removed.", "success");
        await loadContractors();
      }
    });
  });
}

async function handleWorkUploadSubmit(event) {
  event.preventDefault();
  const user = currentSession?.user;
  if (!user) return;

  const isAdmin = Boolean(currentAccountInfo?.isAdmin);
  const isContractor = currentAccountInfo?.role === "contractor";

  if (!isAdmin && !isContractor) {
    showBanner("Only logged-in Contractors or Admin can upload works.", "error");
    return;
  }

  const title = (workTitleInput?.value || "").trim();
  const description = (workDescInput?.value || "").trim();
  const imageFile = workImageInput?.files?.[0] || null;

  if (!title) {
    showBanner("Please enter a work title.", "error");
    return;
  }

  let targetContractor = currentAccountInfo?.contractorRow || null;
  if (isAdmin) {
    const selectedId = workContractorSelect?.value;
    targetContractor =
      allContractors.find((c) => String(c.id) === String(selectedId)) || null;
    if (!targetContractor) {
      showBanner("Please select a registered contractor first.", "error");
      return;
    }
  }

  const contractorEmail = (
    targetContractor?.email || user.email || ""
  ).toLowerCase();

  if (uploadWorkBtn) uploadWorkBtn.disabled = true;

  try {
    let imageUrl = "";
    let imagePath = "";

    if (imageFile) {
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      imagePath = `${user.id}/${Date.now()}_${safeName}`;

      const { error: uploadErr } = await supabaseClient.storage
        .from(WORK_BUCKET)
        .upload(imagePath, imageFile, { upsert: false });

      if (uploadErr) throw uploadErr;

      const { data: publicUrlData } = supabaseClient.storage
        .from(WORK_BUCKET)
        .getPublicUrl(imagePath);

      imageUrl = publicUrlData?.publicUrl || "";
    }

    const { error: insertErr } = await supabaseClient.from("contractor_works").insert({
      contractor_id: targetContractor?.id || null,
      contractor_user_id: targetContractor?.user_id || (isContractor ? user.id : null),
      contractor_email: contractorEmail,
      title,
      description,
      image_url: imageUrl,
      image_path: imagePath,
      created_by_email: (user.email || "").toLowerCase(),
    });

    if (insertErr) throw insertErr;

    showBanner("Work and image uploaded successfully.", "success");
    uploadWorkForm?.reset();
    await loadWorks();
  } catch (err) {
    showBanner(`Work upload failed: ${err?.message || "Unknown error"}`, "error");
  } finally {
    if (uploadWorkBtn) uploadWorkBtn.disabled = false;
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  if (!authError) return;
  authError.classList.add("hidden");
  authError.textContent = "";

  const email = (emailInput?.value || "").trim().toLowerCase();
  const password = passwordInput?.value || "";
  const fullName = (fullNameInput?.value || "").trim();
  const phone = (phoneInput?.value || "").trim();

  if (!email || !password) {
    authError.textContent = "Please enter both email and password.";
    authError.classList.remove("hidden");
    return;
  }

  if (authSubmitBtn) authSubmitBtn.disabled = true;

  try {
    if (userAuthMode === "signup") {
      if (loginRole !== "user") {
        throw new Error("Only user accounts can self-register.");
      }

      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: LIVE_SITE_URL,
          data: {
            role: "user",
            full_name: fullName,
            phone,
          },
        },
      });
      if (error) throw error;

      if (data?.session?.user) {
        await ensureUserRow(data.session.user);
      }

      showBanner(
        "User account created. Check your email to confirm if required, then log in.",
        "success"
      );
      closeAuthModal();
      return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    const resolved = await resolveAccountRole(data.user);

    if (loginRole === "admin") {
      if (!resolved?.isAdmin) {
        await supabaseClient.auth.signOut();
        throw new Error("This account is not authorized for Login as Admin.");
      }
      showBanner("Logged in as Admin.", "success");
    } else if (loginRole === "contractor") {
      if (resolved?.role !== "contractor") {
        await supabaseClient.auth.signOut();
        throw new Error(
          "This account is not a registered Contractor. Contractors must log in via Login as Contractor using admin-given credentials."
        );
      }
      showBanner("Logged in as Contractor.", "success");
    } else {
      if (resolved?.role === "contractor") {
        await supabaseClient.auth.signOut();
        throw new Error(
          "Contractor accounts cannot log in here. Select 'Login as Contractor' instead."
        );
      }
      await ensureUserRow(data.user);
      showBanner(resolved?.isAdmin ? "Logged in as Admin." : "Logged in as User.", "success");
    }

    closeAuthModal();
  } catch (err) {
    authError.textContent = err?.message || "Authentication failed.";
    authError.classList.remove("hidden");
  } finally {
    if (authSubmitBtn) authSubmitBtn.disabled = false;
  }
}

async function handleForgotSubmit(event) {
  event.preventDefault();
  if (!forgotError) return;
  forgotError.classList.add("hidden");
  forgotError.textContent = "";

  const email = (forgotEmailInput?.value || "").trim().toLowerCase();
  if (!email) {
    forgotError.textContent = "Please enter your email address.";
    forgotError.classList.remove("hidden");
    return;
  }

  if (forgotSubmitBtn) forgotSubmitBtn.disabled = true;

  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: LIVE_SITE_URL,
    });
    if (error) throw error;

    showBanner(`Password reset email sent to ${email}. Check your inbox.`, "success");
    closeAuthModal();
  } catch (err) {
    forgotError.textContent = err?.message || "Could not send reset link.";
    forgotError.classList.remove("hidden");
  } finally {
    if (forgotSubmitBtn) forgotSubmitBtn.disabled = false;
  }
}

async function handleCreateContractor(event) {
  event.preventDefault();
  if (!currentAccountInfo?.isAdmin) {
    showBanner("Only admin can create contractor accounts.", "error");
    return;
  }

  const name = (adminContractorName?.value || "").trim();
  const email = (adminContractorEmail?.value || "").trim().toLowerCase();
  const password = adminContractorPassword?.value || "";
  const trade = adminContractorTrade?.value || "General";
  const city = (adminContractorCity?.value || "").trim();
  const phone = (adminContractorPhone?.value || "").trim();
  const bio = (adminContractorBio?.value || "").trim();

  if (createContractorBtn) createContractorBtn.disabled = true;

  try {
    const accessToken = currentSession?.access_token;
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/create-contractor-account`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password, name, trade, city, phone, bio }),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.error || "Could not create contractor account");
    }

    showBanner(
      `Contractor account created for ${email}. Give them this email and password to log in via Login as Contractor.`,
      "success"
    );
    createContractorForm?.reset();
    await loadContractors();
  } catch (err) {
    showBanner(`Failed to create contractor account: ${err.message}`, "error");
  } finally {
    if (createContractorBtn) createContractorBtn.disabled = false;
  }
}

async function handlePasswordRecoverySubmit(event) {
  event.preventDefault();
  const nextPassword = newPasswordInput?.value || "";
  if (nextPassword.length < 6) {
    showBanner("Password must be at least 6 characters.", "error");
    return;
  }

  const { error } = await supabaseClient.auth.updateUser({ password: nextPassword });
  if (error) {
    showBanner(`Could not update password: ${error.message}`, "error");
    return;
  }

  recoverySection?.classList.add("hidden");
  recoveryForm?.reset();
  showBanner("Password updated successfully.", "success");
}

function handleUrlAuthParams() {
  const hash = window.location.hash || "";
  const search = window.location.search || "";

  if (hash.includes("type=recovery") || search.includes("type=recovery")) {
    recoverySection?.classList.remove("hidden");
    newPasswordInput?.focus();
    showBanner("Enter a new password below to complete your reset.", "success");
  } else if (
    hash.includes("access_token") ||
    hash.includes("type=signup") ||
    search.includes("code=")
  ) {
    showBanner("Email confirmed. You can now log in.", "success");
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

function bindEvents() {
  openAuthBtn?.addEventListener("click", () => openAuthModal("user", "login"));
  lockedLoginUserBtn?.addEventListener("click", () => openAuthModal("user", "login"));
  lockedLoginContractorBtn?.addEventListener("click", () => openAuthModal("contractor", "login"));
  lockedLoginAdminBtn?.addEventListener("click", () => openAuthModal("admin", "login"));
  closeAuthBtn?.addEventListener("click", closeAuthModal);

  authModal?.addEventListener("click", (e) => {
    if (e.target === authModal) closeAuthModal();
  });

  viewLoginTab?.addEventListener("click", () => {
    modalView = "login";
    refreshAuthModalUI();
  });

  viewForgotTab?.addEventListener("click", () => {
    modalView = "forgot";
    refreshAuthModalUI();
  });

  returnToLoginBtn?.addEventListener("click", () => {
    modalView = "login";
    refreshAuthModalUI();
  });

  roleUserBtn?.addEventListener("click", () => {
    loginRole = "user";
    refreshAuthModalUI();
  });

  roleContractorBtn?.addEventListener("click", () => {
    loginRole = "contractor";
    refreshAuthModalUI();
  });

  roleAdminBtn?.addEventListener("click", () => {
    loginRole = "admin";
    refreshAuthModalUI();
  });

  tabLogin?.addEventListener("click", () => {
    userAuthMode = "login";
    refreshAuthModalUI();
  });

  tabSignup?.addEventListener("click", () => {
    if (loginRole === "user") {
      userAuthMode = "signup";
      refreshAuthModalUI();
    }
  });

  authForm?.addEventListener("submit", handleAuthSubmit);
  forgotForm?.addEventListener("submit", handleForgotSubmit);
  createContractorForm?.addEventListener("submit", handleCreateContractor);
  uploadWorkForm?.addEventListener("submit", handleWorkUploadSubmit);
  recoveryForm?.addEventListener("submit", handlePasswordRecoverySubmit);

  logoutBtn?.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    showBanner("Signed out.", "success");
  });

  searchInput?.addEventListener("input", renderContractors);
  tradeFilter?.addEventListener("change", renderContractors);
}

async function initApp() {
  initTheme();
  initAutoHideTopbar();
  bindEvents();
  refreshAuthModalUI();
  handleUrlAuthParams();

  const { data } = await supabaseClient.auth.getSession();
  currentSession = data?.session || null;
  if (currentSession?.user) {
    currentAccountInfo = await resolveAccountRole(currentSession.user);
  }
  updateSessionUI();
  await loadContractors();
  await loadWorks();

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    currentSession = session;
    if (event === "PASSWORD_RECOVERY") {
      recoverySection?.classList.remove("hidden");
      newPasswordInput?.focus();
    }

    if (session?.user) {
      currentAccountInfo = await resolveAccountRole(session.user);
      if (currentAccountInfo?.role === "user") {
        await ensureUserRow(session.user);
      }
    } else {
      currentAccountInfo = null;
    }

    updateSessionUI();
    await loadContractors();
    await loadWorks();
  });
}

initApp();