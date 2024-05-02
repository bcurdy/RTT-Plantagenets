#!/bin/bash

function single {
	convert -colorspace RGB -resize 25% -colorspace sRGB HIRES/output/$1.png images/$1.png
}

function rotate_lanc {
	convert -background '#e02027' -rotate 315 -colorspace RGB -resize 132x132 -colorspace sRGB HIRES/output/$1.png images/raw_$1.png
}

function rotate_york {
	convert -background white -rotate 315 -colorspace RGB -resize 132x132 -colorspace sRGB HIRES/output/$1.png images/raw_$1.png
}

function multi {
	BGND=$1
	SIZE=$2
	OUT=$3
	shift
	shift
	shift
	montage -background "$BGND" -mode concatenate -tile $SIZE $* HIRES/output/$OUT.png
	convert -colorspace RGB -resize 25% -colorspace sRGB HIRES/output/$OUT.png images/$OUT.png
}

single towns_lancaster
single towns_york
single cities_lancaster
single cities_york
single fortresses_lancaster
single fortresses_york
single ip_lancaster
single ip_york

single battle
single campaign
single cart_x1
single cart_x2
single cart_x3
single cart_x4
single coin_x1
single coin_x2
single coin_x3
single coin_x4
single depleted
single end
single exhausted
single exile
single exile_lancaster
single exile_york
single feed_x2
single feed_x3
single fled
single hits_lancaster
single hits_york
single levy
single moved_fought
single prov_x1
single prov_x2
single prov_x3
single prov_x4
single retinue
single rose_lancaster
single rose_york
single ship_x1
single ship_x2
single source
single valour
single victory_check

rotate_york seat_york_devon
rotate_york seat_york_edward_iv
rotate_york seat_york_gloucester
rotate_york seat_york_march
rotate_york seat_york_norfolk
rotate_york seat_york_northumberland
rotate_york seat_york_pembroke
rotate_york seat_york_rutland
rotate_york seat_york_salisbury
rotate_york seat_york_warwick
rotate_york seat_york_york

rotate_lanc seat_lancaster_buckingham
rotate_lanc seat_lancaster_clarence
rotate_lanc seat_lancaster_exeter
rotate_lanc seat_lancaster_henry_tudor
rotate_lanc seat_lancaster_henry_vi
rotate_lanc seat_lancaster_jasper_tudor
rotate_lanc seat_lancaster_margaret
rotate_lanc seat_lancaster_northumberland
rotate_lanc seat_lancaster_oxford
rotate_lanc seat_lancaster_somerset
rotate_lanc seat_lancaster_warwick

single vassal_beaumont
single vassal_bonville
single vassal_devon
single vassal_dudley
single vassal_essex
single vassal_fauconberg
single vassal_norfolk
single vassal_oxford
single vassal_shrewsbury
single vassal_stanley
single vassal_suffolk
single vassal_westmoreland
single vassal_worcester

# single vassal_beaumont_b
# single vassal_bonville_b
# single vassal_devon_b
# single vassal_dudley_b
# single vassal_essex_b
# single vassal_fauconberg_b
# single vassal_norfolk_b
# single vassal_oxford_b
# single vassal_shrewsbury_b
# single vassal_stanley_b
# single vassal_suffolk_b
# single vassal_westmoreland_b
# single vassal_worcester_b

single vassal_clifford
single vassal_edward
single vassal_hastings
single vassal_thomas_stanley
single vassal_trollope
single vassal_montagu

# single vassal_clifford_b
# single vassal_edward_b
# single vassal_hastings_b
# single vassal_thomas_stanley_b
# single vassal_trollope_b
# single vassal_montagu_b

multi "#ffffff" 6x1 numbers_york \
	HIRES/output/number_1_york.png \
	HIRES/output/number_2_york.png \
	HIRES/output/number_3_york.png \
	HIRES/output/number_4_york.png \
	HIRES/output/number_5_york.png \
	HIRES/output/number_6_york.png \

multi "#ffffff" 6x1 numbers_lancaster \
	HIRES/output/number_1_lancaster.png \
	HIRES/output/number_2_lancaster.png \
	HIRES/output/number_3_lancaster.png \
	HIRES/output/number_4_lancaster.png \
	HIRES/output/number_5_lancaster.png \
	HIRES/output/number_6_lancaster.png \

exit

