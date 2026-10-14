<script>
  import { cart, updateQuantity, removeFromCart } from '$lib/cartStore.js';

  let items = $derived($cart);
  let total = $derived(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
</script>

<style>
  .card-dark {
    background-color: #1e293b;
    border: 1px solid #334155;
  }
</style>

<div class="row">
  <div class="col-md-8">
    <h2 class="fw-bold text-white mb-4">
      <i class="bi bi-cart3 me-2 text-warning" aria-hidden="true"></i>Your Shopping Cart
    </h2>

    {#if items.length === 0}
      <div class="alert alert-dark text-center py-5 border-secondary text-light">
        <h4 class="fw-bold">Your cart is empty</h4>
        <p class="text-secondary mb-3">Check out our store catalogue to add gear and nutrition.</p>
        <a href="/" class="btn btn-warning fw-bold">Back to Store Catalogue</a>
      </div>
    {:else}
      <div class="card card-dark rounded-3">
        <div class="card-body p-0">
          <ul class="list-group list-group-flush border-0">
            {#each items as item}
              <li class="list-group-item bg-transparent text-light border-secondary d-flex align-items-center justify-content-between p-3">
                <div class="d-flex align-items-center gap-3">
                  <img src={item.image_url} alt={item.name} class="rounded" style="width: 60px; height: 60px; object-fit: cover;" />
                  <div>
                    <h6 class="mb-0 fw-bold">{item.name}</h6>
                    <small class="text-warning">{item.brand}</small>
                    <div class="text-success fw-bold">€{Number(item.price).toFixed(2)}</div>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-3">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary text-light" onclick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity">-</button>
                    <span class="btn btn-outline-secondary text-light disabled fw-bold px-3">{item.quantity}</span>
                    <button class="btn btn-outline-secondary text-light" onclick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity">+</button>
                  </div>
                  <button class="btn btn-outline-danger btn-sm" onclick={() => removeFromCart(item.id)} aria-label="Remove item">
                    <i class="bi bi-trash" aria-hidden="true"></i>
                  </button>
                </div>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    {/if}
  </div>

  <div class="col-md-4 mt-4 mt-md-0">
    <div class="card card-dark rounded-3 p-3">
      <h5 class="fw-bold text-white mb-3">Order Summary</h5>
      <div class="d-flex justify-content-between mb-2 text-secondary">
        <span>Subtotal</span>
        <span class="text-light">€{total.toFixed(2)}</span>
      </div>
      <div class="d-flex justify-content-between mb-3 text-secondary">
        <span>Shipping</span>
        <span class="text-success fw-bold">Free</span>
      </div>
      <hr class="border-secondary" />
      <div class="d-flex justify-content-between mb-4 fs-5 fw-bold text-white">
        <span>Total</span>
        <span class="text-warning">€{total.toFixed(2)}</span>
      </div>
      <a 
        href="/checkout" 
        class="btn btn-warning w-100 py-2 fw-bold text-dark {items.length === 0 ? 'disabled' : ''}" 
      >
        Proceed to Checkout
      </a>
    </div>
  </div>
</div>