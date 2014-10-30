// ==UserScript==
// @name       		LeekWars AdvancedTooltips
// @version			0.1.1
// @description		Affiche une info-bulle au survol d'un lien pointant vers la page d'un poireau
// @author			yLark
// @projectPage		https://github.com/yLark/LeekWars-AdvancedTooltips
// @downloadURL		https://github.com/yLark/LeekWars-AdvancedTooltips/raw/master/AdvancedTooltips.user.js
// @updateURL		https://github.com/yLark/LeekWars-AdvancedTooltips/raw/master/AdvancedTooltips.user.js
// @match      		http://leekwars.com/*
// @grant			GM_addStyle
// @require			https://code.jquery.com/jquery-2.1.1.min.js
// @require			https://raw.githubusercontent.com/websanova/mousestop/master/mousestop.min.js
// ==/UserScript==

// Ajout de la feuille de style des tooltips
GM_addStyle('\
.hover_tooltip {\
	padding: 4px;\
	box-shadow: 2px 3px 5px rgba(0, 0, 0, 0.3);\
	background-color: #EEE;\
	border: 2px solid #BBB;\
	overflow: auto;\
	position: absolute;\
	z-index: 1000;\
	font-size: 15px;\
	color: black;\
	text-align: center;\
	min-width: 300px;\
}\
.hover_basic {\
	column-count: 3;\
	-moz-column-count: 3;\
	-webkit-column-count: 3;\
}\
.hover_stats {\
	column-count: 4;\
	-moz-column-count: 4;\
	-webkit-column-count: 4;\
}\
.hover_stats, .hover_basic {\
	width: 260px;\
	white-space: nowrap;\
	margin: auto;\
	margin-top: 3px;\
	margin-bottom: 3px;\
}\
.hover_stats img, .hover_basic img {\
	width: 20px;\
	vertical-align: middle;\
	margin-right: 4px;\
	margin-bottom: 4px;\
}\
.leek-weapons {\
	display: inline-block;\
	vertical-align: top;\
}\
.leek-weapons div {\
	margin: 4px;\
	display: block;\
}\
.leek-chips {\
	display: inline-block;\
	vertical-align: top;\
	width: 190px;\
}\
.hover_tooltip .chip {\
	display: inline-block;\
	vertical-align: bottom;\
	margin: 4px;\
}\
.hover_tooltip .chip img {\
	width: 55px;\
	vertical-align: bottom;\
}\
.hover_leek {\
	float: left;\
	font-weight: bold;\
	font-size: 17px;\
}\
.hover_farmer {\
	text-align: right;\
	margin-bottom: 6px;\
}\
.hover_farmer a {\
	color:#AAA;\
}\
.hover_talent {\
	color:#555;\
}\
.life {\
	color: red;\
}\
.force {\
	color: #833100;\
}\
.agility {\
	color: #0080F7;\
}\
.tp {\
	color: #FF7F01;\
}\
.mp {\
	color: #00A900;\
}\
.frequency {\
	color: #b800b6;\
}\
.cores {\
	color: #0000a2;\
}\
.widsom {\
	color: black;\
}\
');

// Création du div qui va accueillir tous les tooltips générés par le script
var hover_tooltip = document.createElement('div');
hover_tooltip.id = 'hover_tooltip';
document.body.appendChild(hover_tooltip);

set_event_listeners();	// Appel initial, au lancement du script

function set_event_listeners() {	// Recalcul des éléments à surveiller
	
	var $element = $('a, div.leek');	// Élément à matcher : les liens et les div de class leek
	
	$element.hover(	// Au survol de l'élément
		function() {	// hover, mouse in
			var target = match_test(this);
			if(target != null) {
				var id = 'hover_tooltip_' + target.type + target.id;
				var tooltip = document.getElementById(id);
				if(tooltip != null && tooltip.style.display != 'none')	// Si le tooltip a déjà été créé et qu'il est affiché, on stop l'animation et on l'affiche. Permet d'annuler le fadeOut si on survole le lien après avoir survolé le tooltip
					$('#' + id).stop().show().css('opacity', 1);
			}
		},
		function() {	// hover, mouse out
			var target = match_test(this);
			if(target != null)
				$('#hover_tooltip_' + target.type + target.id).stop().fadeOut('fast');	// Masque le tooltip
		}
	);
	
	$element.mousestop(	// N'affiche ou créé le tooltip que quand la souris s'arrête de bouger sur l'élément. Ça permet d'éviter des appels ajax et affichages intempestifs lors d'un survol malheureux. mousestop est un event perso en @require dans le header du script
		function() {
			var target = match_test(this);
			if(target != null) {
				display_tooltip(target);
			}
		}
	);
}


