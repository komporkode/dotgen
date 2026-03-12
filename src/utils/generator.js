export function generateVariations({ email, dot, alias, googlemail, limitEnabled }, onProgress, onFinish) {
  const [username, domain] = email.split('@');
  if (!email || !domain || domain.toLowerCase() !== 'gmail.com') {
    onFinish({ error: 'Email tidak valid! Harus berakhiran @gmail.com' });
    return () => {};
  }

  let stopSignal = false;
  let emails = new Set();
  emails.add(`${username}@gmail.com`);

  const start = performance.now();

  // If no dot variation, just process base, alias, and googlemail directly without batching heavy loops
  if (!dot) {
    if (alias) {
      for (let a = 1; a <= 10; a++) emails.add(`${username}+d${a}@gmail.com`);
    }
    if (googlemail) {
      Array.from(emails).forEach(e => emails.add(e.replace('@gmail.com', '@googlemail.com')));
    }

    let limitHit = false;
    if (limitEnabled && emails.size > 1000) {
      emails = new Set(Array.from(emails).slice(0, 1000));
      limitHit = true;
    }

    const final = Array.from(emails);
    const elapsed = ((performance.now() - start) / 1000).toFixed(2);
    
    onFinish({
      results: final,
      count: final.length,
      elapsed: elapsed,
      limitHit
    });
    
    return () => {};
  }

  const max = 1 << (username.length - 1);
  let i = 0, step = 1024;

  function batch() {
    if (stopSignal) {
      onFinish({ stopped: true });
      return;
    }

    const end = Math.min(i + step, max);
    for (; i < end; i++) {
        let combo = '';
        for (let j = 0; j < username.length; j++) {
            combo += username[j];
            if (j < username.length - 1 && (i & (1 << j))) combo += '.';
        }
        emails.add(`${combo}@gmail.com`);
        if (limitEnabled && emails.size >= 1000) break;
    }

    onProgress({
      liveCount: emails.size,
      progressTarget: max,
      progressCurrent: i
    });

    if (i < max && (!limitEnabled || emails.size < 1000)) {
        setTimeout(batch, 0);
    } else {
        if (alias) {
            for (let a = 1; a <= 10; a++) emails.add(`${username}+d${a}@gmail.com`);
        }
        if (googlemail) {
            Array.from(emails).forEach(e => emails.add(e.replace('@gmail.com', '@googlemail.com')));
        }

        let limitHit = false;
        if (limitEnabled && emails.size > 1000) {
            emails = new Set(Array.from(emails).slice(0, 1000));
            limitHit = true;
        }
        
        const final = Array.from(emails);
        const elapsed = ((performance.now() - start) / 1000).toFixed(2);
        
        onFinish({
            results: final,
            count: final.length,
            elapsed: elapsed,
            limitHit
        });
    }
  }

  batch();

  return () => { stopSignal = true; };
}
