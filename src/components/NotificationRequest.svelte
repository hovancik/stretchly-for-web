<script>
  import NotificationIcon from 'carbon-icons-svelte/lib/Notification.svelte'

  let notificationsAreAllowed = NaN
  let browserSupportsNotifications = NaN

  function requestPermission () {
    Notification.requestPermission().then(function (status) {
      notificationsAreAllowed = (status === 'granted')
    })
  }

  browserSupportsNotifications = ('Notification' in window)
  notificationsAreAllowed = (Notification.permission === 'granted')

  let loaded = false

  $: loaded = !(isNaN(notificationsAreAllowed) && isNaN(browserSupportsNotifications))
</script>

<section>
  {#if !loaded }
        <!--Still loading-->
  {:else if !browserSupportsNotifications}
    <div class="notification mt-2 is-warning is-light">
      <p class="">This browser does not support notifications.</p>
    </div>
  {:else if !notificationsAreAllowed }
    <div class="notification mt-2 is-warning is-light">
      <button class="button is-success is-outlined is-small is-pulled-right" on:click={requestPermission}>
        <span class="icon is-small">
          <NotificationIcon size="16"/>
        </span>
        <span>Request Notifications Permission</span>
      </button>
      <p>Notifications are not allowed. Please request the permission by clicking on button.</p>
    </div>
  {/if}
</section>
