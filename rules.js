"use strict"

const data = require("./data.js")

const BOTH = "Both"
const LANCASTER = "Lancaster"
const YORK = "York"

var P1 = LANCASTER
var P2 = YORK

const HIT = [ "0", '\u2776', '\u2777', '\u2778', '\u2779', '\u277A', '\u277B' ]
const MISS = [ "0", '\u2460', '\u2461', '\u2462', '\u2463', '\u2464', '\u2465' ]

function frac(x) {
	if (x === 1)
		return "\xbd"
	if (x & 1)
		return (x >> 1) + "\xbd"
	return x >> 1
}

function range(x) {
	switch (x) {
	case 1: return "1"
	case 2: return "1-2"
	case 3: return "1-3"
	case 4: return "1-4"
	case 5: return "1-5"
	case 6: return "1-6"
	}
}

let game = null
let view = null
let states = {}

exports.roles = [ LANCASTER, YORK ]

exports.scenarios = [
	"Ia. Henry VI",
	"Ib. Towton",
	"Ic. Somerset's Return",
	"II. Warwicks' Rebellion",
	"III. My Kingdom for a Horse",
	"I-III. Wars of the Roses",
]

const scenario_first_turn = {
	"Ia. Henry VI": 1,
	"Ib. Towton": 1,
	"Ic. Somerset's Return": 5,
	"II. Warwicks' Rebellion": 1,
	"III. My Kingdom for a Horse": 9,
	"I-III. Wars of the Roses": 1,
}


const scenario_last_turn = {
	"Ia. Henry VI": 15,
	"Ib. Towton": 2,
	"Ic. Somerset's Return": 8,
	"II. Warwicks' Rebellion": 15,
	"III. My Kingdom for a Horse": 15,
	"I-III. Wars of the Roses": 15,
}

function should_remove_Y28_event_card() {
	return game.scenario !== "I-III. Wars of the Roses"
}


// unit types
const RETINUE = 0
const VASSAL = 1
const MEN_AT_ARMS = 2
const LONGBOWMEN = 3
const MILITIA = 4
const BURGUNDIANS = 5
const MERCENARIES = 6

const FORCE_TYPE_NAME = [ "Retinue", "Vassal", "Men-at-Arms", "Longbowmen", "Militia", "Burgundians", "Mercenary" ]
const FORCE_PROTECTION = [ 4, 4, 3, 1, 1, 3, 3 ]
const FORCE_EVADE = [ 0, 0, 0, 0, 0, 0, 0 ]

// asset types
const PROV = 0
const COIN = 1
const CART = 2
const SHIP = 3

const ASSET_TYPE_NAME = [ "Provender", "Coin", "Cart", "Ship" ]


// battle array
const A1 = 0 // attackers
const A2 = 1
const A3 = 2
const D1 = 3 // defenders
const D2 = 4
const D3 = 5


const ARRAY_FLANKS = [
	[ A2, A3 ], [ A1, A3 ], [ A1, A2 ],
	[ D2, D3 ], [ D1, D3 ], [ D1, D2 ],
]


function find_card(name) {
	let ix = data.cards.findIndex((x) => x.name === name)
	if (ix < 0)
		throw "CANNOT FIND LORD: " + name
	return ix
}
function find_lord(name) {
	let ix = data.lords.findIndex((x) => x.name === name)
	if (ix < 0)
		throw "CANNOT FIND LORD: " + name
	return ix
}
function find_locale(name) {
	let ix = data.locales.findIndex((x) => x.name === name)
	if (ix < 0)
		throw "CANNOT FIND LORD: " + name
	return ix
}

const lord_name = data.lords.map((lord) => lord.name)

const lord_count = data.lords.length
const vassal_count = data.vassals.length

const first_lord = 0
const last_lord = lord_count - 1

const first_york_locale = 0
const last_york_locale = 73
const first_lancaster_locale = 0
const last_lancaster_locale = 73
const first_locale = 0
const last_locale = data.locales.length - 1



const first_york_card = 0
const last_york_card = 36
const first_lancaster_card = 37
const last_lancaster_card = 73



const Y1 = find_card("Y1")
const Y2 = find_card("Y2")
const Y3 = find_card("Y3")
const Y4 = find_card("Y4")
const Y5 = find_card("Y5")
const Y6 = find_card("Y6")
const Y7 = find_card("Y7")
const Y8 = find_card("Y8")
const Y9 = find_card("Y9")
const Y10 = find_card("Y10")
const Y11 = find_card("Y11")
const Y12 = find_card("Y12")
const Y13 = find_card("Y13")
const Y14 = find_card("Y14")
const Y15 = find_card("Y15")
const Y16 = find_card("Y16")
const Y17 = find_card("Y17")
const Y18 = find_card("Y18")
const Y19 = find_card("Y19")
const Y20 = find_card("Y20")
const Y21 = find_card("Y21")
const Y22 = find_card("Y22")
const Y23 = find_card("Y23")
const Y24 = find_card("Y24")
const Y25 = find_card("Y25")
const Y26 = find_card("Y26")
const Y27 = find_card("Y27")
const Y28 = find_card("Y28")
const Y29 = find_card("Y29")
const Y30 = find_card("Y30")
const Y31 = find_card("Y31")
const Y32 = find_card("Y32")
const Y33 = find_card("Y33")
const Y34 = find_card("Y34")
const Y35 = find_card("Y35")
const Y36 = find_card("Y36")
const Y37 = find_card("Y37")

const L1 = find_card("L1")
const L2 = find_card("L2")
const L3 = find_card("L3")
const L4 = find_card("L4")
const L5 = find_card("L5")
const L6 = find_card("L6")
const L7 = find_card("L7")
const L8 = find_card("L8")
const L9 = find_card("L9")
const L10 = find_card("L10")
const L11 = find_card("L11")
const L12 = find_card("L12")
const L13 = find_card("L13")
const L14 = find_card("L14")
const L15 = find_card("L15")
const L16 = find_card("L16")
const L17 = find_card("L17")
const L18 = find_card("L18")
const L19 = find_card("L19")
const L20 = find_card("L20")
const L21 = find_card("L21")
const L22 = find_card("L22")
const L23 = find_card("L23")
const L24 = find_card("L24")
const L25 = find_card("L25")
const L26 = find_card("L26")
const L27 = find_card("L27")
const L28 = find_card("L28")
const L29 = find_card("L29")
const L30 = find_card("L30")
const L31 = find_card("L31")
const L32 = find_card("L32")
const L33 = find_card("L33")
const L34 = find_card("L34")
const L35 = find_card("L35")
const L36 = find_card("L36")
const L37 = find_card("L37")



//const GARRISON = 100

const LORD_YORK = find_lord("York")
const LORD_MARCH = find_lord("March")
const LORD_EDWARD_IV = find_lord("Edward IV")
const LORD_SALISBURY = find_lord("Salisbury")
const LORD_RUTLAND = find_lord("Rutland")
const LORD_PEMBROKE = find_lord("Pembroke")
const LORD_DEVON = find_lord("Devon")
const LORD_NORTHUMBERLAND_Y1 = find_lord("Northumberland Y1")
const LORD_NORTHUMBERLAND_Y2 = find_lord("Northumberland Y2")

const LORD_GLOUCESTER_1 = find_lord("Gloucester 1")
const LORD_GLOUCESTER_2 = find_lord("Gloucester 2")
const LORD_RICHARD_III = find_lord("Richard III")
const LORD_NORFOLK = find_lord("Norfolk")
const LORD_WARWICK_Y = find_lord("Warwick Y")

const LORD_HENRY_VI = find_lord("Henry VI")
const LORD_MARGARET = find_lord("Margaret")
const LORD_SOMERSET_1 = find_lord("Somerset 1")
const LORD_SOMERSET_2 = find_lord("Somerset 2")

const LORD_EXETER_1 = find_lord("Exeter 1")
const LORD_EXETER_2 = find_lord("Exeter 2")

const LORD_BUCKINGHAM = find_lord("Buckingham")
const LORD_CLARENCE = find_lord("Clarence")
const LORD_NORTHUMBERLAND_L = find_lord("Northumberland L")

const LORD_JASPER_TUDOR_1 = find_lord("Jasper Tudor 1")
const LORD_JASPER_TUDOR_2 = find_lord("Jasper Tudor 2")

const LORD_HENRY_TUDOR = find_lord("Henry Tudor")
const LORD_OXFORD = find_lord("Oxford")
const LORD_WARWICK_L = find_lord("Warwick L")



const LOC_BAMBURGH = find_locale("Bamburgh")
const LOC_NEWCASTLE = find_locale("Newcastle")
const LOC_APPLEBY = find_locale("Appleby")
const LOC_HEXHAM = find_locale("Hexham")
const LOC_CARLISLE = find_locale("Carlisle")
const LOC_HARLECH = find_locale("Harlech")
const LOC_PEMBROKE = find_locale("Pembroke")
const LOC_CARDIFF = find_locale("Cardiff")
const LOC_HEREFORD = find_locale("Hereford")
const LOC_LUDLOW = find_locale("Ludlow")
const LOC_SHREWSBURY = find_locale("Shrewsbury")
const LOC_SALISBURY = find_locale("Salisbury")
const LOC_WINCHESTER = find_locale("Winchester")
const LOC_GUILDFORD = find_locale("Guildford")
const LOC_ARUNDEL = find_locale("Arundel")
const LOC_SOUTHAMPTON = find_locale("Southampton")
const LOC_ROCHESTER = find_locale("Rochester")
const LOC_DOVER = find_locale("Dover")
const LOC_CANTERBURY = find_locale("Canterbury")
const LOC_HASTINGS = find_locale("Hastings")
const LOC_DORCHESTER = find_locale("Dorchester")
const LOC_EXETER = find_locale("Exeter")
const LOC_PLYMOUTH = find_locale("Plymouth")
const LOC_LAUNCESTON = find_locale("Launceston")
const LOC_TRURO = find_locale("Truro")
const LOC_WELLS = find_locale("Wells")
const LOC_BRISTOL = find_locale("Bristol")
const LOC_GLOUCESTER = find_locale("Gloucester")
const LOC_OXFORD = find_locale("Oxford")
const LOC_NEwBURY = find_locale("Newbury")
const LOC_LONDON = find_locale("London")
const LOC_ST_ALBANS = find_locale("St Albans")
const LOC_BEDFORD = find_locale("Bedford")
const LOC_CAMBRIDGE = find_locale("Cambridge")
const LOC_BURY_ST_EDMUNDS = find_locale("Bury St Edmunds")
const LOC_IPSWICH = find_locale("Ipswich")
const LOC_NORWICH = find_locale("Norwich")
const LOC_LYNN = find_locale("Lynn")
const LOC_ELY = find_locale("Ely")
const LOC_PETERBOROUGH = find_locale("Peterborough")
const LOC_NORTHAMPTON = find_locale("Northampton")
const LOC_COVENTRY = find_locale("Coventry")
const LOC_LEICESTER = find_locale("Leicester")
const LOC_LICHFIELD = find_locale("Lichfield")
const LOC_DERBY = find_locale("Derby")
const LOC_NOTTINGHAM = find_locale("Nottingham")
const LOC_WORCESTER = find_locale("Worcester")
const LOC_CHESTER = find_locale("Chester")
const LOC_LANCASTER = find_locale("Lancaster")
const LOC_LINCOLN = find_locale("Lincoln")
const LOC_YORK = find_locale("York")
const LOC_CALAIS = find_locale("Calais")
const LOC_FRANCE = find_locale("France")
const LOC_SCOTLAND = find_locale("Scotland")
const LOC_IRELAND = find_locale("Ireland")
const LOC_BURGUNDY = find_locale("Burgundy")
const LOC_ENGLISH_CHANNEL = find_locale("English Channel")
const LOC_IRISH_SEA = find_locale("Irish Sea")
const LOC_NORTH_SEA = find_locale("North Sea")
const LOC_SCARBOROUGH = find_locale("Scarborough")
const LOC_RAVENSPUR = find_locale("Ravenspur")



// === === === === FROM NEVSKY === === === ===

// TODO: log end victory conditions at scenario start

// WONTFIX: choose crossbow/normal hit application order

// Check all push/clear_undo

const VASSAL_UNAVAILABLE = 0
const VASSAL_READY = 1
const VASSAL_MUSTERED = 2

const NOBODY = -1
const NOWHERE = -1
const NOTHING = -1
const NEVER = -1
const CALENDAR = 100
const TRACK = 100


const SUMMER = 0
const SPRING = 1
const WINTER = 2
const AUTUMN = 3

const SEASONS = [
	null,
	WINTER,
	SPRING,
	SUMMER,
	AUTUMN,
	WINTER,
	WINTER,
	SPRING,
	SUMMER,
	AUTUMN,
	WINTER,
	WINTER,
	SPRING,
	SUMMER,
	AUTUMN,
	WINTER,
	null
]
const TURN_NAME = [
	null,
	"1 - January/February/March",
	"2 - April/May",
	"3 - June/July",
	"4 - August/September/October",
	"5 - November/December",
	"6 - January/February/March",
	"7 - April/May",
	"8 - June/July",
	"9 - August/September/October",
	"10 - November/December",
	"11 - January/February/March",
	"12 - April/May",
	"13 - June/July",
	"14 - August/September/October",
	"15 - November/December",
	null,
]

function current_turn() {
	return game.turn >> 1
}
function current_season() {
	return SEASONS[game.turn >> 1]
}

function current_turn_name() {
	return String(game.turn >> 1)
}

function current_hand() {
	// LIKELY BUG, CHECK goto_command_activation()
	if (game.active === P1)
		return game.hand1
	return game.hand2
}

function is_summer() {
	return current_season() === SUMMER
}
function is_winter() {
	return current_season() === WINTER
}
function is_spring() {
	return current_season() === SPRING
}
function is_autumn() {
	return current_season() === AUTUMN
}

function is_campaign_phase() {
	return (game.turn & 1) === 1
}

function is_levy_phase() {
	return (game.turn & 1) === 0
}

// === GAME STATE ===

const first_york_lord = 0
const last_york_lord = 13
const first_lancaster_lord = 14
const last_lancaster_lord = 27



let first_friendly_lord = 0
let last_friendly_lord = 13
let first_enemy_lord = 14
let last_enemy_lord = 27

function update_aliases() {
	if (game.active === YORK) {
		first_friendly_lord = 0
		last_friendly_lord = 13
		first_enemy_lord = 14
		last_enemy_lord = 27
	} else if (game.active === LANCASTER) {
		first_friendly_lord = 14
		last_friendly_lord = 27
		first_enemy_lord = 0
		last_enemy_lord = 13
	} else {
		first_friendly_lord = -1
		last_friendly_lord = -1
		first_enemy_lord = -1
		last_enemy_lord = -1
	}
}

function load_state(state) {
	if (game !== state) {
		game = state
		update_aliases()
	}
}

function push_state(next) {
	if (!states[next])
		throw Error("No such state: " + next)
	game.stack.push([ game.state, game.who, game.count ])
	game.state = next
}

function pop_state() {
	;[ game.state, game.who, game.count ] = game.stack.pop()
}

function set_active(new_active) {
	if (game.active !== new_active) {
		game.active = new_active
		update_aliases()
	}
}

function set_active_enemy() {
	game.active = enemy_player()
	update_aliases()
}

function enemy_player() {
	if (game.active === P1)
		return P2
	if (game.active === P2)
		return P1
	return null
}

function has_any_spoils() {
	return (
		game.spoils &&
		game.spoils[PROV] +
			game.spoils[COIN] +
			game.spoils[CART] +
			game.spoils[SHIP] >
			0
	)
}

function get_spoils(type) {
	if (game.spoils)
		return game.spoils[type]
	return 0
}

function add_spoils(type, n) {
	if (!game.spoils)
		game.spoils = [ 0, 0, 0, 0, 0, 0, 0 ]
	game.spoils[type] += n
}

function set_item_on_track(item, value) {
	if (track_value > 45) track_value = 45
	set_lord_locale(item, TRACK + track_value)
}

function get_lord_calendar(lord) {
	if (is_lord_on_calendar(lord))
		return get_lord_locale(lord) - CALENDAR
	/*else
		return get_lord_service(lord)*/
}

function set_lord_cylinder_on_calendar(lord, turn) {
	if (turn < 1) turn = 1
	if (turn > 16) turn = 16
	set_lord_locale(lord, CALENDAR + turn)
}

function set_lord_calendar(lord, turn) {
	if (is_lord_on_calendar(lord))
		set_lord_cylinder_on_calendar(lord, turn)
	else
		set_lord_service(lord, turn)
}

function get_lord_locale(lord) {
	return game.pieces.locale[lord]
}

/*function get_lord_service(lord) {
	return game.pieces.service[lord]
}*/

function get_lord_capability(lord, n) {
	return game.pieces.capabilities[(lord << 1) + n]
}

function set_lord_capability(lord, n, x) {
	game.pieces.capabilities[(lord << 1) + n] = x
}

function get_lord_assets(lord, n) {
	return pack4_get(game.pieces.assets[lord], n)
}

function get_lord_forces(lord, n) {
	return pack4_get(game.pieces.forces[lord], n)
}

function get_lord_routed_forces(lord, n) {
	return pack4_get(game.pieces.routed[lord], n)
}

function lord_has_unrouted_units(lord) {
	return game.pieces.forces[lord] !== 0
}

function lord_has_routed_units(lord) {
	return game.pieces.routed[lord] !== 0
}

function set_lord_locale(lord, locale) {
	game.pieces.locale[lord] = locale
}


function shift_lord_cylinder(lord, dir) {
	set_lord_calendar(lord, get_lord_calendar(lord) + dir)
}

/*function set_lord_service(lord, service) {
	if (service < 0)
		service = 0
	if (service > 17)
		service = 17
	game.pieces.service[lord] = service
}*/

/*function add_lord_service(lord, n) {
	set_lord_service(lord, get_lord_service(lord) + n)
}*/

function set_lord_assets(lord, n, x) {
	if (x < 0)
		x = 0
	if (x > 40)
		x = 40
	game.pieces.assets[lord] = pack4_set(game.pieces.assets[lord], n, x)
}

function add_lord_assets(lord, n, x) {
	set_lord_assets(lord, n, get_lord_assets(lord, n) + x)
}

function set_lord_forces(lord, n, x) {
	if (x < 0)
		x = 0
	if (x > 15)
		x = 15
	game.pieces.forces[lord] = pack4_set(game.pieces.forces[lord], n, x)
}

function add_lord_forces(lord, n, x) {
	set_lord_forces(lord, n, get_lord_forces(lord, n) + x)
}

function set_lord_routed_forces(lord, n, x) {
	if (x < 0)
		x = 0
	if (x > 15)
		x = 15
	game.pieces.routed[lord] = pack4_set(game.pieces.routed[lord], n, x)
}

function add_lord_routed_forces(lord, n, x) {
	set_lord_routed_forces(lord, n, get_lord_routed_forces(lord, n) + x)
}

function clear_lords_moved() {
	game.pieces.moved = 0
}

function get_lord_moved(lord) {
	return pack2_get(game.pieces.moved, lord)
}

function set_lord_moved(lord, x) {
	game.pieces.moved = pack2_set(game.pieces.moved, lord, x)
}

function set_lord_fought(lord) {
	set_lord_moved(lord, 1)
	game.battle.fought = pack1_set(game.battle.fought, lord, 1)
}

function get_lord_fought(lord) {
	return pack1_get(game.battle.fought, lord)
}

function set_lord_unfed(lord, n) {
	// reuse "moved" flag for hunger
	set_lord_moved(lord, n)
}

function is_lord_unfed(lord) {
	// reuse "moved" flag for hunger
	return get_lord_moved(lord)
}

function feed_lord_skip(lord) {
	// reuse "moved" flag for hunger
	set_lord_moved(lord, 0)
}

function feed_lord(lord) {
	// reuse "moved" flag for hunger
	let n = get_lord_moved(lord) - 1
	set_lord_moved(lord, n)
	if (n === 0)
		log(`Fed L${lord}.`)
}

function pay_lord(lord) {
	// reuse "moved" flag for hunger
	let n = get_lord_moved(lord) - 1
	set_lord_moved(lord, n)
	if (n === 0)
		log(`Pay L${lord}.`)
}

function get_lord_array_position(lord) {
	for (let p = 0; p < 12; ++p)
		if (game.battle.array[p] === lord)
			return p
	return -1
}


// === GAME STATE HELPERS ===

function roll_die() {
	return random(6) + 1
}

function get_shared_assets(loc, what) {
	let n = 0
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (get_lord_locale(lord) === loc)
			n += get_lord_assets(lord, what)
	return n
}

function count_lord_all_forces(lord) {
	return (
		get_lord_forces(lord, BURGUNDIANS) +
		get_lord_forces(lord, MERCENARIES) +
		get_lord_forces(lord, MEN_AT_ARMS) +
		get_lord_forces(lord, MILITIA) +
		get_lord_forces(lord, LONGBOWMEN)
	)
}

function count_lord_ships(lord) {
	let ships = get_lord_assets(lord, SHIP)
	return ships
}

function count_shared_ships() {
	let here = get_lord_locale(game.command)
	let n = 0
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (get_lord_locale(lord) === here)
			n += count_lord_ships(lord)
	return n
}

function count_group_ships() {
	let n = 0
	for (let lord of game.group)
		n += count_lord_ships(lord)
	return n
}

function count_group_assets(type) {
	let n = 0
	for (let lord of game.group)
		n += get_lord_assets(lord, type)
	return n
}

function count_group_forces(type) {
	let n = 0
	for (let lord of game.group)
		n += get_lord_forces(lord, type)
	return n
}
function count_group_provender(type) {
	let n = 0
	for (let lord of game.group)
		n += get_lord_provender(lord)
	return n
}

function count_group_transport(type) {
	let n = 0
	for (let lord of game.group)
		n += count_lord_transport(lord, type)
	return n
}



function max_plan_length() {
	switch (current_season()) {
		case SUMMER:
			return 7
		case SPRING:
			return 6
		case WINTER:
			return 4
		case AUTUMN:
			return 6
	}
}

function count_cards_in_plan(plan, lord) {
	let n = 0
	for (let c of plan)
		if (c === lord)
			++n
	return n
}



function is_marshal(lord) {
	switch (lord) {
		case LORD_MARGARET:
			return true
		case LORD_HENRY_VI:
			return true
		case LORD_HENRY_TUDOR:
			return true
		case LORD_EDWARD_IV:
			return true
		case LORD_GLOUCESTER_2:
			return true
		case LORD_RICHARD_III:
			return true
		case LORD_YORK:
			return true
		default:
			return false
	}
} 


function is_lieutenant(lord) {
	switch (lord) {
		case LORD_WARWICK_L:
			return true
		case LORD_SOMERSET_1:
			return true
		case LORD_GLOUCESTER_1:
			return true		
		case LORD_WARWICK_Y:
			return true
		default:
			return false
	}
} 

function is_armored_force(type) {
	return type === MEN_AT_ARMS || type === BURGUNDIANS || type === RETINUE || type === VASSAL || type === MERCENARIES
}

function is_york_card(c) {
	return c >= first_york_card && c <= last_york_card
}

