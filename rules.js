"use strict"

const data = require("./data.js")

const BOTH = "Both"
const LANCASTER = "Lancaster"
const YORK = "York"

var P1 = LANCASTER
var P2 = YORK

const INFLUENCE_TURNS = [ 1, 4, 6, 9, 11, 14 ]
const GROW_TURNS = [ 4, 9, 14 ]
const WASTE_TURNS = [ 5, 10 ]

const HIT = [ "0", "\u2776", "\u2777", "\u2778", "\u2779", "\u277A", "\u277B" ]
const MISS = [ "0", "\u2460", "\u2461", "\u2462", "\u2463", "\u2464", "\u2465" ]

function frac(x) {
	if (x === 1)
		return "\xbd"
	if (x & 1)
		return (x >> 1) + "\xbd"
	return x >> 1
}

function range(x) {
	switch (x) {
	case 0: return "0"
	case 1: return "1"
	case 2: return "1-2"
	case 3: return "1-3"
	case 4: return "1-4"
	case 5: return "1-5"
	case 6: return "Automatic success"
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

const FORCE_TYPE_COUNT = 7
const FORCE_TYPE_NAME = [ "Retinue", "Vassal", "Men-at-Arms", "Longbowmen", "Militia", "Burgundians", "Mercenary" ]
const FORCE_PROTECTION = [ 4, 4, 3, 1, 1, 3, 3 ]

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

function find_card(name) {
	let ix = data.cards.findIndex(x => x.name === name)
	if (ix < 0)
		throw "CANNOT FIND LORD: " + name
	return ix
}

function find_lord(name) {
	let ix = data.lords.findIndex(x => x.name === name)
	if (ix < 0)
		throw "CANNOT FIND LORD: " + name
	return ix
}

function find_locale(name) {
	let ix = data.locales.findIndex(x => x.name === name)
	if (ix < 0)
		throw "CANNOT FIND LORD: " + name
	return ix
}

function find_vassal(name) {
	let ix = data.vassals.findIndex(x => x.name === name)
	if (ix < 0)
		throw "CANNOT FIND VASSAL: " + name
	return ix
}

const lord_name = data.lords.map(lord => lord.name)

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

const first_vassal = 0
const last_vassal = vassal_count - 1

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

const VASSAL_BEAUMONT = find_vassal("Beaumont")
const VASSAL_BONVILLE = find_vassal("Bonville")
const VASSAL_DEVON = find_vassal("Devon")
const VASSAL_DUDLEY = find_vassal("Dudley")
const VASSAL_ESSEX = find_vassal("Essex")
const VASSAL_FAUCONBERG = find_vassal("Fauconberg")
const VASSAL_NORFOLK = find_vassal("Norfolk")
const VASSAL_OXFORD = find_vassal("Oxford")
const VASSAL_SHREWSBURY = find_vassal("Shrewsbury")
const VASSAL_STANLEY = find_vassal("Stanley")
const VASSAL_SUFFOLK = find_vassal("Suffolk")
const VASSAL_WESTMORLAND = find_vassal("Westmoreland")
const VASSAL_WORCESTER = find_vassal("Worcester")
const VASSAL_CLIFFORD = find_vassal("Clifford")
const VASSAL_EDWARD = find_vassal("Edward")
const VASSAL_HASTINGS = find_vassal("Hastings")
const VASSAL_MONTAGU = find_vassal("Montagu")
const VASSAL_THOMAS_STANLEY = find_vassal("Thomas Stanley")
const VASSAL_TROLLOPE = find_vassal("Trollope")

const SEAS = [ LOC_NORTH_SEA, LOC_IRISH_SEA, LOC_ENGLISH_CHANNEL ]

// === === === === FROM NEVSKY === === === ===

// TODO: log end victory conditions at scenario start

const AOW_LANCASTER_CULVERINS_AND_FALCONETS = [ L1, L2 ] // TODO
const AOW_LANCASTER_MUSTERD_MY_SOLDIERS = L3 // TODO
const AOW_LANCASTER_HERALDS = L4 // TODO
const AOW_LANCASTER_CHURCH_BLESSINGS = L5
const AOW_LANCASTER_GREAT_SHIPS = L6 // TODO
const AOW_LANCASTER_HARBINGERS = L7
const AOW_LANCASTER_HAY_WAINS = L8
const AOW_LANCASTER_QUARTERMASTERS = L9
const AOW_LANCASTER_CHAMBERLAINS = L10 // TODO
const AOW_LANCASTER_IN_THE_NAME_OF_THE_KING = L11
const AOW_LANCASTER_COMMISION_OF_ARRAY = L12 // TODO
const AOW_LANCASTER_EXPERT_COUNSELLORS = L13
const AOW_LANCASTER_PERCYS_POWER = L14
const AOW_LANCASTER_KINGS_PARLEY = L15 // TODO
const AOW_LANCASTER_NORTHMEN = L16
const AOW_LANCASTER_MARGARET = L17
const AOW_LANCASTER_COUNCIL_MEMBER = L18
const AOW_LANCASTER_ANDREW_TROLLOPE = L19
const AOW_LANCASTER_VETERAN_OF_FRENCH_WARS = L20
const AOW_LANCASTER_MY_FATHERS_BLOOD = L21
const AOW_LANCASTER_STAFFORD_ESTATES = L22
const AOW_LANCASTER_MONTAGU = L23
const AOW_LANCASTER_MARRIED_TO_A_NEVILLE = L24
const AOW_LANCASTER_WELSH_LORD = L25 // TODO
const AOW_LANCASTER_EDWARD = L26
const AOW_LANCASTER_BARDED_HORSE = L27
const AOW_LANCASTER_LOYAL_SOMERSET = L28
const AOW_LANCASTER_HIGH_ADMIRAL = L29
const AOW_LANCASTER_MERCHANTS = L30 // TODO
const AOW_LANCASTER_YEOMEN_OF_THE_CROWN = L31 // TODO
const AOW_LANCASTER_TWO_ROSES = L32
const AOW_LANCASTER_PHILIBERT_DE_CHANDEE = L33 // TODO
const AOW_LANCASTER_PIQUIERS = L34 // TODO
const AOW_LANCASTER_THOMAS_STANLEY = L35
const AOW_LANCASTER_CHEVALIERS = L36
const AOW_LANCASTER_MADAME_LA_GRANDE = L37 // TODO

const AOW_YORK_CULVERINS_AND_FALCONETS = [ Y1, Y2 ] // TODO
const AOW_YORK_MUSTERD_MY_SOLDIERS = Y3 // TODO
const AOW_YORK_WE_DONE_DEEDS_OF_CHARITY = Y4 // TODO
const AOW_YORK_THOMAS_BOURCHIER = Y5
const AOW_YORK_GREAT_SHIPS = Y6 // TODO
const AOW_YORK_HARBINGERS = Y7
const AOW_YORK_ENGLAND_IS_MY_HOME = Y8 // TODO
const AOW_YORK_BARRICADES = Y9
const AOW_YORK_AGITATORS = Y10 // TODO
const AOW_YORK_YORKISTS_NEVER_WAIT = Y11
const AOW_YORK_SOLDIERS_OF_FORTUNE = Y12 // TODO
const AOW_YORK_SCOURERS = Y13
const AOW_YORK_BURGUNDIANS = [ Y14, Y23 ] // TODO
const AOW_YORK_NAVAL_BLOCKADE = Y15 // TODO
const AOW_YORK_BELOVED_WARWICK = Y16 // TODO
const AOW_YORK_ALICE_MONTAGU = Y17
const AOW_YORK_IRISHMEN = Y18 // TODO
const AOW_YORK_WELSHMEN = Y19
const AOW_YORK_YORKS_FAVOURED_SON = Y20
const AOW_YORK_SOUTHERNERS = Y21
const AOW_YORK_FAIR_ARBITER = Y22
const AOW_YORK_HASTINGS = Y24
const AOW_YORK_PEMBROKE = Y25 // TODO
const AOW_YORK_FALLEN_BROTHER = Y26
const AOW_YORK_PERCYS_NORTH1 = Y27 // TODO
const AOW_YORK_FIRST_SON = Y28
const AOW_YORK_STAFFORD_BRANCH = Y29 // TODO
const AOW_YORK_CAPTAIN = Y30
const AOW_YORK_WOODWILLES = Y31
const AOW_YORK_FINAL_CHARGE = Y32 // TODO
const AOW_YORK_BLOODY_THOU_ART = Y33 // TODO
const AOW_YORK_SO_WISE_SO_YOUNG = Y34
const AOW_YORK_KINGDOM_UNITED = Y35 // TODO
const AOW_YORK_VANGUARD = Y36 // TODO
const AOW_YORK_PERCYS_NORTH2 = Y37 // TODO

const EVENT_LANCASTER_LEEWARD_BATTLE_LINE = L1 // TODO
const EVENT_LANCASTER_FLANK_ATTACK = L2 // TODO
const EVENT_LANCASTER_ESCAPE_SHIP = L3 // TODO
const EVENT_LANCASTER_BE_SENT_FOR = L4 // TODO
const EVENT_LANCASTER_SUSPICION = L5 // TODO
const EVENT_LANCASTER_SEAMANSHIP = L6 // TODO
const EVENT_LANCASTER_FOR_TRUST_NOT_HIM = L7 // TODO
const EVENT_LANCASTER_FORCED_MARCHES = L8 // TODO
const EVENT_LANCASTER_RISING_WAGES = L9 // TODO
const EVENT_LANCASTER_NEW_ACT_OF_PARLIAMENT = L10 // TODO
const EVENT_LANCASTER_BLOCKED_FORD = L11 // TODO
const EVENT_LANCASTER_RAVINE = L12 // TODO
const EVENT_LANCASTER_ASPIELLES = L13 // TODO
const EVENT_LANCASTER_SCOTS = L14 // TODO
const EVENT_LANCASTER_HENRY_PRESSURES_PARLIAMENT = L15 // TODO
const EVENT_LANCASTER_WARDEN_OF_THE_MARCHES = L16	 // TODO
const EVENT_LANCASTER_MY_CROWN_IS_IN_MY_HEART = L17 // TODO
const EVENT_LANCASTER_PARLIAMENT_VOTES = L18 // TODO
const EVENT_LANCASTER_HENRYS_PROCLAMATION = L19 // TODO
const EVENT_LANCASTER_PARLIAMEN_TRUCE = L20 // TODO
const EVENT_LANCASTER_FRENCH_FLEET = L21 // TODO
const EVENT_LANCASTER_FRENCH_TROOPS = L22 // TODO
const EVENT_LANCASTER_WARWICKS_PROPAGANDA = [ L23, L24 ] // TODO
const EVENT_LANCASTER_WELSH_REBELLION = L25 // TODO
const EVENT_LANCASTER_HENRY_RELEASED = L26 // TODO
const EVENT_LANCASTER_LUNIVERSELLE_ARAGNE = L27 // TODO
const EVENT_LANCASTER_REBEL_SUPPLY_DEPOT = L28 // TODO
const EVENT_LANCASTER_TO_WILFUL_DISOBEDIANCE = L29 // TODO
const EVENT_LANCASTER_FRENCH_WAR_LOANS = L30 // TODO
const EVENT_LANCASTER_ROBINS_REBELLION = L31 // TODO
const EVENT_LANCASTER_TUDOR_BANNERS = L32 // TODO
const EVENT_LANCASTER_SURPRISE_LANDING = L33 // TODO
const EVENT_LANCASTER_BUCKINGHAMS_PLOT = L34 // TODO
const EVENT_LANCASTER_MARGARET_BEAUFORT = L35 // TODO
const EVENT_LANCASTER_TALBOT_TO_THE_RESCUE = L36 // TODO
const EVENT_LANCASTER_THE_EARL_OF_RICHMOND = L37 // TODO

const EVENT_YORK_LEEWARD_BATTLE_LINE = Y1 // TODO
const EVENT_YORK_FLANK_ATTACK = Y2 // TODO
const EVENT_YORK_ESCAPE_SHIP = [ Y3, Y9 ] // TODO
const EVENT_YORK_JACK_CADE = Y4 // TODO
const EVENT_YORK_SUSPICION = Y5 // TODO
const EVENT_YORK_SEAMANSHIP = Y6 // TODO
const EVENT_YORK_YORKISTS_BLOCK_PARLIAMENT = Y7 // TODO
const EVENT_YORK_EXILE_PACT = Y8 // TODO
const EVENT_YORK_TAX_COLLECTORS = Y10 // TODO
const EVENT_YORK_BLOCKED_FORD = Y11 // TODO
const EVENT_YORK_PARLIAMENTS_TRUCE = Y12 // TODO
const EVENT_YORK_ASPIELLES = Y13 // TODO
const EVENT_YORK_RICHARD_OF_YORK = Y14 // TODO
const EVENT_YORK_LONDON_FOR_YORK = Y15 // TODO
const EVENT_YORK_THE_COMMONS = Y16	 // TODO
const EVENT_YORK_SHEWOLF_OF_FRANCE = Y17 // TODO
const EVENT_YORK_SUCCESSION = Y18 // TODO
const EVENT_YORK_CALTROPS = Y19 // TODO
const EVENT_YORK_YORKIST_PARADE = Y20 // TODO
const EVENT_YORK_SIR_RICHARD_LEIGH = Y21 // TODO
const EVENT_YORK_LOYALTY_AND_TRUST = Y22 // TODO
const EVENT_YORK_CHARLES_THE_BOLD = Y23 // TODO
const EVENT_YORK_SUN_IN_SPLENDOUR = Y24 // TODO
const EVENT_YORK_OWAIN_GLYNDWR = Y25 // TODO
const EVENT_YORK_DUBIOUS_CLARENCE = Y26 // TODO
const EVENT_YORK_YORKIST_NORTH = Y27 // TODO
const EVENT_YORK_GLOUCESTER_AS_HEIR = Y28 // TODO
const EVENT_YORK_DORSET = Y29 // TODO
const EVENT_YORK_REGROUP = Y30 // TODO
const EVENT_YORK_EARL_RIVERS = Y31 // TODO
const EVENT_YORK_THE_KINGS_NAME = Y32 // TODO
const EVENT_YORK_EDWARD_V = Y33 // TODO
const EVENT_YORK_AN_HONEST_TALE_SPEEDS_BEST = Y34 // TODO
const EVENT_YORK_PRIVY_COUNCIL = Y35 // TODO
const EVENT_YORK_SWIFT_MANEUVER = Y36 // TODO
const EVENT_YORK_PATRICK_DE_LA_MOTE = Y37 // TODO

// Check all push/clear_undo

const VASSAL_UNAVAILABLE = 201
const VASSAL_READY = 200
//const VASSAL_MUSTERED = -3

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
	null,
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
	P1 = game.rebel
	P2 = game.crown
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
	if (track_value > 45)
		track_value = 45
	set_lord_locale(item, TRACK + track_value)
}

function get_lord_calendar(lord) {
	if (is_lord_on_calendar(lord))
		return get_lord_locale(lord) - CALENDAR
	/*else
		return get_lord_service(lord)*/
}

function set_lord_cylinder_on_calendar(lord, turn) {
	if (turn < 1)
		turn = 1
	if (turn > 16)
		turn = 16
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
	if (game.pieces.forces[lord] !== 0)
		return true
	let result = false
	for_each_vassal_with_lord(lord, v => {
		if (!set_has(game.battle.routed_vassals[lord], v))
			result = true
	})
	return result
}

function lord_has_routed_units(lord) {
	return (
		game.pieces.routed[lord] !== 0 || game.battle.routed_vassals[lord].length > 0
	)
}

function rout_vassal(lord, vassal) {
	set_add(game.battle.routed_vassals[lord], vassal)
}

function set_lord_locale(lord, locale) {
	game.pieces.locale[lord] = locale
}

function get_force_name(lord, n, x) {
	if (n === RETINUE) {
		return `${lord_name[lord]}'s Retinue`
	} else if (n === VASSAL) {
		return `Vassal ${data.vassals[x].name}`
	}
	return FORCE_TYPE_NAME[n]
}

function shift_lord_cylinder(lord, dir) {
	set_lord_calendar(lord, get_lord_calendar(lord) + dir)
}

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
	let m = 0
	let n = 0
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
		if (get_lord_locale(lord) === loc)
			n += get_lord_assets(lord, what)
		if (game.state === "supply_source" && lord_has_capability(lord, AOW_LANCASTER_HAY_WAINS) && what === CART) {
			m = get_lord_assets(lord, CART)
			n += m
		}
	}
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

