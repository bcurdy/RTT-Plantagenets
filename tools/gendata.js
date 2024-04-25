// Run this script inside the "tools" directory to generate data.js and build_counters3.sh

"use strict"

const fs = require('fs')

function cmpnum(a,b) { return a - b }

function clean_name(name) {
	return name.toLowerCase().replaceAll("&", "and").replaceAll(" ", "_")
}

function array_insert_pair(array, index, key, value) {
	for (let i = array.length; i > index; i -= 2) {
		array[i] = array[i-2]
		array[i+1] = array[i-1]
	}
	array[index] = key
	array[index+1] = value
}

function map_set(map, key, value) {
	let a = 0
	let b = (map.length >> 1) - 1
	while (a <= b) {
		let m = (a + b) >> 1
		let x = map[m<<1]
		if (key < x)
			b = m - 1
		else if (key > x)
			a = m + 1
		else {
			map[(m<<1)+1] = value
			return
		}
	}
	array_insert_pair(map, a<<1, key, value)
}

// :r !node tools/genboxes.js
const boxes = {
	"0": [22,1575,48,48],
	"1": [71,1575,47,48],
	"2": [118,1575,46,48],
	"3": [165,1575,46,48],
	"4": [211,1575,48,48],
	"5": [259,1575,47,48],
	"6": [306,1575,48,48],
	"7": [354,1575,47,48],
	"8": [401,1575,46,48],
	"9": [447,1575,47,48],
	"10": [494,1575,49,49],
	"11": [543,1575,47,49],
	"12": [590,1575,47,49],
	"13": [637,1575,48,49],
	"14": [685,1575,46,48],
	"15": [731,1575,48,48],
	"16": [779,1575,47,48],
	"17": [826,1575,48,48],
	"18": [873,1575,46,48],
	"19": [920,1575,48,48],
	"20": [968,1575,46,49],
	"21": [1014,1575,48,49],
	"22": [1062,1575,47,49],
	"23": [1109,1575,48,49],
	"24": [1157,1575,46,49],
	"25": [1203,1577,49,47],
	"26": [1203,1530,49,47],
	"27": [1203,1434,49,47],
	"29": [1203,1388,49,46],
	"30": [1203,1340,49,48],
	"31": [1203,1292,49,48],
	"32": [1203,1244,49,48],
	"33": [1203,1198,49,46],
	"34": [1203,1151,49,47],
	"35": [1203,1104,49,47],
	"36": [1203,1057,49,46],
	"37": [1203,1010,49,47],
	"38": [1203,960,49,50],
	"39": [1203,914,47,46],
	"40": [1203,865,47,48],
	"41": [1203,819,47,46],
	"42": [1203,774,51,45],
	"43": [1203,724,51,50],
	"44": [1203,676,51,48],
	"45": [1203,630,47,46],
	"Scotland": [450,278,111,118],
	"France": [890,1430,109,114],
	"Calais": [1134,1418,67,79],
	"Ireland": [50,949,110,121],
	"Burgundy": [996,688,110,121],
	"Bamburgh": [637,300,60,45],
	"Carlisle": [436,422,81,63],
	"Hexham": [561,395,53,47],
	"Appleby": [546,465,57,52],
	"Newcastle": [656,419,70,77],
	"Scarborough": [791,532,78,57],
	"York": [691,623,76,65],
	"Lancaster": [476,595,70,51],
	"Ravenspur": [835,721,72,45],
	"Lincoln": [767,760,78,64],
	"Chester": [433,797,78,64],
	"Derby": [656,845,62,49],
	"Nottingham": [718,845,73,40],
	"Lichfield": [613,906,74,61],
	"Truro": [142,1445,56,53],
	"Launceston": [201,1354,68,60],
	"Exeter": [342,1376,64,66],
	"Dorchester": [524,1368,58,49],
	"Southampton": [677,1371,60,48],
	"Arundel": [794,1334,56,48],
	"Hastings": [983,1322,55,46],
	"Dover": [1041,1287,53,41],
	"Canterbury": [1059,1203,66,65],
	"Rochester": [983,1185,65,68],
	"London": [874,1164,94,72],
	"Guildford": [841,1249,74,59],
	"Winchester": [722,1262,71,60],
	"Salisbury": [610,1268,73,66],
	"Wells": [504,1262,68,66],
	"Bristol": [498,1185,63,58],
	"Newbury": [665,1194,66,44],
	"Oxford": [707,1101,70,63],
	"St Albans": [901,1092,54,40],
	"Cambridge": [901,1021,54,45],
	"Bedford": [836,1044,65,48],
	"Northampton": [748,1013,64,54],
	"Gloucester": [564,1092,68,62],
	"Hereford": [476,1040,71,65],
	"Cardiff": [392,1164,65,65],
	"Pembroke": [185,1127,58,37],
	"Ipswich": [1100,1030,58,43],
	"Bury St Edmunds": [997,995,54,45],
	"Norwich": [1059,890,67,62],
	"Lynn": [962,895,47,38],
	"Ely": [921,952,65,66],
	"Peterborough": [828,930,66,62],
	"Leicester": [758,906,49,46],
	"Coventry": [675,967,67,63],
	"Worcester": [556,992,72,64],
	"Ludlow": [476,976,54,34],
	"Shrewsbury": [500,865,78,69],
	"Harlech": [278,912,67,61],
	"Plymouth": [253,1417,58,50],
	"Irish Sea": [233,667,160,93],
	"English Channel": [564,1461,173,69],
	"North Sea": [1106,749,97,117],
	"box16": [938,423,310,52],
	"box1": [204,38,100,162],
	"box2": [306,38,100,162],
	"box3": [408,38,100,162],
	"box4": [510,38,100,162],
	"box5": [612,38,100,162],
	"box6": [734,38,100,162],
	"box7": [836,38,100,162],
	"box8": [938,38,100,162],
	"box9": [1040,38,100,162],
	"box10": [1142,38,100,162],
	"box11": [734,260,100,162],
	"box12": [836,260,100,162],
	"box13": [938,260,100,162],
	"box14": [1040,260,100,162],
	"box15": [1142,260,100,162],
	"Plymouth favour": [253,1417,58,50],
	"Harlech favour": [278,912,67,61],
	"Shrewsbury favour": [500,865,78,69],
	"Ludlow favour": [476,976,54,34],
	"Worcester favour": [556,992,72,64],
	"Coventry favour": [675,967,67,63],
	"Leicester favour": [758,906,49,46],
	"Peterborough favour": [828,930,66,62],
	"Ely favour": [921,952,65,66],
	"Lynn favour": [962,895,47,38],
	"Norwich favour": [1059,890,67,62],
	"Bury St Edmunds favour": [997,995,54,45],
	"Ipswich favour": [1100,1030,58,43],
	"Pembroke favour": [185,1127,58,37],
	"Cardiff favour": [392,1164,65,65],
	"Hereford favour": [476,1040,71,65],
	"Gloucester favour": [564,1092,68,62],
	"Northampton favour": [748,1013,64,54],
	"Bedford favour": [836,1044,65,48],
	"Cambridge favour": [901,1021,54,45],
	"St Albans favour": [901,1092,54,40],
	"Oxford favour": [707,1101,70,63],
	"Newbury favour": [665,1194,66,44],
	"Bristol favour": [498,1185,63,58],
	"Salisbury favour": [610,1268,73,66],
	"Wells favour": [504,1262,68,66],
	"Winchester favour": [722,1262,71,60],
	"Guildford favour": [841,1249,74,59],
	"London favour": [874,1164,94,72],
	"Rochester favour": [983,1185,65,68],
	"Canterbury favour": [1059,1203,66,65],
	"Dover favour": [1041,1287,53,41],
	"Hastings favour": [983,1322,55,46],
	"Arundel favour": [794,1334,56,48],
	"Southampton favour": [677,1371,60,48],
	"Dorchester favour": [524,1368,58,49],
	"Exeter favour": [342,1376,64,66],
	"Launceston favour": [201,1354,68,60],
	"Truro favour": [142,1445,56,53],
	"Lichfield favour": [613,906,74,61],
	"Nottingham favour": [718,845,73,40],
	"Derby favour": [656,845,62,49],
	"Chester favour": [433,797,78,64],
	"Lincoln favour": [767,760,78,64],
	"Ravenspur favour": [835,721,72,45],
	"Lancaster favour": [476,595,70,51],
	"York favour": [691,623,76,65],
	"Scarborough favour": [791,532,78,57],
	"Newcastle favour": [656,419,70,77],
	"Appleby favour": [546,465,57,52],
	"Hexham favour": [561,395,53,47],
	"Carlisle favour": [436,422,81,63],
	"Bamburgh favour": [637,300,60,45],
	"Burgundy favour": [996,688,110,121],
	"Ireland deplete": [50,939,110,121],
	"Calais favour": [1134,1418,67,79],
	"France favour": [890,1430,109,114],
	"Scotland favour": [450,278,111,118],
	"Calais deplete": [1145,1408,67,79],
	"Scotland deplete": [450,268,111,118],
	"France deplete": [890,1420,109,114],
	"Burgundy deplete": [996,678,110,121],
	"Bamburgh deplete": [647,290,60,45],
	"Carlisle deplete": [446,412,81,63],
	"Hexham deplete": [571,385,53,47],
	"Appleby deplete": [556,455,57,52],
	"Newcastle deplete": [668,409,70,77],
	"Scarborough deplete": [801,522,78,57],
	"York deplete": [701,613,76,65],
	"Lancaster deplete": [486,585,70,51],
	"Ravenspur deplete": [845,711,72,45],
	"Lincoln deplete": [777,750,78,64],
	"Chester deplete": [443,787,78,64],
	"Derby deplete": [656,835,62,49],
	"Nottingham deplete": [728,835,73,40],
	"Lichfield deplete": [603,896,74,61],
	"Truro deplete": [132,1435,56,53],
	"Launceston deplete": [211,1344,68,60],
	"Exeter deplete": [352,1366,64,66],
	"Dorchester deplete": [514,1358,58,49],
	"Southampton deplete": [667,1361,60,48],
	"Arundel deplete": [784,1324,56,48],
	"Hastings deplete": [973,1312,55,46],
	"Dover deplete": [1031,1277,53,41],
	"Canterbury deplete": [1069,1193,66,65],
	"Rochester deplete": [993,1175,65,68],
	"London deplete": [864,1154,94,72],
	"Guildford deplete": [851,1259,74,59],
	"Winchester deplete": [732,1252,71,60],
	"Wells deplete": [514,1252,68,66],
	"Salisbury deplete": [620,1258,73,66],
	"Bristol deplete": [508,1175,63,58],
	"Newbury deplete": [655,1184,66,44],
	"Oxford deplete": [697,1091,70,63],
	"St Albans deplete": [891,1102,54,40],
	"Cambridge deplete": [911,1031,54,45],
	"Bedford deplete": [826,1034,65,48],
	"Northampton deplete": [758,1003,64,54],
	"Gloucester deplete": [574,1082,68,62],
	"Hereford deplete": [466,1030,71,65],
	"Cardiff deplete": [382,1154,65,65],
	"Pembroke deplete": [195,1117,58,37],
	"Ipswich deplete": [1110,1020,58,43],
	"Bury St Edmunds deplete": [1007,985,54,45],
	"Norwich deplete": [1069,880,67,62],
	"Lynn deplete": [972,885,47,38],
	"Ely deplete": [931,942,65,66],
	"Peterborough deplete": [838,920,66,62],
	"Leicester deplete": [768,896,49,46],
	"Coventry deplete": [685,957,67,63],
	"Worcester deplete": [546,982,72,64],
	"Ludlow deplete": [486,966,54,34],
	"Shrewsbury deplete": [510,855,78,69],
	"Harlech deplete": [288,902,67,61],
	"Plymouth deplete": [263,1407,58,50],
	"vassal vassal_westmoreland": [600,470,54,56],
	"vassal vassal_stanley": [609,840,54,56],
	"vassal vassal_dudley": [704,898,54,56],
	"vassal vassal_shrewsbury": [455,879,54,56],
	"vassal vassal_worcester": [616,999,54,56],
	"vassal vassal_oxford": [776,1109,54,56],
	"vassal vassal_essex": [955,1082,54,56],
	"vassal vassal_suffolk": [1156,1024,54,56],
	"vassal vassal_fauconberg": [1094,1279,54,56],
	"vassal vassal_norfolk": [850,1330,54,56],
	"vassal vassal_devon": [406,1381,54,56],
	"vassal vassal_bonville": [155,1356,54,56],
	"seat lancaster lord_henry_vi": [944,1144,54,56],
	"seat lancaster lord_margaret": [944,1144,54,56],
	"seat lancaster lord_henry_tudor": [944,1144,54,56],
	"seat york lord_richard_iii": [944,1169,54,56],
	"seat york lord_edward_iv": [944,1169,54,56],
	"seat york lord_gloucester_2": [944,1169,54,56],
	"seat york lord_gloucester_1": [620,1061,54,56],
	"seat york lord_salisbury": [653,617,54,56],
	"seat lancaster lord_clarence": [654,593,54,56],
	"seat lancaster lord_northumberland_l": [397,405,54,56],
	"vassal vassal_beaumont": [730,765,54,56],
	"seat lancaster lord_buckingham": [715,958,54,56],
	"seat york lord_march": [432,947,54,56],
	"seat lancaster lord_jasper_tudor_2": [230,888,54,56],
	"seat lancaster lord_jasper_tudor_1": [147,1067,54,56],
	"seat lancaster lord_oxford": [771,1092,54,56],
	"seat york lord_rutland": [1113,1181,54,56],
	"seat lancaster lord_warwick_l": [1118,1385,54,56],
	"seat lancaster lord_exeter_1": [405,1391,54,56],
	"seat lancaster lord_exeter_2": [405,1391,54,56],
	"seat york lord_devon": [313,1340,54,56],
	"seat york lord_pembroke": [145,1108,54,56],
	"seat lancaster lord_somerset_1": [453,1248,54,56],
	"seat lancaster lord_somerset_2": [453,1248,54,56],
	"seat york lord_norfolk": [850,1330,54,56],
	"seat york lord_northumberland_y1": [397,405,54,56],
	"seat york lord_northumberland_y2": [397,405,54,56],
	"seat york lord_warwick_y": [1118,1385,54,56],
	"Ireland favour": [50,947,110,121],
	"seat york lord_york": [904,930,54,56],
}



