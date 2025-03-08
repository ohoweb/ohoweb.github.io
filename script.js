document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed'); 
    const audioPlayer = document.getElementById('audio-player');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const cover = document.getElementById('cover');
    const progressBar = document.getElementById('progress-bar');
    const volumeBar = document.getElementById('volume-bar');
    const playlist = document.getElementById('playlist');
    const playButton = document.getElementById('play');
    const pauseButton = document.getElementById('pause');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const loopAllButton = document.getElementById('loop-all');
    const loopRandomButton = document.getElementById('loop-random');
    const loopSingleButton = document.getElementById('loop-single');
    const statusText = document.createElement('div');
    const contactBtn = document.querySelector('.contact-btn');
    const modal = document.getElementById('contactModal');
    const closeModal = document.getElementById('closeModal');
    statusText.id = 'status-text';
    document.querySelector('.container').appendChild(statusText);
    let currentSongIndex = 0;
    let loopSingle = false;
    let loopAll = false;
    let loopRandom = false;
    contactBtn.addEventListener('click', () => {
      console.log("Feedback form button clicked");
        modal.style.display = 'flex';

    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 从 JSON 文件加载歌曲列表
    fetch('songs.json')
      .then(response => response.json())
      .then(data => {
        const songs = data.songs;

        songs.forEach((song, index) => {
          const li = document.createElement('li');
          li.textContent = song.title;
          li.dataset.audio = song.audio;
          li.dataset.artist = song.artist;
          li.dataset.cover = song.cover;
          li.addEventListener('click', () => {
            currentSongIndex = index;
            loadSong(song);
            playSong();
          });
          playlist.appendChild(li);
        });

        function loadSong(song) {
          songTitle.textContent = song.title;
          songArtist.textContent = song.artist;
          audioPlayer.src = song.audio;
          cover.style.backgroundImage = `url('${song.cover}')`;
        }

        function playSong() {
          console.log('Play button clicked');
          audioPlayer.play();
          playButton.style.display = 'none';
          pauseButton.style.display = 'block';
          updateStatus();
        }

        function pauseSong() {
          audioPlayer.pause();
          playButton.style.display = 'block';
          pauseButton.style.display = 'none';
        }

        function prevSong() {
          currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
          loadSong(songs[currentSongIndex]);
          playSong();
        }

        function nextSong() {
          currentSongIndex = (currentSongIndex + 1) % songs.length;
          loadSong(songs[currentSongIndex]);
          playSong();
        }

        function playNext() {
          currentSongIndex = (currentSongIndex + 1) % songs.length;
          loadSong(songs[currentSongIndex]);
          playSong();
        }

        function playRandom() {
          const randomIndex = Math.floor(Math.random() * songs.length);
          currentSongIndex = randomIndex;
          loadSong(songs[randomIndex]);
          playSong();
        }
        function loadSong(song) {

  let playingTitle = song.title;
  
  // 如果歌曲标题包含括号，只保留括号前的部分作为播放中的歌曲名
  if (song.title.includes('（')) {
    playingTitle = song.title.split('（')[0]; 
  }

  songTitle.textContent = playingTitle; 
  songArtist.textContent = song.artist;
  audioPlayer.src = song.audio;
  cover.style.backgroundImage = `url('${song.cover}')`;
}

        function updateStatus() {
          let loopStatus = '';
          if (loopSingle) {
            loopStatus = '♪ 单曲循环';
          } else if (loopAll) {
            loopStatus = '♪ 列表循环';
          } else if (loopRandom) {
            loopStatus = '♪ 随机播放';
          }
          statusText.textContent = `${loopStatus} 正在播放: ${songs[currentSongIndex].title}`;
        }

        // 按钮事件绑定
        playButton.addEventListener('click', playSong);
        pauseButton.addEventListener('click', pauseSong);
        prevButton.addEventListener('click', prevSong);
        nextButton.addEventListener('click', nextSong);
        loopAllButton.addEventListener('click', () => {
          loopAll = true;
          loopRandom = false;
          loopSingle = false;
          updateStatus();
        });
        loopRandomButton.addEventListener('click', () => {
          loopRandom = true;
          loopAll = false;
          loopSingle = false;
          updateStatus();
        });
        loopSingleButton.addEventListener('click', () => {
          loopSingle = !loopSingle;
          loopAll = false;
          loopRandom = false;
          updateStatus();
        });

        // 进度条和音量控制
        progressBar.addEventListener('input', () => {
          audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
        });
        volumeBar.addEventListener('input', () => {
          audioPlayer.volume = volumeBar.value / 100;
        });

        // 音频事件绑定
        audioPlayer.addEventListener('timeupdate', () => {
          progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        });
        audioPlayer.addEventListener('ended', () => {
          if (loopSingle) {
            playSong();
          } else if (loopAll) {
            playNext();
          } else if (loopRandom) {
            playRandom();
          }
        });

        // 默认加载第一首歌
        loadSong(songs[currentSongIndex]);
        updateStatus();
      });

    // 可视化音乐频谱
    const canvas = document.getElementById('visualizer');
    const canvasCtx = canvas.getContext('2d');
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaElementSource(audioPlayer);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function drawVisualizer() {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;
      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

      analyser.getByteFrequencyData(dataArray);

      const barWidth = (WIDTH / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        const gradient = canvasCtx.createLinearGradient(0, HEIGHT - barHeight / 2, 0, HEIGHT);
        gradient.addColorStop(0, '#2D2E2E');
        gradient.addColorStop(1, '#716969');

        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }

      requestAnimationFrame(drawVisualizer);
    }

    audioPlayer.addEventListener('play', () => {
      audioCtx.resume().then(() => {
        drawVisualizer();
      });
    });
});