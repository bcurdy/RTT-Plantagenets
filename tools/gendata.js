// Run this script inside the "tools" directory to generate data.js and build_counters3.sh

"use strict"

const fs = require('fs')

function cmpnum(a,b) { return a - b }
function cmpnum2(a,b) { return a[0] - b[0] }

function clean_name(name) {
	return name.toLowerCase().replaceAll("&", "and").replaceAll(" ", "_")
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
	"Appleby vassal": [602,466,54,56],
	"Derby vassal": [605,836,54,56],
	"Leicester vassal": [704,898,54,56],
	"Shrewsbury vassal": [453,881,54,56],
	"Worcester vassal": [616,999,54,56],
	"Oxford vassal": [776,1109,54,56],
	"St Albans vassal": [955,1082,54,56],
	"Ipswich vassal": [1156,1020,54,56],
	"Dover vassal": [1094,1279,54,56],
	"Arundel vassal": [850,1330,54,56],
	"Exeter vassal": [406,1381,54,56],
	"Launceston vassal": [146,1359,54,56],
	"Henry_VI seat": [944,1144,54,56],
	"Margaret seat": [944,1144,54,56],
	"Henry Tudor seat": [944,1144,54,56],
	"Edward_IV seat": [944,1169,54,56],
	"Richard_III seat": [944,1169,54,56],
	"Gloucester seat": [620,1061,54,56],
	"Salisbury seat": [653,617,54,56],
	"Clarence seat": [654,593,54,56],
	"Northumberland seat": [397,405,54,56],
	"Lincoln vassal": [726,763,54,56],
	"Buckingham seat": [715,958,54,56],
	"March seat": [432,947,54,56],
	"Jasper_Tudor1 seat": [230,888,54,56],
	"Jasper_Tudor2 seat": [147,1067,54,56],
	"Oxford seat": [771,1092,54,56],
	"Rutland seat": [1113,1181,54,56],
	"Warwick seat": [1118,1385,54,56],
	"Exeter seat": [405,1391,54,56],
	"Devon seat": [405,1391,54,56],
	"Pembroke seat": [145,1108,54,56],
	"Somerset seat": [453,1248,54,56],
	"Arundel seat": [850,1330,54,56],
}


let data = []
function print(str) {
	data.push(str)
}

var locmap = {}

// 0=offmap, 1-N=map locales, 100-M=calendar boxes
var locales = []
var ways = []
var highways = []
var roads = []
var paths = []

const scale = 1


 let strongholds = []

function defloc(region, stronghold, type, name) {
	let [x, y, w, h] = boxes[name]
	x = Math.floor(x)
	y = Math.floor(y)
	w = Math.ceil(w)
	h = Math.ceil(h)
	locmap[name] = locales.length
	if (stronghold > 0)
		strongholds.push(locales.length)
	locales.push({ name, type, stronghold, region, ways: [], box: { x, y, w, h } })

}
function defway(type, list) {
	let ix = ways.length
	list = list.map(name=>locmap[name]).sort(cmpnum)
	ways.push({type, locales: list})
	for (let from of list) {
		for (let to of list) {
			if (from !== to) {
				let old = locales[from].ways.find(w => w[0] === to)
				if (old)
					old.push(ix)
				else
					locales[from].ways.push([to, ix])
			}
		}
	}
	return ways[ix]
}

function highway(locs) { return defway('highway', locs.split(", ")) }
function road(locs) { return defway('road', locs.split(", ")) }
function path(locs) { return defway('path', locs.split(", ")) }

defloc("North", 1, "fortress", "Bamburgh")
defloc("North", 1, "city", "Newcastle")
defloc("North", 1, "town", "Appleby")
defloc("North", 1, "town", "Hexham")
defloc("North", 1, "town", "Carlisle")


defloc("Wales", 1, "harlech", "Harlech")
defloc("Wales", 1, "fortress", "Pembroke")
defloc("Wales", 1, "city", "Cardiff")
defloc("Wales", 1, "city", "Hereford")
defloc("Wales", 1, "fortress", "Ludlow")
defloc("Wales", 1, "city", "Shrewsbury")