function match_test(self) { // Contrôle que l'élément survolé est bien susceptible d'affiche un tooltip
	if(!/menu|tabs/i.test(self.parentNode.id) && !/menu|tabs/i.test(self.parentNode.parentNode.id)){	// Exclusion des liens contenus dans le menu et dans les tabs. Évite de spammer des tooltips
		
		// Cas d'un div de class leek
		if(!isNaN(self.id) && self.id != '' && /leek/i.test(self.className))
			return {type: 'leek', id: self.id};
		
		// Cas d'un lien href vers une page leek
		if( /^http:\/\/leekwars.com\/(leek)\/([0-9]+)$/i.test(self.href))
			return {type: RegExp.$1, id: RegExp.$2};
		
		// Cas d'un lien xlink:href vers une page leek
		if( /^(?:http:\/\/leekwars.com)?\/(leek)\/([0-9]+)$/i.test(self.getAttributeNS("http://www.w3.org/1999/xlink", "href")))
			return {type: RegExp.$1, id: RegExp.$2};
		
		// Pages à prendre en charge dans les regex par la suite : |farmer|team|fight|report|tournament
	}
}


function display_tooltip(target) {	// Créé le tooltip s'il n'a pas encore été créé. S'il a déjà été créé, l'affiche.

	var id = 'hover_tooltip_' + target.type + target.id;	// Génère l'id du tooltip
	var tooltip = document.getElementById(id);
	
	if(tooltip === null) {	// Si le tooltip contenant l'info sur le leek/farmer/team n'a pas encore été créé, on le créé
		tooltip = document.createElement('div');
		tooltip.id = id;
		tooltip.className = 'hover_tooltip';
		tooltip.innerHTML = '<img src="http://static.leekwars.com/image/loader.gif" alt="" style="display:block;margin:auto;">';
		hover_tooltip.appendChild(tooltip);
		
		var url = 'http://leekwars.com/' + target.type + '/' + target.id;
		
		// Récupère le contenu de la page cible via ajax
		$.post(url, function(data) {	// Récupère la page cible du lien
			tooltip.innerHTML = null;	// Supprime le gif de chargement
			var $data = $(data);
			
			if(target.type === 'leek')		fill_leek(tooltip, target, $data);		// Si le lien pointe vers une page de poireau, on rempli le tooltip des données poireau
			if(target.type === 'farmer')	fill_farmer(tooltip, target, $data);	// Si le lien pointe vers une page d'éleveur, on rempli le tooltip des données de l'éleveur
			if(target.type === 'team')		fill_team(tooltip, target, $data);		// Si le lien pointe vers une page de team, on rempli le tooltip des données team
			
			$('#hover_tooltip .tooltip').remove();		// Supprime les div de class .tooltip, qui sont inutiles et provoquent des erreurs d'affichage
		});
		
		// Créé un handler pour garder le tooltip affiché quand il est survolé
		$('#' + id).bind('mouseover', function() {
			$(this).stop().show().css('opacity', 1);
		});
		// Créé un handler pour masquer le tooltip quand il n'est plus survolé
		$('#' + id).bind('mouseout', function() {
			$(this).stop().fadeOut('fast');
		});
	}
	
	if(tooltip.style.display != 'block') {						// Si le tooltip vient d'être initialisé, ou s'il était masqué
		tooltip.style.display = 'block';						// On l'affiche
		var posX = mouse.x - 380/2;								// Calcul la nouvelle position en x
		tooltip.style.left = ((posX < 10)?10:posX) + 'px';		// On (re)défini sa position x (s'il dépasse de l'écran à gauche, on le recadre)
		tooltip.style.top  = (mouse.y + 17) + 'px';				// On (re)défini sa position y
	}
}

// Suivi de la position de la souris
var mouse = {x: 0, y: 0};
document.addEventListener('mousemove', function(e) { 
    mouse.x = e.pageX;
    mouse.y = e.pageY
}, false);


///////////////////////// Suivi des modifications du DOM /////////////////////////
//////////////////////////////////////////////////////////////////////////////////

