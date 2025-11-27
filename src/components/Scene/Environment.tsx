import { Grid } from '@react-three/drei';

export function Environment() {
  return (
    <>
      {/* Grid floor */}
      <Grid
        position={[0, 0, 0]}
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#224466"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#112233"
        fadeDistance={15}
        fadeStrength={1}
        infiniteGrid
      />
    </>
  );
}