defloc("South", 1, "city", "Salisbury")
defloc("South", 1, "city", "Winchester")
defloc("South", 1, "city", "Guildford")
defloc("South", 1, "town", "Arundel")
defloc("South", 1, "town", "Southampton")
defloc("South", 1, "city", "Rochester")
defloc("South", 1, "town", "Dover")
defloc("South", 1, "city", "Canterbury")
defloc("South", 1, "town", "Hastings")

defloc("England", 1, "town", "Dorchester")
defloc("England", 1, "city", "Exeter")
defloc("England", 1, "town", "Plymouth")
defloc("England", 1, "city", "Launceston")
defloc("England", 1, "town", "Truro")
defloc("England", 1, "city", "Wells")
defloc("England", 1, "city", "Bristol")
defloc("England", 1, "city", "Gloucester")
defloc("England", 1, "city", "Oxford")
defloc("England", 1, "town", "Newbury")
defloc("England", 1, "london", "London")
defloc("England", 1, "town", "St Albans")
defloc("England", 1, "town", "Bedford")
defloc("England", 1, "town", "Cambridge")
defloc("England", 1, "town", "Bury St Edmunds")
defloc("England", 1, "town", "Ipswich")
defloc("England", 1, "city", "Norwich")
defloc("England", 1, "fortress", "Lynn")
defloc("England", 1, "city", "Ely")
defloc("England", 1, "city", "Peterborough")
defloc("England", 1, "town", "Northampton")
defloc("England", 1, "city", "Coventry")
defloc("England", 1, "town", "Leicester")
defloc("England", 1, "city", "Lichfield")
defloc("England", 1, "town", "Derby")
defloc("England", 1, "town", "Nottingham")
defloc("England", 1, "city", "Worcester")
defloc("England", 1, "city", "Chester")
defloc("England", 1, "town", "Lancaster")
defloc("England", 1, "city", "Lincoln")
defloc("England", 1, "city", "York")
defloc("England", 1, "calais", "Calais")
defloc("England", 1, "exile", "France")
defloc("England", 1, "exile", "Scotland")
defloc("England", 1, "exile", "Ireland")
defloc("England", 1, "exile", "Burgundy")
defloc("North", 1, "town", "Scarborough")
defloc("England", 1, "fortress", "Ravenspur")
defloc("England", 1, "sea", "English Channel")
defloc("England", 1, "sea", "Irish Sea")
defloc("England", 1, "sea", "North Sea")


highway("Bamburgh, Newcastle")
highway("Newcastle, York")
highway("York, Lincoln")
highway("Lincoln, Peterborough")
highway("Peterborough, Ely")
highway("Nottingham, Leicester")
highway("Leicester, Northampton")
highway("Bedford, St Albans")
highway("St Albans, Cambridge")
highway("St Albans, London")
highway("London, Oxford")
highway("Oxford, Gloucester")
highway("Gloucester, Hereford")
highway("Gloucester, Worcester")
highway("Hereford, Ludlow")
highway("Gloucester, Bristol")
highway("London, Guildford")
highway("Guildford, Winchester")
highway("Winchester, Salisbury")
highway("Salisbury, Wells")
highway("Cambridge, Ely")