let data = []
function print(str) {
	data.push(str)
}

var locmap = {}

// 0=offmap, 1-N=map locales, 100-M=calendar boxes
var locales = []
var ways = []
var deplete = []
var favour = []
var seat = []
var vassalbox = []
const scale = 1

var is = { stronghold: [] }

function defloc(region, type, name) {
	let [x, y, w, h] = boxes[name]
	x = Math.floor(x)
	y = Math.floor(y)
	w = Math.ceil(w)
	h = Math.ceil(h)
	locmap[name] = locales.length
	let id = locales.length
	locales.push({ name, type, region, adjacent: [], highways: [], roads: [], paths: [], not_paths: [], box:{x,y,w,h} })
	if (!is[type]) is[type] = []
	is[type].push(id)
	if (region) {
		if (!is[region]) is[region] = []
		is[region].push(id)
		is.stronghold.push(id)
	}
	ways.push([])
}

function defdepleted(name) {
	let [x, y, w, h] = boxes[name]
	x = Math.floor(x)
	y = Math.floor(y)
	w = Math.ceil(w)
	h = Math.ceil(h)
	locmap[name] = locales.length
	deplete.push({ name, box: { x, y, w, h } })
}

function deffavour(name) {
	let [x, y, w, h] = boxes[name]
	x = Math.floor(x)
	y = Math.floor(y)
	w = Math.ceil(w)
	h = Math.ceil(h)
	locmap[name] = locales.length
	favour.push({ name, box: { x, y, w, h } })
}

