"use strict"

// TODO: "approach" pause when about to move into intercept range?
// TODO: log end victory conditions at scenario start
// Check all push/clear_undo
// TODO: check flank attack

// TODO: clean up use of who/what/which/where -- explicit selected_lord, selected_vassal, etc?

let game = null
let view = null
let states = {}

function check_london_protected() {
// TODO IF HENRY/MARGARET ARE MUSTERED IT DOES NOT CHANGE FAVOUR
// ONLY L17/L18 and Pillage will cancel that event
//(it is annuled when london go to neutral
	if (game.state === "pillage") {
		return false
	}
	if (game.flags.london_for_york === 1 && game.where === LOC_LONDON) {
		return true
	}
	else {
		return false
	}
}

// === CONSTANTS ===

const data = require("./data.js")

function find_card(name) {
	let ix = data.cards.findIndex(x => x.name === name)
	if (ix < 0)
		throw "CANNOT FIND CARD: " + name
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
		throw "CANNOT FIND LOCALE: " + name
	return ix
}

function find_vassal(name) {
	let ix = data.vassals.findIndex(x => x.name === name)
	if (ix < 0)
		throw "CANNOT FIND VASSAL: " + name
	return ix
}

const BOTH = "Both"
const LANCASTER = "Lancaster"
const YORK = "York"

exports.roles = [ LANCASTER, YORK ]

const NOBODY = -1
const NOWHERE = -1
const NOTHING = -1

const CALENDAR = 100

const VASSAL_READY = 29
const VASSAL_CALENDAR = 30
const VASSAL_OUT_OF_PLAY = 31

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

const INFLUENCE_TURNS = [ 1, 4, 6, 9, 11, 14 ]
const GROW_TURNS = [ 4, 9, 14 ]
const WASTE_TURNS = [ 5, 10 ]

const HIT = [ "0", "\u2776", "\u2777", "\u2778", "\u2779", "\u277A", "\u277B" ]
const MISS = [ "0", "\u2460", "\u2461", "\u2462", "\u2463", "\u2464", "\u2465" ]

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
const ASSET_TYPE_COUNT = 4

// battle array
const A1 = 0 // attackers
const A2 = 1
const A3 = 2
const D1 = 3 // defenders
const D2 = 4
const D3 = 5

const lord_name = data.lords.map(lord => lord.name)

const lord_count = data.lords.length
const vassal_count = data.vassals.length

const first_lord = 0
const last_lord = lord_count - 1

const first_locale = 0
const last_locale = data.locales.length - 1

const first_vassal = 0
const last_vassal = vassal_count - 1

const first_york_card = 0
const last_york_card = 36
const first_lancaster_card = 37
const last_lancaster_card = 73

function is_york_card(c) {
	return c >= first_york_card && c <= last_york_card
}

function is_lancaster_card(c) {
	return c >= first_lancaster_card && c <= last_lancaster_card
}

const first_york_lord = 0
const last_york_lord = 13
const first_lancaster_lord = 14
const last_lancaster_lord = 27

const YORK_LORD_MASK = 0x1fff
const LANCASTER_LORD_MASK = YORK_LORD_MASK << 14

function is_york_lord(lord) {
	return lord >= first_york_lord && lord <= last_york_lord
}

