/*
 * Plantagenet Tutorial Module (`tutorial.js`)
 * This module runs as a "scenario" of the main Plantagenet game.
 * It uses a simple step-by-step script to guide the user
 * and delegates all rendering to the client.
 */
"use strict";

// Import the game's static data (names of locales, lords, etc.)
// This allows us to use game data without duplicating it.
const data = require("./data.js");

// From data.js, find the ID for the "London" locale.
// We'll use this to make the "London" locale clickable.
const LOC_LONDON = data.locales.findIndex(x => x.name === "London"); // ID is 30

// === TUTORIAL SCRIPT ===
// Each key is a unique step ID.
// The value is an object describing what to show and do.
const tutorial_script = {
    'STEP_1_WELCOME': {
        // 'text': The message displayed to the user.
        text: "Welcome to Plantagenet! This is an interactive tutorial. We will guide you through the core concepts of the game. 'Plantagenet' is a wargame about the Wars of the Roses... Click 'Done' to continue.",
        // 'actions': Defines the user's possible interactions.
        // 'Done': 'STEP_2_GOAL' means: show a 'done' button, and if clicked, go to 'STEP_2_GOAL'.
        actions: { 'done': 'STEP_2_GOAL' }
    },
    'STEP_2_GOAL': {
        text: "Your goal is to win by having the most **Influence** at the end of the game. Players take one of two sides: **Yorkist (white)** or **Lancastrian (red)**. We'll cover Influence later. First, let's look at the game board.",
        actions: { 'done': 'STEP_3_MAP_INTRO' },
        // 'highlight_regions': Tells the client UI to highlight a generic area.
        highlight_regions: ['map']
    },
    'STEP_3_MAP_INTRO': {
        text: "The map shows England and its environs. The primary spaces are called **Locales**. These include **Strongholds** (Cities, Towns, Fortresses) and special **Exile** boxes. Click on the 'London' Locale to continue.",
        // 'actions': Here, the key 'locale' tells the client that locales are clickable.
        // The value '[LOC_LONDON]' is an array of *which* locales are allowed.
        actions: { 'locale': [LOC_LONDON] },
        // 'highlight_locales': Tells the client to visually highlight London.
        highlight_locales: [LOC_LONDON],
        // 'next_step': When the correct locale is clicked, advance to this step.
        next_step: 'STEP_4_MAP_WAYS'
    },
    // This is the placeholder for our next step.
    'STEP_4_MAP_WAYS': {
        text: "This is the next step (to be implemented).",
        actions: {}
    }
};

// === MODULE EXPORTS ===
// These three functions (setup, view, action) are the public API
// required by the RTT server. `rules.js` will call these.

/**
 * setup: Called by `rules.js` when the "Tutorial" scenario is selected.
 * Creates the initial tutorial state object.
 */
exports.setup = function (seed, scenario, options) {
    // The 'game' object holds the session state.
    let game = {
        seed: seed,
        scenario: scenario,
        hidden: options.hidden ? 1 : 0,
        log: [],
        undo: [],
        active: "Tutorial", // The tutorial is the only "player".
        state: "tutorial_step", // A simple state machine.

        // === CRITICAL FLAG ===
        // This flag tells rules.js to delegate all 'view' and 'action' calls to this file.
        is_tutorial: true, 
        
        // This is our tutorial-specific state.
        tutorial_step: "STEP_1_WELCOME", // Start at the first step
        
        // We must initialize a minimal 'game' object, as the client (`play.js`)
        // will try to read these properties to render the board.
        influence: 0,
        turn: 1 << 1, // Set to Turn 1, Levy Phase, so the Calendar displays correctly.
        pieces: {
            locale: [], assets: [], forces: [], routed: [], capabilities: [],
            moved: [], vassals: Array(data.vassals.length).fill(31), // VASSAL_OUT_OF_PLAY
            depleted: [], exhausted: [], favourl: [], favoury: [],
        },
    };
    log_h1(game, "Plantagenet Tutorial"); // Add a welcome message to the log.
    return game;
};

/**
 * view: Called by `rules.js` (which is called by the server)
 * Translates the current `game` state into a 'view' object for the client.
 */
exports.view = function (game, player) {
    // 1. Get the current step object from our script.
    let current_step = tutorial_script[game.tutorial_step];

    // 2. Build the view object.
    let view = {
        // Standard properties the client expects
        log: game.log,
        reveal: -1, // -1 means reveal everything (it's a tutorial)
        scenario: game.scenario,
        turn: game.turn,
        influence: game.influence,
        events: [],
        pieces: game.pieces,
        
        // Tutorial-specific properties
        prompt: current_step.text, // The text to display
        actions: {},                // The actions to enable
        
        // UI hints for the client
        highlight_locales: current_step.highlight_locales || [],
        highlight_regions: current_step.highlight_regions || [],
    };

    // 3. Populate the actions for the client.
    // This turns `{ 'done': 'STEP_2_GOAL' }` into `{ 'done': 1 }`
    // or `{ 'locale': [30] }` into `{ 'locale': [30] }`
    for (const actionName in current_step.actions) {
        let actionValue = current_step.actions[actionName];
        
        // Check if the value is an array (e.g., 'locale': [30])
        if (Array.isArray(actionValue)) {
            // If it's an array, pass it. The client needs it for targeting.
            view.actions[actionName] = actionValue;
        } else {
            // Otherwise (e.g., 'done': 'STEP_2_GOAL'), just send '1'.
            // This tells the client "Show the button named 'actionName'".
            view.actions[actionName] = 1; 
        }
    }
    
    // Always add a "Back to Menu" button.
    view.actions.leave = 1; 

    return view;
};

/**
 * action: Called by `rules.js` (which is called by the server)
 * Handles user input and updates the game state.
 */
exports.action = function (game, player, action, arg) {
    // 1. Get the current step.
    let current_step = tutorial_script[game.tutorial_step];

    // 2. Handle the "done" action.
    // *** FIX IS HERE ***
    if (action === "done" && current_step.actions.done) {
        // Advance the tutorial step.
        // *** AND FIX IS HERE ***
        game.tutorial_step = current_step.actions.done;
        game.undo = []; // Clear undo stack on step change.
    } 
    // 3. Handle the "locale" action (clicking on the map).
    else if (action === "locale" && current_step.actions.locale) {
        // `arg` is the ID of the locale that was clicked.
        // Check if the clicked locale ID is in our list of allowed targets.
        if (current_step.actions.locale.includes(arg)) {
            // It is! Advance to the next step.
            game.tutorial_step = current_step.next_step;
            game.undo = [];
        } else {
            // User clicked on a non-target locale. Do nothing.
        }
    }
    // 4. Handle the "leave" action.
    else if (action === "leave") {
        // No-op. The server handles this action by exiting the game.
    } 
    // 5. Handle any other unexpected action.
    else {
        throw new Error(`Invalid tutorial action: ${action} with arg ${arg}`);
    }
    
    // Return the updated game state.
    return game;
};

// === Utility Functions ===
// These are just simple helpers for this file.

function log(game, msg) { 
    game.log.push(msg); 
}

function log_h1(game, msg) {
    log(game, "");
    log(game, ".h1 " + msg);
    log(game, "");
}