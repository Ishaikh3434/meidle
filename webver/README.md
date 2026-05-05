# 🍵 Tea Guessing Game — Web Version

A fully portable, browser-based tea guessing game. No server, no installation required—just open the HTML file in any browser and play!

## Quick Start

1. Open **`index.html`** in any web browser
2. A random tea has been chosen—start guessing!
3. Enter tea names to search for them
4. After each guess, you'll see color-coded feedback:
   - **Green**: Matching words/values
   - **Red**: Non-matching words/values
5. Keep guessing until you find the exact tea!

## How It Works

### Game Files

- **`index.html`** — Main game interface. Open this file to play.
- **`game.js`** — Game logic (fuzzy matching, field comparison, etc.)
- **`data.json`** — Database of 162 tea products with 30 attributes each

### Game Logic

The game randomly selects a tea from the database and challenges you to guess it by name. When you submit a guess:

1. **Fuzzy Matching**: The system first tries an exact match, then looks for partial matches (case-insensitive). If there's exactly one partial match, it's used.
2. **Field Comparison**: Each tea attribute (type, tasting notes, brewing instructions, etc.) is compared between your guess and the random tea.
3. **Color Coding**: Words matching the random tea appear in green; non-matching words appear in red.
4. **Win Condition**: You win when your guessed tea matches all attributes of the random tea.

### Example Gameplay

```
Random Tea: "Tie Guan Yin Oolong"
Your Guess: "oolong"

Matched to: "Tie Guan Yin Oolong"

Field Comparison:
type: green("oolong")
origin: red("china")  (random has a different origin)
...

Result: Not quite! Try again.
```

## Features

- ✅ **Fully Offline** — Works without internet or server
- ✅ **Portable** — Move the `webver/` folder anywhere; game works identically
- ✅ **No Installation** — Just HTML, CSS, and JavaScript
- ✅ **Responsive Design** — Works on desktop, tablet, and mobile
- ✅ **Fuzzy Search** — Partial tea name matching for easier guessing
- ✅ **Color-Coded Feedback** — Visual comparison of guess vs. answer

## Browser Compatibility

Works on any modern browser:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Tips for Playing

1. **Start broad**: Try typing just "oolong" or "green" to find category matches
2. **Use partial names**: You don't need the exact name—"iron goddess" will find "Tie Guan Yin Oolong"
3. **Read the hints**: The color-coded feedback tells you which words match—use that to refine your next guess
4. **Check multiple fields**: Tea type, origin, tasting notes, and brewing instructions all contribute to the answer

## Data

The game includes **162 teas** from [meileaf.com](https://meileaf.com), each with **30 attributes**:
- Title, URL, tea type
- Tasting notes (nose, mouth, eyes, body descriptions)
- Origin, elevation, cultivar, season
- Brewing instructions (temperatures, steeping times, leaf amounts for gong fu & western styles)

## Portability

This game is 100% self-contained:

- **No server needed** — All logic runs in your browser
- **No Python required** — Game logic is pure JavaScript
- **No database server** — Data is bundled as JSON
- **Move freely** — Copy the `webver/` folder anywhere and play

Perfect for:
- Playing offline
- Sharing via USB drive or email
- Hosting on any static file server (GitHub Pages, Netlify, etc.)
- Playing on different machines without setup

## Troubleshooting

### "Failed to load game data"
- Make sure `data.json` is in the same folder as `index.html`
- Check your browser's console (F12) for error messages

### Game won't respond to guesses
- Try refreshing the page (Ctrl+F5)
- Check that JavaScript is enabled in your browser

### Styling looks broken
- Refresh the page (Ctrl+F5)
- Try a different browser

## License & Credits

Game built with game logic adapted from the Python CLI version and tea data from meileaf.com.

---

**Enjoy! 🍵**