function defseat(name) {
	let [x, y, w, h] = boxes[name]
	x = Math.floor(x)
	y = Math.floor(y)
	w = Math.ceil(w)
	h = Math.ceil(h)
	locmap[name] = locales.length
	seat.push({ name, box: { x, y, w, h } })
}

function defvassal(name) {
	let [x, y, w, h] = boxes[name]
	x = Math.floor(x)
	y = Math.floor(y)
	w = Math.ceil(w)
	h = Math.ceil(h)
	locmap[name] = locales.length
	vassalbox.push({ name, box: { x, y, w, h } })
}


function defway(type, aname, bname) {
	let aix = locmap[aname]
	let bix = locmap[bname]
	if (aix > bix) {
		let tmp = aix
		aix = bix
		bix = tmp
	}

	let a = locales[aix]
	let b = locales[bix]

	map_set(ways[aix], bix, type)
	map_set(ways[bix], aix, type)

	locales[aix].adjacent.push(bix)
	locales[bix].adjacent.push(aix)

	if (type === "highway") {
		locales[aix].highways.push(bix)
		locales[bix].highways.push(aix)
	}
	if (type === "road") {
		locales[aix].roads.push(bix)
		locales[bix].roads.push(aix)
	}
	if (type === "path") {
		locales[aix].paths.push(bix)
		locales[bix].paths.push(aix)
	} else {
		locales[aix].not_paths.push(bix)
		locales[bix].not_paths.push(aix)
	}
}

function highway(a,b) { return defway('highway', a, b) }
function road(a,b) { return defway('road', a, b) }
function path(a,b) { return defway('path', a, b) }


// LOCALES
defloc("North", "fortress", "Bamburgh")
defloc("North", "city", "Newcastle")
defloc("North", "town", "Appleby")
defloc("North", "town", "Hexham")
defloc("North", "city", "Carlisle")


defloc("Wales", "harlech", "Harlech")
defloc("Wales", "fortress", "Pembroke")
defloc("Wales", "city", "Cardiff")
defloc("Wales", "city", "Hereford")
defloc("Wales", "fortress", "Ludlow")
defloc("Wales", "city", "Shrewsbury")

defloc("South", "city", "Salisbury")
defloc("South", "city", "Winchester")
defloc("South", "city", "Guildford")
defloc("South", "town", "Arundel")
defloc("South", "town", "Southampton")
defloc("South", "city", "Rochester")
defloc("South", "town", "Dover")
defloc("South", "city", "Canterbury")
defloc("South", "town", "Hastings")

defloc("England", "town", "Dorchester")
defloc("England", "city", "Exeter")
defloc("England", "town", "Plymouth")
defloc("England", "city", "Launceston")
defloc("England", "town", "Truro")
defloc("England", "city", "Wells")
defloc("England", "city", "Bristol")
defloc("England", "city", "Gloucester")
defloc("England", "city", "Oxford")
defloc("England", "town", "Newbury")
defloc("England", "london", "London")
defloc("England", "town", "St Albans")
defloc("England", "town", "Bedford")
defloc("England", "town", "Cambridge")
defloc("England", "town", "Bury St Edmunds")
defloc("England", "town", "Ipswich")
defloc("England", "city", "Norwich")
defloc("England", "fortress", "Lynn")
defloc("England", "city", "Ely")
defloc("England", "city", "Peterborough")
defloc("England", "town", "Northampton")
defloc("England", "city", "Coventry")
defloc("England", "town", "Leicester")
defloc("England", "city", "Lichfield")
defloc("England", "town", "Derby")
defloc("England", "town", "Nottingham")
defloc("England", "city", "Worcester")
defloc("England", "city", "Chester")
defloc("England", "town", "Lancaster")
defloc("England", "city", "Lincoln")
defloc("England", "city", "York")
defloc("England", "calais", "Calais")

defloc(null, "exile_box", "France")
defloc(null, "exile_box", "Scotland")
defloc(null, "exile_box", "Ireland")
defloc(null, "exile_box", "Burgundy")

defloc("North", "town", "Scarborough")
defloc("England", "fortress", "Ravenspur")

defloc(null, "sea", "English Channel")
defloc(null, "sea", "Irish Sea")
defloc(null, "sea", "North Sea")

// LOCALE DEPLETION

defdepleted("Bamburgh deplete")
defdepleted("Newcastle deplete")
defdepleted("Appleby deplete")
defdepleted("Hexham deplete")
defdepleted("Carlisle deplete")


defdepleted("Harlech deplete")
defdepleted("Pembroke deplete")
defdepleted("Cardiff deplete")
defdepleted("Hereford deplete")
defdepleted("Ludlow deplete")
defdepleted("Shrewsbury deplete")

defdepleted("Salisbury deplete")
defdepleted("Winchester deplete")
defdepleted("Guildford deplete")
defdepleted("Arundel deplete")
defdepleted("Southampton deplete")
defdepleted("Rochester deplete")
defdepleted("Dover deplete")
defdepleted("Canterbury deplete")
defdepleted("Hastings deplete")

defdepleted("Dorchester deplete")
defdepleted("Exeter deplete")
defdepleted("Plymouth deplete")
defdepleted("Launceston deplete")
defdepleted("Truro deplete")
defdepleted("Wells deplete")
defdepleted("Bristol deplete")
defdepleted("Gloucester deplete")
defdepleted("Oxford deplete")
defdepleted("Newbury deplete")
defdepleted("London deplete")
defdepleted("St Albans deplete")
defdepleted("Bedford deplete")
defdepleted("Cambridge deplete")
defdepleted("Bury St Edmunds deplete")
defdepleted("Ipswich deplete")
defdepleted("Norwich deplete")
defdepleted("Lynn deplete")
defdepleted("Ely deplete")
defdepleted("Peterborough deplete")
defdepleted("Northampton deplete")
defdepleted("Coventry deplete")
defdepleted("Leicester deplete")
defdepleted("Lichfield deplete")
defdepleted("Derby deplete")
defdepleted("Nottingham deplete")
defdepleted("Worcester deplete")
defdepleted("Chester deplete")
defdepleted("Lancaster deplete")
defdepleted("Lincoln deplete")
defdepleted("York deplete")
defdepleted("Calais deplete")
defdepleted("France deplete")
defdepleted("Scotland deplete")
defdepleted("Ireland deplete")
defdepleted("Burgundy deplete")
defdepleted("Scarborough deplete")
defdepleted("Ravenspur deplete")