function is_lancaster_card(c) {
	return c >= first_lancaster_card && c <= last_lancaster_card
}

function is_card_in_use(c) {
	if (set_has(game.hand1, c))
		return true
	if (set_has(game.hand2, c))
		return true
	if (set_has(game.events, c))
		return true
	if (game.pieces.capabilities.includes(c))
		return true
	return false
}

function list_deck() {
	let deck = []
	let first_card = (game.active === YORK) ? first_york_card : first_lancaster_card
	let last_card = (game.active === YORK) ? last_york_card : last_lancaster_card
	for (let c = first_card; c <= last_card; ++c)
		if (!is_card_in_use(c))
			deck.push(c)
	return deck
}

function is_friendly_card(c) {
	if (game.active === YORK)
		return is_york_card(c)
	return is_lancaster_card(c)
}

function has_card_in_hand(c) {
	if (game.active === YORK)
		return set_has(game.hand1, c)
	return set_has(game.hand2, c)
}

function can_discard_card(c) {
	if (set_has(game.hand1, c))
		return true
	if (set_has(game.hand2, c))
		return true
	if (game.pieces.capabilities.includes(c))
		return true
}

function is_lord_on_map(lord) {
	let loc = get_lord_locale(lord)
	return loc !== NOWHERE && loc < CALENDAR
}

function is_lord_in_play(lord) {
	return get_lord_locale(lord) !== NOWHERE
}

function is_lord_on_calendar(lord) {
	let loc = get_lord_locale(lord)
	return loc >= CALENDAR
}

function is_lord_ready(lord) {
	let loc = get_lord_locale(lord)
	return loc >= CALENDAR && loc <= CALENDAR + (game.turn >> 1)
}

function is_vassal_ready(vassal) {
	return game.pieces.vassals[vassal] === VASSAL_READY
}

function is_vassal_mustered(vassal) {
	return game.pieces.vassals[vassal] === VASSAL_MUSTERED
}

function is_york_lord(lord) {
	return lord >= first_york_lord && lord <= last_york_lord
}

function is_lancaster_lord(lord) {
	return lord >= first_lancaster_lord && lord <= last_lancaster_lord
}

function is_york_lord(lord) {
	return lord >= first_york_lord && lord <= last_york_lord
}

function is_friendly_lord(lord) {
	return lord >= first_friendly_lord && lord <= last_friendly_lord
}

function is_lord_at_friendly_locale(lord) {
	let loc = get_lord_locale(lord)
	return is_friendly_locale(loc)
}

function used_seat_capability(lord, where, extra) {
	let seats = data.lords[lord].seats
	if (extra) {
		if (set_has(seats, where) && !extra.includes(where))
			return -1
	} else {
		if (set_has(seats, where))
			return -1
	}
	return -1
}

function for_each_seat(lord, fn, repeat = false) {
	let list = data.lords[lord].seats

	for (let seat of list)
		fn(seat)
}

function is_lord_seat(lord, here) {
	let result = false
	for_each_seat(lord, seat => {
		if (seat === here)
			result = true
	})
	return result
}

function is_lord_at_seat(lord) {
	return is_lord_seat(lord, get_lord_locale(lord))
}

function has_free_seat(lord) {
	let result = false
	for_each_seat(lord, seat => {
		if (!result && is_friendly_locale(seat))
			result = true
	})
	return result
}

function has_york_lord(here) {
	for (let lord = first_york_lord; lord <= last_york_lord; ++lord)
		if (get_lord_locale(lord) === here)
			return true
}

function has_lancaster_lord(here) {
	for (let lord = first_lancaster_lord; lord <= last_lancaster_lord; ++lord)
		if (get_lord_locale(lord) === here)
			return true
}

function has_friendly_lord(loc) {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (get_lord_locale(lord) === loc)
			return true
	return false
}
/*
function has_besieged_friendly_lord(loc) {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (get_lord_locale(lord) === loc && is_lord_besieged(lord))
			return true
	return false
}*/

function has_enemy_lord(loc) {
	for (let lord = first_enemy_lord; lord <= last_enemy_lord; ++lord)
		if (get_lord_locale(lord) === loc)
			return true
	return false
}

function has_unbesieged_enemy_lord(loc) {
	for (let lord = first_enemy_lord; lord <= last_enemy_lord; ++lord)
		if (get_lord_locale(lord) === loc)
			return true
	return false
}

/*function has_unbesieged_friendly_lord(loc) {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (get_lord_locale(lord) === loc && is_lord_unbesieged(lord))
			return true
	return false
}
*/
function is_york_locale(loc) {
	return loc >= first_york_locale && loc <= last_york_locale
}

function is_lancaster_locale(loc) {
	return loc >= first_lancaster_locale && loc <= last_lancaster_locale
}
// Will be used to determine friendly favour
function is_friendly_territory(loc) {
	if (game.active === YORK)
		return loc >= first_york_locale && loc <= last_york_locale
	return loc >= first_lancaster_locale && loc <= last_lancaster_locale
}

function is_enemy_territory(loc) {
	if (game.active === YORK)
		return loc >= first_lancaster_locale && loc <= last_lancaster_locale
	return loc >= first_york_locale && loc <= last_york_locale
}

function is_seaport(loc) {
	return set_has(data.seaports, loc)
}

function is_city(loc) {
	return data.locales[loc].type === "city"
}

function is_town(loc) {
	return data.locales[loc].type === "town"
}

function is_fortress(loc) {
	return data.locales[loc].type === "fortress"
}

function is_calais(loc) {
	return data.locales[loc].type === "calais"
}

function is_sea(loc) {
	return data.locales[loc].type === "sea"
}

function is_london(loc) {
	return data.locales[loc].type === "london"
}

function is_harlech(loc) {
	return data.locales[loc].type === "harlech"
}

function is_stronghold(loc) {
	return data.locales[loc].stronghold > 0
}

function has_favourl_marker(loc) {
	return set_has(game.pieces.favourl, loc)
}

function add_favourl_marker(loc) {
	set_add(game.pieces.favourl, loc)
}

function remove_favourl_marker(loc) {
	set_delete(game.pieces.favourl, loc)
}
function has_favoury_marker(loc) {
	return set_has(game.pieces.favoury, loc)
}
	
function add_favoury_marker(loc) {
	set_add(game.pieces.favoury, loc)
}
	
function remove_favoury_marker(loc) {
	set_delete(game.pieces.favoury, loc)
}

function has_exhausted_marker(loc) {
	return set_has(game.pieces.exhausted, loc)
}

function add_exhausted_marker(loc) {
	set_add(game.pieces.exhausted, loc)
}

function has_depleted_marker(loc) {
	return set_has(game.pieces.depleted, loc)
}

function add_depleted_marker(loc) {
	set_add(game.pieces.depleted, loc)
}

function remove_depleted_marker(loc) {
	set_delete(game.pieces.depleted, loc)
}

function remove_exhausted_marker(loc) {
	set_delete(game.pieces.exhausted, loc)
}
function deplete_locale(loc) {
	if (has_depleted_marker(loc)) {
		remove_depleted_marker(loc),
		add_exhausted_marker(loc)
	}
	else {
		add_depleted_marker(loc)
	}
}

function is_friendly_locale(loc) {
	if (loc !== NOWHERE && loc < CALENDAR) {
		if (has_enemy_lord(loc))
			return false
		/*if (has_favour_marker(loc)) { //to add friendly favour marker later
			return true
		}*/
	}
	return true // TESTING PURPOSES NEED TO CHANGE TO FALSE
}

function can_add_troops(lordwho, locale) {
	if (has_exhausted_marker(locale)) return false
	else return true
}

function can_add_transport(who, what) {
	return get_lord_assets(who, what) < 100
}

function count_lord_transport(lord, type) {
	let season = current_season()
	let n = 0
	n += get_lord_assets(lord, CART)
	return n
}

function get_lord_provender(lord) {
	let n = 0
	n += get_lord_assets(lord, PROV)
	return n
}

function list_ways(from, to) {
	for (let ways of data.locales[from].ways)
		if (ways[0] === to)
			return ways
	return null
}

function group_has_capability(c) {
	for (let lord of game.group)
		if (lord_has_capability(lord, c))
			return true
	return false
}
/*
function count_unbesieged_friendly_lords(loc) {
	let n = 0
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (get_lord_locale(lord) === loc && is_lord_unbesieged(lord))
			++n
	return n
}
*/
// === MAP ===

function calculate_distance(start, adjacent) {
	let queue = []
	queue.push([start, 0])

	let distance = new Array(last_locale+1).fill(-1)
	distance[start] = 0

	while (queue.length > 0) {
		let [ here, d ] = queue.shift()
		for (let next of data.locales[here][adjacent]) {
			if (distance[next] < 0) {
				distance[next] = d+1
				queue.push([next, d+1])
			}
		}
	}

	return distance
}

for (let loc = 0; loc <= last_locale; ++loc)
	data.locales[loc].distance = calculate_distance(loc, "adjacent")

function locale_distance(from, to) {
	return data.locales[from].distance[to]
}

// === SETUP ===

function muster_lord_forces(lord) {
	let info = data.lords[lord]
	set_lord_forces(lord, RETINUE, info.forces.retinue | 0)
	set_lord_forces(lord, MEN_AT_ARMS, info.forces.men_at_arms | 0)
	set_lord_forces(lord, LONGBOWMEN, info.forces.longbowmen | 0)
	set_lord_forces(lord, MILITIA, info.forces.militia | 0)

}
/*
function muster_vassal_forces(lord, vassal) {
	let info = data.vassals[vassal]
	add_lord_forces(lord, RETINUE, info.forces.knights | 0)
	add_lord_forces(lord, SERGEANTS, info.forces.sergeants | 0)
	add_lord_forces(lord, LIGHT_HORSE, info.forces.light_horse | 0)
	add_lord_forces(lord, ASIATIC_HORSE, info.forces.asiatic_horse | 0)
	add_lord_forces(lord, MEN_AT_ARMS, info.forces.men_at_arms | 0)
	add_lord_forces(lord, MILITIA, info.forces.militia | 0)
	add_lord_forces(lord, SERFS, info.forces.serfs | 0)
}*/

function restore_lord_forces(lord, type, count) {
	if (get_lord_forces(lord, type) < count) {
		set_lord_forces(lord, type, count)
		return 1
	}
	return 0
}

function muster_lord(lord, locale) {
	let info = data.lords[lord]

	set_lord_locale(lord, locale)

	set_lord_assets(lord, PROV, info.assets.prov | 0)
	set_lord_assets(lord, COIN, info.assets.coin | 0)

	set_lord_assets(lord, CART, info.assets.cart | 0)
	set_lord_assets(lord, SHIP, info.assets.ship | 0)

	muster_lord_forces(lord)
}
/*
function disband_vassal(vassal) {
	let info = data.vassals[vassal]
	let lord = data.vassals[vassal].lord

	add_lord_forces(lord, KNIGHTS, -(info.forces.knights | 0))
	add_lord_forces(lord, SERGEANTS, -(info.forces.sergeants | 0))
	add_lord_forces(lord, LIGHT_HORSE, -(info.forces.light_horse | 0))
	add_lord_forces(lord, ASIATIC_HORSE, -(info.forces.asiatic_horse | 0))
	add_lord_forces(lord, MEN_AT_ARMS, -(info.forces.men_at_arms | 0))
	add_lord_forces(lord, MILITIA, -(info.forces.militia | 0))
	add_lord_forces(lord, SERFS, -(info.forces.serfs | 0))

	game.pieces.vassals[vassal] = VASSAL_READY

	if (!lord_has_unrouted_units(lord)) {
		disband_lord(lord)
	}
} */

function muster_vassal(lord, vassal) {
	game.pieces.vassals[vassal] = VASSAL_MUSTERED
	muster_vassal_forces(lord, vassal)
}

function draw_card(deck) {
	let i = random(deck.length)
	let c = deck[i]
	set_delete(deck, c)
	return c
}

function discard_events(when) {
	for (let i = 0; i < game.events.length; ) {
		let c = game.events[i]
		if (data.cards[c].when === when)
			array_remove(game.events, i)
		else
			++i
	}
}

function discard_friendly_events(when) {
	for (let i = 0; i < game.events.length; ) {
		let c = game.events[i]
		if (is_friendly_card(c) && data.cards[c].when === when)
			array_remove(game.events, i)
		else
			++i
	}
}

exports.setup = function (seed, scenario, options) {
	game = {
		seed,
		scenario,
		hidden: options.hidden ? 1 : 0,

		log: [],
		undo: [],

		active: P1,
		state: "setup_lords",
		stack: [],
		victory_check: 0,
		towny:0,
		fortressy:0,
		citiesy:0,
		townl:0,
		fortressl:0,
		citiesl:0,
		influence_point_l: 0,
		influence_point_y: 0,
	
		hand1: [],
		hand2: [],
		plan1: [],
		plan2: [],

		turn: 0,
		events: [], // this levy/this campaign cards

		pieces: {
			locale: Array(lord_count).fill(NOWHERE),
			assets: Array(lord_count).fill(0),
			forces: Array(lord_count).fill(0),
			routed: Array(lord_count).fill(0),
			capabilities: Array(lord_count << 1).fill(NOTHING),
			moved: 0,
			vassals: Array(vassal_count).fill(VASSAL_UNAVAILABLE),
			depleted: [],
			exhausted: [],
			favourl:[],
			favoury:[],

		},

		flags: {
			first_action: 0,
			first_march: 0,
		},

		command: NOBODY,
		actions: 0,
		group: 0,
		who: NOBODY,
		where: NOWHERE,
		what: NOTHING,
		count: 0,

		supply: 0,
		march: 0,
		battle: 0,
		spoils: 0,
	}

	update_aliases()

	log_h1(scenario)

	switch (scenario) {
	default:
	case "Ia. Henry VI":
		setup_Ia(P2, P1)
	break
	case "Ib. Towton":
		setup_Ib(P2, P1)
	break
	case "Ic. Somerset's Return":
		setup_Ic(P2, P1)
	break
	case "II. Warwicks' Rebellion" :
		setup_II(P1, P2)
	break
	case "III. My Kingdom for a Horse":
		setup_III(P1, P2)
	break
		case "I-III. Wars of the Roses":
		setup_ItoIII(P2, P1)
	break
	}

	return game
}

function setup_Ia(first_player, second_player) {
	game.turn = 1 << 1

	P1 = first_player
	P2 = second_player
	game.active = first_player
	game.victory_check = 40
	game.towny = 0
	game.townl = 0
	game.citiesy = 0
	game.citiesl = 0
	game.fortressy = 0
	game.fortressl = 0
	game.influence_point_l = 0
	game.influence_point_y = 0
	muster_lord(LORD_YORK, LOC_ELY)
	muster_lord(LORD_MARCH, LOC_LUDLOW)
	muster_lord(LORD_HENRY_VI, LOC_LONDON)
	muster_lord(LORD_SOMERSET_1, LOC_WELLS)

	set_lord_cylinder_on_calendar(LORD_NORTHUMBERLAND_L, 2)
	set_lord_cylinder_on_calendar(LORD_EXETER_1, 3)
	set_lord_cylinder_on_calendar(LORD_BUCKINGHAM, 5)
	set_lord_cylinder_on_calendar(LORD_SALISBURY, 2)
	set_lord_cylinder_on_calendar(LORD_WARWICK_Y, 3)
	set_lord_cylinder_on_calendar(LORD_RUTLAND, 5)

}

function setup_Ib(first_player, second_player) {
	game.turn = 1 << 1


	P1 = first_player
	P2 = second_player
	game.active = first_player
	muster_lord(LORD_NORFOLK, LOC_LONDON)
	muster_lord(LORD_WARWICK_Y, LOC_LONDON)
	muster_lord(LORD_MARCH, LOC_LUDLOW)
	muster_lord(LORD_EXETER_1, LOC_NEWCASTLE)
	muster_lord(LORD_SOMERSET_1, LOC_NEWCASTLE)
	muster_lord(LORD_NORTHUMBERLAND_L, LOC_CARLISLE)
}

function setup_Ic(first_player, second_player) {
	game.turn = 5 << 1	


	P1 = first_player
	P2 = second_player
	game.active = first_player
	muster_lord(LORD_WARWICK_Y, LOC_LONDON)
	muster_lord(LORD_MARCH, LOC_LONDON)
	muster_lord(LORD_SOMERSET_1, LOC_BAMBURGH)

	set_lord_cylinder_on_calendar(LORD_HENRY_VI, 5)
}


function setup_II(first_player, second_player) {
	game.turn = 1 << 1


	P1 = first_player
	P2 = second_player
	game.active = first_player
	muster_lord(LORD_EDWARD_IV, LOC_LONDON)
	muster_lord(LORD_PEMBROKE, LOC_LONDON)
	muster_lord(LORD_WARWICK_L, LOC_CALAIS)
	muster_lord(LORD_CLARENCE, LOC_YORK)
	muster_lord(LORD_JASPER_TUDOR_1, LOC_HARLECH)

	set_lord_cylinder_on_calendar(LORD_DEVON, 4)
	set_lord_cylinder_on_calendar(LORD_GLOUCESTER_1, 9)
	set_lord_cylinder_on_calendar(LORD_NORTHUMBERLAND_Y1, 9)
	set_lord_cylinder_on_calendar(LORD_MARGARET, 9)
	set_lord_cylinder_on_calendar(LORD_SOMERSET_2, 9)
	set_lord_cylinder_on_calendar(LORD_OXFORD, 9)
	set_lord_cylinder_on_calendar(LORD_EXETER_2, 9)

}


function setup_III(first_player, second_player) {
	game.turn = 1 << 1

	P1 = first_player
	P2 = second_player
	game.active = first_player
	muster_lord(LORD_RICHARD_III, LOC_LONDON)
	muster_lord(LORD_NORTHUMBERLAND_Y2, LOC_CARLISLE)
	muster_lord(LORD_NORFOLK, LOC_ARUNDEL)
	muster_lord(LORD_HENRY_TUDOR, LOC_FRANCE)
	muster_lord(LORD_JASPER_TUDOR_2, LOC_FRANCE)
	muster_lord(LORD_OXFORD, LOC_FRANCE)

}


function setup_ItoIII(first_player, second_player) {
	game.turn = 1 << 1


	P1 = first_player
	P2 = second_player
	game.active = first_player
	muster_lord(LORD_YORK, LOC_ELY)
	muster_lord(LORD_MARCH, LOC_LUDLOW)
	muster_lord(LORD_HENRY_VI, LOC_LONDON)
	muster_lord(LORD_SOMERSET_1, LOC_WELLS)

	set_lord_cylinder_on_calendar(LORD_NORTHUMBERLAND_L, 1)
	set_lord_cylinder_on_calendar(LORD_EXETER_1, 3)
	set_lord_cylinder_on_calendar(LORD_BUCKINGHAM,5)
	set_lord_cylinder_on_calendar(LORD_SALISBURY, 2)
	set_lord_cylinder_on_calendar(LORD_WARWICK_Y, 3)
	set_lord_cylinder_on_calendar(LORD_RUTLAND, 5)

}
// setup will be used in some scenarios 


states.setup_lords = {
	inactive: "Set up Lords",
	prompt() {
		view.prompt = "Set up your Lords."
		let done = true
		if (done) {
			view.prompt += " All done."
			view.actions.end_setup = 1
		}
	},
	end_setup() {
		clear_undo()
		end_setup_lords()
	},
}

function end_setup_lords() {
	clear_lords_moved()
	set_active_enemy()
	if (game.active === P1) {
		log_h1("Levy " + current_turn_name())
		goto_levy_arts_of_war_first()
	}
}

// === EVENTS ===

function is_event_in_play(c) {
	return set_has(game.events, c)
}


function is_leeward_battle_line_in_play () {
	if (is_archery_step()) {
		if (game.active === LANCASTER)
			return is_event_in_play(EVENT_LANCASTER_LEEWARD_BATTLE_LINE)
		if (game.active === YORK)
			return is_event_in_play(EVENT_YORK_LEEWARD_BATTLE_LINE)
	}
	return false
}

function is_marsh_in_play() {
	if (game.battle.round <= 2) {
		if (game.active === TEUTONS && is_event_in_play(EVENT_RUSSIAN_MARSH))
			return true
		if (game.active === RUSSIANS && is_event_in_play(EVENT_TEUTONIC_MARSH))
			return true
	}
	return false
}

function is_hill_in_play() {
	if (game.battle.round <= 2) {
		if (game.active === TEUTONS && is_event_in_play(EVENT_TEUTONIC_HILL))
			return true
		if (game.active === RUSSIANS && is_event_in_play(EVENT_RUSSIAN_HILL))
			return true
	}
	return false
}

function goto_immediate_event(c) {
	switch (c) {
		// This Levy / Campaign
	/*	case EVENT_TEUTONIC_FAMINE:
		case EVENT_RUSSIAN_FAMINE:
			set_add(game.events, c)
			// No immediate effects
			return end_immediate_event()
		case EVENT_RUSSIAN_DEATH_OF_THE_POPE:
			set_add(game.events, c)
			return goto_russian_event_death_of_the_pope()
		case EVENT_RUSSIAN_VALDEMAR:
			set_add(game.events, c)
			return goto_russian_event_valdemar()
		case EVENT_RUSSIAN_DIETRICH_VON_GRUNINGEN:
			set_add(game.events, c)
			return goto_russian_event_dietrich()

		// Add to capabilities...
		case EVENT_TEUTONIC_POPE_GREGORY:
			deploy_global_capability(c)
			return goto_teutonic_event_pope_gregory()

		// Discard
		case EVENT_TEUTONIC_GRAND_PRINCE:
			return goto_teutonic_event_grand_prince()
		case EVENT_TEUTONIC_KHAN_BATY:
			return goto_teutonic_event_khan_baty()
		case EVENT_TEUTONIC_SWEDISH_CRUSADE:
			return goto_teutonic_event_swedish_crusade()
		case EVENT_RUSSIAN_OSILIAN_REVOLT:
			return goto_russian_event_osilian_revolt()
		case EVENT_RUSSIAN_BATU_KHAN:
			return goto_russian_event_batu_khan()
		case EVENT_RUSSIAN_PRUSSIAN_REVOLT:
			return goto_russian_event_prussian_revolt()
		case EVENT_TEUTONIC_BOUNTIFUL_HARVEST:
			return goto_event_bountiful_harvest()
		case EVENT_RUSSIAN_BOUNTIFUL_HARVEST:
			return goto_event_bountiful_harvest()
		case EVENT_TEUTONIC_MINDAUGAS:
			return goto_teutonic_event_mindaugas()
		case EVENT_RUSSIAN_MINDAUGAS:
			return goto_russian_event_mindaugas()
		case EVENT_TEUTONIC_TORZHOK:
			return goto_teutonic_event_torzhok()
		case EVENT_RUSSIAN_TEMPEST:
			return goto_russian_event_tempest()*/

		default:
			log("NOT IMPLEMENTED")
			return end_immediate_event()
	}
}

function end_immediate_event() {
	clear_undo()
	resume_levy_arts_of_war()
}

// === EVENTS: UNIQUE IMMEDIATE EVENTS ===

