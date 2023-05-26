"use strict"

const BOTH = "Both"
const LANCASTER = "Lancaster"
const YORK = "York"

const P1 = LANCASTER
const P2 = YORK

const HIT = [ "0", '\u2776', '\u2777', '\u2778', '\u2779', '\u277A', '\u277B' ]
const MISS = [ "0", '\u2460', '\u2461', '\u2462', '\u2463', '\u2464', '\u2465' ]

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
	"I. Plantagenets Go to War",
	"IIY. The Kingmaker",
	"IIL. Lancastrian Legitimacy Fades",
	"IIIY. New Rivals",
	"IIIL. Yorkists' Last Stand",
]
