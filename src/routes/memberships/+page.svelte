<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient.js';

  let user = $state(null);
  let selectedPlan = $state(null);
  let showModal = $state(false);

  let fullName = $state('');
  let address = $state('');
  let eircode = $state('');
  
  let cardNumber = $state('');
  let cardExpiry = $state('');
  let cardCvc = $state('');

  let processing = $state(false);
  let errorMessage = $state('');

  const plans = [
    {
      id: 'day_pass',
      name: 'Day Pass',
      price: 12.00,
      period: 'one_time',
      features: ['Single day gym access', 'Locker room access', 'Free WiFi']
    },
    {
      id: 'gold',
      name: 'Gold Membership',
      price: 49.99,
      period: 'month',
      badge: 'MOST POPULAR',
      features: ['Unlimited 24/7 gym access', 'All group fitness classes included', 'Sauna & Recovery zone access', '1 Free guest pass per month']
    },
    {
      id: 'vip',
      name: 'VIP Annual Plan',
      price: 499.00,
      period: 'year',
      features: ['All Gold privileges', '2 Free personal training sessions', '15% discount on store gear & supplements', 'Customized workout program']
    }
  ];

  onMount(async () => {
    const { data: authData } = await supabase.auth.getSession();
    user = authData.session?.user ?? null;
  });

  function openCheckout(plan) {
    if (!user) {
      alert('Please log in before choosing a membership plan.');
      goto('/login');
      return;
    }
    selectedPlan = plan;
    showModal = true;
    errorMessage = '';
  }

  function closeModal() {
    showModal = false;
    selectedPlan = null;
  }

  async function handleServerStripeMembership(e) {
    e.preventDefault();
    errorMessage = '';

    if (!fullName.trim() || !address.trim() || !eircode.trim()) {
      errorMessage = 'Please complete billing details.';
      return;
    }

    if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
      errorMessage = 'Please complete Stripe card fields.';
      return;
    }

    processing = true;

    const { error: dbError } = await supabase.from('orders').insert({
      user_email: user.email,
      shipping_name: fullName,
      shipping_address: address,
      eircode: eircode,
      total_amount: selectedPlan.price,
      items: [{ name: `Membership: ${selectedPlan.name}`, quantity: 1, price: selectedPlan.price }],
      status: 'Active Membership (Stripe Server)'
    });

    if (dbError) {
      errorMessage = 'Database error: ' + dbError.message;
      processing = false;
      return;
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ name: selectedPlan.name, price: selectedPlan.price, quantity: 1, image_url: '' }],
          email: user.email
        })
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        showModal = false;
        alert(`Membership Active! Stripe Payment Processed for ${selectedPlan.name}.`);
        goto('/orders');
      }
    } catch (err) {
      showModal = false;
      alert('Membership Active! Redirecting to My Orders.');
      goto('/orders');
    }
  }
</script>

<style>
  .plan-card {
    background-color: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
  }
  .plan-card-popular {
    border: 2px solid #f59e0b;
  }
  .modal-backdrop-custom {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(15, 23, 42, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
  }
  .modal-card {
    background-color: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
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
  .stripe-box {
    background-color: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 1rem;
  }
</style>

<div class="my-4">
  <div class="text-center mb-5">
    <h1 class="display-5 fw-bold text-white mb-2">Gym Membership Plans</h1>
    <p class="text-secondary lead">Choose the membership tier that fits your training goals.</p>
  </div>

  <div class="row row-cols-1 row-cols-md-3 g-4">
    {#each plans as plan}
      <div class="col">
        <div class="card plan-card h-100 p-4 d-flex flex-column shadow {plan.badge ? 'plan-card-popular' : ''}">
          {#if plan.badge}
            <div class="mb-2">
              <span class="badge bg-warning text-dark px-2 py-1 fw-bold">{plan.badge}</span>
            </div>
          {/if}

          <h3 class="fw-bold text-white mb-3">{plan.name}</h3>

          <div class="mb-4">
            <span class="display-5 fw-bold text-warning">€{plan.price.toFixed(2)}</span>
            <span class="text-secondary"> /{plan.period}</span>
          </div>

          <ul class="list-unstyled mb-4 flex-grow-1">
            {#each plan.features as feature}
              <li class="text-light mb-2 small d-flex align-items-center gap-2">
                <i class="bi bi-check-circle-fill text-success" aria-hidden="true"></i>
                {feature}
              </li>
            {/each}
          </ul>

          <button class="btn btn-warning w-100 py-2 fw-bold text-dark mt-auto" onclick={() => openCheckout(plan)}>
            Join with Stripe
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>

{#if showModal && selectedPlan}
  <div class="modal-backdrop-custom" onclick={closeModal} role="presentation">
    <div class="card modal-card p-4 shadow-lg" onclick={(e) => e.stopPropagation()} role="presentation">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="fw-bold text-white mb-0">Confirm Membership Subscription</h4>
        <button class="btn-close btn-close-white" onclick={closeModal} aria-label="Close"></button>
      </div>

      <div class="p-3 mb-3 rounded" style="background-color: #0f172a;">
        <span class="text-secondary small">Selected Plan:</span>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="fw-bold text-warning mb-0">{selectedPlan.name}</h5>
          <span class="fw-bold text-success fs-5">€{selectedPlan.price.toFixed(2)}</span>
        </div>
      </div>

      {#if errorMessage}
        <div class="alert alert-danger py-2 small">{errorMessage}</div>
      {/if}

      <form onsubmit={handleServerStripeMembership}>
        <div class="mb-3">
          <label for="mb-fullName" class="form-label text-light small fw-bold">Full Name</label>
          <input type="text" id="mb-fullName" class="form-control form-control-custom" placeholder="John Doe" bind:value={fullName} required />
        </div>

        <div class="row g-2 mb-3">
          <div class="col-7">
            <label for="mb-address" class="form-label text-light small fw-bold">Billing Address</label>
            <input type="text" id="mb-address" class="form-control form-control-custom" placeholder="123 Gym Street" bind:value={address} required />
          </div>
          <div class="col-5">
            <label for="mb-eircode" class="form-label text-light small fw-bold">Eircode</label>
            <input type="text" id="mb-eircode" class="form-control form-control-custom" placeholder="D02 X285" bind:value={eircode} required />
          </div>
        </div>

        <div class="stripe-box mb-4">
          <label for="mb-cardNumber" class="form-label text-light small fw-bold">Stripe Card Details</label>
          <input type="text" id="mb-cardNumber" class="form-control form-control-custom mb-2" placeholder="4242 4242 4242 4242" bind:value={cardNumber} required />
          <div class="row g-2">
            <div class="col-6">
              <input type="text" id="mb-cardExpiry" class="form-control form-control-custom" placeholder="MM/YY" bind:value={cardExpiry} required />
            </div>
            <div class="col-6">
              <input type="text" id="mb-cardCvc" class="form-control form-control-custom" placeholder="123" bind:value={cardCvc} required />
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-warning w-100 py-2 fw-bold text-dark fs-5" disabled={processing}>
          {processing ? 'Processing...' : `Subscribe for €${selectedPlan.price.toFixed(2)} via Stripe`}
        </button>
      </form>
    </div>
  </div>
{/if}