function is_lancaster_lord(lord) {
	return lord >= first_lancaster_lord && lord <= last_lancaster_lord
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

function is_seaport(loc) {
	return set_has(data.seaports, loc)
}

function is_stronghold(loc) {
	return data.locales[loc].type !== "exile"
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

function is_wales(loc) {
	return data.locales[loc].region === "Wales"
}

function is_south(loc) {
	return data.locales[loc].region === "South"
}

function is_north(loc) {
	return data.locales[loc].region === "North"
}

function is_fortress(loc) {
	return data.locales[loc].type === "fortress"
}

function is_sea(loc) {
	return data.locales[loc].type === "sea"
}

function find_ports(here) {
	if ((lord_has_capability(game.group, AOW_YORK_GREAT_SHIPS) || lord_has_capability(game.group, AOW_LANCASTER_GREAT_SHIPS)))
		return data.all_ports
	if (here === data.sea_1) return data.port_1
	if (here === data.sea_2) return data.port_2
	if (here === data.sea_3) return data.port_3
	if (here === data.exile_1) return data.port_1
	if (here === data.exile_2) return data.port_2
	if (here === data.exile_3) return data.port_3
	if (here === data.exile_4) return data.port_1
	if (set_has(data.port_1, here)) return data.port_1
	if (set_has(data.port_2, here)) return data.port_2
	if (set_has(data.port_3, here)) return data.port_3
	return null
}

function find_sail_locales(here) {
	if (here === data.sea_1) return data.way_sea_1
	if (here === data.sea_2) return data.way_sea_2
	if (here === data.sea_3) return data.way_sea_3
	if (here === data.exile_1) return data.way_exile_1
	if (here === data.exile_2) return data.way_exile_2
	if (here === data.exile_3) return data.way_exile_3
	if (set_has(data.port_1, here)) return data.way_port_1
	if (set_has(data.port_2, here)) return data.way_port_2
	if (set_has(data.port_3, here)) return data.way_port_3
	return null
}

function make_locale_list(pred) {
	let list = []
	for (let loc = first_locale; loc <= last_locale; ++loc)
		if (pred(loc))
			list.push(loc)
	return list
}

const all_north_locales = make_locale_list(is_north)
const all_south_locales = make_locale_list(is_south)
const all_wales_locales = make_locale_list(is_wales)
const all_city_locales = make_locale_list(is_city)
const all_town_locales = make_locale_list(is_town)
const all_fortress_locales = make_locale_list(is_fortress)

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
const LOC_NEWBURY = find_locale("Newbury")
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

const AOW_LANCASTER_CULVERINS_AND_FALCONETS = [L1 , L2]
const AOW_LANCASTER_MUSTERD_MY_SOLDIERS = L3
const AOW_LANCASTER_HERALDS = L4
const AOW_LANCASTER_CHURCH_BLESSINGS = L5
const AOW_LANCASTER_GREAT_SHIPS = L6 // TODO Resolve bug about not correctly targeting ports on other seats and further
const AOW_LANCASTER_HARBINGERS = L7
const AOW_LANCASTER_HAY_WAINS = L8
const AOW_LANCASTER_QUARTERMASTERS = L9
const AOW_LANCASTER_CHAMBERLAINS = L10
const AOW_LANCASTER_IN_THE_NAME_OF_THE_KING = L11
const AOW_LANCASTER_COMMISION_OF_ARRAY = L12
const AOW_LANCASTER_EXPERT_COUNSELLORS = L13
const AOW_LANCASTER_PERCYS_POWER = L14
const AOW_LANCASTER_KINGS_PARLEY = L15
const AOW_LANCASTER_NORTHMEN = L16
const AOW_LANCASTER_MARGARET = L17
const AOW_LANCASTER_COUNCIL_MEMBER = L18
const AOW_LANCASTER_ANDREW_TROLLOPE = L19
const AOW_LANCASTER_VETERAN_OF_FRENCH_WARS = L20
const AOW_LANCASTER_MY_FATHERS_BLOOD = L21
const AOW_LANCASTER_STAFFORD_ESTATES = L22
const AOW_LANCASTER_MONTAGU = L23
const AOW_LANCASTER_MARRIED_TO_A_NEVILLE = L24
const AOW_LANCASTER_WELSH_LORD = L25
const AOW_LANCASTER_EDWARD = L26
const AOW_LANCASTER_BARDED_HORSE = L27
const AOW_LANCASTER_LOYAL_SOMERSET = L28
const AOW_LANCASTER_HIGH_ADMIRAL = L29
const AOW_LANCASTER_MERCHANTS = L30
const AOW_LANCASTER_YEOMEN_OF_THE_CROWN = L31
const AOW_LANCASTER_TWO_ROSES = L32
const AOW_LANCASTER_PHILIBERT_DE_CHANDEE = L33
const AOW_LANCASTER_PIQUIERS = L34
const AOW_LANCASTER_THOMAS_STANLEY = L35
const AOW_LANCASTER_CHEVALIERS = L36
const AOW_LANCASTER_MADAME_LA_GRANDE = L37

const AOW_YORK_CULVERINS_AND_FALCONETS = [Y1, Y2]
const AOW_YORK_MUSTERD_MY_SOLDIERS = Y3
const AOW_YORK_WE_DONE_DEEDS_OF_CHARITY = Y4
const AOW_YORK_THOMAS_BOURCHIER = Y5
const AOW_YORK_GREAT_SHIPS = Y6
const AOW_YORK_HARBINGERS = Y7
const AOW_YORK_ENGLAND_IS_MY_HOME = Y8
const AOW_YORK_BARRICADES = Y9
const AOW_YORK_AGITATORS = Y10
const AOW_YORK_YORKISTS_NEVER_WAIT = Y11
const AOW_YORK_SOLDIERS_OF_FORTUNE = Y12
const AOW_YORK_SCOURERS = Y13
const AOW_YORK_BURGUNDIANS = [ Y14, Y23 ]
const AOW_YORK_NAVAL_BLOCKADE = Y15 // TODO DEBUG pop_state() going into parley and not after province selection
const AOW_YORK_BELOVED_WARWICK = Y16
const AOW_YORK_ALICE_MONTAGU = Y17
const AOW_YORK_IRISHMEN = Y18
const AOW_YORK_WELSHMEN = Y19
const AOW_YORK_YORKS_FAVOURED_SON = Y20
const AOW_YORK_SOUTHERNERS = Y21
const AOW_YORK_FAIR_ARBITER = Y22
const AOW_YORK_HASTINGS = Y24
const AOW_YORK_PEMBROKE = Y25
const AOW_YORK_FALLEN_BROTHER = Y26
const AOW_YORK_PERCYS_NORTH1 = Y27
const AOW_YORK_FIRST_SON = Y28
const AOW_YORK_STAFFORD_BRANCH = Y29
const AOW_YORK_CAPTAIN = Y30
const AOW_YORK_WOODWILLES = Y31
const AOW_YORK_FINAL_CHARGE = Y32 // TODO AFTER ALL OTHER BATTLE PROMPTS TO SEE WHERE TO PLACE IT
const AOW_YORK_BLOODY_THOU_ART = Y33
const AOW_YORK_SO_WISE_SO_YOUNG = Y34
const AOW_YORK_KINGDOM_UNITED = Y35
const AOW_YORK_VANGUARD = Y36 // TODO AFTER ALL OTHER BATTLE PROMPTS TO SEE WHERE TO PLACE IT
const AOW_YORK_PERCYS_NORTH2 = Y37

const EVENT_LANCASTER_LEEWARD_BATTLE_LINE = L1
const EVENT_LANCASTER_FLANK_ATTACK = L2
const EVENT_LANCASTER_ESCAPE_SHIP = L3
const EVENT_LANCASTER_BE_SENT_FOR = L4
const EVENT_LANCASTER_SUSPICION = L5
const EVENT_LANCASTER_SEAMANSHIP = L6
const EVENT_LANCASTER_FOR_TRUST_NOT_HIM = L7
const EVENT_LANCASTER_FORCED_MARCHES = L8
const EVENT_LANCASTER_RISING_WAGES = L9
const EVENT_LANCASTER_NEW_ACT_OF_PARLIAMENT = L10

const EVENT_LANCASTER_BLOCKED_FORD = L11
const EVENT_LANCASTER_RAVINE = L12
const EVENT_LANCASTER_ASPIELLES = L13
const EVENT_LANCASTER_SCOTS = L14
const EVENT_LANCASTER_HENRY_PRESSURES_PARLIAMENT = L15
const EVENT_LANCASTER_WARDEN_OF_THE_MARCHES = L16
const EVENT_LANCASTER_MY_CROWN_IS_IN_MY_HEART = L17
const EVENT_LANCASTER_PARLIAMENT_VOTES = L18
const EVENT_LANCASTER_HENRYS_PROCLAMATION = L19
const EVENT_LANCASTER_PARLIAMENTS_TRUCE = L20
const EVENT_LANCASTER_FRENCH_FLEET = L21
const EVENT_LANCASTER_FRENCH_TROOPS = L22
const EVENT_LANCASTER_WARWICKS_PROPAGANDA = L23
const EVENT_LANCASTER_WARWICKS_PROPAGANDA2 = L24
const EVENT_LANCASTER_WELSH_REBELLION = L25
const EVENT_LANCASTER_HENRY_RELEASED = L26
const EVENT_LANCASTER_LUNIVERSELLE_ARAGNE = L27
const EVENT_LANCASTER_REBEL_SUPPLY_DEPOT = L28
const EVENT_LANCASTER_TO_WILFUL_DISOBEDIANCE = L29
const EVENT_LANCASTER_FRENCH_WAR_LOANS = L30
const EVENT_LANCASTER_ROBINS_REBELLION = L31
const EVENT_LANCASTER_TUDOR_BANNERS = L32
const EVENT_LANCASTER_SURPRISE_LANDING = L33
const EVENT_LANCASTER_BUCKINGHAMS_PLOT = L34
const EVENT_LANCASTER_MARGARET_BEAUFORT = L35
const EVENT_LANCASTER_TALBOT_TO_THE_RESCUE = L36
const EVENT_LANCASTER_THE_EARL_OF_RICHMOND = L37

const EVENT_YORK_LEEWARD_BATTLE_LINE = Y1
const EVENT_YORK_FLANK_ATTACK = Y2
const EVENT_YORK_ESCAPE_SHIP = [Y3 , Y9]
const EVENT_YORK_JACK_CADE = Y4
const EVENT_YORK_SUSPICION = Y5
const EVENT_YORK_SEAMANSHIP = Y6
const EVENT_YORK_YORKISTS_BLOCK_PARLIAMENT = Y7
const EVENT_YORK_EXILE_PACT = Y8
const EVENT_YORK_TAX_COLLECTORS = Y10

const EVENT_YORK_BLOCKED_FORD = Y11
const EVENT_YORK_PARLIAMENTS_TRUCE = Y12
const EVENT_YORK_ASPIELLES = Y13
const EVENT_YORK_RICHARD_OF_YORK = Y14
const EVENT_YORK_LONDON_FOR_YORK = Y15 // TODO PROTECTION AND UI
const EVENT_YORK_THE_COMMONS = Y16
const EVENT_YORK_SHEWOLF_OF_FRANCE = Y17
const EVENT_YORK_SUCCESSION = Y18
const EVENT_YORK_CALTROPS = Y19
const EVENT_YORK_YORKIST_PARADE = Y20
const EVENT_YORK_SIR_RICHARD_LEIGH = Y21
const EVENT_YORK_LOYALTY_AND_TRUST = Y22
const EVENT_YORK_CHARLES_THE_BOLD = Y23
const EVENT_YORK_SUN_IN_SPLENDOUR = Y24
const EVENT_YORK_OWAIN_GLYNDWR = Y25
const EVENT_YORK_DUBIOUS_CLARENCE = Y26
const EVENT_YORK_YORKIST_NORTH = Y27
const EVENT_YORK_GLOUCESTER_AS_HEIR = Y28
const EVENT_YORK_DORSET = Y29
const EVENT_YORK_REGROUP = Y30 // TODO
// Play in Battle at Battle Array step.
// If played when Yorkist active they pay click on that event to make the lord recover his TROOPS (no vassals/retinue)
// for recover per armour
const EVENT_YORK_EARL_RIVERS = Y31
const EVENT_YORK_THE_KINGS_NAME = Y32 // TODO IMPROVE PROMPTS/QOL
const EVENT_YORK_EDWARD_V = Y33
const EVENT_YORK_AN_HONEST_TALE_SPEEDS_BEST = Y34
const EVENT_YORK_PRIVY_COUNCIL = Y35
const EVENT_YORK_SWIFT_MANEUVER = Y36
const EVENT_YORK_PATRICK_DE_LA_MOTE = Y37

// === STATE: ACTIVE PLAYER ===

var P1 = null
var P2 = null

var first_friendly_lord = 0
var last_friendly_lord = 13
var first_enemy_lord = 14
var last_enemy_lord = 27

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
	if (game.rebel === YORK) {
		P1 = YORK
		P2 = LANCASTER
	} else {
		P1 = LANCASTER
		P2 = YORK
	}
}

function load_state(state) {
	if (game !== state) {
		game = state
		update_aliases()
	}
}

function set_active(new_active) {
	if (game.active !== new_active) {
		clear_undo()
		game.active = new_active
		update_aliases()
	}
}

function set_active_enemy() {
	if (game.active === YORK)
		set_active(LANCASTER)
	else
		set_active(YORK)
}

function set_active_command() {
	if (is_york_lord(game.command))
		set_active(YORK)
	else
		set_active(LANCASTER)
}

// === STATE: TURN ===

function current_turn() {
	return game.turn >> 1
}

function current_season() {
	return SEASONS[game.turn >> 1]
}

function is_campaign_phase() {
	return (game.turn & 1) === 1
}

function is_levy_phase() {
	return (game.turn & 1) === 0
}

function current_turn_name() {
	return String(game.turn >> 1)
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

// === STATE: CARDS ===

function current_hand() {
	if (game.active === YORK)
		return game.hand_y
	return game.hand_l
}

function is_friendly_card(c) {
	if (game.active === YORK)
		return is_york_card(c)
	return is_lancaster_card(c)
}

function has_card_in_hand(c) {
	if (game.active === YORK)
		return set_has(game.hand_y, c)
	return set_has(game.hand_l, c)
}

function could_play_card(c) {
	if (!game.hidden) {
		// TODO: check capabilities on lords revealed in battle if hidden
		if (map_has_value(game.pieces.capabilities, c))
			return false
	}
	if (set_has(game.events, c))
		return false
	if (is_york_card(c))
		return game.hand_y.length > 0
	if (is_lancaster_card(c))
		return game.hand_l.length > 0
	return true
}

function count_cards_in_plan(plan, lord) {
	let n = 0
	for (let c of plan)
		if (c === lord)
			++n
	return n
}

function is_card_in_use(c) {
	if (set_has(game.hand_y, c))
		return true
	if (set_has(game.hand_l, c))
		return true
	if (set_has(game.events, c))
		return true
	if (map_has_value(game.pieces.capabilities, c))
		return true
	return false
}

function list_deck() {
	let deck = []
	let first_card = game.active === YORK ? first_york_card : first_lancaster_card
	let last_card = game.active === YORK ? last_york_card : last_lancaster_card
	for (let c = first_card; c <= last_card; ++c)
		if (!is_card_in_use(c) && is_card_in_scenario(c))
			deck.push(c)
	return deck
}

function draw_card(deck) {
	clear_undo()
	let i = random(deck.length)
	let c = deck[i]
	set_delete(deck, c)
	return c
}

function draw_two_cards() {
	let deck = list_deck()
	return [ draw_card(deck), draw_card(deck) ]
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

function discard_extra_levy_events() {
	for (let i = 0; i < game.events.length; ) {
		let c = game.events[i]
		if (c === Y20)
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

function is_event_in_play(c) {
	return set_has(game.events, c)
}

// === STATE: LORD ===

function get_lord_locale(lord) {
	return map_get(game.pieces.locale, lord, NOWHERE)
}

function set_lord_locale(lord, locale) {
	if (locale === NOWHERE)
		map_delete(game.pieces.locale, lord)
	else
		map_set(game.pieces.locale, lord, locale)
}

function get_lord_calendar(lord) {
	if (is_lord_on_calendar(lord))
		return get_lord_locale(lord) - CALENDAR
	return 0
}

function set_lord_calendar(lord, turn) {
	if (turn < 1)
		turn = 1
	if (turn > 16)
		turn = 16
	set_lord_locale(lord, CALENDAR + turn)
}

function set_lord_in_exile(lord) {
	game.pieces.in_exile = pack1_set(game.pieces.in_exile, lord, 1)
}

function get_lord_in_exile(lord) {
	return pack1_get(game.pieces.in_exile, lord)
}

function remove_lord_from_exile(lord) {
	game.pieces.in_exile = pack1_set(game.pieces.in_exile, lord, 0)
}

function get_lord_capability(lord, n) {
	return map2_get(game.pieces.capabilities, lord, n, NOTHING)
}

function set_lord_capability(lord, n, x) {
	if (x === NOTHING)
		map2_delete(game.pieces.capabilities, lord, n)
	else
		map2_set(game.pieces.capabilities, lord, n, x)
}

function get_lord_assets(lord, n) {
	return map_get_pack4(game.pieces.assets, lord, n)
}

function set_lord_assets(lord, n, x) {
	if (x < 0)
		x = 0
	if (x > 15)
		x = 15
	map_set_pack4(game.pieces.assets, lord, n, x)
}

function add_lord_assets(lord, n, x) {
	set_lord_assets(lord, n, get_lord_assets(lord, n) + x)
}

function drop_prov(lord) {
	add_lord_assets(lord, PROV, -1)
}

function drop_cart(lord) {
	add_lord_assets(lord, CART, -1)
}

function get_lord_forces(lord, n) {
	return map_get_pack4(game.pieces.forces, lord, n)
}

function set_lord_forces(lord, n, x) {
	if (x < 0)
		x = 0
	if (x > 15)
		x = 15
	map_set_pack4(game.pieces.forces, lord, n, x)
}

function add_lord_forces(lord, n, x) {
	set_lord_forces(lord, n, get_lord_forces(lord, n) + x)
}

function get_lord_routed_forces(lord, n) {
	return map_get_pack4(game.pieces.routed, lord, n)
}

function set_lord_routed_forces(lord, n, x) {
	if (x < 0)
		x = 0
	if (x > 15)
		x = 15
	map_set_pack4(game.pieces.routed, lord, n, x)
}

function add_lord_routed_forces(lord, n, x) {
	set_lord_routed_forces(lord, n, get_lord_routed_forces(lord, n) + x)
}

function get_lord_moved(lord) {
	return map_get(game.pieces.moved, lord, 0)
}

function set_lord_moved(lord, x) {
	map_set(game.pieces.moved, lord, x)
}

function clear_lords_moved() {
	map_clear(game.pieces.moved)
}

function set_lord_fought(lord) {
	set_lord_moved(lord, 1)
	// TODO: is this needed?
	game.battle.fought = pack1_set(game.battle.fought, lord, 1)
}

function set_lord_unfed(lord, n) {
	// reuse "moved" flag for hunger
	set_lord_moved(lord, n)
}

function is_lord_unfed(lord) {
	// reuse "moved" flag for hunger
	return get_lord_moved(lord)
}

function feed_lord(lord) {
	// reuse "moved" flag for hunger
	let n = get_lord_moved(lord) - 1
	set_lord_moved(lord, n)
	if (n === 0)
		log(`Fed L${lord}.`)
}

function pay_lord(lord) {
	// reuse "moved" flag for pay
	let n = get_lord_moved(lord) - 1
	set_lord_moved(lord, n)
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

function is_friendly_lord(lord) {
	return lord >= first_friendly_lord && lord <= last_friendly_lord
}

function is_enemy_lord(lord) {
	return lord >= first_enemy_lord && lord <= last_enemy_lord
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
	return get_lord_assets(lord, SHIP)
}

function count_lord_transport(lord) {
	return get_lord_assets(lord, CART)
}

function lord_has_unrouted_units(lord) {
	for (let x = 0; x < FORCE_TYPE_COUNT; ++x)
		if (get_lord_forces(lord, x) > 0)
			return true
	let result = false
	for_each_vassal_with_lord(lord, v => {
		if (!set_has(game.battle.routed_vassals, v))
			result = true
	})
	return result
}

function find_lord_with_capability_card(c) {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (lord_has_capability_card(lord, c))
			return lord
	return NOBODY
}

function get_force_name(lord, n, x) {
	if (n === RETINUE)
		return `${lord_name[lord]}'s Retinue`
	if (n === VASSAL)
		return `Vassal ${data.vassals[x].name}`
	return FORCE_TYPE_NAME[n]
}

// === STATE: LORD (SHARED) ===

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
		if (game.state === "supply_source" && (lord_has_capability(lord, AOW_YORK_GREAT_SHIPS) || lord_has_capability(lord, AOW_YORK_GREAT_SHIPS)) && what === SHIP) {
			m = get_lord_assets(lord, SHIP)
			n += m
		}
	}
	return n
}

function count_group_assets(type, group = game.group) {
	let n = 0
	for (let lord of group) {
		n += get_lord_assets(lord, type)
		if (type === CART) {
			if (game.state === "command" || game.state === "march_laden")
				if (lord_has_capability(lord, AOW_LANCASTER_HAY_WAINS))
					n += get_lord_assets(lord, CART)
		}
	}
	return n
}

function count_group_ships() {
	let n = 0
	for (let lord of game.group) {
		n += count_lord_ships(lord)
		if (lord_has_capability(lord, AOW_YORK_GREAT_SHIPS) || lord_has_capability(lord, AOW_LANCASTER_GREAT_SHIPS))
			n += count_lord_ships(lord)
	}
	return n
}

function count_group_transport(group = game.group) {
	let n = 0
	for (let lord of group)
		n += count_lord_transport(lord)
	return n
}

function count_group_lords() {
	return game.group.length
}

// === STATE: VASSAL ===

function set_vassal_lord_and_service(vassal, lord, service) {
	game.pieces.vassals[vassal] = lord + (service << 5)
}

function get_vassal_lord(vassal) {
	return game.pieces.vassals[vassal] & 31
}

function get_vassal_service(vassal) {
	return game.pieces.vassals[vassal] >> 5
}

function setup_vassals(excludes = []) {
	for (let x = first_vassal; x <= last_vassal; x++) {
		if (!excludes.includes(x) && data.vassals[x].capability === undefined) {
			set_vassal_lord_and_service(x, VASSAL_READY, 0)
		}
	}
}

function is_vassal_ready(x) {
	return get_vassal_lord(x) === VASSAL_READY
}

function is_vassal_mustered_with(x, lord) {
	return get_vassal_lord(x) === lord
}

function is_vassal_mustered_with_friendly_lord(x) {
	return is_friendly_lord(get_vassal_lord(x))
}

function is_vassal_mustered_with_york_lord(x) {
	return is_york_lord(get_vassal_lord(x))
}

function for_each_vassal_with_lord(lord, f) {
	for (let x = first_vassal; x <= last_vassal; x++)
		if (is_vassal_mustered_with(x, lord))
			f(x)
}

function count_vassals_with_lord(lord) {
	let n = 0
	for (let x = first_vassal; x <= last_vassal; x++)
		if (is_vassal_mustered_with(x, lord))
			++n
	return n
}

function muster_vassal(vassal, lord) {
	if (data.vassals[vassal].service !== 0) {
		let service = current_turn() + data.vassals[vassal].service
		if (lord_has_capability(lord, AOW_YORK_ALICE_MONTAGU))
			service += 1
		set_vassal_lord_and_service(vassal, lord, service)
	} else {
		set_vassal_lord_and_service(vassal, lord, 0)
	}
}

function disband_vassal(vassal) {
	if (data.vassals[vassal].service > 0) {
		let new_turn = current_turn() + (6 - data.vassals[vassal].service)
		set_vassal_lord_and_service(vassal, VASSAL_CALENDAR, new_turn)
		log(`Disbanded V${vassal} to turn ${current_turn() + (6 - data.vassals[vassal].service)}.`)
	} else {
		// TODO: special vassals with no service marker!?
		set_vassal_lord_and_service(vassal, VASSAL_OUT_OF_PLAY, 0)
		log(`Disbanded V${vassal}.`)
	}
	if (vassal === VASSAL_HASTINGS) {
		discard_card_capability(AOW_YORK_HASTINGS)
		logi(`Hastings Discarded`)
	}
}

function pay_vassal(vassal) {
	if (current_turn() < 15)
		set_vassal_lord_and_service(vassal, get_vassal_lord(vassal), current_turn() + 1)
}

function rout_vassal(_lord, vassal) {
	set_add(game.battle.routed_vassals, vassal)
}

// === STATE: LOCALE ===

function is_favour_friendly(loc) {
	if (game.active === YORK)
		return has_favoury_marker(loc)
	else
		return has_favourl_marker(loc)
}

function is_favour_enemy(loc, side) {
	if (side === LANCASTER)
		return has_favoury_marker(loc)
	else
		return has_favourl_marker(loc)
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

function shift_favour_away(loc) {
	if (game.active === YORK)
		shift_favour_toward_lancaster(loc)
	else
		shift_favour_toward_york(loc)
}

function shift_favour_toward(loc) {
	if (game.active === YORK)
		shift_favour_toward_york(loc)
	else
		shift_favour_toward_lancaster(loc)
}

function shift_favour_toward_york(loc) {
	if (has_favourl_marker(loc))
		remove_favourl_marker(loc)
	else
		add_favoury_marker(loc)
}

function shift_favour_toward_lancaster(loc) {
	if (has_favoury_marker(loc))
		remove_favoury_marker(loc)
	else
		add_favourl_marker(loc)
}

function set_favour_enemy(loc) {
	if (game.active === YORK) {
		remove_favoury_marker(loc)
		add_favourl_marker(loc)
	} else {
		remove_favourl_marker(loc)
		add_favoury_marker(loc)
	}
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
	if (has_exhausted_marker(locale)) {
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

function is_neutral_locale(loc) {
	return !has_favourl_marker(loc) && !has_favoury_marker(loc)
}

function has_favour_in_locale(side, loc) {
	if (side === YORK)
		return has_favoury_marker(loc)
	else
		return has_favourl_marker(loc)
}

function is_friendly_locale(loc) {
	if (loc !== NOWHERE && loc < CALENDAR) {
		if (has_enemy_lord(loc))
			return false
		if (is_favour_friendly(loc))
			return true
	}
	return false
}

function is_adjacent_friendly_port_english_channel(loc) {
	for (let next of data.locales[loc].adjacent) {
		if (is_friendly_locale(next) && data.port_2.includes(next))
			return true
	}
}

// === STATE: LORD & LOCALE ===

function is_lord_at_friendly_locale(lord) {
	return is_friendly_locale(get_lord_locale(lord))
}

function is_lord_in_wales(lord) {
	return is_wales(get_lord_locale(lord))
}

function is_lord_in_south(lord) {
	return is_south(get_lord_locale(lord))
}

function is_lord_in_north(lord) {
	return is_north(get_lord_locale(lord))
}

function has_friendly_lord(loc) {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (get_lord_locale(lord) === loc)
			return true
	return false
}

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

function is_lord_in_or_adjacent_to_north(lord) {
	let here = get_lord_locale(lord)
	if (is_north(here))
		return true
	for (let loc of data.locales[here].adjacent)
		if (is_north(loc))
			return true
	return false
}

function is_lord_in_or_adjacent_to_south(lord) {
	let here = get_lord_locale(lord)
	if (is_south(here))
		return true
	for (let loc of data.locales[here].adjacent)
		if (is_south(loc))
			return true
	return false
}

function is_lord_in_or_adjacent_to_wales(lord) {
	let here = get_lord_locale(lord)
	if (is_wales(here))
		return true
	for (let loc of data.locales[here].adjacent)
		if (is_wales(loc))
			return true
	return false
}

// Captain capability (lieutenant/marshall only if no other)
function other_marshal_or_lieutenant(loc) {
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

function has_adjacent_enemy(loc) {
	for (let next of data.locales[loc].adjacent)
		if (has_unbesieged_enemy_lord(next))
			return true
	return false
}

function has_adjacent_friendly(loc) {
	for (let next of data.locales[loc].adjacent)
		if (has_friendly_lord(next))
			return true
	return false
}

// === 1.4 INFLUENCE ===

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

function increase_lancaster_influence(amt) {
	game.influence += amt
}

// Bonus score but still maxed at 5
function influence_capabilities(lord, score) {
	let here = get_lord_locale(game.group)
	if (game.active === YORK && is_event_in_play(EVENT_YORK_YORKIST_PARADE))
		score += 2
	if (game.active === YORK && is_event_in_play(EVENT_YORK_PRIVY_COUNCIL))
		score += 1
	if (game.state === "parley" && ((is_event_in_play(EVENT_YORK_RICHARD_OF_YORK) && game.active === YORK) || lord_has_capability(game.group, AOW_LANCASTER_IN_THE_NAME_OF_THE_KING)))
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
	if (has_favoury_marker(here) && lord_has_capability(lord, AOW_YORK_FAIR_ARBITER))
		score += 1
	if (lord_has_capability(lord, AOW_YORK_FALLEN_BROTHER) && !is_lord_in_play(LORD_CLARENCE))
		score += 2

	return score
}

// Cards that allows automatic success
function automatic_success(lord, score) {

	if (lord_has_capability(lord, AOW_LANCASTER_TWO_ROSES))
		score = 6
	if (game.active === LANCASTER
		&& is_event_in_play(EVENT_LANCASTER_THE_EARL_OF_RICHMOND)
		&& game.state === "levy_muster_vassal")
		score = 6
	if (game.active === LANCASTER
		&& game.flags.parliament_votes === 1
		&& game.state === "parley")
		score = 6
	if (game.active === YORK
		&& game.flags.jack_cade > 0
		&& game.state === "parley")
		score = 6
	if (game.active === YORK
		&& game.flags.succession === 1
		&& game.state === "parley")
		score = 6
	if (is_campaign_phase()
		&& game.command === LORD_DEVON
		&& get_lord_locale(LORD_DEVON) === LOC_EXETER
		&& is_event_in_play(EVENT_YORK_DORSET)
		&& game.state === "parley")
		score = 6

	return score
}

// Initiate influence check with cards influencing the cost overriding all others
// (even automatic at no cost)
function init_influence_check(lord) {
	game.check = []
	game.check.push({ cost: 1, modifier: 0, source: "base" })
	game.check.push({ cost: 0, modifier: data.lords[lord].influence, source: "lord" })
	if (game.active === LANCASTER
		&& is_event_in_play(EVENT_YORK_AN_HONEST_TALE_SPEEDS_BEST)
		&& game.state === "parley"){
		game.check.push({ cost: 1, modifier: 0, source:"An Honest tale speeds best"})
	}
	if (game.active === LANCASTER
		&& is_event_in_play(EVENT_LANCASTER_PARLIAMENT_VOTES)
		&& game.flags.parliament_votes === 1
		&& game.state === "parley") {
		game.check.push({ cost: -1, modifier: 0, source:"Parliament Votes"})
	}
	if (game.active === YORK
		&& is_event_in_play(EVENT_YORK_SUCCESSION)
		&& game.flags.succession === 1
		&& game.state === "parley") {
		game.check.push({ cost: -1, modifier: 0, source:"Succession"})
	}
}

function end_influence_check() {
	game.check = 0
}

function count_influence_score() {
	let score = game.check.reduce((p, c) => p + c.modifier, 0)

	let lord = 0
	if (is_levy_phase())
		lord = game.who
	if (is_campaign_phase())
		lord = game.command

	if (score > 5)
		score = 5
	if (score < 1)
		score = 1

	score = automatic_success(lord, score)

	return score
}

function count_influence_cost() {
	if (game.state === "parley") {
		if (is_campaign_phase()) {
			if (game.command === LORD_DEVON && get_lord_locale(LORD_DEVON) === LOC_EXETER && is_event_in_play(EVENT_YORK_DORSET))
				return 0
		}
		if (is_levy_phase()) {
			if (game.flags.jack_cade > 0)
				return 0
		}
	}
	return game.check.reduce((p, c) => p + c.cost, 0)
}

function do_influence_check() {
	reduce_influence(count_influence_cost())
	let rating = count_influence_score()
	let roll = roll_die()
	let success

	if (roll === 1 || rating === 6)
		success = true
	else if (roll === 6)
		success = false
	else
		success = roll <= rating

	// TODO: print log message here instead of returning object
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
		view.actions.spend1 = 1
		view.actions.spend3 = 1
	}
	if (game.where !== NOWHERE)
		gen_action_locale(game.where)
	view.actions.check = 1

	view.prompt += `Cost: ${count_influence_cost()} - Range (${range(count_influence_score())})`
}

// === 2.0 SETUP ===

function goto_setup_lords() {
	// setup will be used in some scenarios
	end_setup_lords()
}

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

// === 3.1 LEVY: ARTS OF WAR (FIRST TURN) ===

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
	},
	lord(lord) {
		push_undo()
		let c = game.what.shift()
		log(`${game.active} deployed Capability.`)
		add_lord_capability(lord, c)
		capability_muster_effects(lord, c)
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
	game.what = NOTHING
	set_active_enemy()
	if (game.active === P2)
		goto_levy_arts_of_war_first()
	else
		goto_levy_muster()
}

// === 3.1 LEVY: ARTS OF WAR ===

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
		if (game.active === YORK)
			set_add(game.hand_y, c)
		else
			set_add(game.hand_l, c)
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

// === 3.2 LEVY: PAY ===

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
		let here = get_lord_locale(lord)
		if (is_lord_on_map(lord) &&
			!is_lord_on_calendar(lord) &&
			lord_has_capability(lord, AOW_LANCASTER_MADAME_LA_GRANDE) &&
			(((is_friendly_locale(here)) && data.port_2.includes(here)) ||
			is_adjacent_friendly_port_english_channel(here))) {
			add_lord_assets(lord, COIN, 1)
		}
		if (
			game.active === LANCASTER &&
			is_lord_on_map(lord) &&
			lord_has_capability(LORD_NORTHUMBERLAND_L, AOW_LANCASTER_PERCYS_POWER) &&
			is_lord_in_north(LORD_NORTHUMBERLAND_L) &&
			is_lord_in_north(lord)
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
		end_pay()
	},
	card: action_held_event,
}

states.pay_lord_shared = {
	inactive: "Pay",
	prompt() {
		view.prompt = `Pay: You must Feed ${lord_name[game.who]} with Shared Coin.`
		let loc = get_lord_locale(game.who)
		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
			if (get_lord_locale(lord) === loc) {
				if (get_lord_assets(lord, COIN) > 0)
					gen_action_coin(lord)
			}
		}
	},
	coin(lord) {
		push_undo()
		add_lord_assets(lord, COIN, -1)
		pay_lord(game.who)
		resume_pay_lord_shared()
	},
}

function resume_pay_lord_shared() {
	if (!is_lord_unfed(game.who) || !can_pay_from_shared(game.who)) {
		game.who = NOBODY
		game.state = "pay"
	}
}

function end_pay() {
	game.who = NOBODY
	set_active_enemy()
	if (game.active === P2) {
		goto_pay()
	} else
		goto_pay_lords()
}

// === 3.2.1 PAY TROOPS (PILLAGE) ===

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
	game.where = NOWHERE
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
		reduce_influence(4 * num)

		add_exhausted_marker(game.where)
		set_favour_enemy(game.where)
		for (let next of data.locales[game.where].adjacent)
			shift_favour_away(next)

		end_pillage_locale()
	},
}

// === 3.2.2 PAY LORDS ===

function has_friendly_lord_who_must_pay_troops() {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (is_lord_unfed(lord))
			return true
	return false
}

function goto_pay_lords() {
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
		game.count = 0
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
			if (!done)
				view.actions.pay_all = 1
		} else {
			view.actions.disband = 1
			view.actions.pay = 1
		}	},
	lord(lord) {
		push_undo()
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
	pay_all() {
		push_undo()
		for (let lord = first_friendly_lord; lord <= last_friendly_lord; lord++) {
			if (is_lord_on_map(lord) && is_lord_unfed(lord)) {
				++game.count
				set_lord_moved(lord, 0)
				if (is_exile(get_lord_locale(lord))) {
					++game.count
				}
				reduce_influence(game.count)
				game.count = 0
			}
		}
		game.who = NOBODY

	},
	card: action_held_event,
	done() {
		end_pay_lords()
	},
}

// === 3.2.3 PAY VASSALS ===

function goto_pay_vassals() {
	let vassal_to_pay = false

	for (let v = first_vassal; v <= last_vassal; v++) {
		if (
			is_vassal_mustered_with_friendly_lord(v) &&
			get_vassal_service(v) === current_turn()
		) {
			vassal_to_pay = true
		}
	}
	if (vassal_to_pay) {
		game.state = "pay_vassals"
		game.what = NOBODY
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
		if (game.what === NOBODY) {
			for (let v = first_vassal; v <= last_vassal; v++) {
				if (
					is_vassal_mustered_with_friendly_lord(v) &&
					get_vassal_service(v) === current_turn()
				) {
					gen_action_vassal(v)
					done = false
				}
			}

			if (done) {
				view.actions.done = 1
			}
			if (!done)
				view.actions.pay_all = 1
		} else {
			view.actions.pay = 1
			view.actions.disband = 1
		}
	},
	vassal(v) {
		push_undo()
		game.what = v
	},
	pay() {
		push_undo()
		pay_vassal(game.what)
		reduce_influence(1)
		game.what = NOBODY
	},
	pay_all() {
		push_undo()
		for (let v = first_vassal; v <= last_vassal; v++) {
			if (is_vassal_mustered_with_friendly_lord(v)
			&& get_vassal_service(v) === current_turn()) {
				pay_vassal(v)
				reduce_influence(1)
				game.what = NOBODY
			}
		}
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

// === 3.2.4 DISBAND ===

function disband_lord(lord, permanently = false) {
	let turn = current_turn()
	let extra = 6

	if (permanently) {
		log(`Removed L${lord}.`)
		set_lord_locale(lord, NOWHERE)
	} else if (lord_has_capability(lord, AOW_YORK_ENGLAND_IS_MY_HOME)) {
		set_lord_calendar(lord, turn + (extra - data.lords[lord].influence))
		log(`Disbanded L${lord} to turn ${current_turn() + 1}.`)
	}
	else	{
		set_lord_calendar(lord, turn + (extra - data.lords[lord].influence))
		log(`Disbanded L${lord} to turn ${get_lord_calendar(lord)}.`)
	}

	discard_lord_capability_n(lord, 0)
	discard_lord_capability_n(lord, 1)

	for (let x = 0; x < ASSET_TYPE_COUNT; ++x)
		set_lord_assets(lord, x, 0)

	for (let x = 0; x < FORCE_TYPE_COUNT; ++x) {
		set_lord_forces(lord, x, 0)
		if (get_lord_routed_forces(lord, x) > 0) {
			set_lord_routed_forces(lord, x, 0)
		}
	}

	set_lord_moved(lord, 0)

	for_each_vassal_with_lord(lord, v => {
		disband_vassal(v)
	})
}

// === 3.3.1 MUSTER EXILES ===

function goto_muster_exiles() {
	for (let x = first_friendly_lord; x <= last_friendly_lord; x++) {
		if ((get_lord_locale(x) === current_turn() + CALENDAR && get_lord_in_exile(x))
		|| (is_lancaster_lord(x) && is_lord_on_calendar((get_lord_locale(x)) && get_lord_in_exile(x) && is_event_in_play(EVENT_LANCASTER_BE_SENT_FOR)))) {
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
				if ((get_lord_locale(x) === current_turn() + CALENDAR && get_lord_in_exile(x))
				|| (is_lancaster_lord(x) && is_lord_on_calendar((get_lord_locale(x)) && get_lord_in_exile(x) && is_event_in_play(EVENT_LANCASTER_BE_SENT_FOR)))) {
					gen_action_lord(x)
					done = false
				}
			}
		} else {
			for (let loc of data.exile_boxes)
				if (has_favour_in_locale(game.active, loc))
					gen_action_locale(loc)
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

// === 3.3.2 READY VASSALS ===

function goto_ready_vassals() {
	for (let vassal = first_vassal; vassal <= last_vassal; vassal++) {
		if (get_vassal_service(vassal) === current_turn()) {
			set_vassal_lord_and_service(vassal, VASSAL_READY, 0)
		}
	}

	goto_levy_muster()
}

// === 3.4 MUSTER ===

function reset_flags_for_muster() {
	// to avoid some flags affecting campaign
	game.flags.jack_cade = 0
	game.flags.parliament_votes = 0
}

function goto_levy_muster() {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
		clear_lords_moved()
		// additionnal free specific actions
		if (lord_has_capability(lord, AOW_LANCASTER_THOMAS_STANLEY))
			game.flags.free_levy = 1
		if (is_event_in_play(EVENT_LANCASTER_MY_CROWN_IS_IN_MY_HEART))
			game.flags.free_parley_henry = 2
		if (is_event_in_play(EVENT_YORK_GLOUCESTER_AS_HEIR))
			game.flags.free_parley_gloucester = 3
		if (is_event_in_play(EVENT_YORK_LOYALTY_AND_TRUST))
			game.flags.loyalty_and_trust = 1
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
		goto_levy_discard_events()
}

function can_lord_muster(lord) {
	// already mustered (except free levy)! TODO : re-check parley henry if ships are levied and at exile
	if (get_lord_moved(lord)
	&& (game.flags.free_levy !== 1 || lord !== LORD_HENRY_TUDOR)
	&& (game.flags.free_parley_henry === 0 || lord !== LORD_HENRY_VI || (lord === LORD_HENRY_VI && !can_action_parley_levy()))
	&& (game.flags.free_parley_gloucester === 0 || (lord !== LORD_GLOUCESTER_1 || lord !== LORD_GLOUCESTER_2)))
		return false

	// must be on map
	if (is_lord_on_map(lord)) {
		// can use lordship
		if (is_lord_at_friendly_locale(lord))
			return true
		// can only parley
		if (can_parley_at(get_lord_locale(lord)))
			return true
	}
	return false
}

function has_locale_to_muster(lord) {
	// Can muster at own seat without enemy lord.
	if (!has_enemy_lord(data.lords[lord].seat))
		return true

	// Else, can muster at any friendly seat (of a friendly lord who is also in play)
	for (let other = first_friendly_lord; other <= last_friendly_lord; other++)
		if (is_lord_in_play(other) && is_friendly_locale(data.lords[other].seat))
			return true

	// Tough luck!
	return false
}

states.levy_muster = {
	inactive: "Muster",
	prompt() {
		view.prompt = "Levy: Muster with your Lords."

		prompt_held_event()
		let done = true
		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
			if (can_lord_muster(lord)) {
				gen_action_lord(lord)
				done = false // ???
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
		reset_flags_for_muster()
		lordship_effects(lord)
	},
	end_muster() {
		end_levy_muster()
	},

	card: action_held_event,
}

function resume_levy_muster_lord() {
	game.state = "levy_muster_lord"
	--game.count

	// muster over only if the lord has not spend their free levy actions
	if (game.count === 0 && game.flags.jack_cade === 0 && game.flags.free_levy === 0 && can_add_troops(game.who, get_lord_locale(game.who))) {
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

		let here = get_lord_locale(game.who)

		if (is_friendly_locale(here)) {
			if (game.count > 0) {
				// Roll to muster Ready Lord at Seat
				for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
					if (is_lord_ready(lord) && has_locale_to_muster(lord))
						gen_action_lord(lord)
				}

				// Muster Ready Vassal Forces
				for (let vassal = first_vassal; vassal <= last_vassal; vassal++)
					if (eligible_vassal(vassal))
						gen_action_vassal(vassal)

				// Add Transport
				if (is_seaport(here) && get_lord_assets(game.who, SHIP) < 2)
					view.actions.take_ship = 1

				if (can_add_transport(game.who, CART))
					view.actions.take_cart = 1

				if (can_add_troops(game.who, here))
					view.actions.levy_troops = 1

				// Add Capability
				if (can_add_lord_capability(game.who))
					view.actions.capability = 1

				if (can_action_parley_levy())
					view.actions.parley = 1

				if (can_add_troops_beloved_warwick(game.who, here))
					view.actions.levy_beloved_warwick = 1

				if (can_add_troops_irishmen(game.who, here))
					view.actions.levy_irishmen = 1

				if (can_add_troops_sof(game.who, here))
					view.actions.soldiers_of_fortune = 1

				if (can_add_troops_coa(game.who, here))
					view.actions.commission_of_array = 1
			}

			if (game.count === 0 && lord_has_capability(game.who, AOW_LANCASTER_THOMAS_STANLEY) && can_add_troops(game.who, here)) {
				view.actions.levy_troops = 1
			}
			// Rising wages event
			if (is_event_in_play(EVENT_LANCASTER_RISING_WAGES) && !can_pay_from_shared(game.who)) {
				view.actions.levy_troops = 0
			}
			if (game.count === 0 && game.flags.free_parley_henry > 0 && game.who === LORD_HENRY_VI) {
				view.actions.parley = 1
			}
			if (game.count === 0 && game.flags.free_parley_gloucester > 0 && (game.who === LORD_GLOUCESTER_2 || game.who === LORD_GLOUCESTER_1)) {
				view.actions.parley = 1
			}
			if (game.count === 0 && game.flags.jack_cade > 0) {
				view.actions.parley = 1
			}

		} else {
			// Can only Parley if locale is not friendly.
			if (game.count > 0) {
				if (can_action_parley_levy())
					view.actions.parley = 1
			}
		}

		if (is_event_in_play(EVENT_YORK_LOYALTY_AND_TRUST) && game.flags.loyalty_and_trust) {
			view.actions.loyalty_and_trust = 1
		}

		view.actions.done = 1
	},

	lord(other) {
		push_undo()
		goto_levy_muster_lord_attempt(other)
	},

	vassal(vassal) {
		push_undo()
		game.which = vassal
		goto_levy_muster_vassal(vassal)
	},

	take_ship() {
		push_undo()
		if (check_naval_blockade("levy ship", get_lord_locale(game.who))) {
			roll_naval_blockade()
		}
		else {
			add_lord_assets(game.who, SHIP, 1)
			if (eligible_kings_name()) {
				goto_kings_name("Levy Ship")
			}
			else {
				resume_levy_muster_lord()
			}
		}

	},

	take_cart() {
		push_undo()
		add_lord_assets(game.who, CART, 2)
		if (eligible_kings_name()) {
			goto_kings_name("Levy Cart")
		} else {
			resume_levy_muster_lord()
		}
	},

	levy_troops() {
		push_undo()

		if (is_event_in_play(EVENT_LANCASTER_RISING_WAGES) && game.active === YORK) {
			goto_rising_wages()
			return
		}

		do_levy_troops()
	},

	levy_beloved_warwick() {
		push_undo()
		add_lord_forces(game.who, MILITIA, 5)
		resume_levy_muster_lord()
	},

	levy_irishmen() {
		push_undo()
		add_lord_forces(game.who, MILITIA, 5)
		resume_levy_muster_lord()
	},

	soldiers_of_fortune() {
		push_undo()
		set_lord_unfed(game.who, 1)
		push_state("soldiers_of_fortune")
	},

	commission_of_array() {
		push_undo()
		push_state("commission_of_array")
	},

	capability() {
		push_undo()
		push_state("muster_capability")
	},

	parley() {
		push_undo()
		goto_parley()
	},

	loyalty_and_trust() {
		push_undo()
		game.count += 3
		game.flags.loyalty_and_trust = 0
	},

	done() {
		set_lord_moved(game.who, 1)
		pop_state()
	},
}

// Check if the levy troops is at vassal seat
function chamberlains_eligible_levy(locale) {
	for (let vassal = first_vassal; vassal <= last_vassal; ++vassal)
		if (is_vassal_mustered_with(vassal, game.who) && lord_has_capability(game.who, AOW_LANCASTER_CHAMBERLAINS)) {
			if (locale === data.vassals[vassal].seat)
				return true
		}
}

function do_levy_troops() {
	let here = get_lord_locale(game.who)
	if (
		!lord_has_capability(game.who, AOW_LANCASTER_QUARTERMASTERS) &&
		!lord_has_capability(game.who, AOW_YORK_WOODWILLES) &&
		!chamberlains_eligible_levy(here)
	)
		deplete_locale(here)

	let here_type = data.locales[here].type
	switch (here_type) {
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

	if (is_event_in_play(EVENT_YORK_THE_COMMONS) && is_york_lord(game.who)) {
		goto_the_commons()
	} else {
		if (eligible_kings_name())
			goto_kings_name("Levy Troops")
		else
			resume_levy_muster_lord()
	}
}

// === 3.4.2 LEVY LORD ===

states.muster_lord_at_seat = {
	inactive: "Muster",
	prompt() {
		view.prompt = `Muster: Select Locale for ${lord_name[game.who]}.`
		let found = false
		let seat = data.lords[game.who].seat
		if (!has_enemy_lord(seat)) {
			gen_action_locale(seat)
			found = true
		}

		if (!found) {
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; lord++) {
				if ((is_lord_on_map(lord) || is_lord_on_calendar(lord)) && is_friendly_locale(data.lords[lord].seat)) {
					gen_action_locale(data.lords[lord].seat)
				}
			}
		}
	},
	locale(loc) {
		push_undo()
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
			game.who = game.what
			if (eligible_kings_name()) {
				goto_kings_name("Levy Lord")
			}
			else {
				push_state("muster_lord_at_seat")
			}
		}
		else {
			end_levy_muster_lord_attempt()
		}
	},
}

function end_muster_lord_at_seat() {
	pop_state()
	end_levy_muster_lord_attempt()
}

// === 3.4.3 LEVY VASSAL ===

function eligible_vassal(vassal) {
	if (!is_vassal_ready(vassal)) {
		return false
	}
	if (
		!is_favour_friendly(data.vassals[vassal].seat) &&
		(game.who !== LORD_HENRY_TUDOR || !is_event_in_play(EVENT_LANCASTER_MARGARET_BEAUFORT))
	) {
		return false
	}
	if (!is_favour_friendly(data.vassals[vassal].seat))
		return false
	if (
		game.active === LANCASTER &&
		is_event_in_play(EVENT_YORK_YORKISTS_BLOCK_PARLIAMENT) &&
		!(is_event_in_play(EVENT_LANCASTER_MARGARET_BEAUFORT) && !is_event_in_play(EVENT_LANCASTER_THE_EARL_OF_RICHMOND))
	) {
		return false
	}
	return true
}

function goto_levy_muster_vassal(vassal) {
	game.where = NOWHERE
	let influence_cost = 0
	if (game.active === YORK && is_event_in_play(EVENT_LANCASTER_BUCKINGHAMS_PLOT))
		influence_cost += 2

	push_state("levy_muster_vassal")
	init_influence_check(game.who)
	game.check.push({
		cost: influence_cost,
		modifier: data.vassals[vassal].influence * (game.active === LANCASTER ? -1 : 1),
		source: "vassal",
	})
}

function end_levy_muster_vassal() {
	pop_state()
	end_influence_check()
	resume_levy_muster_lord()
}

states.levy_muster_vassal = {
	inactive: "Levy Vassal",
	prompt() {
		view.prompt = `Levy Vassal ${data.vassals[game.which].name}. `
		prompt_influence_check()
	},
	spend1: add_influence_check_modifier_1,
	spend3: add_influence_check_modifier_2,
	check() {
		let results = do_influence_check()

		if (lord_has_capability(game.who, AOW_LANCASTER_TWO_ROSES)) {
			log(`Automatic Success. C${AOW_LANCASTER_TWO_ROSES}.`)
		}
		else if (game.active === LANCASTER && is_event_in_play(EVENT_LANCASTER_THE_EARL_OF_RICHMOND) && game.state === "levy_muster_vassal") {
			log(`Automatic Success. C${EVENT_LANCASTER_THE_EARL_OF_RICHMOND}.`)
		}
		else {
			log(`Attempt to levy V${game.which} ${results.success ? "Successful" : "Failed"}: (${range(results.rating)}) ${results.success ? HIT[results.roll] : MISS[results.roll]}`)
		}

		if (results.success) {
			if (eligible_kings_name()) {
				goto_kings_name("Levy Vassal")
			}
			else {
				muster_vassal(game.which, game.who)
				end_levy_muster_vassal()
			}
		}
		else {
			end_levy_muster_vassal()
		}
	},
}

// === 3.4.4 LEVY TROOPS ===

function can_add_troops(_lordwho, locale) {
	if (!has_exhausted_marker(locale) && !is_exile(locale))
		return true
	return false
}

function can_add_troops_coa(lordwho, locale) {
	for (let next of data.locales[locale].adjacent) {
		if (is_friendly_locale(next) && lord_has_capability(lordwho, AOW_LANCASTER_COMMISION_OF_ARRAY) && (!has_exhausted_marker(locale) && !is_exile(locale)))
			return true
	}
	return false
}

function can_add_troops_beloved_warwick(lordwho, locale) {
	return (
		lord_has_capability(lordwho, AOW_YORK_BELOVED_WARWICK) &&
		!has_exhausted_marker(locale) &&
		!is_exile(locale)
	)
}

function can_add_troops_irishmen(lordwho, locale) {
	return (
		lord_has_capability(lordwho, AOW_YORK_IRISHMEN) &&
		!has_exhausted_marker(locale) &&
		(locale === LOC_IRELAND || data.port_3.includes(locale))
	)
}

function can_add_troops_sof(lordwho, locale) {
	if (
		lord_has_capability(lordwho, AOW_YORK_SOLDIERS_OF_FORTUNE) &&
		!has_exhausted_marker(locale) &&
		!is_exile(locale) &&
		get_shared_assets(locale, COIN) > 0
	) {
		let number = 6
		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
			number -= get_lord_forces(lord, MERCENARIES)
		if (number >= 1)
			return true
	}
	return false
}

// === 3.4.5 LEVY TRANSPORT

function can_add_transport(who, what) {
	return get_lord_assets(who, what) < 100
}

// === 3.4.6 LEVY CAPABILITY ===

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

function forbidden_levy_capabilities(c) {
	// Some capabilities override the forbidden levy vassals
	if (lord_has_capability(game.who, AOW_LANCASTER_TWO_ROSES)) {
		if (c === AOW_LANCASTER_THOMAS_STANLEY || AOW_LANCASTER_MY_FATHERS_BLOOD) {
			return true
		}
	}
	// Forbids levy vassals, even through capabilities
	if (is_event_in_play(EVENT_YORK_YORKISTS_BLOCK_PARLIAMENT)) {
		if (c === AOW_LANCASTER_THOMAS_STANLEY
			|| c === AOW_LANCASTER_EDWARD
			|| c === AOW_LANCASTER_MONTAGU
			|| c === AOW_LANCASTER_MY_FATHERS_BLOOD
			|| c === AOW_LANCASTER_ANDREW_TROLLOPE) {
			return false
		}
	}
	return true
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

states.muster_capability = {
	inactive: "Muster",
	prompt() {
		let deck = list_deck()
		view.prompt = `Muster: Select a new Capability for ${lord_name[game.who]}.`
		view.arts_of_war = deck
		for (let c of deck) {
			if (!data.cards[c].lords || set_has(data.cards[c].lords, game.who)) {
				if (!lord_already_has_capability(game.who, c) && forbidden_levy_capabilities(c))
					gen_action_card(c)
			}
		}
	},
	card(c) {
		if (eligible_kings_name()) {
			log(`${data.lords[game.who].name} is mustering C${c}`)
			game.which = c
			goto_kings_name("Capability")
		} else {
			add_lord_capability(game.who, c)
			capability_muster_effects(game.who, c)
			pop_state()
			resume_levy_muster_lord()
		}
	},
}

// === 3.4 MUSTER - DISCARD EVENTS ===

function goto_levy_discard_events() {
	// Discard "This Levy" events from play.
	discard_events("this_levy")
	discard_extra_levy_events()
	goto_campaign_plan()
}

// === 4.1 CAMPAIGN: PLAN ===

function goto_campaign_plan() {
	game.turn++

	log_h1("Campaign " + current_turn_name())

	set_active(BOTH)
	game.state = "campaign_plan"
	game.plan_y = []
	game.plan_l = []
}

states.campaign_plan = {
	inactive: "Plan",
	prompt(current) {
		let plan = current === YORK ? game.plan_y : game.plan_l
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
			if (count_cards_in_plan(plan, NOBODY) < 7)
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
			game.plan_y.push(lord)
		else
			game.plan_l.push(lord)
	},
	undo(_, current) {
		if (current === YORK) {
			game.plan_y.pop()
		} else {
			game.plan_l.pop()
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

// === 4.2 CAMPAIGN: COMMAND ===

// First action vs actions that take full command card
function is_first_action() {
	return game.flags.first_action
}

// If march on a highway, set the flag so the lord can go through
// a second highway at no cost
function is_first_march_highway() {
	if (game.flags.first_march_highway === 1)
		return true
	else
		return false
}

function goto_command_activation() {
	if (game.plan_y.length === 0 && game.plan_l.length === 0) {
		game.command = NOBODY
		goto_end_campaign()
		return
	}

	if (check_campaign_victory())
		return

	if (game.plan_l.length > game.plan_y.length) {
		set_active(LANCASTER)
		game.command = game.plan_l.shift()
	} else if (game.plan_l.length < game.plan_y.length) {
		set_active(YORK)
		game.command = game.plan_y.shift()
	} else {
		set_active(P1)
		if (P1 === LANCASTER)
			game.command = game.plan_l.shift()
		else
			game.command = game.plan_y.shift()
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

function goto_command() {
	game.actions = data.lords[game.command].command
	if (lord_has_capability(game.command, AOW_YORK_THOMAS_BOURCHIER) && is_city(get_lord_locale(game.command)))
		game.actions += 1
	if (lord_has_capability(game.command, AOW_YORK_YORKS_FAVOURED_SON))
		game.actions += 1
	if (lord_has_capability(game.command, AOW_YORK_HASTINGS))
		game.actions += 1

	game.group = [ game.command ]

	game.flags.surprise_landing = 0
	game.flags.first_action = 1
	game.flags.first_march_highway = 0
	game.flags.march_to_port = 0
	game.flags.sail_to_port = 0

	resume_command()
}

function resume_command() {
	game.state = "command"
}

// Spending an action reset some flags
function spend_action(cost) {
	game.flags.surprise_landing = 0
	game.flags.first_action = 0
	game.flags.first_march_highway = 0
	game.actions -= cost
}

function spend_march_action(cost) {
	game.flags.surprise_landing = 0
	game.flags.first_action = 0
	game.flags.first_march_highway = 0
	game.actions -= cost
}

function spend_all_actions() {
	game.flags.surprise_landing = 0
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
			(lord_has_capability(game.command, AOW_YORK_CAPTAIN) && !other_marshal_or_lieutenant(here))
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
		if (can_action_heralds())
			view.actions.heralds = 1
		if (can_action_merchants())
			view.actions.merchants = 1
		if (can_action_agitators())
			view.actions.agitators = 1

		if (is_york_lord(game.command))
			if (can_action_exile_pact())
				view.actions.exile_pact = 1
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
	heralds: goto_heralds,
	merchants: goto_merchants,
	agitators: goto_agitators,
	exile_pact: goto_exile_pact,

	locale: goto_march,

	lord(lord) {
		set_toggle(game.group, lord)
	},

	card: action_held_event,

	parley() {
		push_undo()
		goto_parley()
	},
}

// === 4.5 ACTION: SUPPLY (SEARCH) ===

function can_supply_at(loc, ships) {
	// if theoretically possible to supply (does not check carts or ships)
	if (is_stronghold(loc) && is_friendly_locale(loc)) {
		if (ships > 0 && is_seaport(loc))
			return true
		if (!has_exhausted_marker(loc))
			return true
	}
	return false
}

function search_supply_by_way(result, start, carts, ships) {
	search_dist.fill(0)
	search_seen.fill(0)
	search_seen[start] = 1

	let queue = [ start ]
	while (queue.length > 0) {
		let here = queue.shift()
		let dist = search_dist[here]

		if (can_supply_at(here, ships)) {
			if (result)
				map_set(result, here, dist)
			else
				return true
		}

		if (is_friendly_locale(here)) {
			let next_dist = dist + 1
			if (next_dist <= carts) {
				for (let next of data.locales[here].adjacent) {
					if (!search_seen[next]) {
						search_seen[next] = 1
						search_dist[next] = next_dist
						queue.push(next)
					}
				}
			}
		}
	}

	if (result)
		return result
	return false
}

function search_supply_by_sea(result, here) {
	// Search via sea from Exile box.
	if (is_friendly_locale(here)) {
		for (let next of find_ports(here)) {
			if (can_supply_at(next, 1)) {
				if (result)
					map_set(result, next, 0)
				else
					return true
			}
		}
	}
	if (result)
		return result
	return false
}

function search_supply(result) {
	let here = get_lord_locale(game.command)
	let carts = get_shared_assets(here, CART)
	let ships = get_shared_assets(here, SHIP)
	if (ships > 0 && is_exile(here))
		result = search_supply_by_sea(result, here)
	result = search_supply_by_way(result, here, carts, ships)
	return result
}

// === 4.5 ACTION: SUPPLY ===

function command_has_harbingers() {
	return (
		lord_has_capability(game.command, AOW_LANCASTER_HARBINGERS) ||
		lord_has_capability(game.command, AOW_YORK_HARBINGERS)
	)
}

function chamberlains_eligible_supply(source) {
	for (let vassal = first_vassal; vassal <= last_vassal; ++vassal)
		if (
			is_vassal_mustered_with(vassal, game.command) &&
			lord_has_capability(game.command, AOW_LANCASTER_CHAMBERLAINS)
		) {
			if (source === data.vassals[vassal].seat)
				return true
		}
}

function command_has_stafford_branch(loc) {
	if (lord_has_capability(game.command, AOW_YORK_STAFFORD_BRANCH)) {
		return (
			loc === LOC_EXETER ||
			loc === LOC_LAUNCESTON ||
			loc === LOC_PLYMOUTH ||
			loc === LOC_WELLS ||
			loc === LOC_DORCHESTER
		)
	}
	return false
}

function init_supply() {
	game.supply = search_supply([])
}

function can_action_supply() {
	if (game.actions < 1)
		return false
	return search_supply(false)
}

function goto_supply() {
	push_undo()
	log(`Supplied`)
	game.state = "supply_source"
	init_supply()
}

function modify_supply(loc, supply) {
	let here = get_lord_locale(game.command)
	let carts = get_shared_assets(here, CART)

	// Must carry supply over land with one cart per provender per way
	let distance = map_get(game.supply, loc, 0)
	if (distance > 0)
		supply = Math.min(supply, Math.floor(carts / distance))

	// Harbingers event doubles supply received
	if (command_has_harbingers())
		supply = supply * 2

	return supply
}

function get_port_supply_amount(loc) {
	if (is_seaport(loc)) {
		let here = get_lord_locale(game.command)
		let ships = get_shared_assets(here, SHIP)
		return modify_supply(loc, ships)
	}
	return 0
}

function get_stronghold_supply_amount(loc) {
	if (!has_exhausted_marker(loc)) {
		let supply

		if (loc === LOC_LONDON || loc === LOC_CALAIS)
			supply = 3
		else if (is_city(loc))
			supply = 2
		else
			supply = 1

		if (command_has_stafford_branch(loc))
			supply += 1

		return modify_supply(loc, supply)
	}
	return 0
}

states.supply_source = {
	inactive: "Supply",
	prompt() {
		view.prompt = "Supply: Select Supply Source."

		let here = get_lord_locale(game.command)
		let carts = get_shared_assets(here, CART)
		let ships = get_shared_assets(here, SHIP)

		if (carts > 0)
			view.prompt += ` ${carts} Cart.`
		if (ships > 0)
			view.prompt += ` ${ships} Ship.`

		for (let i = 0; i < game.supply.length; i += 2)
			gen_action_locale(game.supply[i])
	},
	locale(loc) {
		push_undo()

		let port_supply = get_port_supply_amount(loc)
		let stronghold_supply = get_stronghold_supply_amount(loc)

		if (stronghold_supply > 0 && port_supply === 0) {
			use_stronghold_supply(loc, stronghold_supply)
			return
		}

		if (port_supply > 0 && stronghold_supply === 0) {
			use_port_supply(loc, port_supply)
			return
		}

		game.where = loc
		game.state = "select_supply_type"
	},
}

function quartermasters_eligible_supply(source) {
	for (let vassal = first_vassal; vassal <= last_vassal; ++vassal)
		if (
			is_vassal_mustered_with(vassal, game.command) &&
			lord_has_capability(game.command, AOW_LANCASTER_CHAMBERLAINS)
		) {
			if (source === data.vassals[vassal].seat)
				return true
		}
}

function use_stronghold_supply(source, amount) {
	logi(`${amount} from Stronghold at %${source}`)
	add_lord_assets(game.command, PROV, amount)
	if (chamberlains_eligible_supply(source)) {
		end_supply()
	}
	else {
		deplete_locale(source)
		end_supply()
	}
}

function use_port_supply(source, amount) {
	logi(`${amount} from Port at %${source}`)
	add_lord_assets(game.command, PROV, amount)
	end_supply()
}

function end_supply() {
	spend_action(1)
	resume_command()
	game.supply = 0
	game.where = NOWHERE
}

states.select_supply_type = {
	inactive: "Supply",
	prompt() {
		let port = get_port_supply_amount(game.where)
		let stronghold = get_stronghold_supply_amount(game.where)

		view.prompt = `Supply: ${stronghold} from Stronghold or ${port} from Port?`
		view.actions.stronghold = 1
		view.actions.port = 1
	},
	stronghold() {
		use_stronghold_supply(game.where, get_stronghold_supply_amount(game.where))
	},
	port() {
		if (check_naval_blockade("supply", game.where)) {
			roll_naval_blockade()
		}
		else {
			use_port_supply(game.where, get_port_supply_amount(game.where))
		}
	},
}

// === 4.6.1 ACTION: SAIL ===

function has_enough_available_ships_for_army() {
	let ships = count_group_ships()
	let army = count_lord_all_forces(game.group)
	let needed_ships = army / 6
	return needed_ships <= ships
}

function is_seamanship_in_play() {
	if (game.active === LANCASTER && is_event_in_play(EVENT_LANCASTER_SEAMANSHIP))
		return true
	if (game.active === YORK && is_event_in_play(EVENT_YORK_SEAMANSHIP))
		return true
	return false
}

function can_sail_to(to) {
	if (is_wales_forbidden(to))
		return false
	if (has_enemy_lord(to)) {
		if (is_truce_in_effect())
			return false
		if (!lord_has_capability(game.command, AOW_LANCASTER_HIGH_ADMIRAL))
			return false
	}
	return true
}

function can_action_sail() {
	// Must use whole action except if seamanship in play

	if (is_lancaster_lord(game.command)) {
		if (!is_first_action() && !is_event_in_play(EVENT_LANCASTER_SEAMANSHIP))
			return false
	}

	if (is_york_lord(game.command)) {
		if ((is_event_in_play(EVENT_LANCASTER_FRENCH_FLEET) || !is_first_action() && !is_event_in_play(EVENT_YORK_SEAMANSHIP)))
			return false
	}

	if (game.actions === 0)
		return false

	// at a seaport
	let here = get_lord_locale(game.command)
	if (!is_seaport(here))
		return false

	// with enough ships to carry all the army
	if (!has_enough_available_ships_for_army())
		return false

	// and a valid destination
	for (let to of find_sail_locales(here)) {
		if (to === here)
			continue
		if (can_sail_to(to))
			return true
	}

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
			view.prompt = `Sail: Select a destination Port.`
			for (let to of find_sail_locales(here)) {
				if (to === here)
					continue
				if (can_sail_to(to))
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
		if (check_naval_blockade("sail", get_lord_locale(game.command)) || check_naval_blockade("sail", to)) {
			roll_naval_blockade()
			game.where = to
		}
		else {
			do_sail(to)
		}
	},
}

function do_sail(to) {
	log(`Sailed to %${to}${format_group_move()}.`)

	game.flags.march_to_port = 0
	if (is_seaport(to))
		game.flags.sail_to_port = 1
	else
		game.flags.sail_to_port = 0

	for (let lord of game.group) {
		set_lord_locale(lord, to)
		set_lord_moved(lord, 1)
		levy_burgundians(lord)
	}

	if (is_seamanship_in_play())
		spend_action(1)
	else
		spend_all_actions()

	// you can go to unbesieged enemy lord with norfolk capability
	if (has_unbesieged_enemy_lord(to))
		goto_confirm_approach_sail()
	else {
		resume_command()
	}
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

// === 4.6.2 ACTION: FORAGE ===

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
	if (!has_adjacent_enemy(here) && is_neutral_locale(here)) {
		let die = roll_die()
		if (die <= 4) {
			add_lord_assets(game.command, PROV, 1)
			log(`${HIT[die]}, Foraged at %${here}`)
			deplete_locale(here)
		} else {
			log(`${MISS[die]}, Forage Failure`)
		}
	} else if (has_adjacent_enemy(here) || is_favour_enemy(here, game.active)) {
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

// === 4.6.3 ACTION: TAX ===

function can_tax_at(here) {
	if (is_friendly_locale(here) && !has_exhausted_marker(here)) {
		// London, Calais, and Harlech
		if (here === LOC_LONDON || here === LOC_CALAIS || here === LOC_HARLECH)
			return true

		// Own seat
		if (here === data.lords[game.command].seat)
			return true

		// vassal seats
		for (let vassal = first_vassal; vassal <= last_vassal; ++vassal)
			if (is_vassal_mustered_with(vassal, game.command))
				if (here === data.vassals[vassal].seat)
					return true
	}
	return false
}

// adjacent friendly locales to an eligible stronghold (can_tax_at)
function search_tax(result, start) {
	let ships = get_shared_assets(start, SHIP)

	search_seen.fill(0)
	search_seen[start] = 1

	let queue = [ start ]
	while (queue.length > 0) {
		let here = queue.shift()

		if (can_tax_at(here)) {
			if (result)
				set_add(result, here)
			else
				return true
		}

		if (is_friendly_locale(here)) {
			for (let next of data.locales[here].adjacent) {
				if (!search_seen[next]) {
					search_seen[next] = 1
					queue.push(next)
				}
			}
			if (ships > 0 && is_seaport(here)) {
				for (let next of find_ports(here)) {
					if (!search_seen[next]) {
						search_seen[next] = 1
						queue.push(next)
					}
				}
			}
		}
	}
	if (result)
		return result
	else
		return false
}

function can_action_tax() {
	if (game.actions < 1)
		return false
	let here = get_lord_locale(game.command)
	if (can_tax_at(here))
		return true
	return search_tax(false, here)
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
	spend_action(1)
	resume_command()
}

function get_tax_amount(loc) {
	let tax

	if (loc === LOC_LONDON || loc === LOC_CALAIS)
		tax = 3
	else if (is_city(loc))
		tax = 2
	else
		tax = 1

	if (command_has_stafford_branch(loc))
		tax += 1

	return tax
}

states.tax = {
	inactive: "Tax",
	prompt() {
		view.prompt = "Tax: Select the location to tax."
		if (game.where === NOWHERE) {
			for (let loc of search_tax([], get_lord_locale(game.command)))
				gen_action_locale(loc)
		} else {
			view.prompt = `Tax: Attempting to tax ${data.locales[game.where].name}. `
			prompt_influence_check()
		}
	},
	locale(loc) {
		game.where = loc
		if (loc === data.lords[game.command].seat) {
			// Auto succeed without influence check at Lords seat.
			deplete_locale(game.where)

			log(`Taxed automatically successful at %${game.where}.`)
			add_lord_assets(game.command, COIN, get_tax_amount(game.where))
			end_tax()
		}
	},
	spend1: add_influence_check_modifier_1,
	spend3: add_influence_check_modifier_2,
	check() {
		let results = do_influence_check()
		logi(`Tax : ${results.success ? "Successful" : "Failed"}: (${range(results.rating)}) ${results.success ? HIT[results.roll] : MISS[results.roll]}`)

		if (lord_has_capability(game.command, AOW_YORK_SO_WISE_SO_YOUNG)) {
			log(`C${AOW_YORK_SO_WISE_SO_YOUNG}.`)
			add_lord_assets(game.command, COIN, 1)
		}

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
					game.where === LOC_DORCHESTER)
			)
				add_lord_assets(game.command, COIN, 1)
		} else {
			log(`Tax of %${game.where} failed.`)
		}
		end_tax()
	},
}

// === 4.6.4 ACTION: PARLEY ===

// TODO : FIX Parley through strongholds overseas
function can_parley_at(loc) {
	return !is_exile(loc) && !is_friendly_locale(loc) && !has_enemy_lord(loc) && !is_sea(loc)
}

var search_seen = new Array(last_locale + 1)
var search_dist = new Array(last_locale + 1)

function search_parley(result, start) {
	let ships = get_shared_assets(start, SHIP)

	search_dist.fill(0)
	search_seen.fill(0)
	search_seen[start] = 1

	let queue = [ start ]
	while (queue.length > 0) {
		let here = queue.shift()
		let dist = search_dist[here]
		let next_dist = dist + 1

		if (can_parley_at(here)) {
			if (result)
				map_set(result, here, dist)
			else
				return true
		}

		if (is_friendly_locale(here)) {
			for (let next of data.locales[here].adjacent) {
				if (!search_seen[next]) {
					search_seen[next] = 1
					search_dist[next] = next_dist
					queue.push(next)
				}
			}
			if (ships > 0 && is_seaport(here)) {
				for (let next of find_ports(here)) {
					if (!search_seen[next]) {
						search_seen[next] = 1
						search_dist[next] = next_dist
						queue.push(next)
					}
				}
			}
		}
	}

	if (result)
		return result
	else
		return false
}

function can_action_parley_command() {
	if (game.actions <= 0)
		return false

	if (is_lord_at_sea(game.command))
		return false

	if (!is_first_action() && game.active === YORK && is_event_in_play(EVENT_LANCASTER_NEW_ACT_OF_PARLIAMENT))
		return false

	let here = get_lord_locale(game.command)

	if (can_parley_at(here))
		return true

	for (let next of data.locales[here].adjacent)
		if (can_parley_at(next))
			return true

	if (is_seaport(here) && get_shared_assets(here, SHIP) > 0)
		for (let next of find_ports(here))
			if (can_parley_at(next))
				return true

	return false
}

function list_parley_command() {
	let result = []

	let here = get_lord_locale(game.command)
	if (can_parley_at(here))
		map_set(result, here, 0)

	if (is_friendly_locale(here)) {
		for (let next of data.locales[here].adjacent)
			if (can_parley_at(next))
				map_set(result, next, 1)

		if (is_seaport(here) && get_shared_assets(here, SHIP) > 0)
			for (let next of find_ports(here))
				if (can_parley_at(next))
					map_set(result, next, 1)
	}

	return result
}

function can_action_parley_levy() {
	if (game.count <= 0
		&& (game.who !== LORD_HENRY_VI || game.flags.free_parley_henry === 0)
		&& ((game.who !== LORD_GLOUCESTER_1 && game.who !== LORD_GLOUCESTER_2) || game.flags.free_parley_gloucester === 0)
		&& (!game.flags.jack_cade))
		return true
	let here = get_lord_locale(game.who)
	if (can_parley_at(here))
		return true
	return search_parley(false, here)
}

function list_parley_levy() {
	let here = get_lord_locale(game.who)
	return search_parley([], here)
}

function goto_parley() {
	push_state("parley")

	if (is_levy_phase()) {
		init_influence_check(game.who)
		game.parley = list_parley_levy()
	} else {
		init_influence_check(game.command)
		game.parley = list_parley_command()

		// Campaign phase, and current location is no cost (except some events), and always successful.
		if (game.parley.length === 2 && get_lord_locale(game.command) === game.parley[0]) {
			log(`Parley at ${data.locales[get_lord_locale(game.command)]}`)
			shift_favour_toward(game.parley[0])
			if (is_lancaster_card(game.command) && is_event_in_play(EVENT_YORK_AN_HONEST_TALE_SPEEDS_BEST)) {
				reduce_lancaster_influence(1)
			}
			end_parley()
			return
		}
	}

	if (game.parley.length === 2) {
		game.where = game.parley[0]
		add_influence_check_distance(game.parley[1])
	} else {
		game.where = NOWHERE
	}
}

function end_parley() {
	pop_state()
	game.flags.naval_blockade = 0
	game.where = NOWHERE
	game.parley = NOTHING
	if (game.flags.free_parley_henry > 0 && game.who === LORD_HENRY_VI) {
		--game.flags.free_parley_henry
		++game.count
	}
	if (game.flags.free_parley_gloucester > 0 && (game.who === LORD_GLOUCESTER_1 || game.who === LORD_GLOUCESTER_2)) {
		--game.flags.free_parley_gloucester
		++game.count
	}
	if (game.flags.jack_cade > 0) {
		--game.flags.jack_cade
		++game.count
	}
	end_influence_check()
	if (is_campaign_phase()) {
		if (game.active === YORK && is_event_in_play(EVENT_LANCASTER_NEW_ACT_OF_PARLIAMENT))
			spend_all_actions()
		else
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
			for (let i = 0; i < game.parley.length; i += 2)
				gen_action_locale(game.parley[i])
		} else {
			view.prompt = "Parley: "
			prompt_influence_check()
		}
	},
	locale(loc) {
		push_undo()
		game.where = loc
		add_influence_check_distance(map_get(game.parley, loc, 0))
		if (is_levy_phase() && check_naval_blockade("levy parley", loc)) {
			roll_naval_blockade()
		}
		if (is_campaign_phase() && check_naval_blockade("campaign parley", loc))
			roll_naval_blockade()
	},
	spend1: add_influence_check_modifier_1,
	spend3: add_influence_check_modifier_2,
	check() {
		let results = do_influence_check()

		if (game.flags.parliament_votes === 1) {
			log(`Parley at ${data.locales[game.where].name}. Automatic Success.`)
			logevent(EVENT_LANCASTER_PARLIAMENT_VOTES)
			game.flags.parliament_votes = 0
		}
		else if (game.flags.jack_cade > 0) {
			log(`Parley at ${data.locales[game.where].name}. Automatic Success.`)
			logevent(EVENT_YORK_JACK_CADE)
		}
		else if (game.flags.succession === 1) {
			log(`Parley at ${data.locales[game.where].name}. Automatic Success.`)
			logevent(EVENT_YORK_SUCCESSION)
			game.flags.succession = 0
		}
		else if (is_campaign_phase()
		&& game.command === LORD_DEVON
		&& get_lord_locale(LORD_DEVON) === LOC_EXETER
		&& is_event_in_play(EVENT_YORK_DORSET)
		&& game.state === "parley") {
			log(`Parley at ${data.locales[game.where].name}. Automatic Success. C${EVENT_YORK_DORSET}.`)
		}
		else
			log(`Attempt to Parley at %${game.where} ${results.success ? "Successful" : "Failed"}: (${range(results.rating)}) ${results.success ? HIT[results.roll] : MISS[results.roll]}`)
		if (results.success) {
			shift_favour_toward(game.where)
			if (eligible_kings_name()) {
				goto_kings_name("Parley")
			}
			else {
				end_parley()
			}
		}
		else {
			end_parley()
		}
	}
}

// === 4.3 ACTION: MARCH ===

function get_way_type(from, to) {
	return map_get(data.ways[from], to, undefined)
}

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

// Wales forbidden to the lancastrians for march, sail, intercept
function is_wales_forbidden(loc) {
	if (game.active === LANCASTER && is_event_in_play(EVENT_YORK_OWAIN_GLYNDWR) && is_wales(loc))
		return true
	return false
}

function is_wales_forbidden_to_enemy(loc) {
	if (game.active !== LANCASTER && is_event_in_play(EVENT_YORK_OWAIN_GLYNDWR) && is_wales(loc))
		return true
	return false
}

function can_march_to(to) {
	if (is_wales_forbidden(to))
		return false
	if (is_truce_in_effect() && has_enemy_lord(to))
		return false
	return true
}

function prompt_march() {
	let from = get_lord_locale(game.command)

	if (is_first_action()) {
		for (let to of data.locales[from].paths) {
			if (can_march_to(to))
				gen_action_locale(to)
		}
	}
	if (game.actions > 0 || game.flags.surprise_landing === 2) {
		for (let to of data.locales[from].roads) {
			if (can_march_to(to))
				gen_action_locale(to)

		}
		for (let to of data.locales[from].highways) {
			if (can_march_to(to))
				gen_action_locale(to)
		}
	} else if ((game.actions === 0 && is_first_march_highway()) || game.flags.surprise_landing === 2) {
		for (let to of data.locales[from].highways) {
			if (can_march_to(to))
				gen_action_locale(to)
		}
	}
	if (
		(lord_has_capability(game.command, AOW_YORK_YORKISTS_NEVER_WAIT) || (is_event_in_play(EVENT_LANCASTER_FORCED_MARCHES) && game.active === LANCASTER)) &&
		game.actions === 0 &&
		is_first_march_highway() &&
		count_group_lords() === 1
	) {
		for (let to of data.locales[from].roads) {
			if (can_march_to(to))
				gen_action_locale(to)
		}
	}
}

function goto_march(to) {
	push_undo()
	let from = get_lord_locale(game.command)
	game.march = { from, to, avoid: -1 }
	march_with_group_1()
}

function march_with_group_1() {
	let transport = count_group_assets(CART)
	let prov = count_group_assets(PROV)
	if (prov > transport)
		game.state = "march_laden"
	else
		march_with_group_2()
}

// No laden but re-used to discard extra provender
states.march_laden = {
	inactive: "March",
	prompt() {
		let to = game.march.to
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
	let from = game.march.from
	let to = game.march.to
	let type = get_way_type(from, to)
	let alone = count_group_lords() === 1

	switch (type) {
		case "highway":
			if (is_first_march_highway() || game.flags.surprise_landing === 2) {
				spend_march_action(0)
			} else {
				spend_march_action(1)
				game.flags.first_march_highway = 1
			}
			break

		case "road":
			if ((alone && is_first_march_highway()) || game.flags.surprise_landing === 2) {
				spend_march_action(0)
			} else {
				spend_march_action(1)
				if (alone && (lord_has_capability(game.command, AOW_YORK_YORKISTS_NEVER_WAIT) || (is_event_in_play(EVENT_LANCASTER_FORCED_MARCHES) && game.active === LANCASTER)))
					game.flags.first_march_highway = 1
			}
			break

		case "path":
			spend_all_actions()
			break
	}

	log(`Marched to %${to}${format_group_move()}.`)

	for (let lord of game.group) {
		set_lord_locale(lord, to)
		// Note: We flag the lords moved and levy burgundians after king's parley and parliament's truce have resolved.
		// See end_kings_parley.
	}

	goto_intercept()
}

function end_march() {
	// Disbanded in battle!
	if (!is_lord_on_map(game.command)) {
		game.where = NOWHERE
		game.march = 0
		spend_all_actions()
		resume_command()
		return
	}

	let here = get_lord_locale(game.command)
	if (is_seaport(here))
		game.flags.march_to_port = 1
	else
		game.flags.march_to_port = 0
	game.flags.sail_to_port = 0

	game.march = 0
	resume_command()
}

// === 4.3.4 INTERCEPT ===

function can_intercept_to(to) {
	// TODO: forbid lancaster intercept into york moving to york, and vice versa
	if (is_truce_in_effect())
		return false
	if (is_wales_forbidden_to_enemy(to))
		return false
	return true
}

function goto_intercept() {
	let here = get_lord_locale(game.command)
	if (can_intercept_to(here)) {
		for (let next of data.locales[here].not_paths) {
			if (has_enemy_lord(next)) {
				game.state = "intercept"
				set_active_enemy()
				game.intercept_group = []
				game.who = NOBODY
				return
			}
		}
	}
	end_intercept()
}

function end_intercept() {
	game.intercept_group = 0
	game.who = NOBODY
	goto_kings_parley()
}

function can_play_held_event_intercept(c) {
	switch (c) {
		case EVENT_LANCASTER_FLANK_ATTACK:
			return can_play_flank_attack()
		case EVENT_YORK_FLANK_ATTACK:
			return can_play_flank_attack()
	}
	return false
}

function prompt_held_event_intercept() {
	for (let c of current_hand())
		if (can_play_held_event_intercept(c))
			gen_action_card(c)
}

states.intercept = {
	inactive: "Intercept",
	prompt() {
		view.prompt = `Choose lord to intercept moving lords?`
		let to = get_lord_locale(game.command)

		prompt_held_event_intercept()

		if (game.who === NOBODY) {
			for (let next of data.locales[to].not_paths)
				for_each_friendly_lord_in_locale(next, gen_action_lord)
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
	card(c) {
		push_undo()
		play_held_event(c)
	},
	pass() {
		set_active_enemy()
		end_intercept()
	},
	intercept() {
		let valour = data.lords[game.who].valour
		let success = false
		if (is_event_in_play(EVENT_LANCASTER_FLANK_ATTACK || is_event_in_play(EVENT_YORK_FLANK_ATTACK))) {
			success = true
			// FIXME: swap_battle_attacker = 1 ???
		}
		else {
			let roll = roll_die()
			success = roll <= valour
			log(`Intercept ${success ? "Succeeded." : "Failed."} (${range(valour)}): ${success ? HIT[roll] : MISS[roll]}`)
		}
		if (success) {
			goto_intercept_march()
		} else {
			set_active_enemy()
			end_intercept()
		}
	},
}

function goto_intercept_march() {
	if (count_group_transport(game.intercept_group) >= count_group_assets(PROV, game.intercept_group)) {
		do_intercept_march()
	} else {
		game.state = "intercept_march"
	}
}

function do_intercept_march() {
	for (let lord of game.intercept_group) {
		set_lord_locale(lord, get_lord_locale(game.command))
		set_lord_moved(lord, 1)
		levy_burgundians(lord)
	}
	end_intercept_march()
}

function end_intercept_march() {
	// back to originally marching lord
	set_active_enemy()
	end_intercept()
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

function for_each_friendly_lord_in_locale(loc, f) {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; lord++)
		if (get_lord_locale(lord) === loc)
			f(lord)
}

// === MARCH EVENT: FLANK ATTACK ===

function can_play_flank_attack() {
	return game.state === "intercept" && game.who !== NOBODY && !is_truce_in_effect()
}

// === MARCH EVENT: KING'S PARLEY ===

function goto_kings_parley() {
	// If Henry VI in space, with King's Parley capability
	// TODO: ... unless he intercepted York lords already present ?
	// TODO: ... or remove possibility for above case.
	if (game.active === YORK) {
		if (get_lord_locale(LORD_HENRY_VI) === game.march.to) {
			if (lord_has_capability(LORD_HENRY_VI, AOW_LANCASTER_KINGS_PARLEY)) {
				set_active_enemy()
				game.state = "kings_parley"
				return
			}
		}
	}
	end_kings_parley()
}

states.kings_parley = {
	inactive: "King's Parley?",
	prompt() {
		view.prompt = "You may discard King's Parley to cancel Yorkist approach."
		gen_action_card(AOW_LANCASTER_KINGS_PARLEY)
		view.actions.pass = 1
	},
	card(_) {
		push_undo()
		discard_lord_capability(LORD_HENRY_VI, AOW_LANCASTER_KINGS_PARLEY)

		// Cancel approach!
		for (let lord of game.group)
			set_lord_locale(lord, game.march.from)

		set_active_enemy()
		end_march()
	},
	pass() {
		set_active_enemy()
		end_kings_parley()
	},
}

function end_kings_parley() {
	goto_parliaments_truce()
}

// === MARCH EVENT: PARLIAMENT'S TRUCE ===

function can_play_parliaments_truce() {
	return game.state === "campaign"
}

function is_truce_in_effect() {
	return (
		is_event_in_play(EVENT_YORK_PARLIAMENTS_TRUCE) ||
		is_event_in_play(EVENT_LANCASTER_PARLIAMENTS_TRUCE)
	)
}

function goto_parliaments_truce() {
	// The non-active player can cancel approach with parliament's truce

	// We don't allow the active player to cancel an intercept -- if they want to cancel
	// an interception, they should have played the event before marching.

	let here = get_lord_locale(game.command)
	if (
		has_enemy_lord(here) && (
			(game.active === YORK && could_play_card(EVENT_LANCASTER_PARLIAMENTS_TRUCE)) ||
			(game.active === LANCASTER && could_play_card(EVENT_YORK_PARLIAMENTS_TRUCE))
		)
	) {
		set_active_enemy()
		game.state = "parliaments_truce"
		return
	}

	end_parliaments_truce()
}

states.parliaments_truce = {
	inactive: "Parliament's Truce?",
	prompt() {
		view.prompt = "You may play Parliament's Truce to cancel approach."
		if (game.active === YORK)
			gen_action_card_if_held(EVENT_YORK_PARLIAMENTS_TRUCE)
		else
			gen_action_card_if_held(EVENT_LANCASTER_PARLIAMENTS_TRUCE)
		view.actions.pass = 1
	},
	card(c) {
		play_held_event(c)

		// Cancel approach!
		for (let lord of game.group)
			set_lord_locale(lord, game.march.from)

		set_active_enemy()
		end_march()
	},
	pass() {
		set_active_enemy()
		end_parliaments_truce()
	},
}

function end_parliaments_truce() {

	// Note: we flag the lords moved and levy burgundians after king's parley and parliament's truce have resolved
	for (let lord of game.group) {
		set_lord_moved(lord, 1)
		levy_burgundians(lord)
	}

	goto_blocked_ford()
}

// === MARCH EVENT: BLOCKED FORD ===

function goto_blocked_ford() {
	let here = get_lord_locale(game.command)

	// The marching lord can now play blocked ford to prevent enemy going into exile.
	if (
		has_enemy_lord(here) && (
			(game.active === YORK && could_play_card(EVENT_YORK_BLOCKED_FORD)) ||
			(game.active === LANCASTER && could_play_card(EVENT_LANCASTER_BLOCKED_FORD))
		)
	) {
		game.state = "blocked_ford"
		return
	}

	goto_choose_exile()
}

states.blocked_ford = {
	inactive: "Blocked Ford?",
	prompt() {
		view.prompt = "You may play Blocked Ford."

		if (game.active === YORK)
			gen_action_card_if_held(EVENT_YORK_BLOCKED_FORD)
		else
			gen_action_card_if_held(EVENT_LANCASTER_BLOCKED_FORD)

		view.actions.pass = 1
	},
	card(c) {
		play_held_event(c)
		game.where = get_lord_locale(game.command)
		goto_battle()
	},
	pass() {
		goto_choose_exile()
	},
}

// === 4.3.5 APPROACH - CHOOSE EXILE ===

function goto_choose_exile() {
	let here = get_lord_locale(game.command)
	if (has_enemy_lord(here)) {
		spend_all_actions() // end command upon any approach
		game.where = here
		game.state = "choose_exile"
		set_active_enemy()
	} else {
		end_march()
	}
}

function end_choose_exile() {
	if (has_friendly_lord(get_lord_locale(game.command))) {
		// still some lords not exiled to fight.
		set_active_enemy()
		goto_battle()
	} else {
		// no one left, goto finish marching.
		set_active_enemy()
		end_march()
	}
}

states.choose_exile = {
	inactive: "Exiles",
	prompt() {
		view.prompt = "Select Lords to go into Exile."
		for_each_friendly_lord_in_locale(get_lord_locale(game.command), lord => {
			gen_action_lord(lord)
		})
		view.actions.done = 1
	},
	lord(lord) {
		push_undo()
		// TODO: give up assets as if spoils?
		exile_lord(lord)
	},
	done() {
		end_choose_exile()
	},
}

function exile_lord(lord) {
	if (lord_has_capability(lord, AOW_YORK_ENGLAND_IS_MY_HOME)) {
		disband_lord(lord, false)
		set_lord_calendar(lord, current_turn() + 1)
	} else {
		set_lord_in_exile(lord)
		disband_lord(lord, false)
	}
}

// === 4.3.5 APPROACH - SPOILS AFTER CHOOSING EXILE ===

// TODO: spoils after choosing exile

function has_any_spoils() {
	return game.spoils && game.spoils[PROV] + game.spoils[COIN] + game.spoils[CART] + game.spoils[SHIP] > 0
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
	add_lord_assets(game.who, type, 1)
	add_spoils(type, -1)
	if (!has_any_spoils())
		game.who = NOBODY
}

// === 4.4 BATTLE ===

function get_lord_array_position(lord) {
	for (let p = 0; p < 12; ++p)
		if (game.battle.array[p] === lord)
			return p
	return -1
}

function set_active_attacker() {
	set_active(game.battle.attacker)
}

function set_active_defender() {
	if (game.battle.attacker === P1)
		set_active(P2)
	else
		set_active(P1)
}

function ravine_check(lord,pos) {
	// TODO: if no lord in pos and no ravine? -- if (lord !== NOBODY)
	if (game.battle.array[pos] === lord)
		return true
	return false
}

function filled(pos) {
	if (game.battle.array[pos] !== NOBODY && !ravine_check(game.battle.ravine, pos)) {
		return true
	}
	return false
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

	if (is_leeward_battle_line_in_play(lord)) {
		// TODO: rounding?
		return hits/2
	}

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

	if (lord === game.battle.caltrops) {
		hits += 2
	}

	return hits
}

function count_lord_hits(lord) {
	return battle_steps[game.battle.step].hits(lord)
}

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


// Capabilities adding troops at start of the battle
function add_battle_capability_troops() {
	let here = get_lord_locale(game.command)

	for (let lord = first_york_lord; lord <= last_lancaster_lord; ++lord) {
		if (lord_has_capability(lord, AOW_YORK_MUSTERD_MY_SOLDIERS) && has_favoury_marker(here)) {
			add_lord_forces(lord, MEN_AT_ARMS, 2)
			add_lord_forces(lord, LONGBOWMEN, 1)
		}
		if (lord_has_capability(lord, AOW_LANCASTER_MUSTERD_MY_SOLDIERS) && has_favourl_marker(here)) {
			add_lord_forces(lord, MEN_AT_ARMS, 2)
			add_lord_forces(lord, LONGBOWMEN, 1)
		}
		if (lord_has_capability(lord, AOW_LANCASTER_WELSH_LORD) && is_wales(here)) {
			add_lord_forces(lord, LONGBOWMEN, 2)
		}
		if (lord_has_capability(lord, AOW_YORK_PEMBROKE) && is_wales(here)) {
			add_lord_forces(lord, LONGBOWMEN, 2)
		}
		if (lord_has_capability(lord, AOW_YORK_PERCYS_NORTH1) && is_north(here)) {
			add_lord_forces(lord, MILITIA, 4)
		}
		if (lord_has_capability(lord, AOW_YORK_PERCYS_NORTH2) && can_supply_at(LOC_CARLISLE, 0)) {
			add_lord_forces(lord, MILITIA, 4)
		}
		if (lord_has_capability(lord, AOW_YORK_KINGDOM_UNITED) && (is_north(here) || is_south(here) || is_wales(here))) {
			add_lord_forces(lord, MILITIA, 3)
		}

		// TODO: check this condition
		if (
			is_lord_on_map(lord) &&
			!is_lord_on_calendar(lord) &&
			lord_has_capability(lord, AOW_LANCASTER_PHILIBERT_DE_CHANDEE) &&
			((is_friendly_locale(here) && data.port_2.includes(here)) || is_adjacent_friendly_port_english_channel(here))
		) {
			add_lord_forces(lord, MEN_AT_ARMS, 2)
		}
	}
}

//... And removing them at the end of the battle
function remove_battle_capability_troops() {
	let here = get_lord_locale(game.command)

	for (let lord = first_york_lord; lord <= last_lancaster_lord; ++lord) {
		if (lord_has_capability(lord, AOW_YORK_MUSTERD_MY_SOLDIERS) && has_favoury_marker(here)) {
			add_lord_forces(lord, MEN_AT_ARMS, -2)
			add_lord_forces(lord, LONGBOWMEN, -1)
		}
		if (lord_has_capability(lord, AOW_LANCASTER_MUSTERD_MY_SOLDIERS) && has_favourl_marker(here)) {
			add_lord_forces(lord, MEN_AT_ARMS, -2)
			add_lord_forces(lord, LONGBOWMEN, -1)
		}
		if (lord_has_capability(lord, AOW_LANCASTER_WELSH_LORD) && is_wales(here)) {
			add_lord_forces(lord, LONGBOWMEN, -2)
		}
		if (lord_has_capability(lord, AOW_YORK_PEMBROKE) && is_wales(here)) {
			add_lord_forces(lord, LONGBOWMEN, -2)
		}
		if (lord_has_capability(lord, AOW_YORK_PERCYS_NORTH1) && is_north(here)) {
			add_lord_forces(lord, MILITIA, -4)
		}
		if (lord_has_capability(lord, AOW_YORK_PERCYS_NORTH2) && can_supply_at(LOC_CARLISLE, 0)) {
			add_lord_forces(lord, MILITIA, -4)
		}
		if (lord_has_capability(lord, AOW_YORK_KINGDOM_UNITED) && (is_north(here) || is_south(here) || is_wales(here))) {
			add_lord_forces(lord, MILITIA, -3)
		}

		// TODO: check this condition
		if (is_lord_on_map(lord) && lord_has_capability(lord, AOW_LANCASTER_PHILIBERT_DE_CHANDEE)) {
			add_lord_forces(lord, MEN_AT_ARMS, -2)
		}
	}
}

function goto_battle() {
	let here = get_lord_locale(game.command)

	log_h3(`Battle at %${here}`)

	game.battle = {
		where: game.where,
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
		routed_vassals: [],
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

	// Troops by capability

	add_battle_capability_troops()

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

// === 4.4.1 BATTLE ARRAY ===

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

// === 4.4.1 BATTLE ARRAY: EVENTS ===

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

function goto_attacker_events() {
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

function resume_battle_events() {
	game.what = -1
	if (is_attacker())
		goto_attacker_events()
	else
		goto_defender_events()
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

function can_play_battle_events() {
	if (game.active === LANCASTER) {
		if (could_play_card(EVENT_LANCASTER_LEEWARD_BATTLE_LINE))
			return true
		if (could_play_card(EVENT_LANCASTER_SUSPICION))
			return true
		if (could_play_card(EVENT_LANCASTER_FOR_TRUST_NOT_HIM))
			return true
		if (could_play_card(EVENT_LANCASTER_RAVINE))
			return true
	}
	if (game.active === YORK) {
		if (could_play_card(EVENT_YORK_LEEWARD_BATTLE_LINE))
			return true
		if (could_play_card(EVENT_YORK_SUSPICION))
			return true
		if (could_play_card(EVENT_YORK_CALTROPS))
			return true
		if (could_play_card(EVENT_YORK_REGROUP))
			return true
		if (could_play_card(EVENT_YORK_SWIFT_MANEUVER))
			return true
		if (could_play_card(EVENT_YORK_PATRICK_DE_LA_MOTE))
			return true
	}
	return false
}

function prompt_battle_events() {
	// both attacker and defender events
	if (game.active === LANCASTER) {
		gen_action_card_if_held(EVENT_LANCASTER_LEEWARD_BATTLE_LINE)
		if (can_play_suspicion())
			gen_action_card_if_held(EVENT_LANCASTER_SUSPICION)
		if (can_play_for_trust_not_him())
			gen_action_card_if_held(EVENT_LANCASTER_FOR_TRUST_NOT_HIM)
		gen_action_card_if_held(EVENT_LANCASTER_RAVINE)
	}
	if (game.active === YORK) {
		gen_action_card_if_held(EVENT_YORK_LEEWARD_BATTLE_LINE)
		if (can_play_suspicion())
			gen_action_card_if_held(EVENT_YORK_SUSPICION)
		gen_action_card_if_held(EVENT_YORK_CALTROPS)
		gen_action_card_if_held(EVENT_YORK_REGROUP)
		gen_action_card_if_held(EVENT_YORK_SWIFT_MANEUVER)
		gen_action_card_if_held(EVENT_YORK_PATRICK_DE_LA_MOTE)
	}
	view.actions.done = 1
}

function action_battle_events(c) {
	game.what = c
	set_delete(current_hand(), c)
	set_add(game.events, c)
	switch (c) {
		case EVENT_LANCASTER_LEEWARD_BATTLE_LINE:
			// nothing to do
			break
		case EVENT_LANCASTER_SUSPICION:
			game.state = "suspicion"
			break
		case EVENT_LANCASTER_FOR_TRUST_NOT_HIM:
			game.state = "for_trust_not_him"
			break
		case EVENT_LANCASTER_RAVINE:
			game.state = "ravine"
			break
		case EVENT_YORK_LEEWARD_BATTLE_LINE:
			// nothing to do
			break
		case EVENT_YORK_SUSPICION:
			game.state = "suspicion"
			break
		case EVENT_YORK_CALTROPS:
			game.state = "caltrops"
			break
		case EVENT_YORK_REGROUP:
			// nothing to do
			break
		case EVENT_YORK_SWIFT_MANEUVER:
			// nothing to do
			break
	}
}

// === BATTLE EVENT: RAVINE ===

states.ravine = {
	inactive: "Ravine",
	prompt() {
		view.prompt = "Ravine: Select an enemy lord to ignore that Lord round 1"
		for (let lord of game.battle.array) {
			if (is_enemy_lord(lord)) {
				gen_action_lord(lord)
			}
		}
		for (let lord of game.battle.reserves) {
			if (is_enemy_lord(lord)) {
				gen_action_lord(lord)
			}
		}
	},
	lord(lord) {
		push_undo()
		game.battle.ravine = lord
		resume_battle_events()
		logi(`${data.lords[lord].name} ignored for Engage and Strike Round 1`)
		logevent(EVENT_LANCASTER_RAVINE)
	},
}

// === BATTLE EVENT: REGROUP ===

function is_regroup_in_play() {
	if (game.active === YORK)
		return is_event_in_play(EVENT_YORK_REGROUP)
	return false
}

// TODO

// === BATTLE EVENT: CALTROPS ===

function is_caltrops_in_play() {
	if (game.active === YORK)
		return is_event_in_play(EVENT_YORK_CALTROPS)
}

states.caltrops = {
	inactive: "Caltrops",
	prompt() {
		view.prompt = "Caltrops: Select a friendly lord to Add +2 Hits each Melee phase to his engagement"
		for (let lord of game.battle.array) {
			if (is_friendly_lord(lord)) {
				gen_action_lord(lord)
			}
		}
	},
	lord(lord) {
		push_undo()
		game.battle.caltrops = lord
		resume_battle_events()
		logi(`2 Hits added to ${data.lords[lord].name} each Melee round`)
		logevent(EVENT_YORK_CALTROPS)
	},
}

// === BATTLE EVENT: SUSPICION ===

function can_play_suspicion() {
	// TODO: account for influence_capabilities
	if (highest_friendly_influence() >= lowest_enemy_influence()) {
		return true
	}
	return false
}

function lowest_enemy_influence() {
	let score = 10
	for (let lord = first_enemy_lord; lord <= last_enemy_lord; ++lord) {
		if (get_lord_locale(lord) === get_lord_locale(game.command)) {
			if (data.lords[lord].influence < score) {
				score = data.lords[lord].influence
			}
		}
	}
	return score
}

function highest_friendly_influence() {
	let score = 0
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
		if (get_lord_locale(lord) === get_lord_locale(game.command)) {
			if (data.lords[lord].influence > score) {
				score = data.lords[lord].influence
			}
		}
	}
}

states.suspicion = {
	inactive: "Suspicion",
	prompt() {
		view.prompt = "Suspicion: Check one of your lords to influence check"
		for (let lord of game.battle.array) {
			if (is_friendly_lord(lord)) {
				gen_action_lord(lord)
			}
		}
		for (let lord of game.battle.reserves) {
			if (is_friendly_lord(lord)) {
				gen_action_lord(lord)
			}
		}
	},
	lord(lord) {
		game.who = lord
		push_undo()
		push_state("suspicion_enemy_lord")
	},
}

states.suspicion_enemy_lord = {
	inactive: "Suspicion",
	prompt() {
		view.prompt = "Suspicion: Select one enemy lord to influence check"
		for (let lord of game.battle.array) {
			if (is_enemy_lord(lord)) {
				if (suspicion_lord_score(game.who, data.lords[game.who].influence) > data.lords[lord].influence) {
					gen_action_lord(lord)
				}
			}
		}
	},
	lord(lord) {
		push_undo()
		push_state("influence_check_suspicion")
		init_influence_check(game.who)
		game.who = lord
	},
}

function suspicion_lord_score(lord, score) {
	influence_capabilities(lord, score)
	return score
}

states.influence_check_suspicion = {
	inactive: `Influence check`,
	prompt() {
		view.prompt = `Influence check : Success disbands enemy lord `
		prompt_influence_check()
	},
	spend1: add_influence_check_modifier_1,
	spend3: add_influence_check_modifier_2,
	check() {
		let lord = game.who
		let results = do_influence_check()
		logi(`Attempt to disband ${data.lords[lord].name} ${results.success ? "Successful" : "Failed"}: (${range(results.rating)}) ${results.success ? HIT[results.roll] : MISS[results.roll]}`)
		if (results.success) {
			log(`${data.lords[lord].name} disbanded`)
			for (let x = 0; x < 6; x++) {
				if (game.battle.array[x] === lord) {
					game.battle.array[x] = NOBODY
					break
				}
				else if (set_has(game.battle.reserves, lord)) {
					array_remove(game.battle.reserves, lord)
				}
			}
			disband_lord(lord)
			game.who = NOBODY
			end_influence_check()
			resume_battle_events()
		} else {
			log(`${data.lords[lord].name} stays`)
			game.who = NOBODY
			end_influence_check()
			resume_battle_events()
		}
	},
}

// === BATTLE EVENT: FOR TRUST NOT HIM ===

function can_play_for_trust_not_him() {
	for (let vassal = first_vassal; vassal <= last_vassal; vassal++) {
		if (is_vassal_mustered_with_york_lord(vassal) && get_lord_locale(get_vassal_lord(vassal)) === get_lord_locale(game.command)) {
			// Hastings & Salisbury with Alice Montagu capability are immune.
			if ((get_vassal_lord(vassal) !== LORD_SALISBURY || !lord_has_capability(LORD_SALISBURY, AOW_YORK_ALICE_MONTAGU)) && vassal !== VASSAL_HASTINGS) {
				return true
			}
		}
	}
	return false
}

states.for_trust_not_him = {
	inactive: "For trust not him \u2014 Select Lord",
	prompt() {
		let done = true
		game.where = NOWHERE
		view.prompt = "Select a friendly lord"
		for (let lord = first_lancaster_lord; lord <= last_lancaster_lord; lord++) {
			if (is_lancaster_lord(lord) && get_lord_locale(lord) === game.battle.where) {
				done = false
				gen_action_lord(lord)
			}
		}
		if (done) {
			view.actions.done = 1
		}
	},
	lord(lord) {
		push_undo()
		game.who = lord
		push_state("for_trust_not_him_vassal")
	},
}

states.for_trust_not_him_vassal = {
	inactive: "For trust not him \u2014 Select Vassal",
	prompt() {
		view.prompt = "Select an enemy Vassal"
		for (let vassal = first_vassal; vassal <= last_vassal; vassal++) {
			if (is_vassal_mustered_with_york_lord(vassal) && get_lord_locale(get_vassal_lord(vassal)) === get_lord_locale(game.command)) {
				// Hastings & Salisbury with Alice Montagu capability are immune.
				if ((get_vassal_lord(vassal) !== LORD_SALISBURY || !lord_has_capability(LORD_SALISBURY, AOW_YORK_ALICE_MONTAGU)) && vassal !== VASSAL_HASTINGS) {
					gen_action_vassal(vassal)
				}
			}
		}
	},
	vassal(v) {
		push_undo()
		game.which = v
		goto_influence_check_for_trust_not_him()
	},
}

function goto_influence_check_for_trust_not_him() {
	init_influence_check(game.who)
	game.check.push({
		cost: 0,
		modifier: data.vassals[game.which].influence * (game.active === LANCASTER ? -1 : 1),
		source: "vassal",
	})
	push_state("for_trust_not_him_bribe")
}

states.for_trust_not_him_bribe = {
	inactive: `Influence check`,
	prompt() {
		view.prompt = `Influence check : Success bribes ${data.vassals[game.which].name} `
		prompt_influence_check()
	},
	spend1: add_influence_check_modifier_1,
	spend3: add_influence_check_modifier_2,
	check() {
		let results = do_influence_check()
		if (game.who === LORD_HENRY_TUDOR && lord_has_capability(LORD_HENRY_TUDOR, AOW_LANCASTER_TWO_ROSES)) {
			logi(`Automatic success C${AOW_LANCASTER_TWO_ROSES}`)
		}
		else {
			logi(`Attempt to bribe ${data.vassals[game.which].name} ${results.success ? "Successful" : "Failed"}: (${range(results.rating)}) ${results.success ? HIT[results.roll] : MISS[results.roll]}`)
		}
		if (results.success) {
			muster_vassal(game.which, game.who)
			end_influence_check()
			end_for_trust_not_him()
		} else {
			end_influence_check()
			end_for_trust_not_him()
		}
	},
}

function end_for_trust_not_him() {
	game.who = NOBODY
	game.which = NOTHING
	resume_battle_events()
}

// === BATTLE EVENT: LEEWARD BATTLE LINE ===

function is_leeward_battle_line_in_play(lord) {
	if (is_archery_step()) {
		if (is_event_in_play(EVENT_LANCASTER_LEEWARD_BATTLE_LINE)
		&& !is_event_in_play(EVENT_YORK_LEEWARD_BATTLE_LINE)
		&& is_york_lord(lord)) {
			logevent(EVENT_LANCASTER_LEEWARD_BATTLE_LINE)
			return true
		}
		if (is_event_in_play(EVENT_YORK_LEEWARD_BATTLE_LINE)
		&& !is_event_in_play(EVENT_LANCASTER_LEEWARD_BATTLE_LINE)
		&& is_lancaster_lord(lord)) {
			logevent(EVENT_YORK_LEEWARD_BATTLE_LINE)
			return true
		}
	}
	return false
}

// === BATTLE EVENT: CULVERINS AND FALCONETS ===

function goto_culverins() {
	let can_play = false
	for (let lord of game.battle.array) {
		if (is_lancaster_lord(lord) && lord_has_capability(lord, AOW_LANCASTER_CULVERINS_AND_FALCONETS))
			can_play = true
		if (is_york_lord(lord) && lord_has_capability(lord, AOW_YORK_CULVERINS_AND_FALCONETS))
			can_play = true
	}
	if (can_play) {
		set_active_defender()
		game.state = "culverins_and_falconets"
		game.who = NOBODY
	}
	else {
		goto_engagement_total_hits()
	}
}

function artillery_hits(ahits) {
	if (is_attacker()) {
		game.battle.attacker_artillery = ahits*2
	}
	if (is_defender()) {
		game.battle.defender_artillery = ahits*2
	}
}

states.culverins_and_falconets = {
	inactive: "Culverins and Falconets",
	prompt() {
		let done = true
		view.prompt = `Use Culverin and Falconets ?`
		for (let lord of game.battle.array) {
			if (lord !== NOBODY) {
				if (is_friendly_lord(lord) && (lord_has_capability(lord, AOW_YORK_CULVERINS_AND_FALCONETS))) {
					gen_action_card(AOW_YORK_CULVERINS_AND_FALCONETS)
					done = false
				}
				if (is_friendly_lord(lord) && (lord_has_capability(lord, AOW_LANCASTER_CULVERINS_AND_FALCONETS))) {
					gen_action_card(AOW_LANCASTER_CULVERINS_AND_FALCONETS)
					done = false
				}
			}
		}
		if (done) {
			view.prompt = "Culverins and Falconets : Done"
		}
		view.actions.done = 1
	},
	card(c) {
		let die = roll_die()
		let lord = find_lord_with_capability_card(c)
		if (is_event_in_play(EVENT_YORK_PATRICK_DE_LA_MOTE) && game.active === YORK) {
			let die2 = roll_die()
			die += die2
		}
		logi(`${data.lords[lord].name} Artillery does ${die} hits`)
		artillery_hits(die)
		discard_lord_capability(lord, c)
	},
	done() {
		if (is_defender()) {
			set_active_enemy()
		}
		else {
			goto_engagement_total_hits()
		}
	}
}

// === BATTLE EVENT: SWIFT MANEUVER ===

function is_swift_maneuver_in_play() {
	return is_event_in_play(EVENT_YORK_SWIFT_MANEUVER)
}

states.swift_maneuver = {
	inactive: "Swift Maneuver",
	prompt() {
		view.prompt = "Swift Maneuver: You may end the round now"
		view.actions.end_battle_round = 1
		view.actions.pass = 1
	},
	end_battle_round() {
		logevent(`${EVENT_YORK_SWIFT_MANEUVER}`)
		log("Ended Action Round.")
		set_active_enemy()
		goto_end_battle_round()
	},
	pass() {
		logevent(`${EVENT_YORK_SWIFT_MANEUVER}`)
		log("Passed.")
		set_active_enemy()
		pop_state()
	},
}

// === 4.4.2 BATTLE ROUNDS ===

function goto_battle_rounds() {
	set_active_defender()
	log_h4(`Battle Round ${game.battle.round}`)
	goto_flee()
}

// === 4.4.2 BATTLE ROUNDS: FLEE ===

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
		for (let p = 0; p < 6; ++p) {
			if (is_friendly_lord(game.battle.array[p])) {
				gen_action_lord(game.battle.array[p])
			}
		}
		view.actions.done = 1
	},
	done() {
		end_flee()
	},
	lord(lord) {
		push_undo()
		log(`${lord_name[lord]} Fled the battle of %${game.battle.where}.`)
		set_add(game.battle.fled, lord)
		if (set_has(game.battle.reserves, lord)) {
			array_remove(game.battle.reserves, lord)
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

// === 4.4.2 BATTLE ROUNDS: REPOSITION ===

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


// === 4.4.2 BATTLE ROUNDS: ENGAGE / STRIKE ===

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
			set_add(center, e[0])
		} else if (filled(e[1])) {
			set_add(center, e[1])
		}
	}
	results.unshift(center)
	return results
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

	for (let pos of battle_strike_positions) {
		let lord = game.battle.array[pos]
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
		for (let pos of battle_strike_positions) {
			if (has_strike(pos)) {
				let lord = game.battle.array[pos]
				if (is_friendly_lord(lord))
					gen_action_lord(lord)
			}
		}
	},
	lord(lord) {
		let idx = find_engagement_index(get_lord_array_position(lord))
		let eng = game.battle.engagements[idx]
		array_remove(game.battle.engagements, idx)
		game.battle.engagements.unshift(eng)
		set_active_defender()
		if (game.battle.round === 1 && is_archery_step()) {
			goto_culverins()
		}
		else {
			goto_engagement_total_hits()
		}
	},
}

function resume_engagement() {
	if (game.battle.engagements.length === 1 || is_melee_step()) {
		if (game.battle.round === 1 && is_archery_step()) {
			goto_culverins()
		}
		else {
			goto_engagement_total_hits()
		}
		// only one engagement, so no choices on order
	} else {
		set_active_attacker()
		game.state = "select_engagement"
	}
}

// === 4.4.2 BATTLE ROUNDS: TOTAL HITS (ROUND UP) ===

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

function goto_engagement_total_hits() {
	let ahits = 0
	let dhits = 0

	for (let pos of game.battle.engagements[0]) {
		if (pos === A1 || pos === A2 || pos === A3) {
			ahits += game.battle.ah[pos]
			if (game.battle.attacker_artillery > 0) {
				ahits += game.battle.attacker_artillery
			}
		}
		else {
			dhits += game.battle.ah[pos]
			if (game.battle.defender_artillery > 0) {
				dhits += game.battle.defender_artillery
			}
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
	for (let pos of battle_strike_positions) {
		let lord = game.battle.array[pos]
		if (lord !== NOBODY)
			if (will_lord_rout(lord))
				rout_lord(lord)
	}

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

// === 4.4.2 BATTLE ROUNDS: APPLY HITS / PROTECTION / ROLL BY HIT / ROUT ===

function goto_defender_assign_hits() {
	set_active_defender()
	if (game.battle.ahits === 0)
		return end_defender_assign_hits()

	if (no_remaining_targets())
		return end_defender_assign_hits()

	goto_assign_hits()
}

function goto_assign_hits() {
	game.state = "assign_hits"
	if (game.battle.target === NOBODY) {
		let targets = []
		for (let pos of game.battle.engagements[0]) {
			let lord = game.battle.array[pos]
			if (is_friendly_lord(lord)) {
				targets.push(pos)
			}
		}
		game.battle.target = targets
	}
}

function end_defender_assign_hits() {
	log_hits(game.battle.dhits, "Hit")
	game.battle.target = NOBODY
	goto_attacker_assign_hits()
}

function no_remaining_targets() {
	for (let pos of game.battle.engagements[0]) {
		let lord = game.battle.array[pos]
		if (is_friendly_lord(lord))
			if (lord_has_unrouted_units(lord))
				return false
	}
	return true
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
	for (let target of game.battle.target) {
		fn(game.battle.array[target])
	}
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
			if (!set_has(game.battle.routed_vassals, v))
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
		if ((lord === LORD_MARGARET) && (lord_has_capability(lord, AOW_LANCASTER_YEOMEN_OF_THE_CROWN)) && get_lord_forces(lord, MEN_AT_ARMS) > 0)
			action_assign_hits(lord, MEN_AT_ARMS)
		else
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
		let lord = get_vassal_lord(vassal)
		action_assign_hits(lord, VASSAL, vassal)
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
	if (game.what === MEN_AT_ARMS || game.what === MILITIA) {
		if (lord_has_capability(game.who, AOW_LANCASTER_PIQUIERS) &&
		(get_lord_routed_forces(game.who, MILITIA) + get_lord_routed_forces(game.who, MEN_AT_ARMS) < 3)) {
			protection = 4
		}
	}

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
		if (lord_has_capability(game.who, AOW_YORK_BARRICADES) && has_favoury_marker(game.battle.where))
			protection += 1
	}
	if (game.what === MEN_AT_ARMS) {
		if (lord_has_capability(game.who, AOW_LANCASTER_CHEVALIERS) && is_archery_step()) {
			protection -= 1
		}
	}
	if (game.what === MILITIA || game.what === LONGBOWMEN) {
		if (lord_has_capability(game.who, AOW_YORK_BARRICADES) && has_favoury_marker(game.battle.where))
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
			// Swift Maneuver event
			if (is_swift_maneuver_in_play() && type === RETINUE) {
				set_active_enemy()
				push_state("swift_maneuver")
				// TODO: add return here?
			}
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
		if (assign_hit_roll(get_force_name(game.who, game.what, game.where), protection, "")) {
			rout_unit(game.who, game.what, game.where)
			finish_action_assign_hits(game.who)
		} else {
			finish_action_assign_hits(game.who)
		}
	},
}

// === 4.4.2 BATTLE ROUNDS: NEW ROUND ===

function goto_end_battle_round() {
	end_battle_round()
}

function end_battle_round() {
	game.battle.ravine = NOBODY
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

	// TODO: goto_battle_rounds() instead?
	set_active_defender()
	goto_flee()
}

// === 4.4.3 ENDING THE BATTLE ===

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
	if (game.battle.loser === YORK)
		set_active(LANCASTER)
	else
		set_active(YORK)
}

function end_battle() {
	if (game.battle.loser === BOTH)
		log_h4(`Both Sides Lost`)
	else
		log_h4(`${game.battle.loser} Lost`)

	game.battle.array = 0
	game.battle.caltrops = -1
	goto_battle_influence()
}

function has_defeated_lords() {
	for (let lord of game.battle.fled)
		if (is_friendly_lord(lord))
			return true
	for (let lord of game.battle.routed)
		if (is_friendly_lord(lord))
			return true
	return false
}

// === 4.4.3 ENDING THE BATTLE: INFLUENCE ===

function goto_battle_influence() {
	if (game.battle.loser !== BOTH) {
		set_active_loser()

		let influence = 0
		for (let lord of game.battle.fled)
			if (is_friendly_lord(lord))
				influence += data.lords[lord].influence + count_vassals_with_lord(lord)
		for (let lord of game.battle.routed)
			if (is_friendly_lord(lord))
				influence += data.lords[lord].influence + count_vassals_with_lord(lord)

		reduce_influence(influence)
		goto_battle_spoils()
	} else {
		goto_death_or_disband()
	}
}

// === 4.4.3 ENDING THE BATTLE: LOSSES ===

function has_battle_losses() {
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord)
		if (lord_has_routed_troops(lord))
			return true
	return false
}

function goto_battle_losses_victor() {
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
		let done = true
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
				done = false
			}
		}
		if (done) {
			view.actions.done = 1
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
	done() {
		goto_death_or_disband()
	},
}

// === 4.4.3 ENDING THE BATTLE: SPOILS ===

function log_spoils() {
	if (game.spoils[PROV] > 0)
		logi(game.spoils[PROV] + " Provender")
	if (game.spoils[CART] > 0)
		logi(game.spoils[CART] + " Cart")
}

function calculate_spoils() {
	let n_prov = 0
	let n_cart = 0

	if (has_favour_in_locale(game.battle.loser, game.battle.where))
		return

	for (let lord of game.battle.fled) {
		if (is_enemy_lord(lord)) {
			n_prov += get_lord_assets(lord, PROV)
			n_cart += get_lord_assets(lord, CART)
		}
	}

	for (let lord of game.battle.routed) {
		if (is_enemy_lord(lord)) {
			n_prov += get_lord_assets(lord, PROV)
			n_cart += get_lord_assets(lord, CART)
		}
	}

	if (is_neutral_locale(game.battle.where)) {
		n_prov = Math.ceil(n_prov / 2)
		n_cart = Math.ceil(n_cart / 2)
	}

	add_spoils(PROV, n_prov)
	add_spoils(CART, n_cart)
}

function find_lone_victor() {
	let found = NOBODY
	for (let pos of battle_strike_positions) {
		let lord = game.battle.array[pos]
		if (is_friendly_lord(lord)) {
			if (found !== NOBODY)
				return NOBODY
			found = lord
		}
	}
	return found
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

	take_prov() {
		push_undo_without_who()
		take_spoils(PROV)
	},

	take_cart() {
		push_undo_without_who()
		take_spoils(CART)
	},

	end_spoils() {
		end_battle_spoils()
	},
}

// === 4.4.3 ENDING THE BATTLE: DEATH CHECK AND DISBAND ===

function goto_death_or_disband() {
	remove_battle_capability_troops()
	if (has_defeated_lords()) {
		if (game.battle.loser === LANCASTER && lord_has_capability(LORD_RICHARD_III, AOW_YORK_BLOODY_THOU_ART) && get_lord_locale(LORD_RICHARD_III) === game.battle.where) {
			game.flags.bloody = 1
		}
		game.state = "death_or_disband"
	}
	else
		end_death_or_disband()
}

function end_death_or_disband() {
	set_active_enemy()
	if (has_defeated_lords()) {
		goto_death_or_disband()
	} else {
		goto_battle_aftermath()
	}
}

function prompt_held_event_death_check() {
	// both attacker and defender events
	if (game.active === LANCASTER) {
		if (can_play_escape_ship())
			gen_action_card_if_held(EVENT_LANCASTER_ESCAPE_SHIP)
		if (can_play_warden_of_the_marches())
			gen_action_card_if_held(EVENT_LANCASTER_WARDEN_OF_THE_MARCHES)
		if (can_play_talbot_to_the_rescue())
			gen_action_card_if_held(EVENT_LANCASTER_TALBOT_TO_THE_RESCUE)
	}
	if (game.active === YORK) {
		if (can_play_escape_ship())
			gen_action_card_if_held(EVENT_YORK_ESCAPE_SHIP)
	}
}

states.death_or_disband = {
	inactive: "Death or Disband",
	prompt() {
		view.prompt = `Death or Disband: Select lords to roll for Death or Disband.`

		prompt_held_event_death_check()

		let done = true
		for (let lord of game.battle.fled) {
			if (is_friendly_lord(lord)) {
				gen_action_lord(lord)
				done = false
			}
		}
		for (let lord of game.battle.routed) {
			if (is_friendly_lord(lord)) {
				gen_action_lord(lord)
				done = false
			}
		}
		if (game.flags.warden_of_the_marches && game.active === LANCASTER) {
			done = true
		}
		if (done) {
			view.actions.done = 1
		}
	},
	lord(lord) {
		let threshold = 2
		let modifier = 0

		// CAPABILITY: BLOODY THOU ART, BLOODY WILL BE THE END
		if (is_lancaster_lord(lord) && game.flags.bloody === 1) {
			logcap(AOW_YORK_BLOODY_THOU_ART)
			disband_lord(lord, true)
			set_delete(game.battle.fled, lord)
			set_delete(game.battle.routed, lord)
		}
		else {
			let roll = roll_die()
			if (set_has(game.battle.fled, lord))
				modifier = -2

			let success = threshold >= roll + modifier
			log(`Lord ${lord_name[lord]} ${success ? "Survived" : "Died"}: (${range(2)}) ${success ? HIT[roll] : MISS[roll]} ${modifier < 0 ? "(-2 Fled)" : ""}`)
			disband_lord(lord, !success)
			set_delete(game.battle.fled, lord)
			set_delete(game.battle.routed, lord)
		}
	},
	done() {
		end_death_or_disband()
	},
	card: action_held_event,
}

// === DEATH CHECK EVENT: ESCAPE SHIP ===

function can_play_escape_ship() {
	return can_escape_at(game.battle.where)
}

function can_escape_at(here) {
	if (game.active === YORK && has_favoury_marker(here) && is_seaport(here))
		return true
	if (game.active === LANCASTER && has_favourl_marker(here) && is_seaport(here))
		return true
	if (search_escape_route(here))
		return true
	return false
}

function search_escape_route(start) {
	search_seen.fill(0)
	search_seen[start] = 1
	let queue = [start]

	while (queue.length > 0) {
		let here = queue.shift()

		// Check if the current locale is a seaport
		if (is_seaport(here)) {
			return true
		}

		if (is_friendly_locale(here)) {
			for (let next of data.locales[here].adjacent) {
				if (!search_seen[next]) {
					search_seen[next] = 1
					queue.push(next)
				}
			}
		}
	}
	return false
}

function goto_play_escape_ship() {
	push_state("escape_ship")
	game.who = NOBODY
}

states.escape_ship = {
	inactive: `Escape ship`,
	prompt() {
		view.prompt = "Escape Ship: Your lords go to Exile."
		view.actions.escape_ship = 1
	},
	escape_ship() {
		push_undo()
		for (let lord of game.battle.fled) {
			log(`${lord_name[lord]} went to exile.`)
			exile_lord(lord)
			set_delete(game.battle.fled, lord)
		}
		for (let lord of game.battle.routed) {
			log(`${lord_name[lord]} went to exile.`)
			exile_lord(lord)
			set_delete(game.battle.routed, lord)
		}
		goto_battle_aftermath()
	},
}

// === DEATH CHECK EVENT: TALBOT TO THE RESCUE ===

function can_play_talbot_to_the_rescue() {
	return true
}

function goto_play_talbot_to_the_rescue() {
	throw "TODO"
}

// === DEATH CHECK EVENT: WARDEN OF THE MARCHES ===

function can_play_warden_of_the_marches() {
	// TOOD : Maybe a bug with blocked ford/exile ?
	let can_play = false
	for (let loc = first_locale; loc <= last_locale; loc++) {
		if (is_friendly_locale(loc) && is_north(loc) && loc !== game.battle.where) {
			can_play = true
		}
	}
	if (!can_play) {
		return false
	}
	// if blocked ford then flee
	if (is_north(game.where))
		return true
	// if battle
	if (is_north(game.battle.where))
		return true
	return false
}

function goto_play_warden_of_the_marches() {
	push_undo()
	push_state("warden_of_the_marches")
}

states.warden_of_the_marches = {
	inactive: "Warden of the Marches",
	prompt() {
		let done = true
		view.prompt = "Warden of the Marches: Select a friendly locale in the North to move routed lords there"
		for (let loc = first_locale; loc <= last_locale; loc++) {
			if (is_friendly_locale(loc) && is_north(loc) && loc !== game.battle.where) {
				done = false
				gen_action_locale(loc)
			}
		}
		if (done) {
			view.actions.done = 1
		}
	},
	locale(loc) {
		push_undo()
		for (let lord = first_lancaster_lord; lord <= last_lancaster_lord; lord++) {
			if (get_lord_locale(lord) === game.battle.where) {
				set_lord_locale(lord, loc)
				if (!lord_has_unrouted_troops(lord)) {
					disband_lord(lord, false)
				}
				else {
					set_lord_forces(lord, RETINUE, 1)
				}
				for (let x = 0; x < FORCE_TYPE_COUNT; ++x) {
					set_lord_forces(lord, x, 0)
					if (get_lord_routed_forces(lord, x) > 0) {
						set_lord_routed_forces(lord, x, 0)
					}
				}
				for_each_vassal_with_lord(lord, v => {
					if (set_has(game.battle.routed_vassals, v)) {
						array_remove(game.battle.routed_vassals, v)
						disband_vassal(v)
					}
				})
			}
		}
		logi(`Moved to ${data.locales[loc].name}`)
		end_warden_of_the_marches()
	},
	done() {
		end_warden_of_the_marches()
	},
}

function end_warden_of_the_marches() {
	game.flags.warden_of_the_marches = 1
	game.who = NOBODY
	pop_state()
}

// === 4.4.4 ENDING THE BATTLE: AFTERMATH ===

function goto_battle_aftermath() {
	set_active(game.battle.attacker)
	game.where = NOWHERE

	// Routed Vassals get disbanded
	for (let lord = first_lord; lord <= last_lord; lord++) {
		if (is_lord_on_map(lord)) {
			for_each_vassal_with_lord(lord, v => {
				if (set_has(game.battle.routed_vassals, v)) {
					array_remove(game.battle.routed_vassals, v)
					disband_vassal(v)
				}
			})
		}
	}

	// Events
	discard_events("hold")

	// Recovery
	spend_all_actions()
	game.where = NOWHERE
	game.battle = 0
	game.flags.bloody = 0
	end_march()
}

// === 4.7 FEED ===

function can_feed_from_shared(lord) {
	let loc = get_lord_locale(lord)
	return get_shared_assets(loc, PROV) > 0
}

function can_pay_from_shared(lord) {
	let loc = get_lord_locale(lord)
	return get_shared_assets(loc, COIN) > 0
}

function has_friendly_lord_who_must_feed() {
	if (is_campaign_phase() && game.flags.supply_depot === 1 && game.active === LANCASTER) {
		game.flags.supply_depot = 0
		logi(`No feed ${EVENT_LANCASTER_REBEL_SUPPLY_DEPOT}`)
		return false
	}
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
	game.where = NOWHERE
	if (game.state !== "disembark")
		goto_remove_markers()
}

// === 4.7 FEED: REMOVE MARKERS ===

function goto_remove_markers() {
	clear_lords_moved()
	goto_command_activation()
}

// === 4.8 END CAMPAIGN ===

function goto_end_campaign() {
	log_h1("End Campaign")
	set_active(P1)
	goto_tides_of_war()
}

// === 4.8.1 END CAMPAIGN: TIDES OF WAR ===

function tides_calc() {
	log_h3(`Tides of War`)
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
	let prenl = 0
	let preny = 0
	let presl = 0
	let presy = 0
	let prewl = 0
	let prewy = 0
	let prel = 0
	let prey = 0

	// DOMINATION CALC

	for (let x of all_north_locales) {
		if (has_favourl_marker(x)) {
			domnl += 1
		}
		if (has_favoury_marker(x)) {
			domny += 1
		}
	}

	for (let x of all_south_locales) {
		if (has_favourl_marker(x)) {
			domsl += 1
		}
		if (has_favoury_marker(x)) {
			domsy += 1
		}
	}

	for (let x of all_wales_locales) {
		if (has_favourl_marker(x)) {
			domwl += 1
		}
		if (has_favoury_marker(x)) {
			domwy += 1
		}
	}

	// SPECIAL LOCALES

	if (has_favourl_marker(LOC_LONDON)) {
		log(`London control 2 Influence for Lancaster`)
		doml += 2
	}
	if (has_favoury_marker(LOC_LONDON)) {
		log(`London control 2 Influence for York`)
		domy += 2
	}

	if (has_favourl_marker(LOC_CALAIS)) {
		log(`Calais control 2 Influence for Lancastrians`)
		doml += 2
	}
	if (has_favoury_marker(LOC_CALAIS)) {
		log(`Calais control 2 Influence for York`)
		domy += 2
	}

	if (has_favourl_marker(LOC_HARLECH)) {
		log(`Harlech control 1 Influence for Lancaster`)
		doml += 1
	}
	if (has_favoury_marker(LOC_HARLECH)) {
		log(`Harlech control 1 Influence for York`)
		domy += 1
	}

	for (let x of all_city_locales) {
		if (has_favourl_marker(x)) {
			cities -= 1
		}
		if (has_favoury_marker(x)) {
			cities += 1
		}
	}

	for (let x of all_town_locales) {
		if (has_favourl_marker(x)) {
			town -= 1
		}
		if (has_favoury_marker(x)) {
			town += 1
		}
	}

	for (let x of all_fortress_locales) {
		if (has_favourl_marker(x)) {
			fortress -= 1
		}
		if (has_favoury_marker(x)) {
			fortress += 1
		}
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
		log(`Wales Domination 2 Influence for Lancaster`)
		doml += 2
	}

	if (domwy === 5) {
		log(`Wales Domination 2 Influence for York`)
		domy += 2
	} else if (
		domwy >= 3 &&
		(lord_has_capability(LORD_MARCH, AOW_YORK_WELSHMEN) || lord_has_capability(LORD_YORK, AOW_YORK_WELSHMEN))
	) {
		log(`Wales Domination 2 Influence for York`)
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
		domy += 1
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
		doml += 1
	}

	// LORD PRESENCE
	for (let lord = first_lancaster_lord; lord <= last_lancaster_lord; ++lord) {
		if (is_lord_on_map(lord)) {
			if (is_lord_in_north(lord)) {
				prenl = 1
			}
			if (is_lord_in_south(lord)) {
				presl = 1
			}
			if (is_lord_in_wales(lord)) {
				prewl = 1
			}
		}
	}
	for (let lord = first_york_lord; lord <= last_york_lord; ++lord) {
		if (is_lord_on_map(lord)) {
			if (is_lord_in_north(lord)) {
				preny = 1
			}
			if (is_lord_in_south(lord)) {
				presy = 1
			}
			if (is_lord_in_wales(lord)) {
				prewy = 1
			}
		}
	}
	prel = prenl + presl + prewl
	prey = preny + presy + prewy

	log("Presence in Areas : " + prel + " for Lancaster")
	log("Presence in Areas : " + prey + " for Yorkists")

	domy += preny + presy + prewy
	doml += prenl + presl + prewl

	// CAPS EFFECT

	if (
		lord_has_capability(LORD_HENRY_VI, AOW_LANCASTER_MARGARET) &&
		get_lord_locale(LORD_HENRY_VI) !== LOC_LONDON &&
		is_lord_on_map(LORD_HENRY_VI)
	) {
		log(`Capability: Margaret 2 Influence for Lancaster`)
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
		log(`Capability: First Son 1 Influence for York`)
		domy += 1
	}

	if (set_has(INFLUENCE_TURNS, current_turn())) {
		for (let y = first_york_lord; y <= last_york_lord; y++) {
			if (is_lord_on_map(y)) {
				domy += data.lords[y].influence
				log(`Gain Lords Influence : Yorkists gain ${data.lords[y].influence} for ${data.lords[y].name}`)
			}
		}

		for (let l = first_lancaster_lord; l <= last_lancaster_lord; l++) {
			if (is_lord_on_map(l)) {
				doml += data.lords[l].influence
				log(`Gain Lords Influence : Lancastrians gain ${data.lords[l].influence} for ${data.lords[l].name}`)
			}
		}
	}

	log(`Total ` + domy + ` Influence for York`)
	log(`Total ` + doml + ` Influence for Lancaster`)

	game.influence += doml
	game.influence -= domy
}

function goto_tides_of_war() {
	if (lord_has_capability(LORD_BUCKINGHAM, AOW_LANCASTER_STAFFORD_ESTATES)) {
		add_lord_assets(LORD_BUCKINGHAM, COIN, 1)
		add_lord_assets(LORD_BUCKINGHAM, PROV, 1)
	}
	tides_calc()
	if (tow_extra_ip()) {
		set_active(YORK)
		push_state("tow_extra_ip")
	}
	else
		goto_disembark()
}

// === 4.8.2 END CAMPAIGN: DISEMBARK ===

function has_lords_at_sea() {
	for (let x = first_friendly_lord; x <= last_friendly_lord; x++) {
		if (is_lord_at_sea(x))
			return true
	}
	return false
}

function is_lord_at_sea(lord) {
	let here = get_lord_locale(lord)
	return here === LOC_NORTH_SEA || here === LOC_IRISH_SEA || here === LOC_ENGLISH_CHANNEL
}

function goto_disembark() {
	if (has_lords_at_sea()) {
		push_state("disembark")
	} else {
		end_disembark()
	}
}

function end_disembark() {
	game.who = NOBODY
	set_active_enemy()
	if (game.active === P1 && has_lords_at_sea())
		goto_disembark()
	else if (game.active === P2 && has_lords_at_sea()) {
		goto_disembark()
	}
	else {
		set_active(P1)
		goto_victory_check()
	}
}

function do_disembark() {
	let roll = roll_die()
	let success = roll >= 5

	log(`Disembark: (>4) ${success ? HIT[roll] : MISS[roll]}`)

	return success
}

function has_safe_ports(sea) {
	for (let loc of find_ports(sea))
		if (!has_enemy_lord(loc))
			return true
	return false
}

states.disembark = {
	inactive: "Disembark",
	prompt() {
		view.prompt = "Disembark your lords at sea."
		let done = true
		if (game.who === NOBODY) {
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; lord++) {
				if (is_lord_at_sea(lord)) {
					gen_action_lord(lord)
					done = false
				}
			}
		} else {
			let sea = get_lord_locale(game.who)
			for (let loc of find_ports(sea))
				if (!has_enemy_lord(loc))
					gen_action_locale(loc)
		}
		if (done) {
			view.actions.done = 1
		}
	},
	lord(lord) {
		if (do_disembark()) {
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
	levy_burgundians(lord)
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
		if (is_vassal_mustered_with(v, lord)) {
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

// === 4.8.3 END CAMPAIGN: VICTORY CHECK ===

function goto_victory_check() {
	if (!(check_scenario_end_victory() || check_campaign_victory() || check_threshold_victory())) {
		if (set_has(GROW_TURNS, current_turn())) {
			do_grow()
		} else if (set_has(WASTE_TURNS, current_turn())) {
			do_waste()
		} else {
			goto_reset()
		}
	}
}

// === 4.8.4 END CAMPAIGN: GROW ===

function do_grow() {
	log("Grow:")
	logi("Changing all Depleted locales to Normal.")
	logi("Changing all Exhausted locales to Depleted.")

	for (let x = first_locale; x <= last_locale; x++) {
		refresh_locale(x)
	}
	goto_reset()
}

// === 4.8.5 END CAMPAIGN: WASTE ===

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
	remove_half(lord, PROV)
	remove_half(lord, CART)
	remove_half(lord, SHIP)
	set_lord_assets(lord, COIN, data.lords[lord].assets.coin)
	muster_lord_forces(lord)
}

function remove_half(lord, type) {
	set_lord_assets(lord, type, Math.ceil(get_lord_assets(lord, type) / 2))
}

// === 4.8.6 END CAMPAIGN: RESET (DISCARD ARTS OF WAR) ===

function goto_reset() {
	game.state = "reset"

	// Discard "This Campaign" events from play.
	discard_friendly_events("this_campaign")
}

states.reset = {
	inactive: "Reset",
	prompt() {
		view.prompt = "Reset: You may discard any held Arts of War cards desired."
		if (game.active === YORK) {
			for (let c = first_york_card; c <= last_york_card; ++c) {
				if (set_has(game.hand_y, c)) {
					gen_action_card(c)
				}
			}
		}
		if (game.active === LANCASTER) {
			for (let c = first_lancaster_card; c <= last_lancaster_card; ++c) {
				if (set_has(game.hand_l, c)) {
					gen_action_card(c)
				}
			}
		}
		view.actions.end_discard = 1
	},
	card(c) {
		push_undo()
		if (set_has(game.hand_y, c)) {
			log("Discarded Held card.")
			set_delete(game.hand_y, c)
		} else if (set_has(game.hand_l, c)) {
			log("Discarded Held card.")
			set_delete(game.hand_l, c)
		}
	},
	end_discard() {
		end_reset()
	},
}

function end_reset() {
	set_active_enemy()
	if (game.active === P2)
		goto_reset()
	else
		goto_advance_campaign()
}

// === 5.1 CAMPAIGN VICTORY ===

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
		goto_game_over(YORK, `${YORK} won a Campaign Victory!`)
		return true
	} else if (lancaster_v) {
		goto_game_over(LANCASTER, `${LANCASTER} won a Campaign Victory!`)
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
		goto_game_over(YORK, `${YORK} won a Campaign Victory!`)
		return true
	} else if (lancaster_v) {
		goto_game_over(LANCASTER, `${LANCASTER} won a Campaign Victory!`)
		return true
	}

	return false
}

// === 5.2 THRESHOLD VICTORY ===

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

// === 5.3 SCENARIO END VICTORY ===

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

// === 6.0 SCENARIOS ===

exports.scenarios = [
	"Ia. Henry VI",
	"Ib. Towton",
	"Ic. Somerset's Return",
	"II. Warwicks' Rebellion",
	"III. My Kingdom for a Horse",
// TODO	"I-III. Wars of the Roses",
]

const scenario_last_turn = {
	"Ia. Henry VI": 15,
	"Ib. Towton": 2,
	"Ic. Somerset's Return": 8,
	"II. Warwicks' Rebellion": 15,
	"III. My Kingdom for a Horse": 15,
	"I-III. Wars of the Roses": 15,
}

function is_card_in_scenario(_c) {
	// TODO: Cards setup
	return true
}

function muster_lord_forces(lord) {
	let info = data.lords[lord]
	set_lord_forces(lord, RETINUE, info.forces.retinue | 0)
	set_lord_forces(lord, MEN_AT_ARMS, info.forces.men_at_arms | 0)
	set_lord_forces(lord, LONGBOWMEN, info.forces.longbowmen | 0)
	set_lord_forces(lord, MILITIA, info.forces.militia | 0)
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

exports.setup = function (seed, scenario, options) {
	game = {
		seed,
		scenario,
		hidden: options.hidden ? 1 : 0,

		log: [],
		undo: [],

		active: null,
		rebel: null,
		state: "setup_lords",
		stack: [],
		victory_check: 0,
		influence: 0,

		hand_y: [],
		hand_l: [],
		plan_y: [],
		plan_l: [],

		turn: 0,
		events: [], // this levy/this campaign cards

		pieces: {
			// per lord data
			locale: [],
			assets: [],
			forces: [],
			routed: [],
			capabilities: [], // TODO map card -> lord instead of lord+slot -> card
			moved: [],
			in_exile: 0,

			// per vassal data
			vassals: Array(vassal_count).fill(VASSAL_OUT_OF_PLAY),

			// per locale data
			depleted: [],
			exhausted: [],
			favourl: [],
			favoury: [],
		},

		flags: {
			first_action: 0,
			first_march_highway: 0,
			free_levy: 0,
			free_parley_henry:0,
			free_parley_gloucester:0,
			burgundians:0,
			charity:0,
			bloody:0,
			london_for_york:0,
			surprise_landing:0,
			sail_to_port: 0,
			march_to_port: 0,
			parliament_votes:0,
			succession:0,
			jack_cade:0,
			commons_militia:0,
			swap_battle_attacker:0,
			supply_depot:0,
			loyalty_and_trust:0,
			warden_of_the_marches:0,
			naval_blockade:0
		},

		command: NOBODY,
		actions: 0,
		group: 0,
		intercept_group: 0,
		who: NOBODY,
		where: NOWHERE,
		what: NOTHING,
		which: NOTHING,
		count: 0,
		event_data: 0,

		supply: 0,
		march: 0,
		battle: 0,
		spoils: 0,
		parley: 0,
	}

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
		case "II. Warwicks' Rebellion":
			setup_II()
			break
		case "III. My Kingdom for a Horse":
			setup_III()
			break
		case "I-III. Wars of the Roses":
			setup_ItoIII()
			break
	}

	update_aliases()

	goto_setup_lords()

	return game
}

function setup_Ia() {
	game.turn = 1 << 1

	game.rebel = YORK
	game.active = YORK
	game.victory_check = 40
	game.influence = 0
	muster_lord(LORD_YORK, LOC_ELY)
	muster_lord(LORD_MARCH, LOC_LUDLOW)
	muster_lord(LORD_HENRY_VI, LOC_LONDON)
	muster_lord(LORD_SOMERSET_1, LOC_LONDON)

	set_lord_calendar(LORD_NORTHUMBERLAND_L, 2)
	set_lord_calendar(LORD_EXETER_1, 3)
	set_lord_calendar(LORD_BUCKINGHAM, 5)
	set_lord_calendar(LORD_SALISBURY, 2)
	set_lord_calendar(LORD_WARWICK_Y, 3)
	set_lord_calendar(LORD_RUTLAND, 5)

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
	game.active = YORK
	game.victory_check = 40
	game.influence = 6
	muster_lord(LORD_WARWICK_Y, LOC_LONDON)
	muster_lord(LORD_MARCH, LOC_LONDON)
	muster_lord(LORD_SOMERSET_1, LOC_BAMBURGH)

	set_lord_calendar(LORD_HENRY_VI, 5)

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
	game.active = LANCASTER
	game.victory_check = 40
	game.influence = 0
	muster_lord(LORD_EDWARD_IV, LOC_LONDON)
	muster_lord(LORD_PEMBROKE, LOC_PEMBROKE)
	muster_lord(LORD_WARWICK_L, LOC_CALAIS)
	muster_lord(LORD_CLARENCE, LOC_YORK)
	muster_lord(LORD_JASPER_TUDOR_1, LOC_HARLECH)

	set_lord_calendar(LORD_DEVON, 1)
	set_lord_calendar(LORD_GLOUCESTER_1, 9)
	set_lord_calendar(LORD_NORTHUMBERLAND_Y1, 9)
	set_lord_calendar(LORD_MARGARET, 9)
	set_lord_in_exile(LORD_MARGARET)
	set_lord_calendar(LORD_SOMERSET_2, 9)
	set_lord_in_exile(LORD_SOMERSET_2)
	set_lord_calendar(LORD_OXFORD, 9)
	set_lord_in_exile(LORD_OXFORD)
	set_lord_calendar(LORD_EXETER_2, 9)
	set_lord_in_exile(LORD_EXETER_2)

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

	// TODO: Add Foreign Haven rule
	// TODO: Add Skaky Allies rules
}

function setup_III() {
	game.turn = 1 << 1

	game.rebel = LANCASTER
	game.active = LANCASTER
	game.victory_check = 40
	game.influence = 0
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
	game.active = YORK
	game.victory_check = 45
	game.influence = 0
	muster_lord(LORD_YORK, LOC_ELY)
	muster_lord(LORD_MARCH, LOC_LUDLOW)
	muster_lord(LORD_HENRY_VI, LOC_LONDON)
	muster_lord(LORD_SOMERSET_1, LOC_WELLS)

	set_lord_calendar(LORD_NORTHUMBERLAND_L, 1)
	set_lord_calendar(LORD_EXETER_1, 3)
	set_lord_calendar(LORD_BUCKINGHAM, 5)
	set_lord_calendar(LORD_SALISBURY, 2)
	set_lord_calendar(LORD_WARWICK_Y, 3)
	set_lord_calendar(LORD_RUTLAND, 5)

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

// === 6.0 CAMPAIGN ===
/*

function should_remove_Y28_event_card() {
	return game.scenario !== "I-III. Wars of the Roses"
}

function has_Y28_happened() {
	//TODO: Scenario IIY and IIL when Y28 happens.
	return false
}

function add_card_scenario(c) {
	// TODO: Add card in scenario
}

function remove_card_scenario(c) {
	//TODO: Remove card in scenario
}

function setup_II_Y() {
	game.turn = 1 << 1
	game.scenario = "IIY. The Kingmaker"
	game.rebel = LANCASTER
	game.active = LANCASTER
	game.victory_check = 45
	game.influence = 0

	for (let lord = first_lord; lord <= last_lord; lord++) {
		if (is_lord_in_play(lord)) {
			disband_lord(lord, false)
		}
	}
	for (let loc = first_locale; loc <= last_locale; loc++) {
		remove_exhausted_marker(loc)
		remove_depleted_marker(loc)
		remove_favourl_marker(loc)
		remove_favoury_marker(loc)
	}
	discard_events("this_levy")
	discard_events("hold")
	discard_events("this_campaign")

	// Setup
	// Yorkist setup
	// TODO: Add cards Y1-Y13, Y25, Y26, Y27, Y29, Y30

	if (is_lord_in_play(LORD_RUTLAND) && main_york_heir !== LORD_RUTLAND) {
		muster_lord(LORD_RUTLAND, LOC_CANTERBURY)
		add_favoury_marker(LOC_CANTERBURY)
	}

	set_lord_calendar(LORD_DEVON, 1)
	set_lord_calendar(LORD_GLOUCESTER_1, 9)
	set_lord_calendar(LORD_NORTHUMBERLAND_Y1, 9)

	if (main_york_heir === LORD_YORK) {
		muster_lord(LORD_YORK, LOC_CANTERBURY)
		add_favoury_marker(LOC_LONDON)
		if (is_lord_in_play(LORD_MARCH)) {
			muster_lord(LORD_MARCH, LOC_LUDLOW)
		}
		// TODO: Add cards Y14, Y18, Y19, Y20
	}

	if (main_york_heir === LORD_MARCH) {
		muster_lord(LORD_EDWARD_IV, LOC_LONDON)
		// Removed because he can't appear in scenario III
		disband_lord(LORD_MARCH, true)
		// TODO: Add cards Y23, Y24, Y28, Y31
	}

	if (main_york_heir === LORD_RUTLAND) {
		muster_lord(LORD_RUTLAND, LOC_LONDON)
		// TODO: Add cards Y20, Y21, Y28, Y35
	}

	// If < 2 heirs, muster Pembroke
	if ((main_york_heir === LORD_RUTLAND || main_york_heir === LORD_GLOUCESTER_1)
	|| (main_york_heir === LORD_EDWARD_IV && !is_lord_in_play(LORD_RUTLAND))) {
		muster_lord(LORD_PEMBROKE, LOC_PEMBROKE)
	}

	// Lancaster setup
	// TODO: Add cards L1-L3, L5-L13, L23, L24, L25, L29, L30, L36

	if (main_lancaster_heir === LORD_HENRY_VI) {
		set_lord_calendar(LORD_HENRY_VI, 9)
		set_lord_in_exile(LORD_HENRY_VI)
		// TODO: Add L17, L18, L20, L21
	}
	if (main_lancaster_heir === LORD_MARGARET) {
		set_lord_calendar(LORD_MARGARET, 9)
		set_lord_in_exile(LORD_MARGARET)

		// TODO: Add L27, L28, L31 + L26 Special rule
	}
	if (main_lancaster_heir === LORD_SOMERSET_1 || main_lancaster_heir === LORD_SOMERSET_2) {
		// TODO: Add cards L20, L21, L27
	}

	if (is_lord_in_play(LORD_SOMERSET_1)) {
		set_lord_calendar(LORD_SOMERSET_1, 9)
		set_lord_in_exile(LORD_SOMERSET_1)
	}
	else if (is_lord_in_play(LORD_SOMERSET_2)) {
		set_lord_calendar(LORD_SOMERSET_2, 9)
		set_lord_in_exile(LORD_SOMERSET_2)
	}

	muster_lord(LORD_WARWICK_L, LOC_CALAIS)
	muster_lord(LORD_CLARENCE, LOC_YORK)
	muster_lord(LORD_JASPER_TUDOR_1, LOC_HARLECH)
	set_lord_calendar(LORD_OXFORD, 9)
	set_lord_in_exile(LORD_OXFORD)
	set_lord_calendar(LORD_EXETER_2, 9)
	set_lord_in_exile(LORD_EXETER_2)

	add_favourl_marker(LOC_CALAIS)
	add_favourl_marker(LOC_YORK)
	add_favourl_marker(LOC_HARLECH)
	add_favourl_marker(LOC_COVENTRY)
	add_favourl_marker(LOC_WELLS)

	add_favoury_marker(LOC_LONDON)
	add_favoury_marker(LOC_ELY)
	add_favoury_marker(LOC_LUDLOW)
	add_favoury_marker(LOC_CARLISLE)
	add_favoury_marker(LOC_PEMBROKE)
	add_favoury_marker(LOC_EXETER)

	// Exile box setup
	add_favourl_marker(LOC_FRANCE)
	add_favoury_marker(LOC_BURGUNDY)

	setup_vassals([ VASSAL_DEVON, VASSAL_OXFORD ])

	// TODO: Add Foreign Haven rule
	// TODO: Add Skaky Allies rules
	// TODO: Natural causes rule

}

function setup_II_L() {
	game.turn = 1 << 1
	game.scenario = "IIL. Lancastrian Legitimacy Fades"
	game.rebel = YORK
	game.active = YORK
	game.victory_check = 40
	game.influence = 0

	for (let lord = first_lord; lord <= last_lord; lord++) {
		if (is_lord_in_play(lord)) {
			disband_lord(lord, false)
		}
	}
	for (let loc = first_locale; loc <= last_locale; loc++) {
		remove_exhausted_marker(loc)
		remove_depleted_marker(loc)
		remove_favourl_marker(loc)
		remove_favoury_marker(loc)
	}
	discard_events("this_levy")
	discard_events("hold")
	discard_events("this_campaign")

	// Setup
	// Lancaster setup
	// TODO: Add cards L1-L3, L5-L13, L18, L19, L20, L21, L25, L29, L34

	if (main_lancaster_heir === LORD_HENRY_VI) {
		muster_lord(LORD_HENRY_VI, LOC_LONDON)
		// TODO: Add L15, L17
		if (is_lord_in_play(LORD_SOMERSET_1)) {
			muster_lord(LORD_SOMERSET_1, LOC_WELLS)
		}
		if (is_lord_in_play(LORD_SOMERSET_2)) {
			muster_lord(LORD_SOMERSET_2, LOC_WELLS)
		}
	}

	if (main_lancaster_heir === LORD_MARGARET) {
		set_lord_calendar(LORD_MARGARET, 1)
		// TODO: Add L27, L31 + L26 Special rule
		if (is_lord_in_play(LORD_SOMERSET_1)) {
			muster_lord(LORD_SOMERSET_1, LOC_WELLS)
		}
		if (is_lord_in_play(LORD_SOMERSET_2)) {
			muster_lord(LORD_SOMERSET_2, LOC_WELLS)
		}
	}
	if (main_lancaster_heir === LORD_SOMERSET_1 || main_lancaster_heir === LORD_SOMERSET_2) {
		// TODO: Add cards L16, L27
		muster_lord(LORD_SOMERSET_1, LOC_LONDON)
		if (main_lancaster_heir === LORD_SOMERSET_2) {
			// Somerset 2 cylinder replaced by Somerset 1 cylinder
			disband_lord(LORD_SOMERSET_2, true)
		}
	}

	// Yorkist setup
	// TODO: Add cards Y1-Y13, Y15, Y16, Y17, Y22, Y28, Y29, Y31, Y34

	if (main_york_heir === LORD_YORK) {
		set_lord_calendar(LORD_YORK, 7)
		set_lord_in_exile(LORD_YORK)
		// TODO: Add cards Y14, Y20
	}

	if (main_york_heir === LORD_MARCH) {
		set_lord_calendar(LORD_MARCH, 7)
		set_lord_in_exile(LORD_MARCH)
		// TODO: Add cards Y20, 21
	}

	if (main_york_heir === LORD_RUTLAND) {
		set_lord_calendar(LORD_MARCH, 7)
		// TODO: Add cards Y20, Y21
	}

	if (main_york_heir === LORD_GLOUCESTER_1) {
		// TODO: Add cards Y25, Y30
	}

	if (is_lord_in_play(LORD_MARCH) && main_york_heir !== LORD_MARCH) {
		set_lord_calendar(LORD_MARCH, 7)
		set_lord_in_exile(LORD_MARCH)
	}

	if (is_lord_in_play(LORD_RUTLAND) && main_york_heir !== LORD_RUTLAND) {
		set_lord_calendar(LORD_RUTLAND, 7)
		set_lord_in_exile(LORD_RUTLAND)
	}
	if (is_lord_in_play(LORD_GLOUCESTER_1) && main_york_heir !== LORD_GLOUCESTER_1) {
		set_lord_calendar(LORD_GLOUCESTER_1, 7)
		set_lord_in_exile(LORD_GLOUCESTER_1)
	}

	muster_lord(LORD_WARWICK_Y, LOC_CALAIS)
	muster_lord(LORD_SALISBURY, LOC_YORK)
	muster_lord(LORD_PEMBROKE, LOC_PEMBROKE)
	muster_lord(LORD_JASPER_TUDOR_1, LOC_HARLECH)
	set_lord_calendar(LORD_DEVON, 1)
	set_lord_calendar(LORD_OXFORD, 2)
	set_lord_calendar(LORD_EXETER_2, 2)
	set_lord_calendar(LORD_NORTHUMBERLAND_L, 8)

	add_favourl_marker(LOC_LONDON)
	add_favourl_marker(LOC_HARLECH)
	add_favourl_marker(LOC_OXFORD)
	add_favourl_marker(LOC_WELLS)
	add_favourl_marker(LOC_EXETER)
	add_favourl_marker(LOC_CARLISLE)

	add_favoury_marker(LOC_CALAIS)
	add_favoury_marker(LOC_YORK)
	add_favoury_marker(LOC_ELY)
	add_favoury_marker(LOC_LUDLOW)
	add_favoury_marker(LOC_PEMBROKE)

	// Exile box setup
	add_favourl_marker(LOC_FRANCE)
	add_favoury_marker(LOC_BURGUNDY)

	setup_vassals([ VASSAL_DEVON, VASSAL_OXFORD ])

	// TODO: Add Foreign Haven rule
	// TODO: Add Shaky Allies rules
	// TODO: Natural causes rule

}

function setup_III_Y() {
	game.turn = 1 << 1
	game.scenario = "IIIY. New Rivals"
	game.rebel = LANCASTER
	game.active = LANCASTER
	game.victory_check = 45
	game.influence = 0

	if (!is_lord_in_play(LORD_YORK)) {
		game.influence += 8
	}
	if (!is_lord_in_play(LORD_MARCH) && !is_lord_in_play(LORD_EDWARD_IV)) {
		game.influence += 8
	}
	if (!is_lord_in_play(LORD_RUTLAND)) {
		game.influence += 8
	}
	if (!is_lord_in_play(LORD_GLOUCESTER_1) && !is_lord_in_play(LORD_GLOUCESTER_2) && !is_lord_in_play(LORD_RICHARD_III)) {
		game.influence += 8
	}
	if (!is_lord_in_play(LORD_HENRY_VI)) {
		game.influence -= 8
	}
	if (!is_lord_in_play(LORD_HENRY_VI) && !is_lord_in_play(LORD_MARGARET)) {
		game.influence -= 8
	}
	if (!is_lord_in_play(LORD_SOMERSET_1)) {
		game.influence -= 8
	}
	if (!is_lord_in_play(LORD_SOMERSET_1) && !is_lord_in_play(LORD_SOMERSET_2)) {
		game.influence -= 8
	}

	for (let lord = first_lord; lord <= last_lord; lord++) {
		if (is_lord_in_play(lord)) {
			disband_lord(lord, false)
		}
	}
	for (let loc = first_locale; loc <= last_locale; loc++) {
		remove_exhausted_marker(loc)
		remove_depleted_marker(loc)
		remove_favourl_marker(loc)
		remove_favoury_marker(loc)
	}
	discard_events("this_levy")
	discard_events("hold")
	discard_events("this_campaign")

	// Yorkist Setup
	// TODO: Add Y1-Y13, Y36

	if (has_Y28_happened()) {
		if (is_lord_in_play(LORD_RUTLAND) && (is_lord_in_play(LORD_GLOUCESTER_1) || is_lord_in_play(LORD_GLOUCESTER_2) || is_lord_in_play(LORD_RICHARD_III))) {
			// If Gloucester (any) and Rutland, Rutland dies
			disband_lord(LORD_RUTLAND, true)
		}
	}

	if (main_york_heir === LORD_RUTLAND && (!is_lord_in_play(LORD_GLOUCESTER_1) && !is_lord_in_play(LORD_GLOUCESTER_2))) {
		// If Rutland is lone heir, Rutland dies
		disband_lord(LORD_RUTLAND, true)
		//Warwick becomes king
		muster_lord(LORD_WARWICK_Y, LOC_LONDON)
		add_favoury_marker(LOC_LONDON)
		muster_lord(LORD_SALISBURY, LOC_YORK)
		add_favoury_marker(LOC_YORK)

		// TODO: Add Y16, Y17, Y22
	}

	// If only 1 is alive
	if (main_york_heir === LORD_YORK && !is_lord_in_play(LORD_MARCH) && !is_lord_in_play(LORD_RUTLAND) && !is_lord_in_play(LORD_GLOUCESTER_1)) {
		muster_lord(LORD_NORTHUMBERLAND_Y2, LOC_CARLISLE)
		add_favoury_marker(LOC_CARLISLE)

		// TODO: Add Y37
	}
	if ((main_york_heir === LORD_MARCH || main_york_heir === LORD_EDWARD_IV) && !is_lord_in_play(LORD_RUTLAND) && !is_lord_in_play(LORD_GLOUCESTER_1)) {
		muster_lord(LORD_NORTHUMBERLAND_Y2, LOC_CARLISLE)
		add_favoury_marker(LOC_CARLISLE)
		// TODO: Add Y37
	}
	if (main_york_heir === LORD_GLOUCESTER_1 || main_york_heir === LORD_RICHARD_III) {
		muster_lord(LORD_NORTHUMBERLAND_Y2, LOC_CARLISLE)
		add_favoury_marker(LOC_CARLISLE)
		// TODO: Add Y37
	}
	muster_lord(LORD_NORFOLK, LOC_ARUNDEL)
	add_favoury_marker(LOC_ARUNDEL)

	if (main_york_heir === LORD_YORK) {
		// TODO: Add Y14, Y21
		if (is_lord_in_play(LORD_MARCH)) {
			muster_lord(LORD_MARCH, LOC_LUDLOW)
			add_favoury_marker(LOC_LUDLOW)
			// Add Y20
			// Only 2 heirs can stay
			disband_lord(LORD_RUTLAND, true)
			disband_lord(LORD_GLOUCESTER_1, true)
		}
		if (!is_lord_in_play(LORD_MARCH) && is_lord_in_play(LORD_RUTLAND)) {
			muster_lord(LORD_RUTLAND, LOC_CANTERBURY)
			add_favoury_marker(LOC_CANTERBURY)
			// TODO: Add Y20
		}
		if (is_lord_in_play(LORD_GLOUCESTER_1)) {
			muster_lord(LORD_GLOUCESTER_1, LOC_GLOUCESTER)
			add_favoury_marker(LOC_GLOUCESTER)
			// TODO: Y34
		}
	}
	if (main_york_heir === LORD_MARCH || main_york_heir === LORD_EDWARD_IV) {
		muster_lord(LORD_EDWARD_IV, LOC_LONDON)
		add_favoury_marker(LOC_LONDON)

		// If Edward IV is on the map, remove March
		disband_lord(LORD_MARCH, true)
		// TODO: Add Y23, Y24
		if (is_lord_in_play(LORD_RUTLAND)) {
			muster_lord(LORD_RUTLAND, LOC_CANTERBURY)
			add_favoury_marker(LOC_CANTERBURY)
			// TODO: Add Y31
		}
		if (is_lord_in_play(LORD_GLOUCESTER_1)) {
			muster_lord(LORD_GLOUCESTER_1, LOC_GLOUCESTER)
			add_favoury_marker(LOC_GLOUCESTER)
			// TODO: Add Y28, Y34
		}

	}
	if (main_york_heir === LORD_RUTLAND) {
		muster_lord(LORD_RUTLAND, LOC_LONDON)
		add_favoury_marker(LOC_LONDON)
		// TODO: Add Y20, Y21
		if (is_lord_in_play(LORD_GLOUCESTER_1)) {
			muster_lord(LORD_GLOUCESTER_2, LOC_LONDON)
			// If Rutland is King, golden gloucester 2 arrives and gloucester 1 is gone
			disband_lord(LORD_GLOUCESTER_1, true)
			// TODO: Add Y34
		}
	}
	if (main_york_heir === LORD_GLOUCESTER_1) {
		muster_lord(LORD_RICHARD_III, LOC_LONDON)
		add_favoury_marker(LOC_LONDON)
		// if Richard III is here, both gloucester are gone
		disband_lord(LORD_GLOUCESTER_1, true)
		disband_lord(LORD_GLOUCESTER_2, true)
		// TODO: Add Y32, Y33
	}

	// Lancaster setup
	// TODO: Add L1-L13, L34, L35, L36, L37

	if (main_lancaster_heir === LORD_HENRY_VI || main_lancaster_heir === LORD_MARGARET) {
		muster_lord(LORD_MARGARET, LOC_FRANCE)
		// TODO: Add L27, L31 + L26 Edward
		// Only one heir
		disband_lord(LORD_HENRY_VI, true)
		disband_lord(LORD_SOMERSET_1, true)
		disband_lord(LORD_SOMERSET_2, true)
	}
	// If Margaret not here and Edward IV not king
	if (!is_lord_on_map(LORD_MARGARET) && main_york_heir !== LORD_EDWARD_IV) {
		muster_lord(LORD_HENRY_TUDOR, LOC_FRANCE)
		// TODO: Add L32, L35
		disband_lord(LORD_SOMERSET_1, true)
		disband_lord(LORD_SOMERSET_2, true)
	}
	if (!is_lord_on_map(LORD_MARGARET) && !is_lord_on_map(LORD_HENRY_TUDOR)) {
		muster_lord(LORD_WARWICK_L, LOC_CALAIS)
		add_favourl_marker(LOC_CALAIS)
		// TODO: Add L23, L30
	}

	if (is_lord_on_map(LORD_MARGARET) || is_lord_on_map(LORD_HENRY_TUDOR)) {
		muster_lord(LORD_OXFORD, LOC_FRANCE)
		add_favourl_marker(LOC_OXFORD)
		muster_lord(LORD_JASPER_TUDOR_2, LOC_FRANCE)
		add_favoury_marker(LOC_PEMBROKE)
	}
	else if (is_lord_on_map(LORD_WARWICK_L)) {
		muster_lord(LORD_OXFORD, LOC_CALAIS)
		add_favourl_marker(LOC_OXFORD)
		muster_lord(LORD_JASPER_TUDOR_2, LOC_CALAIS)
		add_favoury_marker(LOC_PEMBROKE)
	}
	else {
		throw Error("Error Lancastrian setup III.Y")
	}

	// Exile box setup
	add_favourl_marker(LOC_FRANCE)
	add_favoury_marker(LOC_BURGUNDY)

	setup_vassals([ VASSAL_OXFORD, VASSAL_NORFOLK ])
}

function setup_III_L() {
	game.turn = 1 << 1
	game.scenario = "IIIL. Yorkists Last Stand"
	game.rebel = YORK
	game.active = YORK
	game.victory_check = 45
	game.influence = 0

	if (!is_lord_in_play(LORD_YORK)) {
		game.influence += 8
	}
	if (!is_lord_in_play(LORD_MARCH) && !is_lord_in_play(LORD_EDWARD_IV)) {
		game.influence += 8
	}
	if (!is_lord_in_play(LORD_RUTLAND)) {
		game.influence += 8
	}
	if (!is_lord_in_play(LORD_GLOUCESTER_1) && !is_lord_in_play(LORD_GLOUCESTER_2) && !is_lord_in_play(LORD_RICHARD_III)) {
		game.influence += 8
	}
	if (!is_lord_in_play(LORD_HENRY_VI)) {
		game.influence -= 8
	}
	if (!is_lord_in_play(LORD_HENRY_VI) && !is_lord_in_play(LORD_MARGARET)) {
		game.influence -= 8
	}
	if (!is_lord_in_play(LORD_SOMERSET_1)) {
		game.influence -= 8
	}
	if (!is_lord_in_play(LORD_SOMERSET_1) && !is_lord_in_play(LORD_SOMERSET_2)) {
		game.influence -= 8
	}

	for (let lord = first_lord; lord <= last_lord; lord++) {
		if (is_lord_in_play(lord)) {
			disband_lord(lord, false)
		}
	}
	for (let loc = first_locale; loc <= last_locale; loc++) {
		remove_exhausted_marker(loc)
		remove_depleted_marker(loc)
		remove_favourl_marker(loc)
		remove_favoury_marker(loc)
	}
	discard_events("this_levy")
	discard_events("hold")
	discard_events("this_campaign")

	// Lancaster Setup
	// TODO: Add L1-L13, L25, L34, L36

	if (main_lancaster_heir === LORD_HENRY_VI) {
		muster_lord(LORD_HENRY_VI, LOC_LONDON)
		// TOOD: Add L15, L17
	}
	if (main_lancaster_heir === LORD_MARGARET) {
		muster_lord(LORD_MARGARET, LOC_LONDON)
		// TODO: Add L27, L31
	}
	if (main_lancaster_heir === LORD_SOMERSET_1) {
		muster_lord(LORD_SOMERSET_1, LOC_LONDON)
		add_favourl_marker(LOC_WELLS)
		// TODO: Add L18, L20, L27
	}
	// Should never happen but as a failsafe
	if (main_lancaster_heir === LORD_SOMERSET_2) {
		muster_lord(LORD_SOMERSET_1, LOC_LONDON)
		add_favourl_marker(LOC_WELLS)
		disband_lord(LORD_SOMERSET_2, true)
		// TODO: Add L18, L20, L27
	}
	muster_lord(LORD_OXFORD, LOC_OXFORD)
	muster_lord(LORD_JASPER_TUDOR_2, LOC_PEMBROKE)
	add_favourl_marker(LOC_OXFORD)
	add_favourl_marker(LOC_PEMBROKE)
	add_favourl_marker(LOC_LONDON)

	// York Setup
	// TOOD: Add Y1-Y13, Y36

	if (has_Y28_happened()) {
		if (is_lord_in_play(LORD_GLOUCESTER_1) || is_lord_in_play(LORD_GLOUCESTER_2) || is_lord_in_play(LORD_RICHARD_III)) {
			// If Gloucester (any), all other yorkist heir dies
			disband_lord(LORD_YORK, true)
			disband_lord(LORD_RUTLAND, true)
			disband_lord(LORD_MARCH, true)
			disband_lord(LORD_EDWARD_IV, true)
			disband_lord(LORD_GLOUCESTER_1, true)
			disband_lord(LORD_RICHARD_III, true)
			muster_lord(LORD_GLOUCESTER_2, LOC_BURGUNDY)
			// TODO: Add Y35
		}
	}

	if (main_york_heir === LORD_YORK) {
		muster_lord(LORD_YORK, LOC_BURGUNDY)
		add_favoury_marker(LOC_ELY)
		// TODO: Add Y14, Y18
		if (is_lord_in_play(LORD_MARCH)) {
			// Only next highest heir alive
			disband_lord(LORD_RUTLAND, true)
			disband_lord(LORD_GLOUCESTER_1, true)
			disband_lord(LORD_GLOUCESTER_2, true)
			muster_lord(LORD_MARCH, LOC_BURGUNDY)
			add_favoury_marker(LOC_LUDLOW)
			//TODO: Add Y20
		}
		else if (!is_lord_in_play(LORD_MARCH) && is_lord_in_play(LORD_RUTLAND)) {
			// Only next highest heir alive
			disband_lord(LORD_GLOUCESTER_1, true)
			disband_lord(LORD_GLOUCESTER_2, true)
			muster_lord(LORD_RUTLAND, LOC_BURGUNDY)
			add_favoury_marker(LOC_CANTERBURY)
			//TODO: Add Y20
		}
		else if (!is_lord_in_play(LORD_MARCH) && !is_lord_in_play(LORD_RUTLAND) && (is_lord_in_play(LORD_GLOUCESTER_1) || is_lord_in_play(LORD_GLOUCESTER_2))) {
			// Final Scenario, and no succession rule
			disband_lord(LORD_GLOUCESTER_2, true)
			muster_lord(LORD_GLOUCESTER_1, LOC_BURGUNDY)
			add_favoury_marker(LOC_GLOUCESTER)
			// TODO: Add Y4
		}
		else {
			// If York alone
			muster_lord(LORD_SALISBURY, LOC_BURGUNDY)
			add_favoury_marker(LOC_YORK)
			//TODO: Add Y17, Y22
		}
	}
	if (main_york_heir === LORD_MARCH || main_york_heir === LORD_RUTLAND) {
		// If March or Rutland is highest heir, Warwick takes the lead
		disband_lord(LORD_MARCH, true)
		disband_lord(LORD_RUTLAND, true)
		muster_lord(LORD_WARWICK_Y, LOC_CALAIS)
		add_favoury_marker(LOC_CALAIS)
		//TODO: Add Y16
	}

	if (main_york_heir === LORD_WARWICK_Y) {
		muster_lord(LORD_NORFOLK, LOC_CALAIS)
		muster_lord(LORD_SALISBURY, LOC_CALAIS)
		add_favoury_marker(LOC_CALAIS)
		//TODO: Add Y17, Y22
	}
	else (
		muster_lord(LORD_NORFOLK, LOC_BURGUNDY)
	)

	if (main_york_heir === LORD_GLOUCESTER_1) {
		disband_lord(LORD_GLOUCESTER_1, true)
		muster_lord(LORD_GLOUCESTER_2, LOC_BURGUNDY)
		muster_lord(LORD_SALISBURY, LOC_BURGUNDY)
		//TODO: Add Y17, Y22
	}

	add_favoury_marker(LOC_ARUNDEL)

	// Exile box setup
	add_favourl_marker(LOC_FRANCE)
	add_favoury_marker(LOC_BURGUNDY)

	setup_vassals([ VASSAL_OXFORD, VASSAL_NORFOLK ])
}

// FULL SCENARIO HEIR
function get_main_york_heir() {
	if (is_lord_in_play(LORD_YORK))
		return LORD_YORK
	if (!is_lord_in_play(LORD_YORK) && is_lord_in_play(LORD_MARCH))
		return LORD_MARCH
	if (!is_lord_in_play(LORD_YORK) && !is_lord_in_play(LORD_MARCH) && is_lord_in_play(LORD_EDWARD_IV))
		return LORD_EDWARD_IV
	if (!is_lord_in_play(LORD_YORK) && !is_lord_in_play(LORD_MARCH) && !is_lord_in_play(LORD_EDWARD_IV) && is_lord_in_play(LORD_RUTLAND))
		return LORD_RUTLAND
	if (!is_lord_in_play(LORD_YORK) && !is_lord_in_play(LORD_MARCH) && !is_lord_in_play(LORD_EDWARD_IV) && !is_lord_in_play(LORD_RUTLAND) && (is_lord_in_play(LORD_GLOUCESTER_1) || is_lord_in_play(LORD_GLOUCESTER_2) || is_lord_in_play(LORD_RICHARD_III)))
		return LORD_GLOUCESTER_1
	if (!is_lord_in_play(LORD_YORK) && !is_lord_in_play(LORD_MARCH) && !is_lord_in_play(LORD_EDWARD_IV) && !is_lord_in_play(LORD_RUTLAND) && !is_lord_in_play(LORD_GLOUCESTER_1) && !is_lord_in_play(LORD_GLOUCESTER_2) && !is_lord_in_play(LORD_RICHARD_III))
		return LORD_WARWICK_Y
}

function get_main_lancaster_heir() {
	if (is_lord_in_play(LORD_HENRY_VI))
		return LORD_HENRY_VI
	if (!is_lord_in_play(LORD_HENRY_VI) && is_lord_in_play(LORD_MARGARET))
		return LORD_MARGARET
	if (!is_lord_in_play(LORD_HENRY_VI) && !is_lord_in_play(LORD_MARGARET) && is_lord_in_play(LORD_SOMERSET_1))
		return LORD_SOMERSET_1
	if (!is_lord_in_play(LORD_HENRY_VI) && !is_lord_in_play(LORD_MARGARET) && !is_lord_in_play(LORD_SOMERSET_1) && is_lord_in_play(LORD_SOMERSET_2))
		return LORD_SOMERSET_2
	if (!is_lord_in_play(LORD_HENRY_VI) && !is_lord_in_play(LORD_MARGARET) && !is_lord_in_play(LORD_SOMERSET_1) && !is_lord_in_play(LORD_SOMERSET_2) && is_lord_in_play(LORD_HENRY_TUDOR))
		return LORD_HENRY_TUDOR
	if (!is_lord_in_play(LORD_HENRY_VI) && !is_lord_in_play(LORD_MARGARET) && !is_lord_in_play(LORD_SOMERSET_1) && !is_lord_in_play(LORD_SOMERSET_2) && !is_lord_in_play(LORD_HENRY_TUDOR) && is_lord_in_play(LORD_WARWICK_L))
		return LORD_WARWICK_L
}

*/

// === CAPABILITY: MUSTER EFFECTS ===

// When a lord levies a capability, its muster vassal applies instantly.
function capability_muster_effects(lord, c) {
	if (c === AOW_LANCASTER_MONTAGU)
		muster_vassal(VASSAL_MONTAGU, lord)

	if (c === AOW_LANCASTER_MY_FATHERS_BLOOD)
		muster_vassal(VASSAL_CLIFFORD, lord)

	if (c === AOW_LANCASTER_ANDREW_TROLLOPE)
		muster_vassal(VASSAL_TROLLOPE, lord)

	if (c === AOW_LANCASTER_EDWARD)
		muster_vassal(VASSAL_EDWARD, lord)

	if (c === AOW_LANCASTER_THOMAS_STANLEY) {
		muster_vassal(VASSAL_THOMAS_STANLEY, lord)
		game.flags.free_levy = 1
	}

	if (c === AOW_YORK_HASTINGS) {
		add_lord_forces(lord, MEN_AT_ARMS, 2)
		muster_vassal(VASSAL_HASTINGS, lord)
	}
	if (c === AOW_YORK_FAIR_ARBITER && is_friendly_locale(get_lord_locale(LORD_SALISBURY))) {
		game.count += 1
	}
	if (c === AOW_YORK_FALLEN_BROTHER && !is_lord_in_play(LORD_CLARENCE)) {
		game.count += 1
	}

	if (c === AOW_YORK_BURGUNDIANS) {
		if (is_seaport(get_lord_locale(lord) && !is_exile(get_lord_locale(lord)))) {
			add_lord_forces(lord, BURGUNDIANS, 2)
			logi(AOW_YORK_BURGUNDIANS)
			game.flags.burgundians = 1
		}
		else {
			game.flags.burgundians = 0
		}
	}
}

// === CAPABILITY: LORDSHIP EFFECTS ===

// When a lord levies a capability, its +Lordship effects apply instantly.
function lordship_effects(lord) {
	if (is_friendly_locale(get_lord_locale(lord)) && lord_has_capability(lord, AOW_YORK_FAIR_ARBITER))
		game.count += 1
	if (lord_has_capability(lord, AOW_YORK_FALLEN_BROTHER) && !is_lord_in_play(LORD_CLARENCE))
		game.count += 1
	if (is_event_in_play(EVENT_YORK_EDWARD_V) && (lord === LORD_GLOUCESTER_1 || lord === LORD_GLOUCESTER_2))
		game.count += 3
	if (is_lancaster_lord(lord) && is_event_in_play(EVENT_LANCASTER_PARLIAMENT_VOTES)) {
		game.flags.parliament_votes = 1
	}
	if (is_york_lord(lord) && is_jack_cade_eligible(lord)) {
		game.flags.jack_cade = 2
	}
	if (is_york_lord(lord) && is_event_in_play(EVENT_YORK_SUCCESSION)) {
		game.flags.succession = 1
	}
}

// === CAPABILITY: SOLDIERS OF FORTUNE ===

states.soldiers_of_fortune = {
	inactive: "Levy Troops",
	prompt() {
		view.prompt = `Pay 1 Coin for Mercenaries ${lord_name[game.who]}.`
		let done = true
		if (done) {
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
				if (is_lord_unfed(lord) && can_pay_from_shared(lord)) {
					if (get_lord_assets(lord, COIN) > 0) {
						gen_action_coin(lord)
						done = false
					}
				}
			}
		}
		// Done
		if (done) {
			view.prompt = "Soldiers of fortune: Done."
			view.actions.end_sof = 1
		}
	},
	coin(lord) {
		push_undo()
		let here = get_lord_locale(game.who)
		let here_type = data.locales[here].type
		let number = get_lord_forces(game.who, MERCENARIES)
		let merc = 0
		if (!lord_has_capability(game.who, AOW_YORK_WOODWILLES))
			deplete_locale(here)

		switch (here_type) {
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
		if (number === 5)
			merc = 1
		else
			merc = 2
		add_lord_assets(lord, COIN, -1)
		add_lord_forces(game.who, MERCENARIES, merc)
		set_lord_unfed(game.who, 0)
	},
	end_sof() {
		end_soldiers_of_fortune()
	},
	card: action_held_event,
}

function end_soldiers_of_fortune() {
	pop_state()
	resume_levy_muster_lord()
}

// === CAPABILITY: COMMISSION OF ARRAY ===

states.commission_of_array = {
	inactive: "Levy Troops",
	prompt() {
		view.prompt = `Lord troops adjacent to ${lord_name[game.who]}.`
		let done = true
		let here = get_lord_locale(game.who)
		if (done) {
			for (let next of data.locales[here].adjacent) {
				if (is_friendly_locale(next) && lord_has_capability(game.who, AOW_LANCASTER_COMMISION_OF_ARRAY) && (!has_exhausted_marker(next) && !is_exile(next))) {
					done = false
					gen_action_locale(next)
				}
			}
		}
		// Done
		if (done) {
			view.prompt = "Commission of Array: Done."
			view.actions.end_coa = 1
		}
	},
	locale(loc) {
		push_undo()
		let loc_type = data.locales[loc].type
		deplete_locale(loc)

		switch (loc_type) {
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
		end_commission_of_array()
	},
	card: action_held_event,
}

function end_commission_of_array() {
	pop_state()
	resume_levy_muster_lord()
}

// === CAPABILITY: WE DONE DEEDS OF CHARITY ===

function tow_extra_ip() {
	for (let lord = first_york_lord; lord <= last_york_lord; ++lord) {
		if (lord_has_capability(lord, AOW_YORK_WE_DONE_DEEDS_OF_CHARITY) && (get_lord_assets(lord, PROV) > 0 || get_shared_assets(lord, PROV) > 0))
			return true
	}
	return false
}

states.tow_extra_ip = {
	inactive: "We done needs of charity",
	prompt() {
		let loc = 0
		view.prompt = "We done deeds of charity: spend up to two Provender to add influence points."
		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
			if (lord_has_capability(lord, AOW_YORK_WE_DONE_DEEDS_OF_CHARITY)) {
				loc = get_lord_locale(lord)
			}
		}
		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
			if (game.flags.charity < 2 && get_lord_locale(lord) === loc && (get_lord_assets(lord, PROV) > 0)) {
				gen_action_prov(lord)
			}
		}
		view.actions.done = 1
	},
	prov(lord) {
		push_undo()
		add_lord_assets(lord, PROV, -1)
		game.flags.charity += 1
	},
	done() {
		increase_york_influence(game.flags.charity)
		logi(`${AOW_YORK_WE_DONE_DEEDS_OF_CHARITY}`)
		log("York paid " + game.flags.charity + " provender to add " + game.flags.charity + " Influence Points")
		game.flags.charity = 0
		goto_disembark()
	},
}

// === CAPABILITY: MERCHANTS ===

function can_action_merchants() {
	let loc = get_lord_locale(game.command)
	if (game.actions <= 0)
		return false

	if (lord_has_capability(game.command, AOW_LANCASTER_MERCHANTS) && count_deplete(loc) > 0)
		return true
	else
		return false
}

function goto_merchants() {
	game.count = count_deplete(get_lord_locale(game.command))
	game.state = "merchants"
	init_influence_check(game.command)
}

states.merchants = {
	inactive: "Merchants",
	prompt() {
		view.prompt = "Merchants: Succeed an influence check to remove Depleted markers"
		prompt_influence_check()
	},
	spend1: add_influence_check_modifier_1,
	spend3: add_influence_check_modifier_2,
	check() {
		let results = do_influence_check()
		log(`Attempt to C${AOW_LANCASTER_MERCHANTS} with %${game.command} ${results.success ? "Successful" : "Failed"}: (${range(results.rating)}) ${results.success ? HIT[results.roll] : MISS[results.roll]}`)
		if (results.success) {
			merchants_success()
		} else {
			end_merchants_attempt()
		}
	}
}
function merchants_success() {
	game.state = "merchants_success"
}

states.merchants_success = {
	inactive: "Merchants Success",
	prompt() {
		view.prompt = `Remove Depleted/Exhausted markers`
		deplete_merchants()
		if (game.count === 0) {
			view.actions.done = 1
		}
	},
	locale(loc) {
		push_undo()
		remove_depleted_marker(loc)
		remove_exhausted_marker(loc)
		--game.count
		if (game.count === 0) {
			end_merchants_attempt()
		}
	},
	done(){
		end_merchants_attempt()
	}
}

function end_merchants_attempt() {
	spend_action(1)
	game.count = 0
	push_undo()
	end_influence_check()
	resume_command()
}

function deplete_merchants() {
	let here = get_lord_locale(game.command)
	for (let next of data.locales[here].adjacent) {
		if (has_exhausted_marker(next) || has_depleted_marker(next))
			gen_action_locale(next)
	}
	if (has_exhausted_marker(here) || has_depleted_marker(here))
		gen_action_locale(here)
}

function count_deplete(loc) {
	game.count = 0
	for (let next of data.locales[loc].adjacent) {
		if (has_exhausted_marker(next) || has_depleted_marker(next)) {
			++game.count
		}
	}
	if (has_exhausted_marker(loc) || has_depleted_marker(loc)) {
		++game.count
	}
	if (game.count > 1)
		return game.count = 2
	else
		return game.count
}

// === CAPABILITY: BURGUNDIANS ===

function levy_burgundians(lord) {
	if (is_seaport(get_lord_locale(lord)) && !is_exile(get_lord_locale(lord)) && lord_has_capability(lord, AOW_YORK_BURGUNDIANS) && game.flags.burgundians === 0) {
		add_lord_forces(lord, BURGUNDIANS, 2)
		logi(AOW_YORK_BURGUNDIANS)
		game.flags.burgundians = 1
	}
}

// === CAPABILITY: NAVAL BLOCKADE ===

function parley_through_sea(start, locale) {
	// Only entered in levy
	let ships = get_shared_assets(start, SHIP)

	if (ships === 0) {
		game.flags.naval_blockade = -1
	}

	search_dist.fill(0)
	search_seen.fill(0)
	search_seen[start] = 1

	let queue = [ start ]
	while (queue.length > 0) {
		let here = queue.shift()
		let dist = search_dist[here]
		let next_dist = dist + 1

		if (is_friendly_locale(here)) {
			for (let next of data.locales[here].adjacent) {
				if (!search_seen[next]) {
					search_seen[next] = 1
					search_dist[next] = next_dist
					queue.push(next)
					if (next === locale) {
						game.flags.naval_blockade = -1
					}
				}
			}
		}
	}
	queue = [ start ]
	while (queue.length > 0) {
		let here = queue.shift()
		let dist = search_dist[here]
		let next_dist = dist + 1

		if (is_friendly_locale(here)) {
			if (ships > 0 && is_seaport(here)) {
				for (let next of find_ports(here)) {
					if (!search_seen[next]) {
						search_seen[next] = 1
						search_dist[next] = next_dist
						queue.push(next)
						if (next === locale && game.flags.naval_blockade !== -1) {
							game.flags.naval_blockade = 1
						}
					}
				}
			}
		}
	}
}

function check_naval_blockade(action, locale) {
	let ports = [data.port_1, data.port_2, data.port_3]
	game.what = action

	if (!lord_has_capability(LORD_WARWICK_Y, AOW_YORK_NAVAL_BLOCKADE) || !is_seaport(get_lord_locale(LORD_WARWICK_Y)) || is_exile(get_lord_locale(LORD_WARWICK_Y))) {
		return false
	}

	if (action === "levy parley") {
		parley_through_sea(get_lord_locale(game.who), locale)
		if (game.flags.naval_blockade !== 1) {
			return false
		}
	}

	if (action === "campaign parley" && data.locales[locale].adjacent.includes(get_lord_locale(game.command))) {
		return false
	}

	for (let port of ports) {
		if (set_has(port, get_lord_locale(LORD_WARWICK_Y)) && set_has(port, locale)) {
			return true
		}
	}
}

function roll_naval_blockade() {
	push_state("naval_blockade")
}

// Parley, and Tax
states.naval_blockade = {
	inactive: "Naval Blockade",
	prompt() {
		view.prompt = `Naval Blockade : Warwick block this action except on a 1-2`
		view.actions.roll = 1
	},
	roll() {
		let threshold = 2
		let roll = roll_die()
		let success = threshold >= roll
		log(`Attempt to counter Naval Blockade ${success ? "Failed" : "Successful"}: (1-2) ${success ? HIT[roll] : MISS[roll]}`)
		if (success) {
			logi(`Successfully overran C${AOW_YORK_NAVAL_BLOCKADE}`)
			if (game.what === "levy parley") {
				game.flags.naval_blockade = -1
			}
			if (game.what === "campaign parley") {
				game.flags.naval_blockade = -1
			}
			if (game.what === "levy ship") {
				add_lord_assets(game.who, SHIP, 1)
			}
			if (game.what === "supply") {
				use_port_supply(game.where, get_port_supply_amount(game.where))
			}
			if (game.what === "sail") {
				do_sail(game.where)
			}
		}
		else {
			logi(`Failed C${AOW_YORK_NAVAL_BLOCKADE}`)
			if (game.what === "levy parley") {
				pop_state()
			}
			if (game.what === "campaign parley") {
				pop_state()
			}
		}
		if (game.what === "levy parley") {
			pop_state()
			resume_levy_muster_lord()
		}
		if (game.what === "campaign parley") {
			pop_state()
			--game.count
			resume_command()
		}
		if (game.what === "levy ship") {
			pop_state()
			resume_levy_muster_lord()
		}
		if (game.what === "supply" && !success) {
			end_supply()
		}
		if (game.what === "sail" && !success) {
			resume_command()
		}
		game.what = NOTHING
	},
}

// === CAPABILITY: AGITATORS ===

function can_action_agitators() {
	let here = get_lord_locale(game.command)
	if (game.actions <= 0)
		return false
	if (lord_has_capability(game.command, AOW_YORK_AGITATORS)) {
		for (let next of data.locales[here].adjacent) {
			if (!has_exhausted_marker(next) && !is_friendly_locale(next))
				return true
		}
	}
	else
		return false
}

function goto_agitators() {
	game.count = count_deplete(get_lord_locale(game.command))
	game.state = "agitators"
}

states.agitators = {
	inactive: "Agitators",
	prompt() {
		view.prompt = "Agitators: Add a depleted marker or flip to exhausted adjacent"
		deplete_agitators()
	},
	locale(loc) {
		push_undo()
		if (has_depleted_marker(loc)) {
			add_exhausted_marker(loc)
		}
		else {
			add_depleted_marker(loc)
		}
		end_agitators()
	},
}

function deplete_agitators() {
	let here = get_lord_locale(game.command)
	for (let next of data.locales[here].adjacent) {
		if (!has_exhausted_marker(next) && !is_friendly_locale(next))
			gen_action_locale(next)
	}
}

function end_agitators() {
	spend_action(1)
	push_undo()
	resume_command()
}

// === CAPABILITY: HERALDS ===

function can_action_heralds() {
	if (game.actions <= 0)
		return false

	if (!is_first_action())
		return false
	// at a seaport
	let here = get_lord_locale(game.command)
	if (!is_seaport(here))
		return false

	if (!lord_has_capability(game.command, AOW_LANCASTER_HERALDS))
		return false

	for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
		if (is_lord_on_calendar(lord))
			return true
	}
	return false
}

function goto_heralds() {
	game.state = "heralds"
}

states.heralds = {
	inactive: "Heralds",
	prompt() {
		view.prompt = "Heralds: Choose a Lord on calendar to shift him to next turn box"
		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
			if (is_lord_on_calendar(lord))
				gen_action_lord(lord)
		}
	},
	lord(other) {
		goto_heralds_attempt(other)
	},
}

function goto_heralds_attempt(lord) {
	game.what = lord
	push_state("heralds_attempt")
	init_influence_check(game.command)
}

states.heralds_attempt = {
	inactive: "Heralds Attempt",
	prompt() {
		view.prompt = `Attempt to shift ${lord_name[game.what]} to next Turn Box. `
		prompt_influence_check()
	},
	spend1: add_influence_check_modifier_1,
	spend3: add_influence_check_modifier_2,
	check() {
		let results = do_influence_check()
		log(`Attempt to shift L${game.what} ${results.success ? "Successful" : "Failed"}: (${range(results.rating)}) ${results.success ? HIT[results.roll] : MISS[results.roll]}`)

		if (results.success) {
			game.who = game.what
			set_lord_calendar(game.who, current_turn() + 1)
			end_heralds_attempt()
		} else {
			end_heralds_attempt()
		}
	},
}

function end_heralds_attempt() {
	spend_all_actions()
	pop_state()
	end_influence_check()
	resume_command()
}

// === EVENTS: IMMEDIATE ===

function goto_immediate_event(c) {
	switch (c) {
		// This Levy / Campaign
		case EVENT_LANCASTER_BE_SENT_FOR:
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

		// Immediate effect
		// Discard - Immediate Events
		case EVENT_LANCASTER_SCOTS:
			return goto_lancaster_event_scots()
		case EVENT_LANCASTER_HENRY_PRESSURES_PARLIAMENT:
			return goto_lancaster_event_henry_pressures_parliament()
		case EVENT_LANCASTER_HENRYS_PROCLAMATION:
			return goto_lancaster_event_henrys_proclamation()
		case EVENT_LANCASTER_FRENCH_TROOPS:
			return goto_lancaster_event_french_troops()
		case EVENT_LANCASTER_WARWICKS_PROPAGANDA:
			return goto_warwicks_propaganda()
		case EVENT_LANCASTER_WARWICKS_PROPAGANDA2:
			return goto_warwicks_propaganda()
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
		case EVENT_YORK_DUBIOUS_CLARENCE:
			return goto_dubious_clarence()
		case EVENT_YORK_YORKIST_NORTH:
			return goto_york_event_yorkist_north()
		case EVENT_YORK_EARL_RIVERS:
			return goto_york_event_earl_rivers()
		default:
			log("NOT IMPLEMENTED")
			return end_immediate_event()
	}
}

function end_immediate_event() {
	resume_levy_arts_of_war()
}

// === EVENT: LANCASTER SCOTS ===

function goto_lancaster_event_scots() {
	game.state = "scots"
	game.count = []
	game.who = NOBODY
}

function end_lancaster_event_scots() {
	game.count = 0
	game.who = NOBODY
	end_immediate_event()
}

states.scots = {
	inactive: "Scots",
	prompt() {
		view.prompt = "Scots: You may add 1 Men-at-Arms and 1 Militia to each Lord."
		for (let lord = first_lancaster_lord; lord <= last_lancaster_lord; lord++) {
			if (is_lord_on_map(lord) && map_get(game.count, lord, 0) < 3) {
				gen_action_lord(lord)
			}
		}

		if (game.who !== NOBODY) {
			let troops = map_get(game.count, game.who, 0)
			if ((troops & 1) === 0)
				view.actions.add_militia = 1
			if ((troops & 2) === 0)
				view.actions.add_men_at_arms = 1
		}
		view.actions.done = 1
	},
	done() {
		end_lancaster_event_scots()
	},
	add_militia() {
		add_lord_forces(game.who, MILITIA, 1)
		let troops = map_get(game.count, game.who, 0)
		map_set(game.count, game.who, troops + 1)
		if (troops !== 0)
			game.who = NOBODY
	},
	add_men_at_arms() {
		add_lord_forces(game.who, MEN_AT_ARMS, 1)
		let troops = map_get(game.count, game.who, 0)
		map_set(game.count, game.who, troops + 2)
		if (troops !== 0)
			game.who = NOBODY
	},
	lord(lord) {
		push_undo()
		game.who = lord
	},
}

// === EVENT: LANCASTER HENRY PRESSURES PARLIAMENT ===

function goto_lancaster_event_henry_pressures_parliament() {
	let count = 0
	for (let vassal = first_vassal; vassal <= last_vassal; vassal++) {
		if (is_vassal_mustered_with_york_lord(vassal)) {
			count++
		}
	}

	if (count > 0) {
		logi(`Removed ${count} York influence.`)
		reduce_york_influence(count)
	}

	end_immediate_event()
}

// === EVENT: LANCASTER HENRY'S PROCLAMATION ===

function goto_lancaster_event_henrys_proclamation() {
	for (let vassal = first_vassal; vassal <= last_vassal; vassal++) {
		if (is_vassal_mustered_with_york_lord(vassal)) {
			set_vassal_lord_and_service(vassal, get_vassal_lord(vassal), current_turn())
			logi(`Vassal ${data.vassals[vassal].name} moved to current turn`)

		}
	}
	end_immediate_event()
}

// === EVENT: LANCASTER FRENCH TROOPS ===

function goto_lancaster_event_french_troops() {
	let can_play = false
	for (let lord = first_friendly_lord; lord <= last_friendly_lord; lord++) {
		if (is_lord_on_map(lord) && data.seaports.includes(get_lord_locale(lord))) {
			can_play = true
		}
	}
	if (can_play) {
		game.state = "french_troops"
		game.who = NOBODY
		game.count = 0
	} else {
		end_immediate_event()
	}
}

function end_lancaster_event_french_troops() {
	game.who = NOBODY
	game.count = 0
	end_immediate_event()
}

states.french_troops = {
	inactive: "French Troops",
	prompt() {

		view.prompt = `Add 2 Men at Arms and 2 Militia to a Lord at a port.`
		if (game.who === NOBODY) {
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; lord++) {
				if (is_lord_on_map(lord) && is_seaport(get_lord_locale(lord))) {
					gen_action_lord(lord)
				}
			}
		} else {
			view.prompt = `Add ${2-pack2_get(game.count, 0)} Men at Arms and ${2-pack2_get(game.count, 1)} Militia to ${lord_name[game.who]}.`
			if (pack2_get(game.count, 0) < 2)
				view.actions.add_men_at_arms = 1
			if (pack2_get(game.count, 1) < 2)
				view.actions.add_militia = 1
		}

		view.actions.done = 1
	},
	add_men_at_arms() {
		push_undo()
		add_lord_forces(game.who, MEN_AT_ARMS, 1)
		let c = pack2_get(game.count, 0)
		game.count = pack2_set(game.count, 0, c+1)
	},
	add_militia() {
		push_undo()
		add_lord_forces(game.who, MILITIA, 1)
		let c = pack2_get(game.count, 1)
		game.count = pack2_set(game.count, 1, c+1)
	},
	lord(lord) {
		push_undo()
		game.who = lord
	},
	done() {
		end_lancaster_event_french_troops()
	}
}

// === EVENT: WARWICKS PROPAGANDA ===

function add_propaganda_target(loc) {
	set_add(game.event_data, loc)
}

function remove_propaganda_target(loc) {
	set_delete(game.event_data, loc)
}

function is_propaganda_target(loc) {
	return set_has(game.event_data, loc)
}

function goto_warwicks_propaganda() {
	let can_play = false
	for (let loc = first_locale; loc <= last_locale; ++loc) {
		if (has_favoury_marker(loc)) {
			can_play = true
		}
	}

	if (can_play) {
		game.state = "warwicks_propaganda"
		game.event_data = []
		game.where = NOWHERE
		game.count = 0
	} else {
		end_immediate_event()
	}
}

states.warwicks_propaganda = {
	inactive: "Warwick's Propaganda",
	prompt() {
		view.prompt = `Select up to ${3-game.count} Yorkists Locales.`
		for (let loc = first_locale; loc <= last_locale; loc++) {
			if (game.count < 3 && has_favoury_marker(loc) && !is_exile(loc) && !is_propaganda_target(loc)) {
				gen_action_locale(loc)
			}
		}
		view.actions.done = 1
	},
	locale(loc) {
		push_undo()
		add_propaganda_target(loc)
		game.count++
	},
	done() {
		goto_yorkist_choice()
	}
}

function goto_yorkist_choice() {
	game.where = NOBODY
	set_active_enemy()
	game.state = "warwicks_propaganda_yorkist_choice"
}

states.warwicks_propaganda_yorkist_choice = {
	inactive: "Yorkists to choose to Pay or Remove favour",
	prompt() {
		view.prompt = `For each Stronghold, Pay 2 influence or Remove favour.`
		let done = true
		if (game.where === NOBODY) {
			for (let loc = first_locale; loc <= last_locale; loc++) {
				if (is_propaganda_target(loc)) {
					gen_action_locale(loc)
					done = false
				}
			}
			if (done) {
				view.actions.done = 1
			}
		} else {
			view.actions.remove_favour = 1
			view.actions.pay = 1
		}
	},
	locale(loc) {
		game.where = loc
	},
	remove_favour() {
		push_undo()
		remove_favoury_marker(game.where)
		remove_propaganda_target(game.where)
		logi(`Removed favour in ${game.where}`)
		game.where = NOBODY
	},
	pay() {
		push_undo()
		reduce_influence(2)
		logi(`Paid 2 to keep ${game.where}`)
		remove_propaganda_target(game.where)
		game.where = NOWHERE
	},
	done() {
		end_warwicks_propaganda()
	},
}

function end_warwicks_propaganda() {
	game.event_data = 0
	game.where = NOWHERE
	game.count = 0
	set_active_enemy()
	end_immediate_event()
}

// === EVENT: WELSH REBELLION ===

function goto_lancaster_event_welsh_rebellion() {
	let can_play_remove_troops = false
	let can_play_remove_favour = false
	for (let lord = first_york_lord; lord <= last_york_lord; ++lord) {
		if (is_lord_on_map(lord) && is_lord_in_wales(lord)) {
			set_lord_moved(lord, 1)
			can_play_remove_troops = true
		}
	}
	for (let loc = first_locale; loc <= last_locale; loc++) {
		if (is_wales(loc) && has_favoury_marker(loc))
			can_play_remove_favour = true
	}

	if (can_play_remove_troops) {
		push_state("welsh_rebellion_remove_troops")
		game.who = NOBODY
		game.count = 0
	}
	else if (can_play_remove_favour) {
		push_state("welsh_rebellion_remove_favour")
		game.who = NOBODY
		game.count = 0
	}
	else {
		end_immediate_event()
	}
}

states.welsh_rebellion_remove_troops = {
	inactive: "Welsh Rebellion \u2014 Remove troops",
	prompt() {
		view.prompt = `Remove 2 Troops from each enemy Lord in Wales.`
		let done = true
		if (game.who === NOBODY) {
			for (let lord = first_enemy_lord; lord <= last_enemy_lord; lord++) {
				if (is_lord_on_map(lord) && is_lord_in_wales(lord) && get_lord_moved(lord)) {
					gen_action_lord(lord)
					done = false
				}
			}
			if (done) {
				view.actions.done = 1
			}
		}
		else if (game.who !== NOBODY) {
			if (game.count >= 0) {
				view.prompt = `Remove ${game.count} Troops from ${data.lords[game.who].name}.`
				if (game.count === 0) {
					set_lord_moved(game.who, 0)
					view.actions.done = 1
				}
				else {
					if (get_lord_forces(game.who, BURGUNDIANS) > 0)
						gen_action_burgundians(game.who)
					if (get_lord_forces(game.who, MERCENARIES) > 0)
						gen_action_mercenaries(game.who)
					if (get_lord_forces(game.who, LONGBOWMEN) > 0)
						gen_action_longbowmen(game.who)
					if (get_lord_forces(game.who, MEN_AT_ARMS) > 0)
						gen_action_men_at_arms(game.who)
					if (get_lord_forces(game.who, MILITIA) > 0)
						gen_action_militia(game.who)
				}
			}
		}
	},
	lord(lord) {
		push_undo()
		game.who = lord
		game.count = 2
	},
	burgundians(lord) {
		add_lord_forces(lord, BURGUNDIANS, -1)
		game.count--
	},
	mercenaries(lord) {
		add_lord_forces(lord, MERCENARIES, -1)
		game.count--
	},
	longbowmen(lord) {
		add_lord_forces(lord, LONGBOWMEN, -1)
		game.count--
	},
	men_at_arms(lord) {
		add_lord_forces(lord, MEN_AT_ARMS, -1)
		game.count--
	},
	militia(lord) {
		add_lord_forces(lord, MILITIA, -1)
		game.count--
	},
	done() {
		end_welsh_rebellion()
	},
}

states.welsh_rebellion_remove_favour = {
	inactive: "Welsh Rebellion \u2014 Remove Favour",
	prompt() {
		view.prompt = `Select up to ${2-game.count} Locales in Wales.`
		for (let loc = first_locale; loc <= last_locale; loc++) {
			if (game.count < 2 && is_wales(loc) && has_favoury_marker(loc)) {
				gen_action_locale(loc)
			}
		}
		view.actions.done = 1
	},
	locale(loc) {
		push_undo()
		remove_favoury_marker(loc)
		logi(`Removed favour at ${data.locales[loc].name}`)
		game.count++
	},
	done() {
		end_immediate_event()
	},
}

function end_welsh_rebellion() {
	for (let lord = first_york_lord; lord <= last_york_lord; ++lord) {
		if (is_lord_on_map(lord) && is_lord_in_wales(lord) && !lord_has_unrouted_units(lord))
			disband_lord(lord, false)
	}
	game.count = 0
	game.who = NOBODY
	end_immediate_event()
}

// === EVENT: HENRY RELEASED ===

function goto_lancaster_event_henry_released() {
	if (has_favourl_marker(LOC_LONDON)) {
		logi(`Henry Released : 5 Influence for Lancaster`)
		increase_lancaster_influence(5)
	}
	end_immediate_event()
}

// === EVENT: L'UNIVERSELLE ARAGNE ===

function goto_lancaster_event_luniverselle_aragne() {
	let can_play = false
	for (let vassal = first_vassal; vassal <= last_vassal; vassal++) {
		if (is_vassal_mustered_with_york_lord(vassal)) {
			can_play = true
		}
	}
	if (can_play) {
		game.state = "aragne_1"
		game.event_data = []
	} else {
		logi("No Effect")
		end_immediate_event()
	}
}

states.aragne_1 = {
	inactive: "L'universelle Aragne",
	prompt() {
		view.prompt = "Select up to 2 Vassals"
		if (game.event_data.length < 2) {
			for (let v = first_vassal; v <= last_vassal; v++) {
				if (!set_has(game.event_data, v) && is_vassal_mustered_with_york_lord(v)) {
					gen_action_vassal(v)
				}
			}
		}
		view.actions.done = 1
	},
	vassal(v) {
		push_undo()
		set_add(game.event_data, v)
		logi(`Vassal ${data.vassals[v].name} selected`)
	},
	done() {
		push_undo()
		goto_yorkist_aragne()
	},
}

function goto_yorkist_aragne() {
	set_active_enemy()
	game.state = "aragne_2"
}

states.aragne_2 = {
	inactive: "Influence checks",
	prompt() {
		view.prompt = `For Each vassal, influence check : failure disbands it`
		let done = true
		for (let v of game.event_data) {
			gen_action_vassal(v)
			done = false
		}
		if (done)
			view.actions.done = 1
	},
	vassal(other) {
		push_undo()
		game.who = other
		init_influence_check(get_vassal_lord(other))
		game.check.push({
			cost: 0,
			modifier: data.vassals[other].influence * (game.active === LANCASTER ? -1 : 1),
			source: "vassal",
		})
		game.state = "aragne_3"
	},
	done() {
		end_universelle_aragne()
	},
}

states.aragne_3 = {
	inactive: `Influence check`,
	prompt() {
		view.prompt = `Influence check : Failure disbands ${data.vassals[game.who].name}`
		prompt_influence_check()
	},
	spend1: add_influence_check_modifier_1,
	spend3: add_influence_check_modifier_2,
	check() {
		let results = do_influence_check()
		logi(`Attempt to save ${data.vassals[game.who].name} ${results.success ? "Successful" : "Failed"}: (${range(results.rating)}) ${results.success ? HIT[results.roll] : MISS[results.roll]}`)

		if (!results.success) {
			disband_vassal(game.who)
		}

		end_influence_check()

		set_delete(game.event_data, game.who)
		game.who = NOBODY
		game.state = "aragne_2"
	},
}

function end_universelle_aragne() {
	game.who = NOBODY
	game.event_data = 0
	end_immediate_event()
}

// === EVENT: TO WILFUL DISOBEDIANCE ===

function goto_lancaster_event_to_wilful_disobediance() {
	let can_play = false
	for (let loc = first_locale; loc <= last_locale; loc++){
		if (has_favoury_marker(loc) && !has_enemy_lord(loc) && !has_adjacent_enemy(loc) && (has_friendly_lord(loc) || has_adjacent_friendly(loc))) {
			can_play = true
		}
	}
	if (can_play) {
		game.state = "wilful_disobediance"
		game.who = NOBODY
		game.count = 0
	} else {
		end_immediate_event()
		logi(`No Effect`)
	}

}
states.wilful_disobediance = {
	inactive: "to wilful disobediance",
	prompt() {
		view.prompt = `Select up to ${2-game.count} Yorkists Locales.`
		for (let loc = first_locale; loc <= last_locale; loc++) {
			if (
				game.count < 2 &&
				has_favoury_marker(loc) &&
				!has_enemy_lord(loc) &&
				!has_adjacent_enemy(loc) &&
				(has_friendly_lord(loc) || has_adjacent_friendly(loc))
			) {
				gen_action_locale(loc)
			}
		}
		view.actions.done = 1
	},
	locale(loc) {
		push_undo()
		remove_favoury_marker(loc)
		game.count++
		logi(`Favour removed at ${loc}`)
	},
	done() {
		logi(`No Effect`)
		end_immediate_event()
	}
}

// === EVENT: FRENCH WAR LOANS ===

function goto_lancaster_event_french_war_loans() {
	for (let lord = first_lancaster_lord; lord <= last_lancaster_lord; ++lord) {
		if (is_lord_on_map(lord) && !is_lord_on_calendar(lord)) {
			add_lord_assets(lord, PROV, 1)
			add_lord_assets(lord, COIN, 1)
			logi(`1 Coin and 1 Provender added to ${data.lords[lord].name}`)
		}
	}
	end_immediate_event()
}

// === EVENT: ROBINS REBELLION ===

function goto_lancaster_event_robins_rebellion() {
	let can_play = false
	for (let loc = first_locale; loc <= last_locale; loc++) {
		if (is_north(loc) && !has_favourl_marker(loc)) {
			can_play = true
		}
	}
	if (can_play) {
		game.state = "robins_rebellion"
		game.who = NOBODY
		game.count = 0
	} else {
		logi(`No Effect`)
		end_immediate_event()
	}
}

states.robins_rebellion = {
	inactive: "Robin's Rebellion",
	prompt() {
		view.prompt = `Select up to ${3-game.count} Locales in North.`
		for (let loc = first_locale; loc <= last_locale; loc++) {
			if (game.count < 3 && is_north(loc) && !has_favourl_marker(loc)) {
				gen_action_locale(loc)
			}
		}
		view.actions.done = 1
	},
	locale(loc) {
		push_undo()
		shift_favour_toward(loc)
		logi(`Placed/Removed favour at ${data.locales[loc].name}`)
		game.count++
	},
	done() {
		end_immediate_event()
	}
}

// === EVENT: TUDOR BANNERS ===

function tudor_banner_eligible() {
	if (is_lord_on_map(LORD_HENRY_TUDOR) && !is_lord_on_calendar(LORD_HENRY_TUDOR)) {
		for (let next of data.locales[get_lord_locale(LORD_HENRY_TUDOR)].adjacent) {
			if (can_parley_at(next))
				return true
		}
	}
	return false
}

function goto_lancaster_event_tudor_banners() {
	if (tudor_banner_eligible()) {
		game.state = "tudor_banners"
		game.who = NOBODY
	} else {
		logi(`No Effect`)
		end_immediate_event()
	}
}

states.tudor_banners = {
	inactive: "Tudor banners",
	prompt() {
		view.prompt = `Select locales adjacent to Henry to make them Lancastrian`
		let done = true
		for (let next of data.locales[get_lord_locale(LORD_HENRY_TUDOR)].adjacent) {
			if (!has_enemy_lord(next) && !has_favourl_marker(next)) {
				gen_action_locale(next)
				done = false
			}
		}
		if (done)
			view.actions.done = 1
	},
	locale(loc) {
		push_undo()
		remove_favoury_marker(loc)
		add_favourl_marker(loc)
		logi(`Placed Lancastrian favour at ${data.locales[loc].name}`)
	},
	done() {
		end_immediate_event()
	}
}

// === EVENT: TAX COLLECTORS ===

function goto_york_event_tax_collectors() {
	game.who = NOBODY
	game.count = 0
	for (let lord = first_york_lord; lord <= last_york_lord; ++lord) {
		if (is_lord_on_map(lord) && !is_lord_on_calendar(lord)) {
			set_lord_moved(lord, 1)
		}
	}
	push_state("tax_collectors")
}

function can_action_tax_collectors(lord) {
	let here = get_lord_locale(lord)
	if (can_tax_collectors_at(here, lord))
		return true
	return search_tax_collectors(false, here, lord)
}

function can_tax_collectors_at(here, lord) {
	if (is_friendly_locale(here) && !has_exhausted_marker(here)) {
		// London, Calais, and Harlech
		if (here === LOC_LONDON || here === LOC_CALAIS || here === LOC_HARLECH)
			return true

		// Own seat
		if (here === data.lords[lord].seat)
			return true

		// vassal seats
		for (let vassal = first_vassal; vassal <= last_vassal; ++vassal)
			if (is_vassal_mustered_with(vassal, lord))
				if (here === data.vassals[vassal].seat)
					return true
	}
	return false
}

function search_tax_collectors(result, start, lord) {
	let ships = get_shared_assets(start, SHIP)

	search_seen.fill(0)
	search_seen[start] = 1

	let queue = [ start ]
	while (queue.length > 0) {
		let here = queue.shift()

		if (is_lord_on_map(lord) && !is_lord_on_calendar(lord)) {
			if (can_tax_collectors_at(here, lord)) {
				if (result)
					set_add(result, here)
				else
					return true
			}
		}

		if (is_friendly_locale(here)) {
			for (let next of data.locales[here].adjacent) {
				if (!search_seen[next]) {
					search_seen[next] = 1
					queue.push(next)
				}
			}
			if (ships > 0 && is_seaport(here)) {
				for (let next of find_ports(here)) {
					if (!search_seen[next]) {
						search_seen[next] = 1
						queue.push(next)
					}
				}
			}
		}
	}

	if (result)
		return result
	else
		return false
}

states.tax_collectors = {
	inactive: "Tax Collectors",
	prompt() {
		view.prompt = "Tax Collectors : You may tax for Double coin with each lord"
		for (let lord = first_york_lord; lord <= last_york_lord; ++lord) {
			if (can_action_tax_collectors(lord) && get_lord_moved(lord)) {
				gen_action_lord(lord)
			}
		}
		view.actions.done = 1
	},
	lord(lord) {
		push_undo()
		game.where = NOWHERE
		game.who = lord
		push_state("double_tax_collectors")
		init_influence_check(lord)
	},
	done() {
		end_tax_collectors()
	},
}

states.double_tax_collectors = {
	inactive: "Tax Collectors",
	prompt() {
		view.prompt = "Tax: Select the location to tax for double."
		if (game.where === NOWHERE) {
			for (let loc of search_tax_collectors([], get_lord_locale(game.who), game.who))
				gen_action_locale(loc)
		} else {
			view.prompt = `Tax: Attempting to tax ${data.locales[game.where].name}. `
			prompt_influence_check()
		}
	},
	locale(loc) {
		game.where = loc
		if (loc === data.lords[game.who].seat) {
			// Auto succeed without influence check at Lords seat.
			deplete_locale(game.where)

			log(`Taxed %${game.where}.`)
			add_lord_assets(game.who, COIN, get_tax_amount(game.where)*2)
			set_lord_moved(game.who, 0)
			end_tax_lord()
		}
	},
	spend1: add_influence_check_modifier_1,
	spend3: add_influence_check_modifier_2,
	check() {
		let results = do_influence_check()
		logi(`Tax : ${results.success ? "Successful" : "Failed"}: (${range(results.rating)}) ${results.success ? HIT[results.roll] : MISS[results.roll]}`)

		if (lord_has_capability(game.who, AOW_YORK_SO_WISE_SO_YOUNG)) {
			log(`C${AOW_YORK_SO_WISE_SO_YOUNG}.`)
			add_lord_assets(game.who, COIN, 1)
		}

		if (results.success) {
			deplete_locale(game.where)
			log(`Taxed %${game.where}.`)
			add_lord_assets(game.who, COIN, get_tax_amount(game.where)*2)

			if (
				game.command === LORD_DEVON &&
				(game.where === LOC_EXETER ||
					game.where === LOC_LAUNCESTON ||
					game.where === LOC_PLYMOUTH ||
					game.where === LOC_WELLS ||
					game.where === LOC_DORCHESTER)
			)
				add_lord_assets(game.command, COIN, 4)
		} else {
			log(`Tax of %${game.where} failed.`)

		}
		set_lord_moved(game.who, 0)
		game.who = NOBODY
		push_state("tax_collectors")
	},
}

function end_tax_lord() {
	game.where = NOWHERE
	game.who = NOBODY
	pop_state()
}

function end_tax_collectors() {
	game.where = NOWHERE
	game.who = NOBODY
	game.count = 0
	end_immediate_event()
}

// === EVENT: LONDON FOR YORK ===

function goto_york_event_london_for_york() {
	let can_play = false
	if (has_favoury_marker(LOC_LONDON)) {
		can_play = true
	}
	if (can_play) {
		game.who = NOBODY
		game.state = "london_for_york"
	} else {
		logi(`No Effect`)
		end_immediate_event()
	}
}

states.london_for_york = {
	inactive: "London For York",
	prompt() {
		view.prompt = `Select London to add a second favour marker`
		gen_action_locale(LOC_LONDON)
	},
	locale(loc) {
		push_undo()
		game.flags.london_for_york = 1
		logi(`Second marker placed at ${data.locales[loc].name}`)
		logi(`Immune to Lancastrian parley unless aided by event`)
		end_immediate_event()
	},
}

// === EVENT: SHE-WOLF OF FRANCE ===

function goto_york_event_shewolf_of_france() {
	let can_play = false
	for (let v = first_vassal; v <= last_vassal; v++) {
		if (is_vassal_mustered_with_friendly_lord(v)) {
			can_play = true
		}
	}
	if (can_play) {
		game.state = "she_wolf"
		game.event_data = []
		game.who = NOBODY
	} else {
		logi(`No Effect`)
		end_immediate_event()
	}
}

states.she_wolf = {
	inactive: "She-Wolf of France",
	prompt() {
		view.prompt = "Shift each Yorkist Vassal's Calendar marker 1 box right."
		let done = true
		for (let v = first_vassal; v <= last_vassal; v++) {
			if (!set_has(game.event_data, v) && is_vassal_mustered_with_friendly_lord(v)) {
				gen_action_vassal(v)
				done = false
			}
		}
		if (done)
			view.actions.done = 1
	},
	vassal(v) {
		push_undo()
		if (current_turn() < 16)
			set_vassal_lord_and_service(v, get_vassal_lord(v), get_vassal_service(v) + 1)
		set_add(game.event_data, v)
		logi(`Vassal ${data.vassals[v].name} shifted one calendar box`)
	},
	done() {
		game.event_data = 0
		end_immediate_event()
	},
}

// === EVENT: RICHARD LEIGH ===

function goto_york_event_sir_richard_leigh() {
	let can_play = false
	if (!has_favoury_marker(LOC_LONDON)) {
		can_play = true
	}
	if (can_play) {
		game.state = "richard_leigh"
		game.who = LOC_LONDON
		game.count = 0
	} else {
		logi(`No Effect`)
		end_immediate_event()
	}
}

states.richard_leigh = {
	inactive: "Richard Leigh",
	prompt() {
		view.prompt = `Select London, shift it once in your favour`
		if (game.who === LOC_LONDON && !has_favoury_marker(LOC_LONDON)) {
			gen_action_locale(LOC_LONDON)
		} else {
			view.actions.done = 1
		}
	},
	locale(loc) {
		push_undo()
		shift_favour_toward(loc)
		logi(`London shifted once in your favour`)
		game.who = NOBODY
	},
	done() {
		end_immediate_event()
	}
}

// === EVENT: CHARLES THE BOLD ===

function goto_york_event_charles_the_bold() {
	for (let lord = first_york_lord; lord <= last_york_lord; ++lord) {
		if (is_lord_on_map(lord) && !is_lord_on_calendar(lord)) {
			add_lord_assets(lord, PROV, 1)
			add_lord_assets(lord, COIN, 1)
			logi(`1 Coin and 1 Provender added to ${data.lords[lord].name}`)
		}
	}
	end_immediate_event()
}

// === EVENT: DUBIOUS CLARENCE ===

function goto_dubious_clarence() {
	let can_play = false
	if ((is_lord_on_map(LORD_EDWARD_IV) && !is_lord_on_calendar(LORD_EDWARD_IV))
	&& is_lord_on_map(LORD_CLARENCE) && !is_lord_on_calendar(LORD_CLARENCE))
		can_play = true

	if (can_play) {
		game.state = "dubious_clarence"
		game.who = LORD_EDWARD_IV
		init_influence_check(LORD_EDWARD_IV)
	} else {
		logi(`No Effect`)
		end_immediate_event()
	}
}

states.dubious_clarence = {
	inactive: "Dubious Clarence",
	prompt() {
		view.prompt = `You may Influence check with Edward to disband Clarence `
		prompt_influence_check()
	},
	spend1: add_influence_check_modifier_1,
	spend3: add_influence_check_modifier_2,
	check() {
		let results = do_influence_check()
		log(`Attempt to disband Clarence ${results.success ? "Successful" : "Failed"}: (${range(results.rating)}) ${results.success ? HIT[results.roll] : MISS[results.roll]}`)

		if (results.success) {
			disband_lord(LORD_CLARENCE, false)
			end_immediate_event()
		} else {
			end_immediate_event()
		}
	},
}

// === EVENT: YORKIST NORTH ===

function goto_york_event_yorkist_north() {
	let influence_gained = 0
	for (let lord = first_york_lord; lord <= last_york_lord; ++lord) {
		if (is_lord_on_map(lord) && !is_lord_on_calendar(lord) && is_lord_in_north(lord))
			influence_gained++
	}
	for (let loc = first_locale; loc <= last_locale; loc++) {
		if (loc !== NOWHERE && loc < CALENDAR && has_favoury_marker(loc) && is_north(loc)) {
			influence_gained++
		}
	}
	logi(`Yorkist North : ${influence_gained} Influence for Yorkists`)
	increase_york_influence(influence_gained)
	end_immediate_event()
}

// === EVENT: EARL RIVERS ===

function goto_york_event_earl_rivers() {
	game.state = "earl_rivers"
	game.count = []
	game.who = NOBODY
}

function end_york_event_earl_rivers() {
	game.count = 0
	game.who = NOBODY
	end_immediate_event()
}

states.earl_rivers = {
	inactive: "Earl Rivers",
	prompt() {
		view.prompt = "Earl Rivers: Add up to 2 Militia to each lord"
		view.actions.done = 1
		for (let lord = first_york_lord; lord <= last_york_lord; lord++) {
			if (is_lord_on_map(lord) && map_get(game.count, lord, 0) < 3) {
				gen_action_lord(lord)
			}
		}

		if (game.who !== NOBODY) {
			let troops = map_get(game.count, game.who, 0)
			if ((troops & 1) === 0)
				view.actions.add_militia = 1
		}
		if (game.who !== NOBODY) {
			let troops = map_get(game.count, game.who, 0)
			if ((troops & 1) === 0)
				view.actions.add_militia2 = 1
		}
	},
	done() {
		end_york_event_earl_rivers()
	},
	add_militia() {
		push_undo()
		add_lord_forces(game.who, MILITIA, 1)
		let troops = map_get(game.count, game.who, 0)
		map_set(game.count, game.who, troops + 1)
		if (troops > 1)
			game.who = NOBODY
	},
	add_militia2() {
		push_undo()
		add_lord_forces(game.who, MILITIA, 2)
		let troops = map_get(game.count, game.who, 0)
		map_set(game.count, game.who, troops + 1)
		if (troops > 1)
			game.who = NOBODY
	},
	lord(lord) {
		push_undo()
		game.who = lord
	}
}

// === EVENT (AS LEVY EFFECT): THE KINGS NAME ===

function eligible_kings_name() {
	if (
		(!is_lord_on_calendar(LORD_GLOUCESTER_1) && is_lord_on_map(LORD_GLOUCESTER_1)) ||
		(!is_lord_on_calendar(LORD_GLOUCESTER_2) && is_lord_on_map(LORD_GLOUCESTER_2))
	) {
		if (is_event_in_play(EVENT_YORK_THE_KINGS_NAME) && game.active === LANCASTER)
			return true
	}
	return false
}

function goto_kings_name(action) {
	game.what = action
	set_active_enemy()
	push_state("kings_name")
}

states.kings_name = {
	inactive: `King's name`,
	prompt() {
		view.prompt = `King's Name: You pay may 1 Influence to cancel last ${game.what} action`
		view.actions.pass = 1
		view.actions.pay = 1
	},
	pay() {
		push_undo()
		reduce_influence(1)
		goto_kings_name_cancel()
	},
	pass() {
		set_active_enemy()
		pop_state()
		if (game.state === "levy_muster_lord_attempt") {
			push_state("muster_lord_at_seat")
		}
		if (game.state === "levy_muster_vassal") {
			muster_vassal(game.which, game.who)
			pop_state()
		}
		if (game.state === "muster_capability") {
			add_lord_capability(game.who, game.which)
			capability_muster_effects(game.who, game.which)
			pop_state()
		}
		if (game.state === "parley") {
			game.what = NOTHING
			game.where = NOWHERE
			pop_state()
		}
		resume_levy_muster_lord()
	}
}

function goto_kings_name_cancel() {
	switch(game.what) {
		case "Levy Lord":
			pop_state()
			end_levy_muster_lord_attempt()
			break
		case "Levy Cart":
			add_lord_assets(game.who, CART, -2)
			pop_state()
			resume_levy_muster_lord()
			break
		case "Levy Ship":
			add_lord_assets(game.who, SHIP, -1)
			pop_state()
			resume_levy_muster_lord()
			break
		case "Levy Vassal":
			game.which = NOTHING
			end_levy_muster_vassal()
			break
		case "Levy Troops":
			kings_name_reset_troops()
			pop_state()
			resume_levy_muster_lord()
			break
		case "Parley":
			shift_favour_toward_york(game.where)
			pop_state()
			game.where = NOWHERE
			end_parley()
			break
		case "Capability":
			game.which = NOTHING
			pop_state()
			pop_state()
			resume_levy_muster_lord()
			break
		case "Levy Beloved Warwick":
			add_lord_forces(game.who, MILITIA, -5)
			pop_state()
			resume_levy_muster_lord()
			break
		default:
			throw Error("No King's name cancel state found")
	}
	log(`${game.what} action cancelled`)
	logevent(`${EVENT_YORK_THE_KINGS_NAME}`)
	set_active_enemy()
}

function kings_name_reset_troops() {
	if (!lord_has_capability(game.who, AOW_LANCASTER_QUARTERMASTERS)) {
		remove_depleted_marker(get_lord_locale(game.who))
		remove_exhausted_marker(get_lord_locale(game.who))
	}

	let here = get_lord_locale(game.who)
	let here_type = data.locales[here].type
	switch (here_type) {
		case "calais":
			add_lord_forces(game.who, MEN_AT_ARMS, -2)
			add_lord_forces(game.who, LONGBOWMEN, -1)
			break
		case "london":
			add_lord_forces(game.who, MEN_AT_ARMS, -1)
			add_lord_forces(game.who, LONGBOWMEN, -1)
			add_lord_forces(game.who, MILITIA, -1)
			break
		case "harlech":
			add_lord_forces(game.who, MEN_AT_ARMS, -1)
			add_lord_forces(game.who, LONGBOWMEN, -2)
			break
		case "city":
			add_lord_forces(game.who, LONGBOWMEN, -1)
			add_lord_forces(game.who, MILITIA, -1)
			break
		case "town":
			add_lord_forces(game.who, MILITIA, -2)
			break
		case "fortress":
			add_lord_forces(game.who, MEN_AT_ARMS, -1)
			add_lord_forces(game.who, MILITIA, -1)
			break
	}
}

// === EVENT (AS LEVY EFFECT): RISING WAGES ===

function goto_rising_wages() {
	game.state = "rising_wages"
}

states.rising_wages = {
	inactive: "Rising Wages",
	prompt() {
		let here = get_lord_locale(game.who)
		view.prompt = "Rising Wages: Pay 1 extra coin to levy troops"
		for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
			let loc = get_lord_locale(lord)
			if (here === loc && (get_lord_assets(lord, COIN) > 0)) {
				gen_action_coin(lord)
			}
		}
	},
	coin(lord) {
		push_undo()
		add_lord_assets(lord, COIN, -1)
		logi(`${EVENT_LANCASTER_RISING_WAGES}`)
		log("York paid 1 Coin to Levy troops")

		do_levy_troops()
	},
}

// === EVENT (AS LEVY EFFECT): THE COMMONS ===

// each Levy Troops action ends with coming here

function goto_the_commons() {
	game.state = "the_commons"
	game.flags.commons_militia = 2
}

states.the_commons = {
	inactive: "The Commons",
	prompt() {
		view.prompt = `Add up to ${game.flags.commons_militia} Militias.`
		if (game.flags.commons_militia > 0)
			view.actions.add_militia = 1
		view.actions.done = 1
	},
	add_militia() {
		push_undo()
		add_lord_forces(game.who, MILITIA, 1)
		if (--game.flags.commons_militia === 0)
			end_the_commons()
	},
	done() {
		push_undo()
		end_the_commons()
	}
}

function end_the_commons() {
	game.flags.commons_militia = 0

	if (eligible_kings_name())
		goto_kings_name("Levy Troops")
	else
		resume_levy_muster_lord()
}

// === EVENT (AS LEVY EFFECT): JACK CADE ===

function is_york_dominating_north() {
	let dom = 0
	for (let loc of all_north_locales) {
		if (has_favoury_marker(loc)) {
			dom++
		}
	}
	if (dom > 5)
		return true
	return false
}

function is_york_dominating_south() {
	let dom = 0
	for (let loc of all_south_locales) {
		if (has_favoury_marker(loc)) {
			dom++
		}
	}
	if (dom > 9)
		return true
	if (dom > 4
		&& (lord_has_capability(LORD_MARCH, AOW_YORK_SOUTHERNERS)
		|| lord_has_capability(LORD_RUTLAND, AOW_YORK_SOUTHERNERS)
		|| lord_has_capability(LORD_YORK, AOW_YORK_SOUTHERNERS)))
		return true
	return false
}

function is_york_dominating_wales() {
	let dom = 0
	for (let loc of all_wales_locales) {
		if (has_favoury_marker(loc)) {
			dom++
		}
	}
	if (dom > 5)
		return true
	if (dom > 2
		&& (lord_has_capability(LORD_MARCH, AOW_YORK_WELSHMEN)
		|| lord_has_capability(LORD_YORK, AOW_YORK_WELSHMEN)))
		return true
	return false
}

function is_jack_cade_eligible(lord) {
	if (!is_event_in_play(EVENT_YORK_JACK_CADE))
		return false
	if (is_lord_in_or_adjacent_to_south(lord) && is_york_dominating_south())
		return true
	if (is_lord_in_or_adjacent_to_north(lord) && is_york_dominating_north())
		return true
	if (is_lord_in_or_adjacent_to_wales(lord) && is_york_dominating_wales())
		return true
	return false
}

// === EVENT (AS ACTION): EXILE PACT ===

function can_action_exile_pact() {
	return game.actions > 0 && is_event_in_play(EVENT_YORK_EXILE_PACT)
}

function goto_exile_pact() {
	push_undo()
	game.state = "exile_pact"
}

states.exile_pact = {
	inactive: "Exile Pact",
	prompt() {
		view.prompt = "Exile Pact: Place your cylinder in a Friendly Exile box."
		for (let loc of data.exile_boxes) {
			if (has_favour_in_locale(game.active, loc))
				gen_action_locale(loc)
		}
	},
	locale(loc) {
		push_undo()
		set_lord_locale(game.command, loc)
		end_exile_pact()
	}
}

function end_exile_pact() {
	spend_action(1)
	push_undo()
	resume_command()
}

// === EVENTS: HELD ===

function play_held_event(c) {
	log(`Played E${c}.`)
	if (c >= first_york_card && c <= last_york_card)
		set_delete(game.hand_y, c)
	else
		set_delete(game.hand_l, c)

	/* Hold events with This Levy/Campaign */
	if (
		c === EVENT_YORK_YORKIST_PARADE ||
		c === EVENT_YORK_PARLIAMENTS_TRUCE ||
		c === EVENT_LANCASTER_PARLIAMENTS_TRUCE
	) {
		set_add(game.events, c)
	}
}

function prompt_held_event() {
	for (let c of current_hand())
		if (can_play_held_event(c))
			gen_action_card(c)
}

function can_play_held_event(c) {
	switch (c) {
		case EVENT_LANCASTER_ASPIELLES:
			return can_play_l_aspielles()
		case EVENT_LANCASTER_REBEL_SUPPLY_DEPOT:
			return can_play_rebel_supply_depot()
		case EVENT_LANCASTER_SURPRISE_LANDING:
			return can_play_surprise_landing()
		case EVENT_LANCASTER_PARLIAMENTS_TRUCE:
			return can_play_parliaments_truce()
		case EVENT_YORK_PARLIAMENTS_TRUCE:
			return can_play_parliaments_truce()
		case EVENT_YORK_ASPIELLES:
			return can_play_y_aspielles()
		case EVENT_YORK_YORKIST_PARADE:
			return can_play_yorkist_parade()
		case EVENT_YORK_SUN_IN_SPLENDOUR:
			return can_play_sun_in_splendour()
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
		// Play upon Death Check
		case EVENT_YORK_ESCAPE_SHIP:
		case EVENT_LANCASTER_ESCAPE_SHIP:
			goto_play_escape_ship()
			break
		case EVENT_LANCASTER_TALBOT_TO_THE_RESCUE:
			goto_play_talbot_to_the_rescue()
			break
		case EVENT_LANCASTER_WARDEN_OF_THE_MARCHES:
			goto_play_warden_of_the_marches()
			break

		// Play in Levy
		case EVENT_YORK_SUN_IN_SPLENDOUR:
			goto_play_sun_in_splendour()
			break
		case EVENT_YORK_YORKIST_PARADE:
			goto_play_yorkist_parade()
			break

		// Play any time
		case EVENT_YORK_ASPIELLES:
		case EVENT_LANCASTER_ASPIELLES:
			goto_play_aspielles()
			break

		// Play after march/sail to seaport
		case EVENT_LANCASTER_REBEL_SUPPLY_DEPOT:
			goto_play_rebel_supply_depot()
			break

		// Play after sail to seaport
		case EVENT_LANCASTER_SURPRISE_LANDING:
			goto_play_surprise_landing()
			break
	}
}

// === HELD EVENT (LEVY): YORKIST PARADE ===

function can_play_yorkist_parade() {
	if (is_levy_phase()) {
		if (is_favour_friendly(LOC_LONDON) && (get_lord_locale(LORD_WARWICK_Y) === LOC_LONDON || get_lord_locale(LORD_YORK) === LOC_LONDON))
			return true
	}
	return false
}

function goto_play_yorkist_parade() {
	// no effect
}

// === HELD EVENT (LEVY): SUN IN SPLENDOUR ===

function can_play_sun_in_splendour() {
	if (is_levy_phase())
		return is_lord_on_calendar(LORD_EDWARD_IV)
	return false
}

function goto_play_sun_in_splendour() {
	push_state("sun_in_splendour")
}

states.sun_in_splendour = {
	inactive: "Sun in Splendour",
	prompt() {
		view.prompt = "Sun in Splendour: Muster Edward IV in any friendly locale with no enemy lord"
		// ... TODO: or a scenario-designated Yorkist Exile box
		for (let loc = first_locale; loc <= last_locale; loc++)
			if (is_friendly_locale(loc))
				gen_action_locale(loc)
	},
	locale(loc) {
		push_undo()
		muster_lord(LORD_EDWARD_IV, loc)
		// TODO: remove_lord_from_exile(LORD_EDWARD_IV) ?
		// TODO: muster to exile box ?
		logi(`Mustered Edward IV at ${data.locales[loc].name}`)

		pop_state()
		game.what = NOTHING
	},
}

// === HELD EVENT: ASPIELLES ===

function can_play_l_aspielles() {
	return game.hand_y.length > 0 || game.hidden
}

function can_play_y_aspielles() {
	return game.hand_l.length > 0 || game.hidden
}

function goto_play_aspielles() {
	push_state("aspielles")
	game.who = NOBODY
	if (game.active === YORK)
		log("Lancaster hand shown to the York player")
	if (game.active === LANCASTER)
		log("York hand shown to the Lancaster player")
}

states.aspielles = {
	inactive: "Aspielles",
	prompt() {
		view.prompt = "Aspielles: You may see enemy held cards"
		if (game.hidden) {
			view.prompt += " and an enemy lord to see his mat"
			if (game.who === NOBODY) {
				for (let lord = first_enemy_lord; lord <= last_enemy_lord; ++lord)
					gen_action_lord(lord)
			} else {
				view.reveal |= (1 << game.who)
				view.actions.done = 1
			}
		} else {
			view.actions.done = 1
		}
		if (game.active === YORK)
			view.hand = game.hand_l
		if (game.active === LANCASTER)
			view.hand = game.hand_y
	},
	lord(lord) {
		log(`${lord_name[lord]} Spied`)
		game.who = lord
	},
	done() {
		pop_state()
		game.what = NOTHING
	},
}

// === HELD EVENT: REBEL SUPPLY DEPOT ===

function can_play_rebel_supply_depot() {
	if (game.flags.sail_to_port || game.flags.march_to_port)
		return true
	return false
}

function goto_play_rebel_supply_depot() {
	game.flags.supply_depot = 1
	add_spoils(PROV, 4)
	push_state("rebel_supply_depot")
}

states.rebel_supply_depot = {
	inactive: "Rebel Supply depot",
	prompt() {
		if (has_any_spoils()) {
			view.prompt = "Rebel Supply Depot: Divide " + list_spoils() + "."
			let here = get_lord_locale(game.command)
			for (let lord = first_friendly_lord; lord <= last_friendly_lord; ++lord) {
				if (get_lord_locale(lord) === here)
					prompt_select_lord(lord)
				if (game.who !== NOBODY)
					prompt_spoils()
			}
		} else {
			view.prompt = "Rebel Supply Depot: All done."
			view.actions.end_spoils = 1
		}
	},
	lord: action_select_lord,
	take_prov() {
		push_undo_without_who()
		take_spoils(PROV)
	},
	end_spoils() {
		push_undo_without_who()
		end_rebel_supply_depot()
	},
}

function end_rebel_supply_depot() {
	pop_state()
	game.what = NOTHING
	game.spoils = 0
}

// === HELD EVENT: SURPRISE LANDING ===

function can_play_surprise_landing() {
	let here = get_lord_locale(game.command)
	if (game.flags.sail_to_port) {
		if (here !== LOC_CALAIS && here !== LOC_PEMBROKE && here !== LOC_HARLECH && here !== LOC_LANCASTER)
			return true
	}
	return false
}

function goto_play_surprise_landing() {
	game.state = "surprise_landing"
	game.flags.surprise_landing = 2
	game.who = NOBODY
}

states.surprise_landing = {
	inactive: "Surprise Landing",
	prompt() {
		view.prompt = "Surprise Landing : You may march once (no path)."
		prompt_held_event()

		view.group = game.group
		let here = get_lord_locale(game.command)
		// 4.3.2 Marshals MAY take other lords
		if (
			is_marshal(game.command) ||
			(lord_has_capability(game.command, AOW_YORK_CAPTAIN) && !other_marshal_or_lieutenant(here))
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

		prompt_march()
	},
	lord(lord) {
		set_toggle(game.group, lord)
	},
	locale: goto_march,
	card: action_held_event,
}

// === LOGGING ===

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

// === VIEW & ACTION ===

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

		held_y: game.hand_y.length,
		held_l: game.hand_l.length,

		command: game.command,
		hand: null,
		plan: null,
	}

	if (!game.hidden)
		view.reveal = -1

	if (current === YORK) {
		view.hand = game.hand_y
		view.plan = game.plan_y
		if (game.hidden)
			view.reveal |= YORK_LORD_MASK
	}
	if (current === LANCASTER) {
		view.hand = game.hand_l
		view.plan = game.plan_l
		if (game.hidden)
			view.reveal |= LANCASTER_LORD_MASK
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

function gen_action(action, argument) {
	if (!(action in view.actions))
		view.actions[action] = []
	set_add(view.actions[action], argument)
}

function gen_action_card_if_held(c) {
	if (has_card_in_hand(c))
		gen_action_card(c)
}

function prompt_select_lord(lord) {
	if (lord !== game.who)
		gen_action_lord(lord)
}

function action_select_lord(lord) {
	if (game.who === lord)
		game.who = NOBODY
	else
		game.who = lord
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

function gen_action_vassal(vassal) {
	gen_action("vassal", vassal)
}

function gen_action_card(card_or_list) {
	if (Array.isArray(card_or_list))
		for (let c of card_or_list)
			gen_action("card", c)
	else
		gen_action("card", card_or_list)
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

// === UTILITY FUNCTIONS ===

function push_state(next) {
	if (!states[next])
		throw Error("No such state: " + next)
	game.stack.push([ game.state, game.who, game.count ])
	game.state = next
}

function pop_state() {
	[ game.state, game.who, game.count ] = game.stack.pop()
}

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

function roll_die() {
	clear_undo()
	return random(6) + 1
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

function map_get_pack4(map, lord, k) {
	return pack4_get(map_get(map, lord, 0), k)
}

function map_set_pack4(map, lord, k, v) {
	let val = pack4_set(map_get(map, lord, 0), k, v)
	if (val === 0)
		map_delete(map, lord)
	else
		map_set(map, lord, val)
}

function map2_get(map, x, y, v) {
	return map_get(map, (x << 1) + y, v)
}

function map2_set(map, x, y, v) {
	return map_set(map, (x << 1) + y, v)
}

function map2_delete(map, x, y) {
	return map_delete(map, (x << 1) + y)
}

function map_has_value(map, value) {
	for (let i = 1; i < map.length; i += 2)
		if (map[i] === value)
			return true
	return false
}

function map_clear(map) {
	map.length = 0
}

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

// === FUZZING ASSERTS ===

const mutually_exclusive_lords = [
	[LORD_EXETER_1, LORD_EXETER_2],
	[LORD_SOMERSET_1, LORD_SOMERSET_2],
	[LORD_JASPER_TUDOR_1, LORD_JASPER_TUDOR_2],
	[LORD_MARCH, LORD_EDWARD_IV],
	[LORD_GLOUCESTER_1, LORD_GLOUCESTER_2, LORD_RICHARD_III],
	[LORD_NORTHUMBERLAND_Y1, LORD_NORTHUMBERLAND_Y2, LORD_NORTHUMBERLAND_L],
	[LORD_WARWICK_Y, LORD_WARWICK_L],
	[LORD_YORK, LORD_EDWARD_IV, LORD_RICHARD_III],
	[LORD_HENRY_VI, LORD_MARGARET],
	[LORD_MARGARET, LORD_HENRY_TUDOR],
	[LORD_HENRY_VI, LORD_HENRY_TUDOR],
]

function assert_mutually_exclusive_lords() {
	for (const lords of mutually_exclusive_lords) {
		if (lords.filter(is_lord_in_play).length > 1) {
			const lord_names = lords.map(l => lord_name[l])
			throw Error(`ASSERT: Mutually exclusive Lords [${lord_names}] can't be all in play.`)
		}
	}
}

function assert_all_lords_have_troops_or_retinue() {
	for (let lord = first_york_lord; lord <= last_lancaster_lord; ++lord) {
		if (is_lord_on_map(lord) && !count_lord_all_forces(lord) && !get_lord_forces(lord, RETINUE))
			throw Error(`ASSERT: Lord "${lord_name[lord]}" without troops or retinue.`)
	}
}

function assert_all_lords_on_land() {
	for (let lord = first_york_lord; lord <= last_lancaster_lord; ++lord) {
		if (is_lord_at_sea(lord))
			throw Error(`ASSERT: Lord "${lord_name[lord]}" at sea during Levy phase.`)
	}
}

function assert_all_lords_without_routed_troops() {
	for (let lord = first_york_lord; lord <= last_lancaster_lord; ++lord) {
		if (lord_has_routed_troops(lord))
			throw Error(`ASSERT: Lord "${lord_name[lord]}" has routed troops during Levy phase.`)
	}
}

exports.assert_state = function (state) {
	load_state(state)

	// assert_mutually_exclusive_lords()
	if (game.state === "feed")
		assert_all_lords_have_troops_or_retinue()

	if (is_levy_phase()) {
		assert_all_lords_on_land()
		assert_all_lords_without_routed_troops()
	}
}

let log_sanity = []
exports.fuzz_log = function (fuzz_info) {
	console.log(`${fuzz_info.state.state} - ${fuzz_info.actions} - - ${fuzz_info.args} [${fuzz_info.chosen_action}, ${fuzz_info.chosen_arg}]`)

	log_sanity.push(fuzz_info.state.state)
	if (log_sanity.length > 200) {
		log_sanity = log_sanity.slice(1)

		if (false)
			if (log_sanity.every(l => l === fuzz_info.state.state)) {
				console.log(`STATE`, fuzz_info.state)
				console.log(`VIEW`, fuzz_info.view)
				throw new Error("Too many times in the same state.")
			}
	}
}

if (false)
	exports.fuzz_crash = function (state, view) {
		for (let x = 0; x < log_sanity.length; x++) {
			console.log(log_sanity[x])
		}
	}
