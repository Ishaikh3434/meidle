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


### Game won't respond to guesses
- Try refreshing the page (Ctrl+F5)
- Check that JavaScript is enabled in your browser

### Styling looks broken
- Refresh the page (Ctrl+F5)
- Try a different browser

## License & Credits

Tea data from meileaf.com.
Code by ishaikh3434
---

**Enjoy! 🍵**
