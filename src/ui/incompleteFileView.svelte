<script>
    // Assuming 'data' is passed into this component as a prop
    export let data;
  
    // Helper function to format the date
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString(); // Or any format you prefer
    }
  </script>
  
  <style>
    .file-item {
      margin-bottom: 1rem;
      padding: 0.5rem;
      border-bottom: 1px solid #ddd;
    }
  
    .reason {
      margin-left: 1rem;
    }
  </style>
  
  <div class="incomplete-files">
    {#each data.incompleteFiles as file}
      <div class="file-item">
        <div class="file-title">
          <strong>{file.basename}</strong> (Last checked: {formatDate(file.lastChecked)})
        </div>
        {#each file.reasons as reason}
          <div class="reason">
            - {reason.title}
          </div>
        {/each}
      </div>
    {/each}
  </div>
  