// === EVENTS: SHIFT LORD OR SERVICE (IMMEDIATE) ===
/*
function prompt_shift_lord_on_calendar(boxes) {
	if (game.who !== NOBODY) {
		// Shift in direction beneficial to active player.
		if (is_friendly_lord(game.who)) {
			if (is_lord_on_calendar(game.who))
				gen_action_calendar(get_lord_calendar(game.who) - boxes)
			else
				gen_action_calendar(get_lord_calendar(game.who) + boxes)
		} else {
			if (is_lord_on_calendar(game.who))
				gen_action_calendar(get_lord_calendar(game.who) + boxes)
			else
				gen_action_calendar(get_lord_calendar(game.who) - boxes)
		}
	}
}
*/
// === EVENTS: HOLD ===

function play_held_event(c) {
	log(`Played E${c}.`)
	if (c >= first_york_card && c <= last_york_card)
		set_delete(game.hand1, c)
	else
		set_delete(game.hand2, c)
}

function end_held_event() {
	pop_state()
	game.what = NOTHING
}

function prompt_held_event() {
	for (let c of current_hand())
		if (can_play_held_event(c))
			gen_action_card(c)
}

function prompt_held_event_lordship() {
	for (let c of current_hand())
		if (can_play_held_event(c) || can_play_held_event_lordship(c))
			gen_action_card(c)
}

function can_play_held_event(c) {
	switch (c) {
	}
	return false
}

function can_play_held_event_lordship(c) {
	switch (c) {
	}
	return false
}

function action_held_event(c) {
	push_undo()
	play_held_event(c)
	game.what = c
	goto_held_event(c)
}

function goto_held_event(c) {
	switch (c) {
	}
}

// === EVENTS: HOLD - UNIQUE ===

// === EVENTS: HOLD - SHIFT CYLINDER ===

function action_held_event_lordship(c) {
	push_undo()
	play_held_event(c)
	if (can_play_held_event(c)) {
		goto_held_event(c)
		game.what = c
	} else {
		push_state("lordship")
		game.what = c
	}
}
/*
states.lordship = {
	get inactive() {
		return data.cards[game.what].event
	},
	prompt() {
		view.prompt = `${data.cards[game.what].event}: Play for +2 Lordship.`
		view.actions.lordship = 1
	},
	lordship() {
		end_held_event()
		log("+2 Lordship")
		game.count += 2
	}
}*/

function prompt_shift_cylinder(list, boxes) {

	// HACK: look at parent state to see if this can be used as a +2 Lordship event
	let lordship = NOBODY
	let parent = game.stack[game.stack.length-1]
	if (parent[0] === "levy_muster_lord")
		lordship = parent[1]

	let names
	if (game.what === EVENT_RUSSIAN_PRINCE_OF_POLOTSK)
		names = "a Russian Lord"
	else
		names = list.filter(lord => is_lord_on_calendar(lord)).map(lord => lord_name[lord]).join(" or ")

	if (boxes === 1)
		view.prompt = `${data.cards[game.what].event}: Shift ${names} 1 Calendar box`
	else
		view.prompt = `${data.cards[game.what].event}: Shift ${names} 2 Calendar boxes`

	for (let lord of list) {
		if (lord === lordship) {
			view.prompt += " or +2 Lordship"
			view.actions.lordship = 1
		}
		if (is_lord_on_calendar(lord))
			prompt_select_lord(lord)
	}

	view.prompt += "."

	prompt_shift_lord_on_calendar(boxes)
}
/*
function action_shift_cylinder_calendar(turn) {
	log(`Shifted L${game.who} to ${turn}.`)
	set_lord_calendar(game.who, turn)
	game.who = NOBODY
	end_held_event()
}

function action_shift_cylinder_lordship() {
	end_held_event()
	log("+2 Lordship")
	game.count += 2
}*/

// === CAPABILITIES ===

// === LEVY: ARTS OF WAR (FIRST TURN) ===

function draw_two_cards() {
	let deck = list_deck()
	return [ draw_card(deck), draw_card(deck) ]
}

function discard_card_capability(c) {
	log(`${game.active} discarded C${c}.`)
}

function discard_card_event(c) {
	log(`${game.active} discarded E${c}.`)
}

function goto_levy_arts_of_war_first() {
	if (game.active === YORK)
		log_h2("York Arts of War")
	else
		log_h2("Lancaster Arts of War")
	game.state = "levy_arts_of_war_first"
	game.what = draw_two_cards()
}

function resume_levy_arts_of_war_first() {
	if (game.what.length === 0)
		end_levy_arts_of_war_first()
}

states.levy_arts_of_war_first = {
	inactive: "Arts of War",
	prompt() {
		let c = game.what[0]
		view.arts_of_war = game.what
		view.what = c
		if (data.cards[c].this_lord) {
			let discard = true
			for (let lord of data.cards[c].lords) {
				if (is_lord_on_map(lord) && !lord_already_has_capability(lord, c)) {
					gen_action_lord(lord)
					discard = false
				}
			}
			if (discard) {
				view.prompt = `Arts of War: Discard ${data.cards[c].capability}.`
				view.actions.discard = 1
			} else {
				view.prompt = `Arts of War: Assign ${data.cards[c].capability} to a Lord.`
			}
		} else {
			view.prompt = `Arts of War: Deploy ${data.cards[c].capability}.`
			view.actions.deploy = 1
		}
	},
	lord(lord) {
		push_undo()
		let c = game.what.shift()
		log(`${game.active} deployed Capability.`)
		add_lord_capability(lord, c)
		resume_levy_arts_of_war_first()
	},
	deploy() {
		push_undo()
		let c = game.what.shift()
		log(`${game.active} deployed C${c}.`)
		deploy_global_capability(c)
		resume_levy_arts_of_war_first()
	},
	discard() {
		push_undo()
		let c = game.what.shift()
		discard_card_capability(c)
		resume_levy_arts_of_war_first()
	},
}


function end_levy_arts_of_war_first() {
	clear_undo()
	game.what = NOTHING
	set_active_enemy()
	if (game.active === P2)
		goto_levy_arts_of_war_first()
	else
		goto_levy_muster()
}

// === LEVY: ARTS OF WAR ===

function goto_levy_arts_of_war() {
	if (game.active === YORK)
		log_h2("York Arts of War")
	else
		log_h2("Lancaster Arts of War")
	game.what = draw_two_cards()
	resume_levy_arts_of_war()
}

function resume_levy_arts_of_war() {
	game.state = "levy_arts_of_war"
	if (game.what.length === 0)
		end_levy_arts_of_war()
}

states.levy_arts_of_war = {
	inactive: "Arts of War",
	prompt() {
		let c = game.what[0]
		view.arts_of_war = [ c ]
		view.what = c
		switch (data.cards[c].when) {
			case "this_levy":
			case "this_campaign":
			case "now":
				view.prompt = `Arts of War: Play ${data.cards[c].event}.`
				view.actions.play = 1
				break
			case "hold":
				view.prompt = `Arts of War: Hold ${data.cards[c].event}.`
				view.actions.hold = 1
				break
			case "never":
				view.prompt = `Arts of War: Discard ${data.cards[c].event}.`
				view.actions.discard = 1
				break
		}
	},
	play() {
		let c = game.what.shift()
		log(`${game.active} played E${c}.`)
		goto_immediate_event(c)
	},
	hold() {
		let c = game.what.shift()
		log(`${game.active} Held Event.`)
		if (game.active === P1)
			set_add(game.hand1, c)
		else
			set_add(game.hand2, c)
		resume_levy_arts_of_war()
	},
	discard() {
		let c = game.what.shift()
		discard_card_event(c)
		resume_levy_arts_of_war()
	},
}

function end_levy_arts_of_war() {
	game.what = NOTHING
	set_active_enemy()
	if (game.active === P2)
		goto_levy_arts_of_war()
	else
		goto_pay()
}

// === LEVY: MUSTER ===

function goto_levy_muster() {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
		clear_lords_moved()
	}
	if (game.active === YORK)
		log_h2("York Muster")
	else
		log_h2("Lancaster Muster")
	game.state = "levy_muster"
}

function end_levy_muster() {
	clear_lords_moved()
	set_active_enemy()
	if (game.active === P2)
		goto_levy_muster()
	else
		//goto_levy_call_to_arms()
		goto_levy_discard_events()
}

states.levy_muster = {
	inactive: "Muster",
	prompt() {
		view.prompt = "Levy: Muster with your Lords."

		prompt_held_event()

		let done = true
		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
			if (is_lord_at_friendly_locale(lord) && !get_lord_moved(lord) && !is_lord_on_calendar(lord)) {
					gen_action_lord(lord)
					done = true
			}
		}
		if (done) {
			view.prompt += ""
			view.actions.end_muster = 1
		}
	},
	lord(lord) {
		push_undo()
		log(`Mustered with L${lord}.`)
		push_state("levy_muster_lord")
		game.who = lord
		game.count = data.lords[lord].lordship
		},
	end_muster() {
		clear_undo()
		end_levy_muster()
	},
	card: action_held_event,
}

function resume_levy_muster_lord() {
	--game.count
	if (game.count === 0) {
		set_lord_moved(game.who, 1)
		pop_state()
	}
}

states.levy_muster_lord = {
	inactive: "Muster",
	prompt() {
		if (game.count === 1)
			view.prompt = `Levy: ${lord_name[game.who]} has ${game.count} action.`
		else
			view.prompt = `Levy: ${lord_name[game.who]} has ${game.count} actions.`

		prompt_held_event_lordship()

		if (game.count > 0) {
			// Roll to muster Ready Lord at Seat
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
				if (is_lord_ready(lord) && has_free_seat(lord))
					gen_action_lord(lord)
			}

			// Muster Ready Vassal Forces
		/*	for (let vassal of data.lords[game.who].vassals) {
				if (is_vassal_ready(vassal))
					gen_action_vassal(vassal)
			}*/

			// Add Transport
			if (is_seaport(get_lord_locale(game.who)) && get_lord_assets(game.who, SHIP) < 2)
				view.actions.take_ship = 1
		
			if (can_add_transport(game.who, CART))
				view.actions.take_cart = 1

			if (can_add_troops(game.who, get_lord_locale(game.who)))	
				view.actions.levy_troops = 1

			// Add Capability
			if (can_add_lord_capability(game.who))
				view.actions.capability = 1
		}

		view.actions.done = 1
	},

	card: action_held_event_lordship,

	lord(other) {
		clear_undo()
		let die = roll_die()
		let influence = data.lords[game.who].influence
		if (die <= influence) {
			log(`L${other} ${range(influence)}: ${HIT[die]}`)
			push_state("muster_lord_at_seat")
			game.who = other	
		} else {
			log(`L${other} ${range(influence)}: ${MISS[die]}`)
			resume_levy_muster_lord()
		}
	},

	vassal(vassal) {
		push_undo()
		muster_vassal(game.who, vassal)
		resume_levy_muster_lord()
	},

	take_ship() {
		push_undo()
		add_lord_assets(game.who, SHIP, 1)
		resume_levy_muster_lord()
	},
	take_cart() {
		push_undo()
		add_lord_assets(game.who, CART, 2)
		resume_levy_muster_lord()
	},
	levy_troops() {
		push_undo()
		let info = data.lords[game.who]
		let locale = data.locales[get_lord_locale(game.who)].type
		deplete_locale(get_lord_locale(game.who))
		switch(locale) {
			case "calais": 
				add_lord_forces(game.who, MEN_AT_ARMS, 2)
				add_lord_forces(game.who, LONGBOWMEN,1)
				break
			case "london":
				add_lord_forces(game.who, MEN_AT_ARMS, 1)
				add_lord_forces(game.who, LONGBOWMEN, 1)
				add_lord_forces(game.who, MILITIA, 1)
				break
			case "harlech":
				add_lord_forces(game.who, MEN_AT_ARMS, 1)
				add_lord_forces(game.who, LONGBOWMEN, 2)
				break
			case "city": 
				add_lord_forces(game.who, LONGBOWMEN, 1)
				add_lord_forces(game.who, MILITIA, 1)
				break
			case "town": 
				add_lord_forces(game.who, MILITIA, 2)
				break
			case "fortress": 
				add_lord_forces(game.who, MEN_AT_ARMS, 1)
				add_lord_forces(game.who, MILITIA, 1)
				break
			}
		resume_levy_muster_lord()
	},

	capability() {
		push_undo()
		push_state("muster_capability")
	},

	done() {
		set_lord_moved(game.who, 1)
		pop_state()
	},
}

states.muster_lord_at_seat = {
	inactive: "Muster",
	prompt() {
		view.prompt = `Muster: Select Seat for ${lord_name[game.who]}.`
		for_each_seat(game.who, seat => {
			if (is_friendly_locale(seat))
				gen_action_locale(seat)
		})
	},
	locale(loc) {
		push_undo()

		let cap = used_seat_capability(game.who, loc)
		if (cap >= 0)
			log(`L${game.who} to %${loc} (C${cap}).`)
		else
			log(`L${game.who} to %${loc}.`)

		// FIXME: clean up these transitions
		// TODO : INFLUENCE FAVOURING CURRENT SIDE
		// TODO : IF SEAT WITH ENEMY LORD GOES WITH ANY FRIENDLY SEAT
		set_lord_moved(game.who, 1)
		muster_lord(game.who, loc)
		game.state = "muster_lord_transport"
		game.count = data.lords[game.who].assets.transport | 0
		resume_muster_lord_transport()
	},
}

function resume_muster_lord_transport() {
	if (game.count === 0)
		pop_state()
	if (game.state === "levy_muster_lord")
		resume_levy_muster_lord()
}

states.muster_lord_transport = {
	inactive: "Muster",
	prompt() {
		view.prompt = `Muster: Select Transport for ${lord_name[game.who]}.`
		view.prompt += ` ${game.count} left.`
		if (data.lords[game.who].ships) {
			if (can_add_transport(game.who, SHIP))
				view.actions.take_ship = 1
		}
		if (can_add_transport(game.who, CART))
			view.actions.take_cart = 1
	},
	take_ship() {
		push_undo()
		add_lord_assets(game.who, SHIP, 1)
		--game.count
		resume_muster_lord_transport()
	},
	take_cart() {
		push_undo()
		add_lord_assets(game.who, CART, 1)
		--game.count
		resume_muster_lord_transport()
	},
}

function lord_has_capability_card(lord, c) {
	if (get_lord_capability(lord, 0) === c)
		return true
	if (get_lord_capability(lord, 1) === c)
		return true
	return false
}

function lord_has_capability(lord, card_or_list) {
	if (Array.isArray(card_or_list)) {
		for (let card of card_or_list)
			if (lord_has_capability_card(lord, card))
				return true
		return false
	}
	return lord_has_capability_card(lord, card_or_list)
}

function lord_already_has_capability(lord, c) {
	// compare capabilities by name...
	let name = data.cards[c].capability
	let c1 = get_lord_capability(lord, 0)
	if (c1 >= 0 && data.cards[c1].capability === name)
		return true
	let c2 = get_lord_capability(lord, 1)
	if (c2 >= 0 && data.cards[c2].capability === name)
		return true
	return false
}

function can_add_lord_capability(lord) {
	if (get_lord_capability(lord, 0) < 0)
		return true
	if (get_lord_capability(lord, 1) < 0)
		return true
	return false
}

function add_lord_capability(lord, c) {
	if (get_lord_capability(lord, 0) < 0)
		return set_lord_capability(lord, 0, c)
	if (get_lord_capability(lord, 1) < 0)
		return set_lord_capability(lord, 1, c)
	throw new Error("no empty capability slots!")
}

function discard_lord_capability_n(lord, n) {
	set_lord_capability(lord, n, NOTHING)
}

function discard_lord_capability(lord, c) {
	if (get_lord_capability(lord, 0) === c)
		return set_lord_capability(lord, 0, NOTHING)
	if (get_lord_capability(lord, 1) === c)
		return set_lord_capability(lord, 1, NOTHING)
	throw new Error("capability not found")
}

function can_muster_capability() {
	let deck = list_deck()
	for (let c of deck) {
		if (!data.cards[c].lords || set_has(data.cards[c].lords, game.who)) {
			if (data.cards[c].this_lord) {
				if (!lord_already_has_capability(game.who, c))
					return true
			} else {
				if (can_deploy_global_capability(c))
					return true
			}
		}
	}
	return false
}
states.muster_troops
states.muster_capability = {
	inactive: "Muster",
	prompt() {
		let deck = list_deck()
		view.prompt = `Muster: Select a new Capability for ${lord_name[game.who]}.`
		view.arts_of_war = deck
		for (let c of deck) {
			if (!data.cards[c].lords || set_has(data.cards[c].lords, game.who)) {
				if (data.cards[c].this_lord) {
					if (!lord_already_has_capability(game.who, c))
						gen_action_card(c)
				} else {
					if (can_deploy_global_capability(c))
						gen_action_card(c)
				}
			}
		}
	},
	card(c) {
		if (data.cards[c].this_lord) {
				add_lord_capability(game.who, c)
		}
		pop_state()
		resume_levy_muster_lord()
	},
}

// === LEVY: CALL TO ARMS ===

function goto_levy_discard_events() {

	// Discard "This Levy" events from play.
	discard_events("this_levy")

	goto_campaign_plan()

}


// === CAMPAIGN: CAPABILITY DISCARD ===


// === CAMPAIGN: PLAN ===

function goto_campaign_plan() {
	game.turn++

	log_h1("Campaign " + current_turn_name())

	set_active(BOTH)
	game.state = "campaign_plan"
	game.plan1 = []
	game.plan2 = []
}

states.campaign_plan = {
	inactive: "Plan",
	prompt(current) {
		let plan = current === YORK ? game.plan1 : game.plan2
		let first = current === YORK ? first_york_lord : first_lancaster_lord
		let last = current === YORK ? last_york_lord : last_lancaster_lord
		view.plan = plan
		view.actions.plan = []

		if (plan.length === max_plan_length())
			view.prompt = "Plan: All done."
		else
			view.prompt = "Plan: Build a Plan."

		if (plan.length < max_plan_length()) {
			view.actions.end_plan = 0
			if (count_cards_in_plan(plan, NOBODY) < 3)
				gen_action_plan(NOBODY)
			for (let lord = first; lord <= last; ++lord) {
				if (is_lord_on_map(lord) && count_cards_in_plan(plan, lord) < 3)
					gen_action_plan(lord)
			}
		} else {
			view.actions.end_plan = 1
		}

		if (plan.length > 0)
			view.actions.undo = 1
		else
			view.actions.undo = 0
	},
	plan(lord, current) {
		if (current === YORK)
			game.plan1.push(lord)
		else
			game.plan2.push(lord)
	},
	undo(_, current) {
		if (current === YORK) {
			game.plan1.pop()
		} else {
			game.plan2.pop()
		}
	},
	end_plan(_, current) {
		if (game.active === BOTH) {
			if (current === YORK)
				set_active(LANCASTER)
			else
				set_active(YORK)
		} else {
			end_campaign_plan()
		}
	},
}

function end_campaign_plan() {
	set_active(P1)	
	goto_command_activation()
}

// === CAMPAIGN: COMMAND ACTIVATION ===

function goto_command_activation() {
	if (game.plan2.length === 0) {
		game.command = NOBODY
		goto_end_campaign()
		return
	}

	if (check_campaign_victory())
		return
	
	if (game.plan2.length > game.plan1.length) {
		set_active(LANCASTER)
		game.command = game.plan2.shift()
	} else if (game.plan2.length < game.plan1.length) {
		set_active(YORK)
		game.command = game.plan1.shift()
	}
	else  {
		set_active(P1)
		if (P1 === "Lancaster")
		game.command = game.plan2.shift()
		else 
		game.command = game.plan1.shift()
	}


	if (game.command === NOBODY) {
		log_h2("Pass")
		goto_command_activation()
	}
	else if (!is_lord_on_map(game.command)) {
		log_h2(`L${game.command} - Pass`)
		goto_command_activation()
	} 
	else {
		log_h2(`L${game.command} at %${get_lord_locale(game.command)}`)
		goto_command()
	}
}

// === CAMPAIGN: ACTIONS ===

function set_active_command() {
	if (game.command >= first_york_lord && game.command <= last_york_lord) {
	set_active(YORK)
	}
	else
	set_active(LANCASTER)

}

function is_active_command() {
	if (game.command >= first_york_lord && game.command <= last_york_lord)
		return game.active === YORK
	else
		return game.active === LANCASTER
}

function is_first_action() {
	return game.flags.first_action
}

function is_first_march() {
	return game.flags.first_march
}

function goto_command() {
	game.actions = data.lords[game.command].command
	game.group = [ game.command ]

	game.flags.first_action = 1
	game.flags.first_march = 1
	resume_command()
	update_supply_possible()
}

function resume_command() {
	game.state = "command"
}

function spend_action(cost) {
	game.flags.first_action = 0
	game.actions -= cost
}

function spend_march_action(cost) {
	game.flags.first_action = 0
	game.flags.first_march = 0
	game.actions -= cost
}

function spend_all_actions() {
	game.flags.first_action = 0
	game.flags.first_march = 0
	game.actions = 0
}

function end_command() {
	log_br()

	game.group = 0

	game.flags.first_action = 0
	game.flags.first_march = 0
	game.flags.famine = 0

	// NOTE: Feed currently acting side first for expedience.
	set_active_command()
	goto_feed()
}

function this_lord_has_russian_druzhina() {
	if (game.active === RUSSIANS)
		if (lord_has_capability(game.command, AOW_RUSSIAN_DRUZHINA))
			return get_lord_forces(game.command, KNIGHTS) > 0
	return false
}

function this_lord_has_house_of_suzdal() {
	if (game.active === RUSSIANS)
		if (lord_has_capability(game.command, AOW_RUSSIAN_HOUSE_OF_SUZDAL))
			return is_lord_on_map(LORD_ALEKSANDR) && is_lord_on_map(LORD_ANDREY)
	return false
}

states.command = {
	inactive: "Command",
	prompt() {
		if (game.actions === 0)
			view.prompt = `Command: ${lord_name[game.command]} has no more actions.`
		else if (game.actions === 1)
			view.prompt = `Command: ${lord_name[game.command]} has ${game.actions} action.`
		else
			view.prompt = `Command: ${lord_name[game.command]} has ${game.actions} actions.`

		view.group = game.group

		let here = get_lord_locale(game.command)

		prompt_held_event()

		// 4.3.2 Marshals MAY take other lords
		if (is_marshal(game.command)) {
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
				if (lord !== game.command)
					if (get_lord_locale(lord) === here)
						gen_action_lord(lord)
		}

		// Lieutenant may not take marshall
		if (is_lieutenant(game.command)) {
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
				if (lord !== game.command)
					if (get_lord_locale(lord) === here && !is_marshal(lord)) {
						gen_action_lord(lord)
					}
						
		}


		if (game.actions > 0)
			view.actions.pass = 1
		else
			view.actions.end_command = 1

		prompt_march()

		if (can_action_supply())
			view.actions.supply = 1

	/*	if (can_action_siege())
			view.actions.siege = 1 */
		if (can_action_forage())
			view.actions.forage = 1
		if (can_action_tax())
			view.actions.tax = 1
		if (can_action_sail())
			view.actions.sail = 1
	},

	pass() {
		push_undo()
		log("Passed.")
		spend_all_actions()
	},

	end_command() {
		push_undo()
		end_command()
	},

	forage: goto_forage,
	supply: goto_supply,
	tax: goto_tax,
	sail: goto_sail,

	locale: goto_march,

	lord(lord) {
		set_toggle(game.group, lord)
		/*if (is_upper_lord(lord))
			set_toggle(game.group, get_lower_lord(lord))*/
	},

	card: action_held_event,
}

