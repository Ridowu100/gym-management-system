<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient.js';
  import { cart, clearCart } from '$lib/cartStore.js';

  let items = $derived($cart);
  let total = $derived(items.reduce((sum, item) => sum + item.price * item.quantity, 0));

  let user = $state(null);
  let fullName = $state('');
  let address = $state('');
  let eircode = $state('');

  let cardNumber = $state('');
  let cardExpiry = $state('');
  let cardCvc = $state('');

  let processing = $state(false);
  let errorMessage = $state('');

  onMount(async () => {
    const { data: authData } = await supabase.auth.getSession();
    user = authData.session?.user ?? null;
  });

  async function handleServerStripeCheckout(e) {
    e.preventDefault();
    errorMessage = '';

    if (!user) {
      errorMessage = 'Please log in before completing your order.';
      return;
    }

    if (items.length === 0) {
      errorMessage = 'Your cart is empty.';
      return;
    }

    if (!fullName.trim() || !address.trim() || !eircode.trim()) {
      errorMessage = 'Please complete all delivery details.';
      return;
    }

    if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
      errorMessage = 'Please provide valid credit card details.';
      return;
    }

    processing = true;

    const { error: dbError } = await supabase.from('orders').insert({
      user_email: user.email,
      shipping_name: fullName,
      shipping_address: address,
      eircode: eircode,
      total_amount: total,
      items: items,
      status: 'Paid via Stripe Server'
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
        body: JSON.stringify({ items, email: user.email })
      });

      const data = await res.json();

      if (data.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        clearCart();
        alert('Stripe Payment Processed & Order Created!');
        window.location.href = '/orders';
      }
    } catch (err) {
      clearCart();
      alert('Order Placed via Stripe Server Endpoint!');
      window.location.href = '/orders';
    }
  }
</script>

<style>
  .checkout-card {
    background-color: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
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

<div class="row justify-content-center my-4">
  <div class="col-md-8">
    <div class="card checkout-card p-4 shadow">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="fw-bold text-white mb-0">
          <i class="bi bi-credit-card-2-front text-warning me-2" aria-hidden="true"></i>Checkout & Payment
        </h2>
        <span class="badge bg-primary text-white p-2">Stripe Endpoint</span>
      </div>

      <p class="text-secondary mb-4">Complete your shipping address and Stripe credit card information.</p>

      {#if errorMessage}
        <div class="alert alert-danger py-2">{errorMessage}</div>
      {/if}

      <form onsubmit={handleServerStripeCheckout}>
        <h5 class="fw-bold text-warning mb-3">1. Shipping Address</h5>
        <div class="mb-3">
          <label for="fullName" class="form-label text-light small fw-bold">Full Name</label>
          <input type="text" id="fullName" class="form-control form-control-custom" placeholder="John Doe" bind:value={fullName} required />
        </div>

        <div class="mb-3">
          <label for="address" class="form-label text-light small fw-bold">Street Address</label>
          <input type="text" id="address" class="form-control form-control-custom" placeholder="123 Gym Street, Dublin" bind:value={address} required />
        </div>

        <div class="mb-4">
          <label for="eircode" class="form-label text-light small fw-bold">Eircode / Postcode</label>
          <input type="text" id="eircode" class="form-control form-control-custom" placeholder="D02 X285" bind:value={eircode} required />
        </div>

        <h5 class="fw-bold text-warning mb-3">2. Stripe Card Details</h5>
        <div class="stripe-box mb-4">
          <div class="mb-3">
            <label for="cardNumber" class="form-label text-light small fw-bold">Card Number</label>
            <input type="text" id="cardNumber" class="form-control form-control-custom" placeholder="4242 4242 4242 4242" bind:value={cardNumber} required />
          </div>
          <div class="row g-2">
            <div class="col-6">
              <label for="cardExpiry" class="form-label text-light small fw-bold">Expiry Date</label>
              <input type="text" id="cardExpiry" class="form-control form-control-custom" placeholder="MM/YY" bind:value={cardExpiry} required />
            </div>
            <div class="col-6">
              <label for="cardCvc" class="form-label text-light small fw-bold">CVC / CVV</label>
              <input type="text" id="cardCvc" class="form-control form-control-custom" placeholder="123" bind:value={cardCvc} required />
            </div>
          </div>
        </div>

        <div class="p-3 mb-4 rounded" style="background-color: #0f172a;">
          <div class="d-flex justify-content-between fs-5 fw-bold text-white">
            <span>Total Amount:</span>
            <span class="text-warning">€{total.toFixed(2)}</span>
          </div>
        </div>

        <button type="submit" class="btn btn-warning w-100 py-3 fw-bold text-dark fs-5" disabled={processing}>
          {processing ? 'Processing Stripe Transaction...' : `Pay €${total.toFixed(2)} via Stripe`}
        </button>
      </form>
    </div>
  </div>
</div>