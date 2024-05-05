for F in images/*.png
do
	BG=$(convert $F -format "#%[hex:u.p{$cx,2}]" info:)
	echo $F $BG
done
