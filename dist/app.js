import {createGameView} from './views/game-view.js';
import {createAppController} from './controllers/app-controller.js';

createAppController(createGameView()).start();