function count_group_assets(type, group = game.group) {
	let n = 0
	for (let lord of group) {
		n += get_lord_assets(lord, type)
		if (
			(game.state === "command" || game.state === "march_laden") &&
			lord_has_capability(lord, AOW_LANCASTER_HAY_WAINS) &&
			type === CART
		)
			n += get_lord_assets(lord, CART)
	}
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

function count_lord_transport(lord) {
	return get_lord_assets(lord, CART)
}

function count_group_transport(group = game.group) {
	let n = 0
	for (let lord of group)
		n += count_lord_transport(lord)
	return n
}

function count_group_lords() {
	let n = 0
	for (let lord of game.group)
		n += 1
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
	let first_card = game.active === YORK ? first_york_card : first_lancaster_card
	let last_card = game.active === YORK ? last_york_card : last_lancaster_card
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

function setup_vassals(excludes = []) {
	for (let x = first_vassal; x < last_vassal; x++) {
		if (!excludes.includes(x) && data.vassals[x].capability === undefined) {
			set_vassal_ready(x)
			set_vassal_on_map(x, data.vassals[x].seat[0])
		}
	}
}

function set_vassal_on_map(vassal, loc) {
	game.pieces.vassals[vassal] = pack8_set(game.pieces.vassals[vassal], 1, loc)
}

function get_vassal_locale(vassal) {
	return pack8_get(game.pieces.vassals[vassal], 1)
}

function for_each_vassal_with_lord(lord, f) {
	for (let x = first_vassal; x < last_vassal; x++)
		if (pack8_get(game.pieces.vassals[x], 0) === lord)
			f(x)
}

function count_vassals_with_lord(lord) {
	let n = 0
	for_each_vassal_with_lord(lord, v => {
		++n
	})
	return n
}

function get_lord_with_vassal(vassal) {
	return pack8_get(game.pieces.vassals[vassal], 0)
}

function set_vassal_ready(vassal) {
	game.pieces.vassals[vassal] = pack8_set(game.pieces.vassals[vassal], 0, VASSAL_READY)
}

function set_vassal_on_calendar(vassal, turn) {
	game.pieces.vassals[vassal] = pack8_set(game.pieces.vassals[vassal], 1, turn + CALENDAR)
}

function set_vassal_with_lord(vassal, lord) {
	game.pieces.vassals[vassal] = pack8_set(game.pieces.vassals[vassal], 0, lord)
}

function set_vassal_unavailable(vassal) {
	game.pieces.vassals[vassal] = pack8_set(game.pieces.vassals[vassal], 0, VASSAL_UNAVAILABLE)
}

function muster_vassal(vassal, lord) {
	set_vassal_with_lord(vassal, lord)
	if (data.vassals[vassal].service !== 0 && lord_has_capability(lord, AOW_YORK_ALICE_MONTAGU))
		set_vassal_on_calendar(vassal, current_turn() + (1 + data.vassals[vassal].service))
	else if (data.vassals[vassal].service !== 0)
		set_vassal_on_calendar(vassal, current_turn() + data.vassals[vassal].service)
}

function disband_vassal(vassal) {
	let new_turn = current_turn() + (6 - data.vassals[vassal].service)
	set_vassal_unavailable(vassal)
	set_vassal_on_calendar(vassal, new_turn)
	log(`Disbanded V${vassal} to turn ${current_turn() + (6 - data.vassals[vassal].service)}.`)
}

function pay_vassal(vassal) {
	if (current_turn() < 15)
		set_vassal_on_calendar(vassal, current_turn() + 1)
}

function get_ready_vassals() {
	let favor = game.active === YORK ? game.pieces.favoury : game.pieces.favourl
	let results = []

	for (let x = first_vassal; x < last_vassal; x++) {
		if (is_vassal_ready(x) && favor.includes(data.vassals[x].seat[0])) {
			results.push(x)
		}
	}

	return results
}

function is_vassal_unavailable(vassal) {
	return pack8_get(game.pieces.vassals[vassal], 0) === VASSAL_UNAVAILABLE
}

function is_vassal_ready(vassal) {
	return pack8_get(game.pieces.vassals[vassal], 0) === VASSAL_READY
}

function is_vassal_mustered(vassal) {
	return pack8_get(game.pieces.vassals[vassal]) < VASSAL_READY
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

function has_locale_to_muster(lord) {
	if (!has_enemy_lord(data.lords[lord].seats[0]))
		return true

	for (let l = first_friendly_lord; l <= last_friendly_lord; l++) {
		if (is_lord_on_map(l) && is_friendly_locale(get_lord_locale(l)))
			return true
	}

	return false
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

function is_exile(loc) {
	return data.locales[loc].type === "exile"
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

function is_favour_friendly(loc, side) {
	if (has_favoury_marker(loc) && side === YORK)
		return true
	else if (has_favourl_marker(loc) && side === LANCASTER)
		return true
	else
		return false
}

function is_favour_enemy(loc, side) {
	if (has_favoury_marker(loc) && side === LANCASTER)
		return true
	else if (has_favourl_marker(loc) && side === YORK)
		return true
	else
		return false
}

function is_favour_neutral(loc) {
	if (!has_favoury_marker(loc) && !has_favourl_marker(loc))
		return true
	else
		return false
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

function parley_locale(loc, side) {
	if (is_favour_friendly(loc, side))
		set_delete(game.pieces.favoury, loc)
	set_delete(game.pieces.favourl, loc)
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

function refresh_locale(locale) {
	if (has_depleted_marker(locale)) {
		remove_depleted_marker(locale)
	}

	if (is_locale_exhausted(locale)) {
		remove_exhausted_marker(locale)
		add_depleted_marker(locale)
	}
}

function deplete_locale(loc) {
	if (has_depleted_marker(loc)) {
		remove_depleted_marker(loc)
		add_exhausted_marker(loc)
	} else {
		add_depleted_marker(loc)
	}
}

function is_friendly_locale(loc) {
	if (loc !== NOWHERE && loc < CALENDAR) {
		if (has_enemy_lord(loc))
			return false
		if (is_favour_friendly(loc, game.active)) {
			//to add friendly favour marker later
			return true
		}
	}
	return false // TESTING PURPOSES NEED TO CHANGE TO FALSE
}

function can_add_troops(lordwho, locale) {
	if (has_exhausted_marker(locale))
		return false
	else
		return true
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

function reduce_influence(amt) {
	if (game.active === YORK)
		reduce_york_influence(amt)
	else
		reduce_lancaster_influence(amt)
}

function reduce_york_influence(amt) {
	game.influence += amt
}

function increase_york_influence(amt) {
	game.influence -= amt
}

function reduce_lancaster_influence(amt) {
	game.influence -= amt
}

function increase_lancaster_influnce(amt) {
	game.influence += amt
}

function shift_favor_away(loc) {
	if (game.active === YORK)
		shift_favor_toward_lancaster(loc)
	else
		shift_favor_toward_york(loc)
}

function shift_favor_toward(loc) {
	if (game.active === YORK)
		shift_favor_toward_york(loc)
	else
		shift_favor_toward_lancaster(loc)
}

function shift_favor_toward_york(loc) {
	if (has_favourl_marker(loc))
		remove_favourl_marker(loc)
	else
		add_favoury_marker(loc)
}

function shift_favor_toward_lancaster(loc) {
	if (has_favoury_marker(loc))
		remove_favoury_marker(loc)
	else
		add_favourl_marker(loc)
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
	queue.push([ start, 0 ])

	let distance = new Array(last_locale + 1).fill(-1)
	distance[start] = 0

	while (queue.length > 0) {
		let [ here, d ] = queue.shift()
		for (let next of data.locales[here][adjacent]) {
			if (distance[next] < 0) {
				distance[next] = d + 1
				queue.push([ next, d + 1 ])
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
	set_lord_assets(lord, SHIP, info.ships | 0)

	muster_lord_forces(lord)
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
		rebel: null,
		crown: null,
		state: "setup_lords",
		stack: [],
		victory_check: 0,
		influence: 0,

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
			favourl: [],
			favoury: [],
			in_exile: 0,
		},

		flags: {
			first_action: 0,
			first_march_highway: 0,
			free_levy: 0,
		},

		command: NOBODY,
		actions: 0,
		group: 0,
		intercept_group: 0,
		who: NOBODY,
		where: NOWHERE,
		what: NOTHING,
		count: 0,

		supply: 0,
		march: 0,
		battle: 0,
		spoils: 0,
		parley: 0,
	}

	update_aliases()

	log_h1(scenario)

	switch (scenario) {
	default:
	case "Ia. Henry VI":
		setup_Ia()
	break
	case "Ib. Towton":
		setup_Ib()
	break
	case "Ic. Somerset's Return":
		setup_Ic()
	break
	case "II. Warwicks' Rebellion" :
		setup_II()
	break
	case "III. My Kingdom for a Horse":
		setup_III()
	break
		case "I-III. Wars of the Roses":
		setup_ItoIII()
	break
	}

	return game
}

function setup_Ia() {
	game.turn = 1 << 1

	game.rebel = YORK
	game.crown = LANCASTER
	game.active = YORK
	game.victory_check = 40
	game.influence = 0
	muster_lord(LORD_YORK, LOC_ELY)
	muster_lord(LORD_MARCH, LOC_LUDLOW)
	muster_lord(LORD_HENRY_VI, LOC_LONDON)
	muster_lord(LORD_SOMERSET_1, LOC_LONDON)

	set_lord_cylinder_on_calendar(LORD_NORTHUMBERLAND_L, 2)
	set_lord_cylinder_on_calendar(LORD_EXETER_1, 3)
	set_lord_cylinder_on_calendar(LORD_BUCKINGHAM, 5)
	set_lord_cylinder_on_calendar(LORD_SALISBURY, 2)
	set_lord_cylinder_on_calendar(LORD_WARWICK_Y, 3)
	set_lord_cylinder_on_calendar(LORD_RUTLAND, 5)

	add_favourl_marker(LOC_LONDON)
	add_favourl_marker(LOC_WELLS)
	add_favourl_marker(LOC_SCOTLAND)
	add_favourl_marker(LOC_FRANCE)

	add_favoury_marker(LOC_ELY)
	add_favoury_marker(LOC_LUDLOW)
	add_favoury_marker(LOC_BURGUNDY)
	add_favoury_marker(LOC_IRELAND)

	setup_vassals()
}

function setup_Ib() {
	game.turn = 1 << 1

	game.rebel = YORK
	game.crown = LANCASTER
	game.active = YORK
	game.victory_check = 45
	game.influence = 0
	muster_lord(LORD_NORFOLK, LOC_LONDON)
	muster_lord(LORD_WARWICK_Y, LOC_LONDON)
	muster_lord(LORD_MARCH, LOC_LUDLOW)
	muster_lord(LORD_EXETER_1, LOC_NEWCASTLE)
	muster_lord(LORD_SOMERSET_1, LOC_NEWCASTLE)
	muster_lord(LORD_NORTHUMBERLAND_L, LOC_CARLISLE)

	add_favourl_marker(LOC_ST_ALBANS)
	add_favourl_marker(LOC_SCARBOROUGH)
	add_favourl_marker(LOC_NEWCASTLE)
	add_favourl_marker(LOC_BAMBURGH)
	add_favourl_marker(LOC_HEXHAM)
	add_favourl_marker(LOC_APPLEBY)
	add_favourl_marker(LOC_CARLISLE)
	add_favourl_marker(LOC_SCOTLAND)
	add_favourl_marker(LOC_FRANCE)

	add_favoury_marker(LOC_LONDON)
	add_favoury_marker(LOC_CALAIS)
	add_favoury_marker(LOC_GLOUCESTER)
	add_favoury_marker(LOC_HEREFORD)
	add_favoury_marker(LOC_OXFORD)
	add_favoury_marker(LOC_SALISBURY)
	add_favoury_marker(LOC_WINCHESTER)
	add_favoury_marker(LOC_GUILDFORD)
	add_favoury_marker(LOC_ARUNDEL)
	add_favoury_marker(LOC_HASTINGS)
	add_favoury_marker(LOC_DOVER)
	add_favoury_marker(LOC_ROCHESTER)
	add_favoury_marker(LOC_CANTERBURY)
	add_favoury_marker(LOC_SOUTHAMPTON)
	add_favoury_marker(LOC_BURGUNDY)
	add_favoury_marker(LOC_IRELAND)

	setup_vassals([ VASSAL_FAUCONBERG, VASSAL_NORFOLK ])
	muster_vassal(VASSAL_FAUCONBERG, LORD_MARCH)
}

function setup_Ic() {
	game.turn = 5 << 1

	game.rebel = YORK
	game.crown = LANCASTER
	game.active = YORK
	game.victory_check = 45
	game.influence = 6
	muster_lord(LORD_WARWICK_Y, LOC_LONDON)
	muster_lord(LORD_MARCH, LOC_LONDON)
	muster_lord(LORD_SOMERSET_1, LOC_BAMBURGH)

	set_lord_cylinder_on_calendar(LORD_HENRY_VI, 5)

	add_favourl_marker(LOC_SCARBOROUGH)
	add_favourl_marker(LOC_NEWCASTLE)
	add_favourl_marker(LOC_BAMBURGH)
	add_favourl_marker(LOC_HEXHAM)
	add_favourl_marker(LOC_APPLEBY)
	add_favourl_marker(LOC_CARLISLE)
	add_favourl_marker(LOC_HARLECH)
	add_favourl_marker(LOC_PEMBROKE)
	add_favourl_marker(LOC_CARDIFF)
	add_favourl_marker(LOC_CHESTER)
	add_favourl_marker(LOC_LANCASTER)
	add_favourl_marker(LOC_SCOTLAND)
	add_favourl_marker(LOC_FRANCE)

	add_favoury_marker(LOC_LONDON)
	add_favoury_marker(LOC_CALAIS)
	add_favoury_marker(LOC_LUDLOW)
	add_favoury_marker(LOC_HEREFORD)
	add_favoury_marker(LOC_SALISBURY)
	add_favoury_marker(LOC_WINCHESTER)
	add_favoury_marker(LOC_GUILDFORD)
	add_favoury_marker(LOC_ARUNDEL)
	add_favoury_marker(LOC_HASTINGS)
	add_favoury_marker(LOC_DOVER)
	add_favoury_marker(LOC_ROCHESTER)
	add_favoury_marker(LOC_CANTERBURY)
	add_favoury_marker(LOC_SOUTHAMPTON)
	add_favoury_marker(LOC_BURGUNDY)
	add_favoury_marker(LOC_IRELAND)

	setup_vassals()
}

function setup_II() {
	game.turn = 1 << 1

	game.rebel = LANCASTER
	game.crown = YORK
	game.active = LANCASTER
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

	add_favourl_marker(LOC_CALAIS)
	add_favourl_marker(LOC_YORK)
	add_favourl_marker(LOC_HARLECH)
	add_favourl_marker(LOC_COVENTRY)
	add_favourl_marker(LOC_WELLS)
	add_favourl_marker(LOC_FRANCE)

	add_favoury_marker(LOC_LONDON)
	add_favoury_marker(LOC_ELY)
	add_favoury_marker(LOC_LUDLOW)
	add_favoury_marker(LOC_CARLISLE)
	add_favoury_marker(LOC_PEMBROKE)
	add_favoury_marker(LOC_EXETER)
	add_favoury_marker(LOC_BURGUNDY)

	setup_vassals([ VASSAL_DEVON, VASSAL_OXFORD ])
}

function setup_III() {
	game.turn = 1 << 1

	game.rebel = LANCASTER
	game.crown = YORK
	game.active = LANCASTER
	muster_lord(LORD_RICHARD_III, LOC_LONDON)
	muster_lord(LORD_NORTHUMBERLAND_Y2, LOC_CARLISLE)
	muster_lord(LORD_NORFOLK, LOC_ARUNDEL)
	muster_lord(LORD_HENRY_TUDOR, LOC_FRANCE)
	muster_lord(LORD_JASPER_TUDOR_2, LOC_FRANCE)
	muster_lord(LORD_OXFORD, LOC_FRANCE)

	add_favourl_marker(LOC_FRANCE)
	add_favourl_marker(LOC_OXFORD)
	add_favourl_marker(LOC_HARLECH)
	add_favourl_marker(LOC_PEMBROKE)

	add_favoury_marker(LOC_BURGUNDY)
	add_favoury_marker(LOC_LONDON)
	add_favoury_marker(LOC_CALAIS)
	add_favoury_marker(LOC_CARLISLE)
	add_favoury_marker(LOC_ARUNDEL)
	add_favoury_marker(LOC_YORK)
	add_favoury_marker(LOC_GLOUCESTER)

	setup_vassals([ VASSAL_OXFORD, VASSAL_NORFOLK ])
}

function setup_ItoIII() {
	game.turn = 1 << 1

	game.rebel = YORK
	game.crown = LANCASTER
	game.active = YORK
	muster_lord(LORD_YORK, LOC_ELY)
	muster_lord(LORD_MARCH, LOC_LUDLOW)
	muster_lord(LORD_HENRY_VI, LOC_LONDON)
	muster_lord(LORD_SOMERSET_1, LOC_WELLS)

	set_lord_cylinder_on_calendar(LORD_NORTHUMBERLAND_L, 1)
	set_lord_cylinder_on_calendar(LORD_EXETER_1, 3)
	set_lord_cylinder_on_calendar(LORD_BUCKINGHAM, 5)
	set_lord_cylinder_on_calendar(LORD_SALISBURY, 2)
	set_lord_cylinder_on_calendar(LORD_WARWICK_Y, 3)
	set_lord_cylinder_on_calendar(LORD_RUTLAND, 5)

	setup_vassals()
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

function is_leeward_battle_line_in_play() {
	if (is_archery_step()) {
		if (game.active === LANCASTER)
			return is_event_in_play(EVENT_LANCASTER_LEEWARD_BATTLE_LINE)
		if (game.active === YORK)
			return is_event_in_play(EVENT_YORK_LEEWARD_BATTLE_LINE)
	}
	return false
}

function is_escape_ship_in_play() {
	if (game.active === LANCASTER)
		return is_event_in_play(EVENT_LANCASTER_ESCAPE_SHIP)
	if (game.active === YORK)
		return is_event_in_play(EVENT_YORK_ESCAPE_SHIP)
}

function goto_immediate_event(c) {
	switch (c) {
		// This Levy / Campaign
		// No immediate effect
		/*case EVENT_LANCASTER_BE_SENT_FOR:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_LANCASTER_SEAMANSHIP:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_LANCASTER_FORCED_MARCHES:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_LANCASTER_RISING_WAGES:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_LANCASTER_NEW_ACT_OF_PARLIAMENT:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_LANCASTER_MY_CROWN_IS_IN_MY_HEART:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_LANCASTER_PARLIAMENT_VOTES:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_LANCASTER_FRENCH_FLEET:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_LANCASTER_BUCKINGHAMS_PLOT:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_LANCASTER_MARGARET_BEAUFORT:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_LANCASTER_THE_EARL_OF_RICHMOND:
			set_add(game.events, c)
			return end_immediate_event()

		case EVENT_YORK_JACK_CADE:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_YORK_SEAMANSHIP:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_YORK_YORKISTS_BLOCK_PARLIAMENT:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_YORK_EXILE_PACT:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_YORK_RICHARD_OF_YORK:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_YORK_THE_COMMONS:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_YORK_SUCCESSION:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_YORK_LOYALTY_AND_TRUST:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_YORK_OWAIN_GLYNDWR:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_YORK_GLOUCESTER_AS_HEIR:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_YORK_DORSET:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_YORK_THE_KINGS_NAME:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_YORK_EDWARD_V:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_YORK_AN_HONEST_TALE_SPEEDS_BEST:
			set_add(game.events, c)
			return end_immediate_event()
		case EVENT_YORK_PRIVY_COUNCIL:
			set_add(game.events, c)
			return end_immediate_event()
			*/
		// Immediate effect
	/*	case EVENT_RUSSIAN_DEATH_OF_THE_POPE:
			set_add(game.events, c)
			return goto_russian_event_death_of_the_pope()
		case EVENT_RUSSIAN_VALDEMAR:
			set_add(game.events, c)
			return goto_russian_event_valdemar()
		case EVENT_RUSSIAN_DIETRICH_VON_GRUNINGEN:
			set_add(game.events, c)
			return goto_russian_event_dietrich()

			*/

		// Discard - Immediate Events
		/*case EVENT_LANCASTER_SCOTS:
			return goto_lancaster_event_scots()
		case EVENT_LANCASTER_HENRY_PRESSURES_PARLIAMENT:
			return goto_lancaster_event_henry_pressures_parliament()
		case EVENT_LANCASTER_HENRYS_PROCLAMATION:
			return goto_lancaster_event_henrys_proclamation()
		case EVENT_LANCASTER_FRENCH_TROOPS:
			return goto_lancaster_event_french_troops()
		case EVENT_LANCASTER_WARWICKS_PROPAGANDA:
			return goto_lancaster_event_warwicks_propaganda()
		case EVENT_LANCASTER_WELSH_REBELLION:
			return goto_lancaster_event_welsh_rebellion()
		case EVENT_LANCASTER_HENRY_RELEASED:
			return goto_lancaster_event_henry_released()
		case EVENT_LANCASTER_LUNIVERSELLE_ARAGNE:
			return goto_lancaster_event_luniverselle_aragne()
		case EVENT_LANCASTER_TO_WILFUL_DISOBEDIANCE:
			return goto_lancaster_event_to_wilful_disobediance()
		case EVENT_LANCASTER_FRENCH_WAR_LOANS:
			return goto_lancaster_event_french_war_loans()
		case EVENT_LANCASTER_ROBINS_REBELLION:
			return goto_lancaster_event_robins_rebellion()
		case EVENT_LANCASTER_TUDOR_BANNERS:
			return goto_lancaster_event_tudor_banners()
		case EVENT_YORK_TAX_COLLECTORS:
			return goto_york_event_tax_collectors()
		case EVENT_YORK_LONDON_FOR_YORK:
			return goto_york_event_london_for_york()
		case EVENT_YORK_SHEWOLF_OF_FRANCE:
			return goto_york_event_shewolf_of_france()
		case EVENT_YORK_SIR_RICHARD_LEIGH:
			return goto_york_event_sir_richard_leigh()
		case EVENT_YORK_CHARLES_THE_BOLD:
			return goto_york_event_charles_the_bold()
		case EVENT_YORK_YORKIST_NORTH:
			return goto_york_event_yorkist_north()
		case EVENT_YORK_EARL_RIVERS:
			return goto_york_event_earl_rivers()
			*/
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
	let parent = game.stack[game.stack.length - 1]
	if (parent[0] === "levy_muster_lord")
		lordship = parent[1]

	let names
	if (game.what === EVENT_RUSSIAN_PRINCE_OF_POLOTSK)
		names = "a Russian Lord"
	else
		names = list
			.filter(lord => is_lord_on_calendar(lord))
			.map(lord => lord_name[lord])
			.join(" or ")

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

function capability_muster_effects(lord, c) {
	if (c === AOW_LANCASTER_MONTAGU)
		muster_vassal(VASSAL_MONTAGU, game.who)

	if (c === AOW_LANCASTER_MY_FATHERS_BLOOD)
		muster_vassal(VASSAL_CLIFFORD, game.who)

	if (c === AOW_LANCASTER_ANDREW_TROLLOPE)
		muster_vassal(VASSAL_TROLLOPE, game.who)

	if (c === AOW_LANCASTER_EDWARD)
		muster_vassal(VASSAL_EDWARD, game.who)

	if (c === AOW_LANCASTER_THOMAS_STANLEY) {
		muster_vassal(VASSAL_THOMAS_STANLEY, game.who)
		game.flags.free_levy = 1
	}

	if (c === AOW_YORK_HASTINGS) {
		add_lord_forces(game.who, MEN_AT_ARMS, 2)
		muster_vassal(VASSAL_HASTINGS, game.who)
	}
	if (c === AOW_YORK_FAIR_ARBITER && is_friendly_locale(get_lord_locale(LORD_SALISBURY))) {
		game.count += 1
	}
	if (c === AOW_YORK_FALLEN_BROTHER && !is_lord_in_play(LORD_CLARENCE)) {
		game.count += 1
	}
}

function lordship_effects(lord) {
	if (is_friendly_locale(get_lord_locale(lord)) && lord_has_capability(lord, AOW_YORK_FAIR_ARBITER))
		game.count += 1
	if (lord_has_capability(lord, AOW_YORK_FALLEN_BROTHER) && !is_lord_in_play(LORD_CLARENCE))
		game.count += 1
}

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
		capability_muster_effects(lord, c)
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
		if (lord_has_capability(lord, AOW_LANCASTER_THOMAS_STANLEY))
			game.flags.free_levy = 1
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
			if (
				is_lord_at_friendly_locale(lord) &&
				!is_lord_on_calendar(lord) &&
				(!get_lord_moved(lord) || game.flags.free_levy === 1)
			) {
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
		lordship_effects(lord)
	},
	end_muster() {
		clear_undo()
		end_levy_muster()
	},
	card: action_held_event,
}

function resume_levy_muster_lord() {
	--game.count

	if (game.count === 0 && game.flags.free_levy === 0 && can_add_troops(game.who, get_lord_locale(game.who))) {
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
				if (is_lord_ready(lord) && has_locale_to_muster(lord))
					gen_action_lord(lord)
			}

			// Muster Ready Vassal Forces
			if (is_friendly_locale(get_lord_locale(game.who))) {
				for (let vassal of get_ready_vassals()) {
					gen_action_vassal(vassal)
				}
			}

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

			if (can_action_parley_levy())
				view.actions.parley = 1
		}

		if (game.count === 0 && game.flags.free_levy === 1 && can_add_troops(game.who, get_lord_locale(game.who))) {
			view.actions.levy_troops = 1
		}

		view.actions.done = 1
	},

	card: action_held_event_lordship,

	lord(other) {
		clear_undo()
		goto_levy_muster_lord_attempt(other)
	},

	vassal(vassal) {
		push_undo()
		goto_levy_muster_vassal(vassal)
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
		if (
			!lord_has_capability(game.who, AOW_LANCASTER_QUARTERMASTERS) &&
			!lord_has_capability(game.who, AOW_YORK_WOODWILLES)
		)
			deplete_locale(get_lord_locale(game.who))

		switch (locale) {
			case "calais":
				add_lord_forces(game.who, MEN_AT_ARMS, 2)
				add_lord_forces(game.who, LONGBOWMEN, 1)
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

		if (game.flags.free_levy === 1) {
			++game.count
			game.flags.free_levy = 0
		}

		resume_levy_muster_lord()
	},

	capability() {
		push_undo()
		push_state("muster_capability")
	},

	parley() {
		goto_parley(game.who, "levy")
	},

	done() {
		set_lord_moved(game.who, 1)
		pop_state()
	},
}

states.muster_lord_at_seat = {
	inactive: "Muster",
	prompt() {
		view.prompt = `Muster: Select Locale for ${lord_name[game.who]}.`
		let found = false

		let seat = data.lords[game.who].seats[0]
		if (!has_enemy_lord(seat)) {
			gen_action_locale(seat)
			found = true
		}

		if (!found) {
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; lord++) {
				if (is_lord_on_map(lord) && is_friendly_locale(data.lords[lord].seats[0])) {
					gen_action_locale(data.lords[lord].seats[0])
				}
			}
		}
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
		if (game.active === YORK) {
			add_favoury_marker(loc)
			remove_favourl_marker(loc)
		} else {
			add_favourl_marker(loc)
			remove_favoury_marker(loc)
		}
		end_muster_lord_at_seat()
	},
}

function goto_levy_muster_lord_attempt(lord) {
	game.what = lord
	push_state("levy_muster_lord_attempt")
	init_influence_check(game.who)
}

function end_levy_muster_lord_attempt() {
	pop_state()
	clear_undo()
	end_influence_check()
	resume_levy_muster_lord()
}

states.levy_muster_lord_attempt = {
	inactive: "Levy Lord",
	prompt() {
		view.prompt = `Levy Lord ${lord_name[game.what]}. `

		prompt_influence_check()
	},
	spend1: add_influence_check_modifier_1,
	spend3: add_influence_check_modifier_2,
	check() {
		let results = do_influence_check()
		log(`Attempt to levy L${game.what} ${results.success ? "Successful" : "Failed"}: (${range(results.rating)}) ${results.success ? HIT[results.roll] : MISS[results.roll]}`)

		if (results.success) {
			push_state("muster_lord_at_seat")
			game.who = game.what
		} else {
			end_levy_muster_lord_attempt()
		}
	},
}

function end_muster_lord_at_seat() {
	pop_state()
	end_levy_muster_lord_attempt()
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
			capability_muster_effects(game.who, c)
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
	} else {
		set_active(P1)
		if (P1 === "Lancaster")
			game.command = game.plan2.shift()
		else
			game.command = game.plan1.shift()
	}

	if (game.command === NOBODY) {
		log_h2("Pass")
		goto_command_activation()
	} else if (!is_lord_on_map(game.command)) {
		log_h2(`L${game.command} - Pass`)
		goto_command_activation()
	} else {
		log_h2(`L${game.command} at %${get_lord_locale(game.command)}`)
		goto_command()
	}
}

// === CAMPAIGN: ACTIONS ===

function set_active_command() {
	if (game.command >= first_york_lord && game.command <= last_york_lord)
		set_active(YORK)
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

function is_first_march_highway() {
	if (game.flags.first_march_highway === 1)
		return true
	else
		return false
}

function goto_command() {
	game.actions = data.lords[game.command].command
	if (lord_has_capability(game.command, AOW_YORK_THOMAS_BOURCHIER) && is_city(get_lord_locale(game.command)))
		game.actions += 1
	if (lord_has_capability(game.command, AOW_YORK_YORKS_FAVOURED_SON))
		game.actions += 1
	if (lord_has_capability(game.command, AOW_YORK_HASTINGS))
		game.actions += 1

	game.group = [ game.command ]

	game.flags.first_action = 1
	game.flags.first_march_highway = 0

	resume_command()
}

function resume_command() {
	game.state = "command"
}

function spend_action(cost) {
	game.flags.first_action = 0
	game.flags.first_march_highway = 0
	game.actions -= cost
}

function spend_march_action(cost) {
	game.flags.first_action = 0
	game.flags.first_march_highway = 0
	game.actions -= cost
}

function spend_all_actions() {
	game.flags.first_action = 0
	game.flags.first_march_highway = 0
	game.actions = 0
}

function end_command() {
	log_br()

	game.group = 0

	game.flags.first_action = 0
	game.flags.first_march_highway = 0
	game.flags.famine = 0

	// NOTE: Feed currently acting side first for expedience.
	set_active_command()
	goto_feed()
}

function other_marshal_or_lieutenant(lord, loc) {
	let here = loc
	let n = 0
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (lord !== game.command) {
			if (get_lord_locale(lord) === here && (is_marshal(lord) || is_lieutenant(lord)))
				n += 1
		}
	if (n === 0)
		return false
	else
		return true
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
		if (
			is_marshal(game.command) ||
			(lord_has_capability(game.command, AOW_YORK_CAPTAIN) && !other_marshal_or_lieutenant(game.command, here))
		) {
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
		if (can_action_forage())
			view.actions.forage = 1
		if (can_action_tax())
			view.actions.tax = 1
		if (can_action_sail())
			view.actions.sail = 1
		if (can_action_parley_command())
			view.actions.parley = 1
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

	parley() {
		goto_parley(game.command, "command")
	},
}

// === INFLUENCE CHECKS ===
function influence_capabilities(lord, score) {
	let here = get_lord_locale(game.group)
	if (game.state === "parley" && lord_has_capability(game.group, AOW_LANCASTER_IN_THE_NAME_OF_THE_KING))
		score += 1
	if (get_lord_locale(LORD_MARGARET) === here && lord_has_capability(game.group, AOW_LANCASTER_LOYAL_SOMERSET))
		score += 1
	if (lord_has_capability(lord, AOW_YORK_YORKS_FAVOURED_SON))
		score += 1
	if (
		get_lord_locale(LORD_WARWICK_L) === here &&
		lord_has_capability(game.group, AOW_LANCASTER_MARRIED_TO_A_NEVILLE) &&
		is_friendly_locale(here)
	)
		score += 2
	if (is_friendly_locale(here) && lord_has_capability(lord, AOW_YORK_FAIR_ARBITER))
		score += 1
	if (lord_has_capability(AOW_YORK_FALLEN_BROTHER) && !is_lord_in_play(LORD_CLARENCE))
		score += 2

	return score
}

function init_influence_check(lord) {
	game.check = []
	game.check.push({ cost: 1, modifier: 0, source: "base" })
	game.check.push({ cost: 0, modifier: data.lords[lord].influence, source: "lord" })
}

function end_influence_check() {
	game.check = 0
}

function count_influence_score() {
	let here = get_lord_locale(game.group)
	let score = game.check.reduce((p, c) => p + c.modifier, 0)
	score = influence_capabilities(game.group, score)

	if (score > 5)
		score = 5
	if (score < 1)
		score = 1

	return score
}

function count_influence_cost() {
	return game.check.reduce((p, c) => p + c.cost, 0)
}

function do_influence_check() {
	reduce_influence(count_influence_cost())
	let rating = count_influence_score()
	let roll = roll_die()
	let success

	if (roll === 1)
		success = true
	else if (roll === 6)
		success = false
	else if (lord_has_capability(game.who, AOW_LANCASTER_TWO_ROSES) && game.state === "")
		success = true
	else
		success = roll <= rating

	return { success: success, rating: rating, roll: roll }
}

function add_influence_check_modifier_1() {
	game.check.push({ cost: 1, modifier: 1, source: "add" })
}

function add_influence_check_modifier_2() {
	game.check.push({ cost: 3, modifier: 2, source: "add" })
}

function add_influence_check_distance(distance) {
	let idx = game.check.findIndex(i => i.source === "distance")

	if (idx !== NOTHING)
		game.check.splice(idx, 1)

	game.check.push({ cost: distance, modifier: 0, source: "distance" })
}

function prompt_influence_check() {
	if (!game.check.some(c => c.source === "add")) {
		gen_action("spend1")
		gen_action("spend3")
	}
	if (game.where !== NOWHERE)
		gen_action_locale(game.where)
	view.actions.check = 1

	view.prompt += `Cost: ${count_influence_cost()} - Range (${range(count_influence_score())})`
}

// === ACTION: PARLEY ===

// 1) During Levy / game.who -- Campaign / game.command
// 2) During Levy / Can reach any locale that has a route of friendly locale (except the target stronghold)
// Campaign / here and adjacent
// The route can go through ports on same sea if the group has ships (note that there is one card that connect all port on all seas)
// 3) Condition : Always parley at lord's locale if not friendly
// 4) Not where any enemy lord, always at stronghold (not at sea or exile box)
// 5) Not where it is already friendly
// 6) Same port on same sea (port_1, port_2, port_3 on data.js)
// 7) From exile, all port on same sea (exile_1 can target port_1, exile_2 can target port_2, exile_3 can target port_3)
// 8) Cost : Levy / 1 always + 1 per way (by land or sea) -- Campaign / No cost here, 1 always + 1 due to the way
// 9) In addition, player may chose to raise current influence rating (current influence rating = printed + caps that may change it)
// by 1 or 2 by spending 1 or 3 IP
// 10) Roll a die : <= current influence rating success, => failure. 1 always success, 6 always failure. always success at no cost if campaign here
// 11) If success, remove enemy marker if currently enemy, add your marker if there is no marker.
// 12) If success, move the Town or City or Fortress marker one step to succeeding side if the locale just parleyed was a Town / City / Fortress
// 13) The current influence is put back to where it was before the expenditure
// (he needs to pay again if he wants to improve his influence for a following parley action)

// INFLUENCE CHECK = 8) and 9) and 10) Will happen a lot in the game, so a own function is best that will be modified depending on exceptions

function command_parley_accept(loc) {
	return !is_exile(loc.locale) && !is_friendly_locale(loc.locale) && !has_enemy_lord(loc.locale) && loc.distance <= 1
}

function can_action_parley_command() {
	if (game.actions <= 0)
		return false
	let targets = map_search(game.command, command_parley_accept, parley_adjacent)

	let res = targets.next()
	return res.done !== true
}

function levy_parley_accept(loc) {
	return !is_exile(loc.locale) && !is_friendly_locale(loc.locale) && !has_enemy_lord(loc.locale)
}

function can_action_parley_levy() {
	if (game.count <= 0)
		return false

	let targets = map_search(game.who, levy_parley_accept, parley_adjacent)

	return targets.next().done !== true
}

function parley_adjacent(here, lord) {
	let seaports = []
	if (is_exile(here) && get_shared_assets(here, SHIP) > 0) {
		return find_ports_from_exile(here)
	} else if (is_seaport(here) && get_shared_assets(here, SHIP) > 0) {
		if (data.port_1.includes(here))
			seaports = data.port_1
		if (data.port_2.includes(here))
			seaports = data.port_2
		if (data.port_3.includes(here))
			seaports = data.port_3
	}

	return data.locales[here].adjacent.concat(seaports)
}

function find_ports_from_exile(here) {
	if (data.exile_1.includes(here))
		return data.port_1
	if (data.exile_2.includes(here))
		return data.port_2
	if (data.exile_3.includes(here))
		return data.port_3
}

function find_parley_targets(lord, acceptfn, adjacentfn) {
	let results = []
	for (let loc of map_search(lord, acceptfn, adjacentfn))
		results.push(loc)
	return results
}

function* map_search(lord, acceptfn, adjacentfn, prune=true) {
	let here = get_lord_locale(lord)
	let locales = [{locale:here, distance: 0}]

	let seen = []

	while (true) {
		if (locales.length === 0)
			return

		let loc = locales.shift()
		seen.push(loc.locale)

		if (acceptfn(loc)) {
			yield loc
			if (prune)
				continue
		}
		if (is_friendly_locale(loc.locale)) {
			let distance = loc.distance + 1
			locales = locales.concat(
							adjacentfn(loc.locale, lord)
								.filter(l => !seen.includes(l))
								.filter(l => !locales.some((r) => r.locale === l))
								.map(x => {return {locale: x, distance: distance }})
							)
		}
	}
}

function goto_parley(lord, from) {
	push_undo()
	push_state("parley")

	init_influence_check(lord)
	if (from === "levy")
		game.what = find_parley_targets(lord, levy_parley_accept, parley_adjacent)
	else
		game.what = find_parley_targets(lord, command_parley_accept, parley_adjacent)

	if (game.what.length === 1 && is_campaign_phase() && get_lord_locale(lord) === game.what[0].locale) {
		// Campaign phase, and current location is no cost, and always successful.
		shift_favor_toward(game.what[0].locale)
		end_parley()
	} else if (game.what.length === 1) {
		game.where = game.what[0].locale
		add_influence_check_distance(game.what[0].distance)
	} else {
		game.where = NOWHERE
	}
}

function end_parley() {
	clear_undo()
	pop_state()
	game.where = NOWHERE
	game.what = NOTHING
	end_influence_check()
	if (game.state === "command") {
		spend_action(1)
		resume_command()
	} else {
		resume_levy_muster_lord()
	}
}

states.parley = {
	inactive: "Parley",
	prompt() {
		view.prompt = "Parley: Choose a Locale to Parley."
		if (game.where === NOTHING) {
			for (let loc of game.what)
				gen_action_locale(loc.locale)
		} else {
			view.prompt = "Parley: "
			prompt_influence_check()
		}
	},
	locale(loc) {
		game.where = loc
		for (let loc of game.what) {
			if (loc.locale === game.where)
				add_influence_check_distance(loc.distance)
		}
	},
	spend1: add_influence_check_modifier_1,
	spend3: add_influence_check_modifier_2,
	check() {
		let results = do_influence_check()

		log(`Attempt to Parley with %${game.where} ${results.success ? "Successful" : "Failed"}: (${range(results.rating)}) ${results.success ? HIT[results.roll] : MISS[results.roll]}`)

		if (results.success) {
			shift_favor_toward(game.where)
		}
		end_parley()
	}
}


// === ACTION: LEVY VASSAL ===
// 1) During Levy ONLY
// 2) game.who location must be friendly and Vassal seat locale must be friendly
// 3) there need to not be his vassal marker on the calendar (see vassal disband)
// 4) use INFLUENCE CHECK, except that the cost is always 1 (you don't count way cost) before choosing to add extra influence to the lord
// 5) In addition, player may chose to raise current influence rating (current influence rating = printed + caps that may change it)
// by 1 or 2 by spending 1 or 3 IP
// 6) In addition, substract the left number value (data.vassals.influence) if game.who is Lancaster, add if game.who is yorkist
// 7) Roll a die : <= current influence rating success, => failure. 1 always success, 6 always failure.
// 8) Place one vassal marker on the lord mat
// 9) Place the other vassal marker on the calendar box a number of turn equal to current turn + service (data.vassals.service)
// 10) When the turn reaches back the face down vassal, the vassal marker on the calendar dissapear and the one on the map is turned face up, ready to be mustered again
// 11) The vassals with service 0 are capabilities that will never be put on calendar, there will only be one marker on lord's mat.

// VASSAL DISBAND
// 1) One vassal marker is placed, face down, on his seat
// 2) The other vassal marker is placed, face down, on the calendar, a number of boxes right to current turn + 6 - service
// (a service 3 disbanding in turn 8 will come back turn 11)

function goto_levy_muster_vassal(vassal) {
	game.what = vassal
	push_state("levy_muster_vassal")
	init_influence_check(game.who)
	game.check.push({
		cost: 0,
		modifier: data.vassals[vassal].influence * (game.active === LANCASTER ? -1 : 1),
		source: "vassal",
	})
}

function end_levy_muster_vassal() {
	pop_state()
	clear_undo()
	end_influence_check()
	resume_levy_muster_lord()
}
states.levy_muster_vassal = {
	inactive: "Levy Vassal",
	prompt() {
		view.prompt = `Levy Vassal ${data.vassals[game.what].name}. `
		prompt_influence_check()
	},
	spend1: add_influence_check_modifier_1,
	spend3: add_influence_check_modifier_2,
	check() {
		let results = do_influence_check()

		if (lord_has_capability(game.who, AOW_LANCASTER_TWO_ROSES)) {
			log(`Automatic Success. C${AOW_LANCASTER_TWO_ROSES}.`)
		} else {
			log(`Attempt to levy V${game.what} ${results.success ? "Successful" : "Failed"}: (${range(results.rating)}) ${results.success ? HIT[results.roll] : MISS[results.roll]}`)
		}

		if (results.success) {
			muster_vassal(game.what, game.who)
		}

		end_levy_muster_vassal()
	},
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

function prompt_march() {
	let from = get_lord_locale(game.command)
	if (is_first_action())
		for (let to of data.locales[from].adjacent_by_path) {
			gen_action_locale(to)
		}

	if (game.actions > 0) {
		for (let to of data.locales[from].adjacent_by_road) {
			gen_action_locale(to)
		}
		for (let to of data.locales[from].adjacent_by_highway) {
			gen_action_locale(to)
		}
	} else if (game.actions === 0 && is_first_march_highway()) {
		for (let to of data.locales[from].adjacent_by_highway) {
			gen_action_locale(to)
		}
	}

	if (
		lord_has_capability(game.command, AOW_YORK_YORKISTS_NEVER_WAIT) &&
		game.actions === 0 &&
		is_first_march_highway() &&
		count_group_lords() === 1
	) {
		for (let to of data.locales[from].adjacent_by_road) {
			gen_action_locale(to)
		}
	}
}

function goto_march(to) {
	push_undo()
	let from = get_lord_locale(game.command)
	let ways = list_ways(from, to)
	game.march = { from, to, approach: ways[1], avoid: -1 }
	march_with_group_1()
}

function march_with_group_1() {
	let transport = count_group_assets(CART)
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
		let transport = count_group_assets(CART)
		let prov = count_group_assets(PROV)

		view.group = game.group
		view.prompt = `March: Unladen. `

		if (prov > transport) {
			let overflow_prov = prov - transport
			view.prompt += `Please discard ${overflow_prov} Provender`
			for (let lord of game.group) {
				if (prov > transport) {
					if (get_lord_assets(lord, PROV) > 0) {
						gen_action_prov(lord)
					}
				}
			}
		} else {
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
	let transport = count_group_assets(data.ways[way].type)
	let prov = count_group_assets(PROV)
	let ways = list_ways(from, to)

	if (
		(data.ways[way].type === "highway" && is_first_march_highway()) ||
		(is_first_march_highway() && data.ways[way].type === "road" && count_group_lords() === 1)
	) {
		spend_march_action(0)
	} else if (data.ways[way].type === "highway") {
		spend_march_action(1)
		game.flags.first_march_highway = 1
	} else if (data.ways[way].type === "road") {
		spend_march_action(1)
		if (lord_has_capability(game.command, AOW_YORK_YORKISTS_NEVER_WAIT) && count_group_lords() === 1)
			game.flags.first_march_highway = 1
	} else if (data.ways[way].type === "path") {
		spend_all_actions()
	}

	if (data.ways[way].name)
		log(`Marched to %${to} via W${way}${format_group_move()}.`)
	else
		log(`Marched to %${to}${format_group_move()}.`)

	for (let lord of game.group) {
		set_lord_locale(lord, to)
		set_lord_moved(lord, 1)
	}

	goto_intercept()
}

function march_with_group_3() {
	// Disbanded in battle!
	if (!is_lord_on_map(game.command)) {
		game.march = 0
		spend_all_actions()
		resume_command()
		return
	}

	game.march = 0
	resume_command()
}

// === Interception ===

function find_way(loc1, loc2) {
	for (let way of data.ways) {
		if (way.locales.includes(loc1) && way.locales.includes(loc2)) {
			return way
		}
	}
	return null
}

function goto_intercept() {
	let here = get_lord_locale(game.command)
	for (let loc of data.locales[here].adjacent) {
		let way = find_way(here, loc)
		if (has_enemy_lord(loc) && way !== null && way.type !== "path") {
			game.state = "intercept"
			set_active_enemy()
			game.intercept_group = []
			game.who = NOBODY
			return
		}
	}

	goto_exiles()
}

function end_intercept() {
	game.intercept_group = 0
	game.who = NOBODY
	set_active_enemy()
	goto_exiles()
}

states.intercept = {
	inactive: "Intercept",
	prompt() {
		view.prompt = `Choose lord to intercept moving lords?`
		let to = get_lord_locale(game.command)

		if (game.who === NOBODY) {
			for (let loc of data.locales[to].adjacent) {
				let way = find_way(to, loc)
				if (way !== null && way.type !== "path")
					for_each_friendly_lord_in_locale(loc, gen_action_lord)
			}
		} else {
			gen_action_lord(game.who)
			if (is_marshal(game.who) || is_lieutenant(game.who)) {
				for_each_friendly_lord_in_locale(get_lord_locale(game.who), lord => {
					if (!is_marshal(lord))
						gen_action_lord(lord)
				})
			}

			view.actions.intercept = 1
		}

		view.actions.pass = 1
		view.group = game.intercept_group
	},
	lord(lord) {
		if (game.who === NOBODY) {
			game.who = lord
			set_toggle(game.intercept_group, lord)
		} else if (lord === game.who) {
			game.who = NOBODY
			game.intercept_group = []
		} else {
			set_toggle(game.intercept_group, lord)
		}
	},
	pass() {
		end_intercept()
	},
	intercept() {
		let valour = data.lords[game.who].valour
		let roll = roll_die()
		let success = roll <= valour
		log(`Intercept ${success ? "Succeeded." : "Failed."} (${range(valour)}): ${success ? HIT[roll] : MISS[roll]}`)

		if (success) {
			goto_intercept_march()
		} else {
			end_intercept()
		}
	},
}

function goto_intercept_march() {
	if (count_group_transport(game.intercept_group) >= count_group_assets(PROV, game.intercept_group)) {
		game.intercept_group.forEach(l => {
			set_lord_locale(l, get_lord_locale(game.command))
			set_lord_moved(l, 1)
		})
		end_intercept_march()
	} else {
		game.state = "intercept_march"
	}
}

function end_intercept_march() {
	// successfully intercepted by here.  Make sure to clear out actions
	spend_all_actions()
	goto_intercept_exiles()
}

function do_intercept_march() {
	game.intercept_group.forEach(l => {
		set_lord_locale(l, get_lord_locale(game.command))
		set_lord_moved(l, 1)
	})
	end_intercept_march()
}

states.intercept_march = {
	inactive: "Intercept",
	prompt() {
		let to = game.march.to
		let transport = count_group_transport(game.intercept_group)
		let prov = count_group_assets(PROV, game.intercept_group)

		view.group = game.intercept_group

		view.prompt = `Intercept: Unladen.`

		if (prov > transport) {
			view.prompt = `Intercept: Hindered with ${prov} Provender, and ${transport} Transport.`
			for (let lord of game.intercept_group) {
				if (get_lord_assets(lord, PROV) > 0) {
					view.prompt += " Discard Provender."
					gen_action_prov(lord)
				}
			}
		} else {
			view.actions.intercept = 1
			gen_action_locale(to)
		}
	},
	prov: drop_prov,
	intercept: do_intercept_march,
	locale: do_intercept_march,
}

function is_enemy_lord(lord) {
	return lord >= first_enemy_lord && lord <= last_enemy_lord
}

function for_each_friendly_lord_in_locale(loc, f) {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; lord++)
		if (get_lord_locale(lord) === loc)
			f(lord)
}

function goto_intercept_exiles() {
	let here = get_lord_locale(game.command)
	for (let lord = first_enemy_lord; lord <= last_enemy_lord; ++lord) {
		if (get_lord_locale(lord) === here) {
			if (!game.group.includes(lord)) {
				game.state = "intercept_exiles"
				set_active_enemy()
				return
			}
		}
	}
	end_intercept()
}

function end_intercept_exiles() {
	set_active_enemy()
	end_intercept()
}

states.intercept_exiles = {
	inactive: "Intercept Exiles",
	prompt() {
		view.prompt = "???"
		for_each_friendly_lord_in_locale(get_lord_locale(game.command), lord => {
			if (!game.group.includes(lord))
				gen_action_lord(lord)
		})
		view.actions.done = 1
	},
	lord(lord) {
		push_undo()
		exile_lord(lord)
	},
	done() {
		end_intercept_exiles()
	},
}

// === Exile ===

function goto_exiles() {
	clear_undo()
	let here = get_lord_locale(game.command)

	if (has_enemy_lord(here)) {
		game.state = "exiles"
		set_active_enemy()
		push_undo()
	} else {
		march_with_group_3()
	}
}

function end_exiles() {
	clear_undo()

	if (has_friendly_lord(get_lord_locale(game.command))) {
		// still some lords not exiled to fight.
		set_active_enemy()
		goto_battle()
	} else {
		// no one left, goto finish marching.
		set_active_enemy()
		march_with_group_3()
	}
}

states.exiles = {
	inactive: "Exiles",
	prompt() {
		view.prompt = "Select Lords to go into Exile."
		for_each_friendly_lord_in_locale(get_lord_locale(game.command), lord => {
			gen_action_lord(lord)
		})
		view.actions.done = 1
	},
	lord: exile_lord,
	done() {
		end_exiles()
	},
}

function set_lord_in_exile(lord) {
	game.pieces.in_exile = pack1_set(game.pieces.in_exile, lord, 1)
}

function get_lord_in_exile(lord) {
	return pack1_get(game.pieces.in_exile, lord)
}

function exile_lord(lord) {
	set_lord_in_exile(lord)
	disband_lord(lord)
}

function remove_lord_from_exile(lord) {
	game.pieces.in_exile = pack1_set(game.pieces.in_exile, lord, 0)
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

function take_spoils_prov() {
	take_spoils(PROV)
}

function take_spoils_cart() {
	take_spoils(CART)
}

// === ACTION: SUPPLY (SEARCHING) ===

function supply_adjacent(here, lord) {
	let lord_loc = get_lord_locale(lord)
	if (is_exile(here) && get_shared_assets(here, SHIP) > 0) {
		return find_ports_from_exile(here)
	} else if (is_exile(lord_loc) && lord_loc !== here) {
		return []
	}
	return data.locales[here].adjacent
}

// === ACTION: SUPPLY ===

function supply_accept(loc, carts, ships) {
	return (
		!is_exile(loc.locale) &&
		is_friendly_locale(loc.locale) &&
		!has_enemy_lord(loc.locale) &&
		(!has_exhausted_marker(loc.locale) || (ships > 0 && is_seaport(loc.locale))) &&
		carts >= loc.distance
	)
}

function find_supply_sources(lord, carts, ships) {
	let search = map_search(lord, loc => supply_accept(loc, carts, ships), supply_adjacent, false)

	let results = []
	for (let loc of search)
		results.push(loc)
	return results
}

function init_supply() {
	let here = get_lord_locale(game.command)
	let carts = get_shared_assets(here, CART)
	let ships = get_shared_assets(here, SHIP)

	game.supply = {
		sources: find_supply_sources(game.command, carts, ships),
		carts: carts,
		ships: ships,
	}
}

function can_action_supply() {
	if (game.actions < 1)
		return false
	return can_supply()
}

function can_supply() {
	let here = get_lord_locale(game.command)
	let carts = get_shared_assets(here, CART)
	let ships = get_shared_assets(here, SHIP)
	let search = map_search(game.command, loc => supply_accept(loc, carts, ships), supply_adjacent, false)

	return search.next().done !== true
}

function goto_supply() {
	push_undo()
	log(`Supplied`)
	game.state = "supply_source"
	init_supply()
}

function get_supply_from_source(source) {
	let prov = 0

	if (has_exhausted_marker(source))
		return prov

	if (
		game.command === LORD_DEVON &&
		(game.where === LOC_EXETER ||
			game.where === LOC_LAUNCESTON ||
			game.where === LOC_PLYMOUTH ||
			game.where === LOC_WELLS ||
			game.where === LOC_ROCHESTER)
	)
		prov += 1

	if (source === LOC_LONDON || source === LOC_CALAIS) {
		prov += 2
		return prov
	} else if (is_city(source)) {
		prov += 1
		return prov
	}
	prov += 1
	return prov
}

function get_supply_from_source(source) {
	let prov = 0

	if (has_exhausted_marker(source)) {
		return prov
	}

	if (
		game.command === LORD_DEVON &&
		(game.where === LOC_EXETER ||
			game.where === LOC_LAUNCESTON ||
			game.where === LOC_PLYMOUTH ||
			game.where === LOC_WELLS ||
			game.where === LOC_ROCHESTER)
	) {
		prov += 1
	}

	if (source === LOC_LONDON || source === LOC_CALAIS) {
		prov += 3
	} else if (is_city(source)) {
		prov += 2
	}

	prov += 1
	return prov
}

states.supply_source = {
	inactive: "Supply",
	prompt() {
		view.prompt = "Supply: Select Supply Source."

		let list = []
		if (game.supply.carts > 0)
			list.push(`${game.supply.carts} Cart`)
		if (game.supply.ships > 0)
			list.push(`${game.supply.ships} Ship`)

		if (list.length > 0)
			view.prompt += " " + list.join(", ") + "."

		if (game.supply.sources.length > 0)
			game.supply.sources.forEach(l => gen_action_locale(l.locale))
	},
	locale(source) {
		let source_item = game.supply.sources.find(s => s.locale === source)
		if (source_item !== undefined) {
			let supply = 0
			let sea_supply = 0

			if (is_seaport(source))
				sea_supply = game.supply.ships

			if (!is_exile(get_lord_locale(game.command)))
				supply = Math.min(get_supply_from_source(source), Math.floor(game.supply.carts / source_item.distance))

			if (
				lord_has_capability(game.command, AOW_LANCASTER_HARBINGERS) ||
				lord_has_capability(game.command, AOW_YORK_HARBINGERS)
			) {
				supply = supply * 2
				sea_supply = sea_supply * 2
			}

			if (supply > 0 && sea_supply === 0) {
				logi(`Stronghold at %${source}`)
				add_lord_assets(game.command, PROV, supply)
				deplete_locale(source)
			} else if (sea_supply > 0 && supply === 0) {
				logi(`Seaport at %${source}`)
				add_lord_assets(game.command, PROV, sea_supply)
			} else {
				game.where = source
				goto_select_supply_type(supply, sea_supply)
				return
			}
		}
		end_supply()
	},
}

function end_supply() {
	spend_action(1)
	resume_command()
	game.supply = 0
}

function goto_select_supply_type(supply, sea_supply) {
	push_state("select_supply_type")
	game.count = supply
	game.what = sea_supply
}

function end_select_supply_type() {
	pop_state()
	end_supply()
}

states.select_supply_type = {
	inactive: "Supply",
	prompt() {
		view.prompt = `Supply: ${game.count} from Stronghold or ${game.what} from Port?`
		view.actions.stronghold = 1
		view.actions.port = 1
	},
	stronghold() {
		logi(`Stronghold at %${game.where}`)
		add_lord_assets(game.command, PROV, game.count)
		deplete_locale(game.where)
		end_select_supply_type()
	},
	port() {
		logi(`Seaport at %${game.where}`)
		add_lord_assets(game.command, PROV, game.what)
		end_select_supply_type()
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

function has_adjacent_enemy(loc) {
	for (let next of data.locales[loc].adjacent)
		if (has_unbesieged_enemy_lord(next))
			return true
	return false
}

function goto_forage() {
	push_undo()
	let here = get_lord_locale(game.command)
	if (!has_adjacent_enemy(here) && is_neutral_locale(here)) {
		let die = roll_die()
		if (die <= 4) {
			add_lord_assets(game.command, PROV, 1)
			log(`${HIT[die]}, Foraged at %${here}`)
			deplete_locale(here)
		} else {
			log(`${MISS[die]}, Forage Failure`)
		}
	} else if (has_adjacent_enemy(here) || is_favour_enemy(here)) {
		let die = roll_die()
		if (die <= 3) {
			add_lord_assets(game.command, PROV, 1)
			log(`${HIT[die]}, Foraged at %${here}`)
			deplete_locale(here)
		} else {
			log(`${MISS[die]}, Forage Failure`)
		}
	} else {
		add_lord_assets(game.command, PROV, 1)
		log(`Foraged at %${here}`)
		deplete_locale(here)
	}
	if (lord_has_capability(game.command, AOW_YORK_SCOURERS)) {
		add_lord_assets(game.command, PROV, 1)
		log(`1 Extra Provender (Scourers)`)
	}

	spend_action(1)
	resume_command()
}

// === ACTION: TAX ===

function is_possible_taxable_locale(loc) {
	return is_friendly_locale(loc) && !has_exhausted_marker(loc)
}

function get_possible_taxable_locales(lord) {
	let locales = []

	// Own seat
	if (is_possible_taxable_locale(data.lords[lord].seats[0]))
		locales.push(data.lords[lord].seats[0])

	// vassal seats
	for_each_vassal_with_lord(lord, v => {
		if (is_possible_taxable_locale(data.vassals[v].seat[0]))
			locales.push(data.vassals[v].seat[0])
	})

	// London
	if (is_possible_taxable_locale(LOC_LONDON))
		locales.push(LOC_LONDON)

	// Calais
	if (is_possible_taxable_locale(LOC_CALAIS))
		locales.push(LOC_CALAIS)

	// Harlech
	if (is_possible_taxable_locale(LOC_HARLECH))
		locales.push(LOC_HARLECH)

	return locales
}

function tax_accept(loc, possibles) {
	return (
		!is_exile(loc.locale) &&
		is_friendly_locale(loc.locale) &&
		!has_enemy_lord(loc.locale) &&
		possibles.includes(loc.locale)
	)
}

function tax_adjacent(here, lord) {
	let seaports = []
	if (is_seaport(here) && get_shared_assets(here, SHIP) > 0) {
		if (data.port_1.includes(here))
			seaports = data.port_1
		if (data.port_2.includes(here))
			seaports = data.port_2
		if (data.port_3.includes(here))
			seaports = data.port_3
	} else if (is_exile(here) && get_shared_assets(here, SHIP) > 0) {
		return find_ports_from_exile(here)
	}
	return data.locales[here].adjacent.concat(seaports)
}

function can_action_tax() {
	if (game.actions < 1)
		return false

	let possibles = get_possible_taxable_locales(game.command)

	let targets = map_search(game.command, l => tax_accept(l, possibles), tax_adjacent, false)

	return targets.next().done !== true
}

function get_taxable_locales(lord) {
	let possibles = get_possible_taxable_locales(game.command)

	let results = []
	let targets = map_search(game.command, l => tax_accept(l, possibles), tax_adjacent, false)

	for (let loc of targets)
		results.push(loc)

	return results
}

function goto_tax() {
	push_undo()
	push_state("tax")
	init_influence_check(game.command)
	game.where = NOWHERE
}

function end_tax() {
	pop_state()
	game.where = NOWHERE
	clear_undo()
	spend_action(1)
	resume_command()
}

function get_tax_amount(loc) {
	if (loc === LOC_LONDON || loc === LOC_CALAIS)
		return 3

	if (is_city(loc))
		return 2

	return 1
}

states.tax = {
	inactive: "Tax",
	prompt() {
		view.prompt = "Tax: Select the location to tax."

		if (game.where === NOWHERE) {
			get_taxable_locales(game.command).forEach(l => gen_action_locale(l.locale))
		} else {
			view.prompt = `Tax: Attempting to tax ${data.locales[game.where].name}. `
			prompt_influence_check()
		}
	},
	locale(loc) {
		game.where = loc
		if (loc === data.lords[game.command].seats[0]) {
			// Auto succeed without influence check at Lords seat.
			deplete_locale(game.where)

			log(`Taxed %${game.where}.`)
			add_lord_assets(game.command, COIN, get_tax_amount(game.where))
			end_tax()
		}
	},
	spend1: add_influence_check_modifier_1,
	spend3: add_influence_check_modifier_2,
	check() {
		let results = do_influence_check()
		if (
			(game.command === LORD_GLOUCESTER_1 || game.command === LORD_GLOUCESTER_2) &&
			(lord_has_capability(LORD_GLOUCESTER_1, AOW_YORK_SO_WISE_SO_YOUNG) ||
				lord_has_capability(LORD_GLOUCESTER_2, AOW_YORK_SO_WISE_SO_YOUNG))
		)
			add_lord_assets(game.command, COIN, 1)

		if (results.success) {
			deplete_locale(game.where)

			log(`Taxed %${game.where}.`)
			add_lord_assets(game.command, COIN, get_tax_amount(game.where))

			if (
				game.command === LORD_DEVON &&
				(game.where === LOC_EXETER ||
					game.where === LOC_LAUNCESTON ||
					game.where === LOC_PLYMOUTH ||
					game.where === LOC_WELLS ||
					game.where === LOC_ROCHESTER)
			)
				add_lord_assets(game.command, COIN, 1)
		} else {
			log(`Tax of %${game.where} failed.`)
		}
		end_tax()
	},
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
	let army = count_lord_all_forces(game.group)
	let needed_ships = army / 6
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
	if (has_enemy_lord(to) && lord_has_capability(game.command, AOW_LANCASTER_HIGH_ADMIRAL))
		return true
	return false
}

function can_march_path() {
	if (!is_first_action())
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
		let prov = count_group_assets(PROV)
		let cart = count_group_assets(CART)

		let overflow_prov = (prov / 2 - ships) * 2
		let overflow_cart = (cart / 2 - ships) * 2

		if (overflow_prov <= 0 && overflow_cart <= 0) {
			view.prompt = `Sail: Select a destination Seaport.`
			let from = 0
			switch (true) {
				case data.exile_1.includes(here):
					from = data.way_exile_1
					break
				case data.exile_2.includes(here):
					from = data.way_exile_2
					break
				case data.exile_3.includes(here):
					from = data.way_exile_3
					break
				case data.sea_1.includes(here):
					from = data.way_sea_1
					break
				case data.sea_2.includes(here):
					from = data.way_sea_2
					break
				case data.sea_3.includes(here):
					from = data.way_sea_3
					break
				case data.port_1.includes(here):
					from = data.way_port_1
					break
				case data.port_2.includes(here):
					from = data.way_port_2
					break
				case data.port_3.includes(here):
					from = data.way_port_3
					break
			}
			for (let to of from) {
				if (to === here)
					continue
				if (
					!has_enemy_lord(to) ||
					(has_enemy_lord(to) && lord_has_capability(game.command, AOW_LANCASTER_HIGH_ADMIRAL))
				)
					gen_action_locale(to)
			}
		} else if (overflow_cart > 0) {
			view.prompt = `Sailing with ${ships} Ships. Please discard ${overflow_cart} Cart`
			if (cart > 0) {
				for (let lord of game.group) {
					if (get_lord_assets(lord, CART) > 0)
						gen_action_cart(lord)
				}
			}
		} else if (overflow_prov > 0) {
			view.prompt = `Sailing with ${ships} Ships. Please discard ${overflow_prov} Provender`
			if (prov > 0) {
				for (let lord of game.group) {
					if (get_lord_assets(lord, PROV) > 0)
						gen_action_prov(lord)
				}
			}
		} else {
			view.prompt = "ERROR"
		}
	},
	prov: drop_prov,
	cart: drop_cart,
	locale(to) {
		log(`Sailed to %${to}${format_group_move()}.`)

		let from = get_lord_locale(game.command)

		for (let lord of game.group) {
			set_lord_locale(lord, to)
			set_lord_moved(lord, 1)
		}

		spend_all_actions()
		if (has_unbesieged_enemy_lord(to))
			goto_confirm_approach_sail()
		else
			resume_command()
	},
}

function goto_confirm_approach_sail() {
	game.state = "confirm_approach_sail"
}

states.confirm_approach_sail = {
	inactive: "Sail",
	prompt() {
		view.prompt = `Sail: Confirm Approach to enemy Lord.`
		view.group = game.group
		view.actions.approach = 1
	},
	approach() {
		push_undo()
		goto_battle()
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

	//march_with_group_3()
}

function init_battle(here) {
	game.battle = {
		where: here,
		round: 1,
		step: 0,
		relief: 0,
		attacker: game.active,
		ambush: 0,
		loser: 0,
		fought: 0, // flag all lords who participated
		array: [
			-1, -1, -1,
			-1, -1, -1,
		],
		valour: Array(lord_count).fill(0),
		routed_vassals: Array(lord_count).fill([]),
		engagements: [],
		reserves: [],
		retreated: 0,
		fled: [],
		routed: [],
		target: NOBODY,
		strikers: 0,
		a_hits: 0,
		d_hits: 0,
		fc: -1,
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
			set_add(game.battle.reserves, lord)
			if (
				lord_has_capability(lord, AOW_LANCASTER_EXPERT_COUNSELLORS) ||
				lord_has_capability(lord, AOW_LANCASTER_VETERAN_OF_FRENCH_WARS)
			)
				game.battle.valour[lord] = data.lords[lord].valour + 2
			else if (
				lord_has_capability(
					lord,
					AOW_LANCASTER_ANDREW_TROLLOPE || lord_has_capability(lord, AOW_LANCASTER_MY_FATHERS_BLOOD)
				) ||
				lord_has_capability(lord, AOW_LANCASTER_EDWARD) ||
				(lord_has_capability(lord, AOW_LANCASTER_LOYAL_SOMERSET) && get_lord_locale(LORD_MARGARET) === here)
			)
				game.battle.valour[lord] = data.lords[lord].valour + 1
			else
				game.battle.valour[lord] = data.lords[lord].valour
		}
	}

	// All defending lords to reserve
	for (let lord = first_enemy_lord; lord <= last_enemy_lord; ++lord) {
		if (get_lord_locale(lord) === here) {
			set_lord_fought(lord)
			set_add(game.battle.reserves, lord)
			if (
				lord_has_capability(lord, AOW_LANCASTER_EXPERT_COUNSELLORS) ||
				lord_has_capability(lord, AOW_LANCASTER_VETERAN_OF_FRENCH_WARS)
			)
				game.battle.valour[lord] = data.lords[lord].valour + 2
			else if (
				lord_has_capability(
					lord,
					AOW_LANCASTER_ANDREW_TROLLOPE || lord_has_capability(lord, AOW_LANCASTER_MY_FATHERS_BLOOD)
				) ||
				lord_has_capability(lord, AOW_LANCASTER_EDWARD) ||
				(lord_has_capability(lord, AOW_LANCASTER_LOYAL_SOMERSET) && get_lord_locale(LORD_MARGARET) === here)
			)
				game.battle.valour[lord] = data.lords[lord].valour + 1
			else
				game.battle.valour[lord] = data.lords[lord].valour
		}
	}

	goto_array_defender()
}

// === BATTLE: BATTLE ARRAY ===

// 0) Defender decides to stand for Battle, not Exile
// 1) Defender decides how he wants to array his lords
// 2) Defender positions front D
// 3) Attacker positions front A.
// 4) Defender plays event
// 5) ATtacker plays event

function has_friendly_reserves() {
	for (let lord of game.battle.reserves)
		if (is_friendly_lord(lord))
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
	let n = count_friendly_reserves()
	if (n === 1) {
		game.battle.array[A2] = pop_first_reserve()
		end_array_attacker()
	}
	if (n === 0)
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

// NOTE: The order here can be easily change to attacker/sally/defender/rearguard if desired.

function end_array_attacker() {
	goto_defender_events()
}

function end_array_defender() {
	goto_array_attacker()
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
					gen_action_lord(lord)
					done = false
				}
			}
		}
		if (game.who === NOBODY && done)
			view.actions.end_array = 1
		if (game.who !== NOBODY) {
			prompt_array_place_opposed(A1, A2, A3, D1, D3)
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
		if (game.who !== NOBODY) {
			if (array[D2] === NOBODY) {
				gen_action_array(D2)
			} else {
				if (array[D1] === NOBODY)
					gen_action_array(D1)
				if (array[D3] === NOBODY)
					gen_action_array(D3)
			}
		}
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
	goto_battle_rounds()
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
	goto_attacker_events()
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

function can_play_battle_events() {
	return false
}

function prompt_battle_events() {
	// both attacker and defender events

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
		default:
			break
	}
	resume_battle_events()
}

// === BATTLE: FLEE ===

function goto_battle_rounds() {
	set_active_defender()
	log_h4(`Battle Round ${game.battle.round}`)
	goto_flee()
}

function goto_flee() {
	game.state = "flee_battle"
}

function end_flee() {
	if (has_no_unrouted_forces()) {
		end_battle_round()
		return
	}

	set_active_enemy()

	if (game.active !== game.battle.attacker) {
		goto_reposition_battle()
	} else {
		goto_flee()
	}
}

states.flee_battle = {
	inactive: "Flee",
	prompt() {
		view.prompt = "Battle: Select Lords to Flee from the Field?"
		view.actions.done = 1

		for (let p = 0; p < 6; ++p) {
			if (is_friendly_lord(game.battle.array[p])) {
				gen_action_lord(game.battle.array[p])
			}
		}
	},
	done() {
		end_flee()
	},
	lord(lord) {
		log(`${lord_name[lord]} Fled the battle of %${game.battle.where}.`)
		set_add(game.battle.fled, lord)
		if (game.battle.reserves.includes(lord)) {
			array_remove_item(game.battle.reserves, lord)
		} else {
			for (let x = 0; x < 6; x++) {
				if (game.battle.array[x] === lord) {
					game.battle.array[x] = NOBODY
					break
				}
			}
		}
	},
}

// === BATTLE: REPOSITION ===

function slide_array(from, to) {
	game.battle.array[to] = game.battle.array[from]
	game.battle.array[from] = NOBODY
}

function goto_reposition_battle() {
	let array = game.battle.array

	// If all D routed.
	if (array[D1] === NOBODY && array[D2] === NOBODY && array[D3] === NOBODY) {
		log("No Defenders Remain.")
	}

	// If all A routed.
	if (array[A1] === NOBODY && array[A2] === NOBODY && array[A3] === NOBODY) {
		log("No Attackers Remain.")
	}

	set_active_defender()
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
		goto_reposition_advance()
	else
		goto_reposition_center()
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
		goto_reposition_center()
	else
		goto_first_engagement()
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
				if (array[A1] === NOBODY)
					gen_action_array(A1)
				if (array[A2] === NOBODY)
					gen_action_array(A2)
				if (array[A3] === NOBODY)
					gen_action_array(A3)
			} else {
				if (array[D1] === NOBODY)
					gen_action_array(D1)
				if (array[D2] === NOBODY)
					gen_action_array(D2)
				if (array[D3] === NOBODY)
					gen_action_array(D3)
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
				if (array[A1] !== NOBODY)
					gen_action_lord(game.battle.array[A1])
				if (array[A3] !== NOBODY)
					gen_action_lord(game.battle.array[A3])
			}
		} else {
			if (array[D2] === NOBODY) {
				if (array[D1] !== NOBODY)
					gen_action_lord(game.battle.array[D1])
				if (array[D3] !== NOBODY)
					gen_action_lord(game.battle.array[D3])
			}
		}

		if (game.who !== NOBODY) {
			let from = get_lord_array_position(game.who)
			if (from === A1 || from === A3)
				gen_action_array(A2)
			if (from === D1 || from === D3)
				gen_action_array(D2)
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

function get_battle_array(pos) {
	return game.battle.array[pos]
}

function filled(pos) {
	return get_battle_array(pos) !== NOBODY
}

function empty(pos) {
	return get_battle_array(pos) === NOBODY
}

const battle_strike_positions = [ D1, D2, D3, A1, A2, A3 ]

const battle_steps = [
	{ name: "Archery", hits: count_archery_hits },
	{ name: "Melee", hits: count_melee_hits },
]

function count_archery_hits(lord) {
	let hits = 0
	hits += get_lord_forces(lord, LONGBOWMEN) << 2
	hits += get_lord_forces(lord, BURGUNDIANS) << 2
	hits += get_lord_forces(lord, MILITIA)
	hits += get_lord_forces(lord, MERCENARIES)

	return hits
}

function count_melee_hits(lord) {
	let hits = 0
	hits += /*retinue*/ 3 << 1
	//hits += count_vassals_with_lord(lord) << 2
	if (lord_has_capability(lord, AOW_LANCASTER_CHEVALIERS))
		hits += get_lord_forces(lord, MEN_AT_ARMS) << 2
	else
		hits += get_lord_forces(lord, MEN_AT_ARMS) << 1
	hits += get_lord_forces(lord, MILITIA)
	hits += get_lord_forces(lord, MERCENARIES)
	hits += get_lord_forces(lord, BURGUNDIANS) << 1

	return hits
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
	for (let p = 0; p < 6; ++p)
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

function is_archery_step() {
	return game.battle.step === 0
}

function is_melee_step() {
	return game.battle.step === 1
}

function has_strike(pos) {
	return game.battle.ah[pos] > 0
}

function current_strike_positions() {
	return battle_strike_positions
}

// === BATTLE: ENGAGEMENTS

function determine_engagements() {
	let center = [ A2, D2 ]
	let engagements = [
		[ A1, D1 ],
		[ A3, D3 ],
	]
	let results = []

	for (let x = 0; x < engagements.length; x++) {
		let e = engagements[x]
		if (filled(e[0]) && filled(e[1])) {
			results.push(e)
		} else if (filled(e[0])) {
			set_add(center, e[1])
		} else if (filled(e[1])) {
			set_add(center, e[1])
		}
	}
	results.unshift(center)
	return results
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
	if (game.battle.ahits > 0) {
		return `${game.battle.ahits} Hit${game.battle.ahits > 1 ? "s" : ""}`
	} else if (game.battle.dhits > 0) {
		return `${game.battle.dhits} Hit${game.battle.dhits > 1 ? "s" : ""}`
	}
}

function goto_first_engagement() {
	game.battle.step = 0
	game.battle.engagements = determine_engagements()
	goto_engagement()
}

function goto_next_step() {
	let end = 2
	game.battle.step++
	if (game.battle.step >= end)
		end_engagement()
	else
		goto_engagement()
}

function goto_engagement() {
	if (is_battle_over()) {
		end_battle_round()
		return
	}

	log_h5(battle_steps[game.battle.step].name)

	// Generate hits
	game.battle.ah = [ 0, 0, 0, 0, 0, 0 ]

	for (let pos of current_strike_positions()) {
		let lord = get_battle_array(pos)
		if (lord !== NOBODY) {
			let hits = count_lord_hits(lord)

			game.battle.ah[pos] = hits
		}
	}

	resume_engagement()
}

function find_engagement_index(pos) {
	return game.battle.engagements.findIndex(e => e.includes(pos))
}

function end_engagement() {
	game.battle.engagements.shift()

	if (game.battle.engagements.length > 0) {
		game.battle.step = 0
		goto_engagement()
	} else {
		goto_end_battle_round()
	}
}

states.select_engagement = {
	inactive: "Select Engagment",
	prompt() {
		view.prompt = `Select the next engagement to resolve.`
		current_strike_positions()
			.filter(has_strike)
			.map(pos => game.battle.array[pos])
			.filter(is_friendly_lord)
			.forEach(gen_action_lord)
	},
	lord(lord) {
		let idx = find_engagement_index(get_lord_array_position(lord))
		let eng = game.battle.engagements[idx]
		array_remove(game.battle.engagements, idx)
		game.battle.engagements.unshift(eng)
		set_active_defender()
		goto_engagement_total_hits()
	},
}

function resume_engagement() {
	if (game.battle.engagements.length === 1 || is_melee_step()) {
		// only one engagement, so no choices on order
		goto_engagement_total_hits()
	} else {
		set_active_attacker()
		game.state = "select_engagement"
	}
}

// === BATTLE: TOTAL HITS (ROUND UP) ===

// === BATTLE: TOTAL HITS (ROUND UP) ===

function goto_engagement_total_hits() {
	let ahits = 0
	let dhits = 0

	for (let pos of game.battle.engagements[0]) {
		if (pos === A1 || pos === A2 || pos === A3) {
			ahits += game.battle.ah[pos]
		} else {
			dhits += game.battle.ah[pos]
		}
	}

	if (ahits & 1)
		ahits = (ahits >> 1) + 1
	else
		ahits = ahits >> 1

	if (dhits & 1)
		dhits = (dhits >> 1) + 1
	else
		dhits = dhits >> 1

	game.battle.ahits = ahits
	game.battle.dhits = dhits

	log_br()
	log_hits(game.battle.ahits, "Hit")
	game.battle.target = NOBODY
	goto_defender_assign_hits()
}

function continue_engagement() {
	current_strike_positions()
		.map(p => get_battle_array(p))
		.filter(l => l !== NOBODY)
		.filter(will_lord_rout)
		.forEach(rout_lord)

	end_assign_hits()
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

function goto_defender_assign_hits() {
	set_active_defender()
	if (game.battle.ahits === 0)
		return end_defender_assign_hits()

	if (no_remaining_targets())
		return end_defender_assign_hits()

	goto_assign_hits()
}

function goto_assign_hits() {
	let lords_in_engagement = game.battle.engagements[0].filter(p => is_friendly_lord(get_battle_array(p)))

	if (game.battle.target === NOBODY && lords_in_engagement.length > 1) {
		game.state = "select_target"
	} else {
		if (game.battle.target === NOBODY)
			game.battle.target = lords_in_engagement.at(0)

		game.state = "assign_hits"
	}
}

function end_defender_assign_hits() {
	log_hits(game.battle.dhits, "Hit")
	game.battle.target = NOBODY
	goto_attacker_assign_hits()
}

function no_remaining_targets() {
	return !game.battle.engagements[0]
		.filter(p => is_friendly_lord(get_battle_array(p)))
		.map(get_battle_array)
		.some(lord_has_unrouted_units)
}

function goto_attacker_assign_hits() {
	set_active_attacker()
	if (game.battle.dhits === 0)
		return end_attacker_assign_hits()

	if (no_remaining_targets())
		return end_attacker_assign_hits()

	goto_assign_hits()
}

function end_attacker_assign_hits() {
	continue_engagement()
}

states.select_target = {
	inactive: "Select Target Lord",
	prompt() {
		view.prompt = "Battle: Select Lord to Assign Hits to."
		game.battle.engagements[0]
			.filter(has_strike)
			.map(get_battle_array)
			.filter(is_friendly_lord)
			.forEach(gen_action_lord)
	},
	lord(lord) {
		game.battle.target = get_lord_array_position(lord)
		game.state = "assign_hits"
	},
}

function end_assign_hits() {
	for (let pos of game.battle.engagements[0]) {
		game.battle.ah[pos] = 0
	}
	game.battle.target = NOBODY
	game.battle.ahits = 0
	game.battle.dhits = 0

	goto_next_step()
}

function for_each_target(fn) {
	let target = game.battle.target

	fn(game.battle.array[target])
}

function prompt_hit_forces() {
	for_each_target(lord => {
		if (get_lord_forces(lord, RETINUE) > 0)
			gen_action_retinue(lord)
		if (get_lord_forces(lord, BURGUNDIANS) > 0)
			gen_action_burgundians(lord)
		if (get_lord_forces(lord, MERCENARIES) > 0)
			gen_action_mercenaries(lord)
		if (get_lord_forces(lord, LONGBOWMEN) > 0)
			gen_action_longbowmen(lord)
		if (get_lord_forces(lord, MEN_AT_ARMS) > 0)
			gen_action_men_at_arms(lord)
		if (get_lord_forces(lord, MILITIA) > 0)
			gen_action_militia(lord)

		for_each_vassal_with_lord(lord, v => {
			if (!set_has(game.battle.routed_vassals[lord], v))
				gen_action_vassal(v)
		})
	})
}

states.assign_hits = {
	get inactive() {
		return format_strike_step() + " \u2014 Assign " + format_hits()
	},
	prompt() {
		view.prompt = `${format_strike_step()}: Assign ${format_hits()} to units.`

		prompt_hit_forces()
	},
	retinue(lord) {
		action_assign_hits(lord, RETINUE)
	},
	burgundians(lord) {
		action_assign_hits(lord, BURGUNDIANS)
	},
	mercenaries(lord) {
		action_assign_hits(lord, MERCENARIES)
	},
	longbowmen(lord) {
		action_assign_hits(lord, LONGBOWMEN)
	},
	men_at_arms(lord) {
		action_assign_hits(lord, MEN_AT_ARMS)
	},
	militia(lord) {
		action_assign_hits(lord, MILITIA)
	},
	vassal(vassal) {
		action_assign_hits(get_lord_with_vassal(vassal), VASSAL, vassal)
	},
}

function rout_lord(lord) {
	log(`L${lord} Routed.`)

	let pos = get_lord_array_position(lord)

	// Remove from battle array
	game.battle.array[pos] = NOBODY
	set_add(game.battle.routed, lord)
}

function lord_has_unrouted_troops(lord) {
	// Don't check here for Retinue or Vassals.
	for (let x = 2; x < FORCE_TYPE_COUNT; x++) {
		if (get_lord_forces(lord, x) > 0)
			return true
	}
	return false
}

function lord_has_routed_troops(lord) {
	// Don't check here for Retinue or Vassals.
	for (let x = 2; x < FORCE_TYPE_COUNT; x++) {
		if (get_lord_routed_forces(lord, x) > 0)
			return true
	}
	return false
}

function will_lord_rout(lord) {
	if (get_lord_routed_forces(lord, RETINUE) > 0)
		return true
	if (!lord_has_unrouted_troops(lord))
		return true
	return false
}

function rout_unit(lord, type, special) {
	if (type === VASSAL) {
		rout_vassal(lord, special)
	} else {
		add_lord_forces(lord, type, -1)
		add_lord_routed_forces(lord, type, 1)
	}
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

function get_lord_remaining_valour(lord) {
	return game.battle.valour[lord]
}

function spend_valour(lord) {
	game.battle.valour[lord] = game.battle.valour[lord] - 1
}

function check_protection_capabilities(protection) {
	if (game.what === MEN_AT_ARMS) {
		if (lord_has_capability(game.who, AOW_LANCASTER_CHURCH_BLESSINGS)) {
			protection += 1
		}
	}
	if (game.what === RETINUE) {
		if (lord_has_capability(game.who, AOW_LANCASTER_MONTAGU))
			protection += 1
	}
	if ((game.what === RETINUE || game.what === VASSAL) && is_archery_step()) {
		if (lord_has_capability(game.who, AOW_LANCASTER_BARDED_HORSE))
			protection -= 1
	}
	if ((game.what === RETINUE || game.what === VASSAL) && is_melee_step()) {
		if (lord_has_capability(game.who, AOW_LANCASTER_BARDED_HORSE))
			protection += 1
	}

	if (game.what === MEN_AT_ARMS) {
		if (lord_has_capability(game.who, AOW_YORK_BARRICADES) && has_favoury_marker(here))
			protection += 1
	}
	if (game.what === MEN_AT_ARMS) {
		if (lord_has_capability(game.who, AOW_LANCASTER_CHEVALIERS) && is_archery_step()) {
			protection -= 1
		}
	}
	if (game.what === MILITIA || game.what === LONGBOWMEN) {
		if (lord_has_capability(game.who, AOW_YORK_BARRICADES) && has_favoury_marker(here))
			protection += 1
	}
	return protection
}

function action_assign_hits(lord, type, special) {
	if (game.who !== lord) {
		game.who = lord
		log(`L${lord}`)
	}
	let protection = check_protection_capabilities(FORCE_PROTECTION[type])
	let extra = ""

	if (assign_hit_roll(get_force_name(lord, type, special), protection, extra)) {
		if (get_lord_remaining_valour(lord) > 0) {
			game.state = "spend_valour"
			game.what = type
			if (game.what === VASSAL)
				game.where = special
		} else {
			rout_unit(lord, type, special)
			finish_action_assign_hits(lord)
		}
	} else {
		finish_action_assign_hits(lord)
	}
}

function finish_action_assign_hits(lord) {
	if (game.battle.ahits)
		game.battle.ahits--
	else
		game.battle.dhits--

	if (!lord_has_unrouted_units(lord)) {
		game.battle.target = NOBODY
	}

	if (game.active === game.battle.attacker)
		goto_attacker_assign_hits()
	else
		goto_defender_assign_hits()
}

states.spend_valour = {
	inactive: "Spend Valour",
	prompt() {
		view.prompt = `Spend Valour: Reroll Hit on ${get_force_name(game.who, game.what, game.where)}?`
		gen_action("valour", game.who)
		view.actions.pass = 1
	},
	pass() {
		rout_unit(game.who, game.what, game.where)
		finish_action_assign_hits(game.who)
	},
	valour() {
		let protection = check_protection_capabilities(FORCE_PROTECTION[game.what])

		spend_valour(game.who)
		log(`Reroll:`)
		if (assign_hit_roll(get_force_name(game.who, game.what), protection, "")) {
			rout_unit(game.who, game.what)
			finish_action_assign_hits(game.who)
		} else {
			finish_action_assign_hits(game.who)
		}
	},
}

function goto_end_battle_round() {
	end_battle_round()
}

// === BATTLE: NEW ROUND ===

function end_battle_round() {
	let attacker_loser = null
	set_active_attacker()
	if (has_no_unrouted_forces()) {
		attacker_loser = game.active
	}

	let defender_loser = null
	set_active_defender()
	if (has_no_unrouted_forces()) {
		defender_loser = game.active
	}

	if (attacker_loser !== null || defender_loser !== null) {
		if (attacker_loser === null)
			game.battle.loser = defender_loser
		else if (defender_loser === null)
			game.battle.loser = attacker_loser
		else
			game.battle.loser = BOTH

		end_battle()
		return
	}

	game.battle.round++

	game.battle.ambush = 0

	set_active_defender()
	goto_flee()
}

// === ENDING THE BATTLE ===

// Ending the Battle - optimized from rules as written
//   Loser retreat / withdraw / remove
//   Loser losses
//   Loser service
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
	if (game.battle.loser === BOTH)
		log_h4(`Both Sides Lost`)
	else
		log_h4(`${game.battle.loser} Lost`)

	game.battle.array = 0

	goto_battle_influence()
}

function get_enemy_defeated_lords() {
	return game.battle.fled.concat(game.battle.routed).filter(l => !is_friendly_lord(l))
}

function get_defeated_lords() {
	return game.battle.fled.concat(game.battle.routed).filter(is_friendly_lord)
}

function goto_battle_influence() {
	if (game.battle.loser !== BOTH) {
		set_active_loser()

		let influence = get_defeated_lords()
			.map(l => data.lords[l].influence + count_vassals_with_lord(l))
			.reduce((p, c) => p + c, 0)

		reduce_influence(influence)
		goto_battle_spoils()
	} else {
		goto_death_or_disband()
	}
}
// === ENDING THE BATTLE: LOSSES ===

function has_battle_losses() {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (lord_has_routed_troops(lord))
			return true
	return false
}

function goto_battle_losses_victor() {
	clear_undo()
	set_active_victor()
	game.who = NOBODY
	if (has_battle_losses())
		log_h4(`${game.active} Losses`)
	resume_battle_losses()
}

function resume_battle_losses() {
	game.state = "battle_losses"
	if (!has_battle_losses())
		goto_death_or_disband()
}

function action_losses(lord, type) {
	let protection = FORCE_PROTECTION[type]

	if (game.who !== lord) {
		log(`L${lord}`)
		game.who = lord
	}

	let die = roll_die()
	if (die <= protection) {
		logi(`${get_force_name(lord, type)} ${range(protection)}: ${MISS[die]}`)
		add_lord_routed_forces(lord, type, -1)
		add_lord_forces(lord, type, 1)
	} else {
		logi(`${get_force_name(lord, type)} ${range(protection)}: ${HIT[die]}`)
		add_lord_routed_forces(lord, type, -1)
	}

	resume_battle_losses()
}

states.battle_losses = {
	inactive: "Losses",
	prompt() {
		view.prompt = "Losses: Determine the fate of your Routed units."
		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
			if (is_lord_on_map(lord) && lord_has_routed_troops(lord)) {
				if (get_lord_routed_forces(lord, MERCENARIES) > 0)
					gen_action_routed_mercenaries(lord)
				if (get_lord_routed_forces(lord, LONGBOWMEN) > 0)
					gen_action_routed_longbowmen(lord)
				if (get_lord_routed_forces(lord, BURGUNDIANS) > 0)
					gen_action_routed_burgundians(lord)
				if (get_lord_routed_forces(lord, MEN_AT_ARMS) > 0)
					gen_action_routed_men_at_arms(lord)
				if (get_lord_routed_forces(lord, MILITIA) > 0)
					gen_action_routed_militia(lord)
			}
		}
	},
	routed_mercenaries(lord) {
		action_losses(lord, MERCENARIES)
	},
	routed_longbowmen(lord) {
		action_losses(lord, LONGBOWMEN)
	},
	routed_burgundians(lord) {
		action_losses(lord, BURGUNDIANS)
	},
	routed_men_at_arms(lord) {
		action_losses(lord, MEN_AT_ARMS)
	},
	routed_militia(lord) {
		action_losses(lord, MILITIA)
	},
}

// === ENDING THE BATTLE: SPOILS (VICTOR) ===

function log_spoils() {
	if (game.spoils[PROV] > 0)
		logi(game.spoils[PROV] + " Provender")
	if (game.spoils[CART] > 0)
		logi(game.spoils[CART] + " Cart")
}

function is_neutral_locale(loc) {
	return !has_favourl_marker(loc) && !has_favoury_marker(loc)
}

function has_favour_in_locale(side, loc) {
	if (side === YORK)
		return has_favoury_marker(loc)
	else
		return has_favourl_marker(loc)
}

function calculate_spoils() {
	let spoils_base = get_enemy_defeated_lords()
		.map(l => [get_lord_assets(l, PROV), get_lord_assets(l, CART)])
		.reduce((p, c) => [[p[0][0] + c[0], p[0][1] + c[1]]], [[0, 0]])
		.map(s => is_neutral_locale(game.battle.where) ? [Math.ceil(s[0] / 2), Math.ceil(s[1] / 2)] : s)
		.map(s => has_favour_in_locale(game.battle.loser, game.battle.where) ? [0, 0] : s)
		.forEach(s => {
			add_spoils(PROV, s[0])
			add_spoils(CART, s[1])
		})
}

function find_lone_victor() {
	let lord = NOBODY
	for (let x = 0; x < 6; x++) {
		if (is_friendly_lord(get_battle_array(x))) {
			if (lord === NOBODY)
				lord = get_battle_array(x)
			else
				return NOBODY
		}
	}
	return lord
}

function goto_battle_spoils() {
	set_active_victor()
	// determine Battle Spoils
	calculate_spoils()
	if (has_any_spoils() && has_friendly_lord(game.battle.where)) {
		log_h4("Spoils")
		log_spoils()
		game.state = "battle_spoils"
		game.who = find_lone_victor()
	} else {
		end_battle_spoils()
	}
}

function end_battle_spoils() {
	game.who = NOBODY
	game.spoils = 0

	goto_battle_losses_victor()
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

function goto_death_or_disband() {
	if (get_defeated_lords().length > 0)
		game.state = "death_or_disband"
	else
		end_death_or_disband()
}

function end_death_or_disband() {
	set_active_enemy()

	if (get_defeated_lords().length > 0)
		goto_death_or_disband()
	else
		goto_battle_aftermath()
}

states.death_or_disband = {
	inactive: "Death or Disband",
	prompt() {
		let done = true
		view.prompt = `Death or Disband: Select lords to roll for Death or Disband.`
		get_defeated_lords().forEach(l => {
			gen_action_lord(l)
			done = false
		})

		if (done) {
			view.actions.done = 1
		}
	},
	lord(lord) {
		let threshold = 2
		let modifier = 0
		let roll = roll_die()

		if (game.battle.fled.includes(lord)) {
			modifier = -2
		}

		let success = threshold >= roll + modifier

		log(`Lord ${lord_name[lord]} ${success ? "Survived" : "Died"}: (${range(2)}) ${success ? HIT[roll] : MISS[roll]} ${modifier < 0 ? "(-2 Fled)" : ""}`)

		disband_lord(lord, !success)

		if (game.battle.fled.includes(lord)) {
			set_delete(game.battle.fled, lord)
		} else {
			set_delete(game.battle.routed, lord)
		}
	},
	done() {
		end_death_or_disband()
	},
}

// === ENDING THE BATTLE: SERVICE (LOSER) ===

function goto_battle_aftermath() {
	set_active(game.battle.attacker)

	// Routed Vassals get disbanded
	for (let lord = first_lord; lord <= last_lord; lord++) {
		if (is_lord_on_map(lord)) {
			for (let vassal of game.battle.routed_vassals[lord]) {
				disband_vassal(vassal)
			}
		}
	}

	// Events
	discard_events("hold")

	// Recovery
	spend_all_actions()

	game.battle = 0
	march_with_group_3()
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

function set_lord_feed_requirements() {
	// Count how much food each lord needs
	let n = 0
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
		if (get_lord_moved(lord)) {
			n = Math.ceil(count_lord_all_forces(lord) / 6)
			set_lord_unfed(lord, n)
		} else
			set_lord_unfed(lord, 0)
	}
}

function goto_feed() {
	log_br()

	set_lord_feed_requirements()
	if (has_friendly_lord_who_must_feed()) {
		push_state("feed")
	} else {
		if (game.state !== "disembark")
			goto_remove_markers()
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
			view.prompt = `Feed: You must pillage to feed your troops.`
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
				if (is_lord_unfed(lord)) {
					view.actions.pillage = 1
					done = false
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
	pillage() {
		push_undo()
		set_lord_feed_requirements()
		goto_pillage_food()
	},
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
	pop_state()
	if (game.state !== "disembark")
		goto_remove_markers()
}

// === LEVY & CAMPAIGN: PAY ===

function reset_unpaid_lords() {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; lord++) {
		if (is_lord_unfed(lord)) {
			set_lord_unfed(lord, Math.ceil(count_lord_all_forces(lord) / 6))
		}
	}
}

function goto_pay() {
	log_br()
	let n = 0
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
		if (
			game.active === LANCASTER &&
			is_lord_on_map(lord) &&
			lord_has_capability(LORD_NORTHUMBERLAND_L, AOW_LANCASTER_PERCYS_POWER) &&
			data.locales[get_lord_locale(LORD_NORTHUMBERLAND_L)].region === "North" &&
			data.locales[get_lord_locale(lord)].region === "North"
		) {
			set_lord_unfed(lord, 0)
		} else {
			n = Math.ceil(count_lord_all_forces(lord) / 6)
			set_lord_unfed(lord, n)
		}
	}
	game.state = "pay"
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

		if (done) {
			view.prompt = "Pay: You must Pillage and/or Disband."
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
				if (is_lord_unfed(lord)) {
					view.actions.pillage = 1
					done = false
				}
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
	pillage() {
		push_undo()
		reset_unpaid_lords()
		goto_pillage_coin()
	},
	end_pay() {
		push_undo()
		end_pay()
	},
	card: action_held_event,
}

function end_pay() {
	game.who = NOBODY
	set_active_enemy()
	if (game.active === P2) {
		goto_pay()
	} else
		goto_pay_lords()
}

function has_friendly_lord_who_must_pay_troops() {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (is_lord_unfed(lord))
			return true
	return false
}

function goto_pay_lords() {
	clear_undo()
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; lord++) {
		if (is_lord_on_map(lord))
			set_lord_unfed(lord, 1)
	}

	if (has_friendly_lord_who_must_pay_troops()) {
		game.who = NOBODY
		game.state = "pay_lords"
	} else {
		end_pay_lords()
	}
}

function end_pay_lords() {
	set_active_enemy()

	if (game.active === P2)
		goto_pay_lords()
	else
		goto_pay_vassals()
}

states.pay_lords = {
	inactive: "Pay Lords",
	prompt() {
		view.prompt = "Pay Lords in Influence or Disband them."
		prompt_held_event()
		let done = true

		if (game.who === NOBODY) {
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; lord++) {
				if (is_lord_on_map(lord) && is_lord_unfed(lord)) {
					gen_action_lord(lord)
					done = false
				}
			}

			if (done) {
				view.actions.done = 1
			}
		} else {
			view.actions.disband = 1
			view.actions.pay = 1
		}
	},
	lord(lord) {
		game.who = lord
	},
	disband() {
		push_undo()
		disband_lord(game.who)
		game.who = NOBODY
	},
	pay() {
		push_undo()
		reduce_influence(is_exile(get_lord_locale(game.who)) ? 2 : 1)
		set_lord_moved(game.who, 0)
		game.who = NOBODY
	},
	done() {
		end_pay_lords()
	},
}

function goto_pay_vassals() {
	clear_undo()
	let vassal_to_pay = false

	for (let v = first_vassal; v < last_vassal; v++) {
		if (
			is_vassal_mustered(v) &&
			is_friendly_lord(get_lord_with_vassal(v)) &&
			get_vassal_locale(v) === CALENDAR + current_turn()
		) {
			vassal_to_pay = true
		}
	}
	if (vassal_to_pay) {
		game.state = "pay_vassals"
		game.what = NOTHING
	} else {
		end_pay_vassals()
	}
}

function end_pay_vassals() {
	set_active_enemy()

	if (game.active === P1) {
		goto_muster_exiles()
	} else {
		goto_pay_vassals()
	}
}

states.pay_vassals = {
	inactive: "Pay Vassals",
	prompt() {
		let done = true
		view.prompt = "You may pay or disband vassals in the next calendar box."
		if (game.what === NOTHING) {
			for (let v = first_vassal; v < last_vassal; v++) {
				if (
					is_vassal_mustered(v) &&
					is_friendly_lord(get_lord_with_vassal(v)) &&
					get_vassal_locale(v) === CALENDAR + current_turn()
				) {
					gen_action_vassal(v)
					done = false
				}
			}

			if (done) {
				view.actions.done = 1
			}
		} else {
			view.actions.pay = 1
			view.actions.disband = 1
		}
	},
	vassal(v) {
		game.what = v
	},
	pay() {
		push_undo()
		pay_vassal(game.what)
		reduce_influence(1)
		game.what = NOBODY
	},
	disband() {
		push_undo()
		disband_vassal(game.what)
		game.what = NOBODY
	},
	done() {
		end_pay_vassals()
	},
}

function goto_ready_vassals() {
	for (let vassal = first_vassal; vassal <= last_vassal; vassal++) {
		if (is_vassal_unavailable(vassal) && get_vassal_locale(vassal) === CALENDAR + current_turn()) {
			set_vassal_ready(vassal)
			set_vassal_on_map(vassal, data.vassals[vassal].seat[0])
		}
	}

	goto_levy_muster()
}

function goto_muster_exiles() {
	for (let x = first_friendly_lord; x <= last_friendly_lord; x++) {
		if (get_lord_locale(x) === current_turn() + CALENDAR && get_lord_in_exile(x)) {
			game.state = "muster_exiles"
			return
		}
	}
	end_muster_exiles()
}

function end_muster_exiles() {
	set_active_enemy()

	if (game.active === P1) {
		if (!check_disband_victory()) {
			goto_ready_vassals()
		}
	} else {
		goto_muster_exiles()
	}
}

states.muster_exiles = {
	inactive: "Muster Exiles",
	prompt() {
		view.prompt = "Muster Exiled Lords."
		let done = true

		if (game.who === NOBODY) {
			for (let x = first_friendly_lord; x <= last_friendly_lord; x++) {
				if (get_lord_locale(x) === current_turn() + CALENDAR && get_lord_in_exile(x)) {
					gen_action_lord(x)
					done = false
				}
			}
		} else {
			get_valid_exile_box(game.who).forEach(gen_action_locale)
		}

		if (done) {
			view.actions.done = true
		}
	},
	lord(lord) {
		game.who = lord
	},
	locale(loc) {
		muster_lord_in_exile(game.who, loc)
		game.who = NOBODY
	},
	done() {
		end_muster_exiles()
	},
}

function muster_lord_in_exile(lord, exile_box) {
	remove_lord_from_exile(lord)
	muster_lord(lord, exile_box)
}

function get_valid_exile_box() {
	return [ LOC_BURGUNDY, LOC_FRANCE, LOC_IRELAND, LOC_SCOTLAND ].filter(l => has_favour_in_locale(game.active, l))
}

// === PILLAGE ===

function goto_pillage_food() {
	push_state("pillage")
	game.what = PROV
}

function goto_pillage_coin() {
	push_state("pillage")
	game.what = COIN
}

function end_pillage() {
	pop_state()
}

function can_pillage(loc) {
	return !is_exile(loc) && !has_exhausted_marker(loc)
}

states.pillage = {
	inactive: "Pillage",
	prompt() {
		view.prompt = `Pillage: Pillage the locales where your ${game.what === PROV ? "unfed" : "unpaid"} lords are.`

		let done = true
		for (let x = first_friendly_lord; x <= last_friendly_lord; x++) {
			if (is_lord_on_map(x) && is_lord_unfed(x) && can_pillage(get_lord_locale(x))) {
				gen_action_locale(get_lord_locale(x))
				done = false
			}
		}

		if (done) {
			view.prompt = `Pillage: Unable to Pillage, you must disband your ${game.what === PROV ? "unfed" : "unpaid"} lords.`
			for (let x = first_friendly_lord; x <= last_friendly_lord; x++) {
				if (is_lord_on_map(x) && is_lord_unfed(x)) {
					gen_action_lord(x)
					done = false
				}
			}
		}

		if (done) {
			view.prompt = `Pillage: Done.`
			view.actions.done = 1
		}
	},
	locale(loc) {
		// pillage the Locale
		game.where = loc
		goto_pillage_locale()
	},
	lord(lord) {
		disband_influence_penalty(lord)
		disband_lord(lord)
	},
	done() {
		end_pillage()
	},
}

function goto_pillage_locale() {
	push_state("pillage_locale")
}

function end_pillage_locale() {
	pop_state()
	end_pillage()
}

states.pillage_locale = {
	inactive: "Pillage",
	prompt() {
		view.prompt = `Pillage: Choose Lord to Pillage ${data.locales[game.where].name}.`

		for (let x = first_friendly_lord; x <= last_friendly_lord; x++) {
			if (get_lord_locale(x) === game.where && is_lord_unfed(x)) {
				gen_action_lord(x)
			}
		}
	},
	lord(lord) {
		// Pillage
		// Same values as Taxing.
		let num = get_tax_amount(game.where)
		add_lord_assets(lord, COIN, num)
		add_lord_assets(lord, PROV, num)
		reduce_influence(2 * num)

		add_exhausted_marker(game.where)
		data.locales[game.where].adjacent.forEach(shift_favor_away)

		end_pillage_locale()
	},
}

// === LEVY & CAMPAIGN: DISBAND ===

function disband_lord(lord, permanently = false) {
	let here = get_lord_locale(lord)
	let turn = current_turn()

	if (permanently) {
		log(`Removed L${lord}.`)
		set_lord_locale(lord, NOWHERE)
	} else {
		set_lord_cylinder_on_calendar(lord, turn + (6 - data.lords[lord].influence))
		log(`Disbanded L${lord} to ${get_lord_calendar(lord)}.`)
	}

	discard_lord_capability_n(lord, 0)
	discard_lord_capability_n(lord, 1)
	game.pieces.assets[lord] = 0
	game.pieces.forces[lord] = 0
	game.pieces.routed[lord] = 0

	set_lord_moved(lord, 0)

	for_each_vassal_with_lord(lord, v => {
		disband_vassal(v)
	})
}

// === CAMPAIGN: REMOVE MARKERS ===

function goto_remove_markers() {
	clear_lords_moved()
	goto_command_activation()
}

// === END CAMPAIGN: GAME END ===

function check_campaign_victory_york(inc_exiles = false) {
	for (let lord = first_lancaster_lord; lord <= last_lancaster_lord; ++lord)
		if (
			is_lord_on_map(lord) ||
			(inc_exiles && get_lord_locale(lord) === CALENDAR + current_turn() + 1 && get_lord_in_exile(lord))
		)
			return false
	return true
}

function check_campaign_victory_lancaster(inc_exiles = false) {
	for (let lord = first_york_lord; lord <= last_york_lord; ++lord)
		if (
			is_lord_on_map(lord) ||
			(inc_exiles && get_lord_locale(lord) === CALENDAR + current_turn() + 1 && get_lord_in_exile(lord))
		)
			return false
	return true
}

function check_campaign_victory() {
	let york_v = check_campaign_victory_york(true)
	let lancaster_v = check_campaign_victory_lancaster(true)

	if (york_v && lancaster_v) {
		goto_game_over("Draw", "The game ended in a draw.")
		return true
	} else if (york_v) {
		goto_game_over(P1, `${YORK} won a Campaign Victory!`)
		return true
	} else if (lancaster_v) {
		goto_game_over(P2, `${LANCASTER} won a Campaign Victory!`)
		return true
	}

	return false
}

function check_disband_victory() {
	let york_v = check_campaign_victory_york()
	let lancaster_v = check_campaign_victory_lancaster()

	if (york_v && lancaster_v) {
		goto_game_over("Draw", "The game ended in a draw.")
		return true
	} else if (york_v) {
		goto_game_over(P1, `${YORK} won a Campaign Victory!`)
		return true
	} else if (lancaster_v) {
		goto_game_over(P2, `${LANCASTER} won a Campaign Victory!`)
		return true
	}

	return false
}

function check_scenario_end_victory() {
	if (current_turn() === scenario_last_turn[game.scenario]) {
		// Scenario End Victory

		if (game.ip === 0)
			goto_game_over("Draw", "The game ended in a draw.")
		else if (game.ip > 0)
			goto_game_over(LANCASTER, `${LANCASTER} won with ${game.ip} Influence.`)
		else
			goto_game_over(YORK, `${YORK} won with ${Math.abs(game.ip)} Influence.`)

		return true
	}
	return false
}

function check_threshold_victory() {
	// This needs to change to account for graduated victory thresholds in some scenarios.

	if (Math.abs(game.ip) > game.victory_check) {
		if (game.ip > 0)
			goto_game_over(LANCASTER, `${LANCASTER} won with ${game.ip} Influence.`)
		else
			goto_game_over(YORK, `${YORK} won with ${Math.abs(game.ip)} Influence.`)

		return true
	}

	return false
}

function goto_end_campaign() {
	log_h1("End Campaign")
	set_active(P1)
	tides_of_war()
}

function goto_game_end() {
	// GAME END

	if (!(check_scenario_end_victory() || check_campaign_victory() || check_threshold_victory())) {
		if (GROW_TURNS.includes(current_turn())) {
			do_grow()
		} else if (WASTE_TURNS.includes(current_turn())) {
			do_waste()
		} else {
			goto_reset()
		}
	}
}

function do_grow() {
	log("Grow:")
	logi("Changing all Depleted locales to Normal.")
	logi("Changing all Exhausted locales to Depleted.")

	for (let x = first_locale; x <= last_locale; x++) {
		refresh_locale(x)
	}
	goto_reset()
}

function do_waste() {
	log("Waste:")
	logi("Removing half of all lords provinder, carts, and ships.")
	logi("Resetting Lords Coin and Troops to initial values.")
	for (let x = first_lord; x <= last_lord; x++) {
		if (is_lord_on_map(x)) {
			do_lord_waste(x)
		}
	}

	goto_reset()
}

function do_lord_waste(lord) {
	;[ PROV, CART, SHIP ].forEach(a => remove_half(lord, a))
	set_lord_assets(lord, COIN, data.lords[lord].assets.coin)
	muster_lord_forces(lord)
}

function remove_half(lord, type) {
	set_lord_assets(lord, type, Math.ceil(get_lord_assets(lord, type) / 2))
}

// === END CAMPAIGN: WASTAGE ===
// TODO : WASTE
// function goto_wastage() {
// 	if (game.turn === 5 || game.turn === 10) {
// 	clear_lords_moved()
// 	let done = true
// 	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
// 		if (check_lord_wastage(lord)) {
// 			set_lord_moved(lord, 3)
// 			done = false
// 		}
// 	}
// 	if (done)
// 		end_wastage()
// 	else
// 		game.state = "wastage"
// }
// 	else {
// 		push_undo()
// 		goto_reset()
// 	}
// }

// function check_lord_wastage(lord) {
// 	if (get_lord_assets(lord, PROV) > 1)
// 		return true
// 	if (get_lord_assets(lord, COIN) > 1)
// 		return true
// 	if (get_lord_assets(lord, CART) > 1)
// 		return true
// 	if (get_lord_assets(lord, SHIP) > 1)
// 		return true
// 	return false
// }

// function prompt_wastage(lord) {
// 	if (get_lord_assets(lord, PROV) > 0)
// 		gen_action_prov(lord)
// 	if (get_lord_assets(lord, COIN) > 0)
// 		gen_action_coin(lord)
// 	if (get_lord_assets(lord, CART) > 0)
// 		gen_action_cart(lord)
// 	if (get_lord_assets(lord, SHIP) > 0)
// 		gen_action_ship(lord)
// 	for (let i = 0; i < 2; ++i) {
// 		let c = get_lord_capability(lord, i)
// 		if (c !== NOTHING)
// 			gen_action_card(c)
// 	}
// }

// function action_wastage(lord, type) {
// 	push_undo()
// 	set_lord_moved(lord, 0)
// 	add_lord_assets(lord, type, -1)
// }

// function find_lord_with_capability_card(c) {
// 	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
// 		if (lord_has_capability_card(lord, c))
// 			return lord
// 	return NOBODY
// }

// states.wastage = {
// 	inactive: "Wastage",
// 	prompt() {
// 		let done = true
// 		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
// 			if (get_lord_moved(lord)) {
// 				prompt_wastage(lord)
// 				done = false
// 			}
// 		}
// 		if (done) {
// 			view.prompt = "Wastage: All done."
// 			view.actions.end_wastage = 1
// 		} else {
// 			view.prompt = "Wastage: Discard one Asset or Capability from each affected Lord."
// 		}
// 	},
// 	card(c) {
// 		push_undo()
// 		let lord = find_lord_with_capability_card(c)
// 		set_lord_moved(lord, 0)
// 		discard_lord_capability(lord, c)
// 	},
// 	prov(lord) { action_wastage(lord, PROV) },
// 	coin(lord) { action_wastage(lord, COIN) },
// 	cart(lord) { action_wastage(lord, CART) },
// 	ship(lord) { action_wastage(lord, SHIP) },
// 	end_wastage() {
// 		end_wastage()
// 	},
// }

// function end_wastage() {
// 	push_undo()
// 	set_active_enemy()
// 	goto_reset()
// }

// === END CAMPAIGN: RESET (DISCARD ARTS OF WAR) ===

function goto_reset() {
	game.state = "reset"

	// Discard "This Campaign" events from play.
	discard_friendly_events("this_campaign")
}

states.reset = {
	inactive: "Reset",
	prompt() {
		view.prompt = "Reset: You may discard any held Arts of War cards desired."
		view.actions.end_discard = 1
	},
	card(c) {
		push_undo()
		if (set_has(game.hand1, c)) {
			log("Discarded Held card.")
			set_delete(game.hand1, c)
		} else if (set_has(game.hand2, c)) {
			log("Discarded Held card.")
			set_delete(game.hand2, c)
		}
	},
	end_discard() {
		end_reset()
	},
}

function end_reset() {
	clear_undo()
	set_active_enemy()
	if (game.active === P2)
		goto_reset()
	else
		goto_advance_campaign()
}

// === END CAMPAIGN: TIDES OF WAR ===

function tides_calc() {
	let town = 0
	let cities = 0
	let fortress = 0
	let domy = 0
	let doml = 0
	let domnl = 0
	let domny = 0
	let domsl = 0
	let domsy = 0
	let domwl = 0
	let domwy = 0
	let x = 0

	// DOMINATION CALC

	for (let loc of data.locales) {
		if (loc.region === "North") {
			if (has_favourl_marker(x)) {
				domnl += 1
			}
			if (has_favoury_marker(x)) {
				domny += 1
			}
		}
		if (loc.region === "South") {
			if (has_favourl_marker(x)) {
				domsl += 1
			}
			if (has_favoury_marker(x)) {
				domsy += 1
			}
		}
		if (loc.region === "Wales") {
			if (has_favourl_marker(x)) {
				domwl += 1
			}
			if (has_favoury_marker(x)) {
				domwy += 1
			}
		}

		// SPECIAL LOCALES

		if (loc.name === "London") {
			if (has_favourl_marker(x)) {
				log(`London control 2 Influence for Lancaster`)
				doml += 2
			}

			if (has_favoury_marker(x)) {
				log(`London control 2 Influence for York`)
				domy += 2
			}
		}

		if (loc.name === "Calais") {
			if (has_favourl_marker(x)) {
				log(`Calais control 2 Influence for Lancastrians`)
				doml += 2
			}

			if (has_favoury_marker(x)) {
				log(`Calais control 2 Influence for York`)
				domy += 2
			}
		}

		if (loc.name === "Harlech") {
			if (has_favourl_marker(x)) {
				log(`Harlech control 1 Influence for Lancaster`)
				doml += 1
			}

			if (has_favoury_marker(x)) {
				log(`Harlech control 1 Influence for York`)
				domy += 1
			}
		}

		if (loc.type === "city") {
			if (has_favourl_marker(x)) {
				cities -= 1
			}

			if (has_favoury_marker(x)) {
				cities += 1
			}
		}
		if (loc.type === "town") {
			if (has_favourl_marker(x)) {
				town -= 1
			}
			if (has_favoury_marker(x)) {
				town += 1
			}
		}
		if (loc.type === "fortress") {
			if (has_favourl_marker(x)) {
				fortress -= 1
			}
			if (has_favoury_marker(x)) {
				fortress += 1
			}
		}
		x++
	}

	// DOMINATION CAPS

	// NORTH

	if (domnl === 6) {
		log(`North Domination 2 Influence for Lancaster`)
		doml += 2
	} else if (domnl >= 3 && lord_has_capability(LORD_NORTHUMBERLAND_L, AOW_LANCASTER_NORTHMEN)) {
		log(`North Domination 2 Influence for Lancaster`)
		doml += 2
	}

	if (domny === 6) {
		log(`North Domination 2 Influence for York`)
		domy += 2
	}

	// SOUTH

	if (domsl === 9) {
		log(`South Domination 2 Influence for Lancaster`)
		doml += 2
	}

	if (domsy === 9) {
		log(`South Domination 2 Influence for York`)
		domy += 2
	} else if (
		domsy >= 5 &&
		(lord_has_capability(LORD_MARCH, AOW_YORK_SOUTHERNERS) ||
			lord_has_capability(LORD_RUTLAND, AOW_YORK_SOUTHERNERS) ||
			lord_has_capability(LORD_YORK, AOW_YORK_SOUTHERNERS))
	) {
		log(`South Domination 2 Influence for York`)
		domy += 2
	}

	// WALES

	if (domwl === 5) {
		log(`South Domination 2 Influence for Lancaster`)
		doml += 2
	}

	if (domwy === 5) {
		log(`South Domination 2 Influence for York`)
		domy += 2
	} else if (
		domwy >= 3 &&
		(lord_has_capability(LORD_MARCH, AOW_YORK_WELSHMEN) || lord_has_capability(LORD_YORK, AOW_YORK_WELSHMEN))
	) {
		log(`South Domination 2 Influence for York`)
		domy += 2
	}

	// LOCALES TUG OF WAR

	if (cities >= 1) {
		log(`Most Cities 2 Influence for York`)
		domy += 2
	}
	if (fortress >= 1) {
		log(`Most Fortresses 1 Influence for York`)
		domy += 1
	}
	if (town >= 1) {
		log(`Most Towns 1 Influence for York`)
		domy += 2
	}

	if (cities <= -1) {
		log(`Most Cities 2 Influence for Lancaster`)
		doml += 2
	}
	if (fortress <= -1) {
		log(`Most Fortresses 1 Influence for Lancaster`)
		doml += 1
	}
	if (town <= -1) {
		log(`Most Towns 1 Influence for Lancaster`)
		doml += 2
	}

	// CAPS EFFECT

	if (
		lord_has_capability(LORD_HENRY_VI, AOW_LANCASTER_MARGARET) &&
		get_lord_locale(LORD_HENRY_VI) !== LOC_LONDON &&
		is_lord_on_map(LORD_HENRY_VI)
	) {
		log(`Capability: Margaret 1 Influence for Lancaster`)
		doml += 2
	}

	if (
		lord_has_capability(LORD_EXETER_1, AOW_LANCASTER_COUNCIL_MEMBER) ||
		lord_has_capability(LORD_EXETER_2, AOW_LANCASTER_COUNCIL_MEMBER) ||
		lord_has_capability(LORD_SOMERSET_2, AOW_LANCASTER_COUNCIL_MEMBER) ||
		lord_has_capability(LORD_SOMERSET_1, AOW_LANCASTER_COUNCIL_MEMBER) ||
		lord_has_capability(LORD_BUCKINGHAM, AOW_LANCASTER_COUNCIL_MEMBER)
	) {
		log(`Capability: Council Member 1 Influence for Lancaster`)
		doml += 1
	}

	if (lord_has_capability(LORD_EDWARD_IV, AOW_YORK_FIRST_SON)) {
		log(`Capability: First Son 1 Influence for Lancaster`)
		domy += 1
	}

	if (INFLUENCE_TURNS.includes(current_turn())) {
		for (let y = first_york_lord; y <= last_york_lord; y++) {
			if (is_lord_on_map(y)) {
				domy += data.lords[y].influence
			}
		}

		for (let l = first_lancaster_lord; l <= last_lancaster_lord; l++) {
			if (is_lord_on_map(l)) {
				doml += data.lords[l].influence
			}
		}
	}

	log(`Total ` + domy + ` Influence for York`)
	log(`Total ` + doml + ` Influence for Lancaster`)

	game.influence += doml
	game.influence -= domy
}

function tides_of_war() {
	if (lord_has_capability(LORD_BUCKINGHAM, AOW_LANCASTER_STAFFORD_ESTATES)) {
		add_lord_assets(LORD_BUCKINGHAM, COIN, 1)
		add_lord_assets(LORD_BUCKINGHAM, PROV, 1)
	}

	tides_calc()
	goto_disembark()
}

// === END CAMPAIGN: DISEMBARK ===

function has_lords_at_sea() {
	for (let x = first_friendly_lord; x <= last_friendly_lord; x++) {
		if (is_lord_at_sea(x))
			return true
	}
	return false
}

function get_lords_at_sea() {
	let results = []
	for (let x = first_friendly_lord; x <= last_friendly_lord; x++) {
		if (is_lord_at_sea(x)) {
			results.push(x)
		}
	}
	return results
}

function is_lord_at_sea(lord) {
	return SEAS.includes(get_lord_locale(lord))
}

function goto_disembark() {
	if (has_lords_at_sea()) {
		game.state = "disembark"
	} else {
		end_disembark()
	}
}

function end_disembark() {
	clear_undo()
	game.who = NOBODY
	set_active_enemy()
	if (game.active === P2)
		goto_disembark()
	else
		goto_game_end()
}

function do_disembark() {
	let roll = roll_die()
	let success = roll >= 5

	log(`Disembark: (>4) ${success ? HIT[roll] : MISS[roll]}`)

	return success
}

function get_safe_ports(sea) {
	let ports = []
	if (data.sea_1.includes(sea))
		ports = data.port_1
	if (data.sea_2.includes(sea))
		ports = data.port_2
	if (data.sea_3.includes(sea))
		ports = data.port_3

	return ports.filter(p => !has_enemy_lord(p))
}

function has_safe_ports(sea) {
	return get_safe_ports(sea).length > 0
}

states.disembark = {
	inactive: "Disembark",
	prompt() {
		view.prompt = "Disembark your lords at sea."
		let done = true
		if (game.who === NOBODY) {
			get_lords_at_sea().forEach(l => {
				gen_action_lord(l)
				done = false
			})
		} else {
			let sea = get_lord_locale(game.who)
			get_safe_ports(sea).forEach(gen_action_locale)
		}

		if (done) {
			view.actions.done = 1
		}
	},
	lord(lord) {
		if (do_disembark(lord)) {
			if (has_safe_ports(get_lord_locale(lord))) {
				game.who = lord
			} else {
				no_safe_disembark(lord)
			}
		} else {
			shipwreck(lord)
		}
	},
	locale(loc) {
		successful_disembark(game.who, loc)
	},
	done() {
		end_disembark()
	},
}

function successful_disembark(lord, loc) {
	set_lord_locale(lord, loc)
	set_lord_moved(lord, 1)
	game.who = NOBODY
	goto_feed()
}

function shipwreck(lord) {
	disband_influence_penalty(lord)
	disband_lord(lord, true)
}

function no_safe_disembark(lord) {
	disband_lord(lord)
}

function disband_influence_penalty(lord) {
	let influence = data.lords[lord].influence

	for (let v = first_vassal; v <= last_vassal; v++) {
		if (get_vassal_locale(v) === lord) {
			influence += 1
		}
	}

	if (game.active === LANCASTER)
		game.ip -= influence
	else
		game.ip += influence
}

function goto_advance_campaign() {
	game.turn++

	log_h1("Levy " + current_turn_name())
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

function gen_action_mercenaries(lord) {
	gen_action("mercenaries", lord)
}

function gen_action_burgundians(lord) {
	gen_action("burgundians", lord)
}

function gen_action_longbowmen(lord) {
	gen_action("longbowmen", lord)
}

function gen_action_retinue(lord) {
	gen_action("retinue", lord)
}

function gen_action_men_at_arms(lord) {
	gen_action("men_at_arms", lord)
}

function gen_action_militia(lord) {
	gen_action("militia", lord)
}

function gen_action_routed_mercenaries(lord) {
	gen_action("routed_mercenaries", lord)
}

function gen_action_routed_longbowmen(lord) {
	gen_action("routed_longbowmen", lord)
}

function gen_action_routed_burgundians(lord) {
	gen_action("routed_burgundians", lord)
}

function gen_action_routed_men_at_arms(lord) {
	gen_action("routed_men_at_arms", lord)
}

function gen_action_routed_militia(lord) {
	gen_action("routed_militia", lord)
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
		influence: game.influence,

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
					view.reveal |= 1 << lord
		}
		for (let lord of game.battle.reserves)
			view.reveal |= 1 << lord
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

function pack8_get(word, n) {
	n = n << 3
	return (word >>> n) & 255
}

function pack8_set(word, n, x) {
	n = n << 3
	return (word & ~(255 << n)) | (x << n)
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



let log_sanity = []
exports.fuzz_log = function (fuzz_info) {
		console.log(`${fuzz_info.state.state} - ${fuzz_info.actions} - - ${fuzz_info.args} [${fuzz_info.chosen_action}, ${fuzz_info.chosen_arg}] `)

		log_sanity.push(fuzz_info.state.state)
		if (log_sanity.length > 200) {
			log_sanity = log_sanity.slice(1)

			// if (log_sanity.every(l => l === fuzz_info.state.state)) {
			// 	console.log(`STATE`, fuzz_info.state)
			// 	console.log(`VIEW`, fuzz_info.view)
			// 		throw new Error("Too many times in the same state.")
			// }
		}

	}

	// exports.fuzz_crash = function (state, view) {
	// 	for(let x = 0; x<log_sanity.length; x++) {
	// 		console.log(log_sanity[x])
	// 	}
	// }