// === ACTION: MARCH ===

function format_group_move() {
	if (game.group.length > 1) {
		let list = []
		for (let lord of game.group)
			if (lord !== game.command)
				list.push("L" + lord)
		return " with " + list.join(" and ")
	}
	return ""
}
/*
function group_has_teutonic_converts() {
	if (game.active === TEUTONS) {
		if (is_first_march())
			if (group_has_capability(AOW_TEUTONIC_CONVERTS))
				if (count_group_forces(LIGHT_HORSE) > 0)
					return true
	}
	return false
}
*/

function prompt_march() {
	if (game.actions > 0) {
		let here = get_lord_locale(game.command)
		for (let to of data.locales[here].adjacent)
			gen_action_locale(to)
	}
}

function goto_march(to) {
	push_undo()
	let from = get_lord_locale(game.command)
	let ways = list_ways(from, to)
	if (ways.length > 2) {
		game.march = { from, to, approach: -1, avoid: -1 }
		game.state = "march_way"
	} else {
		game.march = { from, to, approach: ways[1], avoid: -1 }
		march_with_group_1()
	}
}

states.march_way = {
	inactive: "March",
	prompt() {
		view.prompt = `March: Select Way.`
		view.group = game.group
		let from = game.march.from
		let to = game.march.to
		let ways = list_ways(from, to)
		for (let i = 1; i < ways.length; ++i)
			gen_action_way(ways[i])
	},
	way(way) {
		game.march.approach = way
		march_with_group_1()
	},
}

function march_with_group_1() {
	let way = game.march.approach
	let type = data.ways[way].type

	let transport = count_group_transport(type)
	let prov = count_group_assets(PROV)

	if (prov <= transport)
		return march_with_group_2()

	 if (prov > transport)
		game.state = "march_laden"
	else
		march_with_group_2()
}

states.march_laden = {
	inactive: "March",
	prompt() {
		let to = game.march.to
		let way = game.march.approach
		let transport = count_group_transport(data.ways[way].type)
		let prov = count_group_assets(PROV)

		view.group = game.group
		view.prompt = `March: Unladen.`
	

		if (prov > transport) {	
			for (let lord of game.group) {
				if (prov > transport) {
					if (get_lord_assets(lord, PROV) > 0) {
						view.prompt += " Discard Provender."
						gen_action_prov(lord)
					}
				}
			}
		}
		else {
			view.actions.march = 1
			gen_action_locale(to)
	} 
	},
	prov: drop_prov,
	march: march_with_group_2,
	locale: march_with_group_2,
	laden_march: march_with_group_2,
}

function march_with_group_2() {
	let from = get_lord_locale(game.command)
	let way = game.march.approach
	let to = game.march.to
	let transport = count_group_transport(data.ways[way].type)
	let prov = count_group_assets(PROV)

	/*if (group_has_teutonic_converts()) {
		logcap(AOW_TEUTONIC_CONVERTS)
		spend_march_action(0)
	}*/
	/*else if (laden)
		spend_march_action(2)*/

		spend_march_action(1)

	if (data.ways[way].name)
		log(`Marched to %${to} via W${way}${format_group_move()}.`)
	else
		log(`Marched to %${to}${format_group_move()}.`)

	for (let lord of game.group) {
		set_lord_locale(lord, to)
		set_lord_moved(lord, 1)
	}

	if (has_unbesieged_enemy_lord(to)) {
		goto_confirm_approach()
	} else {
		march_with_group_3()
	}
}

function march_with_group_3() {
	let here = get_lord_locale(game.command)

	// Disbanded in battle!
	if (here === NOWHERE) {
		game.march = 0
		spend_all_actions()
		resume_command()
		update_supply_possible()
		return
	}


	game.march = 0

	resume_command()
	update_supply_possible()
}

function goto_confirm_approach() {
	if (game.skip_confirm_approach) {
		goto_avoid_battle()
		return
	}
	game.state = "confirm_approach"
}

states.confirm_approach = {
	inactive: "March",
	prompt() {
		view.prompt = `March: Confirm Approach to enemy Lord.`
		view.group = game.group
		view.actions.approach = 1
	},
	approach() {
		goto_avoid_battle()
	}
}

// === ACTION: MARCH - AVOID BATTLE ===

function count_besieged_lords(loc) {
	let n = 0
	for (let lord = first_lord; lord <= last_lord; ++lord)
		if (get_lord_locale(lord) === loc && is_lord_besieged(lord))
			++n
	return n
}

function stronghold_strength(loc) {
	if (has_castle_marker(loc))
		return 2
	return data.locales[loc].stronghold
}

function stronghold_capacity(loc) {
	return stronghold_strength(loc) - count_besieged_lords(loc)
}
/*

function spoil_prov(lord) {
	add_lord_assets(lord, PROV, -1)
	add_spoils(PROV, 1)
}

function can_any_avoid_battle() {
        let here = game.march.to
        for (let [to, way] of data.locales[here].ways)
                if (can_avoid_battle(to, way))
                        return true
        return false
}

function can_avoid_battle(to, way) {
	if (way === game.march.approach)
		return false
	if (has_unbesieged_enemy_lord(to))
		return false
	return true
}

function goto_avoid_battle() {
	clear_undo()
	set_active_enemy()
	if (can_any_avoid_battle()) {
		// TODO: pre-select lone lord?
		game.march.group = game.group // save group
		game.state = "avoid_battle"
		game.spoils = 0
		resume_avoid_battle()
	} else {
		goto_march_withdraw()
	}
}

function resume_avoid_battle() {
	let here = game.march.to
		game.group = []
		game.state = "avoid_battle"
	}


states.avoid_battle = {
	inactive: "Avoid Battle",
	prompt() {
		view.prompt = "March: Select Lords and destination to Avoid Battle."
		view.group = game.group

		let here = game.march.to

		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
			if (get_lord_locale(lord) === here)
				gen_action_lord(lord)

		if (game.group.length > 0) {
			for (let [to, way] of data.locales[here].ways) {
				if (can_avoid_battle(to, way))
					gen_action_locale(to)
			}
		}

		view.actions.end_avoid_battle = 1
	},
	lord(lord) {
		set_toggle(game.group, lord)
	},
	locale(to) {
		push_undo()

		// Save Assets and Lords in case Ambush cancels Avoid Battle.
		/*if (!game.march.ambush) {
			if (could_enemy_play_ambush()) {
				// TODO: ambush object...
				game.march.ambush = {
					lords: [],
					assets: game.pieces.assets.slice(),
					conquered: game.pieces.conquered.slice(),
				}
			}
		}

		let from = get_lord_locale(game.command)
		let ways = list_ways(from, to)
		if (ways.length > 2) {
			game.march.avoid_to = to
			game.state = "avoid_battle_way"
		} else {
			game.march.avoid_to = to
			game.march.avoid_way = ways[1]
			avoid_battle_1()
		}
	},
	end_avoid_battle() {
		push_undo()
		end_avoid_battle()
	},


states.avoid_battle_way = {
	inactive: "Avoid Battle",
	prompt() {
		view.prompt = `Avoid Battle: Select Way to destination.`
		view.group = game.group
		let from = game.march.to
		let to = game.march.avoid_to
		let ways = list_ways(from, to)
		for (let i = 1; i < ways.length; ++i)
			if (can_avoid_battle(to, ways[i]))
				gen_action_way(ways[i])
	},
	way(way) {
		game.march.avoid_way = way
		avoid_battle_1()
	},
}

function avoid_battle_1() {
	let way = game.march.avoid_way
	let transport = count_group_transport(data.ways[way].type)
	let prov = count_group_assets(PROV)
	if (prov > transport)
		game.state = "avoid_battle_laden"
	else
		avoid_battle_2()
}

states.avoid_battle_laden = {
	inactive: "Avoid Battle",
	prompt() {
		let to = game.march.avoid_to
		let way = game.march.avoid_way
		let transport = count_group_transport(data.ways[way].type)
		let prov = count_group_assets(PROV)

		if (prov > transport)
			view.prompt = `Avoid Battle: Hindered with ${prov} Provender and ${transport} Transport.`
		else
			view.prompt = `Avoid Battle: Unladen.`
		view.group = game.group

		if (prov > transport) {
			view.prompt += " Discard Provender."
			for (let lord of game.group) {
				if (get_lord_assets(lord, PROV) > 0)
					gen_action_prov(lord)
			}
		} else {
			gen_action_locale(to)
			view.actions.avoid = 1
		}
	},
	prov(lord) {
		push_undo()
		spoil_prov(lord)
	},
	locale(_) {
		avoid_battle_2()
	},
	avoid() {
		avoid_battle_2()
	},
}

function avoid_battle_2() {
	let to = game.march.avoid_to

	for (let lord of game.group) {
		log(`L${lord} Avoided Battle to %${to}.`)
		if (game.march.ambush)
			set_add(game.march.ambush.lords, lord)
		set_lord_locale(lord, to)
		set_lord_moved(lord, 1)
	}


	game.march.avoid_to = 0
	game.march.avoid_way = 0
	resume_avoid_battle()
}

function end_avoid_battle() {
	game.group = game.march.group // restore group
	game.march.group = 0
	goto_march_withdraw()
}*/

// === ACTION: MARCH - WITHDRAW ===

function can_withdraw(here, n) {
	if (is_unbesieged_friendly_stronghold(here))
		if (stronghold_capacity(here) >= n)
			return true
	return false
}

function goto_march_withdraw() {
	let here = game.march.to
		end_march_withdraw()
	
}

states.march_withdraw = {
	inactive: "Withdraw",
	prompt() {
		view.prompt = "March: Select Lords to Withdraw into Stronghold."

		let here = get_lord_locale(game.command)
		let capacity = stronghold_capacity(here)

		if (capacity >= 1) {
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
				if (get_lord_locale(lord) === here && !is_lower_lord(lord) && is_lord_unbesieged(lord)) {
					if (is_upper_lord(lord)) {
						if (capacity >= 2)
							gen_action_lord(lord)
					} else {
						gen_action_lord(lord)
					}
				}
			}
		}

		view.actions.end_withdraw = 1
	},
	lord(lord) {
		push_undo()
		let lower = get_lower_lord(lord)

		log(`L${lord} Withdrew.`)
		set_lord_besieged(lord, 1)

		if (lower !== NOBODY) {
			log(`L${lower} Withdrew.`)
			set_lord_besieged(lower, 1)
		}
	},
	end_withdraw() {
		end_march_withdraw()
	},
}

function end_march_withdraw() {
	clear_undo()
	set_active_enemy()
	// TO BE USED FOR BLOCKED FORD 
	goto_march_ambush()
}

// === ACTION: MARCH - AMBUSH ===
/* TO BE USED FOR BLOCKED FORD
function could_enemy_play_ambush() {
	if (game.active === TEUTONS)
		return could_play_card(EVENT_RUSSIAN_AMBUSH)
	else
		return could_play_card(EVENT_TEUTONIC_AMBUSH)
}*/

function goto_march_ambush() {
	if (game.march.ambush && game.march.ambush.lords.length > 0)
		game.state = "march_ambush"
	else
		goto_spoils_after_avoid_battle()
}

states.march_ambush = {
	inactive: "Ambush",
	prompt() {
		view.prompt = "Avoid Battle: You may play Ambush if you have it."
		if (has_card_in_hand(EVENT_TEUTONIC_AMBUSH))
			gen_action_card(EVENT_TEUTONIC_AMBUSH)
		if (has_card_in_hand(EVENT_RUSSIAN_AMBUSH))
			gen_action_card(EVENT_RUSSIAN_AMBUSH)
		view.actions.pass = 1
	},
	card(c) {
		play_held_event(c)

		// Restore assets and spoils and withdrawn lords
		game.pieces.assets = game.march.ambush.assets
		game.pieces.conquered = game.march.ambush.conquered
		game.spoils = 0

		// Restore lords who avoided battle
		for (let lord of game.march.ambush.lords) {
			set_lord_locale(lord, game.march.to)
			set_lord_moved(lord, 0)
		}

		set_active_enemy()
		game.march.ambush = 0
		goto_march_withdraw()
	},
	pass() {
		game.march.ambush = 0
		goto_spoils_after_avoid_battle()
	},
}

// === ACTION: MARCH - DIVIDE SPOILS AFTER AVOID BATTLE ===

function list_spoils() {
	let list = []
	for (let type = 0; type < 7; ++type) {
		let n = get_spoils(type)
		if (n > 0)
			list.push(`${n} ${ASSET_TYPE_NAME[type]}`)
	}
	if (list.length > 0)
		return list.join(", ")
	return "nothing"
}

function prompt_spoils() {
	if (get_spoils(PROV) > 0)
		view.actions.take_prov = 1
	if (get_spoils(COIN) > 0)
		view.actions.take_coin = 1
	if (get_spoils(CART) > 0)
		view.actions.take_cart = 1
}

function take_spoils(type) {
	push_undo_without_who()
	add_lord_assets(game.who, type, 1)
	add_spoils(type, -1)
	if (!has_any_spoils())
		game.who = NOBODY
}

function take_spoils_prov() { take_spoils(PROV) }
function take_spoils_cart() { take_spoils(CART) }

function goto_spoils_after_avoid_battle() {
	if (has_any_spoils()) {
		game.state = "spoils_after_avoid_battle"
		if (game.group.length === 1)
			game.who = game.group[0]
	} else {
		goto_battle()
	}
}

states.spoils_after_avoid_battle = {
	inactive: "Spoils",
	prompt() {
		if (has_any_spoils()) {
			view.prompt = "Spoils: Divide " + list_spoils() + "."
			// only moving lords get to divide the spoils
			for (let lord of game.group)
				prompt_select_lord(lord)
			if (game.who !== NOBODY)
				prompt_spoils()
		} else {
			view.prompt = "Spoils: All done."
			view.actions.end_spoils = 1
		}
	},
	lord: action_select_lord,
	take_prov: take_spoils_prov,
	end_spoils() {
		clear_undo()
		game.spoils = 0
		game.who = NOBODY
		goto_battle()
	},
}

// === ACTION: SUPPLY (SEARCHING) ===

let _supply_stop = new Array(last_locale+1)
let _supply_reached = new Array(last_locale+1)

let _supply_seen = new Array(last_locale+1).fill(0)
let _supply_cost = new Array(last_locale+1)
let _supply_carts = new Array(last_locale+1)

function is_supply_forbidden(here) {
	if (is_friendly_territory(here))
		return true
	return false
}

function init_supply_forbidden() {
	for (let here = 0; here <= last_locale; ++here) {
		if (is_supply_forbidden(here))
			_supply_stop[here] = 1
		else
			_supply_stop[here] = 0
	}
}

function init_supply() {
	let season = current_season()
	let here = get_lord_locale(game.command)
	let carts = 0
	let ships = 0
	let available = 2
	carts = get_shared_assets(here, CART)
	ships = count_shared_ships()
	if (ships > 2)
		ships = 2

	let seats = []
	if (available > 0) {
		for_each_seat(game.command, seat => {
			if (!is_supply_forbidden(seat))
				seats.push(seat)
		}, true)
		available = Math.min(seats.length, available)
	}

	let seaports = []
	if (ships > 0) {
		if (game.active === YORK)
			for (let port of data.seaports)
				if (!is_supply_forbidden(port))
					seaports.push(port)
		if (game.active === LANCASTER)
			for (let port of data.seaports)
			if (!is_supply_forbidden(port))
				seaports.push(port)
	}
	if (seaports.length === 0)
		ships = 0

	game.supply = { seats, seaports, available, carts, ships }
}

function search_supply(start, carts, exit) {
	if (_supply_stop[start])
		return 0
	_supply_reached[start] = 1
	_supply_cost[start] = 0
	if (exit && set_has(exit, start))
		return 1
	if (carts === 0)
		return 0
	let queue = [ start ]
	while (queue.length > 0) {
		let item = queue.shift()
		let here = item & 63
		let used = item >> 6
		if (used + 1 <= carts) {
			for (let next of data.locales[here].adjacent) {
				if (!_supply_reached[next] && !_supply_stop[next]) {
					if (exit && set_has(exit, next))
						return 1
					_supply_reached[next] = 1
					_supply_cost[next] = used + 1
					if (used + 1 < carts)
						queue.push(next | ((used + 1) << 6))
				}
			}
		}
	}
	return 0
}

// === ACTION: SUPPLY ===

function update_supply_possible() {
	if (game.actions < 1) {
		game.supply = 0
		return
	}

	update_supply_possible_pass()
}

function update_supply_possible_pass() {
	init_supply()
	init_supply_forbidden()
	_supply_reached.fill(0)
	let sources = []
	for (let loc of game.supply.seats)
		set_add(sources, loc)
	for (let loc of game.supply.seaports)
		set_add(sources, loc)
	game.supply = search_supply(get_lord_locale(game.command), game.supply.carts, sources)
}

function search_supply_cost() {
	init_supply_forbidden()
	_supply_reached.fill(0)
	search_supply(get_lord_locale(game.command), game.supply.carts, null)
}

function can_action_supply() {
	if (game.actions < 1)
		return false
	return !!game.supply
}

function can_supply() {
	if (game.supply.available > 0 && game.supply.seats.length > 0)
		return true
	if (game.supply.ships > 0 && game.supply.seaports.length > 0)
		return true
	return false
}

function goto_supply() {
	push_undo()

	if (is_famine_in_play() && !game.flags.famine) {
		if (game.active === TEUTONS)
			logevent(EVENT_RUSSIAN_FAMINE)
		else
			logevent(EVENT_TEUTONIC_FAMINE)
	}

	log(`Supplied`)
	init_supply()
	resume_supply()
	game.state = "supply_source"
}

function resume_supply() {
	if (game.supply.available + game.supply.ships === 0) {
		game.supply.seats = []
		game.supply.seaports = []
	} else {
		search_supply_cost()
		game.supply.seats = game.supply.seats.filter(loc => _supply_reached[loc])
		game.supply.seaports = game.supply.seaports.filter(loc => _supply_reached[loc])
	}

	if (can_supply())
		game.state = "supply_source"
	else
		end_supply()
}

states.supply_source = {
	inactive: "Supply",
	prompt() {
		if (!can_supply()) {
			view.prompt = "Supply: No valid Supply Sources."
			return
		}

		view.prompt = "Supply: Select Supply Source and Route."

		let list = []
		if (game.supply.carts > 0)
			list.push(`${game.supply.carts} Cart`)
		if (game.supply.ships > 0)
			list.push(`${game.supply.ships} Ship`)

		if (list.length > 0)
			view.prompt += " " + list.join(", ") + "."

		if (game.supply.available > 0)
			for (let source of game.supply.seats)
				gen_action_locale(source)
		if (game.supply.ships > 0)
			for (let source of game.supply.seaports)
				gen_action_locale(source)
		view.actions.end_supply = 1
	},
	locale(source) {
		if (game.supply.available > 0 && game.supply.seats.includes(source)) {
			array_remove_item(game.supply.seats, source)

			let cap = used_seat_capability(game.command, source, game.supply.seats)
			if (cap >= 0)
				logi(`Seat at %${source} (C${cap})`)
			else
				logi(`Seat at %${source}`)

			game.supply.available--
			if (is_famine_in_play())
				game.flags.famine = 1
		} else {
			logi(`Seaport at %${source}`)
			game.supply.ships--
		}

		add_lord_assets(game.command, PROV, 1)

		spend_supply_transport(source)
	},
	end_supply: end_supply,
}

function end_supply() {
	spend_action(1)
	resume_command()
	game.supply = 1 // supply is possible!
}

function spend_supply_transport(source) {
	if (source === get_lord_locale(game.command)) {
		resume_supply()
		return
	}

	search_supply_cost()
	game.supply.carts -= _supply_cost[source]
	resume_supply()
}

states.supply_path = {
	inactive: "Supply",
	prompt() {
		view.prompt = "Supply: Trace Route to Supply Source."
		view.supply = [ game.supply.here, game.supply.end ]
		if (game.supply.carts > 0)
			view.prompt += ` ${game.supply.carts} cart`
		for (let i = 0; i < game.supply.path.length; i += 2) {
			let wayloc = game.supply.path[i]
			gen_action_locale(wayloc >> 8)
		}
	},
	locale(next) {
		let useloc = -1
		let useway = -1
		let twoway = false
		for (let i = 0; i < game.supply.path.length; i += 2) {
			let wayloc = game.supply.path[i]
			let way = wayloc & 255
			let loc = wayloc >> 8
			if (loc === next) {
				if (useloc < 0) {
					useloc = loc
					useway = way
				} else {
					twoway = true
				}
			}
		}
		if (twoway) {
			game.state = "supply_path_way"
			game.supply.next = next
		} else {
			walk_supply_path_way(next, useway)
		}
	},
}

function walk_supply_path_way(next, way) {
	let type = data.ways[way].type
	game.supply.carts--
	game.supply.here = next
	game.supply.path = map_get(game.supply.path, (next << 8) | way)
	if (game.supply.path === 0)
		resume_supply()
	else
		// Auto-pick path if only one choice.
		if (AUTOWALK && game.supply.path.length === 2)
			walk_supply_path_way(game.supply.path[0] >> 8, game.supply.path[0] & 255)
}

states.supply_path_way = {
	inactive: "Supply",
	prompt() {
		view.prompt = "Supply: Trace path to supply source."
		view.supply = [ game.supply.here, game.supply.end ]
		if (game.supply.carts > 0)
			view.prompt += ` ${game.supply.carts} cart`
		for (let i = 0; i < game.supply.path.length; i += 2) {
			let wayloc = game.supply.path[i]
			let way = wayloc & 255
			let loc = wayloc >> 8
			if (loc === game.supply.next)
				gen_action_way(way)
		}
	},
	way(way) {
		game.state = "supply_path"
		walk_supply_path_way(game.supply.next, way)
	},
}

// === ACTION: FORAGE ===

function can_action_forage() {
	if (game.actions < 1)
		return false
	let here = get_lord_locale(game.command)
	if (has_exhausted_marker(here) || is_sea(here))
		return false
	return true
}

function goto_forage() {
	push_undo()
	let here = get_lord_locale(game.command)
	log(`Foraged at %${here}`)
	add_lord_assets(game.command, PROV, 1)
	deplete_locale(here)
	spend_action(1)
	resume_command()
}


// === ACTION: TAX ===

function can_action_tax() {
	if (game.actions < 1)
	return false
	// Must have space left to hold Coin
	if (get_lord_assets(game.command, COIN) >= 8)
		return false
	// Must be at own seat TO BE REMOVED
	return is_lord_at_seat(game.command)
}

function goto_tax() {
	push_undo()

	let here = get_lord_locale(game.command)
	
	log(`Taxed %${here}.`)

	if (is_town(here) || is_fortress(here) || is_harlech(here))
	add_lord_assets(game.command, COIN, 1)
	else if (is_city(here)) 
	add_lord_assets(game.command, COIN, 2)
	else 
	add_lord_assets(game.command, COIN, 3)
	spend_action(1)
	resume_command()

}

