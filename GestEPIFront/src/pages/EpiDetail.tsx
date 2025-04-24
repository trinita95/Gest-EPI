import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography,
    Paper,
    Grid,
    Button,
    Card,
    CardContent,
    Divider,
    Chip,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert,
    SelectChangeEvent
} from '@mui/material';
import {
    ArrowBack,
    EventNote,
    Add,
    Edit,
    Delete,
    Visibility,
    CalendarToday,
    Engineering,
    Category,
    Inventory
} from '@mui/icons-material';
import { epiService, controlService, managerService, controlStatusService } from '../services/api';
import { Epi, Controle, Gestionnaire, StatutControle } from '../types';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import * as frLocale from 'date-fns/locale/fr';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const EpiDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [epi, setEpi] = useState<Epi | null>(null);
    const [controles, setControles] = useState<Controle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentControle, setCurrentControle] = useState<Partial<Controle>>({});
    const [gestionnaires, setGestionnaires] = useState<Gestionnaire[]>([]);
    const [statuts, setStatuts] = useState<StatutControle[]>([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        if (id) {
            fetchEpiData(parseInt(id));
            fetchControles(parseInt(id));
            fetchGestionnaires();
            fetchStatuts();
        }
    }, [id]);

    const fetchEpiData = async (epiId: number) => {
        try {
            const data = await epiService.getById(epiId);
            setEpi(data);
        } catch (error) {
            console.error('Erreur lors du chargement de l\'EPI:', error);
            setError('Impossible de charger les détails de l\'EPI');
        } finally {
            setLoading(false);
        }
    };

    const fetchControles = async (epiId: number) => {
        try {
            const data = await controlService.getByEpiId(epiId);
            setControles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des contrôles:', error);
        }
    };

    const fetchGestionnaires = async () => {
        try {
            const data = await managerService.getAll();
            setGestionnaires(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des gestionnaires:', error);
        }
    };

    const fetchStatuts = async () => {
        try {
            const data = await controlStatusService.getAll();
            setStatuts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des statuts:', error);
        }
    };

    const formatDate = (dateString?: string | Date) => {
        if (!dateString) return '-';
        try {
            let date: Date;
            if (typeof dateString === 'string') {
                date = parseISO(dateString);
            } else {
                date = dateString;
            }

            // Format manuellement sans utiliser la locale
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();

            return `${day}/${month}/${year}`;
        } catch (error) {
            return '-';
        }
    };

    const handleAddControleClick = () => {
        setCurrentControle({
            date_controle: new Date(),
            epi_id: epi?.id,
            gestionnaire_id: undefined,
            statut_id: undefined,
            remarques: ''
        });
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentControle({ ...currentControle, [name]: value });
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        const name = e.target.name || '';
        const value = e.target.value;
        setCurrentControle({ ...currentControle, [name]: value });
    };

    const handleDateChange = (date: Date | null) => {
        setCurrentControle({
            ...currentControle,
            date_controle: date === null ? undefined : date
        });
    };

    const handleSubmitControle = async () => {
        try {
            if (!currentControle.date_controle || !currentControle.gestionnaire_id || !currentControle.statut_id) {
                setSnackbar({
                    open: true,
                    message: 'Veuillez remplir tous les champs obligatoires',
                    severity: 'error'
                });
                return;
            }

            await controlService.create(currentControle);
            setSnackbar({ open: true, message: 'Contrôle créé avec succès', severity: 'success' });
            handleDialogClose();

            if (id) {
                fetchControles(parseInt(id));
                fetchEpiData(parseInt(id)); // Recharger l'EPI pour mettre à jour les infos de dernier contrôle
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du contrôle:', error);
            setSnackbar({ open: true, message: 'Erreur lors de l\'enregistrement du contrôle', severity: 'error' });
        }
    };

    const calculateNextControlDate = () => {
        if (!epi) return '-';

        const baseDate = epi.dernier_controle ? new Date(epi.dernier_controle) :
            epi.date_mise_service ? new Date(epi.date_mise_service) : null;

        if (!baseDate) return '-';

        const periodicite = epi.periodicite_controle ||
            (epi.type_epi?.periodicite_controle || 0);

        if (periodicite <= 0) return '-';

        return formatDate(addDays(baseDate, periodicite));
    };

    const getDaysRemaining = () => {
        if (!epi) return null;

        const baseDate = epi.dernier_controle ? new Date(epi.dernier_controle) :
            epi.date_mise_service ? new Date(epi.date_mise_service) : null;

        if (!baseDate) return null;

        const periodicite = epi.periodicite_controle ||
            (epi.type_epi?.periodicite_controle || 0);

        if (periodicite <= 0) return null;

        const nextControlDate = addDays(baseDate, periodicite);
        return differenceInDays(nextControlDate, new Date());
    };

    const getStatusColor = (statutId: number) => {
        switch (statutId) {
            case 1: // Opérationnel
                return 'success';
            case 2: // À réparer
                return 'warning';
            case 3: // Mis au rebut
                return 'error';
            default:
                return 'default';
        }
    };

    const getUrgencyColor = (daysRemaining: number | null) => {
        if (daysRemaining === null) return 'default';
        if (daysRemaining < 0) return 'error';
        if (daysRemaining < 7) return 'error';
        if (daysRemaining < 15) return 'warning';
        return 'success';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <Typography>Chargement des données...</Typography>
            </Box>
        );
    }

    if (error || !epi) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <Typography color="error">{error || 'EPI non trouvé'}</Typography>
            </Box>
        );
    }

    const daysRemaining = getDaysRemaining();

    return (
        <>
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/epi')}
                    sx={{ mb: 2 }}
                >
                    Retour à la liste
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        {epi.identifiant_perso} - {epi.marque} {epi.modele}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={handleAddControleClick}
                    >
                        Ajouter un contrôle
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <Inventory sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Informations générales
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Identifiant
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {epi.identifiant_perso}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Numéro de série
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {epi.numero_serie}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Marque
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {epi.marque}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Modèle
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {epi.modele}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Type d'EPI
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {epi.type_epi?.libelle || '-'}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Périodicité de contrôle
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {epi.periodicite_controle || epi.type_epi?.periodicite_controle || '-'} jours
                                    </Typography>
                                </Grid>

                                {epi.taille && (
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Taille
                                        </Typography>
                                        <Typography variant="body1" gutterBottom>
                                            {epi.taille}
                                        </Typography>
                                    </Grid>
                                )}

                                {epi.couleur && (
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Couleur
                                        </Typography>
                                        <Typography variant="body1" gutterBottom>
                                            {epi.couleur}
                                        </Typography>
                                    </Grid>
                                )}

                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Matériel textile
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {epi.type_epi?.est_textile ? 'Oui (renouvellement obligatoire tous les 10 ans)' : 'Non'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Dates importantes
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Date d'achat
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {formatDate(epi.date_achat)}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Date de fabrication
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {formatDate(epi.date_fabrication)}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Date de mise en service
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {formatDate(epi.date_mise_service)}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Dernier contrôle
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {formatDate(epi.dernier_controle)}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Prochain contrôle
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {calculateNextControlDate()}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Jours restants
                                    </Typography>
                                    <Box>
                                        <Chip
                                            label={
                                                daysRemaining !== null
                                                    ? daysRemaining < 0
                                                        ? `En retard de ${Math.abs(daysRemaining)} jour(s)`
                                                        : `${daysRemaining} jour(s)`
                                                    : 'Non défini'
                                            }
                                            color={getUrgencyColor(daysRemaining) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Card sx={{ mt: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <Category sx={{ mr: 1, verticalAlign: 'middle' }} />
                                État actuel
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            {controles.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Chip
                                        label={controles[0].statut?.libelle || '-'}
                                        color={getStatusColor(controles[0].statut_id) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                                        sx={{ fontSize: '1.1rem', py: 2, px: 3, mb: 2 }}
                                    />

                                    <Typography variant="body2" color="text.secondary">
                                        Dernière vérification par {controles[0].gestionnaire?.prenom} {controles[0].gestionnaire?.nom} le {formatDate(controles[0].date_controle)}
                                    </Typography>
                                </Box>
                            ) : (
                                <Typography align="center" color="text.secondary">
                                    Aucun contrôle n'a encore été effectué
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <EventNote sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Historique des contrôles
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            {controles.length > 0 ? (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Statut</TableCell>
                                                <TableCell>Gestionnaire</TableCell>
                                                <TableCell>Remarques</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {controles.map((controle) => (
                                                <TableRow key={controle.id}>
                                                    <TableCell>{formatDate(controle.date_controle)}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={controle.statut?.libelle || '-'}
                                                            color={getStatusColor(controle.statut_id) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>{`${controle.gestionnaire?.prenom || ''} ${controle.gestionnaire?.nom || ''}`}</TableCell>
                                                    <TableCell>{controle.remarques || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography align="center" color="text.secondary">
                                    Aucun contrôle n'a encore été effectué
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Dialog pour ajouter un contrôle */}
            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>Ajouter un contrôle</DialogTitle>
                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label="Date du contrôle"
                                    value={currentControle.date_controle ? new Date(currentControle.date_controle) : null}
                                    onChange={handleDateChange}
                                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Gestionnaire</InputLabel>
                                    <Select
                                        name="gestionnaire_id"
                                        value={currentControle.gestionnaire_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        required
                                    >
                                        {gestionnaires.map((gestionnaire) => (
                                            <MenuItem key={gestionnaire.id} value={gestionnaire.id!.toString()}>
                                                {`${gestionnaire.prenom} ${gestionnaire.nom}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Statut</InputLabel>
                                    <Select
                                        name="statut_id"
                                        value={currentControle.statut_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        required
                                    >
                                        {statuts.map((statut) => (
                                            <MenuItem key={statut.id} value={statut.id!.toString()}>
                                                {statut.libelle}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Remarques"
                                    name="remarques"
                                    value={currentControle.remarques || ''}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={4}
                                    margin="normal"
                                />
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Annuler</Button>
                    <Button onClick={handleSubmitControle} color="primary" variant="contained">
                        Enregistrer
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

export default EpiDetail;