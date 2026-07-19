# PhantomGamez - Adding Godot Games

## How to Add a Godot HTML5 Game

### 1. Export from Godot
- In Godot, go to Project → Export
- Create a new HTML5 export preset
- Export your game as HTML5

### 2. Prepare the Game Files
- Extract the .zip export file
- Create a new folder under `games/` with your game name
- Example: `games/my-awesome-game/`

### 3. Copy Game Files
- Copy all files from the Godot export into your game folder
- The main file should be `index.html`

### 4. Add to Shop
Edit [shop.js](shop.js) and add your game:

```js
const shopItems = [
  {
    id: "my-awesome-game",
    name: "My Awesome Game",
    description: "A fun Godot game",
    price: "Free",
    image: "favicon.png",
    link: "games/my-awesome-game/index.html",
    downloadUrl: "games/my-awesome-game.zip"
  }
];
```

### 5. Pricing
- `price: "Free"` - Players can play immediately
- `price: "$1.99"` - Players must purchase before playing
- Any price format works!

### 6. Playing Games
- Click "Play" button to launch the game in-browser
- Games run full-screen with a back button
- Players can download the ZIP for offline play

## File Structure Example

```
games/
├── my-awesome-game/
│   ├── index.html
│   ├── game.wasm
│   ├── game.js
│   └── ... (other Godot files)
└── my-awesome-game.zip
```

## Notes
- Games run in an iframe on your site
- Full-screen support works on mobile
- Players must be signed in to access paid games
- Games can be played directly or downloaded
