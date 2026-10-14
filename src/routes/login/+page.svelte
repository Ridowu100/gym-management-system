<script>
  import { supabase } from '$lib/supabaseClient.js';
  import { goto } from '$app/navigation';

  let email = $state('');
  let password = $state('');
  let isRegistering = $state(false);
  let errorMessage = $state('');
  let message = $state('');
  let loading = $state(false);

  async function handleSubmit(e) {
    e.preventDefault();
    loading = true;
    errorMessage = '';
    message = '';

    if (isRegistering) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        errorMessage = error.message;
      } else {
        message = 'Registration successful! Check your email to confirm, or log in.';
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        errorMessage = error.message;
      } else {
        goto('/');
      }
    }
    loading = false;
  }
</script>

<style>
  .auth-card {
    background-color: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    max-width: 420px;
    margin: 4rem auto;
  }
  .form-control-custom {
    background-color: #0f172a;
    border: 1px solid #334155;
    color: #f8fafc;
  }
  .form-control-custom:focus {
    background-color: #0f172a;
    color: #f8fafc;
    border-color: #f59e0b;
    box-shadow: none;
  }
</style>

<div class="card auth-card p-4 shadow-lg">
  <div class="text-center mb-4">
    <i class="bi bi-person-circle display-4 text-warning"></i>
    <h3 class="fw-bold text-white mt-2">{isRegistering ? 'Create Account' : 'Member Login'}</h3>
    <p class="text-secondary small">Access Richie's Gym portal & memberships</p>
  </div>

  {#if errorMessage}
    <div class="alert alert-danger py-2 small">{errorMessage}</div>
  {/if}

  {#if message}
    <div class="alert alert-success py-2 small">{message}</div>
  {/if}

  <form onsubmit={handleSubmit}>
    <div class="mb-3">
      <label for="email" class="form-label text-light small fw-bold">Email Address</label>
      <input 
        type="email" 
        id="email"
        class="form-control form-control-custom" 
        placeholder="member@example.com" 
        bind:value={email} 
        required 
      />
    </div>

    <div class="mb-4">
      <label for="password" class="form-label text-light small fw-bold">Password</label>
      <input 
        type="password" 
        id="password"
        class="form-control form-control-custom" 
        placeholder="••••••••" 
        bind:value={password} 
        required 
      />
    </div>

    <button type="submit" class="btn btn-warning w-100 fw-bold py-2 text-dark mb-3" disabled={loading}>
      {#if loading}
        <span class="spinner-border spinner-border-sm me-2"></span>Processing...
      {:else}
        {isRegistering ? 'Register' : 'Sign In'}
      {/if}
    </button>
  </form>

  <div class="text-center border-top border-secondary pt-3">
    <button 
      class="btn btn-link text-warning p-0 text-decoration-none small"
      onclick={() => { isRegistering = !isRegistering; errorMessage = ''; message = ''; }}
    >
      {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Register"}
    </button>
  </div>
</div>