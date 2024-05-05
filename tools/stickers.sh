function squash {
	# stickers: 42x28
	convert HIRES/output/$1.png -colorspace RGB -resize 84x56! -colorspace sRGB images/$1.png
}

squash label_0
squash label_1
squash label_2
squash label_3
squash label_4
squash label_5
squash label_6
squash label_7
squash label_8
squash label_9
squash label_10
squash label_11
squash label_12
squash label_13
squash label_14
squash label_15
squash label_16
squash label_17
squash label_18
squash label_19
squash label_20
squash label_21
squash label_22
squash label_26
