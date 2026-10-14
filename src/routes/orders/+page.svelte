<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient.js';

  let orders = $state([]);
  let loading = $state(true);
  let user = $state(null);

  onMount(async () => {
    const { data: authData } = await supabase.auth.getSession();
    user = authData.session?.user ?? null;

    if (user) {
      await fetchOrders();
    }
    loading = false;
  });

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false });
    if (data) orders = data;
  }

  async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (!error) {
      alert('Order cancelled successfully.');
      await fetchOrders();
    } else {
      alert('Error cancelling order: ' + error.message);
    }
  }
</script>

<style>
  .order-card {
    background-color: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
  }
</style>

<div class="my-4">
  <h2 class="fw-bold text-white mb-4">
    <i class="bi bi-box-seam text-warning me-2" aria-hidden="true"></i>My Order History
  </h2>

  {#if loading}
    <div class="text-center my-5 py-5">
      <div class="spinner-border text-warning" role="status"></div>
      <p class="mt-3 text-secondary">Loading Order History...</p>
    </div>
  {:else if !user}
    <div class="alert alert-dark text-center my-5 border-secondary text-light">
      Please log in to view your past orders.
    </div>
  {:else if orders.length === 0}
    <div class="alert alert-dark text-center py-5 border-secondary text-light">
      <h4 class="fw-bold">No orders found</h4>
      <p class="text-secondary mb-3">You haven't placed any orders yet.</p>
      <a href="/" class="btn btn-warning fw-bold">Browse Catalogue</a>
    </div>
  {:else}
    <div class="d-flex flex-column gap-3">
      {#each orders as order}
        <div class="card order-card p-4">
          <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary">
            <div>
              <span class="badge bg-warning text-dark me-2">{order.status}</span>
              <span class="text-secondary small">Placed on {new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div class="fw-bold text-success fs-5">
              €{Number(order.total_amount).toFixed(2)}
            </div>
          </div>

          <div class="mb-3">
            <h6 class="text-warning fw-bold">Shipping To:</h6>
            <p class="text-light small mb-0">{order.shipping_name}</p>
            <p class="text-secondary small mb-0">{order.shipping_address}, {order.eircode}</p>
          </div>

          <div class="mb-3">
            <h6 class="text-warning fw-bold">Items:</h6>
            <ul class="list-unstyled mb-0">
              {#each order.items as item}
                <li class="text-light small">
                  • {item.name} x {item.quantity} (€{Number(item.price).toFixed(2)})
                </li>
              {/each}
            </ul>
          </div>

          <div class="d-flex justify-content-end">
            <button class="btn btn-outline-danger btn-sm" onclick={() => cancelOrder(order.id)}>
              Cancel / Delete Order
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>