road("Hexham, Carlisle")
road("Hexham, Newcastle")
road("Appleby, Carlisle")
road("Appleby, Newcastle")
road("Lincoln, Nottingham")
road("Nottingham, Derby")
road("Chester, Shrewsbury")
road("Shrewsbury, Lichfield")
road("Lichfield, Leicester")
road("Lichfield, Coventry")
road("Leicester, Peterborough")
road("Ely, Lynn")
road("Ely, Bury St Edmunds")
road("Bury St Edmunds, Norwich")
road("Norwich, Lynn")
road("Norwich, Ipswich")
road("Ipswich, Bury St Edmunds")
road("Ipswich, St Albans")
road("Bury St Edmunds, Cambridge")
road("Cambridge, Bedford")
road("Peterborough, Northampton")
road("Northampton, Coventry")
road("Northampton, Oxford")
road("Lichfield, Worcester")
road("Shrewsbury, Ludlow")
road("Ludlow, Worcester")
road("London, Rochester")
road("Rochester, Canterbury")
road("Canterbury, Dover")
road("Dover, Hastings")
road("Hastings, Arundel")
road("Arundel, Southampton")
road("Southampton, Winchester")
road("Southampton, Salisbury")
road("Salisbury, Newbury")
road("Salisbury, Dorchester")
road("Dorchester, Wells")
road("Dorchester, Exeter")
road("Wells, Bristol")
road("Exeter, Launceston")
road("Exeter, Plymouth")
road("Plymouth, Truro")
road("Truro, Launceston")
road("Derby, Lichfield")
path("Appleby, Lancaster")
path("Lancaster, Chester")
path("Chester, York")
path("Chester, Harlech")
path("Harlech, Pembroke")
path("Pembroke, Cardiff")

road("Newcastle, Scarborough")
road("Scarborough, York")
road("York, Ravenspur")
road("Ravenspur, Lincoln")

let seaports = [
	"Bamburgh", "Newcastle", "Scarborough", "Ravenspur", "Lynn", "Ipswich", "North Sea", "Burgundy", "Dover", "Hastings", "Calais", "France", "Arundel", "Southampton","Dorchester","Exeter","Plymouth","Truro","Bristol","Pembroke","Harlech", "Ireland", "Irish Sea"
].map(name => locmap[name]).sort(cmpnum)

function dumplist(name, list) {
	print(name + ":[")
	for (let item of list)
		print(JSON.stringify(item) + ",")
	print("],")
}

locales.forEach(loc => {
	loc.adjacent = []
	loc.adjacent_by_highway = []
	loc.adjacent_by_road = []
	loc.adjacent_by_path = []
	loc.highways = []
	loc.roads = []
	loc.paths = []
	for (let data of loc.ways) {
		let to = data[0]
		for (let i = 1; i < data.length; ++i) {
			let way = data[i]
			if (!loc.adjacent.includes(to))
				loc.adjacent.push(to)
			if (ways[way].type === "highway") {
				if (!loc.adjacent_by_highway.includes(to)) {
					loc.adjacent_by_highway.push(to)
					loc.highways.push([to,way])
				}
			}
			if (ways[way].type === "road") {
				if (!loc.adjacent_by_road.includes(to)) {
					loc.adjacent_by_road.push(to)
					loc.roads.push([to,way])
				}
			}
			if (ways[way].type === "path") {
				if (!loc.adjacent_by_path.includes(to)) {
					loc.adjacent_by_path.push(to)
					loc.paths.push([to,way])
				}
			}
		}
	}
	loc.adjacent.sort(cmpnum)
	loc.adjacent_by_highway.sort(cmpnum)
	loc.adjacent_by_road.sort(cmpnum)
	loc.adjacent_by_path.sort(cmpnum)
	loc.highways.sort(cmpnum2)
	loc.roads.sort(cmpnum2)
	loc.paths.sort(cmpnum2)
})

function seats(list) {
	return list.split(", ").map(name => locmap[name]).sort(cmpnum)
}

