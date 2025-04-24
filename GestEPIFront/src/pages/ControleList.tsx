import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    Typography,
    Button,
    Box,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Divider,
    Fade,
    Paper,
    Table,
    TableContainer,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TablePagination,
    Snackbar,
    Alert,
    Fab,
    useTheme,
    alpha,
    styled
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
    Add as AddIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CalendarMonth as CalendarMonthIcon,
    Person as PersonIcon,
    Assignment as AssignmentIcon,
    FilterList as FilterListIcon,
    Sort as SortIcon,
    Search as SearchIcon,
    CheckCircle as CheckCircleIcon,
    ErrorOutline as ErrorOutlineIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { controlService, epiService, managerService, controlStatusService } from '../services/api';
import { Controle, Epi, Gestionnaire, StatutControle } from '../types';

// Composants stylisés
const RoundedPaper = styled(Paper)(({ theme }) => ({
    borderRadius: 16,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden'
}));

const StatusChip = ({ status, label }: { status: number; label: string }) => {
    const theme = useTheme();

    let color;
    let bgColor;
    let icon;

    switch (status) {
        case 1: // Conforme/OK
            color = theme.palette.success.main;
            bgColor = alpha(theme.palette.success.main, 0.1);
            icon = <CheckCircleIcon fontSize="small" />;
            break;
        case 2: // Avertissement/À réparer
            color = theme.palette.warning.main;
            bgColor = alpha(theme.palette.warning.main, 0.1);
            icon = <WarningIcon fontSize="small" />;
            break;
        case 3: // Non-conforme/Défectueux
            color = theme.palette.error.main;
            bgColor = alpha(theme.palette.error.main, 0.1);
            icon = <ErrorOutlineIcon fontSize="small" />;
            break;
        default:
            color = theme.palette.info.main;
            bgColor = alpha(theme.palette.info.main, 0.1);
            icon = <InfoIcon fontSize="small" />;
    }

    return (
        <Chip
            label={label}
            icon={icon}
            size="small"
            sx={{
                backgroundColor: bgColor,
                color: color,
                fontWeight: 600,
                '& .MuiChip-icon': {
                    color: color
                }
            }}
        />
    );
};

// Interface pour le dialogue de confirmation
interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    content: string;
}

