import { IconButton, makeStyles } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ADMIN, CREATE_ASA } from '../../Constants/routes';

export default function SimpleMenu() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const classes = useStyles();
    const router = useHistory();

    const onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const onMenuClose = () => {
        setAnchorEl(null);
    };

    const onMenuItemClick = (event: any,value: string) => {
        onMenuClose();
        router.push(value);
    }

    return (
        <div>
            <IconButton className={classes.menuButton} color="inherit" aria-label="menu" aria-controls="simple-menu" aria-haspopup="true" onClick={onMenuOpen}>
                <MenuIcon />
            </IconButton>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={onMenuClose}
            >
                <MenuItem  onClick={(event) => onMenuItemClick(event,ADMIN)}>Vouchers</MenuItem>
                <MenuItem  onClick={(event) => onMenuItemClick(event,CREATE_ASA)}>Create Voucher</MenuItem>
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
