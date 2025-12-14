import { useState, useEffect, useRef } from 'react';

export function useAudio(onTrackEnd) {
    const audioRef = useRef(new Audio());
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [currentTrack, setCurrentTrack] = useState(null);

    const [queue, setQueue] = useState([]);

    // Refs to access latest state in event listeners
    const queueRef = useRef(queue);
    const currentTrackRef = useRef(currentTrack);
    const onTrackEndRef = useRef(onTrackEnd);

    // Track the current blob URL to revoke it
    const currentBlobUrlRef = useRef(null);

    // Keep refs synced
    useEffect(() => {
        queueRef.current = queue;
        currentTrackRef.current = currentTrack;
        onTrackEndRef.current = onTrackEnd;
    }, [queue, currentTrack, onTrackEnd]);

    useEffect(() => {
        const audio = audioRef.current;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration);
        const handleEnded = () => {
            // Use refs to get latest state without re-binding listener
            const currentQueue = queueRef.current;
            const current = currentTrackRef.current;

            if (current) {
                // Trigger callback if provided
                if (onTrackEndRef.current) {
                    onTrackEndRef.current(current);
                }
            }

            if (!current || currentQueue.length === 0) return;

            const currentIndex = currentQueue.findIndex(t => t.id === current.id);
            if (currentIndex === -1 || currentIndex === currentQueue.length - 1) {
                setIsPlaying(false);
                return;
            }

            // We can't call playTrack directly easily because it's async and depends on state
            // But we can manually trigger the next track logic here
            const nextTrack = currentQueue[currentIndex + 1];
            playTrack(nextTrack);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
            audio.src = '';

            // Clean up any lingering blob URL on unmount
            if (currentBlobUrlRef.current) {
                URL.revokeObjectURL(currentBlobUrlRef.current);
                currentBlobUrlRef.current = null;
            }
        };
    }, []); // Changed back to empty array to avoid resetting audio on track/queue change

    const playTrack = async (track, newQueue = null) => {
        if (newQueue) {
            setQueue(newQueue);
            // Ref will update in effect, but for immediate sync in this function if we were to use it:
            queueRef.current = newQueue;
        }

        const audio = audioRef.current;

        // 1. If same track, just update play/pause state
        if (currentTrack?.id === track.id) {
            togglePlay();
            return;
        }

        // 2. Cleanup previous track
        if (audio.src) {
            audio.pause();
            // Do NOT revoke audio.src directly if we are managing it via ref, 
            // but for safety in legacy mode we normally would. 
            // Here we rely on currentBlobUrlRef.
            audio.removeAttribute('src'); // Clear src
        }

        // Fix: Revoke old blob URL
        if (currentBlobUrlRef.current) {
            URL.revokeObjectURL(currentBlobUrlRef.current);
            currentBlobUrlRef.current = null;
        }

        // 3. Resolve the File
        let file = track.file;

        // If no direct file (refresh case), try to resolve from handle
        if (!file && track.handle) {
            try {
                // Verify permission
                if ((await track.handle.queryPermission({ mode: 'read' })) !== 'granted') {
                    // This request must be triggered by user activation.
                    // Since playTrack is called from onClick, it should work, 
                    // BUT async/await boundaries can sometimes break gesture token tracking in strict browsers.
                    // However, requestPermission is usually lenient if close enough in call stack.
                    const perm = await track.handle.requestPermission({ mode: 'read' });
                    if (perm !== 'granted') {
                        console.warn("Permission denied for file handle");
                        return;
                    }
                }
                file = await track.handle.getFile();
            } catch (e) {
                console.error("Error retrieving file from handle", e);
                return;
            }
        }

        if (!file || !(file instanceof Blob)) {
            console.error("Invalid file object:", file);
            return;
        }

        // 4. Play
        try {
            const url = URL.createObjectURL(file);
            currentBlobUrlRef.current = url; // Store ref

            audio.src = url;
            audio.load(); // Ensure it loads

            await audio.play();

            // Only update state if play succeeded
            setIsPlaying(true);
            setCurrentTrack(track);
            // Sync ref immediately for safety
            currentTrackRef.current = track;
        } catch (e) {
            console.error("Playback failed:", e);
            // Don't set isPlaying true if failed
            setIsPlaying(false);

            // Cleanup on failure
            if (currentBlobUrlRef.current) {
                URL.revokeObjectURL(currentBlobUrlRef.current);
                currentBlobUrlRef.current = null;
            }
        }
    };

    const playNext = () => {
        if (!currentTrack || queue.length === 0) return;
        const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
        if (currentIndex === -1 || currentIndex === queue.length - 1) return; // End of playlist
        playTrack(queue[currentIndex + 1]);
    };

    const playPrevious = () => {
        // If > 3 seconds in, restart song
        if (audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }

        if (!currentTrack || queue.length === 0) return;
        const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
        if (currentIndex <= 0) return; // Start of playlist
        playTrack(queue[currentIndex - 1]);
    };

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const seek = (time) => {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const changeVolume = (vol) => {
        audioRef.current.volume = vol;
        setVolume(vol);
    };

    // Media Session API Integration
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;

        // Function to update metadata
        const updateMetadata = () => {
            if (!currentTrack) {
                navigator.mediaSession.metadata = null;
                return;
            }

            let artworkUrl = null;
            if (currentTrack.picture) {
                artworkUrl = URL.createObjectURL(currentTrack.picture);
            }

            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentTrack.title,
                artist: currentTrack.artist,
                album: currentTrack.album,
                artwork: artworkUrl ? [{ src: artworkUrl, sizes: '512x512', type: 'image/png' }] : []
            });

            // Cleanup old artwork URL when track changes (or component unmounts - handled in cleanup)
            return () => {
                if (artworkUrl) URL.revokeObjectURL(artworkUrl);
            };
        };

        const cleanupMetadata = updateMetadata();

        return () => {
            if (cleanupMetadata) cleanupMetadata();
        };
    }, [currentTrack]);

    // Update Playback State
    useEffect(() => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
        }
    }, [isPlaying]);

    // Register Action Handlers (Once or when dependencies change? Refs are better for stability)
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;

        const actionHandlers = [
            ['play', () => {
                // Use ref to toggle play
                // But togglePlay depends on ref.current which is accessible? 
                // Wait, togglePlay in this scope uses state `isPlaying`.
                // We should use audioRef directly or safer:
                // Just calling togglePlay() here works IF we re-register when togglePlay changes.
                // OR we can implement the logic using refs.
                // Let's implement logic using refs to be safe and avoid dependecy churn.

                audioRef.current.play()
                    .then(() => setIsPlaying(true))
                    .catch(e => console.error(e));
            }],
            ['pause', () => {
                audioRef.current.pause();
                setIsPlaying(false);
            }],
            ['previoustrack', () => {
                // Logic from playPrevious
                const audio = audioRef.current;
                if (audio.currentTime > 3) {
                    audio.currentTime = 0;
                    setCurrentTime(0); // Sync state
                    return;
                }
                const q = queueRef.current;
                const c = currentTrackRef.current;
                if (!c || q.length === 0) return;
                const idx = q.findIndex(t => t.id === c.id);
                if (idx <= 0) return;
                playTrack(q[idx - 1], q); // Pass q explicitly to be safe, though playTrack handles it
            }],
            ['nexttrack', () => {
                // Logic from playNext
                const q = queueRef.current;
                const c = currentTrackRef.current;
                if (!c || q.length === 0) return;
                const idx = q.findIndex(t => t.id === c.id);
                if (idx === -1 || idx === q.length - 1) return;
                playTrack(q[idx + 1], q);
            }],
            ['seekto', (details) => {
                if (details.seekTime !== undefined) {
                    audioRef.current.currentTime = details.seekTime;
                    setCurrentTime(details.seekTime);
                }
            }]
        ];

        for (const [action, handler] of actionHandlers) {
            try {
                navigator.mediaSession.setActionHandler(action, handler);
            } catch (error) {
                console.warn(`The media session action "${action}" is not supported yet.`);
            }
        }

        return () => {
            // Optional: reset handlers? 
            // navigator.mediaSession.setActionHandler('play', null);
            // etc, but mostly fine to leave them.
        };
    }, []); // Empty dependency array as we use refs!

    return {
        isPlaying,
        currentTime,
        duration,
        volume,
        currentTrack,
        playTrack,
        playNext,
        playPrevious,
        togglePlay,
        seek,
        changeVolume
    };
}

