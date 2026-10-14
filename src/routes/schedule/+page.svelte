<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient.js';

  let classes = $state([]);
  let loading = $state(true);

  onMount(async () => {
    const { data, error } = await supabase.from('gym_classes').select('*');
    if (!error && data) {
      classes = data;
    }
    loading = false;
  });

  async function handleBook(gymClass) {
    if (gymClass.booked >= gymClass.capacity) {
      alert('Sorry, this class is fully booked!');
      return;
    }

    const { error } = await supabase
      .from('gym_classes')
      .update({ booked: gymClass.booked + 1 })
      .eq('id', gymClass.id);

    if (!error) {
      gymClass.booked += 1;
      alert(`Spot reserved for ${gymClass.title}!`);
    }
  }
</script>

<style>
  .card-class {
    background-color: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
  }
</style>

<div class="text-center my-4">
  <span class="badge bg-warning text-dark px-3 py-2 fw-bold mb-2">Weekly Schedule</span>
  <h1 class="display-5 fw-bold text-white">Fitness Class Timetable</h1>
  <p class="lead text-secondary">Reserve your spot in upcoming fitness and strength sessions.</p>
</div>

{#if loading}
  <div class="text-center my-5 py-5">
    <div class="spinner-border text-warning" role="status"></div>
    <p class="mt-3 text-secondary">Loading Timetable...</p>
  </div>
{:else}
  <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-5">
    {#each classes as gymClass}
      <div class="col">
        <div class="card card-class h-100 p-3 shadow-sm">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge bg-secondary">{gymClass.category}</span>
            <span class="text-warning fw-bold small"><i class="bi bi-clock me-1" aria-hidden="true"></i>{gymClass.day} @ {gymClass.time}</span>
          </div>
          <h4 class="fw-bold text-white mb-1">{gymClass.title}</h4>
          <p class="text-secondary small mb-3">Instructor: <strong class="text-light">{gymClass.instructor}</strong></p>
          
          <div class="mb-3">
            <div class="d-flex justify-content-between small mb-1">
              <span class="text-secondary">Capacity</span>
              <span class={gymClass.booked >= gymClass.capacity ? "text-danger fw-bold" : "text-success fw-bold"}>
                {gymClass.booked} / {gymClass.capacity} Spots Booked
              </span>
            </div>
            <div class="progress" style="height: 6px; background-color: #0f172a;">
              <div 
                class="progress-bar {gymClass.booked >= gymClass.capacity ? 'bg-danger' : 'bg-warning'}" 
                style="width: {(gymClass.booked / gymClass.capacity) * 100}%"
              ></div>
            </div>
          </div>

          <button 
            class="btn btn-warning w-100 fw-bold text-dark mt-auto"
            disabled={gymClass.booked >= gymClass.capacity}
            onclick={() => handleBook(gymClass)}
          >
            {gymClass.booked >= gymClass.capacity ? 'Fully Booked' : 'Reserve Spot'}
          </button>
        </div>
      </div>
    {/each}
  </div>
{/if}