// LOCALE FAVOUR

deffavour("Bamburgh favour")
deffavour("Newcastle favour")
deffavour("Appleby favour")
deffavour("Hexham favour")
deffavour("Carlisle favour")
deffavour("Harlech favour")
deffavour("Pembroke favour")
deffavour("Cardiff favour")
deffavour("Hereford favour")
deffavour("Ludlow favour")
deffavour("Shrewsbury favour")
deffavour("Salisbury favour")
deffavour("Winchester favour")
deffavour("Guildford favour")
deffavour("Arundel favour")
deffavour("Southampton favour")
deffavour("Rochester favour")
deffavour("Dover favour")
deffavour("Canterbury favour")
deffavour("Hastings favour")
deffavour("Dorchester favour")
deffavour("Exeter favour")
deffavour("Plymouth favour")
deffavour("Launceston favour")
deffavour("Truro favour")
deffavour("Wells favour")
deffavour("Bristol favour")
deffavour("Gloucester favour")
deffavour("Oxford favour")
deffavour("Newbury favour")
deffavour("London favour")
deffavour("St Albans favour")
deffavour("Bedford favour")
deffavour("Cambridge favour")
deffavour("Bury St Edmunds favour")
deffavour("Ipswich favour")
deffavour("Norwich favour")
deffavour("Lynn favour")
deffavour("Ely favour")
deffavour("Peterborough favour")
deffavour("Northampton favour")
deffavour("Coventry favour")
deffavour("Leicester favour")
deffavour("Lichfield favour")
deffavour("Derby favour")
deffavour("Nottingham favour")
deffavour("Worcester favour")
deffavour("Chester favour")
deffavour("Lancaster favour")
deffavour("Lincoln favour")
deffavour("York favour")
deffavour("Calais favour")
deffavour("France favour")
deffavour("Scotland favour")
deffavour("Ireland favour")
deffavour("Burgundy favour")
deffavour("Scarborough favour")
deffavour("Ravenspur favour")

//LOCALE SEAT
defseat("seat york lord_york")
defseat("seat york lord_march")
defseat("seat york lord_edward_iv")
defseat("seat york lord_salisbury")
defseat("seat york lord_rutland")
defseat("seat york lord_pembroke")
defseat("seat york lord_devon")
defseat("seat york lord_northumberland_y1")
defseat("seat york lord_northumberland_y2")
defseat("seat york lord_gloucester_1")
defseat("seat york lord_gloucester_2")
defseat("seat york lord_richard_iii")
defseat("seat york lord_norfolk")
defseat("seat york lord_warwick_y")
defseat("seat lancaster lord_henry_vi")
defseat("seat lancaster lord_margaret")
defseat("seat lancaster lord_somerset_1")
defseat("seat lancaster lord_somerset_2")
defseat("seat lancaster lord_exeter_1")
defseat("seat lancaster lord_exeter_2")
defseat("seat lancaster lord_buckingham")
defseat("seat lancaster lord_northumberland_l")
defseat("seat lancaster lord_clarence")
defseat("seat lancaster lord_jasper_tudor_1")
defseat("seat lancaster lord_jasper_tudor_2")
defseat("seat lancaster lord_henry_tudor")
defseat("seat lancaster lord_oxford")
defseat("seat lancaster lord_warwick_l")


// VASSAL SEAT

defvassal("vassal vassal_westmoreland")
defvassal("vassal vassal_stanley")
defvassal("vassal vassal_dudley")
defvassal("vassal vassal_shrewsbury")
defvassal("vassal vassal_worcester")
defvassal("vassal vassal_oxford")
defvassal("vassal vassal_essex")
defvassal("vassal vassal_suffolk")
defvassal("vassal vassal_fauconberg")
defvassal("vassal vassal_norfolk")
defvassal("vassal vassal_devon")
defvassal("vassal vassal_bonville")
defvassal("vassal vassal_beaumont")

//WAYS BETWEEN LOCALES

highway("Bamburgh", "Newcastle")
highway("Newcastle", "York")
highway("York", "Lincoln")
highway("Lincoln", "Peterborough")
highway("Peterborough", "Ely")
highway("Nottingham", "Leicester")
highway("Leicester", "Northampton")
highway("Bedford", "St Albans")
highway("St Albans", "Cambridge")
highway("St Albans", "London")
highway("London", "Oxford")
highway("Oxford", "Gloucester")
highway("Gloucester", "Hereford")
highway("Gloucester", "Worcester")
highway("Hereford", "Ludlow")
highway("Gloucester", "Bristol")
highway("London", "Guildford")
highway("Guildford", "Winchester")
highway("Exeter", "Wells")
highway("Winchester", "Salisbury")
highway("Salisbury", "Wells")
highway("Cambridge", "Ely")
highway("Northampton", "Bedford")


road("Gloucester", "Cardiff")
road("Newbury", "Oxford")
road("Rochester", "Hastings")
road("Hexham", "Carlisle")
road("Hexham", "Newcastle")
road("Appleby", "Carlisle")
road("Appleby", "Newcastle")
road("Lincoln", "Nottingham")
road("Nottingham", "Derby")
road("Chester", "Shrewsbury")
road("Shrewsbury", "Lichfield")
road("Lichfield", "Leicester")
road("Lichfield", "Coventry")
road("Leicester", "Peterborough")
road("Ely", "Lynn")
road("Ely", "Bury St Edmunds")
road("Bury St Edmunds", "Norwich")
road("Norwich", "Lynn")
road("Norwich", "Ipswich")
road("Ipswich", "Bury St Edmunds")
road("Ipswich", "St Albans")
road("Bury St Edmunds", "Cambridge")
road("Cambridge", "Bedford")
road("Peterborough", "Northampton")
road("Northampton", "Coventry")
road("Northampton", "Oxford")
road("Lichfield", "Worcester")
road("Shrewsbury", "Ludlow")
road("Ludlow", "Worcester")
road("London", "Rochester")
road("Rochester", "Canterbury")
road("Canterbury", "Dover")
road("Dover", "Hastings")
road("Hastings", "Arundel")
road("Arundel", "Southampton")
road("Southampton", "Winchester")
road("Southampton", "Salisbury")
road("Salisbury", "Newbury")
road("Salisbury", "Dorchester")
road("Dorchester", "Wells")
road("Dorchester", "Exeter")
road("Wells", "Bristol")
road("Exeter", "Launceston")
road("Plymouth", "Launceston")
road("Exeter", "Plymouth")
road("Plymouth", "Truro")
road("Truro", "Launceston")
road("Derby", "Lichfield")
path("Appleby", "Lancaster")
path("Lancaster", "Chester")
path("Chester", "York")
path("Chester", "Harlech")
path("Harlech", "Pembroke")
path("Pembroke", "Cardiff")

