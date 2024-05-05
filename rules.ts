"use strict"

/*
	report when used to parley/tax by sea
		AOW_YORK_GREAT_SHIPS, AOW_LANCASTER_GREAT_SHIPS

	report in better place
		AOW_YORK_FINAL_CHARGE

	Review all who = NOBODY etc resets
*/

// === TYPES ===

declare function require(name: string): any
declare let exports: any

type Side = "York" | "Lancaster"
type Player = "York" | "Lancaster" | "Both" | "None"
type Card = number & { TAG: "Card" }
type Locale = number & { TAG: "Locale" }
type Lord = number & { TAG: "Lord" }
type Vassal = number & { TAG: "Vassal" }

type Asset = number & { TAG: "Asset" }
type Force = number & { TAG: "Force" }
type Season = number & { TAG: "Season" }

type Way = "path" | "road" | "highway"

type MyMap<K,V> = (K|V)[]

interface Game {
	seed: number,
	scenario: number,
	hidden: 0 | 1,

	log: string[],
	undo: any[],

	state: string,
	active: Player,

	flags: number,
	turn: number,
	influence: number,

	hand_y: Card[],
	hand_l: Card[],

	plan_y: Lord[],
	plan_l: Lord[],

	events: Card[],

	pieces: {
		// per lord data
		locale: number[],
		assets: number[],
		forces: number[],
		routed: number[],
		capabilities: number[],
		moved: number[],

		// per vassal data
		vassals: number[],

		// per locale data
		depleted: number[],
		exhausted: number[],
		favourl: number[],
		favoury: number[],
	},

	actions: number,
	command: Lord,
	who: Lord,
	where: Locale,
	vassal: Vassal,
	group: Lord[],
	count: number,

	/* flags to track events during levy phase */
	levy_flags?: {
		gloucester_as_heir: number,
		jack_cade: number,
		loyalty_and_trust: number,
		my_crown_is_in_my_heart: number,
		parliament_votes: number,
		succession: number,
		thomas_stanley: number,
	},

	/* temporary properties for various phases and actions */
	arts_of_war?: Card[],
	this_event?: Card,
	march?: { from: Locale, to: Locale },
	sail_from?: Locale,
	intercept?: Lord[],
	battle?: Battle,
	supply?: MyMap<Locale,number>,
	parley?: MyMap<Locale,number>,
	tax?: MyMap<Locale,number>,
	spoils?: number[],

	/* temporary properties for various events */
	event_scots?: Lord[],
	event_propaganda?: Locale[],
	event_aragne?: Vassal[],
	event_she_wolf?: Vassal[],
	event_the_kings_name?: any,
	event_regroup?: number[],

	/* game over properties */
	victory?: string,
	result?: string,
}

interface Battle {
	where: Locale,
	round: number,
	step: number,
	attacker: Player,
	loser: Player,
	array: Lord[],
	valour: number[],
	fled: Lord[],
	routed: Lord[],
	routed_vassals: Vassal[],
	reserves: Lord[],
	engagements: any,
	ahits: number,
	dhits: number,
	reroll: 0 | 1,
	final_charge: 0 | 1,
	culverins?: Lord[],
	ravine?: Lord,
	caltrops?: Lord,
	force?: Force,
}

interface State {
	inactive: string,
	prompt(current?: Side): void,

	undo?(_:any, current: Side): void,
	plan?(lord: Lord, current: Side): void,
	end_plan?(_:any, current: Side): void,
	check?(bonus:number): void,

	// pieces
	card?(card: Card): void,
	locale?(locale: Locale): void,
	array?(pos:number): void,
	lord?(lord: Lord): void,
	prov?(lord: Lord): void,
	coin?(lord: Lord): void,
	cart?(lord: Lord): void,
	ship?(lord: Lord): void,
	vassal?(vassal: Vassal): void,

	burgundians?(lord: Lord): void,
	retinue?(lord: Lord): void,
	mercenaries?(lord: Lord): void,
	longbowmen?(lord: Lord): void,
	men_at_arms?(lord: Lord): void,
	militia?(lord: Lord): void,

	routed_burgundians?(lord: Lord): void,
	routed_retinue?(lord: Lord): void,
	routed_mercenaries?(lord: Lord): void,
	routed_longbowmen?(lord: Lord): void,
	routed_men_at_arms?(lord: Lord): void,
	routed_militia?(lord: Lord): void,

	// BUTTONS

	// questions
	favour?(): void,
	influence?(): void,
	stronghold?(): void,
	port?(): void,
	by_way?(): void,

	// capabilities / events
	add_men_at_arms?(): void,
	add_militia2?(): void,
	add_militia?(): void,
	agitators?(): void,
	commission_of_array?(): void,
	exile?(): void,
	exile_pact?(): void,
	final_charge?(): void,
	heralds?(): void,
	levy_beloved_warwick?(): void,
	levy_irishmen?(): void,
	loyalty_and_trust?(): void,
	merchants?(): void,
	regroup?(): void,
	richard_iii?(): void,
	soldiers_of_fortune?(): void,
	vanguard?(): void,

	// arts of war
	play?(): void,
	hold?(): void,
	discard?(): void,

	// levy
	parley?(): void,
	take_ship?(): void,
	take_prov?(): void,
	take_cart?(): void,
	take_all?(): void,
	levy_troops?(): void,
	capability?(): void,

	// campaign
	forage?(): void,
	tax?(): void,
	sail?(): void,
	supply?(): void,

	// march
	march?(): void,
	approach?(): void,
	intercept?(): void,
	battle?(): void,

	// pay/feed/pillage
	pay?(): void,
	pay_all?(): void,
	pillage?(): void,
	disband?(): void,

	end_array?(): void,
	end_battle_round?(): void,
	end_command?(): void,
	end_feed?(): void,
	end_muster?(): void,
	end_pay?(): void,
	end_spoils?(): void,

	roll?(): void,
	pass?(): void,
	done?(): void,
}

interface View {
	prompt: string,
	actions: any,
	log: string[],

	scenario: number,
	turn: number,
	influence: number,

	events: Card[],
	pieces: any,
	reveal: number,

	held_y: number,
	held_l: number,

	command: Lord,
	hand: Card[],
	plan: Lord[],

	battle?: Battle,
	engaged?: Lord[],
	arts_of_war?: Card[],
	group?: Lord[],
	what?: Card,
	who?: Lord,
	where?: Locale | Locale[],
	vassal?: Vassal | Vassal[],
}

// === GLOBALS ===

const data = require("./data.js")

let game: Game
let view: View
let states: { [index: string]: State } = {}

let P1: Side
let P2: Side

const search_seen: number[] = new Array(data.locales.length)
const search_dist: number[] = new Array(data.locales.length)

// === CONSTANTS ===

function find_card(name): Card {
	let ix = data.cards.findIndex(x => x.name === name)
	if (ix < 0)
		throw "CANNOT FIND CARD: " + name
	return ix
}

function find_lord(name): Lord {
	let ix = data.lords.findIndex(x => x.name === name)
	if (ix < 0)
		throw "CANNOT FIND LORD: " + name
	return ix
}

function find_locale(name): Locale {
	let ix = data.locales.findIndex(x => x.name === name)
	if (ix < 0)
		throw "CANNOT FIND LOCALE: " + name
	return ix
}

function find_vassal(name): Vassal {
	let ix = data.vassals.findIndex(x => x.name === name)
	if (ix < 0)
		throw "CANNOT FIND VASSAL: " + name
	return ix
}

const BOTH = "Both"
const LANCASTER = "Lancaster"
const YORK = "York"

exports.roles = [ LANCASTER, YORK ]

const NOBODY = -1 as Lord
const NOVASSAL = -1 as Vassal
const NOWHERE = -1 as Locale
const NOCARD = -1 as Card

const CALENDAR = 100 as Locale
const CALENDAR_EXILE = 200 as Locale
const LONDON_FOR_YORK = 300 as Locale // extra london marker
const CAPTURE_OF_THE_KING = 400 as Locale // Ia. special rule (400 + lord ID that has him captured)

const VASSAL_READY = 29 as Lord
const VASSAL_DISBANDED = 30 as Lord
const VASSAL_OUT_OF_PLAY = 31 as Lord

const SUMMER = 0 as Season
const SPRING = 1 as Season
const WINTER = 2 as Season
const AUTUMN = 3 as Season

const SEASONS = [
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
]

const INFLUENCE_TURNS = [ 1, 4, 6, 9, 11, 14 ]
const GROW_TURNS = [ 4, 9, 14 ]
const WASTE_TURNS = [ 5, 10 ]

// unit types
const RETINUE = 0 as Force
const VASSAL = 1 as Force
const MEN_AT_ARMS = 2 as Force
const LONGBOWMEN = 3 as Force
const MILITIA = 4 as Force
const BURGUNDIANS = 5 as Force
const MERCENARIES = 6 as Force

const FORCE_TYPE_NAME = [ "Retinue", "Vassal", "Men-at-Arms", "Longbowmen", "Militia", "Burgundians", "Mercenary" ]

const all_force_types = make_list(0, 6) as Force[]
const simple_force_type = make_list(2, 6) as Force[]

// asset types
const PROV = 0 as Asset
const COIN = 1 as Asset
const CART = 2 as Asset
const SHIP = 3 as Asset

const ASSET_TYPE_NAME = [ "Provender", "Coin", "Cart", "Ship" ]

const all_asset_types = make_list(0, 3) as Asset[]

// battle array
const A1 = 0 // attackers
const A2 = 1
const A3 = 2
const D1 = 3 // defenders
const D2 = 4
const D3 = 5

function make_list(first, last) {
	let list = []
	for (let i = first; i <= last; ++i)
		list.push(i)
	return list
}

const lord_name = data.lords.map(lord => lord.short_name)
const locale_name = data.locales.map(locale => locale.name)
const vassal_name = data.vassals.map(vassal => vassal.name)

const lord_count = data.lords.length
const vassal_count = data.vassals.length

const all_lords = make_list(0, lord_count-1) as Lord[]
const all_locales = make_list(0, data.locales.length-1) as Locale[]
const all_vassals = make_list(0, data.vassals.length-1) as Vassal[]

const all_york_cards = make_list(0, 36) as Card[]
const all_lancaster_cards = make_list(37, 73) as Card[]

const first_york_card = 0
const last_york_card = 36
const first_lancaster_card = 37
const last_lancaster_card = 73

function is_york_card(c: Card) {
	return c >= first_york_card && c <= last_york_card
}

function is_lancaster_card(c: Card) {
	return c >= first_lancaster_card && c <= last_lancaster_card
}

const first_york_lord = 0
const last_york_lord = 13
const first_lancaster_lord = 14
const last_lancaster_lord = 27

const all_york_lords = make_list(0, 13) as Lord[]
const all_lancaster_lords = make_list(14, 27) as Lord[]

const YORK_LORD_MASK = 0x3fff
const LANCASTER_LORD_MASK = YORK_LORD_MASK << 14

function is_york_lord(lord: Lord) {
	return lord >= first_york_lord && lord <= last_york_lord
}

function is_lancaster_lord(lord: Lord) {
	return lord >= first_lancaster_lord && lord <= last_lancaster_lord
}

function is_marshal(lord: Lord) {
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

function is_lieutenant(lord: Lord) {
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

function get_lord_seat(lord: Lord): Locale {
	return data.lords[lord].seat
}

function get_vassal_seat(v: Vassal): Locale {
	return data.vassals[v].seat
}

function get_vassal_locale(v: Vassal) {
	let lord = get_vassal_lord(v)
	if (lord !== NOBODY)
		return get_lord_locale(lord)
	return NOWHERE
}

function is_special_vassal(v: Vassal) {
	return v >= VASSAL_TROLLOPE && v <= VASSAL_HASTINGS
}

function get_lord_influence(lord: Lord): number {
	return data.lords[lord].influence
}

// from !node tools/gendata.js
function is_seaport(x: Locale) { return (x >= 0 && x <= 16) }
function is_port_1(x: Locale) { return (x >= 0 && x <= 4) }
function is_port_2(x: Locale) { return (x >= 5 && x <= 13) }
function is_port_3(x: Locale) { return (x >= 14 && x <= 16) }
function is_adjacent_north_sea(x: Locale) { return (x >= 0 && x <= 4) }
function is_adjacent_english_channel(x: Locale) { return (x >= 5 && x <= 13) }
function is_adjacent_irish_sea(x: Locale) { return (x >= 14 && x <= 16) }
function is_stronghold(x: Locale) { return (x >= 0 && x <= 53) }
function is_fortress(x: Locale) { return (x >= 0 && x <= 1) || x === 15 || x === 42 || x === 53 }
function is_england(x: Locale) { return (x >= 0 && x <= 2) || (x >= 5 && x <= 9) || x === 14 || (x >= 17 && x <= 40) }
function is_town(x: Locale) { return x === 2 || x === 4 || (x >= 7 && x <= 13) || (x >= 31 && x <= 40) || (x >= 43 && x <= 44) }
function is_city(x: Locale) { return x === 3 || x === 6 || x === 14 || (x >= 17 && x <= 29) || x === 41 || (x >= 45 && x <= 52) }
function is_north(x: Locale) { return (x >= 3 && x <= 4) || (x >= 41 && x <= 44) }
function is_calais(x: Locale) { return x === 5 }
function is_south(x: Locale) { return (x >= 10 && x <= 13) || (x >= 45 && x <= 49) }
function is_wales(x: Locale) { return (x >= 15 && x <= 16) || (x >= 50 && x <= 53) }
function is_harlech(x: Locale) { return x === 16 }
function is_london(x: Locale) { return x === 30 }
function is_exile_box(x: Locale) { return (x >= 54 && x <= 57) }
function is_sea(x: Locale) { return (x >= 58 && x <= 60) }

function is_adjacent(a: Locale, b: Locale) {
	return is_stronghold(a) && is_stronghold(b) && set_has(data.locales[a].adjacent, b)
}

function find_sea_mask(here: Locale) {
	if (is_port_1(here)) return 1
	if (is_port_2(here)) return 2
	if (is_port_3(here)) return 4
	return 0
}

function find_ports(here: Locale, lord: Lord): Locale[] {

	// for Parley, Supply, and Tax purposes only (not Disembark)
	if (lord !== NOBODY) {
		if ((lord_has_capability(lord, AOW_YORK_GREAT_SHIPS) || lord_has_capability(lord, AOW_LANCASTER_GREAT_SHIPS)))
			return data.all_ports
	}

	if (here === data.sea_1) return data.port_1
	if (here === data.sea_2) return data.port_2
	if (here === data.sea_3) return data.port_3
	if (here === data.exile_1) return data.port_1
	if (here === data.exile_2) return data.port_2
	if (here === data.exile_3) return data.port_3
	if (here === data.exile_4) return data.port_1
	if (is_port_1(here)) return data.port_1
	if (is_port_2(here)) return data.port_2
	if (is_port_3(here)) return data.port_3
	return null
}

function find_sail_locales(here: Locale): Locale[] {
	if (here === data.sea_1) return data.sail_sea_1
	if (here === data.sea_2) return data.sail_sea_2
	if (here === data.sea_3) return data.sail_sea_3
	if (here === data.exile_1) return data.sail_exile_1
	if (here === data.exile_2) return data.sail_exile_2
	if (here === data.exile_3) return data.sail_exile_3
	if (here === data.exile_4) return data.sail_exile_4
	if (is_port_1(here)) return data.sail_port_1
	if (is_port_2(here)) return data.sail_port_2
	if (is_port_3(here)) return data.sail_port_3
	return null
}

function is_on_same_sea(a: Locale, b: Locale) {
	return (
		(is_port_1(a) && is_port_1(b)) ||
		(is_port_2(a) && is_port_2(b)) ||
		(is_port_3(a) && is_port_3(b))
	)
}

function make_locale_list(pred): Locale[] {
	let list = []
	for (let loc of all_locales)
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
const all_exile_boxes = make_locale_list(is_exile_box)

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
const VASSAL_SUFFOLK = find_vassal("Suffolk")
const VASSAL_WESTMORLAND = find_vassal("Westmoreland")
const VASSAL_WORCESTER = find_vassal("Worcester")

const VASSAL_CLIFFORD = find_vassal("Clifford")
const VASSAL_EDWARD = find_vassal("Edward")
const VASSAL_HASTINGS = find_vassal("Hastings")
const VASSAL_MONTAGU = find_vassal("Montagu")
const VASSAL_STANLEY = find_vassal("Stanley")
const VASSAL_THOMAS_STANLEY = find_vassal("Thomas Stanley")
const VASSAL_TROLLOPE = find_vassal("Trollope")

const AOW_LANCASTER_CULVERINS_AND_FALCONETS = [L1 , L2]
const AOW_LANCASTER_MUSTERD_MY_SOLDIERS = L3
const AOW_LANCASTER_HERALDS = L4
const AOW_LANCASTER_CHURCH_BLESSINGS = L5
const AOW_LANCASTER_GREAT_SHIPS = L6
const AOW_LANCASTER_HARBINGERS = L7
const AOW_LANCASTER_HAY_WAINS = L8
const AOW_LANCASTER_QUARTERMASTERS = L9
const AOW_LANCASTER_CHAMBERLAINS = L10
const AOW_LANCASTER_IN_THE_NAME_OF_THE_KING = L11
const AOW_LANCASTER_COMMISSION_OF_ARRAY = L12
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
const AOW_YORK_NAVAL_BLOCKADE = Y15
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
const AOW_YORK_WOODVILLES = Y31
const AOW_YORK_FINAL_CHARGE = Y32
const AOW_YORK_BLOODY_THOU_ART = Y33
const AOW_YORK_SO_WISE_SO_YOUNG = Y34
const AOW_YORK_KINGDOM_UNITED = Y35
const AOW_YORK_VANGUARD = Y36
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
const EVENT_LANCASTER_TO_WILFUL_DISOBEDIENCE = L29
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
const EVENT_YORK_LONDON_FOR_YORK = Y15
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
const EVENT_YORK_REGROUP = Y30
const EVENT_YORK_EARL_RIVERS = Y31
const EVENT_YORK_THE_KINGS_NAME = Y32
const EVENT_YORK_EDWARD_V = Y33
const EVENT_YORK_AN_HONEST_TALE_SPEEDS_BEST = Y34
const EVENT_YORK_PRIVY_COUNCIL = Y35
const EVENT_YORK_SWIFT_MANEUVER = Y36
const EVENT_YORK_PATRICK_DE_LA_MOTE = Y37

// === STATE: ACTIVE PLAYER ===

function all_friendly_lords() {
	if (game.active === YORK)
		return all_york_lords
	return all_lancaster_lords
}

function all_enemy_lords() {
	if (game.active === YORK)
		return all_lancaster_lords
	return all_york_lords
}

function update_aliases() {
	if (has_flag(FLAG_REBEL_IS_YORK)) {
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

function set_active(new_active: Player) {
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

function is_active_command() {
	if (is_york_lord(game.command))
		return game.active === YORK
	else
		return game.active === LANCASTER
}

// === STATE: TURN ===

function current_turn() {
	return game.turn >> 1
}

function current_season() {
	return SEASONS[(game.turn >> 1) - 1]
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
	return 0
}

// === STATE: FLAGS ===

const FLAG_REBEL_IS_YORK = 1
const FLAG_FIRST_ACTION = 2
const FLAG_FIRST_MARCH_HIGHWAY = 4
const FLAG_MARCH_TO_PORT = 8
const FLAG_SAIL_TO_PORT = 16
const FLAG_SUPPLY_DEPOT = 32
const FLAG_SURPRISE_LANDING = 64
const FLAG_BURGUNDIANS = 128

function has_flag(bit) {
	return !!(game.flags & bit)
}

function set_flag(bit) {
	game.flags |= bit
}

function clear_flag(bit) {
	game.flags &= ~bit
}

// === STATE: CARDS ===

function current_hand() {
	if (game.active === YORK)
		return game.hand_y
	return game.hand_l
}

function has_card_in_hand(c: Card) {
	if (game.active === YORK)
		return set_has(game.hand_y, c)
	return set_has(game.hand_l, c)
}

function could_play_card(c: Card) {
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

function count_cards_in_plan(plan: Lord[], lord: Lord) {
	let n = 0
	for (let c of plan)
		if (c === lord)
			++n
	return n
}

function is_card_in_use(c: Card) {
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

function list_deck(): Card[] {
	let deck = []
	let card_list = game.active === YORK ? all_york_cards : all_lancaster_cards
	for (let c of card_list)
		if (!is_card_in_use(c) && is_card_in_scenario(c))
			deck.push(c)
	return deck
}

function draw_card(deck: Card[]) {
	clear_undo()
	let i = random(deck.length)
	let c = deck[i]
	set_delete(deck, c)
	return c
}

function draw_two_cards(): Card[] {
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

function is_event_in_play(c: Card) {
	return set_has(game.events, c)
}

// === STATE: LORD ===

function get_lord_locale(lord: Lord): Locale {
	return map_get(game.pieces.locale, lord, NOWHERE)
}

function set_lord_locale(lord: Lord, locale: Locale) {
	if (locale === NOWHERE)
		map_delete(game.pieces.locale, lord)
	else
		map_set(game.pieces.locale, lord, locale)
}

function get_lord_calendar(lord: Lord): number {
	if (is_lord_in_exile(lord))
		return get_lord_locale(lord) - CALENDAR_EXILE
	if (is_lord_on_calendar(lord))
		return get_lord_locale(lord) - CALENDAR
	return 0
}

function set_lord_calendar(lord: Lord, turn: number) {
	if (turn < 1)
		turn = 1
	if (turn > 16)
		turn = 16
	set_lord_locale(lord, CALENDAR + turn as Locale)
}

function set_lord_in_exile(lord: Lord) {
	let turn = get_lord_calendar(lord)
	set_lord_locale(lord, CALENDAR_EXILE + turn as Locale)
}

function is_lord_in_exile(lord: Lord) {
	let loc = get_lord_locale(lord)
	return loc >= CALENDAR_EXILE && loc <= CALENDAR_EXILE + 16
}

function is_lord_on_map(lord: Lord) {
	let loc = get_lord_locale(lord)
	return loc !== NOWHERE && loc < CALENDAR
}

function is_locale_on_map(loc: Locale) {
	return loc !== NOWHERE && loc < CALENDAR
}

function is_lord_in_play(lord: Lord) {
	return get_lord_locale(lord) !== NOWHERE
}

function is_lord_on_calendar(lord: Lord) {
	let loc = get_lord_locale(lord)
	return loc >= CALENDAR && loc <= CALENDAR_EXILE + 16
}

function is_lord_ready(lord: Lord) {
	return (is_lord_on_calendar(lord) && get_lord_calendar(lord) <= current_turn())
}

function get_lord_capability(lord: Lord, n: 0 | 1): Card {
	return map2_get(game.pieces.capabilities, lord, n, NOCARD)
}

function set_lord_capability(lord: Lord, n: 0 | 1, x: Card) {
	if (x === NOCARD)
		map2_delete(game.pieces.capabilities, lord, n)
	else
		map2_set(game.pieces.capabilities, lord, n, x)
}

function lord_has_capability_card(lord: Lord, c: Card) {
	if (get_lord_capability(lord, 0) === c)
		return true
	if (get_lord_capability(lord, 1) === c)
		return true
	return false
}

function lord_has_capability(lord: Lord, card_or_list: Card | Card[]) {
	if (Array.isArray(card_or_list)) {
		for (let card of card_or_list)
			if (lord_has_capability_card(lord, card))
				return true
		return false
	}
	return lord_has_capability_card(lord, card_or_list)
}

function lord_already_has_capability(lord: Lord, c: Card) {
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

function get_lord_assets(lord: Lord, n: Asset): number {
	return map_get_pack4(game.pieces.assets, lord, n)
}

function set_lord_assets(lord: Lord, n: Asset, x: number) {
	if (x < 0)
		x = 0
	if (x > 15)
		x = 15
	map_set_pack4(game.pieces.assets, lord, n, x)
}

function add_lord_assets(lord: Lord, n: Asset, x: number) {
	set_lord_assets(lord, n, get_lord_assets(lord, n) + x)
}

function drop_prov(lord: Lord) {
	add_lord_assets(lord, PROV, -1)
}

function drop_cart(lord: Lord) {
	add_lord_assets(lord, CART, -1)
}

function get_lord_forces(lord: Lord, n: Force): number {
	return map_get_pack4(game.pieces.forces, lord, n)
}

function set_lord_forces(lord: Lord, n: Force, x: number) {
	if (x < 0)
		x = 0
	if (x > 15)
		x = 15
	map_set_pack4(game.pieces.forces, lord, n, x)
}

function add_lord_forces(lord: Lord, n: Force, x: number) {
	set_lord_forces(lord, n, get_lord_forces(lord, n) + x)
}

function get_lord_routed_forces(lord: Lord, n: Force): number {
	return map_get_pack4(game.pieces.routed, lord, n)
}

function set_lord_routed_forces(lord: Lord, n: Force, x: number) {
	if (x < 0)
		x = 0
	if (x > 15)
		x = 15
	map_set_pack4(game.pieces.routed, lord, n, x)
}

function add_lord_routed_forces(lord: Lord, n: Force, x: number) {
	set_lord_routed_forces(lord, n, get_lord_routed_forces(lord, n) + x)
}

function get_lord_moved(lord: Lord): number {
	return map_get(game.pieces.moved, lord, 0)
}

function set_lord_moved(lord: Lord, x: number) {
	map_set(game.pieces.moved, lord, x)
}

function clear_lords_moved() {
	map_clear(game.pieces.moved)
}

function set_lord_fought(lord: Lord) {
	set_lord_moved(lord, 1)
}

function set_lord_unfed(lord: Lord, n) {
	// reuse "moved" flag for hunger
	set_lord_moved(lord, n)
}

function is_lord_unfed(lord: Lord): number {
	// reuse "moved" flag for hunger
	return get_lord_moved(lord)
}

function feed_lord(lord: Lord) {
	// reuse "moved" flag for hunger
	let n = get_lord_moved(lord) - 1
	set_lord_moved(lord, n)
	// TODO? if (n === 0) log(`Fed L${lord}.`)
}

function pay_lord(lord: Lord) {
	// reuse "moved" flag for pay
	let n = get_lord_moved(lord) - 1
	set_lord_moved(lord, n)
}

function is_friendly_lord(lord: Lord) {
	if (game.active === YORK)
		return is_york_lord(lord)
	return is_lancaster_lord(lord)
}

function is_enemy_lord(lord: Lord) {
	if (game.active === YORK)
		return is_lancaster_lord(lord)
	return is_york_lord(lord)
}

function count_lord_all_forces(lord: Lord) {
	return (
		get_lord_forces(lord, BURGUNDIANS) +
		get_lord_forces(lord, MERCENARIES) +
		get_lord_forces(lord, MEN_AT_ARMS) +
		get_lord_forces(lord, MILITIA) +
		get_lord_forces(lord, LONGBOWMEN)
	)
}

function lord_has_unrouted_units(lord: Lord) {
	for (let x of all_force_types)
		if (get_lord_forces(lord, x) > 0)
			return true
	let result = false
	for_each_vassal_with_lord(lord, v => {
		if (!set_has(game.battle.routed_vassals, v))
			result = true
	})
	return result
}

function lord_has_unrouted_troops(lord: Lord) {
	// Don't check here for Retinue or Vassals.
	for (let x of simple_force_type) {
		if (get_lord_forces(lord, x) > 0)
			return true
	}
	return false
}

function lord_has_routed_retinue(lord: Lord) {
	return get_lord_routed_forces(lord, RETINUE) > 0
}

function lord_has_routed_troops(lord: Lord) {
	// Don't check here for Retinue or Vassals.
	for (let x of simple_force_type) {
		if (get_lord_routed_forces(lord, x) > 0)
			return true
	}
	return false
}

function find_lord_with_capability_card(c: Card) {
	for (let lord of all_lords)
		if (lord_has_capability_card(lord, c))
			return lord
	return NOBODY
}

function get_force_name(_lord: Lord, n: Force, x: Vassal = NOVASSAL) {
	if (n === VASSAL)
		return "V" + x
	return FORCE_TYPE_NAME[n]
}

function get_inherent_valour(lord: Lord) {
	return data.lords[lord].valour
}

function log_valour(lord: Lord, c: Card) {
	log("L" + lord)
	log(">C" + c)
}

function get_modified_valour(lord: Lord, report: boolean) {
	let valour = get_inherent_valour(lord)

	if (lord_has_capability(lord, AOW_LANCASTER_EXPERT_COUNSELLORS)) {
		if (report)
			log_valour(lord, AOW_LANCASTER_EXPERT_COUNSELLORS)
		valour += 2
	}

	if (lord_has_capability(lord, AOW_LANCASTER_VETERAN_OF_FRENCH_WARS)) {
		if (report)
			log_valour(lord, AOW_LANCASTER_VETERAN_OF_FRENCH_WARS)
		valour += 2
	}

	if (lord_has_capability(lord, AOW_LANCASTER_ANDREW_TROLLOPE)) {
		if (report)
			log_valour(lord, AOW_LANCASTER_ANDREW_TROLLOPE)
		valour += 1
	}

	if (lord_has_capability(lord, AOW_LANCASTER_MY_FATHERS_BLOOD)) {
		if (report)
			log_valour(lord, AOW_LANCASTER_MY_FATHERS_BLOOD)
		valour += 1
	}

	if (lord_has_capability(lord, AOW_LANCASTER_EDWARD)) {
		if (report)
			log_valour(lord, AOW_LANCASTER_EDWARD)
		valour += 1
	}

	if (lord_has_capability(lord, AOW_LANCASTER_LOYAL_SOMERSET)) {
		if (get_lord_locale(lord) === get_lord_locale(LORD_MARGARET)) {
			if (report)
				log_valour(lord, AOW_LANCASTER_LOYAL_SOMERSET)
			valour += 1
		}
	}

	return valour
}

function can_pick_up_lords(lord: Lord) {
	if (is_marshal(lord) || is_lieutenant(lord))
		return true
	if (lord_has_capability(lord, AOW_YORK_CAPTAIN) && !has_other_marshal_or_lieutenant(lord, get_lord_locale(lord)))
		return true
	return false
}

function can_pick_up_other(lord: Lord, other: Lord) {
	if (game.scenario === SCENARIO_II) {
		if (lord === LORD_WARWICK_L && other === LORD_MARGARET)
			return false
		if (lord === LORD_MARGARET && other === LORD_WARWICK_L)
			return false
	}
	return (other !== lord && !is_marshal(other))
}

// === STATE: LORD (SHARED) ===

function get_york_shared_assets(loc: Locale, what: Asset) {
	let n = 0
	for (let lord of all_york_lords)
		if (get_lord_locale(lord) === loc)
			n += get_lord_assets(lord, what)
	return n
}

function get_shared_assets(loc: Locale, what: Asset) {
	let n = 0
	for (let lord of all_friendly_lords())
		if (get_lord_locale(lord) === loc)
			n += get_lord_assets(lord, what)
	return n
}

function count_shared_ships(loc: Locale, allow_great_ships: boolean) {
	let n = 0
	for (let lord of all_friendly_lords()) {
		if (get_lord_locale(lord) === loc) {
			n += get_lord_assets(lord, SHIP)
			if (allow_great_ships && (lord_has_capability(lord, AOW_YORK_GREAT_SHIPS) || lord_has_capability(lord, AOW_LANCASTER_GREAT_SHIPS)))
				n += get_lord_assets(lord, SHIP)
		}
	}
	return n
}

function count_group_ships(group: Lord[], allow_great_ships: boolean) {
	let n = 0
	for (let lord of group) {
		n += get_lord_assets(lord, SHIP)
		if (allow_great_ships && (lord_has_capability(lord, AOW_YORK_GREAT_SHIPS) || lord_has_capability(lord, AOW_LANCASTER_GREAT_SHIPS)))
			n += get_lord_assets(lord, SHIP)
	}
	return n
}

function count_shared_carts(loc: Locale, allow_hay_wains: boolean) {
	let n = 0
	for (let lord of all_friendly_lords()) {
		if (get_lord_locale(lord) === loc) {
			n += get_lord_assets(lord, CART)
			if (allow_hay_wains && lord_has_capability(lord, AOW_LANCASTER_HAY_WAINS))
				n += get_lord_assets(lord, CART)
		}
	}
	return n
}

function count_group_carts(group: Lord[], allow_hay_wains: boolean) {
	let n = 0
	for (let lord of group) {
		n += get_lord_assets(lord, CART)
		if (allow_hay_wains && lord_has_capability(lord, AOW_LANCASTER_HAY_WAINS))
			n += get_lord_assets(lord, CART)
	}
	return n
}

function count_group_provender(group: Lord[]) {
	let n = 0
	for (let lord of group)
		n += get_lord_assets(lord, PROV)
	return n
}

// === STATE: VASSAL ===

function set_vassal_lord_and_service(vassal: Vassal, lord: Lord, service: number) {
	service = Math.max(0, Math.min(16, service))
	game.pieces.vassals[vassal] = lord + (service << 5)
}

function get_vassal_lord(vassal: Vassal): Lord {
	return (game.pieces.vassals[vassal] & 31) as Lord
}

function get_vassal_service(vassal: Vassal) {
	return game.pieces.vassals[vassal] >> 5
}

function setup_vassals(excludes: Vassal[] = []) {
	for (let x of all_vassals) {
		if (!excludes.includes(x) && data.vassals[x].capability === undefined) {
			set_vassal_lord_and_service(x, VASSAL_READY, 0)
		}
	}
}

function is_vassal_ready(x: Vassal) {
	return get_vassal_lord(x) === VASSAL_READY
}

function is_vassal_mustered_with(x: Vassal, lord: Lord) {
	return get_vassal_lord(x) === lord
}

function is_vassal_mustered_with_friendly_lord(x: Vassal) {
	return is_friendly_lord(get_vassal_lord(x))
}

function is_vassal_mustered_with_york_lord(x: Vassal) {
	return is_york_lord(get_vassal_lord(x))
}

function for_each_vassal_with_lord(lord: Lord, f) {
	for (let x of all_vassals)
		if (is_vassal_mustered_with(x, lord))
			f(x)
}

function count_vassals_with_lord(lord: Lord) {
	let n = 0
	for (let v of all_vassals)
		if (is_vassal_mustered_with(v, lord))
			++n
	return n
}

function count_unrouted_vassals_with_lord(lord: Lord) {
	let n = 0
	for (let v of all_vassals)
		if (is_vassal_mustered_with(v, lord))
			if (!set_has(game.battle.routed_vassals, v))
				++n
	return n
}

function muster_vassal(vassal: Vassal, lord: Lord) {
	if (data.vassals[vassal].service !== 0) {
		let service = current_turn() + data.vassals[vassal].service
		if (lord_has_capability(lord, AOW_YORK_ALICE_MONTAGU)) {
			logcap(AOW_YORK_ALICE_MONTAGU)
			service += 1
		}
		set_vassal_lord_and_service(vassal, lord, service)
	} else {
		set_vassal_lord_and_service(vassal, lord, 0)
	}
}

function disband_vassal(vassal: Vassal) {
	let lord = get_vassal_lord(vassal)

	if (vassal === VASSAL_HASTINGS)
		discard_lord_capability(lord, AOW_YORK_HASTINGS)
	if (vassal === VASSAL_TROLLOPE)
		discard_lord_capability(lord, AOW_LANCASTER_ANDREW_TROLLOPE)
	if (vassal === VASSAL_CLIFFORD)
		discard_lord_capability(lord, AOW_LANCASTER_MY_FATHERS_BLOOD)
	if (vassal === VASSAL_MONTAGU)
		discard_lord_capability(lord, AOW_LANCASTER_MONTAGU)
	if (vassal === VASSAL_EDWARD)
		discard_lord_capability(lord, AOW_LANCASTER_EDWARD)
	if (vassal === VASSAL_THOMAS_STANLEY)
		discard_lord_capability(lord, AOW_LANCASTER_THOMAS_STANLEY)

	if (data.vassals[vassal].service > 0) {
		let new_turn = current_turn() + (6 - data.vassals[vassal].service)
		set_vassal_lord_and_service(vassal, VASSAL_DISBANDED, new_turn)
		log(`Disband V${vassal} to T${current_turn() + (6 - data.vassals[vassal].service)}.`)
	} else {
		// TODO: special vassals with no service marker!?
		set_vassal_lord_and_service(vassal, VASSAL_OUT_OF_PLAY, 0)
		log(`Disband V${vassal}.`)
	}
}

function rout_vassal(_lord: Lord, vassal: Vassal) {
	set_add(game.battle.routed_vassals, vassal)
}

function unrout_vassal(_lord: Lord, vassal: Vassal) {
	set_delete(game.battle.routed_vassals, vassal)
}

// === STATE: LOCALE ===

function is_friendly_locale(loc: Locale) {
	if (game.active === YORK)
		return has_york_favour(loc)
	else
		return has_lancaster_favour(loc)
}

function is_enemy_locale(loc: Locale) {
	if (game.active === LANCASTER)
		return has_york_favour(loc)
	else
		return has_lancaster_favour(loc)
}

function is_neutral_locale(loc: Locale) {
	return !has_lancaster_favour(loc) && !has_york_favour(loc)
}

function has_lancaster_favour(loc: Locale) {
	return set_has(game.pieces.favourl, loc)
}

function add_lancaster_favour(loc: Locale) {
	set_add(game.pieces.favourl, loc)
}

function remove_lancaster_favour(loc: Locale) {
	set_delete(game.pieces.favourl, loc)
}

function has_york_favour(loc: Locale) {
	return set_has(game.pieces.favoury, loc)
}

function add_york_favour(loc: Locale) {
	set_add(game.pieces.favoury, loc)
}

function set_york_favour(loc: Locale) {
	set_add(game.pieces.favoury, loc)
	set_delete(game.pieces.favourl, loc)
}

function set_lancaster_favour(loc: Locale) {
	set_add(game.pieces.favourl, loc)
	set_delete(game.pieces.favoury, loc)
}

function remove_york_favour(loc: Locale) {
	if (loc === LOC_LONDON)
		set_delete(game.pieces.favoury, LONDON_FOR_YORK)
	set_delete(game.pieces.favoury, loc)
}

function shift_favour_away(loc: Locale) {
	if (game.active === YORK)
		shift_favour_toward_lancaster(loc)
	else
		shift_favour_toward_york(loc)
}

function shift_favour_toward(loc: Locale) {
	if (game.active === YORK)
		shift_favour_toward_york(loc)
	else
		shift_favour_toward_lancaster(loc)
}

function shift_favour_toward_york(loc: Locale) {
	if (has_lancaster_favour(loc))
		remove_lancaster_favour(loc)
	else
		add_york_favour(loc)
}

function shift_favour_toward_lancaster(loc: Locale) {
	if (has_york_favour(loc))
		remove_york_favour(loc)
	else
		add_lancaster_favour(loc)
}

function set_favour_enemy(loc: Locale) {
	if (game.active === YORK) {
		remove_york_favour(loc)
		add_lancaster_favour(loc)
	} else {
		remove_lancaster_favour(loc)
		add_york_favour(loc)
	}
}

function has_exhausted_marker(loc: Locale) {
	return set_has(game.pieces.exhausted, loc)
}

function add_exhausted_marker(loc: Locale) {
	set_add(game.pieces.exhausted, loc)
}

function has_depleted_marker(loc: Locale) {
	return set_has(game.pieces.depleted, loc)
}

function add_depleted_marker(loc: Locale) {
	set_add(game.pieces.depleted, loc)
}

function remove_depleted_marker(loc: Locale) {
	set_delete(game.pieces.depleted, loc)
}

function remove_exhausted_marker(loc: Locale) {
	set_delete(game.pieces.exhausted, loc)
}

function deplete_locale(loc: Locale) {
	if (has_depleted_marker(loc)) {
		remove_depleted_marker(loc)
		add_exhausted_marker(loc)
	} else {
		add_depleted_marker(loc)
	}
}

function has_favour_in_locale(side: Player, loc: Locale) {
	if (side === YORK)
		return has_york_favour(loc)
	else
		return has_lancaster_favour(loc)
}

function is_at_or_adjacent_to_lancastrian_english_channel_port(loc: Locale) {
	if (is_stronghold(loc)) {
		if (has_lancaster_favour(loc) && is_adjacent_english_channel(loc))
			return true
		for (let next of data.locales[loc].adjacent)
			if (has_lancaster_favour(next) && is_adjacent_english_channel(next))
				return true
	}
	return false
}

// === STATE: LORD & LOCALE ===

function is_lord_in_wales(lord: Lord) {
	return is_wales(get_lord_locale(lord))
}

function is_lord_in_south(lord: Lord) {
	return is_south(get_lord_locale(lord))
}

function is_lord_in_north(lord: Lord) {
	return is_north(get_lord_locale(lord))
}

function has_friendly_lord(loc: Locale) {
	for (let lord of all_friendly_lords())
		if (get_lord_locale(lord) === loc)
			return true
	return false
}

function has_york_lord(loc: Locale) {
	for (let lord of all_york_lords)
		if (get_lord_locale(lord) === loc)
			return true
	return false
}

function has_lancaster_lord(loc: Locale) {
	for (let lord of all_lancaster_lords)
		if (get_lord_locale(lord) === loc)
			return true
	return false
}

function has_enemy_lord(loc: Locale) {
	for (let lord of all_enemy_lords())
		if (get_lord_locale(lord) === loc)
			return true
	return false
}

function is_lord_in_or_adjacent_to_north(lord: Lord) {
	let here = get_lord_locale(lord)
	if (is_north(here))
		return true
	for (let loc of data.locales[here].adjacent)
		if (is_north(loc))
			return true
	return false
}

function is_lord_in_or_adjacent_to_south(lord: Lord) {
	let here = get_lord_locale(lord)
	if (is_south(here))
		return true
	for (let loc of data.locales[here].adjacent)
		if (is_south(loc))
			return true
	return false
}

function is_lord_in_or_adjacent_to_wales(lord: Lord) {
	let here = get_lord_locale(lord)
	if (is_wales(here))
		return true
	for (let loc of data.locales[here].adjacent)
		if (is_wales(loc))
			return true
	return false
}

function has_other_marshal_or_lieutenant(lord: Lord, here: Locale) {
	for (let other of all_friendly_lords())
		if (other !== lord && get_lord_locale(other) === here && (is_marshal(other) || is_lieutenant(other)))
			return true
	return false
}

function has_adjacent_enemy(loc: Locale) {
	for (let next of data.locales[loc].adjacent)
		if (has_enemy_lord(next))
			return true
	return false
}

function has_adjacent_friendly(loc: Locale) {
	for (let next of data.locales[loc].adjacent)
		if (has_friendly_lord(next))
			return true
	return false
}

function is_york_dominating_north() {
	let n = 0
	for (let loc of all_north_locales)
		if (has_york_favour(loc))
			n++
	return n >= all_north_locales.length
}

function is_lancaster_dominating_north() {
	let n = 0
	for (let loc of all_north_locales)
		if (has_lancaster_favour(loc))
			n++
	let cap_lord = find_lord_with_capability_card(AOW_LANCASTER_NORTHMEN)
	if (is_lancaster_lord(cap_lord) && is_north(get_lord_locale(cap_lord)))
		return n >= 3
	return n >= all_north_locales.length
}

function is_york_dominating_south() {
	let n = 0
	for (let loc of all_south_locales)
		if (has_york_favour(loc))
			n++
	let cap_lord = find_lord_with_capability_card(AOW_YORK_SOUTHERNERS)
	if (is_york_lord(cap_lord) && is_south(get_lord_locale(cap_lord)))
		return n >= 5
	return n >= all_south_locales.length
}

function is_lancaster_dominating_south() {
	let n = 0
	for (let loc of all_south_locales)
		if (has_lancaster_favour(loc))
			n++
	return n >= all_south_locales.length
}

function is_york_dominating_wales() {
	let n = 0
	for (let loc of all_wales_locales)
		if (has_york_favour(loc))
			n++
	let cap_lord = find_lord_with_capability_card(AOW_YORK_WELSHMEN)
	if (is_york_lord(cap_lord) && is_wales(get_lord_locale(cap_lord)))
		return n >= 3
	return n >= all_wales_locales.length
}

function is_lancaster_dominating_wales() {
	let n = 0
	for (let loc of all_wales_locales)
		if (has_lancaster_favour(loc))
			n++
	return n >= all_wales_locales.length
}

// === 1.4 INFLUENCE ===

function log_ip(n) {
	if (n < 0)
		log(".ip " + n)
	else if (n > 0)
		log(".ip +" + n)
}

function reduce_influence(amt: number) {
	if (game.active === YORK)
		reduce_york_influence(amt)
	else
		reduce_lancaster_influence(amt)
}

function reduce_york_influence(amt: number) {
	log_ip(-amt)
	game.influence = Math.max(-45, Math.min(45, game.influence + amt))
}

function increase_york_influence(amt: number) {
	log_ip(amt)
	game.influence = Math.max(-45, Math.min(45, game.influence - amt))
}

function reduce_lancaster_influence(amt: number) {
	log_ip(-amt)
	game.influence = Math.max(-45, Math.min(45, game.influence - amt))
}

function increase_lancaster_influence(amt: number) {
	log_ip(amt)
	game.influence = Math.max(-45, Math.min(45, game.influence + amt))
}

function common_ic_cost(_lord: Lord, spend: number) {
	let cost = 1
	if (spend === 1)
		cost += 1
	if (spend === 2)
		cost += 3
	return cost
}

function vassal_ic_cost(lord: Lord, spend: number) {
	let cost = common_ic_cost(lord, spend)
	if (game.active === YORK) {
		if (is_event_in_play(EVENT_LANCASTER_BUCKINGHAMS_PLOT))
			cost += 2
	}
	return cost
}

function parley_ic_cost(lord: Lord, spend: number) {
	let cost = common_ic_cost(lord, spend)

	// Note: use of game.where
	cost += map_get(game.parley, game.where, 0) >> 3 /* scaled by 8 to account for seas crossed */

	if (game.active === LANCASTER) {
		if (is_event_in_play(EVENT_YORK_AN_HONEST_TALE_SPEEDS_BEST)) {
			cost += 1
		}
	}

	if (is_levy_phase()) {
		if (game.levy_flags.jack_cade > 0) {
			cost = 0
		} else {
			if (game.levy_flags.parliament_votes > 0)
				cost -= 1
			if (game.levy_flags.succession > 0)
				cost -= 1
		}
	} else {
		if (lord === LORD_DEVON && get_lord_locale(lord) === LOC_EXETER && is_event_in_play(EVENT_YORK_DORSET))
			cost = 0
	}

	return cost
}

function common_ic_success(_lord: Lord) {
	return false
}

function vassal_ic_success(lord: Lord) {
	if (game.active === LANCASTER) {
		if (is_event_in_play(EVENT_LANCASTER_THE_EARL_OF_RICHMOND)) {
			return true
		}
		if (lord_has_capability(lord, AOW_LANCASTER_TWO_ROSES)) {
			return true
		}
	}
	return false
}

function parley_ic_success(lord: Lord) {
	if (is_levy_phase()) {
		if (game.levy_flags.jack_cade > 0) {
			return true
		} else {
			if (game.levy_flags.parliament_votes > 0) {
				return true
			}
			if (game.levy_flags.succession > 0) {
				return true
			}
		}
	} else {
		if (lord === LORD_DEVON && get_lord_locale(lord) === LOC_EXETER && is_event_in_play(EVENT_YORK_DORSET)) {
			return true
		}
	}
	return false
}

function common_ic_rating(lord: Lord, spend: number, report: boolean) {
	let here = get_lord_locale(lord)
	let rating = get_lord_influence(lord)
	rating += spend
	if (game.active === YORK) {
		if (is_event_in_play(EVENT_YORK_YORKIST_PARADE)) {
			if (report)
				logevent(EVENT_YORK_YORKIST_PARADE)
			rating += 2
		}
		if (is_event_in_play(EVENT_YORK_PRIVY_COUNCIL)) {
			if (report)
				logevent(EVENT_YORK_PRIVY_COUNCIL)
			rating += 1
		}
		if (lord_has_capability(lord, AOW_YORK_YORKS_FAVOURED_SON)) {
			if (report)
				logcap(AOW_YORK_YORKS_FAVOURED_SON)
			rating += 1
		}
		if (lord_has_capability(lord, AOW_YORK_FAIR_ARBITER)) {
			if (is_friendly_locale(here)) {
				if (report)
					logcap(AOW_YORK_FAIR_ARBITER)
				rating += 1
			}
		}
		if (lord_has_capability(lord, AOW_YORK_FALLEN_BROTHER)) {
			if (!is_lord_in_play(LORD_CLARENCE)) {
				if (report)
					logcap(AOW_YORK_FALLEN_BROTHER)
				rating += 2
			}
		}
	} else {
		if (lord_has_capability(lord, AOW_LANCASTER_MARRIED_TO_A_NEVILLE)) {
			if (get_lord_locale(LORD_WARWICK_L) === here && is_friendly_locale(here)) {
				if (report)
					logcap(AOW_LANCASTER_MARRIED_TO_A_NEVILLE)
				rating += 2
			}
		}
		if (lord_has_capability(lord, AOW_LANCASTER_LOYAL_SOMERSET)) {
			if (get_lord_locale(LORD_MARGARET) === here) {
				if (report)
					logcap(AOW_LANCASTER_LOYAL_SOMERSET)
				rating += 1
			}
		}
	}
	return rating
}

function vassal_ic_rating(lord: Lord, spend: number, report: boolean) {
	let rating = common_ic_rating(lord, spend, report)

	// Note: use of game.vassal
	if (game.active === LANCASTER)
		rating -= data.vassals[game.vassal].influence
	else
		rating += data.vassals[game.vassal].influence

	return rating
}

function parley_ic_rating(lord: Lord, spend: number, report: boolean) {
	let rating = common_ic_rating(lord, spend, report)

	if (game.active === YORK) {
		if (is_event_in_play(EVENT_YORK_RICHARD_OF_YORK)) {
			if (report)
				logevent(EVENT_YORK_RICHARD_OF_YORK)
			rating += 1
		}
	} else {
		if (lord_has_capability(lord, AOW_LANCASTER_IN_THE_NAME_OF_THE_KING)) {
			if (report)
				logcap(AOW_LANCASTER_IN_THE_NAME_OF_THE_KING)
			rating += 1
		}
	}

	return rating
}

function prompt_influence_check(lord: Lord, calc=common_ic) {
	let cost = calc.cost(lord, 0)
	if (calc.success(lord)) {
		view.prompt += ` Influence success for ${cost} IP.`
		view.actions.check = [ 0 ]
	} else {
		let rating = Math.max(1, Math.min(5, calc.rating(lord, 0, false)))

		view.prompt += ` Influence 1-${rating} for ${cost} IP.`

		/* max rating is 5, no need to pay to increase more! */
		if (rating <= 3)
			view.actions.check = [ 0, 1, 2 ]
		else if (rating <= 4)
			view.actions.check = [ 0, 1 ]
		else
			view.actions.check = [ 0 ]
	}
}

function roll_influence_check(what: string, lord: Lord, spend: number, calc=common_ic) {
	let cost = calc.cost(lord, spend)

	reduce_influence(cost)

	if (calc.success(lord)) {
		log(`${what}.`)
		return true
	} else {
		let rating = Math.max(1, Math.min(5, calc.rating(lord, spend, false)))

		let die = roll_die()
		if (die <= rating) {
			log(`${what} 1-${rating}: B${die}`)
			calc.rating(lord, spend, true)
			return true
		} else {
			log(`${what} 1-${rating}: W${die}`)
			calc.rating(lord, spend, true)
			return false
		}
	}
}

const common_ic = { cost: common_ic_cost, rating: common_ic_rating, success: common_ic_success }
const vassal_ic = { cost: vassal_ic_cost, rating: vassal_ic_rating, success: vassal_ic_success }
const parley_ic = { cost: parley_ic_cost, rating: parley_ic_rating, success: parley_ic_success }

// === 2.0 SETUP ===

function goto_setup_lords() {
	if (game.scenario === SCENARIO_III) {
		set_active(YORK)
		game.state = "my_kingdom_for_a_horse_setup"
		return
	}
	goto_start_game()
}

// === 3.1 LEVY: ARTS OF WAR (FIRST TURN) ===

function goto_start_game() {
	set_active(P1)
	log_h1("Levy " + current_turn_name())
	goto_levy_arts_of_war_first()
}

function discard_card_capability(c: Card) {
	log(`Discard C${c}.`)
}

function discard_card_event(c: Card) {
	log(`Discard E${c}.`)
}

function goto_levy_arts_of_war_first() {
	log_h2_active("Arts of War - " + game.active)
	game.state = "levy_arts_of_war_first"
	game.arts_of_war = draw_two_cards()
}

function resume_levy_arts_of_war_first() {
	if (game.arts_of_war.length === 0)
		end_levy_arts_of_war_first()
}

states.levy_arts_of_war_first = {
	inactive: "Arts of War",
	prompt() {
		let c = game.arts_of_war[0]
		view.arts_of_war = game.arts_of_war
		view.what = c
		let discard = true
		for (let lord of data.cards[c].lords) {
			if (is_lord_on_map(lord) && !lord_already_has_capability(lord, c) && can_add_lord_capability(lord)) {
				gen_action_lord(lord)
				discard = false
			}
		}
		if (discard) {
			view.prompt = `Arts of War: Discard ${data.cards[c].capability}.`
			view.actions.discard = 1
		} else {
			view.prompt = `Arts of War: Assign ${data.cards[c].capability} to a lord.`
		}
	},
	lord(lord) {
		push_undo()
		let c = game.arts_of_war.shift()
		log("Assign Capability.")
		add_lord_capability(lord, c)
		capability_muster_effects_common(lord, c)
		resume_levy_arts_of_war_first()
	},
	discard() {
		push_undo()
		let c = game.arts_of_war.shift()
		discard_card_capability(c)
		resume_levy_arts_of_war_first()
	},
}

function end_levy_arts_of_war_first() {
	delete game.arts_of_war
	set_active_enemy()
	if (game.active === P2)
		goto_levy_arts_of_war_first()
	else
		goto_muster_exiles()
}

// === 3.1 LEVY: ARTS OF WAR ===

function goto_levy_arts_of_war() {
	log_h2_active("Arts of War - " + game.active)
	game.arts_of_war = draw_two_cards()
	resume_levy_arts_of_war()
}

function resume_levy_arts_of_war() {
	game.state = "levy_arts_of_war"
	if (game.arts_of_war.length === 0)
		end_levy_arts_of_war()
}

states.levy_arts_of_war = {
	inactive: "Arts of War",
	prompt() {
		let c = game.arts_of_war[0]
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

		// allow playing this Held card immediately
		if (c === EVENT_YORK_SUN_IN_SPLENDOUR) {
			view.prompt = `Arts of War: Play or hold ${data.cards[c].event}.`
			view.actions.hold = 1
			view.actions.play = 1
		}
	},
	play() {
		if (game.arts_of_war[0] === EVENT_YORK_SUN_IN_SPLENDOUR)
			push_undo()
		let c = game.arts_of_war.shift()
		log(`Play E${c}.`)
		goto_immediate_event(c)
	},
	hold() {
		let c = game.arts_of_war.shift()
		log("Held Event.")
		if (game.active === YORK)
			set_add(game.hand_y, c)
		else
			set_add(game.hand_l, c)
		resume_levy_arts_of_war()
	},
	discard() {
		let c = game.arts_of_war.shift()
		discard_card_event(c)
		resume_levy_arts_of_war()
	},
}

function end_levy_arts_of_war() {
	delete game.arts_of_war
	discard_events("now")
	set_active_enemy()
	if (game.active === P2)
		goto_levy_arts_of_war()
	else
		goto_pay()
}

// === 3.2 LEVY: PAY TROOPS ===

function goto_pay() {
	log_h2_active("Pay - " + game.active)
	goto_pay_troops()
}

function end_pay() {
	set_active_enemy()
	if (game.active === P2)
		goto_pay()
	else
		goto_muster_exiles()
}

function reset_unpaid_lords(here: Locale) {
	for (let lord of all_friendly_lords()) {
		if (is_lord_unfed(lord) && get_lord_locale(lord) === here) {
			// Note: Percy's Power only affects Pay -- so will never end up here
			set_lord_unfed(lord, Math.ceil(count_lord_all_forces(lord) / 6))
		}
	}
}

function goto_pay_troops() {
	for (let lord of all_friendly_lords()) {
		let here = get_lord_locale(lord)
		let n = Math.ceil(count_lord_all_forces(lord) / 6)
		if (lord_has_capability(lord, AOW_LANCASTER_MADAME_LA_GRANDE) && is_at_or_adjacent_to_lancastrian_english_channel_port(here)) {
			logcap(AOW_LANCASTER_MADAME_LA_GRANDE)
			add_lord_assets(lord, COIN, 1)
		}
		if (lord_has_capability(lord, AOW_LANCASTER_PERCYS_POWER) && is_lord_in_north(lord)) {
			logcap(AOW_LANCASTER_PERCYS_POWER)
			n = 0
		}
		set_lord_unfed(lord, n)
	}
	resume_pay_troops()
}

function resume_pay_troops() {
	game.who = NOBODY
	game.state = "pay_troops"
	for (let lord of all_friendly_lords())
		if (is_lord_unfed(lord))
			return
	goto_pay_lords()
}

states.pay_troops = {
	inactive: "Pay",
	prompt() {
		view.prompt = "Pay Troops."
		let done = true

		// Pay from own mat
		if (done) {
			for (let lord of all_friendly_lords()) {
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
			view.prompt = "Pay Troops: Pay lords with shared coin."
			for (let lord of all_friendly_lords()) {
				if (is_lord_unfed(lord) && can_pay_from_shared(lord, 1)) {
					gen_action_lord(lord)
					done = false
				}
			}
		}

		// Pillage
		if (done) {
			view.prompt = "Pay Troops: Pillage with lords who have unpaid troops."
			for (let lord of all_friendly_lords()) {
				if (is_lord_unfed(lord) && can_pillage(get_lord_locale(lord))) {
					gen_action_lord(lord)
					done = false
				}
			}
		}

		// Disband
		if (done) {
			view.prompt = "Pay Troops: Disband lords who have unpaid troops."
			for (let lord of all_friendly_lords()) {
				if (is_lord_unfed(lord)) {
					gen_action_lord(lord)
					done = false
				}
			}
		}

		// All done!
		if (done) {
			throw "IMPOSSIBLE"
		}
	},
	coin(lord) {
		push_undo()
		add_lord_assets(lord, COIN, -1)
		pay_lord(lord)
		resume_pay_troops()
	},
	lord(lord) {
		push_undo()
		let here = get_lord_locale(lord)
		game.who = lord
		if (can_pay_from_shared(lord, 1)) {
			game.state = "pay_troops_shared"
		} else if (can_pillage(here)) {
			reset_unpaid_lords(here)
			game.state = "pay_troops_pillage"
		} else {
			game.state = "pay_troops_disband"
		}
	},
}

states.pay_troops_shared = {
	inactive: "Pay",
	prompt() {
		view.prompt = `Pay Troops: Pay ${lord_name[game.who]}'s troops with shared coin.`
		let loc = get_lord_locale(game.who)
		for (let lord of all_friendly_lords()) {
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
		resume_pay_troops_shared()
	},
}

function resume_pay_troops_shared() {
	if (!is_lord_unfed(game.who) || !can_pay_from_shared(game.who, 1))
		resume_pay_troops()
}

states.pay_troops_pillage = {
	inactive: "Pay",
	prompt() {
		let here = get_lord_locale(game.who)
		view.prompt = `Pay Troops: Pillage ${locale_name[here]} with ${lord_name[game.who]}.`
		view.actions.pillage = 1
	},
	pillage() {
		do_pillage(game.who)
		resume_pay_troops()
	},
}

states.pay_troops_disband = {
	inactive: "Pay",
	prompt() {
		view.prompt = `Pay Troops: Disband ${lord_name[game.who]}.`
		view.actions.disband = 1
	},
	disband() {
		do_pillage_disband(game.who)
		resume_pay_troops()
	},
}

// === 3.2.1 PILLAGE ===

function can_pillage(loc: Locale) {
	return !is_sea(loc) && !is_exile_box(loc) && !has_exhausted_marker(loc)
}

function do_pillage(lord: Lord) {
	let here = get_lord_locale(lord)

	// Same values as Taxing.
	let n = get_tax_amount(here, lord)
	add_lord_assets(lord, COIN, n)
	add_lord_assets(lord, PROV, n)
	reduce_influence(4 * n)

	log(`Pillage at S${here}.`)

	add_exhausted_marker(here)

	set_favour_enemy(here)
	for (let next of data.locales[here].adjacent)
		shift_favour_away(next)
}

function do_pillage_disband(lord: Lord) {
	disband_influence_penalty(lord)
	// shipwreck if unfed at sea
	if (is_lord_at_sea(lord))
		shipwreck_lord(lord)
	else
		disband_lord(lord)
}

// === 3.2.2 PAY LORDS ===

function has_unpaid_lords() {
	for (let lord of all_friendly_lords())
		if (is_lord_unfed(lord))
			return true
	return false
}

function goto_pay_lords() {
	log_br()

	for (let lord of all_friendly_lords()) {
		if (is_lord_on_map(lord)) {
			if (lord_has_capability(lord, AOW_LANCASTER_PERCYS_POWER) && is_lord_in_north(lord))
				continue
			set_lord_unfed(lord, 1)
		}
	}

	if (has_unpaid_lords()) {
		log_h3("Pay Lords")
		game.who = NOBODY
		game.state = "pay_lords"
	} else {
		goto_pay_vassals()
	}
}

function resume_pay_lords() {
	game.who = NOBODY
	if (!has_unpaid_lords())
		goto_pay_vassals()
}

function count_pay_lord_influence_cost() {
	let n = 0
	for (let lord of all_friendly_lords())
		if (is_lord_on_map(lord) && is_lord_unfed(lord))
			n += is_exile_box(get_lord_locale(lord)) ? 2 : 1
	return n
}

states.pay_lords = {
	inactive: "Pay",
	prompt() {
		if (game.who === NOBODY) {
			let total = count_pay_lord_influence_cost()
			view.prompt = `Pay Lords: Pay influence or disband your lords. Pay ${total} for all lords.`
			for (let lord of all_friendly_lords())
				if (is_lord_on_map(lord) && is_lord_unfed(lord))
					gen_action_lord(lord)

			view.actions.pay_all = 1
		} else {
			let total = is_exile_box(get_lord_locale(game.who)) ? 2 : 1
			view.prompt = `Pay Lords: Pay ${total} influence or disband ${lord_name[game.who]}.`
			view.actions.disband = 1
			view.actions.pay = 1
		}
	},
	lord(lord) {
		push_undo()
		game.who = lord
	},
	disband() {
		disband_lord(game.who)
		resume_pay_lords()
	},
	pay() {
		reduce_influence(is_exile_box(get_lord_locale(game.who)) ? 2 : 1)
		log("Pay L" + game.who + ".")
		set_lord_moved(game.who, 0)
		resume_pay_lords()
	},
	pay_all() {
		push_undo()
		for (let lord of all_friendly_lords()) {
			if (is_lord_on_map(lord) && is_lord_unfed(lord)) {
				reduce_influence(is_exile_box(get_lord_locale(lord)) ? 2 : 1)
				log("Pay L" + lord + ".")
				set_lord_moved(lord, 0)
			}
		}
		goto_pay_vassals()
	},
}

// === 3.2.3 PAY VASSALS ===

function has_unpaid_vassals() {
	let result = false
	for_each_unpaid_vassal(_ => {
		result = true
	})
	return result
}

function for_each_unpaid_vassal(f) {
	for (let v of all_vassals) {
		let lord = get_vassal_lord(v)
		if (is_friendly_lord(lord) && get_vassal_service(v) === current_turn()) {
			if (lord_has_capability(lord, AOW_LANCASTER_PERCYS_POWER) && is_lord_in_north(lord))
				continue
			f(v)
		}
	}
}

function goto_pay_vassals() {
	if (has_unpaid_vassals()) {
		log_h3("Pay Vassals")
		game.state = "pay_vassals"
		game.vassal = NOVASSAL
	} else {
		goto_pay_done()
	}
}

function resume_pay_vassals() {
	game.vassal = NOVASSAL
	if (!has_unpaid_vassals())
		goto_pay_done()
}

function pay_vassal(vassal: Vassal) {
	reduce_influence(1)
	log("Pay V" + vassal + ".")
	set_vassal_lord_and_service(vassal, get_vassal_lord(vassal), current_turn() + 1)
}

states.pay_vassals = {
	inactive: "Pay",
	prompt() {
		if (game.vassal === NOVASSAL) {
			let total = 0
			for_each_unpaid_vassal(v => {
				gen_action_vassal(v)
				total += 1
			})
			view.prompt = `Pay Vassals: Pay influence or disband your vassals in the current turn's calendar box. Pay ${total} for all vassals.`
			view.actions.pay_all = 1
		} else {
			view.prompt = `Pay Vassals: Pay 1 influence or disband ${vassal_name[game.vassal]}.`
			view.vassal = game.vassal
			view.actions.disband = 1
			view.actions.pay = 1
		}
	},
	vassal(v) {
		push_undo()
		game.vassal = v
	},
	pay() {
		pay_vassal(game.vassal)
		resume_pay_vassals()
	},
	disband() {
		disband_vassal(game.vassal)
		resume_pay_vassals()
	},
	pay_all() {
		push_undo()
		for_each_unpaid_vassal(v => {
			pay_vassal(v)
		})
		goto_pay_done()
	},
}

// === 3.2.X PAY DONE ===

function goto_pay_done() {
	game.state = "pay_done"
}

states.pay_done = {
	inactive: "Pay",
	prompt() {
		view.prompt = "Pay: All done."
		view.actions.end_pay = 1
	},
	end_pay() {
		end_pay()
	},
}

// === 3.2.4 DISBAND ===

function clear_lord(lord: Lord) {
	for_each_vassal_with_lord(lord, disband_vassal)

	discard_lord_capability_n(lord, 0)
	discard_lord_capability_n(lord, 1)

	for (let x of all_asset_types)
		set_lord_assets(lord, x, 0)

	for (let x of all_force_types) {
		set_lord_forces(lord, x, 0)
		set_lord_routed_forces(lord, x, 0)
	}

	set_lord_moved(lord, 0)

	check_capture_of_the_king()
}

function remove_lord(lord: Lord) {
	log(`Remove L${lord}.`)
	set_lord_locale(lord, NOWHERE)
	clear_lord(lord)
}

function death_lord(lord: Lord) {
	if (game.scenario === SCENARIO_II) {
		if (lord === LORD_WARWICK_L && game.battle.attacker === YORK)
			foreign_haven_shift_lords()
	}
	log(`Dead L${lord}.`)
	set_lord_locale(lord, NOWHERE)
	clear_lord(lord)
}

function shipwreck_lord(lord: Lord) {
	log(`Shipwreck L${lord}.`)
	set_lord_locale(lord, NOWHERE)
	clear_lord(lord)
}

function disband_lord(lord: Lord) {
	let from = get_lord_locale(lord)
	set_lord_calendar(lord, current_turn() + (6 - get_lord_influence(lord)))
	if (is_exile_box(from))
		set_lord_in_exile(lord)
	log(`Disband L${lord} to T${get_lord_calendar(lord)}.`)
	clear_lord(lord)
}

function exile_lord(lord: Lord) {
	if (lord_has_capability(lord, AOW_YORK_ENGLAND_IS_MY_HOME) && !is_event_in_play(EVENT_LANCASTER_BLOCKED_FORD)) {
		logcap(AOW_YORK_ENGLAND_IS_MY_HOME)
		log(`Disband L${lord} to T${current_turn() + 1}`)
		set_lord_calendar(lord, current_turn() + 1)
		clear_lord(lord)
	} else {
		set_lord_calendar(lord, current_turn() + 6 - get_lord_influence(lord))
		set_lord_in_exile(lord)
		log(`Exile L${lord} to T${get_lord_calendar(lord)}.`)
		clear_lord(lord)
	}
}

// === 3.3.1 MUSTER EXILES ===

function can_muster_exile(lord) {
	if (is_lord_in_exile(lord)) {
		let turn = get_lord_calendar(lord)
		if (turn <= current_turn())
			return true
		if (game.active === LANCASTER && is_event_in_play(EVENT_LANCASTER_BE_SENT_FOR))
			return true
	}
	return false
}

function goto_muster_exiles() {
	for (let lord of all_friendly_lords()) {
		if (can_muster_exile(lord)) {
			if (game.active === P1)
				log_h2_common("Muster Exiles")
			game.state = "muster_exiles"
			return
		}
	}
	end_muster_exiles()
}

function end_muster_exiles() {
	set_active_enemy()
	if (game.active === P1) {
		// TODO: check for campaign victory if no lords were able to muster?
		goto_ready_vassals()
	} else {
		goto_muster_exiles()
	}
}

function can_use_exile_box(lord: Lord, loc: Locale) {
	// Ia: Allied Networks
	if (game.scenario === SCENARIO_IA) {
		if (lord === LORD_HENRY_VI || lord === LORD_SOMERSET_1)
			return loc === LOC_SCOTLAND
		if (lord === LORD_NORTHUMBERLAND_L || lord === LORD_EXETER_1 || lord === LORD_BUCKINGHAM)
			return loc === LOC_FRANCE
		if (lord === LORD_YORK || lord === LORD_RUTLAND)
			return loc === LOC_IRELAND
		if (lord === LORD_MARCH || lord === LORD_WARWICK_Y || lord === LORD_SALISBURY)
			return loc === LOC_BURGUNDY
		throw "BAD ALLIED NETWORK DATA"
	}

	return has_favour_in_locale(game.active, loc)
}

states.muster_exiles = {
	inactive: "Muster Exiles",
	prompt() {
		if (game.who === NOBODY) {
			view.prompt = "Muster Exiles: Muster any exiled lords."
			let done = true
			for (let lord of all_friendly_lords()) {
				if (can_muster_exile(lord)) {
					gen_action_lord(lord)
					done = false
				}
			}
			if (done)
				view.prompt = "Muster Exiles: All done."
			view.actions.done = true
		} else {
			view.prompt = `Muster Exiles: Muster ${lord_name[game.who]} at an exile box.`
			for (let loc of all_exile_boxes) {
				if (can_use_exile_box(game.who, loc))
					gen_action_locale(loc)
			}
		}

	},
	lord(lord) {
		push_undo()
		game.who = lord
	},
	locale(loc) {
		log(`L${game.who} to S${loc}.`)

		muster_lord_in_exile(game.who, loc)

		if (game.scenario === SCENARIO_II) {
			if (game.who === LORD_MARGARET && loc === LOC_FRANCE) {
				if (is_lord_in_play(LORD_CLARENCE)) {
					game.state = "shaky_allies"
					game.who = LORD_CLARENCE
					return
				}
			}
		}

		game.who = NOBODY
	},
	done() {
		end_muster_exiles()
	},
}

function muster_lord_in_exile(lord: Lord, exile_box: Locale) {
	muster_lord(lord, exile_box)
}

// === SCENARIO II: SHAKY ALLIES ===

function is_move_allowed(who: Lord, to: Locale) {
	if (game.scenario === SCENARIO_II) {
		if (who === LORD_WARWICK_L && get_lord_locale(LORD_MARGARET) === to)
			return false
		if (who === LORD_MARGARET && get_lord_locale(LORD_WARWICK_L) === to)
			return false
	}
	return true
}

function is_group_move_forbidden(group: Lord[], to: Locale) {
	if (game.scenario === SCENARIO_II) {
		for (let lord of group)
			if (!is_move_allowed(lord, to))
				return true
	}
	return false
}

states.shaky_allies = {
	inactive: "Shaky Allies",
	prompt() {
		view.prompt = "Shaky Allies: Remove Clarence from play."
		gen_action_lord(LORD_CLARENCE)
	},
	lord(lord) {
		log("Shaky Allies.")
		remove_lord(lord)
		game.state = "muster_exiles"
		game.who = NOBODY
	},
}

// === 3.3.2 READY VASSALS ===

function goto_ready_vassals() {
	for (let vassal of all_vassals) {
		if (get_vassal_service(vassal) === current_turn()) {
			set_vassal_lord_and_service(vassal, VASSAL_READY, 0)
		}
	}

	goto_muster()
}

// === 3.4 MUSTER ===

function goto_muster() {
	clear_lords_moved()

	game.levy_flags = {
		gloucester_as_heir: 0,
		jack_cade: 0,
		loyalty_and_trust: 0,
		my_crown_is_in_my_heart: 0,
		parliament_votes: 0,
		succession: 0,
		thomas_stanley: 0,
	}

	if (is_event_in_play(EVENT_YORK_LOYALTY_AND_TRUST))
		if (game.active === YORK)
			game.levy_flags.loyalty_and_trust = 1

	log_h2_active("Muster - " + game.active)

	game.state = "muster"
}

function end_muster() {
	clear_lords_moved()
	set_active_enemy()
	if (game.active === P2)
		goto_muster()
	else
		goto_levy_discard_events()
}

function can_lord_muster(lord: Lord) {
	return is_lord_on_map(lord) && !get_lord_moved(lord)
}

function has_locale_to_muster(lord: Lord) {
	// Can muster at own seat without enemy lord.
	let seat = get_lord_seat(lord)
	if (!has_enemy_lord(seat))
		if (is_move_allowed(lord, seat))
			return true

	// Else, can muster at any friendly seat (of a friendly lord who is also in play)
	for (let other of all_friendly_lords()) {
		let other_seat = get_lord_seat(other)
		if (is_lord_in_play(other) && is_friendly_locale(other_seat))
			if (is_move_allowed(lord, other_seat))
				return true
	}

	// Tough luck!
	return false
}

states.muster = {
	inactive: "Muster",
	prompt() {
		view.prompt = "Muster: Muster with your lords."

		prompt_held_event_at_levy()

		let done = true
		for (let lord of all_friendly_lords()) {
			if (can_lord_muster(lord)) {
				gen_action_lord(lord)
				done = false
			}
		}

		if (done) {
			view.prompt = "Muster: All done."
			view.actions.end_muster = 1
		}
	},
	lord(lord) {
		push_undo()

		log_h3(`L${lord} at S${get_lord_locale(lord)}`)

		game.state = "muster_lord"
		game.command = lord

		// My Kingdom for a Horse!
		if (game.scenario === SCENARIO_III && game.command === LORD_GLOUCESTER_2 && get_lord_locale(game.command) == LOC_LONDON) {
			game.state = "my_kingdom_for_a_horse_muster"
			return
		}

		apply_lordship_effects()
	},
	end_muster() {
		end_muster()
	},
	card: action_held_event_at_levy,
}

function resume_muster_lord() {
	game.state = "muster_lord"

	// Pay for Levy action
	--game.actions

	// Muster over unless there are more actions possible
	if (game.actions === 0 && !has_free_parley_levy() && !has_free_levy_troops()) {
		set_lord_moved(game.command, 1)
		game.command = NOBODY
		game.state = "muster"
	}
}

states.muster_lord = {
	inactive: "Muster",
	prompt() {
		if (game.actions === 1)
			view.prompt = `Muster: ${lord_name[game.command]} has ${game.actions} action.`
		else
			view.prompt = `Muster: ${lord_name[game.command]} has ${game.actions} actions.`

		let here = get_lord_locale(game.command)

		if (game.actions > 0) {
			// show "always" actions
			view.actions.parley = 0
			view.actions.take_ship = 0
			view.actions.take_cart = 0
			view.actions.capability = 0
			view.actions.levy_troops = 0

			if (can_action_parley_levy())
				view.actions.parley = 1

			// Levy Vassal (event overrides need for friendly stronghold)
			for (let vassal of all_vassals)
				if (can_levy_vassal(vassal))
					gen_action_vassal(vassal)

			if (is_friendly_locale(here)) {
				// Levy another ready Lord
				for (let lord of all_friendly_lords()) {
					if (is_lord_ready(lord) && has_locale_to_muster(lord))
						gen_action_lord(lord)
				}

				// Add Transport
				if (can_add_transport_ship(game.command, here))
					view.actions.take_ship = 1
				if (can_add_transport_cart(game.command))
					view.actions.take_cart = 1

				// Add Capability
				if (can_add_lord_capability(game.command))
					view.actions.capability = 1

				if (!is_rising_wages() || can_pay_from_shared(game.command, 1)) {
					if (can_add_troops(here))
						view.actions.levy_troops = 1
					if (can_add_troops_beloved_warwick(game.command, here))
						view.actions.levy_beloved_warwick = 1
					if (can_add_troops_irishmen(game.command, here))
						view.actions.levy_irishmen = 1
					if (can_add_troops_coa(game.command, here))
						view.actions.commission_of_array = 1
				}
				if (!is_rising_wages() || can_pay_from_shared(game.command, 2)) {
					if (can_add_troops_sof(game.command, here))
						view.actions.soldiers_of_fortune = 1
				}
			}

		} else {
			if (has_free_parley_levy())
				if (can_action_parley_levy())
					view.actions.parley = 1

			if (is_friendly_locale(here)) {
				if (has_free_levy_troops()) {
					if (!is_rising_wages() || can_pay_from_shared(game.command, 1)) {
						if (can_add_troops(here))
							view.actions.levy_troops = 1
						if (can_add_troops_coa(game.command, here))
							view.actions.commission_of_array = 1
					}
				}
			}
		}

		if (game.levy_flags.loyalty_and_trust) {
			view.actions.loyalty_and_trust = 1
		}

		view.actions.done = 1
	},

	lord(lord) {
		push_undo()
		push_the_kings_name()
		game.who = lord
		game.state = "levy_lord"
	},

	vassal(vassal) {
		push_undo()
		push_the_kings_name()
		game.vassal = vassal
		game.state = "levy_vassal"
	},

	take_ship() {
		push_undo()
		push_the_kings_name()
		log("Levy Transport.")
		if (can_naval_blockade(get_lord_locale(game.command)))
			game.state = "blockade_levy_ship"
		else
			do_levy_ship()
	},

	take_cart() {
		push_undo()
		push_the_kings_name()
		log("Levy Transport.")
		add_lord_assets(game.command, CART, 2)
		goto_the_kings_name("Levy Cart")
	},

	levy_troops() {
		push_undo()
		push_the_kings_name()
		log("Levy Troops.")
		do_levy_troops()
	},

	levy_beloved_warwick() {
		push_undo()
		push_the_kings_name()
		log("Levy Troops.")
		logcap(AOW_YORK_BELOVED_WARWICK)
		add_lord_forces(game.command, MILITIA, 5)
		end_levy_troops()
	},

	levy_irishmen() {
		push_undo()
		push_the_kings_name()
		log("Levy Troops.")
		logcap(AOW_YORK_IRISHMEN)
		add_lord_forces(game.command, MILITIA, 5)
		end_levy_troops()
	},

	soldiers_of_fortune() {
		push_undo()
		push_the_kings_name()
		log("Levy Troops.")
		logcap(AOW_YORK_SOLDIERS_OF_FORTUNE)
		game.state = "soldiers_of_fortune"
	},

	commission_of_array() {
		push_undo()
		push_the_kings_name()
		log("Levy Troops.")
		logcap(AOW_LANCASTER_COMMISSION_OF_ARRAY)
		game.state = "commission_of_array"
	},

	capability() {
		push_undo()
		push_the_kings_name()
		log("Levy Capability.")
		game.state = "levy_capability"
	},

	parley() {
		push_undo()
		push_the_kings_name()
		goto_parley_levy()
	},

	loyalty_and_trust() {
		push_undo()
		logevent(EVENT_YORK_LOYALTY_AND_TRUST)
		game.actions += 3
		game.levy_flags.loyalty_and_trust = 0
	},

	done() {
		set_lord_moved(game.command, 1)
		game.command = NOBODY
		game.state = "muster"
	},
}

states.blockade_levy_ship = {
	inactive: "Muster",
	prompt() {
		view.prompt = "Levy Ship: Warwick may naval blockade this levy ship action."
		view.actions.roll = 1
	},
	roll() {
		if (roll_blockade("Levy Ship"))
			do_levy_ship()
		else
			resume_muster_lord()
	},
}

function do_levy_ship() {
	push_the_kings_name()
	add_lord_assets(game.command, SHIP, 1)
	goto_the_kings_name("Levy Ship")
}

function chamberlains_eligible_levy(loc: Locale) {
	if (lord_has_capability(game.command, AOW_LANCASTER_CHAMBERLAINS)) {
		for (let vassal of all_vassals)
			if (is_vassal_mustered_with(vassal, game.command) && loc === get_vassal_seat(vassal))
				return true
	}
	return false
}

function do_levy_troops() {
	let here = get_lord_locale(game.command)

	if (lord_has_capability(game.command, AOW_YORK_WOODVILLES))
		logcap(AOW_YORK_WOODVILLES)
	else if (lord_has_capability(game.command, AOW_LANCASTER_QUARTERMASTERS))
		logcap(AOW_LANCASTER_QUARTERMASTERS)
	else if (chamberlains_eligible_levy(here))
		logcap(AOW_LANCASTER_CHAMBERLAINS)
	else
		deplete_locale(here)

	let here_type = data.locales[here].type
	switch (here_type) {
		case "calais":
			add_lord_forces(game.command, MEN_AT_ARMS, 2)
			add_lord_forces(game.command, LONGBOWMEN, 1)
			break
		case "london":
			add_lord_forces(game.command, MEN_AT_ARMS, 1)
			add_lord_forces(game.command, LONGBOWMEN, 1)
			add_lord_forces(game.command, MILITIA, 1)
			break
		case "harlech":
			add_lord_forces(game.command, MEN_AT_ARMS, 1)
			add_lord_forces(game.command, LONGBOWMEN, 2)
			break
		case "city":
			add_lord_forces(game.command, LONGBOWMEN, 1)
			add_lord_forces(game.command, MILITIA, 1)
			break
		case "town":
			add_lord_forces(game.command, MILITIA, 2)
			break
		case "fortress":
			add_lord_forces(game.command, MEN_AT_ARMS, 1)
			add_lord_forces(game.command, MILITIA, 1)
			break
	}

	end_levy_troops()
}

function end_levy_troops() {

	if (game.levy_flags.thomas_stanley === 1) {
		logcap(AOW_LANCASTER_THOMAS_STANLEY)
		++game.actions
		game.levy_flags.thomas_stanley = 0
	}

	goto_rising_wages()
}

// === 3.4.2 LEVY LORD ===

states.levy_lord = {
	inactive: "Muster",
	prompt() {
		view.prompt = `Levy Lord: ${lord_name[game.who]}.`
		prompt_influence_check(game.command)
	},
	check(spend) {
		if (roll_influence_check("Levy L" + game.who, game.command, spend)) {
			game.state = "levy_lord_at_seat"
		} else {
			resume_muster_lord()
		}
	},
}

states.levy_lord_at_seat = {
	inactive: "Muster",
	prompt() {
		view.prompt = `Levy Lord: Choose a stronghold for ${lord_name[game.who]}.`
		let found = false
		let seat = get_lord_seat(game.who)
		if (!has_enemy_lord(seat) && is_move_allowed(game.who, seat)) {
			gen_action_locale(seat)
			found = true
		}

		if (!found) {
			for (let lord of all_friendly_lords()) {
				let seat = get_lord_seat(lord)
				if ((is_lord_on_map(lord) || is_lord_on_calendar(lord)) && is_friendly_locale(seat)) {
					if (is_move_allowed(game.who, seat))
						gen_action_locale(seat)
				}
			}
		}
	},
	locale(loc) {
		push_undo()

		logi(`at S${loc}`)

		set_lord_moved(game.who, 1)
		muster_lord(game.who, loc)
		levy_burgundians(game.who)

		if (game.active === YORK) {
			add_york_favour(loc)
			remove_lancaster_favour(loc)
		} else {
			if (loc === LOC_LONDON && has_york_favour(LONDON_FOR_YORK)) {
				logevent(EVENT_YORK_LONDON_FOR_YORK)
			} else {
				add_lancaster_favour(loc)
				remove_york_favour(loc)
			}
		}

		game.who = NOBODY
		goto_the_kings_name("Levy Lord")
	},
}

// === 3.4.3 LEVY VASSAL ===

function can_levy_vassal(vassal: Vassal) {
	let here = get_lord_locale(game.command)
	let seat = get_vassal_seat(vassal)

	if (!is_vassal_ready(vassal))
		return false

	// Margaret Beaufort overrides all!
	if (game.command === LORD_HENRY_TUDOR && is_event_in_play(EVENT_LANCASTER_MARGARET_BEAUFORT))
		return true

	// Yorkist Block Parliament (except when overridden by The Earl of Richmond)
	if (game.active === LANCASTER && is_event_in_play(EVENT_YORK_YORKISTS_BLOCK_PARLIAMENT) && !is_event_in_play(EVENT_LANCASTER_THE_EARL_OF_RICHMOND))
		return false

	if (is_friendly_locale(here) && is_friendly_locale(seat) && !has_enemy_lord(seat))
		return true

	return false
}

states.levy_vassal = {
	inactive: "Muster",
	prompt() {
		view.prompt = `Levy Vassal: ${vassal_name[game.vassal]}.`
		view.vassal = game.vassal
		prompt_influence_check(game.command, vassal_ic)
	},
	check(spend) {
		if (roll_influence_check("Levy V" + game.vassal, game.command, spend, vassal_ic)) {
			muster_vassal(game.vassal, game.command)
			game.vassal = NOVASSAL
			goto_the_kings_name("Levy Vassal")
		} else {
			resume_muster_lord()
		}
	},
}

// === 3.4.4 LEVY TROOPS ===

function has_free_levy_troops() {
	if (game.levy_flags.thomas_stanley) {
		let here = get_lord_locale(game.command)
		if (!is_rising_wages() || can_pay_from_shared(game.command, 1)) {
			if (can_add_troops(here))
				return true
			if (can_add_troops_coa(game.command, here))
				return true
		}
	}
	return false
}

function can_add_troops(locale: Locale) {
	if (!has_exhausted_marker(locale) && !is_exile_box(locale))
		return true
	return false
}

function can_add_troops_coa(lord: Lord, here: Locale) {
	if (lord_has_capability(lord, AOW_LANCASTER_COMMISSION_OF_ARRAY)) {
		for (let next of data.locales[here].adjacent) {
			if (is_friendly_locale(next) && !has_enemy_lord(next))
				if (can_add_troops(next))
					return true
		}
	}
	return false
}

function can_add_troops_beloved_warwick(lord: Lord, here: Locale) {
	return (
		can_add_troops(here) &&
		lord_has_capability(lord, AOW_YORK_BELOVED_WARWICK)
	)
}

function can_add_troops_irishmen(lord: Lord, here: Locale) {
	return (
		can_add_troops(here) &&
		lord_has_capability(lord, AOW_YORK_IRISHMEN) &&
		(here === LOC_IRELAND || is_adjacent_irish_sea(here))
	)
}

function count_available_mercenaries() {
	let n = 0
	for (let lord of all_lords)
		n += get_lord_forces(lord, MERCENARIES)
	return 6 - n
}

function can_add_troops_sof(lord: Lord, here: Locale) {
	return (
		can_add_troops(here) &&
		lord_has_capability(lord, AOW_YORK_SOLDIERS_OF_FORTUNE) &&
		get_shared_assets(here, COIN) > 0 &&
		count_available_mercenaries() > 0
	)
}

// === 3.4.5 LEVY TRANSPORT

function can_add_transport_ship(who: Lord, here: Locale) {
	if (is_seaport(here) || is_exile_box(here)) {
		if (get_lord_assets(who, SHIP) < 2) {
			let n = 0
			for (let other of all_lords)
				if (other !== who && get_lord_assets(other, SHIP) > 0)
					++n
			if (n < 9)
				return true
		}
	}
	return false
}

function can_add_transport_cart(who: Lord) {
	return get_lord_assets(who, CART) < 15
}

// === 3.4.6 LEVY CAPABILITY ===

function can_add_lord_capability(lord: Lord) {
	if (get_lord_capability(lord, 0) < 0 || get_lord_capability(lord, 1) < 0) {
		for (let c of list_deck())
			if (can_lord_levy_capability_card(lord, c))
				return true
	}
	return false
}

function forbidden_levy_capabilities(c: Card) {
	// Some capabilities override the forbidden levy vassals
	if (lord_has_capability(game.command, AOW_LANCASTER_TWO_ROSES)) {
		if (c === AOW_LANCASTER_THOMAS_STANLEY || c === AOW_LANCASTER_MY_FATHERS_BLOOD) {
			return false
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

function add_lord_capability(lord: Lord, c: Card) {
	if (get_lord_capability(lord, 0) < 0)
		return set_lord_capability(lord, 0, c)
	if (get_lord_capability(lord, 1) < 0)
		return set_lord_capability(lord, 1, c)
	throw new Error("no empty capability slots!")
}

function discard_lord_capability_n(lord: Lord, n: 0 | 1) {
	set_lord_capability(lord, n, NOCARD)
}

function discard_lord_capability(lord: Lord, c: Card) {
	if (get_lord_capability(lord, 0) === c)
		return set_lord_capability(lord, 0, NOCARD)
	if (get_lord_capability(lord, 1) === c)
		return set_lord_capability(lord, 1, NOCARD)
	throw new Error("capability not found")
}

function is_capabality_available_to_lord(c: Card, lord: Lord) {
	return c !== NOCARD && (!data.cards[c].lords || set_has(data.cards[c].lords, lord))
}

function can_lord_levy_capability_card(lord: Lord, c: Card) {
	if (!data.cards[c].lords || set_has(data.cards[c].lords, lord))
		if (!lord_already_has_capability(lord, c) && forbidden_levy_capabilities(c))
			return true
	return false
}

states.levy_capability = {
	inactive: "Muster",
	prompt() {
		let deck = list_deck()
		view.prompt = `Levy Capability: Choose a capability for ${lord_name[game.command]}.`
		view.arts_of_war = deck
		for (let c of deck)
			if (can_lord_levy_capability_card(game.command, c))
				gen_action_card(c)
	},
	card(c) {
		add_lord_capability(game.command, c)
		capability_muster_effects_common(game.command, c)
		capability_muster_effects_levy(game.command, c)
		goto_the_kings_name("Capability C${c}")
	},
}

// === 3.4 MUSTER - DISCARD EVENTS ===

function goto_levy_discard_events() {
	delete game.levy_flags

	// Discard "This Levy" events from play.
	discard_events("this_levy")

	// Discard Held "This Levy" events.
	set_delete(game.events, EVENT_YORK_YORKIST_PARADE)

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
		let my_lords = current === YORK ? all_york_lords : all_lancaster_lords
		view.plan = plan
		view.actions.plan = []

		if (plan.length === max_plan_length())
			view.prompt = "Plan: All done."
		else
			view.prompt = "Plan: Build a campaign plan."

		if (plan.length < max_plan_length()) {
			view.actions.end_plan = 0
			if (count_cards_in_plan(plan, NOBODY) < 7)
				gen_action_plan(NOBODY)

			for (let lord of my_lords) {
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

	if (lord_has_capability(LORD_BUCKINGHAM, AOW_LANCASTER_STAFFORD_ESTATES)) {
		logcap(AOW_LANCASTER_STAFFORD_ESTATES)
		add_lord_assets(LORD_BUCKINGHAM, COIN, 1)
		add_lord_assets(LORD_BUCKINGHAM, PROV, 1)
	}

	goto_command_activation()
}

// === 4.2 CAMPAIGN: COMMAND ===

// First action vs actions that take full command card
function is_first_action() {
	return has_flag(FLAG_FIRST_ACTION)
}

function goto_command_activation() {
	if (game.plan_y.length === 0 && game.plan_l.length === 0) {
		game.command = NOBODY
		goto_end_campaign()
		return
	}

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
		log_h2_active("Pass")
		goto_command_activation()
	} else if (!is_lord_on_map(game.command)) {
		log_h2_active(`L${game.command} - Pass`)
		goto_command_activation()
	} else {
		log_h2_active(`L${game.command} at S${get_lord_locale(game.command)}`)
		goto_command()
	}
}

function goto_command() {
	let here = get_lord_locale(game.command)

	game.actions = data.lords[game.command].command

	if (lord_has_capability(game.command, AOW_LANCASTER_MARRIED_TO_A_NEVILLE)) {
		if (get_lord_locale(LORD_WARWICK_L) === here && is_friendly_locale(here)) {
			logcap(AOW_LANCASTER_MARRIED_TO_A_NEVILLE)
			game.actions += 1
		}
	}
	if (lord_has_capability(game.command, AOW_YORK_THOMAS_BOURCHIER) && is_city(here)) {
		logcap(AOW_YORK_THOMAS_BOURCHIER)
		game.actions += 1
	}
	if (lord_has_capability(game.command, AOW_YORK_YORKS_FAVOURED_SON)) {
		logcap(AOW_YORK_YORKS_FAVOURED_SON)
		game.actions += 1
	}
	if (lord_has_capability(game.command, AOW_YORK_HASTINGS)) {
		logcap(AOW_YORK_HASTINGS)
		game.actions += 1
	}

	game.group = [ game.command ]

	set_flag(FLAG_FIRST_ACTION)
	clear_flag(FLAG_SURPRISE_LANDING)
	clear_flag(FLAG_FIRST_MARCH_HIGHWAY)
	clear_flag(FLAG_MARCH_TO_PORT)
	clear_flag(FLAG_SAIL_TO_PORT)

	resume_command()
}

function resume_command() {
	game.state = "command"
}

// Spending an action reset some flags
function spend_action(cost) {
	clear_flag(FLAG_SURPRISE_LANDING)
	clear_flag(FLAG_FIRST_ACTION)
	clear_flag(FLAG_FIRST_MARCH_HIGHWAY)
	game.actions -= cost
}

function spend_march_action(cost) {
	clear_flag(FLAG_SURPRISE_LANDING)
	clear_flag(FLAG_FIRST_ACTION)
	clear_flag(FLAG_FIRST_MARCH_HIGHWAY)
	game.actions -= cost
}

function spend_sail_action() {
	clear_flag(FLAG_SURPRISE_LANDING)
	clear_flag(FLAG_FIRST_ACTION)
	clear_flag(FLAG_FIRST_MARCH_HIGHWAY)

	if (game.active === LANCASTER && is_event_in_play(EVENT_LANCASTER_SEAMANSHIP)) {
		logevent(EVENT_LANCASTER_SEAMANSHIP)
		game.actions -= 1
	}
	else if (game.active === YORK && is_event_in_play(EVENT_YORK_SEAMANSHIP)) {
		logevent(EVENT_YORK_SEAMANSHIP)
		game.actions -= 1
	}
	else {
		game.actions = 0
	}
}

function spend_all_actions() {
	/* No more actions (including free ones)! */
	clear_flag(FLAG_SURPRISE_LANDING)
	clear_flag(FLAG_FIRST_ACTION)
	clear_flag(FLAG_FIRST_MARCH_HIGHWAY)
	clear_flag(FLAG_MARCH_TO_PORT)
	clear_flag(FLAG_SAIL_TO_PORT)
	game.actions = 0
}

function end_command() {
	log_br()

	game.group = null
	clear_flag(FLAG_FIRST_ACTION)
	clear_flag(FLAG_FIRST_MARCH_HIGHWAY)

	// NOTE: Feed currently acting side first for expedience.
	set_active_command()
	goto_feed()
}

states.command = {
	inactive: "Command",
	prompt() {
		let here = get_lord_locale(game.command)
		if (game.actions === 0)
			view.prompt = `Command: ${lord_name[game.command]} has no more actions.`
		else if (game.actions === 1)
			view.prompt = `Command: ${lord_name[game.command]} has ${game.actions} action.`
		else
			view.prompt = `Command: ${lord_name[game.command]} has ${game.actions} actions.`

		view.group = game.group

		prompt_held_event_at_campaign()

		if (!is_lord_on_map(game.command)) {
			view.prompt = `Command: ${lord_name[game.command]} is not on the map.`
			view.actions.end_command = 1
			return
		}

		if (can_pick_up_lords(game.command)) {
			for_each_friendly_lord_in_locale(here, other => {
				if (can_pick_up_other(game.command, other))
					gen_action_lord(other)
			})
		}

		if (game.actions > 0) {
			// show "always" actions
			view.actions.supply = 0
			view.actions.forage = 0
			view.actions.tax = 0
			if (is_seaport(here) || is_exile_box(here))
				view.actions.sail = 0
			view.actions.parley = 0
			view.actions.pass = 1
		} else {
			view.actions.end_command = 1
		}

		prompt_march()

		if (can_action_supply())
			view.actions.supply = 1
		if (can_action_forage())
			view.actions.forage = 1
		if (can_action_tax())
			view.actions.tax = 1
		if (can_action_sail())
			view.actions.sail = 1
		if (can_action_parley_campaign())
			view.actions.parley = 1
		if (can_action_heralds())
			view.actions.heralds = 1
		if (can_action_merchants())
			view.actions.merchants = 1
		if (can_action_agitators())
			view.actions.agitators = 1

		if (is_york_lord(game.command) && game.group.length === 1)
			if (can_action_exile_pact())
				view.actions.exile_pact = 1
	},

	pass() {
		push_undo()
		log("Pass.")
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
	parley: goto_parley_campaign,

	locale(loc) {
		push_undo()
		goto_march(loc)
	},

	lord(lord) {
		set_toggle(game.group, lord)
	},

	card: action_held_event_at_campaign,
}

// === 4.5 ACTION: SUPPLY ===

/*
	Supply has these possibilities:
		- from exile box to port at same sea (or all seas if great ships)
		- from stronghold via ways to port
		- from stronghold via ways to non-port
	Naval Blockade
		We check source (exile box) and destination (port) only.
		If using great ships to supply from Ireland to port on the north sea,
		and Warwick is in the English Channel, we do not detect this case!
*/

function can_supply_at(source: Locale, ships: number) {
	// if theoretically possible to supply from this source (does not check carts or ships)
	if (is_stronghold(source) && is_friendly_locale(source)) {
		if (ships > 0 && is_seaport(source))
			return true
		if (!has_exhausted_marker(source))
			return true
	}
	return false
}

function search_supply_by_way(result, start: Locale, carts: number, ships: number) {
	search_dist.fill(0)
	search_seen.fill(0)
	search_seen[start] = 1

	let queue = [ start ]
	while (queue.length > 0) {
		let here = queue.shift()
		let dist = search_dist[here]
		let next_dist = dist + 8

		if (can_supply_at(here, ships)) {
			if (result)
				map_set(result, here, dist)
			else
				return true
		}

		if (is_friendly_locale(here)) {
			if ((next_dist >> 3) <= carts) {
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

function search_supply_by_sea(result, here: Locale) {
	// Search via sea from Exile box.
	if (is_friendly_locale(here)) {
		for (let next of find_ports(here, game.command)) {
			if (can_supply_at(next, 1)) {
				if (result)
					map_set(result, next, 0 | find_sea_mask(here) | find_sea_mask(next))
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
	let carts = count_shared_carts(here, true)
	let ships = count_shared_ships(here, true)
	if (ships > 0 && is_exile_box(here))
		result = search_supply_by_sea(result, here)
	result = search_supply_by_way(result, here, carts, ships)
	return result
}


function chamberlains_eligible_supply(source: Locale) {
	if (lord_has_capability(game.command, AOW_LANCASTER_CHAMBERLAINS)) {
		for (let vassal of all_vassals)
			if (is_vassal_mustered_with(vassal, game.command) && source === get_vassal_seat(vassal))
				return true
	}
	return false
}

function quartermasters_eligible_supply(source: Locale) {
	if (lord_has_capability(game.command, AOW_LANCASTER_QUARTERMASTERS)) {
		for (let vassal of all_vassals)
			if (is_vassal_mustered_with(vassal, game.command) && source === get_vassal_seat(vassal))
				return true
	}
	return false
}

function lord_has_stafford_branch(loc: Locale, lord: Lord) {
	if (lord_has_capability(lord, AOW_YORK_STAFFORD_BRANCH)) {
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

function can_action_supply(): boolean {
	if (game.actions < 1)
		return false
	return search_supply(false)
}

function goto_supply() {
	push_undo()
	game.state = "supply_source"
	init_supply()
}

function modify_supply(loc: Locale, supply: number, report: boolean) {
	let here = get_lord_locale(game.command)
	let carts = count_shared_carts(here, true)

	// Must carry supply over land with one cart per provender per way
	let distance = map_get(game.supply, loc, 0) >> 3
	if (distance > 0)
		supply = Math.min(supply, Math.floor(carts / distance))

	// Harbingers capability doubles supply received
	if (lord_has_capability(game.command, AOW_LANCASTER_HARBINGERS)) {
		if (report)
			logcap(AOW_LANCASTER_HARBINGERS)
		supply *= 2
	}
	if (lord_has_capability(game.command, AOW_YORK_HARBINGERS)) {
		if (report)
			logcap(AOW_YORK_HARBINGERS)
		supply *= 2
	}

	return supply
}

function get_port_supply_amount(loc: Locale, report: boolean) {
	if (is_seaport(loc) || is_exile_box(loc)) {
		let here = get_lord_locale(game.command)
		let ships = count_shared_ships(here, true)
		return modify_supply(loc, ships, report)
	}
	return 0
}

function get_stronghold_supply_amount(loc: Locale, report: boolean) {
	if (!has_exhausted_marker(loc)) {
		let supply = 0

		if (loc === LOC_LONDON || loc === LOC_CALAIS)
			supply = 3
		else if (is_city(loc))
			supply = 2
		else
			supply = 1

		if (lord_has_stafford_branch(loc, game.command)) {
			if (report)
				logcap(AOW_YORK_STAFFORD_BRANCH)
			supply += 1
		}

		return modify_supply(loc, supply, report)
	}
	return 0
}

states.supply_source = {
	inactive: "Supply",
	prompt() {
		view.prompt = "Supply: Choose a supply source."

		let here = get_lord_locale(game.command)
		let carts = count_shared_carts(here, true)
		let ships = count_shared_ships(here, true)

		if (carts > 0)
			view.prompt += ` ${carts} Cart.`
		if (ships > 0)
			view.prompt += ` ${ships} Ship.`

		for (let i = 0; i < game.supply.length; i += 2)
			gen_action_locale(game.supply[i] as Locale)
	},
	locale(loc) {
		let port_supply = get_port_supply_amount(loc, false)
		let stronghold_supply = get_stronghold_supply_amount(loc, false)

		if (stronghold_supply > 0 && port_supply === 0) {
			use_stronghold_supply(loc, stronghold_supply)
			end_supply()
			return
		}

		if (port_supply > 0 && stronghold_supply === 0) {
			game.where = loc
			// blockade at source or destination
			if (can_naval_blockade(get_lord_locale(game.command)) || can_naval_blockade(game.where)) {
				game.state = "blockade_supply"
			} else {
				use_port_supply(loc, port_supply)
				end_supply()
			}
			return
		}

		game.where = loc
		game.state = "select_supply_type"
	},
}

function use_stronghold_supply(source: Locale, amount: number) {
	log(`Supply ${amount} from S${source}.`)

	if (lord_has_capability(game.command, AOW_LANCASTER_HAY_WAINS))
		logcap(AOW_LANCASTER_HAY_WAINS)

	add_lord_assets(game.command, PROV, amount)
	if (chamberlains_eligible_supply(source))
		logcap(AOW_LANCASTER_CHAMBERLAINS)
	else if (quartermasters_eligible_supply(source))
		logcap(AOW_LANCASTER_QUARTERMASTERS)
	else
		deplete_locale(source)
}

function use_port_supply(source: Locale, amount: number) {
	log(`Supply ${amount} from S${source} (Port).`)

	if (lord_has_capability(game.command, AOW_LANCASTER_HAY_WAINS))
		logcap(AOW_LANCASTER_HAY_WAINS)
	if (lord_has_capability(game.command, AOW_YORK_GREAT_SHIPS))
		logcap(AOW_YORK_GREAT_SHIPS)
	if (lord_has_capability(game.command, AOW_LANCASTER_GREAT_SHIPS))
		logcap(AOW_LANCASTER_GREAT_SHIPS)

	add_lord_assets(game.command, PROV, amount)
}

function end_supply() {
	spend_action(1)
	resume_command()
	delete game.supply
	game.where = NOWHERE
}

states.select_supply_type = {
	inactive: "Supply",
	prompt() {
		let port = get_port_supply_amount(game.where, false)
		let stronghold = get_stronghold_supply_amount(game.where, false)
		view.prompt = `Supply: ${stronghold} from stronghold or ${port} from port?`
		view.actions.stronghold = 1
		view.actions.port = 1
	},
	stronghold() {
		use_stronghold_supply(game.where, get_stronghold_supply_amount(game.where, true))
		end_supply()
	},
	port() {
		// blockade at source or destination
		if (can_naval_blockade(get_lord_locale(game.command)) || can_naval_blockade(game.where)) {
			game.state = "blockade_supply"
		} else {
			use_port_supply(game.where, get_port_supply_amount(game.where, true))
			end_supply()
		}
	},
}

states.blockade_supply = {
	inactive: "Supply",
	prompt() {
		view.prompt = "Supply: Warwick may naval blockade this supply action."
		view.actions.roll = 1
	},
	roll() {
		if (roll_blockade("Supply"))
			use_port_supply(game.where, get_port_supply_amount(game.where, true))
		end_supply()
	},
}

// === 4.6.1 ACTION: SAIL ===

function has_enough_available_ships_for_army() {
	let ships = count_group_ships(game.group, true)
	let army = count_lord_all_forces(game.command)
	let needed_ships = army / 6
	return needed_ships <= ships
}

function can_sail_to(to: Locale) {
	if (is_sea(to))
		return true
	if (is_wales_forbidden(to))
		return false
	if (has_enemy_lord(to)) {
		if (is_truce_in_effect())
			return false
		if (!lord_has_capability(game.command, AOW_LANCASTER_HIGH_ADMIRAL))
			return false
	}
	if (is_group_move_forbidden(game.group, to))
		return false
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

	// at a seaport (or sea)
	let here = get_lord_locale(game.command)
	if (!is_seaport(here) && !is_sea(here) && !is_exile_box(here))
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
		let ships = count_group_ships(game.group, true)
		let cart = count_group_carts(game.group, true)
		let prov = count_group_provender(game.group)

		let overflow_prov = (prov / 2 - ships) * 2
		let overflow_cart = (cart / 2 - ships) * 2

		if (overflow_prov <= 0 && overflow_cart <= 0) {
			view.prompt = "Sail: Choose a destination port or sea."
			for (let to of find_sail_locales(here)) {
				if (to === here)
					continue
				if (can_sail_to(to))
					gen_action_locale(to)
			}
		} else if (overflow_cart > 0) {
			view.prompt = `Sail: ${ships} ships. Discard ${overflow_cart} carts.`
			if (cart > 0) {
				for (let lord of game.group) {
					if (get_lord_assets(lord, CART) > 0)
						gen_action_cart(lord)
				}
			}
		} else if (overflow_prov > 0) {
			view.prompt = `Sail: ${ships} ships. Discard ${overflow_prov} provender.`
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
		let from = get_lord_locale(game.command)
		if (can_naval_blockade(from) || can_naval_blockade(to)) {
			game.where = to
			game.state = "blockade_sail"
		} else {
			do_sail(to)
		}
	},
}

states.blockade_sail = {
	inactive: "Sail",
	prompt() {
		view.prompt = "Sail: Warwick may naval blockade this sail action."
		view.actions.roll = 1
	},
	roll() {
		let to = game.where
		game.where = NOWHERE
		if (roll_blockade("Sail"))
			do_sail(to)
		else
			fail_sail()
	},
}

function do_sail(to: Locale) {
	log(`Sail to S${to}${format_group_move()}.`)

	if (!is_marshal(game.command) && !is_lieutenant(game.command) && game.group.length > 1)
		logcap(AOW_YORK_CAPTAIN)

	if (lord_has_capability(game.command, AOW_YORK_GREAT_SHIPS))
		logcap(AOW_YORK_GREAT_SHIPS)
	if (lord_has_capability(game.command, AOW_LANCASTER_GREAT_SHIPS))
		logcap(AOW_LANCASTER_GREAT_SHIPS)

	game.sail_from = get_lord_locale(game.command)

	clear_flag(FLAG_MARCH_TO_PORT)
	if (is_seaport(to))
		set_flag(FLAG_SAIL_TO_PORT)
	else
		clear_flag(FLAG_SAIL_TO_PORT)

	for (let lord of game.group) {
		set_lord_locale(lord, to)
		set_lord_moved(lord, 1)
		levy_burgundians(lord)
	}

	spend_sail_action()

	// you can go to enemy lord with norfolk capability
	if (is_seaport(to) && has_enemy_lord(to))
		goto_confirm_approach_sail()
	else
		end_sail()
}

function fail_sail() {
	spend_sail_action()
	end_sail()
}

function goto_confirm_approach_sail() {
	game.state = "confirm_approach_sail"
	clear_flag(FLAG_MARCH_TO_PORT)
	set_flag(FLAG_SAIL_TO_PORT)
	logcap(AOW_LANCASTER_HIGH_ADMIRAL)
}

states.confirm_approach_sail = {
	inactive: "Sail",
	prompt() {
		view.prompt = "Sail: Approach enemy?"
		view.group = game.group
		view.actions.approach = 1
	},
	approach() {
		// no intercept, but PT and blocked ford may be played
		goto_parliaments_truce()
	},
}

function end_sail() {
	delete game.sail_from

	// Disbanded in battle!
	if (!is_lord_on_map(game.command)) {
		game.group = null
		clear_flag(FLAG_MARCH_TO_PORT)
		clear_flag(FLAG_SAIL_TO_PORT)
		spend_all_actions()
	}

	// Discard held events
	set_delete(game.events, EVENT_LANCASTER_BLOCKED_FORD)
	set_delete(game.events, EVENT_YORK_BLOCKED_FORD)

	resume_command()
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
	game.state = "forage"
}

states.forage = {
	inactive: "Forage",
	prompt() {
		let here = get_lord_locale(game.command)
		if (is_friendly_locale(here) && !has_adjacent_enemy(here)) {
			view.prompt = "Forage: Add one provender."
			view.actions.take_prov = 1
		} else if (is_neutral_locale(here) && !has_adjacent_enemy(here)) {
			view.prompt = "Forage: Roll 1-4 to add one provender."
			view.actions.roll = 1
		} else if (is_enemy_locale(here) || has_adjacent_enemy(here)) {
			view.prompt = "Forage: Roll 1-3 to add one provender."
			view.actions.roll = 1
		}
	},
	roll() {
		let here = get_lord_locale(game.command)
		let target = 3
		if (is_neutral_locale(here) && !has_adjacent_enemy(here))
			target = 4

		let die = roll_die()
		if (die <= target) {
			log(`Forage at S${here} 1-${target}: B${die}`)
			add_lord_assets(game.command, PROV, 1)
			deplete_locale(here)
		} else {
			log(`Forage at S${here} 1-${target}: W${die}`)
		}
		end_forage()
	},
	take_prov() {
		let here = get_lord_locale(game.command)
		log(`Forage at S${here}.`)
		add_lord_assets(game.command, PROV, 1)
		deplete_locale(here)
		end_forage()
	},
}

function end_forage() {
	if (lord_has_capability(game.command, AOW_YORK_SCOURERS)) {
		logcap(AOW_YORK_SCOURERS)
		add_lord_assets(game.command, PROV, 1)
	}

	spend_action(1)
	resume_command()
}

// === 4.6.3 ACTION: TAX ===

function can_tax_at(here: Locale, lord: Lord) {
	if (is_friendly_locale(here) && !has_exhausted_marker(here)) {
		// London, Calais, and Harlech
		if (here === LOC_LONDON || here === LOC_CALAIS || here === LOC_HARLECH)
			return true

		// Own seat
		if (here === get_lord_seat(lord))
			return true

		// vassal seats
		for (let vassal of all_vassals)
			if (is_vassal_mustered_with(vassal, lord))
				if (here === get_vassal_seat(vassal))
					return true
	}
	return false
}

// adjacent friendly locales to an eligible stronghold (can_tax_at)
function search_tax(result, start: Locale, lord: Lord, ships: boolean) {
	if (count_shared_ships(start, false) === 0)
		ships = false

	search_seen.fill(0)
	search_seen[start] = 1

	let queue = [ start ]
	while (queue.length > 0) {
		let here = queue.shift()
		let dist = search_dist[here]
		let next_dist = dist + 8

		if (can_tax_at(here, lord)) {
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
			if (ships && (is_seaport(here) || is_exile_box(here))) {
				for (let next of find_ports(here, lord)) {
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

function can_action_tax(): boolean {
	if (game.actions < 1)
		return false
	let here = get_lord_locale(game.command)
	if (can_tax_at(here, game.command))
		return true
	return search_tax(false, here, game.command, true)
}

function goto_tax() {
	push_undo()
	game.state = "tax"
	game.tax = search_tax([], get_lord_locale(game.command), game.command, true)
	game.where = NOWHERE
}

function end_tax() {
	delete game.tax
	game.where = NOWHERE
	spend_action(1)
	resume_command()
}

function get_tax_amount(loc: Locale, lord: Lord) {
	let tax = 0

	if (loc === LOC_LONDON || loc === LOC_CALAIS)
		tax = 3
	else if (is_city(loc))
		tax = 2
	else
		tax = 1

	if (lord_has_stafford_branch(loc, lord)) {
		logcap(AOW_YORK_STAFFORD_BRANCH)
		tax += 1
	}

	return tax
}

states.tax = {
	inactive: "Tax",
	prompt() {
		if (game.where === NOWHERE) {
			view.prompt = "Tax: Choose a stronghold."
			map_for_each_key(game.tax, gen_action_locale)
		} else {
			view.prompt = `Tax: ${locale_name[game.where]}.`
			prompt_influence_check(game.command)
		}
	},
	locale(loc) {
		game.where = loc
		if (loc === get_lord_seat(game.command)) {
			log("Tax at S" + game.where + ".")
			do_tax(game.command, game.where, 1)
			end_tax()
		} else {
			let dist = map_get(game.tax, loc, 0)
			if (can_naval_blockade_route(dist)) {
				let tax_way = search_tax([], get_lord_locale(game.command), game.command, false)
				if (map_has(tax_way, game.where))
					game.tax = tax_way
				else
					game.state = "blockade_tax"
			}
		}
	},
	check(spend) {
		if (roll_influence_check("Tax S" + game.where, game.command, spend))
			do_tax(game.command, game.where, 1)
		else
			fail_tax(game.command)
		end_tax()
	},
}

states.blockade_tax = {
	inactive: "Tax",
	prompt() {
		view.prompt = "Tax: Warwick may naval blockade this tax action."
		view.actions.roll = 1
	},
	roll() {
		if (roll_blockade("Tax"))
			game.state = "tax"
		else
			end_tax()
	},
}

function apply_so_wise_so_young(lord) {
	if (lord_has_capability(lord, AOW_YORK_SO_WISE_SO_YOUNG)) {
		logcap(AOW_YORK_SO_WISE_SO_YOUNG)
		add_lord_assets(lord, COIN, 1)
	}
}

function do_tax(who: Lord, where: Locale, mul: number) {
	let amount = get_tax_amount(where, who) * mul
	add_lord_assets(who, COIN, amount)
	apply_so_wise_so_young(who)
	deplete_locale(where)
}

function fail_tax(who: Lord) {
	apply_so_wise_so_young(who)
}

// === 4.6.4 ACTION: PARLEY ===

function has_free_parley_levy() {
	if (game.command === LORD_DEVON && get_lord_locale(LORD_DEVON) === LOC_EXETER && is_event_in_play(EVENT_YORK_DORSET))
		return true
	if (game.levy_flags.jack_cade > 0)
		return true
	if (game.levy_flags.my_crown_is_in_my_heart > 0)
		return true
	if (game.levy_flags.gloucester_as_heir > 0)
		return true
	return false
}

function has_route_to(start: Locale, to: Locale) {
	if (start === to)
		return true

	search_seen.fill(0)
	search_seen[start] = 1

	let queue = [ start ]
	while (queue.length > 0) {
		let here = queue.shift()

		if (here === to)
			return true

		// exception for start locale
		if (here === start || (is_friendly_locale(here) && !has_enemy_lord(here))) {
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

function can_parley_at(loc: Locale) {
	if (loc === LOC_LONDON) {
		if (has_york_favour(LONDON_FOR_YORK)) {
			// No Parley in London except with "My crown is in my heart" and "Parliament Votes".
			if (is_campaign_phase())
				return false
			if (!game.levy_flags.my_crown_is_in_my_heart && !game.levy_flags.parliament_votes)
				return false
		}
	}
	return !is_exile_box(loc) && !is_friendly_locale(loc) && !has_enemy_lord(loc) && !is_sea(loc)
}

function search_parley_levy(result, start: Locale, lord: Lord, ships: boolean) {
	if (count_shared_ships(start, false) === 0)
		ships = false

	search_dist.fill(0)
	search_seen.fill(0)
	search_seen[start] = 1

	let queue = [ start ]
	while (queue.length > 0) {
		let here = queue.shift()
		let dist = search_dist[here]
		let next_dist = dist + 8

		if (can_parley_at(here)) {
			if (result)
				map_set(result, here, dist)
			else
				return true
		}

		if (is_friendly_locale(here) && !has_enemy_lord(here)) {
			for (let next of data.locales[here].adjacent) {
				if (!search_seen[next]) {
					search_seen[next] = 1
					search_dist[next] = next_dist
					queue.push(next)
				}
			}

			if (ships && (is_seaport(here) || is_exile_box(here))) {
				for (let next of find_ports(here, lord)) {
					if (!search_seen[next]) {
						search_seen[next] = 1
						search_dist[next] = next_dist | find_sea_mask(here) | find_sea_mask(next)
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

function can_action_parley_campaign() {
	if (game.actions <= 0)
		return false

	if (is_lord_at_sea(game.command))
		return false

	if (!is_first_action() && game.active === YORK && is_event_in_play(EVENT_LANCASTER_NEW_ACT_OF_PARLIAMENT))
		return false

	let here = get_lord_locale(game.command)

	if (can_parley_at(here))
		return true

	if (is_friendly_locale(here)) {
		for (let next of data.locales[here].adjacent) {
			if (can_parley_at(next))
				return true
		}

		if ((is_seaport(here) || is_exile_box(here)) && count_shared_ships(here, false) > 0)
			for (let next of find_ports(here, game.command))
				if (can_parley_at(next))
					return true
	}

	return false
}

function search_parley_campaign(here: Locale, lord: Lord) {
	let result = []

	if (can_parley_at(here))
		map_set(result, here, 0)

	if (is_friendly_locale(here)) {
		for (let next of data.locales[here].adjacent)
			if (can_parley_at(next))
				map_set(result, next, 8)

		if ((is_seaport(here) || is_exile_box(here)) && count_shared_ships(here, false) > 0)
			for (let next of find_ports(here, lord))
				if (!map_has(result, next) && can_parley_at(next))
					map_set(result, next, 8 | find_sea_mask(here) | find_sea_mask(next))
	}

	return result
}

function can_action_parley_levy(): boolean {
	if (game.actions <= 0 && !has_free_parley_levy())
		return false

	let here = get_lord_locale(game.command)
	if (can_parley_at(here))
		return true
	return search_parley_levy(false, here, game.command, true)
}

function goto_parley_levy() {
	let lord = game.command
	let here = get_lord_locale(lord)

	game.state = "parley"

	game.parley = search_parley_levy([], here, lord, true)

	if (game.parley.length === 2 && game.parley[0] === here)
		game.where = here
	else
		game.where = NOWHERE
}

function goto_parley_campaign() {
	let lord = game.command
	let here = get_lord_locale(lord)

	push_undo()
	game.state = "parley"

	// Campaign phase, and current location is no cost (except some events), and always successful.
	if (can_parley_at(here)) {
		if (is_lancaster_lord(game.command) && is_event_in_play(EVENT_YORK_AN_HONEST_TALE_SPEEDS_BEST))
			reduce_lancaster_influence(1)
		log(`Parley at S${here}.`)
		shift_favour_toward(here)
		end_parley(true)
		return
	}

	game.parley = search_parley_campaign(here, lord)
	game.where = NOWHERE
}

function end_parley(success: boolean) {
	game.where = NOWHERE
	delete game.parley

	// Track use of parley capabilities / events.
	if (is_levy_phase()) {
		if (game.command === LORD_DEVON && get_lord_locale(LORD_DEVON) === LOC_EXETER && is_event_in_play(EVENT_YORK_DORSET)) {
			logevent(EVENT_YORK_DORSET)
			++game.actions
		} else if (game.levy_flags.jack_cade > 0) {
			// Jack Cade: free action, zero influence cost, and success
			logevent(EVENT_YORK_JACK_CADE)
			--game.levy_flags.jack_cade
			++game.actions
		}
		else {
			// Parliament Votes / Succession: reduced cost and success
			if (game.levy_flags.parliament_votes > 0) {
				logevent(EVENT_LANCASTER_PARLIAMENT_VOTES)
				--game.levy_flags.parliament_votes
			}

			if (game.levy_flags.succession > 0) {
				logevent(EVENT_YORK_SUCCESSION)
				--game.levy_flags.succession
			}

			// My crown / as heir: free action
			if (game.levy_flags.my_crown_is_in_my_heart > 0) {
				logevent(EVENT_LANCASTER_MY_CROWN_IS_IN_MY_HEART)
				--game.levy_flags.my_crown_is_in_my_heart
				++game.actions
			}
			else if (game.levy_flags.gloucester_as_heir > 0) {
				logevent(EVENT_YORK_GLOUCESTER_AS_HEIR)
				--game.levy_flags.gloucester_as_heir
				++game.actions
			}
		}
	}

	if (is_campaign_phase()) {
		if (game.active === YORK && is_event_in_play(EVENT_LANCASTER_NEW_ACT_OF_PARLIAMENT)) {
			logevent(EVENT_LANCASTER_NEW_ACT_OF_PARLIAMENT)
			spend_all_actions()
		} else {
			spend_action(1)
		}
		resume_command()
	} else {
		if (success)
			goto_the_kings_name("Parley")
		else
			resume_muster_lord()
	}
}

states.parley = {
	inactive: "Parley",
	prompt() {
		if (game.where === NOWHERE) {
			view.prompt = "Parley: Choose a stronghold."
			for (let i = 0; i < game.parley.length; i += 2)
				gen_action_locale(game.parley[i] as Locale)
		} else {
			view.prompt = `Parley: ${locale_name[game.where]}.`
			prompt_influence_check(game.command, parley_ic)
		}
	},
	locale(loc) {
		push_undo()
		game.where = loc
		let here = get_lord_locale(game.command)
		if (!is_adjacent(here, loc)) {
			let dist = map_get(game.parley, loc, 0)
			if (can_naval_blockade_route(dist))
				game.state = "blockade_parley"
		}
	},
	check(spend) {
		if (roll_influence_check("Parley at S" + game.where, game.command, spend, parley_ic)) {
			shift_favour_toward(game.where)
			end_parley(true)
		} else {
			end_parley(false)
		}
	},
}

states.blockade_parley = {
	inactive: "Parley",
	prompt() {
		view.prompt = "Parley: Warwick may naval blockade this parley action."
		let by_way = search_parley_levy([], get_lord_locale(game.command), game.command, false)
		if (map_has(by_way, game.where))
			view.actions.by_way = 1
		view.actions.roll = 1
	},
	by_way() {
		game.parley = search_parley_levy([], get_lord_locale(game.command), game.command, false)
		game.state = "parley"
	},
	roll() {
		if (roll_blockade("Parley"))
			game.state = "parley"
		else
			end_parley(false)
	},
}

// === 4.3 ACTION: MARCH ===

function get_way_type(from: Locale, to: Locale): Way {
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
function is_wales_forbidden(loc: Locale) {
	if (game.active === LANCASTER && is_event_in_play(EVENT_YORK_OWAIN_GLYNDWR) && is_wales(loc))
		return true
	return false
}

function is_wales_forbidden_to_enemy(loc: Locale) {
	if (game.active !== LANCASTER && is_event_in_play(EVENT_YORK_OWAIN_GLYNDWR) && is_wales(loc))
		return true
	return false
}

function can_march_to(to: Locale) {
	if (is_wales_forbidden(to))
		return false
	if (is_truce_in_effect() && has_enemy_lord(to))
		return false
	if (is_group_move_forbidden(game.group, to))
		return false
	return true
}

function can_action_march_to(to: Locale, type: "highway" | "road" | "path") {
	if (!can_march_to(to))
		return false

	if (game.group.length === 1 && type === "road") {
		if (lord_has_capability(game.command, AOW_YORK_YORKISTS_NEVER_WAIT))
			type = "highway"
		if (game.active === LANCASTER && is_event_in_play(EVENT_LANCASTER_FORCED_MARCHES))
			type = "highway"
	}

	if (type === "highway") {
		if (has_flag(FLAG_FIRST_MARCH_HIGHWAY))
			return true
		if (has_flag(FLAG_SURPRISE_LANDING))
			return true
		return game.actions >= 1
	}
	else if (type === "road") {
		if (has_flag(FLAG_SURPRISE_LANDING))
			return true
		return game.actions >= 1
	}
	else if (type === "path") {
		return is_first_action()
	}

	throw "IMPOSSIBLE"
}

function prompt_march() {
	let from = get_lord_locale(game.command)

	if (!is_locale_on_map(from))
		return

	for (let to of data.locales[from].highways)
		if (can_action_march_to(to, "highway"))
			gen_action_locale(to)

	for (let to of data.locales[from].roads)
		if (can_action_march_to(to, "road"))
			gen_action_locale(to)

	for (let to of data.locales[from].paths)
		if (can_action_march_to(to, "path"))
			gen_action_locale(to)
}

function goto_march(to: Locale) {
	push_undo()
	let from = get_lord_locale(game.command)
	game.march = { from, to }
	march_with_group_1()
}

function march_with_group_1() {
	let transport = count_group_carts(game.group, true)
	let prov = count_group_provender(game.group)
	if (prov > transport)
		game.state = "march_haul"
	else
		march_with_group_2()
}

states.march_haul = {
	inactive: "March",
	prompt() {
		let to = game.march.to
		let transport = count_group_carts(game.group, true)
		let prov = count_group_provender(game.group)

		view.group = game.group
		view.where = game.march.to

		view.prompt = "March: Haul."

		if (prov > transport) {
			let overflow_prov = prov - transport
			view.prompt += ` Discard ${overflow_prov} Provender`
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
}

function march_with_group_2() {
	let from = game.march.from
	let to = game.march.to
	let type = get_way_type(from, to)

	log(`March to S${to}${format_group_move()}.`)

	if (!is_marshal(game.command) && !is_lieutenant(game.command) && game.group.length > 1)
		logcap(AOW_YORK_CAPTAIN)

	if (lord_has_capability(game.command, AOW_LANCASTER_HAY_WAINS))
		logcap(AOW_LANCASTER_HAY_WAINS)

	if (game.group.length === 1 && type === "road") {
		if (lord_has_capability(game.command, AOW_YORK_YORKISTS_NEVER_WAIT)) {
			logcap(AOW_YORK_YORKISTS_NEVER_WAIT)
			type = "highway"
		}
		if (game.active === LANCASTER && is_event_in_play(EVENT_LANCASTER_FORCED_MARCHES)) {
			logevent(EVENT_LANCASTER_FORCED_MARCHES)
			type = "highway"
		}
	}

	if (type === "highway") {
		if (has_flag(FLAG_FIRST_MARCH_HIGHWAY)) {
			spend_march_action(0)
		}
		else if (has_flag(FLAG_SURPRISE_LANDING)) {
			spend_march_action(0)
			set_flag(FLAG_FIRST_MARCH_HIGHWAY)
		}
		else {
			spend_march_action(1)
			set_flag(FLAG_FIRST_MARCH_HIGHWAY)
		}
	}
	else if (type === "road") {
		if (has_flag(FLAG_SURPRISE_LANDING))
			spend_march_action(0)
		else
			spend_march_action(1)
	}
	else if (type === "path") {
		spend_all_actions()
	}

	for (let lord of game.group)
		set_lord_locale(lord, to)

	// Note: We flag the lords moved and levy burgundians after king's parley and parliament's truce have resolved.
	// See end_kings_parley
	// See end_parliaments_truce

	goto_march_confirm()
}

function end_march() {
	delete game.march

	// Discard held events
	set_delete(game.events, EVENT_LANCASTER_BLOCKED_FORD)
	set_delete(game.events, EVENT_LANCASTER_FLANK_ATTACK)
	set_delete(game.events, EVENT_YORK_BLOCKED_FORD)
	set_delete(game.events, EVENT_YORK_FLANK_ATTACK)

	// Disbanded in battle!
	if (!is_lord_on_map(game.command)) {
		game.group = null
		clear_flag(FLAG_MARCH_TO_PORT)
		clear_flag(FLAG_SAIL_TO_PORT)
		spend_all_actions()
		resume_command()
		return
	}

	resume_command()
}

function goto_march_confirm() {
	let here = get_lord_locale(game.command)
	if (has_enemy_lord(here))
		game.state = "march_confirm_approach"
	else if (may_be_intercepted())
		game.state = "march_confirm_intercept"
	else
		goto_intercept()
}

states.march_confirm_approach = {
	inactive: "March",
	prompt() {
		view.prompt = "March: Approach enemy?"
		view.actions.approach = 1
	},
	approach() {
		goto_intercept()
	},
}

states.march_confirm_intercept = {
	inactive: "March",
	prompt() {
		view.prompt = "March: You may be intercepted!"
		view.actions.march = 1
	},
	march() {
		goto_intercept()
	},
}

// === 4.3.4 INTERCEPT ===

function format_intercept() {
	return game.intercept.map(x => "L" + x).join(" and ")
}

function has_unmoving_friendly_lord(here) {
	for (let lord of all_friendly_lords()) {
		if (get_lord_locale(lord) === here)
			if (!set_has(game.group, lord))
				return true
	}
	return false
}

function can_intercept_to(to: Locale) {
	// forbid lancaster intercept into york moving to york, and vice versa
	if (has_unmoving_friendly_lord(to))
		return false
	if (is_truce_in_effect())
		return false
	if (is_wales_forbidden_to_enemy(to))
		return false
	return true
}

function may_be_intercepted() {
	let here = get_lord_locale(game.command)

	if (game.scenario === SCENARIO_II) {
		if (can_intercept_to(here))
			for (let next of data.locales[here].not_paths)
				// Note: must check shaky allies
				for (let lord of all_enemy_lords())
					if (get_lord_locale(lord) === next && is_move_allowed(lord, here))
						return true
		return false
	}

	if (can_intercept_to(here))
		for (let next of data.locales[here].not_paths)
			if (has_enemy_lord(next))
				return true
	return false
}

function goto_intercept() {
	if (may_be_intercepted()) {
		game.state = "intercept"
		set_active_enemy()
		game.intercept = []
		game.who = NOBODY
	} else {
		end_intercept()
	}
}

function end_intercept() {
	delete game.intercept
	game.who = NOBODY
	goto_kings_parley()
}

states.intercept = {
	inactive: "Intercept",
	prompt() {
		let to = game.march.to

		view.group = game.intercept
		view.where = to

		if (game.who === NOBODY) {
			// TODO: clean up prompt
			view.prompt = `Intercept: Choose lords to intercept ${lord_name[game.command]} at ${locale_name[to]}.`

			for (let next of data.locales[to].not_paths)
				for_each_friendly_lord_in_locale(next, lord => {
					if (is_move_allowed(lord, to))
						gen_action_lord(lord)
				})
		} else {
			let valour = get_modified_valour(game.who, false)
			// TODO: clean up prompt
			view.prompt = `Intercept ${range(valour)} ${lord_name[game.command]} at ${locale_name[to]}.`

			gen_action_lord(game.who)

			if (can_pick_up_lords(game.who)) {
				for_each_friendly_lord_in_locale(get_lord_locale(game.who), other => {
					if (can_pick_up_other(game.who, other) && is_move_allowed(other, to))
						gen_action_lord(other)
				})
			}

			if (game.active === YORK)
				gen_action_card_if_held(EVENT_YORK_FLANK_ATTACK)
			else
				gen_action_card_if_held(EVENT_LANCASTER_FLANK_ATTACK)

			view.actions.intercept = 1
		}

		view.actions.pass = 1
		view.group = game.intercept
	},
	lord(lord) {
		if (game.who === NOBODY) {
			game.who = lord
			set_toggle(game.intercept, lord)
		} else if (lord === game.who) {
			game.who = NOBODY
			game.intercept = []
		} else {
			set_toggle(game.intercept, lord)
		}
	},
	card(c) {
		// Flank Attack
		push_undo()
		play_held_event(c)
	},
	pass() {
		set_active_enemy()
		end_intercept()
	},
	intercept() {
		let success = false
		if (is_flank_attack_in_play()) {
			log("Intercept with " + format_intercept() + ".")
			end_passive_held_event()
			success = true
		}
		else {
			let valour = get_modified_valour(game.who, false)
			let roll = roll_die()
			success = roll <= valour
			if (success)
				log(`Intercept ${range(valour)}: B${roll}`)
			else
				log(`Intercept ${range(valour)}: W${roll}`)
			log(">with " + format_intercept())
			get_modified_valour(game.who, true)
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
	if (count_group_carts(game.intercept, false) >= count_group_provender(game.intercept)) {
		do_intercept_march()
	} else {
		game.state = "intercept_haul"
	}
}

function do_intercept_march() {
	for (let lord of game.intercept) {
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

states.intercept_haul = {
	inactive: "Intercept",
	prompt() {
		let to = game.march.to
		let transport = count_group_carts(game.intercept, false)
		let prov = count_group_provender(game.intercept)

		view.group = game.intercept

		view.prompt = "Intercept: Haul."

		if (prov > transport) {
			let overflow_prov = prov - transport
			view.prompt += ` Discard ${overflow_prov} Provender`
			for (let lord of game.intercept) {
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

function for_each_friendly_lord_in_locale(loc: Locale, f) {
	for (let lord of all_friendly_lords())
		if (get_lord_locale(lord) === loc)
			f(lord)
}

// === MARCH EVENT: FLANK ATTACK ===

function is_flank_attack_in_play() {
	return is_event_in_play(EVENT_LANCASTER_FLANK_ATTACK) || is_event_in_play(EVENT_YORK_FLANK_ATTACK)
}

// === MARCH EVENT: KING'S PARLEY ===

function goto_kings_parley() {
	// If Henry VI in space, with King's Parley capability
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
	inactive: "King's Parley",
	prompt() {
		view.prompt = "Approach: You may discard King's Parley to cancel Yorkist approach."
		gen_action_card(AOW_LANCASTER_KINGS_PARLEY)
		view.actions.pass = 1
	},
	card(_) {
		logcap(AOW_LANCASTER_KINGS_PARLEY)

		discard_lord_capability(LORD_HENRY_VI, AOW_LANCASTER_KINGS_PARLEY)

		// Cancel approach!
		for (let lord of game.group)
			set_lord_locale(lord, game.march.from)

		set_active_enemy()
		spend_all_actions() // end command
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
	inactive: "Parliament's Truce",
	prompt() {
		view.prompt = "Approach: You may play Parliament's Truce to cancel approach."
		if (game.active === YORK)
			gen_action_card_if_held(EVENT_YORK_PARLIAMENTS_TRUCE)
		else
			gen_action_card_if_held(EVENT_LANCASTER_PARLIAMENTS_TRUCE)
		view.actions.pass = 1
	},
	card(c) {
		play_held_event(c)
		end_passive_held_event()

		// Cancel approach!
		for (let lord of game.group) {
			if (game.march)
				set_lord_locale(lord, game.march.from)
			else
				set_lord_locale(lord, game.sail_from)
		}

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

	// And set marching flags here too.
	if (game.march) {
		let here = get_lord_locale(game.command)
		if (is_seaport(here))
			set_flag(FLAG_MARCH_TO_PORT)
		else
			clear_flag(FLAG_MARCH_TO_PORT)
		clear_flag(FLAG_SAIL_TO_PORT)
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
	inactive: "Blocked Ford",
	prompt() {
		view.prompt = "Approach: You may play Blocked Ford."

		if (game.active === YORK)
			gen_action_card_if_held(EVENT_YORK_BLOCKED_FORD)
		else
			gen_action_card_if_held(EVENT_LANCASTER_BLOCKED_FORD)

		view.actions.pass = 1
	},
	card(c) {
		play_held_event(c)
		end_passive_held_event()
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
		game.state = "choose_exile"
		set_active_enemy()
	} else {
		if (game.march)
			end_march()
		else
			end_sail()
	}
}

states.choose_exile = {
	inactive: "Choose Exile",
	prompt() {
		let here = get_lord_locale(game.command)
		view.prompt = `Approach: Choose lords to go into exile from ${locale_name[here]}.`
		for_each_friendly_lord_in_locale(here, gen_action_lord)
		view.actions.done = 1
	},
	lord(lord) {
		push_undo()
		give_up_spoils(lord)

		reduce_influence(get_lord_influence(lord) + count_vassals_with_lord(lord))

		exile_lord(lord)

		if (game.scenario === SCENARIO_II) {
			if (lord === LORD_WARWICK_L)
				foreign_haven_shift_lords()
		}
	},
	done() {
		set_active_enemy()
		goto_exile_spoils()
	},
}

// === 4.3.5 APPROACH - SPOILS AFTER CHOOSING EXILE ===

function add_spoils(type: Asset, n) {
	if (!game.spoils)
		game.spoils = [ 0, 0, 0 ]
	game.spoils[type] += n
}

function give_up_spoils(lord: Lord) {
	let here = get_lord_locale(lord)

	// Full spoils if enemy locale
	if (is_enemy_locale(here)) {
		add_spoils(PROV, get_lord_assets(lord, PROV))
		add_spoils(CART, get_lord_assets(lord, CART))
		set_lord_assets(lord, PROV, 0)
		set_lord_assets(lord, CART, 0)
		return
	}

	// Half spoils if neutral locale
	if (is_neutral_locale(here)) {
		add_spoils(PROV, get_lord_assets(lord, PROV) / 2)
		add_spoils(CART, get_lord_assets(lord, CART) / 2)
		set_lord_assets(lord, PROV, 0)
		set_lord_assets(lord, CART, 0)
		return
	}

	// No spoils if friendly locale
}

function round_spoils() {
	if (game.spoils) {
		game.spoils[PROV] = Math.ceil(game.spoils[PROV])
		game.spoils[CART] = Math.ceil(game.spoils[CART])
	}
}

function has_any_spoils() {
	return game.spoils && (game.spoils[PROV] + game.spoils[CART] > 0)
}

function log_spoils() {
	if (game.spoils[PROV] > 0)
		logi(game.spoils[PROV] + " Provender")
	if (game.spoils[CART] > 0)
		logi(game.spoils[CART] + " Cart")
}

function list_spoils() {
	if (game.spoils[PROV] > 0 && game.spoils[CART] > 0)
		return `${game.spoils[PROV]} provender and ${game.spoils[CART]} carts`
	else if (game.spoils[PROV] > 0)
		return `${game.spoils[PROV]} provender`
	else if (game.spoils[CART] > 0)
		return `${game.spoils[CART]} carts`
	else
		return "nothing"
}

function prompt_spoils() {
	if (game.spoils[PROV] > 0)
		view.actions.take_prov = 1
	if (game.spoils[CART] > 0)
		view.actions.take_cart = 1
	if (game.spoils[PROV] > 0 || game.spoils[CART] > 0)
		view.actions.take_all = 1
}

function take_spoils(type: Asset) {
	add_lord_assets(game.who, type, 1)
	add_spoils(type, -1)
	if (!has_any_spoils())
		game.who = NOBODY
}

function take_all_spoils() {
	add_lord_assets(game.who, PROV, game.spoils[PROV])
	add_lord_assets(game.who, CART, game.spoils[CART])
	game.spoils = [ 0, 0, 0 ]
	game.who = NOBODY
}

function goto_exile_spoils() {
	round_spoils()
	if (has_any_spoils()) {
		log_h4("Spoils")
		log_spoils()
		game.state = "exile_spoils"
		game.who = find_lone_friendly_lord_at(get_lord_locale(game.command))
	} else {
		end_exile_spoils()
	}
}

function end_exile_spoils() {
	game.who = NOBODY
	delete game.spoils
	if (has_enemy_lord(get_lord_locale(game.command))) {
		// still some lords not exiled to fight.
		goto_battle()
	} else {
		// no one left, goto finish marching.
		if (game.march)
			end_march()
		else
			end_sail()
	}
}

states.exile_spoils = {
	inactive: "Spoils",
	prompt() {
		if (has_any_spoils()) {
			view.prompt = "Spoils: Divide " + list_spoils() + "."
			let here = get_lord_locale(game.command)
			for (let lord of all_friendly_lords())
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

	take_all() {
		push_undo_without_who()
		take_all_spoils()
	},

	end_spoils() {
		end_exile_spoils()
	},
}

// === 4.4 BATTLE ===

/*

	BATTLE SEQUENCE

	defender position lords
	attacker position lords

	play events (defender)
	play events (attacker)

	SUSPICION - end battle if necessary

	battle rounds

	award influence
	award spoils
	determine losses
	death check
	aftermath

*/

const battle_strike_positions = [ D1, D2, D3, A1, A2, A3 ]

function log_lord_cap_ii(lord: Lord, c: Card) {
	if (lord_has_capability(lord, c))
		log(">>C" + c)
}

function log_lord_engage(lord: Lord) {
	if (lord === NOBODY)
		return
	log(">L" + lord)

	log_lord_cap_ii(lord, AOW_LANCASTER_BARDED_HORSE)
	log_lord_cap_ii(lord, AOW_LANCASTER_CHEVALIERS)
	log_lord_cap_ii(lord, AOW_LANCASTER_CHURCH_BLESSINGS)
	log_lord_cap_ii(lord, AOW_LANCASTER_MONTAGU)
	log_lord_cap_ii(lord, AOW_LANCASTER_PIQUIERS)
	log_lord_cap_ii(lord, AOW_YORK_BARRICADES)
}

const battle_steps = [
	null,
	{ name: "Missiles", hits: count_archery_hits },
	{ name: "Melee", hits: count_melee_hits },
]

function remove_lord_from_battle(lord) {
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
}

function get_lord_array_position(lord: Lord) {
	for (let p of battle_strike_positions)
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

function filled(pos) {
	let lord = game.battle.array[pos]
	if (lord !== NOBODY && lord !== game.battle.ravine)
		return true
	return false
}

function count_archery_hits(lord: Lord) {
	let hits = 0
	hits += get_lord_forces(lord, LONGBOWMEN) << 2
	hits += get_lord_forces(lord, BURGUNDIANS) << 2
	hits += get_lord_forces(lord, MILITIA)
	hits += get_lord_forces(lord, MERCENARIES)

	if (is_leeward_battle_line_in_play(lord)) {
		// half rounded up!
		return (hits + 1) >> 1
	}

	return hits
}

function count_melee_hits(lord: Lord) {
	let hits = 0
	if (get_lord_forces(lord, RETINUE) > 0)
		hits += 3 << 1
	hits += count_unrouted_vassals_with_lord(lord) << 2
	if (lord_has_capability(lord, AOW_LANCASTER_CHEVALIERS))
		hits += get_lord_forces(lord, MEN_AT_ARMS) << 2
	else
		hits += get_lord_forces(lord, MEN_AT_ARMS) << 1
	hits += get_lord_forces(lord, MILITIA)
	hits += get_lord_forces(lord, MERCENARIES)
	hits += get_lord_forces(lord, BURGUNDIANS) << 1

	if (lord === game.battle.caltrops) {
		logevent(EVENT_YORK_CALTROPS)
		hits += 2 << 1
	}

	return hits
}

function count_lord_hits(lord: Lord) {
	return battle_steps[game.battle.step].hits(lord)
}

function format_strike_step() {
	return battle_steps[game.battle.step].name
}

function format_hits() {
	if (game.active !== game.battle.attacker && game.battle.ahits > 0)
		return `Assign ${game.battle.ahits} hit${game.battle.ahits > 1 ? "s" : ""}.`
	if (game.active === game.battle.attacker && game.battle.dhits > 0)
		return `Assign ${game.battle.dhits} hit${game.battle.dhits > 1 ? "s" : ""}.`
	return "All done."
}

function is_battle_over() {
	if (lancaster_has_no_unrouted_forces())
		return true
	if (york_has_no_unrouted_forces())
		return true
	return false
}

function has_no_unrouted_forces() {
	// All unrouted lords are either in battle array or in reserves
	for (let p of battle_strike_positions)
		if (is_friendly_lord(game.battle.array[p]))
			return false
	for (let lord of game.battle.reserves)
		if (is_friendly_lord(lord))
			return false
	return true
}

function york_has_no_unrouted_forces() {
	// All unrouted lords are either in battle array or in reserves
	for (let p of battle_strike_positions)
		if (is_york_lord(game.battle.array[p]))
			return false
	for (let lord of game.battle.reserves)
		if (is_york_lord(lord))
			return false
	return true
}

function lancaster_has_no_unrouted_forces() {
	// All unrouted lords are either in battle array or in reserves
	for (let p of battle_strike_positions)
		if (is_lancaster_lord(game.battle.array[p]))
			return false
	for (let lord of game.battle.reserves)
		if (is_lancaster_lord(lord))
			return false
	return true
}

function is_attacker() {
	return game.active === game.battle.attacker
}

function is_missiles_step() {
	return game.battle.step === 1
}

function is_melee_step() {
	return game.battle.step === 2
}

function log_battle_cap(lord: Lord, c: Card) {
	log("L" + lord)
	log(">C" + c)
}

// Capabilities adding troops at start of the battle
function add_battle_capability_troops() {
	let here = game.battle.where

	// TODO: track these explicitly in game.battle for better removal

	for (let lord of all_lords) {
		if (get_lord_locale(lord) !== here)
			continue

		if (lord_has_capability(lord, AOW_YORK_MUSTERD_MY_SOLDIERS) && has_york_favour(here)) {
			log_battle_cap(lord, AOW_YORK_MUSTERD_MY_SOLDIERS)
			add_lord_forces(lord, MEN_AT_ARMS, 2)
			add_lord_forces(lord, LONGBOWMEN, 1)
		}
		if (lord_has_capability(lord, AOW_LANCASTER_MUSTERD_MY_SOLDIERS) && has_lancaster_favour(here)) {
			log_battle_cap(lord, AOW_LANCASTER_MUSTERD_MY_SOLDIERS)
			add_lord_forces(lord, MEN_AT_ARMS, 2)
			add_lord_forces(lord, LONGBOWMEN, 1)
		}
		if (lord_has_capability(lord, AOW_LANCASTER_WELSH_LORD) && is_wales(here)) {
			log_battle_cap(lord, AOW_LANCASTER_WELSH_LORD)
			add_lord_forces(lord, LONGBOWMEN, 2)
		}
		if (lord_has_capability(lord, AOW_YORK_PEMBROKE) && is_wales(here)) {
			log_battle_cap(lord, AOW_YORK_PEMBROKE)
			add_lord_forces(lord, LONGBOWMEN, 2)
		}
		if (lord_has_capability(lord, AOW_YORK_PERCYS_NORTH1) && is_north(here)) {
			log_battle_cap(lord, AOW_YORK_PERCYS_NORTH1)
			add_lord_forces(lord, MILITIA, 4)
		}
		if (lord_has_capability(lord, AOW_YORK_PERCYS_NORTH2) && has_route_to(here, LOC_CARLISLE)) {
			log_battle_cap(lord, AOW_YORK_PERCYS_NORTH2)
			add_lord_forces(lord, MEN_AT_ARMS, 2)
		}
		if (lord_has_capability(lord, AOW_YORK_KINGDOM_UNITED) && (is_north(here) || is_south(here) || is_wales(here))) {
			log_battle_cap(lord, AOW_YORK_KINGDOM_UNITED)
			add_lord_forces(lord, MILITIA, 3)
		}
		if (lord_has_capability(lord, AOW_LANCASTER_PHILIBERT_DE_CHANDEE) && is_at_or_adjacent_to_lancastrian_english_channel_port(here)) {
			log_battle_cap(lord, AOW_LANCASTER_PHILIBERT_DE_CHANDEE)
			add_lord_forces(lord, MEN_AT_ARMS, 2)
		}
	}
}

//... And removing them at the end of the battle
function remove_battle_capability_troops(lord: Lord) {
	let here = game.battle.where
	if (lord_has_capability(lord, AOW_YORK_MUSTERD_MY_SOLDIERS) && has_york_favour(here)) {
		add_lord_forces(lord, MEN_AT_ARMS, -2)
		add_lord_forces(lord, LONGBOWMEN, -1)
	}
	if (lord_has_capability(lord, AOW_LANCASTER_MUSTERD_MY_SOLDIERS) && has_lancaster_favour(here)) {
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
	if (lord_has_capability(lord, AOW_YORK_PERCYS_NORTH2) && has_route_to(here, LOC_CARLISLE)) {
		add_lord_forces(lord, MEN_AT_ARMS, -2)
	}
	if (lord_has_capability(lord, AOW_YORK_KINGDOM_UNITED) && (is_north(here) || is_south(here) || is_wales(here))) {
		add_lord_forces(lord, MILITIA, -3)
	}
	if (lord_has_capability(lord, AOW_LANCASTER_PHILIBERT_DE_CHANDEE) && is_at_or_adjacent_to_lancastrian_english_channel_port(here)) {
		add_lord_forces(lord, MEN_AT_ARMS, -2)
	}
}

function goto_battle() {
	let here = get_lord_locale(game.command)

	log_h2_common(`Battle at S${here}`)

	game.battle = {
		where: here,
		round: 1,
		step: 0,
		attacker: game.active,
		loser: "None",
		array: [
			NOBODY, NOBODY, NOBODY,
			NOBODY, NOBODY, NOBODY
		],
		valour: [],
		routed_vassals: [],
		engagements: [],
		reserves: [],
		fled: [],
		routed: [],
		ahits: 0,
		dhits: 0,
		reroll: 0,
		final_charge: 0,
	}

	if (is_flank_attack_in_play()) {
		if (game.battle.attacker === YORK)
			game.battle.attacker = LANCASTER
		else
			game.battle.attacker = YORK
	}

	// Troops by capability
	add_battle_capability_troops()

	// All participating lords to reserve
	for (let lord of all_lords) {
		if (get_lord_locale(lord) === here) {
			set_lord_fought(lord)
			set_add(game.battle.reserves, lord)
			let n = get_modified_valour(lord, true)
			if (n > 0)
				map_set(game.battle.valour, lord, n)
		}
	}

	goto_array_defender()
}

// === 4.4.1 BATTLE ARRAY ===

function norfolk_is_late() {
	if (game.scenario === SCENARIO_IB && game.battle.round === 1) {
		let n = 0
		for (let lord of all_york_lords)
			if (get_lord_locale(lord) === game.battle.where)
				++n
		return n > 1
	}
	return false
}

function has_friendly_reserves() {
	for (let lord of game.battle.reserves) {
		if (lord === LORD_NORFOLK && norfolk_is_late())
			continue
		if (is_friendly_lord(lord))
			return true
	}
	return false
}

function count_friendly_reserves() {
	let n = 0
	for (let lord of game.battle.reserves) {
		if (lord === LORD_NORFOLK && norfolk_is_late())
			continue
		if (is_friendly_lord(lord))
			++n
	}
	return n
}

function pop_first_reserve() {
	for (let lord of game.battle.reserves) {
		if (lord === LORD_NORFOLK && norfolk_is_late())
			continue
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
	inactive: "Battle Array",
	prompt() {
		view.prompt = "Battle Array: Position attacking lords."
		let array = game.battle.array
		let done = true
		if (array[A1] === NOBODY || array[A2] === NOBODY || array[A3] === NOBODY) {
			for (let lord of game.battle.reserves) {
				if (lord === LORD_NORFOLK && norfolk_is_late())
					continue
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
	inactive: "Battle Array",
	prompt() {
		view.prompt = "Battle Array: Position defending lords."
		let array = game.battle.array
		let done = true
		if (array[D1] === NOBODY || array[D2] === NOBODY || array[D3] === NOBODY) {
			for (let lord of game.battle.reserves) {
				if (lord === LORD_NORFOLK && norfolk_is_late())
					continue
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
	end_passive_held_event()
	if (is_attacker())
		goto_attacker_events()
	else
		goto_defender_events()
}

states.defender_events = {
	inactive: "Defender Events",
	prompt() {
		view.prompt = "Battle Array: Defender may play events."
		prompt_battle_events()
	},
	card: action_battle_events,
	done() {
		end_defender_events()
	},
}

states.attacker_events = {
	inactive: "Attacker Events",
	prompt() {
		view.prompt = "Battle Array: Attacker may play events."
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

function action_battle_events(c: Card) {
	push_undo()
	play_held_event(c)
	switch (c) {
		case EVENT_LANCASTER_LEEWARD_BATTLE_LINE:
			resume_battle_events()
			break
		case EVENT_LANCASTER_SUSPICION:
			game.state = "suspicion_1"
			break
		case EVENT_LANCASTER_FOR_TRUST_NOT_HIM:
			game.state = "for_trust_not_him"
			break
		case EVENT_LANCASTER_RAVINE:
			game.state = "ravine"
			break
		case EVENT_YORK_LEEWARD_BATTLE_LINE:
			resume_battle_events()
			break
		case EVENT_YORK_SUSPICION:
			game.state = "suspicion_1"
			break
		case EVENT_YORK_CALTROPS:
			game.state = "caltrops"
			break
		case EVENT_YORK_REGROUP:
			resume_battle_events()
			break
		case EVENT_YORK_SWIFT_MANEUVER:
			resume_battle_events()
			break
		case EVENT_YORK_PATRICK_DE_LA_MOTE:
			resume_battle_events()
			break
	}
}

// === BATTLE EVENT: RAVINE ===

states.ravine = {
	inactive: "Ravine",
	prompt() {
		view.prompt = "Ravine: Choose an enemy lord to ignore for engage and strike."
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
		game.battle.ravine = lord
		logevent(EVENT_LANCASTER_RAVINE)
		logi("L" + lord)
		resume_battle_events()
	},
}

// === BATTLE EVENT: CALTROPS ===

states.caltrops = {
	inactive: "Caltrops",
	prompt() {
		view.prompt = "Caltrops: Choose a lord to add +2 hits against the enemy each round."
		for (let lord of game.battle.array) {
			if (is_friendly_lord(lord)) {
				gen_action_lord(lord)
			}
		}
	},
	lord(lord) {
		game.battle.caltrops = lord
		logevent(EVENT_YORK_CALTROPS)
		logi("L" + lord)
		resume_battle_events()
	},
}

// === BATTLE EVENT: SUSPICION ===

function can_play_suspicion() {
	// NOTE: printed influence only!
	return highest_friendly_influence() > lowest_enemy_influence()
}

function lowest_enemy_influence() {
	let score = 10
	for (let lord of all_enemy_lords()) {
		if (get_lord_locale(lord) === game.battle.where) {
			if (get_lord_influence(lord) < score) {
				score = get_lord_influence(lord)
			}
		}
	}
	return score
}

function highest_friendly_influence() {
	let score = 0
	for (let lord of all_friendly_lords()) {
		if (get_lord_locale(lord) === game.battle.where) {
			if (get_lord_influence(lord) > score) {
				score = get_lord_influence(lord)
			}
		}
	}
	return score
}

states.suspicion_1 = {
	inactive: "Suspicion",
	prompt() {
		view.prompt = "Suspicion: Choose a lord to check influence."
		let lowest = lowest_enemy_influence()
		for (let lord of game.battle.array)
			if (is_friendly_lord(lord) && get_lord_influence(lord) > lowest)
				gen_action_lord(lord)
		for (let lord of game.battle.reserves)
			if (is_friendly_lord(lord) && get_lord_influence(lord) > lowest)
				gen_action_lord(lord)
	},
	lord(lord) {
		push_undo()
		game.who = lord
		game.state = "suspicion_2"
	},
}

states.suspicion_2 = {
	inactive: "Suspicion",
	prompt() {
		view.prompt = `Suspicion: ${lord_name[game.who]}.`
		prompt_influence_check(game.who)
	},
	check(spend) {
		if (roll_influence_check("L" + game.who, game.who, spend)) {
			game.state = "suspicion_3"
		} else {
			game.who = NOBODY
			resume_battle_events()
		}
	},
}

states.suspicion_3 = {
	inactive: "Suspicion",
	prompt() {
		view.prompt = "Suspicion: Disband one enemy lord with lower influence rating."
		let highest = get_lord_influence(game.who)
		for (let lord of game.battle.array)
			if (is_enemy_lord(lord) && get_lord_influence(lord) < highest)
				gen_action_lord(lord)
	},
	lord(lord) {
		push_undo()

		logi("L" + lord)

		remove_lord_from_battle(lord)
		disband_lord(lord)
		game.who = NOBODY

		// Skip to end battle if no enemy remains!
		if (is_battle_over()) {
			end_battle_round()
			return
		}

		resume_battle_events()
	},
}

// === BATTLE EVENT: FOR TRUST NOT HIM ===

function can_target_for_trust_not_him(v: Vassal) {
	// Special vassals cannot be targeted
	if (is_special_vassal(v))
		return false
	// Alice Montagu confers immunity
	if (lord_has_capability(get_vassal_lord(v), AOW_YORK_ALICE_MONTAGU))
		return false
	return true
}

function can_play_for_trust_not_him() {
	for (let v of all_vassals)
		if (is_vassal_mustered_with_york_lord(v) && get_vassal_locale(v) === game.battle.where)
			if (can_target_for_trust_not_him(v))
				return true
	return false
}

states.for_trust_not_him = {
	inactive: "For trust not him",
	prompt() {
		let done = true
		view.prompt = "For trust not him: Choose a friendly lord."
		for (let lord of all_lancaster_lords) {
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
		game.state = "for_trust_not_him_vassal"
	},
}

states.for_trust_not_him_vassal = {
	inactive: "For trust not him",
	prompt() {
		view.prompt = "For trust not him: Choose an enemy vassal."
		for (let v of all_vassals)
			if (is_vassal_mustered_with_york_lord(v) && get_vassal_locale(v) === game.battle.where)
				if (can_target_for_trust_not_him(v))
					gen_action_vassal(v)
	},
	vassal(v) {
		push_undo()
		game.vassal = v
		goto_influence_check_for_trust_not_him()
	},
}

function goto_influence_check_for_trust_not_him() {
	game.state = "for_trust_not_him_bribe"
}

states.for_trust_not_him_bribe = {
	inactive: "For trust not him",
	prompt() {
		view.prompt = `For trust not him: Bribe ${vassal_name[game.vassal]}.`
		view.vassal = game.vassal
		prompt_influence_check(game.who, vassal_ic)
	},
	check(spend) {
		if (roll_influence_check("Bribe L" + game.vassal, game.who, spend, vassal_ic))
			muster_vassal(game.vassal, game.who)
		end_for_trust_not_him()
	},
}

function end_for_trust_not_him() {
	game.who = NOBODY
	game.vassal = NOVASSAL
	resume_battle_events()
}

// === BATTLE EVENT: LEEWARD BATTLE LINE ===

function is_leeward_battle_line_in_play(lord: Lord) {
	if (is_missiles_step()) {
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

// === BATTLE EVENT: REGROUP ===

function is_regroup_in_play() {
	if (is_event_in_play(EVENT_YORK_REGROUP)) {
		for (let p of battle_strike_positions) {
			let lord = game.battle.array[p]
			if (is_york_lord(lord) && lord_has_routed_troops(lord) && get_lord_forces(lord, RETINUE))
				return true
		}
	}
	return false
}

function goto_regroup() {
	set_active(YORK)
	game.state = "regroup"
}

states.regroup = {
	inactive: "Regroup",
	prompt() {
		for (let p of battle_strike_positions) {
			let lord = game.battle.array[p]
			if (is_york_lord(lord) && lord_has_routed_troops(lord) && get_lord_forces(lord, RETINUE))
				gen_action_lord(lord)
		}
		if (game.battle.step >= 2) {
			view.prompt = "Regroup: You may choose a lord to regroup."
			view.actions.pass = 1
		} else {
			view.prompt = "Regroup: Choose a lord to regroup."
		}
	},
	lord(lord) {
		push_undo()
		logevent(EVENT_YORK_REGROUP)
		logi("L" + lord)
		game.who = lord
		game.state = "regroup_roll_protection"
		game.event_regroup = [
			0,
			0,
			get_lord_routed_forces(lord, MEN_AT_ARMS),
			get_lord_routed_forces(lord, LONGBOWMEN),
			get_lord_routed_forces(lord, MILITIA),
			get_lord_routed_forces(lord, BURGUNDIANS),
			get_lord_routed_forces(lord, MERCENARIES),
		]
	},
	pass() {
		goto_battle_lord_rout()
	},
}

states.regroup_roll_protection = {
	inactive: "Regroup",
	prompt() {
		view.prompt = "Regroup: Roll each routed troop's protection for them to recover."
		if (game.event_regroup[MEN_AT_ARMS] > 0)
			gen_action_routed_men_at_arms(game.who)
		if (game.event_regroup[LONGBOWMEN] > 0)
			gen_action_routed_longbowmen(game.who)
		if (game.event_regroup[MILITIA] > 0)
			gen_action_routed_militia(game.who)
		if (game.event_regroup[BURGUNDIANS] > 0)
			gen_action_routed_burgundians(game.who)
		if (game.event_regroup[MERCENARIES] > 0)
			gen_action_routed_mercenaries(game.who)
	},
	routed_burgundians(lord) {
		action_regroup(lord, BURGUNDIANS)
	},
	routed_mercenaries(lord) {
		action_regroup(lord, MERCENARIES)
	},
	routed_longbowmen(lord) {
		action_regroup(lord, LONGBOWMEN)
	},
	routed_men_at_arms(lord) {
		action_regroup(lord, MEN_AT_ARMS)
	},
	routed_militia(lord) {
		action_regroup(lord, MILITIA)
	},
}

function action_regroup(lord: Lord, type: Force) {
	let protection = get_modified_protection(lord, type)

	let die = roll_die()
	if (die <= protection) {
		logi(`${get_force_name(lord, type)} ${range(protection)}: W${die}`)
		add_lord_routed_forces(lord, type, -1)
		add_lord_forces(lord, type, 1)
	} else {
		logi(`${get_force_name(lord, type)} ${range(protection)}: B${die}`)
	}

	game.event_regroup[type]--

	for (let i = 2; i < 7; ++i)
		if (game.event_regroup[i] > 0)
			return
	end_regroup()
}

function end_regroup() {
	// remove event from play once used
	set_delete(game.events, EVENT_YORK_REGROUP)

	game.who = NOBODY
	delete game.event_regroup

	if (game.battle.step < 2)
		game.state = "assign_hits"
	else
		goto_battle_lord_rout()
}

// === 4.4.2 BATTLE ROUNDS ===

/*

	for each round (until one side is fully routed)
		flee (defender)
		flee (attacker)
		reposition (defender)
		reposition (attacker)
		determine engagements
		VANGUARD (round 1 only)
		for each engagement
			archery strike
				total hits
				assign hits (defender then attacker)
					SWIFT MANEUVER - skip to check lord rout
			melee strike
				total hits
					FINAL CHARGE
				assign hits (defender then attacker)
					SWIFT MANEUVER - skip to check lord rout
		check lord rout (defender then attacker)
			REGROUP

*/

function goto_battle_rounds() {
	log_h3(`Round ${game.battle.round}`)

	game.battle.step = 0

	if (game.battle.round === 1) {
		set_active_defender()
		goto_culverins_and_falconets()
	} else {
		goto_flee()
	}
}

// === BATTLE CAPABILITY: CULVERINS AND FALCONETS ===

function is_culverins_and_falconets_in_battle() {
	for (let p of battle_strike_positions) {
		let lord = game.battle.array[p]
		if (lord !== NOBODY) {
			if (game.active === LANCASTER && lord_has_capability(lord, AOW_LANCASTER_CULVERINS_AND_FALCONETS))
				return true
			if (game.active === YORK && lord_has_capability(lord, AOW_YORK_CULVERINS_AND_FALCONETS))
				return true
		}
	}
	return false
}

function goto_culverins_and_falconets() {
	if (is_culverins_and_falconets_in_battle())
		game.state = "culverins_and_falconets"
	else
		end_culverins_and_falconets()
}

function end_culverins_and_falconets() {
	if (game.active === game.battle.attacker) {
		goto_flee()
	} else {
		set_active_enemy()
		goto_culverins_and_falconets()
	}
}

states.culverins_and_falconets = {
	inactive: "Culverins and Falconets",
	prompt() {
		view.prompt = "Culverins and Falconets: You may discard capability to add missile hits."

		for (let p of battle_strike_positions) {
			let lord = game.battle.array[p]
			if (lord !== NOBODY) {
				if (game.active === LANCASTER) {
					if (lord_has_capability(lord, AOW_LANCASTER_CULVERINS_AND_FALCONETS[0]))
						gen_action_card(AOW_LANCASTER_CULVERINS_AND_FALCONETS[0])
					if (lord_has_capability(lord, AOW_LANCASTER_CULVERINS_AND_FALCONETS[1]))
						gen_action_card(AOW_LANCASTER_CULVERINS_AND_FALCONETS[1])
				}
				if (game.active === YORK) {
					if (lord_has_capability(lord, AOW_YORK_CULVERINS_AND_FALCONETS[0]))
						gen_action_card(AOW_YORK_CULVERINS_AND_FALCONETS[0])
					if (lord_has_capability(lord, AOW_YORK_CULVERINS_AND_FALCONETS[1]))
						gen_action_card(AOW_YORK_CULVERINS_AND_FALCONETS[1])
				}
			}
		}

		view.actions.pass = 1
	},
	card(c) {
		let lord = find_lord_with_capability_card(c)

		log("L" + lord)
		log(">C" + c)

		if (!game.battle.culverins)
			game.battle.culverins = []
		set_add(game.battle.culverins, lord)

		discard_lord_capability(lord, c)

		goto_culverins_and_falconets()
	},
	pass() {
		end_culverins_and_falconets()
	},
}

function use_culverins(lord: Lord) {
	if (game.battle.culverins && set_has(game.battle.culverins, lord)) {
		let die1 = roll_die()
		let die2 = 0
		if (is_event_in_play(EVENT_YORK_PATRICK_DE_LA_MOTE) && game.active === YORK) {
			logevent(EVENT_YORK_PATRICK_DE_LA_MOTE)
			die2 = roll_die()
			logii(`+ B${die1} B${die2} Artillery`)
		} else {
			logii(`+ B${die1} Artillery`)
		}
		set_delete(game.battle.culverins, lord)
		return (die1 + die2) << 1
	}
	return 0
}

// === 4.4.2 BATTLE ROUNDS: FLEE ===

function goto_flee() {
	set_active_defender()
	game.state = "flee_battle"
}

function end_flee() {
	if (has_no_unrouted_forces()) {
		end_battle_round()
		return
	}

	set_active_enemy()
	if (game.active !== game.battle.attacker)
		goto_reposition_battle()
}

states.flee_battle = {
	inactive: "Flee",
	prompt() {
		view.prompt = "Battle: Choose lords to flee from the battle field."
		for (let lord of game.battle.reserves)
			if (is_friendly_lord(lord))
				gen_action_lord(lord)
		for (let p of battle_strike_positions)
			if (is_friendly_lord(game.battle.array[p]))
				gen_action_lord(game.battle.array[p])
		view.actions.battle = 1
	},
	battle() {
		end_flee()
	},
	lord(lord) {
		push_undo()
		log(`Fled L${lord}.`)
		set_add(game.battle.routed, lord)
		set_add(game.battle.fled, lord)
		remove_lord_from_battle(lord)
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
		goto_determine_engagements()
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
		view.prompt = "Reposition: Advance from reserve."
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
		view.prompt = "Reposition: Slide to center."
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

// See tools/engage.js for generating these tables
const ENGAGEMENTS = [[],[],[],[],[],[],[],[],[],[[0,3]],[[3,1]],[[0,1,3]],[[2,3]],[[0,2,3]],[[1,2,3]],[[0,1,2,3]],[],[[0,4]],[[1,4]],[[0,1,4]],[[2,4]],[[0,2,4]],[[1,2,4]],[[0,1,2,4]],[],[[0,3,4]],[[1,3,4]],[[0,3],[1,4]],[[2,3,4]],[[0,3],[2,4]],[[1,2,3,4]],[[0,3],[1,2,4]],[],[[0,5]],[[5,1]],[[0,1,5]],[[2,5]],[[0,2,5]],[[1,2,5]],[[0,1,2,5]],[],[[0,3,5]],[[3,1,5]],[[0,3],[5,1]],[[2,3,5]],[[0,3],[2,5]],[[2,5],[3,1]],[],[],[[0,4,5]],[[1,4,5]],[[0,1,4,5]],[[2,4,5]],[[2,5],[0,4]],[[1,4],[2,5]],[[0,1,4],[2,5]],[],[[0,3,4,5]],[[1,3,4,5]],[[0,3],[1,4,5]],[[2,3,4,5]],[],[[1,3,4],[2,5]],[[0,3],[1,4],[2,5]]]
const ENGAGEMENTS_61 = [[[0,3,4],[2,5]],[[0,3],[2,4,5]]]
const ENGAGEMENTS_47 = [[[0,1,3],[2,5]],[[0,3],[1,2,5]]]

function pack_battle_array() {
	let bits = 0
	for (let p = 0; p < 6; ++p)
		if (filled(p))
			bits |= (1 << p)
	return bits
}

function goto_determine_engagements() {
	let bits = pack_battle_array()
	if (bits === 47) {
		set_active_attacker()
		game.who = game.battle.array[A2]
		game.state = "choose_flank_47"
		return
	}
	if (bits === 61) {
		set_active_defender()
		game.who = game.battle.array[D2]
		game.state = "choose_flank_61"
		return
	}
	game.battle.engagements = ENGAGEMENTS[bits].slice()
	end_determine_engagements()
}

states.choose_flank_47 = {
	inactive: "Engagement",
	prompt() {
		view.prompt = `Battle: Choose flank to engage with ${lord_name[game.who]}.`
		gen_action_lord(game.battle.array[D1])
		gen_action_lord(game.battle.array[D3])
	},
	lord(lord) {
		let p = get_lord_array_position(lord)
		log("L" + game.who + " flanks L" + lord)
		if (p === D1)
			game.battle.engagements = ENGAGEMENTS_47[0].slice()
		else
			game.battle.engagements = ENGAGEMENTS_47[1].slice()
		end_determine_engagements()
	},
}

states.choose_flank_61 = {
	inactive: "Engagement",
	prompt() {
		view.prompt = `Battle: Choose flank to engage with ${lord_name[game.who]}.`
		gen_action_lord(game.battle.array[A1])
		gen_action_lord(game.battle.array[A3])
	},
	lord(lord) {
		let p = get_lord_array_position(lord)
		log("L" + game.who + " flanks L" + lord)
		if (p === A1)
			game.battle.engagements = ENGAGEMENTS_61[0].slice()
		else
			game.battle.engagements = ENGAGEMENTS_61[1].slice()
		end_determine_engagements()
	},
}

function end_determine_engagements() {
	if (game.battle.round === 1 && game.battle.engagements.length > 1 && is_vanguard_in_battle()) {
		set_active(YORK)
		game.state = "vanguard"
		game.who = find_lord_with_capability_card(AOW_YORK_VANGUARD)
		return
	}
	goto_select_engagement()
}

function goto_select_engagement() {
	game.who = NOBODY

	set_active_attacker()
	if (game.battle.engagements.length === 0)
		// if round is over
		goto_battle_lord_rout()
	else if (game.battle.engagements.length === 1)
		// if no choice, just select the one engagement
		goto_missile_strike_step()
	else
		game.state = "select_engagement"
}

states.select_engagement = {
	inactive: "Engagement",
	prompt() {
		view.prompt = "Battle: Choose the next engagement."

		for (let eng of game.battle.engagements) {
			for (let pos of eng) {
				let lord = game.battle.array[pos]
				if (is_friendly_lord(lord))
					gen_action_lord(lord)
			}
		}
	},
	lord(lord) {
		// move selected engagement to head of list
		let pos = get_lord_array_position(lord)
		let idx = game.battle.engagements.findIndex(e => e.includes(pos))

		let swap = game.battle.engagements[0]
		game.battle.engagements[0] = game.battle.engagements[idx]
		game.battle.engagements[idx] = swap

		goto_missile_strike_step()
	},
}

function goto_missile_strike_step() {
	log_h3("Engage")

	for (let p of game.battle.engagements[0])
		log_lord_engage(game.battle.array[p])

	game.battle.step = 1
	goto_total_hits()
}

function goto_melee_strike_step() {
	game.battle.step = 2
	goto_total_hits()
}

function end_battle_strike_step() {
	if (game.battle.step === 1)
		goto_melee_strike_step()
	else
		end_engagement()
}

function end_engagement() {
	game.battle.engagements.shift()
	goto_select_engagement()
}

// === BATTLE CAPABILITY: VANGUARD ===

function is_vanguard_in_battle() {
	for (let eng of game.battle.engagements) {
		for (let p of eng) {
			let lord = game.battle.array[p]
			if (lord !== NOBODY) {
				if (lord_has_capability(lord, AOW_YORK_VANGUARD))
					return true
			}
		}
	}
	return false
}

states.vanguard = {
	get inactive() {
		let lord = find_lord_with_capability_card(AOW_YORK_VANGUARD)
		let p = get_lord_array_position(lord)
		for (let eng of game.battle.engagements)
			if (eng.includes(p))
				view.engaged = eng
		return "Vanguard"
	},
	prompt() {
		view.prompt = "Vanguard: Norfolk may choose his engagement to be the only one."

		let lord = find_lord_with_capability_card(AOW_YORK_VANGUARD)
		let p = get_lord_array_position(lord)
		for (let eng of game.battle.engagements)
			if (eng.includes(p))
				view.engaged = eng

		view.actions.vanguard = 1
		view.actions.pass = 1
	},
	vanguard() {
		let lord = find_lord_with_capability_card(AOW_YORK_VANGUARD)

		log("L" + lord)
		log(">C" + AOW_YORK_VANGUARD)

		// Filter out engagements that don't contain Vanguard lord
		game.battle.engagements = game.battle.engagements.filter(engagement => {
			for (let p of engagement)
				if (game.battle.array[p] === lord)
					return true
			return false
		})

		goto_select_engagement()
	},
	pass() {
		goto_select_engagement()
	},
}

// === 4.4.2 BATTLE ROUNDS: TOTAL HITS (ROUND UP) ===

function goto_total_hits() {
	set_active_defender()

	if (is_battle_over()) {
		end_battle_round()
		return
	}

	let ahits = 0
	let dhits = 0

	log_h4(battle_steps[game.battle.step].name)

	for (let pos of game.battle.engagements[0]) {
		let lord = game.battle.array[pos]
		if (lord !== NOBODY) {
			let hits = count_lord_hits(lord)
			log_hits(hits / 2, "L" + lord)
			hits += use_culverins(lord)
			if (pos === A1 || pos === A2 || pos === A3)
				ahits += hits
			else
				dhits += hits
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

	game.battle.final_charge = 0

	if (can_final_charge()) {
		set_active(YORK)
		game.state = "final_charge"
		return
	}

	goto_defender_assign_hits()
}

function log_hits(total, name) {
	logi(`${total} ${name}`)
}

// === BATTLE CAPABILITY: FINAL CHARGE ===

function can_final_charge() {
	// If LORD_RICHARD_III with RETINUE in engagement before melee strike.
	if (is_melee_step()) {
		for (let pos of game.battle.engagements[0]) {
			let lord = game.battle.array[pos]
			if (lord === LORD_RICHARD_III && get_lord_forces(lord, RETINUE) > 0)
				return lord_has_capability(lord, AOW_YORK_FINAL_CHARGE)
		}
	}
	return false
}

states.final_charge = {
	inactive: "Final Charge",
	prompt() {
		view.prompt = "Final Charge: Retinue may suffer +1 hit to add +3 extra hits against enemy."
		view.actions.final_charge = 1
		view.actions.pass = 1
	},
	final_charge() {
		logcap(AOW_YORK_FINAL_CHARGE)
		log_hits("+3/+1", "L" + find_lord_with_capability_card(AOW_YORK_FINAL_CHARGE))
		game.battle.final_charge = 1
		if (game.battle.attacker === YORK) {
			game.battle.ahits += 1
			game.battle.dhits += 3
		} else {
			game.battle.ahits += 3
			game.battle.dhits += 1
		}
		goto_defender_assign_hits()
	},
	pass() {
		goto_defender_assign_hits()
	},
}

// === 4.4.2 BATTLE ROUNDS: ROLL BY HIT (PROTECTION ROLL, VALOUR RE-ROLL, FORCES ROUT) ===

function no_remaining_targets() {
	for (let pos of game.battle.engagements[0]) {
		let lord = game.battle.array[pos]
		if (is_friendly_lord(lord))
			if (lord_has_unrouted_units(lord))
				return false
	}
	return true
}

function goto_defender_assign_hits() {
	set_active_defender()
	if (game.battle.ahits === 0 || no_remaining_targets())
		end_defender_assign_hits()
	else
		game.state = "assign_hits"
}

function end_defender_assign_hits() {
	game.who = NOBODY
	game.battle.ahits = 0
	goto_attacker_assign_hits()
}

function goto_attacker_assign_hits() {
	set_active_attacker()
	if (game.battle.dhits === 0 || no_remaining_targets())
		end_attacker_assign_hits()
	else
		game.state = "assign_hits"
}

function end_attacker_assign_hits() {
	game.who = NOBODY
	game.battle.dhits = 0
	end_battle_strike_step()
}

function prompt_hit_forces() {
	let done = true
	for (let pos of game.battle.engagements[0]) {
		let lord = game.battle.array[pos]
		if (!is_friendly_lord(lord))
			continue

		// Note: Must take hit from Final Charge on Retinue.
		if (lord === LORD_RICHARD_III && game.battle.final_charge) {
			gen_action_retinue(lord)
			return false
		}

		if (get_lord_forces(lord, RETINUE) > 0) {
			gen_action_retinue(lord)
			done = false
		}
		if (get_lord_forces(lord, BURGUNDIANS) > 0) {
			gen_action_burgundians(lord)
			done = false
		}
		if (get_lord_forces(lord, MERCENARIES) > 0) {
			gen_action_mercenaries(lord)
			done = false
		}
		if (get_lord_forces(lord, LONGBOWMEN) > 0) {
			gen_action_longbowmen(lord)
			done = false
		}
		if (get_lord_forces(lord, MEN_AT_ARMS) > 0) {
			gen_action_men_at_arms(lord)
			done = false
		}
		if (get_lord_forces(lord, MILITIA) > 0) {
			gen_action_militia(lord)
			done = false
		}

		for_each_vassal_with_lord(lord, v => {
			if (!set_has(game.battle.routed_vassals, v)) {
				gen_action_vassal(v)
				done = false
			}
		})
	}
	return done
}

states.assign_hits = {
	get inactive() {
		view.engaged = game.battle.engagements[0]
		return format_strike_step()
	},
	prompt() {
		view.prompt = `${format_strike_step()}: ${format_hits()}`
		view.engaged = game.battle.engagements[0]

		let hits = 0
		if (game.active === game.battle.attacker)
			hits = game.battle.dhits
		else
			hits = game.battle.ahits

		let done = true
		if (hits > 0)
			done = prompt_hit_forces()
		if (done) {
			view.prompt = format_strike_step() + ": All done."
			if (game.active === YORK && is_regroup_in_play())
				view.actions.regroup = 1
			view.actions.done = 1
		}

		if (game.battle.reroll) {
			switch (game.battle.force) {
				case VASSAL: gen_action_vassal(game.vassal); break
				case RETINUE: gen_action_routed_retinue(game.who); break
				case MEN_AT_ARMS: gen_action_routed_men_at_arms(game.who); break
				case LONGBOWMEN: gen_action_routed_longbowmen(game.who); break
				case MILITIA: gen_action_routed_militia(game.who); break
				case BURGUNDIANS: gen_action_routed_burgundians(game.who); break
				case MERCENARIES: gen_action_routed_mercenaries(game.who); break
			}
		}
	},

	vassal(vassal) {
		if (set_has(game.battle.routed_vassals, vassal))
			action_spend_valour(get_vassal_lord(vassal), VASSAL, vassal)
		else
			action_assign_hits(get_vassal_lord(vassal), VASSAL, vassal)
	},

	retinue(lord) {
		game.battle.final_charge = 0
		action_assign_hits(lord, RETINUE)
	},
	men_at_arms(lord) {
		action_assign_hits(lord, MEN_AT_ARMS)
	},
	longbowmen(lord) {
		action_assign_hits(lord, LONGBOWMEN)
	},
	militia(lord) {
		action_assign_hits(lord, MILITIA)
	},
	burgundians(lord) {
		action_assign_hits(lord, BURGUNDIANS)
	},
	mercenaries(lord) {
		action_assign_hits(lord, MERCENARIES)
	},

	routed_retinue(lord) {
		action_spend_valour(lord, RETINUE)
	},
	routed_men_at_arms(lord) {
		action_spend_valour(lord, MEN_AT_ARMS)
	},
	routed_longbowmen(lord) {
		action_spend_valour(lord, LONGBOWMEN)
	},
	routed_militia(lord) {
		action_spend_valour(lord, MILITIA)
	},
	routed_burgundians(lord) {
		action_spend_valour(lord, BURGUNDIANS)
	},
	routed_mercenaries(lord) {
		action_spend_valour(lord, MERCENARIES)
	},

	regroup() {
		push_undo()
		game.who = NOBODY
		goto_regroup()
	},

	done() {
		if (game.active === game.battle.attacker)
			end_attacker_assign_hits()
		else
			end_defender_assign_hits()
	},
}

function action_spend_valour(lord: Lord, force: Force, vassal: Vassal = NOVASSAL) {
	game.state = "assign_hits"
	game.battle.reroll = 0

	if (is_yeomen_of_the_crown_triggered(lord, force)) {
		logcap(AOW_LANCASTER_YEOMEN_OF_THE_CROWN)
		unrout_unit(lord, RETINUE)
		rout_unit(lord, MEN_AT_ARMS)
		return
	}

	let protection = get_modified_protection(lord, force)
	spend_valour(lord)
	if (!assign_hit_roll("Reroll", protection, ">>"))
		unrout_unit(lord, force, vassal)
	game.vassal = NOVASSAL
}

function rout_unit(lord: Lord, type: Force, v: Vassal = NOVASSAL) {
	if (type === VASSAL) {
		rout_vassal(lord, v)
	} else {
		add_lord_forces(lord, type, -1)
		add_lord_routed_forces(lord, type, 1)
	}
}

function unrout_unit(lord: Lord, type: Force, v: Vassal = NOVASSAL) {
	if (type === VASSAL) {
		unrout_vassal(lord, v)
	} else {
		add_lord_forces(lord, type, 1)
		add_lord_routed_forces(lord, type, -1)
	}
}

function assign_hit_roll(what, prot, indent) {
	let die = roll_die()
	if (die <= prot) {
		log(`${indent}${what} ${range(prot)}: W${die}`)
		return false
	} else {
		log(`${indent}${what} ${range(prot)}: B${die}`)
		return true
	}
}

function get_lord_remaining_valour(lord: Lord): number {
	return map_get(game.battle.valour, lord, 0)
}

function spend_valour(lord: Lord) {
	let n = map_get(game.battle.valour, lord, 0) - 1
	if (n > 0)
		map_set(game.battle.valour, lord, n)
	else
		map_delete(game.battle.valour, lord)
}

function get_inherent_protection(force: Force) {
	switch (force) {
		case RETINUE: return 4
		case VASSAL: return 4
		case MEN_AT_ARMS: return 3
		case LONGBOWMEN: return 1
		case MILITIA: return 1
		case BURGUNDIANS: return 3
		case MERCENARIES: return 3
	}
	throw "INVALID FORCE TYPE"
}

function get_modified_protection(lord: Lord, force: Force) {
	let protection = get_inherent_protection(force)

	if (lord_has_capability(lord, AOW_LANCASTER_PIQUIERS))
		if (force === MEN_AT_ARMS || force === MILITIA)
			if (get_lord_routed_forces(lord, MILITIA) + get_lord_routed_forces(lord, MEN_AT_ARMS) < 3)
				protection = 4

	if (lord_has_capability(lord, AOW_LANCASTER_CHURCH_BLESSINGS))
		if (force === MEN_AT_ARMS)
			protection = 4

	if (lord_has_capability(lord, AOW_LANCASTER_MONTAGU))
		if (force === RETINUE)
			protection = 5

	if (lord_has_capability(lord, AOW_LANCASTER_BARDED_HORSE)) {
		if (force === RETINUE || force === VASSAL) {
			if (is_missiles_step())
				protection = 3
			else
				protection = 5
		}
	}

	if (lord_has_capability(lord, AOW_YORK_BARRICADES)) {
		if (is_friendly_locale(game.battle.where)) {
			if (force === MEN_AT_ARMS)
				protection = 4
			else if (force === LONGBOWMEN || force === MILITIA)
				protection = 2
		}
	}

	if (lord_has_capability(lord, AOW_LANCASTER_CHEVALIERS))
		if (force === MEN_AT_ARMS)
			protection --

	return protection
}

function is_yeomen_of_the_crown_triggered(lord: Lord, type: Force) {
	return (
		type === RETINUE &&
		lord_has_capability(lord, AOW_LANCASTER_YEOMEN_OF_THE_CROWN) &&
		get_lord_forces(lord, MEN_AT_ARMS) > 0
	)
}

function action_assign_hits(lord: Lord, type: Force, v=NOVASSAL) {
	if (game.who !== lord) {
		game.who = lord
		log(`L${lord}`)
	}
	let protection = get_modified_protection(lord, type)

	game.battle.reroll = 0
	game.vassal = NOVASSAL

	if (assign_hit_roll(get_force_name(lord, type, v), protection, ">")) {
		if (get_lord_remaining_valour(lord) > 0 || is_yeomen_of_the_crown_triggered(lord, type)) {
			game.battle.reroll = 1
			game.battle.force = type
			if (type === VASSAL)
				game.vassal = v
		}

		rout_unit(lord, type, v)

		// Swift Maneuver event
		if (type === RETINUE && game.active === LANCASTER && is_event_in_play(EVENT_YORK_SWIFT_MANEUVER)) {
			if (game.battle.reroll) {
				game.state = "swift_maneuver_1"
			} else {
				set_active_enemy()
				game.state = "swift_maneuver_2"
			}
			return
		}
	}

	finish_action_assign_hits()
}

function finish_action_assign_hits() {
	if (game.battle.ahits)
		game.battle.ahits--
	else
		game.battle.dhits--

	if (game.active === game.battle.attacker)
		goto_attacker_assign_hits()
	else
		goto_defender_assign_hits()
}

// === BATTLE EVENT: SWIFT MANEUVER ===

states.swift_maneuver_1 = {
	get inactive() {
		view.engaged = game.battle.engagements[0]
		return format_strike_step()
	},
	prompt() {
		view.prompt = "Swift Maneuver: Reroll routed retinue?"
		view.actions.pass = 1
		gen_action_routed_retinue(game.who)
	},
	routed_retinue(lord) {
		action_spend_valour(lord, RETINUE)
		if (lord_has_routed_retinue(lord))
			this.pass()
		else
			finish_action_assign_hits()
	},
	pass() {
		game.battle.reroll = 0
		set_active_enemy()
		game.state = "swift_maneuver_2"
	},
}

states.swift_maneuver_2 = {
	inactive: "Swift Maneuver",
	prompt() {
		view.prompt = "Swift Maneuver: You may end the battle round immediately."
		view.actions.end_battle_round = 1
		view.actions.pass = 1
	},
	end_battle_round() {
		logevent(EVENT_YORK_SWIFT_MANEUVER)
		set_active_enemy()
		goto_battle_lord_rout()
	},
	pass() {
		set_active_enemy()
		finish_action_assign_hits()
	},
}

// === 4.4.2 BATTLE ROUNDS: LORD ROUT ===

function rout_lord(lord: Lord) {
	log(">L" + lord)

	let pos = get_lord_array_position(lord)

	// Remove from battle array
	game.battle.array[pos] = NOBODY
	set_add(game.battle.routed, lord)
}

function will_lord_rout(lord: Lord) {
	if (lord_has_routed_retinue(lord))
		return true
	if (!lord_has_unrouted_troops(lord))
		return true
	return false
}

function will_any_friendly_lords_rout() {
	for (let lord of game.battle.array)
		if (is_friendly_lord(lord) && will_lord_rout(lord))
			return true
	return false
}

function goto_battle_lord_rout() {
	game.battle.step = 3
	game.who = NOBODY

	if (is_regroup_in_play()) {
		goto_regroup()
		return
	}

	log_h4("Lord Rout")

	// lose any unused culverins (from ravine/vanguard combo)
	delete game.battle.culverins

	set_active_defender()
	if (will_any_friendly_lords_rout())
		game.state = "battle_lord_rout"
	else
		end_battle_lord_rout()
}

function end_battle_lord_rout() {
	set_active_enemy()
	if (will_any_friendly_lords_rout())
		game.state = "battle_lord_rout"
	else
		end_battle_round()
}

states.battle_lord_rout = {
	inactive: "Lord Rout",
	prompt() {
		view.prompt = "Lord Rout: Rout lords whose retinue or troops have routed."

		let done = true
		for (let lord of game.battle.array) {
			if (is_friendly_lord(lord) && will_lord_rout(lord)) {
				gen_action_lord(lord)
				done = false
			}
		}
		if (done) {
			view.prompt = "Lord Rout: All done."
			view.actions.done = 1
		}
	},
	lord(lord) {
		rout_lord(lord)
	},
	done() {
		end_battle_lord_rout()
	},
}

// === 4.4.2 BATTLE ROUNDS: NEW ROUND ===

function end_battle_round() {
	game.battle.engagements = null
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

	if (game.scenario === SCENARIO_IB && game.battle.where === LOC_YORK) {
		if (game.battle.loser === YORK) {
			log("Test of Arms: York favours Lancaster.")
			set_lancaster_favour(LOC_YORK)
		}
		if (game.battle.loser === LANCASTER) {
			log("Test of Arms: York favours York.")
			set_york_favour(LOC_YORK)
		}
	}

	game.battle.round++
	goto_battle_rounds()
}

// === 4.4.3 ENDING THE BATTLE ===

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
	//game.battle.array = null
	game.battle.caltrops = NOBODY

	log_h3("Ending the Battle")
	if (game.battle.loser === BOTH)
		log("Both sides lose.")
	else
		log(`${game.battle.loser} lose.`)

	goto_battle_influence()
}

function has_defeated_lords() {
	for (let lord of game.battle.routed)
		if (is_friendly_lord(lord))
			return true
	return false
}

// === 4.4.3 ENDING THE BATTLE: INFLUENCE ===

function goto_battle_influence() {
	log_h4("Influence")

	if (game.battle.loser !== BOTH) {
		set_active_loser()

		for (let lord of game.battle.routed) {
			if (is_friendly_lord(lord)) {
				reduce_influence(get_lord_influence(lord) + count_vassals_with_lord(lord))
				log(">L" + lord)
			}
		}

		goto_battle_spoils()
	} else {
		end_battle_losses()
	}
}

// === 4.4.3 ENDING THE BATTLE: SPOILS ===

function find_lone_friendly_lord_at(loc: Locale) {
	let who = NOBODY
	let n = 0
	for (let lord of all_friendly_lords()) {
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
	set_active_loser()
	for (let lord of all_friendly_lords())
		if (get_lord_locale(lord) === game.battle.where)
			give_up_spoils(lord)

	set_active_victor()
	round_spoils()
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
	delete game.spoils
	goto_battle_losses_victor()
}

states.battle_spoils = {
	inactive: "Spoils",
	prompt() {
		if (has_any_spoils()) {
			view.prompt = "Spoils: Divide " + list_spoils() + "."
			let here = game.battle.where
			for (let lord of all_friendly_lords())
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

	take_all() {
		push_undo_without_who()
		take_all_spoils()
	},

	end_spoils() {
		end_battle_spoils()
	},
}

// === 4.4.3 ENDING THE BATTLE: LOSSES ===

function has_battle_losses() {
	for (let lord of all_friendly_lords())
		if (lord_has_routed_troops(lord))
			return true
	return false
}

function goto_battle_losses_victor() {
	set_active_victor()
	game.who = NOBODY
	if (has_battle_losses())
		log_h4("Losses")
	resume_battle_losses()
}

function resume_battle_losses() {
	game.state = "battle_losses"
	if (!has_battle_losses())
		end_battle_losses()
}

function roll_losses(lord: Lord, type: Force) {
	let protection = get_inherent_protection(type)

	let die = roll_die()
	if (die <= protection) {
		logi(`${get_force_name(lord, type)} ${range(protection)}: W${die}`)
		add_lord_routed_forces(lord, type, -1)
		add_lord_forces(lord, type, 1)
	} else {
		logi(`${get_force_name(lord, type)} ${range(protection)}: B${die}`)
		add_lord_routed_forces(lord, type, -1)
	}
}

function action_losses(lord: Lord, type: Force) {
	if (game.who !== lord) {
		log(`L${lord}`)
		game.who = lord
	}
	roll_losses(lord, type)
	resume_battle_losses()
}

states.battle_losses = {
	inactive: "Losses",
	prompt() {
		let done = true
		view.prompt = "Losses: Determine the fate of your routed units."
		for (let lord of all_friendly_lords()) {
			if (lord_has_routed_troops(lord) && !lord_has_routed_retinue(lord)) {
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
			view.prompt = "Losses: All done."
			view.actions.done = 1
		}
	},
	routed_mercenaries(lord: Lord) {
		action_losses(lord, MERCENARIES)
	},
	routed_longbowmen(lord: Lord) {
		action_losses(lord, LONGBOWMEN)
	},
	routed_burgundians(lord: Lord) {
		action_losses(lord, BURGUNDIANS)
	},
	routed_men_at_arms(lord: Lord) {
		action_losses(lord, MEN_AT_ARMS)
	},
	routed_militia(lord: Lord) {
		action_losses(lord, MILITIA)
	},
	done() {
		game.who = NOBODY
		end_battle_losses()
	},
}

// === 4.4.3 ENDING THE BATTLE: DEATH CHECK AND DISBAND ===

function has_any_friendly_routed_vassals() {
	for (let v of game.battle.routed_vassals)
		if (is_friendly_lord(get_vassal_lord(v)))
			return true
	return false
}

function gen_each_friendly_routed_vassal() {
	let done = true
	for (let v of game.battle.routed_vassals) {
		if (is_friendly_lord(get_vassal_lord(v))) {
			gen_action_vassal(v)
			done = false
		}
	}
	return done
}

function end_battle_losses() {
	game.who = NOBODY

	if (is_capture_of_the_king_triggered()) {
		goto_capture_of_the_king()
		return
	}

	if (is_foreign_haven_triggered()) {
		goto_foreign_haven()
		return
	}

	goto_death_check()
}

function goto_death_check() {
	log_h4("Death Check")

	if (is_bloody_thou_art_triggered()) {
		goto_bloody_thou_art()
		return
	}

	set_active_defender()
	if (has_defeated_lords() || has_any_friendly_routed_vassals())
		game.state = "death_check"
	else
		end_death_check()
}

function end_death_check() {
	set_active_enemy()
	if (has_defeated_lords() || has_any_friendly_routed_vassals())
		game.state = "death_check"
	else
		goto_battle_aftermath()
}

function prompt_held_event_at_death_check() {
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
			for (let c of EVENT_YORK_ESCAPE_SHIP)
				gen_action_card_if_held(c)
	}
}

function action_held_event_at_death_check(c: Card) {
	push_undo()
	play_held_event(c)
	switch (c) {
		// Play upon Death Check
		case EVENT_YORK_ESCAPE_SHIP[0]:
		case EVENT_YORK_ESCAPE_SHIP[1]:
		case EVENT_LANCASTER_ESCAPE_SHIP:
			goto_play_escape_ship()
			break
		case EVENT_LANCASTER_TALBOT_TO_THE_RESCUE:
			goto_play_talbot_to_the_rescue()
			break
		case EVENT_LANCASTER_WARDEN_OF_THE_MARCHES:
			goto_play_warden_of_the_marches()
			break
	}
}

states.death_check = {
	inactive: "Death Check",
	prompt() {
		if (game.who === NOBODY) {
			view.prompt = "Death Check: Routed lords now die or disband."

			prompt_held_event_at_death_check()

			let done = true
			for (let lord of game.battle.routed) {
				if (is_friendly_lord(lord)) {
					gen_action_lord(lord)
					done = false
				}
			}

			if (done) {
				view.prompt = "Death Check: Disband all routed vassals."
				done = gen_each_friendly_routed_vassal()
			}

			if (done) {
				view.prompt = "Death Check: All done."
				view.actions.done = 1
			}
		} else {
			if (set_has(game.battle.fled, game.who))
				view.prompt = `Death Check: ${lord_name[game.who]} dies on 5-6.`
			else
				view.prompt = `Death Check: ${lord_name[game.who]} dies on 3-6.`
			view.actions.roll = 1
		}
	},
	lord(lord) {
		push_undo() // TODO: maybe not needed (only undo back to play events)
		game.who = lord
	},
	roll() {
		let die = roll_die()
		if (set_has(game.battle.fled, game.who)) {
			if (die >= 5) {
				logi("L" + game.who + " 5-6: B" + die)
				death_lord(game.who)
			} else {
				logi("L" + game.who + " 5-6: W" + die)
				disband_lord(game.who)
			}
		} else {
			if (die >= 3) {
				logi("L" + game.who + " 3-6: B" + die)
				death_lord(game.who)
			} else {
				logi("L" + game.who + " 3-6: W" + die)
				disband_lord(game.who)
			}
		}

		set_delete(game.battle.fled, game.who)
		set_delete(game.battle.routed, game.who)
		game.who = NOBODY
	},
	vassal(v) {
		set_delete(game.battle.routed_vassals, v)
		disband_vassal(v)
	},
	done() {
		end_death_check()
	},
	card: action_held_event_at_death_check,
}

// === DEATH CHECK CAPABILITY: BLOODY THOU ART ===

function is_bloody_thou_art_triggered() {
	return (
		game.battle.loser === LANCASTER &&
		lord_has_capability(LORD_RICHARD_III, AOW_YORK_BLOODY_THOU_ART) &&
		get_lord_locale(LORD_RICHARD_III) === game.battle.where
	)
}

function goto_bloody_thou_art() {
	logcap(AOW_YORK_BLOODY_THOU_ART)

	set_active_defender()
	if (has_defeated_lords() || has_any_friendly_routed_vassals())
		game.state = "bloody_thou_art"
	else
		end_bloody_thou_art()
}

function end_bloody_thou_art() {
	set_active_enemy()
	if (has_defeated_lords() || has_any_friendly_routed_vassals())
		game.state = "bloody_thou_art"
	else
		goto_battle_aftermath()
}

states.bloody_thou_art = {
	inactive: "Bloody thou art",
	prompt() {
		if (game.active === LANCASTER)
			view.prompt = "Bloody thou art: All routed Lancastrian lords die."
		else
			view.prompt = "Bloody thou art: All routed Yorkist lords disband."

		let done = true
		for (let lord of game.battle.routed) {
			if (is_friendly_lord(lord)) {
				gen_action_lord(lord)
				done = false
			}
		}

		if (done) {
			view.prompt = "Bloody thou art: Disband all routed vassals."
			done = gen_each_friendly_routed_vassal()
		}

		if (done) {
			view.prompt = "Bloody thou art: All done."
			view.actions.done = 1
		}
	},
	lord(lord) {
		if (is_lancaster_lord(lord))
			death_lord(lord)
		else
			disband_lord(lord)
		set_delete(game.battle.fled, lord)
		set_delete(game.battle.routed, lord)
	},
	vassal(v) {
		set_delete(game.battle.routed_vassals, v)
		disband_vassal(v)
	},
	done() {
		end_bloody_thou_art()
	},
}

// === SCENARIO IA: CAPTURE OF THE KING ===

function is_capture_of_the_king_triggered() {
	return game.scenario === SCENARIO_IA && game.battle.loser === LANCASTER && get_lord_locale(LORD_HENRY_VI) === game.battle.where
}

function goto_capture_of_the_king() {
	set_active(YORK)
	game.state = "capture_of_the_king"
	game.who = LORD_HENRY_VI
}

states.capture_of_the_king = {
	inactive: "Capture of the King",
	prompt() {
		view.prompt = "Capture of the King: Place Henry VI with any unrouted Yorkist lord."
		for (let lord of all_york_lords)
			if (get_lord_locale(lord) === game.battle.where && !set_has(game.battle.routed, lord))
				gen_action_lord(lord)
	},
	lord(lord) {
		push_undo()
		log(`L${LORD_HENRY_VI} captured by L${lord}.`)
		set_delete(game.battle.routed, LORD_HENRY_VI)
		set_delete(game.battle.fled, LORD_HENRY_VI)
		clear_lord(LORD_HENRY_VI)
		set_lord_locale(LORD_HENRY_VI, CAPTURE_OF_THE_KING + lord as Locale)
		// Note: the other 10 influence were already gained from normal battle victory
		end_battle_losses()
	},
}

function check_capture_of_the_king() {
	if (game.scenario === SCENARIO_IA) {
		let loc = get_lord_locale(LORD_HENRY_VI)
		if (loc >= CAPTURE_OF_THE_KING) {
			let who = loc - CAPTURE_OF_THE_KING as Lord
			if (!is_lord_on_map(who)) {
				log(`L${LORD_HENRY_VI} released!`)
				disband_lord(LORD_HENRY_VI)
				increase_lancaster_influence(10)
			}
		}
	}
}

// === SCENARIO II: FOREIGN HAVEN ===

function is_foreign_haven_triggered() {
	if (set_has(game.battle.routed, LORD_EDWARD_IV) && !is_lord_on_map(LORD_MARGARET))
		return true
	return false
}

function goto_foreign_haven() {
	set_active(YORK)
	game.state = "foreign_haven"
}

states.foreign_haven = {
	inactive: "Foreign Haven",
	prompt() {
		view.prompt = "Foreign Haven: Edward IV may go into exile instead of checking for death."
		view.who = LORD_EDWARD_IV
		view.actions.exile = 1
		view.actions.pass = 1
	},
	exile() {
		exile_lord(LORD_EDWARD_IV)
		set_delete(game.battle.routed, LORD_HENRY_VI)
		set_delete(game.battle.fled, LORD_HENRY_VI)
		goto_death_check()
	},
	pass() {
		goto_death_check()
	},
}

// === DEATH CHECK EVENT: ESCAPE SHIP ===

function can_play_escape_ship() {
	let here = game.battle.where
	if (is_friendly_locale(here)) {
		if (is_seaport(here))
			return true
		if (search_escape_ship(here))
			return true
	}
	return false
}

function search_escape_ship(start: Locale) {
	search_seen.fill(0)
	search_seen[start] = 1

	let queue = [ start ]

	while (queue.length > 0) {
		let here = queue.shift()

		if (is_seaport(here))
			return true

		for (let next of data.locales[here].adjacent) {
			if (is_friendly_locale(next)) {
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
	game.state = "escape_ship"
	game.who = NOBODY
}

states.escape_ship = {
	inactive: "Escape Ship",
	prompt() {
		view.prompt = "Escape Ship: Choose lords to go to exile."
		for (let lord of game.battle.routed)
			gen_action_lord(lord)
		view.actions.done = 1
	},
	lord(lord) {
		push_undo()

		// Note: locale must be friendly for this event, so no spoils.
		exile_lord(lord)

		set_delete(game.battle.fled, lord)
		set_delete(game.battle.routed, lord)
	},
	done() {
		push_undo()
		end_held_event()
		game.state = "death_check"
	},
}

// === DEATH CHECK EVENT: TALBOT TO THE RESCUE ===

function can_play_talbot_to_the_rescue() {
	return has_defeated_lords()
}

function goto_play_talbot_to_the_rescue() {
	game.state = "talbot_to_the_rescue"
}

states.talbot_to_the_rescue = {
	inactive: "Talbot to the Rescue",
	prompt() {
		view.prompt = "Talbot to the Rescue: Disband routed Lancastrians instead of rolling for death."
		for (let lord of game.battle.routed)
			gen_action_lord(lord)
		view.actions.done = 1
	},
	lord(lord) {
		push_undo()
		disband_lord(lord)
		set_delete(game.battle.fled, lord)
		set_delete(game.battle.routed, lord)
	},
	done() {
		push_undo()
		end_held_event()
		game.state = "death_check"
	},
}

// === DEATH CHECK EVENT: WARDEN OF THE MARCHES ===

function can_play_warden_of_the_marches() {
	// Note: we don't exhaustively check shaky allies here so a dead end state is possible (but can be undone)
	if (is_north(game.battle.where)) {
		for (let loc of all_locales)
			if (is_north(loc) && loc !== game.battle.where && is_friendly_locale(loc) && !has_enemy_lord(loc))
				return true
	}
	return false
}

function goto_play_warden_of_the_marches() {
	game.state = "warden_of_the_marches"
	game.where = NOWHERE
}

states.warden_of_the_marches = {
	inactive: "Warden of the Marches",
	prompt() {
		if (game.where === NOWHERE) {
			view.prompt = "Warden of the Marches: Choose a friendly stronghold in the North."
			for (let loc of all_locales)
				if (is_north(loc) && loc !== game.battle.where && is_friendly_locale(loc) && !has_enemy_lord(loc))
					gen_action_locale(loc)
		} else {
			view.prompt = `Warden of the Marches: Move routed Lancastrians to ${locale_name[game.where]}.`
			let done = true
			for (let lord of game.battle.routed) {
				if (is_move_allowed(lord, game.where)) {
					gen_action_lord(lord)
					done = false
				}
			}
			if (done)
				view.prompt = "Warden of the Marches: All done."
			view.actions.done = 1
		}
	},
	locale(loc) {
		push_undo()
		game.where = loc
	},
	lord(lord) {
		push_undo()

		set_delete(game.battle.fled, lord)
		set_delete(game.battle.routed, lord)

		log(`L${lord} to S${game.where}.`)

		set_lord_forces(lord, RETINUE, 1)
		for (let x of all_force_types)
			set_lord_routed_forces(lord, x, 0)

		remove_battle_capability_troops(lord)

		set_lord_locale(lord, game.where)

		// vassals are disbanded in usual death check state

		// lords without troops are disbanded during aftermath
	},
	done() {
		push_undo()
		end_held_event()
		game.where = NOWHERE
		game.state = "death_check"
	},
}

// === 4.4.4 ENDING THE BATTLE: AFTERMATH ===

function should_disband_lords_without_troops() {
	for (let lord of all_friendly_lords())
		if (is_lord_on_map(lord) && !lord_has_unrouted_troops(lord))
			return true
	return false
}

function goto_battle_aftermath() {
	// Remove temporary troops granted by capabilities
	for (let lord of all_lords)
		if (get_lord_locale(lord) === game.battle.where)
			remove_battle_capability_troops(lord)

	set_active_defender()
	if (should_disband_lords_without_troops())
		game.state = "aftermath_disband"
	else
		end_battle_aftermath_disband()
}

function end_battle_aftermath_disband() {
	set_active_enemy()
	if (should_disband_lords_without_troops())
		game.state = "aftermath_disband"
	else
		end_battle_aftermath()
}

states.aftermath_disband = {
	inactive: "Aftermath",
	prompt() {
		view.prompt = "Aftermath: Disband lords with no unrouted troops."
		for (let lord of all_friendly_lords())
			if (is_lord_on_map(lord) && !lord_has_unrouted_troops(lord))
				gen_action_lord(lord)
	},
	lord(lord) {
		set_delete(game.battle.routed, lord)
		set_delete(game.battle.fled, lord)
		disband_lord(lord)
		if (!should_disband_lords_without_troops())
			end_battle_aftermath_disband()
	},
}

function end_battle_aftermath() {
	if (is_york_lord(game.command))
		set_active(YORK)
	else
		set_active(LANCASTER)

	// Discard battle held events
	set_delete(game.events, EVENT_LANCASTER_FOR_TRUST_NOT_HIM)
	set_delete(game.events, EVENT_LANCASTER_LEEWARD_BATTLE_LINE)
	set_delete(game.events, EVENT_LANCASTER_RAVINE)
	set_delete(game.events, EVENT_LANCASTER_SUSPICION)

	set_delete(game.events, EVENT_YORK_CALTROPS)
	set_delete(game.events, EVENT_YORK_LEEWARD_BATTLE_LINE)
	set_delete(game.events, EVENT_YORK_PATRICK_DE_LA_MOTE)
	set_delete(game.events, EVENT_YORK_REGROUP)
	set_delete(game.events, EVENT_YORK_SUSPICION)
	set_delete(game.events, EVENT_YORK_SWIFT_MANEUVER)

	// Discard death check held events
	set_delete(game.events, EVENT_LANCASTER_WARDEN_OF_THE_MARCHES)
	set_delete(game.events, EVENT_LANCASTER_TALBOT_TO_THE_RESCUE)
	set_delete(game.events, EVENT_LANCASTER_ESCAPE_SHIP)
	set_delete(game.events, EVENT_YORK_ESCAPE_SHIP[0])
	set_delete(game.events, EVENT_YORK_ESCAPE_SHIP[1])

	// Recovery
	spend_all_actions()
	delete game.battle

	if (game.march)
		end_march()
	else
		end_sail()
}

// === 4.7 FEED ===

function can_feed_from_shared(lord: Lord) {
	let loc = get_lord_locale(lord)
	return get_shared_assets(loc, PROV) > 0
}

function can_pay_from_shared(lord: Lord, amount: number) {
	let loc = get_lord_locale(lord)
	return get_shared_assets(loc, COIN) >= amount
}

function has_friendly_lord_who_must_feed() {
	for (let lord of all_friendly_lords())
		if (is_lord_unfed(lord))
			return true
	return false
}

function set_lord_feed_requirements(lord: Lord) {
	// Count how much food each lord needs
	if (get_lord_moved(lord))
		set_lord_unfed(lord, Math.ceil(count_lord_all_forces(lord) / 6))
	else
		set_lord_unfed(lord, 0)
}

function reset_lord_feed_requirements(here: Locale) {
	for (let lord of all_friendly_lords())
		if (get_lord_locale(lord) === here)
			set_lord_feed_requirements(lord)
}

function goto_feed() {
	log_br()

	for (let lord of all_friendly_lords())
		set_lord_feed_requirements(lord)

	if (is_campaign_phase() && has_flag(FLAG_SUPPLY_DEPOT) && game.active === LANCASTER) {
		clear_flag(FLAG_SUPPLY_DEPOT)
		logevent(EVENT_LANCASTER_REBEL_SUPPLY_DEPOT)
		end_feed()
		return
	}

	if (has_friendly_lord_who_must_feed()) {
		game.state = "feed"
	} else {
		end_feed()
	}
}

function end_feed() {
	if (game.command !== NOBODY) {
		// during campaign
		set_active_enemy()
		if (is_active_command())
			goto_remove_markers()
		else
			goto_feed()
	} else {
		// during disembark
		goto_disembark()
	}
}

states.feed = {
	inactive: "Feed",
	prompt() {
		view.prompt = "Feed: Feed all lords who moved or fought."

		let done = true

		// Feed from own mat
		if (done) {
			for (let lord of all_friendly_lords()) {
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
			view.prompt = "Feed: Feed lords with shared provender."
			for (let lord of all_friendly_lords()) {
				if (is_lord_unfed(lord) && can_feed_from_shared(lord)) {
					gen_action_lord(lord)
					done = false
				}
			}
		}

		// Pillage
		if (done) {
			view.prompt = "Feed: Pillage with lords who have unfed troops."
			for (let lord of all_friendly_lords()) {
				if (is_lord_unfed(lord) && can_pillage(get_lord_locale(lord))) {
					gen_action_lord(lord)
					done = false
				}
			}
		}

		// Disband
		if (done) {
			view.prompt = "Feed: Disband lords who have unfed troops."
			for (let lord of all_friendly_lords()) {
				if (is_lord_unfed(lord)) {
					gen_action_lord(lord)
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
		// no choice so no need to undo here?
		add_lord_assets(lord, PROV, -1)
		feed_lord(lord)
	},
	lord(lord) {
		push_undo()
		let here = get_lord_locale(lord)
		game.who = lord
		if (can_feed_from_shared(lord)) {
			game.state = "feed_lord_shared"
		} else if (can_pillage(here)) {
			reset_lord_feed_requirements(here)
			game.state = "feed_lord_pillage"
		} else {
			game.state = "feed_lord_disband"
		}
	},
	end_feed() {
		push_undo()
		end_feed()
	},
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
		view.prompt = `Feed: Feed ${lord_name[game.who]}'s troops with shared provender.`
		let loc = get_lord_locale(game.who)
		for (let lord of all_friendly_lords()) {
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

states.feed_lord_pillage = {
	inactive: "Feed",
	prompt() {
		let here = get_lord_locale(game.who)
		view.prompt = `Feed: Pillage ${locale_name[here]} with ${lord_name[game.who]}.`
		view.actions.pillage = 1
	},
	pillage() {
		do_pillage(game.who)
		game.who = NOBODY
		game.state = "feed"
	},
}

states.feed_lord_disband = {
	inactive: "Feed",
	prompt() {
		view.prompt = `Feed: Disband ${lord_name[game.who]}.`
		view.actions.disband = 1
	},
	disband() {
		do_pillage_disband(game.who)
		game.who = NOBODY
		game.state = "feed"
	},
}

// === 4.7 FEED: REMOVE MARKERS ===

function goto_remove_markers() {
	clear_lords_moved()
	goto_command_activation()
}

// === 4.8 END CAMPAIGN ===

function goto_end_campaign() {
	// Discard "This Campaign" events from play.
	discard_events("this_campaign")

	// Discard Held "This Campaign" events.
	set_delete(game.events, EVENT_LANCASTER_PARLIAMENTS_TRUCE)
	set_delete(game.events, EVENT_YORK_PARLIAMENTS_TRUCE)

	log_h1("End Campaign")
	set_active(P1)
	goto_tides_of_war()
}

// === 4.8.1 END CAMPAIGN: TIDES OF WAR ===

function tow_presence(what, lord_list, pred) {
	for (let lord of lord_list)
		if (pred(lord))
			return tow(1, what)
	return 0
}

function tow_favour_at(n, loc, favour_fn, lord_fn) {
	if (favour_fn(loc) && !lord_fn(loc))
		return tow(n, "Favour at S" + loc)
	return 0
}

function tow_influence(list) {
	let n = 0
	for (let lord of list)
		if (is_lord_on_map(lord))
			n += get_lord_influence(lord)
	return tow(n, "Lord Influence Ratings")
}

function count_favour(list) {
	let n = 0
	for (let loc of list)
		if (has_lancaster_favour(loc))
			n += 1
		else if (has_york_favour(loc))
			n -= 1
	return n
}

function tow(n: number, what: string): number {
	if (n > 0)
		log(">+" + n + " " + what)
	return n
}

function goto_tides_of_war() {
	set_active(BOTH)

	log_h2_common("Tides of War")

	let cities = count_favour(all_city_locales)
	let towns = count_favour(all_town_locales)
	let fortresses = count_favour(all_fortress_locales)

	let lanc = 0
	let york = 0

	let cap_lord = find_lord_with_capability_card(AOW_LANCASTER_NORTHMEN)
	if (is_lancaster_lord(cap_lord) && is_north(get_lord_locale(cap_lord)))
		logcap(AOW_LANCASTER_NORTHMEN)

	cap_lord = find_lord_with_capability_card(AOW_YORK_SOUTHERNERS)
	if (is_york_lord(cap_lord) && is_south(get_lord_locale(cap_lord)))
		logcap(AOW_YORK_SOUTHERNERS)

	cap_lord = find_lord_with_capability_card(AOW_YORK_WELSHMEN)
	if (is_york_lord(cap_lord) && is_wales(get_lord_locale(cap_lord)))
		logcap(AOW_YORK_WELSHMEN)

	log_h3("Lancaster")

	lanc += tow_presence("Lord in North", all_lancaster_lords, is_lord_in_north)
	lanc += tow_presence("Lord in South", all_lancaster_lords, is_lord_in_south)
	lanc += tow_presence("Lord in Wales", all_lancaster_lords, is_lord_in_wales)

	if (is_lancaster_dominating_north())
		lanc += tow(2, "Dominate North")
	if (is_lancaster_dominating_south())
		lanc += tow(2, "Dominate South")
	if (is_lancaster_dominating_wales())
		lanc += tow(2, "Dominate Wales")

	lanc += tow_favour_at(2, LOC_LONDON, has_lancaster_favour, has_york_lord)
	lanc += tow_favour_at(2, LOC_CALAIS, has_lancaster_favour, has_york_lord)
	lanc += tow_favour_at(1, LOC_HARLECH, has_lancaster_favour, has_york_lord)

	if (cities > 0)
		lanc += tow(2, "Most Favour at Cities")
	if (towns > 0)
		lanc += tow(1, "Most Favour at Towns")
	if (fortresses > 0)
		lanc += tow(1, "Most Favour at Fortresses")

	if (
		lord_has_capability(LORD_HENRY_VI, AOW_LANCASTER_MARGARET) &&
		get_lord_locale(LORD_HENRY_VI) !== LOC_LONDON
	) {
		lanc += tow(2, "C" + AOW_LANCASTER_MARGARET)
	}

	if (
		lord_has_capability(LORD_EXETER_1, AOW_LANCASTER_COUNCIL_MEMBER) ||
		lord_has_capability(LORD_EXETER_2, AOW_LANCASTER_COUNCIL_MEMBER) ||
		lord_has_capability(LORD_SOMERSET_2, AOW_LANCASTER_COUNCIL_MEMBER) ||
		lord_has_capability(LORD_SOMERSET_1, AOW_LANCASTER_COUNCIL_MEMBER) ||
		lord_has_capability(LORD_BUCKINGHAM, AOW_LANCASTER_COUNCIL_MEMBER)
	) {
		lanc += tow(1, "C" + AOW_LANCASTER_COUNCIL_MEMBER)
	}

	if (game.scenario === SCENARIO_II) {
		if (get_lord_locale(LORD_MARGARET) === LOC_LONDON)
			lanc += tow(3, "Queen Regent")
	}

	if (set_has(INFLUENCE_TURNS, current_turn()))
		lanc += tow_influence(all_lancaster_lords)

	increase_lancaster_influence(lanc)
	log("Total: " + lanc)

	log_h3("York")

	york += tow_presence("Lord in North", all_york_lords, is_lord_in_north)
	york += tow_presence("Lord in South", all_york_lords, is_lord_in_south)
	york += tow_presence("Lord in Wales", all_york_lords, is_lord_in_wales)

	if (is_york_dominating_north())
		york += tow(2, "Dominate North")
	if (is_york_dominating_south())
		york += tow(2, "Dominate South")
	if (is_york_dominating_wales())
		york += tow(2, "Dominate Wales")

	york += tow_favour_at(2, LOC_LONDON, has_york_favour, has_lancaster_lord)
	york += tow_favour_at(2, LOC_CALAIS, has_york_favour, has_lancaster_lord)
	york += tow_favour_at(1, LOC_HARLECH, has_york_favour, has_lancaster_lord)

	if (cities < 0)
		york += tow(2, "Most Favour at Cities")
	if (towns < 0)
		york += tow(1, "Most Favour at Towns")
	if (fortresses < 0)
		york += tow(1, "Most Favour at Fortresses")

	if (lord_has_capability(LORD_EDWARD_IV, AOW_YORK_FIRST_SON))
		york += tow(1, "C" + AOW_YORK_FIRST_SON)

	if (set_has(INFLUENCE_TURNS, current_turn()))
		york += tow_influence(all_york_lords)

	increase_york_influence(york)
	log("Total: " + york)

	if (eligible_charity())
		goto_we_done_deeds_of_charity()
	else
		goto_disembark()
}

// === 4.8.2 END CAMPAIGN: DISEMBARK ===

function has_lords_at_sea() {
	for (let x of all_friendly_lords()) {
		if (is_lord_at_sea(x))
			return true
	}
	return false
}

function is_lord_at_sea(lord: Lord) {
	let here = get_lord_locale(lord)
	return here === LOC_NORTH_SEA || here === LOC_IRISH_SEA || here === LOC_ENGLISH_CHANNEL
}

function goto_disembark() {
	if (has_lords_at_sea()) {
		game.state = "disembark"
		game.who = NOBODY
	} else {
		end_disembark()
	}
}

function end_disembark() {
	set_active_enemy()
	if (has_lords_at_sea())
		goto_disembark()
	else {
		set_active(P1)
		goto_victory_check()
	}
}

function roll_disembark() {
	let die = roll_die()
	if (die <= 4) {
		log(`Shipwreck 1-4: B${die}.`)
		return false
	} else {
		log(`Shipwreck 1-4: W${die}.`)
		return true
	}
}

function has_safe_ports(sea: Locale) {
	for (let loc of find_ports(sea, NOBODY))
		if (!has_enemy_lord(loc))
			if (is_move_allowed(game.who, loc))
				return true
	return false
}

states.disembark = {
	inactive: "Disembark",
	prompt() {
		if (game.who === NOBODY) {
			view.prompt = "Disembark: Roll to land or shipwreck all your lords at sea."
			for (let lord of all_friendly_lords())
				if (is_lord_at_sea(lord))
					gen_action_lord(lord)
		} else {
			view.prompt = `Disembark: ${lord_name[game.who]}. Roll 1-4 to shipwreck, 5-6 to land.`
			view.actions.roll = 1
		}
	},
	lord(lord) {
		game.who = lord
	},
	roll() {
		if (roll_disembark()) {
			if (has_safe_ports(get_lord_locale(game.who))) {
				game.state = "disembark_to"
			} else {
				disband_lord(game.who)
				game.who = NOBODY
				goto_disembark()
			}
		} else {
			// Shipwreck!
			disband_influence_penalty(game.who)
			shipwreck_lord(game.who)
			game.who = NOBODY
			goto_disembark()
		}
	},
}

states.disembark_to = {
	inactive: "Disembark",
	prompt() {
		view.prompt = `Disembark: Land ${lord_name[game.who]} at a port.`
		for (let loc of find_ports(get_lord_locale(game.who), NOBODY))
			if (!has_enemy_lord(loc) && is_move_allowed(game.who, loc))
				gen_action_locale(loc)
	},
	locale(loc) {
		set_lord_locale(game.who, loc)
		set_lord_moved(game.who, 1)
		levy_burgundians(game.who)
		game.who = NOBODY
		goto_feed()
	},
}

function disband_influence_penalty(lord: Lord) {
	let influence = get_lord_influence(lord)
	for (let v of all_vassals)
		if (is_vassal_mustered_with(v, lord))
			influence += 1
	reduce_influence(influence)
}

function goto_advance_campaign() {
	game.turn++
	set_active(P1)
	log_h1("Levy " + current_turn_name())
	goto_levy_arts_of_war()
}

// === 4.8.3 END CAMPAIGN: VICTORY CHECK ===

function is_grow_turn() {
	// Ravaged Land
	if (game.scenario === SCENARIO_III)
		return false
	return set_has(GROW_TURNS, current_turn())
}

function is_waste_turn() {
	// Brief Rebellion
	if (game.scenario === SCENARIO_IC)
		return false
	// Ravaged Land
	if (game.scenario === SCENARIO_III)
		return false
	return set_has(WASTE_TURNS, current_turn())
}

function goto_victory_check() {
	if (check_campaign_victory())
		return
	if (check_threshold_victory())
		return
	if (check_scenario_end_victory())
		return

	if (is_grow_turn())
		do_grow()
	if (is_waste_turn())
		do_waste()

	goto_reset()
}

// === 4.8.4 END CAMPAIGN: GROW ===

function do_grow() {
	log_h2_common("Grow")

	log("Recover " + game.pieces.exhausted.length + " Exhausted.")
	log("Recover " + game.pieces.depleted.length + " Depleted.")

	game.pieces.depleted = game.pieces.exhausted
	game.pieces.exhausted = []
}

// === 4.8.5 END CAMPAIGN: WASTE ===

function do_waste() {
	log_h2_common("Waste")

	log("Remove half Provender.")
	log("Remove half Carts.")
	log("Remove half Ships.")
	log("Reset Coin.")
	log("Reset Troops.")

	for (let lord of all_lords)
		if (is_lord_on_map(lord))
			do_lord_waste(lord)
}

function do_lord_waste(lord: Lord) {
	remove_half(lord, PROV)
	remove_half(lord, CART)
	remove_half(lord, SHIP)
	set_lord_assets(lord, COIN, data.lords[lord].assets.coin)
	muster_lord_forces(lord)
}

function remove_half(lord: Lord, type: Asset) {
	set_lord_assets(lord, type, Math.ceil(get_lord_assets(lord, type) / 2))
}

// === 4.8.6 END CAMPAIGN: RESET (DISCARD ARTS OF WAR) ===

function goto_reset() {
	log_h2_common("Reset")
	set_active(P2)
	game.state = "reset"
	if (current_hand().length === 0)
		end_reset()
}

states.reset = {
	inactive: "Reset",
	prompt() {
		view.prompt = "Reset: You may discard any held Arts of War cards desired."
		for (let c of current_hand())
			gen_action_card(c)
		view.actions.done = 1
	},
	card(c) {
		push_undo()
		log("Discard Held card.")
		set_delete(game.hand_y, c)
		set_delete(game.hand_l, c)
	},
	done() {
		end_reset()
	},
}

function end_reset() {
	set_active_enemy()
	if (game.active === P2)
		goto_advance_campaign()
	else if (current_hand().length === 0)
		end_reset()
}

// === 5.1 CAMPAIGN VICTORY ===

function check_campaign_victory_york() {
	let next_turn = current_turn() + 1
	for (let lord of all_lancaster_lords) {
		if (is_lord_on_map(lord))
			return false
		if (next_turn <= 15)
			if (is_lord_in_exile(lord) && get_lord_calendar(lord) === next_turn)
				return false
	}
	return true
}

function check_campaign_victory_lancaster() {
	let next_turn = current_turn() + 1
	for (let lord of all_york_lords) {
		if (is_lord_on_map(lord))
			return false
		if (next_turn <= 15)
			if (is_lord_in_exile(lord) && get_lord_calendar(lord) === next_turn)
				return false
	}
	return true
}

function check_campaign_victory() {
	let york_v = check_campaign_victory_york()
	let lancaster_v = check_campaign_victory_lancaster()

	if (york_v && lancaster_v) {
		goto_game_over("Draw", "The game ended in a draw.")
		return true
	}
	if (york_v) {
		goto_game_over(YORK, `${YORK} won a Campaign Victory!`)
		return true
	}
	if (lancaster_v) {
		goto_game_over(LANCASTER, `${LANCASTER} won a Campaign Victory!`)
		return true
	}

	return false
}

// === 5.2 THRESHOLD VICTORY ===

function check_threshold_victory() {
	if (Math.abs(game.influence) >= scenario_victory_threshold()) {
		if (game.influence > 0)
			goto_game_over(LANCASTER, `${LANCASTER} won with ${game.influence} Influence.`)
		else
			goto_game_over(YORK, `${YORK} won with ${Math.abs(game.influence)} Influence.`)
		return true
	}
	return false
}

// === 5.3 SCENARIO END VICTORY ===

function check_scenario_end_victory() {
	if (game.scenario === SCENARIO_IB) {
		if (has_york_favour(LOC_YORK))
			goto_game_over(YORK, "York favours York.")
		else if (has_lancaster_favour(LOC_YORK))
			goto_game_over(LANCASTER, "York favours Lancaster.")
		else
			goto_game_over("Draw", "York favours nobody.")
		return true
	}

	if (current_turn() + 1 === scenario_end_marker[game.scenario]) {
		if (game.influence === 0)
			goto_game_over("Draw", "The game ended in a draw.")
		else if (game.influence > 0)
			goto_game_over(LANCASTER, `${LANCASTER} won with ${game.influence} Influence.`)
		else
			goto_game_over(YORK, `${YORK} won with ${Math.abs(game.influence)} Influence.`)
		return true
	}
	return false
}

// === 6.0 SCENARIOS ===

const SCENARIO_IA = 0
const SCENARIO_IB = 1
const SCENARIO_IC = 2
const SCENARIO_II = 3
const SCENARIO_III = 4

const scenario_name = exports.scenarios = [
	"Ia. Henry VI",
	"Ib. Towton",
	"Ic. Somerset's Return",
	"II. Warwick's Rebellion",
	"III. My Kingdom for a Horse",
// TODO	"I-III. Wars of the Roses",
]

const scenario_setup = [
	setup_Ia,
	setup_Ib,
	setup_Ic,
	setup_II,
	setup_III,
]

const scenario_end_marker = [
	16,
	2,
	8,
	16,
	10,
]

function scenario_victory_threshold() {
	let turn = current_turn()
	switch (game.scenario) {
		case SCENARIO_IA:
			if (turn <= 5)
				return 40
			if (turn <= 10)
				return 35
			return 30
		case SCENARIO_IB:
			return 100 // no threshold
		case SCENARIO_IC:
			return 25
		case SCENARIO_II:
			if (turn <= 5)
				return 40
			if (turn <= 10)
				return 35
			return 30
		case SCENARIO_III:
			return 45
	}
	return 45
}

function is_card_in_scenario(c: Card): boolean {
	let roses = data.cards[c].roses
	let scenario = game.scenario
	switch (scenario) {
		case SCENARIO_IA:
		case SCENARIO_IB:
		case SCENARIO_IC:
			return roses === 0 || roses === 1
		case SCENARIO_II:
			return (roses === 0 || roses === 2) && c !== L4
		case SCENARIO_III:
			return roses === 0 || roses === 3
	}
	throw "INVALID SCENARIO"
}

function muster_lord_forces(lord: Lord) {
	let info = data.lords[lord]
	set_lord_forces(lord, RETINUE, info.forces.retinue | 0)
	set_lord_forces(lord, MEN_AT_ARMS, info.forces.men_at_arms | 0)
	set_lord_forces(lord, LONGBOWMEN, info.forces.longbowmen | 0)
	set_lord_forces(lord, MILITIA, info.forces.militia | 0)
}

function muster_lord(lord: Lord, locale: Locale) {
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
		scenario: scenario_name.indexOf(scenario),
		hidden: options.hidden ? 1 : 0,

		log: [],
		undo: [],

		active: null,
		state: "setup_lords",

		flags: 0,
		turn: 0,
		influence: 0,

		hand_y: [],
		hand_l: [],
		plan_y: [],
		plan_l: [],

		events: [], // this levy/this campaign cards

		pieces: {
			// per lord data
			locale: [],
			assets: [],
			forces: [],
			routed: [],
			capabilities: [], // TODO map card -> lord instead of lord+slot -> card
			moved: [],

			// per vassal data
			vassals: Array(vassal_count).fill(VASSAL_OUT_OF_PLAY),

			// per locale data
			depleted: [],
			exhausted: [],
			favourl: [],
			favoury: [],
		},

		actions: 0,
		command: NOBODY,
		who: NOBODY,
		vassal: NOVASSAL,
		where: NOWHERE,
		count: 0,
		group: null,
	}

	log_h1(scenario)

	scenario_setup[game.scenario]()

	update_aliases()

	goto_setup_lords()

	return game
}

// === SCENARIO: IA ===

function setup_Ia() {
	game.turn = 1 << 1

	set_flag(FLAG_REBEL_IS_YORK)
	game.active = YORK
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

	add_lancaster_favour(LOC_LONDON)
	add_lancaster_favour(LOC_WELLS)
	add_lancaster_favour(LOC_SCOTLAND)
	add_lancaster_favour(LOC_FRANCE)

	add_york_favour(LOC_ELY)
	add_york_favour(LOC_LUDLOW)
	add_york_favour(LOC_BURGUNDY)
	add_york_favour(LOC_IRELAND)

	setup_vassals()

	log("Allied Networks.")
	log("Capture of the King.")
}

// === SCENARIO: IB ===

function setup_Ib() {
	game.turn = 1 << 1

	set_flag(FLAG_REBEL_IS_YORK)
	game.active = YORK
	game.influence = 0

	muster_lord(LORD_SOMERSET_1, LOC_NEWCASTLE)
	muster_lord(LORD_EXETER_1, LOC_NEWCASTLE)
	muster_lord(LORD_NORTHUMBERLAND_L, LOC_CARLISLE)

	muster_lord(LORD_MARCH, LOC_LONDON)
	muster_lord(LORD_NORFOLK, LOC_LONDON)
	muster_lord(LORD_WARWICK_Y, LOC_LONDON)

	add_lancaster_favour(LOC_ST_ALBANS)
	add_lancaster_favour(LOC_SCARBOROUGH)
	add_lancaster_favour(LOC_NEWCASTLE)
	add_lancaster_favour(LOC_BAMBURGH)
	add_lancaster_favour(LOC_HEXHAM)
	add_lancaster_favour(LOC_APPLEBY)
	add_lancaster_favour(LOC_CARLISLE)
	add_lancaster_favour(LOC_SCOTLAND)
	add_lancaster_favour(LOC_FRANCE)

	add_york_favour(LOC_LONDON)
	add_york_favour(LOC_CALAIS)
	add_york_favour(LOC_GLOUCESTER)
	add_york_favour(LOC_HEREFORD)
	add_york_favour(LOC_OXFORD)
	add_york_favour(LOC_SALISBURY)
	add_york_favour(LOC_WINCHESTER)
	add_york_favour(LOC_GUILDFORD)
	add_york_favour(LOC_ARUNDEL)
	add_york_favour(LOC_HASTINGS)
	add_york_favour(LOC_DOVER)
	add_york_favour(LOC_ROCHESTER)
	add_york_favour(LOC_CANTERBURY)
	add_york_favour(LOC_SOUTHAMPTON)
	add_york_favour(LOC_BURGUNDY)
	add_york_favour(LOC_IRELAND)

	setup_vassals([ VASSAL_FAUCONBERG, VASSAL_NORFOLK ])
	muster_vassal(VASSAL_FAUCONBERG, LORD_MARCH)

	log("Norfolk is Late.")
	log("Test of Arms.")
}

// === SCENARIO: IC ===

function setup_Ic() {
	game.turn = 5 << 1

	clear_flag(FLAG_REBEL_IS_YORK)
	game.active = YORK
	game.influence = 6
	muster_lord(LORD_WARWICK_Y, LOC_LONDON)
	muster_lord(LORD_MARCH, LOC_LONDON)
	muster_lord(LORD_SOMERSET_1, LOC_BAMBURGH)

	set_lord_calendar(LORD_HENRY_VI, 5)
	set_lord_in_exile(LORD_HENRY_VI)

	add_lancaster_favour(LOC_SCARBOROUGH)
	add_lancaster_favour(LOC_NEWCASTLE)
	add_lancaster_favour(LOC_BAMBURGH)
	add_lancaster_favour(LOC_HEXHAM)
	add_lancaster_favour(LOC_APPLEBY)
	add_lancaster_favour(LOC_CARLISLE)
	add_lancaster_favour(LOC_HARLECH)
	add_lancaster_favour(LOC_PEMBROKE)
	add_lancaster_favour(LOC_CARDIFF)
	add_lancaster_favour(LOC_CHESTER)
	add_lancaster_favour(LOC_LANCASTER)
	add_lancaster_favour(LOC_SCOTLAND)

	add_york_favour(LOC_LONDON)
	add_york_favour(LOC_CALAIS)
	add_york_favour(LOC_LUDLOW)
	add_york_favour(LOC_HEREFORD)
	add_york_favour(LOC_SALISBURY)
	add_york_favour(LOC_WINCHESTER)
	add_york_favour(LOC_GUILDFORD)
	add_york_favour(LOC_ARUNDEL)
	add_york_favour(LOC_HASTINGS)
	add_york_favour(LOC_DOVER)
	add_york_favour(LOC_ROCHESTER)
	add_york_favour(LOC_CANTERBURY)
	add_york_favour(LOC_SOUTHAMPTON)
	add_york_favour(LOC_BURGUNDY)

	add_lord_capability(LORD_WARWICK_Y, AOW_LANCASTER_MONTAGU)
	capability_muster_effects_common(LORD_WARWICK_Y, AOW_LANCASTER_MONTAGU)

	setup_vassals()

	log("Montagu.")
	log("Brief Rebellion.")
}

// === SCENARIO: II ===

function setup_II() {
	game.turn = 1 << 1

	clear_flag(FLAG_REBEL_IS_YORK)
	game.active = LANCASTER
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

	add_lancaster_favour(LOC_CALAIS)
	add_lancaster_favour(LOC_YORK)
	add_lancaster_favour(LOC_HARLECH)
	add_lancaster_favour(LOC_COVENTRY)
	add_lancaster_favour(LOC_WELLS)
	add_lancaster_favour(LOC_FRANCE)

	add_york_favour(LOC_LONDON)
	add_york_favour(LOC_ELY)
	add_york_favour(LOC_LUDLOW)
	add_york_favour(LOC_CARLISLE)
	add_york_favour(LOC_PEMBROKE)
	add_york_favour(LOC_EXETER)
	add_york_favour(LOC_BURGUNDY)

	setup_vassals([ VASSAL_DEVON, VASSAL_OXFORD ])

	log("Foreign Haven.")
	log("Shaky Allies.")
	log("Queen Regent.")
}

function foreign_haven_shift_lords() {
	log("Foreign Haven")

	let turn = current_turn()

	for (let lord of all_lancaster_lords) {
		if (is_lord_on_calendar(lord) && get_lord_calendar(lord) > turn) {
			let x = is_lord_in_exile(lord)
			set_lord_calendar(lord, turn)
			if (x)
				set_lord_in_exile(lord)
		}
	}

	for (let lord of all_york_lords) {
		if (is_lord_on_calendar(lord) && get_lord_calendar(lord) > turn + 1) {
			let x = is_lord_in_exile(lord)
			set_lord_calendar(lord, turn + 1)
			if (x)
				set_lord_in_exile(lord)
		}
	}
}

// === SCENARIO: III ===

function setup_III() {

	clear_flag(FLAG_REBEL_IS_YORK)
	game.active = LANCASTER
	game.influence = 0

	add_york_favour(LOC_BURGUNDY)
	add_lancaster_favour(LOC_FRANCE)

	setup_vassals([ VASSAL_OXFORD, VASSAL_NORFOLK ])

	add_york_favour(LOC_LONDON)
	add_york_favour(LOC_CALAIS)
	add_york_favour(LOC_CARLISLE)
	add_york_favour(LOC_ARUNDEL)
	add_york_favour(LOC_GLOUCESTER)
	add_york_favour(LOC_YORK)

	add_lancaster_favour(LOC_OXFORD)
	add_lancaster_favour(LOC_HARLECH)
	add_lancaster_favour(LOC_PEMBROKE)

	muster_lord(LORD_GLOUCESTER_2, LOC_LONDON)
	muster_lord(LORD_NORTHUMBERLAND_Y2, LOC_CARLISLE)
	muster_lord(LORD_NORFOLK, LOC_ARUNDEL)

	muster_lord(LORD_HENRY_TUDOR, LOC_FRANCE)
	muster_lord(LORD_JASPER_TUDOR_2, LOC_FRANCE)
	muster_lord(LORD_OXFORD, LOC_FRANCE)

	game.turn = 3 << 1

	log("King Richard.")
	log("Ravaged Land.")
}

states.my_kingdom_for_a_horse_setup = {
	inactive: "My Kingdom for a Horse",
	prompt() {
		if (!is_lord_on_map(LORD_RICHARD_III)) {
			view.prompt = "My Kingdom for a Horse: You may replace Gloucester with Richard III."
			view.actions.richard_iii = 1
			view.actions.pass = 1
		} else {
			view.prompt = "My Kingdom for a Horse: All done."
			view.actions.done = 1
		}
	},
	richard_iii() {
		push_undo()
		replace_gloucester_with_richard_iii()
	},
	pass() {
		goto_start_game()
	},
	done() {
		goto_start_game()
	},
}

states.my_kingdom_for_a_horse_muster = {
	inactive: "My Kingdom for a Horse",
	prompt() {
		if (!is_lord_on_map(LORD_RICHARD_III)) {
			view.prompt = "My Kingdom for a Horse: You may replace Gloucester with Richard III for one levy action."
			view.actions.richard_iii = 1
			view.actions.pass = 1
		}
	},
	richard_iii() {
		push_undo()
		replace_gloucester_with_richard_iii()
		game.command = LORD_RICHARD_III
		apply_lordship_effects()
		game.actions --
		game.state = "muster_lord"
	},
	pass() {
		apply_lordship_effects()
		game.state = "muster_lord"
	},
}

function replace_gloucester_with_richard_iii() {
	log(`Replaced L${LORD_GLOUCESTER_2} with L${LORD_RICHARD_III}.`)

	set_lord_locale(LORD_RICHARD_III, get_lord_locale(LORD_GLOUCESTER_2))
	set_lord_capability(LORD_RICHARD_III, 0, get_lord_capability(LORD_GLOUCESTER_2, 0))
	set_lord_capability(LORD_RICHARD_III, 1, get_lord_capability(LORD_GLOUCESTER_2, 1))
	for (let x of all_asset_types)
		set_lord_assets(LORD_RICHARD_III, x, get_lord_assets(LORD_GLOUCESTER_2, x))
	for (let x of all_force_types)
		set_lord_forces(LORD_RICHARD_III, x, get_lord_forces(LORD_GLOUCESTER_2, x))

	if (!is_capabality_available_to_lord(get_lord_capability(LORD_RICHARD_III, 0), LORD_RICHARD_III))
		set_lord_capability(LORD_RICHARD_III, 0, NOCARD)
	if (!is_capabality_available_to_lord(get_lord_capability(LORD_RICHARD_III, 1), LORD_RICHARD_III))
		set_lord_capability(LORD_RICHARD_III, 1, NOCARD)

	set_lord_locale(LORD_GLOUCESTER_2, NOWHERE)
	set_lord_capability(LORD_GLOUCESTER_2, 0, NOCARD)
	set_lord_capability(LORD_GLOUCESTER_2, 1, NOCARD)
	for (let x of all_asset_types)
		set_lord_assets(LORD_GLOUCESTER_2, x, 0)
	for (let x of all_force_types)
		set_lord_forces(LORD_GLOUCESTER_2, x, 0)

	for_each_vassal_with_lord(LORD_GLOUCESTER_2, v => {
		set_vassal_lord_and_service(v, LORD_RICHARD_III, get_vassal_service(v))
	})
}

// === 6.0 CAMPAIGN ===

/*

function setup_ItoIII() {
	game.turn = 1 << 1

	set_flag(FLAG_REBEL_IS_YORK)
	game.active = YORK
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

	add_lancaster_favour(LOC_LONDON)
	add_lancaster_favour(LOC_WELLS)
	add_lancaster_favour(LOC_SCOTLAND)
	add_lancaster_favour(LOC_FRANCE)

	add_york_favour(LOC_ELY)
	add_york_favour(LOC_LUDLOW)
	add_york_favour(LOC_BURGUNDY)
	add_york_favour(LOC_IRELAND)

	setup_vassals()
}

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
	clear_flag(FLAG_REBEL_IS_YORK)
	game.active = LANCASTER
	game.influence = 0

	for (let lord of all_lords) {
		if (is_lord_in_play(lord)) {
			disband_lord(lord)
		}
	}
	for (let loc of all_locales) {
		remove_exhausted_marker(loc)
		remove_depleted_marker(loc)
		remove_lancaster_favour(loc)
		remove_york_favour(loc)
	}
	discard_events("this_levy")
	discard_events("hold")
	discard_events("this_campaign")

	// Setup
	// Yorkist setup
	// TODO: Add cards Y1-Y13, Y25, Y26, Y27, Y29, Y30

	if (is_lord_in_play(LORD_RUTLAND) && main_york_heir !== LORD_RUTLAND) {
		muster_lord(LORD_RUTLAND, LOC_CANTERBURY)
		add_york_favour(LOC_CANTERBURY)
	}

	set_lord_calendar(LORD_DEVON, 1)
	set_lord_calendar(LORD_GLOUCESTER_1, 9)
	set_lord_calendar(LORD_NORTHUMBERLAND_Y1, 9)

	if (main_york_heir === LORD_YORK) {
		muster_lord(LORD_YORK, LOC_CANTERBURY)
		add_york_favour(LOC_LONDON)
		if (is_lord_in_play(LORD_MARCH)) {
			muster_lord(LORD_MARCH, LOC_LUDLOW)
		}
		// TODO: Add cards Y14, Y18, Y19, Y20
	}

	if (main_york_heir === LORD_MARCH) {
		muster_lord(LORD_EDWARD_IV, LOC_LONDON)
		// Removed because he can't appear in scenario III
		remove_lord(LORD_MARCH)
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

	add_lancaster_favour(LOC_CALAIS)
	add_lancaster_favour(LOC_YORK)
	add_lancaster_favour(LOC_HARLECH)
	add_lancaster_favour(LOC_COVENTRY)
	add_lancaster_favour(LOC_WELLS)

	add_york_favour(LOC_LONDON)
	add_york_favour(LOC_ELY)
	add_york_favour(LOC_LUDLOW)
	add_york_favour(LOC_CARLISLE)
	add_york_favour(LOC_PEMBROKE)
	add_york_favour(LOC_EXETER)

	// Exile box setup
	add_lancaster_favour(LOC_FRANCE)
	add_york_favour(LOC_BURGUNDY)

	setup_vassals([ VASSAL_DEVON, VASSAL_OXFORD ])

	// TODO: Add Foreign Haven rule
	// TODO: Add Skaky Allies rules
	// TODO: Natural causes rule

}

function setup_II_L() {
	game.turn = 1 << 1
	game.scenario = "IIL. Lancastrian Legitimacy Fades"
	set_flag(FLAG_REBEL_IS_YORK)
	game.active = YORK
	game.influence = 0

	for (let lord of all_lords) {
		if (is_lord_in_play(lord)) {
			disband_lord(lord)
		}
	}
	for (let loc of all_locales) {
		remove_exhausted_marker(loc)
		remove_depleted_marker(loc)
		remove_lancaster_favour(loc)
		remove_york_favour(loc)
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
			remove_lord(LORD_SOMERSET_2)
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

	add_lancaster_favour(LOC_LONDON)
	add_lancaster_favour(LOC_HARLECH)
	add_lancaster_favour(LOC_OXFORD)
	add_lancaster_favour(LOC_WELLS)
	add_lancaster_favour(LOC_EXETER)
	add_lancaster_favour(LOC_CARLISLE)

	add_york_favour(LOC_CALAIS)
	add_york_favour(LOC_YORK)
	add_york_favour(LOC_ELY)
	add_york_favour(LOC_LUDLOW)
	add_york_favour(LOC_PEMBROKE)

	// Exile box setup
	add_lancaster_favour(LOC_FRANCE)
	add_york_favour(LOC_BURGUNDY)

	setup_vassals([ VASSAL_DEVON, VASSAL_OXFORD ])

	// TODO: Add Foreign Haven rule
	// TODO: Add Shaky Allies rules
	// TODO: Natural causes rule

}

function setup_III_Y() {
	game.turn = 1 << 1
	game.scenario = "IIIY. New Rivals"
	clear_flag(FLAG_REBEL_IS_YORK)
	game.active = LANCASTER
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

	for (let lord of all_lords) {
		if (is_lord_in_play(lord)) {
			disband_lord(lord)
		}
	}
	for (let loc of all_locales) {
		remove_exhausted_marker(loc)
		remove_depleted_marker(loc)
		remove_lancaster_favour(loc)
		remove_york_favour(loc)
	}
	discard_events("this_levy")
	discard_events("hold")
	discard_events("this_campaign")

	// Yorkist Setup
	// TODO: Add Y1-Y13, Y36

	if (has_Y28_happened()) {
		if (is_lord_in_play(LORD_RUTLAND) && (is_lord_in_play(LORD_GLOUCESTER_1) || is_lord_in_play(LORD_GLOUCESTER_2) || is_lord_in_play(LORD_RICHARD_III))) {
			// If Gloucester (any) and Rutland, Rutland dies
			remove_lord(LORD_RUTLAND)
		}
	}

	if (main_york_heir === LORD_RUTLAND && (!is_lord_in_play(LORD_GLOUCESTER_1) && !is_lord_in_play(LORD_GLOUCESTER_2))) {
		// If Rutland is lone heir, Rutland dies
		remove_lord(LORD_RUTLAND)
		//Warwick becomes king
		muster_lord(LORD_WARWICK_Y, LOC_LONDON)
		add_york_favour(LOC_LONDON)
		muster_lord(LORD_SALISBURY, LOC_YORK)
		add_york_favour(LOC_YORK)

		// TODO: Add Y16, Y17, Y22
	}

	// If only 1 is alive
	if (main_york_heir === LORD_YORK && !is_lord_in_play(LORD_MARCH) && !is_lord_in_play(LORD_RUTLAND) && !is_lord_in_play(LORD_GLOUCESTER_1)) {
		muster_lord(LORD_NORTHUMBERLAND_Y2, LOC_CARLISLE)
		add_york_favour(LOC_CARLISLE)

		// TODO: Add Y37
	}
	if ((main_york_heir === LORD_MARCH || main_york_heir === LORD_EDWARD_IV) && !is_lord_in_play(LORD_RUTLAND) && !is_lord_in_play(LORD_GLOUCESTER_1)) {
		muster_lord(LORD_NORTHUMBERLAND_Y2, LOC_CARLISLE)
		add_york_favour(LOC_CARLISLE)
		// TODO: Add Y37
	}
	if (main_york_heir === LORD_GLOUCESTER_1 || main_york_heir === LORD_RICHARD_III) {
		muster_lord(LORD_NORTHUMBERLAND_Y2, LOC_CARLISLE)
		add_york_favour(LOC_CARLISLE)
		// TODO: Add Y37
	}
	muster_lord(LORD_NORFOLK, LOC_ARUNDEL)
	add_york_favour(LOC_ARUNDEL)

	if (main_york_heir === LORD_YORK) {
		// TODO: Add Y14, Y21
		if (is_lord_in_play(LORD_MARCH)) {
			muster_lord(LORD_MARCH, LOC_LUDLOW)
			add_york_favour(LOC_LUDLOW)
			// Add Y20
			// Only 2 heirs can stay
			remove_lord(LORD_RUTLAND)
			remove_lord(LORD_GLOUCESTER_1)
		}
		if (!is_lord_in_play(LORD_MARCH) && is_lord_in_play(LORD_RUTLAND)) {
			muster_lord(LORD_RUTLAND, LOC_CANTERBURY)
			add_york_favour(LOC_CANTERBURY)
			// TODO: Add Y20
		}
		if (is_lord_in_play(LORD_GLOUCESTER_1)) {
			muster_lord(LORD_GLOUCESTER_1, LOC_GLOUCESTER)
			add_york_favour(LOC_GLOUCESTER)
			// TODO: Y34
		}
	}
	if (main_york_heir === LORD_MARCH || main_york_heir === LORD_EDWARD_IV) {
		muster_lord(LORD_EDWARD_IV, LOC_LONDON)
		add_york_favour(LOC_LONDON)

		// If Edward IV is on the map, remove March
		remove_lord(LORD_MARCH)
		// TODO: Add Y23, Y24
		if (is_lord_in_play(LORD_RUTLAND)) {
			muster_lord(LORD_RUTLAND, LOC_CANTERBURY)
			add_york_favour(LOC_CANTERBURY)
			// TODO: Add Y31
		}
		if (is_lord_in_play(LORD_GLOUCESTER_1)) {
			muster_lord(LORD_GLOUCESTER_1, LOC_GLOUCESTER)
			add_york_favour(LOC_GLOUCESTER)
			// TODO: Add Y28, Y34
		}

	}
	if (main_york_heir === LORD_RUTLAND) {
		muster_lord(LORD_RUTLAND, LOC_LONDON)
		add_york_favour(LOC_LONDON)
		// TODO: Add Y20, Y21
		if (is_lord_in_play(LORD_GLOUCESTER_1)) {
			muster_lord(LORD_GLOUCESTER_2, LOC_LONDON)
			// If Rutland is King, golden gloucester 2 arrives and gloucester 1 is gone
			remove_lord(LORD_GLOUCESTER_1)
			// TODO: Add Y34
		}
	}
	if (main_york_heir === LORD_GLOUCESTER_1) {
		muster_lord(LORD_RICHARD_III, LOC_LONDON)
		add_york_favour(LOC_LONDON)
		// if Richard III is here, both gloucester are gone
		remove_lord(LORD_GLOUCESTER_1)
		remove_lord(LORD_GLOUCESTER_2)
		// TODO: Add Y32, Y33
	}

	// Lancaster setup
	// TODO: Add L1-L13, L34, L35, L36, L37

	if (main_lancaster_heir === LORD_HENRY_VI || main_lancaster_heir === LORD_MARGARET) {
		muster_lord(LORD_MARGARET, LOC_FRANCE)
		// TODO: Add L27, L31 + L26 Edward
		// Only one heir
		remove_lord(LORD_HENRY_VI)
		remove_lord(LORD_SOMERSET_1)
		remove_lord(LORD_SOMERSET_2)
	}
	// If Margaret not here and Edward IV not king
	if (!is_lord_on_map(LORD_MARGARET) && main_york_heir !== LORD_EDWARD_IV) {
		muster_lord(LORD_HENRY_TUDOR, LOC_FRANCE)
		// TODO: Add L32, L35
		remove_lord(LORD_SOMERSET_1)
		remove_lord(LORD_SOMERSET_2)
	}
	if (!is_lord_on_map(LORD_MARGARET) && !is_lord_on_map(LORD_HENRY_TUDOR)) {
		muster_lord(LORD_WARWICK_L, LOC_CALAIS)
		add_lancaster_favour(LOC_CALAIS)
		// TODO: Add L23, L30
	}

	if (is_lord_on_map(LORD_MARGARET) || is_lord_on_map(LORD_HENRY_TUDOR)) {
		muster_lord(LORD_OXFORD, LOC_FRANCE)
		add_lancaster_favour(LOC_OXFORD)
		muster_lord(LORD_JASPER_TUDOR_2, LOC_FRANCE)
		add_york_favour(LOC_PEMBROKE)
	}
	else if (is_lord_on_map(LORD_WARWICK_L)) {
		muster_lord(LORD_OXFORD, LOC_CALAIS)
		add_lancaster_favour(LOC_OXFORD)
		muster_lord(LORD_JASPER_TUDOR_2, LOC_CALAIS)
		add_york_favour(LOC_PEMBROKE)
	}
	else {
		throw Error("Error Lancastrian setup III.Y")
	}

	// Exile box setup
	add_lancaster_favour(LOC_FRANCE)
	add_york_favour(LOC_BURGUNDY)

	setup_vassals([ VASSAL_OXFORD, VASSAL_NORFOLK ])
}

function setup_III_L() {
	game.turn = 1 << 1
	game.scenario = "IIIL. Yorkists Last Stand"
	set_flag(FLAG_REBEL_IS_YORK)
	game.active = YORK
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

	for (let lord of all_lords) {
		if (is_lord_in_play(lord)) {
			disband_lord(lord)
		}
	}
	for (let loc of all_locales) {
		remove_exhausted_marker(loc)
		remove_depleted_marker(loc)
		remove_lancaster_favour(loc)
		remove_york_favour(loc)
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
		add_lancaster_favour(LOC_WELLS)
		// TODO: Add L18, L20, L27
	}
	// Should never happen but as a failsafe
	if (main_lancaster_heir === LORD_SOMERSET_2) {
		muster_lord(LORD_SOMERSET_1, LOC_LONDON)
		add_lancaster_favour(LOC_WELLS)
		remove_lord(LORD_SOMERSET_2)
		// TODO: Add L18, L20, L27
	}
	muster_lord(LORD_OXFORD, LOC_OXFORD)
	muster_lord(LORD_JASPER_TUDOR_2, LOC_PEMBROKE)
	add_lancaster_favour(LOC_OXFORD)
	add_lancaster_favour(LOC_PEMBROKE)
	add_lancaster_favour(LOC_LONDON)

	// York Setup
	// TOOD: Add Y1-Y13, Y36

	if (has_Y28_happened()) {
		if (is_lord_in_play(LORD_GLOUCESTER_1) || is_lord_in_play(LORD_GLOUCESTER_2) || is_lord_in_play(LORD_RICHARD_III)) {
			// If Gloucester (any), all other yorkist heir dies
			remove_lord(LORD_YORK)
			remove_lord(LORD_RUTLAND)
			remove_lord(LORD_MARCH)
			remove_lord(LORD_EDWARD_IV)
			remove_lord(LORD_GLOUCESTER_1)
			remove_lord(LORD_RICHARD_III)
			muster_lord(LORD_GLOUCESTER_2, LOC_BURGUNDY)
			// TODO: Add Y35
		}
	}

	if (main_york_heir === LORD_YORK) {
		muster_lord(LORD_YORK, LOC_BURGUNDY)
		add_york_favour(LOC_ELY)
		// TODO: Add Y14, Y18
		if (is_lord_in_play(LORD_MARCH)) {
			// Only next highest heir alive
			remove_lord(LORD_RUTLAND)
			remove_lord(LORD_GLOUCESTER_1)
			remove_lord(LORD_GLOUCESTER_2)
			muster_lord(LORD_MARCH, LOC_BURGUNDY)
			add_york_favour(LOC_LUDLOW)
			//TODO: Add Y20
		}
		else if (!is_lord_in_play(LORD_MARCH) && is_lord_in_play(LORD_RUTLAND)) {
			// Only next highest heir alive
			remove_lord(LORD_GLOUCESTER_1)
			remove_lord(LORD_GLOUCESTER_2)
			muster_lord(LORD_RUTLAND, LOC_BURGUNDY)
			add_york_favour(LOC_CANTERBURY)
			//TODO: Add Y20
		}
		else if (!is_lord_in_play(LORD_MARCH) && !is_lord_in_play(LORD_RUTLAND) && (is_lord_in_play(LORD_GLOUCESTER_1) || is_lord_in_play(LORD_GLOUCESTER_2))) {
			// Final Scenario, and no succession rule
			remove_lord(LORD_GLOUCESTER_2)
			muster_lord(LORD_GLOUCESTER_1, LOC_BURGUNDY)
			add_york_favour(LOC_GLOUCESTER)
			// TODO: Add Y4
		}
		else {
			// If York alone
			muster_lord(LORD_SALISBURY, LOC_BURGUNDY)
			add_york_favour(LOC_YORK)
			//TODO: Add Y17, Y22
		}
	}
	if (main_york_heir === LORD_MARCH || main_york_heir === LORD_RUTLAND) {
		// If March or Rutland is highest heir, Warwick takes the lead
		remove_lord(LORD_MARCH)
		remove_lord(LORD_RUTLAND)
		muster_lord(LORD_WARWICK_Y, LOC_CALAIS)
		add_york_favour(LOC_CALAIS)
		//TODO: Add Y16
	}

	if (main_york_heir === LORD_WARWICK_Y) {
		muster_lord(LORD_NORFOLK, LOC_CALAIS)
		muster_lord(LORD_SALISBURY, LOC_CALAIS)
		add_york_favour(LOC_CALAIS)
		//TODO: Add Y17, Y22
	}
	else (
		muster_lord(LORD_NORFOLK, LOC_BURGUNDY)
	)

	if (main_york_heir === LORD_GLOUCESTER_1) {
		remove_lord(LORD_GLOUCESTER_1)
		muster_lord(LORD_GLOUCESTER_2, LOC_BURGUNDY)
		muster_lord(LORD_SALISBURY, LOC_BURGUNDY)
		//TODO: Add Y17, Y22
	}

	add_york_favour(LOC_ARUNDEL)

	// Exile box setup
	add_lancaster_favour(LOC_FRANCE)
	add_york_favour(LOC_BURGUNDY)

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

// === CAPABILITY MUSTER EFFECTS ===

// When a lord levies a capability, its muster vassal applies instantly.
function capability_muster_effects_common(lord: Lord, c: Card) {
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
	}

	if (c === AOW_YORK_HASTINGS) {
		add_lord_forces(lord, MEN_AT_ARMS, 2)
		muster_vassal(VASSAL_HASTINGS, lord)
	}

	if (AOW_YORK_BURGUNDIANS.includes(c)) {
		if (is_seaport(get_lord_locale(lord)) && !is_exile_box(get_lord_locale(lord))) {
			logcap(c)
			add_lord_forces(lord, BURGUNDIANS, 2)
			set_flag(FLAG_BURGUNDIANS)
		}
		else {
			clear_flag(FLAG_BURGUNDIANS)
		}
	}
}

// When a lord levies a capability during Levy (not first Arts of War), its Lordship effects must apply.
function capability_muster_effects_levy(_lord: Lord, c: Card) {
	if (c === AOW_LANCASTER_THOMAS_STANLEY) {
		game.levy_flags.thomas_stanley = 1
	}
	if (c === AOW_YORK_FAIR_ARBITER && is_friendly_locale(get_lord_locale(LORD_SALISBURY))) {
		logcap(AOW_YORK_FAIR_ARBITER)
		game.actions += 1
	}
	if (c === AOW_YORK_FALLEN_BROTHER && !is_lord_in_play(LORD_CLARENCE)) {
		logcap(AOW_YORK_FALLEN_BROTHER)
		game.actions += 1
	}
}

// === LORDSHIP AND THIS LEVY EFFECTS ===

function apply_lordship_effects() {
	let lord = game.command

	game.actions = data.lords[lord].lordship

	if (is_friendly_locale(get_lord_locale(lord)) && lord_has_capability(lord, AOW_YORK_FAIR_ARBITER)) {
		logcap(AOW_YORK_FAIR_ARBITER)
		game.actions += 1
	}
	if (lord_has_capability(lord, AOW_YORK_FALLEN_BROTHER) && !is_lord_in_play(LORD_CLARENCE)) {
		logcap(AOW_YORK_FALLEN_BROTHER)
		game.actions += 1
	}
	if (is_event_in_play(EVENT_YORK_EDWARD_V) && (lord === LORD_GLOUCESTER_1 || lord === LORD_GLOUCESTER_2)) {
		logevent(EVENT_YORK_EDWARD_V)
		game.actions += 3
	}

	game.levy_flags.gloucester_as_heir = 0
	if (is_event_in_play(EVENT_YORK_GLOUCESTER_AS_HEIR)) {
		if (lord === LORD_GLOUCESTER_2 || lord === LORD_GLOUCESTER_1) {
			game.levy_flags.gloucester_as_heir = 3
		}
	}

	game.levy_flags.my_crown_is_in_my_heart = 0
	if (is_event_in_play(EVENT_LANCASTER_MY_CROWN_IS_IN_MY_HEART)) {
		if (lord === LORD_HENRY_VI) {
			game.levy_flags.my_crown_is_in_my_heart = 2
		}
	}

	game.levy_flags.thomas_stanley = 0
	if (lord_has_capability(lord, AOW_LANCASTER_THOMAS_STANLEY)) {
		// logged on use
		game.levy_flags.thomas_stanley = 1
	}

	game.levy_flags.parliament_votes = 0
	if (is_event_in_play(EVENT_LANCASTER_PARLIAMENT_VOTES)) {
		if (game.active === LANCASTER) {
			game.levy_flags.parliament_votes = 1
		}
	}

	game.levy_flags.succession = 0
	if (is_event_in_play(EVENT_YORK_SUCCESSION)) {
		if (game.active === YORK) {
			game.levy_flags.succession = 1
		}
	}

	game.levy_flags.jack_cade = 0
	if (is_jack_cade_eligible(lord)) {
		game.levy_flags.jack_cade = 2
	}
}

// === MUSTER CAPABILITY: SOLDIERS OF FORTUNE ===

states.soldiers_of_fortune = {
	inactive: "Muster",
	prompt() {
		view.prompt = `Soldiers of Fortune: Pay 1 coin to add 2 mercenaries to ${lord_name[game.command]}.`
		let here = get_lord_locale(game.command)
		for (let lord of all_friendly_lords()) {
			if (get_lord_locale(lord) === here) {
				if (get_lord_assets(lord, COIN) > 0)
					gen_action_coin(lord)
			}
		}
	},
	coin(lord) {
		add_lord_assets(lord, COIN, -1)

		let n = Math.min(2, count_available_mercenaries())
		add_lord_forces(game.command, MERCENARIES, n)

		do_levy_troops()
	},
}

// === MUSTER CAPABILITY: COMMISSION OF ARRAY ===

states.commission_of_array = {
	inactive: "Muster",
	prompt() {
		view.prompt = "Commission of Array: Levy troops from an adjacent friendly stronghold."
		let here = get_lord_locale(game.command)
		for (let next of data.locales[here].adjacent) {
			if (is_friendly_locale(next) && !has_enemy_lord(next))
				if (can_add_troops(next))
					gen_action_locale(next)
		}
	},
	locale(loc) {
		let loc_type = data.locales[loc].type
		deplete_locale(loc)

		switch (loc_type) {
			case "calais":
				add_lord_forces(game.command, MEN_AT_ARMS, 2)
				add_lord_forces(game.command, LONGBOWMEN, 1)
				break
			case "london":
				add_lord_forces(game.command, MEN_AT_ARMS, 1)
				add_lord_forces(game.command, LONGBOWMEN, 1)
				add_lord_forces(game.command, MILITIA, 1)
				break
			case "harlech":
				add_lord_forces(game.command, MEN_AT_ARMS, 1)
				add_lord_forces(game.command, LONGBOWMEN, 2)
				break
			case "city":
				add_lord_forces(game.command, LONGBOWMEN, 1)
				add_lord_forces(game.command, MILITIA, 1)
				break
			case "town":
				add_lord_forces(game.command, MILITIA, 2)
				break
			case "fortress":
				add_lord_forces(game.command, MEN_AT_ARMS, 1)
				add_lord_forces(game.command, MILITIA, 1)
				break
		}

		end_levy_troops()
	},
}

// === TIDES OF WAR CAPABILITY: WE DONE DEEDS OF CHARITY ===

function eligible_charity() {
	let lord = find_lord_with_capability_card(AOW_YORK_WE_DONE_DEEDS_OF_CHARITY)
	if (lord !== NOBODY) {
		let here = get_lord_locale(lord)
		if (get_york_shared_assets(here, PROV) > 0)
			return true
	}
	return false
}

function goto_we_done_deeds_of_charity() {
	set_active(YORK)
	game.state = "we_done_deeds_of_charity"
	game.count = 2
}

states.we_done_deeds_of_charity = {
	inactive: "We done needs of charity",
	prompt() {
		let lord = find_lord_with_capability_card(AOW_YORK_WE_DONE_DEEDS_OF_CHARITY)
		let here = get_lord_locale(lord)
		if (game.count > 0) {
			view.prompt = "We done deeds of charity: Pay up to two Provender for +1 Influence point each."
			for (let lord of all_friendly_lords()) {
				if (get_lord_locale(lord) === here && (get_lord_assets(lord, PROV) > 0)) {
					gen_action_prov(lord)
				}
			}
		} else {
			view.prompt = "We done deeds of charity: All done."
		}
		view.actions.done = 1
	},
	prov(lord) {
		push_undo()
		increase_york_influence(1)
		logcap(AOW_YORK_WE_DONE_DEEDS_OF_CHARITY)
		add_lord_assets(lord, PROV, -1)
		game.count--
	},
	done() {
		game.count = 0

		// TODO: who should disembark first?
		goto_disembark()
	},
}

// === CAPABILITY: MERCHANTS ===

function count_merchants_deplete(loc: Locale) {
	let n = 0
	if (has_exhausted_marker(loc) || has_depleted_marker(loc))
		++n
	for (let next of data.locales[loc].adjacent)
		if (has_exhausted_marker(next) || has_depleted_marker(next))
			++n
	return Math.min(2, n)
}

function can_action_merchants() {
	let loc = get_lord_locale(game.command)
	if (game.actions <= 0)
		return false
	if (lord_has_capability(game.command, AOW_LANCASTER_MERCHANTS))
		return count_merchants_deplete(loc) > 0
	return false
}

function goto_merchants() {
	push_undo()
	game.count = count_merchants_deplete(get_lord_locale(game.command))
	game.state = "merchants_1"
}

states.merchants_1 = {
	inactive: "Merchants",
	prompt() {
		view.prompt = "Merchants:"
		prompt_influence_check(game.command)
	},
	check(spend) {
		if (roll_influence_check("C" + AOW_LANCASTER_MERCHANTS, game.command, spend))
			game.state = "merchants_2"
		else
			end_merchants()
	}
}

states.merchants_2 = {
	inactive: "Merchants",
	prompt() {
		view.prompt = "Merchants: Remove 2 depleted or exhausted markers."
		let here = get_lord_locale(game.command)
		if (has_exhausted_marker(here) || has_depleted_marker(here))
			gen_action_locale(here)
		for (let next of data.locales[here].adjacent)
			if (has_exhausted_marker(next) || has_depleted_marker(next))
				gen_action_locale(next)
	},
	locale(loc) {
		push_undo()
		log(">S" + loc)
		remove_depleted_marker(loc)
		remove_exhausted_marker(loc)
		if (--game.count === 0)
			end_merchants()
	},
}

function end_merchants() {
	push_undo()
	spend_action(1)
	game.count = 0
	resume_command()
}

// === CAPABILITY: BURGUNDIANS ===

function levy_burgundians(lord: Lord) {
	if (is_seaport(get_lord_locale(lord)) && lord_has_capability(lord, AOW_YORK_BURGUNDIANS) && !has_flag(FLAG_BURGUNDIANS)) {
		add_lord_forces(lord, BURGUNDIANS, 2)
		if (lord_has_capability(lord, AOW_YORK_BURGUNDIANS[0]))
			logcap(AOW_YORK_BURGUNDIANS[0])
		if (lord_has_capability(lord, AOW_YORK_BURGUNDIANS[1]))
			logcap(AOW_YORK_BURGUNDIANS[1])
		set_flag(FLAG_BURGUNDIANS)
	}
}

// === CAPABILITY: NAVAL BLOCKADE ===

function is_naval_blockade_in_play() {
	if (lord_has_capability(LORD_WARWICK_Y, AOW_YORK_NAVAL_BLOCKADE)) {
		let war = get_lord_locale(LORD_WARWICK_Y)
		if (is_seaport(war))
			return true
	}
	return false
}

function can_naval_blockade(here: Locale) {
	if (game.active === LANCASTER && is_naval_blockade_in_play())
		return is_on_same_sea(here, get_lord_locale(LORD_WARWICK_Y))
	return false
}

function can_naval_blockade_route(mask: number) {
	if (game.active === LANCASTER && is_naval_blockade_in_play()) {
		let w = get_lord_locale(LORD_WARWICK_Y)
		if ((mask & 1) && is_port_1(w))
			return true
		if ((mask & 2) && is_port_2(w))
			return true
		if ((mask & 4) && is_port_3(w))
			return true
	}
	return false
}

function roll_blockade(fail: string) {
	let roll = roll_die()
	if (roll <= 2) {
		log("C" + AOW_YORK_NAVAL_BLOCKADE + " 1-2: W" + roll)
		return true
	} else {
		log("C" + AOW_YORK_NAVAL_BLOCKADE + " 1-2: B" + roll)
		logi(fail)
		return false
	}
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
	return false
}

function goto_agitators() {
	push_undo()
	game.state = "agitators"
}

states.agitators = {
	inactive: "Agitators",
	prompt() {
		view.prompt = "Agitators: Deplete or exhaust an adjacent neutral or enemy stronghold."
		let here = get_lord_locale(game.command)
		for (let next of data.locales[here].adjacent)
			if (!is_friendly_locale(next) && !has_exhausted_marker(next))
				gen_action_locale(next)
	},
	locale(loc) {
		push_undo()
		log("C" + AOW_YORK_AGITATORS + " at S" + loc + ".")
		if (has_depleted_marker(loc))
			add_exhausted_marker(loc)
		else
			add_depleted_marker(loc)
		end_agitators()
	},
}

function end_agitators() {
	push_undo()
	spend_action(1)
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

	for (let lord of all_friendly_lords()) {
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
		view.prompt = "Heralds: Choose a lord on the calendar to shift to next turn."
		for (let lord of all_friendly_lords())
			if (is_lord_on_calendar(lord))
				gen_action_lord(lord)
	},
	lord(lord) {
		game.who = lord
		game.state = "heralds_attempt"
	},
}

states.heralds_attempt = {
	inactive: "Heralds",
	prompt() {
		view.prompt = `Heralds: Shift ${lord_name[game.who]} to next turn.`
		prompt_influence_check(game.command)
	},
	check(spend) {
		if (roll_influence_check("C" + AOW_LANCASTER_HERALDS + " L" + game.who, game.command, spend))
			set_lord_calendar(game.who, current_turn() + 1)
		end_heralds_attempt()
	},
}

function end_heralds_attempt() {
	spend_all_actions()
	resume_command()
}

// === EVENTS: IMMEDIATE ===

function goto_immediate_event(c: Card) {
	set_add(game.events, c)
	game.this_event = c
	switch (c) {
		// Held event played immediately
		case EVENT_YORK_SUN_IN_SPLENDOUR:
			return goto_play_sun_in_splendour_now()

		// This Levy / Campaign
		case EVENT_LANCASTER_BE_SENT_FOR:
		case EVENT_LANCASTER_SEAMANSHIP:
		case EVENT_LANCASTER_FORCED_MARCHES:
		case EVENT_LANCASTER_RISING_WAGES:
		case EVENT_LANCASTER_NEW_ACT_OF_PARLIAMENT:
		case EVENT_LANCASTER_MY_CROWN_IS_IN_MY_HEART:
		case EVENT_LANCASTER_PARLIAMENT_VOTES:
		case EVENT_LANCASTER_FRENCH_FLEET:
		case EVENT_LANCASTER_BUCKINGHAMS_PLOT:
		case EVENT_LANCASTER_MARGARET_BEAUFORT:
		case EVENT_LANCASTER_THE_EARL_OF_RICHMOND:
		case EVENT_YORK_JACK_CADE:
		case EVENT_YORK_SEAMANSHIP:
		case EVENT_YORK_YORKISTS_BLOCK_PARLIAMENT:
		case EVENT_YORK_EXILE_PACT:
		case EVENT_YORK_RICHARD_OF_YORK:
		case EVENT_YORK_THE_COMMONS:
		case EVENT_YORK_SUCCESSION:
		case EVENT_YORK_LOYALTY_AND_TRUST:
		case EVENT_YORK_OWAIN_GLYNDWR:
		case EVENT_YORK_GLOUCESTER_AS_HEIR:
		case EVENT_YORK_DORSET:
		case EVENT_YORK_THE_KINGS_NAME:
		case EVENT_YORK_EDWARD_V:
		case EVENT_YORK_AN_HONEST_TALE_SPEEDS_BEST:
		case EVENT_YORK_PRIVY_COUNCIL:
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
		case EVENT_LANCASTER_TO_WILFUL_DISOBEDIENCE:
			return goto_lancaster_event_to_wilful_disobedience()
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
	delete game.this_event
	resume_levy_arts_of_war()
}

// === EVENT: LANCASTER SCOTS ===

function goto_lancaster_event_scots() {
	game.state = "scots"
	game.who = NOBODY
	game.event_scots = []
}

function end_lancaster_event_scots() {
	delete game.event_scots
	game.who = NOBODY
	end_immediate_event()
}

states.scots = {
	inactive: "Scots",
	prompt() {
		if (game.who === NOBODY) {
			view.prompt = "Scots: You may add 1 men-at-arms and 1 militia to each lord."
			for (let lord of all_lancaster_lords) {
				if (is_lord_on_map(lord) && map_get(game.event_scots, lord, 0) < 3) {
					gen_action_lord(lord)
				}
			}
		} else {
			view.prompt = `Scots: You may add 1 men-at-arms and 1 militia to ${lord_name[game.who]}.`
			let troops = map_get(game.event_scots, game.who, 0)
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
		let troops = map_get(game.event_scots, game.who, 0) | 1
		map_set(game.event_scots, game.who, troops)
		if (troops === 3)
			game.who = NOBODY
	},
	add_men_at_arms() {
		add_lord_forces(game.who, MEN_AT_ARMS, 1)
		let troops = map_get(game.event_scots, game.who, 0) | 2
		map_set(game.event_scots, game.who, troops)
		if (troops === 3)
			game.who = NOBODY
	},
	lord(lord) {
		push_undo()
		game.who = lord
	},
}

// === EVENT: LANCASTER HENRY PRESSURES PARLIAMENT ===

function goto_lancaster_event_henry_pressures_parliament() {
	for (let v of all_vassals) {
		if (is_vassal_mustered_with_york_lord(v)) {
			reduce_york_influence(1)
			log(">V" + v)
		}
	}
	end_immediate_event()
}

// === EVENT: LANCASTER HENRY'S PROCLAMATION ===

function goto_lancaster_event_henrys_proclamation() {
	let t = current_turn()
	for (let v of all_vassals) {
		if (is_vassal_mustered_with_york_lord(v) && !is_special_vassal(v) && get_vassal_service(v) !== t) {
			game.state = "henrys_proclamation"
			return
		}
	}
	logi("No effect.")
	end_immediate_event()
}

states.henrys_proclamation = {
	inactive: "Henry's Proclamation",
	prompt() {
		view.prompt = "Henry's Proclamation: Shift each Yorkist vassal's calendar marker."
		let t = current_turn()
		let done = true
		for (let v of all_vassals) {
			if (is_vassal_mustered_with_york_lord(v) && !is_special_vassal(v) && get_vassal_service(v) !== t) {
				gen_action_vassal(v)
				done = false
			}
		}
		if (done) {
			view.prompt = "Henry's Proclamation: All done."
			view.actions.done = 1
		}
	},
	vassal(v) {
		log("V" + v + " to T" + current_turn() + ".")
		set_vassal_lord_and_service(v, get_vassal_lord(v), current_turn())
	},
	done() {
		delete game.event_she_wolf
		end_immediate_event()
	},
}

// === EVENT: LANCASTER FRENCH TROOPS ===

function goto_lancaster_event_french_troops() {
	let can_play = false
	for (let lord of all_friendly_lords()) {
		if (is_lord_on_map(lord) && is_seaport(get_lord_locale(lord))) {
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
		view.prompt = "French Troops: Add up to 2 men-at-arms and up to 2 militia to a lord at a port."
		if (game.who === NOBODY) {
			for (let lord of all_friendly_lords()) {
				if (is_lord_on_map(lord) && is_seaport(get_lord_locale(lord))) {
					gen_action_lord(lord)
				}
			}
		} else {
			view.prompt = `French Troops: Add up to 2 men-at-arms and up to 2 militia to ${lord_name[game.who]}.`
			if (pack2_get(game.count, 0) < 2)
				view.actions.add_men_at_arms = 1
			if (pack2_get(game.count, 1) < 2)
				view.actions.add_militia = 1
		}
		view.actions.done = 1
	},
	add_men_at_arms() {
		add_lord_forces(game.who, MEN_AT_ARMS, 1)
		let c = pack2_get(game.count, 0)
		game.count = pack2_set(game.count, 0, c+1)
	},
	add_militia() {
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

function add_propaganda_target(loc: Locale) {
	set_add(game.event_propaganda, loc)
}

function remove_propaganda_target(loc: Locale) {
	set_delete(game.event_propaganda, loc)
}

function is_propaganda_target(loc: Locale) {
	return set_has(game.event_propaganda, loc)
}

function goto_warwicks_propaganda() {
	let can_play = false
	for (let loc of all_locales) {
		if (has_york_favour(loc)) {
			can_play = true
		}
	}

	if (can_play) {
		game.state = "warwicks_propaganda"
		game.event_propaganda = []
		game.count = 0
	} else {
		end_immediate_event()
	}
}

states.warwicks_propaganda = {
	inactive: "Warwick's Propaganda",
	prompt() {
		view.prompt = "Warwick's Propaganda: Select 3 Yorkist strongholds."
		view.where = game.event_propaganda
		for (let loc of all_locales) {
			if (game.count < 3 && has_york_favour(loc) && !is_exile_box(loc) && !is_propaganda_target(loc)) {
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
	set_active_enemy()
	game.state = "warwicks_propaganda_yorkist_choice"
	game.where = NOWHERE
}

states.warwicks_propaganda_yorkist_choice = {
	inactive: "Warwick's Propaganda",
	prompt() {
		let done = true
		if (game.where === NOWHERE) {
			view.prompt = "Warwick's Propaganda: Pay 2 influence or remove favour for each selected stronghold."
			for (let loc of all_locales) {
				if (is_propaganda_target(loc)) {
					gen_action_locale(loc)
					done = false
				}
			}
			if (done) {
				view.actions.done = 1
			}
		} else {
			view.prompt = `Warwick's Propaganda: Pay 2 influence or remove favour for ${locale_name[game.where]}.`
			view.actions.influence = 1
			view.actions.favour = 1
		}
	},
	locale(loc) {
		push_undo()
		game.where = loc
	},
	favour() {
		remove_york_favour(game.where)
		remove_propaganda_target(game.where)
		logi(`Removed York Favour at S${game.where}.`)
		game.where = NOWHERE
	},
	influence() {
		reduce_influence(2)
		logi(`Paid 2 to keep S${game.where}`)
		remove_propaganda_target(game.where)
		game.where = NOWHERE
	},
	done() {
		end_warwicks_propaganda()
	},
}

function end_warwicks_propaganda() {
	delete game.event_propaganda
	game.where = NOWHERE
	game.count = 0
	set_active_enemy()
	end_immediate_event()
}

// === EVENT: WELSH REBELLION ===

function goto_lancaster_event_welsh_rebellion() {
	let can_remove_troops = false
	let can_remove_favour = false
	for (let lord of all_york_lords)
		if (is_lord_on_map(lord) && is_lord_in_wales(lord))
			can_remove_troops = true
	for (let loc of all_locales)
		if (is_wales(loc) && has_york_favour(loc))
			can_remove_favour = true
	if (can_remove_troops) {
		game.state = "welsh_rebellion_remove_troops"
		game.who = NOBODY
		game.count = 0
	}
	else if (can_remove_favour) {
		game.state = "welsh_rebellion_remove_favour"
		game.who = NOBODY
		game.count = 0
	}
	else {
		end_immediate_event()
	}
}

states.welsh_rebellion_remove_troops = {
	inactive: "Welsh Rebellion",
	prompt() {
		let done = true

		for (let lord of all_enemy_lords())
			if (is_lord_in_wales(lord))
				reveal_lord(lord)

		if (game.who === NOBODY) {
			view.prompt = "Welsh Rebellion: Remove 2 troops from each Yorkist lord in Wales."
			for (let lord of all_enemy_lords()) {
				if (is_lord_in_wales(lord) && !get_lord_moved(lord)) {
					gen_action_lord(lord)
					done = false
				}
			}
			if (done) {
				view.actions.done = 1
			}
		}
		else {
			view.prompt = `Welsh Rebellion: Remove 2 troops from ${lord_name[game.who]}.`
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
	},
	lord(lord) {
		push_undo()
		set_lord_moved(lord, 1)
		game.who = lord
		game.count = 2
	},
	burgundians(lord) {
		add_lord_forces(lord, BURGUNDIANS, -1)
		resume_welsh_rebellion_remove_troops(lord)
	},
	mercenaries(lord) {
		add_lord_forces(lord, MERCENARIES, -1)
		resume_welsh_rebellion_remove_troops(lord)
	},
	longbowmen(lord) {
		add_lord_forces(lord, LONGBOWMEN, -1)
		resume_welsh_rebellion_remove_troops(lord)
	},
	men_at_arms(lord) {
		add_lord_forces(lord, MEN_AT_ARMS, -1)
		resume_welsh_rebellion_remove_troops(lord)
	},
	militia(lord) {
		add_lord_forces(lord, MILITIA, -1)
		resume_welsh_rebellion_remove_troops(lord)
	},
	done() {
		end_welsh_rebellion_remove_troops()
	},
}

function resume_welsh_rebellion_remove_troops(lord: Lord) {
	if (!lord_has_unrouted_troops(lord)) {
		disband_lord(lord)
		game.who = NOBODY
	}
	if (--game.count === 0) {
		game.who = NOBODY
	}
}

function end_welsh_rebellion_remove_troops() {
	clear_lords_moved()
	for (let lord of all_york_lords) {
		if (is_lord_in_wales(lord) && !lord_has_unrouted_units(lord))
			disband_lord(lord)
	}
	game.count = 0
	game.who = NOBODY
	end_immediate_event()
}

states.welsh_rebellion_remove_favour = {
	inactive: "Welsh Rebellion",
	prompt() {
		view.prompt = "Welsh Rebellion: Remove 2 Yorkist favour from Wales."
		for (let loc of all_locales) {
			if (game.count < 2 && is_wales(loc) && has_york_favour(loc)) {
				gen_action_locale(loc)
			}
		}
		view.actions.done = 1
	},
	locale(loc) {
		push_undo()
		remove_york_favour(loc)
		log(`Removed York Favour at S${loc}.`)
		game.count++
	},
	done() {
		end_immediate_event()
	},
}

// === EVENT: HENRY RELEASED ===

function goto_lancaster_event_henry_released() {
	if (has_lancaster_favour(LOC_LONDON)) {
		increase_lancaster_influence(5)
		log("London Favours Lancastrians.")
	}
	end_immediate_event()
}

// === EVENT: L'UNIVERSELLE ARAGNE ===

function goto_lancaster_event_luniverselle_aragne() {
	let can_play = false
	for (let vassal of all_vassals) {
		if (is_vassal_mustered_with_york_lord(vassal)) {
			can_play = true
		}
	}
	if (can_play) {
		game.state = "aragne_1"
		game.event_aragne = []
	} else {
		logi("No effect.")
		end_immediate_event()
	}
}

states.aragne_1 = {
	inactive: "L'Universelle Aragne",
	prompt() {
		view.prompt = "L'Universelle Aragne: Select up to 2 vassals"
		view.vassal = game.event_aragne
		if (game.event_aragne.length < 2) {
			for (let v of all_vassals) {
				if (!set_has(game.event_aragne, v) && is_vassal_mustered_with_york_lord(v)) {
					gen_action_vassal(v)
				}
			}
		}
		view.actions.done = 1
	},
	vassal(v) {
		push_undo()
		set_add(game.event_aragne, v)
		log(">V" + v)
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
	inactive: "L'Universelle Aragne",
	prompt() {
		view.prompt = "L'Universelle Aragne: Check influence for each selected vassal."
		let done = true
		for (let v of game.event_aragne) {
			gen_action_vassal(v)
			done = false
		}
		if (done) {
			view.prompt = "L'Universelle Aragne: All done."
			view.actions.done = 1
		}
	},
	vassal(v) {
		push_undo()
		game.vassal = v
		game.state = "aragne_3"
	},
	done() {
		end_universelle_aragne()
	},
}

states.aragne_3 = {
	inactive: "L'Universelle Aragne",
	prompt() {
		let lord = get_vassal_lord(game.vassal)
		view.prompt = `L'Universelle Aragne: ${lord_name[lord]} with ${vassal_name[game.vassal]}.`
		view.vassal = game.vassal
		prompt_influence_check(lord, vassal_ic)
	},
	check(spend) {
		let lord = get_vassal_lord(game.vassal)
		if (!roll_influence_check("Aragne V" + game.vassal, lord, spend, vassal_ic))
			disband_vassal(game.vassal)
		set_delete(game.event_aragne, game.vassal)
		game.vassal = NOVASSAL
		game.state = "aragne_2"
	},
}

function end_universelle_aragne() {
	delete game.event_aragne
	set_active_enemy()
	end_immediate_event()
}

// === EVENT: TO WILFUL DISOBEDIENCE ===

function goto_lancaster_event_to_wilful_disobedience() {
	let can_play = false
	for (let loc of all_locales) {
		if (has_york_favour(loc) && !has_enemy_lord(loc) && !has_adjacent_enemy(loc) && (has_friendly_lord(loc) || has_adjacent_friendly(loc))) {
			can_play = true
		}
	}
	if (can_play) {
		game.state = "wilful_disobedience"
		game.who = NOBODY
		game.count = 0
	} else {
		logi("No effect.")
		end_immediate_event()
	}

}
states.wilful_disobedience = {
	inactive: "To wilful disobedience",
	prompt() {
		view.prompt = "To wilful disobedience: Remove Yorkist favour from 2 strongholds."
		for (let loc of all_locales) {
			if (
				game.count < 2 &&
				has_york_favour(loc) &&
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
		remove_york_favour(loc)
		game.count++
		logi(`Yorkist Favour removed at S${loc}`)
	},
	done() {
		end_immediate_event()
	}
}

// === EVENT: FRENCH WAR LOANS ===

function goto_lancaster_event_french_war_loans() {
	if (can_french_war_loans()) {
		game.state = "french_war_loans"
	} else {
		logi("No effect.")
		end_immediate_event()
	}
}

function can_french_war_loans() {
	for (let lord of all_lancaster_lords)
		if (is_lord_on_map(lord) && !get_lord_moved(lord))
			return true
	return false
}

states.french_war_loans = {
	inactive: "French War Loans",
	prompt() {
		view.prompt = "French War Loans: Add 1 coin and 1 provender to each Lancastrian lord."
		for (let lord of all_lancaster_lords)
			if (is_lord_on_map(lord) && !get_lord_moved(lord))
				gen_action_lord(lord)
	},
	lord(lord) {
		set_lord_moved(lord, 1)
		logi(">L" + lord)
		add_lord_assets(lord, PROV, 1)
		add_lord_assets(lord, COIN, 1)
		if (!can_french_war_loans()) {
			clear_lords_moved()
			end_immediate_event()
		}
	},
}

// === EVENT: ROBINS REBELLION ===

function goto_lancaster_event_robins_rebellion() {
	let can_play = false
	for (let loc of all_locales) {
		if (is_north(loc) && !has_lancaster_favour(loc)) {
			can_play = true
		}
	}
	if (can_play) {
		game.state = "robins_rebellion"
		game.who = NOBODY
		game.count = 0
	} else {
		logi("No effect.")
		end_immediate_event()
	}
}

states.robins_rebellion = {
	inactive: "Robin's Rebellion",
	prompt() {
		view.prompt = "Robin's Rebellion: Place and/or remove up to 3 favour total in the North."
		let done = true
		if (game.count < 3) {
			for (let loc of all_north_locales) {
				if (!is_friendly_locale(loc)) {
					gen_action_locale(loc)
					done = false
				}
			}
		}
		if (done)
			view.prompt = "Robin's Rebellion: All done."
		view.actions.done = 1
	},
	locale(loc) {
		push_undo()
		shift_favour_toward(loc)
		log(`Placed/Removed Favour at S${loc}.`)
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
		game.who = LORD_HENRY_TUDOR
	} else {
		logi("No effect.")
		end_immediate_event()
	}
}

states.tudor_banners = {
	inactive: "Tudor banners",
	prompt() {
		view.prompt = "Tudor Banners: Mark strongholds adjacent to Henry Tudor with Lancastrian favour."
		let here = get_lord_locale(LORD_HENRY_TUDOR)
		let done = true
		for (let next of data.locales[here].adjacent) {
			if (!has_enemy_lord(next) && !has_lancaster_favour(next)) {
				gen_action_locale(next)
				done = false
			}
		}
		if (done)
			view.actions.done = 1
	},
	locale(loc) {
		remove_york_favour(loc)
		add_lancaster_favour(loc)
		log(`Placed Lancastrian Favour at S${loc}`)
	},
	done() {
		game.who = NOBODY
		end_immediate_event()
	}
}

// === EVENT: TAX COLLECTORS ===

function goto_york_event_tax_collectors() {
	game.state = "tax_collectors"
}

function can_tax_collectors(lord: Lord) {
	let here = get_lord_locale(lord)
	if (can_tax_at(here, lord))
		return true
	return !!search_tax(false, here, lord, true)
}

states.tax_collectors = {
	inactive: "Tax Collectors",
	prompt() {
		view.prompt = "Tax Collectors: Each Yorkist lord may immediately tax for twice the coin."
		let done = true
		for (let lord of all_york_lords) {
			if (!get_lord_moved(lord) && can_tax_collectors(lord)) {
				gen_action_lord(lord)
				done = false
			}
		}
		if (done)
			view.prompt = "Tax Collectors: All done."
		view.actions.done = 1
	},
	lord(lord) {
		push_undo()
		set_lord_moved(lord, 1)
		game.where = NOWHERE
		game.who = lord
		game.state = "tax_collectors_lord"
		game.tax = search_tax([], get_lord_locale(game.who), game.who, true)
	},
	done() {
		end_tax_collectors()
	},
}

states.tax_collectors_lord = {
	inactive: "Tax Collectors",
	prompt() {
		if (game.where === NOWHERE) {
			view.prompt = `Tax Collectors: ${lord_name[game.who]}. Choose a stronghold.`
			map_for_each_key(game.tax, gen_action_locale)
		} else {
			view.prompt = `Tax Collectors: Tax ${locale_name[game.where]} with ${lord_name[game.who]}.`
			prompt_influence_check(game.who)
		}
	},
	locale(loc) {
		push_undo()
		game.where = loc
		if (loc === get_lord_seat(game.who)) {
			do_tax(game.who, game.where, 2)
			end_tax_collectors_lord()
		} else {
			let dist = map_get(game.tax, loc, 0)
			if (can_naval_blockade_route(dist)) {
				let tax_way = search_tax([], get_lord_locale(game.who), game.who, false)
				if (map_has(tax_way, game.where))
					game.tax = tax_way
				else
					game.state = "blockade_tax_collectors"
			}
		}
	},
	check(spend) {
		if (roll_influence_check("Tax S" + game.where, game.who, spend))
			do_tax(game.who, game.where, 2)
		else
			fail_tax(game.who)
		end_tax_collectors_lord()
	},
}

states.blockade_tax_collectors = {
	inactive: "Tax Collectors",
	prompt() {
		view.prompt = "Tax Collectors: Warwick may naval blockade this tax action."
		view.actions.roll = 1
	},
	roll() {
		if (roll_blockade("Tax Collectors"))
			game.state = "tax_collectors_lord"
		else
			end_tax_collectors_lord()
	},
}

function end_tax_collectors_lord() {
	delete game.tax
	game.where = NOWHERE
	game.who = NOBODY
	game.state = "tax_collectors"
}

function end_tax_collectors() {
	game.where = NOWHERE
	game.who = NOBODY
	game.count = 0
	clear_lords_moved()
	end_immediate_event()
}

// === EVENT: LONDON FOR YORK ===

function goto_york_event_london_for_york() {
	if (has_york_favour(LOC_LONDON) && !has_york_favour(LONDON_FOR_YORK)) {
		game.state = "london_for_york"
	} else {
		logi("No effect.")
		end_immediate_event()
	}
}

states.london_for_york = {
	inactive: "London for York",
	prompt() {
		view.prompt = "London for York: Add a second favour marker at London."
		gen_action_locale(LOC_LONDON)
	},
	locale(loc) {
		add_york_favour(LONDON_FOR_YORK)
		log(`Two favour at S${loc}.`)
		end_immediate_event()
	},
}

// === EVENT: SHE-WOLF OF FRANCE ===

function goto_york_event_shewolf_of_france() {
	for (let v of all_vassals) {
		if (is_vassal_mustered_with_friendly_lord(v) && !is_special_vassal(v)) {
			game.state = "she_wolf"
			game.event_she_wolf = []
			game.who = NOBODY
			return
		}
	}
	logi("No effect.")
	end_immediate_event()
}

states.she_wolf = {
	inactive: "She-Wolf of France",
	prompt() {
		view.prompt = "She-Wolf of France: Shift each Yorkist vassal's calendar marker."
		let done = true
		for (let v of all_vassals) {
			if (!set_has(game.event_she_wolf, v) && is_vassal_mustered_with_friendly_lord(v)) {
				gen_action_vassal(v)
				done = false
			}
		}
		if (done) {
			view.prompt = "She-Wolf of France: All done."
			view.actions.done = 1
		}
	},
	vassal(v) {
		let t = get_vassal_service(v) + 1
		if (t < 16)
			set_vassal_lord_and_service(v, get_vassal_lord(v), t)
		set_add(game.event_she_wolf, v)
		log(`>V${v} to T${t}`)
	},
	done() {
		delete game.event_she_wolf
		end_immediate_event()
	},
}

// === EVENT: RICHARD LEIGH ===

function goto_york_event_sir_richard_leigh() {
	if (!has_york_favour(LOC_LONDON)) {
		game.state = "richard_leigh"
	} else {
		logi("No effect.")
		end_immediate_event()
	}
}

states.richard_leigh = {
	inactive: "Sir Richard Leigh",
	prompt() {
		if (has_lancaster_favour(LOC_LONDON))
			view.prompt = "Sir Richard Leigh: Remove Lancastrian favour from London."
		else
			view.prompt = "Sir Richard Leigh: Place Yorkist favour at London."
		gen_action_locale(LOC_LONDON)
	},
	locale(loc) {
		shift_favour_toward(loc)
		if (has_york_favour(loc))
			log(`L${loc} to Yorkist Favour.`)
		else
			log(`L${loc} to neutral.`)
		end_immediate_event()
	}
}

// === EVENT: CHARLES THE BOLD ===

function goto_york_event_charles_the_bold() {
	game.state = "charles_the_bold"
}

states.charles_the_bold = {
	inactive: "Charles the Bold",
	prompt() {
		view.prompt = "Charles the Bold: Add 1 coin and 1 provender to each Yorkist lord."
		let done = true
		for (let lord of all_york_lords) {
			if (is_lord_on_map(lord) && !get_lord_moved(lord)) {
				gen_action_lord(lord)
				done = false
			}
		}
		if (done) {
			view.prompt = "Charles the Bold: All done."
			view.actions.done = 1
		}
	},
	lord(lord) {
		log(">L" + lord)
		set_lord_moved(lord, 1)
		add_lord_assets(lord, PROV, 1)
		add_lord_assets(lord, COIN, 1)
	},
	done() {
		clear_lords_moved()
		end_immediate_event()
	}
}

// === EVENT: DUBIOUS CLARENCE ===

function goto_dubious_clarence() {
	if (is_lord_on_map(LORD_EDWARD_IV) && is_lord_on_map(LORD_CLARENCE)) {
		game.state = "dubious_clarence"
		game.who = LORD_EDWARD_IV
	} else {
		logi("No effect.")
		end_immediate_event()
	}
}

states.dubious_clarence = {
	inactive: "Dubious Clarence",
	prompt() {
		view.prompt = "Dubious Clarence: Edward IV may attempt to disband Clarence."
		prompt_influence_check(game.who)
		view.actions.pass = 1
	},
	check(spend) {
		if (roll_influence_check("Dubious L" + LORD_CLARENCE, game.who, spend))
			disband_lord(LORD_CLARENCE)
		game.who = NOBODY
		end_immediate_event()
	},
	pass() {
		game.who = NOBODY
		end_immediate_event()
	},
}

// === EVENT: YORKIST NORTH ===

function goto_york_event_yorkist_north() {
	for (let lord of all_york_lords) {
		if (is_lord_in_north(lord)) {
			increase_york_influence(1)
			log(">L" + lord)
		}
	}
	for (let loc of all_north_locales) {
		if (has_york_favour(loc)) {
			increase_york_influence(1)
			log(">S" + loc)
		}
	}
	end_immediate_event()
}

// === EVENT: EARL RIVERS ===

function goto_york_event_earl_rivers() {
	game.state = "earl_rivers"
	game.who = NOBODY
}

states.earl_rivers = {
	inactive: "Earl Rivers",
	prompt() {
		if (game.who === NOBODY) {
			view.prompt = "Earl Rivers: Add up to 2 militia to each Yorkist lord on map."
			let done = true
			for (let lord of all_york_lords) {
				if (is_lord_on_map(lord) && !get_lord_moved(lord)) {
					gen_action_lord(lord)
					done = false
				}
			}
			view.actions.done = 1
			if (done)
				view.prompt = "Earl Rivers: All done."
		} else {
			view.actions.add_militia = 1
			view.actions.add_militia2 = 1
		}
	},
	lord(lord) {
		push_undo()
		game.who = lord
	},
	add_militia() {
		log(">L" + game.who)
		set_lord_moved(game.who, 1)
		add_lord_forces(game.who, MILITIA, 1)
		game.who = NOBODY
	},
	add_militia2() {
		log(">L" + game.who)
		set_lord_moved(game.who, 1)
		add_lord_forces(game.who, MILITIA, 2)
		game.who = NOBODY
	},
	done() {
		clear_lords_moved()
		end_immediate_event()
	},
}

// === EVENT (AS LEVY EFFECT): THE KINGS NAME ===

function eligible_kings_name() {
	if (is_lord_on_map(LORD_GLOUCESTER_1) || is_lord_on_map(LORD_GLOUCESTER_2)) {
		if (is_event_in_play(EVENT_YORK_THE_KINGS_NAME) && game.active === LANCASTER)
			return true
	}
	return false
}

function push_the_kings_name() {
	if (eligible_kings_name())
		save_state_for_the_kings_name()
}

function goto_the_kings_name(_action_name) {
	if (game.event_the_kings_name !== undefined) {
		// TODO: pause for confirmation before changing control?
		set_active_enemy()
		game.state = "the_kings_name"
	} else {
		resume_muster_lord()
	}
}

states.the_kings_name = {
	inactive: "The King's Name",
	prompt() {
		view.prompt = "The King's Name: You may pay 1 influence to cancel the last levy action."
		view.actions.pass = 1
		view.actions.pay = 1
	},
	pay() {
		restore_state_for_the_kings_name()
		reduce_york_influence(1)
		logevent(EVENT_YORK_THE_KINGS_NAME)
		resume_muster_lord()
	},
	pass() {
		delete_state_for_the_kings_name()
		set_active_enemy()
		resume_muster_lord()
	}
}

// === EVENT (AS LEVY EFFECT): RISING WAGES ===

function is_rising_wages() {
	return is_event_in_play(EVENT_LANCASTER_RISING_WAGES) && game.active === YORK
}

function goto_rising_wages() {
	if (is_rising_wages())
		game.state = "rising_wages"
	else
		end_rising_wages()
}

states.rising_wages = {
	inactive: "Rising Wages",
	prompt() {
		let here = get_lord_locale(game.command)
		view.prompt = "Rising Wages: Pay 1 extra coin to levy troops."
		for (let lord of all_friendly_lords()) {
			let loc = get_lord_locale(lord)
			if (here === loc && (get_lord_assets(lord, COIN) > 0)) {
				gen_action_coin(lord)
			}
		}
	},
	coin(lord) {
		add_lord_assets(lord, COIN, -1)
		logevent(EVENT_LANCASTER_RISING_WAGES)
		end_rising_wages()
	},
}

function end_rising_wages() {
	goto_the_commons()
}

// === EVENT (AS LEVY EFFECT): THE COMMONS ===

// each Levy Troops action ends with coming here

function goto_the_commons() {
	if (is_event_in_play(EVENT_YORK_THE_COMMONS) && is_york_lord(game.command))
		game.state = "the_commons"
	else
		end_the_commons()
}

states.the_commons = {
	inactive: "The Commons",
	prompt() {
		view.prompt = "The Commons: Add up to 2 militia."
		view.actions.add_militia = 1
		view.actions.add_militia2 = 1
		view.actions.pass = 1
	},
	add_militia() {
		push_undo()
		logevent(EVENT_YORK_THE_COMMONS)
		add_lord_forces(game.command, MILITIA, 1)
		end_the_commons()
	},
	add_militia2() {
		push_undo()
		logevent(EVENT_YORK_THE_COMMONS)
		add_lord_forces(game.command, MILITIA, 2)
		end_the_commons()
	},
	pass() {
		push_undo()
		end_the_commons()
	}
}

function end_the_commons() {
	goto_the_kings_name("Levy Troops")
}

// === EVENT (AS LEVY EFFECT): JACK CADE ===

function is_jack_cade_eligible(lord: Lord) {
	if (is_york_lord(lord)) {
		if (!is_event_in_play(EVENT_YORK_JACK_CADE))
			return false
		if (is_lord_in_or_adjacent_to_south(lord) && is_york_dominating_south())
			return true
		if (is_lord_in_or_adjacent_to_north(lord) && is_york_dominating_north())
			return true
		if (is_lord_in_or_adjacent_to_wales(lord) && is_york_dominating_wales())
			return true
	}
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
		view.prompt = "Exile Pact: Move cylinder into a friendly exile box."
		for (let loc of all_exile_boxes)
			if (can_use_exile_box(game.command, loc))
				gen_action_locale(loc)
	},
	locale(loc) {
		log(`E${EVENT_YORK_EXILE_PACT} to S${loc}.`)
		set_lord_locale(game.command, loc)
		end_exile_pact()
	}
}

function end_exile_pact() {
	spend_action(1)
	resume_command()
}

// === EVENTS: HELD ===

function play_held_event(c: Card) {
	log(`Played E${c}.`)
	if (is_york_card(c))
		set_delete(game.hand_y, c)
	else
		set_delete(game.hand_l, c)
	game.this_event = c
	set_add(game.events, c)
}

function end_held_event() {
	set_delete(game.events, game.this_event)
	delete game.this_event
}

function end_passive_held_event() {
	delete game.this_event
}

function prompt_held_event_at_levy() {
	for (let c of current_hand())
		if (can_play_held_event_at_levy(c))
			gen_action_card(c)
}

function prompt_held_event_at_campaign() {
	for (let c of current_hand())
		if (can_play_held_event_at_campaign(c))
			gen_action_card(c)
}

function can_play_held_event_at_levy(c: Card) {
	switch (c) {
		case EVENT_LANCASTER_ASPIELLES:
			return can_play_l_aspielles()
		case EVENT_YORK_ASPIELLES:
			return can_play_y_aspielles()
		case EVENT_YORK_YORKIST_PARADE:
			return can_play_yorkist_parade()
		case EVENT_YORK_SUN_IN_SPLENDOUR:
			return can_play_sun_in_splendour()
	}
	return false
}

function can_play_held_event_at_campaign(c: Card) {
	switch (c) {
		case EVENT_LANCASTER_ASPIELLES:
			return can_play_l_aspielles()
		case EVENT_YORK_ASPIELLES:
			return can_play_y_aspielles()
		case EVENT_LANCASTER_REBEL_SUPPLY_DEPOT:
			return can_play_rebel_supply_depot()
		case EVENT_LANCASTER_SURPRISE_LANDING:
			return can_play_surprise_landing()
		case EVENT_LANCASTER_PARLIAMENTS_TRUCE:
			return true
		case EVENT_YORK_PARLIAMENTS_TRUCE:
			return true
	}
	return false
}

function action_held_event_at_levy(c: Card) {
	push_undo()
	play_held_event(c)
	switch (c) {
		// Play any time
		case EVENT_YORK_ASPIELLES:
		case EVENT_LANCASTER_ASPIELLES:
			goto_play_aspielles()
			break

		// Play in Levy
		case EVENT_YORK_SUN_IN_SPLENDOUR:
			goto_play_sun_in_splendour()
			break

		// Play in Levy (for passive effect)
		case EVENT_YORK_YORKIST_PARADE:
			end_passive_held_event()
			break

		default:
			throw "INVALID CARD"
	}
}

function action_held_event_at_campaign(c: Card) {
	push_undo()
	play_held_event(c)
	switch (c) {
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

		// Play in Campaign (for passive effect)
		case EVENT_LANCASTER_PARLIAMENTS_TRUCE:
		case EVENT_YORK_PARLIAMENTS_TRUCE:
			end_passive_held_event()
			break

		default:
			throw "INVALID CARD"
	}
}

// === HELD EVENT (LEVY): YORKIST PARADE ===

function can_play_yorkist_parade() {
	if (is_levy_phase()) {
		if (is_friendly_locale(LOC_LONDON) && (get_lord_locale(LORD_WARWICK_Y) === LOC_LONDON || get_lord_locale(LORD_YORK) === LOC_LONDON))
			return true
	}
	return false
}

// === HELD EVENT (LEVY): SUN IN SPLENDOUR ===

function can_play_sun_in_splendour() {
	if (is_levy_phase())
		return is_lord_on_calendar(LORD_EDWARD_IV)
	return false
}

function goto_play_sun_in_splendour() {
	game.state = "sun_in_splendour"
}

states.sun_in_splendour = {
	inactive: "Sun in Splendour",
	prompt() {
		view.prompt = "Sun in Splendour: Muster Edward IV at any friendly locale with no enemy lord."
		for (let loc of all_locales)
			if (is_friendly_locale(loc))
				gen_action_locale(loc)
	},
	locale(loc) {
		muster_lord(LORD_EDWARD_IV, loc)
		set_lord_moved(LORD_EDWARD_IV, 1)

		log(`L${LORD_EDWARD_IV} at ${locale_name[loc]}.`)

		end_held_event()
		game.state = "muster"
	},
}

function goto_play_sun_in_splendour_now() {
	game.state = "sun_in_splendour_now"
}

states.sun_in_splendour_now = {
	inactive: "Sun in Splendour",
	prompt() {
		view.prompt = "Sun in Splendour: Muster Edward IV at any friendly locale with no enemy lord."
		for (let loc of all_locales)
			if (is_friendly_locale(loc))
				gen_action_locale(loc)
	},
	locale(loc) {
		muster_lord(LORD_EDWARD_IV, loc)
		log(`L${LORD_EDWARD_IV} at S${loc}.`)
		end_immediate_event()
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
	clear_undo() // cannot undo after looking at hidden information!
	game.state = "aspielles"
	game.who = NOBODY
	if (game.active === YORK) {
		if (game.hand_l.length > 0)
			for (let c of game.hand_l)
				log(">E" + c)
		else
			log(">Empty")
	}
	if (game.active === LANCASTER) {
		if (game.hand_y.length > 0)
			for (let c of game.hand_y)
				log(">E" + c)
		else
			log(">Empty")
	}
}

states.aspielles = {
	inactive: "Aspielles",
	prompt() {
		if (game.hidden) {
			if (game.who === NOBODY) {
				view.prompt = "Aspielles: Inspect enemy held cards and one hidden lord mat."
				for (let lord of all_enemy_lords())
					gen_action_lord(lord)
			} else {
				view.prompt = `Aspielles: Inspect enemy held cards and ${lord_name[game.who]} mat.`
				reveal_lord(game.who)
				view.actions.done = 1
			}
		} else {
			view.prompt = "Aspielles: Inspect enemy held cards."
			view.actions.done = 1
		}
		if (game.active === YORK)
			view.hand = game.hand_l
		if (game.active === LANCASTER)
			view.hand = game.hand_y
	},
	lord(lord) {
		log(`Reveal L${lord}:`)

		let c = get_lord_capability(lord, 0)
		if (c !== NOCARD)
			log(">C" + c)
		c = get_lord_capability(lord, 1)
		if (c !== NOCARD)
			log(">C" + c)

		for_each_vassal_with_lord(lord, v => {
			log(">V" + v)
		})

		for (let i of simple_force_type) {
			let n = get_lord_forces(lord, i)
			if (n > 0)
				log(">" + n + " " + FORCE_TYPE_NAME[i])
		}

		for (let i of all_asset_types) {
			let n = get_lord_assets(lord, i)
			if (n > 0)
				log(">" + n + " " + ASSET_TYPE_NAME[i])
		}

		game.who = lord
	},
	done() {
		end_held_event()
		if (is_levy_phase())
			game.state = "muster"
		else
			game.state = "command"
	},
}

// === HELD EVENT: REBEL SUPPLY DEPOT ===

function can_play_rebel_supply_depot() {
	if (has_flag(FLAG_SAIL_TO_PORT) || has_flag(FLAG_MARCH_TO_PORT))
		return true
	return false
}

function goto_play_rebel_supply_depot() {
	set_flag(FLAG_SUPPLY_DEPOT)
	add_spoils(PROV, 4)
	game.state = "rebel_supply_depot"
}

states.rebel_supply_depot = {
	inactive: "Rebel Supply Depot",
	prompt() {
		if (has_any_spoils()) {
			view.prompt = "Rebel Supply Depot: Divide " + list_spoils() + "."
			let here = get_lord_locale(game.command)
			for (let lord of all_friendly_lords()) {
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
	take_all() {
		push_undo_without_who()
		take_all_spoils()
	},
	end_spoils() {
		push_undo_without_who()
		end_rebel_supply_depot()
	},
}

function end_rebel_supply_depot() {
	delete game.spoils
	end_held_event()
	game.state = "command"
}

// === HELD EVENT: SURPRISE LANDING ===

function can_play_surprise_landing() {
	let here = get_lord_locale(game.command)
	if (has_flag(FLAG_SAIL_TO_PORT)) {
		if (
			is_seaport(here) &&
			here !== LOC_CALAIS &&
			here !== LOC_PEMBROKE &&
			here !== LOC_HARLECH &&
			here !== LOC_LANCASTER
		) {
			for (let to of data.locales[here].roads)
				if (can_march_to(to))
					return true
			for (let to of data.locales[here].highways)
				if (can_march_to(to))
					return true
		}
	}
	return false
}

function goto_play_surprise_landing() {
	game.state = "surprise_landing"
	set_flag(FLAG_SURPRISE_LANDING)
	game.who = NOBODY
}

states.surprise_landing = {
	inactive: "Surprise Landing",
	prompt() {
		view.prompt = "Surprise Landing: Free march."
		view.group = game.group

		if (can_pick_up_lords(game.command)) {
			for_each_friendly_lord_in_locale(get_lord_locale(game.command), other => {
				if (can_pick_up_other(game.command, other))
					gen_action_lord(other)
			})
		}

		prompt_march()
	},
	lord(lord) {
		set_toggle(game.group, lord)
	},
	locale(loc) {
		push_undo()
		end_held_event()
		goto_march(loc)
	},
}

// === LOGGING ===

function range(x) {
	switch (x) {
		case 0: return "0"
		case 1: return "1-1"
		case 2: return "1-2"
		case 3: return "1-3"
		case 4: return "1-4"
		case 5: return "1-5"
		default: return "1-6"
	}
	return "?"
}

function log_br() {
	if (game.log.length > 0 && game.log[game.log.length - 1] !== "")
		game.log.push("")
}

function log(msg: string) {
	game.log.push(msg)
}

function logevent(cap: Card) {
	game.log.push(`E${cap}.`)
}

function logcap(cap: Card) {
	game.log.push(`C${cap}.`)
}

function logi(msg: string) {
	game.log.push(">" + msg)
}

function logii(msg: string) {
	game.log.push(">>" + msg)
}

function log_h1(msg: string) {
	log_br()
	log(".h1 " + msg)
	log_br()
}

function log_h2_active(msg: string) {
	log_br()
	if (game.active === YORK)
		log(".h2y " + msg)
	else if (game.active === LANCASTER)
		log(".h2l " + msg)
	else
		log(".h2 " + msg)
	log_br()
}

function log_h2_common(msg: string) {
	log_br()
	log(".h2 " + msg)
	log_br()
}

function log_h3(msg: string) {
	log_br()
	log(".h3 " + msg)
}

function log_h4(msg: string) {
	log_br()
	log(".h4 " + msg)
}

// === VIEW & ACTION ===

function reveal_lord(lord: Lord) {
	view.reveal |= (1 << lord)
}

exports.view = function (state, current) {
	load_state(state)

	view = {
		prompt: null,
		actions: null,
		log: game.log,
		reveal: 0,

		scenario: game.scenario,
		turn: game.turn,
		influence: game.influence,

		events: game.events,
		pieces: game.pieces,
		battle: game.battle,

		held_y: game.hand_y.length,
		held_l: game.hand_l.length,

		command: game.command,
		where: game.where,
		who: game.who,
		hand: null,
		plan: null,
	}

	if (!game.hidden)
		view.reveal = -1

	if (game.this_event !== undefined)
		view.what = game.this_event

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
		for (let lord of game.battle.routed)
			view.reveal |= 1 << lord
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

function gen_action(action: string, argument: number) {
	if (!(action in view.actions))
		view.actions[action] = []
	set_add(view.actions[action], argument)
}

function gen_action_card_if_held(c: Card) {
	if (has_card_in_hand(c))
		gen_action_card(c)
}

function prompt_select_lord(lord: Lord) {
	if (lord !== game.who)
		gen_action_lord(lord)
}

function action_select_lord(lord: Lord) {
	if (game.who === lord)
		game.who = NOBODY
	else
		game.who = lord
}

function gen_action_locale(locale: Locale) {
	gen_action("locale", locale)
}

function gen_action_lord(lord: Lord) {
	gen_action("lord", lord)
}

function gen_action_array(pos: number) {
	gen_action("array", pos)
}

function gen_action_vassal(vassal: Vassal) {
	gen_action("vassal", vassal)
}

function gen_action_card(card_or_list: Card | Card[]) {
	if (Array.isArray(card_or_list))
		for (let c of card_or_list)
			gen_action("card", c)
	else
		gen_action("card", card_or_list)
}

function gen_action_plan(lord: Lord) {
	gen_action("plan", lord)
}

function gen_action_prov(lord: Lord) {
	gen_action("prov", lord)
}

function gen_action_coin(lord: Lord) {
	gen_action("coin", lord)
}

function gen_action_cart(lord: Lord) {
	gen_action("cart", lord)
}

function gen_action_mercenaries(lord: Lord) {
	gen_action("mercenaries", lord)
}

function gen_action_burgundians(lord: Lord) {
	gen_action("burgundians", lord)
}

function gen_action_longbowmen(lord: Lord) {
	gen_action("longbowmen", lord)
}

function gen_action_retinue(lord: Lord) {
	gen_action("retinue", lord)
}

function gen_action_men_at_arms(lord: Lord) {
	gen_action("men_at_arms", lord)
}

function gen_action_militia(lord: Lord) {
	gen_action("militia", lord)
}

function gen_action_routed_retinue(lord: Lord) {
	gen_action("routed_retinue", lord)
}

function gen_action_routed_mercenaries(lord: Lord) {
	gen_action("routed_mercenaries", lord)
}

function gen_action_routed_longbowmen(lord: Lord) {
	gen_action("routed_longbowmen", lord)
}

function gen_action_routed_burgundians(lord: Lord) {
	gen_action("routed_burgundians", lord)
}

function gen_action_routed_men_at_arms(lord: Lord) {
	gen_action("routed_men_at_arms", lord)
}

function gen_action_routed_militia(lord: Lord) {
	gen_action("routed_militia", lord)
}

// === GAME OVER ===

function goto_game_over(result: string, victory: string) {
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

function save_state_for_the_kings_name() {
	game.event_the_kings_name = game.undo[game.undo.length - 1]
}

function restore_state_for_the_kings_name() {
	let current_log = game.log
	let current_influence = game.influence
	game = game.event_the_kings_name
	game.undo = []
	game.log = current_log
	game.influence = current_influence
	delete game.event_the_kings_name
}

function delete_state_for_the_kings_name() {
	delete game.event_the_kings_name
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
	save_log.length = (game as any).log
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

function pack2_get(word: number, n: number) {
	n = n << 1
	return (word >>> n) & 3
}

function pack4_get(word: number, n: number) {
	n = n << 2
	return (word >>> n) & 15
}

function pack2_set(word: number, n: number, x: number) {
	n = n << 1
	return (word & ~(3 << n)) | (x << n)
}

function pack4_set(word: number, n: number, x: number) {
	n = n << 2
	return (word & ~(15 << n)) | (x << n)
}

// Array remove and insert (faster than splice)

function array_remove<T>(array: T[], index: number) {
	let n = array.length
	for (let i = index + 1; i < n; ++i)
		array[i - 1] = array[i]
	array.length = n - 1
}

function array_insert<T>(array: T[], index: number, item: T) {
	for (let i = array.length; i > index; --i)
		array[i] = array[i - 1]
	array[index] = item
}

function array_remove_pair<T>(array: T[], index: number) {
	let n = array.length
	for (let i = index + 2; i < n; ++i)
		array[i - 2] = array[i]
	array.length = n - 2
}

function array_insert_pair<K,V>(array: (K|V)[], index: number, key: K, value: V) {
	for (let i = array.length; i > index; i -= 2) {
		array[i] = array[i - 2]
		array[i + 1] = array[i - 1]
	}
	array[index] = key
	array[index + 1] = value
}

// Set as plain sorted array

function set_has<T>(set: T[], item: T) {
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

function set_add<T>(set: T[], item: T) {
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

function set_delete<T>(set: T[], item: T) {
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

function set_toggle<T>(set: T[], item: T) {
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
		let x = map[m<<1]
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

function map_for_each_key(map, f) {
	for (let i = 0; i < map.length; i += 2)
		f(map[i])
}

function map_for_each(map, f) {
	for (let i = 0; i < map.length; i += 2)
		f(map[i], map[i+1])
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
	for (let lord of all_lords) {
		if (is_lord_on_map(lord) && !count_lord_all_forces(lord) && !get_lord_forces(lord, RETINUE))
			throw Error(`ASSERT: Lord "${lord_name[lord]}" without troops or retinue.`)
	}
}

function assert_all_lords_on_land() {
	for (let lord of all_lords) {
		if (is_lord_at_sea(lord))
			throw Error(`ASSERT: Lord "${lord_name[lord]}" at sea during Levy phase.`)
	}
}

function assert_all_lords_without_routed_troops() {
	for (let lord of all_lords) {
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
				console.log("STATE", fuzz_info.state)
				console.log("VIEW", fuzz_info.view)
				throw new Error("Too many times in the same state.")
			}
	}
}

if (false)
	exports.fuzz_crash = function (_state, _view) {
		for (let x = 0; x < log_sanity.length; x++) {
			console.log(log_sanity[x])
		}
	}
