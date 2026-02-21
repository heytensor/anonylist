const state = {
  videos: [],
  playlistName: ''
};

const urlInput = document.getElementById('urlInput');
const addBtn = document.getElementById('addBtn');
const dropZone = document.getElementById('dropZone');
const playlist = document.getElementById('playlist');
const emptyState = document.getElementById('emptyState');
const stats = document.getElementById('stats');
const videoCount = document.getElementById('videoCount');
const playlistName = document.getElementById('playlistName');
const generateBtn = document.getElementById('generateBtn');
const outputSection = document.getElementById('outputSection');
const shareUrl = document.getElementById('shareUrl');
const urlSize = document.getElementById('urlSize');
const copyBtn = document.getElementById('copyBtn');
const newListBtn = document.getElementById('newListBtn');
const toast = document.getElementById('toast');

function showToast(message, type = 'info') {
  toast.textContent = message;
  toast.className = 'toast ' + type;
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function parseYouTubeUrl(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getVideoId(url) {
  return parseYouTubeUrl(url);
}

function getThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

function addVideo(url) {
  const videoId = getVideoId(url);
  if (!videoId) {
    showToast('Invalid YouTube URL', 'error');
    return false;
  }

  const video = {
    id: Date.now() + Math.random(),
    videoId,
    url: url,
    title: `YouTube Video (${videoId})`,
    thumbnail: getThumbnail(videoId)
  };

  state.videos.push(video);
  renderPlaylist();
  showToast('Video added!', 'success');
  return true;
}

function removeVideo(id) {
  state.videos = state.videos.filter(v => v.id !== id);
  renderPlaylist();
}

function renderPlaylist() {
  const videos = state.videos.filter(v => playlist.contains(v.element));
  playlist.querySelectorAll('.video-item').forEach(el => el.remove());

  if (state.videos.length === 0) {
    emptyState.style.display = 'flex';
    stats.style.display = 'none';
  } else {
    emptyState.style.display = 'none';
    stats.style.display = 'flex';
    videoCount.textContent = state.videos.length;

    state.videos.forEach((video, index) => {
      const item = document.createElement('div');
      item.className = 'video-item';
      item.draggable = true;
      item.dataset.index = index;
      item.dataset.id = video.id;
      item.innerHTML = `
        <div class="drag-handle"><span></span><span></span><span></span></div>
        <div class="video-index">${index + 1}</div>
        <img class="video-thumb" src="${video.thumbnail}" alt="" loading="lazy" onerror="this.style.display='none'">
        <div class="video-info">
          <div class="video-title">${video.title}</div>
          <div class="video-url">${video.url}</div>
        </div>
        <button class="delete-btn" title="Remove">×</button>
      `;

      item.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        item.style.animation = 'slideIn 0.2s reverse';
        setTimeout(() => removeVideo(video.id), 150);
      });

      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragend', handleDragEnd);
      item.addEventListener('dragover', handleDragOver);
      item.addEventListener('drop', handleDrop);

      playlist.appendChild(item);
    });
  }
}

let draggedItem = null;

function handleDragStart(e) {
  draggedItem = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd() {
  this.classList.remove('dragging');
  document.querySelectorAll('.video-item').forEach(item => {
    item.classList.remove('drag-over');
  });
  draggedItem = null;
}

function handleDragOver(e) {
  e.preventDefault();
  if (this === draggedItem) return;
  document.querySelectorAll('.video-item').forEach(item => {
    item.classList.remove('drag-over');
  });
  this.classList.add('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  if (this === draggedItem) return;

  const fromIndex = parseInt(draggedItem.dataset.index);
  const toIndex = parseInt(this.dataset.index);

  const [moved] = state.videos.splice(fromIndex, 1);
  state.videos.splice(toIndex, 0, moved);

  renderPlaylist();
}

addBtn.addEventListener('click', () => {
  const url = urlInput.value.trim();
  if (url && addVideo(url)) {
    urlInput.value = '';
  }
});

urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addBtn.click();
  }
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  
  const text = e.dataTransfer.getData('text/plain');
  const urls = text.split(/[\n,]+/).map(u => u.trim()).filter(u => u);
  
  let added = 0;
  urls.forEach(url => {
    if (addVideo(url)) added++;
  });

  if (added === 0 && urls.length > 0) {
    showToast('No valid YouTube URLs found', 'error');
  }
});

generateBtn.addEventListener('click', () => {
  if (state.videos.length === 0) {
    showToast('Add some videos first!', 'error');
    return;
  }

  const playlistData = {
    name: playlistName.value || 'Anonylist',
    videos: state.videos.map(v => ({
      id: v.videoId,
      u: v.url
    }))
  };

  const json = JSON.stringify(playlistData);
  const compressed = LZString.compressToEncodedURIComponent(json);
  const url = `${window.location.origin}${window.location.pathname}?p=${compressed}`;

  shareUrl.value = url;
  outputSection.style.display = 'block';

  const size = url.length;
  urlSize.textContent = `URL length: ${size.toLocaleString()} characters`;
  urlSize.className = 'url-size';
  if (size > 8000) {
    urlSize.classList.add('error');
    urlSize.textContent += ' - Too long for some browsers!';
  } else if (size > 4000) {
    urlSize.classList.add('warning');
  }
});

copyBtn.addEventListener('click', () => {
  shareUrl.select();
  document.execCommand('copy');
  copyBtn.textContent = 'Copied!';
  copyBtn.classList.add('copied');
  setTimeout(() => {
    copyBtn.textContent = 'Copy';
    copyBtn.classList.remove('copied');
  }, 2000);
});

newListBtn.addEventListener('click', () => {
  if (state.videos.length > 0) {
    if (!confirm('Clear current playlist and start new?')) return;
  }
  state.videos = [];
  state.playlistName = '';
  playlistName.value = '';
  renderPlaylist();
  outputSection.style.display = 'none';
  window.history.replaceState({}, '', window.location.pathname);
});

function loadFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const compressed = params.get('p');
  
  if (!compressed) return;

  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    const data = JSON.parse(json);

    if (data.name) {
      playlistName.value = data.name;
    }

    if (data.videos && Array.isArray(data.videos)) {
      data.videos.forEach(v => {
        const videoId = v.id || getVideoId(v.u);
        if (videoId) {
          state.videos.push({
            id: Date.now() + Math.random(),
            videoId,
            url: v.u,
            title: `YouTube Video (${videoId})`,
            thumbnail: getThumbnail(videoId)
          });
        }
      });
      renderPlaylist();
      showToast(`Loaded ${state.videos.length} videos!`, 'success');
    }
  } catch (e) {
    console.error('Failed to load playlist:', e);
    showToast('Failed to load playlist', 'error');
  }
}

loadFromUrl();
