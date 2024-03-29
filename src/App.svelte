<script>
  import { Shuffled } from './lib/shuffled.js'
  import { theMiniBreakIdeas, theLongBreakIdeas } from './lib/ideas.js'
  import { longBreakInterval, longBreakDuration, miniBreakDuration, miniBreakInterval } from './stores/preferences.js'
  import NotificationRequest from './components/NotificationRequest.svelte'
  
  import SkipForward from 'carbon-icons-svelte/lib/SkipForward.svelte'
  import Play from 'carbon-icons-svelte/lib/Play.svelte'
  import Stop from 'carbon-icons-svelte/lib/Stop.svelte'
  import Pause from 'carbon-icons-svelte/lib/Pause.svelte'
  
  import { Timer } from 'easytimer.js'
  const timer = new Timer({ precision: 'seconds' })

  let status = 'stopped'
  let counter = timer.getTimeValues().seconds
  let current = 'work'
  let left = 0
  let formattedLeft = ''
  let finishedMinis = 0
  const miniBreakIdeas = new Shuffled(theMiniBreakIdeas)
  let miniBreakIdea = null
  const longBreakIdeas = new Shuffled(theLongBreakIdeas)
  let longBreakIdea = null
  let heroClass = 'is-success'
  let logMessages = []
  const logLength = 30

  function addToLogMessages (message) {
    if (logMessages.length >= logLength) {
      logMessages.shift()
      logMessages = logMessages
    }
    logMessages = [...logMessages, `${(new Date()).toLocaleTimeString()}: ${message}`]
  }

  function startLongBreak () {
    longBreakIdea = longBreakIdeas.randomElement.data
    /* eslint-disable no-new */
    new Notification('Stretchly - Long Break', { body: longBreakIdea[0] + ': ' + longBreakIdea[1], icon: '/stretchly_128x128.png' })
    current = 'break'
    timer.reset()
    addToLogMessages('Long Break started')
  }

  function startMiniBreak () {
    miniBreakIdea = miniBreakIdeas.randomElement.data
    /* eslint-disable no-new */
    new Notification('Stretchly - Mini Break', { body: miniBreakIdea, icon: '/stretchly_128x128.png' })
    current = 'break'
    timer.reset()
    addToLogMessages('Mini Break started')
  }
  
  function skipToMiniBreak () {
    finishedMinis = finishedMinis === $longBreakInterval ? 0 : finishedMinis
    addToLogMessages('Skipping to Mini Break')
    startMiniBreak()
  }

  function skipToLongBreak () {
    finishedMinis = $longBreakInterval
    addToLogMessages('Skipping to Long Break')
    startLongBreak()
  }

  function finishMiniBreak () {
    /* eslint-disable no-new */
    new Notification('Stretchly', { body: 'Time for work!', icon: '/stretchly_128x128.png' })
    finishedMinis += 1
    current = 'work'
    timer.reset()
    left = $miniBreakInterval - counter
    addToLogMessages('Mini Break ended')
  }

  function finishLongBreak () {
    /* eslint-disable no-new */
    new Notification('Stretchly', { body: 'Time for work!', icon: '/stretchly_128x128.png' })
    finishedMinis = 0
    current = 'work'
    timer.reset()
    left = $miniBreakInterval - counter
    addToLogMessages('Long Break ended')
  }

  timer.addEventListener('secondsUpdated', () => {
    counter = timer.getTotalTimeValues().seconds
  })

  $: if ($longBreakInterval || $longBreakDuration || $miniBreakDuration || $miniBreakInterval) {
    window.localStorage.setItem('longBreakInterval', $longBreakInterval)
    window.localStorage.setItem('longBreakDuration', $longBreakDuration)
    window.localStorage.setItem('miniBreakDuration', $miniBreakDuration)
    window.localStorage.setItem('miniBreakInterval', $miniBreakInterval)
    addToLogMessages(`Saving preferences to localStorage: ${Object.entries(window.localStorage)}`)
  }

  $: if (['stopped', 'paused'].includes(status)) {
    // nothing
  } else if (current === 'work') {
    if ((finishedMinis < $longBreakInterval) && (counter >= $miniBreakInterval)) {
      startMiniBreak()
    } else if ((finishedMinis === $longBreakInterval) && (counter >= $miniBreakInterval)) {
      startLongBreak()
    }
    left = $miniBreakInterval - counter
  } else if (current === 'break') {
    if (finishedMinis < $longBreakInterval) {
      left = $miniBreakDuration - counter
      if (counter >= $miniBreakDuration) {
        finishMiniBreak()
      }
    } else if (finishedMinis === $longBreakInterval) {
      left = $longBreakDuration - counter
      if (counter >= $longBreakDuration) {
        finishLongBreak()
      }
    }
  }

  $: if (left) {
    const measuredTime = new Date(null)
    measuredTime.setSeconds(left)
    formattedLeft = measuredTime.toISOString().substring(11, 19)
  }

  $: heroClass = current === 'work' ? 'is-success' : 'is-info'

  function stop () {
    status = 'stopped'
    timer.stop()
    current = 'work'
    left = 0
    formattedLeft = ''
    finishedMinis = 0
    addToLogMessages('Breakes stopped')
  }

  function start () {
    status = 'running'
    current = 'work'
    timer.start()
    addToLogMessages('Breakes started')
  }
  
  function pause () {
    status = 'paused'
    current = 'work'
    timer.pause()
    addToLogMessages('Breakes paused')
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
            <div class="dropdown is-hoverable">
              <div class="dropdown-trigger">
                <button class="button is-small" aria-haspopup="true" aria-controls="dropdown-menu">
                  <span class="icon is-small">
                    <SkipForward size="16" />
                  </span>
                  <span>Skip to</span>
                </button>
              </div>
              <div class="dropdown-menu" id="dropdown-menu" role="menu">
                <div class="dropdown-content">
                  <a href={'#'} class="dropdown-item" on:click={ () => skipToMiniBreak()  }>
                    Mini Break
                  </a>
                  <a href={'#'} class="dropdown-item" on:click={ () => skipToLongBreak()  }>
                    Long Break
                  </a>
                </div>
              </div>
            </div>
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
        <strong>Stretchly for Web</strong> v0.0.6 |
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
      <p>Stop the breaks before editing preferences.   
      <h2 class="subtitle">Mini Breaks</h2>
      <p>Mini Breaks are short breaks taken regularly to give you a chance to stretch and relax.</p>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label" for="miniBreakDuration">Duration (seconds)</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control">
              <input disabled={status !== 'stopped'} class="input" type="number" size="10" style="width: auto;" bind:value={$miniBreakDuration} id="miniBreakDuration">
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
              <input disabled={status !== 'stopped'} class="input" type="number" size="10" style="width: auto;" bind:value={$miniBreakInterval} id="miniBreakInterval">
            </p>
          </div>
        </div>
      </div>
      <h2 class="subtitle">Long Breaks</h2>
      <p>Long Breaks are taken less regularly, but are of greater duration, allowing you to take an extended break from your work.</p>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label" for="longBreakDuration">Duration (seconds)</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control">
              <input disabled={status !== 'stopped'} class="input" type="number" size="10" style="width: auto;" bind:value={$longBreakDuration} id="longBreakDuration">
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
              <input disabled={status !== 'stopped'} class="input" type="number" size="10" style="width: auto;" bind:value={$longBreakInterval} id="longBreakInterval">
            </p>
          </div>
        </div>
      </div>
      <h2 class="subtitle">
        Debug information
      </h2>
      <div class="content is-small">
        <h3>Preferences</h3>
        <table class="table is-striped is-narrow is-size-7">
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
        </table>
        <h3>State</h3>
        <table class="table is-striped is-narrow is-size-7">
          <tr>
            <td>status</td>
            <td> {status}</td>
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
            <td>heroClass</td>
            <td> {heroClass}</td>
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
        <h3>Debug</h3>
        Last {logLength} messages are kept.
        <article class="message is-small">
          <div class="message-body">
            {#each logMessages as message, i}
              {message} <br>
            {/each}
          </div>
        </article>
      </div>
    </div>
  </div>
</section>