multi '#ffffff' 4x seats_york \
	HIRES/output/seat_york_devon.png \
	HIRES/output/seat_york_edward_iv.png \
	HIRES/output/seat_york_gloucester.png \
	HIRES/output/seat_york_march.png \
	HIRES/output/seat_york_norfolk.png \
	HIRES/output/seat_york_northumberland.png \
	HIRES/output/seat_york_pembroke.png \
	HIRES/output/seat_york_rutland.png \
	HIRES/output/seat_york_salisbury.png \
	HIRES/output/seat_york_warwick.png \
	HIRES/output/seat_york_york.png \

multi '#ffffff' 4x seats_york_b \
	HIRES/output/seat_york_devon_b.png \
	HIRES/output/seat_york_edward_iv_b.png \
	HIRES/output/seat_york_gloucester_b.png \
	HIRES/output/seat_york_march_b.png \
	HIRES/output/seat_york_norfolk_b.png \
	HIRES/output/seat_york_northumberland_b.png \
	HIRES/output/seat_york_pembroke_b.png \
	HIRES/output/seat_york_rutland_b.png \
	HIRES/output/seat_york_salisbury_b.png \
	HIRES/output/seat_york_warwick_b.png \
	HIRES/output/seat_york_york_b.png \

multi "#e02027" 4x seats_lancaster \
	HIRES/output/seat_lancaster_buckingham.png \
	HIRES/output/seat_lancaster_clarence.png \
	HIRES/output/seat_lancaster_exeter.png \
	HIRES/output/seat_lancaster_henry_tudor.png \
	HIRES/output/seat_lancaster_henry_vi.png \
	HIRES/output/seat_lancaster_jasper_tudor.png \
	HIRES/output/seat_lancaster_margaret.png \
	HIRES/output/seat_lancaster_northumberland.png \
	HIRES/output/seat_lancaster_oxford.png \
	HIRES/output/seat_lancaster_somerset.png \
	HIRES/output/seat_lancaster_warwick.png \

multi "#e02027" 4x seats_lancaster_b \
	HIRES/output/seat_lancaster_buckingham_b.png \
	HIRES/output/seat_lancaster_clarence_b.png \
	HIRES/output/seat_lancaster_exeter_b.png \
	HIRES/output/seat_lancaster_henry_tudor_b.png \
	HIRES/output/seat_lancaster_henry_vi_b.png \
	HIRES/output/seat_lancaster_jasper_tudor_b.png \
	HIRES/output/seat_lancaster_margaret_b.png \
	HIRES/output/seat_lancaster_northumberland_b.png \
	HIRES/output/seat_lancaster_oxford_b.png \
	HIRES/output/seat_lancaster_somerset_b.png \
	HIRES/output/seat_lancaster_warwick_b.png \

multi '#d1cfa1' 4x vassals \
	HIRES/output/vassal_beaumont.png \
	HIRES/output/vassal_bonville.png \
	HIRES/output/vassal_devon.png \
	HIRES/output/vassal_dudley.png \
	HIRES/output/vassal_essex.png \
	HIRES/output/vassal_fauconberg.png \
	HIRES/output/vassal_norfolk.png \
	HIRES/output/vassal_oxford.png \
	HIRES/output/vassal_shrewsbury.png \
	HIRES/output/vassal_stanley.png \
	HIRES/output/vassal_suffolk.png \
	HIRES/output/vassal_westmoreland.png \
	HIRES/output/vassal_worcester.png \

multi '#ddda9f' 4x vassals_b \
	HIRES/output/vassal_beaumont_b.png \
	HIRES/output/vassal_bonville_b.png \
	HIRES/output/vassal_devon_b.png \
	HIRES/output/vassal_dudley_b.png \
	HIRES/output/vassal_essex_b.png \
	HIRES/output/vassal_fauconberg_b.png \
	HIRES/output/vassal_norfolk_b.png \
	HIRES/output/vassal_oxford_b.png \
	HIRES/output/vassal_shrewsbury_b.png \
	HIRES/output/vassal_stanley_b.png \
	HIRES/output/vassal_suffolk_b.png \
	HIRES/output/vassal_westmoreland_b.png \
	HIRES/output/vassal_worcester_b.png \

multi '#d1cfa1' 1x vassals_lancaster \
	HIRES/output/vassal_clifford.png \
	HIRES/output/vassal_edward.png \
	HIRES/output/vassal_montagu.png \
	HIRES/output/vassal_thomas_stanley.png \
	HIRES/output/vassal_trollope.png \