road("Newcastle", "Scarborough")
road("Scarborough", "York")
road("York", "Ravenspur")
road("Ravenspur", "Lincoln")

// one-way road from Scotland to Bamburgh
locales[locmap.Scotland].paths.push(locmap.Bamburgh)
map_set(ways[locmap.Scotland], locmap.Bamburgh, "path")

// one-way road from Scotland to Carlisle
locales[locmap.Scotland].paths.push(locmap.Carlisle)
map_set(ways[locmap.Scotland], locmap.Carlisle, "path")

let sea_1 = locmap["North Sea"]
let sea_2 = locmap["English Channel"]
let sea_3 = locmap["Irish Sea"]

let port_1 = ["Newcastle", "Scarborough", "Ravenspur", "Lynn", "Ipswich"].map(name => locmap[name]).sort(cmpnum)
let port_2 = ["Dover", "Hastings", "Calais", "Arundel", "Southampton", "Dorchester", "Exeter", "Plymouth", "Truro"].map(name => locmap[name]).sort(cmpnum)
let port_3 = ["Bristol","Pembroke","Harlech"].map(name => locmap[name]).sort(cmpnum)
let all_ports = [ ...port_1, ...port_2, ...port_3 ].sort(cmpnum)

let exile_1 = locmap["Burgundy"]
let exile_2 = locmap["France"]
let exile_3 = locmap["Ireland"]
let exile_4 = locmap["Scotland"]

let sail_sea_1 = [ ...port_1, ...port_2, sea_2 ].sort(cmpnum)
let sail_sea_2 = [ ...port_1, ...port_2, ...port_3, sea_1, sea_3 ].sort(cmpnum)
let sail_sea_3 = [ ...port_2, ...port_3, sea_2 ].sort(cmpnum)

let sail_exile_1 = [ sea_1, ...port_1 ]
let sail_exile_2 = [ sea_2, ...port_2 ]
let sail_exile_3 = [ sea_3, ...port_3 ]
let sail_exile_4 = [ sea_1, ...port_1 ]

let sail_port_1 = [ sea_1, ...port_1 ]
let sail_port_2 = [ sea_2, ...port_2 ]
let sail_port_3 = [ sea_3, ...port_3 ]

function dumplist(name, list) {
	print(name + ":[")
	for (let item of list)
		print(JSON.stringify(item) + ",")
	print("],")
}

locales.forEach(loc => {
	loc.adjacent.sort(cmpnum)
	loc.highways.sort(cmpnum)
	loc.roads.sort(cmpnum)
	loc.paths.sort(cmpnum)
	loc.not_paths.sort(cmpnum)
})

let lords = [

	{
		side: "York",
		name: "York",
		short_name: "York",
		full_name: "Richard Plantagenet",
		title: "Duke of York",
		seat: locmap["Ely"],
		marshal:2,
		influence:5,
		lordship:3,
		command:2,
		valour:2,
		forces: {
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2
		},
		assets: {
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,

	},

	{
		side: "York",
		name: "March",
		short_name: "March",
		full_name:"Edward Plantagenet",
		title:"Earl of March",
		seat: locmap["Ludlow"],
		marshal:0,
		influence:2,
		lordship:2,
		command:2,
		valour:3,
		forces:{
			retinue:1,
			men_at_arms:1,
			longbowmen:2,
			militia:1
		},
		assets:{
			cart:1,
			prov:1,
			coin:1,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Edward IV",
		short_name: "Edward IV",
		full_name: "Edward Plantagenet",
		title: "King of England",
		seat: locmap["London"],
		marshal:2,
		influence:5,
		lordship:3,
		command:2,
		valour:4,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Salisbury",
		short_name: "Salisbury",
		full_name: "Richard Neville",
		title: "Earl of Salisbury",
		seat: locmap["York"],
		marshal:0,
		influence:3,
		lordship:3,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2
		},
		assets:{
			cart:1,
			prov:1,
			coin:1,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Rutland",
		short_name: "Rutland",
		full_name: "Edmund Plantagenet",
		title: "Earl of Rutland",
		seat: locmap["Canterbury"],
		marshal:0,
		influence:2,
		lordship:2,
		command:1,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:1,
			longbowmen:2,
			militia:1
		},
		assets:{
			cart:1,
			prov:1,
			coin:1,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Pembroke",
		short_name: "Pembroke",
		full_name: "William Herbert",
		title: "Earl of Pembroke",
		seat: locmap["Pembroke"],
		marshal:0,
		influence:2,
		lordship:2,
		command:2,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:1,
			longbowmen:3,
			militia:2},
		assets:{
			cart:1,
			prov:1,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Devon",
		short_name: "Devon",
		full_name: "Humpfrey Stafford",
		title: "Earl of Devon",
		seat: locmap["Exeter"],
		marshal:0,
		influence:4,
		lordship:2,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:1,
			longbowmen:2,
			militia:1
		},
		assets:{
			cart:1,
			prov:1,
			coin:1,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Northumberland Y1",
		short_name: "Northumberland",
		full_name: "Henry Percy",
		title: "Northumberland",
		seat: locmap["Carlisle"],
		marshal:0,
		influence:4,
		lordship:2,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:4
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Northumberland Y2",
		short_name: "Northumberland",
		full_name: "Henry Percy",
		title: "Northumberland",
		seat: locmap["Carlisle"],
		marshal:0,
		influence:4,
		lordship:2,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Gloucester 1",
		short_name: "Gloucester",
		full_name: "Richard Plantagenet",
		title: "Duke of Gloucester",
		seat: locmap["Gloucester"],
		marshal:1,
		influence:2,
		lordship:2,
		command:3,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
		},
		assets:{
			cart:1,
			prov:1,
			coin:1,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Gloucester 2",
		short_name: "Gloucester",
		full_name: "Richard Plantagenet",
		title: "Duke of Gloucester",
		seat: locmap["Gloucester"],
		marshal:1,
		influence:5,
		lordship:3,
		command:3,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:3,
			longbowmen:3,
			militia:4,
		},
		assets:{
			cart:2,
			prov:2,
			coin:4,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Richard III",
		short_name: "Richard III",
		full_name: "Richard Plantagenet",
		title: "King of England",
		seat: locmap["London"],
		marshal:2,
		influence:5,
		lordship:3,
		command:3,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:3,
			longbowmen:2,
			militia:4
		},
		assets:{
			cart:2,
			prov:2,
			coin:4,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Norfolk",
		short_name: "Norfolk",
		full_name: "John Howard",
		title: "Duke of Norfolk",
		seat: locmap["Arundel"],
		marshal:0,
		influence:3,
		lordship:3,
		command:2,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2,
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "York",
		name: "Warwick Y",
		short_name: "Warwick",
		full_name: "Richard Neville",
		title: "Earl of Warwick",
		seat: locmap["Calais"],
		marshal:1,
		influence:5,
		lordship:3,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:3,
			longbowmen:3,
		},
		assets:{
			prov:2,
			coin:2,
		},
		ships:2,
	},

	{
		side: "Lancaster",
		name: "Henry VI",
		short_name: "Henry VI",
		full_name: "Henry VI",
		title: "King of England",
		seat: locmap["London"],
		marshal:2,
		influence:5,
		lordship:2,
		command:2,
		valour:0,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:4
		},
		assets:{
			cart:2,
			prov:2,
			coin:4,
		},
		ships: 0,
	},

	{
		side: "Lancaster",
		name: "Margaret",
		short_name: "Margaret",
		full_name: "Margaret d'Anjou",
		title: "Queen of England",
		seat: locmap["London"],
		marshal:2,
		influence:4,
		lordship:2,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:3,
			longbowmen:3
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 2,
	},

	{
		side: "Lancaster",
		name: "Somerset 1",
		short_name: "Somerset",
		full_name: "Henry Beaufort",
		title: "Duke of Somerset",
		seat: locmap["Wells"],
		marshal:2,
		influence:5,
		lordship:2,
		command:2,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
		},
		assets:{
			cart:2,
			prov:2,
			coin:1,
		},
		ships: 0,
	},

	{
		side: "Lancaster",
		name: "Somerset 2",
		short_name: "Somerset",
		full_name: "Edmund Beaufort",
		title: "Duke of Somerset",
		seat: locmap["Wells"],
		marshal:0,
		influence:3,
		lordship:2,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "Lancaster",
		name: "Exeter 1",
		short_name: "Exeter",
		full_name: "Henry Holland",
		title: "Duke of Exeter",
		seat: locmap["Exeter"],
		marshal:0,
		influence:2,
		lordship:1,
		command:2,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
		},
		assets:{
			cart:1,
			prov:1,
			coin:1,
		},
		ships: 0,
	},

	{
		side: "Lancaster",
		name: "Exeter 2",
		short_name: "Exeter",
		full_name: "Henry Holland",
		title: "Duke of Exeter",
		seat: locmap["Exeter"],
		marshal:0,
		influence:2,
		lordship:1,
		command:2,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2,
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},
	{
		side: "Lancaster",
		name: "Buckingham",
		short_name: "Buckingham",
		full_name: "Humphrey Stafford",
		title: "Duke of Buckingham",
		seat: locmap["Coventry"],
		marshal:0,
		influence:3,
		lordship:3,
		command:1,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:1,
			longbowmen:2,
			militia:1
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},
	{
		side: "Lancaster",
		name: "Northumberland L",
		short_name: "Northumberland",
		full_name: "Henry Percy",
		title: "Earl of Northumberland",
		seat: locmap["Carlisle"],
		marshal:0,
		influence:4,
		lordship:2,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2
		},
		assets:{
			cart:2,
			prov:2,
			coin:1,
		},
		ships: 0,
	},

	{
		side: "Lancaster",
		name: "Clarence",
		short_name: "Clarence",
		full_name: "George Plantagenet",
		title: "Duke of Clarence",
		seat: locmap["York"],
		marshal:0,
		influence:1,
		lordship:2,
		command:1,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2
		},
		assets:{
			cart:1,
			prov:2,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "Lancaster",
		name: "Jasper Tudor 1",
		short_name: "Jasper Tudor",
		full_name: "Jasper Tudor",
		title: "Earl of Pembroke",
		seat: locmap["Harlech"],
		marshal:0,
		influence:2,
		lordship:2,
		command:3,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:3,
			militia:1},
		assets:{
			cart:1,
			prov:2,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "Lancaster",
		name: "Jasper Tudor 2",
		short_name: "Jasper Tudor",
		full_name: "Jasper Tudor",
		title: "Earl of Pembroke",
		seat: locmap["Pembroke"],
		marshal:0,
		influence:2,
		lordship:3,
		command:3,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:3,
			longbowmen:3,
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},
	{
		side: "Lancaster",
		name: "Henry Tudor",
		short_name: "Henry Tudor",
		full_name: "Henry Tudor",
		title: "",
		seat: locmap["London"],
		marshal:2,
		influence:5,
		lordship:2,
		command:2,
		valour:1,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2
		},
		assets:{
			cart:2,
			prov:2,
			coin:4,
		},
		ships:2,
	},

	{
		side: "Lancaster",
		name: "Oxford",
		short_name: "Oxford",
		full_name: "John de Vere",
		title: "Earl of Oxford",
		seat: locmap["Oxford"],
		marshal:0,
		influence:2,
		lordship:2,
		command:2,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:2,
			longbowmen:2,
			militia:2
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships: 0,
	},

	{
		side: "Lancaster",
		name: "Warwick L",
		short_name: "Warwick",
		full_name: "Richard Neville",
		title: "Earl of Warwick",
		seat: locmap["Calais"],
		marshal:1,
		influence:5,
		lordship:3,
		command:2,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:3,
			longbowmen:3,
		},
		assets:{
			cart:2,
			prov:2,
			coin:2,
		},
		ships:2,
	},

]

