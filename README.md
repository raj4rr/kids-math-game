# 🌟 Super Math Kids - Math Adventure Game

A fun, interactive, and colorful math learning game for kids to practice **Addition (+), Subtraction (−), Multiplication (×), and Division (÷)** with **1, 2, 3, 4, and 5-digit numbers** right in their browser!

---

## 🚀 How to Run the Game

No installations or build tools required! Simply:

1. Double-click [index.html](file:///Users/rajesh/Desktop/games/kids-math-game/index.html) in your file manager to open it in Chrome, Safari, Edge, or Firefox.
2. Or serve it locally using any browser or HTTP server:
   ```bash
   python3 -m http.server 3000
   ```
   and navigate to `http://localhost:3000`.

---

## 🎮 Key Features

1. **Four Core Math Operations + Mixed Mode ⚡**:
   - ➕ **Addition (`+`)**: Practice adding two numbers with column carry-over helpers.
   - ➖ **Subtraction (`−`)**: Friendly subtraction ensuring positive answers with column borrowing helpers.
   - ✖️ **Multiplication (`×`)**: Practice times tables (1-digit) and multi-digit multiplication with partial product breakdowns.
   - ➗ **Division (`÷`)**: 100% clean, exact integer division (no remainder) with inverse multiplication validation.
   - 🎲 **Mixed Mode**: Surprise rounds alternating between +, −, ×, and ÷!

2. **Customizable Digit Difficulty (1, 2, 3, 4, 5 Digits)**:
   - **1-Digit**: Single digit numbers (1 to 9) for beginner practice.
   - **2-Digits**: Random numbers from 10 to 99.
   - **3-Digits**: Random numbers from 100 to 999.
   - **4-Digits**: Random numbers from 1,000 to 9,999.
   - **5-Digits**: Random numbers from 10,000 to 99,999.
   - **Mixed Mode**: Surprise random difficulty!

3. **Day & Date-Wise Results & Daily Progress Report 📅**:
   - Organizes all practice history **by date and day** (e.g. *Today • Tuesday, Oct 20, 2026*, *Yesterday*, etc.).
   - Expandable / collapsible day cards showing daily performance summary:
     - 🎯 Total problems solved that day
     - ✅ Accuracy percentage and correct ratio (e.g., `14/15 (93%)`)
     - ⭐ Total stars earned on that date
   - Detailed per-question logs: timestamp, operation badge, problem equation, user answer, and pass/miss result.
   - Interactive filters: filter by **Day/Date**, **Status (Correct vs Missed)**, or **Operation (+, −, ×, ÷)**.

4. **Dual Arithmetic Layouts**:
   - **Vertical Column View**: Traditional column addition where ones, tens, hundreds, thousands, and ten-thousands align right. Includes optional **Carry-Over Helper Boxes** above each column to guide kids learning regrouping.
   - **Horizontal View**: Simple linear format (`45 + 27 = ?`).

5. **Interactive Controls & Accessibility**:
   - **Touch & Tablet Friendly**: Bubbly on-screen interactive numpad (0-9, Backspace, Clear).
   - **Physical Keyboard Support**: Use number keys 0-9, `Backspace`, and `Enter` to submit/advance.
   - **Web Audio API**: Built-in cheerful chimes, victory fanfare, and click pops without any external audio files. Includes sound mute toggle.
   - **Confetti Explosion**: Custom lightweight canvas particle system when solving correctly.

6. **Step-by-Step Solution Assistant**:
   - If a kid is unsure or gets an answer wrong, clicking "See Solution" opens a kid-friendly visual breakdown explaining column-by-column addition and carries.

7. **Themes**:
   - ☀️ **Sunny Day** (Fresh sky blue & warm sunshine)
   - 🍬 **Candy Pastel** (Playful pinks, mint, and purples)
   - 🚀 **Cosmic Night** (Deep space indigo with glowing stars)

8. **1-Year Cookie Storage & Persistence 🍪**:
   - All game progress, stars earned, win streaks, correct answer counts, total solved rounds, and practice history are saved directly into **cookies with a 1-year expiration (`max-age=31,536,000` seconds)**.
   - Automatically synchronizes with browser cookies and `localStorage` so kids can close their browser or computer and return anytime within a year without losing their achievements!
   - Reset button allows clearing cookies and starting fresh whenever desired.

---

## 📁 File Structure

- [index.html](file:///Users/rajesh/Desktop/games/kids-math-game/index.html) - Accessible HTML5 semantic structure.
- [style.css](file:///Users/rajesh/Desktop/games/kids-math-game/style.css) - Modern responsive design system, animations, themes, and layouts.
- [script.js](file:///Users/rajesh/Desktop/games/kids-math-game/script.js) - Number generation, validation, audio synth, confetti engine, and score state.
