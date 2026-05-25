const handleGenerate = async () => {
  setLoading(true);
  setError(null);
  setVideoUrl(null);
  setStatusMessage('Submitting composition layout...');

  try {
    const response = await fetch('/api/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: videoConcept })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Server rejected video submission.');
    }

    // Smart-matching check: Grabs whichever format your backend is using
    const renderId = data.renderId || data.id || data.response?.id;
    
    if (!renderId) {
      console.log('Raw response data for debugging:', data);
      throw new Error('Critical Mismatch: Frontend looked for renderId, id, or response.id but found nothing.');
    }

    // Start your browser-safe polling loop
    let completedUrl = null;
    let attempts = 0;
    const maxAttempts = 30;

    while (!completedUrl && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      attempts++;
      setStatusMessage(`Rendering active... Checking progress (Attempt ${attempts})`);

      const statusCheck = await fetch(`/api/check-status?id=${renderId}`);
      const statusData = await statusCheck.json();

      if (statusData.status === 'done' || statusData.status === 'completed') {
        completedUrl = statusData.url;
        break;
      } else if (statusData.status === 'failed') {
        throw new Error('Shotstack cloud engine reported a render failure.');
      }
    }

    if (!completedUrl) {
      throw new Error('Rendering timed out on the client side. Try clicking generate again!');
    }

    setVideoUrl(completedUrl);
    setStatusMessage('');

  } catch (err) {
    console.error(err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