let AOW = {}
let cards = []

function arts_of_war_event(name, event, when) {
	let c = { name, event, roses: 0, when, capability: null, lords: null }
	cards.push(c)
	AOW[name] = c
}

function arts_of_war_capability(name, capability, lord_names) {
	AOW[name].capability = capability
	if (lord_names === "ALL") {
		AOW[name].lords = null
	}
	else if (lord_names === "any") {
		let side = name[0] === 'Y' ? "York" : "Lancaster"
		lord_names = lords.filter(l => l.side === side).map(l => l.name)
		AOW[name].lords = lord_names.map(n => lords.findIndex(l => l.name === n)).sort(cmpnum)
	}
	else if (Array.isArray(lord_names)) {
		AOW[name].lords = lord_names.map(n => lords.findIndex(l => l.name === n)).sort(cmpnum)
	}
}

function arts_of_war_roses(roses, side, a, b) {
	for (let n = a; n <= b; ++n)
		AOW[side + n].roses = roses
}

arts_of_war_event("Y1", "Leeward Battle Line", "hold")
arts_of_war_event("Y2", "Flank Attack", "hold")
arts_of_war_event("Y3", "Escape Ship", "hold")
arts_of_war_event("Y4", "Jack Cade", "this_levy")
arts_of_war_event("Y5", "Suspicion", "hold")
arts_of_war_event("Y6", "Seamanship", "this_campaign")
arts_of_war_event("Y7", "Yorkists Block Parliament", "this_levy")
arts_of_war_event("Y8", "Exile Pact", "this_campaign")
arts_of_war_event("Y9", "Escape Ship", "hold")
arts_of_war_event("Y10", "Tax Collectors", "now")
arts_of_war_event("Y11", "Blocked Ford", "hold")
arts_of_war_event("Y12", "Parliament's Truce", "hold")
arts_of_war_event("Y13", "Aspielles", "hold")
arts_of_war_event("Y14", "Richard of York", "this_levy")
arts_of_war_event("Y15", "London for York", "now")
arts_of_war_event("Y16", "The Commons", "this_levy")
arts_of_war_event("Y17", "She-Wolf of France", "now")
arts_of_war_event("Y18", "Succession", "this_levy")
arts_of_war_event("Y19", "Caltrops", "hold")
arts_of_war_event("Y20", "Yorkist Parade", "hold")
arts_of_war_event("Y21", "Sir Richard Leigh", "now")
arts_of_war_event("Y22", "Loyalty and Trust", "this_levy")
arts_of_war_event("Y23", "Charles the Bold", "now")
arts_of_war_event("Y24", "Sun in Splendour", "hold")
arts_of_war_event("Y25", "Owain Glyndwr", "this_campaign")
arts_of_war_event("Y26", "Dubious Clarence", "now")
arts_of_war_event("Y27", "Yorkist North", "now")
arts_of_war_event("Y28", "Gloucester as heir", "this_levy")
arts_of_war_event("Y29", "Dorset", "this_campaign")
arts_of_war_event("Y30", "Regroup", "hold")
arts_of_war_event("Y31", "Earl Rivers", "now")
arts_of_war_event("Y32", "The King's Name", "this_levy")
arts_of_war_event("Y33", "Edward V", "this_levy")
arts_of_war_event("Y34", "An honest tale speeds best", "this_campaign")
arts_of_war_event("Y35", "Privy Council", "this_levy")
arts_of_war_event("Y36", "Swift Maneuver", "hold")
arts_of_war_event("Y37", "Patrick de la Mote", "hold")

