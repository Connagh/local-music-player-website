import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, Heart, Shuffle } from 'lucide-react';
import { Box, Typography, Slider, IconButton, Stack } from '@mui/material';
import { ArtistLinks } from './ArtistLinks';

const CoverImage = React.memo(({ blob }) => {
    const [src, setSrc] = React.useState(null);
    React.useEffect(() => {
        if (!blob) {
            setSrc(null);
            return;
        }
        const url = URL.createObjectURL(blob);
        setSrc(url);
        return () => URL.revokeObjectURL(url);
    }, [blob]);

    if (!src) return null;
    return <img src={src} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
});

export function PlayerBar({
    isPlaying,
    onTogglePlay,
    currentTrack,
    currentTime,
    duration,
    onSeek,
    volume,
    onVolumeChange,
    onFilter,
    onNext,
    onPrevious,
    isLiked,
    onLikeToggle,
    isShuffle,
    onToggleShuffle
}) {
    const formatTime = (time) => {
        if (!time) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')} `;
    };

    return (
        <Box sx={{
            height: 140, // Increased to accommodate extra padding (111 + ~30)
            bgcolor: '#191A23', // Matches Figma or Dark Theme
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 10,
            pb: 2
        }}>
            {/* Progress Bar - Top Edge */}
            {/* Using Slider but styled to look like the thin bar in Figma */}
            {/* Progress Bar - Top Edge */}
            {/* Using Slider but styled to look like the thin bar in Figma */}
            <Box sx={{ width: '100%', height: 8, position: 'relative', mt: -2 /* Pull up to edge */, pt: '2px', px: 4 }}>
                <Slider
                    size="small"
                    value={currentTime}
                    max={duration || 0}
                    onChange={(_, value) => onSeek(value)}
                    sx={{
                        color: 'primary.main',
                        height: 4,
                        padding: 0,
                        '& .MuiSlider-thumb': {
                            width: 0,
                            height: 0,
                            '&:hover, &.Mui-focusVisible, &.Mui-active': {
                                width: 12,
                                height: 12,
                            },
                            transition: 'width 0.2s, height 0.2s'
                        },
                        '& .MuiSlider-rail': {
                            opacity: 0.2,
                            bgcolor: 'text.primary'
                        }
                    }}
                />
            </Box>

            {/* Song Metadata - Centered roughly */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                px: 2,
                mt: 2,  // 16px top spacing from scrubber
                mb: 2   // 16px bottom spacing between info and controls
            }}>
                <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    overflow: 'hidden',
                    bgcolor: 'action.hover',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary'
                }}>
                    {currentTrack?.picture ? (
                        <CoverImage blob={currentTrack.picture} />
                    ) : (
                        <Music size={20} />
                    )}
                </Box>
                <Box sx={{ minWidth: 0, textAlign: 'left' }}>
                    {currentTrack ? (
                        <>
                            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{currentTrack.title}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap component="div">
                                <ArtistLinks artist={currentTrack.artist} onFilter={onFilter} />
                            </Typography>
                        </>
                    ) : (
                        <Typography variant="body2" color="text.secondary">Select a song</Typography>
                    )}
                </Box>
            </Box>

            {/* Controls - Bottom Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, mb: 1, width: '100%' }}>

                {/* Left Spacer for Balance - Now with Heart & Shuffle */}
                <Box sx={{ width: 100, display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
                    <IconButton
                        onClick={onLikeToggle}
                        color={isLiked ? "primary" : "default"}
                        disabled={!currentTrack}
                    >
                        <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                    </IconButton>
                    <IconButton
                        onClick={onToggleShuffle}
                        color={isShuffle ? "primary" : "default"}
                    >
                        <Shuffle size={20} />
                    </IconButton>
                </Box>

                {/* Center Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <IconButton onClick={onPrevious} sx={{ color: 'text.primary' }}>
                        <SkipBack size={24} />
                    </IconButton>
                    <IconButton
                        onClick={onTogglePlay}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            width: 48,
                            height: 48,
                            '&:hover': { bgcolor: 'primary.dark' }
                        }}
                    >
                        {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                    </IconButton>
                    <IconButton onClick={onNext} sx={{ color: 'text.primary' }}>
                        <SkipForward size={24} />
                    </IconButton>
                </Box>

                {/* Right Volume */}
                <Box sx={{ width: 100, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                    <Volume2 size={20} style={{ color: 'rgba(255,255,255,0.7)' }} />
                    <Slider
                        size="small"
                        value={volume}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(_, v) => onVolumeChange(v)}
                        sx={{
                            width: 60,
                            color: 'text.secondary',
                            '& .MuiSlider-thumb': {
                                width: 12,
                                height: 12,
                            }
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
}
