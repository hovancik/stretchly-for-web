<script>
  import NotificationRequest from './components/NotificationRequest.svelte'
  import Play from 'carbon-icons-svelte/lib/Play.svelte'
  import Stop from 'carbon-icons-svelte/lib/Stop.svelte'
  import Pause from 'carbon-icons-svelte/lib/Pause.svelte'
  import { Shuffled } from './lib/shuffled.js'
  import { theMiniBreakIdeas, theLongBreakIdeas } from './lib/ideas.js'
  import { longBreakInterval, longBreakDuration, miniBreakDuration, miniBreakInterval } from './stores/preferences.js'

  let status = 'stopped'
  let counter = 0
  let current = 'work'
  let left = 0
  let formattedLeft = ''
  let finishedMinis = 0
  const miniBreakIdeas = new Shuffled(theMiniBreakIdeas)
  let miniBreakIdea = null
  const longBreakIdeas = new Shuffled(theLongBreakIdeas)
  let longBreakIdea = null
  let heroClass = 'is-success'

  $: if ($longBreakInterval || $longBreakDuration || $miniBreakDuration || $miniBreakInterval) {
    window.localStorage.setItem('longBreakInterval', $longBreakInterval)
    window.localStorage.setItem('longBreakDuration', $longBreakDuration)
    window.localStorage.setItem('miniBreakDuration', $miniBreakDuration)
    window.localStorage.setItem('miniBreakInterval', $miniBreakInterval)
  }

  $: heroClass = current === 'break' ? 'is-info' : 'is-success'

  $: if (status === 'stopped' || status === 'paused') {
    // nothing
  } else {
    setTimeout(() => counter++, 1000)

    if (current === 'work') {
      if ((finishedMinis < $longBreakInterval) && (counter >= $miniBreakInterval)) {
        miniBreakIdea = miniBreakIdeas.randomElement.data
        /* eslint-disable no-new */
        new Notification('Stretchly - Mini Break', { body: miniBreakIdea, icon: '/stretchly_128x128.png' })
        current = 'break'
        counter = 0
      } else if ((finishedMinis === $longBreakInterval) && (counter >= $miniBreakInterval)) {
        longBreakIdea = longBreakIdeas.randomElement.data
        /* eslint-disable no-new */
        new Notification('Stretchly - Long Break', { body: longBreakIdea[0] + ': ' + longBreakIdea[1], icon: '/stretchly_128x128.png' })
        current = 'break'
        counter = 0
      }
      left = $miniBreakInterval - counter
    } else if (current === 'break') {
      if (finishedMinis < $longBreakInterval) {
        left = $miniBreakDuration - counter
        if (counter >= $miniBreakDuration) {
          /* eslint-disable no-new */
          new Notification('Stretchly', { body: 'Time for work!', icon: '/stretchly_128x128.png' })
          finishedMinis += 1
          current = 'work'
          counter = 0
          left = $miniBreakInterval - counter
        }
      } else if (finishedMinis === $longBreakInterval) {
        left = $longBreakDuration - counter
        if (counter >= $longBreakDuration) {
          /* eslint-disable no-new */
          new Notification('Stretchly', { body: 'Time for work!', icon: '/stretchly_128x128.png' })
          finishedMinis = 0
          current = 'work'
          counter = 0
          left = $miniBreakInterval - counter
        }
      }
    }
  }

  $: if (left) {
    const measuredTime = new Date(null)
    measuredTime.setSeconds(left)
    formattedLeft = measuredTime.toISOString().substr(11, 8)
  }

  function stop () {
    status = 'stopped'
    counter = 0
    current = 'work'
    left = 0
    formattedLeft = ''
    finishedMinis = 0
  }
  function start () {
    status = 'running'
  }
  function pause () {
    status = 'paused'
  }
</script>
<svelte:head>
  <title>Stretchly for Web</title>