var observeDOM = (function(){	// Code copied from here: http://stackoverflow.com/questions/3219758/detect-changes-in-the-dom
	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
		eventListenerSupported = window.addEventListener;
	
	return function(obj, callback){
		if( MutationObserver ){
			// define a new observer
			var obs = new MutationObserver(function(){
				callback();
			});
			// have the observer observe foo for changes in children
			obs.observe( obj, { childList:true, subtree:true });
		}
		else if( eventListenerSupported ){
			obj.addEventListener('DOMNodeInserted', callback, false);
			obj.addEventListener('DOMNodeRemoved', callback, false);
		}
	}
})();

// Observe a DOM element
observeDOM(document.body, function(){ 
	set_event_listeners();	// Si le DOM a changé, on relance l'écoute des évènements du script
});


///////////////////////// Création du contenu des tooltips /////////////////////////
////////////////////////////////////////////////////////////////////////////////////

// Créé le contenu du tooltip leek
function fill_leek(tooltip, target, $data) {
	
	// Ajout du nom du poireau
	var leek = document.createElement('div');
	var leek_name = $data.find('#leek').find('h1').text();
	leek.innerHTML = '<a title="Défier ' + leek_name + '" href="/garden/challenge=' + target.id + '">' + leek_name + '</a>';
	leek.className = 'hover_leek';
	tooltip.appendChild(leek);
	
	// Ajout de l'éleveur
	var farmer = document.createElement('div');
	farmer.innerHTML = '<a title="Éleveur" href="' + $data.find('.leek-farmer').attr('href') + '">' + $data.find('.leek-farmer').html() + '</a>';
	farmer.className = 'hover_farmer';
	tooltip.appendChild(farmer);
	
	// Ajout du conteneur de level + talent + ratio
	var hover_basic = document.createElement('div');
	hover_basic.className = 'hover_basic';
	tooltip.appendChild(hover_basic);
	
	// Ajout du level
	var level = document.createElement('div');
	level.className = 'hover_level';
	level.innerHTML = $data.find('#leek-table').find('h2').text();
	hover_basic.appendChild(level);
	
	// Ajout du talent
	var talent = document.createElement('div');
	if($data.find("#talent").text() != '') {	// Si le poireau a un talent
		talent.innerHTML += '<img class="talent-icon" src="http://static.leekwars.com/image/talent.png">';
		talent.innerHTML += $data.find("#talent").text();
		talent.title = 'Talent';
	}else{
		talent.innerHTML += '-';
	}
	talent.className = 'hover_talent';
	hover_basic.appendChild(talent);
	
	// Ajout du ratio
	var ratio = document.createElement('div');
	ratio.innerHTML = $data.find("#tt_fights").text();
	ratio.className = 'ratio';
	hover_basic.appendChild(ratio);
	
	// Ajout des statistiques du poireau
	var stats = document.createElement('div');
	stats.className = 'hover_stats';
	stats.innerHTML += '<div>' + $data.find('#lifespan').html() + '</div>';
	stats.innerHTML += '<div>' + $data.find('#frequencyspan').html() + '</div>';
	stats.innerHTML += '<div>' + $data.find('#forcespan').html() + '</div>';
	stats.innerHTML += '<div>' + $data.find('#tpspan').html() + '</div>';
	stats.innerHTML += '<div>' + $data.find('#agilityspan').html() + '</div>';
	stats.innerHTML += '<div>' + $data.find('#mpspan').html() + '</div>';
	stats.innerHTML += '<div>' + $data.find('#widsomspan').html() + '</div>';
	stats.innerHTML += '<div>' + $data.find('#coresspan').html() + '</div>';
	stats.innerHTML = stats.innerHTML.replace(/id=/g, 'class=');
	tooltip.appendChild(stats);
	
	// Ajout des armes
	var weapons = document.createElement('div');
	weapons.innerHTML = $data.find("#leek-weapons").html().replace(/id=/g, 'old_id=');
	weapons.className = 'leek-weapons';
	tooltip.appendChild(weapons);
	
	// Ajout des puces
	var chips = document.createElement('div');
	chips.innerHTML = $data.find("#leek-chips").html().replace(/id=/g, 'old_id=');
	chips.className = 'leek-chips';
	tooltip.appendChild(chips);
}

// Créé le tooltip farmer
function fill_farmer(tooltip, target, $data) {
	
}

// Créé le tooltip team
function fill_team(tooltip, target, $data) {
	
}
