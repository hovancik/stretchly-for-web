<script>
  import { browser } from '$app/env'
  import Notification16 from 'carbon-icons-svelte/lib/Notification16'

  let notificationsAreAllowed = NaN
  let browserSupportsNotifications = NaN

  function requestPermission () {
    Notification.requestPermission().then(function (status) {
      notificationsAreAllowed = (status === 'granted')
    })
  }

  if (browser) {
    browserSupportsNotifications = ('Notification' in window)
    notificationsAreAllowed = (Notification.permission === 'granted')
  }

  let loaded = false

  $: loaded = !(isNaN(notificationsAreAllowed) && isNaN(browserSupportsNotifications))
</script>

<section>
  {#if !loaded }
        // not ready
  {:else if !browserSupportsNotifications}
    <div class="notification mt-2 is-warning is-light">
      <p class="">This browser does not support notifications.</p>
    </div>
  {:else if !notificationsAreAllowed }
    <div class="notification mt-2 is-warning is-light">
      <button class="button is-success is-outlined is-small is-pulled-right" on:click={requestPermission}>
        <span class="icon is-small">
          <Notification16/>
        </span>
        <span>Request Notifications Permission</span>
      </button>
      <p>Notifications are not allowed. Please request the permission by clicking on button.</p>
    </div>
  {/if}
</section>
