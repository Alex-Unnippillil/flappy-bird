# flappy-bird
A basic version of flappy bird.

https://alex-unnippillil.github.io/flappy-bird/

 ![image](https://github.com/Alex-Unnippillil/flappy-bird/assets/24538548/fd714539-124e-4703-87a2-c4d82f7dcd59)


to do:
-fix tunnels so that it is always possible for the bird to flap through
-add animations for the bird
-add models of birds and walls
-add a repeating background
-add powerups, speed boost, invincibility, etc

## Theme configuration

The game renderer can operate in either a classic **2D** mode or a stylised **3D** mode. The active theme is controlled via [`src/config.ts`](./src/config.ts). Update the exported `theme` constant to switch renderers while developing or testing:

```ts
// src/config.ts
export const theme: Theme = '3d';
```

After saving the file, restart the dev server (or reload the page) to see the alternate renderer in action. The 2D theme retains the original sprite-based look, while the 3D theme draws gradient-lit pipes and an orb-like bird without altering gameplay or controls.
