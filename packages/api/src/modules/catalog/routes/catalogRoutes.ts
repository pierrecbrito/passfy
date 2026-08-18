import { Router } from 'express';
import { CatalogController } from '../controllers/CatalogController';

const catalogRoutes = Router();

catalogRoutes.get('/search', CatalogController.search);
catalogRoutes.get('/trending', CatalogController.trending);
catalogRoutes.get('/:id', CatalogController.getById);

export { catalogRoutes };