arts_of_war_capability("Y1", "Culverins and falconets", "any")
arts_of_war_capability("Y2", "Culverins and falconets", "any")
arts_of_war_capability("Y3", "Muster'd my solders", "any")
arts_of_war_capability("Y4", "We done deeds of charity", "any")
arts_of_war_capability("Y5", "Thomas Bourchier", "any")
arts_of_war_capability("Y6", "Great Ships", "any")
arts_of_war_capability("Y7", "Harbingers", "any")
arts_of_war_capability("Y8", "England is my home", "any")
arts_of_war_capability("Y9", "Barricades", "any")
arts_of_war_capability("Y10", "Agitators", "any")
arts_of_war_capability("Y11", "Yorkists Never Wait", "any")
arts_of_war_capability("Y12", "Soldiers of Fortune", "any")
arts_of_war_capability("Y13", "Scourers", "any",)
arts_of_war_capability("Y14", "Burgundians", ["York", "March"])
arts_of_war_capability("Y15", "Naval Blockade", ["Warwick Y"])
arts_of_war_capability("Y16", "Beloved Warwick",  ["Warwick Y"])
arts_of_war_capability("Y17", "Alice Montagu",  ["Salisbury"])
arts_of_war_capability("Y18", "Irishmen", ["York", "Rutland"])
arts_of_war_capability("Y19", "Welshmen",  ["York", "March"])
arts_of_war_capability("Y20", "York's favoured Son", ["March","Rutland"])
arts_of_war_capability("Y21", "Southerners", ["York", "March", "Rutland"])
arts_of_war_capability("Y22", "fair Arbiter", ["Salisbury"])
arts_of_war_capability("Y23", "Burgundians", ["Edward IV", "Gloucester 1", "Gloucester 2", "Richard III"])
arts_of_war_capability("Y24", "Hastings", ["Edward IV"])
arts_of_war_capability("Y25", "Pembroke", ["Pembroke"])
arts_of_war_capability("Y26", "Fallen Brother", ["Gloucester 1", "Gloucester 2", "Richard III"])
arts_of_war_capability("Y27", "Percy's North", ["Northumberland Y1","Northumberland Y2"])
arts_of_war_capability("Y28", "First Son", ["Edward IV"])
arts_of_war_capability("Y29", "Stafford Branch", ["Devon"])
arts_of_war_capability("Y30", "Captain", ["Devon", "Pembroke"])
arts_of_war_capability("Y31", "Woodvilles", ["Edward IV", "Devon", "Gloucester 1", "Gloucester 2", "Richard III"])
arts_of_war_capability("Y32", "Final Charge", ["Richard III"])
arts_of_war_capability("Y33", "Bloody thou art, bloody will be thy end", ["Richard III"])
arts_of_war_capability("Y34", "So wise, so young", ["Gloucester 1", "Gloucester 2"] )
arts_of_war_capability("Y35", "Kingdom United", ["Gloucester 1", "Gloucester 2"] )
arts_of_war_capability("Y36", "Vanguard", ["Norfolk"])
arts_of_war_capability("Y37", "Percy's North", ["Northumberland Y1", "Northumberland Y2"])

arts_of_war_roses(1, "Y", 14, 22)
arts_of_war_roses(2, "Y", 23, 31)
arts_of_war_roses(3, "Y", 32, 37)

arts_of_war_event("L1", "Leeward Battle Line", "hold")
arts_of_war_event("L2", "Flank Attack", "hold")
arts_of_war_event("L3", "Escape Ship", "hold")
arts_of_war_event("L4", "Be sent for", "this_levy")
arts_of_war_event("L5", "Suspicion", "hold")
arts_of_war_event("L6", "Seamanship", "this_campaign")
arts_of_war_event("L7", "For trust not him", "hold")
arts_of_war_event("L8", "Forced Marches", "this_campaign")
arts_of_war_event("L9", "Rising Wages", "this_levy")
arts_of_war_event("L10", "New Act of Parliament", "this_campaign")
arts_of_war_event("L11", "Blocked Ford", "hold")
arts_of_war_event("L12", "Ravine", "hold")
arts_of_war_event("L13", "Aspielles", "hold")
arts_of_war_event("L14", "Scots", "now")
arts_of_war_event("L15", "Henry Pressures Parliament", "now")
arts_of_war_event("L16", "Warden of the Marches", "hold")
arts_of_war_event("L17", "My crown is in my heart", "this_levy")
arts_of_war_event("L18", "Parliament Votes", "this_levy")
arts_of_war_event("L19", "Henry’s Proclamation", "now")
arts_of_war_event("L20", "Parliament Truce", "hold")
arts_of_war_event("L21", "French Fleet", "this_campaign")
arts_of_war_event("L22", "French Troops", "now")
arts_of_war_event("L23", "Warwick’s Propaganda", "now")
arts_of_war_event("L24", "Warwick’s Propaganda", "now")
arts_of_war_event("L25", "Welsh Rebellion", "now")
arts_of_war_event("L26", "Henry Released", "now")
arts_of_war_event("L27", "L’Universelle Aragne", "now")
arts_of_war_event("L28", "Rebel Supply Depot", "hold")
arts_of_war_event("L29", "To wilful disobedience", "now")
arts_of_war_event("L30", "French War Loans", "now")
arts_of_war_event("L31", "Robin’s Rebellion", "now")
arts_of_war_event("L32", "Tudor Banners", "now")
arts_of_war_event("L33", "Surprise Landing", "hold")
arts_of_war_event("L34", "Buckingham’s Plot", "this_levy")
arts_of_war_event("L35", "Margaret Beaufort", "this_levy")
arts_of_war_event("L36", "Talbot to the Rescue", "hold")
arts_of_war_event("L37", "The Earl of Richmond", "this_levy")

