import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Typography, Link, Box } from '@mui/material';
import { isIOSSafari, isBrave } from '../utils/platform';

const BROWSER_LINKS = {
    Chrome: "https://apps.apple.com/us/app/google-chrome/id535886823",
    Firefox: "https://apps.apple.com/us/app/firefox-private-safe-browser/id989804926",
    Brave: "https://apps.apple.com/us/app/brave-private-web-browser/id1052879175"
};

export const IOSWarningSnackbar = () => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const checkBrave = async () => {
            // Only show if it's iOS Safari AND NOT Brave
            if (isIOSSafari()) {
                const brave = await isBrave();
                if (!brave) {
                    setOpen(true);
                }
            }
        };
        checkBrave();
    }, []);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Snackbar
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            autoHideDuration={null} // Don't auto-hide, let user see it
        >
            <Alert
                onClose={handleClose}
                severity="warning"
                variant="filled"
                sx={{ width: '100%', maxWidth: '600px' }}
            >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Safari on iOS may cause playback issues.
                </Typography>
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                        For the best experience, we recommend using:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
                        {Object.entries(BROWSER_LINKS).map(([name, url]) => (
                            <Link
                                key={name}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: 'white', textDecoration: 'underline', fontWeight: 'bold' }}
                            >
                                {name}
                            </Link>
                        ))}
                    </Box>
                </Box>
            </Alert>
        </Snackbar>
    );
};
