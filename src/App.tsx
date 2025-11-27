import { Canvas3D } from './components/Canvas3D';
import { ControlPanel } from './components/UI';

function App() {
  return (
    <div className="flex h-screen w-screen bg-scanner-bg overflow-hidden">
      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas3D />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-scanner-bg/50 via-transparent to-transparent" />
      </div>

      {/* Control Panel */}
      <ControlPanel />
    </div>
  );
}

export default App;