const ConfirmDialog = ({ open, onClose, onConfirm, title, content }: ConfirmDialogProps) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>{title}</DialogTitle>
            <DialogContent>
                <Typography variant="body1">{content}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined" color="inherit">
                    Annuler
                </Button>
                <Button onClick={onConfirm} variant="contained" color="error">
                    Supprimer
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const ControleList = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    // États
    const [controles, setControles] = useState<Controle[]>([]);
    const [epis, setEpis] = useState<Epi[]>([]);
    const [gestionnaires, setGestionnaires] = useState<Gestionnaire[]>([]);
    const [statuts, setStatuts] = useState<StatutControle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // États de pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // États pour le formulaire
    const [openDialog, setOpenDialog] = useState(false);
    const [currentControle, setCurrentControle] = useState<Partial<Controle>>({});
    const [isEditing, setIsEditing] = useState(false);

    // État pour la confirmation de suppression
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        id: 0,
        title: '',
        content: ''
    });

    // État pour les snackbars
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info' | 'warning'
    });

    useEffect(() => {
        fetchControles();
        fetchEpis();
        fetchGestionnaires();
        fetchStatuts();
    }, []);

    const fetchControles = async () => {
        setLoading(true);
        try {
            const data = await controlService.getAll();
            setControles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des contrôles:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des contrôles',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchEpis = async () => {
        try {
            const data = await epiService.getAll();
            setEpis(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des EPI:', error);
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

    const handleAddClick = () => {
        setCurrentControle({
            date_controle: new Date()
        });
        setIsEditing(false);
        setOpenDialog(true);
    };

    const handleEditClick = (controle: Controle) => {
        setCurrentControle({ ...controle });
        setIsEditing(true);
        setOpenDialog(true);
    };

    const handleViewDetails = (id: number) => {
        navigate(`/controles/${id}`);
    };

    const handleDeleteClick = (id: number) => {
        setConfirmDialog({
            open: true,
            id: id,
            title: 'Confirmer la suppression',
            content: 'Êtes-vous sûr de vouloir supprimer ce contrôle ? Cette action est irréversible.'
        });
    };

    const handleConfirmDelete = async () => {
        try {
            await controlService.delete(confirmDialog.id);
            setSnackbar({
                open: true,
                message: 'Contrôle supprimé avec succès',
                severity: 'success'
            });
            fetchControles();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors de la suppression du contrôle',
                severity: 'error'
            });
        } finally {
            setConfirmDialog({
                ...confirmDialog,
                open: false
            });
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentControle({ ...currentControle, [name]: value });
    };

    const handleSelectChange = (e: any) => {
        const { name, value } = e.target;
        setCurrentControle({ ...currentControle, [name]: value });
    };

    const handleDateChange = (date: Date | null) => {
        setCurrentControle({
            ...currentControle,
            date_controle: date === null ? undefined : date
        });
    };

    const handleSubmit = async () => {
        try {
            // Validation des champs obligatoires
            if (!currentControle.date_controle || !currentControle.epi_id || !currentControle.gestionnaire_id || !currentControle.statut_id) {
                setSnackbar({
                    open: true,
                    message: 'Veuillez remplir tous les champs obligatoires',
                    severity: 'warning'
                });
                return;
            }

            if (isEditing && currentControle.id) {
                await controlService.update(currentControle.id, currentControle);
                setSnackbar({
                    open: true,
                    message: 'Contrôle mis à jour avec succès',
                    severity: 'success'
                });
            } else {
                await controlService.create(currentControle);
                setSnackbar({
                    open: true,
                    message: 'Contrôle créé avec succès',
                    severity: 'success'
                });
            }
            handleDialogClose();
            fetchControles();
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors de l\'enregistrement du contrôle',
                severity: 'error'
            });
        }
    };

    const formatDate = (dateString?: string | Date) => {
        if (!dateString) return '-';
        try {
            if (typeof dateString === 'string') {
                return format(parseISO(dateString), 'dd MMM yyyy', { locale: fr });
            }
            return format(dateString, 'dd MMM yyyy', { locale: fr });
        } catch (error) {
            return '-';
        }
    };

    const getEpiLabel = (epiId: number) => {
        const epi = epis.find(e => e.id === epiId);
        return epi ? `${epi.identifiant_perso} - ${epi.marque} ${epi.modele}` : '-';
    };

    const getGestionnaireLabel = (gestionnaireId: number) => {
        const gestionnaire = gestionnaires.find(g => g.id === gestionnaireId);
        return gestionnaire ? `${gestionnaire.nom} ${gestionnaire.prenom}` : '-';
    };

    const getStatutLabel = (statutId: number) => {
        const statut = statuts.find(s => s.id === statutId);
        return statut ? statut.libelle : '-';
    };

    // Filtrage des données basé sur la recherche
    const filteredControles = controles.filter(controle => {
        const searchString = searchQuery.toLowerCase();
        const epiLabel = controle.epi
            ? `${controle.epi.identifiant_perso} ${controle.epi.marque} ${controle.epi.modele}`.toLowerCase()
            : getEpiLabel(controle.epi_id).toLowerCase();

        const gestionnaireLabel = controle.gestionnaire
            ? `${controle.gestionnaire.nom} ${controle.gestionnaire.prenom}`.toLowerCase()
            : getGestionnaireLabel(controle.gestionnaire_id).toLowerCase();

        const statutLabel = controle.statut
            ? controle.statut.libelle.toLowerCase()
            : getStatutLabel(controle.statut_id).toLowerCase();

        const dateLabel = formatDate(controle.date_controle).toLowerCase();

        return epiLabel.includes(searchString) ||
            gestionnaireLabel.includes(searchString) ||
            statutLabel.includes(searchString) ||
            dateLabel.includes(searchString) ||
            (controle.remarques && controle.remarques.toLowerCase().includes(searchString));
    });

    // Pagination
    const paginatedControles = filteredControles.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Gestion des changements de page
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    // Gestion des changements de nombre de lignes par page
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box>
            {/* Header et Bouton d'ajout */}
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Gestion des Contrôles
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Suivez et gérez les contrôles de vos équipements de protection
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddClick}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    Ajouter un contrôle
                </Button>
            </Box>

            {/* Barre de recherche et filtres */}
            <RoundedPaper sx={{ p: 2, mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Box position="relative">
                            <TextField
                                placeholder="Rechercher un contrôle..."
                                variant="outlined"
                                fullWidth
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                                    sx: { borderRadius: 2 }
                                }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<FilterListIcon />}
                            sx={{ borderRadius: 2 }}
                        >
                            Filtrer
                        </Button>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<SortIcon />}
                            sx={{ borderRadius: 2 }}
                        >
                            Trier
                        </Button>
                    </Grid>
                </Grid>
            </RoundedPaper>

            {/* Liste des contrôles */}
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={10}>
                    <CircularProgress size={60} thickness={4} />
                </Box>
            ) : (
                <RoundedPaper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell width="5%">#</TableCell>
                                    <TableCell width="15%">
                                        <Box display="flex" alignItems="center">
                                            <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} />
                                            Date
                                        </Box>
                                    </TableCell>
                                    <TableCell width="25%">
                                        <Box display="flex" alignItems="center">
                                            <AssignmentIcon fontSize="small" sx={{ mr: 1 }} />
                                            EPI
                                        </Box>
                                    </TableCell>
                                    <TableCell width="20%">
                                        <Box display="flex" alignItems="center">
                                            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                                            Gestionnaire
                                        </Box>
                                    </TableCell>
                                    <TableCell width="15%">Statut</TableCell>
                                    <TableCell width="20%" align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedControles.length > 0 ? (
                                    paginatedControles.map((controle) => (
                                        <TableRow
                                            key={controle.id}
                                            hover
                                            sx={{
                                                transition: 'background-color 0.2s',
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                                }
                                            }}
                                        >
                                            <TableCell>{controle.id}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {formatDate(controle.date_controle)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    <Typography variant="body2" noWrap>
                                                        {controle.epi
                                                            ? `${controle.epi.identifiant_perso} - ${controle.epi.marque} ${controle.epi.modele}`
                                                            : getEpiLabel(controle.epi_id)
                                                        }
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <Avatar
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                            color: theme.palette.primary.main,
                                                            mr: 1,
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        {controle.gestionnaire
                                                            ? `${controle.gestionnaire.prenom.charAt(0)}${controle.gestionnaire.nom.charAt(0)}`
                                                            : 'G'
                                                        }
                                                    </Avatar>
                                                    <Typography variant="body2">
                                                        {controle.gestionnaire
                                                            ? `${controle.gestionnaire.prenom} ${controle.gestionnaire.nom}`
                                                            : getGestionnaireLabel(controle.gestionnaire_id)
                                                        }
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <StatusChip
                                                    status={controle.statut_id}
                                                    label={controle.statut ? controle.statut.libelle : getStatutLabel(controle.statut_id)}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Voir les détails">
                                                    <IconButton
                                                        onClick={() => handleViewDetails(controle.id!)}
                                                        sx={{
                                                            color: theme.palette.info.main,
                                                            '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.1) }
                                                        }}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Modifier">
                                                    <IconButton
                                                        onClick={() => handleEditClick(controle)}
                                                        sx={{
                                                            color: theme.palette.primary.main,
                                                            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Supprimer">
                                                    <IconButton
                                                        onClick={() => handleDeleteClick(controle.id!)}
                                                        sx={{
                                                            color: theme.palette.error.main,
                                                            '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) }
                                                        }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                            <Box display="flex" flexDirection="column" alignItems="center">
                                                <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                                    Aucun contrôle trouvé
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {searchQuery
                                                        ? "Modifiez vos critères de recherche pour trouver des contrôles"
                                                        : "Ajoutez votre premier contrôle en cliquant sur le bouton 'Ajouter un contrôle'"
                                                    }
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {filteredControles.length > 0 && (
                        <TablePagination
                            component="div"
                            count={filteredControles.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            labelRowsPerPage="Lignes par page:"
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                        />
                    )}
                </RoundedPaper>
            )}

            {/* Fab Button pour mobile */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 1000,
                    display: { xs: 'block', sm: 'none' }
                }}
            >
                <Fab
                    color="primary"
                    onClick={handleAddClick}
                    sx={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' }}
                >
                    <AddIcon />
                </Fab>
            </Box>

            {/* Dialog pour ajouter/modifier un contrôle */}
            <Dialog
                open={openDialog}
                onClose={handleDialogClose}
                maxWidth="md"
                fullWidth
                TransitionComponent={Fade}
                transitionDuration={300}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
                    }
                }}
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" component="div" fontWeight="bold">
                            {isEditing ? 'Modifier le contrôle' : 'Ajouter un contrôle'}
                        </Typography>
                        <IconButton edge="end" onClick={handleDialogClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 3 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Box mb={3}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Date du contrôle *
                                    </Typography>
                                    <DatePicker
                                        value={currentControle.date_controle ? new Date(currentControle.date_controle) : null}
                                        onChange={handleDateChange}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                required: true,
                                                sx: { borderRadius: 2 }
                                            }
                                        }}
                                    />
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box mb={3}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        EPI *
                                    </Typography>
                                    <FormControl fullWidth>
                                        <Select
                                            name="epi_id"
                                            value={currentControle.epi_id?.toString() || ''}
                                            onChange={handleSelectChange}
                                            displayEmpty
                                            required
                                            sx={{ borderRadius: 2 }}
                                            renderValue={(selected) => {
                                                if (!selected) {
                                                    return <Typography color="text.secondary">Sélectionner un EPI</Typography>;
                                                }
                                                return getEpiLabel(Number(selected));
                                            }}
                                        >
                                            <MenuItem disabled value="">
                                                <Typography color="text.secondary">Sélectionner un EPI</Typography>
                                            </MenuItem>
                                            {epis.map((epi) => (
                                                <MenuItem key={epi.id} value={epi.id!.toString()}>
                                                    {`${epi.identifiant_perso} - ${epi.marque} ${epi.modele}`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box mb={3}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Gestionnaire *
                                    </Typography>
                                    <FormControl fullWidth>
                                        <Select
                                            name="gestionnaire_id"
                                            value={currentControle.gestionnaire_id?.toString() || ''}
                                            onChange={handleSelectChange}
                                            displayEmpty
                                            required
                                            sx={{ borderRadius: 2 }}
                                            renderValue={(selected) => {
                                                if (!selected) {
                                                    return <Typography color="text.secondary">Sélectionner un gestionnaire</Typography>;
                                                }
                                                return getGestionnaireLabel(Number(selected));
                                            }}
                                        >
                                            <MenuItem disabled value="">
                                                <Typography color="text.secondary">Sélectionner un gestionnaire</Typography>
                                            </MenuItem>
                                            {gestionnaires.map((gestionnaire) => (
                                                <MenuItem key={gestionnaire.id} value={gestionnaire.id!.toString()}>
                                                    {`${gestionnaire.prenom} ${gestionnaire.nom}`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box mb={3}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Statut *
                                    </Typography>
                                    <FormControl fullWidth>
                                        <Select
                                            name="statut_id"
                                            value={currentControle.statut_id?.toString() || ''}
                                            onChange={handleSelectChange}
                                            displayEmpty
                                            required
                                            sx={{ borderRadius: 2 }}
                                            renderValue={(selected) => {
                                                if (!selected) {
                                                    return <Typography color="text.secondary">Sélectionner un statut</Typography>;
                                                }
                                                return getStatutLabel(Number(selected));
                                            }}
                                        >
                                            <MenuItem disabled value="">
                                                <Typography color="text.secondary">Sélectionner un statut</Typography>
                                            </MenuItem>
                                            {statuts.map((statut) => {
                                                let icon;
                                                let color;

                                                switch(statut.id) {
                                                    case 1: // Conforme/OK
                                                        icon = <CheckCircleIcon fontSize="small" />;
                                                        color = theme.palette.success.main;
                                                        break;
                                                    case 2: // Avertissement/À réparer
                                                        icon = <WarningIcon fontSize="small" />;
                                                        color = theme.palette.warning.main;
                                                        break;
                                                    case 3: // Non-conforme/Défectueux
                                                        icon = <ErrorOutlineIcon fontSize="small" />;
                                                        color = theme.palette.error.main;
                                                        break;
                                                    default:
                                                        icon = <InfoIcon fontSize="small" />;
                                                        color = theme.palette.info.main;
                                                }

                                                return (
                                                    <MenuItem key={statut.id} value={statut.id!.toString()}>
                                                        <Box display="flex" alignItems="center">
                                                            <Box component="span" sx={{ color, mr: 1 }}>
                                                                {icon}
                                                            </Box>
                                                            {statut.libelle}
                                                        </Box>
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Box mb={3}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Remarques
                                    </Typography>
                                    <TextField
                                        name="remarques"
                                        value={currentControle.remarques || ''}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={4}
                                        fullWidth
                                        placeholder="Notez ici vos observations sur l'état de l'équipement..."
                                        InputProps={{
                                            sx: { borderRadius: 2 }
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ p: 2.5 }}>
                    <Button
                        onClick={handleDialogClose}
                        variant="outlined"
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        {isEditing ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog de confirmation de suppression */}
            <ConfirmDialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
                onConfirm={handleConfirmDelete}
                title={confirmDialog.title}
                content={confirmDialog.content}
            />

            {/* Snackbar pour les notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ControleList;