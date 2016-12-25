
//Alors c'est un peu chiant de faire des imports ac js, en gros il doit appeler le serveur pr télécharger les fichiers
//et généralement il faut "importer" d'autres lib depuis le html.. ca se fait ac ajax, jquery etc..
//l'astuce est donc de définir les données sous forme de javascript, importé via la page html

// todo ajouter un support google maps
// todo afficher les descriptif

//on instancie la map et on centre la vue
var map = L.map('map').setView([51.505, -0.09], 4);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		//attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors MOI MOI!!' //balec
		noWrap: true //pr eviter la map infinie, mm si on peut foutre des marquers en dehors..
		}).addTo(map);

//ajoute des markers, ac un message. ca instancie en plus
function aj_marker(coord, message) {
    L.marker(coord).addTo(map)
            .bindPopup(message)
            .openPopup();
}

//ajout des différents markers
aj_marker([47.4, 0.56], 'Merde, merde merde!');
aj_marker([47.4, 1.5], 'MERDE');
//On est obligé de mettre new ici..(geojson_ext provient d'un autre fichier js)
//new L.GeoJSON(geojson_ext).addTo(map).bindPopup("Le message").openPopup();

window.L_PREFER_CANVAS=true;  //améliore un peu les perf, mais vite fait..

/*
sort the geojson, todo have différent selectors..
*/
function sort_geojson (geo_var){
    var sorted_geoj = {
        "type": "FeatureCollection",
        "features": []};
//        alert(geo_var["features"][0]["type"]);
    var features = geo_var["features"];
    for (var index in geo_var["features"]) { // ya pas de collection en js, la merde..
//        alert(features[index]["type"]);
        if (features[index]["properties"]["activity"] == true) {
            alert(features[index]["properties"]["activity"]);
            sorted_geoj["features"].push(features[index]); // bah oui, append c'est trop simple..
        }
    }
    return sorted_geoj
};

geojson_ext = sort_geojson(geojson_ext); //rewrite with exclusions

/*
Add the markers from geojson, link their properties with the popup
*/
L.geoJson(geojson_ext, { //todo petits soucis de perf.. il faut le plug leaflet.markercluster,
    onEachFeature: function (feature, layer) { // pose pas de pb de perf
    // todo changer la couleur du marker en fonction des propriétés
//        layer.bindPopup(feature.properties.description);
        var popupcontent = [];
        for (var prop in feature.properties) { // permet d'iterer ttes les properties du geojson et de les afficher
            popupcontent.push(prop + ": " + feature.properties[prop]);
        }
        layer.bindPopup(popupcontent.join("<br />"));
    }
}).addTo(map);



var coor_click = [0,0];
//Affichage des coordonnées au clic
map.on('click', function(e) {
    //Modifie le footer, c'est cool..
    document.getElementById("footer").textContent="Lat/Long: " + e.latlng.lat + String.fromCharCode(176) + "  /  "
    + e.latlng.lng + String.fromCharCode(176) ;// + e.latlng.alt en option, mais pas dans ces données.. 176= °
    coor_click = [e.latlng.lat, e.latlng.lng]; //on remplie la var des coords du dernier click
});

/*
ok j'ai trouvé, c'est encore une question d'ordre, l'élément que je cherchais était pas créé par la page..
le bouton  windows.onload permet d'attendre que la page soit chargée. Bien relou..
*/
window.onload = function() {
    var formulu = document.getElementById('formu');
    formulu.getElementsByClassName('subutext')[0].onclick = function() {
        aj_marker(coor_click, formulu.getElementsByClassName('lat')[0].value);// bon apparemnt on peut pas acceder directement ac name..
    }
}

// todo REST plus que django (mdr xptdr..)
// todo faudrait avoir un lien ou affihcer une vue satellite gmaps