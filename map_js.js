
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

/*
add markers from coords and binds a pop up message
*/
function aj_marker(coord, message) {
    L.marker(coord).addTo(map)
            .bindPopup(message)
            .openPopup();
}


/*
Remplissage du selecteur de codes, une fois pour toutes
*/
var code_selector = document.getElementById('codes_selector');
for (var key in codes) {
    var opt = document.createElement('option');
    opt.value = opt.text = key;
    code_selector.add( opt );
}

/*
Remplissage du sous selecteur (appélé depuis le html du selecteur parent)
*/
function fill_sub_selec (codes, code_selector) {
    var sub_selec = document.getElementById('dyn_codes_selector');
    sub_selec.textContent = "";
    for (var key in codes[code_selector.value]) {
        var opt = document.createElement('option');
        opt.value = opt.text = key;
        sub_selec.add( opt );
    }
}

//ajout des différents markers
aj_marker([47.4, 0.56], 'Merde, merde merde!');
aj_marker([47.4, 1.5], 'MERDE');
//On est obligé de mettre new ici..(geojson_ext provient d'un autre fichier js)
//new L.GeoJSON(geojson_ext).addTo(map).bindPopup("Le message").openPopup();

window.L_PREFER_CANVAS=true;  //améliore un peu les perf, mais vite fait..

/*
sort the geojson, from the filter tab
*/
function sort_geojson (geo_var, filter){
    var sorted_geoj = {
        "type": "FeatureCollection",
        "features": []};
    var features = geo_var["features"];
    for (var index in geo_var["features"]) { // ya pas de collection en js, la merde..
        if (features[index]["properties"]["activity"] == filter[0] || filter[0]==null) { //select act or inactivity, filter[0] = boolfriche
            //then go to the next criterium, else end loop
        } else {
            continue;  // ignore the rest
        }
        // basic search engine, ignore caps, multiple words
        var searched_word_s = filter[1].toUpperCase().split(" ") ;
        var bool_search = true;
        for (var index_mot in searched_word_s) { // peut pas faire le continue ici, label?
            if (features[index]["properties"]["name"].toUpperCase().includes(searched_word_s[index_mot]) || filter[1] == "") {
            } else {
                bool_search =  false;
            }
        }
        bool_search ? sorted_geoj["features"].push(features[index]) : false;
         // bah oui, append c'est trop simple..

    }
    // todo add code selector..
    return sorted_geoj
};

//geojson_ext = sort_geojson(geojson_ext, [null, ""]);
/*
Add the markers from geojson, call sort function, link their properties with the popup
*/
function map_geojson(geojson_ext) {
    // maintenant faut rafraichir..
    var select = document.getElementById('selec_prop');
//    var bool_friche = select.getElementsByClassName('selector')[0].value == "true" ? true : false; //todo null for both?
    var bool_friche = "";
    switch(select.getElementsByClassName('selector')[0].value) { // ne pas oublier le break..
        case "true": bool_friche = true; break;
        case "false": bool_friche = false; break;
        case "null": bool_friche = null; break;
    }
    var searched_word = select.getElementsByClassName('motcle')[0].value ;

    // pass the selection arguments
    geojson_ext = sort_geojson(geojson_ext, [bool_friche,
        searched_word]);

    var layer_geoj = L.geoJson(geojson_ext, { //todo petits soucis de perf.. il faut le plug leaflet.markercluster,
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
    return layer_geoj //the layer object, returned to deleted on refresh
};
var layer = map_geojson(geojson_ext); // called from html
//map.removeLayer(layer); // called in the html

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