// === ACTION: SAIL ===

function drop_prov(lord) {
	add_lord_assets(lord, PROV, -1)
}
function drop_cart(lord) {
	add_lord_assets(lord, CART, -1)
}

function has_enough_available_ships_for_army() {
	let ships = count_group_ships()
	let army = count_lord_all_forces()
	let needed_ships= army/6
	return needed_ships <= ships
}

function can_action_sail() {
	// Must use whole action
	if (!is_first_action())
		return false

	// at a seaport
	let here = get_lord_locale(game.command)
	if (!is_seaport(here))
		return false


	// with enough ships to carry all the army
	if (!has_enough_available_ships_for_army())
		return false

	// and a valid destination
	for (let to of data.seaports)
		if (to !== here && !has_enemy_lord(to))
			return true

	return false
}

function goto_sail() {
	push_undo()
	game.state = "sail"
}

states.sail = {
	inactive: "Sail",
	prompt() {
		view.group = game.group

		let here = get_lord_locale(game.command)
		let ships = count_group_ships()
	//	TODO CAPABILITY SHIPS x2
	//  TODO CAPABILITY MOVE EVERYWHERE WITH SHIPS
		let prov = count_group_assets(PROV)
		let cart = count_group_assets(CART)


		let overflow_prov = 0
			overflow_prov = (prov/2 - ships)*2
		let overflow_cart = 0
			overflow_cart = (cart/2 - ships)*2

		if (overflow_prov <= 0 && overflow_cart <= 0) {
			view.prompt = `Sail: Select a destination Seaport.`
		let from = 0
		switch(true){
			case data.exile_1.includes(here):
				from = data.way_exile_1
				break;
			case data.exile_2.includes(here):
				from = data.way_exile_2
				break;
			case data.exile_3.includes(here):
				from = data.way_exile_3
				break;
			case data.sea_1.includes(here):
				from = data.way_sea_1
				break;
			case data.sea_2.includes(here):
				from = data.way_sea_2
				break;
			case data.sea_3.includes(here):
				from = data.way_sea_3
				break;
			case data.port_1.includes(here):
				from = data.way_port_1
				break;
			case data.port_2.includes(here):
				from = data.way_port_2
				break;
			case data.port_3.includes(here):
				from = data.way_port_3
				break;								
		}
			for (let to of from) {
				if (to === here)
					continue
				if (!has_enemy_lord(to))
					gen_action_locale(to)
			}
		}
		else if (overflow_cart > 0) {
			view.prompt = `Sailing with ${ships} Ships. Please discard ${overflow_cart} Cart`
			if (cart > 0) {
				for (let lord of game.group) {
					if (get_lord_assets(lord, CART) > 0)
						gen_action_cart(lord)
				}
			}
		}
		else if (overflow_prov > 0) {
			view.prompt = `Sailing with ${ships} Ships. Please discard ${overflow_prov} Provender`
			if (prov > 0) {
				for (let lord of game.group) {
					if (get_lord_assets(lord, PROV) > 0)
						gen_action_prov(lord)
				}
			}
		}
		else {
			view.prompt = 'ERROR'
		} 
	},
	prov: drop_prov,
	cart: drop_cart,
	locale(to) {
		push_undo()
		log(`Sailed to %${to}${format_group_move()}.`)

		let from = get_lord_locale(game.command)

		for (let lord of game.group) {
			set_lord_locale(lord, to)
			set_lord_moved(lord, 1)
		}

	/*	if (is_trade_route(to))
			conquer_trade_route(to)
*/
		spend_all_actions()
		resume_command()
		update_supply_possible()
	},
}

// === BATTLE ===

function set_active_attacker() {
	set_active(game.battle.attacker)
}

function set_active_defender() {
	if (game.battle.attacker === P1)
		set_active(P2)
	else
		set_active(P1)
}

function goto_battle() {
	
		start_battle()
	
		// march_with_group_3()
}

function init_battle(here) {
	game.battle = {
		where: here,
		round: 1,
		step: 0,
		relief: 0,
		attacker: game.active,
		ambush: 0,
		conceded: 0,
		loser: 0,
		fought: 0, // flag all lords who participated
		array: [
			-1, game.command, -1,
			-1, -1, -1,
			-1, -1, -1,
			-1, -1, -1,
		],
		garrison: 0,
		reserves: [],
		retreated: 0,
		rearguard: 0,
		strikers: 0,
		warrior_monks: 0,
		hits: 0,
		xhits: 0,
		fc: -1,
		rc: -1,
	}
}

function start_battle() {
	let here = get_lord_locale(game.command)

	log_h3(`Battle at %${here}`)

	init_battle(here, 0, 0)

	// All attacking lords to reserve
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
		if (get_lord_locale(lord) === here) {
			set_lord_fought(lord)
			if (lord !== game.command)
				set_add(game.battle.reserves, lord)
		}
	}

	// Array attacking lords if fewer than 3.
	if (game.battle.reserves.length === 2)
		game.battle.array[A3] = game.battle.reserves.pop()
	if (game.battle.reserves.length === 1)
		game.battle.array[A1] = game.battle.reserves.pop()

	// All defending lords to reserve
	for (let lord = first_enemy_lord; lord <= last_enemy_lord; ++lord) {
		if (get_lord_locale(lord) === here) {
			set_lord_fought(lord)
			set_add(game.battle.reserves, lord)
		}
	}

	//goto_relief_sally()
}

function init_garrison(knights, men_at_arms) {
	game.battle.garrison = { knights, men_at_arms }
}

// === BATTLE: BATTLE ARRAY ===

// 0) Defender decides to stand for Battle, not Avoid.
// 1) Attacker decides which Lords will relief sally, if any.
// 2) Attacker positions front A.
// 3) Defender positions front D.
// 4) Attacker positions SA.
// 5) Defender positions reaguard RG.

function has_friendly_reserves() {
	for (let lord of game.battle.reserves)
		if (is_friendly_lord(lord))
			return true
	return false
}

function has_friendly_attacking_reserves() {
	for (let lord of game.battle.reserves)
		if (is_friendly_lord(lord) && (game.battle.sally || is_lord_unbesieged(lord)))
			return true
	return false
}

function has_friendly_sallying_reserves() {
	for (let lord of game.battle.reserves)
		if (is_friendly_lord(lord) && is_lord_besieged(lord))
			return true
	return false
}

function count_friendly_reserves() {
	let n = 0
	for (let lord of game.battle.reserves)
		if (is_friendly_lord(lord))
			++n
	return n
}

function pop_first_reserve() {
	for (let lord of game.battle.reserves) {
		if (is_friendly_lord(lord)) {
			set_delete(game.battle.reserves, lord)
			return lord
		}
	}
	return NOBODY
}

function prompt_array_place_opposed(X1, X2, X3, Y1, Y3) {
	let array = game.battle.array
	if (array[X2] === NOBODY) {
		gen_action_array(X2)
	} else if (array[Y1] !== NOBODY && array[Y3] === NOBODY && array[X1] === NOBODY) {
		gen_action_array(X1)
	} else if (array[Y1] === NOBODY && array[Y3] !== NOBODY && array[X3] === NOBODY) {
		gen_action_array(X3)
	} else {
		if (array[X1] === NOBODY)
			gen_action_array(X1)
		if (array[X3] === NOBODY)
			gen_action_array(X3)
	}
}

function action_array_place(pos) {
	push_undo_without_who()
	game.battle.array[pos] = game.who
	set_delete(game.battle.reserves, game.who)
	game.who = NOBODY
}

function goto_array_attacker() {
	clear_undo()
	set_active_attacker()
	game.state = "array_attacker"
	game.who = NOBODY
	if (!has_friendly_attacking_reserves())
		end_array_attacker()
}

function goto_array_defender() {
	clear_undo()
	set_active_defender()
	game.state = "array_defender"
	game.who = NOBODY
	let n = count_friendly_reserves()
	if (n === 1) {
		game.battle.array[D2] = pop_first_reserve()
		end_array_defender()
	}
	if (n === 0)
		end_array_defender()
}

function goto_array_sally() {
	clear_undo()
	set_active_attacker()
	game.state = "array_sally"
	game.who = NOBODY
	if (!has_friendly_sallying_reserves())
		end_array_sally()
}

function goto_array_rearguard() {
	clear_undo()
	set_active_defender()
	game.state = "array_rearguard"
	game.who = NOBODY
	if (!has_friendly_reserves() || empty(SA2))
		end_array_rearguard()
}

// NOTE: The order here can be easily change to attacker/sally/defender/rearguard if desired.

function end_array_attacker() {
	goto_array_defender()
}

function end_array_defender() {
	goto_array_sally()
}

function end_array_sally() {
	goto_array_rearguard()
}

function end_array_rearguard() {
	goto_attacker_events()
}

states.array_attacker = {
	inactive: "Array Attacking Lords",
	prompt() {
		view.prompt = "Battle Array: Position your Attacking Lords."
		let array = game.battle.array
		let done = true
		if (array[A1] === NOBODY || array[A2] === NOBODY || array[A3] === NOBODY) {
			for (let lord of game.battle.reserves) {
				if (lord !== game.who && is_friendly_lord(lord)) {
					if (game.battle.sally || is_lord_unbesieged(lord)) {
						gen_action_lord(lord)
						done = false
					}
				}
			}
		}
		if (game.who === NOBODY && done)
			view.actions.end_array = 1
		if (game.who !== NOBODY) {
			// A2 is already filled by command lord!
			if (array[A1] === NOBODY)
				gen_action_array(A1)
			if (array[A3] === NOBODY)
				gen_action_array(A3)
		}
	},
	array: action_array_place,
	lord: action_select_lord,
	end_array: end_array_attacker,
}

states.array_defender = {
	inactive: "Array Defending Lords",
	prompt() {
		view.prompt = "Battle Array: Position your Defending Lords."
		let array = game.battle.array
		let done = true
		if (array[D1] === NOBODY || array[D2] === NOBODY || array[D3] === NOBODY) {
			for (let lord of game.battle.reserves) {
				if (lord !== game.who && is_friendly_lord(lord)) {
					gen_action_lord(lord)
					done = false
				}
			}
		}
		if (done && game.who === NOBODY)
			view.actions.end_array = 1
		if (game.who !== NOBODY)
			prompt_array_place_opposed(D1, D2, D3, A1, A3)
	},
	array: action_array_place,
	lord: action_select_lord,
	end_array: end_array_defender,
}

// === BATTLE: EVENTS ===

function goto_attacker_events() {
	clear_undo()
	set_active_attacker()
	log_br()
	if (can_play_battle_events())
		game.state = "attacker_events"
	else
		end_attacker_events()
}

function end_attacker_events() {
	goto_defender_events()
}

function goto_defender_events() {
	set_active_defender()
	log_br()
	if (can_play_battle_events())
		game.state = "defender_events"
	else
		end_defender_events()
}

function end_defender_events() {
	goto_battle_rounds()
}

function resume_battle_events() {
	game.what = -1
	if (is_attacker())
		goto_attacker_events()
	else
		goto_defender_events()
}

function could_play_card(c) {
	if (set_has(game.capabilities, c))
		return false
	if (!game.hidden) {
		// TODO: check capabilities on lords revealed in battle if hidden
		if (game.pieces.capabilities.includes(c))
			return false
	}
	if (set_has(game.events, c))
		return false
	if (is_york_card(c))
		return game.hand1.length > 0
	if (is_lancaster_card(c))
		return game.hand2.length > 0
	return true
}

function has_lords_in_battle() {
	for (let p = 0; p < 12; ++p)
		if (is_friendly_lord(game.battle.array[p]))
			return true
	return has_friendly_reserves()
}

function can_play_battle_events() {
	if (game.active === TEUTONS) {
		if (could_play_card(EVENT_TEUTONIC_AMBUSH))
			return true
		if (is_defender()) {
			if (could_play_card(EVENT_TEUTONIC_HILL))
				return true
			if (!is_winter())
				if (could_play_card(EVENT_TEUTONIC_MARSH))
					return true
		}
		if (!is_winter())
			if (could_play_card(EVENT_TEUTONIC_BRIDGE))
				return true
	}

	if (game.active === RUSSIANS) {
		if (could_play_card(EVENT_RUSSIAN_AMBUSH))
			return true
		if (is_defender()) {
			if (could_play_card(EVENT_RUSSIAN_HILL))
				return true
			if (!is_winter())
				if (could_play_card(EVENT_RUSSIAN_MARSH))
					return true
		}
		if (!is_winter())
			if (could_play_card(EVENT_RUSSIAN_BRIDGE))
				return true
		if (!is_summer())
			if (could_play_card(EVENT_RUSSIAN_RAVENS_ROCK))
				return true
	}

	// Battle or Storm
	if (game.active === TEUTONS) {
		if (could_play_card(EVENT_TEUTONIC_FIELD_ORGAN))
			if (has_lords_in_battle())
				return true
	}

	return false
}

function prompt_battle_events() {
	// both attacker and defender events
	if (game.active === TEUTONS) {
		gen_action_card_if_held(EVENT_TEUTONIC_AMBUSH)
		if (!is_winter())
			gen_action_card_if_held(EVENT_TEUTONIC_BRIDGE)
		if (has_lords_in_battle())
			gen_action_card_if_held(EVENT_TEUTONIC_FIELD_ORGAN)
	}

	if (game.active === RUSSIANS) {
		gen_action_card_if_held(EVENT_RUSSIAN_AMBUSH)
		if (!is_winter())
			gen_action_card_if_held(EVENT_RUSSIAN_BRIDGE)
		if (!is_summer())
			gen_action_card_if_held(EVENT_RUSSIAN_RAVENS_ROCK)
	}

	view.actions.done = 1
}

states.attacker_events = {
	inactive: "Attacker Events",
	prompt() {
		view.prompt = "Attacker may play Events."
		prompt_battle_events()
	},
	card: action_battle_events,
	done() {
		end_attacker_events()
	},
}

states.defender_events = {
	inactive: "Defender Events",
	prompt() {
		view.prompt = "Defender may play Events."

		prompt_battle_events()

		// defender only events
		if (game.active === TEUTONS) {
			if (!is_winter())
				gen_action_card_if_held(EVENT_TEUTONIC_MARSH)
			gen_action_card_if_held(EVENT_TEUTONIC_HILL)
		}

		if (game.active === RUSSIANS) {
			if (!is_winter())
				gen_action_card_if_held(EVENT_RUSSIAN_MARSH)
			gen_action_card_if_held(EVENT_RUSSIAN_HILL)
		}
	},
	card: action_battle_events,
	done() {
		end_defender_events()
	},
}

function action_battle_events(c) {
	game.what = c
	set_delete(current_hand(), c)
	set_add(game.events, c)
	switch (c) {
		case EVENT_TEUTONIC_HILL:
		case EVENT_TEUTONIC_MARSH:
		case EVENT_RUSSIAN_HILL:
		case EVENT_RUSSIAN_MARSH:
		case EVENT_RUSSIAN_RAVENS_ROCK:
			// nothing more needs to be done for these
			log(`Played E${c}.`)
			resume_battle_events()
			break
		case EVENT_TEUTONIC_AMBUSH:
		case EVENT_RUSSIAN_AMBUSH:
			log(`Played E${c}.`)
			if (is_attacker())
				game.battle.ambush |= 2
			else
				game.battle.ambush |= 1
			break
		case EVENT_TEUTONIC_BRIDGE:
		case EVENT_RUSSIAN_BRIDGE:
			// must select target lord
			game.state = "bridge"
			break
		case EVENT_TEUTONIC_FIELD_ORGAN:
			// must select target lord
			game.state = "field_organ"
			break
	}
}

states.bridge = {
	inactive: "Bridge",
	prompt() {
		view.prompt = "Bridge: Play on a Center Lord."
		view.what = game.what
		let array = game.battle.array
		if (is_attacker()) {
			if (array[D2] !== NOBODY)
				gen_action_lord(array[D2])
			if (array[RG2] !== NOBODY)
				gen_action_lord(array[RG2])
		} else {
			// Cannot play on Relief Sallying lord
			if (array[A2] !== NOBODY)
				gen_action_lord(array[A2])
		}
	},
	lord(lord) {
		log(`Played E${game.what} on L${lord}.`)
		if (!game.battle.bridge)
			game.battle.bridge = { lord1: NOBODY, lord2: NOBODY, n1: 0, n2: 0 }
		if (is_york_lord(lord))
			game.battle.bridge.lord1 = lord
		else
			game.battle.bridge.lord2 = lord
		resume_battle_events()
	},
}

states.field_organ = {
	inactive: "Field Organ",
	prompt() {
		view.prompt = "Field Organ: Play on a Lord."
		view.what = game.what
		let array = game.battle.array
		if (is_attacker()) {
			for (let pos of battle_attacking_positions)
				if (array[pos] !== NOBODY)
					gen_action_lord(array[pos])
		} else {
			for (let pos of battle_defending_positions)
				if (array[pos] !== NOBODY)
					gen_action_lord(array[pos])
		}
	},
	lord(lord) {
		log(`Played E${game.what} on L${lord}.`)
		game.battle.field_organ = lord
		resume_battle_events()
	},
}


// === BATTLE: CONCEDE THE FIELD ===

function goto_battle_rounds() {
	set_active_attacker()
	goto_concede()
}

function goto_concede() {
	log_h4(`Battle Round ${game.battle.round}`)
	game.state = "concede_battle"
}

states.concede_battle = {
	inactive: "Concede",
	prompt() {
		view.prompt = "Battle: Concede the Field?"
		view.actions.concede = 1
		view.actions.battle = 1
	},
	concede() {
		log(game.active + " Conceded.")
		game.battle.conceded = game.active
		goto_reposition_battle()
	},
	battle() {
		set_active_enemy()
		if (is_attacker())
			goto_reposition_battle()
	},
}

// === BATTLE: REPOSITION ===

function send_to_reserve(pos) {
	if (game.battle.array[pos] !== NOBODY) {
		set_add(game.battle.reserves, game.battle.array[pos])
		game.battle.array[pos] = NOBODY
	}
}

function slide_array(from, to) {
	game.battle.array[to] = game.battle.array[from]
	game.battle.array[from] = NOBODY
}

function goto_reposition_battle() {
	let array = game.battle.array

	// If all D routed.
	if (array[D1] === NOBODY && array[D2] === NOBODY && array[D3] === NOBODY) {
		log("Defenders Routed.")
	}

	// If all A routed.
	if (array[A1] === NOBODY && array[A2] === NOBODY && array[A3] === NOBODY) {
		log("Attackers Routed.")
	}

	set_active_attacker()
	goto_reposition_advance()
}

function goto_reposition_advance() {
	if (can_reposition_advance())
		game.state = "reposition_advance"
	else
		end_reposition_advance()
}

function end_reposition_advance() {
	game.who = NOBODY
	set_active_enemy()
	if (is_attacker())
		goto_reposition_center()
	else
		goto_reposition_advance()
}

function goto_reposition_center() {
	if (can_reposition_center())
		game.state = "reposition_center"
	else
		end_reposition_center()
}

function end_reposition_center() {
	game.who = NOBODY
	set_active_enemy()
	if (is_attacker())
		goto_first_strike()
	else
		goto_reposition_center()
}

function can_reposition_advance() {
	if (has_friendly_reserves()) {
		let array = game.battle.array
		if (is_attacker()) {
			if (array[A1] === NOBODY || array[A2] === NOBODY || array[A3] === NOBODY)
				return true
		} else {
			if (array[D1] === NOBODY || array[D2] === NOBODY || array[D3] === NOBODY)
				return true
		}
	}
	return false
}

states.reposition_advance = {
	inactive: "Reposition",
	prompt() {
		view.prompt = "Reposition: Advance from Reserve."
		let array = game.battle.array

		for (let lord of game.battle.reserves)
			if (is_friendly_lord(lord) && lord !== game.who)
				gen_action_lord(lord)

		if (game.who !== NOBODY) {
			if (is_attacker()) {
				if (array[A1] === NOBODY) gen_action_array(A1)
				if (array[A2] === NOBODY) gen_action_array(A2)
				if (array[A3] === NOBODY) gen_action_array(A3)
			} else {
				if (array[D1] === NOBODY) gen_action_array(D1)
				if (array[D2] === NOBODY) gen_action_array(D2)
				if (array[D3] === NOBODY) gen_action_array(D3)
			}
		}
	},
	lord(lord) {
		game.who = lord
	},
	array(pos) {
		set_delete(game.battle.reserves, game.who)
		game.battle.array[pos] = game.who
		game.who = NOBODY
		goto_reposition_advance()
	},
}

function can_reposition_center() {
	let array = game.battle.array
	if (is_attacker()) {
		if (array[A2] === NOBODY && (array[A1] !== NOBODY || array[A3] !== NOBODY))
			return true
	} else {
		if (array[D2] === NOBODY && (array[D1] !== NOBODY || array[D3] !== NOBODY))
			return true
	}
	return false
}

states.reposition_center = {
	inactive: "Reposition",
	prompt() {
		view.prompt = "Reposition: Slide to Center."
		let array = game.battle.array

		if (is_attacker()) {
			if (array[A2] === NOBODY) {
				if (array[A1] !== NOBODY) gen_action_lord(game.battle.array[A1])
				if (array[A3] !== NOBODY) gen_action_lord(game.battle.array[A3])
			}
		} else {
			if (array[D2] === NOBODY) {
				if (array[D1] !== NOBODY) gen_action_lord(game.battle.array[D1])
				if (array[D3] !== NOBODY) gen_action_lord(game.battle.array[D3])
			}
		}

		if (game.who !== NOBODY) {
			let from = get_lord_array_position(game.who)
			if (from === A1 || from === A3) gen_action_array(A2)
			if (from === D1 || from === D3) gen_action_array(D2)
		}
	},
	lord(lord) {
		game.who = lord
	},
	array(pos) {
		let from = get_lord_array_position(game.who)
		slide_array(from, pos)
		game.who = NOBODY
		goto_reposition_center()
	},
}

// === BATTLE: STRIKE ===

// Strike groups:
// 	Strike opposing lord
// 	Strike closest flanked lord (choice left/right) if not directly opposed
// 	Combine strikes with lords targeting same position
// 
// Target groups:
// 	If any striker is flanking target, single target.
// 	If any other lords flank all strikers, add them to target group.

function get_battle_array(pos) {
	if (game.battle.ambush & 1)
		if (pos === A1 || pos === A3)
			return NOBODY
	if (game.battle.ambush & 2)
		if (pos === D1 || pos === D3)
			return NOBODY
	return game.battle.array[pos]
}

function filled(pos) {
	return get_battle_array(pos) !== NOBODY
}

function empty(pos) {
	return get_battle_array(pos) === NOBODY
}

const battle_defending_positions = [ D1, D2, D3 ]
const battle_attacking_positions = [ A1, A2, A3 ]

