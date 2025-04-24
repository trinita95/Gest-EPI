// app.ts 
import express from 'express';
import cors from 'cors';
import typeEpiRoutes from './controllers/PpeTypeController';
import gestionnaireRoutes from './controllers/ManagerController';
import epiRoutes from './controllers/PpeController';
import controleRoutes from './controllers/ControlController';
import statutControleRoutes from './controllers/ControlStatusController';

const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
};

const app = express();
app.use(cors(options));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/type-epi', typeEpiRoutes);
app.use('/api/gestionnaires', gestionnaireRoutes);
app.use('/api/epi', epiRoutes);
app.use('/api/controles', controleRoutes);
app.use('/api/statut-controles', statutControleRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    message: "Une erreur est survenue sur le serveur",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;