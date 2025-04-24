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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert,
    FormControlLabel,
    Checkbox,
    Box,
    Grid
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { epiService, epiTypeService } from '../services/api';
import { Epi, TypeEpi } from '../types';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr as frLocale } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';
import { SelectChangeEvent } from '@mui/material/Select';


const EpiList: React.FC = () => {
    const navigate = useNavigate();
    const [epis, setEpis] = useState<Epi[]>([]);
    const [typesEpi, setTypesEpi] = useState<TypeEpi[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentEpi, setCurrentEpi] = useState<Partial<Epi>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        fetchEpis();
        fetchTypesEpi();
    }, []);

    const fetchEpis = async () => {
        try {
            const data = await epiService.getAll();
            setEpis(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des EPI:', error);
            setSnackbar({ open: true, message: 'Erreur lors du chargement des EPI', severity: 'error' });
        }
    };

    const fetchTypesEpi = async () => {
        try {
            const data = await epiTypeService.getAll();
            setTypesEpi(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des types d\'EPI:', error);
        }
    };

    const handleAddClick = () => {
        setCurrentEpi({});
        setIsEditing(false);
        setOpenDialog(true);
    };

    const handleEditClick = (epi: Epi) => {
        setCurrentEpi({ ...epi });
        setIsEditing(true);
        setOpenDialog(true);
    };

    const handleViewDetails = (id: number) => {
        navigate(`/epi/${id}`);
    };

    const handleDeleteClick = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet EPI ?')) {
            try {
                await epiService.delete(id);
                setSnackbar({ open: true, message: 'EPI supprimé avec succès', severity: 'success' });
                fetchEpis();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                setSnackbar({ open: true, message: 'Erreur lors de la suppression de l\'EPI', severity: 'error' });
            }
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentEpi({ ...currentEpi, [name]: value });
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        const name = e.target.name;
        const value = e.target.value;
        setCurrentEpi({ ...currentEpi, [name]: value });
    };

    const handleDateChange = (name: string) => (date: Date | null) => {
        setCurrentEpi({ ...currentEpi, [name]: date });
    };

    const handleSubmit = async () => {
        try {
            if (isEditing && currentEpi.id) {
                await epiService.update(currentEpi.id, currentEpi);
                setSnackbar({ open: true, message: 'EPI mis à jour avec succès', severity: 'success' });
            } else {
                await epiService.create(currentEpi);
                setSnackbar({ open: true, message: 'EPI créé avec succès', severity: 'success' });
            }
            handleDialogClose();
            fetchEpis();
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            setSnackbar({ open: true, message: 'Erreur lors de l\'enregistrement de l\'EPI', severity: 'error' });
        }
    };

    const formatDate = (dateString?: string | Date) => {
        if (!dateString) return '-';
        try {
            if (typeof dateString === 'string') {
                return format(parseISO(dateString), 'dd/MM/yyyy');
            }
            return format(dateString, 'dd/MM/yyyy');
        } catch (error) {
            return '-';
        }
    };

    const getTypeEpiLabel = (typeEpiId: number) => {
        const typeEpi = typesEpi.find(type => type.id === typeEpiId);
        return typeEpi ? typeEpi.libelle : '-';
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Gestion des EPI
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={handleAddClick}
                >
                    Ajouter un EPI
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Identifiant</TableCell>
                            <TableCell>Marque</TableCell>
                            <TableCell>Modèle</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Mise en service</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {epis.length > 0 ? (
                            epis.map((epi) => (
                                <TableRow key={epi.id}>
                                    <TableCell>{epi.id}</TableCell>
                                    <TableCell>{epi.identifiant_perso}</TableCell>
                                    <TableCell>{epi.marque}</TableCell>
                                    <TableCell>{epi.modele}</TableCell>
                                    <TableCell>{getTypeEpiLabel(epi.type_epi_id)}</TableCell>
                                    <TableCell>{formatDate(epi.date_mise_service)}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleViewDetails(epi.id!)} color="primary" size="small">
                                            <Visibility />
                                        </IconButton>
                                        <IconButton onClick={() => handleEditClick(epi)} color="primary" size="small">
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteClick(epi.id!)} color="error" size="small">
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    Aucun EPI trouvé
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog pour ajouter/modifier un EPI */}
            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>{isEditing ? 'Modifier l\'EPI' : 'Ajouter un EPI'}</DialogTitle>
                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Identifiant personnalisé"
                                    name="identifiant_perso"
                                    value={currentEpi.identifiant_perso || ''}
                                    onChange={handleInputChange}
                                    required
                                    margin="normal"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Type d'EPI</InputLabel>
                                    <Select
                                        name="type_epi_id"
                                        value={currentEpi.type_epi_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        required
                                    >
                                        {typesEpi.map((type) => (
                                            <MenuItem key={type.id} value={type.id}>
                                                {type.libelle}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Marque"
                                    name="marque"
                                    value={currentEpi.marque || ''}
                                    onChange={handleInputChange}
                                    required
                                    margin="normal"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Modèle"
                                    name="modele"
                                    value={currentEpi.modele || ''}
                                    onChange={handleInputChange}
                                    required
                                    margin="normal"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Numéro de série"
                                    name="numero_serie"
                                    value={currentEpi.numero_serie || ''}
                                    onChange={handleInputChange}
                                    required
                                    margin="normal"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Taille"
                                    name="taille"
                                    value={currentEpi.taille || ''}
                                    onChange={handleInputChange}
                                    margin="normal"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Couleur"
                                    name="couleur"
                                    value={currentEpi.couleur || ''}
                                    onChange={handleInputChange}
                                    margin="normal"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Périodicité de contrôle (jours)"
                                    name="periodicite_controle"
                                    type="number"
                                    value={currentEpi.periodicite_controle || ''}
                                    onChange={handleInputChange}
                                    margin="normal"
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <DatePicker
                                    label="Date d'achat"
                                    value={currentEpi.date_achat ? new Date(currentEpi.date_achat) : null}
                                    onChange={handleDateChange('date_achat')}
                                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <DatePicker
                                    label="Date de fabrication"
                                    value={currentEpi.date_fabrication ? new Date(currentEpi.date_fabrication) : null}
                                    onChange={handleDateChange('date_fabrication')}
                                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <DatePicker
                                    label="Date de mise en service"
                                    value={currentEpi.date_mise_service ? new Date(currentEpi.date_mise_service) : null}
                                    onChange={handleDateChange('date_mise_service')}
                                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                                />
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
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

export default EpiList;