const battle_steps = [
	{ name: "Defending Archery", hits: count_archery_hits, xhits: count_archery_xhits },
	{ name: "Attacking Archery", hits: count_archery_hits, xhits: count_archery_xhits },
	{ name: "Defending Horse", hits: count_horse_hits, xhits: count_zero_hits },
	{ name: "Attacking Horse", hits: count_horse_hits, xhits: count_zero_hits },
	{ name: "Defending Foot", hits: count_foot_hits, xhits: count_zero_hits },
	{ name: "Attacking Foot", hits: count_foot_hits, xhits: count_zero_hits },
]

function count_zero_hits(_) {
	return 0
}

function count_archery_xhits(lord) {
	let xhits = 0
	if (lord_has_capability(lord, AOW_TEUTONIC_BALISTARII) || lord_has_capability(lord, AOW_RUSSIAN_STRELTSY))
		xhits += get_lord_forces(lord, MEN_AT_ARMS)
	if (is_hill_in_play())
		return xhits << 1
	return xhits
}

function count_archery_hits(lord) {
	let hits = 0
	if (!is_marsh_in_play()) {
		if (lord_has_capability(lord, AOW_RUSSIAN_LUCHNIKI)) {
			hits += get_lord_forces(lord, LIGHT_HORSE)
			hits += get_lord_forces(lord, MILITIA)
		}
		hits += get_lord_forces(lord, ASIATIC_HORSE)
	} else {
		if (lord_has_capability(lord, AOW_RUSSIAN_LUCHNIKI)) {
			hits += get_lord_forces(lord, MILITIA)
		}
	}
	if (is_hill_in_play())
		return hits << 1
	return hits
}

function count_melee_hits(lord) {
	return count_horse_hits(lord) + count_foot_hits(lord)
}

function assemble_melee_forces(lord) {
	let forces = {
		knights: get_lord_forces(lord, KNIGHTS),
		sergeants: get_lord_forces(lord, SERGEANTS),
		light_horse: get_lord_forces(lord, LIGHT_HORSE),
		men_at_arms: get_lord_forces(lord, MEN_AT_ARMS),
		militia: get_lord_forces(lord, MILITIA),
		serfs: get_lord_forces(lord, SERFS),
	}

	if (is_marsh_in_play()) {
		forces.knights = 0
		forces.sergeants = 0
		forces.light_horse = 0
	}

	if (game.battle.bridge && (game.battle.bridge.lord1 === lord || game.battle.bridge.lord2 === lord)) {
		let n = is_york_lord(lord) ? game.battle.bridge.n1 : game.battle.bridge.n2

		log(`Bridge L${lord}`)

		if (is_horse_step()) {
			// Pick at most 1 LH if there are any Foot (for +1/2 rounding benefit)
			if (forces.men_at_arms + forces.militia + forces.serfs > 0 && forces.light_horse > 1)
				forces.light_horse = 1

			if (forces.knights >= n)
				forces.knights = n
			n -= forces.knights
			if (forces.sergeants >= n)
				forces.sergeants = n
			n -= forces.sergeants
			if (forces.light_horse >= n)
				forces.light_horse = n
			n -= forces.light_horse

			if (forces.knights > 0) logi(`${forces.knights} Knights`)
			if (forces.sergeants > 0) logi(`${forces.sergeants} Sergeants`)
			if (forces.light_horse > 0) logi(`${forces.light_horse} Light Horse`)
			if (forces.knights + forces.sergeants + forces.light_horse === 0) logi(`None`)
		}

		if (is_foot_step()) {
			if (forces.men_at_arms >= n)
				forces.men_at_arms = n
			n -= forces.men_at_arms
			if (forces.militia >= n)
				forces.militia = n
			n -= forces.militia
			if (forces.serfs >= n)
				forces.serfs = n
			n -= forces.serfs

			if (forces.men_at_arms > 0) logi(`${forces.men_at_arms} Men-at-Arms`)
			if (forces.militia > 0) logi(`${forces.militia} Militia`)
			if (forces.serfs > 0) logi(`${forces.serfs} Serfs`)
			if (forces.men_at_arms + forces.militia + forces.serfs === 0) logi(`None`)
		}

		if (is_york_lord(lord))
			game.battle.bridge.n1 = n
		else
			game.battle.bridge.n2 = n
	}

	return forces
}

function count_horse_hits(lord) {
	let hits = 0
	if (!is_marsh_in_play()) {
		let forces = assemble_melee_forces(lord)

		hits += forces.knights << 2
		hits += forces.sergeants << 1
		hits += forces.light_horse

		if (game.battle.field_organ === lord && game.battle.round === 1) {
			log(`E${EVENT_TEUTONIC_FIELD_ORGAN} L${lord}.`)
			hits += forces.knights << 1
			hits += forces.sergeants << 1
		}
	}
	return hits
}

function count_foot_hits(lord) {
	let forces = assemble_melee_forces(lord)
	let hits = 0
	hits += forces.men_at_arms << 1
	hits += forces.militia
	hits += forces.serfs
	return hits
}

function count_garrison_xhits() {
	if (is_archery_step())
		return game.battle.garrison.men_at_arms
	return 0
}

function count_garrison_hits() {
	if (is_melee_step())
		return (game.battle.garrison.knights << 1) + (game.battle.garrison.men_at_arms << 1)
	return 0
}

function count_lord_xhits(lord) {
	return battle_steps[game.battle.step].xhits(lord)
}

function count_lord_hits(lord) {
	return battle_steps[game.battle.step].hits(lord)
}

function is_battle_over() {
	set_active_attacker()
	if (has_no_unrouted_forces())
		return true
	set_active_defender()
	if (has_no_unrouted_forces())
		return true
	return false
}

function has_no_unrouted_forces() {
	// All unrouted lords are either in battle array or in reserves
	for (let p = 0; p < 12; ++p)
		if (is_friendly_lord(game.battle.array[p]))
			return false
	for (let lord of game.battle.reserves)
		if (is_friendly_lord(lord))
			return false
	return true
}

function is_attacker() {
	return game.active === game.battle.attacker
}

function is_defender() {
	return game.active !== game.battle.attacker
}

function is_attacker_step() {
	return (game.battle.step & 1) === 1
}

function is_defender_step() {
	return (game.battle.step & 1) === 0
}

function is_archery_step() {
	return game.battle.step < 2
}

function is_melee_step() {
	return game.battle.step >= 2
}

function is_horse_step() {
	return game.battle.step === 2 || game.battle.step === 3
}

function is_foot_step() {
	return game.battle.step === 4 || game.battle.step === 5
}

function did_concede() {
	return game.active === game.battle.conceded
}

function did_not_concede() {
	return game.active !== game.battle.conceded
}

function has_strike(pos) {
	return game.battle.ah[pos] + game.battle.ahx[pos] > 0
}

function current_strike_positions() {
	return is_attacker_step() ? battle_attacking_positions : battle_defending_positions
}

function find_closest_target(A, B, C) {
	if (filled(A)) return A
	if (filled(B)) return B
	if (filled(C)) return C
	return -1
}

function find_closest_target_center(T2) {
	if (game.battle.fc < 0) throw Error("unset front l/r choice")
	if (game.battle.rc < 0) throw Error("unset rear l/r choice")
	if (filled(T2))
		return T2
	if (T2 >= A1 && T2 <= D3)
		return game.battle.fc
	return game.battle.rc
}

function find_strike_target(S) {
	switch (S) {
	case A1: return find_closest_target(D1, D2, D3)
	case A2: return find_closest_target_center(D2)
	case A3: return find_closest_target(D3, D2, D1)
	case D1: return find_closest_target(A1, A2, A3)
	case D2: return find_closest_target_center(A2)
	case D3: return find_closest_target(A3, A2, A1)
	}
}

function has_strike_target(S) {
	if (is_attacker_step() && has_garrison())
		return true
	if (S === A1 || S === A2 || S === A3)
		return filled(D1) || filled(D2) || filled(D3)
	if (S === D1 || S === D2 || S === D3)
		return filled(A1) || filled(A2) || filled(A3)
}

function has_no_strike_targets() {
	if (is_defender_step() && has_garrison())
		if (has_strike_target(D2))
			return false
	for (let striker of game.battle.strikers)
		if (has_strike_target(striker))
			return false
	return true
}

function has_no_strikers_and_strike_targets() {
	if (is_defender_step() && has_garrison()) {
		if (is_archery_step() && game.battle.garrison.men_at_arms > 0)
			if (has_strike_target(D2))
				return false
		if (is_melee_step() && game.battle.garrison.men_at_arms + game.battle.garrison.knights > 0)
			if (has_strike_target(D2))
				return false
	}
	for (let pos of current_strike_positions())
		if (has_strike(pos) && has_strike_target(pos))
			return false
	return true
}

function create_strike_group(start) {
	let strikers = [ start ]
	let target = find_strike_target(start)
	for (let pos of current_strike_positions())
		if (pos !== start && filled(pos) && find_strike_target(pos) === target)
			set_add(strikers, pos)
	return strikers
}

function flanks_position_row(S, T, S1, S2, S3, T1, T2, T3) {
	// S and T are not empty
	switch (S) {
		case S1:
			switch (T) {
				case T1: return false
				case T2: return empty(T1)
				case T3: return empty(T1) && empty(T2)
			}
			break
		case S2:
			return empty(T2)
		case S3:
			switch (T) {
				case T1: return empty(T3) && empty(T2)
				case T2: return empty(T3)
				case T3: return false
			}
			break
	}
	return false
}

function flanks_position(S, T) {
	if (S === A1 || S === A2 || S === A3)
		return flanks_position_row(S, T, A1, A2, A3, D1, D2, D3)
	if (S === D1 || S === D2 || S === D3)
		return flanks_position_row(S, T, D1, D2, D3, A1, A2, A3)
}

function flanks_all_positions(S, TT) {
	for (let T of TT)
		if (!flanks_position(S, T))
			return false
	return true
}

function strike_left_or_right(S2, T1, T2, T3) {
	if (has_strike(S2)) {
		if (filled(T2))
			return T2
		let has_t1 = filled(T1)
		let has_t3 = filled(T3)
		if (has_t1 && has_t3)
			return -1
		if (has_t1)
			return T1
		if (has_t3)
			return T3
	}
	return 1000 // No target!
}

function strike_defender_row() {
	let has_d1 = filled(D1)
	let has_d2 = filled(D2)
	let has_d3 = filled(D3)
	if (has_d1 && !has_d2 && !has_d3) return D1
	if (!has_d1 && has_d2 && !has_d3) return D2
	if (!has_d1 && !has_d2 && has_d3) return D3
	return -1
}

// === BATTLE: STRIKE ===

// for each battle step:
// 	generate strikes for each lord
// 	while strikes remain:
// 		create list of strike groups (choose left/right both rows)
// 		select strike group
// 		create target group (choose if sally)
// 		total strikes and roll for walls
// 		while hits remain:
// 			assign hit to unit in target group
// 			if lord routs:
// 				forget choice of left/right strike group in current row
// 				create new target group (choose if left/right/sally)

function format_strike_step() {
	return battle_steps[game.battle.step].name
}

function format_hits() {
	if (game.battle.xhits > 0 && game.battle.hits > 0) {
		if (game.battle.xhits > 1 && game.battle.hits > 1)
			return `${game.battle.xhits} Crossbow Hits and ${game.battle.hits} Hits`
		else if (game.battle.xhits > 1)
			return `${game.battle.xhits} Crossbow Hits and ${game.battle.hits} Hit`
		else if (game.battle.hits > 1)
			return `${game.battle.xhits} Crossbow Hit and ${game.battle.hits} Hits`
		else
			return `${game.battle.xhits} Crossbow Hit and ${game.battle.hits} Hit`
	} else if (game.battle.xhits > 0) {
		if (game.battle.xhits > 1)
			return `${game.battle.xhits} Crossbow Hits`
		else
			return `${game.battle.xhits} Crossbow Hit`
	} else {
		if (game.battle.hits > 1)
			return `${game.battle.hits} Hits`
		else
			return `${game.battle.hits} Hit`
	}
}

function goto_first_strike() {
	game.battle.step = 0

	if (game.battle.bridge) {
		game.battle.bridge.n1 = game.battle.round * 2
		game.battle.bridge.n2 = game.battle.round * 2
	}

	goto_strike()
}

function goto_next_strike() {
	let end = 6
	game.battle.step++
	if (game.battle.step >= end)
		end_battle_round()
	else
		goto_strike()
}

function goto_strike() {
	// Exit early if one side is completely routed
	if (is_battle_over()) {
		end_battle_round()
		return
	}

	if (is_attacker_step())
		set_active_attacker()
	else
		set_active_defender()

	log_h5(battle_steps[game.battle.step].name)

	// Once per Archery and once per Melee.
	if (game.battle.step === 0 || game.battle.step === 2) {
		game.battle.warrior_monks = 0
		for (let p = 0; p < 12; ++p) {
			let lord = game.battle.array[p]
			if (lord !== NOBODY && lord_has_capability(lord, AOW_TEUTONIC_WARRIOR_MONKS))
				game.battle.warrior_monks |= 1 << lord
		}
	}

	if (is_marsh_in_play()) {
		if (game.active === TEUTONS)
			logevent(EVENT_RUSSIAN_MARSH)
		else
			logevent(EVENT_TEUTONIC_MARSH)
	}

	if (is_archery_step() && is_hill_in_play()) {
		if (game.active === TEUTONS)
			logevent(EVENT_TEUTONIC_HILL)
		else
			logevent(EVENT_RUSSIAN_HILL)
	}

	// Generate hits
	game.battle.ah = [ 0, 0, 0, 0, 0, 0 ]
	game.battle.ahx = [ 0, 0, 0, 0, 0, 0 ]

	for (let pos of current_strike_positions()) {
		let lord = get_battle_array(pos)
		if (lord !== NOBODY) {
			let hits = count_lord_hits(lord)
			let xhits = count_lord_xhits(lord)

			game.battle.ah[pos] = hits
			game.battle.ahx[pos] = xhits

			if (xhits > 2)
				log(`L${lord} ${frac(xhits)} Crossbow Hits.`)
			else if (xhits > 0)
				log(`L${lord} ${frac(xhits)} Crossbow Hit.`)
			if (hits > 2)
				log(`L${lord} ${frac(hits)} Hits.`)
			else if (hits > 0)
				log(`L${lord} ${frac(hits)} Hit.`)
		}
	}

	if (did_concede())
		log("Pursuit.")

	// Strike left or right or defender
	if (is_attacker_step())
		game.battle.fc = strike_left_or_right(A2, D1, D2, D3)
	else
		game.battle.fc = strike_left_or_right(D2, A1, A2, A3)

	if (has_no_strikers_and_strike_targets())
		log("None.")

	resume_strike()
}

function resume_strike() {
	if (has_no_strikers_and_strike_targets())
		goto_next_strike()
	else if (game.battle.fc < 0 || game.battle.rc < 0)
		game.state = "strike_left_right"
	else
		goto_strike_group()
}

function prompt_target_2(S1, T1, T3) {
	view.who = game.battle.array[S1]
	gen_action_lord(game.battle.array[T1])
	gen_action_lord(game.battle.array[T3])
}

function prompt_left_right() {
	view.prompt = `${format_strike_step()}: Strike left or right?`
	if (is_attacker_step())
		prompt_target_2(A2, D1, D3)
	else
		prompt_target_2(D2, A1, A3)
}

function action_left_right(lord) {
	log(`Targeted L${lord}.`)
	let pos = get_lord_array_position(lord)
	if (game.battle.fc < 0)
		game.battle.fc = pos
	else
		game.battle.rc = pos
}

states.strike_left_right = {
	get inactive() {
		return format_strike_step() + " \u2014 Strike"
	},
	prompt: prompt_left_right,
	lord(lord) {
		action_left_right(lord)
		resume_strike()
	},
}

states.assign_left_right = {
	get inactive() {
		return format_strike_step() + " \u2014 Strike"
	},
	prompt: prompt_left_right,
	lord(lord) {
		action_left_right(lord)
		set_active_enemy()
		goto_assign_hits()
	},
}

function goto_strike_group() {
	game.state = "strike_group"
}

function select_strike_group(pos) {
	game.battle.strikers = create_strike_group(pos)
	goto_strike_total_hits()
}

states.strike_group = {
	get inactive() {
		return format_strike_step() + " \u2014 Strike"
	},
	prompt() {
		view.prompt = `${format_strike_step()}: Strike.`
		if (has_garrison_strike()) {
			view.actions.garrison = 1
			if (!has_strike(D2))
				view.prompt = `${format_strike_step()}: Strike with Garrison.`
		}
		for (let pos of current_strike_positions())
			if (has_strike(pos))
				gen_action_lord(game.battle.array[pos])
	},
	lord(lord) {
		select_strike_group(get_lord_array_position(lord))
	},
	garrison() {
		if (has_strike(D2))
			select_strike_group(D2)
		else
			select_strike_group(-1)
	},
}

// === BATTLE: TOTAL HITS (ROUND UP) ===

function goto_strike_total_hits() {
	let hits = 0
	let xhits = 0

	let slist = []

	// Total hits
	for (let pos of game.battle.strikers) {
		if (game.battle.ah[pos] + game.battle.ahx[pos] > 0) {
			slist.push(lord_name[game.battle.array[pos]])
			hits += game.battle.ah[pos]
			xhits += game.battle.ahx[pos]
		}
	}

	// Round in favor of crossbow hits.
	if (xhits & 1) {
		hits = (hits >> 1)
		xhits = (xhits >> 1) + 1
	} else {
		if (hits & 1)
			hits = (hits >> 1) + 1
		else
			hits = (hits >> 1)
		xhits = (xhits >> 1)
	}

	// Conceding side halves its total Hits, rounded up.
	if (did_concede()) {
		hits = (hits + 1) >> 1
		xhits = (xhits + 1) >> 1
	}

	game.battle.hits = hits
	game.battle.xhits = xhits

	log_br()
	log(slist.join(", "))

	goto_strike_roll_walls()
}

// === BATTLE: ROLL WALLS ===

function goto_strike_roll_walls() {
	set_active_enemy()

	if (game.battle.xhits > 0)
		log_hits(game.battle.xhits, "Crossbow Hit")
	if (game.battle.hits > 0)
		log_hits(game.battle.hits, "Hit")

	game.who = -2
	goto_assign_hits()
}

function log_hits(total, name) {
	if (total === 1)
		logi(`${total} ${name}`)
	else if (total > 1)
		logi(`${total} ${name}s`)
	else
		logi(`No ${name}s`)
}

// === BATTLE: ASSIGN HITS TO UNITS / ROLL BY HIT / ROUT ===

function goto_assign_hits() {
	if (game.battle.hits + game.battle.xhits === 0)
		return end_assign_hits()

	if (has_no_strike_targets()) {
		log("Lost " + format_hits() + ".")
		return end_assign_hits()
	}

	if (is_attacker_step()) {
		if (game.battle.fc < 0 && set_has(game.battle.strikers, A2))
			return goto_assign_left_right()
	} else {
		if (game.battle.fc < 0 && set_has(game.battle.strikers, D2))
			return goto_assign_left_right()
	}

	game.state = "assign_hits"
}

function goto_assign_left_right() {
	set_active_enemy()
	game.state = "assign_left_right"
}

function end_assign_hits() {
	for (let pos of game.battle.strikers) {
		game.battle.ah[pos] = 0
		game.battle.ahx[pos] = 0
	}
	game.who = NOBODY
	game.battle.strikers = 0
	game.battle.hits = 0
	game.battle.xhits = 0
	set_active_enemy()
	resume_strike()
}

function for_each_target(fn) {
	if (is_defender_step() && has_garrison()) {
		if (filled(A2))
			fn(game.battle.array[A2])
		return
	}

	let start = game.battle.strikers[0]

	let target = find_strike_target(start)

	fn(game.battle.array[target])

	// If any striker flanks target, target must take all hits
	for (let striker of game.battle.strikers)
		if (flanks_position(striker, target))
			return

	// If other lord flanks all strikers, he may take hits instead
	for (let flanker of ARRAY_FLANKS[target])
		if (filled(flanker) && flanks_all_positions(flanker, game.battle.strikers))
			fn(game.battle.array[flanker])
}

function prompt_hit_armored_forces() {
	let has_armored = false
	for_each_target(lord => {
		if (get_lord_forces(lord, KNIGHTS) > 0) {
			gen_action_knights(lord)
			has_armored = true
		}
		if (get_lord_forces(lord, SERGEANTS) > 0) {
			gen_action_sergeants(lord)
			has_armored = true
		}
		if (get_lord_forces(lord, MEN_AT_ARMS) > 0) {
			gen_action_men_at_arms(lord)
			has_armored = true
		}
	})
	return has_armored
}

function prompt_hit_unarmored_forces() {
	for_each_target(lord => {
		if (get_lord_forces(lord, LIGHT_HORSE) > 0)
			gen_action_light_horse(lord)
		if (get_lord_forces(lord, ASIATIC_HORSE) > 0)
			gen_action_asiatic_horse(lord)
		if (get_lord_forces(lord, MILITIA) > 0)
			gen_action_militia(lord)
		if (get_lord_forces(lord, SERFS) > 0)
			gen_action_serfs(lord)
	})
}

function prompt_hit_forces() {
	for_each_target(lord => {
		if (get_lord_forces(lord, KNIGHTS) > 0)
			gen_action_knights(lord)
		if (get_lord_forces(lord, SERGEANTS) > 0)
			gen_action_sergeants(lord)
		if (get_lord_forces(lord, LIGHT_HORSE) > 0)
			gen_action_light_horse(lord)
		if (get_lord_forces(lord, ASIATIC_HORSE) > 0)
			gen_action_asiatic_horse(lord)
		if (get_lord_forces(lord, MEN_AT_ARMS) > 0)
			gen_action_men_at_arms(lord)
		if (get_lord_forces(lord, MILITIA) > 0)
			gen_action_militia(lord)
		if (get_lord_forces(lord, SERFS) > 0)
			gen_action_serfs(lord)
	})
}

states.assign_hits = {
	get inactive() {
		return format_strike_step() + " \u2014 Assign " + format_hits()
	},
	prompt() {
		view.prompt = `${format_strike_step()}: Assign ${format_hits()} to units.`

		view.group = game.battle.strikers.map(p => game.battle.array[p])

		prompt_hit_forces()
	},
	knights(lord) {
		action_assign_hits(lord, KNIGHTS)
	},
	sergeants(lord) {
		action_assign_hits(lord, SERGEANTS)
	},
	light_horse(lord) {
		action_assign_hits(lord, LIGHT_HORSE)
	},
	asiatic_horse(lord) {
		action_assign_hits(lord, ASIATIC_HORSE)
	},
	men_at_arms(lord) {
		action_assign_hits(lord, MEN_AT_ARMS)
	},
	militia(lord) {
		action_assign_hits(lord, MILITIA)
	},
	serfs(lord) {
		action_assign_hits(lord, SERFS)
	},
}

function rout_lord(lord) {
	log(`L${lord} Routed.`)

	let pos = get_lord_array_position(lord)

	// Remove from battle array
	game.battle.array[pos] = NOBODY

	// Strike left or right or defender

	if (pos >= A1 && pos <= A3) {
		game.battle.fc = strike_left_or_right(D2, A1, A2, A3)
	}

	else if (pos >= D1 && pos <= D3) {
		game.battle.fc = strike_left_or_right(A2, D1, D2, D3)
		if (is_sa_without_rg())
			game.battle.rc = strike_defender_row()
	}
}

