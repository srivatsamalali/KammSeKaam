export const playSoftChime = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    oscillator.start();
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    oscillator.stop(audioCtx.currentTime + 0.15);
  } catch (e) {
    // ignore
  }
}

export const triggerMessageNotification = (sender, messageText) => {
  // 1. Play synthesized message sound using Web Audio API
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    oscillator.start();
    
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    oscillator.stop(audioCtx.currentTime + 0.4);
  } catch (e) {
    console.log("Audio play blocked by browser autoplay policy");
  }

  // 2. Request browser native desktop Notification
  if (window.Notification && Notification.permission === 'granted') {
    new Notification(`New Message from ${sender}`, {
      body: messageText,
      icon: '/logo.jpeg'
    });
  } else if (window.Notification && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(`New Message from ${sender}`, {
          body: messageText,
          icon: '/logo.jpeg'
        });
      }
    });
  }

  // 3. Render HTML Toast Popup in viewport
  const toastContainer = document.getElementById('global-toast-container') || (() => {
    const el = document.createElement('div');
    el.id = 'global-toast-container';
    el.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-3 w-80 max-w-[90vw] pointer-events-none';
    document.body.appendChild(el);
    return el;
  })();

  const toast = document.createElement('div');
  toast.className = 'bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-amber-200 dark:border-slate-800 p-4 rounded-xl shadow-2xl flex gap-3 pointer-events-auto transform translate-y-[-20px] opacity-0 transition-all duration-300 select-none';
  toast.innerHTML = `
    <div class="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-lg">
      💬
    </div>
    <div class="flex-grow min-w-0">
      <h4 class="font-bold text-xs text-slate-800 dark:text-slate-200">${sender}</h4>
      <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">${messageText}</p>
    </div>
  `;

  toastContainer.appendChild(toast);
  
  // Trigger slide-in entry
  setTimeout(() => {
    toast.className = toast.className.replace('translate-y-[-20px] opacity-0', 'translate-y-0 opacity-100');
  }, 10);

  // Auto clean up after 4.5 seconds
  setTimeout(() => {
    toast.className = toast.className.replace('translate-y-0 opacity-100', 'translate-y-[-20px] opacity-0');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 4500);
};

export const showToast = (message, type = 'success') => {
  playSoftChime();

  const toastContainer = document.getElementById('global-toast-container') || (() => {
    const el = document.createElement('div');
    el.id = 'global-toast-container';
    el.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-[999999] flex flex-col gap-3 w-80 max-w-[90vw] pointer-events-none';
    document.body.appendChild(el);
    return el;
  })();

  const toast = document.createElement('div');
  let icon = 'ℹ️';
  let gradientBorder = 'rgba(255, 255, 255, 0.4)';
  if (type === 'success') {
    icon = '✅';
    gradientBorder = 'rgba(16, 185, 129, 0.4)';
  } else if (type === 'error') {
    icon = '❌';
    gradientBorder = 'rgba(239, 68, 68, 0.4)';
  } else if (type === 'warning') {
    icon = '⚠️';
    gradientBorder = 'rgba(245, 158, 11, 0.4)';
  }

  toast.className = 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto transform translate-y-[-20px] opacity-0 transition-all duration-300 select-none border border-slate-200 dark:border-slate-800';
  toast.style.border = `1px solid ${gradientBorder}`;
  toast.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2)';
  
  toast.innerHTML = `
    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-base shadow-inner">
      ${icon}
    </div>
    <div class="flex-grow min-w-0">
      <p class="text-xs font-bold text-slate-800 dark:text-slate-100 leading-relaxed">${message}</p>
    </div>
  `;

  toastContainer.appendChild(toast);
  
  // Trigger slide-in entry
  setTimeout(() => {
    toast.className = toast.className.replace('translate-y-[-20px] opacity-0', 'translate-y-0 opacity-100');
  }, 10);

  // Auto clean up after 4 seconds
  setTimeout(() => {
    toast.className = toast.className.replace('translate-y-0 opacity-100', 'translate-y-[-20px] opacity-0');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 4000);
};
