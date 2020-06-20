function addObserver() {
  var observer = new MutationObserver(function(mutations, observer) {
    loop();
  });

  let target = document.querySelector('#title');

  observer.observe(target, {
    subtree: true,
    attributes: true,
  });
}

async function loopObserver() {
  while (true) {
    try {
      addObserver();
      return true;
    } catch (e) {
      // console.warn('NOPE', e);
    }
    await sleep(1000);
  }
}
loopObserver();

loop();

async function loop() {
  while (true) {
    try {
      main();
      return true;
    } catch (e) {
      // console.warn('NOPE', e);
    }
    await sleep(1000);
  }
}

function sleep(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

function main() {
  let videos = getVideos();
  let totalTime = videos.reduce((acc, video) => acc + video.duration, 0);
  let remainingTime = videos.reduce((acc, video) => acc + video.duration * (1 - video.progress), 0);

  let remainingSinceLast = 0;
  for (let v of videos.reverse()) {
    if (v.progress !== 0) break;
    else remainingSinceLast += (v.duration * (1 - v.progress));
  }

  let statsEl = document.querySelector('#stats');
  // statsEl.innerHTML = `<yt-formatted-string class="style-scope ytd-playlist-sidebar-primary-info-renderer">Insgesamt ${totalTime}</yt-formatted-string>`;
  // statsEl.innerHTML += `<p class="style-scope ytd-playlist-sidebar-primary-info-renderer">Insgesamt ${formatTime(totalTime)}</p>`;

  let newContent = `<p id="yt-total-stats">Insgesamt: ${formatTime(totalTime)}<br>Übrig: ${formatTime(remainingTime)}<br>Übrig ab letztem gesehenen: ${formatTime(remainingSinceLast)}</p>`;

  if (document.querySelector('#yt-total-stats')) {
    document.querySelector('#yt-total-stats').innerHTML = newContent;
  } else {
    let myEl = document.createElement('p');
    myEl.innerHTML = newContent;
    statsEl.appendChild(myEl);
  }
}

function getVideos() {
  videosEl = document.querySelectorAll('ytd-playlist-video-renderer');
  let videosElIterator = [...videosEl];
  let videos = videosElIterator.map(el => {
    let progressBar = el.querySelector('div#progress');
    let progress = progressBar ? (parseInt(progressBar.style.width.slice(0, -1)) / 100) : 0;

    let durationString = el.querySelector('ytd-thumbnail-overlay-time-status-renderer').innerText.trim();
    let duration = parseDuration(durationString);

    return {
      title: el.querySelector('#video-title').innerText,
      progress,
      duration,
    }
  });
  return videos;
}

function parseDuration(str) {
  var p = str.split(':'),
    s = 0,
    m = 1;
  while (p.length > 0) {
    s += m * parseInt(p.pop(), 10);
    m *= 60;
  }
  return s;
}

function formatTime(s) {
  // return new Date(s * 1000).toISOString().substr(11, 8); // breaks for >24h

  hours = Math.floor(s / 3600);
  s %= 3600;
  minutes = ('0' + Math.floor(s / 60)).slice(-2);
  seconds = ('0' + Math.floor(s % 60)).slice(-2);
  return [hours, minutes, seconds].join(':');
}
