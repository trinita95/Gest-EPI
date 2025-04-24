import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    Typography,
    Paper,
    Grid,
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Box,
    Avatar,
    Chip,
    LinearProgress,
    Slider,
    TextField,
    CircularProgress,
    Tabs,
    Tab,
    Alert,
    Snackbar,
    Fade,
    useTheme,
    alpha,
    styled
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    FilterAlt as FilterAltIcon,
    Warning as WarningIcon,
    Check as CheckIcon,
    Error as ErrorIcon,
    AccessTime as AccessTimeIcon,
    Engineering as EngineeringIcon,
    CalendarMonth as CalendarMonthIcon,
    Timer as TimerIcon,
    Visibility as VisibilityIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { epiService, controlService } from '../services/api';
import { Epi } from '../types';

// Styled components
const RoundedPaper = styled(Paper)(({ theme }) => ({
    borderRadius: 16,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden'
}));

// Cette fois, on utilise l'API plus simple de styled pour éviter les problèmes de propriétés
const ProgressBar = styled(LinearProgress)(({ theme }) => ({
    height: 8,
    borderRadius: 4,
    backgroundColor: alpha(theme.palette.grey[300], 0.5),
    '.MuiLinearProgress-bar': {
        borderRadius: 4,
    }
}));

// Utilisation des props TypeScript pour éviter les erreurs
interface StatusChipProps {
    label: string;
    icon: React.ReactNode;
    status: 'late' | 'warning' | 'good' | 'unknown';
    size?: 'small' | 'medium';
}

const StatusChip = ({ label, icon, status, size = 'medium' }: StatusChipProps) => {
    const theme = useTheme();

    let color;
    let bgColor;

    switch (status) {
        case 'late':
            color = theme.palette.error.main;
            bgColor = alpha(theme.palette.error.main, 0.1);
            break;
        case 'warning':
            color = theme.palette.warning.main;
            bgColor = alpha(theme.palette.warning.main, 0.1);
            break;
        case 'good':
            color = theme.palette.success.main;
            bgColor = alpha(theme.palette.success.main, 0.1);
            break;
        default:
            color = theme.palette.grey[700];
            bgColor = alpha(theme.palette.grey[500], 0.1);
    }

    return (
        <Chip
            label={label}
            icon={React.cloneElement(icon as React.ReactElement, { fontSize: 'small' })}
            size={size}
            sx={{
                backgroundColor: bgColor,
                color: color,
                borderColor: color,
                fontWeight: 600,
                '& .MuiChip-icon': {
                    color: color
                }
            }}
        />
    );
};

const AlertesPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    // State
    const [epis, setEpis] = useState<Epi[]>([]);
    const [daysThreshold, setDaysThreshold] = useState<number>(30);
    const [loading, setLoading] = useState<boolean>(false);
    const [tabValue, setTabValue] = useState<number>(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        enRetard: 0,
        aSuivre: 0,
        aJour: 0
    });

    useEffect(() => {
        fetchEpisWithUpcomingControls();
    }, [daysThreshold]);

    const fetchEpisWithUpcomingControls = async () => {
        setLoading(true);
        try {
            const data = await epiService.getAlerts(daysThreshold);
            const items = Array.isArray(data) ? data : [];
            setEpis(items);

            // Calculate stats
            const enRetard = items.filter(epi => {
                const days = getDaysRemaining(epi);
                return days !== null && days < 0;
            }).length;

            const aSuivre = items.filter(epi => {
                const days = getDaysRemaining(epi);
                return days !== null && days >= 0 && days <= 15;
            }).length;

            setStats({
                total: items.length,
                enRetard,
                aSuivre,
                aJour: items.length - enRetard - aSuivre
            });

        } catch (error) {
            console.error('Erreur lors du chargement des alertes:', error);
            setSnackbar({ open: true, message: "Impossible de charger les alertes.", severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleViewEpiDetails = (id: number) => {
        navigate(`/epi/${id}`);
    };

    const handleCreateControle = (epi: Epi) => {
        navigate(`/epi/${epi.id}`, { state: { openControleDialog: true } });
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

    const calculateNextControlDate = (epi: Epi) => {
        if (!epi.dernier_controle && !epi.date_mise_service) return '-';

        const baseDate = epi.dernier_controle ? new Date(epi.dernier_controle) :
            epi.date_mise_service ? new Date(epi.date_mise_service) : null;

        if (!baseDate) return '-';

        const periodicite = epi.periodicite_controle ||
            (epi.type_epi?.periodicite_controle || 0);

        if (periodicite <= 0) return '-';

        return formatDate(addDays(baseDate, periodicite));
    };

    const getDaysRemaining = (epi: Epi) => {
        if (!epi.dernier_controle && !epi.date_mise_service) return null;

        const baseDate = epi.dernier_controle ? new Date(epi.dernier_controle) :
            epi.date_mise_service ? new Date(epi.date_mise_service) : null;

        if (!baseDate) return null;

        const periodicite = epi.periodicite_controle ||
            (epi.type_epi?.periodicite_controle || 0);

        if (periodicite <= 0) return null;

        const nextControlDate = addDays(baseDate, periodicite);
        return differenceInDays(nextControlDate, new Date());
    };

    // Filter EPIs based on the selected tab
    const filteredEpis = epis.filter(epi => {
        const days = getDaysRemaining(epi);

        if (tabValue === 0) return true; // All
        if (tabValue === 1) return days !== null && days < 0; // Late
        if (tabValue === 2) return days !== null && days >= 0 && days <= 15; // Warning
        if (tabValue === 3) return days !== null && days > 15; // Good

        return true;
    });

    const getStatusInfo = (days: number | null) => {
        if (days === null) {
            return {
                icon: <AccessTimeIcon />,
                color: theme.palette.grey[500],
                label: "Non déterminé",
                progress: 0,
                status: 'unknown' as 'unknown'
            };
        }

        if (days < 0) {
            return {
                icon: <ErrorIcon />,
                color: theme.palette.error.main,
                label: `En retard de ${Math.abs(days)} jour(s)`,
                progress: 100,
                status: 'late' as 'late'
            };
        }

        if (days <= 15) {
            return {
                icon: <WarningIcon />,
                color: theme.palette.warning.main,
                label: `${days} jour(s) restant(s)`,
                progress: Math.min(100, Math.max(0, 100 - (days / 15) * 100)),
                status: 'warning' as 'warning'
            };
        }

        return {
            icon: <CheckIcon />,
            color: theme.palette.success.main,
            label: `${days} jour(s) restant(s)`,
            progress: 30,
            status: 'good' as 'good'
        };
    };

    return (
        <Box>
            {/* Header section */}
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Alertes de contrôle
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Suivez les équipements nécessitant une attention particulière
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                    onClick={fetchEpisWithUpcomingControls}
                    disabled={loading}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    Actualiser
                </Button>
            </Box>

            {/* Stats cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.07)' }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                                        Total des équipements
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {loading ? '...' : stats.total}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                                    <EngineeringIcon />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        borderRadius: 3,
                        boxShadow: stats.enRetard > 0
                            ? `0 4px 20px ${alpha(theme.palette.error.main, 0.3)}`
                            : '0 4px 20px rgba(0, 0, 0, 0.07)'
                    }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                                        En retard
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        fontWeight="bold"
                                        color={stats.enRetard > 0 ? "error.main" : "text.primary"}
                                    >
                                        {loading ? '...' : stats.enRetard}
                                    </Typography>
                                </Box>
                                <Avatar sx={{
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    color: theme.palette.error.main
                                }}>
                                    <ErrorIcon />
                                </Avatar>
                            </Box>
                            <ProgressBar
                                variant="determinate"
                                value={loading ? 0 : (stats.total > 0 ? (stats.enRetard / stats.total) * 100 : 0)}
                                color="error"
                                sx={{ mt: 2 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        borderRadius: 3,
                        boxShadow: stats.aSuivre > 0
                            ? `0 4px 20px ${alpha(theme.palette.warning.main, 0.3)}`
                            : '0 4px 20px rgba(0, 0, 0, 0.07)'
                    }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                                        À surveiller
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        fontWeight="bold"
                                        color={stats.aSuivre > 0 ? "warning.main" : "text.primary"}
                                    >
                                        {loading ? '...' : stats.aSuivre}
                                    </Typography>
                                </Box>
                                <Avatar sx={{
                                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                                    color: theme.palette.warning.main
                                }}>
                                    <WarningIcon />
                                </Avatar>
                            </Box>
                            <ProgressBar
                                variant="determinate"
                                value={loading ? 0 : (stats.total > 0 ? (stats.aSuivre / stats.total) * 100 : 0)}
                                color="warning"
                                sx={{ mt: 2 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.07)' }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                                        À jour
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        fontWeight="bold"
                                        color="success.main"
                                    >
                                        {loading ? '...' : stats.aJour}
                                    </Typography>
                                </Box>
                                <Avatar sx={{
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    color: theme.palette.success.main
                                }}>
                                    <CheckCircleIcon />
                                </Avatar>
                            </Box>
                            <ProgressBar
                                variant="determinate"
                                value={loading ? 0 : (stats.total > 0 ? (stats.aJour / stats.total) * 100 : 0)}
                                color="success"
                                sx={{ mt: 2 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filter settings */}
            <RoundedPaper sx={{ p: 3, mb: 4 }}>
                <Box display="flex" alignItems="center" mb={1}>
                    <FilterAltIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                        Paramètres d'alerte
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography fontWeight="medium">
                                    Période d'alerte
                                </Typography>
                                <Typography
                                    sx={{
                                        px: 1.5,
                                        py: 0.5,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: theme.palette.primary.main,
                                        borderRadius: 1,
                                        fontWeight: 'bold',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {daysThreshold} jours
                                </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={2}>
                                <TimerIcon color="action" />
                                <Slider
                                    value={daysThreshold}
                                    onChange={(_, value) => setDaysThreshold(value as number)}
                                    min={5}
                                    max={90}
                                    step={5}
                                    marks
                                    sx={{
                                        mx: 1,
                                        '& .MuiSlider-thumb': {
                                            height: 18,
                                            width: 18
                                        }
                                    }}
                                />
                                <TextField
                                    value={daysThreshold}
                                    onChange={(e) => setDaysThreshold(Number(e.target.value))}
                                    type="number"
                                    variant="outlined"
                                    size="small"
                                    inputProps={{ min: 5, max: 90 }}
                                    sx={{ width: 80 }}
                                />
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography fontWeight="medium" mb={1}>
                            Filtrer par statut
                        </Typography>
                        <Tabs
                            value={tabValue}
                            onChange={(_, newValue) => setTabValue(newValue)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                bgcolor: alpha(theme.palette.background.default, 0.6),
                                borderRadius: 2,
                                '& .MuiTab-root': {
                                    minHeight: 48,
                                    textTransform: 'none',
                                    fontWeight: 500
                                }
                            }}
                        >
                            <Tab
                                label={`Tous (${stats.total})`}
                                icon={<EngineeringIcon />}
                                iconPosition="start"
                            />
                            <Tab
                                label={`En retard (${stats.enRetard})`}
                                icon={<ErrorIcon />}
                                iconPosition="start"
                                sx={{
                                    color: theme.palette.error.main,
                                    '&.Mui-selected': { color: theme.palette.error.main }
                                }}
                            />
                            <Tab
                                label={`À surveiller (${stats.aSuivre})`}
                                icon={<WarningIcon />}
                                iconPosition="start"
                                sx={{
                                    color: theme.palette.warning.main,
                                    '&.Mui-selected': { color: theme.palette.warning.main }
                                }}
                            />
                            <Tab
                                label={`À jour (${stats.aJour})`}
                                icon={<CheckIcon />}
                                iconPosition="start"
                                sx={{
                                    color: theme.palette.success.main,
                                    '&.Mui-selected': { color: theme.palette.success.main }
                                }}
                            />
                        </Tabs>
                    </Grid>
                </Grid>
            </RoundedPaper>

            {/* EPI List */}
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={10}>
                    <CircularProgress size={60} thickness={4} />
                </Box>
            ) : filteredEpis.length === 0 ? (
                <RoundedPaper
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        borderColor: theme.palette.divider
                    }}
                >
                    <CheckCircleIcon sx={{ fontSize: 60, color: theme.palette.success.main, mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Aucune alerte à afficher
                    </Typography>
                    <Typography color="text.secondary" maxWidth={600} mx="auto" mb={4}>
                        Tous les équipements sont à jour ou aucun équipement ne nécessite un contrôle
                        dans les {daysThreshold} prochains jours.
                    </Typography>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => setDaysThreshold(prev => prev + 30)}
                        sx={{ borderRadius: 2 }}
                    >
                        Étendre la période à {daysThreshold + 30} jours
                    </Button>
                </RoundedPaper>
            ) : (
                <Box>
                    <Typography variant="h6" fontWeight="medium" mb={2}>
                        {filteredEpis.length} équipement{filteredEpis.length > 1 ? 's' : ''} à contrôler
                    </Typography>

                    <Grid container spacing={3}>
                        {filteredEpis.map(epi => {
                            const daysRemaining = getDaysRemaining(epi);
                            const statusInfo = getStatusInfo(daysRemaining);

                            return (
                                <Grid item xs={12} sm={6} md={4} key={epi.id}>
                                    <Card
                                        sx={{
                                            borderRadius: 3,
                                            height: '100%',
                                            boxShadow: daysRemaining !== null && daysRemaining < 0
                                                ? `0 4px 20px ${alpha(theme.palette.error.main, 0.25)}`
                                                : '0 4px 20px rgba(0, 0, 0, 0.07)',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)'
                                            }
                                        }}
                                    >
                                        <CardHeader
                                            avatar={
                                                <Avatar
                                                    sx={{
                                                        bgcolor: alpha(statusInfo.color, 0.1),
                                                        color: statusInfo.color
                                                    }}
                                                >
                                                    {statusInfo.icon}
                                                </Avatar>
                                            }
                                            title={
                                                <Typography variant="h6" fontWeight="bold" noWrap>
                                                    {epi.identifiant_perso}
                                                </Typography>
                                            }
                                            subheader={
                                                <Typography variant="body2" color="text.secondary" noWrap>
                                                    {epi.marque} {epi.modele}
                                                </Typography>
                                            }
                                            action={
                                                <StatusChip
                                                    label={statusInfo.label}
                                                    icon={statusInfo.icon}
                                                    status={statusInfo.status}
                                                    size="small"
                                                />
                                            }
                                        />

                                        <Divider />

                                        <CardContent>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Type d'EPI
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="medium" noWrap>
                                                        {epi.type_epi?.libelle || "Type inconnu"}
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Dernier contrôle
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {formatDate(epi.dernier_controle || epi.date_mise_service)}
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Prochain contrôle
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight="medium"
                                                        color={daysRemaining !== null && daysRemaining < 0 ? "error.main" : "text.primary"}
                                                    >
                                                        {calculateNextControlDate(epi)}
                                                    </Typography>
                                                </Grid>

                                                {daysRemaining !== null && (
                                                    <Grid item xs={12}>
                                                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Progression
                                                            </Typography>
                                                            <Typography variant="caption" fontWeight="bold" color={statusInfo.color}>
                                                                {daysRemaining < 0
                                                                    ? "En retard"
                                                                    : `${daysRemaining} jours restants`
                                                                }
                                                            </Typography>
                                                        </Box>
                                                        <ProgressBar
                                                            variant="determinate"
                                                            value={statusInfo.progress}
                                                            sx={{
                                                                '& .MuiLinearProgress-bar': {
                                                                    backgroundColor: statusInfo.color
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                )}

                                                {daysRemaining !== null && daysRemaining < 0 && (
                                                    <Grid item xs={12}>
                                                        <Alert
                                                            severity="error"
                                                            icon={<ErrorIcon />}
                                                            sx={{
                                                                borderRadius: 2,
                                                                '& .MuiAlert-icon': {
                                                                    color: theme.palette.error.main,
                                                                    alignItems: 'center'
                                                                }
                                                            }}
                                                        >
                                                            Contrôle en retard de {Math.abs(daysRemaining)} jour(s)
                                                        </Alert>
                                                    </Grid>
                                                )}
                                            </Grid>

                                            <Box display="flex" gap={1} mt={3}>
                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => handleViewEpiDetails(epi.id!)}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    Détails
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    startIcon={<CheckCircleIcon />}
                                                    onClick={() => handleCreateControle(epi)}
                                                    sx={{ borderRadius: 2 }}
                                                    color={daysRemaining !== null && daysRemaining < 0 ? "error" : "primary"}
                                                >
                                                    Contrôler
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                TransitionComponent={Fade}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    sx={{
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

export default AlertesPage;