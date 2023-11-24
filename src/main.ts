import './style.css';
import { Engine3D } from './engine';


// Usage
const canvas = document.getElementById('app') as HTMLCanvasElement;
const engine = new Engine3D(canvas);
engine.start();