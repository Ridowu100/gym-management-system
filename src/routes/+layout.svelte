<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient.js';
  import { cart } from '$lib/cartStore.js';

  let { children } = $props();
  let totalItems = $derived($cart.reduce((sum, item) => sum + item.quantity, 0));
  let user = $state(null);

  const ADMIN_EMAIL = 'admin@gym.com';

  onMount(() => {
    supabase.auth.getSession().then(({ data }) => {
      user = data.session?.user ?? null;
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      user = session?.user ?? null;
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  });

  async function handleLogout() {
    await supabase.auth.signOut();
    user = null;
  }
</script>

<style>
  :global(body) {
    background-color: #0f172a;
    color: #f8fafc;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .navbar-custom {
    background-color: #1e293b;
    border-bottom: 2px solid #f59e0b;
  }
  .brand-text {
    color: #f59e0b;
    font-weight: 800;
  }
  .btn-accent {
    background-color: #f59e0b;
    color: #0f172a;
    font-weight: 700;
    border: none;
  }
  .btn-accent:hover {
    background-color: #d97706;
    color: #ffffff;
  }
</style>

<nav class="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top py-3">
  <div class="container">
    <a class="navbar-brand fs-3 brand-text" href="/" aria-label="Richie's Gym Home">
      <i class="bi bi-lightning-charge-fill me-1" aria-hidden="true"></i> RICHIE'S GYM
    </a>
    <button 
      class="navbar-toggler" 
      type="button" 
      data-bs-toggle="collapse" 
      data-bs-target="#navbarNav" 
      aria-label="Toggle navigation menu"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav me-auto ms-3">
        <li class="nav-item">
          <a class="nav-link text-light fw-semibold" href="/">Store Catalogue</a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-light fw-semibold" href="/wishlist">
            <i class="bi bi-heart me-1" aria-hidden="true"></i> Wishlist
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-light fw-semibold" href="/orders">
            <i class="bi bi-box-seam me-1" aria-hidden="true"></i> My Orders
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-light fw-semibold" href="/schedule">
            <i class="bi bi-calendar-week me-1" aria-hidden="true"></i> Timetable
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-warning fw-bold" href="/memberships">
            <i class="bi bi-card-checklist me-1" aria-hidden="true"></i> Memberships
          </a>
        </li>
        {#if user && (user.email === ADMIN_EMAIL || user.email.includes('admin'))}
          <li class="nav-item">
            <a class="nav-link text-danger fw-bold" href="/admin">
              <i class="bi bi-shield-lock me-1" aria-hidden="true"></i> Admin Console
            </a>
          </li>
        {/if}
      </ul>
      <div class="d-flex align-items-center gap-3">
        <a href="/cart" class="btn btn-accent btn-sm px-3 py-2 position-relative" aria-label="Shopping Cart">
          <i class="bi bi-cart-fill me-1" aria-hidden="true"></i> Cart
          {#if totalItems > 0}
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {totalItems}
            </span>
          {/if}
        </a>

        {#if user}
          <button class="btn btn-outline-light btn-sm px-3" onclick={handleLogout} aria-label="Log Out">
            Logout ({user.email.split('@')[0]})
          </button>
        {:else}
          <a href="/login" class="btn btn-outline-warning btn-sm px-3" aria-label="Log In">
            Login
          </a>
        {/if}
      </div>
    </div>
  </div>
</nav>

<main class="container my-4">
  {@render children()}
</main>