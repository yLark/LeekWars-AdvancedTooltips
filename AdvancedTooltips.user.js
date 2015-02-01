// ==UserScript==
// @name       		LeekWars AdvancedTooltips
// @version			0.3.5
// @description		Affiche une info-bulle au survol d'un lien pointant vers la page d'un poireau, d'un éleveur ou d'un rapport de combat
// @author			yLark
// @projectPage		https://github.com/yLark/LeekWars-AdvancedTooltips
// @downloadURL		https://github.com/yLark/LeekWars-AdvancedTooltips/raw/master/AdvancedTooltips.user.js
// @updateURL		https://github.com/yLark/LeekWars-AdvancedTooltips/raw/master/AdvancedTooltips.user.js
// @match      		http://leekwars.com/*
// @grant			GM_addStyle
// @grant			GM_getValue
// @grant			GM_setValue
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
	font-size: 15px;\
	color: black;\
	text-align: center;\
	min-width: 300px;\
}\
.AT_basic {\
	column-count: 3;\
	-moz-column-count: 3;\
	-webkit-column-count: 3;\
}\
.hover_stats {\
	column-count: 4;\
	-moz-column-count: 4;\
	-webkit-column-count: 4;\
}\
.hover_stats, .AT_basic {\
	width: 260px;\
	white-space: nowrap;\
	margin: auto;\
	margin-top: 3px;\
	margin-bottom: 3px;\
}\
.hover_stats img, .AT_basic img {\
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
.AT_tooltip_name {\
	float: left;\
	font-weight: bold;\
	font-size: 17px;\
}\
.AT_tooltip_name a {\
	cursor: pointer;\
}\
.AT_tooltip_subname {\
	text-align: right;\
	margin-bottom: 6px;\
}\
.AT_tooltip_subname a {\
	color:#AAA;\
}\
.hover_talent {\
	color:#555;\
}\
.hover_talent img{\
	width:28px;\
}\
.life {\
	color: red;\
}\
.strength {\
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
/* Fight report tooltip css*/\
.hover_tooltip .report .name {\
	text-align: left;\
}\
.hover_tooltip .duration {\
	text-align: right;\
	color: #777;\
}\
.hover_tooltip .report .hover_name {\
	text-align: left;\
}\
.report .alive {\
	margin-left: 23px;\
}\
.report .dead {\
	background-image: url("http://static.leekwars.com/image/cross.png");\
	width: 15px;\
	height: 20px;\
	display: inline-block;\
	margin-right: 8px;\
	vertical-align: bottom;\
}\
.hover_tooltip .hover_money {\
	text-align: right !important;\
}\
.hover_tooltip .report {\
	margin: 0px auto 20px;\
	background: none repeat scroll 0% 0% #F8F8F8;\
	border-collapse: collapse;\
	width:100%;\
}\
.hover_tooltip .report td {\
	border: 2px solid #ddd;\
	text-align: center;\
	padding: 2px 3px;\
}\
.report th {\
	border: 2px solid #ddd;\
	padding: 4px;\
	background: white;\
	font-weight: normal;\
	color: #777;\
}\
.report .total {\
	color: #888;\
	font-style: italic;\
}\
.hover_tooltip .report .hover_fight_talent img {\
	width: 18px;\
	vertical-align: top;\
}\
.hover_tooltip .hab {\
	width: 18px;\
	height: 18px;\
	vertical-align: bottom;\
	display: inline-block;\
	background-image: url("http://static.leekwars.com/image/hab.png");\
}\
.hover_tooltip .report .bonus {\
	background-color: #0075DF;\
	color: white;\
	font-weight: bold;\
	padding: 0 4px;\
	margin-left: 10px;\
	border-radius: 3px;\
}\
.tiny_fight_link {\
	float: left;\
	opacity: 0.2;\
	margin-left: 2px;\
	margin-right: 2px;\
}\
.tiny_fight_link img {\
	width: 16px;\
}\
.team_table {\
	white-space: nowrap;\
	display: inline-block;\
	margin-left: 2px;\
	margin-right: 2px;\
}\
.hover_leeks_table th {\
	border: 2px solid #ddd;\
	padding: 4px;\
	background: white;\
	font-weight: normal;\
	color: #777;\
}\
.hover_leeks_table td {\
	border: 2px solid #ddd;\
	text-align: center;\
	background: white;\
	padding: 2px 3px;\
}\
.hover_leeks_table img {\
	width: 20px;\
	height: 20px;\
}\
.hover_leeks_table tr.total {\
	color: #888;\
	font-style: italic;\
}\
.AT_avatar {\
	margin-right: 6px;\
	float: left;\
}\
.AT_avatar img {\
	width: 50px;\
}\
.AT_send_message img {\
	width: 20px;\
}\
');


// Initialisation des paramètres d'affichage des tooltips
var display_method = GM_getValue('advanced_tooltips_display_method', 'mousestop');				// Méthode d'affichage des tooltips
var delay_before_display = GM_getValue('advanced_tooltips_delay_before_display', 250);			// Délais d'affichage des tooltips
if(isNaN(delay_before_display) || delay_before_display < 0) delay_before_display = 250;			// Contrôle qu'on a bien un entier positif
var display_farmer_leek_table = GM_getValue('advanced_tooltips_display_farmer_leek_table', 1);	// Afficher ou non le tableau des poireaux d'un éleveur

var z_index = 1000;	// Sera incrémenté à chaque affichage de tooltip. Permet de toujours avoir le dernier tooltip au-dessus des précédents

// Création du div qui va accueillir tous les tooltips générés par le script
var hover_tooltip = document.createElement('div');
hover_tooltip.id = 'hover_tooltip';
document.body.appendChild(hover_tooltip);

set_event_listeners();	// Appel initial, au lancement du script

function set_event_listeners() {	// Recalcul des éléments à surveiller
	
	var $element = $('a, div.leek, div.farmer');	// Élément à matcher : les liens et les div de class leek ou farmer
	
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
	
	if(display_method == 'mousestop') {	// Si l'utilisateur a choisi la méthode mouse stop
	
		$element.mousestop(delay_before_display,	// Affiche ou créé le tooltip que quand la souris s'arrête de bouger sur l'élément. Ça permet d'éviter des appels ajax et affichages intempestifs lors d'un survol malheureux. mousestop est un event perso en @require dans le header du script
			function() {
				var target = match_test(this);
				if(target != null)
					display_tooltip(target);
			}
		);
	}else{		// Si l'utilisateur a choisi la méthode mouse over
		var timer;
		$element.hover(
			function () {
				var target = match_test(this);
				timer = setTimeout(function () {	// On définit le timeout avec la valeur spécifiée par l'utilisateur
					if(target != null)
						display_tooltip(target);
				}, delay_before_display);
			},
			function () {
				clearTimeout(timer);	// Si on sort de l'élément avant la fin du timeout, on annule l'affichage du tooltip
			}
		);
	}
	
/* 	$element.bind('destroyed', function() {
		$('#hover_tooltip').children().hide();
	}); */
}


function match_test(self) { // Contrôle que l'élément survolé est bien susceptible d'affiche un tooltip
	if(!/menu|tabs/i.test(self.parentNode.id) && !/menu|tabs/i.test(self.parentNode.parentNode.id)){	// Exclusion des liens contenus dans le menu et dans les tabs. Évite de spammer des tooltips
		
		// Cas d'un div de class leek|farmer
		if(!isNaN(self.id) && self.id != '' && /(leek|farmer)/i.test(self.className))
			return {type: RegExp.$1, id: self.id};
		
		// Cas d'un lien href vers une page leek|fight|report|farmer
		if( /^http:\/\/leekwars.com\/(leek|fight|report|farmer)\/([0-9]+)$/i.test(self.href)){
			var link_type = ((RegExp.$1 == 'fight')?'report':RegExp.$1);
			return {type: link_type, id: RegExp.$2};
		}
		
		// Cas d'un lien xlink:href vers une page leek|fight|report|farmer
		if( /^(?:http:\/\/leekwars.com)?\/(leek|fight|report|farmer)\/([0-9]+)$/i.test(self.getAttributeNS("http://www.w3.org/1999/xlink", "href"))){
			var link_type = ((RegExp.$1 == 'fight')?'report':RegExp.$1);
			return {type: link_type, id: RegExp.$2};
		}
		
		// Pages à prendre en charge dans les regex par la suite : |team|tournament|forum
	}
}


function display_tooltip(target) {	// Créé le tooltip s'il n'a pas encore été créé. S'il a déjà été créé, l'affiche.

	var id = 'hover_tooltip_' + target.type + target.id;	// Génère l'id du tooltip
	var tooltip = document.getElementById(id);
	var document_height = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);	// Récupère la hauteur de la page web. source : http://stackoverflow.com/questions/1145850/how-to-get-height-of-entire-document-with-javascript
	var posX = mouse.x;
	var posY = mouse.y;
	
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
			
			if(target.type === 'report')	fill_report(tooltip, target, $data);	// Si le lien pointe vers une page de rapport de combat, on rempli le tooltip des données du rapport
			if(target.type === 'leek')		fill_leek(tooltip, target, $data);		// Si le lien pointe vers une page de poireau, on rempli le tooltip des données poireau
			if(target.type === 'farmer')	fill_farmer(tooltip, target, $data);	// Si le lien pointe vers une page d'éleveur, on rempli le tooltip des données de l'éleveur
			if(target.type === 'team')		fill_team(tooltip, target, $data);		// Si le lien pointe vers une page de team, on rempli le tooltip des données team
			
			$('#hover_tooltip .tooltip').remove();						// Supprime les div de class .tooltip, qui sont inutiles et provoquent des erreurs d'affichage
			position_tooltip(tooltip, document_height, posX, posY);		// Repositionne le tooltip vu ses nouvelles dimensions
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
	
	if(tooltip.style.display != 'block') {		// Si le tooltip vient d'être initialisé, ou s'il était masqué
		tooltip.style.display = 'block';		// On l'affiche
		tooltip.style.zIndex = ++z_index;		// On affiche tooltip au-dessus des éventuels autres, et on incrémente le compteur
		position_tooltip(tooltip, document_height, posX, posY);	// On place le tooltip dans la page
	}
}


// Défini la position du tooltip en fonction de sa taille et des contraintes des bordures de la page
function position_tooltip(tooltip, document_height, posX, posY) {
	//tooltip.style.left = '0px';								// On redéfini la position x à zéro pour corriger un problème d'affichage avec les rapports de combats
	posX = posX - tooltip.offsetWidth / 2;					// Calcul la nouvelle position en x
	posY = posY + 17;										// Calcul la nouvelle position en y
	if(posX < 10) posX = 10;								// Si on dépasse à gauche
	if(posX + tooltip.offsetWidth / 2 > window.innerWidth)	// Si on dépasse à droite
		posX = window.innerWidth - tooltip.offsetWidth/2;
	if(posY + tooltip.offsetHeight > document_height)		// Si on dépasse en bas de la page
		posY += -tooltip.offsetHeight - 30;
	tooltip.style.left = posX + 'px';						// On (re)défini la position x
	tooltip.style.top  = posY + 'px';						// On (re)défini la position y
}


// Suivi de la position de la souris
var mouse = {x: 0, y: 0};
document.addEventListener('mousemove', function(e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY
}, false);


/* // Special jQuery event for element removal : http://stackoverflow.com/questions/2200494/jquery-trigger-event-when-an-element-is-removed-from-the-dom/10172676#10172676
(function($){
  $.event.special.destroyed = {
    remove: function(o) {
      if (o.handler) {
        o.handler()
      }
    }
  }
})(jQuery) */

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
	
	// Si le poireau n'existe pas ou est en erreur, on supprime le div
	if($data.find('#page h1:contains("Poireau introuvable")').length != 0){
		tooltip.parentNode.removeChild(tooltip);
		return;
	}
	
	// Ajout du nom du poireau
	var leek = document.createElement('div');
	var leek_name = $data.find('#leek').find('h1').text();
	leek.innerHTML = '<a title="Défier ' + leek_name + '" href="/garden/challenge=' + target.id + '">' + leek_name + '</a>';
	leek.className = 'AT_tooltip_name';
	tooltip.appendChild(leek);
	
	// Ajout de l'éleveur
	var farmer = document.createElement('div');
	farmer.innerHTML = '<a title="Éleveur" href="' + $data.find('.leek-farmer').attr('href') + '">' + $data.find('.leek-farmer').html() + '</a>';
	farmer.className = 'AT_tooltip_subname';
	tooltip.appendChild(farmer);
	
	// Ajout du conteneur de level + talent + ratio
	var AT_basic = document.createElement('div');
	AT_basic.className = 'AT_basic';
	tooltip.appendChild(AT_basic);
	
	// Ajout du level
	var level = document.createElement('div');
	level.className = 'hover_level';
	level.innerHTML = $data.find('#leek-table').find('h2').text();
	AT_basic.appendChild(level);
	
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
	AT_basic.appendChild(talent);
	
	// Ajout du ratio
	var ratio = document.createElement('div');
	ratio.innerHTML = $data.find("#tt_fights").text();
	ratio.className = 'ratio';
	AT_basic.appendChild(ratio);
	
	// Ajout des statistiques du poireau
	var stats = document.createElement('div');
	stats.className = 'hover_stats';
	stats.innerHTML += '<div title="Points de vie">' + $data.find('#lifespan').html() + '</div>';
	stats.innerHTML += '<div title="Fréquence">' + $data.find('#frequencyspan').html() + '</div>';
	stats.innerHTML += '<div title="Force">' + $data.find('#strengthspan').html() + '</div>';
	stats.innerHTML += '<div title="Points de tour">' + $data.find('#tpspan').html() + '</div>';
	stats.innerHTML += '<div title="Agilité">' + $data.find('#agilityspan').html() + '</div>';
	stats.innerHTML += '<div title="Points de mouvement">' + $data.find('#mpspan').html() + '</div>';
	stats.innerHTML += '<div title="Sagesse">' + $data.find('#widsomspan').html() + '</div>';
	stats.innerHTML += '<div title="Cœurs">' + $data.find('#coresspan').html() + '</div>';
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

// Créé le contenu du tooltip report
function fill_report(tooltip, target, $data) {
	
	// Si le combat n'est pas encore généré ou en erreur, on supprime le div
	if($data.find('#page h1:contains("404")').length != 0){
		tooltip.parentNode.removeChild(tooltip);
		return;
	}
	
	tooltip.innerHTML += '<a class="tiny_fight_link" href="http://leekwars.com/fight/'  + target.id + '" title="Combat"><img src="http://static.leekwars.com/image/garden.png"></a>';
	tooltip.innerHTML += '<a class="tiny_fight_link" href="http://leekwars.com/report/' + target.id + '" title="Rapport de combat"><img src="http://static.leekwars.com/image/forum.png"></a>';
	
	// S'il y a trop de poireaux, on affiche les tableaux de chaque équipe côte à côte
	if($data.find('.name').length > 10){
		$('<div class="teams_block"></div>').insertBefore( $data.find('h3').eq(0) );
		$('<div class="team_table"></div><div class="team_table"></div>').appendTo( $data.find('.teams_block') );
		$( $data.find('h3').eq(0) ).appendTo( $data.find('.team_table').eq(0) );
		$( $data.find('h3').eq(1) ).appendTo( $data.find('.team_table').eq(1) );
		
		var nb_report = $data.find('.report').length;
		for(var report_id = 0 ; report_id < nb_report; report_id++)
			$( $data.find('.report').eq(report_id) ).appendTo( $data.find('.team_table').eq( Math.round((report_id+1)/nb_report*2)-1 ) );
	}
	
	$data.find('.bar').remove();
	$data.find('#duration').addClass('duration');
	$data.find('.name').removeClass('name').addClass('hover_name');
	$data.find('.money').removeClass('money').addClass('hover_money');
	$data.find('.talent').removeClass('talent').addClass('hover_fight_talent');
	$data.find('.level').removeClass('level');
	tooltip.innerHTML += $data.find('#report-general').html().replace(/id=/g, 'old_id=');	// Nettoie les id pour ne pas avoir de conflit
}

// Créé le contenu du tooltip farmer
function fill_farmer(tooltip, target, $data) {
	
	// Ajout de l'avatar de l'éleveur
	var avatar = document.createElement('div');
	avatar.className = 'AT_avatar';
	avatar.innerHTML = '<a title="Éleveur" href="http://leekwars.com/farmer/' + target.id + '"><img src="' + $data.find('#avatar').attr('src') + '"></a>';
	tooltip.appendChild(avatar);
	
	// Ajout du nom de l'éleveur
	var farmer = document.createElement('div');
	var farmer_name = $data.find('#page h1').text();
	var connexion_state = 'state ' + $data.find('#page h1 span').attr('class');	// Est-ce que l'éleveur est connecté ?
	farmer.innerHTML = '<a title="Défier ' + farmer_name + '" id="challenge_farmer_' + target.id + '">' + farmer_name + '</a><span class="' + connexion_state + '"></span>';
	farmer.className = 'AT_tooltip_name';
	tooltip.appendChild(farmer);
	
	if(farmer_name == 'Éleveur supprimé') return;	// Si l'éleveur n'existe plus, on ne continue pas le tooltip
    
	$('#challenge_farmer_' + target.id).click(function() {	// Fonction pour défier le farmer. Source : http://static.leekwars.com/script/farmer.js
		submitForm("garden_update", [
			['challenge_farmer', target.id]
		]);
	});
	
	// Ajout de l'équipe
	var team = document.createElement('div');
	team.className = 'AT_tooltip_subname';
	team.innerHTML = '<a title="Équipe" href="' + $data.find('#team a').attr('href') + '">' + $data.find('#team').text().trim() + '</a>';
	tooltip.appendChild(team);
	
	// Ajout du conteneur de talent + ratio + nb poireaux
	var AT_basic = document.createElement('div');
	AT_basic.className = 'AT_basic';
	tooltip.appendChild(AT_basic);
	
	// Ajout d'un lien pour envoyer un message
	var send_message = document.createElement('div');
	send_message.className = 'AT_send_message';
	send_message.innerHTML = '<a title="Envoyer un message à ' + farmer_name + '" href="http://leekwars.com/messages/new/' + target.id + '"><img src="http://static.leekwars.com/image/messages.png" alt="Envoyer un message"></a>';
	AT_basic.appendChild(send_message);
	
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
	AT_basic.appendChild(talent);
	
	// Ajout du ratio
	var ratio = document.createElement('div');
	ratio.innerHTML = $data.find("#tt_fights").text();
	ratio.className = 'ratio';
	AT_basic.appendChild(ratio);
    
    /* //Ajout du nombre de poireaux
    var leeks_count = document.createElement('div') ;
    leeks_count.innerHTML = $data.find('.leek').length + ' Poireau' + (($data.find('.leek').length>1)?'x':'');
    leeks_count.className = 'ratio';
    AT_basic.appendChild(leeks_count); */
    
    //ajout du tableau au tooltip
	if(display_farmer_leek_table == 1) {	// Si l'option a été cochée dans les paramètres, on affiche
	
		tooltip.innerHTML += '<table id="leeks_table_'+target.id+'" class="hover_leeks_table"><tbody><tr><th>Poireau</th><th>Niveau</th><th>Ratio</th>\
		   <th><img src="http://static.leekwars.com/image/talent.png" alt="Talent" title="Talent"></img></th>\
		   <th><img src="http://static.leekwars.com/image/icon_life.png" alt="Points de vie" title="Points de vie"></img></th>\
		   <th><img src="http://static.leekwars.com/image/icon_strength.png" alt="Force" title="Force"></img></th>\
		   <th><img src="http://static.leekwars.com/image/icon_agility.png" alt="Agilit&eacute;" title="Agilit&eacute;"></img></th>\
		   <th><img src="http://static.leekwars.com/image/icon_widsom.png" alt="Sagesse" title="Sagesse"></img></th>\
		   <th><img src="http://static.leekwars.com/image/icon_frequency.png" alt="Fr&eacute;quence" title="Fr&eacute;quence"></img></th>\
		   <th><img src="http://static.leekwars.com/image/icon_tp.png" alt="Points de tour" title="Points de tour"></img></th>\
		   <th><img src="http://static.leekwars.com/image/icon_mp.png" alt="Points de mouvement" title="Points de mouvement"></img></th>\
		   <th><img src="http://static.leekwars.com/image/icon_cores.png" alt="C&oelig;urs" title="C&oelig;urs"></img></th>\
		</tr></tbody></table>' ;
		
		var leek_no=0, avgLevel=0, avgRatio=0, avgTalent=0 , avgLife=0, avgForce=0, avgAgility=0, avgWisdom=0, avgFreq=0, avgTP=0, avgMP=0, avgCores=0 ;
				
		// Extraction des caractéristiques des leeks
		$data.find('.leek').each(function(){
			var id = $(this).attr('id');
			var name = /(\w+)/.exec($(this).text())[1]; //
			var level = /([0-9]+)$/.exec($('span.level', $(this)).first().text())[1];
			var talent = '' + $('div.talent', $(this)).first().text();
			if(talent==''){
				talent = '-';
			}
			$('#leeks_table_' + target.id).append($('<tr id="farmer_leek_table_' + id + '"></tr>'));	// Prépare la ligne de chaque poireau. Permet de les garder toujours triés, même si les requêtes ajax arrivent dans le désordre
						
			// Récupère les données du poireau
			$.post('http://leekwars.com/leek/' + id, function(leekdata){
				var $leekdata = $(leekdata);
				var ratio = /([0-9]+\.[0-9]+)/.exec($leekdata.find("#tt_fights").text())[1];
				var life = $leekdata.find('#lifespan').text();
				var force = $leekdata.find('#strengthspan').text();
				var agility = $leekdata.find('#agilityspan').text();
				var wisdom = $leekdata.find('#widsomspan').text();
				var frequency = $leekdata.find('#frequencyspan').text();
				var tp = $leekdata.find('#tpspan').text();
				var mp = $leekdata.find('#mpspan').text();
				var cores = $leekdata.find('#coresspan').text();
				
				$('#farmer_leek_table_' + id).append($('<td><a href="/leek/'+id+'">'+name+'</td>\
					<td>'+level+'</td><td>'+ratio+'</td><td>'+talent+'</td><td>'+life+'</td>\
					<td>'+force+'</td><td>'+agility+'</td><td>'+wisdom+'</td><td>'+frequency+'</td>\
					<td>'+tp+'</td><td>'+mp+'</td><td>'+cores+'</td>'));
				
				leek_no++ ;
				avgLevel = (avgLevel*(leek_no - 1) + Math.floor(level))/leek_no ;
				avgRatio = (avgRatio*(leek_no - 1) + Math.floor(ratio*100)/100)/leek_no ;
				if(talent!='-')
						avgTalent = (avgTalent*(leek_no - 1) + Math.floor(talent))/leek_no ;
				avgLife = (avgLife*(leek_no - 1) + Math.floor(life))/leek_no ;
				avgForce = (avgForce*(leek_no - 1) + Math.floor(force))/leek_no ;
				avgAgility = (avgAgility*(leek_no - 1) + Math.floor(agility))/leek_no ;
				avgWisdom = (avgWisdom*(leek_no - 1) + Math.floor(wisdom))/leek_no ;
				avgFreq = (avgFreq*(leek_no - 1) + Math.floor(frequency))/leek_no ;
				avgTP = (avgTP*(leek_no - 1) + Math.floor(tp))/leek_no ;
				avgMP = (avgMP*(leek_no - 1) + Math.floor(mp))/leek_no ;
				avgCores = (avgCores*(leek_no - 1) + Math.floor(cores))/leek_no ;
				
				$('#leeks_table_' + target.id + ' td#avg_level').html(Math.floor(avgLevel)) ;
				$('#leeks_table_' + target.id + ' td#avg_ratio').html(Math.floor(avgRatio*100)/100) ;
				$('#leeks_table_' + target.id + ' td#avg_talent').html(Math.floor(avgTalent)) ;
				$('#leeks_table_' + target.id + ' td#avg_life').html(Math.floor(avgLife)) ;
				$('#leeks_table_' + target.id + ' td#avg_force').html(Math.floor(avgForce)) ;
				$('#leeks_table_' + target.id + ' td#avg_agility').html(Math.floor(avgAgility)) ;
				$('#leeks_table_' + target.id + ' td#avg_wisdom').html(Math.floor(avgWisdom)) ;
				$('#leeks_table_' + target.id + ' td#avg_freq').html(Math.floor(avgFreq)) ;
				$('#leeks_table_' + target.id + ' td#avg_tp').html(Math.floor(avgTP*10)/10) ;
				$('#leeks_table_' + target.id + ' td#avg_mp').html(Math.floor(avgMP*10)/10) ;
				$('#leeks_table_' + target.id + ' td#avg_cores').html(Math.floor(avgCores*10)/10) ;
				
			});
		});
		
		// Ajout d'une ligne de sommes / moyennes
		$('#leeks_table_' + target.id).append($('<tr class="total"><td>Moyennes</td><td id="avg_level">0</td><td id="avg_ratio">0</td><td id="avg_talent">0</td>\
<td id="avg_life">0</td><td id="avg_force">0</td><td id="avg_agility">0</td><td id="avg_wisdom">0</td><td id="avg_freq">0</td><td id="avg_tp">0</td><td id="avg_mp">0</td>\
<td id="avg_cores">0</td></tr>')) ;
	}
}

// Créé le contenu du tooltip team
function fill_team(tooltip, target, $data) {
	
}




// Insertion et gestion des paramètres d'affichage du tooltip
if(document.URL == 'http://leekwars.com/settings') {
	
	// Insertion du code html dans le DOM
	var tooltips_settings = document.createElement('div');
	tooltips_settings.id = 'advanced_tooltips_settings';
	tooltips_settings.innerHTML = '\
		<h2>AdvancedTooltips</h2><br>\
		<h3>Méthode d\'affichage des info-bulles</h3>\
		<form id="advanced_tooltips_display_method">\
			<input ' + ((display_method=='mouseover')?'checked ':' ') + 'type="radio" name="advanced_tooltips_display_method" id="advanced_tooltips_display_method_mouseover" value="mouseover"><label for="advanced_tooltips_display_method_mouseover">Au survol de l\'élément</label><br>\
			<input ' + ((display_method=='mousestop')?'checked ':' ') + 'type="radio" name="advanced_tooltips_display_method" id="advanced_tooltips_display_method_mousestop" value="mousestop"><label for="advanced_tooltips_display_method_mousestop">À l\'arrêt de la souris sur l\'élément</label>\
		</form>\
		<br><h3>Délais avant affichage (ms)</h3>\
		<input id="advanced_tooltips_delay_before_display" type="text" value="' + delay_before_display + '"></input>\
		<br><br><h3>Info-bulle d\'éleveur</h3>\
		<input ' + ((display_farmer_leek_table == 1)?'checked ':' ') + 'type="checkbox" name="advanced_tooltips_display_farmer_leek_table" id="advanced_tooltips_display_farmer_leek_table"><label for="advanced_tooltips_display_farmer_leek_table">Afficher le détail des poireaux de l\'éleveur</label><br>\
		<br><br><br>\
	';
	var settings_container = document.getElementById('settings-container');
	settings_container.insertBefore(tooltips_settings, settings_container.firstChild);
	
	// Listeners pour le suivi des modifications des paramètres
	$('input[name="advanced_tooltips_display_method"]').change(function(){
		display_method = $(this).val();
		GM_setValue('advanced_tooltips_display_method', display_method);
	});
	
	$('#advanced_tooltips_delay_before_display').change(function() {
		delay_before_display = parseInt( $(this).val() );
		GM_setValue('advanced_tooltips_delay_before_display', delay_before_display);
	});
	
	$('#advanced_tooltips_display_farmer_leek_table').change(function() {
		display_farmer_leek_table = $(this).is(':checked') ? 1 : 0;
		GM_setValue('advanced_tooltips_display_farmer_leek_table', display_farmer_leek_table);
	});
}
