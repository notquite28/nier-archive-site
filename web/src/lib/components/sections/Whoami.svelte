<script lang="ts">
</script>

<div class="section whoami">
    <div class="profile">
        <div class="avatar-placeholder">
            <span>?</span>
        </div>
        
        <div class="info">
            <h3>ARCHIVIST</h3>
            <p class="designation">Designation: Primary Unit</p>
            <p class="status">Status: Online</p>
        </div>
    </div>
    
    <div class="bio">
        <p>Welcome to the Archive.</p>
        <p>I build creative things for the web. This space is an experiment in making personal sites feel alive - where visitors exist together rather than alone.</p>
        <p>The cursors you see are other units exploring alongside you.</p>
    </div>
    
    <div class="stats">
        <div class="stat">
            <span class="label">SPECIALIZATION</span>
            <span class="value">Creative Development</span>
        </div>
        <div class="stat">
            <span class="label">ORIGIN</span>
            <span class="value">The Internet</span>
        </div>
        <div class="stat">
            <span class="label">DIRECTIVE</span>
            <span class="value">Build Immersive Experiences</span>
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
        font-size: 32px;
        color: #bab5a1;
    }

    .info h3 {
        font-size: 1.1rem;
        color: #454138;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.2rem;
        font-weight: normal;
    }

    .designation, .status {
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
