export function Lighting() {
  return (
    <>
      {/* Ambient light */}
      <ambientLight color={0x4466aa} intensity={0.5} />

      {/* Hemisphere light (sky/ground) */}
      <hemisphereLight
        color={0x00ffff}
        groundColor={0xff00ff}
        intensity={0.3}
      />

      {/* Main directional light */}
      <directionalLight
        color={0xffffff}
        intensity={1}
        position={[5, 10, 5]}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Accent point lights */}
      <pointLight
        color={0x00ffff}
        intensity={1}
        distance={10}
        position={[2, 2, 2]}
      />
      <pointLight
        color={0xff00ff}
        intensity={0.5}
        distance={10}
        position={[-2, 0, 2]}
      />
    </>
  );
}
