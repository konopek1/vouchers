import { IconButton, makeStyles } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import React, { useState } from 'react';

export default function SimpleMenu() {
    const [anchorEl, _] = useState<null | HTMLElement>(null);
    const classes = useStyles();

    return (
        <div>
            <IconButton className={classes.menuButton} color="inherit" aria-label="menu" aria-controls="simple-menu" aria-haspopup="true">
                <MenuIcon />
            </IconButton>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
            >
            </Menu>
        </div>
    );
}


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        width: '100vw'
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));
