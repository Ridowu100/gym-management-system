<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient.js';

  let activeTab = $state('products');
  let products = $state([]);
  let orders = $state([]);
  let bookings = $state([]);
  let loading = $state(true);

  let newName = $state('');
  let newBrand = $state('');
  let newCategory = $state('Supplements');
  let newPrice = $state('');
  let newDescription = $state('');
  let newImage = $state('');

  onMount(async () => {
    await fetchAllData();
    loading = false;
  });

  async function fetchAllData() {
    const { data: pData } = await supabase.from('products').select('*').order('name');
    if (pData) products = pData;

    const { data: oData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (oData) orders = oData;

    const { data: bData } = await supabase
      .from('class_bookings')
      .select('id, user_email, booked_at, gym_classes(title, day, time, instructor)');
    if (bData) bookings = bData;
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    if (!newName || !newPrice) return;

    const { error } = await supabase.from('products').insert({
      name: newName,
      brand: newBrand,
      category: newCategory,
      price: parseFloat(newPrice),
      description: newDescription,
      image_url: newImage || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80'
    });

    if (!error) {
      alert('Product added successfully!');
      newName = ''; newBrand = ''; newPrice = ''; newDescription = ''; newImage = '';
      await fetchAllData();
    } else {
      alert('Error adding product: ' + error.message);
    }
  }

  async function handleDeleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      await fetchAllData();
    } else {
      alert('Error deleting product: ' + error.message);
    }
  }
</script>

<style>
  .admin-card {
    background-color: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
  }
  .form-control-custom, .form-select-custom {
    background-color: #0f172a;
    border: 1px solid #334155;
    color: #f8fafc;
  }
</style>

<div class="my-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <span class="badge bg-danger text-white px-3 py-2 fw-bold mb-2">Staff Portal</span>
      <h1 class="display-6 fw-bold text-white mb-0">Admin Management Console</h1>
    </div>
    
    <div class="btn-group">
      <button 
        class="btn {activeTab === 'products' ? 'btn-warning fw-bold' : 'btn-outline-secondary text-light'}" 
        onclick={() => activeTab = 'products'}
      >
        Products ({products.length})
      </button>
      <button 
        class="btn {activeTab === 'orders' ? 'btn-warning fw-bold' : 'btn-outline-secondary text-light'}" 
        onclick={() => activeTab = 'orders'}
      >
        Orders ({orders.length})
      </button>
      <button 
        class="btn {activeTab === 'roster' ? 'btn-warning fw-bold' : 'btn-outline-secondary text-light'}" 
        onclick={() => activeTab = 'roster'}
      >
        Class Roster ({bookings.length})
      </button>
    </div>
  </div>

  {#if loading}
    <div class="text-center my-5 py-5">
      <div class="spinner-border text-warning" role="status"></div>
      <p class="mt-3 text-secondary">Loading Admin Console...</p>
    </div>
  {:else if activeTab === 'products'}
    <div class="row g-4">
      <div class="col-md-5">
        <div class="card admin-card p-4">
          <h4 class="fw-bold text-white mb-3">Add New Inventory Item</h4>
          <form onsubmit={handleAddProduct}>
            <div class="mb-2">
              <label class="form-label text-light small fw-bold" for="product-name">Product Name</label>
              <input id="product-name" type="text" class="form-control form-control-custom" bind:value={newName} required />
            </div>
            <div class="mb-2">
              <label class="form-label text-light small fw-bold" for="product-brand">Brand</label>
              <input id="product-brand" type="text" class="form-control form-control-custom" bind:value={newBrand} required />
            </div>
            <div class="mb-2">
              <label class="form-label text-light small fw-bold" for="product-category">Category</label>
              <select id="product-category" class="form-select form-select-custom" bind:value={newCategory}>
                <option value="Supplements">Supplements</option>
                <option value="Equipment">Equipment</option>
                <option value="Accessories">Accessories</option>
                <option value="Clothing">Clothing</option>
              </select>
            </div>
            <div class="mb-2">
              <label class="form-label text-light small fw-bold" for="product-price">Price (€)</label>
              <input id="product-price" type="number" step="0.01" class="form-control form-control-custom" bind:value={newPrice} required />
            </div>
            <div class="mb-2">
              <label class="form-label text-light small fw-bold" for="product-image">Image URL</label>
              <input id="product-image" type="url" class="form-control form-control-custom" placeholder="https://..." bind:value={newImage} />
            </div>
            <div class="mb-3">
              <label class="form-label text-light small fw-bold" for="product-description">Description</label>
              <textarea id="product-description" class="form-control form-control-custom" rows="2" bind:value={newDescription}></textarea>
            </div>
            <button type="submit" class="btn btn-warning fw-bold text-dark w-100">Add Product to Store</button>
          </form>
        </div>
      </div>

      <div class="col-md-7">
        <div class="card admin-card shadow-sm">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-dark table-hover mb-0 align-middle">
                <thead>
                  <tr class="border-secondary text-warning">
                    <th class="p-3">Item</th>
                    <th class="p-3">Category</th>
                    <th class="p-3">Price</th>
                    <th class="p-3 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {#each products as p}
                    <tr class="border-secondary">
                      <td class="p-3 fw-bold text-light">{p.name}</td>
                      <td class="p-3"><span class="badge bg-secondary">{p.category}</span></td>
                      <td class="p-3 text-success fw-bold">€{Number(p.price).toFixed(2)}</td>
                      <td class="p-3 text-end">
                        <button class="btn btn-outline-danger btn-sm" onclick={() => handleDeleteProduct(p.id)} aria-label="Delete product">
                          <i class="bi bi-trash" aria-hidden="true"></i>
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

  {:else if activeTab === 'orders'}
    <div class="card admin-card shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0 align-middle">
            <thead>
              <tr class="border-secondary text-warning">
                <th class="p-3">Customer</th>
                <th class="p-3">Address</th>
                <th class="p-3">Total</th>
                <th class="p-3">Date</th>
                <th class="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {#each orders as o}
                <tr class="border-secondary">
                  <td class="p-3 fw-bold text-light">{o.shipping_name} ({o.user_email})</td>
                  <td class="p-3 text-secondary">{o.shipping_address}, {o.eircode}</td>
                  <td class="p-3 text-success fw-bold">€{Number(o.total_amount).toFixed(2)}</td>
                  <td class="p-3 text-secondary small">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td class="p-3"><span class="badge bg-warning text-dark">{o.status}</span></td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>

  {:else if activeTab === 'roster'}
    <div class="card admin-card shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0 align-middle">
            <thead>
              <tr class="border-secondary text-warning">
                <th class="p-3">Member Email</th>
                <th class="p-3">Class Title</th>
                <th class="p-3">Schedule</th>
                <th class="p-3">Instructor</th>
              </tr>
            </thead>
            <tbody>
              {#each bookings as b}
                <tr class="border-secondary">
                  <td class="p-3 fw-bold text-light">{b.user_email}</td>
                  <td class="p-3"><span class="badge bg-warning text-dark">{b.gym_classes?.title}</span></td>
                  <td class="p-3 text-secondary">{b.gym_classes?.day} @ {b.gym_classes?.time}</td>
                  <td class="p-3 text-light">{b.gym_classes?.instructor}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  {/if}
</div>