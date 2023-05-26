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
	large $1 ${3}_a
	large $2 ${3}_b
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

for i in $(seq 0 52)
do
	large2 marker_1a_$i marker_1b_$i marker_$i
done

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
