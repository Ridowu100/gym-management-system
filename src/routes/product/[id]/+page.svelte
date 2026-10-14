<script>
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient.js';
  import { addToCart } from '$lib/cartStore.js';
  import { addToWishlist } from '$lib/wishlistStore.js';

  let productId = $derived(page.params.id);
  let product = $state(null);
  let reviews = $state([]);
  let loading = $state(true);
  let user = $state(null);

  let newRating = $state(5);
  let newComment = $state('');
  let submitting = $state(false);

  onMount(async () => {
    const { data: authData } = await supabase.auth.getSession();
    user = authData.session?.user ?? null;

    const { data: prodData } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (prodData) {
      product = prodData;
      await fetchReviews();
    }
    loading = false;
  });

  async function fetchReviews() {
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (data) reviews = data;
  }

  async function handleAddReview(e) {
    e.preventDefault();
    if (!user) {
      alert('Please log in to leave a review.');
      return;
    }
    if (!newComment.trim()) return;

    submitting = true;
    const { error } = await supabase.from('product_reviews').insert({
      product_id: productId,
      user_email: user.email,
      rating: newRating,
      comment: newComment
    });

    if (!error) {
      newComment = '';
      newRating = 5;
      await fetchReviews();
    } else {
      alert('Error submitting review: ' + error.message);
    }
    submitting = false;
  }
</script>

<style>
  .detail-card, .review-card {
    background-color: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
  }
  .star-rating {
    color: #f59e0b;
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

{#if loading}
  <div class="text-center my-5 py-5">
    <div class="spinner-border text-warning" role="status"></div>
    <p class="mt-3 text-secondary">Loading product details...</p>
  </div>
{:else if !product}
  <div class="alert alert-dark text-center my-5 border-secondary text-light">
    Product not found. <a href="/" class="text-warning">Back to Catalogue</a>
  </div>
{:else}
  <div class="card detail-card p-4 my-4">
    <div class="row g-4 align-items-center">
      <div class="col-md-6">
        <img 
          src={product.image_url} 
          alt={product.name} 
          class="img-fluid rounded-3 shadow" 
          style="max-height: 400px; width: 100%; object-fit: cover;"
        />
      </div>
      <div class="col-md-6">
        <span class="badge bg-secondary mb-2">{product.category}</span>
        <h2 class="fw-bold text-white mb-2">{product.name}</h2>
        <h5 class="text-warning mb-3">Brand: {product.brand}</h5>
        <p class="text-secondary lead fs-6 mb-4">{product.description}</p>
        
        <div class="d-flex align-items-center gap-3 mb-4">
          <span class="display-6 fw-bold text-success">€{Number(product.price).toFixed(2)}</span>
          <span class="badge bg-outline-success text-success border border-success p-2">In Stock</span>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-warning btn-lg fw-bold text-dark px-4" onclick={() => addToCart(product)}>
            <i class="bi bi-cart-plus me-2" aria-hidden="true"></i> Add to Cart
          </button>
          <button class="btn btn-outline-danger btn-lg px-3" onclick={() => addToWishlist(product)} aria-label="Add to Wishlist">
            <i class="bi bi-heart" aria-hidden="true"></i>
          </button>
          <a href="/" class="btn btn-outline-secondary btn-lg text-light">
            Back to Catalogue
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="row mt-5">
    <div class="col-md-6">
      <h3 class="fw-bold text-white mb-3">Customer Reviews</h3>
      {#if reviews.length === 0}
        <p class="text-secondary">No reviews yet. Be the first to leave one!</p>
      {:else}
        <div class="d-flex flex-column gap-3">
          {#each reviews as r}
            <div class="card review-card p-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="fw-bold text-light">{r.user_email}</span>
                <div class="star-rating">
                  {#each Array(5) as _, idx}
                    <i class="bi {idx < r.rating ? 'bi-star-fill' : 'bi-star'}" aria-hidden="true"></i>
                  {/each}
                </div>
              </div>
              <p class="text-secondary mb-0 small">{r.comment}</p>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="col-md-6 mt-4 mt-md-0">
      <div class="card review-card p-4">
        <h4 class="fw-bold text-white mb-3">Leave a Review</h4>
        <form onsubmit={handleAddReview}>
          <div class="mb-3">
            <label for="rating-select" class="form-label text-light small fw-bold">Star Rating</label>
            <select id="rating-select" class="form-select form-control-custom" bind:value={newRating}>
              <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
              <option value={4}>⭐⭐⭐⭐ (4/5)</option>
              <option value={3}>⭐⭐⭐ (3/5)</option>
              <option value={2}>⭐⭐ (2/5)</option>
              <option value={1}>⭐ (1/5)</option>
            </select>
          </div>

          <div class="mb-3">
            <label for="review-comment" class="form-label text-light small fw-bold">Your Review</label>
            <textarea 
              id="review-comment"
              class="form-control form-control-custom" 
              rows="3" 
              placeholder="Write your feedback here..." 
              bind:value={newComment}
              required
            ></textarea>
          </div>

          <button type="submit" class="btn btn-warning fw-bold text-dark w-100" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}