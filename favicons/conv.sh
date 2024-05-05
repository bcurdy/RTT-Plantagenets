for F in seat_*.png
do
	B=${F/seat/favicon}
	echo $F $B
	convert -background transparent $F -rotate 315 +repage -crop 270x270+125+150 +repage -colorspace RGB -resize 128x128! -colorspace sRGB $B
done
