import { Router } from 'express';
import { CatalogController } from '../controllers/CatalogController';
import { SpotifyController } from '../controllers/SpotifyController';

const catalogRoutes = Router();

catalogRoutes.get('/spotify', SpotifyController.searchPlaylist);
catalogRoutes.get('/search', CatalogController.search);
catalogRoutes.get('/trending', CatalogController.trending);
catalogRoutes.get('/:id', CatalogController.getById);

export { catalogRoutes };
