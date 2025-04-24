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
    FormControlLabel,
    Switch
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { epiTypeService } from '../services/api';
import { TypeEpi } from '../types';

const TypeEpiList: React.FC = () => {
    const [typeEpis, setTypeEpis] = useState<TypeEpi[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentTypeEpi, setCurrentTypeEpi] = useState<Partial<TypeEpi>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        fetchTypeEpis();
    }, []);

    const fetchTypeEpis = async () => {
        try {
            const data = await epiTypeService.getAll();
            setTypeEpis(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des types d\'EPI:', error);
            setSnackbar({ open: true, message: 'Erreur lors du chargement des types d\'EPI', severity: 'error' });
        }
    };

    const handleAddClick = () => {
        setCurrentTypeEpi({
            libelle: '',
            periodicite_controle: 180, // 6 mois par défaut
            est_textile: false
        });
        setIsEditing(false);
        setOpenDialog(true);
    };

    const handleEditClick = (typeEpi: TypeEpi) => {
        setCurrentTypeEpi({ ...typeEpi });
        setIsEditing(true);
        setOpenDialog(true);
    };

    const handleDeleteClick = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce type d\'EPI ?')) {
            try {
                await epiTypeService.delete(id);
                setSnackbar({ open: true, message: 'Type d\'EPI supprimé avec succès', severity: 'success' });
                fetchTypeEpis();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                setSnackbar({ open: true, message: 'Erreur lors de la suppression du type d\'EPI', severity: 'error' });
            }
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentTypeEpi({ ...currentTypeEpi, [name]: value });
    };

    const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentTypeEpi({ ...currentTypeEpi, [name]: parseInt(value) || 0 });
    };

    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setCurrentTypeEpi({ ...currentTypeEpi, [name]: checked });
    };

    const handleSubmit = async () => {
        try {
            if (!currentTypeEpi.libelle || currentTypeEpi.periodicite_controle === undefined) {
                setSnackbar({
                    open: true,
                    message: 'Veuillez remplir tous les champs obligatoires',
                    severity: 'error'
                });
                return;
            }

            if (isEditing && currentTypeEpi.id) {
                await epiTypeService.update(currentTypeEpi.id, currentTypeEpi);
                setSnackbar({ open: true, message: 'Type d\'EPI mis à jour avec succès', severity: 'success' });
            } else {
                await epiTypeService.create(currentTypeEpi);
                setSnackbar({ open: true, message: 'Type d\'EPI créé avec succès', severity: 'success' });
            }
            handleDialogClose();
            fetchTypeEpis();
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            setSnackbar({ open: true, message: 'Erreur lors de l\'enregistrement du type d\'EPI', severity: 'error' });
        }
    };

    const formatPeriodicite = (jours: number) => {
        if (jours >= 365) {
            const annees = Math.floor(jours / 365);
            const mois = Math.floor((jours % 365) / 30);

            let resultat = `${annees} an${annees > 1 ? 's' : ''}`;
            if (mois > 0) {
                resultat += ` ${mois} mois`;
            }
            return resultat;
        } else if (jours >= 30) {
            const mois = Math.floor(jours / 30);
            const joursRestants = jours % 30;

            let resultat = `${mois} mois`;
            if (joursRestants > 0) {
                resultat += ` ${joursRestants} jour${joursRestants > 1 ? 's' : ''}`;
            }
            return resultat;
        }

        return `${jours} jour${jours > 1 ? 's' : ''}`;
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Types d'EPI
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={handleAddClick}
                >
                    Ajouter un type d'EPI
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Libellé</TableCell>
                            <TableCell>Périodicité de contrôle</TableCell>
                            <TableCell>Textile</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {typeEpis.length > 0 ? (
                            typeEpis.map((typeEpi) => (
                                <TableRow key={typeEpi.id}>
                                    <TableCell>{typeEpi.id}</TableCell>
                                    <TableCell>{typeEpi.libelle}</TableCell>
                                    <TableCell>{formatPeriodicite(typeEpi.periodicite_controle)}</TableCell>
                                    <TableCell>{typeEpi.est_textile ? 'Oui' : 'Non'}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEditClick(typeEpi)} color="primary" size="small">
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteClick(typeEpi.id!)} color="error" size="small">
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    Aucun type d'EPI trouvé
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog pour ajouter/modifier un type d'EPI */}
            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditing ? 'Modifier le type d\'EPI' : 'Ajouter un type d\'EPI'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Libellé"
                                name="libelle"
                                value={currentTypeEpi.libelle || ''}
                                onChange={handleInputChange}
                                required
                                margin="normal"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Périodicité de contrôle (jours)"
                                name="periodicite_controle"
                                type="number"
                                value={currentTypeEpi.periodicite_controle || ''}
                                onChange={handleNumberInputChange}
                                required
                                margin="normal"
                                helperText={
                                    currentTypeEpi.periodicite_controle
                                        ? `Équivalent à: ${formatPeriodicite(currentTypeEpi.periodicite_controle)}`
                                        : ''
                                }
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={currentTypeEpi.est_textile || false}
                                        onChange={handleSwitchChange}
                                        name="est_textile"
                                        color="primary"
                                    />
                                }
                                label="Matériel textile (renouvellement tous les 10 ans obligatoire)"
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

export default TypeEpiList;