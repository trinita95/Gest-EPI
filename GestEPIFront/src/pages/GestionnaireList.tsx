import React, { useState, useEffect } from 'react';
import {
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Snackbar,
    Alert,
    Box,
    Grid,
    InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, Email, Person, Password, Visibility, VisibilityOff } from '@mui/icons-material';
import { managerService } from '../services/api';
import { Gestionnaire } from '../types';
import { format, parseISO } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';

const GestionnaireList: React.FC = () => {
    const [gestionnaires, setGestionnaires] = useState<Gestionnaire[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentGestionnaire, setCurrentGestionnaire] = useState<Partial<Gestionnaire>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        fetchGestionnaires();
    }, []);

    const fetchGestionnaires = async () => {
        try {
            const data = await managerService.getAll();
            setGestionnaires(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des gestionnaires:', error);
            setSnackbar({ open: true, message: 'Erreur lors du chargement des gestionnaires', severity: 'error' });
        }
    };

    const handleAddClick = () => {
        setCurrentGestionnaire({
            nom: '',
            prenom: '',
            email: '',
            password: ''
        });
        setIsEditing(false);
        setOpenDialog(true);
    };

    const handleEditClick = (gestionnaire: Gestionnaire) => {
        setCurrentGestionnaire({
            ...gestionnaire,
            password: '' // Ne pas afficher le mot de passe existant
        });
        setIsEditing(true);
        setOpenDialog(true);
    };

    const handleDeleteClick = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce gestionnaire ?')) {
            try {
                await managerService.delete(id);
                setSnackbar({ open: true, message: 'Gestionnaire supprimé avec succès', severity: 'success' });
                fetchGestionnaires();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                setSnackbar({ open: true, message: 'Erreur lors de la suppression du gestionnaire', severity: 'error' });
            }
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setShowPassword(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentGestionnaire({ ...currentGestionnaire, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            // Validation basique
            if (!currentGestionnaire.nom || !currentGestionnaire.prenom || !currentGestionnaire.email) {
                setSnackbar({
                    open: true,
                    message: 'Veuillez remplir tous les champs obligatoires',
                    severity: 'error'
                });
                return;
            }

            // Validation email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(currentGestionnaire.email)) {
                setSnackbar({
                    open: true,
                    message: 'Veuillez entrer une adresse e-mail valide',
                    severity: 'error'
                });
                return;
            }

            // Validation mot de passe pour les nouveaux gestionnaires
            if (!isEditing && (!currentGestionnaire.password || currentGestionnaire.password.length < 6)) {
                setSnackbar({
                    open: true,
                    message: 'Le mot de passe doit contenir au moins 6 caractères',
                    severity: 'error'
                });
                return;
            }

            // Si on édite et qu'aucun mot de passe n'est fourni, on ne modifie pas le mot de passe existant
            if (isEditing && currentGestionnaire.id) {
                if (!currentGestionnaire.password || currentGestionnaire.password.trim() === '') {
                    const { password, ...gestionnaireSansPassword } = currentGestionnaire;
                    await managerService.update(currentGestionnaire.id, gestionnaireSansPassword);
                } else {
                    await managerService.update(currentGestionnaire.id, currentGestionnaire);
                }
                setSnackbar({ open: true, message: 'Gestionnaire mis à jour avec succès', severity: 'success' });
            } else {
                await managerService.create(currentGestionnaire);
                setSnackbar({ open: true, message: 'Gestionnaire créé avec succès', severity: 'success' });
            }
            handleDialogClose();
            fetchGestionnaires();
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            setSnackbar({ open: true, message: 'Erreur lors de l\'enregistrement du gestionnaire', severity: 'error' });
        }
    };

    const formatDate = (dateString?: string | Date) => {
        if (!dateString) return '-';
        try {
            if (typeof dateString === 'string') {
                return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: frLocale });
            }
            return format(dateString, 'dd/MM/yyyy HH:mm', { locale: frLocale });
        } catch (error) {
            return '-';
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Gestionnaires
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={handleAddClick}
                >
                    Ajouter un gestionnaire
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Nom</TableCell>
                            <TableCell>Prénom</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Date de création</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {gestionnaires.length > 0 ? (
                            gestionnaires.map((gestionnaire) => (
                                <TableRow key={gestionnaire.id}>
                                    <TableCell>{gestionnaire.id}</TableCell>
                                    <TableCell>{gestionnaire.nom}</TableCell>
                                    <TableCell>{gestionnaire.prenom}</TableCell>
                                    <TableCell>{gestionnaire.email}</TableCell>
                                    <TableCell>{formatDate(gestionnaire.created_at)}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEditClick(gestionnaire)} color="primary" size="small">
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteClick(gestionnaire.id!)} color="error" size="small">
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    Aucun gestionnaire trouvé
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog pour ajouter/modifier un gestionnaire */}
            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditing ? 'Modifier le gestionnaire' : 'Ajouter un gestionnaire'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nom"
                                name="nom"
                                value={currentGestionnaire.nom || ''}
                                onChange={handleInputChange}
                                required
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Prénom"
                                name="prenom"
                                value={currentGestionnaire.prenom || ''}
                                onChange={handleInputChange}
                                required
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={currentGestionnaire.email || ''}
                                onChange={handleInputChange}
                                required
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={isEditing ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={currentGestionnaire.password || ''}
                                onChange={handleInputChange}
                                required={!isEditing}
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Password />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Annuler</Button>
                    <Button onClick={handleSubmit} color="primary" variant="contained">
                        {isEditing ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default GestionnaireList;