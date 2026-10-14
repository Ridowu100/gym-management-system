<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient.js';
  import { addToCart } from '$lib/cartStore.js';

  let products = $state([]);
  let searchQuery = $state('');
  let selectedCategory = $state('All');
  let loading = $state(true);

  let currentPage = $state(1);
  const itemsPerPage = 4;

  onMount(async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data) {
      products = data;
    }
    loading = false;
  });

  let filteredProducts = $derived(
    products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
  );

  let totalPages = $derived(Math.ceil(filteredProducts.length / itemsPerPage));

  let paginatedProducts = $derived(
    filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  );

  function changePage(page) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }
</script>

<style>
  .card-custom {
    background-color: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    overflow: hidden;
  }
  .price-tag {
    color: #10b981;
    font-size: 1.25rem;
    font-weight: 700;
  }
  .btn-buy {
    background-color: #f59e0b;
    color: #0f172a;
    font-weight: 700;
    border: none;
  }
  .form-control-custom, .form-select-custom {
    background-color: #1e293b;
    border: 1px solid #334155;
    color: #f8fafc;
  }
  .product-link {
    color: #f8fafc;
    text-decoration: none;
  }
  .product-link:hover {
    color: #f59e0b;
  }
</style>

<div class="row mb-4 g-3 align-items-center mt-2">
  <div class="col-md-8">
    <input 
      type="text" 
      class="form-control form-control-custom py-2" 
      placeholder="Search products..." 
      bind:value={searchQuery}
      oninput={() => currentPage = 1}
    />
  </div>
  <div class="col-md-4">
    <select 
      class="form-select form-select-custom py-2" 
      bind:value={selectedCategory}
      onchange={() => currentPage = 1}
    >
      <option value="All">All Categories</option>
      <option value="Supplements">Supplements</option>
      <option value="Equipment">Equipment</option>
      <option value="Accessories">Accessories</option>
      <option value="Clothing">Clothing</option>
    </select>
  </div>
</div>

{#if loading}
  <div class="text-center my-5 py-5">
    <div class="spinner-border text-warning" role="status"></div>
    <p class="mt-3 text-secondary">Loading Catalogue...</p>
  </div>
{:else if filteredProducts.length === 0}
  <div class="alert alert-dark text-center my-5 border-secondary text-light">
    No products found.
  </div>
{:else}
  <div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
    {#each paginatedProducts as product}
      <div class="col">
        <div class="card card-custom h-100 shadow-sm">
          <a href={`/product/${product.id}`} aria-label={`View ${product.name}`}>
            <img 
              src={product.image_url} 
              class="card-img-top" 
              alt={product.name} 
              style="height: 180px; object-fit: cover;" 
            />
          </a>
          <div class="card-body d-flex flex-column p-3">
            <span class="badge bg-secondary mb-2 w-auto align-self-start">{product.category}</span>
            
            <a href={`/product/${product.id}`} class="product-link">
              <h6 class="card-title fw-bold mb-1">{product.name}</h6>
            </a>

            <p class="text-warning small mb-2">Brand: {product.brand}</p>
            <p class="card-text text-secondary small flex-grow-1">{product.description}</p>
            <div class="d-flex align-items-center justify-content-between mt-3 pt-2 border-top border-secondary">
              <span class="price-tag">€{Number(product.price).toFixed(2)}</span>
              <button class="btn btn-buy btn-sm px-3" onclick={() => addToCart(product)}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>

  {#if totalPages > 1}
    <div class="d-flex justify-content-center align-items-center gap-2 mt-4">
      <button 
        class="btn btn-outline-secondary btn-sm text-light" 
        disabled={currentPage === 1}
        onclick={() => changePage(currentPage - 1)}
      >
        Previous
      </button>

      {#each Array(totalPages) as _, idx}
        <button 
          class="btn btn-sm {currentPage === idx + 1 ? 'btn-warning fw-bold text-dark' : 'btn-outline-secondary text-light'}"
          onclick={() => changePage(idx + 1)}
        >
          {idx + 1}
        </button>
      {/each}

      <button 
        class="btn btn-outline-secondary btn-sm text-light" 
        disabled={currentPage === totalPages}
        onclick={() => changePage(currentPage + 1)}
      >
        Next
      </button>
    </div>
  {/if}
{/if}