function rout_unit(lord, type) {
	if (lord === GARRISON) {
		if (type === KNIGHTS)
			game.battle.garrison.knights--
		if (type === MEN_AT_ARMS)
			game.battle.garrison.men_at_arms--
		if (game.battle.garrison.knights + game.battle.garrison.men_at_arms === 0) {
			log("Garrison Routed.")
			game.battle.garrison = 0
		}
	} else {
		add_lord_forces(lord, type, -1)
		add_lord_routed_forces(lord, type, 1)
	}
}

function remove_serf(lord) {
	add_lord_forces(lord, SERFS, -1)
	game.pieces.smerdi++
}

function use_warrior_monks(lord, type) {
	if (type === KNIGHTS) {
		let bit = 1 << lord
		if (game.battle.warrior_monks & bit) {
			game.battle.warrior_monks ^= bit
			return true
		}
	}
	return false
}

function which_lord_capability(lord, list) {
	for (let c of list)
		if (lord_has_capability_card(lord, c))
			return c
	return -1
}

function assign_hit_roll(what, prot, extra) {
	let die = roll_die()
	if (die <= prot) {
		logi(`${what} ${range(prot)}: ${MISS[die]}${extra}`)
		return false
	} else {
		logi(`${what} ${range(prot)}: ${HIT[die]}${extra}`)
		return true
	}

}

function action_assign_hits(lord, type) {
	let protection = FORCE_PROTECTION[type]
	let evade = FORCE_EVADE[type]

	if (game.who !== lord) {
		game.who = lord
		if (lord === GARRISON)
			log("Garrison")
		else
			log(`L${lord}`)
	}

	let extra = ""

	let crossbow = 0
	if (is_armored_force(type) && game.battle.xhits > 0) {
		extra += " (-2\xa0Crossbow)"
		crossbow = 2
	}

	if (type === SERGEANTS || type === MEN_AT_ARMS) {
		if (lord_has_capability(lord, AOW_TEUTONIC_HALBBRUDER)) {
			extra += ` (+1\xa0C${which_lord_capability(lord, AOW_TEUTONIC_HALBBRUDER)})`
			protection += 1
		}
	}

	// Evade only in Battle Melee steps
	if (evade > 0 && is_melee_step()) {
		if (assign_hit_roll(FORCE_TYPE_NAME[type], evade, extra))
			rout_unit(lord, type)
	} else if (protection > 0) {
		if (assign_hit_roll(FORCE_TYPE_NAME[type], protection - crossbow, extra)) {
			if (use_warrior_monks(lord, type)) {
				let monks = which_lord_capability(lord, AOW_TEUTONIC_WARRIOR_MONKS)
				if (assign_hit_roll(`C${monks}`, protection - crossbow, extra))
					rout_unit(lord, type)
			} else {
				rout_unit(lord, type)
			}
		}
	} else {
		logi(`${FORCE_TYPE_NAME[type]} removed`)
		remove_serf(lord, type)
	}

	if (game.battle.xhits)
		game.battle.xhits--
	else
		game.battle.hits--

	if (!lord_has_unrouted_units(lord))
		rout_lord(lord)

	goto_assign_hits()
}

// === BATTLE: NEW ROUND ===

function end_battle_round() {
	if (game.battle.conceded) {
		game.battle.loser = game.battle.conceded
		end_battle()
		return
	}

	set_active_attacker()
	if (has_no_unrouted_forces()) {
		game.battle.loser = game.active
		end_battle()
		return
	}

	set_active_defender()
	if (has_no_unrouted_forces()) {
		game.battle.loser = game.active
		end_battle()
		return
	}

	game.battle.round ++

	game.battle.ambush = 0

	set_active_attacker()
	goto_concede()
}

// === ENDING THE BATTLE ===

// Ending the Battle - optimized from rules as written
//   Loser retreat / withdraw / remove
//   Loser losses
//   Loser service
//   Victor losses
//   Victor spoils

// Ending the Storm
//   Sack (loser removes lords)
//   Victor losses
//   Victor spoils

function set_active_loser() {
	set_active(game.battle.loser)
}

function set_active_victor() {
	if (game.battle.loser === P1)
		set_active(P2)
	else
		set_active(P1)
}

function end_battle() {
	log_h4(`${game.battle.loser} Lost`)

	game.battle.array = 0

	goto_battle_withdraw()
}

// === ENDING THE STORM: SACK ===

function award_spoils(n) {
	add_spoils(PROV, n)
	add_spoils(COIN, n)
}
// === ENDING THE BATTLE: WITHDRAW ===

function withdrawal_capacity_needed(here) {
	let has_upper = 0
	let has_other = 0
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
		if (get_lord_locale(lord) === here && is_lord_unbesieged(lord) && !is_lower_lord(lord)) {
			if (is_upper_lord(lord))
				has_upper++
			else
				has_other++
		}
	}
	if (has_upper)
		return 2
	if (has_other)
		return 1
	return 0
}

function goto_battle_withdraw() {
	set_active_loser()
	game.spoils = 0
	let here = game.battle.where
	let wn = withdrawal_capacity_needed(here)
	if (wn > 0 && can_withdraw(here, wn)) {
		game.state = "battle_withdraw"
	} else {
		end_battle_withdraw()
	}
}

function end_battle_withdraw() {
	goto_retreat()
}

states.battle_withdraw = {
	inactive: "Withdraw",
	prompt() {
		let here = game.battle.where
		let capacity = stronghold_capacity(here)

		view.prompt = "Battle: Select Lords to Withdraw into Stronghold."

		// NOTE: Sallying lords are still flagged "besieged" and are thus already withdrawn!

		if (capacity >= 1) {
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
				if (get_lord_locale(lord) === here && !is_lower_lord(lord) && is_lord_unbesieged(lord)) {
					if (is_upper_lord(lord)) {
						if (capacity >= 2)
							gen_action_lord(lord)
					} else {
						gen_action_lord(lord)
					}
				}
			}
		}

		view.actions.end_withdraw = 1
	},
	lord(lord) {
		push_undo()
		let lower = get_lower_lord(lord)

		log(`L${lord} Withdrew.`)
		set_lord_besieged(lord, 1)

		if (lower !== NOBODY) {
			log(`L${lower} Withdrew.`)
			set_lord_besieged(lower, 1)
		}
	},
	end_withdraw() {
		clear_undo()
		end_battle_withdraw()
	},
}

// === ENDING THE BATTLE: RETREAT ===

function count_retreat_transport(type) {
	let n = 0
	for (let lord of game.battle.retreated)
		n += count_lord_transport(lord, type)
	return n
}

function count_retreat_assets(type) {
	let n = 0
	for (let lord of game.battle.retreated)
		n += get_lord_assets(lord, type)
	return n
}

function transfer_assets_except_ships(lord) {
	add_spoils(PROV, get_lord_assets(lord, PROV))
	add_spoils(COIN, get_lord_assets(lord, COIN))
	add_spoils(CART, get_lord_assets(lord, CART))
	set_lord_assets(lord, PROV, 0)
	set_lord_assets(lord, COIN, 0)
	set_lord_assets(lord, CART, 0)
}

function can_retreat_to(to) {
	return !has_unbesieged_enemy_lord(to) && !is_unbesieged_enemy_stronghold(to)
}

function can_retreat() {
	if (game.march) {
		// Battle after March
		if (is_attacker())
			return can_retreat_to(game.march.from)
		for (let [to, way] of data.locales[game.battle.where].ways)
			if (way !== game.march.approach && can_retreat_to(to))
				return true
	} else {
		// Battle after Sally
		for (let to of data.locales[game.battle.where].adjacent)
			if (can_retreat_to(to))
				return true
	}
	return false
}

function goto_retreat() {
	let here = game.battle.where
	if (count_unbesieged_friendly_lords(here) > 0 && can_retreat()) {
		game.battle.retreated = []
		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
			if (get_lord_locale(lord) === here && is_lord_unbesieged(lord))
				set_add(game.battle.retreated, lord)
		game.state = "retreat"
	} else {
		end_retreat()
	}
}

function end_retreat() {
	goto_battle_remove()
}

states.retreat = {
	inactive: "Retreat",
	prompt() {
		view.prompt = "Battle: Retreat losing Lords."
		view.group = game.battle.retreated
		if (game.march) {
			// after March
			if (is_attacker()) {
				gen_action_locale(game.march.from)
			} else {
				for (let [to, way] of data.locales[game.battle.where].ways)
				if (way !== game.march.approach && can_retreat_to(to))
					gen_action_locale(to)
			}
		} else {
			// after Sally
			for (let to of data.locales[game.battle.where].adjacent)
				if (can_retreat_to(to))
					gen_action_locale(to)
		}
	},
	locale(to) {
		push_undo()
		if (game.march) {
			if (is_attacker()) {
				game.battle.retreat_to = to
				game.battle.retreat_way = game.march.approach
				retreat_1()
			} else {
				let ways = list_ways(game.battle.where, to)
				if (ways.length > 2) {
					game.battle.retreat_to = to
					game.state = "retreat_way"
				} else {
					game.battle.retreat_to = to
					game.battle.retreat_way = ways[1]
					retreat_1()
				}
			}
		} else {
			let ways = list_ways(game.battle.where, to)
			if (ways.length > 2) {
				game.battle.retreat_to = to
				game.state = "retreat_way"
			} else {
				game.battle.retreat_to = to
				game.battle.retreat_way = ways[1]
				retreat_1()
			}
		}
	},
}

states.retreat_way = {
	inactive: "Retreat",
	prompt() {
		view.prompt = `Retreat: Select Way.`
		view.group = game.battle.retreated
		let from = game.battle.where
		let to = game.battle.retreat_to
		let ways = list_ways(from, to)
		for (let i = 1; i < ways.length; ++i)
			gen_action_way(ways[i])
	},
	way(way) {
		game.battle.retreat_way = way
		retreat_1()
	},
}

function retreat_1() {
	// Retreated without having conceded the Field
	if (did_not_concede()) {
		for (let lord of game.battle.retreated)
			transfer_assets_except_ships(lord)
		retreat_2()
	} else {
		let way = game.battle.retreat_way
		let transport = count_retreat_transport(data.ways[way].type)
		let prov = count_retreat_assets(PROV)
		if (prov > transport)
			game.state = "retreat_laden"
		else
			retreat_2()
	}
}

states.retreat_laden = {
	inactive: "Retreat",
	prompt() {
		let to = game.battle.retreat_to
		let way = game.battle.retreat_way
		let transport = count_retreat_transport(data.ways[way].type)
		let prov = count_retreat_assets(PROV)

		if (prov > transport)
			view.prompt = `Retreat: Hindered with ${prov} Provender and ${transport} Transport.`
		else
			view.prompt = `Retreat: Unladen.`
		view.group = game.battle.retreated

		if (prov > transport) {
			view.prompt += " Discard Provender."
			for (let lord of game.battle.retreated) {
				if (get_lord_assets(lord, PROV) > 0)
					gen_action_prov(lord)
			}
		} else {
			gen_action_locale(to)
			view.actions.retreat = 1
		}
	},
	prov(lord) {
		spoil_prov(lord)
	},
	locale(_) {
		retreat_2()
	},
	retreat() {
		retreat_2()
	},
}

function retreat_2() {
	let to = game.battle.retreat_to
	let way = game.battle.retreat_way

	if (data.ways[way].name)
		log(`Retreated via W${way} to %${to}.`)
	else
		log(`Retreated to %${to}.`)

	for (let lord of game.battle.retreated)
		set_lord_locale(lord, to)

	if (is_trade_route(to))
		conquer_trade_route(to)

	game.battle.retreat_to = 0
	game.battle.retreat_way = 0
	end_retreat()
}

// === ENDING THE BATTLE: REMOVE ===

function goto_battle_remove() {
	if (count_unbesieged_friendly_lords(game.battle.where) > 0)
		game.state = "battle_remove"
	else
		goto_battle_losses_loser()
}

states.battle_remove = {
	inactive: "Remove Lords",
	prompt() {
		view.prompt = "Battle: Remove losing Lords who cannot Retreat or Withdraw."
		let here = game.battle.where
		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
			if (get_lord_locale(lord) === here && is_lord_unbesieged(lord))
				gen_action_lord(lord)
	},
	lord(lord) {
		transfer_assets_except_ships(lord)
		if (can_ransom_lord_battle(lord)) {
			goto_ransom(lord)
		} else {
			disband_lord(lord, true)
			goto_battle_remove()
		}
	},
}

function end_ransom_battle_remove() {
	goto_battle_remove()
}

// === ENDING THE BATTLE: LOSSES ===

function has_battle_losses() {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (lord_has_routed_units(lord))
			return true
	return false
}

function goto_battle_losses_loser() {
	clear_undo()
	set_active_loser()
	game.who = NOBODY
	if (has_battle_losses())
		if (game.active === P1)
			log_h4("Yorkist Losses")
		else
			log_h4("Lancastrian Losses")
	resume_battle_losses()
}

function goto_battle_losses_victor() {
	clear_undo()
	set_active_victor()
	game.who = NOBODY
	if (has_battle_losses())
		if (game.active === P1)
			log_h4("Yorkist Losses")
		else
			log_h4("Lancastrian Losses")
	resume_battle_losses()
}

function resume_battle_losses() {
	game.state = "battle_losses"
	if (!has_battle_losses())
		goto_battle_losses_remove()
}

function action_losses(lord, type) {
	let protection = FORCE_PROTECTION[type]
	let evade = FORCE_EVADE[type]
	let target = Math.max(protection, evade)

	// Losers in a Battle roll vs 1 if they did not concede
	if (game.active === game.battle.loser && did_not_concede())
		// unless they withdrow
		if (is_lord_unbesieged(lord))
			target = 1

	if (game.who !== lord) {
		log(`L${lord}`)
		game.who = lord
	}

	let die = roll_die()
	if (die <= target) {
		logi(`${FORCE_TYPE_NAME[type]} ${range(target)}: ${MISS[die]}`)
		add_lord_routed_forces(lord, type, -1)
		add_lord_forces(lord, type, 1)
	} else {
		logi(`${FORCE_TYPE_NAME[type]} ${range(target)}: ${HIT[die]}`)
		add_lord_routed_forces(lord, type, -1)
	}

	resume_battle_losses()
}

states.battle_losses = {
	inactive: "Losses",
	prompt() {
		view.prompt = "Losses: Determine the fate of your Routed units."
		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
			if (is_lord_on_map(lord) && lord_has_routed_units(lord)) {
				if (get_lord_routed_forces(lord, KNIGHTS) > 0)
					gen_action_routed_knights(lord)
				if (get_lord_routed_forces(lord, SERGEANTS) > 0)
					gen_action_routed_sergeants(lord)
				if (get_lord_routed_forces(lord, LIGHT_HORSE) > 0)
					gen_action_routed_light_horse(lord)
				if (get_lord_routed_forces(lord, ASIATIC_HORSE) > 0)
					gen_action_routed_asiatic_horse(lord)
				if (get_lord_routed_forces(lord, MEN_AT_ARMS) > 0)
					gen_action_routed_men_at_arms(lord)
				if (get_lord_routed_forces(lord, MILITIA) > 0)
					gen_action_routed_militia(lord)
				if (get_lord_routed_forces(lord, SERFS) > 0)
					gen_action_routed_serfs(lord)
			}
		}
	},
	routed_knights(lord) {
		action_losses(lord, KNIGHTS)
	},
	routed_sergeants(lord) {
		action_losses(lord, SERGEANTS)
	},
	routed_light_horse(lord) {
		action_losses(lord, LIGHT_HORSE)
	},
	routed_asiatic_horse(lord) {
		action_losses(lord, ASIATIC_HORSE)
	},
	routed_men_at_arms(lord) {
		action_losses(lord, MEN_AT_ARMS)
	},
	routed_militia(lord) {
		action_losses(lord, MILITIA)
	},
	routed_serfs(lord) {
		action_losses(lord, SERFS)
	},
}

// === ENDING THE BATTLE: LOSSES (REMOVE LORDS) ===

function goto_battle_losses_remove() {
	game.state = "battle_losses_remove"
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (is_lord_on_map(lord) && !lord_has_unrouted_units(lord))
			return
	end_battle_losses_remove()
}

function end_battle_losses_remove() {
	game.who = NOBODY
	if (game.active === game.battle.loser)
		goto_battle_service()
	else
		goto_battle_spoils()
}

states.battle_losses_remove = {
	inactive: "Remove Lords",
	prompt() {
		view.prompt = "Losses: Remove Lords who lost all their Forces."
		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
			if (is_lord_on_map(lord) && !lord_has_unrouted_units(lord))
				gen_action_lord(lord)
	},
	lord(lord) {
		set_delete(game.battle.retreated, lord)
		if (game.active === game.battle.loser)
			transfer_assets_except_ships(lord)
		if (can_ransom_lord_battle(lord)) {
			goto_ransom(lord)
		} else {
			disband_lord(lord, true)
			goto_battle_losses_remove()
		}
	},
}

function end_ransom_battle_losses_remove() {
	goto_battle_losses_remove()
}

// === ENDING THE BATTLE: SPOILS (VICTOR) ===

function log_spoils() {
	if (game.spoils[PROV] > 0)
		logi(game.spoils[PROV] + " Provender")
	if (game.spoils[COIN] > 0)
		logi(game.spoils[COIN] + " Coin")
	if (game.spoils[CART] > 0)
		logi(game.spoils[CART] + " Cart")
	if (game.spoils[SHIP] > 0)
		logi(game.spoils[SHIP] + " Ship")
}

function find_lone_friendly_lord_at(loc) {
	let who = NOBODY
	let n = 0
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
		if (get_lord_locale(lord) === loc) {
			who = lord
			++n
		}
	}
	if (n === 1)
		return who
	return NOBODY
}

function goto_battle_spoils() {
	if (has_any_spoils() && has_friendly_lord(game.battle.where)) {
		log_h4("Spoils")
		log_spoils()
		game.state = "battle_spoils"
		game.who = find_lone_friendly_lord_at(game.battle.where)
	} else {
		end_battle_spoils()
	}
}

function end_battle_spoils() {
	game.who = NOBODY
	game.spoils = 0
	goto_battle_aftermath()
}

states.battle_spoils = {
	inactive: "Spoils",
	prompt() {
		if (has_any_spoils()) {
			view.prompt = "Spoils: Divide " + list_spoils() + "."
			let here = game.battle.where
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
				if (get_lord_locale(lord) === here)
					prompt_select_lord(lord)
			if (game.who !== NOBODY)
				prompt_spoils()
		} else {
			view.prompt = "Spoils: All done."
			view.actions.end_spoils = 1
		}
	},
	lord: action_select_lord,
	take_prov: take_spoils_prov,
	take_cart: take_spoils_cart,
	end_spoils() {
		clear_undo()
		end_battle_spoils()
	},
}

// === ENDING THE BATTLE: SERVICE (LOSER) ===

function goto_battle_service() {
	if (game.battle.retreated) {
		log_h4("Service")
		resume_battle_service()
	} else {
		end_battle_service()
	}
}

function resume_battle_service() {
	if (game.battle.retreated.length > 0)
		game.state = "battle_service"
	else
		end_battle_service()
}
/*
states.battle_service = {
	inactive: "Service",
	prompt() {
		view.prompt = "Battle: Roll to shift Service of each Retreated Lord."
		for (let lord of game.battle.retreated)
			gen_action_service_bad(lord)
	},
	service_bad(lord) {
		let die = roll_die()
		if (die <= 2)
			add_lord_service(lord, -1)
		else if (die <= 4)
			add_lord_service(lord, -2)
		else if (die <= 6)
			add_lord_service(lord, -3)
		log(`L${lord} ${HIT[die]}, shifted to ${get_lord_service(lord)}.`)
		set_delete(game.battle.retreated, lord)
		resume_battle_service()
	},
}*/

function end_battle_service() {
	goto_battle_losses_victor()
}

// === ENDING THE BATTLE: AFTERMATH ===

function goto_battle_aftermath() {
	set_active(game.battle.attacker)

	// Events
	discard_events("hold")

	// Recovery
	spend_all_actions()

	if (check_campaign_victory())
		return

	// Siege/Conquest
	if (game.march) {
		game.battle = 0
		march_with_group_3()
	} else {
		game.battle = 0
		resume_command()
	}
}

// === CAMPAIGN: FEED ===

function can_feed_from_shared(lord) {
	let loc = get_lord_locale(lord)
	return get_shared_assets(loc, PROV) > 0
}
function can_pay_from_shared(lord) {
	let loc = get_lord_locale(lord)
	return get_shared_assets(loc, COIN) > 0
}

function has_friendly_lord_who_must_feed() {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (is_lord_unfed(lord))
			return true
	return false
}

function goto_feed() {
	log_br()

	// Count how much food each lord needs
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
		if (get_lord_moved(lord)) {
			if (count_lord_all_forces(lord) >= 7)
				set_lord_unfed(lord, 2)
			else
				set_lord_unfed(lord, 1)
		} else {
			set_lord_unfed(lord, 0)
		}
	}

	if (has_friendly_lord_who_must_feed()) {
		game.state = "feed"
	} else {
		end_feed()
	}
}


states.feed = {
	inactive: "Feed",
	prompt() {
		view.prompt = "Feed: You must Feed Lords who Moved or Fought."

		let done = true

		prompt_held_event()

		// Feed from own mat
		if (done) {
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
				if (is_lord_unfed(lord)) {
					if (get_lord_assets(lord, PROV) > 0) {
						gen_action_prov(lord)
						done = false
					}
				}
			}
		}

		// Sharing
		if (done) {
			view.prompt = "Feed: You must Feed Lords with Shared Loot or Provender."
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
				if (is_lord_unfed(lord) && can_feed_from_shared(lord)) {
					gen_action_lord(lord)
					done = false
				}
			}
		}

		// Unfed
		if (done) {
			view.prompt = "Feed: You must shift the Service of any Unfed Lords."
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
				if (is_lord_unfed(lord)) {
				// TODO PILLAGE	gen_action_service_bad(lord)
				done = true
				}
			}
		}

		// All done!
		if (done) {
			view.prompt = "Feed: All done."
			view.actions.end_feed = 1
		}
	},
	prov(lord) {
		push_undo()
		add_lord_assets(lord, PROV, -1)
		feed_lord(lord)
	},
	lord(lord) {
		push_undo()
		game.who = lord
		game.state = "feed_lord_shared"
	},
	// TODO : PILLAGE
/*	service_bad(lord) {
		push_undo()
		add_lord_service(lord, -1)
		log(`Unfed L${lord} to ${get_lord_service(lord)}.`)
		set_lord_unfed(lord, 0)
	},*/
	end_feed() {
		push_undo()
		end_feed()
	},
	card: action_held_event,
}

function resume_feed_lord_shared() {
	if (!is_lord_unfed(game.who) || !can_feed_from_shared(game.who)) {
		game.who = NOBODY
		game.state = "feed"
	}
}

