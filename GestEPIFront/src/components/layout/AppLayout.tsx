import React from 'react';
import { CssBaseline, Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Container } from '@mui/material';
import { InventoryOutlined, AssignmentOutlined, NotificationsOutlined, PeopleOutlined, CategoryOutlined } from '@mui/icons-material';
import { Link, Outlet } from 'react-router-dom';

const drawerWidth = 240;

const AppLayout: React.FC = () => {
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        GestEPI - Gestion des Équipements de Protection Individuelle
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        <ListItem button component={Link} to="/epi">
                            <ListItemIcon>
                                <InventoryOutlined />
                            </ListItemIcon>
                            <ListItemText primary="EPI" />
                        </ListItem>
                        <ListItem button component={Link} to="/controles">
                            <ListItemIcon>
                                <AssignmentOutlined />
                            </ListItemIcon>
                            <ListItemText primary="Contrôles" />
                        </ListItem>
                        <ListItem button component={Link} to="/alertes">
                            <ListItemIcon>
                                <NotificationsOutlined />
                            </ListItemIcon>
                            <ListItemText primary="Alertes" />
                        </ListItem>
                        <ListItem button component={Link} to="/gestionnaires">
                            <ListItemIcon>
                                <PeopleOutlined />
                            </ListItemIcon>
                            <ListItemText primary="Gestionnaires" />
                        </ListItem>
                        <ListItem button component={Link} to="/type-epi">
                            <ListItemIcon>
                                <CategoryOutlined />
                            </ListItemIcon>
                            <ListItemText primary="Types d'EPI" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Container maxWidth="lg">
                    <Outlet />
                </Container>
            </Box>
        </Box>
    );
};

export default AppLayout;