arts_of_war_capability("L1", "Culverins and falconets", "any")
arts_of_war_capability("L2", "Culverins and falconets", "any")
arts_of_war_capability("L3", "Muster’d my soldiers", "any")
arts_of_war_capability("L4", "Heralds", "any")
arts_of_war_capability("L5", "Church Blessing", "any")
arts_of_war_capability("L6", "Great Ships", "any")
arts_of_war_capability("L7", "Harbingers", "any")
arts_of_war_capability("L8", "Hay Wains", "any")
arts_of_war_capability("L9", "Quartermasters", "any")
arts_of_war_capability("L10", "Chamberlains", "any")
arts_of_war_capability("L11", "In the Name of the King", "any")
arts_of_war_capability("L12", "Commission of Array", "any")
arts_of_war_capability("L13", "Expert Counsellors", "any",)
arts_of_war_capability("L14", "Percy’s Power", ["Northumberland L"])
arts_of_war_capability("L15", "King’s Parley", ["Henry VI"])
arts_of_war_capability("L16", "Northmen",  ["Northumberland L"])
arts_of_war_capability("L17", "Margaret",  ["Henry VI"])
arts_of_war_capability("L18", "Council Member", ["Exeter 1", "Exeter 2", "Somerset 1", "Somerset 2", "Buckingham"])
arts_of_war_capability("L19", "Andrew Trollope",  ["Exeter 1", "Exeter 2", "Somerset 1", "Somerset 2", "Buckingham"])
arts_of_war_capability("L20", "Veteran of French Wars", ["Exeter 1", "Exeter 2", "Somerset 1", "Somerset 2"])
arts_of_war_capability("L21", "My Father’s Blood", "any")
arts_of_war_capability("L22", "Stafford Estates", ["Buckingham"])
arts_of_war_capability("L23", "Montagu", ["Warwick L"])
arts_of_war_capability("L24", "Married to a Neville", ["Clarence"])
arts_of_war_capability("L25", "Welsh Lord", ["Jasper Tudor 1", "Jasper Tudor 2"])
arts_of_war_capability("L26", "Edward", ["Margaret"])
arts_of_war_capability("L27", "Barded Horse", ["Exeter 1", "Exeter 2", "Somerset 1", "Somerset 2", "Margaret"])
arts_of_war_capability("L28", "Loyal Somerset", ["Somerset 1", "Somerset 2"])
arts_of_war_capability("L29", "High Admiral", ["Exeter 1", "Exeter 2"])
arts_of_war_capability("L30", "Merchants", ["Warwick L"])
arts_of_war_capability("L31", "Yeomen of the Crown", ["Margaret"])
arts_of_war_capability("L32", "Two Roses", ["Henry Tudor"])
arts_of_war_capability("L33", "Philibert de Chandée", ["Oxford", "Henry Tudor"])
arts_of_war_capability("L34", "Piquiers", ["Oxford", "Henry Tudor"])
arts_of_war_capability("L35", "Thomas Stanley", ["Jasper Tudor 1", "Jasper Tudor 2", "Henry Tudor"] )
arts_of_war_capability("L36", "Chevaliers", ["Oxford", "Jasper Tudor 1", "Jasper Tudor 2", "Henry Tudor"])
arts_of_war_capability("L37", "Madame La Grande", ["Oxford", "Jasper Tudor 1", "Jasper Tudor 2", "Henry Tudor"])

arts_of_war_roses(1, "L", 14, 22)
arts_of_war_roses(2, "L", 23, 31)
arts_of_war_roses(3, "L", 32, 37)

let vassals = []
function vassal(service, name, seat, influence, capability) {
	vassals.push({service, name, seat, influence, capability })
}

lords.forEach(lord => {
	lord.id = "lord_" + clean_name(lord.name)
})

vassal(3, "Westmoreland", locmap["Appleby"], 0)
vassal(1, "Stanley", locmap["Derby"], 0)
vassal(1, "Dudley", locmap["Leicester"], 0)
vassal(2, "Shrewsbury", locmap["Shrewsbury"], -1)
vassal(3, "Worcester", locmap["Worcester"], 0)
vassal(2, "Oxford", locmap["Oxford"], 0)
vassal(1, "Essex", locmap["St Albans"], 0)
vassal(3, "Suffolk", locmap["Ipswich"], 1)
vassal(3, "Fauconberg", locmap["Dover"], 2)
vassal(1, "Norfolk", locmap["Arundel"], 0)
vassal(2, "Devon", locmap["Exeter"], -1)
vassal(1, "Bonville", locmap["Launceston"], 1)
vassal(1, "Beaumont", locmap["Lincoln"], -2)

vassal(0, "Trollope", -1, 0, "Andrew Trollope")
vassal(0, "Clifford", -1, 0, "My father's blood")
vassal(0, "Edward", -1, 0, "Edward")
vassal(0, "Thomas Stanley", -1, 0, "Thomas Stanley")
vassal(0, "Montagu", -1, 0, "Alice Montagu")
vassal(0, "Hastings", -1, 0, "Hastings")

function make_is_list(list) {
	let out = []
	for (let i = 0; i < locales.length + 35; ++i)
		out.push(list.includes(i) ? 1 : 0)
	return out
}

print("const data = {")

print("exile_1:" + JSON.stringify(exile_1) + ",")
print("exile_2:" + JSON.stringify(exile_2) + ",")
print("exile_3:" + JSON.stringify(exile_3) + ",")
print("exile_4:" + JSON.stringify(exile_4) + ",")
print("sea_1:" + JSON.stringify(sea_1) + ",")
print("sea_2:" + JSON.stringify(sea_2) + ",")
print("sea_3:" + JSON.stringify(sea_3) + ",")
print("port_1:" + JSON.stringify(port_1) + ",")
print("port_2:" + JSON.stringify(port_2) + ",")
print("port_3:" + JSON.stringify(port_3) + ",")
print("all_ports:" + JSON.stringify(all_ports) + ",")
print("sail_exile_1:" + JSON.stringify(sail_exile_1) + ",")
print("sail_exile_2:" + JSON.stringify(sail_exile_2) + ",")
print("sail_exile_3:" + JSON.stringify(sail_exile_3) + ",")
print("sail_exile_4:" + JSON.stringify(sail_exile_4) + ",")
print("sail_sea_1:" + JSON.stringify(sail_sea_1) + ",")
print("sail_sea_2:" + JSON.stringify(sail_sea_2) + ",")
print("sail_sea_3:" + JSON.stringify(sail_sea_3) + ",")
print("sail_port_1:" + JSON.stringify(sail_port_1) + ",")
print("sail_port_2:" + JSON.stringify(sail_port_2) + ",")
print("sail_port_3:" + JSON.stringify(sail_port_3) + ",")

dumplist("locales", locales)
dumplist("ways", ways)
dumplist("lords", lords)
dumplist("vassals", vassals)
dumplist("cards", cards)

// layout client only
dumplist("favour", favour)
dumplist("deplete",deplete)
dumplist("seat", seat)
dumplist("vassalbox", vassalbox)

print("}")

print("if (typeof module !== 'undefined') module.exports = data")

fs.writeFileSync("data.js", data.join("\n") + "\n")

function gen_test(name, set) {
	let ranges = []
	let start = -1
	for (let x = 0; x < locales.length; ++x) {
		if (set.includes(x)) {
			if (start < 0)
				start = x
		} else {
			if (start >= 0) {
				ranges.push([ start, x - 1 ])
				start = -1
			}
		}
	}
	if (start >= 0)
		ranges.push([ start, locales.length - 1 ])
	console.log("function " + name + "(x: Locale) { return " + ranges.map(([ a, b ]) => (a!==b) ?`(x >= ${a} && x <= ${b})` : `x === ${a}`).join(" || ") + " }")
}

gen_test("is_seaport", all_ports)
gen_test("is_port_1", port_1)
gen_test("is_port_2", port_2)
gen_test("is_port_3", port_3)
gen_test("is_adjacent_north_sea", port_1)
gen_test("is_adjacent_english_channel", port_2)
gen_test("is_adjacent_irish_sea", port_3)
for (let key in is)
	gen_test("is_" + key.toLowerCase(), is[key])
