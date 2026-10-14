<script>
  import { wishlist, removeFromWishlist } from '$lib/wishlistStore.js';
  import { addToCart } from '$lib/cartStore.js';

  let items = $derived($wishlist);

  function moveToCart(product) {
    addToCart(product);
    removeFromWishlist(product.id);
  }
</script>

<style>
  .card-dark {
    background-color: #1e293b;
    border: 1px solid #334155;
  }
</style>

<div class="my-4">
  <h2 class="fw-bold text-white mb-4">
    <i class="bi bi-heart-fill me-2 text-danger" aria-hidden="true"></i>My Saved Wishlist
  </h2>

  {#if items.length === 0}
    <div class="alert alert-dark text-center py-5 border-secondary text-light">
      <h4 class="fw-bold">Your wishlist is empty</h4>
      <p class="text-secondary mb-3">Save your favourite products here for later.</p>
      <a href="/" class="btn btn-warning fw-bold">Browse Store Catalogue</a>
    </div>
  {:else}
    <div class="row row-cols-1 row-cols-md-3 g-4">
      {#each items as product}
        <div class="col">
          <div class="card card-dark h-100 p-3 rounded-3">
            <img src={product.image_url} alt={product.name} class="rounded mb-3" style="height: 160px; object-fit: cover;" />
            <h5 class="fw-bold text-white mb-1">{product.name}</h5>
            <p class="text-warning small mb-2">{product.brand}</p>
            <div class="text-success fw-bold mb-3 fs-5">€{Number(product.price).toFixed(2)}</div>

            <div class="d-flex gap-2 mt-auto">
              <button class="btn btn-warning btn-sm w-100 fw-bold text-dark" onclick={() => moveToCart(product)}>
                Move to Cart
              </button>
              <button class="btn btn-outline-danger btn-sm" onclick={() => removeFromWishlist(product.id)} aria-label="Remove item">
                <i class="bi bi-trash" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>