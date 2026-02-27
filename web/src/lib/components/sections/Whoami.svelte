<script lang="ts">
</script>

<div class="section whoami">
    <h2>// UNIT PROFILE</h2>
    
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
        color: #CEC5B4;
    }

    h2 {
        font-size: 12px;
        color: #00ff88;
        margin-bottom: 20px;
        padding-bottom: 8px;
        border-bottom: 2px solid #4a4a6a;
    }

    .profile {
        display: flex;
        gap: 16px;
        margin-bottom: 20px;
        align-items: center;
    }

    .avatar-placeholder {
        width: 64px;
        height: 64px;
        background: #0f0f1a;
        border: 3px solid #4a4a6a;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        color: #4a4a6a;
    }

    .info h3 {
        font-size: 14px;
        color: #ffe66d;
        margin-bottom: 4px;
    }

    .designation, .status {
        font-size: 9px;
        color: #888;
    }

    .status {
        color: #00ff88;
    }

    .bio {
        margin-bottom: 20px;
        line-height: 1.8;
    }

    .bio p {
        margin-bottom: 12px;
    }

    .stats {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .stat {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        background: #0f0f1a;
        border-left: 3px solid #4a4a6a;
    }

    .stat .label {
        font-size: 8px;
        color: #888;
    }

    .stat .value {
        font-size: 9px;
        color: #CEC5B4;
    }
</style>