</svelte:head>
<section class="hero is-fullheight {heroClass}">
  <div class="hero-head">
    <div class="container">
      <NotificationRequest/>
      <div class="box mt-2 is-pulled-right">
        <div class="buttons is-grouped">
          {#if status === 'stopped' || status === 'paused'}
            <button class="button is-small" on:click={start}>
              <span class="icon is-small">
                <Play size="16" />
              </span>
              {#if status === 'stopped'}
                <span>Start</span>
              {:else}
                <span>Resume</span>
              {/if}
            </button>
          {:else if status === 'running'}
            <button class="button is-small" on:click={pause}>
              <span class="icon is-small">
                <Pause size="16" />
              </span>
              <span>Pause</span>
            </button>
            <button class="button is-small" on:click={stop}>
              <span class="icon is-small">
                <Stop size="16" />
              </span>
              <span>Stop</span>
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
  <div class="hero-body">
    <div class="container has-text-centered">
      {#if status !== 'running'}
        <div>
          <h1 class="title">
            Stretchly for Web
          </h1>
          <span class="tag {heroClass} is-light">
            Breaks are {status}
          </span>
        </div>
      {:else if current === 'work'}
        <div>
          <h1 class="title">
            Time to work!
          </h1>
          {#if finishedMinis === $longBreakInterval}
            <span class="tag {heroClass} is-light">
              Next Long Break in {formattedLeft}
            </span>
          {:else}
            <span class="tag {heroClass} is-light">
              Next Mini Break in {formattedLeft}
            </span>
          {/if}
        </div>
      {:else}
        <div>
          {#if finishedMinis === $longBreakInterval}
            <div class="block">
              <h1 class="title">
                {longBreakIdea[0]}
              </h1>
              <h2 class="subtitle">
                {longBreakIdea[1]}
              </h2>
            </div>
          {:else}
            <h1 class="title"e>
              {miniBreakIdea}
            </h1>
          {/if}
          <span class="tag {heroClass} is-light">
            {formattedLeft} remaining
          </span>
        </div>
      {/if}
    </div>
  </div>
  <div class="hero-foot">
    <div class="container content has-text-right">
      <p>
        <strong>Stretchly for Web</strong> v0.0.3 |
        <a href="#preferences" class="is-underlined">Preferences</a> |
        Made with ♥ by <a href="https://hovancik.net" class="is-underlined">Jan Hovancik</a>
      </p>
    </div>
  </div>
</section>
<section class="hero is-light">
  <div class="hero-body">
    <div class="container content">
      <h1 class="title" id="preferences">
        Preferences
      </h1>
      <p>Pause the breaks before editing preferences.   
      <h2 class="subtitle">Mini Breaks</h2>
      <p>Mini Breaks are short breaks taken regularly to give you a chance to stretch and relax.</p>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label" for="miniBreakDuration">Duration (seconds)</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control">
              <input class="input" type="number" size="10" style="width: auto;" bind:value={$miniBreakDuration} id="miniBreakDuration">
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label" for="miniBreakInterval">Interval (seconds)</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control">
              <input class="input" type="number" size="10" style="width: auto;" bind:value={$miniBreakInterval} id="miniBreakInterval">
            </p>
          </div>
        </div>
      </div>
      <h2 class="subtitle">Mini Breaks</h2>
      <p>Long Breaks are taken less regularly, but are of greater duration, allowing you to take an extended break from your work.</p>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label" for="longBreakDuration">Duration (seconds)</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control">
              <input class="input" type="number" size="10" style="width: auto;" bind:value={$longBreakDuration} id="longBreakDuration">
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label" for="longBreakInterval">Interval (Mini Breaks)</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control">
              <input class="input" type="number" size="10" style="width: auto;" bind:value={$longBreakInterval} id="longBreakInterval">
            </p>
          </div>
        </div>
      </div>
      <h2 class="subtitle">
        Debug information
      </h2>
      <div class="content is-small">
        <table class="table is-striped is-narrow is-size-7">
          <tr>
            <td>status</td>
            <td> {status}</td>
          </tr>
          <tr>
            <td>longBreakInterval</td>
            <td> {$longBreakInterval}</td>
          </tr>
          <tr>
            <td>longBreakDuration</td>
            <td> {$longBreakDuration}</td>
          </tr>
          <tr>
            <td>miniBreakInterval</td>
            <td> {$miniBreakInterval}</td>
          </tr>
          <tr>
            <td>miniBreakDuration</td>
            <td> {$miniBreakDuration}</td>
          </tr>
          <tr>
            <td>counter</td>
            <td> {counter}</td>
          </tr>
          <tr>
            <td>current</td>
            <td> {current}</td>
          </tr>
          <tr>
            <td>left</td>
            <td> {left}</td>
          </tr>
          <tr>
            <td>formattedLeft</td>
            <td> {formattedLeft}</td>
          </tr>
          <tr>
            <td>finishedMinis</td>
            <td> {finishedMinis}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</section>