let lords = [

	{
		side: "York",
		name: "York",
		full_name: "Richard Plantagenet",
		title: "Duke of York",
		seats: seats("Ely"),
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
		name:"March",
		full_name:"Edward Plantagenet",
		title:"Earl of March",
		seats:seats("Ludlow"),
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
		full_name: "Edward Plantagenet",
		title: "King of England",
		seats: seats("London"),
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
		full_name: "Richard Neville",
		title: "Earl of Salisbury",
		seats: seats("York"),
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
		full_name: "Edmund Plantagenet",
		title: "Earl of Rutland",
		seats: seats("Canterbury"),
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
		full_name: "William Herbert",
		title: "Earl of Pembroke",
		seats: seats("Pembroke"),
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
		full_name: "Humpfrey Stafford",
		title: "Earl of Devon",
		seats: seats("Exeter"),
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
		full_name: "Henry Percy",
		title: "Northumberland",
		seats: seats("Carlisle"),
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
		full_name: "Henry Percy",
		title: "Northumberland",
		seats: seats("Carlisle"),
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
		full_name: "Richard Plantagenet",
		title: "Duke of Gloucester",
		seats: seats("Gloucester"),
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
		full_name: "Richard Plantagenet",
		title: "Duke of Gloucester",
		seats: seats("Gloucester"),
		marshal:1,
		influence:2,
		lordship:2,
		command:3,
		valour:2,
		forces:{
			retinue:1,
			men_at_arms:3,
			longbowmen:2,
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
		full_name: "Richard Plantagenet",
		title: "King of England",
		seats: seats("London"),
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
		full_name: "John Howard",
		title: "Duke of Norfolk",
		seats: seats("Arundel"),
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
		full_name: "Richard Neville",
		title: "Earl of Warwick",
		seats: seats("Calais"),
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
		full_name: "Henry VI",
		title: "King of England",
		seats: seats("London"),
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
		full_name: "Margaret d'Anjou",
		title: "Queen of England",
		seats: seats("London"),
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
		full_name: "Henry Beaufort",
		title: "Duke of Somerset",
		seats: seats("Wells"),
		marshal:2,
		influence:6,
		lordship:2,
		command:2,
		valour:3,
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
		full_name: "Edmund Beaufort",
		title: "Duke of Somerset",
		seats: seats("Wells"),
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
		full_name: "Henry Holland",
		title: "Duke of Exeter",
		seats: seats("Exeter"),
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
		full_name: "Henry Holland",
		title: "Duke of Exeter",
		seats: seats("Exeter"),
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
		full_name: "Humphrey Stafford",
		title: "Duke of Buckingham",
		seats: seats("Coventry"),
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
		full_name: "Henry Percy",
		title: "Earl of Northumberland",
		seats: seats("Carlisle"),
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
		full_name: "George Plantagenet",
		title: "Duke of Clarence",
		seats: seats("York"),
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
		full_name: "Jasper Tudor",
		title: "Earl of Pembroke",
		seats: seats("Harlech"),
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
		full_name: "Jasper Tudor",
		title: "Earl of Pembroke",
		seats: seats("Pembroke"),
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
		full_name: "Henry Tudor",
		title: "",
		seats: seats("London"),
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
		full_name: "John de Vere",
		title: "Earl of Oxford",
		seats: seats("Oxford"),
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
		full_name: "Richard Neville",
		title: "Earl of Warwick",
		seats: seats("Calais"),
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
	let c = { name, event, when, capability: null, this_lord: false, lords: null }
	cards.push(c)
	AOW[name] = c
}

function arts_of_war_capability(name, capability, this_lord, lord_names) {
	AOW[name].capability = capability
	AOW[name].this_lord = this_lord
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

arts_of_war_event("Y1", "Leeward Battle Line", "hold")
arts_of_war_event("Y2", "Flank Attack", "hold")
arts_of_war_event("Y3", "Escape Ship", "hold")
arts_of_war_event("Y4", "Jack Cade", "this_levy")
arts_of_war_event("Y5", "Suspicion", "hold")
arts_of_war_event("Y6", "Seamanship", "this_campaign")
arts_of_war_event("Y7", "Yorkists Block Parliament", "this_levy")
arts_of_war_event("Y8", "Exile Pact", "this_levy")
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

arts_of_war_capability("Y1", "Culverins and falconets", true, "any")
arts_of_war_capability("Y2", "Culverins and falconets", true, "any")
arts_of_war_capability("Y3", "Muster'd my solders", true, "any")
arts_of_war_capability("Y4", "We done deeds of charity", true, "any")
arts_of_war_capability("Y5", "Thomas Bourchier", true, "any")
arts_of_war_capability("Y6", "Great Ships", true, "any")
arts_of_war_capability("Y7", "Harbingers", true, "any")
arts_of_war_capability("Y8", "England is my home", true, "any")
arts_of_war_capability("Y9", "Barricades", true, "any")
arts_of_war_capability("Y10", "Agitators", true, "any")
arts_of_war_capability("Y11", "Yorkists Never Wait", true, "any")
arts_of_war_capability("Y12", "Soldiers of fortune", true, "any")
arts_of_war_capability("Y13", "Scourers", true, "any",)
arts_of_war_capability("Y14", "Burgundians", true, ["York", "March"])
arts_of_war_capability("Y15", "Naval Blockade", true, ["Warwick Y"])
arts_of_war_capability("Y16", "Beloved Warwick", true,  ["Warwick Y"])
arts_of_war_capability("Y17", "Alice Montagu", true,  ["Salisbury"])
arts_of_war_capability("Y18", "Irishmen", true, ["York", "Rutland"])
arts_of_war_capability("Y19", "Welshmen", true,  ["York", "March"])
arts_of_war_capability("Y20", "York's favoured Son", true, ["March","Rutland"])
arts_of_war_capability("Y21", "Southerners", true, ["York", "March", "Rutland"])
arts_of_war_capability("Y22", "fair Arbiter", true, ["Salisbury"])
arts_of_war_capability("Y23", "Burgundians", true, ["Edward IV", "Gloucester 1", "Gloucester 2", "Richard III"])
arts_of_war_capability("Y24", "Hastings", true, ["Edward IV"])
arts_of_war_capability("Y25", "Pembroke", true, ["Pembroke"])
arts_of_war_capability("Y26", "Fallen Brother", true, ["Gloucester 1", "Gloucester 2", "Richard III"])
arts_of_war_capability("Y27", "Percy's North", true, ["Northumberland Y1","Northumberland Y2"])
arts_of_war_capability("Y28", "First Son", true, ["Edward IV"])
arts_of_war_capability("Y29", "Stafford Branch", true, ["Devon"])
arts_of_war_capability("Y30", "Captain", true, ["Devon", "Pembroke"])
arts_of_war_capability("Y31", "Woodvilles", true, ["Edward IV", "Devon", "Gloucester 1", "Gloucester 2", "Richard III"])
arts_of_war_capability("Y32", "Final Charge", true, ["Richard III"])
arts_of_war_capability("Y33", "Bloody thou art, bloody will be thy end", true, ["Richard III"])
arts_of_war_capability("Y34", "So wise, so young", true, ["Gloucester 1", "Gloucester 2"] )
arts_of_war_capability("Y35", "Kingdom United", true, ["Gloucester 1", "Gloucester 2"] )
arts_of_war_capability("Y36", "Vanguard", true, ["Norfolk"])
arts_of_war_capability("Y37", "Percy's North", true, ["Northumberland Y1", "Northumberland Y2"])


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

arts_of_war_capability("L1", "Culverins and falconets", true, "any")
arts_of_war_capability("L2", "Culverins and falconets", true, "any")
arts_of_war_capability("L3", "Muster’d my soldiers", true, "any")
arts_of_war_capability("L4", "Heralds", true, "any")
arts_of_war_capability("L5", "Church Blessing", true, "any")
arts_of_war_capability("L6", "Great Ships", true, "any")
arts_of_war_capability("L7", "Harbingers", true, "any")
arts_of_war_capability("L8", "Hay Wains", true, "any")
arts_of_war_capability("L9", "Quartermasters", true, "any")
arts_of_war_capability("L10", "Chamberlains", true, "any")
arts_of_war_capability("L11", "In the Name of the King", true, "any")
arts_of_war_capability("L12", "Commission of Array", true, "any")
arts_of_war_capability("L13", "Expert Counsellors", true, "any",)
arts_of_war_capability("L14", "Percy’s Power", true, ["Northumberland L"])
arts_of_war_capability("L15", "King’s Parley", true, ["Henry VI"])
arts_of_war_capability("L16", "Northmen", true,  ["Northumberland L"])
arts_of_war_capability("L17", "Margaret", true,  ["Henry VI"])
arts_of_war_capability("L18", "Council Member", true, ["Exeter 1", "Exeter 2", "Somerset 1", "Somerset 2", "Buckingham"])
arts_of_war_capability("L19", "Andrew Trollope", true,  ["Exeter 1", "Exeter 2", "Somerset 1", "Somerset 2", "Buckingham"])
arts_of_war_capability("L20", "Veteran of French Wars", true, ["Exeter 1", "Exeter 2", "Somerset 1", "Somerset 2"])
arts_of_war_capability("L21", "My Father’s Blood", true, "any")
arts_of_war_capability("L22", "Stafford Estates", true, ["Buckingham"])
arts_of_war_capability("L23", "Montagu", true, ["Warwick L"])
arts_of_war_capability("L24", "Married to a Neville", true, ["Clarence"])
arts_of_war_capability("L25", "Welsh Lord", true, ["Jasper Tudor 1", "Jasper Tudor 2"])
arts_of_war_capability("L26", "Edward", true, ["Margaret"])
arts_of_war_capability("L27", "Barded Horse", true, ["Exeter 1", "Exeter 2", "Somerset 1", "Somerset 2", "Margaret"])
arts_of_war_capability("L28", "Loyal Somerset", true, ["Somerset 1", "Somerset 2"])
arts_of_war_capability("L29", "High Admiral", true, ["Exeter 1", "Exeter 2"])
arts_of_war_capability("L30", "Merchants", true, ["Warwick L"])
arts_of_war_capability("L31", "Yeomen of the Crown", true, ["Margaret"])
arts_of_war_capability("L32", "Two Roses", true, ["Henry Tudor"])
arts_of_war_capability("L33", "Philibert de Chandée", true, ["Oxford", "Henry Tudor"])
arts_of_war_capability("L34", "Piquiers", true, ["Oxford", "Henry Tudor"])
arts_of_war_capability("L35", "Thomas Stanley", true, ["Jasper Tudor 1", "Jasper Tudor 2", "Henry Tudor"] )
arts_of_war_capability("L36", "Chevaliers", true, ["Oxford", "Jasper Tudor 1", "Jasper Tudor 2", "Henry Tudor"])
arts_of_war_capability("L37", "Madame La Grande", true, ["Oxford", "Jasper Tudor 1", "Jasper Tudor 2", "Henry Tudor"])

let vassals = []
function vassal(service, name, seat, influence, capability) {
	vassals.push({service, name, seat, influence, capability })
}

lords.forEach(lord => {
	lord.id = "lord_" + clean_name(lord.name)
})

vassal(1, "Norfolk", "Arundel", 0)
vassal(1, "Stanley", "Derby", 0)
vassal(3, "Fauconberg", "Dover", 2)
vassal(2, "Devon", "Exeter", -1)
vassal(3, "Suffolk", "Ipswich", 1)
vassal(1, "Bonville", "Launceston", 1)
vassal(1, "Dudley", "Leicester", 0)
vassal(1, "Beaumont", "Arundel", -2)
vassal(2, "Oxford", "Oxford", 0)
vassal(2, "Shrewsbury", "Shrewsbury", -1)
vassal(1, "Essex", "St Albans", 0)
vassal(3, "Westmoreland", "Appleby", 0)
vassal(3, "Worcester", "Worcester", 0)

vassal(0, "Trollope", "none", 0, "Andrew Trollope")
vassal(0, "Clifford", "none", 0, "My father's blood")
vassal(0, "Edward", "none", 0, "Edward")
vassal(0, "Thomas Stanley", "none", 0, "Thomas Stanley")
vassal(0, "Montagu", "none", 0, "Alice Montagu")
vassal(0, "Hastings", "none", 0, "Hastings") 

print("const data = {")
print("seaports:" + JSON.stringify(seaports) + ",")
print("strongholds:" + JSON.stringify(strongholds) + ",")
dumplist("locales", locales)
dumplist("ways", ways)
dumplist("lords", lords)
dumplist("vassals", vassals)
dumplist("cards", cards)
print("}")
print("if (typeof module !== 'undefined') module.exports = data")

fs.writeFileSync("data.js", data.join("\n") + "\n")
