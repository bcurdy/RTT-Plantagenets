# lancaster is red
# york is white

mkdir -p HIRES/output HIRES/sticker

function trim {
	echo trimming $3
	bash tools/trim_border.sh $1 $2 HIRES/render/$3.png HIRES/output/$4.png
}

function small {
	# large square 35x35 => 280
	convert -gravity Center -crop 280x280+0+0 HIRES/render/$1.png HIRES/output/$2.png
}

function sticker {
	# round sticker labels 42x42 => 336x336 => isometric 42x28
	echo trimming $1
	bash tools/trim_border.sh 336 336 HIRES/render/$1.png /tmp/sticker.png
	convert /tmp/sticker.png -colorspace RGB -resize 84x56! -colorspace sRGB HIRES/sticker/$1.png
}

function round {
	# round 50x50 => 400
	trim 400 400 $1 $2
}

function large {
	# large square 46x46 => 368
	trim 368 368 $1 $2
}

function large2 {
	large marker_1a_$1 ${2}
	large marker_1b_$1 ${2}_b
}

sticker label_0
sticker label_1
sticker label_2
sticker label_3
sticker label_4
sticker label_5
sticker label_6
sticker label_7
sticker label_8
sticker label_9
sticker label_10
sticker label_11
sticker label_12
sticker label_13
sticker label_14
sticker label_15
sticker label_16
sticker label_17
sticker label_18
sticker label_19
sticker label_20
sticker label_21
sticker label_22
sticker label_26

round marker_1a_129 end
round marker_1a_130 levy
round marker_1b_130 campaign

round marker_1a_128 exile_lancaster
round marker_1a_132 exile_york

large2 0 vassal_norfolk
large2 2 vassal_stanley
large2 4 vassal_fauconberg
large2 12 vassal_devon
large2 14 vassal_suffolk
large2 16 vassal_bonville
large2 24 vassal_dudley
large2 26 vassal_beaumont
large2 28 vassal_oxford
large2 36 vassal_shrewsbury
large2 38 vassal_essex
large2 40 vassal_westmorld
large2 47 vassal_worcester

large2 6 vassal_hastings
large2 49 vassal_trollope
large2 50 vassal_clifford
large2 51 vassal_edward
large2 52 vassal_thomas_stanley

large2 7 seat_lancaster_henry_vi
large2 8 seat_lancaster_somerset
large2 9 seat_lancaster_exeter
large2 10 seat_lancaster_buckingham
large2 11 seat_lancaster_northumberland
large2 18 seat_lancaster_henry_tudor
large2 19 seat_lancaster_oxford
large2 20 seat_lancaster_clarence
large2 21 seat_lancaster_jasper_tudor
large2 22 seat_lancaster_margaret
large2 23 seat_lancaster_warwick

large2 30 seat_york_warwick
large2 31 seat_york_rutland
large2 32 seat_york_edward_iv
large2 33 seat_york_salisbury
large2 34 seat_york_march
large2 35 seat_york_york
large2 42 seat_york_norfolk
large2 43 seat_york_northumberland
large2 44 seat_york_devon
large2 45 seat_york_gloucester
large2 46 seat_york_pembroke

large marker_1a_54 ip_lancaster
large marker_1b_54 ip_york

large marker_1a_55 battle
large marker_1a_56 moved_fought
large marker_1b_56 source

large marker_1a_126 cities_lancaster
large marker_1b_126 cities_york
large marker_1a_127 towns_lancaster
large marker_1b_127 towns_york
large marker_1a_134 fortresses_lancaster
large marker_1b_134 fortresses_york
large marker_1a_135 victory_check

large marker_2a_0 coin_x1
large marker_2a_12 coin_x3
large marker_2a_16 prov_x1
large marker_2a_33 prov_x3
large marker_2a_35 cart_x1
large marker_2a_51 cart_x3
large marker_2a_57 ship_x1
large marker_2a_132 retinue

large marker_2b_0 coin_x2
large marker_2b_12 coin_x4
large marker_2b_16 prov_x2
large marker_2b_50 cart_x4
large marker_2b_33 prov_x4
large marker_2b_35 cart_x2
large marker_2b_57 ship_x2
large marker_2b_132 fled

small marker_1a_90 feed_x2
small marker_1b_73 feed_x3

small marker_1a_92 rose_lancaster
small marker_1b_58 rose_york

small marker_1a_103 number_1_lancaster
small marker_1a_104 number_2_lancaster
small marker_1a_105 number_3_lancaster
small marker_1a_106 number_4_lancaster
small marker_1a_107 number_5_lancaster
small marker_1a_108 number_6_lancaster

small marker_1b_103 number_1_york
small marker_1b_104 number_2_york
small marker_1b_105 number_3_york
small marker_1b_106 number_4_york
small marker_1b_107 number_5_york
small marker_1b_108 number_6_york

small marker_2a_72 hits_lancaster
small marker_2a_89 hits_york

small marker_2a_60 depleted
small marker_2a_73 valour
small marker_2b_60 exhausted
small marker_2b_73 exile
