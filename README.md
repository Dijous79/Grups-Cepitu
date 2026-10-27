# Cepitu · Grups de colònies

Eina web (mòbil i ordinador) per repartir els monitors de l'Esplai Cepitu als grups de colònies d'estiu:
PETITS (6), MITJANS (6), GRANS (7), K1 (7), K2 (7) i RUTA (6).

- Arrossega les targetes dels monitors als grups (al mòbil, mantén premut i arrossega). També es pot tocar un monitor i després el grup on va; en tocar-lo surten a baix els seus carnets i preferències.
- **Ordre als grups**: homes a l'esquerra i dones a la dreta, del més gran al més petit. Els nuvatus (nascuts el 2008) surten en rosa.
- **Carnets**: punt groc = conduir, blau = monitor, lila = director. Es poden editar (i les preferències de cada monitor) a «Monitors».
- **Restriccions**: parelles que no poden anar juntes i on pot (o no pot) anar cada monitor (un grup concret, casa o fora). Si es trenquen, es marquen en vermell.
- **Casa / fora casa**: PETITS, MITJANS i GRANS són de casa; K1, K2 i RUTA de fora. Cada grup de casa necessita 1 carnet de conduir i n’hi ha d’haver un de director en algun grup de casa; cada grup de fora necessita 3 de conduir i 3 de monitor, i K1 i K2 un de director. A RUTA hi ha d'haver algú que ja hagi fet ruta (R) i en algun grup de casa un tresorer/a (T); aquesta informació no es pinta a les targetes, només als comptadors. Els grups mostren què els falta.
- **Random**: col·loca automàticament els monitors sense grup respectant capacitats, restriccions i carnets mínims.

- **Penjats**: penja la teva distribució amb un títol perquè la vegi tothom, i mira les dels altres sense perdre la teva (després pots tornar a la teva o quedar-te-la). Es guarden a Supabase; la base de dades es crea amb `supabase.sql`.

La distribució es desa al navegador (localStorage). Web estàtica, sense dependències.