states.feed_lord_shared = {
	inactive: "Feed",
	prompt() {
		view.prompt = `Feed: You must Feed ${lord_name[game.who]} with Shared Loot or Provender.`
		let loc = get_lord_locale(game.who)
		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
			if (get_lord_locale(lord) === loc) {
				if (get_lord_assets(lord, PROV) > 0)
					gen_action_prov(lord)
			}
		}
	},
	prov(lord) {
		push_undo()
		add_lord_assets(lord, PROV, -1)
		feed_lord(game.who)
		resume_feed_lord_shared()
	},
}

function end_feed() {
	
	goto_remove_markers()
}

// === LEVY & CAMPAIGN: PAY ===

function can_pay_lord(lord) {
	let loc = get_lord_locale(lord)
	if (get_shared_assets(loc, COIN) > 0)
		return true
	return false
}

function has_friendly_lord_who_may_be_paid() {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (is_lord_on_map(lord) && can_pay_lord(lord))
			return true
	return false
}

function goto_pay() {
	log_br()
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
			if (count_lord_all_forces(lord) >= 13)
				set_lord_unfed(lord, 3)
			else if (count_lord_all_forces(lord) >= 7)
				set_lord_unfed(lord, 2)
			else
				set_lord_unfed(lord, 1)
		}
	game.state = "pay"
}

function resume_pay() {
	if (!can_pay_lord(game.who))
		game.who = NOBODY
}

states.pay = {
	inactive: "Pay",
	prompt() {
		view.prompt = "Pay: You must Pay your Lord's Troops"
		let done = true

		
	
		// Pay from own mat
		if (done) {
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
				if (is_lord_unfed(lord)) {
					if (get_lord_assets(lord, COIN) > 0) {
						gen_action_coin(lord)
						done = false
					}
				}
			}
		}

		// Sharing
		if (done) {
			view.prompt = "Pay: You must Pay Lords with Shared Coin."
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
				if (is_lord_unfed(lord) && can_pay_from_shared(lord)) {
					gen_action_lord(lord)
					done = false
				}
			}
		}

		// TODO : PILLAGE 
		// Unpaid
		if (done) {
			view.prompt = "Pay: You must Pillage and/or Disband."
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
				/* if (is_lord_unpaid(lord)) {
					gen_action_pillage(lord)
					done = false
				} */
			}
		}

		// All done!
		if (done) {
			view.prompt = "Pay: All done."
			view.actions.end_pay = 1
		}
	},
	coin(lord) {
		push_undo()
		add_lord_assets(lord, COIN, -1)
		pay_lord(lord)
	},
	lord(lord) {
		push_undo()
		game.who = lord
		game.state = "pay_lord_shared"
	},
	// TODO : PILLAGE
/*	service_bad(lord) {
		push_undo()
		add_lord_service(lord, -1)
		log(`Unfed L${lord} to ${get_lord_service(lord)}.`)
		set_lord_unfed(lord, 0)
	},*/
	end_pay() {
		push_undo()
		end_pay()
	},
	card: action_held_event,
}

function end_pay() {

	// NOTE: We can combine Pay & Disband steps because disband is mandatory only.
	game.who = NOBODY
	set_active_enemy()
	if (game.active === P2) {
		goto_pay()
	}	
	else
		goto_levy_muster()
	
//	goto_disband()
}

// === LEVY & CAMPAIGN: DISBAND ===

function has_friendly_lord_who_must_disband() {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
	return false
}

function goto_disband() {
	game.state = "disband"
	if (!has_friendly_lord_who_must_disband())
		end_disband()
}

function disband_lord(lord, permanently = false) {
	let here = get_lord_locale(lord)
	let turn = current_turn()

	if (permanently) {
		log(`Removed L${lord}.`)
		set_lord_locale(lord, NOWHERE)
		set_lord_service(lord, NEVER)
	}
	else {
		if (is_levy_phase())
			set_lord_cylinder_on_calendar(lord, turn + data.lords[lord].service)
		else
			set_lord_cylinder_on_calendar(lord, turn + data.lords[lord].service + 1)
		set_lord_service(lord, NEVER)
		log(`Disbanded L${lord} to ${get_lord_calendar(lord)}.`)
	}

	if (game.scenario === "Pleskau" || game.scenario === "Pleskau (Quickstart)") {
		if (is_russian_lord(lord))
			game.pieces.elr1 ++
		else
			game.pieces.elr2 ++
	}


	discard_lord_capability_n(lord, 0)
	discard_lord_capability_n(lord, 1)
	game.pieces.assets[lord] = 0
	game.pieces.forces[lord] = 0
	game.pieces.routed[lord] = 0

	set_lord_besieged(lord, 0)
	set_lord_moved(lord, 0)

	for (let v of data.lords[lord].vassals)
		game.pieces.vassals[v] = VASSAL_UNAVAILABLE
}

states.disband = {
	inactive: "Disband",
	prompt() {
		view.prompt = "Disband: You must Disband Lords at their Service limit."

		prompt_held_event()

		let done = true
		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
		}
		if (done)
			view.actions.end_disband = 1
	},
	service_bad(lord) {
		this.lord(lord)
	},
	lord(lord) {
		if (is_lord_besieged(lord) && can_ransom_lord_siege(lord)) {
			clear_undo()
			goto_ransom(lord)
		} else {
			push_undo()
			disband_lord(lord)
		}
	},
	end_disband() {
		end_disband()
	},
	card: action_held_event,
}

function end_ransom_disband() {
	// do nothing
}

function end_disband() {
	clear_undo()

	if (is_campaign_phase()) {
		if (check_campaign_victory())
			return
	}

	set_active_enemy()
	if (is_campaign_phase()) {
		if (is_active_command())
			goto_remove_markers()
		else
			goto_feed()
	} else {
		if (game.active === P1)
			goto_levy_muster()
		else
			goto_feed()
	}
}

// === CAMPAIGN: REMOVE MARKERS ===

function goto_remove_markers() {
	clear_lords_moved()
	goto_command_activation()
}

// === END CAMPAIGN: GROWTH ===
// TODO : PLANTAGENET GROW
function count_enemy_ravaged() {
	let n = 0
	for (let loc of game.pieces.ravaged)
		if (is_friendly_territory(loc))
			++n
	return n
}

function goto_grow() {
	game.count = count_enemy_ravaged() >> 1
	log_br()
	if (game.active === TEUTONS)
		log("Teutonic Growth")
	else
		log("Russian Growth")
	if (game.count === 0) {
		logi("Nothing")
		end_growth()
	} else {
		game.state = "growth"
	}
}

function end_growth() {
	set_active_enemy()
	if (game.active === P2)
		goto_grow()
	else
		goto_game_end()
}

states.growth = {
	inactive: "Grow",
	prompt() {
		view.prompt = `Grow: Remove ${game.count} enemy Ravaged markers.`
		if (game.count > 0) {
			for (let loc of game.pieces.ravaged)
				if (is_friendly_territory(loc))
					gen_action_locale(loc)
		} else {
			view.actions.end_growth = 1
		}
	},
	locale(loc) {
		push_undo()
		logi(`%${loc}`)
		remove_ravaged_marker(loc)
		game.count--
	},
	end_growth() {
		clear_undo()
		end_growth()
	},
}

// === END CAMPAIGN: GAME END ===

function check_campaign_victory_york() {
	for (let lord = first_lancaster_lord; lord <= last_lancaster_lord; ++lord)
		if (is_lord_on_map(lord))
			return false
	return true
}

function check_campaign_victory_lancaster() {
	for (let lord = first_york_lord; lord <= last_york_lord; ++lord)
		if (is_lord_on_map(lord))
			return false
	return true
}

function check_campaign_victory() {
	if (check_campaign_victory_york()) {
		goto_game_over(P1, `${P1} won a Campaign Victory!`)
		return true
	}
	if (check_campaign_victory_lancaster()) {
		goto_game_over(P2, `${P2} won a Campaign Victory!`)
		return true
	}
	return false
}

function goto_end_campaign() {
	log_h1("End Campaign")

	set_active(P1)

	if (current_turn() === 8 || current_turn() === 16) {
		goto_grow()
	} else {
		goto_game_end()
	}
}

function goto_game_end() {
	// GAME END
	if (current_turn() === scenario_last_turn[game.scenario]) {
		goto_game_over("Draw", "The game ended in a draw.")
	} else {
		goto_plow_and_reap()
	}
}

// === END CAMPAIGN: PLOW AND REAP ===

function goto_plow_and_reap() {
	let turn = current_turn()
	end_plow_and_reap()
}

function end_plow_and_reap() {
	goto_wastage()
}

// === END CAMPAIGN: WASTAGE ===
// TODO : WASTE
function goto_wastage() {
	if (game.turn === 5 || game.turn === 10) {
	clear_lords_moved()
	let done = true
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
		if (check_lord_wastage(lord)) {
			set_lord_moved(lord, 3)
			done = false
		}
	}
	if (done)
		end_wastage()
	else
		game.state = "wastage"
}
	else {
		push_undo()
		goto_reset()
	}
}

function check_lord_wastage(lord) {
	if (get_lord_assets(lord, PROV) > 1)
		return true
	if (get_lord_assets(lord, COIN) > 1)
		return true
	if (get_lord_assets(lord, CART) > 1)
		return true
	if (get_lord_assets(lord, SHIP) > 1)
		return true
	return false
}

function prompt_wastage(lord) {
	if (get_lord_assets(lord, PROV) > 0)
		gen_action_prov(lord)
	if (get_lord_assets(lord, COIN) > 0)
		gen_action_coin(lord)
	if (get_lord_assets(lord, CART) > 0)
		gen_action_cart(lord)
	if (get_lord_assets(lord, SHIP) > 0)
		gen_action_ship(lord)
	for (let i = 0; i < 2; ++i) {
		let c = get_lord_capability(lord, i)
		if (c !== NOTHING)
			gen_action_card(c)
	}
}

function action_wastage(lord, type) {
	push_undo()
	set_lord_moved(lord, 0)
	add_lord_assets(lord, type, -1)
}

function find_lord_with_capability_card(c) {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (lord_has_capability_card(lord, c))
			return lord
	return NOBODY
}

states.wastage = {
	inactive: "Wastage",
	prompt() {
		let done = true
		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
			if (get_lord_moved(lord)) {
				prompt_wastage(lord)
				done = false
			}
		}
		if (done) {
			view.prompt = "Wastage: All done."
			view.actions.end_wastage = 1
		} else {
			view.prompt = "Wastage: Discard one Asset or Capability from each affected Lord."
		}
	},
	card(c) {
		push_undo()
		let lord = find_lord_with_capability_card(c)
		set_lord_moved(lord, 0)
		discard_lord_capability(lord, c)
	},
	prov(lord) { action_wastage(lord, PROV) },
	coin(lord) { action_wastage(lord, COIN) },
	cart(lord) { action_wastage(lord, CART) },
	ship(lord) { action_wastage(lord, SHIP) },
	end_wastage() {
		end_wastage()
	},
}

function end_wastage() {
	push_undo()
	set_active_enemy()
	goto_reset()
}

// === END CAMPAIGN: RESET (DISCARD ARTS OF WAR) ===

function goto_reset() {

	// Discard "This Campaign" events from play.
	discard_friendly_events("this_campaign")
	end_reset()
}

function end_reset() {
	clear_undo()
	set_active_enemy()
	if (game.active === P2)
		goto_plow_and_reap()
	else
		goto_advance_campaign()
}

// === END CAMPAIGN: RESET (ADVANCE CAMPAIGN) ===

function goto_advance_campaign() {
	game.turn++

	log_h1("Levy " + current_turn_name())

	// First turns of late winter
	if (current_turn() === 5 || current_turn() === 13)
		goto_discard_crusade_late_winter()
	else
		goto_levy_arts_of_war()
}

// === GAME OVER ===

function goto_game_over(result, victory) {
	game.state = "game_over"
	game.active = "None"
	game.result = result
	game.victory = victory
	log_h1("Game Over")
	log(game.victory)
	return true
}

states.game_over = {
	get inactive() {
		return game.victory
	},
	prompt() {
		view.prompt = game.victory
	},
}

exports.resign = function (state, current) {
	load_state(state)
	if (game.state !== "game_over") {
		for (let opponent of exports.roles) {
			if (opponent !== current) {
				goto_game_over(opponent, current + " resigned.")
				break
			}
		}
	}
	return game
}

// === UNCOMMON TEMPLATE ===

function log_br() {
	if (game.log.length > 0 && game.log[game.log.length - 1] !== "")
		game.log.push("")
}

function log(msg) {
	game.log.push(msg)
}

function logevent(cap) {
	game.log.push(`E${cap}.`)
}

function logcap(cap) {
	game.log.push(`C${cap}.`)
}

function logi(msg) {
	game.log.push(">" + msg)
}

function logii(msg) {
	game.log.push(">>" + msg)
}

function log_h1(msg) {
	log_br()
	log(".h1 " + msg)
	log_br()
}

function log_h2(msg) {
	log_br()
	if (game.active === YORK)
		log(".h2t " + msg)
	else
		log(".h2r " + msg)
	log_br()
}

function log_h3(msg) {
	log_br()
	if (game.active === YORK)
		log(".h3t " + msg)
	else
		log(".h3r " + msg)
	log_br()
}

function log_h4(msg) {
	log_br()
	log(".h4 " + msg)
}

function log_h5(msg) {
	log_br()
	log(".h5 " + msg)
}

function gen_action(action, argument) {
	if (!(action in view.actions))
		view.actions[action] = []
	set_add(view.actions[action], argument)
}

function gen_action_card_if_held(c) {
	if (has_card_in_hand(c))
		gen_action_card(c)
}

function prompt_select_lord_on_calendar(lord) {
	if (lord !== game.who) {
		if (is_lord_on_calendar(lord))
			gen_action_lord(lord)
		else
			gen_action_service(lord)
	}
}

function prompt_select_lord(lord) {
	if (lord !== game.who)
		gen_action_lord(lord)
}

function prompt_select_service(lord) {
	if (lord !== game.who)
		gen_action_service(lord)
}

function action_select_lord(lord) {
	if (game.who === lord)
		game.who = NOBODY
	else
		game.who = lord
}

function gen_action_calendar(calendar) {
	if (calendar < 0)
		calendar = 0
	if (calendar > 17)
		calendar = 17
	gen_action("calendar", calendar)
}

function gen_action_way(way) {
	gen_action("way", way)
}

function gen_action_locale(locale) {
	gen_action("locale", locale)
}

function gen_action_laden_march(locale) {
	gen_action("laden_march", locale)
}

function gen_action_lord(lord) {
	gen_action("lord", lord)
}

function gen_action_array(pos) {
	gen_action("array", pos)
}

function gen_action_service(service) {
	gen_action("service", service)
}

function gen_action_service_bad(service) {
	gen_action("service_bad", service)
}

function gen_action_vassal(vassal) {
	gen_action("vassal", vassal)
}

function gen_action_card(c) {
	gen_action("card", c)
}

function gen_action_plan(lord) {
	gen_action("plan", lord)
}

function gen_action_prov(lord) {
	gen_action("prov", lord)
}

function gen_action_coin(lord) {
	gen_action("coin", lord)
}

function gen_action_cart(lord) {
	gen_action("cart", lord)
}

function gen_action_ship(lord) {
	gen_action("ship", lord)
}

function gen_action_knights(lord) {
	gen_action("knights", lord)
}

function gen_action_sergeants(lord) {
	gen_action("sergeants", lord)
}

function gen_action_light_horse(lord) {
	gen_action("light_horse", lord)
}

function gen_action_asiatic_horse(lord) {
	gen_action("asiatic_horse", lord)
}

function gen_action_men_at_arms(lord) {
	gen_action("men_at_arms", lord)
}

function gen_action_militia(lord) {
	gen_action("militia", lord)
}

function gen_action_serfs(lord) {
	gen_action("serfs", lord)
}

function gen_action_routed_knights(lord) {
	gen_action("routed_knights", lord)
}

function gen_action_routed_sergeants(lord) {
	gen_action("routed_sergeants", lord)
}

function gen_action_routed_light_horse(lord) {
	gen_action("routed_light_horse", lord)
}

function gen_action_routed_asiatic_horse(lord) {
	gen_action("routed_asiatic_horse", lord)
}

function gen_action_routed_men_at_arms(lord) {
	gen_action("routed_men_at_arms", lord)
}

function gen_action_routed_militia(lord) {
	gen_action("routed_militia", lord)
}

function gen_action_routed_serfs(lord) {
	gen_action("routed_serfs", lord)
}

const P1_LORD_MASK = 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048
const P2_LORD_MASK = P1_LORD_MASK << 6

exports.view = function (state, current) {
	load_state(state)

	view = {
		prompt: null,
		actions: null,
		log: game.log,
		reveal: 0,

		end: scenario_last_turn[game.scenario],
		turn: game.turn,
		victory_check: game.victory_check,
		townl: game.townl,
		towny: game.townl,
		fortressl: game.fortressl,
		fortressy: game.fortressy,
		citiesl: game.citiesl,
		citiesy: game.citiesy,
		influence_point_l: game.influence_point_l,
		influence_point_y: game.influence_point_y,


		events: game.events,
		pieces: game.pieces,
		battle: game.battle,


		held1: game.hand1.length,
		held2: game.hand2.length,

		command: game.command,
		hand: null,
		plan: null,
	}

	if (!game.hidden)
		view.reveal = -1

	if (current === YORK) {
		view.hand = game.hand1
		view.plan = game.plan1
		if (game.hidden)
			view.reveal |= P1_LORD_MASK
	}
	if (current === LANCASTER) {
		view.hand = game.hand2
		view.plan = game.plan2
		if (game.hidden)
			view.reveal |= P2_LORD_MASK
	}

	if (game.battle) {
		if (game.battle.array) {
			for (let lord of game.battle.array)
				if (lord !== NOBODY)
					view.reveal |= (1 << lord)
		}
		for (let lord of game.battle.reserves)
			view.reveal |= (1 << lord)
	}

	if (game.state === "game_over") {
		view.prompt = game.victory
	} else if (current === "Observer" || (game.active !== current && game.active !== BOTH)) {
		let inactive = states[game.state].inactive || game.state
		view.prompt = `Waiting for ${game.active} \u2014 ${inactive}.`
	} else {
		view.actions = {}
		view.who = game.who
		if (states[game.state])
			states[game.state].prompt(current)
		else
			view.prompt = "Unknown state: " + game.state
		if (view.actions.undo === undefined) {
			if (game.undo && game.undo.length > 0)
				view.actions.undo = 1
			else
				view.actions.undo = 0
		}
	}
	return view
}

exports.action = function (state, current, action, arg) {
	load_state(state)
	// Object.seal(game) // XXX: don't allow adding properties
	let S = states[game.state]
	if (S && action in S) {
		S[action](arg, current)
	} else {
		if (action === "undo" && game.undo && game.undo.length > 0)
			pop_undo()
		else
			throw new Error("Invalid action: " + action)
	}
	return game
}

exports.is_checkpoint = function (a, b) {
	return a.turn !== b.turn
}

// === COMMON TEMPLATE ===

// Packed array of small numbers in one word

function pack1_get(word, n) {
	return (word >>> n) & 1
}

function pack2_get(word, n) {
	n = n << 1
	return (word >>> n) & 3
}

function pack4_get(word, n) {
	n = n << 2
	return (word >>> n) & 15
}

function pack1_set(word, n, x) {
	return (word & ~(1 << n)) | (x << n)
}

function pack2_set(word, n, x) {
	n = n << 1
	return (word & ~(3 << n)) | (x << n)
}

function pack4_set(word, n, x) {
	n = n << 2
	return (word & ~(15 << n)) | (x << n)
}

// === COMMON LIBRARY ===

function clear_undo() {
	if (game.undo.length > 0)
		game.undo = []
}

function push_undo_without_who() {
	let save_who = game.who
	game.who = NOBODY
	push_undo()
	game.who = save_who
}

function push_undo() {
	let copy = {}
	for (let k in game) {
		let v = game[k]
		if (k === "undo")
			continue
		else if (k === "log")
			v = v.length
		else if (typeof v === "object" && v !== null)
			v = object_copy(v)
		copy[k] = v
	}
	game.undo.push(copy)
}

function pop_undo() {
	let save_log = game.log
	let save_undo = game.undo
	game = save_undo.pop()
	save_log.length = game.log
	game.log = save_log
	game.undo = save_undo
}

function random(range) {
	// An MLCG using integer arithmetic with doubles.
	// https://www.ams.org/journals/mcom/1999-68-225/S0025-5718-99-00996-5/S0025-5718-99-00996-5.pdf
	// m = 2**35 − 31
	return (game.seed = (game.seed * 200105) % 34359738337) % range
}

// Fast deep copy for objects without cycles
function object_copy(original) {
	if (Array.isArray(original)) {
		let n = original.length
		let copy = new Array(n)
		for (let i = 0; i < n; ++i) {
			let v = original[i]
			if (typeof v === "object" && v !== null)
				copy[i] = object_copy(v)
			else
				copy[i] = v
		}
		return copy
	} else {
		let copy = {}
		for (let i in original) {
			let v = original[i]
			if (typeof v === "object" && v !== null)
				copy[i] = object_copy(v)
			else
				copy[i] = v
		}
		return copy
	}
}

// Array remove and insert (faster than splice)

function array_remove_item(array, item) {
	let n = array.length
	for (let i = 0; i < n; ++i)
		if (array[i] === item)
			return array_remove(array, i)
}

function array_remove(array, index) {
	let n = array.length
	for (let i = index + 1; i < n; ++i)
		array[i - 1] = array[i]
	array.length = n - 1
}

function array_insert(array, index, item) {
	for (let i = array.length; i > index; --i)
		array[i] = array[i - 1]
	array[index] = item
}

function array_remove_pair(array, index) {
	let n = array.length
	for (let i = index + 2; i < n; ++i)
		array[i - 2] = array[i]
	array.length = n - 2
}

function array_insert_pair(array, index, key, value) {
	for (let i = array.length; i > index; i -= 2) {
		array[i] = array[i - 2]
		array[i + 1] = array[i - 1]
	}
	array[index] = key
	array[index + 1] = value
}

// Set as plain sorted array

function set_has(set, item) {
	let a = 0
	let b = set.length - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = set[m]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else
			return true
	}
	return false
}

function set_add(set, item) {
	let a = 0
	let b = set.length - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = set[m]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else
			return
	}
	array_insert(set, a, item)
}

function set_delete(set, item) {
	let a = 0
	let b = set.length - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = set[m]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else {
			array_remove(set, m)
			return
		}
	}
}

function set_toggle(set, item) {
	let a = 0
	let b = set.length - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = set[m]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else {
			array_remove(set, m)
			return
		}
	}
	array_insert(set, a, item)
}

// Map as plain sorted array of key/value pairs

function map_has(map, key) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m << 1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else
			return true
	}
	return false
}

function map_get(map, key, missing) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m << 1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else
			return map[(m << 1) + 1]
	}
	return missing
}

function map_set(map, key, value) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m << 1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else {
			map[(m << 1) + 1] = value
			return
		}
	}
	array_insert_pair(map, a << 1, key, value)
}

function map_delete(map, item) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m << 1]
		if (item < x)
			b = m - 1
		else if (item > x)
			a = m + 1
		else {
			array_remove_pair(map, m << 1)
			return
		}
	}
}
