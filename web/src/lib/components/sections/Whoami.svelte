<script lang="ts">
</script>

<div class="section whoami">
  <div class="profile">
    <div class="avatar-placeholder">
      <img src="/assets/yorha.svg" alt="YoRHa Logo" class="logo" />
    </div>

    <div class="info">
      <h3>nier-archive-site</h3>
      <p class="designation">proof of concept</p>
      <p class="status">Status: Online</p>
    </div>
  </div>

  <div class="bio">
    <p>A proof of concept exploring shared online presence.</p>
    <p>
      Inspired by Ending E of Nier Automata, where players sacrifice their save data to help others. Here, you sacrifice nothing - only your cursor joins the collective.
    </p>
    <p>The cursors you see are other visitors exploring alongside you in real time.</p>
  </div>

  <div class="stats">
    <div class="stat">
      <span class="label">INSPIRATION</span>
      <span class="value">Nier Automata Ending E</span>
    </div>
    <div class="stat">
      <span class="label">TECHNOLOGY</span>
      <span class="value">SvelteKit + WebSocket</span>
    </div>
    <div class="stat">
      <span class="label">DIRECTIVE</span>
      <span class="value">Shared Presence</span>
    </div>
  </div>
</div>

<style>
  .section {
    color: #454138;
  }

  .profile {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    align-items: center;
  }

  .avatar-placeholder {
    width: 64px;
    height: 64px;
    background: #d1cdb7;
    border: 0.1rem solid #bab5a1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
  }

  .avatar-placeholder .logo {
    width: 48px;
    height: 48px;
    filter: invert(1) sepia(10%) saturate(300%) hue-rotate(30deg);
  }

  .logo {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: invert(30%) sepia(10%) saturate(300%) hue-rotate(30deg);
  }

  .info h3 {
    font-size: 1.1rem;
    color: #454138;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.2rem;
    font-weight: normal;
  }

  .designation,
  .status {
    font-size: 0.8rem;
    color: #454138;
  }

  .bio {
    margin-bottom: 1.5rem;
    line-height: 1.8;
  }

  .bio p {
    margin-bottom: 0.75rem;
  }

  .stats {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .stat {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    background: #d1cdb7;
    border-left: 0.2rem solid #bab5a1;
  }

  .stat .label {
    font-size: 0.7rem;
    color: #454138;
    text-transform: uppercase;
    letter-spacing: 0.1rem;
  }

  .stat .value {
    font-size: 0.8rem;
    color: #454138;
  }

  @media (max-width: 600px) {
    .profile {
      flex-direction: column;
      text-align: center;
    }
  }
</style>
